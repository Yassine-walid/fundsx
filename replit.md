# Budget Flow Application

## Overview

Budget Flow is a comprehensive personal finance management application built with a modern full-stack architecture. The application provides users with tools to track expenses, manage savings goals, handle recurring transactions, and visualize financial data through an intuitive dashboard interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with clear separation between client and server code, using a modern TypeScript-first approach throughout the stack.

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Validation**: Zod schemas shared between client and server

## Key Components

### Database Schema
The application uses a well-structured PostgreSQL database with the following main entities:
- **Users**: Basic user authentication and identification
- **Transactions**: Income, expense, and transfer records with categories
- **Savings Goals**: Target-based savings tracking with progress monitoring
- **Recurring Transactions**: Automated transaction templates for bills and income
- **Salary Allocations**: Budget percentage distributions (essentials/savings/lifestyle)

### API Structure
RESTful API endpoints organized by resource:
- `/api/transactions` - CRUD operations for financial transactions
- `/api/savings-goals` - Savings goal management
- `/api/recurring-transactions` - Recurring payment/income handling
- `/api/salary-allocation` - Budget allocation management
- `/api/dashboard-stats` - Aggregated financial statistics

### User Interface
The application features a responsive sidebar navigation with dedicated pages for:
- **Dashboard**: Financial overview with charts and quick stats
- **Salary Management**: Income and budget allocation configuration
- **Expenses**: Transaction tracking and categorization
- **Savings Goals**: Goal setting and progress monitoring
- **Recurring**: Automated transaction management
- **Calendar View**: Time-based transaction visualization

## Data Flow

1. **Client Requests**: React components use TanStack Query to fetch data from API endpoints
2. **Server Processing**: Express.js routes handle requests, validate data with Zod schemas
3. **Database Operations**: Drizzle ORM performs type-safe database operations
4. **Response Handling**: Data is returned as JSON and cached client-side by React Query
5. **UI Updates**: Components automatically re-render when data changes

The application uses optimistic updates and proper error handling throughout the data flow.

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React router

### UI Component Libraries
- **@radix-ui/***: Accessible, unstyled UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Consistent icon library
- **recharts**: Data visualization components

### Form and Validation
- **react-hook-form**: Performant form library
- **@hookform/resolvers**: Form validation resolvers
- **zod**: TypeScript-first schema validation

### Development Tools
- **vite**: Fast build tool with HMR support
- **typescript**: Static type checking
- **drizzle-kit**: Database schema management and migrations

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express.js backend
- **Hot Module Replacement**: Enabled for fast development cycles
- **Database**: Neon serverless PostgreSQL with environment-based configuration

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: ESBuild compiles server code to `dist/index.js`
- **Database Migrations**: Drizzle Kit handles schema changes via `db:push` command

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment detection (development/production)
- **Build Scripts**: Separate build processes for client and server code

The application is designed to be deployed on platforms supporting Node.js with PostgreSQL database connectivity, with particular optimization for Replit's environment including development tooling integration.