![Servitor Banner](docs/servitor-banner.png)

# Servitor

Servitor makes it easy to spin up common development services as Docker containers. Run MySQL, MariaDB, PostgreSQL, Redis, RabbitMQ, and other services without manually installing, configuring, or managing them.

Choose the version you need, start the service, and get back to building.

![Servitor Demo](docs/servitor-demo.gif)

## Getting Started

### Prerequisites

Before using Servitor, ensure you have:

- Docker installed and running
  - macOS: [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)
  - Windows: [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
  - Linux: [Docker Engine](https://docs.docker.com/engine/install/)

### Installation

1. Download the latest release of Servitor for your operating system.
2. Launch the application.
3. Select a service, choose a version, and start it.

> ## ⚠️ First-Launch Security Warnings (Unsigned Release)
>
> Because current releases are unsigned, your operating system might show a security warning when opening the application for the first time.
>
> ---
>
> ### macOS (`.dmg`)
>
> macOS may block the app with a message stating it _“cannot be opened because it is from an unidentified developer.”_
>
> **How to run:**
>
> 1. Open **System Settings** $\rightarrow$ **Privacy & Security**.
> 2. Scroll down to the **Security** section.
> 3. Locate the notification for `Servitor` and click **Open Anyway**.
> 4. Enter your system password or use Touch ID to confirm.
>
> **Official Apple Guide:** [Open a Mac app from an unidentified developer](https://support.apple.com/guide/mac-help/open-a-mac-app-from-an-unidentified-developer-mh40616/mac)
>
> ---
>
> ### Windows (`.exe`)
>
> Windows Defender SmartScreen may show a blue window stating _“Windows protected your PC.”_
>
> **How to run:**
>
> 1. Click the **"More info"** link inside the blue window.
> 2. Click the **"Run anyway"** button that appears.

## Tech Stack

Servitor is built with:

- [Go](https://go.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [Wails v2](https://wails.io/)

## Local Development

### Clone the repository

```bash
git clone https://github.com/sndsabin/servitor
cd servitor
```

### Run the application

```bash
make dev
```

This starts the application in development mode with live reloading for both the Go backend and the frontend.

> Note: On newer Linux distributions, you may need to pass the `webkit2_41` build tag:
>
> ```bash
> make dev WAILS_TAGS="-tags webkit2_41"
> ```

### Build commands

```bash
# Build app for Windows
make build-windows

# Build app for Linux
make build-linux

# Build app for macOS
make build-mac
```

For newer Linux environments:

```bash
make build-linux WAILS_TAGS="-tags webkit2_41"
```

## Contributing

Contributions, feature requests, and bug reports are welcome. Feel free to open an issue or submit a pull request.

## License

See the `LICENSE` file for details.

---

## Inspiration

Servitor is inspired by [Takeout](https://github.com/tighten/takeout) and serves as a GUI alternative for managing local development services with Docker.
