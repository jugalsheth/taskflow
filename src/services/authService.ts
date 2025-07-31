import { db } from "@/lib/db";
import { users, type NewUser } from "@/lib/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export class AuthService {
  /**
   * Create a new user account
   */
  static async createUser(userData: NewUser) {
    try {
      // Basic validation
      if (!userData.email || !userData.password) {
        throw new Error("Email and password are required");
      }

      if (userData.password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }
      
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);

      if (existingUser.length > 0) {
        throw new Error("User with this email already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create user
      const newUser = await db
        .insert(users)
        .values({
          email: userData.email,
          password: hashedPassword,
          name: userData.name || null,
        })
        .returning({
          id: users.id,
          email: users.email,
          name: users.name,
          createdAt: users.createdAt,
        });

      return newUser[0];
    } catch (error) {
      console.error("AuthService.createUser error:", error);
      throw error;
    }
  }

  /**
   * Verify user credentials
   */
  static async verifyCredentials(email: string, password: string) {
    try {
      // Find user by email
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (user.length === 0) {
        return null;
      }

      const foundUser = user[0];

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, foundUser.password);

      if (!isPasswordValid) {
        return null;
      }

      return {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
      };
    } catch (error) {
      console.error("AuthService.verifyCredentials error:", error);
      throw error;
    }
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string) {
    try {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      return user[0] || null;
    } catch (error) {
      console.error("AuthService.getUserByEmail error:", error);
      throw error;
    }
  }
} 