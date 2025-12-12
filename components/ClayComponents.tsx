import React from 'react';

// --- Clay Card ---
interface ClayCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
  isFocused?: boolean; // New prop for keyboard navigation
  style?: React.CSSProperties;
}

export const ClayCard: React.FC<ClayCardProps> = ({ children, className = '', onClick, isActive, isFocused, style }) => {
  // Combine active (clicked) and focused (keyboard) states
  const activeStyles = isActive 
    ? 'border-sim-blue border-l-4 bg-blue-50/50 scale-[1.02] z-10' 
    : isFocused 
      ? 'border-sim-blue border-l-4 bg-white scale-105 shadow-2xl z-20 ring-2 ring-sim-blue/20' // Mimic hover + focus ring
      : 'border-transparent border-l-4 hover:scale-105 hover:shadow-2xl hover:z-20 transition-all duration-300 ease-out';

  return (
    <div 
      onClick={onClick}
      style={style}
      className={`
        relative 
        bg-white 
        rounded-xl 
        shadow-clay-card 
        p-5 
        border-b-2 border-slate-100
        cursor-pointer
        select-none
        transform-gpu
        ${activeStyles}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// --- Clay Button ---
interface ClayButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
}

export const ClayButton: React.FC<ClayButtonProps> = ({ children, className = '', variant = 'primary', ...props }) => {
  let colors = '';
  let shadow = 'shadow-clay-btn active:shadow-clay-btn-active active:translate-y-[4px]';
  let hover = '';
  
  if (variant === 'primary') {
    colors = 'bg-gradient-to-br from-sim-blue to-cyan-600 text-white border-none';
    shadow = 'shadow-[0_4px_0_#0891b2,0_8px_10px_rgba(0,0,0,0.15)] active:shadow-[0_0_0_#0891b2,inset_0_2px_4px_rgba(0,0,0,0.1)]';
    hover = 'hover:brightness-110 hover:-translate-y-1';
  } else if (variant === 'success') {
    colors = 'bg-gradient-to-br from-sim-green to-emerald-500 text-white border-none';
    shadow = 'shadow-[0_4px_0_#15803d,0_8px_10px_rgba(0,0,0,0.15)] active:shadow-[0_0_0_#15803d,inset_0_2px_4px_rgba(0,0,0,0.1)]';
    hover = 'hover:brightness-110 hover:scale-105 hover:-translate-y-1';
  } else if (variant === 'secondary') {
    colors = 'bg-white text-slate-600 border border-slate-200';
    shadow = 'shadow-[0_4px_0_#cbd5e1,0_8px_10px_rgba(0,0,0,0.1)] active:shadow-[0_0_0_#cbd5e1,inset_0_2px_4px_rgba(0,0,0,0.05)]';
    hover = 'hover:text-rose-500 hover:border-rose-200 hover:shadow-[0_4px_0_#fda4af,0_8px_10px_rgba(0,0,0,0.1)] hover:bg-rose-50 active:shadow-[0_0_0_#be123c]';
  } else if (variant === 'danger') {
    colors = 'bg-rose-400 text-white';
    shadow = 'shadow-[0_4px_0_#be123c,0_8px_10px_rgba(0,0,0,0.15)] active:shadow-[0_0_0_#be123c,inset_0_2px_4px_rgba(0,0,0,0.1)]';
  }

  return (
    <button
      className={`
        px-6 py-3 
        rounded-xl 
        font-bold 
        text-sm
        uppercase tracking-wide
        transition-all duration-200
        flex items-center justify-center gap-2
        ${colors}
        ${shadow}
        ${hover}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

// --- Clay Input ---
interface ClayInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const ClayInput: React.FC<ClayInputProps> = ({ className = '', ...props }) => {
  return (
    <input
      className={`
        w-full
        px-4 py-3
        rounded-xl
        bg-slate-50
        border-2 border-slate-200/50
        text-slate-700
        placeholder-slate-400
        shadow-clay-input
        focus:outline-none focus:border-sim-blue focus:bg-white
        transition-colors duration-200
        font-medium
        ${className}
      `}
      {...props}
    />
  );
};

// --- Clay TextArea ---
interface ClayTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const ClayTextArea: React.FC<ClayTextAreaProps> = ({ className = '', ...props }) => {
  return (
    <textarea
      className={`
        w-full
        px-4 py-3
        rounded-xl
        bg-slate-50
        border-2 border-slate-200/50
        text-slate-700
        placeholder-slate-400
        /* Stronger shadow for distinct separation */
        shadow-[inset_0_2px_4px_rgba(0,0,0,0.05),0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)]
        focus:outline-none focus:border-sim-blue focus:bg-white focus:shadow-lg
        transition-all duration-200
        font-medium
        resize-none
        ${className}
      `}
      {...props}
    />
  );
};

// --- Column Container ---
export const ColumnContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`
    h-full 
    w-full 
    flex flex-col 
    p-4 
    md:border-r-4 border-slate-300/50
    md:bg-white/30 md:backdrop-blur-sm
    snap-center
    ${className}
  `}>
    {children}
  </div>
);