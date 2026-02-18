# DerBot

Clean Architecture TypeScript Application mit Backend (NodeJS) und Frontend (Native HTML5).

## Projektstruktur

```
DerBot/
├── backend/
│   ├── Application/     # View, Controlling, DI Container
│   ├── Core/           # Business-Logik, UseCases, Entities
│   └── Infrastructure/ # Implementierung von Clients & Storages
├── frontend/
│   ├── Application/    # View, Controlling, Adapter
│   ├── Core/          # Business-Logik
│   └── Infrastructure/
├── build/
│   ├── backend/       # Kompilierte Backend-Dateien
│   └── frontend/      # Kompilierte Frontend-Dateien
└── package.json
```

## Setup

```bash
# Dependencies installieren
npm install

# Projekt kompilieren
npm run build

# Backend starten
npm start

# Development Mode (Watch + Start)
npm run dev

# Tests ausführen
npm test
```

## TOTP-Login Feature

DerBot implementiert ein sicheres TOTP (Time-based One-Time Password) Authentication System.

### Features

- **Benutzerregistrierung** mit eindeutigem Nickname (3-20 Zeichen, alphanumerisch + Unterstrich)
- **QR-Code Generierung** für Google Authenticator/Authy
- **TOTP-only Login** - Identifikation nur via 6-stelligem Code (kein Nickname erforderlich)
- **Zeitfenster** 30s mit ±1 Toleranz (±30s Genauigkeit)
- **Session Management** mit 7 Tagen Gültigkeit (localStorage)
- **Session-Wiederverwendung** - Ein User kann nur eine aktive Session haben
- **Rate Limiting** (5 Login-Versuche pro Minute global)
- **Logout-Funktion** mit Session-Bereinigung

## Chat Feature

DerBot bietet eine Chat-Ansicht mit Session-Management und einem technischen Agenten-Log.

### Features

- **Neuer Chat** erzeugt eine neue Session-ID
- **Chat-Liste** zentral mit mehrzeiligem Eingabefeld und Senden-Button
- **Strg+Enter** sendet eine Nachricht, Enter erzeugt eine neue Zeile
- **Agent Log** rechts sichtbar (nur Desktop ab 1024px)
- **Rudimentaeres Markdown** (bold, italic, inline code, links)
- **Chat-State** im Frontend Storage (In-Memory)

### Frontend Nutzung

1. **Server starten**: `npm start`
2. **Browser öffnen**: `http://localhost:8000`
3. **Registrierung**:
   - Nickname eingeben (z.B. "myuser")
   - QR-Code mit Google Authenticator scannen
   - Oder Secret manuell in Authenticator-App eingeben
4. **Login**:
   - **6 separate Eingabefelder** für den TOTP-Code
   - **Auto-Focus**: Nach Eingabe einer Ziffer springt der Cursor automatisch zum nächsten Feld
   - **Backspace**: Löscht Ziffer und springt zum vorherigen Feld
   - **Paste-Funktion**: Einfügen (Strg+V) eines 6-stelligen Codes füllt alle Felder automatisch
   - **Auto-Submit**: Nach Eingabe der 6. Ziffer wird der Login automatisch ausgelöst
   - System identifiziert User automatisch anhand des Codes
   - Bei Fehler: Felder werden rot markiert, nach 1 Sekunde geleert und Focus wird auf erstes Feld gesetzt
5. **Nach erfolgreicher Anmeldung**: 
   - Nickname wird angezeigt
   - Session bleibt 7 Tage aktiv

### API Endpoints

