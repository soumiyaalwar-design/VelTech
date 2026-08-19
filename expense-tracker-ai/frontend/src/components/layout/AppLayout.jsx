import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AppLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/':
        return 'Dashboard Overview';
      case '/expenses':
        return 'Expense Management';
      case '/income':
        return 'Income Tracking';
      case '/categories':
        return 'Categories Configuration';
      case '/budgets':
        return 'Budget Planning & Utilization';
      case '/reports':
        return 'Financial Reports & Analysis';
      case '/profile':
        return 'User Profile & Security';
      default:
        return 'Expense Tracker';
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflowY: 'auto' }}>
        <Topbar
          pageTitle={getPageTitle(location.pathname)}
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />
        <main style={{ flex: 1, padding: '28px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
