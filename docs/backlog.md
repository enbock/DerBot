# Product Backlog: TOTP-Login Feature

## Epic: Login per TOTP-Code mit Session-Management

**Erstellt:** 2026-02-17  
**Status:** ✅ Vollständig Abgeschlossen (inkl. alle Bugfixes & UX-Verbesserungen)

---

## User Story 1: Benutzerregistrierung mit Nickname
**Als** neuer Benutzer  
**möchte ich** mich mit einem Nickname registrieren  
**damit** ich ein Konto für den Login erstellen kann.

### Akzeptanzkriterien
- [x] UI zeigt Registrierungsformular mit Eingabefeld für Nickname
- [x] Nickname muss eindeutig sein (keine Duplikate)
- [x] Nickname-Validierung: 3-20 Zeichen, alphanumerisch + Unterstrich
- [x] Backend generiert TOTP-Secret (Base32-kodiert)
- [x] Backend speichert Benutzerdaten in `.data/users.json` (oder separate Dateien)
- [x] Dateiformat: `{ "nickname": "...", "secret": "...", "createdAt": "..." }`

---

## User Story 2: QR-Code für Google Authenticator
**Als** registrierter Benutzer  
**möchte ich** einen QR-Code erhalten  
**damit** ich meinen Account in Google Authenticator einrichten kann.

### Akzeptanzkriterien
- [x] Nach erfolgreicher Registrierung wird QR-Code angezeigt
- [x] QR-Code enthält URI: `otpauth://totp/DerBot:{Nickname}?secret={Base32Secret}&issuer=DerBot`
- [x] Secret ist Base32-kodiert (RFC 4648)
- [x] TOTP-Parameter: SHA-1, 30s Zeitfenster, 6 Digits (RFC 6238)
- [x] QR-Code mit Bibliothek (z.B. qrcode.js) generieren
- [x] Optional: Secret auch als Text anzeigen zum manuellen Eintragen

---

## User Story 3: Login mit 6-stelligem TOTP-Code
**Als** registrierter Benutzer  
**möchte ich** mich mit meinem Nickname und TOTP-Code einloggen  
**damit** ich eine authentifizierte Sitzung starten kann.

### Akzeptanzkriterien
- [x] Login-UI mit Feldern für Nickname + 6-stelliger TOTP-Code
- [x] Backend validiert TOTP-Code gegen gespeichertes Secret
- [x] TOTP-Validierung: 30s Zeitfenster, erlaubt ±1 Zeitfenster (90s Toleranz)
- [x] Bei erfolgreichem Login: Session-Token generieren (z.B. UUID v4)
- [x] Session-Token wird an Frontend zurückgegeben
- [x] Fehlermeldung bei ungültigem Code oder unbekanntem Nickname

---

## User Story 4: Session-Persistierung im Browser
**Als** eingeloggter Benutzer  
**möchte ich** nach einem Reload weiterhin eingeloggt bleiben  
**damit** ich nicht jedes Mal neu einloggen muss.

### Akzeptanzkriterien
- [x] Session-Token wird im `localStorage` gespeichert
- [x] Schlüssel: `derbot_session` (Objekt mit `token`, `nickname`, `expiresAt`)
- [x] Gültigkeitsdauer: 7 Tage ab Login
- [x] Bei jedem App-Start: Prüfung ob gültiger Token vorhanden
- [x] Wenn Token vorhanden und gültig: Automatischer Login (ohne TOTP)
- [x] Wenn Token abgelaufen: Entfernen aus localStorage, Weiterleitung zu Login
- [x] Backend speichert aktive Sessions in `.data/sessions.json`

---

## User Story 5: Rate-Limiting für Login-Versuche
**Als** System  
**möchte ich** Login-Versuche limitieren  
**damit** Brute-Force-Angriffe verhindert werden.

