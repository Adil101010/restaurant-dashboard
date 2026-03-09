# 🍕 Restaurant Dashboard

Web portal for restaurant owners to manage orders, menu, and analytics in real-time.

Built with React 18 + TypeScript + Material-UI, connected to a Spring Boot microservices backend.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript |
| UI Library | Material-UI (MUI) 5 |
| Routing | React Router 6 |
| HTTP Client | Axios |
| Charts | Recharts |
| Real-Time | WebSocket / Socket.IO |
| Build Tool | Vite 5 |
| Backend | Spring Boot 3.2 (18+ microservices) |

## Features

-  JWT Authentication with auto token refresh
-  Real-time order notifications (WebSocket + Audio)
-  Menu management (CRUD + image upload)
-  Order lifecycle (Pending → Preparing → Delivered)
-  Analytics dashboard with revenue charts
-  Mobile responsive design
-  Offline detection banner

## Prerequisites

- Node.js 18+
- npm 9+
- Backend running (Spring Boot)

## Setup

```bash
# 1. Clone karo
git clone https://github.com/Adil101010/restaurant-dashboard.git
cd restaurant-dashboard

# 2. Dependencies install karo
npm install

# 3. Environment variables
cp .env.example .env.local
# .env.local mein apna backend URL daalo

# 4. Dev server start karo
npm run dev
# App runs at: http://localhost:5173
