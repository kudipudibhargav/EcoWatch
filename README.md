# 🌍 EcoWatch — Real-Time Environmental & Space Intelligence Dashboard

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20with-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)](https://eco-watch-seven.vercel.app/)
[![React](https://img.shields.io/badge/React-19.2.0-blue?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.x-orange?style=for-the-badge&logo=firebase&logoColor=white)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-green?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)

**EcoWatch** is a modern, high-performance real-time environmental monitoring dashboard. It combines meteorological data, air quality reports, geophysical threat tracking, and space telemetry into a single, intuitive interface. Built on **React 19**, **TypeScript**, and **Vite**, with a serverless **Firebase** backend, the application is optimized for visual excellence, micro-animations, and responsive layouts, deployed globally via **Vercel**.

🔗 **Live Site:** [https://eco-watch-seven.vercel.app/](https://eco-watch-seven.vercel.app/)

---

## 🚀 Key Features

### 1. Environmental & Air Quality Dashboard (`AQI`)
- **AQI Gauge**: Visually striking air quality gauge displaying real-time AQI levels (Good, Moderate, Unhealthy, Hazardous) powered by **Open-Meteo Air Quality API**.
- **Meteorological Indicators**: Detailed weather cards monitoring temperature, apparent temperature, relative humidity, UV index, wind speed/direction, and precipitation.
- **Pollutant Breakdown**: Interactive pollutant data visualization for $PM_{2.5}$, $PM_{10}$, nitrogen dioxide ($NO_2$), sulfur dioxide ($SO_2$), carbon monoxide ($CO$), and ozone ($O_3$).
- **Health Advisories**: Contextual health recommendations based on current local air quality to guide outdoor activities.

### 2. Regional Earthquake Monitor & Alert System
- **USGS Live Stream**: Fetches real-time global seismic feeds from the **USGS Earthquake Hazards Program** updated every 5 minutes.
- **Haversine Distance Proximity**: Utilizes the mathematical Haversine formula to compute the exact distance (in km) between the user's location and seismic event coordinates.
- **Proximity Alerts**: Filters and displays significant earthquakes (magnitude $\ge 2.5$) within a regional radius of **2,500 km** or within the user's country.
- **Color-Coded Severity**: Distinguishes micro-quakes from high-magnitude threats using dynamic CSS severity markers.

### 3. Space Center & Orbital Telemetry
- **ISS Orbital Tracker**: Tracks the real-time position of the International Space Station (ISS) using the **Where the ISS at? API**.
- **Interactive Leaflet Mapping**: Renders the orbital path on a smooth, panning Leaflet Map utilizing a custom ISS vector marker that updates every 5 seconds.
- **Celestial Events Calendar**: An astronomical sky events tracker detailing upcoming meteor showers, lunar phases, and visible planetary alignments.

### 4. Historical Analytics & Forecast Trends
- **7-Day Trend Analytics**: Fetches archive meteorological data using the **Open-Meteo Archive API** to graph historical air quality index (AQI) and temperature trends.
- **SVG Sparklines & Charts**: Dynamic, lightweight SVG charts written without heavy dependency libraries for smooth client-side rendering.
- **Weather Forecasts**: Graphical forecast overview for precipitation and temperature peaks.

### 5. Personalization & Localization
- **Firebase Auth & Firestore**: Secure user registration, sign-in, and persistence of dashboard configurations, location parameters, and notification alerts.
- **Multi-Language Support**: Complete localization capability (English and additional languages) managed via a dedicated `LanguageContext`.
- **Dynamic Styling**: Responsive mobile layouts, modern glassmorphism aesthetic, subtle transitions, and custom-curated HSL palettes.

---

## 🛠️ Tech Stack & Dependencies

- **Frontend Core:** React 19 (Hooks, Context API), TypeScript, HTML5, CSS3 Custom Properties (Vanilla CSS).
- **Build Tool:** Vite, ESLint, TypeScript Compiler (`tsc`).
- **Telemetry & Maps:** Leaflet (`react-leaflet` & `leaflet` bindings) for rendering geospatial coordinates.
- **Backend Services:** Firebase Client SDK (Authentication, Cloud Firestore Database).
- **Time Formatting:** `date-fns` for clean relative date outputs (e.g., "3 minutes ago").
- **Icons:** `lucide-react` for modern, responsive vector icons.
- **Hosting & SPA Routing:** Vercel (rewrites configuration).

---

## 📂 Project Directory Structure

```text
EcoWatch/
├── .firebaserc              # Firebase project target binding
├── firebase.json            # Firebase CLI hosting/database rules
├── firestore.rules          # Security rules for Firestore Database
├── firestore.indexes.json   # Query optimizations for database fields
├── vercel.json              # Vercel SPA routing and rewrites
├── vite.config.ts           # Vite build configurations
├── index.html               # Main entry HTML template
├── package.json             # Core dependency manifest
├── tsconfig.json            # TypeScript configuration
└── src/
    ├── main.tsx             # React bootstrap mount point
    ├── App.tsx              # Main routing and layout wrapper
    ├── App.css              # Global dashboard shell styling
    ├── index.css            # Base typography and design system tokens
    ├── assets/              # Static media assets and images
    ├── config/
    │   └── firebase.ts      # Firebase SDK initialization
    ├── context/
    │   ├── AuthContext.tsx  # User sign-in, signup, session state
    │   ├── EnvContext.tsx   # Weather, AQI, Geocoding state coordination
    │   └── LanguageContext.tsx # Localization and translation state
    ├── services/
    │   ├── api.service.ts       # Open-Meteo meteorological and geocoding fetch
    │   ├── analytics.service.ts # Archive weather API integrations
    │   └── earthquake.service.ts # USGS GeoJSON endpoint services
    ├── components/
    │   ├── layout/          # Dashboard layout wrappers and sidebar navigation
    │   ├── environment/     # AQI gauges, pollutant charts, weather cards
    │   ├── analytics/       # Historical weather & AQI SVG charts
    │   ├── map/             # Leaflet minimaps and spatial configurations
    │   ├── space/           # ISS telemetry markers and astronomical calendars
    │   └── health/          # Health recommendation components
    └── pages/
        ├── MainDashboard.tsx # Combined telemetry, weather, and AQI widget grid
        ├── SpaceDashboard.tsx # Combined ISS tracker and astronomy cards
        ├── AlertsDashboard.tsx # Proximity earthquake tracker
        ├── SettingsDashboard.tsx # Multi-language, user profile, and theme manager
        └── LoginDashboard.tsx  # Auth forms for registration and sign-in
```

---

## ⚙️ Local Development Setup

### 📋 Prerequisites
- **Node.js** (v18.x or higher recommended)
- **npm** (v9.x or higher)
- A **Firebase Project** configured with Authentication (Email/Password) and Firestore.

### 🛠️ Execution Steps
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/kudipudibhargav/EcoWatch.git
   cd EcoWatch
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file or update `src/config/firebase.ts` with your Firebase API parameters:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   *The application will boot locally at `http://localhost:5173`.*

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📡 API Integrations & Feeds

| Data Stream | Provider | Endpoint | Refresh Rate |
| :--- | :--- | :--- | :--- |
| **Current Weather & Forecasts** | Open-Meteo | `https://api.open-meteo.com/v1/forecast` | On-demand / Manual |
| **Real-time Air Quality & AQI** | Open-Meteo AQI | `https://air-quality-api.open-meteo.com/v1/air-quality` | On-demand / Manual |
| **Historical Environmental Stats** | Open-Meteo Archive | `https://archive-api.open-meteo.com/v1/archive` | On-demand |
| **Geocoding & Location Search** | Open-Meteo Geocoding | `https://geocoding-api.open-meteo.com/v1/search` | Dynamic input |
| **Significant Earthquakes (24h)** | USGS Earthquakes | `https://earthquake.usgs.gov/.../all_day.geojson` | 5 Minutes |
| **ISS Position Tracking** | Where the ISS at? | `https://api.wheretheiss.at/v1/satellites/25544` | 5 Seconds |

---

## 🔒 Firebase Security Rules

### Firestore Security Rules (`firestore.rules`)
To protect user profiles and dashboard configurations, ensure your Firestore rules restrict write operations to the authenticated account owner:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🌐 Deployment Configuration

### Vercel Deployment Configuration (`vercel.json`)
Since this dashboard uses client-side routing (React Router) inside a Single Page Application (SPA), the `vercel.json` rewrite rule is defined to redirect all server-side page requests to `index.html` for clean route handling:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 📄 License & Credits
- Environmental data graphs, weather, and geocoding powered by [Open-Meteo APIs](https://open-meteo.com/).
- Seismic threat coordinates provided by the [USGS Earthquakes Hazards Program](https://earthquake.usgs.gov/).
- Satellite coordinates provided by the [Where the ISS at? service](https://wheretheiss.at/).
- This project is open-source. Created by [kudipudibhargav](https://github.com/kudipudibhargav).
