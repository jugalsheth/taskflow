"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import TemplateFeedback from "@/components/templates/TemplateFeedback";

interface Template {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  stepCount: number;
  steps: Array<{
    id: string;
    stepText: string;
    orderIndex: number;
  }>;
  owner: {
    name: string | null;
    email: string;
  };
}

interface TemplateViewPageProps {
  params: Promise<{ id: string }>;
}

export default function TemplateViewPage({ params }: TemplateViewPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    loadTemplate();
  }, [status]);

  const loadTemplate = async () => {
    try {
      const { id } = await params;
      setLoading(true);
      
      const response = await fetch(`/api/templates/${id}`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError("Template not found");
        } else {
          setError("Failed to load template");
        }
        return;
      }

      const data = await response.json();
      setTemplate(data.template);
      
      // Check if template is favorited
      checkFavoriteStatus(id);
    } catch (error) {
      console.error("Error loading template:", error);
      setError("Failed to load template");
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async (templateId: string) => {
    try {
      const response = await fetch(`/api/templates/favorites`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const isFavorited = data.favorites.some((fav: { templateId: string }) => fav.templateId === templateId);
        setIsFavorite(isFavorited);
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!template) return;

    try {
      const response = await fetch(`/api/templates/${template.id}/favorite`, {
        method: isFavorite ? "DELETE" : "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to toggle favorite");
      }

      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setError("Failed to toggle favorite");
    }
  };

  const handleStartChecklist = async () => {
    if (!template) return;

    try {
      console.log("Starting checklist for template:", template.id);
      
      const response = await fetch("/api/checklists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ templateId: template.id }),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log("Error data:", errorData);
        throw new Error(errorData.error || "Failed to start checklist");
      }

      const data = await response.json();
      console.log("Response data:", data);
      
      if (data.id) {
        console.log("Navigating to checklist:", data.id);
        router.push(`/checklists/${data.id}`);
      } else {
        console.log("No ID in response:", data);
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error starting checklist:", error);
      setError(error instanceof Error ? error.message : "Failed to start checklist");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-8">
            <div className="text-lg">Loading template...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <div className="text-red-600 text-lg mb-4">{error}</div>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <div className="text-gray-600 text-lg mb-4">Template not found</div>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Back to Dashboard
              </Link>
            </div>
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
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{template.title}</h1>
              <p className="text-gray-600">
                Created by {template.owner.name || template.owner.email} on {formatDate(template.createdAt)}
              </p>
              <p className="text-gray-600">
                {template.stepCount} steps • Last updated {formatDate(template.updatedAt)}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleToggleFavorite}
                className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 ${
                  isFavorite
                    ? "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500"
                    : "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500"
                }`}
              >
                {isFavorite ? "★ Favorited" : "☆ Add to Favorites"}
              </button>
              <button
                onClick={handleStartChecklist}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Start Checklist
              </button>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Template Steps */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Checklist Steps</h2>
          
          {template.steps.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg">No steps defined for this template</div>
            </div>
          ) : (
            <div className="space-y-4">
              {template.steps.map((step, index) => (
                <div key={step.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">{step.stepText}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Template Feedback */}
        <div className="mb-8">
          <TemplateFeedback templateId={template.id} />
        </div>
      </div>
    </div>
  );
} 