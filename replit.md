# ChronosTime Investment Platform

## Overview
ChronosTime is a professional investment platform enabling users to invest in virtual "time machines" that generate passive income through weekly returns. The platform supports cryptocurrency payments, includes gamification elements, and provides a comprehensive admin dashboard for management. Its core purpose is to offer a unique, engaging investment experience with a focus on a **mandatory dark theme** with premium neon accents. The business vision is to capture a significant market share in the alternative investment space by combining innovative investment products with a compelling user experience.

## Recent Changes (October 26, 2025)

### UI/UX Redesign - Phase 2
1. **Forced Dark Theme as Default**
   - Updated `:root` CSS variables to use dark theme colors by default
   - Eliminated white/light backgrounds across entire platform
   - All cards, forms, and pages now have dark backgrounds (`--card: #0b1220`)
   - Removed light theme as default to ensure consistent dark-neon aesthetic

2. **Enhanced Color Contrast**
   - Muted foreground: `#cbd5e1` (12.9:1 contrast ratio - WCAG AAA)
   - Border opacity increased to `0.2` for better visibility
   - All text and UI elements meet accessibility standards

3. **Supreme Admin Dashboard**
   - Created completely unique purple/aurora theme for admin interface
   - Distinct from user dashboard (cyan/blue theme)
   - Real-time KPI cards with glass-morphism
   - Critical alerts section with red theme
   - Quick admin actions grid
   - System health monitor
   - Admin badge with crown icon and pulsing animation
   - 15+ admin-specific utility classes (`.admin-glass`, `.admin-btn-primary`, etc.)

4. **Bug Fixes**
   - Fixed admin navigation: "withdrawals" → "withdraw" for proper routing
   - Integrated SupremeAdminDashboard into APIDashboard

## User Preferences
- Preferred communication style: Simple, everyday language
- **CRITICAL**: Dark theme is MANDATORY across entire platform - no light backgrounds allowed
- Support contact: **support@chronostime.fund**
- Referral bonus: **$5 per referral**

## System Architecture

### UI/UX Decisions
The platform features a premium **dark-neon aesthetic** with a color palette including Electric Cyan (#3CE7FF), Indigo (#6C63FF), and Gold (#EFBF60), set against Deep Space backgrounds (#020817, #0b1220). It utilizes a Glass-Morphism effect for cards and other UI elements to enhance the dark theme. The design is responsive, supporting mobile, tablet, and desktop viewports. 

**Theme System:**
- Default theme: **DARK ONLY** (forced in `:root` CSS variables)
- No light theme option - dark theme is enforced platform-wide
- Admin theme: Unique purple/aurora gradient distinct from user dashboard
- All forms, cards, and pages use dark backgrounds

### Technical Implementations
The frontend is built with Next.js 15 (App Router) and React 19, leveraging server-side rendering and client-side hydration. It uses a component-based architecture with TypeScript for type safety. UI components are built on Radix UI primitives and shadcn/ui, styled with Tailwind CSS. State management is handled primarily with local React state. The backend uses Supabase (PostgreSQL) with Row Level Security, custom authentication, and server-side API routes for sensitive operations.

### Feature Specifications
Key features include an authentication system, a dashboard with investment overviews, a time machine marketplace, a referral system ($5 bonus per referral), analytics, an admin panel for platform management, and gamification elements like a daily spin wheel and leaderboards. A critical feature is the integration of cryptocurrency payments via CPay (checkout ID: acb26bab-0d68-4ffa-b9f9-5ad577762fc7), including a secure webhook implementation for automatic balance updates and idempotency.

### System Design Choices
The system prioritizes security with server-side authentication, RLS, and environment variable management for sensitive credentials. Data storage is primarily handled by Supabase PostgreSQL, with a schema designed for users, time machines, referrals, withdrawals, and payment transactions. A custom storage service abstracts database operations, ensuring type safety and asynchronous interactions. The system is designed for high availability and performance, with connection pooling via PgBouncer.

## Color System

### Primary Colors (User Dashboard)
- **Electric Cyan**: `#3CE7FF` - Primary accent, buttons, links
- **Indigo**: `#6C63FF` - Secondary elements, charts
- **Gold**: `#EFBF60` - Accent elements, achievements

### Admin Dashboard Colors (Distinct Theme)
- **Admin Background**: `#0a0118` to `#1a0b2e` gradient
- **Admin Primary**: Purple (`#a855f7`) to Fuchsia gradients
- **Admin Accent**: Red (`#ff6b6b`) for critical alerts
- **Admin Borders**: Purple with 20% opacity

### Dark Theme (Platform-wide Default)
- **Background**: `#020817` (Deep Space)
- **Card Background**: `#0b1220` (Dark Blue)
- **Foreground**: `#f8fafc` (Off-white)
- **Muted Foreground**: `#cbd5e1` (High contrast - 12.9:1 ratio)
- **Border**: `rgba(60, 231, 255, 0.2)` (Cyan with 20% opacity)

## External Dependencies

### Third-Party Services
- **Supabase**: PostgreSQL database, authentication, and real-time services
- **CPay**: Cryptocurrency payment gateway (Checkout ID: acb26bab-0d68-4ffa-b9f9-5ad577762fc7)
- **Vercel**: Deployment platform, analytics, and edge network optimization

### NPM Packages
- **UI & Styling**: `@radix-ui/*`, `tailwindcss`, `class-variance-authority`, `clsx`, `lucide-react`
- **Forms & Validation**: `react-hook-form`, `@hookform/resolvers`, `zod`
- **Data Visualization**: `recharts`, `embla-carousel-react`
- **Utilities**: `date-fns`, `canvas-confetti`, `cmdk`
- **Supabase Integration**: `@supabase/supabase-js`, `@supabase/ssr`

### API Integrations
- **CPay API**: For processing cryptocurrency payments and handling secure webhook callbacks
- **Cryptocurrency Pricing API**: For fetching real-time Bitcoin prices and monitoring transaction confirmations

## Known Issues
None currently.

## Next Priorities
1. Guided onboarding wizard for new users with investment coaching
2. Gamification system (levels, badges, weekly challenges, leaderboards)
3. AI-powered insights dashboard (ROI predictions, market trends, personalized tips)
4. Real-time notification center with push alerts
