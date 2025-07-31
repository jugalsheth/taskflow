import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { checklistInstances, checklistInstanceSteps } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

// PUT /api/checklists/[id]/steps/[stepId] - Mark step as complete/incomplete
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: instanceId, stepId } = await params;
    const { isCompleted } = await request.json();

    // Verify the instance belongs to the user
    const instance = await db.query.checklistInstances.findFirst({
      where: and(
        eq(checklistInstances.id, instanceId),
        eq(checklistInstances.userId, session.user.id)
      )
    });

    if (!instance) {
      return NextResponse.json({ error: "Checklist instance not found" }, { status: 404 });
    }

    // Update the step completion status
    const [updatedStep] = await db
      .update(checklistInstanceSteps)
      .set({
        isCompleted,
        completedAt: isCompleted ? new Date() : null
      })
      .where(and(
        eq(checklistInstanceSteps.instanceId, instanceId),
        eq(checklistInstanceSteps.stepId, stepId)
      ))
      .returning();

    if (!updatedStep) {
      return NextResponse.json({ error: "Step not found" }, { status: 404 });
    }

    return NextResponse.json(updatedStep);
  } catch (error) {
    console.error("Error updating step:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 