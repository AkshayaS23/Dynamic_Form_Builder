import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, FileText } from "lucide-react";

import Layout from "../../components/layout/Layout";
import Loader from "../../components/common/Loader";
import api from "../../services/api";


const UserDashboard = () => {
  const [forms, setForms] = useState([]);
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
      const allForms = await api.getForms();
      setForms(allForms.filter(f => f.status === 'active'));
    } catch (err) {
      setError(err.message);
      console.error('Error loading forms:', err);
    } finally {
      setLoading(false);
    }
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
      <Layout showSidebar={true} sidebarType="user">
        <div className="max-w-5xl mx-auto">
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
    <Layout showSidebar={true} sidebarType="user">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Available Forms</h1>
          <p className="text-gray-600 text-lg">Select a form to fill out and submit</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search forms..."
                className="w-full pl-10 pr-4 py-3 border rounded-lg text-lg"
              />
            </div>
            
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            >
              {cats.map(c => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No forms available at the moment</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filtered.map(f => (
              <Link
                key={f.id}
                to={`/forms/fill/${f.id}`}
                className="w-full text-left p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-xl transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600">
                          {f.form_name}
                        </h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {f.category}
                        </span>
                      </div>
                    </div>
                    {f.description && (
                      <p className="text-gray-600 mt-3 ml-15">{f.description}</p>
                    )}
                  </div>
                  <div className="text-blue-600 group-hover:translate-x-2 transition-transform">
                    →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UserDashboard;