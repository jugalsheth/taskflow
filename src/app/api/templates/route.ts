import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { checklistTemplates, checklistSteps } from "@/lib/schema";
import { eq } from "drizzle-orm";

// GET /api/templates - Get all templates for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const templates = await db
      .select({
        id: checklistTemplates.id,
        title: checklistTemplates.title,
        createdAt: checklistTemplates.createdAt,
        updatedAt: checklistTemplates.updatedAt,
        stepCount: checklistSteps.id,
      })
      .from(checklistTemplates)
      .leftJoin(checklistSteps, eq(checklistTemplates.id, checklistSteps.templateId))
      .where(eq(checklistTemplates.userId, session.user.id))
      .groupBy(checklistTemplates.id, checklistTemplates.title, checklistTemplates.createdAt, checklistTemplates.updatedAt);

    return NextResponse.json(templates);
  } catch (error) {
    console.error("GET /api/templates error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/templates - Create a new template
export async function POST(request: NextRequest) {
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

    // Create template
    const [newTemplate] = await db
      .insert(checklistTemplates)
      .values({
        userId: session.user.id,
        title: title.trim(),
      })
      .returning();

    // Create steps
    const stepValues = steps.map((step: { text: string }, index: number) => ({
      templateId: newTemplate.id,
      stepText: step.text.trim(),
      orderIndex: index,
    }));

    await db.insert(checklistSteps).values(stepValues);

    return NextResponse.json(
      { 
        message: "Template created successfully",
        template: newTemplate
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/templates error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 