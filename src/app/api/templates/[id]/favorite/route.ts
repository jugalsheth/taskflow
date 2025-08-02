import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { templateFavorites, checklistTemplates, teamMembers } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

// POST /api/templates/[id]/favorite - Add template to favorites
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: templateId } = await params;
    
    // Try to parse request body, but make teamId optional
    let teamId: string | null = null;
    try {
      const body = await request.json();
      teamId = body.teamId || null;
    } catch (error) {
      // If no body or invalid JSON, teamId remains null
      teamId = null;
    }

    // Check if template exists and user has access to it
    const template = await db
      .select()
      .from(checklistTemplates)
      .where(eq(checklistTemplates.id, templateId))
      .limit(1);

    if (template.length === 0) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const templateData = template[0];

    // If user doesn't own the template, check if they have access through team membership
    if (templateData.userId !== session.user.id) {
      // For shared templates, we need to check team access
      // But we'll allow favoriting without teamId for now (user can favorite any template they can see)
      // In a more restrictive system, you might want to require teamId for shared templates
    }

    // Check if template is already favorited
    const existingFavorite = await db
      .select()
      .from(templateFavorites)
      .where(
        and(
          eq(templateFavorites.templateId, templateId),
          eq(templateFavorites.userId, session.user.id),
          teamId ? eq(templateFavorites.teamId, teamId) : eq(templateFavorites.teamId, null as unknown as string)
        )
      )
      .limit(1);

    if (existingFavorite.length > 0) {
      return NextResponse.json(
        { error: "Template is already in your favorites" },
        { status: 409 }
      );
    }

    // Add to favorites
    const [newFavorite] = await db
      .insert(templateFavorites)
      .values({
        userId: session.user.id,
        templateId,
        teamId: teamId || null,
      })
      .returning();

    return NextResponse.json(
      { message: "Template added to favorites", favorite: newFavorite },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding template to favorites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/templates/[id]/favorite - Remove template from favorites
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: templateId } = await params;
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");

    // Remove from favorites - try both with and without teamId
    let removedFavorite;
    
    if (teamId) {
      // Try to remove with specific teamId
      [removedFavorite] = await db
        .delete(templateFavorites)
        .where(
          and(
            eq(templateFavorites.templateId, templateId),
            eq(templateFavorites.userId, session.user.id),
            eq(templateFavorites.teamId, teamId)
          )
        )
        .returning();
    }
    
    if (!removedFavorite) {
      // If not found with teamId, try without teamId (user's own templates)
      [removedFavorite] = await db
        .delete(templateFavorites)
        .where(
          and(
            eq(templateFavorites.templateId, templateId),
            eq(templateFavorites.userId, session.user.id),
            eq(templateFavorites.teamId, null as unknown as string)
          )
        )
        .returning();
    }

    if (!removedFavorite) {
      return NextResponse.json(
        { error: "Template not found in favorites" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Template removed from favorites",
      removedFavorite,
    });
  } catch (error) {
    console.error("Error removing template from favorites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 