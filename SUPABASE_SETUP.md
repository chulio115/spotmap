# Supabase Setup Anleitung für SpotMap

## 1. Supabase Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com)
2. Klicke auf "Start your project"
3. Logge dich mit GitHub ein
4. Erstelle ein neues Projekt:
   - **Organization**: Wähle deine Organization oder erstelle eine neue
   - **Project Name**: `spotmap` (oder ein Name deiner Wahl)
   - **Database Password**: Wähle ein sicheres Passwort und speichere es
   - **Region**: Wähle eine Region nahe deiner Zielgruppe (z.B. `EU West`)
5. Warte bis das Projekt erstellt ist (ca. 1-2 Minuten)

## 2. Environment Variables konfigurieren

Nachdem das Projekt erstellt ist, gehe zu:

1. **Project Settings** → **API**
2. Kopiere die **Project URL** und den **anon public** Key
3. Öffne die `.env.local` Datei in deinem SpotMap Projekt und ersetze:
   ```env
   VITE_SUPABASE_URL=deine_supabase_url
   VITE_SUPABASE_ANON_KEY=dein_supabase_anon_key
   VITE_ADMIN_EMAIL=deine@email.de
   ```
   Mit den echten Werten von Supabase.

## 3. Datenbank-Migration ausführen

1. Gehe zum **SQL Editor** in deinem Supabase Dashboard
2. Kopiere den gesamten Inhalt von `supabase/migrations/001_init.sql`
3. **WICHTIG**: Ersetze in Zeile 18 `deine@email.de` mit deiner Admin-E-Mail (die gleiche wie in `.env.local`)
4. Führe das SQL aus

Die Migration erstellt:
- Alle Tabellen (`allowed_emails`, `spots`, `spot_photos`, `user_last_seen`)
- Row Level Security (RLS) Policies
- Storage Bucket für Fotos
- Helper Functions und Trigger

## 4. Auth Konfiguration

1. Gehe zu **Authentication** → **Settings**
2. Konfiguriere **Site URL**: `http://localhost:5173` (für Entwicklung)
3. Konfiguriere **Redirect URLs**: `http://localhost:5173` (für Entwicklung)
4. Stelle sicher dass **Enable email confirmations** **AUS** ist (für Magic Link)

## 5. Storage Bucket prüfen

1. Gehe zu **Storage**
2. Der Bucket `spot-photos` sollte automatisch erstellt worden sein
3. Klicke auf den Bucket und stelle sicher dass er **public** ist

## 6. Erste Test-E-Mail hinzufügen

1. Gehe zum **SQL Editor**
2. Führe dieses SQL aus um deine eigene E-Mail zur Allowlist hinzuzufügen:
   ```sql
   insert into allowed_emails (email, invited_by)
   values ('deine@email.de', 
     (select id from auth.users where email = 'deine@email.de' limit 1)
   );
   ```
   (Ersetze `deine@email.de` mit deiner Admin-E-Mail)

## 7. Testen

1. Starte die App: `npm run dev`
2. Öffne `http://localhost:5173`
3. Die App sollte jetzt funktionieren mit:
   - Leaflet-Karte mit Mock-Spots
   - Kategorie-Filter
   - Header mit Navigation
   - Feed-Ansicht

## 8. Deployment vorbereiten

Für späteres Deployment (Netlify):

1. Gehe zu **Project Settings** → **API**
2. Kopiere die **Project URL** und den **anon public** Key
3. In Netlify Environment Variables hinzufügen:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_EMAIL`
4. Gehe zu **Authentication** → **Settings**
5. Füge deine Netlify URL zu **Site URL** und **Redirect URLs** hinzu

## Troubleshooting

### "User not allowed" Fehler
- Überprüfe ob die E-Mail in der `allowed_emails` Tabelle steht
- Stelle sicher dass die RLS Policies korrekt konfiguriert sind

### "CORS" Fehler
- Überprüfe die Site URL in den Auth Settings
- Stelle sicher dass die Redirect URLs korrekt sind

### Storage Upload funktioniert nicht
- Überprüfe ob der `spot-photos` Bucket existiert und public ist
- Kontrolliere die RLS Policies für Storage

### Karte wird nicht angezeigt
- Überprüfe ob Leaflet CSS korrekt geladen wird
- Stelle sicher dass die Tailwind Konfiguration funktioniert

---

**Hinweis**: Für die Entwicklung kannst du alle SQL-Befehle direkt im Supabase SQL Editor ausführen. Für Production solltest du die Supabase CLI verwenden.
