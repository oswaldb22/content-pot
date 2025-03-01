# Content Pot

Content Pot allows you to add consumable content to your pot easily.
You can browse, bookmark, and save content for later reading.
Content is stored locally in your browser's local storage, ensuring quick access and offline capabilities.

Everything is free and open source. No credit required.

## Features

- Add consumable content to your pot.
- Easily bookmark and save content for later.
- Add content via /add/URL endpoint for quick submissions.
- Export content list for backup or sharing.
- Additional features: category filtering, search functionality, and reading time estimation (planned roadmap).

## Installation

### Using pnpm

```bash
# Install dependencies
pnpm install

# Run development server
pnpm run dev

# Build for production
pnpm run build
```

### Using Docker

The application can be run as a Docker container.

#### Build the Docker image

```bash
docker build -t content-pot .
```

#### Run the Docker container

```bash
docker run -p 8080:80 content-pot
```

This will start the application and make it available at http://localhost:8080

#### Docker Compose

```bash
docker-compose up -d
```

## Roadmap

- [ ] Add category filter
- [ ] Add search functionality
- [ ] Add reading time estimation
