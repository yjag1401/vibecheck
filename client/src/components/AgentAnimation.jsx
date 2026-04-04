import { useState, useEffect } from 'react';

const AGENTS = [
  { name: 'Security', color: '#FF4ECD', assign: 'Check auth & secrets...', work: 'Found SQL injection!', icon: 'M8 4L16 8V14C16 17 13 19 12 20C11 19 8 17 8 14V8Z' },
  { name: 'UX', color: '#FFB84D', assign: 'Inspect error handling...', work: 'Empty catch blocks...', icon: 'M12 5C7 5 3 8.5 2 12C3 15.5 7 19 12 19C17 19 21 15.5 22 12C21 8.5 17 5 12 5ZM12 16C9.8 16 8 14.2 8 12S9.8 8 12 8S16 9.8 16 12S14.2 16 12 16Z' },
  { name: 'Perf', color: '#00F0FF', assign: 'Profile I/O patterns...', work: 'Sync I/O blocking!', icon: 'M13 2L3 14H12L11 22L21 10H12L13 2Z' },
  { name: 'Scale', color: '#7B61FF', assign: 'Review architecture...', work: 'Hardcoded config...', icon: 'M12 2L2 7V12L12 22L22 12V7L12 2ZM12 15L7 10V8L12 5L17 8V10L12 15Z' },
  { name: 'Prod', color: '#00E5C0', assign: 'Check deploy config...', work: 'Missing health check!', icon: 'M12 2L4 6V12C4 17 8 21 12 22C16 21 20 17 20 12V6L12 2ZM11 16L7 12L8.4 10.6L11 13.2L15.6 8.6L17 10L11 16Z' },
];

