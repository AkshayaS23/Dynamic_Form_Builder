import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, BarChart3, Plus, ArrowLeft, List } from 'lucide-react';

const Sidebar = ({ type = 'admin', isOpen }) => {
  const location = useLocation();
  const isAdmin = type === 'admin';
  
  const adminItems = [
    { id: 'admin', label: 'Dashboard', icon: BarChart3, path: '/admin' },
    { id: 'create', label: 'Create Form', icon: Plus, path: '/forms/create' },
    { id: 'myforms', label: 'My Forms', icon: FileText, path: '/forms' }
  ];
  
  const userItems = [
    { id: 'user', label: 'Available Forms', icon: FileText, path: '/user' }
  ];
  
  const items = isAdmin ? adminItems : userItems;
  
  return (
    <div className={`${isOpen ? 'w-64' : 'w-0'} bg-white shadow-lg min-h-screen transition-all duration-300 overflow-hidden`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className={`w-10 h-10 bg-linear-to-br ${isAdmin ? 'from-blue-600 to-indigo-600' : 'from-green-600 to-emerald-600'} rounded-lg flex items-center justify-center mr-3`}>
              {isAdmin ? <FileText className="w-6 h-6 text-white" /> : <List className="w-6 h-6 text-white" />}
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {isAdmin ? 'Admin' : 'User'} Panel
            </h2>
          </div>
        </div>
        
        <nav className="space-y-2">
          {items.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                            (item.id === 'create' && location.pathname.includes('/forms/edit')) ||
                            (item.id === 'myforms' && location.pathname.includes('/forms/') && location.pathname !== '/forms/create');
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg font-medium ${
                  isActive
                    ? isAdmin 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'bg-green-50 text-green-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
          
          <div className="pt-4">
            <Link
              to="/"
              className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-3" />
              Back to Home
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;