### Akzeptanzkriterien
- [x] Maximale Anzahl: 5 Login-Versuche pro Nickname pro Minute
- [x] Speicherung der Versuche: In-Memory (Map mit Nickname → Array von Timestamps)
- [x] Nach 5 Fehlversuchen: Fehlermeldung "Zu viele Versuche, bitte warten"
- [x] Cleanup: Versuche älter als 1 Minute werden automatisch entfernt
- [x] Tracker wird bei erfolgreichem Login zurückgesetzt

---

## User Story 6: Logout-Funktion
**Als** eingeloggter Benutzer  
**möchte ich** mich ausloggen  
**damit** meine Session beendet wird.

### Akzeptanzkriterien
- [x] UI zeigt Logout-Button (nach erfolgreichem Login sichtbar)
- [x] Beim Logout: Entfernen des Tokens aus `localStorage`
- [x] Backend entfernt Session aus `.data/sessions.json`
- [x] Nach Logout: Weiterleitung zur Login-Seite
- [x] Bestätigungsmeldung "Erfolgreich ausgeloggt"

---

## Technische Anforderungen

### Backend (TypeScript/Node.js)
- **TOTP-Bibliothek:** `otplib` oder `speakeasy`
- **QR-Code Generierung:** `qrcode` (Node-Variante für Base64-Data-URL)
- **Datenspeicherung:** `.data/users.json` und `.data/sessions.json`
- **Endpoints:**
  - `POST /api/auth/register` → { nickname } → { secret, qrCodeDataUrl }
  - `POST /api/auth/login` → { nickname, totp } → { token, expiresAt }
  - `POST /api/auth/logout` → { token } → { success }
  - `GET /api/auth/verify` → { token } → { valid, nickname }

### Frontend (TypeScript)
- **QR-Code Anzeige:** `<img>` mit Data-URL vom Backend
- **localStorage:** Session-Objekt speichern/laden
- **UI-States:** Registration, Login, Authenticated
- **Error-Handling:** Fehlermeldungen für ungültige Codes, Rate-Limiting, etc.

### Dateistruktur `.data/`
```
.data/
  users.json      → [{ "nickname": "...", "secret": "...", "createdAt": "..." }, ...]
  sessions.json   → [{ "token": "...", "nickname": "...", "createdAt": "...", "expiresAt": "..." }, ...]
```

---

## Hinweise zur Sicherheit
⚠️ **Prototyp-Warnung:** Die dateibasierte Speicherung ist nur für Entwicklung/Prototypen geeignet. Für Produktion sollte eine persistente Datenbank (SQLite, PostgreSQL, MongoDB) verwendet werden.

- TOTP-Secrets niemals im Frontend speichern (nur im Backend)
- Sessions regelmäßig bereinigen (Cleanup-Job für abgelaufene Sessions)
- HTTPS verwenden (in Produktion zwingend erforderlich)
- Optional: CSRF-Protection für Token-basierte Endpoints

---

## Definition of Done
- [x] Alle Akzeptanzkriterien sind erfüllt
- [x] Code ist getestet (manuelle Tests mit Google Authenticator)
- [x] `.data/` Verzeichnis wird automatisch erstellt, wenn nicht vorhanden
- [x] README.md enthält Anleitung zur Nutzung des Login-Features
- [x] Keine Secrets oder Tokens im Code hardcoded

---

## 🔄 Änderungen und Bugfixes (2026-02-17)

### ✅ Bug: Login funktioniert nicht (BEHOBEN)
**Problem:** Nach Registrierung schlägt Login fehl mit "Invalid nickname or TOTP code"  
**Root-Cause:** TotpService benötigte explizites Zeitfenster `window: 1`
- [x] Root-Cause-Analyse durchgeführt
- [x] Login-Flow debugged (TOTP-Validierung, User-Lookup)
- [x] Bug behoben und getestet

### Änderung 1: Login nur mit TOTP-Code
**Als** Benutzer  
**möchte ich** mich nur mit dem 6-stelligen TOTP-Code einloggen  
**damit** ich keinen Nickname eingeben muss.

