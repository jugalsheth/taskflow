"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Feedback {
  id: string;
  templateId: string;
  userId: string;
  teamId: string;
  comment: string;
  rating: number | null;
  createdAt: string;
  userName: string | null;
  userEmail: string;
}

interface TemplateFeedbackProps {
  templateId: string;
  teamId?: string;
  onFeedbackAdded?: () => void;
}

export default function TemplateFeedback({
  templateId,
  teamId,
  onFeedbackAdded,
}: TemplateFeedbackProps) {
  const { data: session } = useSession();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadFeedback();
  }, [templateId]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/templates/${templateId}/feedback`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to load feedback");
      }

      const data = await response.json();
      setFeedback(data.feedback || []);
    } catch (error) {
      console.error("Error loading feedback:", error);
      setError("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!newComment.trim()) {
      setError("Please enter a comment");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const requestBody = {
        comment: newComment.trim(),
        rating: newRating > 0 ? newRating : null,
        teamId: teamId || null,
      };

      console.log("Submitting feedback with data:", requestBody);
      console.log("Template ID:", templateId);

      const response = await fetch(`/api/templates/${templateId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Error response data:", errorData);
        throw new Error(errorData.error || "Failed to submit feedback");
      }

      // Reset form
      setNewComment("");
      setNewRating(0);
      setShowForm(false);

      // Reload feedback
      loadFeedback();
      if (onFeedbackAdded) onFeedbackAdded();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setError(error instanceof Error ? error.message : "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback</h3>
        <div className="text-center py-4">
          <div className="text-gray-500">Loading feedback...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Feedback</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {showForm ? "Cancel" : "Add Feedback"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Feedback Form */}
      {showForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Add Your Feedback</h4>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating (optional)
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewRating(star)}
                  className="focus:outline-none"
                >
                  <svg
                    className={`w-6 h-6 ${
                      star <= newRating ? "text-yellow-400" : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment *
            </label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Share your thoughts about this template..."
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitFeedback}
              disabled={!newComment.trim() || submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </div>
      )}

      {/* Feedback List */}
      {feedback.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 text-lg mb-2">No feedback yet</div>
          <p className="text-gray-400">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {item.userName || item.userEmail}
                  </span>
                  {renderStars(item.rating)}
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(item.createdAt)}
                </span>
              </div>
              <p className="text-gray-700">{item.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 