function MiniRobot({ color, x, y, scale = 1 }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <rect x="-14" y="-18" width="28" height="24" rx="6" fill="#0E0E14" stroke={color} strokeWidth="1.5" />
      <circle cx="-5" cy="-8" r="3" fill={color} opacity="0.9" />
      <circle cx="5" cy="-8" r="3" fill={color} opacity="0.9" />
      <path d="M-4 0 Q0 4 4 0" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="0" y1="-18" x2="0" y2="-24" stroke={color} strokeWidth="1.2" />
      <circle cx="0" cy="-25" r="2" fill={color} opacity="0.6">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

function TypeWriter({ text, delay = 0 }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const start = setTimeout(() => {
      const interval = setInterval(() => {
        setShown(s => { if (s >= text.length) { clearInterval(interval); return s; } return s + 1; });
      }, 30);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(start);
  }, [text, delay]);
  return <span>{text.slice(0, shown)}<span className="animate-pulse">|</span></span>;
}

function AgentAnimation() {
  const [phase, setPhase] = useState(0); // 0=assembly, 1=assign, 2=working, 3=report
  const [assignIdx, setAssignIdx] = useState(-1);

  useEffect(() => {
    // Phase 0 → 1 after 1.5s
    const t1 = setTimeout(() => setPhase(1), 1500);
    // Assign agents one by one
    const assigns = AGENTS.map((_, i) => setTimeout(() => setAssignIdx(i), 2000 + i * 800));
    // Phase 2 after all assigned
    const t2 = setTimeout(() => setPhase(2), 2000 + AGENTS.length * 800 + 500);
    // Phase 3 after working
    const t3 = setTimeout(() => setPhase(3), 2000 + AGENTS.length * 800 + 4000);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); assigns.forEach(clearTimeout); };
  }, []);

  // Positions: center for assembly, spread for working
  const centerX = 300, centerY = 140;
  const spreadPositions = [
    { x: 80, y: 80 }, { x: 200, y: 60 }, { x: 320, y: 50 },
    { x: 440, y: 60 }, { x: 520, y: 80 },
  ];

  return (
    <div className="glass rounded-2xl p-6 overflow-hidden">
      <div className="text-center mb-4">
        <h3 className="text-white font-semibold text-sm">Multi-Agent Swarm Analysis</h3>
        <p className="text-dim text-[10px] font-mono mt-1">
          {phase === 0 && 'Initializing swarm...'}
          {phase === 1 && 'Assigning tasks to agents...'}
          {phase === 2 && 'Agents analyzing codebase...'}
          {phase === 3 && 'Compiling results...'}
        </p>
      </div>

      <div className="relative" style={{ height: '220px' }}>
        <svg width="100%" height="220" viewBox="0 0 600 220" className="mx-auto">
          {/* Connection lines when working */}
          {phase >= 2 && spreadPositions.map((pos, i) => (
            <line key={`line-${i}`} x1={centerX} y1={centerY} x2={pos.x} y2={pos.y}
              stroke={AGENTS[i].color} strokeWidth="0.5" opacity="0.3" strokeDasharray="4 4">
              <animate attributeName="stroke-dashoffset" values="0;-8" dur="1s" repeatCount="indefinite" />
            </line>
          ))}

          {/* Leader robot — center */}
          <MiniRobot color="#00F0FF" x={centerX} y={centerY} scale={1.2} />
          <text x={centerX} y={centerY + 25} textAnchor="middle" className="fill-cyan text-[8px] font-mono uppercase tracking-widest">Leader</text>

          {/* 5 Agent buddies */}
          {AGENTS.map((agent, i) => {
            const assigned = assignIdx >= i;
            const working = phase >= 2;
            const target = working ? spreadPositions[i] : { x: centerX + (i - 2) * 50, y: centerY - 50 };
            const visible = phase >= 1 && assigned;

            return (
              <g key={i} style={{
                transform: `translate(${target.x}px, ${target.y}px)`,
                transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                opacity: visible ? 1 : 0,
                transitionProperty: 'transform, opacity',
              }}>
                {/* Robot at 0,0 since we're using CSS transform */}
                <rect x="-12" y="-15" width="24" height="20" rx="5" fill="#0E0E14" stroke={agent.color} strokeWidth="1.2" />
                <circle cx="-4" cy="-7" r="2.5" fill={agent.color} opacity="0.9">
                  {working && <animate attributeName="r" values="2.5;3;2.5" dur="0.8s" repeatCount="indefinite" />}
                </circle>
                <circle cx="4" cy="-7" r="2.5" fill={agent.color} opacity="0.9">
                  {working && <animate attributeName="r" values="2.5;3;2.5" dur="0.8s" repeatCount="indefinite" begin="0.4s" />}
                </circle>
                <path d={`M-3 1 Q0 3.5 3 1`} fill="none" stroke={agent.color} strokeWidth="1" strokeLinecap="round" />
                <line x1="0" y1="-15" x2="0" y2="-20" stroke={agent.color} strokeWidth="1" />
                <circle cx="0" cy="-21" r="1.5" fill={agent.color} opacity="0.5">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" repeatCount="indefinite" />
                </circle>
                {/* Name label */}
                <text x="0" y="14" textAnchor="middle" fontSize="7" fill={agent.color} className="font-mono">{agent.name}</text>
              </g>
            );
          })}
        </svg>

        {/* Speech bubbles — positioned absolutely */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Leader speech */}
          {phase === 0 && (
            <div className="absolute left-1/2 -translate-x-1/2 top-[40%] glass px-3 py-1.5 rounded-lg text-[10px] text-cyan font-mono animate-bounce" style={{ animationDuration: '2s' }}>
              <TypeWriter text="Deploying swarm agents..." />
            </div>
          )}

          {/* Assignment speech bubbles */}
          {phase === 1 && assignIdx >= 0 && assignIdx < AGENTS.length && (
            <div className="absolute left-1/2 -translate-x-1/2 top-[25%] glass px-3 py-1.5 rounded-lg text-[10px] font-mono fade-in"
              style={{ color: AGENTS[assignIdx].color, borderColor: `${AGENTS[assignIdx].color}30` }}>
              <TypeWriter text={`${AGENTS[assignIdx].name}: "${AGENTS[assignIdx].assign}"`} key={assignIdx} />
            </div>
          )}

          {/* Working speech bubbles */}
          {phase === 2 && (
            <div className="absolute left-1/2 -translate-x-1/2 top-[5%] glass px-3 py-1.5 rounded-lg text-[10px] text-dim font-mono">
              <span className="text-cyan">Analyzing</span>
              <span className="animate-pulse"> ...</span>
            </div>
          )}

          {/* Report phase */}
          {phase === 3 && (
            <div className="absolute left-1/2 -translate-x-1/2 top-[25%] glass px-4 py-2 rounded-lg text-xs text-cyan font-mono font-semibold fade-in">
              Analysis complete — compiling reports...
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-1 bg-[#1a1a24] rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#FF4ECD] via-[#7B61FF] to-[#00F0FF] rounded-full transition-all duration-1000"
          style={{ width: phase === 0 ? '10%' : phase === 1 ? '40%' : phase === 2 ? '70%' : '95%' }} />
      </div>
      <div className="flex justify-between mt-1 text-[8px] text-dim font-mono uppercase tracking-widest">
        <span className={phase >= 0 ? 'text-cyan' : ''}>Deploy</span>
        <span className={phase >= 1 ? 'text-[#FFB84D]' : ''}>Assign</span>
        <span className={phase >= 2 ? 'text-[#7B61FF]' : ''}>Analyze</span>
        <span className={phase >= 3 ? 'text-[#00E5C0]' : ''}>Report</span>
      </div>
    </div>
  );
}

export default AgentAnimation;
