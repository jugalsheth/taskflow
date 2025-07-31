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
    console.log("=== PUT /api/checklists/[id]/steps/[stepId] called ===");
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log("No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: instanceId, stepId } = await params;
    console.log("Instance ID:", instanceId);
    console.log("Step ID:", stepId);
    const body = await request.json();
    console.log("Request body:", body);
    const { isCompleted } = body;

    console.log("Looking for instance with ID:", instanceId);
    console.log("User ID:", session.user.id);
    
    // Verify the instance belongs to the user
    const instance = await db.query.checklistInstances.findFirst({
      where: and(
        eq(checklistInstances.id, instanceId),
        eq(checklistInstances.userId, session.user.id)
      )
    });

    console.log("Instance found:", instance);

    if (!instance) {
      console.log("Instance not found");
      return NextResponse.json({ error: "Checklist instance not found" }, { status: 404 });
    }

    console.log("Updating step with instance ID:", instanceId);
    console.log("Updating step with step ID:", stepId);
    
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

    console.log("Updated step result:", updatedStep);

    if (!updatedStep) {
      console.log("Step not found in database");
      return NextResponse.json({ error: "Step not found" }, { status: 404 });
    }

    return NextResponse.json(updatedStep);
  } catch (error) {
    console.error("Error updating step:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 