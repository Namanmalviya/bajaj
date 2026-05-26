import React, { useState } from 'react';
import TicketCard from './TicketCard';

export default function Column({ status, title, tickets = [], onStatusChange, onDeleteTicket }) {
  const [isOver, setIsOver] = useState(false);

  // Column header configurations
  const columnConfigs = {
    open: {
      dot: 'bg-slate-400',
      headerText: 'text-slate-700',
      bg: 'bg-slate-50/50',
      border: 'border-slate-200/60'
    },
    in_progress: {
      dot: 'bg-sky-500',
      headerText: 'text-sky-800',
      bg: 'bg-sky-50/20',
      border: 'border-sky-100/70'
    },
    resolved: {
      dot: 'bg-emerald-500',
      headerText: 'text-emerald-800',
      bg: 'bg-emerald-50/10',
      border: 'border-emerald-100/50'
    },
    closed: {
      dot: 'bg-stone-500',
      headerText: 'text-stone-700',
      bg: 'bg-stone-100/30',
      border: 'border-stone-200/40'
    }
  };

  const config = columnConfigs[status] || columnConfigs.open;

  // HTML5 Drag Event Handlers
  const handleDragOver = (e) => {
    e.preventDefault(); // Required to let us drop!
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    
    const ticketId = e.dataTransfer.getData('text/plain');
    const originStatus = e.dataTransfer.getData('originStatus');
    
    if (!ticketId) return;
    
    // Only attempt update if the status is actually changing
    if (originStatus !== status) {
      onStatusChange(ticketId, status, originStatus);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col h-[70vh] min-h-[500px] rounded-2xl border p-4 transition-all duration-200 ${config.bg} ${config.border} ${
        isOver
          ? 'ring-2 ring-slate-300 ring-offset-2 border-dashed border-slate-400 bg-stone-100/80 shadow-md scale-[1.01]'
          : ''
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-200/50">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${config.dot}`} />
          <h3 className={`text-[15px] font-bold font-display ${config.headerText}`}>
            {title}
          </h3>
        </div>
        <span className="bg-white px-2 py-0.5 rounded-full border border-stone-200 text-xs font-semibold text-slate-500 font-sans shadow-2xs">
          {tickets.length}
        </span>
      </div>

      {/* Cards List */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3.5 scrollbar-thin scrollbar-thumb-stone-200 hover:scrollbar-thumb-stone-300">
        {tickets.length > 0 ? (
          tickets.map((ticket) => (
            <TicketCard
              key={ticket._id}
              ticket={ticket}
              onStatusChange={onStatusChange}
              onDeleteTicket={onDeleteTicket}
            />
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-stone-200/60 rounded-xl p-6 text-center">
            <p className="text-[12px] text-slate-400 font-sans font-medium">
              No tickets here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