```bash
# Registrierung
POST /api/auth/register
Body: { "nickname": "myuser" }
Response: { "secret": "...", "qrCodeDataUrl": "data:image/png;base64,..." }

# Login (TOTP-only, ohne Nickname)
POST /api/auth/login
Body: { "totp": "123456" }
Response: { "token": "...", "nickname": "myuser", "expiresAt": "2026-02-24T..." }

# Logout
POST /api/auth/logout
Body: { "token": "..." }
Response: { "success": true }

# Session verifizieren
GET /api/auth/verify
Header: Authorization: Bearer <token>
Response: { "valid": true, "nickname": "myuser" }

# Chat session erstellen
POST /api/chat/session
Response: { "sessionId": "...", "createdAt": "2026-02-18T..." }

# Chat sessions listen
GET /api/chat/sessions
Response: { "sessions": [{ "id": "...", "createdAt": "..." }] }

# Chat session laden
GET /api/chat/session?sessionId=<id>
Response: { "messages": [...], "agentLogs": [...] }

# Nachricht senden
POST /api/chat/message
Body: { "sessionId": "...", "content": "..." }
Response: { "message": {...}, "agentMessage": {...}, "agentLogs": [...] }
```

### Datenspeicherung

Benutzerdaten werden in `.data/` gespeichert:
- `.data/users.json` - Benutzer mit TOTP-Secrets
- `.data/sessions.json` - Aktive Sessions (max. eine pro User)

⚠️ **Hinweis**: Dateibasierte Speicherung nur für Entwicklung/Prototypen. Für Produktion sollte eine persistente Datenbank verwendet werden.

### TOTP-Spezifikation

- **Standard**: RFC 6238
- **Algorithm**: SHA-1
- **Zeitfenster**: 30 Sekunden
- **Digits**: 6
- **Toleranz**: ±1 Zeitfenster (90s gesamt)
- **QR-Format**: `otpauth://totp/DerBot:{Nickname}?secret={Base32Secret}&issuer=DerBot`

### Sicherheit

- TOTP-Secrets werden nur im Backend gespeichert (nie im Frontend)
- Rate-Limiting verhindert Brute-Force-Angriffe
- Sessions werden automatisch nach Ablauf gelöscht
- Für Produktion: HTTPS verwenden (zwingend erforderlich)

## Architektur-Prinzipien

- **Clean Code** nach Robert C. Martin
- **Domain-Driven Design (DDD)** nach Eric Evans
- **Clean Architecture** mit Separation of Concerns
- **SOLID-Prinzipien** mit Dependency Injection
- Keine Frameworks - Native TypeScript/HTML5

## Komponenten

### Backend
- **Container**: Dependency Injection
- **Controller**: Startet Control-Logik
- **Handler**: Control-Logik für Aktionen
- **UseCase**: Business-Logik
- **Service**: Wiederverwendbare Business-Logik
- **Entity**: Domänen-Datenobjekte

### Frontend
- **View**: Native HTML5 UI (keine Frameworks)
- **Controller**: Initialisiert Handler
- **Handler**: Control-Logik
- **Adapter**: Callback-Verbindung View ↔ Handler
- **Presenter**: Restrukturiert Daten für View

## Tests

Unit-Tests mit `tsx --test` für vollständige TypeScript-Unterstützung (84 Tests):

```bash
# Alle Tests ausführen
npm test

# Test-Übersicht:
# - Backend (32 Tests):
#   - ChatController (3)
#   - RateLimitService (4)
#   - TotpService (5)
#   - UserAuthenticationUseCase (12)
#   - ChatUseCase (4)
#   - DummyAIChatClient (1)
#   - FileChatStorage (3)
# - Frontend (52 Tests):
#   - ChatController (2)
#   - ChatHandler (2)
#   - ChatPresenter (1)
#   - MemoryChatStateStorage (1)
#   - BrowserLocalStorage (12)
#   - UserAuthenticationUseCase (12)
#   - ChatUseCase (4)
#   - Ajax (13)
#   - Chat Ajax (5)
```

### Test-Konfiguration

- **Test Runner**: `tsx` (TypeScript Executor mit ESM-Unterstützung)
- **Framework**: `node:test` (Native Node.js Test API)
- **Locations**: Test-Dateien liegen neben Produktions-Code
- **Pattern**: Class-basierte Mocks (keine externe Mocking-Bibliothek)
- **Coverage**: Alle Klassen außer Views getestet


