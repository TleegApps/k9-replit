# K9Kompare - Dog Breed Comparison Platform

## Overview

K9Kompare is a production-ready, mobile-first web application designed for dog breed comparison, discovery, and adoption guidance. The platform combines AI-powered breed matching with comprehensive comparison tools, integrated e-commerce, and educational resources. Users can compare up to 4 breeds simultaneously, take an intelligent breed finder quiz, explore breed-specific products, and access veterinary-backed educational content.

The application features a modern claymorphism design with soft pastel colors, large border radii, and sophisticated shadow effects. It implements a full-stack TypeScript architecture with React frontend, Express backend, PostgreSQL database, and integrates multiple external services for enhanced functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development/building
- **Styling**: Tailwind CSS with custom claymorphism design system using CSS variables
- **Component Library**: Radix UI primitives with custom shadcn/ui components
- **State Management**: Zustand for global state (breed comparison, quiz responses, UI state)
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack Query (React Query) for server state management and caching
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Authentication**: Custom Replit Auth integration with session-based authentication
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **API Design**: RESTful endpoints with consistent error handling and logging middleware

### Database Schema
- **Primary Database**: PostgreSQL via Neon serverless
- **Schema Management**: Drizzle ORM with migration support
- **Key Tables**: 
  - Users (Replit Auth integration)
  - Breeds (enriched data from Dog API)
  - Comparisons (saved breed comparisons)
  - Quiz responses and results
  - Products and articles for content management
  - Saved items and newsletter subscriptions

### Design System
- **Typography**: Montserrat (headings), Open Sans (body), Roboto Mono (code)
- **Color Palette**: Midnight Blue, Mustard Yellow, Mint, Lavender, Soft Gray
- **Theme**: Claymorphism with 16-20px border radius and inner/outer shadows
- **Responsive**: Mobile-first design with sticky CTAs and smooth transitions
- **Accessibility**: WCAG AA compliant with proper ARIA labels and keyboard navigation

### File Structure
- `/client` - React frontend application
- `/server` - Express backend API
- `/shared` - Shared TypeScript schemas and types
- `/migrations` - Database migration files
- Component organization follows feature-based structure with reusable UI components

## External Dependencies

### Third-Party Services
- **The Dog API**: Primary data source for breed information and images
- **OpenAI GPT-4**: AI-powered breed recommendations and content generation
- **Stripe**: Payment processing for e-commerce functionality
- **Neon Database**: Serverless PostgreSQL hosting

### Authentication & Sessions
- **Replit Auth**: OAuth-based authentication system
- **Session Management**: PostgreSQL-backed sessions with automatic cleanup

### Development Tools
- **Vite**: Frontend build tool with HMR and development server
- **ESBuild**: Backend bundling for production builds
- **Drizzle Kit**: Database schema management and migrations
- **TypeScript**: End-to-end type safety across frontend, backend, and database

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **TanStack Query**: Server state management
- **Wouter**: Lightweight routing solution
- **Zustand**: Client state management

### Styling & Design
- **Tailwind CSS**: Utility-first styling framework
- **PostCSS**: CSS processing with Autoprefixer
- **Google Fonts**: Web font delivery for typography
- **Custom CSS Variables**: Theme-based color system

The application is designed for production deployment with comprehensive error handling, loading states, and optimistic UI updates throughout the user experience.