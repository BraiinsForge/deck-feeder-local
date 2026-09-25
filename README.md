# deck-feeder-local

> [!WARNING]
> **This repository is deprecated.** Remote widgets have been superseded by WebAssembly widgets. See [bmc-main](https://github.com/BraiinsForge/bmc-main#widget-development) instead.

Self-hosted widget server for remote widgets on your Deck.

## Quick Start

### Prerequisites

- Docker and Docker Compose
- x86_64 Linux machine

### 1. Start the services

```bash
docker compose up -d
```

### 2. Push widgets to the database

```bash
docker compose exec api /usr/local/bin/push_templates \
  --widgets-dir /widgets \
  --db-host postgres \
  --db-port 5432 \
  --db-username deck_feeder \
  --db-password deck_feeder \
  --db-name deck_feeder \
  --migrations-dir /app/migrations \
  --device-prefs-file /sdk/v1/prefs.json5
```

### 3. Verify it works

```bash
# list available widgets
curl http://localhost:8080/

# render a widget
curl -X POST http://localhost:8080/weather/invoke \
  -H 'Content-Type: application/json' \
  -d '{"widget_version":"latest","size":"medium","params":{"location":"Prague"}}'
```

### 4. Connect your Deck

Point your Deck to your server's IP address on port 8080.

## Creating Widgets

See [DEVELOPMENT.md](DEVELOPMENT.md) for technical details and widget development guide.

The `widgets/weather/` directory contains an example weather widget you can use as a starting point.
