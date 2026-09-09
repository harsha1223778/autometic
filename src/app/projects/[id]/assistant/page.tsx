'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/navigation/Sidebar';
import TopNav from '@/components/navigation/TopNav';
import {
  BotMessageSquare,
  Sparkles,
  Send,
  Mic,
  Scissors,
  Volume2,
  Type,
  Music,
  Film,
  Sliders,
  CheckCircle2,
  ArrowRight,
  Trash2,
  Settings2,
  Save,
  Clock,
  Play,
  Share2,
  Wand2,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export default function AIAssistantPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Chat conversation
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: 'Hello! I am your AI Video Editing Assistant. Describe what you need in normal language — for example: "Make this vlog look professional. Remove long silences, add subtitles and soft background music." I will generate an actionable editing plan for you.',
      timestamp: 'Just now',
    },
  ]);
  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Generated Plan State
  const [generatedPlan, setGeneratedPlan] = useState<any>({
    summary: 'Professional vlog enhancement with silence removal, subtitles, audio cleanup, and soft music.',
    estimated_final_duration: '8m 42s',
    operations: [
      {
        id: 'op-1',
        type: 'remove_silence',
        name: 'Remove Long Silences',
        description: 'Cuts audio gaps longer than 1.5s with smooth 80ms audio crossfades.',
        enabled: true,
        icon: Scissors,
        params: { threshold_seconds: 1.5 },
      },
      {
        id: 'op-2',
        type: 'generate_subtitles',
        name: 'Auto Generated Subtitles',
        description: 'Clean sans-serif captions positioned in the lower third with auto sync.',
        enabled: true,
        icon: Type,
        params: { language: 'auto', style: 'modern_white_bottom' },
      },
      {
        id: 'op-3',
        type: 'normalize_audio',
        name: 'Broadcast Audio Normalization',
        description: 'Normalizes speech level to broadcast standard -14 LUFS with ambient gating.',
        enabled: true,
        icon: Volume2,
        params: { target_lufs: -14 },
      },
      {
        id: 'op-4',
        type: 'add_background_music',
        name: 'Curated Soundtrack Sync',
        description: 'Automated soft backing track ducked beneath vocal speech by 18dB.',
        enabled: true,
        icon: Music,
        params: { mood: 'soft', volume: 0.15 },
      },
      {
        id: 'op-5',
        type: 'apply_style',
        name: 'Professional Color Style',
        description: 'Balanced contrast curves, skin tone warmth, and subtle vignetting.',
        enabled: true,
        icon: Film,
        params: { style: 'professional' },
      },
    ],
  });

  const suggestedPrompts = [
    'Make this vlog look professional.',
    'Overlay images and insert B-roll cutaways.',
    'Remove silent parts and add subtitles.',
    'Turn this into a 30-second Instagram Reel.',
    'Add calm background music and clean the audio.',
    'Create short highlights from this podcast.',
  ];

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.project) setProject(data.project);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || promptInput;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setPromptInput('');
    setIsGenerating(true);

    try {
      const res = await fetch('/api/ai/edit-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          projectId,
          projectTitle: project?.title,
          duration: project?.duration,
        }),
      });

      if (!res.ok) {
        let errMsg = 'AI generation failed';
        try {
          const errData = await res.json();
          errMsg = errData.error || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      const data = await res.json();

      // Map operation icons
      const mappedOps = (data.plan.operations || []).map((op: any, i: number) => {
        let Icon = Scissors;
        if (op.type.includes('sub')) Icon = Type;
        else if (op.type.includes('audio') || op.type.includes('norm')) Icon = Volume2;
        else if (op.type.includes('music')) Icon = Music;
        else if (op.type.includes('style') || op.type.includes('trans')) Icon = Film;

        return {
          ...op,
          id: op.id || `op-${i + 1}`,
          icon: Icon,
          enabled: op.enabled !== undefined ? op.enabled : true,
        };
      });

      setGeneratedPlan({
        summary: data.plan.summary,
        estimated_final_duration: data.plan.estimated_final_duration || '3m 15s',
        operations: mappedOps,
      });

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: `I've created an editing plan with ${mappedOps.length} optimized operations for: "${query}". You can review, toggle, or apply the plan on the right.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      toast.error(err.message || 'AI request failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleOperation = (opId: string) => {
    setGeneratedPlan((prev: any) => ({
      ...prev,
      operations: prev.operations.map((op: any) =>
        op.id === opId ? { ...op, enabled: !op.enabled } : op
      ),
    }));
  };

  const handleRemoveOperation = (opId: string) => {
    setGeneratedPlan((prev: any) => ({
      ...prev,
      operations: prev.operations.filter((op: any) => op.id !== opId),
    }));
    toast.info('Removed operation from plan');
  };

  const handleApplyPlan = async () => {
    toast.info('Applying plan & initiating rendering...');
    try {
      const res = await fetch(`/api/projects/${projectId}/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operations: generatedPlan.operations.filter((o: any) => o.enabled),
          mode: 'assistant',
          instructions: generatedPlan.summary,
        }),
      });

      if (!res.ok) throw new Error('Render trigger failed');
      toast.success('Edit job queued! Redirecting to render preview...');
      router.push(`/projects/${projectId}/auto`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to apply plan');
    }
  };

  const handleEditPlanManually = () => {
    router.push(`/projects/${projectId}/manual`);
  };

  const handleSavePlanAsDraft = async () => {
    try {
      await fetch(`/api/projects/${projectId}/edit-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operations: generatedPlan.operations,
          mode: 'assistant',
          instructions: generatedPlan.summary,
        }),
      });
      toast.success('Saved AI edit plan as draft!');
    } catch {
      toast.error('Failed to save plan draft');
    }
  };

  return (
    <div className="min-h-screen bg-[#080B14] text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 pl-64">
        <TopNav />

        <main className="pt-20 px-8 pb-16 max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-semibold mb-1">
                <BotMessageSquare className="w-3.5 h-3.5 text-pink-400" /> AI Video Assistant
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Natural-Language Video Director
              </h1>
            </div>

            {/* Mode Switcher & Media Context Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 p-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl">
                <button
                  type="button"
                  onClick={() => router.push(`/projects/${projectId}/auto`)}
                  className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Wand2 className="w-3.5 h-3.5 text-purple-400" /> Auto Edit
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/projects/${projectId}/manual`)}
                  className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Manual Studio
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl bg-pink-600 text-white text-xs font-bold shadow-md shadow-pink-600/30 flex items-center gap-1.5"
                >
                  <BotMessageSquare className="w-3.5 h-3.5" /> AI Assistant
                </button>
              </div>

              {project && (
                <div className="px-3.5 py-1.5 rounded-xl glass-panel border border-white/10 flex items-center gap-2.5 text-xs text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold text-white truncate max-w-[140px]">{project.title}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 font-mono">{Math.round(project.duration || 30)}s</span>
                </div>
              )}
            </div>
          </div>

          {/* 2-Column Split: Conversational Chat & Generated Plan Card Deck */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
            {/* Left Chat Column */}
            <div className="lg:col-span-7 flex flex-col rounded-3xl glass-panel border border-white/[0.08] overflow-hidden">
              {/* Chat Messages Log */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'assistant' && (
                      <div className="w-8 h-8 rounded-xl bg-pink-600/20 border border-pink-500/30 text-pink-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <BotMessageSquare className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-md p-4 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none'
                          : 'bg-white/[0.04] border border-white/[0.08] text-slate-200 rounded-tl-none'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span className="text-[10px] text-white/50 block mt-1 text-right">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {isGenerating && (
                  <div className="flex gap-3 justify-start items-center text-xs text-purple-300 animate-pulse">
                    <div className="w-8 h-8 rounded-xl bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
                      <Sparkles className="w-4 h-4 animate-spin" />
                    </div>
                    <span>AI Assistant is formulating your video editing plan...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Suggested Prompt Chips */}
              <div className="px-6 py-2 border-t border-white/[0.06] bg-black/20 flex gap-2 overflow-x-auto select-none no-scrollbar">
                {suggestedPrompts.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(chip)}
                    className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[11px] text-slate-300 hover:text-white whitespace-nowrap transition-all"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <div className="p-4 border-t border-white/[0.08] bg-[#0D1122]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      placeholder="e.g. Remove pauses, add subtitles, and add soft background music..."
                      className="w-full pl-4 pr-10 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => toast.info('Voice input placeholder: microphone permission ready.')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors"
                      title="Voice Input (Speech-to-Text)"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={isGenerating || !promptInput.trim()}
                    className="p-3 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-md shadow-purple-600/30 disabled:opacity-40 transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

            {/* Right Generated Editing Plan Panel */}
            <div className="lg:col-span-5 flex flex-col rounded-3xl glass-panel border border-purple-500/30 overflow-hidden">
              {/* Plan Header */}
              <div className="p-5 border-b border-white/[0.08] bg-[#0D1122] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" /> Generated Editing Plan
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{generatedPlan.summary}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Est. Length</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    {generatedPlan.estimated_final_duration}
                  </span>
                </div>
              </div>

              {/* Actionable Operations List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {generatedPlan.operations.map((op: any) => {
                  const Icon = op.icon || Scissors;
                  return (
                    <div
                      key={op.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        op.enabled
                          ? 'bg-white/[0.03] border-white/[0.08] hover:border-purple-500/40'
                          : 'bg-white/[0.01] border-white/[0.04] opacity-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/20">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">{op.name}</h4>
                            <p className="text-[11px] text-slate-400 leading-snug mt-0.5">{op.description}</p>
                          </div>
                        </div>

                        {/* Enable/Disable Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleOperation(op.id)}
                          className={`w-8 h-4 rounded-full p-0.5 transition-colors flex-shrink-0 ${
                            op.enabled ? 'bg-purple-600' : 'bg-white/20'
                          }`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full bg-white transition-transform ${
                              op.enabled ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Operation Action Buttons */}
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/[0.04] text-[11px]">
                        <span className="text-[10px] font-mono text-cyan-300/80 uppercase">
                          {op.type}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toast.info(`Settings for: ${op.name}`)}
                            className="p-1 rounded text-slate-400 hover:text-white"
                            title="Edit Parameters"
                          >
                            <Settings2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveOperation(op.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400"
                            title="Remove Operation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Apply / Edit Buttons */}
              <div className="p-4 border-t border-white/[0.08] bg-[#0D1122] space-y-2">
                <button
                  onClick={handleApplyPlan}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Apply This Plan
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleEditPlanManually}
                    className="py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Edit Plan Manually
                  </button>
                  <button
                    onClick={handleSavePlanAsDraft}
                    className="py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5 text-purple-400" /> Save as Draft
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
