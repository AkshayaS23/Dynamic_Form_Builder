import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, Users, BarChart3, Plus, AlertCircle } from "lucide-react";

import Layout from "../../components/layout/Layout";
import StatCard from "../../components/common/StatsCard";
import { Loader } from "../../components/common/Loader";
import api from "../../services/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load forms first
      const allForms = await api.getForms();
      setForms(allForms);
      
      // Then load stats
      const statsData = await api.getStats();
      setStats(statsData);
      
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
      
      // Set default values if API fails
      setForms([]);
      setStats({
        totalForms: 0,
        totalResponses: 0,
        activeForms: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Loading dashboard..." />;
  }

  return (
    <Layout showSidebar={true} sidebarType="admin">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of your forms and responses</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-red-800 font-semibold mb-1">Error Loading Dashboard</h3>
                <p className="text-red-700 text-sm mb-3">{error}</p>
                <button
                  onClick={loadData}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Forms"
            value={stats?.totalForms ?? 0}
            icon={FileText}
            color="blue"
          />
          <StatCard
            title="Total Responses"
            value={stats?.totalResponses ?? 0}
            icon={Users}
            color="green"
          />
          <StatCard
            title="Active Forms"
            value={stats?.activeForms ?? 0}
            icon={BarChart3}
            color="purple"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              to="/forms/create"
              className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
            >
              <Plus className="w-8 h-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg mb-1">Create New Form</h3>
              <p className="text-sm text-gray-600">Build a custom form with various field types</p>
            </Link>
            
            <Link
              to="/forms"
              className="p-6 border-2 border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-left group"
            >
              <FileText className="w-8 h-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg mb-1">My Forms</h3>
              <p className="text-sm text-gray-600">
                {forms.length === 0 ? 'No forms created yet' : `View and manage ${forms.length} form(s)`}
              </p>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;