#### Akzeptanzkriterien
- [x] Login-UI zeigt nur Eingabefeld für TOTP-Code (kein Nickname-Feld)
- [x] Backend durchsucht alle User und prüft TOTP-Code gegen alle Secrets
- [x] Bei erfolgreichem Match: User wird identifiziert und Session erstellt
- [x] Fehlermeldung "Invalid TOTP code" wenn kein Match gefunden
- [x] Rate-Limiting: 5 Versuche pro Minute (global, nicht pro Nickname)

**Technisch:**
- Endpoint: `POST /api/auth/login` → `{ totp }` → `{ token, nickname, expiresAt }`
- Loop durch alle User, validiere TOTP-Code für jeden bis Match oder Ende
- Sicherheitshinweis: Timing-Attacken vermeiden (konstante Antwortzeit)

### Änderung 2: Eine Session pro User
**Als** System  
**möchte ich** dass jeder User nur eine aktive Session haben kann  
**damit** bei erneutem Login die bestehende Session wiederverwendet wird.

#### Akzeptanzkriterien
- [x] Vor Erstellung einer neuen Session: Prüfung ob User bereits Session hat
- [x] Wenn aktive Session vorhanden und gültig: Session wiederverwenden
- [x] Wenn aktive Session abgelaufen: Alte Session entfernen, neue erstellen
- [x] Bei Logout: Session wird entfernt (wie bisher)
- [x] `sessions.json` enthält max. eine Session pro User (eindeutige Nickname-Constraint)

**Technisch:**
- SessionStorage: `findByNickname(nickname): Session | null`
- LoginUseCase: Vor `createSession()` → `findByNickname()` aufrufen
- Wenn gefunden und gültig: Bestehende Session zurückgeben
- Wenn gefunden und abgelaufen: `deleteSession()` → neue Session erstellen

### Änderung 3: localStorage-Speicherung
**Hinweis:** localStorage-Problem war Folge des Login-Bugs (wie vermutet).  

- [x] Nach Bugfix: Verifiziert dass Session in localStorage gespeichert wird
- [x] Key: `derbot_session` mit `{ token, nickname, expiresAt }`
- [x] Bei Reload: Session wird aus localStorage geladen und validiert

---

### Änderung 4: 6-stellige Eingabefelder für TOTP-Code (UX-Verbesserung)
**Als** Benutzer  
**möchte ich** den TOTP-Code in 6 separate Felder eingeben  
**damit** die Eingabe intuitiver und fehlerfreier ist (wie bei üblichen 2FA-Anwendungen).

#### Akzeptanzkriterien
- [x] Login-View zeigt 6 einzelne Input-Felder (jeweils 1 Ziffer)
- [ ] Registrierungs-View (optional) zeigt ebenfalls 6 Felder nach QR-Code
- [x] Auto-Focus: Nach Eingabe einer Ziffer springt Cursor zum nächsten Feld
- [x] Backspace: Löscht aktuelle Ziffer und springt zum vorherigen Feld
- [x] Paste-Funktion: Einfügen eines 6-stelligen Codes füllt alle Felder automatisch
- [x] Nach Eingabe der 6. Ziffer: Automatisches Absenden des Logins (optional)
- [x] Visuelle Hervorhebung: Aktives Feld ist deutlich gekennzeichnet
- [x] Mobile-optimiert: Touch-freundliche Feldgröße (min. 44x44px)
- [x] Error-Handling: Bei Fehler werden Felder rot markiert und nach 1s geleert

**Technisch:**
- 6 `<input type="text" maxlength="1" pattern="[0-9]" inputmode="numeric">` Felder
- JavaScript Event-Listener: `input`, `keydown`, `paste`, `focus`
- CSS: Feld-Styling mit Focus-States, Error-States und Shake-Animation
- TOTP-Code zusammensetzen aus den 6 Werten vor Submit
- Nur numerische Eingaben erlauben (andere Zeichen werden ignoriert)

**Status:** ✅ Abgeschlossen (2026-02-17)

