# DeskFlow — Support Ticket Triage Board

DeskFlow is a premium, modern Support Ticket Triage Board built on the MERN Stack (**MongoDB, Express, React, Node.js**). It offers support agents a fluid, visual Kanban interface to track customer tickets, manage their lifecycle with a strict step-by-step status machine, and monitor time-based SLA targets with high-fidelity, read-time derived indicators.

The user interface has been custom-crafted using a warm, humanist stone-and-slate design system, completely avoiding sterile neon boilerplate or generic AI templates, resulting in a premium, organic look.

---

## Key Features

- 📋 **Visual Kanban Board**: Four columns mapping the entire support ticket lifecycle: `Open`, `In Progress`, `Resolved`, and `Closed`.
- 🫳 **Native Drag-and-Drop**: Smooth HTML5 drag-and-drop support. Dragging a card to another column attempts to transition its status, automatically snapping back with visual toast feedback if the transition violates rules.
- ⚙️ **Strict Rules Engine**: Step-by-step state transition boundaries enforced directly on the server to prevent skipping states, with automatic timestamp logging.
- ⏱️ **Read-Time Derived Fields**:
  - `ageMinutes`: Live calculated age. Stops growing and locks once the ticket is resolved, keeping historical resolution speed static.
  - `slaBreached`: Dynamic evaluation comparing ticket priority targets against its elapsed age. Supports active warnings and past breaches.
- 📊 **Dynamic Statistics Strip**: Displays real-time ticket counts per status and tracks open SLA-breached cases.
- 🔍 **Combined Multi-Filters**: Allows filtering the triage board by priority and SLA breach state simultaneously.
- 📥 **Slide-Out Side Panel**: Premium slide-over ticket creation form with real-time, inline field validators (avoiding harsh alert boxes).
- 🔔 **Built-in Toast Deck**: A custom floating notification stack to provide feedback on status transitions, deletions, and errors.

---

## System Architecture & State Machine

### 1. SLA Priority Targets
Each ticket has a response time threshold based on its priority:
* **Urgent**: 1 Hour (60 minutes)
* **High**: 4 Hours (240 minutes)
* **Medium**: 24 Hours (1440 minutes)
* **Low**: 72 Hours (4320 minutes)

### 2. Strict State Transition Logic
To maintain process integrity, status changes must adhere strictly to adjacent transitions:
```
  [ Open ]  ← (1 step) →  [ In Progress ]  ← (1 step) →  [ Resolved ]  ← (1 step) →  [ Closed ]
```
- **Forward Progress**: Must go exactly step-by-step (e.g. `open` to `in_progress` is allowed; `open` to `resolved` directly is **rejected with 400**).
- **Backward Steps**: Permitted only 1 step backward (e.g. `resolved` to `in_progress` is allowed; `closed` to `in_progress` directly is **rejected with 400**).
- **Timestamp Integrity**: 
  - Transitioning **to** `resolved` automatically sets `resolvedAt = new Date()`.
  - Transitioning **back** from `resolved` (i.e. to `in_progress` or `open`) automatically **clears** `resolvedAt = null`.
  - Transitioning from `resolved` **to** `closed` preserves `resolvedAt` so the ticket's resolution speed is permanently frozen.

---

## API Endpoints (`/api/tickets`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/tickets` | Creates a new support ticket (Validates email & required inputs). |
| **GET** | `/api/tickets` | Lists all tickets. Supports combined filters: `?status=...`, `?priority=...`, and `?breached=true` (dynamic calculation). |
| **PATCH** | `/api/tickets/:id` | Updates a ticket status. Enforces the strict transition engine and auto-manages `resolvedAt`. |
| **DELETE** | `/api/tickets/:id` | Deletes a ticket by ID. |
| **GET** | `/api/tickets/stats` | Aggregates counts per status, per priority, and the number of SLA-breached tickets currently open (unresolved). |

---

## Getting Started Locally

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://127.0.0.1:27017/deskflow` (or an Atlas URI)

### 1. Setup Backend
```bash
# Navigate to backend folder
cd backend

# Install dependencies (mongoose, express, cors, dotenv)
npm install

# (Optional) Seed the database with high-fidelity mock data (different ages & priorities)
node seed.js

# Start the server (starts nodemon or node index.js)
npm start
```
The server will run on `http://localhost:5000` and confirm MongoDB connection in the console.

### 2. Setup Frontend
```bash
# Navigate to frontend folder
cd ../frontend

# Install dependencies (react, vite, tailwindcss v4, lucide-react)
npm install

# Boot the Vite development server
npm run dev
```
Open `http://localhost:5173` to see DeskFlow in action.

---

## Seeding Highlights
Running `node seed.js` inside the `backend` folder sets up:
- 1 Urgent ticket created 45 mins ago (In Progress, within SLA).
- 1 Urgent ticket created 95 mins ago (Open, **Breached SLA**).
- 1 High ticket created 5.5 hours ago (Open, **Breached SLA**).
- 1 High ticket created 1.5 hours ago (In Progress, within SLA).
- 1 Medium ticket created 12 hours ago, resolved after 30 mins (Resolved, **SLA safe and frozen age**).
- 1 Medium ticket created 30 hours ago, resolved after 28 hours (Resolved, **SLA breached and frozen age**).
- 1 Low ticket resolved and Closed (Closed, within SLA).

This ensures you can evaluate the board's dynamic status, calculations, and colors instantly on first load.

---

## Deployment Guidelines

### Backend Deployment (Render / Railway / Fly.io)
1. Set up a free cluster on **MongoDB Atlas** and obtain the connection string.
2. Connect your repository to Render/Railway.
3. Configure Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas URI.
   - `PORT`: `5000` (or let the platform bind dynamically).
4. Start command: `node index.js`.

### Frontend Deployment (Netlify / Vercel)
1. Connect your repository's `/frontend` path.
2. Configure Environment Variables:
   - `VITE_API_URL`: Set this to your deployed backend API URL (e.g. `https://deskflow-api.onrender.com/api`).
3. Set build configuration:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Deploy! Because we use clean CORS handling, frontend and backend will communicate smoothly without cross-origin errors.
