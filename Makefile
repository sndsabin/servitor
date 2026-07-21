.PHONY: setup hooks fmt fmt_check dev build-windows build-linux build-mac clean help

WAILS_TAGS ?=

# setup app
setup:
	@make hooks
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Setup complete"

# configure git hooks
hooks:
	@echo "Configuring git hooks..."
	chmod +x .githooks/*
	git config core.hooksPath .githooks
	@echo "Git hooks enabled."

# format all code
fmt:
	@echo "Formatting Go..."
	gofmt -w .

	@echo "Formatting frontend..."
	cd frontend && npm run format

# check formatting
fmt_check:
	@echo "Checking Go formatting..."
	@test -z "$$(gofmt -l .)" || (echo "Go files are not formatted. Run 'make fmt'"; exit 1)

	@echo "Checking frontend formatting..."
	cd frontend && npm run format:check || (echo "Frontend files are not formatted. Run 'make fmt'"; exit 1)

	@echo "Formatting OK!"

# run the app in development mode
dev:
	@make setup
	wails dev $(WAILS_TAGS)

# build the app for windows
build-windows:
	wails build -platform windows/amd64

# build the app for linux
build-linux:
	wails build -platform linux/amd64 $(WAILS_TAGS)

# build the app for mac
build-mac:
	wails build -platform darwin/universal

# clean build artifacts
clean:
	rm -rf build/bin
	cd frontend && rm -rf dist

# help command
help:
	@echo "Available commands:"
	@echo "  make dev            Run the application in development mode"
	@echo "  make fmt            Format all go"
	@echo "  make build-windows  Build the app for Windows (64-bit)"
	@echo "  make build-linux    Build the app for Linux (64-bit)"
	@echo "  make build-mac      Build the app for macOS (universal)"
	@echo "  make clean          Clean build artifacts"

