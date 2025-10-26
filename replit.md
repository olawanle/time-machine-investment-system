# ChronosTime Investment Platform

## Overview
ChronosTime is a professional investment platform enabling users to invest in virtual "time machines" that generate passive income through weekly returns. The platform supports cryptocurrency payments, includes gamification elements, and provides a comprehensive admin dashboard for management. Its core purpose is to offer a unique, engaging investment experience with a focus on a **mandatory dark theme** with premium neon accents. The business vision is to capture a significant market share in the alternative investment space by combining innovative investment products with a compelling user experience.

## Recent Changes (October 26, 2025)

### Complete Admin Panel Implementation
Built a comprehensive, fully-functional admin panel with real database operations:

1. **Admin Authentication System**
   - Protected API routes with admin verification
   - Admin-only access for admin@chronostime.com
   - Session management and audit logging

2. **User Management System**
   - View all users with search, filter, sort capabilities
   - Edit user balances with database updates
   - Ban/unban users with immediate effect
   - Delete user accounts with cascade deletion
   - View detailed user history and referrals
   - Export user data to CSV

3. **Financial Management**
   - Real-time transaction monitoring
   - Withdrawal approval/rejection system
   - Revenue analytics with charts
   - Manual balance adjustments with audit trail
   - 7-day revenue trends visualization

4. **Time Machine Management**
   - CRUD operations for time machines
   - Set prices, returns, and requirements
   - Enable/disable machines for purchase
   - View machine performance analytics

5. **System Dashboard**
   - Real-time platform statistics
   - User growth charts (30-day view)
   - Revenue breakdown pie charts
   - System health monitoring
   - Recent payment activity feed

6. **Settings & Configuration**
   - Platform settings management
   - Maintenance mode toggle
   - Feature flags control
   - Announcement system for user notifications
   - Security settings configuration

7. **Audit & Security**
   - Complete activity logging
   - IP tracking and monitoring
   - Suspicious activity alerts
   - Export audit logs to CSV

### Database Schema Updates
- Created admin-specific tables: audit_logs, system_settings, announcements
- Added transactions and machine_templates tables
- Implemented proper foreign key relationships

### API Routes (12 endpoints)
- /api/admin/verify - Authentication check
- /api/admin/users - User management CRUD
- /api/admin/withdrawals - Withdrawal processing
- /api/admin/transactions - Transaction management
- /api/admin/machines - Time machine CRUD
- /api/admin/stats - Dashboard statistics
- /api/admin/settings - Platform configuration
- /api/admin/audit-logs - Activity tracking
- /api/admin/announcements - User notifications

### UI/UX Improvements
1. **Mobile Navigation** - Modern bottom tab bar with icons and badges
2. **Trust Indicators** - Live user counter, transaction ticker, security badges
3. **Premium Animations** - Particle effects, parallax scrolling, 3D cards
4. **Landing Page** - Success stories, investment calculator, countdown timers

## User Preferences
- Preferred communication style: Simple, everyday language
- **CRITICAL**: Dark theme is MANDATORY across entire platform - no light backgrounds allowed
- Support contact: **support@chronostime.fund**
- Referral bonus: **$5 per referral**

## Admin Access
- Admin Email: **admin@chronostime.com**
- Admin Features: Complete platform control through dedicated admin panel
- Access: Login with admin email to see "Admin Panel" option in sidebar

## System Architecture

### UI/UX Decisions
The platform features a premium **dark-neon aesthetic** with a color palette including Electric Cyan (#3CE7FF), Indigo (#6C63FF), and Gold (#EFBF60), set against Deep Space backgrounds (#020817, #0b1220). It utilizes a Glass-Morphism effect for cards and other UI elements to enhance the dark theme. The design is responsive, supporting mobile, tablet, and desktop viewports. 

**Theme System:**
- Default theme: **DARK ONLY** (forced in `:root` CSS variables)
- No light theme option - dark theme is enforced platform-wide
- Admin theme: Unique purple/pink gradient distinct from user dashboard
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
- **Admin Background**: Dark grays (#1a1a1a to #2a2a2a)
- **Admin Primary**: Purple/Pink (#8b5cf6 to #ec4899)
- **Admin Accent**: Red (#ef4444) for critical actions
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
1. Implement email notification system for withdrawals and announcements
2. Add two-factor authentication for admin access
3. Create automated backup system for database
4. Build analytics export functionality for financial reports