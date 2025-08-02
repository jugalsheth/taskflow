import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { teams, teamMembers, teamInvitations } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { randomBytes } from "crypto";
import { sendTeamInvitationEmail } from "@/lib/email";

// POST /api/teams/[id]/invite - Send team invitation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { email } = body;

    // Validation
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Check if user has permission to invite (owner or admin)
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

    const userRole = userMembership[0].role;
    if (userRole !== "owner" && userRole !== "admin") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Check if team exists
    const team = await db
      .select()
      .from(teams)
      .where(eq(teams.id, id));

    if (team.length === 0) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check if user is already a member (this check is not needed for invitation flow)
    // const existingMember = await db
    //   .select()
    //   .from(teamMembers)
    //   .leftJoin(teams, eq(teamMembers.teamId, teams.id))
    //   .where(
    //     and(
    //       eq(teams.id, id),
    //       eq(teams.ownerId, session.user.id)
    //     )
    //   );

    // Check if invitation already exists
    const existingInvitation = await db
      .select()
      .from(teamInvitations)
      .where(
        and(
          eq(teamInvitations.teamId, id),
          eq(teamInvitations.invitedEmail, email.toLowerCase()),
          eq(teamInvitations.status, "pending")
        )
      );

    if (existingInvitation.length > 0) {
      return NextResponse.json(
        { error: "Invitation already sent to this email" },
        { status: 400 }
      );
    }

    // Generate invitation token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    // Create invitation
    const [newInvitation] = await db
      .insert(teamInvitations)
      .values({
        teamId: id,
        invitedEmail: email.toLowerCase(),
        invitedBy: session.user.id,
        token,
        status: "pending",
        expiresAt,
      })
      .returning();

    // Send email invitation
    const invitationUrl = `${process.env.NEXTAUTH_URL}/invitations/${token}`;
    
    try {
      const emailResult = await sendTeamInvitationEmail({
        to: email.toLowerCase(),
        teamName: team[0].name,
        inviterName: session.user.name || session.user.email || 'A team member',
        invitationUrl,
        expiresAt,
      });

      if (!emailResult.success) {
        console.error('Email sending failed:', emailResult.error);
        // Still create the invitation, but log the email failure
      }
    } catch (emailError) {
      console.error('Email service error:', emailError);
      // Continue with invitation creation even if email fails
    }

    return NextResponse.json(
      { 
        message: "Invitation sent successfully",
        invitation: {
          id: newInvitation.id,
          email: newInvitation.invitedEmail,
          expiresAt: newInvitation.expiresAt,
          token: newInvitation.token, // In production, don't return the token
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error sending team invitation:", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
} 