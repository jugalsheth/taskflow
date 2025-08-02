"use client";

import { useState, useEffect } from "react";
import InvitationForm from "./InvitationForm";

interface TeamMember {
  id: string;
  userId: string;
  role: string;
  joinedAt: string;
  userName: string | null;
  userEmail: string;
}

interface TeamInvitation {
  id: string;
  invitedEmail: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

interface Team {
  id: string;
  name: string;
  description: string | null;
  privacyLevel: string;
  memberCount: number;
  invitationCount: number;
  userRole: string;
}

interface TeamManagementModalProps {
  team: Team;
  members: TeamMember[];
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function TeamManagementModal({
  team,
  members,
  isOpen,
  onClose,
  onRefresh,
}: TeamManagementModalProps) {
  const [activeTab, setActiveTab] = useState<"members" | "invitations" | "settings">("members");
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && team) {
      loadInvitations();
    }
  }, [isOpen, team]);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teams/${team.id}/invitations`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations || []);
      }
    } catch (error) {
      console.error("Failed to load invitations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    
    try {
      const response = await fetch(`/api/teams/${team.id}/members/${memberId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        onRefresh();
      } else {
        const errorData = await response.json();
        alert(`Failed to remove member: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error removing member:", error);
      alert("Failed to remove member. Please try again.");
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/teams/${team.id}/members/${memberId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        onRefresh();
      } else {
        const errorData = await response.json();
        alert(`Failed to update role: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role. Please try again.");
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/teams/${team.id}/invitations/${invitationId}/resend`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        loadInvitations();
      } else {
        console.error("Failed to resend invitation");
      }
    } catch (error) {
      console.error("Error resending invitation:", error);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm("Are you sure you want to cancel this invitation?")) return;
    
    try {
      const response = await fetch(`/api/teams/${team.id}/invitations/${invitationId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        loadInvitations();
        onRefresh();
      } else {
        console.error("Failed to cancel invitation");
      }
    } catch (error) {
      console.error("Error canceling invitation:", error);
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

  const getInvitationStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "declined":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manage Team: {team.name}</h2>
            <p className="text-gray-600 mt-1">
              {team.memberCount} member{team.memberCount !== 1 ? 's' : ''} • {team.privacyLevel === "private" ? "Private" : "Public"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("members")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "members"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Members ({team.memberCount})
            </button>
            <button
              onClick={() => setActiveTab("invitations")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "invitations"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Invitations ({team.invitationCount})
            </button>
            {(team.userRole === "owner" || team.userRole === "admin") && (
              <button
                onClick={() => setActiveTab("settings")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "settings"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Settings
              </button>
            )}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === "members" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                {(team.userRole === "owner" || team.userRole === "admin") && (
                  <button 
                    onClick={() => setActiveTab("invitations")}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    + Invite Member
                  </button>
                )}
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
                        {team.userRole === "owner" && member.role !== "owner" ? (
                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.userId, e.target.value)}
                            className={`px-2 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-blue-500 ${getRoleBadgeColor(member.role)}`}
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                            {getRoleDisplayName(member.role)}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </span>
                        {(team.userRole === "owner" || (team.userRole === "admin" && member.role !== "owner")) && (
                          <button 
                            onClick={() => handleRemoveMember(member.userId)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "invitations" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Invitation</h3>
                <InvitationForm
                  teamId={team.id}
                  onSuccess={() => {
                    loadInvitations();
                    onRefresh();
                  }}
                  onCancel={() => {}}
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Invitations</h3>
                {loading ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Loading invitations...</p>
                  </div>
                ) : invitations.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No pending invitations</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invitations.map((invitation) => (
                      <div key={invitation.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{invitation.invitedEmail}</p>
                          <p className="text-sm text-gray-500">
                            Sent {new Date(invitation.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getInvitationStatusColor(invitation.status)}`}>
                            {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                          </span>
                          {invitation.status === "pending" && (
                            <button 
                              onClick={() => handleResendInvitation(invitation.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Resend
                            </button>
                          )}
                          {invitation.status === "pending" && (
                            <button 
                              onClick={() => handleCancelInvitation(invitation.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Settings</h3>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Team Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Team Name:</span>
                        <span className="font-medium">{team.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Description:</span>
                        <span className="font-medium">{team.description || "No description"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Privacy Level:</span>
                        <span className="font-medium capitalize">{team.privacyLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Members:</span>
                        <span className="font-medium">{team.memberCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pending Invitations:</span>
                        <span className="font-medium">{team.invitationCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Role Permissions</h4>
                    <div className="space-y-2 text-sm text-blue-800">
                      <div><strong>Owner:</strong> Full control - can manage members, invitations, and team settings</div>
                      <div><strong>Admin:</strong> Can manage members and invitations, but cannot change team settings</div>
                      <div><strong>Member:</strong> Can view team information and participate in team activities</div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-2">Coming Soon</h4>
                    <div className="space-y-1 text-sm text-yellow-800">
                      <div>• Team branding and customization</div>
                      <div>• Advanced privacy controls</div>
                      <div>• Team activity logs</div>
                      <div>• Integration settings</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 