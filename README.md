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

Unit-Tests mit `node:test` im selben Verzeichnis wie die zu testenden Units.
