import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DarkModeToggle from '../components/DarkModeToggle';
import { 
  LayoutDashboard, 
  FilePlus, 
  History, 
  LogOut, 
  Menu, 
  X,
  Package
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [totalLabels, setTotalLabels] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/stats');
      setTotalLabels(response.data.totalLabelsGenerated);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    setIsSidebarOpen(false); // Close sidebar on route change (mobile)
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Create Label', path: '/create', icon: FilePlus },
    { name: 'History', path: '/history', icon: History },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-150">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs no-print md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white no-print transition-transform duration-200 dark:border-slate-800 dark:bg-slate-900
        md:translate-x-0 md:static
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-2 font-mono text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            <Package className="h-5 w-5" />
            <span>LABELFORGE</span>
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-md p-1 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                  }
                `}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 no-print dark:border-slate-800 dark:bg-slate-900 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-md p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden space-y-0.5 sm:block">
              <p className="text-xs font-medium text-slate-400">LOGISTICS OPERATOR</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.name || 'Admin User'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            {/* Total Labels Counter */}
            <div className="flex flex-col items-end border-r border-slate-200 pr-4 dark:border-slate-800 md:pr-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Labels</span>
              <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">{totalLabels}</span>
            </div>

            {/* Dark Mode */}
            <DarkModeToggle />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet context={{ refetchStats: fetchStats }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
