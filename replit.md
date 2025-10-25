# ChronosTime Investment Platform

## Overview
ChronosTime is a professional investment platform enabling users to invest in virtual "time machines" that generate passive income through weekly returns. The platform supports cryptocurrency payments, includes gamification elements, and provides a comprehensive admin dashboard for management. Its core purpose is to offer a unique, engaging investment experience with a focus on a "dark-neon" aesthetic and robust functionality. The business vision is to capture a significant market share in the alternative investment space by combining innovative investment products with a compelling user experience.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The platform features a premium "dark-neon" aesthetic with a color palette including Electric Cyan, Indigo, and Gold, set against Deep Space backgrounds. It utilizes a Glass-Morphism effect for cards and other UI elements to enhance the dark theme. The design is responsive, supporting mobile, tablet, and desktop viewports, and includes both light and dark theme support. A complete design system overhaul (Phase 1 UI/UX Redesign) has been implemented, covering everything from color palettes and utility classes to a brand-new, production-ready landing page and enhanced authentication experience.

### Technical Implementations
The frontend is built with Next.js 15 (App Router) and React 19, leveraging server-side rendering and client-side hydration. It uses a component-based architecture with TypeScript for type safety. UI components are built on Radix UI primitives and shadcn/ui, styled with Tailwind CSS. State management is handled primarily with local React state. The backend uses Supabase (PostgreSQL) with Row Level Security, custom authentication, and server-side API routes for sensitive operations.

### Feature Specifications
Key features include an authentication system, a dashboard with investment overviews, a time machine marketplace, a referral system, analytics, an admin panel for platform management, and gamification elements like a daily spin wheel and leaderboards. A critical feature is the integration of cryptocurrency payments via CPay, including a secure webhook implementation for automatic balance updates and idempotency.

### System Design Choices
The system prioritizes security with server-side authentication, RLS, and environment variable management for sensitive credentials. Data storage is primarily handled by Supabase PostgreSQL, with a schema designed for users, time machines, referrals, withdrawals, and payment transactions. A custom storage service abstracts database operations, ensuring type safety and asynchronous interactions. The system is designed for high availability and performance, with connection pooling via PgBouncer.

## External Dependencies

### Third-Party Services
- **Supabase**: PostgreSQL database, authentication, and real-time services.
- **CPay**: Cryptocurrency payment gateway for checkout processing and secure webhook integration.
- **Vercel**: Deployment platform, analytics, and edge network optimization.

### NPM Packages
- **UI & Styling**: `@radix-ui/*`, `tailwindcss`, `class-variance-authority`, `clsx`, `lucide-react`.
- **Forms & Validation**: `react-hook-form`, `@hookform/resolvers`, `zod`.
- **Data Visualization**: `recharts`, `embla-carousel-react`.
- **Utilities**: `date-fns`, `canvas-confetti`, `cmdk`.
- **Supabase Integration**: `@supabase/supabase-js`, `@supabase/ssr`.

### API Integrations
- **CPay API**: For processing cryptocurrency payments and handling secure webhook callbacks.
- **Cryptocurrency Pricing API**: For fetching real-time Bitcoin prices and monitoring transaction confirmations.