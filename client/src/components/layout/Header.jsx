import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, User, Settings } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center group">
            <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform shadow-md">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                FormBuilder Pro
              </h1>
              <p className="text-xs text-gray-500">Create. Collect. Analyze.</p>
            </div>
          </Link>
          
          <div className="flex gap-3">
            <Link
              to="/admin"
              className="flex items-center px-5 py-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium transition-all border border-blue-200"
            >
              <Settings className="w-4 h-4 mr-2" />
              Admin
            </Link>
            <Link
              to="/user"
              className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all shadow-md hover:shadow-lg"
            >
              <User className="w-4 h-4 mr-2" />
              Fill Form
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;