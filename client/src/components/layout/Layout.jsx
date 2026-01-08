import React, { useState } from 'react';
import { List } from 'lucide-react';
import Sidebar from '../common/Sidebar';

const Layout = ({ children, showSidebar = true, sidebarType = 'admin' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!showSidebar) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar type={sidebarType} isOpen={sidebarOpen} />

        {/* Main Content */}
        <div className="flex-1">
          <div className="p-8">
            {/* ✅ Single Toggle Icon */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mb-6 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-all"
            >
              <List className="w-5 h-5" />
            </button>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
