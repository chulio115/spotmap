# 🔥 Firebase Setup für SpotMap

## Schritt-für-Schritt Anleitung

### 1. Firebase Projekt erstellen

1. **Gehe zur Firebase Console:**
   - https://console.firebase.google.com
   - Klicke auf "Projekt hinzufügen"

2. **Projekt konfigurieren:**
   - **Projektname:** `spotmap` (oder beliebig)
   - **Google Analytics:** Optional (kann aktiviert bleiben)
   - **Projekt erstellen** klicken

---

### 2. Web-App registrieren

1. **In der Projektübersicht:**
   - Klicke auf das **Web-Icon** (`</>`)
   - **App-Spitzname:** `SpotMap Web`
   - **Firebase Hosting:** Nicht aktivieren (wir nutzen Netlify)
   - **App registrieren** klicken

2. **Firebase SDK Config kopieren:**
   ```javascript
   const firebaseConfig = {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   };
   ```
   
3. **Config in .env.local eintragen:**
   ```env
   VITE_FIREBASE_API_KEY=dein-api-key
   VITE_FIREBASE_AUTH_DOMAIN=dein-projekt.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=dein-projekt-id
   VITE_FIREBASE_STORAGE_BUCKET=dein-projekt.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=deine-sender-id
   VITE_FIREBASE_APP_ID=deine-app-id
   VITE_ADMIN_EMAIL=admin@spotmap.de
   ```

---

### 3. Authentication aktivieren

1. **Im Firebase Menü:**
   - Gehe zu **Authentication** → **Get started**

2. **Email Link (Passwordless) aktivieren:**
   - Klicke auf **Sign-in method** Tab
   - Klicke auf **Email/Password**
   - **Aktiviere nur "Email link (passwordless sign-in)"**
   - **NICHT** "Email/Password" aktivieren!
   - **Speichern**

3. **Authorized Domains konfigurieren:**
   - Unter **Settings** → **Authorized domains**
   - Füge deine Netlify Domain hinzu: `your-app.netlify.app`
   - `localhost` ist bereits standardmäßig aktiviert

---

### 4. Firestore Datenbank erstellen

1. **Im Firebase Menü:**
   - Gehe zu **Firestore Database** → **Create database**

2. **Sicherheitsregeln wählen:**
   - Wähle **Production mode** (wir deployen eigene Rules)
   - **Next**

3. **Region wählen:**
   - **europe-west3** (Frankfurt) für DSGVO-Konformität
   - **Enable**

4. **Security Rules deployen:**
   - Gehe zu **Rules** Tab
   - Kopiere den Inhalt von `firestore.rules`
   - Ersetze die Standard-Rules
   - **Publish**

5. **Erste allowed_email manuell hinzufügen:**
   - Gehe zu **Data** Tab
   - Klicke **Start collection**
   - Collection ID: `allowed_emails`
   - Document ID: `admin@spotmap.de` (deine Admin-Email)
   - Felder hinzufügen:
     ```
     email: admin@spotmap.de (string)
     invitedBy: null (null)
     createdAt: [Timestamp] (timestamp - jetzt)
     ```
   - **Save**

---

### 5. Storage Bucket erstellen

1. **Im Firebase Menü:**
   - Gehe zu **Storage** → **Get started**

2. **Sicherheitsregeln:**
   - Wähle **Production mode**
   - **Next**

3. **Region wählen:**
   - **europe-west3** (Frankfurt)
   - **Done**

4. **Security Rules deployen:**
   - Gehe zu **Rules** Tab
   - Kopiere den Inhalt von `storage.rules`
   - Ersetze die Standard-Rules
   - **Publish**

---

### 6. Firebase Config Keys finden

**Alle Keys findest du hier:**
1. Gehe zu **Projekteinstellungen** (Zahnrad-Icon oben links)
2. Scrolle runter zu **Deine Apps**
3. Unter **SDK setup and configuration**
4. Wähle **Config** (nicht npm)
5. Kopiere alle Werte in deine `.env.local`

---

### 7. Lokale Entwicklung testen

```bash
# Environment Variables setzen (siehe .env.local)
# Dann:
npm run dev
```

**Test-Flow:**
1. Öffne http://localhost:5174
2. Gehe zu `/login`
3. Gib deine Admin-Email ein (die in allowed_emails ist)
4. Klicke "Magic Link senden"
5. Check deine E-Mail
6. Klicke auf den Link
7. Du solltest eingeloggt sein und zur Karte weitergeleitet werden

---

### 8. Production Deployment (Netlify)

1. **Netlify Environment Variables setzen:**
   - Gehe zu Netlify Dashboard → Site settings → Environment variables
   - Füge alle `VITE_FIREBASE_*` Variablen hinzu
   - **WICHTIG:** Gleiche Werte wie in `.env.local`

2. **Firebase Authorized Domains:**
   - Gehe zu Firebase Console → Authentication → Settings
   - Füge deine Netlify URL hinzu: `your-app.netlify.app`

3. **Firestore Security Rules prüfen:**
   - Admin-Email in `firestore.rules` muss mit `VITE_ADMIN_EMAIL` übereinstimmen

4. **Deploy!**
   ```bash
   git add .
   git commit -m "Switch to Firebase backend"
   git push origin main
   ```
   - Netlify deployed automatisch

---

## 🔧 Troubleshooting

### "Du wurdest noch nicht eingeladen"
- Prüfe ob deine Email in Firestore Collection `allowed_emails` existiert
- Document ID muss exakt die Email sein

### Magic Link kommt nicht an
- Check Spam-Ordner
- Prüfe Firebase Console → Authentication → Settings → Authorized domains
- Stelle sicher dass `localhost` und deine Netlify Domain gelistet sind

### "Permission denied" in Firestore
- Prüfe ob Security Rules korrekt deployed sind
- Prüfe ob User eingeloggt ist (`auth != null`)
- Admin-Email in Rules muss mit `.env.local` übereinstimmen

### CORS Fehler
- Stelle sicher dass deine Domain in Firebase Authorized Domains ist
- Prüfe ob `authDomain` in `.env.local` korrekt ist

---

## 📊 Firestore Collections Übersicht

```
/allowed_emails/{email}
  ├─ email: string
  ├─ invitedBy: string (uid)
  └─ createdAt: timestamp

/spots/{spotId}
  ├─ title: string
  ├─ description: string
  ├─ category: string
  ├─ lat: number
  ├─ lng: number
  ├─ createdBy: string (uid)
  ├─ createdByEmail: string
  └─ createdAt: timestamp

/spots/{spotId}/photos/{photoId}
  ├─ storagePath: string
  ├─ uploadedBy: string (uid)
  ├─ uploadedByEmail: string
  └─ createdAt: timestamp

/user_last_seen/{uid}
  └─ lastSeen: timestamp
```

---

## 🎯 Nächste Schritte

1. ✅ Firebase Projekt erstellt
2. ✅ Authentication aktiviert (Email Link)
3. ✅ Firestore Datenbank erstellt
4. ✅ Storage Bucket erstellt
5. ✅ Security Rules deployed
6. ✅ Erste allowed_email hinzugefügt
7. ✅ Config Keys in .env.local
8. ✅ Lokal getestet
9. ⏳ Netlify Environment Variables setzen
10. ⏳ Production Deployment

**Du bist bereit für den ersten Login!** 🚀
