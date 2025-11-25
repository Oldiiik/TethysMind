export function WaveLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      
      {/* Wave paths */}
      <path
        d="M5 20 Q 10 12, 15 20 T 25 20 T 35 20"
        stroke="url(#waveGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
      <path
        d="M5 24 Q 10 16, 15 24 T 25 24 T 35 24"
        stroke="url(#waveGradient)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M5 28 Q 10 20, 15 28 T 25 28 T 35 28"
        stroke="url(#waveGradient)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
