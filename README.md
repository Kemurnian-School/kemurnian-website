# Kemurnian School Website - Documentation

This document provides a technical overview of the Kemurnian School web application, focusing on its architecture, data flow, and caching strategies.

---

## Core Technologies

-   **Framework**: Next.js (App Router)
-   **Language**: TypeScript
-   **Backend-as-a-Service**: Supabase (PostgreSQL, Auth)
-   **File Storage**: Cloudflare R2 (S3-compatible object storage)
-   **Package Manager**: pnpm

---

## Application Architecture & Logic Flow

The application is a monolith built with Next.js, logically separated into two main parts using Route Groups: the public-facing website `app/(main)` and the admin panel `app|(admin)`.

### 1. Request Lifecycle & Middleware (`middleware.ts`)

All incoming requests are first processed by the `middleware.ts` file, which is responsible for routing and authentication based on the request's hostname.

-   **Subdomain Detection**: The middleware inspects the `host` header to differentiate between the public domain (e.g., `localhost:3000`) and the admin subdomain (e.g., `admin.localhost:3000`).
-   **URL Rewriting**:
    -   If a request hits the admin subdomain, the path is rewritten to correctly serve the admin panel UI. For example, `admin.localhost:3000/` is rewritten to `/admin`.
    -   This isolates the admin panel to a specific subdomain without exposing the `/admin` path on the main site.
-   **Authentication & Authorization**:
    -   A Supabase SSR client is instantiated within the middleware, using cookies from the request to determine the user's authentication state.
    -   It protects all routes under `/admin` by verifying the user session. Unauthenticated requests are redirected to `/login`.
    -   Authenticated users attempting to access `/login` are redirected to the admin dashboard.

### 2. Data Management Strategy (`utils/`)

The `utils/` directory centralizes all interactions with external services, forming a robust data access layer.

-   **`utils/supabase/repository/`**: This is the primary Data Access Layer (DAL). It abstracts all Supabase queries (select, insert, update, delete) into a set of repository functions. Both the admin panel's Server Actions and the public site's Server Components use this layer to interact with the database, ensuring a single source of truth for data logic.
-   **`utils/r2/`**: This module handles all file operations (uploads and deletions) with the Cloudflare R2 bucket. Server Actions that manage image content call these functions.

### 3. Admin Panel (`app/(admin)`) - The Mutation Layer

The admin panel is designed for content management and is the primary source of data mutations.

-   **CRUD Operations via Server Actions (`_actions/`)**: All CUD (Create, Update, Delete) operations are implemented as Next.js Server Actions. These server-side functions are called directly from client-side forms. They orchestrate the mutation logic:
    1.  Validate input data.
    2.  Call the appropriate function from the `utils/supabase/repository` to update the database.
    3.  If an image is involved, call `utils/r2/` to upload or delete the file from object storage.
-   **Cache Invalidation (`revalidatePath`)**: After a successful mutation, the Server Action immediately calls `revalidatePath()` or `revalidateTag()`. This is a critical step that purges the Next.js Data Cache for the specified path(s) on the public-facing site. This on-demand revalidation ensures that content changes are reflected instantly on the public site without requiring a full rebuild or waiting for a time-based revalidation to expire.

### 4. Public Website (`app/(main)`) - The Read Layer

The public website is optimized for performance and scalability by leveraging Next.js caching mechanisms.

-   **Data Fetching in Server Components**: Pages on the public site are primarily React Server Components (RSCs). They fetch data by directly calling functions from the `utils/supabase/repository`.
-   **Aggressive Caching Strategy**:
    -   Next.js `fetch` requests are automatically cached by default. The application leverages this by allowing data to be cached indefinitely (`force-cache`).
    -   This results in an **aggressive ISR (Incremental Static Regeneration) cooldown**, where pages are served statically from the cache on almost every visit. This minimizes database queries and serverless function compute time, leading to extremely fast page loads and reduced operational costs.
    -   The "freshness" of the data is not reliant on a time-based cooldown but is instead guaranteed by the on-demand `revalidatePath` calls from the admin panel's Server Actions. When content is updated, the cache is surgically invalidated, and the page is re-rendered only on the next request. This provides the benefits of a static site with the dynamism of a server-rendered one.

---

## 🚀 Local Development Setup

### 1. Choose Your Setup Method

**Option A: With Nix** - Automatically installs all dependencies  
**Option B: Without Nix** - Install dependencies manually

### 2. Setup Instructions

#### Option A: With Nix

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Kemurnian-School/kemurnian-website.git
    cd kemurnian-website
    ```

2.  **Enter Nix shell**:
    ```bash
    nix develop
    ```

3.  **Continue to step 3 below**

#### Option B: Without Nix

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Kemurnian-School/kemurnian-website.git
    cd kemurnian-website
    ```

2.  **Install dependencies manually**:
    -   Node.js (v18+)
    -   pnpm
    -   Docker & Docker Compose
    -   Supabase CLI
    -   just

3.  **Continue to step 3 below**

### 3. Environment Variables

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

The `.env.local` file should contain:
```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:54321"
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_secret_service_key
R2_ACCOUNT_ID="minio"
R2_ACCESS_KEY_ID="minioadmin"
R2_SECRET_ACCESS_KEY="minioadmin"
R2_BUCKET_NAME="kemurnian-bucket"
R2_PUBLIC_URL="http://127.0.0.1:9000/kemurnian-bucket"
R2_CDN="http://127.0.0.1:9000/kemurnian-bucket"
```

### 4. Hosts File Configuration

To enable local subdomain routing for the admin panel, add the following to your `hosts` file:
```
127.0.0.1   admin.localhost
```
-   **Windows**: `C:\Windows\System32\drivers\etc\hosts`
-   **macOS/Linux**: `/etc/hosts`

### 5. Start Development

```bash
just install    # Install Node.js dependencies
just start      # Start Docker and Supabase
just dev        # Start Next.js development server
```

-   Public site: `http://localhost:3000`
-   Admin panel: `http://admin.localhost:3000`

### Available Commands

```bash
just              # List all available commands
just install      # Install pnpm dependencies
just start        # Start Docker Compose and Supabase
just dev          # Start Next.js dev server
just stop         # Stop all services
just reset        # Stop and restart all services
just setup        # Start Supabase and run setup script
just db-migrate   # Push database migrations
just db-reset     # Reset database
just db-seed      # Seed database with initial data
```

---

## Deployment

This Next.js application can be deployed to any platform that supports Node.js, such as Vercel, Netlify, or a custom server. Ensure that you set the environment variables in your deployment environment.
