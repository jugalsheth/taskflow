import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { templateFavorites, checklistTemplates, users } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

// GET /api/templates/favorites - Get user's favorite templates
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");

    // Get user's favorite templates
    const favoritesData = await db
      .select({
        id: templateFavorites.id,
        userId: templateFavorites.userId,
        templateId: templateFavorites.templateId,
        teamId: templateFavorites.teamId,
        createdAt: templateFavorites.createdAt,
        templateTitle: checklistTemplates.title,
        templateCreatedAt: checklistTemplates.createdAt,
        templateUpdatedAt: checklistTemplates.updatedAt,
        templateOwnerId: checklistTemplates.userId,
        templateOwnerName: users.name,
        templateOwnerEmail: users.email,
      })
      .from(templateFavorites)
      .innerJoin(checklistTemplates, eq(templateFavorites.templateId, checklistTemplates.id))
      .innerJoin(users, eq(checklistTemplates.userId, users.id))
      .where(eq(templateFavorites.userId, session.user.id))
      .orderBy(desc(templateFavorites.createdAt));

    return NextResponse.json({ favorites: favoritesData });
  } catch (error) {
    console.error("Error fetching user favorites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 