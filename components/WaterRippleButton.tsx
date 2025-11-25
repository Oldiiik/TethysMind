import { useState, useRef, MouseEvent, KeyboardEvent } from 'react';

interface WaterRippleButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

interface Ripple {
  x: number;
  y: number;
  size: number;
  id: number;
}

export function WaterRippleButton({ 
  onClick, 
  children, 
  disabled = false,
  className = '' 
}: WaterRippleButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const buttonRef = useRef<HTMLDivElement>(null);
  const rippleIdRef = useRef(0);

  const createRipple = (x: number, y: number) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;

    const newRipple: Ripple = {
      x,
      y,
      size,
      id: rippleIdRef.current++,
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 800);
  };

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (disabled) return;

    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    createRipple(x, y);
    onClick();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    
    // Handle Enter and Space keys
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      
      const button = buttonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const x = rect.width / 2;
      const y = rect.height / 2;

      createRipple(x, y);
      onClick();
    }
  };

  return (
    <div
      ref={buttonRef}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md 
        transition-colors focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-blue-500 focus-visible:ring-offset-2
        disabled:pointer-events-none disabled:opacity-50 
        [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0
        relative overflow-hidden cursor-pointer
        ${disabled ? 'pointer-events-none opacity-50' : ''}
        ${className}
      `}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
    >
      {/* Water Ripples */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none animate-water-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            transform: 'translate(-50%, -50%) scale(0)',
            background: 'radial-gradient(circle, rgba(147, 197, 253, 0.6) 0%, rgba(59, 130, 246, 0.3) 50%, transparent 100%)',
            animation: 'water-ripple 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards',
          }}
        />
      ))}
      
      {/* Button Content */}
      <span className="relative z-10">{children}</span>

      {/* Water wave overlay on hover */}
      <span 
        className="absolute inset-0 -z-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.2) 100%)',
        }}
      />
    </div>
  );
}