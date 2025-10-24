# ChronosTime Investment Platform

## Overview

ChronosTime is a professional investment platform built with Next.js 15, React 19, and Supabase. The platform enables users to invest in virtual "time machines" that generate passive income through weekly returns. Users can purchase different tiers of time machines, claim rewards, refer friends for bonuses, and track their investment performance through comprehensive analytics.

The platform features cryptocurrency payment integration (Bitcoin via NOWPayments), gamification elements (daily spin wheel, achievements, leaderboards), and a complete admin dashboard for platform management.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**October 24, 2025** - Major Security Upgrade & UI/UX Enhancements:
- **Security Overhaul:**
  - Implemented secure server-side authentication using Supabase Auth (replaces insecure client-side auth)
  - Created server-side API routes for all authentication operations (/api/auth/*)
  - Moved payment processing to secure server-side APIs (/api/payments/*)
  - Created admin panel APIs with proper authorization (/api/admin/*)
  - Database schema updated with payment_requests and bitcoin_transactions tables
  - All sensitive operations now use SUPABASE_SERVICE_ROLE_KEY server-side
  
- **Enhanced Admin Dashboard:**
  - New EnhancedAdminDashboard component with real-time data from secure APIs
  - Live platform statistics (users, investments, earnings, active machines)
  - User management with search, filtering, and suspend/activate actions
  - Withdrawal management with approve/reject functionality
  - Real data integration replacing mock services
  
- **UI/UX Improvements:**
  - Modern gradient-based design system with glass morphism effects
  - Responsive statistics cards with real-time data
  - Improved navigation and user feedback
  - Better loading states and error handling
  - Enhanced visual hierarchy and accessibility
  
- **Previous Updates:**
  - Logo component uses `/chronos svg.svg` from public folder
  - Time machine images organized by price (`time 1.png` through `time 5.png`)
  - Dark mode support with `time black 1-5.png` variants
  - Server configured on port 5000 for Replit environment
  - Fixed Next.js 15 viewport warning (migrated to proper Viewport export)

## System Architecture

### Frontend Architecture

**Framework**: Next.js 15 with App Router and React 19
- Server-side rendering and client-side hydration
- Component-based architecture using React functional components with hooks
- TypeScript for type safety across the application
- Responsive design supporting mobile, tablet, and desktop viewports

**UI Component Library**: Custom components built on Radix UI primitives
- shadcn/ui component system following the "new-york" style variant
- Tailwind CSS for styling with custom CSS variables for theming
- Support for light/dark themes via data attributes
- Component aliases configured via `@/components`, `@/lib`, `@/hooks` paths

**State Management**:
- Local React state (useState, useEffect) for component-level state
- Custom storage service (`@/lib/storage`) for persistent data management
- No global state management library - data flows through props and context

**Key Features**:
- Authentication system with email/password (SHA-256 hashing)
- Dashboard with investment overview and real-time statistics
- Time machine marketplace for purchasing investment products
- Referral system with tracking and bonuses
- Analytics and reporting dashboards
- Admin panel for platform management
- Gamification: daily spin wheel, achievements, leaderboards
- Bitcoin payment gateway integration

### Backend Architecture

**Database**: Supabase (PostgreSQL)
- Connection pooling via PgBouncer
- Row Level Security (RLS) policies enabled for data protection
- Database schema includes: users, time_machines, referrals, withdrawal_requests, purchased_machines

**Authentication**:
- Custom authentication system using Supabase
- Password hashing with SHA-256
- Session management via Supabase Auth
- Admin access controlled by email check (admin@chronostime.com)

**Data Layer**:
- Custom storage service (`@/lib/storage.ts`) abstracts database operations
- Async/await pattern for all database interactions
- UUID generation for PostgreSQL compatibility
- Type-safe interfaces for User, TimeMachine, and related entities

**Business Logic**:
- Time machine claiming mechanism with configurable intervals
- Withdrawal request system with 12-day cycles
- Referral bonus calculations
- ROI and analytics calculations
- Auto-sweep monitoring for Bitcoin payments

### Data Storage Solutions

**Primary Database**: Supabase PostgreSQL
- Hosted on AWS (aws-1-us-east-1)
- Connection via pooler for performance
- SSL-required connections
- Both pooled and direct connection options available

**Schema Design**:
- Users table: authentication, balances, referral codes, tier levels
- Time machines table: user-owned machines with claim intervals and rewards
- Referrals table: tracks referral relationships
- Withdrawal requests table: manages withdrawal lifecycle
- Purchased machines table: marketplace transaction history

**Local Storage**:
- Theme preferences stored in localStorage
- Session persistence via Supabase client

### Authentication & Authorization

**User Authentication**:
- Email/password registration and login
- Password encryption using SHA-256
- Supabase Auth for session management
- Support for referral code signup flow

**Authorization Levels**:
- Regular users: access to dashboard, marketplace, referrals, settings
- Admin users: full platform access including admin panel, user management, withdrawal approvals
- Role determined by email match (admin@chronostime.com)

**Security Measures**:
- Row Level Security on all database tables
- Environment variables for sensitive credentials
- HTTPS-only connections in production
- JWT-based session tokens via Supabase

## External Dependencies

### Third-Party Services

**Supabase**:
- PostgreSQL database hosting
- Authentication service
- Real-time subscriptions (not currently utilized)
- Connection details stored in environment variables
- Both anonymous and service role keys for different access levels

**NOWPayments (Cryptocurrency Gateway)**:
- Bitcoin payment processing
- Payment widgets for three premium machines:
  - Quantum Leap ($500) - Widget ID: 5858741736
  - Temporal Shift Unit ($800) - Widget ID: 4978857735
  - Nova Jumper ($1,200) - Widget ID: 5075645750
- Webhook integration for payment confirmation (implementation pending)

**Vercel**:
- Deployment platform
- Analytics via @vercel/analytics package
- Edge network for performance optimization
- Environment variable management

**Bitcoin Network**:
- Manual Bitcoin address: bc1q5r2096wsp4fs8c34yt4pwlklvfmdl7vldtyhya
- Payment monitoring (manual/demo mode currently)
- HD wallet support planned for production (master public key configured)

### NPM Packages

**UI & Styling**:
- @radix-ui/* (v1.x): Accessible UI primitives for components
- tailwindcss (v3.x): Utility-first CSS framework
- class-variance-authority: Component variant management
- clsx: Conditional className utilities
- lucide-react: Icon library

**Forms & Validation**:
- react-hook-form: Form state management
- @hookform/resolvers: Validation schema resolvers
- zod (likely): Schema validation (inferred from resolver usage)

**Data Visualization**:
- recharts: Chart components for analytics
- embla-carousel-react: Carousel/slider components

**Utilities**:
- date-fns: Date manipulation and formatting
- canvas-confetti: Celebration animations
- cmdk: Command menu component

**Supabase Integration**:
- @supabase/supabase-js: Main Supabase client
- @supabase/ssr: Server-side rendering support

### API Integrations

**Cryptocurrency Pricing**:
- Real-time Bitcoin price fetching (service layer implemented)
- Transaction confirmation monitoring
- Address balance checking

**Payment Processing**:
- NOWPayments REST API for widget embedding
- Custom Bitcoin payment gateway for direct payments
- Payment manager service for transaction tracking

### Configuration Files

- `components.json`: shadcn/ui configuration (New York style, RSC enabled)
- `tsconfig.json`: TypeScript compiler options (ES6 target, strict mode)
- `vercel.json`: Custom install command for legacy peer dependencies
- `.env.local`: Environment variables for database and API keys (not in repo)
- `next.config.js`: Next.js configuration (inferred from setup)