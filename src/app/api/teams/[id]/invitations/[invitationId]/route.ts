import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { teamMembers, teamInvitations } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

// DELETE /api/teams/[id]/invitations/[invitationId] - Cancel team invitation
export async function DELETE(
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
      return NextResponse.json({ error: "Not authorized to cancel invitations" }, { status: 403 });
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

    // Cancel the invitation by updating status
    await db
      .update(teamInvitations)
      .set({ 
        status: "cancelled", 
        updatedAt: new Date() 
      })
      .where(eq(teamInvitations.id, invitationId));

    return NextResponse.json({ message: "Invitation cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling invitation:", error);
    return NextResponse.json({ error: "Failed to cancel invitation" }, { status: 500 });
  }
} 