const mongoose = require('mongoose');
const Ticket = require('./models/Ticket');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/deskflow';

const dummyTickets = [
  {
    subject: 'Production Server Latency Spikes',
    description: 'We are seeing latency spikes up to 4000ms on our primary database cluster. API requests are throwing gateway timeouts.',
    customerEmail: 'devops@enterprise.com',
    priority: 'urgent',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 45 * 60 * 1000) // 45 mins ago (Urgent SLA target: 1h -> Not Breached)
  },
  {
    subject: 'Cannot log in - Token Signature Invalid',
    description: 'All users trying to log in via SSO are getting a "Token Signature Invalid" error page after redirecting back to our app.',
    customerEmail: 'samantha.green@corporate.io',
    priority: 'urgent',
    status: 'open',
    createdAt: new Date(Date.now() - 95 * 60 * 1000) // 1h 35m ago (Urgent SLA target: 1h -> Breached!)
  },
  {
    subject: 'Export to CSV failing for large tables',
    description: 'When trying to export a transaction sheet with over 50,000 rows, the download fails halfway through with a network interruption error.',
    customerEmail: 'finance-ops@global.net',
    priority: 'high',
    status: 'open',
    createdAt: new Date(Date.now() - 5.5 * 60 * 60 * 1000) // 5h 30m ago (High SLA target: 4h -> Breached!)
  },
  {
    subject: 'Update billing credit card details',
    description: 'We need to transition our subscription payment from the expiring corporate card to our new bank debit card. Please assist.',
    customerEmail: 'accounts@startupgrid.co',
    priority: 'high',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000) // 1h 30m ago (High SLA target: 4h -> Not Breached)
  },
  {
    subject: 'Broken navigation link in user profile settings',
    description: 'The link pointing to "Notification Preferences" on the profile layout returns a 404 page. Looks like a simple route mismatch.',
    customerEmail: 'mark.robinson@gmail.com',
    priority: 'medium',
    status: 'resolved',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12h ago
    resolvedAt: new Date(Date.now() - 11.5 * 60 * 60 * 1000) // Resolved 30 mins after creation (Medium SLA target: 24h -> Not Breached, Age should be locked at 30 mins!)
  },
  {
    subject: 'Integration documentation request for Webhooks',
    description: 'Where can we find the latest JSON schemas and security signature details for incoming webhook payloads? The developer docs feel outdated.',
    customerEmail: 'eng-lead@saastech.com',
    priority: 'medium',
    status: 'resolved',
    createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000), // 30h ago
    resolvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // Resolved after 28 hours (Medium SLA target: 24h -> Breached, Age should be locked at 28 hours!)
  },
  {
    subject: 'typo in French localization string',
    description: 'On the Checkout page, the French translation for "Billing Address" says "Addresse" instead of "Adresse" (double d). Please fix when convenient.',
    customerEmail: 'jean.luc@ecom-express.fr',
    priority: 'low',
    status: 'closed',
    createdAt: new Date(Date.now() - 74 * 60 * 60 * 1000), // 74h ago
    resolvedAt: new Date(Date.now() - 73 * 60 * 60 * 1000) // Resolved after 1 hour (Low SLA target: 72h -> Not Breached)
  }
];

async function seed() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Database connected. Clearing existing tickets...');
    await Ticket.deleteMany({});
    
    console.log('Seeding mock support tickets...');
    const createdTickets = await Ticket.insertMany(dummyTickets);
    console.log(`Successfully seeded ${createdTickets.length} tickets with realistic times!`);
    
    console.log('Seeding complete. Disconnecting...');
    await mongoose.disconnect();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error during database seed:', error);
    process.exit(1);
  }
}

seed();
