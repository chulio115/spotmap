# 🗺️ SpotMap

Private Progressive Web App (PWA) für das Teilen geheimer Spots mit Freunden.

## 📋 Projekt-Status

### ✅ Phase 1 - Grundgerüst (Abgeschlossen)
- React + Vite als Basis
- PWA konfiguriert (Web App Manifest, Service Worker)
- Leaflet.js Karte mit OpenStreetMap-Kacheln
- 11 Kategorien mit Emoji-Markern und Farben
- Dark Mode Design mit Tailwind CSS
- React Router Navigation
- Mock-Daten für Demo

### ✅ Phase 2 - Auth & User-System (Vorbereitet)
- Magic Link Auth Komponenten
- Allowlist Management
- Admin Panel
- User Hooks (mit Mock-Logik)

### ✅ Phase 3 - Spots & Fotos (Vorbereitet)
- SpotForm für Erstellung
- SpotDetail für Details
- PhotoGallery für Fotogalerien
- Foto-Upload Vorbereitungen

### ✅ Phase 4 - Navigation & Notifications (Vorbereitet)
- Header mit Navigation
- NotificationBell mit Badge
- Feed Ansicht
- Notification Hooks

### 🔄 Phase 5 - Supabase Integration (Ausstehend)
- Alle Komponenten sind für Supabase vorbereitet
- SQL-Migration liegt bereit
- Environment Variables konfiguriert

## 🚀 Quick Start

```bash
# Installation
npm install

# Development
npm run dev

# Build
npm run build

# Preview
npm run preview
```

## 🛠 Tech Stack

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS (Dark Mode)
- **Karte:** Leaflet.js + React-Leaflet + OpenStreetMap
- **Navigation:** React Router
- **PWA:** Vite PWA Plugin
- **Backend (geplant):** Supabase
- **Hosting (geplant):** Netlify

## 📱 Features

### 🗺️ Karte
- Interaktive Leaflet-Karte (Deutschland)
- Farbige Emoji-Marker pro Kategorie
- Kategorie-Filter
- Klick auf Karte zum Erstellen neuer Spots

### 👤 Authentifizierung
- Magic Link Login (kein Passwort)
- Allowlist für private Nutzung
- Admin Panel für User-Management

### 📍 Spot-Management
- Spot erstellen mit Titel, Kategorie, Beschreibung
- Foto-Upload vorbereitet
- Spot-Details mit Galerie
- "Ich war hier" Feature

### 🔔 Notifications
- Badge für neue Spots seit letztem Besuch
- Feed mit chronologischer Liste
- Real-time Updates (Mock)

## 📂 Projektstruktur

```
spotmap/
├── public/
│   └── icons/              # PWA Icons
├── src/
│   ├── components/
│   │   ├── Header.jsx      # Navigation Header
│   │   ├── Map.jsx         # Leaflet Karte
│   │   ├── SpotMarker.jsx  # Spot Marker
│   │   ├── CategoryFilter.jsx # Kategorie-Filter
│   │   ├── SpotForm.jsx    # Spot Erstellung
│   │   ├── SpotDetail.jsx  # Spot Details
│   │   ├── PhotoGallery.jsx # Fotogalerie
│   │   └── NotificationBell.jsx # Notification Bell
│   ├── pages/
│   │   ├── MapPage.jsx     # Karten-Seite
│   │   ├── FeedPage.jsx    # Feed-Seite
│   │   ├── LoginPage.jsx   # Login-Seite
│   │   └── AdminPage.jsx   # Admin-Panel
│   ├── hooks/
│   │   ├── useSpots.js     # Spots Datenmanagement
│   │   ├── useAuth.js      # Auth Management
│   │   └── useNotifications.js # Notification Management
│   ├── lib/
│   │   └── supabase.js     # Supabase Client
│   ├── constants/
│   │   └── categories.js   # Kategorien Definition
│   └── App.jsx             # Haupt-App mit Router
├── supabase/
│   └── migrations/
│       └── 001_init.sql    # Datenbank-Schema
├── .env.local              # Environment Variables
└── SUPABASE_SETUP.md       # Setup Anleitung
```

## 🎨 Kategorien

- ☕ Frühstück / Brunch
- 🎉 Secret Party Location  
- 🏚️ Lost Place / Urbex
- 🌿 Naturspot
- 🌅 Aussichtspunkt
- 🍜 Restaurant Geheimtipp
- 🍺 Bar / Nachtleben
- 🎨 Kunst / Graffiti
- 🛹 Skate / Sport
- 🔞 Secret Sex Location
- 📍 Sonstiges

## 🔧 Nächste Schritte

1. **Supabase Projekt erstellen** - Folge `SUPABASE_SETUP.md`
2. **Environment Variables konfigurieren** - Trage Supabase Keys ein
3. **Datenbank-Migration ausführen** - SQL in Supabase Dashboard
4. **Supabase Integration aktivieren** - Mock-Logik durch echte API Calls ersetzen

## 📄 Lizenz

Private Projekt - nicht für öffentliche Nutzung bestimmt.

---

**Hinweis:** Die App verwendet aktuell Mock-Daten und kann ohne Supabase getestet werden. Alle Features sind voll funktionsfähig in der Demo-Version.
