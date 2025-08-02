import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { teamTemplates, teamMembers } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

// DELETE /api/teams/[id]/templates/[templateId] - Remove template from team
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; templateId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: teamId, templateId } = await params;

    // Check if user is an admin or owner of the team
    const teamMember = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, session.user.id),
          eq(teamMembers.role, "admin")
        )
      )
      .limit(1);

    if (teamMember.length === 0) {
      // Check if user is the owner
      const ownerMember = await db
        .select()
        .from(teamMembers)
        .where(
          and(
            eq(teamMembers.teamId, teamId),
            eq(teamMembers.userId, session.user.id),
            eq(teamMembers.role, "owner")
          )
        )
        .limit(1);

      if (ownerMember.length === 0) {
        return NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 }
        );
      }
    }

    // Soft delete by setting status to 'removed'
    const [removedTemplate] = await db
      .update(teamTemplates)
      .set({ status: "removed", updatedAt: new Date() })
      .where(
        and(
          eq(teamTemplates.teamId, teamId),
          eq(teamTemplates.templateId, templateId),
          eq(teamTemplates.status, "active")
        )
      )
      .returning();

    if (!removedTemplate) {
      return NextResponse.json(
        { error: "Template not found or already removed" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Template removed from team successfully",
      removedTemplate,
    });
  } catch (error) {
    console.error("Error removing template from team:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/teams/[id]/templates/[templateId]/official - Mark as official team template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; templateId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: teamId, templateId } = await params;
    const { isOfficial } = await request.json();

    // Check if user is an admin or owner of the team
    const teamMember = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, session.user.id),
          eq(teamMembers.role, "admin")
        )
      )
      .limit(1);

    if (teamMember.length === 0) {
      // Check if user is the owner
      const ownerMember = await db
        .select()
        .from(teamMembers)
        .where(
          and(
            eq(teamMembers.teamId, teamId),
            eq(teamMembers.userId, session.user.id),
            eq(teamMembers.role, "owner")
          )
        )
        .limit(1);

      if (ownerMember.length === 0) {
        return NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 }
        );
      }
    }

    // Update the official status
    const [updatedTemplate] = await db
      .update(teamTemplates)
      .set({ 
        isOfficial: Boolean(isOfficial), 
        updatedAt: new Date() 
      })
      .where(
        and(
          eq(teamTemplates.teamId, teamId),
          eq(teamTemplates.templateId, templateId),
          eq(teamTemplates.status, "active")
        )
      )
      .returning();

    if (!updatedTemplate) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Template ${isOfficial ? "marked as" : "unmarked from"} official successfully`,
      updatedTemplate,
    });
  } catch (error) {
    console.error("Error updating template official status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 