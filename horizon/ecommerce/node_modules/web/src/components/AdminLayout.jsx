
import React from 'react';
import AdminNavigation from './AdminNavigation.jsx';

const AdminLayout = ({ children }) => {
  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] w-full bg-muted/20">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 border-r border-slate-800">
        <div className="p-4 md:sticky md:top-16">
          <h2 className="text-sm font-bold mb-4 text-slate-400 uppercase tracking-wider hidden md:block px-3">
            Menu Admin
          </h2>
          <AdminNavigation />
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 w-full max-w-[100vw]">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
