"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function TestAPIPage() {
  const { data: session } = useSession();
  const [results, setResults] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const testEndpoint = async (name: string, url: string, options: RequestInit = {}) => {
    setLoading(name);
    try {
      console.log(`Testing ${name}:`, url);
      const response = await fetch(url, {
        credentials: "include",
        ...options,
      });
      
      const data = await response.json();
      console.log(`${name} response:`, data);
      
      setResults((prev: Record<string, unknown>) => ({
        ...prev,
        [name]: {
          status: response.status,
          ok: response.ok,
          data: data
        }
      }));
    } catch (error) {
      console.error(`${name} error:`, error);
      setResults((prev: Record<string, unknown>) => ({
        ...prev,
        [name]: {
          error: error instanceof Error ? error.message : "Unknown error"
        }
      }));
    } finally {
      setLoading(null);
    }
  };

  const testTemplates = () => testEndpoint("templates", "/api/templates");
  const testTeams = () => testEndpoint("teams", "/api/teams");
  const testFavorites = () => testEndpoint("favorites", "/api/templates/favorites");
  
  const testTeamTemplates = (teamId: string) => 
    testEndpoint("teamTemplates", `/api/teams/${teamId}/templates`);

  const testAddFavorite = (templateId: string) => 
    testEndpoint("addFavorite", `/api/templates/${templateId}/favorite`, {
      method: "POST"
    });

  const testShareTemplate = (teamId: string, templateId: string) => 
    testEndpoint("shareTemplate", `/api/teams/${teamId}/templates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId })
    });

  if (!session?.user) {
    return <div className="p-8">Please log in to test APIs</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Basic Tests</h2>
          <div className="space-x-2">
            <button 
              onClick={testTemplates}
              disabled={loading === "templates"}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {loading === "templates" ? "Loading..." : "Test Templates"}
            </button>
            <button 
              onClick={testTeams}
              disabled={loading === "teams"}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              {loading === "teams" ? "Loading..." : "Test Teams"}
            </button>
            <button 
              onClick={testFavorites}
              disabled={loading === "favorites"}
              className="px-4 py-2 bg-yellow-600 text-white rounded disabled:opacity-50"
            >
              {loading === "favorites" ? "Loading..." : "Test Favorites"}
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Team Templates Test</h2>
          <div className="space-x-2">
            <input 
              type="text" 
              placeholder="Team ID" 
              id="teamId"
              className="px-3 py-2 border rounded"
            />
            <button 
              onClick={() => {
                const teamId = (document.getElementById('teamId') as HTMLInputElement).value;
                if (teamId) testTeamTemplates(teamId);
              }}
              disabled={loading === "teamTemplates"}
              className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50"
            >
              {loading === "teamTemplates" ? "Loading..." : "Test Team Templates"}
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Action Tests</h2>
          <div className="space-x-2 mb-2">
            <input 
              type="text" 
              placeholder="Template ID" 
              id="templateId"
              className="px-3 py-2 border rounded"
            />
            <button 
              onClick={() => {
                const templateId = (document.getElementById('templateId') as HTMLInputElement).value;
                if (templateId) testAddFavorite(templateId);
              }}
              disabled={loading === "addFavorite"}
              className="px-4 py-2 bg-orange-600 text-white rounded disabled:opacity-50"
            >
              {loading === "addFavorite" ? "Loading..." : "Add to Favorites"}
            </button>
          </div>
          
          <div className="space-x-2">
            <input 
              type="text" 
              placeholder="Team ID" 
              id="shareTeamId"
              className="px-3 py-2 border rounded"
            />
            <input 
              type="text" 
              placeholder="Template ID" 
              id="shareTemplateId"
              className="px-3 py-2 border rounded"
            />
            <button 
              onClick={() => {
                const teamId = (document.getElementById('shareTeamId') as HTMLInputElement).value;
                const templateId = (document.getElementById('shareTemplateId') as HTMLInputElement).value;
                if (teamId && templateId) testShareTemplate(teamId, templateId);
              }}
              disabled={loading === "shareTemplate"}
              className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
            >
              {loading === "shareTemplate" ? "Loading..." : "Share Template"}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Results</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(results, null, 2)}
        </pre>
      </div>
    </div>
  );
} 