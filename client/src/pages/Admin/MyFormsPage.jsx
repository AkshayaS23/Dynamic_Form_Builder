import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, FileText, Plus } from "lucide-react";

import Layout from "../../components/layout/Layout";
import FormCard from "../../components/forms/FormCard";
import Loader from "../../components/common/Loader";
import api from "../../services/api";

const MyFormsPage = () => {
  const [forms, setForms] = useState([]);
  const [responses, setResponses] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setLoading(true);
      setError(null);
      const [formsData, responsesData] = await Promise.all([
        api.getForms(),
        api.getAllResponses()
      ]);
      setForms(formsData);
      setResponses(responsesData);
    } catch (err) {
      setError(err.message);
      console.error('Error loading forms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this form? This action cannot be undone.')) {
      try {
        await api.deleteForm(id);
        // Refresh forms list
        await loadForms();
        alert('Form deleted successfully');
      } catch (error) {
        console.error('Error deleting form:', error);
        alert('Error deleting form: ' + error.message);
      }
    }
  };

  const getResponseCount = (formId) => {
    return responses.filter(r => r.form_id === formId).length;
  };

  const filtered = forms.filter(f => {
    const matchSearch = f.form_name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'All' || f.category === filterCat;
    return matchSearch && matchCat;
  });

  const cats = ['All', ...new Set(forms.map(f => f.category))];

  if (loading) {
    return <Loader message="Loading forms..." />;
  }

  if (error) {
    return (
      <Layout showSidebar={true} sidebarType="admin">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error loading forms: {error}</p>
            <button
              onClick={loadForms}
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Forms</h1>
          <p className="text-gray-600">View and manage all your created forms</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">All Forms ({forms.length})</h2>
            <Link
              to="/forms/create"
              className="px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center font-semibold shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Form
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search forms by name..."
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg"
              />
            </div>

            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="px-4 py-2.5 border rounded-lg"
            >
              {cats.map(c => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {forms.length === 0
                  ? 'No forms created yet'
                  : 'No forms match your search'}
              </p>
              {forms.length === 0 && (
                <Link
                  to="/forms/create"
                  className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Your First Form
                </Link>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(f => (
                <FormCard
                  key={f.id}
                  form={f}
                  responseCount={getResponseCount(f.id)}
                  onDelete={handleDelete}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyFormsPage;