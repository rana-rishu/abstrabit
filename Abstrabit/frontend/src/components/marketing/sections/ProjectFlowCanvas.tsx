import React, { useState } from 'react';
import {
  Search,
  Filter,
  Sparkles,
  Database,
  FileText,
  Zap,
  Code,
  Cpu,
  CheckCircle2,
  RotateCcw,
  RotateCw,
  Link as LinkIcon,
  Shield,
  Layers,
  Terminal,
  ArrowRight,
  ArrowDown,
} from 'lucide-react';

export const ProjectFlowCanvas: React.FC = () => {
  const [activePipeline, setActivePipeline] = useState<'rag' | 'ingestion'>('rag');

  const ragStepsRow1 = [
    {
      stepNum: 'STEP 1',
      action: 'Preprocess',
      title: 'Raw User Query',
      subtitle: 'req-payload',
      icon: Search,
      glowing: false,
    },
    {
      stepNum: 'STEP 2',
      action: 'Embed 768-dim',
      title: 'QueryProcessor',
      subtitle: 'Sanitize & Normal',
      icon: Filter,
      glowing: false,
    },
    {
      stepNum: 'STEP 3',
      action: 'Hybrid RRF',
      title: 'EmbeddingProvider',
      subtitle: '768-dim Vector',
      icon: Sparkles,
      glowing: true,
    },
    {
      stepNum: 'STEP 4',
      action: 'Top 3 Extract',
      title: 'HybridRetriever',
      subtitle: 'pgvector + tsvector',
      icon: Database,
      glowing: false,
    },
    {
      stepNum: 'STEP 5',
      action: 'Intent Check',
      title: 'QuoteExtractor',
      subtitle: 'Top 3 & Offsets',
      icon: FileText,
      glowing: false,
    },
  ];

  const ragStepsRow2 = [
    {
      stepNum: 'STEP 6',
      action: 'Wrap XML Tags',
      title: 'ToolExecutor',
      subtitle: 'Zod ToolRegistry',
      icon: Zap,
      glowing: false,
    },
    {
      stepNum: 'STEP 7',
      action: 'LLM Stream',
      title: 'PromptBuilder',
      subtitle: 'XML Guardrails',
      icon: Code,
      glowing: false,
    },
    {
      stepNum: 'STEP 8',
      action: 'Map Citations',
      title: 'GeminiClient',
      subtitle: 'LLM Stream',
      icon: Cpu,
      glowing: false,
    },
    {
      stepNum: 'STEP 9',
      action: 'Final Response',
      title: 'CitationMapper',
      subtitle: 'Pages & Offsets',
      icon: CheckCircle2,
      glowing: false,
    },
  ];

  const techStackItems = [
    { name: 'pgvector (Vector DB)', icon: Database },
    { name: 'RRF (Hybrid Rank)', icon: Layers },
    { name: 'Zod (Tool Schema)', icon: Shield },
    { name: 'Gemini (LLM)', icon: Sparkles },
    { name: 'XML (Prompt Guard)', icon: Code },
    { name: 'Debugger (Telemetry)', icon: Terminal },
  ];

  return (
    <section className="py-20 bg-black text-white border-t border-white/10 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-3 mb-12">
          <span className="text-2xs font-mono tracking-widest text-zinc-400 uppercase bg-zinc-900 border border-white/10 px-3 py-1 rounded-full">
            EXACT REPOSITORY PIPELINE ARCHITECTURE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
            Visual AI Agent Execution Flow
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
            Empirical architectural simulation of Abstrabit's <code className="text-white font-mono bg-zinc-900 px-1.5 py-0.5 rounded">RagOrchestrator</code> execution sequence (Steps 1 through 9).
          </p>
        </div>

        {/* Outer Frame Container */}
        <div className="w-full rounded-2xl bg-[#0B0B0E] border border-white/15 p-4 sm:p-6 shadow-2xl relative overflow-hidden">
          {/* Decorative Corner Overlays */}
          <div className="absolute top-4 left-4 w-3 h-8 border-l-2 border-t-2 border-white/20 pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-8 h-3 border-l-2 border-b-2 border-white/20 pointer-events-none" />
          <div className="absolute top-4 right-4 text-[10px] font-mono text-zinc-600 tracking-widest pointer-events-none">
            HOST: PORT 5001
          </div>
          <div className="absolute bottom-4 left-12 text-[10px] font-mono text-zinc-600 tracking-widest pointer-events-none">
            POSTGRESQL PGVECTOR ///
          </div>

          {/* Canvas Top Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10 relative z-10">
            {/* Pipeline Mode Switcher */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActivePipeline('rag')}
                className={`px-4 py-1.5 rounded-lg font-mono text-xs font-bold tracking-wider transition-all shadow-md ${
                  activePipeline === 'rag'
                    ? 'bg-white text-black'
                    : 'bg-zinc-900 text-zinc-400 border border-white/10 hover:text-white'
                }`}
              >
                RAG ORCHESTRATOR
              </button>
              <button
                onClick={() => setActivePipeline('ingestion')}
                className={`px-4 py-1.5 rounded-lg font-mono text-xs font-bold tracking-wider transition-all shadow-md ${
                  activePipeline === 'ingestion'
                    ? 'bg-white text-black'
                    : 'bg-zinc-900 text-zinc-400 border border-white/10 hover:text-white'
                }`}
              >
                PDF INGESTION PIPELINE
              </button>
            </div>

            {/* Tech Stack Badges in Top Bar */}
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mr-1">
                STACK:
              </span>
              {techStackItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900/90 border border-white/10 text-zinc-300 text-[10px] font-mono"
                  >
                    <Icon className="w-3 h-3 text-white" />
                    <span>{item.name}</span>
                  </div>
                );
              })}
            </div>

            {/* Status Badges */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-zinc-900 border border-white/10 rounded-lg p-1">
                <button className="p-1 text-zinc-400 hover:text-white transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button className="p-1 text-zinc-400 hover:text-white transition-colors">
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="px-3 py-1 bg-zinc-900 border border-white/10 rounded-lg text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <span>RRF HYBRID SEARCH</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>

              <div className="px-3 py-1 bg-zinc-900 border border-white/10 rounded-lg text-xs font-mono text-zinc-400 flex items-center gap-1.5">
                <span>TENANT ISOLATED</span>
                <LinkIcon className="w-3 h-3 text-zinc-500" />
              </div>
            </div>
          </div>

          {/* Main Canvas Workspace Area */}
          <div
            className="relative min-h-[460px] p-6 overflow-x-auto"
            style={{
              backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          >
            {activePipeline === 'rag' ? (
              <div className="min-w-[950px] flex flex-col gap-12 py-6">
                {/* Row 1 Nodes (Step 1 to Step 5) */}
                <div className="flex items-center justify-between relative z-10 px-2">
                  {ragStepsRow1.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <React.Fragment key={idx}>
                        {/* Node Box */}
                        <div className="w-36 flex flex-col items-center gap-2 group cursor-pointer relative z-10">
                          {/* Step Number Tag Above Node */}
                          <span className="text-[9px] font-mono font-bold text-white bg-zinc-800 border border-white/20 px-2 py-0.5 rounded-md shadow">
                            {item.stepNum}
                          </span>

                          {item.glowing ? (
                            <div className="w-full py-2.5 px-3 rounded-2xl bg-black border-2 border-white flex items-center justify-center gap-2 shadow-2xl shadow-white/20 animate-pulse">
                              <Icon className="w-4 h-4 text-white flex-shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-[11px] font-mono font-bold text-white truncate">
                                  {item.title}
                                </span>
                                <span className="text-[9px] font-mono text-zinc-400 truncate">
                                  {item.subtitle}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/20 flex items-center justify-center text-white group-hover:border-white transition-all shadow-lg">
                              <Icon className="w-5 h-5" />
                            </div>
                          )}

                          {!item.glowing && (
                            <div className="flex flex-col items-center text-center">
                              <span className="text-[11px] font-mono text-white font-semibold leading-tight">
                                {item.title}
                              </span>
                              <span className="text-[9px] font-mono text-zinc-500 mt-0.5">
                                {item.subtitle}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Connector Segment between Row 1 Nodes */}
                        {idx < ragStepsRow1.length - 1 && (
                          <div className="flex-1 flex flex-col items-center justify-center px-1 relative pt-4">
                            {/* Action Name Above Line */}
                            <span className="text-[9px] font-mono text-zinc-400 bg-zinc-950 px-1.5 py-0.5 rounded border border-white/10 mb-1">
                              {item.action}
                            </span>
                            {/* Animated Line with Arrow */}
                            <div className="w-full flex items-center relative">
                              <div className="h-[1.5px] w-full bg-zinc-700 relative overflow-hidden">
                                <div className="absolute inset-0 bg-white/80 animate-pulse" />
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-white flex-shrink-0 -ml-1" />
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Right Transition Connector between Step 5 and Step 6 */}
                <div className="flex justify-end pr-8 relative z-10">
                  <div className="flex items-center gap-2 bg-zinc-900 border border-white/15 px-4 py-2 rounded-xl shadow-lg">
                    <span className="text-[10px] font-mono text-zinc-300">
                      Step 5 → Step 6: Tool Execution & Prompt Construction
                    </span>
                    <ArrowDown className="w-4 h-4 text-white animate-bounce" />
                  </div>
                </div>

                {/* Row 2 Nodes (Step 6 to Step 9) */}
                <div className="flex items-center justify-start gap-12 relative z-10 px-2">
                  {ragStepsRow2.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <React.Fragment key={idx}>
                        {/* Node Box */}
                        <div className="w-36 flex flex-col items-center gap-2 group cursor-pointer relative z-10">
                          {/* Step Number Tag Above Node */}
                          <span className="text-[9px] font-mono font-bold text-white bg-zinc-800 border border-white/20 px-2 py-0.5 rounded-md shadow">
                            {item.stepNum}
                          </span>

                          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/20 flex items-center justify-center text-white group-hover:border-white transition-all shadow-lg">
                            <Icon className="w-5 h-5" />
                          </div>

                          <div className="flex flex-col items-center text-center">
                            <span className="text-[11px] font-mono text-white font-semibold leading-tight">
                              {item.title}
                            </span>
                            <span className="text-[9px] font-mono text-zinc-500 mt-0.5">
                              {item.subtitle}
                            </span>
                          </div>
                        </div>

                        {/* Connector Segment between Row 2 Nodes */}
                        {idx < ragStepsRow2.length - 1 && (
                          <div className="w-24 flex flex-col items-center justify-center px-1 relative pt-4">
                            {/* Action Name Above Line */}
                            <span className="text-[9px] font-mono text-zinc-400 bg-zinc-950 px-1.5 py-0.5 rounded border border-white/10 mb-1">
                              {item.action}
                            </span>
                            {/* Animated Line with Arrow */}
                            <div className="w-full flex items-center relative">
                              <div className="h-[1.5px] w-full bg-zinc-700 relative overflow-hidden">
                                <div className="absolute inset-0 bg-white/80 animate-pulse" />
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-white flex-shrink-0 -ml-1" />
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Interactive Cursor Pointer "Tenant Isolation" Tag */}
                <div className="flex justify-center pt-4 pointer-events-none">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-white/20 text-white font-mono text-[10px] font-bold shadow-lg">
                    <svg className="w-3.5 h-3.5 fill-white text-white" viewBox="0 0 24 24">
                      <path d="M3 3l7 18 3-7 7-3L3 3z" />
                    </svg>
                    <span>Workspace Tenant Isolation Active (PostgreSQL pgvector)</span>
                  </div>
                </div>
              </div>
            ) : (
              /* PDF Ingestion Pipeline View */
              <div className="flex-1 flex items-center justify-center py-12 text-center text-xs font-mono text-zinc-400">
                <div className="flex flex-col items-center gap-4 max-w-md">
                  <FileText className="w-10 h-10 text-white" />
                  <span className="text-white font-bold text-sm">
                    PDFIngestionService & Page-Aware Chunker
                  </span>
                  <p className="text-zinc-500 leading-relaxed font-sans">
                    Ingests PDF documents, extracts text with exact page numbers, applies section-aware chunking, computes 768-dim embeddings, and stores vectors into PostgreSQL pgvector with tenant isolation keys.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
