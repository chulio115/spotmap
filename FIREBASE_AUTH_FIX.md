# Firebase Auth Magic Link Fix

## Problem: Keine Email kommt an

### Schritt 1: Email Provider in Firebase aktivieren

1. Gehe zu **Firebase Console:** https://console.firebase.google.com
2. Wähle Projekt: **spotmap-72e40**
3. Klicke auf **Authentication** (linkes Menü)
4. Klicke auf **Sign-in method** (Tab oben)
5. Prüfe ob **Email/Password** aktiviert ist:
   - Falls nicht: Klicke auf "Email/Password"
   - Toggle **"Email link (passwordless sign-in)"** auf **AN**
   - Klicke **Save**

### Schritt 2: Action URL Template prüfen

1. Bleibe in **Authentication** → **Sign-in method**
2. Scrolle runter zu **"Authorized domains"**
3. Stelle sicher dass `spotmap115.netlify.app` dort ist (hast du schon gemacht ✓)
4. Klicke auf **Templates** (Tab oben, neben "Sign-in method")
5. Wähle **"Email address verification"** oder **"Email link sign-in"**
6. Prüfe die **Action URL** - sollte sein: `https://spotmap115.netlify.app`

### Schritt 3: SMTP Settings (falls nötig)

Firebase nutzt standardmäßig eigene Email-Server. Falls keine Emails ankommen:

1. In **Authentication** → **Templates**
2. Klicke auf **"Customize action URL"**
3. Stelle sicher dass die URL korrekt ist
4. Prüfe deinen **Spam-Ordner** in der Email

### Schritt 4: Test Email senden

1. Gehe zu deiner App: https://spotmap115.netlify.app
2. Trage deine Email ein: `juliusschulze@me.com`
3. Klicke "Magic Link senden"
4. Prüfe:
   - Browser Console auf Fehler
   - Email Posteingang (auch Spam)
   - Firebase Console → Authentication → Users (ob ein User angelegt wurde)

---

## Debugging Checklist

- [ ] Email/Password Provider ist aktiviert
- [ ] "Email link (passwordless sign-in)" ist AN
- [ ] `spotmap115.netlify.app` ist in Authorized domains
- [ ] Action URL in Templates ist korrekt
- [ ] Email ist in `allowed_emails` Collection in Firestore
- [ ] Spam-Ordner gecheckt
- [ ] Browser Console zeigt keinen Auth-Fehler mehr

---

## Häufige Probleme

### "Domain not allowlisted"
→ `spotmap115.netlify.app` zu Authorized domains hinzufügen

### "Email not sent"
→ Prüfe ob Email Provider aktiviert ist
→ Prüfe Spam-Ordner
→ Warte 1-2 Minuten (manchmal verzögert)

### "User not allowed"
→ Email muss in Firestore `allowed_emails` Collection sein
→ Prüfe in Firebase Console → Firestore Database
