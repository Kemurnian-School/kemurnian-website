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

The application is a monolith built with Next.js, logically separated into two main parts using Route Groups: the public-facing website `app/(main)` and the admin panel `app/(admin)`.

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

### 1. Prerequisites

-   Node.js (v18+)
-   pnpm

### 2. Installation & Setup

1.  **Clone & Install**:
    ```bash
    git clone https://github.com/Kemurnian-School/kemurnian-website.git
    cd kemurnian-website
    pnpm install
    ```

2.  **Environment Variables**:
    Copy `.env.example` to `.env.local` and populate it with your credentials for Supabase and Cloudflare R2.
    ```bash
    cp .env.example .env.local
    ```

3.  **Hosts File Configuration**:
    To enable local subdomain routing for the admin panel, add the following to your `hosts` file:
    ```
    127.0.0.1   admin.localhost
    ```
    -   **Windows**: `C:\Windows\System32\drivers\etc\hosts`
    -   **macOS/Linux**: `/etc/hosts`

4.  **Run Development Server**:
    ```bash
    pnpm dev
    ```
    -   Public site: `http://localhost:3000`
    -   Admin panel: `http://admin.localhost:3000`

    NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
    SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
    ```

4.  **Run the development server:**
    ```bash
    pnpm dev
    ```

    The application will be available at `http://localhost:3000`.

## Deployment

This Next.js application can be deployed to any platform that supports Node.js, such as Vercel, Netlify, or a custom server. Ensure that you set the environment variables in your deployment environment.
