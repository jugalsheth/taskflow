import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { checklistInstances } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

// GET /api/checklists/[id] - Get specific checklist instance with progress
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: instanceId } = await params;

    const instance = await db.query.checklistInstances.findFirst({
      where: and(
        eq(checklistInstances.id, instanceId),
        eq(checklistInstances.userId, session.user.id)
      ),
      with: {
        template: {
          with: {
            steps: {
              orderBy: (steps) => [steps.orderIndex]
            }
          }
        },
        instanceSteps: {
          with: {
            step: true
          }
        }
      }
    });

    if (!instance) {
      return NextResponse.json({ error: "Checklist instance not found" }, { status: 404 });
    }

    // Calculate progress
    const totalSteps = instance.instanceSteps.length;
    const completedSteps = instance.instanceSteps.filter(step => step.isCompleted).length;
    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    return NextResponse.json({
      ...instance,
      progress,
      totalSteps,
      completedSteps
    });
  } catch (error) {
    console.error("Error fetching checklist instance:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/checklists/[id]/complete - Mark entire checklist as complete
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: instanceId } = await params;
    const { action } = await request.json();

    if (action === "complete") {
      const [updatedInstance] = await db
        .update(checklistInstances)
        .set({
          status: "completed",
          completedAt: new Date()
        })
        .where(and(
          eq(checklistInstances.id, instanceId),
          eq(checklistInstances.userId, session.user.id)
        ))
        .returning();

      if (!updatedInstance) {
        return NextResponse.json({ error: "Checklist instance not found" }, { status: 404 });
      }

      return NextResponse.json(updatedInstance);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating checklist instance:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 