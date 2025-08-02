import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { teams, teamMembers, teamInvitations, users } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

// GET /api/teams/[id] - Get team details with members
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

    // Check if user is a member of this team
    const userMembership = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, id),
          eq(teamMembers.userId, session.user.id)
        )
      );

    if (userMembership.length === 0) {
      return NextResponse.json({ error: "Team not found or access denied" }, { status: 404 });
    }

    // Get team details
    const teamDetails = await db
      .select({
        id: teams.id,
        name: teams.name,
        description: teams.description,
        privacyLevel: teams.privacyLevel,
        createdAt: teams.createdAt,
        updatedAt: teams.updatedAt,
        ownerId: teams.ownerId,
        ownerName: users.name,
        ownerEmail: users.email,
      })
      .from(teams)
      .leftJoin(users, eq(teams.ownerId, users.id))
      .where(eq(teams.id, id));

    if (teamDetails.length === 0) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const team = teamDetails[0];

    // Get team members
    const members = await db
      .select({
        id: teamMembers.id,
        userId: teamMembers.userId,
        role: teamMembers.role,
        joinedAt: teamMembers.joinedAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(teamMembers)
      .leftJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.teamId, id));

    // Get pending invitations count
    const pendingInvitations = await db
      .select({ id: teamInvitations.id })
      .from(teamInvitations)
      .where(
        and(
          eq(teamInvitations.teamId, id),
          eq(teamInvitations.status, "pending")
        )
      );

    // Get user's role in this team
    const userRole = userMembership[0].role;

    return NextResponse.json({
      team: {
        ...team,
        memberCount: members.length,
        invitationCount: pendingInvitations.length,
        userRole,
      },
      members,
      pendingInvitations: pendingInvitations.length,
    });
  } catch (error) {
    console.error("Error fetching team details:", error);
    return NextResponse.json(
      { error: "Failed to fetch team details" },
      { status: 500 }
    );
  }
} 