import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { teamMembers } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

// DELETE /api/teams/[id]/members/[userId] - Remove member from team
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: teamId, userId } = await params;

    // Check if user is a member of the team
    const userMembership = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, session.user.id)
        )
      );

    if (userMembership.length === 0) {
      return NextResponse.json({ error: "Not a member of this team" }, { status: 403 });
    }

    // Check if user is trying to remove themselves
    if (session.user.id === userId) {
      return NextResponse.json({ error: "Cannot remove yourself from the team" }, { status: 400 });
    }

    // Check if user is owner (only owner can remove members)
    const isOwner = userMembership[0].role === "owner";
    if (!isOwner) {
      return NextResponse.json({ error: "Only team owner can remove members" }, { status: 403 });
    }

    // Check if target user is a member
    const targetMembership = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, userId)
        )
      );

    if (targetMembership.length === 0) {
      return NextResponse.json({ error: "User is not a member of this team" }, { status: 404 });
    }

    // Remove the member
    await db
      .delete(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, userId)
        )
      );

    return NextResponse.json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Error removing team member:", error);
    return NextResponse.json({ error: "Failed to remove team member" }, { status: 500 });
  }
}

// PUT /api/teams/[id]/members/[userId] - Update member role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: teamId, userId } = await params;
    const body = await request.json();
    const { role } = body;

    if (!role || !["member", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role. Must be 'member' or 'admin'" }, { status: 400 });
    }

    // Check if user is a member of the team
    const userMembership = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, session.user.id)
        )
      );

    if (userMembership.length === 0) {
      return NextResponse.json({ error: "Not a member of this team" }, { status: 403 });
    }

    // Check if user is owner (only owner can update roles)
    const isOwner = userMembership[0].role === "owner";
    if (!isOwner) {
      return NextResponse.json({ error: "Only team owner can update member roles" }, { status: 403 });
    }

    // Check if target user is a member
    const targetMembership = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, userId)
        )
      );

    if (targetMembership.length === 0) {
      return NextResponse.json({ error: "User is not a member of this team" }, { status: 404 });
    }

    // Check if trying to change owner role
    if (targetMembership[0].role === "owner") {
      return NextResponse.json({ error: "Cannot change owner role" }, { status: 400 });
    }

    // Update the member role
    await db
      .update(teamMembers)
      .set({ role })
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, userId)
        )
      );

    return NextResponse.json({ message: "Member role updated successfully" });
  } catch (error) {
    console.error("Error updating team member role:", error);
    return NextResponse.json({ error: "Failed to update team member role" }, { status: 500 });
  }
} 