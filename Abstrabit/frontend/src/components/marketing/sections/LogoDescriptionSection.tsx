import React from 'react';
import { Database, Cpu, Terminal, FileText, ShieldCheck, Activity } from 'lucide-react';

export const LogoDescriptionSection: React.FC = () => {
  const points = [
    {
      title: 'POSTGRESQL PGVECTOR',
      tag: 'Vector Database',
      description:
        'Multi-tenant vector search with index-level tenant partitioning, ensuring strict zero cross-workspace data leakage.',
      icon: <Database className="w-16 h-16 text-zinc-100 stroke-[1.2]" />,
    },
    {
      title: 'RECIPROCAL RANK FUSION',
      tag: 'Hybrid Search',
      description:
        'Combines pgvector semantic similarity with PostgreSQL tsvector full-text keyword ranking for zero-hallucination accuracy.',
      icon: <Cpu className="w-16 h-16 text-zinc-100 stroke-[1.2]" />,
    },
    {
      title: 'ZOD TOOLREGISTRY',
      tag: 'Deterministic Tools',
      description:
        'Centralized tool execution pipeline running schema-validated workspace operations with persistent audit logging.',
      icon: <Terminal className="w-16 h-16 text-zinc-100 stroke-[1.2]" />,
    },
    {
      title: 'PAGE-AWARE INGESTION',
      tag: 'Citation Metadata',
      description:
        'Preserves exact page numbers, section boundaries, and character range offsets (char_start – char_end) for instant citations.',
      icon: <FileText className="w-16 h-16 text-zinc-100 stroke-[1.2]" />,
    },
    {
      title: 'PROMPT DEFENSE',
      tag: 'Zero-Trust Shield',
      description:
        'Encapsulates extracted document text inside structural XML tags to neutralize indirect prompt injection attacks.',
      icon: <ShieldCheck className="w-16 h-16 text-zinc-100 stroke-[1.2]" />,
    },
    {
      title: 'RETRIEVAL DEBUGGER',
      tag: 'Real-Time Observability',
      description:
        'Inspect raw vector similarity scores, keyword ranks, RRF fusion weights, and P95 latency metrics in real time.',
      icon: <Activity className="w-16 h-16 text-zinc-100 stroke-[1.2]" />,
    },
  ];

  return (
    <section className="bg-black text-white py-24 border-t border-b border-white/10 relative overflow-hidden">
      {/* Background Dot Grid */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Wireframe Grid (3 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-white/10 bg-black/80">
          {points.map((pt, idx) => (
            <div
              key={idx}
              className="p-8 border-r border-b border-white/10 flex flex-col gap-6 justify-between bg-black/80 backdrop-blur-sm hover:bg-white/[0.02] transition-colors group"
            >
              {/* Top Centered Icon with Minimal Dot-Graph Background */}
              <div className="relative w-full h-32 flex items-center justify-center border border-white/[0.05] rounded-xl overflow-hidden bg-zinc-900/20 group-hover:bg-zinc-900/40 transition-colors">
                {/* Minimal Dot-Graph Background */}
                <div
                  className="absolute inset-0 opacity-70"
                  style={{
                    backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px)',
                    backgroundSize: '14px 14px',
                    maskImage: 'radial-gradient(ellipse at center, black 50%, transparent 85%)',
                    WebkitMaskImage: 'radial-gradient(ellipse at center, black 50%, transparent 85%)',
                  }}
                />

                {/* Accent Glow behind Icon */}
                <div className="absolute w-12 h-12 rounded-full bg-white/5 blur-xl group-hover:bg-white/10 transition-colors pointer-events-none" />

                {/* Icon */}
                <div className="relative z-10 text-white group-hover:scale-110 transition-transform duration-300">
                  {pt.icon}
                </div>
              </div>

              {/* Bottom Content */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-sm font-semibold tracking-wider uppercase text-white">
                    {pt.title}
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans font-normal">
                  {pt.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
