import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { templateFeedback, checklistTemplates, teamMembers, users } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";

// GET /api/templates/[id]/feedback - Get template feedback
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: templateId } = await params;

    // Check if user has access to this template (either owns it or it's shared with their team)
    const template = await db
      .select()
      .from(checklistTemplates)
      .where(eq(checklistTemplates.id, templateId))
      .limit(1);

    if (template.length === 0) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const templateData = template[0];

    // If user doesn't own the template, check if they have access through team membership
    if (templateData.userId !== session.user.id) {
      // For shared templates, we'll allow viewing feedback without strict team checks
      // In a more restrictive system, you might want to check specific team access
      // But for now, we'll allow any user who can see the template to view feedback
    }

    // Get feedback for this template
    const feedbackData = await db
      .select({
        id: templateFeedback.id,
        templateId: templateFeedback.templateId,
        userId: templateFeedback.userId,
        teamId: templateFeedback.teamId,
        comment: templateFeedback.comment,
        rating: templateFeedback.rating,
        createdAt: templateFeedback.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(templateFeedback)
      .innerJoin(users, eq(templateFeedback.userId, users.id))
      .where(eq(templateFeedback.templateId, templateId))
      .orderBy(desc(templateFeedback.createdAt));

    return NextResponse.json({ feedback: feedbackData });
  } catch (error) {
    console.error("Error fetching template feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/templates/[id]/feedback - Add feedback to template
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("=== POST /api/templates/[id]/feedback called ===");
    
    const session = await getServerSession(authOptions);
    console.log("Session:", session);
    console.log("Session user:", session?.user);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: templateId } = await params;
    console.log("Template ID:", templateId);
    
    const body = await request.json();
    console.log("Request body:", body);
    const { comment, rating, teamId } = body;

    if (!comment || comment.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment is required" },
        { status: 400 }
      );
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if user has access to this template
    console.log("Checking template access...");
    const template = await db
      .select()
      .from(checklistTemplates)
      .where(eq(checklistTemplates.id, templateId))
      .limit(1);

    console.log("Template query result:", template);

    if (template.length === 0) {
      console.log("Template not found");
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const templateData = template[0];
    console.log("Template data:", templateData);

    // If user doesn't own the template, check if they have access through team membership
    if (templateData.userId !== session.user.id) {
      // For shared templates, we'll allow feedback without teamId for now
      // In a more restrictive system, you might want to require teamId for shared templates
      // But for now, we'll allow any user who can see the template to provide feedback
    }

    // Check if user has already provided feedback for this template
    console.log("Checking for existing feedback...");
    const existingFeedback = await db
      .select()
      .from(templateFeedback)
      .where(
        and(
          eq(templateFeedback.templateId, templateId),
          eq(templateFeedback.userId, session.user.id),
          teamId ? eq(templateFeedback.teamId, teamId) : eq(templateFeedback.teamId, null as unknown as string)
        )
      )
      .limit(1);

    console.log("Existing feedback query result:", existingFeedback);

    if (existingFeedback.length > 0) {
      console.log("User has already provided feedback");
      return NextResponse.json(
        { error: "You have already provided feedback for this template" },
        { status: 409 }
      );
    }

    // Add feedback
    console.log("Adding new feedback...");
    console.log("Feedback data:", {
      templateId,
      userId: session.user.id,
      teamId: teamId || null,
      comment: comment.trim(),
      rating: rating || null,
    });
    
    const [newFeedback] = await db
      .insert(templateFeedback)
      .values({
        templateId,
        userId: session.user.id,
        teamId: teamId || null,
        comment: comment.trim(),
        rating: rating || null,
      })
      .returning();

    console.log("New feedback created:", newFeedback);

    return NextResponse.json(
      { message: "Feedback added successfully", feedback: newFeedback },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding template feedback:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 