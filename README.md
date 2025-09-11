# Sekolah Kemurnian Website

This is a web application for Sekolah Kemurnian, built with Next.js and Supabase. It includes a public-facing website to provide information to students and parents, and an admin dashboard for managing the website's content.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Backend & Database:** [Supabase](https://supabase.io/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** Custom components, with `react-quill-new` for rich text editing.

## Features

### Public Website

- **Homepage:** Displays a hero slider, school information, curriculum highlights, latest news, and enrollment details.
- **Dynamic Content:** All content is fetched from the Supabase backend, allowing for easy updates.
- **Responsive Design:** The website is designed to be accessible on various devices.

### Admin Dashboard

- **Secure Access:** The admin area (`/admin`) is protected and requires authentication through Supabase Auth.
- **Content Management:** The dashboard allows administrators to perform CRUD (Create, Read, Update, Delete) operations on:
  - Hero Sliders
  - Curriculum Information
  - News and Events
  - Enrollment Details

## Project Structure

The project follows the Next.js App Router structure.

```
/app
|-- (main)/       # Route group for the public-facing website
|   |-- page.tsx      # Homepage
|   |-- kurikulum/
|   |-- enrollment/
|   `-- ...
|
|-- admin/        # Route group for the admin dashboard
|   |-- page.tsx      # Admin homepage
|   |-- hero/
|   |-- kurikulum/
|   |-- news/
|   `-- ...
|
|-- login/        # Login page for the admin dashboard
|
`-- layout.tsx    # Root layout
```

- `utils/supabase/`: Contains Supabase client configurations for client-side, server-side, and admin-level interactions.
- `middleware.ts`: Handles authentication checks for the `/admin` routes.

## Getting Started

### Prerequisites

- Node.js (v20 or later)
- `pnpm` (or your preferred package manager)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Kemurnian-School/next-kemurnian-sch
   cd next-kemurnian-sch
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**

   Create a `.env.local` file in the root of the project and add your Supabase credentials:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```

4. **Run the development server:**
   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`.
