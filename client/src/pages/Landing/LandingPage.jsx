import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Settings, List, BarChart3, Check, Zap, Shield, Clock } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-blue-50 via-white to-indigo-50">
      <Header />

      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-linear-to-br from-blue-600 to-indigo-600 rounded-3xl mb-8 shadow-2xl">
              <FileText className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Build Forms That
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">
                Work For You
              </span>
            </h2>
            <p className="text-xl md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Create beautiful, responsive forms in minutes. No coding required.
              Collect responses, analyze data, and make better decisions.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link
              to="/admin"
              className="group px-10 py-5 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center justify-center"
            >
              <Settings className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform" />
              Start Building
            </Link>
            <Link
              to="/user"
              className="px-10 py-5 bg-white text-gray-900 border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center"
            >
              <List className="w-6 h-6 mr-3" />
              Fill a Form
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mb-20">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">12+</div>
              <div className="text-gray-600 font-medium">Field Types</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-gray-600 font-medium">Customizable</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">∞</div>
              <div className="text-gray-600 font-medium">Possibilities</div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Lightning Fast</h3>
              <p className="text-gray-600">Create professional forms in minutes with our intuitive drag-and-drop builder.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Real-time Analytics</h3>
              <p className="text-gray-600">Track responses in real-time with powerful analytics and export to CSV.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Secure & Reliable</h3>
              <p className="text-gray-600">Your data is stored securely with automatic validation and backups.</p>
            </div>
          </div>

          {/* Additional Features */}
          <div className="mt-20 bg-white rounded-3xl shadow-xl p-12 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-8 text-gray-900">Everything You Need</h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              {[
                'Text, email, phone & URL fields',
                'Dropdowns, radio & checkboxes',
                'Date, time & number inputs',
                'Star ratings & file uploads',
                'Multi-step forms',
                'Progress tracking',
                'Form validation',
                'CSV export'
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LandingPage;