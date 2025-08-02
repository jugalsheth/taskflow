"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import TeamManagementModal from "@/components/teams/TeamManagementModal";

interface Template {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  stepCount: number;
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
}

interface Team {
  id: string;
  name: string;
  description: string | null;
  privacyLevel: string;
  createdAt: string;
  updatedAt: string;
  role: string;
  userRole: string;
  memberCount: number;
  invitationCount: number;
}

interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: string;
  joinedAt: string;
  userName: string | null;
  userEmail: string;
}

interface ApiTeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: string;
  joinedAt: string;
  user?: {
    name: string | null;
    email: string;
  };
}

export default function Dashboard() {
  console.log("=== Dashboard component rendering (UPDATED) ===");
  
  const { data: session, status } = useSession();
  
  const formatDate = (dateString: string) => {
    if (!mounted) return "Loading...";
    return new Date(dateString).toLocaleDateString();
  };
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activeChecklists, setActiveChecklists] = useState<ChecklistInstance[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startingChecklist, setStartingChecklist] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    loadTemplates();
    loadActiveChecklists();
    loadTeams();
  }, [status, router]);

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
      setTemplates(data);
    } catch (error) {
      setError("Failed to load templates");
      console.error("Load templates error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveChecklists = async () => {
    try {
      const response = await fetch("/api/checklists", {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to load active checklists");
      }

      const data = await response.json();
      setActiveChecklists(data);
    } catch (error) {
      console.error("Load active checklists error:", error);
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
      console.error("Load teams error:", error);
    }
  };

  const loadTeamDetails = async (teamId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to load team details");
      }

      const data = await response.json();
      
      // Transform team data to match TeamManagementModal interface
      const transformedTeam = {
        ...data.team,
        memberCount: data.members?.length || 0,
        invitationCount: data.pendingInvitations || 0,
      };
      
      // Transform members data to match TeamManagementModal interface
      const transformedMembers = data.members?.map((member: ApiTeamMember) => ({
        id: member.id,
        userId: member.userId,
        teamId: member.teamId,
        role: member.role,
        joinedAt: member.joinedAt,
        userName: member.user?.name || null,
        userEmail: member.user?.email || '',
      })) || [];
      
      setSelectedTeam(transformedTeam);
      setTeamMembers(transformedMembers);
    } catch (error) {
      console.error("Load team details error:", error);
    }
  };

  const handleManageTeam = async (team: Team) => {
    await loadTeamDetails(team.id);
    setShowManagementModal(true);
  };

  const handleStartChecklist = async (templateId: string) => {
    console.log("=== handleStartChecklist called ===");
    console.log("Template ID:", templateId);
    
    try {
      setStartingChecklist(templateId);
      console.log("Making fetch request to /api/checklists...");
      
      const response = await fetch("/api/checklists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ templateId }),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response:", errorText);
        throw new Error("Failed to start checklist");
      }

      const newInstance = await response.json();
      console.log("New instance created:", newInstance);
      
      // Reload active checklists
      await loadActiveChecklists();
      
      // Navigate to the new checklist instance
      router.push(`/checklists/${newInstance.id}`);
    } catch (error) {
      console.error("Start checklist error:", error);
      setError("Failed to start checklist");
    } finally {
      console.log("Clearing starting checklist state");
      setStartingChecklist(null);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) {
      return;
    }

    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete template");
      }

      // Reload templates
      loadTemplates();
    } catch (error) {
      setError("Failed to delete template");
      console.error("Delete template error:", error);
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome to TaskFlow</h1>
              <p className="text-gray-600 mt-2">Manage your checklist templates and track your progress</p>
            </div>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Sign Out
            </button>
          </div>
          
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">User Information</h2>
            <p className="text-gray-600">Email: {session.user.email}</p>
            {session.user.name && (
              <p className="text-gray-600">Name: {session.user.name}</p>
            )}
          </div>
        </div>

        {/* Templates Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Checklist Templates</h2>
            <Link
              href="/templates/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Create New Template
            </Link>
          </div>

          {error && (
            <div className="text-red-600 text-sm mb-4">{error}</div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="text-lg">Loading templates...</div>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg mb-4">No templates yet</div>
              <p className="text-gray-400">Create your first checklist template to get started!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {template.stepCount} steps • Created {formatDate(template.createdAt)}
                  </p>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStartChecklist(template.id)}
                      disabled={startingChecklist === template.id}
                      className={`px-3 py-1 text-white text-sm rounded focus:outline-none focus:ring-2 ${
                        startingChecklist === template.id
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                      }`}
                    >
                      {startingChecklist === template.id ? "Starting..." : "Start Checklist"}
                    </button>
                    <Link
                      href={`/templates/${template.id}/edit`}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Teams Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Teams</h2>
            <Link
              href="/teams/new"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Create New Team
            </Link>
          </div>
          
          {teams.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg mb-4">No teams yet</div>
              <p className="text-gray-400">Create your first team to start collaborating on checklists!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => (
                <div key={team.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      team.role === "owner" 
                        ? "bg-purple-100 text-purple-800" 
                        : team.role === "admin"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {team.role === "owner" ? "Owner" : 
                       team.role === "admin" ? "Admin" : 
                       team.role === "member" ? "Member" : "Viewer"}
                    </span>
                  </div>
                  
                  {team.description && (
                    <p className="text-sm text-gray-600 mb-3">{team.description}</p>
                  )}
                  
                  <p className="text-sm text-gray-500 mb-4">
                    {team.privacyLevel === "private" ? "Private" : "Public"} • Created {formatDate(team.createdAt)}
                  </p>
                  
                  <div className="flex space-x-2">
                    <Link
                      href={`/teams/${team.id}`}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      View Team
                    </Link>
                    {(team.role === "owner" || team.role === "admin") && (
                      <button
                        onClick={() => handleManageTeam(team)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Manage
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Checklists Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Checklists</h2>
          
          {activeChecklists.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg mb-4">No active checklists</div>
              <p className="text-gray-400">Start a checklist from one of your templates to see it here!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeChecklists.map((checklist) => (
                <div key={checklist.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{checklist.template.title}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      checklist.status === "completed" 
                        ? "bg-green-100 text-green-800" 
                        : checklist.status === "paused"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {checklist.status === "completed" ? "Completed" : 
                       checklist.status === "paused" ? "Paused" : "In Progress"}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{checklist.completedSteps}/{checklist.totalSteps} ({checklist.progress}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${checklist.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-4">
                    Started {formatDate(checklist.startedAt)}
                  </p>
                  
                  <div className="flex space-x-2">
                    <Link
                      href={`/checklists/${checklist.id}`}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Continue
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Team Management Modal */}
      {selectedTeam && (
        <TeamManagementModal
          team={selectedTeam}
          members={teamMembers}
          isOpen={showManagementModal}
          onClose={() => setShowManagementModal(false)}
          onRefresh={() => {
            loadTeams();
            if (selectedTeam) {
              loadTeamDetails(selectedTeam.id);
            }
          }}
        />
      )}
    </div>
  );
} 