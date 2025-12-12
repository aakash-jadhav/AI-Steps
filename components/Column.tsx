import React, { useState, useRef, useEffect } from 'react';
import { ColumnData, StepItem } from '../types';
import { ClayCard, ClayButton, ClayTextArea, ColumnContainer } from './ClayComponents';
import { Hammer, ArrowRight, Loader2, CheckCircle2, ChevronRight, Zap } from 'lucide-react';

interface ColumnProps {
  data: ColumnData;
  onAsk: (prompt: string) => void;
  onStepClick: (step: StepItem) => void;
  selectedStepId?: string | null;
  focusedStepIndex?: number | null; // Index of the step focused via keyboard
  isMobile: boolean;
  isHero?: boolean;
}

export const Column: React.FC<ColumnProps> = ({ 
  data, 
  onAsk, 
  onStepClick, 
  selectedStepId, 
  focusedStepIndex, 
  isMobile, 
  isHero = false 
}) => {
  const [inputValue, setInputValue] = useState('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Sync scroll for keyboard navigation
  useEffect(() => {
    if (typeof focusedStepIndex === 'number' && focusedStepIndex >= 0) {
      const card = cardRefs.current[focusedStepIndex];
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [focusedStepIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAsk(inputValue);
      // Blur the textarea to allow arrow key navigation immediately
      textAreaRef.current?.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  // --- Render Loading State ---
  if (data.isLoading) {
    return (
      <ColumnContainer className={isHero ? 'md:border-none md:bg-transparent' : ''}>
        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-sim-blue" />
          <p className="font-bold text-sm uppercase tracking-wider text-slate-500">Constructing...</p>
        </div>
      </ColumnContainer>
    );
  }

  // --- Render Input Column (First Column) ---
  if (data.type === 'input') {
    return (
      <ColumnContainer className={isHero ? 'md:border-none md:bg-transparent !border-r-0' : '!border-r-0'}>
        <div className={`flex-1 flex flex-col justify-center items-center gap-8 p-4 transition-all duration-500 ${isHero ? '' : 'pt-20'}`}>
          <div className={`
            bg-gradient-to-br from-sim-green to-sim-blue rounded-3xl shadow-clay-card flex items-center justify-center rotate-3 transform hover:rotate-6 transition-all duration-500 shrink-0
            ${isHero ? 'w-32 h-32' : 'w-20 h-20'}
          `}>
             <Hammer className={`text-white transition-all duration-500 ${isHero ? 'w-14 h-14' : 'w-10 h-10'}`} />
          </div>
          
          <div className="text-center space-y-3 shrink-0">
            <h1 className={`font-extrabold text-slate-700 tracking-tight transition-all duration-500 ${isHero ? 'text-4xl md:text-5xl' : 'text-2xl'}`}>
              What shall we <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-sim-blue to-sim-green">build today?</span>
            </h1>
            <p className={`text-slate-500 font-medium transition-all duration-500 ${isHero ? 'text-lg' : 'text-sm'}`}>Ask me how to do anything!</p>
          </div>

          <form onSubmit={handleSubmit} className={`w-full space-y-6 pb-8 transition-all duration-500 ${isHero ? 'max-w-2xl' : 'max-w-sm'}`}>
            <ClayTextArea 
              ref={textAreaRef}
              placeholder="e.g. Bake a chocolate lava cake, Build a garden shed from scratch..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              rows={isHero ? 5 : 6}
              className={`min-h-[120px] transition-all duration-500 ${isHero ? 'text-lg px-6 py-5' : 'text-base'}`}
            />
            <ClayButton type="submit" variant="success" className="w-full text-base py-4 shadow-lg">
              Let's Get Started <ArrowRight className="w-5 h-5" />
            </ClayButton>
            <div className="text-center">
                <span className="text-xs text-slate-400 font-medium">Press <kbd className="font-sans bg-slate-200 px-1 rounded">Ctrl</kbd> + <kbd className="font-sans bg-slate-200 px-1 rounded">Enter</kbd> to submit</span>
            </div>
          </form>
        </div>
        
      </ColumnContainer>
    );
  }

  // --- Render List Column (Steps) ---
  return (
    <ColumnContainer>
      <div className="mb-6 pl-2">
         <h2 className="text-xl font-bold text-slate-700 leading-tight flex items-center gap-2">
            <span className="bg-sim-blue/20 text-sim-blue p-1.5 rounded-lg">
                {data.parentId ? <CheckCircle2 className="w-5 h-5"/> : <Zap className="w-5 h-5"/>}
            </span>
            {data.title}
         </h2>
         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 ml-1">
           {data.steps.length} Steps
         </p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-8 px-2">
        {data.steps.map((step, idx) => (
          <div key={step.id} ref={el => { cardRefs.current[idx] = el; }}>
            <ClayCard 
                onClick={() => onStepClick(step)}
                isActive={selectedStepId === step.id}
                isFocused={focusedStepIndex === idx}
                className="group"
                style={{ 
                    animation: `enter-slide 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`,
                    animationDelay: `${idx * 0.05}ms`,
                    opacity: 0 
                }}
            >
                <div className="flex items-start gap-4">
                <div className={`
                    flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-base transition-colors duration-300 mt-1
                    ${selectedStepId === step.id ? 'bg-sim-blue text-white shadow-sm' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-inner'}
                `}>
                    {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-lg mb-2 leading-tight transition-colors duration-300 ${selectedStepId === step.id ? 'text-sim-blue' : 'text-slate-800'}`}>
                        {step.title}
                    </h3>
                    <p className="text-sm md:text-base text-slate-600 leading-relaxed font-medium">
                        {step.description}
                    </p>
                </div>
                <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pl-2">
                    {selectedStepId === step.id ? (
                        <ChevronRight className="w-6 h-6 text-sim-blue" />
                    ) : (
                        <div className="w-2 h-2 rounded-full bg-slate-200" />
                    )}
                </div>
                </div>
            </ClayCard>
          </div>
        ))}
        <div className="h-12 w-full" /> {/* Spacer */}
      </div>
    </ColumnContainer>
  );
};