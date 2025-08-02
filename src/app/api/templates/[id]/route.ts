import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { checklistTemplates, checklistSteps, users, teamTemplates, teamMembers } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

// GET /api/templates/[id] - Get a single template with steps
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

    // Get template with owner information
    const templateData = await db
      .select({
        id: checklistTemplates.id,
        title: checklistTemplates.title,
        createdAt: checklistTemplates.createdAt,
        updatedAt: checklistTemplates.updatedAt,
        userId: checklistTemplates.userId,
        ownerName: users.name,
        ownerEmail: users.email,
      })
      .from(checklistTemplates)
      .innerJoin(users, eq(checklistTemplates.userId, users.id))
      .where(eq(checklistTemplates.id, templateId))
      .limit(1);

    if (templateData.length === 0) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const template = templateData[0];

    // Check if user has access to this template
    const hasAccess = template.userId === session.user.id;

    // If user doesn't own the template, check if they have access through team membership
    if (!hasAccess) {
      const teamAccess = await db
        .select()
        .from(teamTemplates)
        .innerJoin(teamMembers, eq(teamTemplates.teamId, teamMembers.teamId))
        .where(
          and(
            eq(teamTemplates.templateId, templateId),
            eq(teamMembers.userId, session.user.id),
            eq(teamTemplates.status, "active")
          )
        )
        .limit(1);

      if (teamAccess.length === 0) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    // Get template steps
    const stepsData = await db
      .select({
        id: checklistSteps.id,
        stepText: checklistSteps.stepText,
        orderIndex: checklistSteps.orderIndex,
      })
      .from(checklistSteps)
      .where(eq(checklistSteps.templateId, templateId))
      .orderBy(checklistSteps.orderIndex);

    // Format the response
    const templateWithSteps = {
      id: template.id,
      title: template.title,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
      userId: template.userId,
      stepCount: stepsData.length,
      steps: stepsData,
      owner: {
        name: template.ownerName,
        email: template.ownerEmail,
      },
    };

    return NextResponse.json({ template: templateWithSteps });
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/templates/[id] - Update a template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: templateId } = await params;
  
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const body = await request.json();
    const { title, steps } = body;

    // Validation
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(steps) || steps.length === 0) {
      return NextResponse.json(
        { error: "At least one step is required" },
        { status: 400 }
      );
    }

    // Validate steps
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (!step.text || typeof step.text !== "string" || step.text.trim().length === 0) {
        return NextResponse.json(
          { error: `Step ${i + 1} text is required` },
          { status: 400 }
        );
      }
    }

    // Check ownership
    const existingTemplate = await db
      .select()
      .from(checklistTemplates)
      .where(
        and(
          eq(checklistTemplates.id, templateId),
          eq(checklistTemplates.userId, session.user.id)
        )
      )
      .limit(1);

    if (existingTemplate.length === 0) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Update template
    const [updatedTemplate] = await db
      .update(checklistTemplates)
      .set({
        title: title.trim(),
        updatedAt: new Date(),
      })
      .where(eq(checklistTemplates.id, templateId))
      .returning();

    // Delete existing steps
    await db
      .delete(checklistSteps)
      .where(eq(checklistSteps.templateId, templateId));

    // Create new steps
    const stepValues = steps.map((step: { text: string }, index: number) => ({
      templateId: templateId,
      stepText: step.text.trim(),
      orderIndex: index,
    }));

    await db.insert(checklistSteps).values(stepValues);

    return NextResponse.json({
      message: "Template updated successfully",
      template: updatedTemplate,
    });
  } catch (error) {
    console.error("PUT /api/templates/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/templates/[id] - Delete a template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: templateId } = await params;
  
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check ownership
    const existingTemplate = await db
      .select()
      .from(checklistTemplates)
      .where(
        and(
          eq(checklistTemplates.id, templateId),
          eq(checklistTemplates.userId, session.user.id)
        )
      )
      .limit(1);

    if (existingTemplate.length === 0) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Delete template (steps will be deleted automatically due to CASCADE)
    await db
      .delete(checklistTemplates)
      .where(eq(checklistTemplates.id, templateId));

    return NextResponse.json({
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/templates/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 