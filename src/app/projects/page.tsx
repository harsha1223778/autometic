'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/navigation/Sidebar';
import TopNav from '@/components/navigation/TopNav';
import {
  FolderKanban,
  Search,
  Grid,
  List,
  Plus,
  Trash2,
  Copy,
  Edit2,
  Download,
  ExternalLink,
  Clock,
  Calendar,
  AlertTriangle,
  Play,
  Film,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Delete modal state
  const [projectToDelete, setProjectToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Rename modal state
  const [projectToRename, setProjectToRename] = useState<any | null>(null);
  const [newTitle, setNewTitle] = useState('');

  const fetchProjects = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);

    fetch(`/api/projects?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => {
        setProjects(data?.projects || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProjects();
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${projectToDelete.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete project');

      toast.success(`Deleted "${projectToDelete.title}"`);
      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
      setProjectToDelete(null);
    } catch {
      toast.error('Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicateProject = async (project: any) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${project.title} (Copy)`,
          originalVideoUrl: project.originalVideoUrl,
          thumbnailUrl: project.thumbnailUrl,
          duration: project.duration,
          mode: project.editJobs?.[0]?.mode || 'auto',
        }),
      });

      if (!res.ok) throw new Error('Failed to duplicate');
      const data = await res.json();
      toast.success(`Duplicated "${project.title}"`);
      setProjects((prev) => [data.project, ...prev]);
    } catch {
      toast.error('Error duplicating project');
    }
  };

  const handleRenameProject = async () => {
    if (!projectToRename || !newTitle.trim()) return;
    try {
      const res = await fetch(`/api/projects/${projectToRename.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) throw new Error('Failed to rename');

      toast.success('Project renamed');
      setProjects((prev) =>
        prev.map((p) => (p.id === projectToRename.id ? { ...p, title: newTitle } : p))
      );
      setProjectToRename(null);
    } catch {
      toast.error('Failed to rename project');
    }
  };

  return (
    <div className="min-h-screen bg-[#080B14] text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 pl-64">
        <TopNav />

        <main className="pt-20 px-8 pb-16 max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-1">
                <FolderKanban className="w-3.5 h-3.5 text-cyan-400" /> Video Library
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Your Projects</h1>
            </div>

            <Link
              href="/projects/new"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Project
            </Link>
          </div>

          {/* Search, Filter, and Grid/List Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by title..."
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
            </form>

            <div className="flex items-center gap-3">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-300 focus:outline-none focus:border-purple-500"
              >
                <option value="all" className="bg-[#080B14]">All Statuses</option>
                <option value="ready" className="bg-[#080B14]">Ready to Edit</option>
                <option value="processing" className="bg-[#080B14]">Processing</option>
                <option value="completed" className="bg-[#080B14]">Completed</option>
              </select>

              {/* View Switcher */}
              <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Projects Display */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 rounded-3xl glass-panel border border-white/5 animate-pulse" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="p-16 rounded-3xl glass-panel text-center space-y-3">
              <Film className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No projects found</h3>
              <p className="text-xs text-slate-400">
                {searchQuery ? 'No results matched your query.' : 'Upload your first video to get started.'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj) => {
                const mode = proj.editJobs?.[0]?.mode || 'auto';
                const targetHref = `/projects/${proj.id}/${mode}`;

                return (
                  <div
                    key={proj.id}
                    className="rounded-3xl glass-panel border border-white/[0.08] overflow-hidden group hover:border-purple-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Video Thumbnail */}
                      <Link href={targetHref} className="block relative aspect-video bg-black/40 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={proj.thumbnailUrl || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80'}
                          alt={proj.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-slate-300 font-mono text-[11px] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-cyan-400" />
                            {Math.round(proj.duration)}s
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-500/30 text-[10px] font-semibold uppercase">
                            {mode}
                          </span>
                        </div>
                      </Link>

                      {/* Info */}
                      <div className="p-5">
                        <Link href={targetHref}>
                          <h3 className="text-sm font-bold text-white hover:text-purple-300 transition-colors truncate">
                            {proj.title}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {new Date(proj.createdAt).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span className="capitalize text-slate-300">{proj.status}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="px-5 py-3 border-t border-white/[0.06] bg-black/20 flex items-center justify-between">
                      <Link
                        href={targetHref}
                        className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                      >
                        Open <ExternalLink className="w-3 h-3" />
                      </Link>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setProjectToRename(proj);
                            setNewTitle(proj.title);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                          title="Rename"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicateProject(proj)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={proj.originalVideoUrl}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                          title="Download Footage"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => setProjectToDelete(proj)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl glass-panel border border-white/[0.08] overflow-hidden divide-y divide-white/[0.06]">
              {projects.map((proj) => {
                const mode = proj.editJobs?.[0]?.mode || 'auto';
                const targetHref = `/projects/${proj.id}/${mode}`;

                return (
                  <div key={proj.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-12 rounded-xl bg-black/40 overflow-hidden relative flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={proj.thumbnailUrl} alt={proj.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <Link href={targetHref} className="text-sm font-bold text-white hover:text-purple-300">
                          {proj.title}
                        </Link>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                          <span className="font-mono">{Math.round(proj.duration)}s</span>
                          <span>•</span>
                          <span className="uppercase text-purple-300">{mode}</span>
                          <span>•</span>
                          <span>{new Date(proj.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={targetHref}
                        className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 text-xs font-semibold transition-colors"
                      >
                        Open
                      </Link>
                      <button
                        onClick={() => handleDuplicateProject(proj)}
                        className="p-2 rounded-xl text-slate-400 hover:text-white"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setProjectToDelete(proj)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-400"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {projectToDelete && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="max-w-md w-full p-6 rounded-3xl glass-panel border border-rose-500/30 shadow-2xl space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Delete Project?</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Are you sure you want to delete &ldquo;{projectToDelete.title}&rdquo;? This will permanently erase the project, subtitles, and render history.
                  </p>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setProjectToDelete(null)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteProject}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white shadow-md shadow-rose-600/20"
                  >
                    {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Rename Modal */}
          {projectToRename && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="max-w-md w-full p-6 rounded-3xl glass-panel border border-white/10 shadow-2xl space-y-4">
                <h3 className="text-base font-bold text-white">Rename Project</h3>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-purple-500"
                />
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setProjectToRename(null)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRenameProject}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white shadow-md shadow-purple-600/20"
                  >
                    Save Title
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
