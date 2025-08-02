"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Template {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface Team {
  id: string;
  name: string;
  description: string | null;
  role: string;
}

interface TemplateSharingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function TemplateSharingModal({
  isOpen,
  onClose,
  onSuccess,
}: TemplateSharingModalProps) {
  const { data: session } = useSession();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      loadTeams();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/templates", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to load templates");
      }

      const data = await response.json();
      setTemplates(Array.isArray(data) ? data : data.templates || []);
    } catch (error) {
      console.error("Error loading templates:", error);
      setError("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const loadTeams = async () => {
    try {
      const response = await fetch("/api/teams", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to load teams");
      }

      const data = await response.json();
      setTeams(data.teams || []);
    } catch (error) {
      console.error("Error loading teams:", error);
      setError("Failed to load teams");
    }
  };

  const handleShareTemplate = async () => {
    if (!selectedTemplate || !selectedTeam) {
      setError("Please select both a template and a team");
      return;
    }

    try {
      setSharing(true);
      setError("");
      setSuccess("");

      const response = await fetch(`/api/teams/${selectedTeam}/templates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ templateId: selectedTemplate }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to share template");
      }

      setSuccess("Template shared successfully!");
      setSelectedTemplate("");
      setSelectedTeam("");
      
      // Call success callback after a short delay
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error sharing template:", error);
      setError(error instanceof Error ? error.message : "Failed to share template");
    } finally {
      setSharing(false);
    }
  };

  const handleClose = () => {
    setSelectedTemplate("");
    setSelectedTeam("");
    setError("");
    setSuccess("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Share Template</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="text-lg">Loading...</div>
            </div>
          ) : (
            <>
              {/* Template Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a template...</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Team Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Team
                </label>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a team...</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} ({team.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleShareTemplate}
                  disabled={!selectedTemplate || !selectedTeam || sharing}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sharing ? "Sharing..." : "Share Template"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 