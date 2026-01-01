# NRIChristianMatrimony

## Overview

A Christian matrimony platform designed for NRI (Non-Resident Indian) communities. Users can create profiles, browse potential matches, and filter by various criteria including denomination, location, age, and gender. The application uses Replit Auth for authentication and PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

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
- **Authentication**: Replit Auth integration using OpenID Connect (OIDC)
- **Session Management**: PostgreSQL-backed sessions via connect-pg-simple

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with Zod validation schemas
- **Schema Location**: `shared/schema.ts` defines all database tables
- **Key Tables**:
  - `users`: Stores authenticated user information (required for Replit Auth)
  - `sessions`: Session storage (required for Replit Auth)
  - `profiles`: Matrimony profile data linked to users

### Code Organization
- **`client/`**: React frontend application
- **`server/`**: Express backend with API routes
- **`shared/`**: Shared types, schemas, and route definitions between frontend and backend
- **`server/replit_integrations/auth/`**: Replit Auth implementation

### API Structure
Routes are defined in `shared/routes.ts` with Zod schemas for input validation. The server implements these routes in `server/routes.ts`. Key endpoints:
- `GET /api/profiles` - List profiles with optional filters
- `GET /api/profiles/:id` - Get single profile
- `POST /api/profiles` - Create profile (authenticated)
- `PATCH /api/profiles/:id` - Update profile (authenticated)
- `DELETE /api/profiles/:id` - Delete profile (authenticated)
- `GET /api/auth/user` - Get current authenticated user

## External Dependencies

### Database
- PostgreSQL database (connection via `DATABASE_URL` environment variable)
- Drizzle Kit for schema migrations (`npm run db:push`)

### Authentication
- Replit Auth (OpenID Connect)
- Requires `ISSUER_URL`, `REPL_ID`, and `SESSION_SECRET` environment variables

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

### Session Configuration
- Sessions are configured to last 30 days (1 month) for user convenience

### Pending Features
- **Email Integration**: SendGrid was not configured (user did not provide credentials). To add email functionality:
  1. Get a SendGrid API key
  2. Add `SENDGRID_API_KEY` as an environment secret
  3. Implement email service in `server/sendgrid.ts`
  4. Add welcome email on registration