"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface TeamMember {
  id: string;
  userId: string;
  role: string;
  joinedAt: string;
  userName: string | null;
  userEmail: string;
}

interface Team {
  id: string;
  name: string;
  description: string | null;
  privacyLevel: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  ownerName: string | null;
  ownerEmail: string;
  memberCount: number;
  invitationCount: number;
  userRole: string;
}

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadTeamDetails();
    }
  }, [params.id]);

  const loadTeamDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teams/${params.id}`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError("Team not found or you don't have access to it");
        } else {
          setError("Failed to load team details");
        }
        return;
      }

      const data = await response.json();
      setTeam(data.team);
      setMembers(data.members);
    } catch (error) {
      setError("Failed to load team details");
      console.error("Load team details error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "member":
        return "bg-green-100 text-green-800";
      case "viewer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "owner":
        return "Owner";
      case "admin":
        return "Admin";
      case "member":
        return "Member";
      case "viewer":
        return "Viewer";
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-8">
            <div className="text-lg">Loading team details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-800">{error || "Team not found"}</p>
            </div>
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
              <div className="flex space-x-3">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Back to Dashboard
                </Link>
                {(team.userRole === "owner" || team.userRole === "admin") && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    Manage Team
                  </button>
                )}
              </div>
            </div>

            {team.description && (
              <p className="text-gray-600 mb-4">{team.description}</p>
            )}

            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span>Created {new Date(team.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>{team.memberCount} member{team.memberCount !== 1 ? 's' : ''}</span>
              <span>•</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                team.privacyLevel === "private" 
                  ? "bg-gray-100 text-gray-800" 
                  : "bg-green-100 text-green-800"
              }`}>
                {team.privacyLevel === "private" ? "Private" : "Public"}
              </span>
              {team.invitationCount > 0 && (
                <>
                  <span>•</span>
                  <span>{team.invitationCount} pending invitation{team.invitationCount !== 1 ? 's' : ''}</span>
                </>
              )}
            </div>
          </div>

          {/* Team Owner */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Owner</h2>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold">
                  {team.ownerName ? team.ownerName.charAt(0).toUpperCase() : 'O'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {team.ownerName || "Unknown User"}
                </p>
                <p className="text-sm text-gray-500">{team.ownerEmail}</p>
              </div>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                Owner
              </span>
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
              <span className="text-sm text-gray-500">
                {members.length} member{members.length !== 1 ? 's' : ''}
              </span>
            </div>

            {members.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No members found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {member.userName ? member.userName.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {member.userName || "Unknown User"}
                        </p>
                        <p className="text-sm text-gray-500">{member.userEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                        {getRoleDisplayName(member.role)}
                      </span>
                      <span className="text-xs text-gray-500">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 