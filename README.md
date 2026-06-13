# HostelOS — Smart Hostel Management System

> A full-stack, AI-powered hostel management platform with multi-portal architecture, real-time biometric gate entry, and intelligent warden analytics.

---

## What is HostelOS?

HostelOS (branded as **CampusStay**) is a production-ready hostel management system built for the **Web Forge Hackathon**. It replaces manual hostel administration with a unified digital platform — giving students, wardens, admins, and gate staff their own dedicated portals.

**Key highlights:**
- AI Face Recognition at the gate using TensorFlow.js (BlazeFace)
- Real QR Code gate pass system with biometric verification
- Complaint management with AI keyword tagging
- Warden analytics dashboard with dining forecasts and security alerts
- Cloud PostgreSQL (Neon) database — no local DB setup required

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL via Neon (serverless) |
| AI / Face ID | TensorFlow.js, BlazeFace (browser-side) |
| Auth | JWT (JSON Web Tokens) |
| QR Codes | qrcode.react |
| Deployment | Vercel (frontend) + Railway / Vercel (backend) |

---

## Project Structure

```
HostelOS/
├── hostel-backend/        # Express.js API server
│   ├── config/            # Database connection
│   ├── controllers/       # Business logic per module
│   ├── middleware/         # JWT auth middleware
│   ├── routes/            # API route definitions
│   ├── seed.js            # Database seeder (run once)
│   ├── server.js          # App entry point
│   ├── .env               # Your local secrets (never commit)
│   └── .env.example       # Template for env setup
│
└── hostel-frontend/       # Next.js app (all portals)
    ├── src/app/
    │   ├── student/login      # Student portal login
    │   ├── login/             # Warden portal login
    │   ├── admin/login        # Admin portal login
    │   ├── gate/              # Gate kiosk (biometric scanner)
    │   └── dashboard/         # All dashboard pages
    ├── src/components/        # Shared UI components
    ├── src/context/           # Auth context (JWT management)
    ├── src/lib/               # Axios instance
    ├── .env.local             # Your local frontend env
    └── .env.example           # Template for env setup
```

---

## Environment Variables

### Backend — `hostel-backend/.env`

Copy `hostel-backend/.env.example` to `hostel-backend/.env` and fill in:

```env
# Server
PORT=5000
NODE_ENV=development

# Database — get this from https://neon.tech (free tier)
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Auth — generate with:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_super_long_random_secret_here

# CORS — URL of the frontend
# For local dev: http://localhost:3002 (or whichever port you use)
# For production: https://your-app.vercel.app
FRONTEND_URL=http://localhost:3002
```

### Frontend — `hostel-frontend/.env.local`

Copy `hostel-frontend/.env.example` to `hostel-frontend/.env.local` and fill in:

```env
# Backend API URL
# For local dev:
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# For production (replace with your deployed backend URL):
# NEXT_PUBLIC_API_URL=https://hostel-backend.vercel.app/api
```

---

## Local Setup

### Prerequisites

- Node.js v18+ installed
- A Neon account (free) at https://neon.tech — or any PostgreSQL database

### Step 1 — Clone and install dependencies

```bash
# Install backend dependencies
cd hostel-backend
npm install

# Install frontend dependencies
cd ../hostel-frontend
npm install
```

### Step 2 — Set up environment variables

```bash
# Backend
cd hostel-backend
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, FRONTEND_URL

# Frontend
cd ../hostel-frontend
cp .env.example .env.local
# Edit .env.local with your NEXT_PUBLIC_API_URL
```

### Step 3 — Seed the database

Run this **once** to create all tables and insert demo data:

```bash
cd hostel-backend
node seed.js
```

This creates:
- All PostgreSQL tables (users, rooms, allocations, fees, complaints, gate passes, etc.)
- Demo users for all roles (see credentials below)
- Sample mess menu, room allocations, complaints, and gate passes

### Step 4 — Start the backend

```bash
cd hostel-backend
npm run dev
# Server starts on http://localhost:5000
```

### Step 5 — Build and start the frontend

```bash
cd hostel-frontend
npm run build
npx next start -p 3002
# Student portal available at http://localhost:3002
```

> For demo purposes, you can run the same frontend build on multiple ports to simulate separate portals:
> ```bash
> npx next start -p 3001   # Warden portal
> npx next start -p 3002   # Student portal
> npx next start -p 3003   # Admin portal
> npx next start -p 3004   # Gate kiosk
> ```

---

## Demo Walkthrough

### Login Credentials

| Role | Email | Password |
|---|---|---|
| Student | `student@campusstay.com` | `student123` |
| Warden | `warden@campusstay.com` | `warden123` |
| Admin | `admin@campusstay.com` | `admin123` |

> All portals are accessible from one URL. The **Student Portal** is the default landing page. Other portals are linked in the footer of the student login screen.

---

### Demo 1 — Student Portal

**URL:** `http://localhost:3002/student/login`

1. Log in with the student credentials above.
2. You land on the **Student Dashboard** — check your room details, upcoming fees, and recent complaints.
3. Navigate to **Room & Accommodation** to see your room number, roommates, and check-in date.
4. Go to **Mess Menu** to see the weekly dining schedule.
5. Go to **Complaints** → click **New Complaint** → fill in a title, category, and description → submit. The AI will auto-tag it (e.g., "Electrical > Fan Issue").
6. Go to **Leave Request** → apply for leave with from/to dates and a reason.
7. Go to **Digital Gate Pass** → you'll see your active QR code. Click the **copy icon** next to the gate pass code — you'll need this string for the gate scanner demo.
8. Go to **Face ID Setup** → click **Start Camera** → wait for the AI model to load → click **Capture & Register Face**. Your face biometric is now saved to the database.
9. Go to **Payments** to view your fee history.

