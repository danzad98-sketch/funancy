'use client';

import { useRef, useState } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import { INFLATION_MIN, INFLATION_MAX } from '@/lib/constants';
import { t } from '@/data/strings';
import InflationNotification from './InflationNotification';

export default function TimeSpeederButton() {
  const { timeSpeeders, useTimeSpeeder, lastChanges } = useGameStore();
  const gameYear = useGameStore((s) => s.gameYear);
  const [showResult, setShowResult] = useState(false);
  const [shake, setShake] = useState(false);
  const [showNoSpeederMsg, setShowNoSpeederMsg] = useState(false);
  const shakeTimer = useRef<number | null>(null);
  const msgTimer = useRef<number | null>(null);

  const handleUse = () => {
    if (timeSpeeders < 1) {
      // Shake + show "no speeders" tooltip per PRD Stage 2.
      setShake(true);
      setShowNoSpeederMsg(true);
      if (shakeTimer.current) window.clearTimeout(shakeTimer.current);
      if (msgTimer.current) window.clearTimeout(msgTimer.current);
      shakeTimer.current = window.setTimeout(() => setShake(false), 400);
      msgTimer.current   = window.setTimeout(() => setShowNoSpeederMsg(false), 2200);
      return;
    }
    const success = useTimeSpeeder();
    if (success) {
      setShowResult(true);
      setTimeout(() => setShowResult(false), 4000);
    }
  };

  return (
    <div className="mx-3 mt-3 mb-4">
      {/* Inflation forecast — random 1%-3%, can be deflation or inflation */}
      <div className="mb-2 flex items-center justify-center gap-2 text-[11px]">
        <span className="text-white/40 font-bold">📅 שנה {gameYear || 1}</span>
        <span className="text-white/30">•</span>
        <span className="text-white/70 font-black">
          אינפלציה השנה: ±{(INFLATION_MIN * 100).toFixed(0)}–{(INFLATION_MAX * 100).toFixed(0)}%
        </span>
      </div>

      <button
        onClick={handleUse}
        className={`w-full py-4 rounded-xl font-black text-lg transition-all active:scale-95 flex items-center justify-center gap-3 ${
          timeSpeeders >= 1
            ? 'btn-game bg-gradient-to-b from-speeder-glow via-speeder-amber to-[#c66900] text-white glow-gold'
            : 'bg-gradient-to-b from-gray-400 to-gray-500 text-gray-300 rounded-xl border-none'
        } ${shake ? 'tspeed-shake' : ''}`}
        style={timeSpeeders >= 1 ? {
          boxShadow: '0 4px 0 0 #8a5a00, 0 6px 16px rgba(255,143,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
        } : undefined}
      >
        {/* Painted hourglass PNG — same asset as the header pill */}
        <span className="mk-icon mk-icon-hourglass mk-icon--xl mk-icon--cta" aria-hidden />

        <span className="game-text-outline">מאיץ זמן</span>
        <span className="bg-white/20 rounded-full px-3 py-0.5 text-sm font-black border border-white/20">
          {timeSpeeders}
        </span>
      </button>

      {/* No-speeder tooltip (PRD Stage 2 — shake + message). */}
      {showNoSpeederMsg && (
        <div
          role="status"
          className="mt-2 text-center text-[12px] font-bold text-amber-200 bg-black/60 rounded-lg px-3 py-1 inline-block mx-auto"
        >
          {t('no_speeder_msg')}
        </div>
      )}

      {/* Inflation notification (shows after time speeder use) */}
      {showResult && <InflationNotification />}

      {showResult && Object.keys(lastChanges).length > 0 && (
        <div className="mt-2 game-panel p-3 text-sm space-y-1 bounce-in">
          <div className="font-black text-center mb-2 text-wood-dark text-base">📅 עברה שנה!</div>
          {Object.entries(lastChanges).filter(([key]) => !/^[a-z_]+$/.test(key)).map(([key, value]) => (
            <div key={key} className="flex justify-between bg-white/50 rounded-lg px-2 py-1">
              <span className="text-wood-dark/70 font-bold">{key}</span>
              <span className={`font-black ${value >= 0 ? 'text-highlight-green' : 'text-loss-red'}`}>
                {value >= 0 ? '+' : ''}{Math.round(value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
