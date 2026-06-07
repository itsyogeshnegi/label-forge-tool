import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FilePlus, History, BarChart3, Clock, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalLabelsGenerated: 0 });
  const [recentHistory, setRecentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, historyRes] = await Promise.all([
        api.get('/api/stats'),
        api.get('/api/labels/history?page=1&limit=5')
      ]);
      setStats(statsRes.data);
      setRecentHistory(historyRes.data.records || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Welcome to LabelForge. Track and generate parcel shipping labels.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Labels Generated</span>
            <BarChart3 className="h-5 w-5 text-slate-400" />
          </div>
          <p className="mt-4 text-3xl font-mono font-bold text-slate-900 dark:text-white">
            {loading ? '...' : stats.totalLabelsGenerated}
          </p>
        </div>

        <div className="border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Operator Session</span>
            <Clock className="h-5 w-5 text-slate-400" />
          </div>
          <p className="mt-4 text-sm font-semibold text-green-600 dark:text-green-400">
            Active & Secure
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Link
            to="/create"
            className="flex items-center justify-between border border-slate-200 bg-white p-6 transition-all hover:border-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-white rounded-lg group"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 rounded-lg">
                <FilePlus className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-950 dark:text-white">Create Shipping Label</p>
                <p className="text-xs text-slate-500">Generate, customize, download, or print a new label</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            to="/history"
            className="flex items-center justify-between border border-slate-200 bg-white p-6 transition-all hover:border-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-white rounded-lg group"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 rounded-lg">
                <History className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-950 dark:text-white">View History Logs</p>
                <p className="text-xs text-slate-500">Search and browse previously recorded label operations</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 rounded-lg">
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Recent Labels Generated</h2>
          <Link to="/history" className="text-xs font-semibold text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/40">
                <th className="px-6 py-3">Receiver Name</th>
                <th className="px-6 py-3">Phone Number</th>
                <th className="px-6 py-3">Generated Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-xs font-mono text-slate-400">LOADING RECENT ENTRIES...</td>
                </tr>
              ) : recentHistory.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-xs text-slate-400">No label history recorded yet.</td>
                </tr>
              ) : (
                recentHistory.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{item.receiverName}</td>
                    <td className="px-6 py-4 font-mono">{item.phoneNumber}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(item.generatedAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
