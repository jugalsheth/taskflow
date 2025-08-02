"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface FavoriteTemplate {
  id: string;
  userId: string;
  templateId: string;
  teamId: string | null;
  createdAt: string;
  templateTitle: string;
  templateCreatedAt: string;
  templateUpdatedAt: string;
  templateOwnerId: string;
  teamName: string | null;
}

interface TemplateFavoritesProps {
  onFavoriteRemoved?: () => void;
}

export default function TemplateFavorites({ onFavoriteRemoved }: TemplateFavoritesProps) {
  const { data: session } = useSession();
  const [favorites, setFavorites] = useState<FavoriteTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/templates/favorites", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to load favorites");
      }

      const data = await response.json();
      setFavorites(data.favorites || []);
    } catch (error) {
      console.error("Error loading favorites:", error);
      setError("Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (templateId: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}/favorite`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to remove favorite");
      }

      // Remove from local state
      setFavorites(favorites.filter(fav => fav.templateId !== templateId));
      if (onFavoriteRemoved) onFavoriteRemoved();
    } catch (error) {
      console.error("Error removing favorite:", error);
      setError("Failed to remove favorite");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">My Favorite Templates</h3>
        <div className="text-center py-4">
          <div className="text-gray-500">Loading favorites...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">My Favorite Templates</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 text-lg mb-2">No favorite templates yet</div>
          <p className="text-gray-400">Start exploring templates and add them to your favorites!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {favorites.map((favorite) => (
            <div
              key={favorite.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    {favorite.templateTitle}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Added: {formatDate(favorite.createdAt)}</span>
                    {favorite.teamName && (
                      <span className="text-blue-600">Team: {favorite.teamName}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFavorite(favorite.templateId)}
                  className="text-red-600 hover:text-red-800 focus:outline-none"
                  title="Remove from favorites"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="flex space-x-2 mt-3">
                <Link
                  href={`/checklists/new?templateId=${favorite.templateId}`}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Start Checklist
                </Link>
                <Link
                  href={`/templates/${favorite.templateId}/view`}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  View Template
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 