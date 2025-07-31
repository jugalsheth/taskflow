import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { checklistTemplates, checklistSteps } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

// GET /api/templates/[id] - Get a specific template with its steps
export async function GET(
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

    // Get template with ownership check
    const template = await db
      .select()
      .from(checklistTemplates)
      .where(
        and(
          eq(checklistTemplates.id, templateId),
          eq(checklistTemplates.userId, session.user.id)
        )
      )
      .limit(1);

    if (template.length === 0) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Get steps for this template
    const steps = await db
      .select()
      .from(checklistSteps)
      .where(eq(checklistSteps.templateId, templateId))
      .orderBy(checklistSteps.orderIndex);

    return NextResponse.json({
      template: template[0],
      steps: steps,
    });
  } catch (error) {
    console.error("GET /api/templates/[id] error:", error);
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