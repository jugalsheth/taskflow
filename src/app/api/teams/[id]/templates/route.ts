import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { teamTemplates, teamMembers, checklistTemplates, users } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";

// GET /api/teams/[id]/templates - Get all templates shared with team
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: teamId } = await params;

    // Check if user is a member of the team
    const teamMember = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, session.user.id)
        )
      )
      .limit(1);

    if (teamMember.length === 0) {
      return NextResponse.json({ error: "Not a team member" }, { status: 403 });
    }

    // Get team templates with related data
    const teamTemplatesData = await db
      .select({
        id: teamTemplates.id,
        teamId: teamTemplates.teamId,
        templateId: teamTemplates.templateId,
        sharedBy: teamTemplates.sharedBy,
        sharedAt: teamTemplates.sharedAt,
        isOfficial: teamTemplates.isOfficial,
        status: teamTemplates.status,
        createdAt: teamTemplates.createdAt,
        updatedAt: teamTemplates.updatedAt,
        templateTitle: checklistTemplates.title,
        templateCreatedAt: checklistTemplates.createdAt,
        templateUpdatedAt: checklistTemplates.updatedAt,
        templateOwnerId: checklistTemplates.userId,
        sharedByName: users.name,
        sharedByEmail: users.email,
      })
      .from(teamTemplates)
      .innerJoin(checklistTemplates, eq(teamTemplates.templateId, checklistTemplates.id))
      .innerJoin(users, eq(teamTemplates.sharedBy, users.id))
      .where(
        and(
          eq(teamTemplates.teamId, teamId),
          eq(teamTemplates.status, "active")
        )
      )
      .orderBy(desc(teamTemplates.isOfficial), desc(teamTemplates.sharedAt));

    return NextResponse.json({ teamTemplates: teamTemplatesData });
  } catch (error) {
    console.error("Error fetching team templates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/teams/[id]/templates - Share template with team
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: teamId } = await params;
    const { templateId } = await request.json();

    if (!templateId) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

    // Check if user is a member of the team
    const teamMember = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, session.user.id)
        )
      )
      .limit(1);

    if (teamMember.length === 0) {
      return NextResponse.json({ error: "Not a team member" }, { status: 403 });
    }

    // Check if user owns the template
    const template = await db
      .select()
      .from(checklistTemplates)
      .where(
        and(
          eq(checklistTemplates.id, templateId),
          eq(checklistTemplates.userId, session.user.id)
        )
      )
      .limit(1);

    if (template.length === 0) {
      return NextResponse.json(
        { error: "Template not found or not owned by user" },
        { status: 404 }
      );
    }

    // Check if template is already shared with the team
    const existingShare = await db
      .select()
      .from(teamTemplates)
      .where(
        and(
          eq(teamTemplates.teamId, teamId),
          eq(teamTemplates.templateId, templateId),
          eq(teamTemplates.status, "active")
        )
      )
      .limit(1);

    if (existingShare.length > 0) {
      return NextResponse.json(
        { error: "Template is already shared with this team" },
        { status: 409 }
      );
    }

    // Share the template with the team
    const [sharedTemplate] = await db
      .insert(teamTemplates)
      .values({
        teamId,
        templateId,
        sharedBy: session.user.id,
        sharedAt: new Date(),
        isOfficial: false,
        status: "active",
      })
      .returning();

    return NextResponse.json(
      { message: "Template shared successfully", teamTemplate: sharedTemplate },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error sharing template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 