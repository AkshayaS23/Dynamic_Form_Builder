import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Download, Search, FileText, Clock, Layers, Trash2, ExternalLink, Link as LinkIcon } from "lucide-react";

import Layout from "../../components/layout/Layout";
import { Loader } from "../../components/common/Loader";
import api from "../../services/api";

const ViewResponses = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [formData, responsesData] = await Promise.all([
        api.getForm(id),
        api.getResponses(id),
      ]);
      
      console.log('Loaded form:', formData);
      console.log('Loaded responses:', responsesData);
      
      setForm(formData);
      setResponses(responsesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ===================== DELETE RESPONSE ===================== */
  const handleDelete = async (responseId) => {
    if (!window.confirm('Are you sure you want to delete this response? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(responseId);
      await api.deleteResponse(responseId);
      
      setResponses(responses.filter(r => r.id !== responseId));
      
      if (selected === responseId) {
        setSelected(null);
      }
      
      alert('Response deleted successfully');
    } catch (err) {
      console.error('Error deleting response:', err);
      alert('Error deleting response: ' + err.message);
    } finally {
      setDeleting(null);
    }
  };

  /* ===================== CSV EXPORT ===================== */
  const exportCSV = () => {
    if (!responses.length) return;

    // First, determine all headers by examining the form structure
    const headers = ["Response ID", "Submitted Date"];
    
    form.sections?.forEach(section => {
      if (section.repeatable) {
        // For repeatable sections, find the maximum number of entries across all responses
        let maxEntries = 0;
        responses.forEach(r => {
          const entries = r.values?.[section.id];
          if (Array.isArray(entries) && entries.length > maxEntries) {
            maxEntries = entries.length;
          }
        });
        
        // Add headers for each possible entry
        for (let i = 0; i < maxEntries; i++) {
          section.fields.forEach(field => {
            headers.push(`${section.title} #${i + 1} - ${field.label}`);
          });
        }
      } else {
        // Regular section fields
        section.fields.forEach(field => {
          headers.push(field.label);
        });
      }
    });

    // Now build rows
    const rows = responses.map(r => {
      const row = [r.id, new Date(r.submitted_at).toLocaleString()];

      form.sections?.forEach(section => {
        if (section.repeatable) {
          const entries = r.values?.[section.id];
          
          // Find max entries for this section across all responses
          let maxEntries = 0;
          responses.forEach(resp => {
            const respEntries = resp.values?.[section.id];
            if (Array.isArray(respEntries) && respEntries.length > maxEntries) {
              maxEntries = respEntries.length;
            }
          });
          
          // Add data for each entry (or empty strings if this response has fewer entries)
          for (let i = 0; i < maxEntries; i++) {
            section.fields.forEach(field => {
              if (Array.isArray(entries) && entries[i]) {
                const val = entries[i][field.id];
                if (field.type === "file" && val?.path) {
                  row.push(`${import.meta.env.VITE_API_URL}${val.path}`);
                } else {
                  row.push(Array.isArray(val) ? val.join(", ") : val || "");
                }
              } else {
                row.push("");
              }
            });
          }
        } else {
          // Regular section
          section.fields.forEach(field => {
            const val = r.values?.[field.id];
            if (field.type === "file" && val?.path) {
              row.push(`${import.meta.env.VITE_API_URL}${val.path}`);
            } else {
              row.push(Array.isArray(val) ? val.join(", ") : val || "");
            }
          });
        }
      });

      return row;
    });

    const csv = [
      headers.join(","),
      ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${form.form_name}_responses.csv`;
    link.click();
  };

  /* ===================== RENDER FIELD VALUE ===================== */
  const renderFieldValue = (field, val) => {
    console.log('Rendering field:', field.label, 'Type:', field.type, 'Value:', val);
    
    // Handle file uploads
    if (field.type === "file") {
      if (val?.path && val?.originalname) {
        const fileUrl = `${import.meta.env.VITE_API_URL}${val.path}`;
        console.log('File URL:', fileUrl);
        
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="font-medium">{val.originalname}</span>
            </div>
            <div className="flex gap-3">
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-700 underline text-sm flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                View File
              </a>
              <a
                href={fileUrl}
                download
                className="text-green-600 hover:text-green-700 underline text-sm flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                Download
              </a>
            </div>
          </div>
        );
      } else if (typeof val === 'string' && val) {
        return (
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-600" />
            <span>{val}</span>
          </div>
        );
      }
      return <span className="text-gray-400">No file uploaded</span>;
    }

    // Handle URL fields
    if (field.type === "url" && val) {
      return (
        <a
          href={val}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 hover:text-blue-700 underline flex items-center gap-1 break-all"
        >
          <LinkIcon className="w-4 h-4 shrink-0" />
          {val}
        </a>
      );
    }

    // Handle email fields
    if (field.type === "email" && val) {
      return (
        <a
          href={`mailto:${val}`}
          className="text-blue-600 hover:text-blue-700 underline"
        >
          {val}
        </a>
      );
    }

    // Handle phone fields
    if (field.type === "phone" && val) {
      return (
        <a
          href={`tel:${val}`}
          className="text-blue-600 hover:text-blue-700 underline"
        >
          {val}
        </a>
      );
    }

    // Handle array values (checkbox)
    if (Array.isArray(val)) {
      return val.length > 0 ? val.join(", ") : <span className="text-gray-400">None selected</span>;
    }

    // Handle rating
    if (field.type === "rating" && val) {
      return (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < val ? "text-yellow-400" : "text-gray-300"}>
              ★
            </span>
          ))}
          <span className="ml-2 text-sm text-gray-600">({val}/5)</span>
        </div>
      );
    }

    // Default: return value or dash
    return val !== undefined && val !== null && val !== '' 
      ? String(val) 
      : <span className="text-gray-400">-</span>;
  };

  /* ===================== SEARCH ===================== */
  const filtered = responses.filter(r => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    
    // Search across all field values
    return Object.values(r.values || {}).some(v => {
      // Handle string values
      if (typeof v === "string") {
        return v.toLowerCase().includes(searchLower);
      }
      
      // Handle arrays (checkbox, repeatable sections)
      if (Array.isArray(v)) {
        // Check if it's an array of objects (repeatable section)
        if (v.length > 0 && typeof v[0] === 'object') {
          return v.some(entry => 
            Object.values(entry).some(val => 
              typeof val === 'string' && val.toLowerCase().includes(searchLower)
            )
          );
        }
        // Array of strings
        return v.some(item => 
          typeof item === "string" && item.toLowerCase().includes(searchLower)
        );
      }
      
      // Handle file objects
      if (v?.originalname) {
        return v.originalname.toLowerCase().includes(searchLower);
      }
      
      return false;
    });
  });

  if (loading) return <Loader message="Loading responses..." />;

  if (error) {
    return (
      <Layout showSidebar sidebarType="admin">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error loading responses: {error}</p>
            <button
              onClick={loadData}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar sidebarType="admin">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Form Responses</h1>
          <p className="text-gray-600">{form?.form_name}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{form?.form_name}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {responses.length} response(s) • {filtered.length} shown
              </p>
            </div>
            <button
              onClick={exportCSV}
              disabled={!responses.length}
              className="flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md transition-all"
            >
              <Download className="w-5 h-5 mr-2" />
              Export CSV
            </button>
          </div>

          {/* Search */}
          {responses.length > 0 && (
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search responses..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Responses List */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {responses.length === 0 ? 'No responses yet' : 'No matches found'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(r => (
                <div key={r.id} className="border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-all">
                  {/* Response Header */}
                  <div className="flex items-center justify-between p-4 bg-gray-50">
                    <button
                      onClick={() => setSelected(selected === r.id ? null : r.id)}
                      className="flex-1 flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Response #{r.id}</p>
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(r.submitted_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span className="text-gray-400 text-xl">
                        {selected === r.id ? "▲" : "▼"}
                      </span>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(r.id);
                      }}
                      disabled={deleting === r.id}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete response"
                    >
                      {deleting === r.id ? (
                        <span className="animate-spin">⏳</span>
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Response Details */}
                  {selected === r.id && form?.sections && (
                    <div className="p-6 border-t space-y-6 bg-white">
                      {form.sections.map(section => {
                        if (!section.fields || section.fields.length === 0) {
                          return null;
                        }

                        // Handle Repeatable Sections
                        if (section.repeatable) {
                          const entries = r.values?.[section.id];
                          
                          console.log(`Section ${section.id} (${section.title}) - Entries:`, entries);
                          
                          if (!Array.isArray(entries) || entries.length === 0) {
                            return (
                              <div key={section.id} className="space-y-4">
                                {section.title && (
                                  <h3 className="font-bold text-lg text-gray-900 flex items-center pb-2 border-b">
                                    <Layers className="w-5 h-5 mr-2 text-blue-600" />
                                    {section.title}
                                  </h3>
                                )}
                                <p className="text-sm text-gray-500 italic">No entries submitted</p>
                              </div>
                            );
                          }

                          return (
                            <div key={section.id} className="space-y-4">
                              {section.title && (
                                <h3 className="font-bold text-lg text-gray-900 flex items-center pb-2 border-b">
                                  <Layers className="w-5 h-5 mr-2 text-blue-600" />
                                  {section.title}
                                  <span className="ml-2 text-sm font-normal text-gray-600">
                                    ({entries.length} {entries.length === 1 ? 'entry' : 'entries'})
                                  </span>
                                </h3>
                              )}

                              {entries.map((entry, entryIdx) => (
                                <div key={entryIdx} className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50/30">
                                  <h4 className="font-semibold text-gray-800 mb-3">
                                    Entry {entryIdx + 1}
                                  </h4>
                                  <div className="space-y-3">
                                    {section.fields.map(field => {
                                      const val = entry[field.id];

                                      return (
                                        <div
                                          key={field.id}
                                          className="grid grid-cols-3 gap-4 py-2"
                                        >
                                          <div className="font-medium text-gray-700 text-sm">
                                            {field.label}
                                            {field.required && (
                                              <span className="text-red-500 ml-1">*</span>
                                            )}
                                          </div>

                                          <div className="col-span-2 bg-white p-2 rounded text-sm">
                                            {renderFieldValue(field, val)}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        }

                        // Handle Regular Sections
                        return (
                          <div key={section.id || section.title} className="space-y-4">
                            {section.title && (
                              <h3 className="font-bold text-lg text-gray-900 flex items-center pb-2 border-b">
                                <Layers className="w-5 h-5 mr-2 text-blue-600" />
                                {section.title}
                              </h3>
                            )}

                            <div className="space-y-3">
                              {section.fields.map(field => {
                                const val = r.values?.[field.id];

                                return (
                                  <div
                                    key={field.id}
                                    className="grid grid-cols-3 gap-4 py-3 border-b last:border-b-0"
                                  >
                                    <div className="font-medium text-gray-700">
                                      {field.label}
                                      {field.required && (
                                        <span className="text-red-500 ml-1">*</span>
                                      )}
                                    </div>

                                    <div className="col-span-2 bg-gray-50 p-3 rounded-lg">
                                      {renderFieldValue(field, val)}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ViewResponses;