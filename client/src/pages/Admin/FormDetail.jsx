import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Edit, Copy, Eye, Trash2 } from "lucide-react";

import Layout from "../../components/layout/Layout";
import Loader from "../../components/common/Loader";
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

  if (loading) {
    return <Loader message="Loading form details..." />;
  }

  if (error || !form) {
    return <ErrorMessage message={error || "Form Not Found"} backPath="/forms" />;
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
              <div className="flex items-center gap-4 mt-3">
                <span className="text-sm text-gray-500">Category: {form.category}</span>
                <span className="text-sm text-blue-600 font-medium">
                  {responses.length} response(s)
                </span>
              </div>
            </div>
          </div>

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

          {/* Form Fields Preview */}
          <div>
            <h2 className="text-xl font-bold mb-4">Form Fields ({form.fields.length})</h2>
            <div className="space-y-4">
              {form.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-400 font-medium">{index + 1}.</span>
                        <p className="font-semibold">{field.label}</p>
                        {field.required && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 ml-5">Type: {field.type}</p>
                      {field.helpText && (
                        <p className="text-sm text-gray-500 ml-5 mt-1">
                          Help: {field.helpText}
                        </p>
                      )}
                      {field.options && field.options.length > 0 && (
                        <p className="text-sm text-gray-500 ml-5 mt-1">
                          Options: {field.options.join(', ')}
                        </p>
                      )}
                    </div>
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