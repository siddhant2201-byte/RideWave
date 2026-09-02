# 🚗 RideWave - Real-Time Ride-Hailing Platform

![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

**RideWave** is a full-stack, real-time ride-hailing web application built with **React 18**, **Vite**, **Tailwind CSS**, **Leaflet**, and a **Node.js + Socket.io** backend. It features real-time driver roaming simulation, Haversine nearest-driver matching, dynamic surge pricing, live trip telemetry with rotational vehicle markers, and trip receipts.

---

## 🌟 Key Features

- 🛰️ **Real-Time WebSocket Architecture**: Bi-directional communication powered by Socket.io for live driver position updates, trip status progression, and instant dispatch matching.
- 🗺️ **Interactive Dark-Mode Map**: Leaflet & React-Leaflet integration with custom dark tiles, animated vehicle markers with rotational heading interpolation, pickup/dropoff pins, and polyline route paths.
- 🚖 **Multi-Tier Vehicle Selection**: Instant fare estimations across multiple ride categories (Standard, Comfort, Premium, XL).
- ⚡ **Dynamic Surge Engine**: Demand-based surge pricing multiplier dynamically updated across active client connections.
- 📍 **Smart Haversine Dispatch Algorithm**: Server-side spatial spatial index calculation matching passengers to the closest available roaming driver.
- 📊 **Live Trip Telemetry**: Dynamic trip dashboard featuring ETA countdowns, speed telemetry, remaining distance indicators, safety PIN verification, and audio alerts.
- 📜 **Trip History & Digital Receipts**: Complete history view with past ride metrics, fare breakdowns, driver tipping, ratings, and printable receipts.

---

## 📐 Architecture Overview

```
 ┌─────────────────────────────────────────────────────────┐
 │                   React Frontend SPA                    │
 │  (Leaflet Map, Booking Panel, Trip Telemetry, Wallet)   │
 └────────────────────────────┬────────────────────────────┘
                              │
                    WebSocket (Socket.io)
                    Bi-directional JSON
                              │
 ┌────────────────────────────▼────────────────────────────┐
 │                Node.js + Express Server                 │
 │  - WebSocket Server (Real-Time Driver Fleet State)      │
 │  - Nearest Neighbor Matching Algorithm                  │
 │  - Trip Lifecycle Coordinator & Telemetry Emitter       │
 │  - Surge Heatmap & Pricing Engine                       │
 └────────────────────────────▲────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Domain | Tech / Library | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | [React 18](https://react.dev/) | UI library with Context API for global state management |
| **Build Tool** | [Vite](https://vitejs.dev/) | Fast Next-Gen Frontend Tooling |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS framework with custom glassmorphism styles |
| **Interactive Maps** | [Leaflet](https://leafletjs.com/) / [React-Leaflet](https://react-leaflet.js.org/) | Open-source JavaScript library for mobile-friendly interactive maps |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean & consistent icon library |
| **Backend Server** | [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/) | Lightweight HTTP web server |
| **Real-Time Layer** | [Socket.io](https://socket.io/) | Low-latency bi-directional event-driven engine |
| **Process Manager** | [Concurrently](https://www.npmjs.com/package/concurrently) | Runs both client & server concurrently in development |

---

## 📂 Project Structure

```
RideWave/
├── server/
│   ├── server.js              # Express + Socket.io backend server & simulation engine
│   └── utils/
│       └── distance.js        # Haversine formula & spatial coordinate math
├── src/
│   ├── components/
│   │   ├── Booking/
│   │   │   └── RideBookingPanel.jsx   # Pickup/dropoff selection & vehicle options
│   │   ├── History/
│   │   │   └── RideHistoryPanel.jsx   # Past ride history & receipt modal
│   │   ├── Map/
│   │   │   └── RideWaveMap.jsx        # Leaflet interactive map with driver movement
│   │   ├── Trip/
│   │   │   ├── ActiveTripPanel.jsx    # Real-time trip status & telemetry view
│   │   │   └── TripCompletedModal.jsx # Trip completion, rating, and fare receipt
│   │   └── Navbar.jsx                 # Header bar with connection status & tabs
│   ├── context/
│   │   └── RideWaveContext.jsx        # Central state management & WebSocket socket listeners
│   ├── services/
│   │   └── socket.js                  # Socket.io connection instance manager
│   ├── styles/
│   │   ├── index.css                  # Global Tailwind directives & glassmorphism CSS
│   │   └── map.css                    # Leaflet dark map styles & marker animations
│   ├── App.jsx                        # Main SPA layout shell
│   └── main.jsx                       # Application entry point
├── .env.example                       # Environment configuration template
├── package.json                       # Scripts and project dependencies
├── tailwind.config.js                 # Tailwind CSS customization
└── vite.config.js                     # Vite build configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/RideWave.git
   cd RideWave
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional)**
   Copy `.env.example` to `.env` if you wish to use a custom Leaflet map tile provider:
   ```bash
   cp .env.example .env
   ```

---

## 🏃 Running the Application

### Development Mode (Simultaneous Client & Server)

Run both the Express WebSocket server and Vite React frontend with a single command:

```bash
npm run dev
```

- **Frontend**: Available at `http://localhost:5173`
- **Backend WebSocket Server**: Available at `http://localhost:3001`

### Running Client or Server Separately

- **Run Server Only**:
  ```bash
  npm run server
  ```
- **Run Frontend Client Only**:
  ```bash
  npm run client
  ```

---

## 📜 NPM Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| `npm run dev` | `concurrently "npm run server" "npm run client"` | Launches backend server and frontend client concurrently |
| `npm run client` | `vite` | Starts the Vite React development server |
| `npm run server` | `node server/server.js` | Starts the Node.js + Socket.io backend server |
| `npm run build` | `vite build` | Builds production-optimized assets into `dist/` |
| `npm run preview` | `vite preview` | Previews the production build locally |

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
