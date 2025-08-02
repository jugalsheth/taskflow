"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface TeamTemplate {
  id: string;
  teamId: string;
  templateId: string;
  sharedBy: string;
  sharedAt: string;
  isOfficial: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  templateTitle: string;
  templateCreatedAt: string;
  templateUpdatedAt: string;
  templateOwnerId: string;
  sharedByName: string | null;
  sharedByEmail: string;
}

interface TeamTemplatesSectionProps {
  teamId: string;
  userRole: string;
  onRefresh?: () => void;
}

export default function TeamTemplatesSection({ 
  teamId, 
  userRole, 
  onRefresh 
}: TeamTemplatesSectionProps) {
  const { data: session } = useSession();
  const [teamTemplates, setTeamTemplates] = useState<TeamTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (teamId) {
      loadTeamTemplates();
    }
  }, [teamId]);

  const loadTeamTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teams/${teamId}/templates`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to load team templates");
      }

      const data = await response.json();
      setTeamTemplates(data.teamTemplates || []);
    } catch (error) {
      console.error("Error loading team templates:", error);
      setError("Failed to load team templates");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to remove this template from the team?")) {
      return;
    }

    try {
      const response = await fetch(`/api/teams/${teamId}/templates/${templateId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to remove template");
      }

      // Refresh the list
      loadTeamTemplates();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error removing template:", error);
      setError("Failed to remove template");
    }
  };

  const handleToggleOfficial = async (templateId: string, isOfficial: boolean) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/templates/${templateId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ isOfficial: !isOfficial }),
      });

      if (!response.ok) {
        throw new Error("Failed to update template status");
      }

      // Refresh the list
      loadTeamTemplates();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error updating template status:", error);
      setError("Failed to update template status");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Team Templates</h2>
        <div className="text-center py-8">
          <div className="text-lg">Loading team templates...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Team Templates</h2>
        <div className="text-sm text-gray-500">
          {teamTemplates.length} template{teamTemplates.length !== 1 ? "s" : ""}
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm mb-4">{error}</div>
      )}

      {teamTemplates.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 text-lg mb-4">No team templates yet</div>
          <p className="text-gray-400">Team members can share their templates here!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {teamTemplates.map((template) => (
            <div
              key={template.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {template.templateTitle}
                    </h3>
                    {template.isOfficial && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Official
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Shared by {template.sharedByName || template.sharedByEmail} on {formatDate(template.sharedAt)}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="flex space-x-2">
                  <Link
                    href={`/checklists/new?templateId=${template.templateId}`}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Start Checklist
                  </Link>
                  <Link
                    href={`/templates/${template.templateId}/view`}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    View
                  </Link>
                </div>

                {(userRole === "owner" || userRole === "admin") && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleOfficial(template.templateId, template.isOfficial)}
                      className={`px-3 py-1 text-sm rounded focus:outline-none focus:ring-2 ${
                        template.isOfficial
                          ? "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500"
                          : "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500"
                      }`}
                    >
                      {template.isOfficial ? "Remove Official" : "Make Official"}
                    </button>
                    <button
                      onClick={() => handleRemoveTemplate(template.templateId)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 