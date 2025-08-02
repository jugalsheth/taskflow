import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { teams, teamMembers, teamInvitations } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { sendTeamInvitationEmail } from "@/lib/email";

// POST /api/teams/[id]/invitations/[invitationId]/resend - Resend team invitation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; invitationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, invitationId } = await params;

    // Check if user is owner/admin of the team
    const membership = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, id),
          eq(teamMembers.userId, session.user.id),
          eq(teamMembers.role, "owner")
        )
      );

    // Also check for admin role
    const adminMembership = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, id),
          eq(teamMembers.userId, session.user.id),
          eq(teamMembers.role, "admin")
        )
      );

    if (membership.length === 0 && adminMembership.length === 0) {
      return NextResponse.json({ error: "Not authorized to resend invitations" }, { status: 403 });
    }

    // Get the invitation
    const invitation = await db
      .select()
      .from(teamInvitations)
      .where(eq(teamInvitations.id, invitationId));

    if (invitation.length === 0) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    const invitationData = invitation[0];

    // Check if invitation is still pending
    if (invitationData.status !== "pending") {
      return NextResponse.json({ error: "Invitation is not pending" }, { status: 400 });
    }

    // Get team details for email
    const team = await db
      .select()
      .from(teams)
      .where(eq(teams.id, id));

    if (team.length === 0) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Resend email invitation
    const invitationUrl = `${process.env.NEXTAUTH_URL}/invitations/${invitationData.token}`;
    
    try {
      const emailResult = await sendTeamInvitationEmail({
        to: invitationData.invitedEmail,
        teamName: team[0].name,
        inviterName: session.user.name || session.user.email || 'A team member',
        invitationUrl,
        expiresAt: invitationData.expiresAt,
      });

      if (!emailResult.success) {
        console.error('Email sending failed:', emailResult.error);
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
      }
    } catch (emailError) {
      console.error('Email service error:', emailError);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ message: "Invitation resent successfully" });
  } catch (error) {
    console.error("Error resending invitation:", error);
    return NextResponse.json({ error: "Failed to resend invitation" }, { status: 500 });
  }
} 