import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { teams, teamMembers, teamInvitations } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

// GET /api/teams/[id]/invitations - Get team invitations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if user is a member of the team
    const membership = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, id),
          eq(teamMembers.userId, session.user.id)
        )
      );

    if (membership.length === 0) {
      return NextResponse.json({ error: "Not a member of this team" }, { status: 403 });
    }

    // Get team details
    const team = await db
      .select()
      .from(teams)
      .where(eq(teams.id, id));

    if (team.length === 0) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Get all invitations for this team
    const invitations = await db
      .select({
        id: teamInvitations.id,
        invitedEmail: teamInvitations.invitedEmail,
        status: teamInvitations.status,
        createdAt: teamInvitations.createdAt,
        expiresAt: teamInvitations.expiresAt,
      })
      .from(teamInvitations)
      .where(eq(teamInvitations.teamId, id))
      .orderBy(teamInvitations.createdAt);

    return NextResponse.json({
      invitations,
      team: {
        id: team[0].id,
        name: team[0].name,
        description: team[0].description,
        privacyLevel: team[0].privacyLevel,
      },
    });
  } catch (error) {
    console.error("Error fetching team invitations:", error);
    return NextResponse.json({ error: "Failed to fetch invitations" }, { status: 500 });
  }
} 