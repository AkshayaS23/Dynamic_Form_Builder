import React from "react";
import { Link } from "react-router-dom";
import { FileText, Settings, List, BarChart3, Check } from "lucide-react";

import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";


const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Dynamic Form Builder
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Create, manage, and collect responses with our powerful form builder. 
              Build custom forms in minutes without any coding required.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/admin"
              className="px-8 py-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
            >
              <Settings className="w-5 h-5 mr-2" />
              Admin Dashboard
            </Link>
            <Link
              to="/user"
              className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
            >
              <List className="w-5 h-5 mr-2" />
              Fill a Form
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy to Build</h3>
              <p className="text-gray-600">Create forms with drag-and-drop simplicity. 12+ field types available.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Responses</h3>
              <p className="text-gray-600">View and analyze all form submissions in real-time with export options.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
              <p className="text-gray-600">Your data is stored securely with automatic backups and validation.</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LandingPage;