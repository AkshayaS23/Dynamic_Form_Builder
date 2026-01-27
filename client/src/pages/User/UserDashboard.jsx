import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, ChevronRight, Filter, Home, ArrowLeft } from 'lucide-react';
import { Loader } from '../../components/common/Loader';
import api from '../../services/api';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Forms</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={loadForms}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with navigation */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <Home className="w-5 h-5 mr-2" />
            <span className="font-medium">Home</span>
          </Link>
          <Link to="/" className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Link>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Available Forms</h1>
          <p className="text-gray-600 text-lg">Select a form to fill out and submit</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search forms by name..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                {cats.map(c => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Categories' : c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filtered.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              Showing {filtered.length} of {forms.length} form(s)
            </div>
          )}
        </div>

        {/* Forms List */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-md">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Forms Found</h3>
            <p className="text-gray-600">
              {forms.length === 0 
                ? 'No forms available at the moment' 
                : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filtered.map(f => (
              <Link
                key={f.id}
                to={`/forms/fill/${f.id}`}
                className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-xl transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <FileText className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                          {f.form_name}
                        </h3>
                        <span className="inline-block text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                          {f.category}
                        </span>
                      </div>
                    </div>
                    
                    {f.description && (
                      <p className="text-gray-600 leading-relaxed ml-[72px]">
                        {f.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="ml-4 flex items-center text-blue-600 group-hover:translate-x-2 transition-transform">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;