# Detect Nix environment
nix_cmd := if env_var_or_default("IN_NIX_SHELL", "") != "" { "" } else { "nix develop --command" }

# Default recipe - show available commands
default:
    @just --list

# Start all services
start:
    {{nix_cmd}} docker compose up -d
    {{nix_cmd}} supabase start
    @echo "Infrastructure ready. Run 'just dev' to start Next.js"

dev:
    {{nix_cmd}} pnpm run dev

# Setup project
setup:
    {{nix_cmd}} supabase start
    {{nix_cmd}} npx tsx scripts/main.ts

# Stop all services
stop:
    {{nix_cmd}} docker compose down -v
    {{nix_cmd}} supabase stop
    -pkill -f "next dev"

# Reset everything
reset: stop start

# Install dependencies
install:
    {{nix_cmd}} pnpm install

# Database migrations
db-migrate:
    {{nix_cmd}} supabase db push

db-reset:
    {{nix_cmd}} supabase db reset
    sudo rm -rf ./minio-data/*
    {{nix_cmd}} docker compose restart minio create-buckets

db-seed:
    {{nix_cmd}} npx tsx scripts/main.ts 
