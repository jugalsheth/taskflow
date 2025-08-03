"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  Users, 
  CheckCircle, 
  Star, 
  Share2, 
  Settings, 
  LogOut,
  TrendingUp,
  Target,
  Zap,
  ArrowRight,
  Search,
  Grid,
  List
} from "lucide-react";

interface Template {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  stepCount: number;
  isFavorite?: boolean;
}

interface Team {
  id: string;
  name: string;
  role: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [favorites, setFavorites] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [stats, setStats] = useState({
    totalTemplates: 0,
    completedChecklists: 0,
    teamMembers: 0,
    activeTeams: 0
  });

  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    loadDashboardData();
  }, [status, router]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load templates
      const templatesResponse = await fetch("/api/templates");
      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        console.log("Templates API response:", templatesData);
        setTemplates(templatesData);
        setStats(prev => ({ ...prev, totalTemplates: templatesData.length }));
      }

      // Load teams
      const teamsResponse = await fetch("/api/teams");
      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json();
        setTeams(teamsData);
        setStats(prev => ({ ...prev, activeTeams: teamsData.length }));
      }

      // Load favorites
      const favoritesResponse = await fetch("/api/templates/favorites");
      if (favoritesResponse.ok) {
        const favoritesData = await favoritesResponse.json();
        setFavorites(favoritesData);
      }

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async (templateId: string) => {
    try {
      const isFavorited = favorites.some(fav => fav.id === templateId);
      const method = isFavorited ? "DELETE" : "POST";
      
      const response = await fetch(`/api/templates/${templateId}/favorite`, {
        method,
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        if (isFavorited) {
          setFavorites(favorites.filter(fav => fav.id !== templateId));
        } else {
          const template = templates.find(t => t.id === templateId);
          if (template) {
            setFavorites([...favorites, { ...template, isFavorite: true }]);
          }
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const filteredTemplates = templates.filter(template =>
    (template.title?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TaskFlow
                </h1>
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/dashboard" className="text-blue-600 font-medium">Dashboard</Link>
                <Link href="/templates/new" className="text-gray-600 hover:text-gray-900">Templates</Link>
                <Link href="/teams/new" className="text-gray-600 hover:text-gray-900">Teams</Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {session?.user?.name?.charAt(0) || "U"}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {session?.user?.name}
                </span>
              </div>
              <button
                onClick={() => router.push("/api/auth/signout")}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {session?.user?.name?.split(" ")[0]}! 👋
                </h1>
                <p className="text-blue-100 text-lg">
                  Ready to streamline your workflows today?
                </p>
              </div>
              <div className="mt-6 md:mt-0">
                <Link
                  href="/templates/new"
                  className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Template
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Templates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTemplates}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedChecklists}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-2xl font-bold text-gray-900">{stats.teamMembers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Teams</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeTeams}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/templates/new"
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Create Template</h3>
                <p className="text-sm text-gray-600">Build a new checklist template</p>
              </div>
            </div>
          </Link>

          <Link
            href="/teams/new"
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Join Team</h3>
                <p className="text-sm text-gray-600">Collaborate with your team</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-gray-900">Quick Start</h3>
                <p className="text-sm text-gray-600">Start a checklist instantly</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Templates Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Templates</h2>
              <p className="text-gray-600">Manage and organize your checklist templates</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${viewMode === "grid" ? "bg-white shadow-sm" : "text-gray-600"}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${viewMode === "list" ? "bg-white shadow-sm" : "text-gray-600"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
              <p className="text-gray-600 mb-6">Create your first template to get started</p>
              <Link
                href="/templates/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Link>
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow ${
                    viewMode === "list" ? "flex items-center justify-between" : ""
                  }`}
                >
                  <div className={viewMode === "list" ? "flex-1" : ""}>
                                         <div className="flex items-start justify-between mb-3">
                       <h3 className="font-semibold text-gray-900 line-clamp-1">{template.title}</h3>
                       <button
                         onClick={() => handleToggleFavorite(template.id)}
                         className={`p-1 rounded-full transition-colors ${
                           favorites.some(fav => fav.id === template.id)
                             ? "text-yellow-500 hover:text-yellow-600"
                             : "text-gray-400 hover:text-yellow-500"
                         }`}
                       >
                         <Star className={`w-4 h-4 ${favorites.some(fav => fav.id === template.id) ? "fill-current" : ""}`} />
                       </button>
                     </div>
                     <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                       <span>{template.stepCount} steps</span>
                       <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                     </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/templates/${template.id}/view`}
                        className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Start Checklist
                      </Link>
                      <Link
                        href={`/templates/${template.id}/edit`}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                      </Link>
                      <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        {teams.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Teams</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team) => (
                <Link
                  key={team.id}
                  href={`/teams/${team.id}`}
                  className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {team.name}
                      </h3>
                      <p className="text-sm text-gray-600 capitalize">{team.role}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 