import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { teamInvitations, teams, users, teamMembers } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

// GET /api/invitations/[token] - Get invitation details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Get invitation details
    const invitationDetails = await db
      .select({
        id: teamInvitations.id,
        teamId: teamInvitations.teamId,
        invitedEmail: teamInvitations.invitedEmail,
        status: teamInvitations.status,
        expiresAt: teamInvitations.expiresAt,
        createdAt: teamInvitations.createdAt,
        teamName: teams.name,
        teamDescription: teams.description,
        inviterName: users.name,
        inviterEmail: users.email,
      })
      .from(teamInvitations)
      .leftJoin(teams, eq(teamInvitations.teamId, teams.id))
      .leftJoin(users, eq(teamInvitations.invitedBy, users.id))
      .where(eq(teamInvitations.token, token));

    if (invitationDetails.length === 0) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    const invitation = invitationDetails[0];

    // Check if invitation is expired
    if (new Date() > new Date(invitation.expiresAt)) {
      return NextResponse.json({ 
        error: "Invitation has expired",
        invitation: {
          ...invitation,
          status: "expired"
        }
      }, { status: 400 });
    }

    // Check if invitation is already processed
    if (invitation.status !== "pending") {
      return NextResponse.json({ 
        error: `Invitation has already been ${invitation.status}`,
        invitation
      }, { status: 400 });
    }

    return NextResponse.json({ invitation });
  } catch (error) {
    console.error("Error fetching invitation details:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitation details" },
      { status: 500 }
    );
  }
}

// POST /api/invitations/[token]/accept - Accept invitation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await params;
    const body = await request.json();
    const { action } = body; // 'accept' or 'decline'

    if (!action || (action !== "accept" && action !== "decline")) {
      return NextResponse.json(
        { error: "Action must be 'accept' or 'decline'" },
        { status: 400 }
      );
    }

    // Get invitation details
    const invitationDetails = await db
      .select()
      .from(teamInvitations)
      .where(eq(teamInvitations.token, token));

    if (invitationDetails.length === 0) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    const invitation = invitationDetails[0];

    // Check if invitation is expired
    if (new Date() > new Date(invitation.expiresAt)) {
      return NextResponse.json({ error: "Invitation has expired" }, { status: 400 });
    }

    // Check if invitation is already processed
    if (invitation.status !== "pending") {
      return NextResponse.json({ 
        error: `Invitation has already been ${invitation.status}` 
      }, { status: 400 });
    }

    // Check if user email matches invitation email
    if (session.user.email !== invitation.invitedEmail) {
      return NextResponse.json({ 
        error: "This invitation was sent to a different email address" 
      }, { status: 403 });
    }

    if (action === "accept") {
      // Check if user is already a member
      const existingMembership = await db
        .select()
        .from(teamMembers)
        .where(
          and(
            eq(teamMembers.teamId, invitation.teamId),
            eq(teamMembers.userId, session.user.id)
          )
        );

      if (existingMembership.length > 0) {
        return NextResponse.json({ 
          error: "You are already a member of this team" 
        }, { status: 400 });
      }

      // Add user to team
      await db.insert(teamMembers).values({
        teamId: invitation.teamId,
        userId: session.user.id,
        role: "member",
      });

      // Update invitation status
      await db
        .update(teamInvitations)
        .set({ status: "accepted", updatedAt: new Date() })
        .where(eq(teamInvitations.id, invitation.id));

      return NextResponse.json({ 
        message: "Successfully joined the team",
        teamId: invitation.teamId
      });
    } else {
      // Decline invitation
      await db
        .update(teamInvitations)
        .set({ status: "declined", updatedAt: new Date() })
        .where(eq(teamInvitations.id, invitation.id));

      return NextResponse.json({ 
        message: "Invitation declined" 
      });
    }
  } catch (error) {
    console.error("Error processing invitation:", error);
    return NextResponse.json(
      { error: "Failed to process invitation" },
      { status: 500 }
    );
  }
} 