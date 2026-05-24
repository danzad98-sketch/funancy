'use client';

export default function GameCompleteBanner() {
  return (
    <div className="mx-3 mt-4 rounded-2xl border-3 border-coin-gold overflow-hidden bounce-in">
      <div className="bg-gradient-to-l from-coin-shine via-coin-gold to-speeder-amber text-center py-4 px-4">
        <div className="text-3xl mb-1">🎉🏆🎉</div>
        <div className="font-black text-xl text-wood-dark game-text-outline">
          !מזל טוב
        </div>
        <div className="text-sm font-bold text-wood-dark/80 mt-1">
          השלמת את כל מטרות החיים!
        </div>
        <div className="text-xs text-wood-dark/60 mt-2 font-bold">
          הצלחת לבנות את חייך — מטלפון מקשים ועד בית חלומות 🏡
        </div>
      </div>
    </div>
  );
}
