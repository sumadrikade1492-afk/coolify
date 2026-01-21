# NRIChristianMatrimony

## Overview

A Christian matrimony platform designed for NRI (Non-Resident Indian) communities. Users can create profiles, browse potential matches, and filter by various criteria including denomination, location, age, and gender. The application uses custom authentication (email/password, email OTP, Google OAuth) and PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.
Database approach: Do NOT add schema-level validations (like NOT NULL constraints) to the database. Keep all validations at the application level (frontend forms and API routes).

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theming (gold and blue color scheme)
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Pattern**: RESTful API with typed route definitions in `shared/routes.ts`
- **Authentication**: Custom auth with email/password, email OTP, and Google OAuth
- **Session Management**: PostgreSQL-backed sessions via connect-pg-simple (30-day expiry)

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with Zod validation schemas
- **Schema Location**: `shared/schema.ts` defines all database tables
- **Key Tables**:
  - `users`: Stores user information with passwordHash, email, googleId, admin flag
  - `sessions`: Session storage for express-session
  - `otp_codes`: Email verification codes with expiry (10 minutes)
  - `profiles`: Matrimony profile data linked to users
  - `login_logs`: Tracks user logins for daily reports

### Code Organization
- **`client/`**: React frontend application
- **`server/`**: Express backend with API routes
- **`shared/`**: Shared types, schemas, and route definitions between frontend and backend
- **`server/auth-service.ts`**: Authentication service (password hashing, OTP, user management)
- **`server/auth-routes.ts`**: Auth API routes (register, login, logout, OTP, Google OAuth)
- **`server/gmail.ts`**: Gmail integration for sending emails

### API Structure
Routes are defined in `shared/routes.ts` with Zod schemas for input validation. The server implements these routes in `server/routes.ts`. Key endpoints:
- `GET /api/profiles` - List profiles with optional filters
- `GET /api/profiles/:id` - Get single profile
- `POST /api/profiles` - Create profile (authenticated)
- `PUT /api/profiles/:id` - Update profile (authenticated, owner or admin)
- `DELETE /api/profiles/:id` - Delete profile (authenticated)
- `GET /api/auth/user` - Get current authenticated user

### Admin API Endpoints
- `POST /api/admin/login` - Admin-specific login (validates credentials + admin status)
- `GET /api/admin/check` - Check if current user is admin
- `GET /api/admin/profiles` - Get all profiles with full details (admin only)
- `POST /api/admin/set-admin` - Set user admin status (admin only)
- `POST /api/admin/send-login-report` - Manually trigger login report (admin only)

### Express Interest API
- `POST /api/express-interest` - Express interest in a profile (sends email notification to opsauto3@gmail.com)

## External Dependencies

### Database
- PostgreSQL database (connection via `DATABASE_URL` environment variable)
- Drizzle Kit for schema migrations (`npm run db:push`)

### Authentication
- Custom authentication system with three methods:
  1. **Email/Password**: bcrypt hashing (cost factor 12), 8+ character passwords
  2. **Email OTP**: 6-digit codes sent via Gmail, 10-minute expiry
  3. **Google OAuth**: Passport.js integration with `passport-google-oauth20`
- Requires `SESSION_SECRET` environment variable
- For Google OAuth: requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variables
- Sessions last 30 days with SameSite=lax cookie protection

### UI Libraries
- Radix UI primitives for accessible components
- Lucide React for icons
- Embla Carousel for carousel functionality
- React Day Picker for date selection
- React Hook Form with Zod resolver for form handling

### Development Tools
- Vite dev server with HMR
- Replit-specific plugins for development (cartographer, dev-banner, error overlay)

### Phone Verification
- Twilio SMS integration for phone verification
- Requires `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` environment variables
- Verification codes expire after 10 minutes

### Email Integration (Gmail)
- Uses Replit Gmail connector for sending transactional emails
- Sends email to opsauto3@gmail.com when profiles are created or updated
- Daily login report sent automatically at midnight
- Implementation in `server/gmail.ts`

### Session Configuration
- Sessions are configured to last 30 days (1 month) for user convenience

### US-Focused Rollout
- Currently the platform is focused on US users only
- Other country options are hidden (commented out) in:
  - `client/src/pages/create-profile.tsx` - Country dropdown
  - `client/src/pages/profiles.tsx` - Country filter dropdown
- To expand to other countries, uncomment the country options in both files

### Admin Features
- Separate admin login page at `/admin-login`
- Admin dashboard at `/admin` shows full profile data (names, phones, etc.)
- Admin users can edit any profile (not just their own)
- Admin flag stored in `users.is_admin` column
- To make a user an admin, run SQL: `UPDATE users SET is_admin = true WHERE email = 'admin@example.com';`
- Admin can access `/api/admin/*` endpoints

### Profile Fields - Arranged Marriage Details
Comprehensive profile fields for arranged marriage matching:

**Background & Lifestyle (Required)**:
- `education`: Highest education level (High School to PhD/MD/MBA)
- `maritalStatus`: Never Married, Divorced, Widowed, Annulled
- `hasChildren`: Only required when maritalStatus is not "Never Married"
- `familyType`: Nuclear, Joint, or Extended Family
- `diet`: Vegetarian, Non-Vegetarian, Eggetarian, Vegan
- `drinking`: Never, Occasionally, Regularly
- `smoking`: Never, Occasionally, Regularly
- `willingToRelocate`: Yes, No, Maybe

**Family Details (Optional)**:
- `fathersOccupation`: Father's current/past occupation
- `mothersOccupation`: Mother's current/past occupation
- `siblings`: Description of siblings (e.g., "1 elder brother (married), 1 younger sister")

### Mandatory Profile Fields
All profile fields are now mandatory except:
- `photoUrl` (optional photo upload)
- `otherDenomination` (only required when denomination is "Other")
- `createdByName` (only required when createdBy is not "Self")
- `hasChildren` (only required when maritalStatus is not "Never Married")
- `fathersOccupation`, `mothersOccupation`, `siblings` (optional family details)

### Privacy Features
- All profile listings show initials only (e.g., "S.K. - NRI14702") - never full names
- Profile ID format: NRI + 14700 + database_id (e.g., NRI14701, NRI14702)
- Contact details hidden until mutual interest via "Express Interest" flow
- "Express Interest" button sends email to opsauto3@gmail.com with both profiles' details
- Only admins can see full names and contact details via admin dashboard
