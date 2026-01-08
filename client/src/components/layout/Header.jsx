import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center cursor-pointer">
          <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">FormBuilder Pro</h1>
        </Link>
        <div className="flex gap-3">
          <Link
            to="/admin"
            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
          >
            Admin Login
          </Link>
          <Link
            to="/user"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Access Forms
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;