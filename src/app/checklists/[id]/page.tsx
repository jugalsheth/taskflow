"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface ChecklistStep {
  id: string;
  stepText?: string;
  orderIndex: number;
  isCompleted: boolean;
  completedAt: string | null;
  step?: {
    id: string;
    stepText: string;
    orderIndex: number;
  };
}

interface ChecklistInstance {
  id: string;
  templateId: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  progress: number;
  totalSteps: number;
  completedSteps: number;
  template: {
    id: string;
    title: string;
  };
  instanceSteps: ChecklistStep[];
}

export default function ChecklistPlayer({ params }: { params: Promise<{ id: string }> }) {
  return <ChecklistPlayerClient params={params} />;
}

function ChecklistPlayerClient({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [instance, setInstance] = useState<ChecklistInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStep, setUpdatingStep] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);



  // Extract id from params
  useEffect(() => {
    const extractId = async () => {
      const { id: checklistId } = await params;
      setId(checklistId);
    };
    extractId();
  }, [params]);

  const loadChecklistInstance = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/checklists/${id}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          setError("Checklist not found");
        } else {
          throw new Error("Failed to load checklist");
        }
        return;
      }

      const data = await response.json();
      setInstance(data);
    } catch (error) {
      setError("Failed to load checklist");
      console.error("Load checklist error:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (status === "loading" || !id) return;
    
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    loadChecklistInstance();
  }, [status, router, loadChecklistInstance, id]);

  const handleStepToggle = async (stepId: string, currentStatus: boolean) => {
    if (!id) return;
    
    console.log("=== handleStepToggle called ===");
    console.log("Step ID:", stepId);
    console.log("Current status:", currentStatus);
    console.log("Instance ID:", id);
    console.log("API URL:", `/api/checklists/${id}/steps/${stepId}`);
    
    try {
      setUpdatingStep(stepId);
      const response = await fetch(`/api/checklists/${id}/steps/${stepId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ isCompleted: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update step");
      }

      // Reload the checklist instance to get updated progress
      await loadChecklistInstance();
    } catch (error) {
      setError("Failed to update step");
      console.error("Update step error:", error);
    } finally {
      setUpdatingStep(null);
    }
  };

  const handleCompleteChecklist = async () => {
    if (!id) return;
    
    try {
      const response = await fetch(`/api/checklists/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ action: "complete" }),
      });

      if (!response.ok) {
        throw new Error("Failed to complete checklist");
      }

      // Reload the checklist instance
      await loadChecklistInstance();
    } catch (error) {
      setError("Failed to complete checklist");
      console.error("Complete checklist error:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading checklist...</div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!instance) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Checklist Not Found</h1>
                            <p className="text-gray-600 mb-6">The checklist you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{instance.template.title}</h1>
              <p className="text-gray-600 mt-2">
                Started {new Date(instance.startedAt).toLocaleDateString()} at {new Date(instance.startedAt).toLocaleTimeString()}
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Back to Dashboard
            </Link>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-medium text-gray-700">
                {instance.completedSteps} of {instance.totalSteps} steps ({instance.progress}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${instance.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Status */}
          <div className="mt-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              instance.status === "completed" 
                ? "bg-green-100 text-green-800" 
                : instance.status === "paused"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-blue-100 text-blue-800"
            }`}>
              {instance.status === "completed" ? "Completed" : 
               instance.status === "paused" ? "Paused" : "In Progress"}
            </span>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Checklist Steps</h2>
          
          {error && (
            <div className="text-red-600 text-sm mb-4">{error}</div>
          )}

          <div className="space-y-4">
            {instance.instanceSteps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-start space-x-3 p-4 rounded-lg border ${
                  step.isCompleted 
                    ? "bg-green-50 border-green-200" 
                    : "bg-white border-gray-200"
                }`}
              >
                <button
                  onClick={() => handleStepToggle(step.step?.id || step.id, step.isCompleted)}
                  disabled={updatingStep === step.id}
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    step.isCompleted
                      ? "bg-green-600 border-green-600 text-white"
                      : "border-gray-300 hover:border-green-500"
                  } ${updatingStep === step.id ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {step.isCompleted && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    step.isCompleted ? "text-green-800 line-through" : "text-gray-900"
                  }`}>
                    {index + 1}. {step.step?.stepText || step.stepText || `Step ${index + 1}`}
                  </p>

                  {step.isCompleted && step.completedAt && (
                    <p className="text-xs text-green-600 mt-1">
                      Completed {new Date(step.completedAt).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Complete Button */}
          {instance.status !== "completed" && instance.progress === 100 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleCompleteChecklist}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
              >
                Complete Checklist
              </button>
            </div>
          )}

          {instance.status === "completed" && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-green-600 text-lg font-medium mb-2">🎉 Checklist Completed!</div>
                <p className="text-gray-600">
                  Completed on {new Date(instance.completedAt!).toLocaleDateString()} at {new Date(instance.completedAt!).toLocaleTimeString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 