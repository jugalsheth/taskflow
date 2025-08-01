// NextAuth type declarations

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
    } | undefined;
  }

  interface User {
    id: string;
    email: string;
    name?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name?: string;
  }
} 