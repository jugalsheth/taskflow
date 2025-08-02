"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Invitation {
  id: string;
  teamId: string;
  invitedEmail: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  teamName: string;
  teamDescription: string | null;
  inviterName: string | null;
  inviterEmail: string;
}

export default function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [actionResult, setActionResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const loadInvitation = async () => {
      try {
        const { token } = await params;
        const response = await fetch(`/api/invitations/${token}`, {
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError("Invitation not found or has expired");
          } else {
            setError("Failed to load invitation");
          }
          return;
        }

        const data = await response.json();
        setInvitation(data.invitation);
      } catch (error) {
        console.error("Error loading invitation:", error);
        setError("Failed to load invitation");
      } finally {
        setLoading(false);
      }
    };

    loadInvitation();
  }, [params]);

  const handleAction = async (action: "accept" | "decline") => {
    if (!invitation) return;

    setProcessing(true);
    try {
      const { token } = await params;
      const response = await fetch(`/api/invitations/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error("Failed to process invitation");
      }

      await response.json();
      setActionResult({
        success: true,
        message: action === "accept" ? "Successfully joined the team!" : "Invitation declined",
      });

      // Redirect after a short delay
      setTimeout(() => {
        if (action === "accept") {
          router.push("/dashboard");
        } else {
          router.push("/");
        }
      }, 2000);
    } catch (error) {
      console.error("Error processing invitation:", error);
      setActionResult({
        success: false,
        message: "Failed to process invitation",
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading invitation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Invitation Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (actionResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className={`text-6xl mb-4 ${actionResult.success ? "text-green-500" : "text-red-500"}`}>
              {actionResult.success ? "✅" : "❌"}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {actionResult.success ? "Success!" : "Error"}
            </h1>
            <p className="text-gray-600 mb-6">{actionResult.message}</p>
            <p className="text-sm text-gray-500">Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <p className="text-gray-600">No invitation found</p>
          </div>
        </div>
      </div>
    );
  }

  const isExpired = new Date(invitation.expiresAt) < new Date();
  const isAlreadyProcessed = invitation.status !== "pending";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <div className="text-blue-500 text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Invitation</h1>
                          <p className="text-gray-600">You&apos;ve been invited to join a team on TaskFlow</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{invitation.teamName}</h2>
          {invitation.teamDescription && (
            <p className="text-gray-600 mb-4">{invitation.teamDescription}</p>
          )}
          <p className="text-sm text-gray-500">
            Invited by: {invitation.inviterName || invitation.inviterEmail}
          </p>
        </div>

        {isExpired && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">
              ⚠️ This invitation expired on {formatDate(invitation.expiresAt)}
            </p>
          </div>
        )}

        {isAlreadyProcessed && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              This invitation has already been {invitation.status}
            </p>
          </div>
        )}

        {!isExpired && !isAlreadyProcessed && (
          <div className="space-y-4">
            <button
              onClick={() => handleAction("accept")}
              disabled={processing}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? "Processing..." : "Accept Invitation"}
            </button>
            <button
              onClick={() => handleAction("decline")}
              disabled={processing}
              className="w-full px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? "Processing..." : "Decline Invitation"}
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Expires: {formatDate(invitation.expiresAt)}
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Back to TaskFlow
          </Link>
        </div>
      </div>
    </div>
  );
} 