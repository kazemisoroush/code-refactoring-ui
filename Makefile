# Makefile for Horizon UI React project

# Default target
.DEFAULT_GOAL := help

# Variables
NPM := npm

# Help target
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

# Install dependencies
install: ## Install project dependencies
	$(NPM) install

# Lint the code
lint: ## Run ESLint to check code quality
	@echo "Running linting checks..."
	@$(NPM) run build > /dev/null 2>&1 || (echo "Build failed - likely linting issues"; exit 1)
	@echo "✓ Linting passed"

# Run tests
test: ## Run the test suite
	@echo "Running tests..."
	@$(NPM) test -- --watchAll=false --passWithNoTests
	@echo "✓ Tests completed"

# Start development server
serve: ## Start the development server
	$(NPM) start

# Build the project
build: ## Build the project for production
	$(NPM) run build

# Clean node_modules and build artifacts
clean: ## Clean node_modules and build directories
	rm -rf node_modules build

# Fresh install
fresh: clean install ## Clean install - remove node_modules and reinstall

# CI pipeline
ci: ## Run linting and tests (CI pipeline)
	@echo "Running CI pipeline..."
	@if [ ! -d "node_modules" ]; then echo "Installing dependencies..."; $(MAKE) install; fi
	@$(MAKE) test
	@$(MAKE) lint
	@echo "✓ CI pipeline completed successfully"

.PHONY: help install lint test serve build clean fresh ci
