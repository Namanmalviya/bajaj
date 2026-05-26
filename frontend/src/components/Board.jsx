import React from 'react';
import Column from './Column';

export default function Board({ tickets = [], onStatusChange, onDeleteTicket }) {
  // Separate tickets into lists according to status
  const openTickets = tickets.filter((t) => t.status === 'open');
  const inProgressTickets = tickets.filter((t) => t.status === 'in_progress');
  const resolvedTickets = tickets.filter((t) => t.status === 'resolved');
  const closedTickets = tickets.filter((t) => t.status === 'closed');

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
      <Column
        status="open"
        title="Open"
        tickets={openTickets}
        onStatusChange={onStatusChange}
        onDeleteTicket={onDeleteTicket}
      />
      <Column
        status="in_progress"
        title="In Progress"
        tickets={inProgressTickets}
        onStatusChange={onStatusChange}
        onDeleteTicket={onDeleteTicket}
      />
      <Column
        status="resolved"
        title="Resolved"
        tickets={resolvedTickets}
        onStatusChange={onStatusChange}
        onDeleteTicket={onDeleteTicket}
      />
      <Column
        status="closed"
        title="Closed"
        tickets={closedTickets}
        onStatusChange={onStatusChange}
        onDeleteTicket={onDeleteTicket}
      />
    </div>
  );
}
