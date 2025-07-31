"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Step {
  id?: string;
  text: string;
}

interface TemplateBuilderProps {
  templateId?: string;
  initialTitle?: string;
  initialSteps?: Step[];
}

export default function TemplateBuilder({ 
  templateId, 
  initialTitle = "", 
  initialSteps = [{ text: "" }] 
}: TemplateBuilderProps) {
  const [title, setTitle] = useState(initialTitle);
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const loadTemplate = useCallback(async () => {
    if (!templateId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/templates/${templateId}`);
      
      if (!response.ok) {
        throw new Error("Failed to load template");
      }

      const data = await response.json();
      setTitle(data.template.title);
      setSteps(data.steps.map((step: { id: string; stepText: string }) => ({ id: step.id, text: step.stepText })));
    } catch (error) {
      setError("Failed to load template");
      console.error("Load template error:", error);
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  // Load existing template data if editing
  useEffect(() => {
    if (templateId) {
      loadTemplate();
    }
  }, [templateId, loadTemplate]);

  const addStep = () => {
    setSteps([...steps, { text: "" }]);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const updateStep = (index: number, text: string) => {
    const newSteps = [...steps];
    newSteps[index].text = text;
    setSteps(newSteps);
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === steps.length - 1)
    ) {
      return;
    }

    const newSteps = [...steps];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    setSteps(newSteps);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate
      if (!title.trim()) {
        setError("Title is required");
        return;
      }

      const validSteps = steps.filter(step => step.text.trim());
      if (validSteps.length === 0) {
        setError("At least one step is required");
        return;
      }

      const templateData = {
        title: title.trim(),
        steps: validSteps,
      };

      const url = templateId ? `/api/templates/${templateId}` : "/api/templates";
      const method = templateId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save template");
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save template");
      console.error("Save template error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && templateId) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading template...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">
          {templateId ? "Edit Template" : "Create New Template"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Template Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter template title..."
              required
            />
          </div>

          {/* Steps Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Steps
              </label>
              <button
                type="button"
                onClick={addStep}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Add Step
              </button>
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-500 w-8">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={step.text}
                    onChange={(e) => updateStep(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Step ${index + 1}...`}
                  />
                  <div className="flex space-x-1">
                    <button
                      type="button"
                      onClick={() => moveStep(index, "up")}
                      disabled={index === 0}
                      className="px-2 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveStep(index, "down")}
                      disabled={index === steps.length - 1}
                      className="px-2 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      disabled={steps.length === 1}
                      className="px-2 py-1 text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Saving..." : templateId ? "Update Template" : "Create Template"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 