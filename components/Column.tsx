import React, { useState, useRef, useEffect } from 'react';
import { ColumnData, StepItem } from '../types';
import { ClayCard, ClayButton, ClayTextArea, ColumnContainer } from './ClayComponents';
import { Hammer, ArrowRight, CheckCircle2, ChevronRight, Zap } from 'lucide-react';

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
      const textarea = document.querySelector('textarea');
      textarea?.blur();
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
    // Render skeleton cards to match visual structure of steps
    // Configurable skeleton settings
    const SKELETON_COUNT = 5; // number of placeholder cards
    const SKELETON_ANIM_MS = 1200; // pulse animation duration in ms
    const SKELETON_BG_CLASS = 'bg-slate-200/70';
    const skeletons = Array.from({ length: SKELETON_COUNT });
    return (
      <ColumnContainer className={isHero ? 'md:border-none md:bg-transparent' : ''}>
        <div className="flex flex-col gap-3 h-full w-full py-2">
          {skeletons.map((_, i) => (
            <div key={i} className="animate-pulse" style={{ animationDuration: `${SKELETON_ANIM_MS}ms` }}>
              <div className="bg-white rounded-xl shadow-clay-card p-4 border-b-2 border-slate-100">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg ${SKELETON_BG_CLASS}`} />
                    <div className={`h-4 ${SKELETON_BG_CLASS} rounded w-3/4`} />
                    <div className={`ml-auto w-3 h-3 rounded-full ${SKELETON_BG_CLASS}`} />
                  </div>
                  <div className="mt-1">
                    <div className={`h-3 ${SKELETON_BG_CLASS} rounded w-full mb-2`} />
                    <div className={`h-3 ${SKELETON_BG_CLASS} rounded w-5/6`} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ColumnContainer>
    );
  }

  // --- Render Input Column (First Column) ---
  if (data.type === 'input') {
    return (
      <ColumnContainer className={isHero ? 'md:border-none md:bg-transparent !border-r-0' : '!border-r-0'}>
        <div className={`flex-1 flex flex-col ${isHero ? 'justify-center' : 'justify-start'} items-center ${isHero ? 'gap-4' : 'gap-3'} p-4 transition-all duration-500 ${isHero ? '' : 'pt-4'}`}>
          <div className={`
            bg-gradient-to-br from-sim-green to-sim-blue rounded-3xl shadow-clay-card flex items-center justify-center rotate-3 transform hover:rotate-6 transition-all duration-500 shrink-0
            ${isHero ? 'w-24 h-24' : 'w-16 h-16'}
          `}>
            <Hammer className={`text-white transition-all duration-500 ${isHero ? 'w-10 h-10' : 'w-7 h-7'}`} />
          </div>

          <div className="text-center space-y-1 shrink-0">
            <h1 className={`font-extrabold text-slate-700 tracking-tight transition-all duration-500 ${isHero ? 'text-3xl md:text-4xl' : 'text-xl'}`}>
              What shall we <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-sim-blue to-sim-green">build today?</span>
            </h1>
            <p className={`text-slate-500 font-medium transition-all duration-500 ${isHero ? 'text-base' : 'text-xs'}`}>Ask me how to do anything!</p>
          </div>

          <form onSubmit={handleSubmit} className={`w-full space-y-3 ${isHero ? 'pb-12' : 'pb-6'} transition-all duration-500 ${isHero ? 'max-w-2xl' : 'max-w-sm'}`}>
            <ClayTextArea
              placeholder="e.g. Bake a chocolate lava cake, Build a garden shed from scratch..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              rows={isHero ? 5 : 5}
              className={`transition-all duration-500 ${isHero ? 'min-h-[120px] text-lg px-4 py-3' : 'min-h-[120px] text-sm px-3 py-2'}`}
            />
            <ClayButton type="submit" variant="success" className={`w-full ${isHero ? 'text-base py-3' : 'text-sm py-2'} shadow-lg`}>
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
            {data.parentId ? <CheckCircle2 className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
          </span>
          {data.title}
        </h2>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 ml-1">
          {data.steps.length} Steps
        </p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-8 px-0">
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
              <div className="flex flex-col gap-1">
                {/* First row: Step number and title */}
                <div className="flex items-baseline gap-3">
                  <div className={`
                      flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm transition-colors duration-300
                      ${selectedStepId === step.id ? 'bg-sim-blue text-white shadow-sm' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-inner'}
                  `}>
                    {idx + 1}
                  </div>
                  <h3 className={`font-bold text-base leading-tight transition-colors duration-300 flex-1 ${selectedStepId === step.id ? 'text-sim-blue' : 'text-slate-800'}`}>
                    {step.title}
                  </h3>
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {selectedStepId === step.id ? (
                      <ChevronRight className="w-5 h-5 text-sim-blue" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-200" />
                    )}
                  </div>
                </div>

                {/* Second row: Description starting from below number, edge to edge */}
                <p className="text-sm text-slate-600 leading-relaxed font-medium ">
                  {step.description}
                </p>
              </div>
            </ClayCard>
          </div>
        ))}
        <div className="h-12 w-full" /> {/* Spacer */}
      </div>
    </ColumnContainer>
  );
};