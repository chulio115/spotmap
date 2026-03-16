# Netlify Deployment Setup

## 🚀 Environment Variables einrichten

### Schritt 1: Netlify Dashboard öffnen
1. Gehe zu [https://app.netlify.com](https://app.netlify.com)
2. Wähle dein **spotmap** Projekt aus

### Schritt 2: Environment Variables setzen
1. Klicke auf **Site configuration** (oder **Site settings**)
2. Im linken Menü: **Environment variables**
3. Klicke auf **Add a variable** (oder **Add environment variable**)

### Schritt 3: Folgende Variables hinzufügen

Kopiere die Werte aus deiner lokalen `.env.local` Datei:

```
VITE_FIREBASE_API_KEY=AIzaSyCEMtrO58vh89M6Hivchk1j9Ek64ZDTWoo
VITE_FIREBASE_AUTH_DOMAIN=spotmap-72e40.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=spotmap-72e40
VITE_FIREBASE_STORAGE_BUCKET=spotmap-72e40.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=506494142453
VITE_FIREBASE_APP_ID=1:506494142453:web:a1c883cd51eedf2684c2bc
VITE_ADMIN_EMAIL=juliusschulze@me.com
```

**WICHTIG:** 
- Jede Variable einzeln hinzufügen (Name + Value)
- **Scopes:** Wähle "All" oder "Production, Deploy previews, and branch deploys"
- Die Variable-Namen müssen **EXAKT** so geschrieben sein (mit `VITE_` Prefix!)

### Schritt 4: Deploy neu triggern
Nach dem Hinzufügen der Variables:
1. Gehe zu **Deploys**
2. Klicke auf **Trigger deploy** → **Deploy site**
3. Oder: Pushe einen neuen Commit zu GitHub (automatisches Re-Deploy)

---

## 🔧 Build Settings (sollten bereits korrekt sein)

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 18 oder höher

---

## ✅ Checklist nach Deploy

- [ ] Alle 7 Environment Variables gesetzt
- [ ] Site neu deployed
- [ ] Login-Seite lädt ohne Fehler
- [ ] Firebase Auth funktioniert (Magic Link)
- [ ] Karte zeigt sich nach Login
- [ ] Spots können erstellt werden

---

## 🐛 Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"
→ `VITE_FIREBASE_API_KEY` fehlt oder ist falsch in Netlify Environment Variables

### "Blank page" / "White screen"
→ Öffne Browser DevTools Console (F12) und prüfe Fehler
→ Meist fehlen Environment Variables

### Build schlägt fehl
→ Prüfe ob `.npmrc` mit `legacy-peer-deps=true` im Repo ist
→ Oder setze in Netlify: Environment Variable `NPM_FLAGS` = `--legacy-peer-deps`

### Icons 404 Error
→ Nicht kritisch, PWA Icons fehlen noch (siehe unten)

---

## 📱 PWA Icons (Optional - später)

Die fehlenden Icons kannst du später hinzufügen:
- `public/icons/icon-192x192.png`
- `public/icons/icon-512x512.png`
- `public/favicon.ico`

Für jetzt: Ignoriere die 404-Fehler, die App funktioniert trotzdem.
