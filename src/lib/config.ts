// Centralized configuration object for environment variables
// Following coding standards: Environment variables accessed through centralized configuration object

export const config = {
  database: {
    url: process.env.POSTGRES_URL || "postgresql://username:password@localhost:5432/taskflow",
  },
  auth: {
    secret: process.env.AUTH_SECRET || "your-secret-key-here",
    nextAuthUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
    nextAuthSecret: process.env.NEXTAUTH_SECRET || "your-nextauth-secret-here",
  },
} as const; 