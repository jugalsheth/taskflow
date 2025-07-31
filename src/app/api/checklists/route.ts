import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { checklistInstances, checklistTemplates, checklistInstanceSteps } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";

// POST /api/checklists - Start new checklist instance
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { templateId } = await request.json();
    
    if (!templateId) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
    }

    // Verify template exists and belongs to user
    const template = await db.query.checklistTemplates.findFirst({
      where: and(
        eq(checklistTemplates.id, templateId),
        eq(checklistTemplates.userId, session.user.id)
      ),
      with: {
        steps: {
          orderBy: (steps) => [steps.orderIndex]
        }
      }
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Create new checklist instance
    const [newInstance] = await db.insert(checklistInstances).values({
      templateId,
      userId: session.user.id,
      status: "in_progress"
    }).returning();

    // Create instance steps for all template steps
    const instanceStepsData = template.steps.map(step => ({
      instanceId: newInstance.id,
      stepId: step.id,
      isCompleted: false
    }));

    if (instanceStepsData.length > 0) {
      await db.insert(checklistInstanceSteps).values(instanceStepsData);
    }

    return NextResponse.json(newInstance);
  } catch (error) {
    console.error("Error creating checklist instance:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/checklists - Get user's active checklists
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const instances = await db.query.checklistInstances.findMany({
      where: eq(checklistInstances.userId, session.user.id),
      with: {
        template: true,
        instanceSteps: {
          with: {
            step: true
          }
        }
      },
      orderBy: [desc(checklistInstances.startedAt)]
    });

    // Calculate progress for each instance
    const instancesWithProgress = instances.map(instance => {
      const totalSteps = instance.instanceSteps.length;
      const completedSteps = instance.instanceSteps.filter(step => step.isCompleted).length;
      const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

      return {
        ...instance,
        progress,
        totalSteps,
        completedSteps
      };
    });

    return NextResponse.json(instancesWithProgress);
  } catch (error) {
    console.error("Error fetching checklist instances:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 