---

# Product Backlog: Chat mit User Feature

## Epic: Chat-UI mit AIChatClient-Synchronisation (Dummy-Backend)

**Erstellt:** 2026-02-18  
**Status:** ✅ Vollständig Abgeschlossen

---

## User Story 1: Chat-Session starten und verwalten
**Als** Benutzer  
**möchte ich** einen neuen Chat starten  
**damit** ich eine frische Unterhaltung beginnen kann.

### Akzeptanzkriterien
- [x] UI zeigt Button "Neuer Chat"
### Technische Architektur
- [x] Handler verwaltet keinen View-State (State kommt aus UseCase)
- [x] Presenter erzeugt View-Model
- [x] Domain-Controller initialisiert Handler
- [x] Klick auf "Neuer Chat" erzeugt eine neue Chat-Session-ID
- [x] Neue Session wird im Frontend als aktueller Chat gesetzt
- [x] Session wird an das Backend gesendet und dort synchronisiert (Dummy-Implementierung)

---

## User Story 2: Chat-Nachrichten senden und anzeigen
**Als** Benutzer  
**möchte ich** Nachrichten im Chat senden und lesen  
**damit** ich eine Unterhaltung mit dem System führen kann.

### Akzeptanzkriterien
- [x] UI zeigt Chat-Liste zentral in der Seite
- [x] Unter der Chat-Liste befindet sich ein mehrzeiliges Eingabefeld
- [x] Nachricht wird mit Strg+Enter gesendet
- [x] Button "Senden" sendet die Nachricht ebenfalls
- [x] Gesendete Nachricht erscheint sofort in der Chat-Liste
- [x] Backend speichert/synchronisiert Nachrichten mit AIChatClient (Dummy-Implementierung)

---

## User Story 3: Agenten-Protokoll anzeigen (technische Einsicht)
**Als** Benutzer  
**möchte ich** das Protokoll von Agent und Subagenten sehen  
**damit** ich nachvollziehen kann, was intern passiert.

### Akzeptanzkriterien
- [x] UI zeigt eine zweite Liste rechts neben der Chat-Liste (nur Desktop)
- [x] Die Liste zeigt das Agenten-/Subagenten-Protokoll aus dem AIChatClient
- [x] Auf mobilen Ansichten wird die Protokoll-Liste ausgeblendet
- [x] Protokoll ist nur für die aktuelle Session sichtbar

---

## User Story 4: Rudimentäres Markdown-Rendering im Chat
**Als** Benutzer  
**möchte ich** einfache Formatierungen im Chat sehen  
**damit** Inhalte besser lesbar sind.

### Akzeptanzkriterien
- [x] Chat-Liste rendert rudimentäres Markdown (z.B. **bold**, *italic*, `inline code`, Links)
- [x] Keine zusätzliche Markdown-Library wird verwendet
- [x] Rendering ist robust gegen leere oder unvollständige Eingaben

---

## Technische Anforderungen

### Backend (TypeScript/Node.js)
- Dummy-Infrastruktur für AIChatClient (keine externe API)
- Endpoints nach bestehenden Patterns im Backend
- Sync von Chat-Session und Messages an die Dummy-Infrastruktur

### Frontend (TypeScript/HTML/CSS)
- Chat-Layout: zentrale Chat-Liste, Eingabe darunter
- Rechte Protokoll-Liste nur ab 1024px Breite sichtbar
- Buttons: "Neuer Chat" und "Senden"
- Strg+Enter sendet die Nachricht; Enter ohne Strg fügt neue Zeile ein
- Rudimentäres Markdown-Rendering ohne externe Library

---

## Definition of Done
- [x] Alle Akzeptanzkriterien erfüllt
- [x] UI funktioniert auf Desktop und Mobile
- [x] Dummy-Backend läuft ohne externe Abhängigkeiten
- [x] Dokumentation in README.md aktualisiert (Kurzbeschreibung der Chat-Funktion)
