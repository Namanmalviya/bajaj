import React, { useState, useEffect, useCallback } from 'react';
import { Inbox, RefreshCw, Layers } from 'lucide-react';
import StatsStrip from './components/StatsStrip';
import FiltersBar from './components/FiltersBar';
import Board from './components/Board';
import CreateDrawer from './components/CreateDrawer';
import { ToastsContainer } from './components/Toasts';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    statusCounts: { open: 0, in_progress: 0, resolved: 0, closed: 0 },
    priorityCounts: { low: 0, medium: 0, high: 0, urgent: 0 },
    breachedOpenCount: 0
  });

  const [filters, setFilters] = useState({
    priority: '',
    breached: false
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast dispatch handler
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const closeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch tickets based on priority and breached filters
  const fetchTickets = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.breached) params.append('breached', 'true');

      const response = await fetch(`${API_BASE_URL}/tickets?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to retrieve tickets from server.');
      }
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      showToast(error.message || 'Could not fetch tickets.', 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [filters, showToast]);

  // Fetch aggregate status and SLA stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/stats`);
      if (!response.ok) {
        throw new Error('Failed to retrieve statistics.');
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading board statistics:', error);
    }
  }, []);

  // Combined fetch trigger
  const refreshBoard = useCallback(async (silent = false) => {
    setIsRefreshing(true);
    await Promise.all([fetchTickets(silent), fetchStats()]);
    // Small delay to ensure smooth spinning effect
    setTimeout(() => setIsRefreshing(false), 500);
  }, [fetchTickets, fetchStats]);

  // Fetch initial board and handle 60-second polling
  useEffect(() => {
    refreshBoard(false);

    const timer = setInterval(() => {
      refreshBoard(true); // silent refresh in background
    }, 60000);

    return () => clearInterval(timer);
  }, [refreshBoard]);

  // Handle status update (drag-drop or quick actions)
  const handleStatusChange = async (ticketId, newStatus, originStatus = '') => {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (!response.ok) {
        // If server rejects transition, trigger red toast. The card snaps back automatically.
        showToast(data.error || 'Transition denied by rules.', 'error');
        return;
      }

      // Success
      const statusLabel = newStatus.replace('_', ' ');
      showToast(`Moved ticket to "${statusLabel}"`, 'success');
      
      // Update locally immediately and fetch aggregate stats
      refreshBoard(true);
    } catch (error) {
      showToast(error.message || 'Error occurred during status update.', 'error');
    }
  };

  // Submit a new ticket
  const handleCreateTicket = async (formData) => {
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || 'Failed to submit support ticket.', 'error');
        return;
      }

      showToast('Support ticket logged successfully', 'success');
      setIsCreateOpen(false);
      
      // Reload tickets and stats to display the new card
      refreshBoard(true);
    } catch (error) {
      showToast(error.message || 'Network error submitting ticket.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete a ticket
  const handleDeleteTicket = async (ticketId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || 'Failed to delete ticket.', 'error');
        return;
      }

      showToast('Ticket deleted successfully', 'success');
      refreshBoard(true);
    } catch (error) {
      showToast(error.message || 'Error deleting ticket.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/50 flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="sticky top-0 bg-white border-b border-stone-200/80 px-6 py-4 flex items-center justify-between z-10 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-xs">
            <Inbox className="w-5.5 h-5.5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-slate-800 tracking-tight leading-none flex items-center gap-1.5">
              DeskFlow
            </h1>
            <p className="text-xs text-slate-400 font-sans mt-1">
              Support Ticket Triage Board
            </p>
          </div>
        </div>

        {/* Diagnostic Manual Refresh Button */}
        <button
          onClick={() => refreshBoard(false)}
          disabled={loading || isRefreshing}
          className="flex items-center justify-center p-2 rounded-lg border border-stone-200 text-slate-500 hover:text-slate-700 hover:bg-stone-50 active:scale-95 transition-all cursor-pointer shrink-0 disabled:opacity-50"
          title="Manual refresh"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col">
        {/* Statistics Aggregations strip */}
        <StatsStrip stats={stats} loading={loading} />

        {/* Multi-Filter Controls */}
        <FiltersBar
          filters={filters}
          setFilters={setFilters}
          onCreateClick={() => setIsCreateOpen(true)}
        />

        {/* Board Viewer */}
        {loading ? (
          <div className="flex-grow flex flex-col items-center justify-center min-h-[400px] border border-stone-200 bg-white rounded-2xl p-12 text-center shadow-2xs">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-semibold text-slate-500 font-sans">
                Loading support triage board...
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-grow">
            <Board
              tickets={tickets}
              onStatusChange={handleStatusChange}
              onDeleteTicket={handleDeleteTicket}
            />
          </div>
        )}
      </main>

      {/* Create Ticket Drawer Panel */}
      <CreateDrawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateTicket}
        submitting={submitting}
      />

      {/* Stack of Floating Toast Notifications */}
      <ToastsContainer toasts={toasts} onCloseToast={closeToast} />
    </div>
  );
}
