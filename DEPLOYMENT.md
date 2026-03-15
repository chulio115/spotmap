# 🚀 SpotMap Deployment Guide

## Deployment-Strategie: Netlify (Frontend) + PocketBase Cloud (Backend)

Da PocketBase eine eigenständige Backend-Anwendung ist, müssen Frontend und Backend getrennt gehostet werden.

---

## 📦 Option 1: Netlify + PocketBase Cloud (Empfohlen)

### **Frontend auf Netlify:**

1. **Netlify Account erstellen** (falls noch nicht vorhanden)
   - Gehe zu https://netlify.com
   - Sign up mit GitHub

2. **Neues Projekt erstellen:**
   - "Add new site" → "Import an existing project"
   - Wähle GitHub Repository: `chulio115/spotmap`
   - Branch: `main`

3. **Build Settings:**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

4. **Environment Variables setzen:**
   ```
   VITE_POCKETBASE_URL=https://your-pocketbase-url.pockethost.io
   VITE_ADMIN_EMAIL=admin@spotmap.de
   ```

5. **Deploy!** 🎉

### **PocketBase auf PocketHost (Kostenlos):**

1. **PocketHost Account erstellen:**
   - Gehe zu https://pockethost.io
   - Sign up (Free Tier: 1 Instance, 1GB Storage)

2. **Neue PocketBase Instance erstellen:**
   - Name: `spotmap` (oder beliebig)
   - Region: EU (für DSGVO-Konformität)

3. **Collections erstellen:**
   - Öffne Admin UI: `https://your-instance.pockethost.io/_/`
   - Erstelle Collections wie in lokaler DB

4. **URL kopieren:**
   - Kopiere die PocketHost URL
   - Trage sie in Netlify Environment Variables ein

5. **CORS konfigurieren:**
   - In PocketBase Settings → Application
   - Allowed Origins: `https://your-netlify-app.netlify.app`

---

## 📦 Option 2: Netlify + Railway (PocketBase Self-Hosted)

### **PocketBase auf Railway:**

1. **Railway Account erstellen:**
   - https://railway.app
   - Free Tier: $5 Credit/Monat

2. **Neues Projekt:**
   - "New Project" → "Deploy from GitHub repo"
   - Wähle ein separates PocketBase-Repo oder erstelle eins

3. **Dockerfile für PocketBase:**
   ```dockerfile
   FROM alpine:latest
   
   RUN apk add --no-cache \
       ca-certificates \
       unzip \
       wget
   
   WORKDIR /app
   
   # Download PocketBase
   RUN wget https://github.com/pocketbase/pocketbase/releases/download/v0.20.0/pocketbase_0.20.0_linux_amd64.zip \
       && unzip pocketbase_0.20.0_linux_amd64.zip \
       && chmod +x pocketbase
   
   EXPOSE 8090
   
   CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090"]
   ```

4. **Environment Variables:**
   - Railway generiert automatisch eine URL
   - Nutze diese für `VITE_POCKETBASE_URL`

---

## 📦 Option 3: Vercel (Alternative zu Netlify)

Gleicher Prozess wie Netlify, aber mit Vercel:
- https://vercel.com
- Import GitHub Repo
- Environment Variables setzen
- Deploy

---

## 🔧 Lokale Entwicklung

### **Dev Server starten:**

```bash
# Terminal 1: PocketBase
./pocketbase serve

# Terminal 2: React App
npm run dev
```

### **URLs:**
- Frontend: http://localhost:5174
- PocketBase: http://127.0.0.1:8090
- PocketBase Admin: http://127.0.0.1:8090/_/

---

## ⚙️ Environment Variables

### **Lokal (.env.local):**
```env
VITE_POCKETBASE_URL=http://127.0.0.1:8090
VITE_ADMIN_EMAIL=admin@spotmap.de
```

### **Production (Netlify/Vercel):**
```env
VITE_POCKETBASE_URL=https://your-pocketbase-url.pockethost.io
VITE_ADMIN_EMAIL=admin@spotmap.de
```

---

## 🎯 Empfohlene Lösung für dich:

**Netlify (Frontend) + PocketHost (Backend)**

**Warum?**
- ✅ Beide komplett kostenlos
- ✅ Einfaches Setup ohne Docker/Server-Management
- ✅ PocketHost managed PocketBase Updates automatisch
- ✅ SSL/HTTPS out-of-the-box
- ✅ Schnelles Deployment

**Nachteile:**
- PocketHost Free Tier: 1 Instance, 1GB Storage
- Bei mehr Traffic: Upgrade auf PocketHost Pro ($9/Monat)

---

## 📝 Deployment Checklist

- [ ] GitHub Repo erstellt und Code gepusht ✅
- [ ] PocketHost Account erstellt
- [ ] PocketBase Instance auf PocketHost deployed
- [ ] Collections in PocketBase erstellt
- [ ] Admin User in PocketBase angelegt
- [ ] Netlify Account erstellt
- [ ] Netlify mit GitHub verbunden
- [ ] Environment Variables in Netlify gesetzt
- [ ] CORS in PocketBase konfiguriert
- [ ] Erste Deployment getestet
- [ ] Custom Domain konfiguriert (optional)

---

## 🔗 Nützliche Links

- **Netlify Docs:** https://docs.netlify.com
- **PocketHost:** https://pockethost.io
- **PocketBase Docs:** https://pocketbase.io/docs
- **Railway:** https://railway.app

---

**Nächster Schritt:** Erstelle PocketHost Account und deploye PocketBase, dann Netlify für Frontend!
