import React from 'react';
import { Clock, AlertTriangle, ArrowLeft, ArrowRight, User, Trash2 } from 'lucide-react';

// Format dynamic read-time age in minutes to humanoid string
function formatAge(minutes) {
  if (minutes < 1) return '< 1m';
  if (minutes < 60) return `${minutes}m`;
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours < 24) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours > 0 ? `${days}d ${remHours}h` : `${days}d`;
}

export default function TicketCard({ ticket, onStatusChange, onDeleteTicket }) {
  const { _id, subject, description, customerEmail, priority, status, ageMinutes, slaBreached } = ticket;

  // Custom desaturated humanoid priority tag styles
  const priorityStyles = {
    urgent: {
      badge: 'bg-rose-50 border-rose-200/70 text-rose-700 font-sans',
      dot: 'bg-rose-500'
    },
    high: {
      badge: 'bg-amber-50 border-amber-200/70 text-amber-700 font-sans',
      dot: 'bg-amber-500'
    },
    medium: {
      badge: 'bg-sky-50 border-sky-200/70 text-sky-700 font-sans',
      dot: 'bg-sky-500'
    },
    low: {
      badge: 'bg-slate-100 border-slate-200 text-slate-700 font-sans',
      dot: 'bg-slate-400'
    }
  };

  const currentPriority = priorityStyles[priority] || priorityStyles.low;

  // Native HTML5 Drag Start hook
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', _id);
    e.dataTransfer.setData('originStatus', status);
    // Add small visual delay so the drag image mirrors the card perfectly before lowering opacity
    setTimeout(() => {
      e.target.style.opacity = '0.4';
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
  };

  // Render valid adjacent actions based on status
  const renderControls = () => {
    switch (status) {
      case 'open':
        return (
          <button
            onClick={() => onStatusChange(_id, 'in_progress')}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-100 bg-sky-50/40 hover:bg-sky-50 text-xs font-sans font-semibold text-sky-700 hover:text-sky-800 transition-colors cursor-pointer select-none"
          >
            <span>Start Work</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        );
      case 'in_progress':
        return (
          <div className="flex gap-2 w-full">
            <button
              onClick={() => onStatusChange(_id, 'open')}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-[11px] font-sans font-semibold text-slate-600 hover:text-slate-700 transition-colors cursor-pointer select-none"
            >
              <ArrowLeft className="w-3 h-3 text-slate-400" />
              <span>Back to Open</span>
            </button>
            <button
              onClick={() => onStatusChange(_id, 'resolved')}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50 text-[11px] font-sans font-semibold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer select-none"
            >
              <span>Resolve</span>
              <ArrowRight className="w-3 h-3 text-emerald-500" />
            </button>
          </div>
        );
      case 'resolved':
        return (
          <div className="flex gap-2 w-full">
            <button
              onClick={() => onStatusChange(_id, 'in_progress')}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-[11px] font-sans font-semibold text-slate-600 hover:text-slate-700 transition-colors cursor-pointer select-none"
            >
              <ArrowLeft className="w-3 h-3 text-slate-400" />
              <span>Reopen</span>
            </button>
            <button
              onClick={() => onStatusChange(_id, 'closed')}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-slate-900 bg-slate-900 hover:bg-slate-800 text-[11px] font-sans font-semibold text-white transition-colors cursor-pointer select-none shadow-xs"
            >
              <span>Close Ticket</span>
              <ArrowRight className="w-3 h-3 text-slate-300" />
            </button>
          </div>
        );
      case 'closed':
        return (
          <button
            onClick={() => onStatusChange(_id, 'resolved')}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-xs font-sans font-semibold text-slate-600 hover:text-slate-700 transition-colors cursor-pointer select-none"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>Reopen to Resolved</span>
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`group relative flex flex-col p-4 rounded-xl border bg-white shadow-2xs hover:shadow-xs transition-all duration-200 cursor-grab active:cursor-grabbing border-stone-200 ${
        slaBreached && status !== 'resolved' && status !== 'closed'
          ? 'hover:border-rose-300'
          : 'hover:border-slate-300'
      }`}
    >
      {/* Top row: Priority, SLA breach tag, and delete */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase border ${currentPriority.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentPriority.dot}`} />
            {priority}
          </span>
          
          {/* SLA breached warning block */}
          {slaBreached && (
            <span
              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                status === 'resolved' || status === 'closed'
                  ? 'bg-amber-50 text-amber-700 border border-amber-100'
                  : 'bg-rose-50 text-rose-700 border border-rose-100 animate-pulse'
              }`}
              title={
                status === 'resolved' || status === 'closed'
                  ? 'Resolved past SLA Target'
                  : 'Exceeds SLA response target!'
              }
            >
              <AlertTriangle className="w-3 h-3 text-current" />
              <span>Breached SLA</span>
            </span>
          )}
        </div>

        {/* Delete ticket action */}
        <button
          onClick={() => {
            if (window.confirm(`Are you sure you want to delete ticket: "${subject}"?`)) {
              onDeleteTicket(_id);
            }
          }}
          className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50/50 transition-all cursor-pointer shrink-0"
          title="Delete ticket"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Ticket Subject */}
      <h4 className="text-[14px] font-bold text-slate-800 font-display mb-1.5 leading-snug line-clamp-2">
        {subject}
      </h4>

      {/* Description */}
      <p className="text-[12px] text-slate-500 font-sans leading-relaxed mb-3 line-clamp-3">
        {description}
      </p>

      {/* Bottom details block: Age and Customer Email */}
      <div className="flex flex-col gap-1 border-t border-stone-100 pt-2.5 mb-3 text-[11px] text-slate-400 font-sans">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
          <span>
            {status === 'resolved' || status === 'closed' ? 'Resolved in:' : 'Open for:'}{' '}
            <strong className="text-slate-600">{formatAge(ageMinutes)}</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5 truncate">
          <User className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate" title={customerEmail}>
            {customerEmail}
          </span>
        </div>
      </div>

      {/* Step-by-Step Transition Controls */}
      <div className="mt-auto">
        {renderControls()}
      </div>
    </div>
  );
}
