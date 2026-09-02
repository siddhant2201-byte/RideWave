# Uber Clone SPA + WebSocket Backend Implementation Plan

Create a feature-rich, full-stack Uber Clone application featuring a **Node.js + Express + Socket.io WebSocket backend** and a **React + Tailwind CSS + Leaflet frontend SPA**. The system manages real-time roaming driver simulation, nearest-driver dispatch algorithms over WebSockets, live trip telemetry broadcasting, dynamic surge pricing, driver fleet administration, ride history, and digital wallet integration.

## Architecture Overview

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

## Highlights & Features

1. **Real-Time WebSocket Architecture**: Express + `socket.io` server handling real-time driver state simulation, dispatch math, ride updates, and room/channel broadcasts.
2. **Backend Haversine Nearest-Neighbor Dispatch Algorithm**: Server-side spatial index calculation for nearest driver assignment.
3. **Dynamic Surge & Multi-Tier Pricing Engine**: Real-time demand factor multipliers broadcast over WebSockets, vehicle tier selector (UberX, UberXL, Comfort, Uber Black, Moto), surge heat indicators.
4. **Live Trip Telemetry Dashboard**: Real-time progress bar, dynamic speed readout, ETA countdown, polyline route navigation, audio notifications.
5. **Driver Fleet Control Panel**: Live interactive control to toggle driver states, inject simulated traffic delays, spawn new drivers, and monitor driver earnings.
6. **Digital Wallet & Promo System**: Balance management, top-ups, promo codes (`UBERPROMO20`, `FREERIDE`), itemized receipts.

## File & Component Breakdown

### Backend (Node.js + Express + Socket.io)
- `server/package.json`: Server dependencies (`express`, `socket.io`, `cors`).
- `server/server.js`: Express server with Socket.io real-time driver state simulation & event handlers.
- `server/utils/distance.js`: Server-side Haversine distance, bearing calculations, and path interpolation.

### Project Setup & Frontend Config
- `package.json`: Dependencies (`react`, `react-dom`, `vite`, `tailwindcss`, `socket.io-client`, `leaflet`, `react-leaflet`, `lucide-react`, `concurrently`).
- `vite.config.js`: Vite configuration with server proxy settings.
- `tailwind.config.js`: Tailwind theme configuration with custom animation utilities.
- `postcss.config.js`: PostCSS configuration.
- `index.html`: Entry HTML with font links and Leaflet CSS CDN backup.

### Styling & Theme System (Dedicated CSS Files)
- `src/styles/index.css`: Tailwind directives, glassmorphism utilities, dark mode variables.
- `src/styles/map.css`: Dedicated Leaflet map styling, pulsing markers, car rotation transforms.

### Client Socket Integration & State Management
- `src/services/socket.js`: Socket.io connection manager with auto-reconnect and fallback mode.
- `src/context/UberContext.jsx`: Global React context for drivers, active trip, wallet, history.

### UI Components
- `src/components/Navbar.jsx`: Header with view toggle, WebSocket live status badge, surge tag, wallet.
- `src/components/Map/UberMap.jsx`: Leaflet map view with dark mode, driver car markers with rotational heading, route polylines.
- `src/components/Booking/RideBookingPanel.jsx`: Pickup/Dropoff selector, map click mode, vehicle options, pricing.
- `src/components/Trip/ActiveTripPanel.jsx`: Real-time trip status center with assigned driver info, safety PIN, speed readout, distance remaining.
- `src/components/Trip/TripCompletedModal.jsx`: Fare breakdown, driver tipping, rating, printable receipt.
- `src/components/Fleet/FleetControlPanel.jsx`: Admin control to trigger surge, spawn drivers, adjust traffic.
- `src/components/Wallet/WalletModal.jsx`: Digital wallet top-up, promo code manager, transaction log.
- `src/components/History/RideHistoryPanel.jsx`: Past ride analytics, trip history cards, receipt viewer.
- `src/App.jsx`: Main application container.
- `src/main.jsx`: React entry point.
