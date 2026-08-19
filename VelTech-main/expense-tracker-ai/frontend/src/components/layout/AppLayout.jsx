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
    <div className="app-canvas" style={{ display: 'flex', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Subtle Atmospheric Ambient Glow Lights (Theme Adaptive) */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '-15%',
          right: '-5%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--orb-top-color) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
          transition: 'background 0.4s ease',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          bottom: '-10%',
          left: '10%',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--orb-bottom-color) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
          transition: 'background 0.4s ease',
        }}
      />

      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: '100vh',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Topbar
          pageTitle={getPageTitle(location.pathname)}
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />
        <main style={{ flex: 1, padding: '32px 28px', maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
