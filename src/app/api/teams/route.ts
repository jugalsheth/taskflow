import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { teams, teamMembers } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

// GET /api/teams - Get user's teams
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get teams where user is a member
    const userTeams = await db
      .select({
        id: teams.id,
        name: teams.name,
        description: teams.description,
        privacyLevel: teams.privacyLevel,
        createdAt: teams.createdAt,
        updatedAt: teams.updatedAt,
        role: teamMembers.role,
      })
      .from(teams)
      .innerJoin(teamMembers, eq(teams.id, teamMembers.teamId))
      .where(eq(teamMembers.userId, session.user.id));

    return NextResponse.json({ teams: userTeams });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}

// POST /api/teams - Create new team
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, privacyLevel = "private" } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Team name is required" },
        { status: 400 }
      );
    }

    if (name.length > 255) {
      return NextResponse.json(
        { error: "Team name must be 255 characters or less" },
        { status: 400 }
      );
    }

    // Check if user already has a team with this name
    const existingTeam = await db
      .select()
      .from(teams)
      .where(
        and(
          eq(teams.ownerId, session.user.id),
          eq(teams.name, name.trim())
        )
      );

    if (existingTeam.length > 0) {
      return NextResponse.json(
        { error: "You already have a team with this name" },
        { status: 400 }
      );
    }

    // Create team
    const [newTeam] = await db
      .insert(teams)
      .values({
        name: name.trim(),
        description: description?.trim() || null,
        ownerId: session.user.id,
        privacyLevel,
      })
      .returning();

    // Add team owner as first member
    await db.insert(teamMembers).values({
      teamId: newTeam.id,
      userId: session.user.id,
      role: "owner",
    });

    return NextResponse.json(
      { 
        message: "Team created successfully",
        team: newTeam 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }
} 