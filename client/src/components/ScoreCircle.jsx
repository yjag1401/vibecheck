import { useState, useEffect } from 'react';

function getLetterGrade(score) {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 60) return 'D';
  if (score >= 40) return 'E';
  return 'F';
}

function ScoreCircle({ score, verdict, verdictColor }) {
  const [displayScore, setDisplayScore] = useState(0);
  const [showGrade, setShowGrade] = useState(false);

  useEffect(() => {
    let start = 0;
    const stepTime = Math.max(1500 / (score || 1), 10);
    const timer = setInterval(() => {
      start++;
      setDisplayScore(start);
      if (start >= score) {
        clearInterval(timer);
        setTimeout(() => setShowGrade(true), 300);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [score]);

  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;
  const grade = getLetterGrade(score);

  // Minimal color — only verdict gets a subtle hint
  const verdictStyles = {
    green: { color: '#4ade80', label: 'text-green-400', bg: 'rgba(74,222,128,0.08)' },
    yellow: { color: '#fbbf24', label: 'text-amber-400', bg: 'rgba(251,191,36,0.08)' },
    red: { color: '#ff3b30', label: 'text-red-400', bg: 'rgba(255,59,48,0.08)' },
  };
  const vs = verdictStyles[verdictColor] || verdictStyles.red;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.05))' }}>
        <svg width="220" height="220" className="-rotate-90">
          <circle cx="110" cy="110" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <circle
            cx="110" cy="110" r={radius} fill="none"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-black text-white">{displayScore}</span>
          <span className="text-sm text-white/30 font-medium">/100</span>
        </div>
      </div>

      {showGrade && (
        <div className="mt-3 text-7xl font-black text-white grade-pop" style={{ textShadow: '0 0 40px rgba(255,255,255,0.15)' }}>
          {grade}
        </div>
      )}

      <div className={`mt-3 px-8 py-2.5 rounded-full font-extrabold text-xl tracking-wider ${vs.label}`}
        style={{ background: vs.bg }}
      >
        {verdict}
      </div>
    </div>
  );
}

export default ScoreCircle;
