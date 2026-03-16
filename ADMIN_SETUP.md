# Admin Setup - illexthemaniac@gmail.com

## ✅ Was bereits gemacht wurde:

1. ✅ `.env.local` - Admin Email geändert auf `illexthemaniac@gmail.com`
2. ✅ `firestore.rules` - Admin-Check aktualisiert auf neue Email
3. ✅ Google Sign-In implementiert

---

## 🔧 Was du jetzt in Firebase machen musst:

### 1. Firestore Rules deployen

Die neuen Rules sind lokal gespeichert, müssen aber zu Firebase hochgeladen werden:

1. Gehe zu **Firebase Console:** https://console.firebase.google.com
2. Projekt **spotmap-72e40** auswählen
3. **Firestore Database** (linkes Menü)
4. Klicke auf **"Rules"** (Tab oben)
5. Ersetze den kompletten Inhalt mit:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Nur eingeloggte User dürfen Spots lesen/schreiben
    match /spots/{spotId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.createdBy == request.auth.uid;

      match /photos/{photoId} {
        allow read: if request.auth != null;
        allow create: if request.auth != null;
        allow delete: if request.auth != null && 
          resource.data.uploadedBy == request.auth.uid;
      }
    }

    // Nur Admin darf allowed_emails schreiben, alle eingeloggten User dürfen lesen
    match /allowed_emails/{email} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.email == 'illexthemaniac@gmail.com';
    }

    // Jeder User darf nur seinen eigenen last_seen Eintrag schreiben
    match /user_last_seen/{uid} {
      allow read, write: if request.auth != null && 
        request.auth.uid == uid;
    }
  }
}
```

6. Klicke **"Publish"**

---

### 2. Deine Email zur Allowlist hinzufügen

1. Bleibe in **Firestore Database**
2. Klicke auf **"Data"** (Tab)
3. Finde die Collection **`allowed_emails`**
4. Klicke **"Add document"**
5. **Document ID:** `illexthemaniac@gmail.com`
6. **Field:** `createdAt` → Type: `timestamp` → Value: (jetzt/now)
7. **Field:** `invitedBy` → Type: `string` → Value: `admin`
8. Klicke **"Save"**

---

### 3. Netlify Environment Variable aktualisieren

1. Gehe zu **Netlify Dashboard:** https://app.netlify.com
2. Wähle dein **spotmap** Projekt
3. **Site configuration** → **Environment variables**
4. Finde `VITE_ADMIN_EMAIL`
5. Klicke auf **Edit**
6. Ändere Value zu: `illexthemaniac@gmail.com`
7. **Save**
8. **Trigger deploy** → **Deploy site**

---

## 📧 Admin Panel - Einladungen versenden

Das Admin Panel kann bereits Emails zur Allowlist hinzufügen!

**So funktioniert es:**

1. Logge dich mit `illexthemaniac@gmail.com` ein (Google Sign-In)
2. Klicke auf das **⚙️ Settings Icon** im Header
3. Du siehst das **Admin Panel**
4. Gib eine Email-Adresse ein
5. Klicke **"Email hinzufügen"**
6. Die Email wird zur `allowed_emails` Collection hinzugefügt
7. Der User kann sich dann mit Google oder Magic Link einloggen

**Wichtig:** Der User muss sich selbst einloggen (Google oder Magic Link). Das Admin Panel fügt nur die Email zur Allowlist hinzu, versendet aber keine Einladungs-Email.

---

## 🎯 Nächste Schritte (optional):

Falls du möchtest, dass das Admin Panel automatisch Einladungs-Emails versendet:

1. Firebase Functions einrichten (kostet nichts im Spark Plan für kleine Nutzung)
2. Funktion schreibt: Wenn Email zu `allowed_emails` hinzugefügt wird → Email versenden
3. Email enthält Link zur App + Anleitung

**Für jetzt:** User einfach manuell den Link zur App schicken: `https://spotmap115.netlify.app`

---

## ✅ Checklist

- [ ] Firestore Rules deployed mit neuer Admin-Email
- [ ] `illexthemaniac@gmail.com` in `allowed_emails` Collection
- [ ] Netlify Environment Variable `VITE_ADMIN_EMAIL` aktualisiert
- [ ] Netlify neu deployed
- [ ] Mit Google eingeloggt und Admin Panel getestet
