import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Search, ChevronLeft, ChevronRight, RefreshCw, Calendar, Phone, User, Trash2 } from 'lucide-react';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tempSearch, setTempSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/labels/history?page=${page}&limit=10&search=${search}`);
      setHistory(response.data.records || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalRecords(response.data.totalRecords || 0);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(tempSearch);
    setPage(1); // Reset to first page
  };

  const handleClearSearch = () => {
    setTempSearch('');
    setSearch('');
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this shipping label record? This will also decrement the statistics counter.')) {
      try {
        await api.delete(`/api/labels/history/${id}`);
        // If we delete the last item on the page, go back a page
        if (history.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          fetchHistory();
        }
      } catch (error) {
        console.error('Error deleting record:', error);
        alert('Failed to delete history record.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Label History</h1>
          <p className="text-sm text-slate-500 mt-1">Browse and search previously generated parcel label operations.</p>
        </div>
        <button
          onClick={fetchHistory}
          className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={tempSearch}
            onChange={(e) => setTempSearch(e.target.value)}
            className="block w-full border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 rounded-md"
            placeholder="Search by receiver name or phone..."
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          Search
        </button>
        {search && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="rounded-md border border-slate-200 px-3 py-2 text-xs font-medium hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            Clear
          </button>
        )}
      </form>

      {/* Main Table Card */}
      <div className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-normal">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/40">
                <th className="px-6 py-4"><span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Receiver Name</span></th>
                <th className="px-6 py-4"><span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone Number</span></th>
                <th className="px-6 py-4"><span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Generated Date</span></th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-xs font-mono text-slate-400">SEARCHING DATABASE ENTRIES...</td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-xs text-slate-400">
                    {search ? 'No history matching your search query.' : 'No label records found.'}
                  </td>
                </tr>
              ) : (
                history.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="px-6 py-4 font-semibold text-slate-950 dark:text-white">{record.receiverName}</td>
                    <td className="px-6 py-4 font-mono">{record.phoneNumber}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                      {new Date(record.generatedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(record._id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded dark:text-red-400 dark:hover:bg-red-950/30 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">
              Showing Page {page} of {totalPages} (Total: {totalRecords} records)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </button>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
