import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  Tags,
  PieChart,
  FileSpreadsheet,
  User,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const Sidebar = ({ isCollapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Expenses', path: '/expenses', icon: ArrowDownCircle },
    { name: 'Income', path: '/income', icon: ArrowUpCircle },
    { name: 'Categories', path: '/categories', icon: Tags },
    { name: 'Budgets', path: '/budgets', icon: PieChart },
    { name: 'Reports', path: '/reports', icon: FileSpreadsheet },
  ];

  return (
    <aside
      style={{
        width: isCollapsed ? '76px' : '264px',
        backgroundColor: 'rgba(8, 13, 26, 0.88)',
        backdropFilter: 'blur(24px) saturate(190%)',
        WebkitBackdropFilter: 'blur(24px) saturate(190%)',
        borderRight: '1px solid var(--border-glass)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        zIndex: 20,
        height: '100vh',
        boxShadow: '4px 0 24px 0 rgba(0, 0, 0, 0.35)',
      }}
    >
      {/* Brand & Header */}
      <div>
        <div
          style={{
            height: '72px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            padding: isCollapsed ? '0 12px' : '0 20px',
            borderBottom: '1px solid var(--border-glass)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                minWidth: '38px',
                borderRadius: '11px',
                background: 'linear-gradient(135deg, #10B981 0%, #6366F1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              }}
            >
              <Sparkles size={20} color="#FFFFFF" />
            </div>
            {!isCollapsed && (
              <span style={{ fontSize: '1.125rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.025em', whiteSpace: 'nowrap' }}>
                Expense<span style={{ color: 'var(--emerald)' }}>Tracker</span>
              </span>
            )}
          </div>

          <button
            onClick={onToggle}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: isCollapsed ? 'none' : 'flex',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              transition: 'all 0.2s ease',
            }}
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '18px 12px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              title={isCollapsed ? item.name : ''}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: isCollapsed ? '12px 0' : '11px 16px',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                borderRadius: 'var(--radius-md)',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                background: isActive
                  ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.18) 0%, rgba(99, 102, 241, 0.04) 100%)'
                  : 'transparent',
                border: isActive
                  ? '1px solid rgba(99, 102, 241, 0.32)'
                  : '1px solid transparent',
                borderLeft: isActive
                  ? '3px solid var(--indigo)'
                  : '1px solid transparent',
                textDecoration: 'none',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isActive ? '0 4px 16px rgba(0, 0, 0, 0.25)' : 'none',
              })}
            >
              <item.icon size={20} style={{ minWidth: '20px', color: item.path === '/' ? 'inherit' : 'inherit' }} />
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Profile & Logout Bottom Card */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border-glass)' }}>
        <NavLink
          to="/profile"
          title={isCollapsed ? 'Profile' : ''}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: isCollapsed ? '10px 0' : '10px 12px',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            borderRadius: 'var(--radius-md)',
            color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
            backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-glass)',
            textDecoration: 'none',
            fontSize: '0.875rem',
            marginBottom: '8px',
            overflow: 'hidden',
            transition: 'all 0.2s ease',
          })}
        >
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                minWidth: '34px',
                borderRadius: '50%',
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8125rem',
                color: '#818CF8',
              }}
            >
              {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
            </div>
            {/* Online Status Dot */}
            <span
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--emerald)',
                border: '2px solid #080D1A',
              }}
            />
          </div>

          {!isCollapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.8125rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'My Account'}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.email}
              </div>
            </div>
          )}
        </NavLink>

        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Logout' : ''}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: isCollapsed ? '10px 0' : '10px 12px',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            borderRadius: 'var(--radius-md)',
            background: 'transparent',
            border: 'none',
            color: 'var(--rose)',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
            transition: 'background-color 0.2s ease',
          }}
        >
          <LogOut size={18} style={{ minWidth: '18px' }} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};
