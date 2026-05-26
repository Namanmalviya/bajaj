const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');

// Index mapping for status transitions
const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

/**
 * @route   GET /api/tickets
 * @desc    List tickets with status, priority, and breached filters (combinable)
 */
router.get('/', async (req, res) => {
  try {
    const { status, priority, breached } = req.query;
    
    // Construct database query (only filter by fields in DB)
    const dbQuery = {};
    if (status) {
      dbQuery.status = status;
    }
    if (priority) {
      dbQuery.priority = priority;
    }
    
    // Fetch all matching documents
    let tickets = await Ticket.find(dbQuery).sort({ createdAt: -1 });
    
    // Filter by dynamic read-time SLA breach if requested
    if (breached !== undefined) {
      const showBreached = breached === 'true';
      tickets = tickets.filter(t => t.slaBreached === showBreached);
    }
    
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Server error retrieving tickets: ' + error.message });
  }
});

/**
 * @route   GET /api/tickets/stats
 * @desc    Get counts by status, priority, and count of currently open/unresolved breached tickets
 */
router.get('/stats', async (req, res) => {
  try {
    const tickets = await Ticket.find({});
    
    const statusCounts = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
    const priorityCounts = { low: 0, medium: 0, high: 0, urgent: 0 };
    let breachedOpenCount = 0;
    
    tickets.forEach(ticket => {
      // Aggregate status counts
      if (statusCounts[ticket.status] !== undefined) {
        statusCounts[ticket.status]++;
      }
      
      // Aggregate priority counts
      if (priorityCounts[ticket.priority] !== undefined) {
        priorityCounts[ticket.priority]++;
      }
      
      // Count of SLA-breached tickets currently open (unresolved, i.e., not resolved or closed)
      if (ticket.status !== 'resolved' && ticket.status !== 'closed') {
        if (ticket.slaBreached) {
          breachedOpenCount++;
        }
      }
    });
    
    res.json({
      statusCounts,
      priorityCounts,
      breachedOpenCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error compiling stats: ' + error.message });
  }
});

/**
 * @route   POST /api/tickets
 * @desc    Create a new support ticket
 */
router.post('/', async (req, res) => {
  try {
    const { subject, description, customerEmail, priority } = req.body;
    
    // Basic presence validation prior to Mongoose saving
    if (!subject || !description || !customerEmail || !priority) {
      return res.status(400).json({ error: 'Subject, description, customerEmail, and priority are required fields.' });
    }
    
    const newTicket = new Ticket({
      subject,
      description,
      customerEmail,
      priority
    });
    
    await newTicket.save();
    res.status(201).json(newTicket);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: messages.join('. ') });
    }
    res.status(500).json({ error: 'Server error creating ticket: ' + error.message });
  }
});

/**
 * @route   PATCH /api/tickets/:id
 * @desc    Update ticket status and enforce transitions
 */
router.patch('/:id', async (req, res) => {
  try {
    const { status: newStatus, subject, description, customerEmail, priority } = req.body;
    const ticketId = req.params.id;
    
    // Find ticket
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Enforce state transition rules if status is being updated
    if (newStatus !== undefined && ticket.status !== newStatus) {
      const fromIdx = STATUSES.indexOf(ticket.status);
      const toIdx = STATUSES.indexOf(newStatus);
      
      if (toIdx === -1) {
        return res.status(400).json({ error: `Invalid status: '${newStatus}'. Allowed: open, in_progress, resolved, closed.` });
      }
      
      const diff = toIdx - fromIdx;
      
      // Forward transition check: Must be exactly +1 (step-by-step)
      if (diff > 0 && diff !== 1) {
        return res.status(400).json({ 
          error: `Illegal transition: Cannot skip forward from '${ticket.status}' to '${newStatus}'. Transition must go step-by-step: open → in_progress → resolved → closed.` 
        });
      }
      
      // Backward transition check: Must be exactly -1 (one step back)
      if (diff < 0 && diff !== -1) {
        return res.status(400).json({ 
          error: `Illegal transition: Cannot move backward from '${ticket.status}' to '${newStatus}'. Backwards transitions are restricted to exactly 1 step (e.g. resolved → in_progress).` 
        });
      }
      
      // Auto-update resolvedAt timestamp
      if (newStatus === 'resolved') {
        ticket.resolvedAt = new Date();
      } 
      // If moving back to open or in_progress, clear the resolvedAt timestamp
      else if (newStatus === 'open' || newStatus === 'in_progress') {
        ticket.resolvedAt = null;
      }
      
      // Apply new status
      ticket.status = newStatus;
    }
    
    // Update other fields if provided
    if (subject !== undefined) ticket.subject = subject;
    if (description !== undefined) ticket.description = description;
    if (customerEmail !== undefined) ticket.customerEmail = customerEmail;
    if (priority !== undefined) ticket.priority = priority;
    
    await ticket.save();
    res.json(ticket);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: messages.join('. ') });
    }
    res.status(500).json({ error: 'Server error updating ticket: ' + error.message });
  }
});

/**
 * @route   DELETE /api/tickets/:id
 * @desc    Delete a ticket
 */
router.delete('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json({ message: 'Ticket deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: 'Server error deleting ticket: ' + error.message });
  }
});

module.exports = router;
