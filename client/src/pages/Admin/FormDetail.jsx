import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Edit, Copy, Eye, Trash2, ExternalLink } from "lucide-react";

import Layout from "../../components/layout/Layout";
import {Loader} from "../../components/common/Loader";
import { STATUS_COLORS } from "../../utils/constants";
import api from "../../services/api";

const FormDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadForm();
  }, [id]);

  const loadForm = async () => {
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
      console.error('Error loading form:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this form? This action cannot be undone.')) {
      try {
        await api.deleteForm(id);
        alert('Form deleted successfully');
        navigate('/forms');
      } catch (error) {
        console.error('Error deleting form:', error);
        alert('Error deleting form: ' + error.message);
      }
    }
  };

  const handleDuplicate = async () => {
    try {
      await api.duplicateForm(id);
      alert('Form duplicated successfully!');
      navigate('/forms');
    } catch (error) {
      console.error('Error duplicating form:', error);
      alert('Error duplicating form: ' + error.message);
    }
  };

  const copyPublicLink = () => {
    const publicUrl = `${window.location.origin}/form/${form.slug}`;
    navigator.clipboard.writeText(publicUrl);
    alert('Public form link copied to clipboard!');
  };

  if (loading) {
    return <Loader message="Loading form details..." />;
  }

  if (error || !form) {
    return (
      <Layout showSidebar={true} sidebarType="admin">
        <div className="max-w-5xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-semibold mb-4">
              {error || "Form Not Found"}
            </p>
            <Link
              to="/forms"
              className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Back to Forms
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true} sidebarType="admin">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6 pb-6 border-b">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{form.form_name}</h1>
                <span
                  className={`text-sm px-3 py-1 rounded-full font-medium ${
                    STATUS_COLORS[form.status]
                  }`}
                >
                  {form.status}
                </span>
              </div>
              {form.description && <p className="text-gray-600">{form.description}</p>}
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <span className="text-sm text-gray-500">Category: {form.category}</span>
                <span className="text-sm text-blue-600 font-medium">
                  {responses.length} response(s)
                </span>
                {form.slug && (
                  <button
                    onClick={copyPublicLink}
                    className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Copy Public Link
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Public URL Display */}
          {form.slug && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Public Form URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={`${window.location.origin}/form/${form.slug}`}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={copyPublicLink}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                >
                  Copy
                </button>
                <a
                  href={`/form/${form.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm flex items-center gap-1"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open
                </a>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Link
              to={`/forms/edit/${id}`}
              className="px-6 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium flex items-center justify-center"
            >
              <Edit className="w-5 h-5 mr-2" />
              Edit Form
            </Link>
            <button
              onClick={handleDuplicate}
              className="px-6 py-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 font-medium flex items-center justify-center"
            >
              <Copy className="w-5 h-5 mr-2" />
              Duplicate
            </button>
            <Link
              to={`/forms/responses/${id}`}
              className="px-6 py-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 font-medium flex items-center justify-center"
            >
              <Eye className="w-5 h-5 mr-2" />
              Responses
            </Link>
            <button
              onClick={handleDelete}
              className="px-6 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium flex items-center justify-center"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Delete
            </button>
          </div>

          {/* Form Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-500 mb-1">Form ID</p>
              <p className="text-sm font-mono font-semibold">{form.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Created</p>
              <p className="text-sm font-semibold">
                {new Date(form.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Last Updated</p>
              <p className="text-sm font-semibold">
                {new Date(form.updated_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Fields</p>
              <p className="text-sm font-semibold">
                {form.sections?.reduce((sum, s) => sum + (s.fields?.length || 0), 0)}
              </p>
            </div>
          </div>

          {/* Form Fields Preview */}
          <div>
            <h2 className="text-xl font-bold mb-4">
              Form Fields (
                {form.sections?.reduce((sum, s) => sum + (s.fields?.length || 0), 0)}
              )
            </h2>

            <div className="space-y-6">
              {form.sections?.map((section, sIdx) => (
                <div key={sIdx}>
                  {section.title && (
                    <div className="flex items-center justify-between mb-2 pb-2 border-b">
                      <h3 className="font-semibold text-lg text-gray-800">
                        {section.title}
                      </h3>
                      {section.repeatable && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                            Repeatable Section
                          </span>
                          {section.maxEntries > 0 && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                              Max: {section.maxEntries}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {section.repeatable && section.addButtonText && (
                    <p className="text-xs text-gray-500 mb-3 italic">
                      Button text: "{section.addButtonText}"
                    </p>
                  )}

                  <div className="space-y-3">
                    {section.fields?.map((field, index) => (
                      <div
                        key={index}
                        className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-gray-400 font-mono text-sm">{index + 1}.</span>
                          <p className="font-semibold text-gray-900">{field.label}</p>
                          {field.required && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">
                              Required
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 ml-5 mb-1">
                          Type: <span className="font-medium">{field.type}</span>
                        </p>

                        {field.helpText && (
                          <p className="text-sm text-gray-500 ml-5 italic">
                            Help: {field.helpText}
                          </p>
                        )}

                        {field.options?.length > 0 && (
                          <div className="ml-5 mt-2">
                            <p className="text-sm text-gray-600 font-medium mb-1">Options:</p>
                            <div className="flex flex-wrap gap-2">
                              {field.options.map((opt, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                                >
                                  {opt}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {field.validation && (
                          <div className="ml-5 mt-2 text-xs text-gray-500">
                            <p>Validation: {JSON.stringify(field.validation)}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default FormDetail;