---

### Demo 2 — Warden Portal

**URL:** `http://localhost:3001/login`

1. Log in with the warden credentials.
2. The **Warden Dashboard** shows real-time stats — total residents, pending requests, complaints, and today's expected dining count.
3. Go to **Leave Requests** → approve or reject a student leave application.
4. Go to **Gate Passes** → approve or reject pending gate pass requests. Approving a pass makes it scannable at the gate.
5. Go to **Complaints** → view all complaints sorted by AI-generated tags. Update status to In Progress or Resolved.
6. Go to **Residents** to see all currently allocated students.
7. Go to **Room Management** to view occupancy across all rooms.
8. Go to **AI Analytics** — this is the highlight:
   - **Dining Forecast:** Today's predicted meal count based on current residents minus those on leave.
   - **Complaint Intelligence:** Category-wise complaint trend breakdown.
   - **Security Alerts:** Flags any overdue or suspicious gate pass activity.
   - **Occupancy Trends:** Visual breakdown of room utilization.

---

### Demo 3 — Admin Portal

**URL:** `http://localhost:3003/admin/login`

1. Log in with the admin credentials.
2. The **Admin Dashboard** gives a bird's-eye view of the entire hostel.
3. Go to **Student Management** to view, search, and manage all registered students.
4. Go to **Fee Management** to see all outstanding and paid fees across students.
5. Go to **Mess Management** to edit the weekly menu.
6. Go to **Staff Management** to view the staff roster.
7. Go to **Reports** for downloadable hostel statistics.

---

### Demo 4 — Gate AI Kiosk (Biometric + QR)

**URL:** `http://localhost:3004/gate/login`

> This is the most impressive demo — real-time AI face verification.

**Prerequisites:**
- The student must have registered their Face ID (Demo 1, Step 8)
- The warden must have approved the gate pass (Demo 2, Step 4)
- You need the gate pass QR code string (Demo 1, Step 7)

**Steps:**
1. Log in to the Gate Kiosk with admin credentials.
2. You'll land on the **AI Gate Scanner**. Your webcam activates automatically and the BlazeFace AI model loads.
3. Paste the gate pass code (e.g., `GP-AARAV-001`) into the scanner input field.
4. Position your face in front of the camera so the AI can see it.
5. Click **Scan QR Code**.
6. The system will:
   - Validate the QR code against the database
   - Check the pass is approved, unused, and not expired
   - Extract your live face biometric (landmark ratios via BlazeFace)
   - Compare it against the stored face data from Face ID registration
   - Show **VERIFIED** (green) if biometrics match within threshold
   - Show **MISMATCH** (red) if the face doesn't match the pass holder
7. A gate log entry is automatically created in the database.

---

## API Overview

The backend exposes a REST API at `http://localhost:5000/api`.

| Endpoint | Method | Description |
|---|---|---|
| `/auth/login` | POST | Login for all roles |
| `/student/room` | GET | Get student room details |
| `/student/fees` | GET | Get student fees |
| `/student/complaints` | GET / POST | List / create complaints |
| `/student/leaves` | GET / POST | List / request leaves |
| `/student/gatepasses` | GET / POST | List / create gate passes |
| `/student/mess` | GET | Get mess menu |
| `/student/register-face` | POST | Save face biometric |
| `/warden/leaves` | GET / PATCH | View / approve leaves |
| `/warden/passes` | GET / PATCH | View / approve gate passes |
| `/warden/complaints` | GET / PATCH | View / update complaints |
| `/warden/analytics` | GET | AI analytics data |
| `/admin/students` | GET | All students list |
| `/admin/fees` | GET | All fees |
| `/gate/verify` | POST | Verify QR code at gate |

---

## Deployment on Vercel

### Frontend

1. Push your code to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) → Import Project → select your repo.
3. Set the **Root Directory** to `hostel-frontend`.
4. Add the following Environment Variable in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL = https://your-backend.vercel.app/api
   ```
5. Deploy. The Student Portal will be your main URL — other portals are accessible from the footer.

### Backend

1. Go to [vercel.com](https://vercel.com) → Import Project → select your repo.
2. Set the **Root Directory** to `hostel-backend`.
3. Add these Environment Variables:
   ```
   DATABASE_URL = your_neon_connection_string
   JWT_SECRET   = your_secret_key
   FRONTEND_URL = https://your-frontend.vercel.app
   NODE_ENV     = production
   ```
4. Deploy.

> The `vercel.json` in the backend directory is already configured to run the Express server correctly on Vercel.

---

## Known Demo Notes

- The gate biometric threshold is set to Euclidean distance < 0.18 on 3 facial landmark ratios. Lighting conditions and camera angle affect accuracy — face the camera directly for best results.
- Face data is stored as a JSON array in the database. In production, this would be replaced with 128-dimensional face embeddings.
- The dining forecast uses a deterministic formula (residents minus active leaves) since we don't have historical ML training data in the demo.
- All 4 portals are built from a single Next.js codebase — in production they'd be on one Vercel URL with the student portal as the default entry point.

---

*Built with ❤️ for the Web Forge Hackathon — HostelOS / CampusStay*
