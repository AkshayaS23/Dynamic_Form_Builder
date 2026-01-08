import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Download, Search, FileText, Clock } from "lucide-react";

import Layout from "../../components/layout/Layout";
import Loader from "../../components/common/Loader";
import api from "../../services/api";


const ViewResponses = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [formData, responsesData] = await Promise.all([
        api.getForm(id),
        api.getResponses(id)
      ]);
      setForm(formData);
      setResponses(responsesData);
    } catch (err) {
      setError(err.message);
      console.error('Error loading responses:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!responses.length || !form) return;

    const headers = ['Response ID', 'Submitted Date', ...form.fields.map(f => f.label)];
    const rows = responses.map(r => {
      const row = [r.id, new Date(r.submitted_at).toLocaleString()];
      form.fields.forEach(f => {
        const val = r.values[f.id];
        row.push(val ? (Array.isArray(val) ? val.join(', ') : val) : '');
      });
      return row;
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `${form.form_name.replace(/[^a-z0-9]/gi, '_')}_responses.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = responses.filter(r => {
    if (!search) return true;
    return Object.values(r.values).some(v =>
      String(v).toLowerCase().includes(search.toLowerCase())
    );
  });

  if (loading) {
    return <Loader message="Loading responses..." />;
  }

  if (error) {
    return (
      <Layout showSidebar={true} sidebarType="admin">
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
    <Layout showSidebar={true} sidebarType="admin">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Form Responses</h1>
          <p className="text-gray-600">{form?.form_name}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">{form?.form_name}</h2>
              <p className="text-gray-600 mt-1">{responses.length} response(s)</p>
            </div>
            <button
              onClick={exportCSV}
              disabled={!responses.length}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>

          {responses.length > 0 && (
            <div className="mb-6 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search responses..."
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg"
              />
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {responses.length === 0 ? 'No responses yet' : 'No matches found'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(r => (
                <div key={r.id} className="border rounded-lg">
                  <button
                    onClick={() => setSelected(selected === r.id ? null : r.id)}
                    className="w-full p-4 flex justify-between items-center hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Response #{r.id}</p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(r.submitted_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`transform transition-transform ${
                        selected === r.id ? 'rotate-180' : ''
                      }`}
                    >
                      ▼
                    </div>
                  </button>

                  {selected === r.id && form && (
                    <div className="px-4 pb-4 border-t">
                      <div className="mt-4 space-y-4">
                        {form.fields.map(f => (
                          <div
                            key={f.id}
                            className="grid grid-cols-3 gap-4 py-3 border-b last:border-0"
                          >
                            <div className="font-medium text-gray-700">{f.label}</div>
                            <div className="col-span-2 bg-gray-50 px-3 py-2 rounded-lg">
                              {Array.isArray(r.values[f.id])
                                ? r.values[f.id].join(', ')
                                : r.values[f.id] || '-'}
                            </div>
                          </div>
                        ))}
                      </div>
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