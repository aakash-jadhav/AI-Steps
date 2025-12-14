import React, { useState, useRef, useEffect } from 'react';
import { generateSteps } from './services/geminiService';
import { ColumnData, StepItem } from './types';
import { Column } from './components/Column';
import { ClayButton } from './components/ClayComponents';
import { Trash2, ChevronLeft, ChevronRight, Footprints } from 'lucide-react';

const INITIAL_COLUMN: ColumnData = {
  id: 'root',
  parentId: null,
  title: 'Start',
  steps: [],
  isLoading: false,
  type: 'input',
};

const App: React.FC = () => {
  const [columns, setColumns] = useState<ColumnData[]>([INITIAL_COLUMN]);
  const [selectedStepIds, setSelectedStepIds] = useState<Record<string, string>>({}); // map columnId -> selectedStepId
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Mobile View State
  const [mobileColIndex, setMobileColIndex] = useState(0);

  // Keyboard Navigation State
  // Tracks { colIndex, stepIndex }. colIndex 0 is input.
  const [keyboardFocus, setKeyboardFocus] = useState<{ colIndex: number, stepIndex: number } | null>(null);

  // Derived State
  const isHero = columns.length === 1;

  // --- Keyboard Handling ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea (unless specific navigation keys needed)
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      // Allow Escape to blur input
      if (isTyping && e.key === 'Escape') {
        target.blur();
        return;
      }

      if (isTyping) return;

      if (!columns.length) return;

      setKeyboardFocus(prev => {
        let current = prev || { colIndex: 0, stepIndex: -1 };
        let { colIndex, stepIndex } = current;

        switch (e.key) {
          case 'ArrowRight':
            if (colIndex < columns.length - 1) {
              colIndex++;
              // Reset step index to top when moving to new column, or keep 0
              stepIndex = 0;
            }
            break;
          case 'ArrowLeft':
            if (colIndex > 0) {
              colIndex--;
              // If moving back to input column (0), set stepIndex -1
              if (colIndex === 0) stepIndex = -1;
              else stepIndex = 0;
            }
            break;
          case 'ArrowDown':
            if (colIndex > 0) { // Can't navigate steps in column 0 (input)
              const maxSteps = columns[colIndex].steps.length;
              if (stepIndex < maxSteps - 1) stepIndex++;
            }
            break;
          case 'ArrowUp':
            if (colIndex > 0) {
              if (stepIndex > 0) stepIndex--;
            }
            break;
          case 'Enter':
            if (colIndex > 0 && stepIndex >= 0) {
              const step = columns[colIndex].steps[stepIndex];
              if (step) {
                // Trigger expansion manually
                handleStepClick(columns[colIndex].id, step);
              }
            }
            return current; // Don't change focus state on Enter
          default:
            return current;
        }

        return { colIndex, stepIndex };
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [columns]);

  // --- Actions ---

  const handleAsk = async (prompt: string) => {
    // 1. Create a loading column
    const newColId = `col-${Date.now()}`;
    const loadingCol: ColumnData = {
      id: newColId,
      parentId: 'root',
      title: prompt,
      steps: [],
      isLoading: true,
      type: 'list',
    };

    setColumns([INITIAL_COLUMN, loadingCol]);
    setMobileColIndex(1);

    // Set focus to the first step of the new column once loaded (conceptually)
    // For now, reset keyboard focus to allow user to navigate naturally
    setKeyboardFocus({ colIndex: 1, stepIndex: -1 });

    // Auto scroll desktop
    setTimeout(() => scrollToRightEnd(), 100);

    // 2. Fetch data
    try {
      const result = await generateSteps(prompt);

      if (result) {
        const steps: StepItem[] = result.steps.map((s, i) => ({
          id: `${newColId}-step-${i}`,
          title: s.title,
          description: s.description,
        }));

        setColumns(prev => prev.map(c =>
          c.id === newColId ? { ...c, isLoading: false, steps } : c
        ));
      } else {
        // Error handling - remove loading column or show error
        setColumns([INITIAL_COLUMN]);
        alert("Oops! The planner couldn't think of anything. Try again!");
      }
    } catch (error) {
      // Let error bubble up to error boundary
      setColumns([INITIAL_COLUMN]);
      throw error;
    }
  };

  const handleStepClick = async (columnId: string, step: StepItem) => {
    // Determine the index of the column clicked
    const colIndex = columns.findIndex(c => c.id === columnId);
    if (colIndex === -1) return;

    // Set selection state
    setSelectedStepIds(prev => ({ ...prev, [columnId]: step.id }));

    // Remove any columns that are "deeper" than the current one + 1 (we are replacing the next branch)
    const newColumns = columns.slice(0, colIndex + 1);

    // Create next loading column
    const nextColId = `col-${Date.now()}`;
    const loadingCol: ColumnData = {
      id: nextColId,
      parentId: columnId,
      parentStepId: step.id,
      title: step.title,
      steps: [],
      isLoading: true,
      type: 'list',
    };

    setColumns([...newColumns, loadingCol]);

    // Mobile navigation logic: move to next slide automatically
    if (window.innerWidth < 768) {
      setMobileColIndex(colIndex + 1);
    }

    // Auto scroll desktop
    setTimeout(() => scrollToRightEnd(), 100);

    // Fetch details
    try {
      const result = await generateSteps(step.title, columns[colIndex].title);

      if (result) {
        const steps: StepItem[] = result.steps.map((s, i) => ({
          id: `${nextColId}-step-${i}`,
          title: s.title,
          description: s.description,
        }));

        setColumns(prev => prev.map(c =>
          c.id === nextColId ? { ...c, isLoading: false, steps } : c
        ));
      } else {
        setColumns(newColumns);
      }
    } catch (error) {
      // Let error bubble up to error boundary
      setColumns(newColumns);
      throw error;
    }
  };

  const scrollToRightEnd = () => {
    if (scrollContainerRef.current) {
      // Small delay to ensure render
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            left: scrollContainerRef.current.scrollWidth,
            behavior: 'smooth'
          });
        }
      }, 50);
    }
  };

  const resetApp = () => {
    setColumns([INITIAL_COLUMN]);
    setSelectedStepIds({});
    setMobileColIndex(0);
    setKeyboardFocus(null);
  };

  // --- Navigation Helpers ---
  const handleNav = (direction: 'left' | 'right') => {
    // Desktop scrolling
    if (window.innerWidth >= 768) {
      if (scrollContainerRef.current) {
        // Scroll one third of the screen
        const scrollAmount = window.innerWidth / 3;
        scrollContainerRef.current.scrollBy({
          left: direction === 'left' ? -scrollAmount : scrollAmount,
          behavior: 'smooth'
        });
      }
    }
    // Mobile indexing
    else {
      if (direction === 'left' && mobileColIndex > 0) {
        setMobileColIndex(mobileColIndex - 1);
      } else if (direction === 'right' && mobileColIndex < columns.length - 1) {
        setMobileColIndex(mobileColIndex + 1);
      }
    }
  };

  // Determine nav state for disabling buttons
  const isLeftDisabled = window.innerWidth < 768 ? mobileColIndex === 0 : false;
  const isRightDisabled = window.innerWidth < 768 ? mobileColIndex === columns.length - 1 : false;

  return (
    <div className="h-screen w-screen bg-[#f0f4f8] text-slate-800 font-sans overflow-y-auto flex flex-col">

      {/* Navbar / Header */}
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-white shadow-sm flex items-center justify-between px-4 md:px-8 z-30 relative transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-sim-green to-sim-blue rounded-xl shadow-clay-card">
            <Footprints className="text-white w-5 h-5" />
          </div>
          <h1 className="font-extrabold text-xl tracking-tight text-slate-700 flex items-center gap-1">
            Steps
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {!isHero && (
            <ClayButton
              variant="secondary"
              className="!py-2 !px-3 text-xs md:text-sm"
              onClick={resetApp}
            >
              <Trash2 className="w-4 h-4" /> <span className="hidden md:inline">Clear</span>
            </ClayButton>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-visible flex flex-col">

        {/* Navigation Controls (Top, below navbar) - Always visible in Active Mode */}
        {!isHero && (
          <div className="md:absolute md:top-16 md:left-0 md:right-0 z-20 pointer-events-none px-3 py-2 md:p-4 flex justify-between items-start animate-enter-slide">
            <button
              onClick={() => handleNav('left')}
              className={`
                        pointer-events-auto
                        p-3 rounded-full bg-white/90 backdrop-blur shadow-clay-float 
                        text-slate-600 hover:text-sim-blue hover:scale-110 active:scale-95 transition-all duration-300
                        ${isLeftDisabled ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                    `}
              aria-label="Scroll Left"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={() => handleNav('right')}
              className={`
                        pointer-events-auto
                        p-3 rounded-full bg-white/90 backdrop-blur shadow-clay-float 
                        text-slate-600 hover:text-sim-blue hover:scale-110 active:scale-95 transition-all duration-300
                        ${isRightDisabled ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                    `}
              aria-label="Scroll Right"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Unified Layout with CSS Transitions */}
        {/* Desktop: Horizontal Scroll */}
        <div className="hidden md:block w-full" style={{ height: 'calc(100vh - 4rem)' }}>
          <div
            ref={scrollContainerRef}
            className={`
              flex flex-row h-full overflow-x-auto overflow-y-hidden no-scrollbar
              scroll-smooth transition-all duration-500
              ${isHero ? 'justify-center items-center' : 'justify-start items-start'}
            `}
            style={{ paddingTop: 12, paddingBottom: 12 }}
          >
            {columns.map((col, index) => {
              const isActive = keyboardFocus?.colIndex === index;
              return (
                <div
                  key={col.id}
                  className="h-full flex-shrink-0 transition-all duration-500 ease-in-out"
                  style={{
                    width: isHero ? '70vw' : '33.33vw',
                    minWidth: isHero ? '600px' : '33.33vw',
                    maxWidth: isHero ? '1024px' : '33.33vw',
                    height: '100%'
                  }}
                >
                  <Column
                    data={col}
                    isMobile={false}
                    isHero={isHero}
                    onAsk={handleAsk}
                    onStepClick={(step) => handleStepClick(col.id, step)}
                    selectedStepId={selectedStepIds[col.id]}
                    focusedStepIndex={isActive ? keyboardFocus?.stepIndex : undefined}
                  />
                </div>
              );
            })}
            {/* Infinite Scroll Spacer */}
            <div className={`h-full flex-shrink-0 transition-all duration-500 ${isHero ? 'w-0' : 'w-12'}`} />
          </div>
        </div>

        {/* Mobile: Swipe/Snap View */}
        <div className="md:hidden h-screen relative pt-4">
          <div className="min-h-[calc(100vh-4rem)] w-full px-4 pt-2 pb-4">
            <div key={mobileColIndex} className="min-h-[calc(100vh-4rem)] w-full">
              <Column
                data={columns[mobileColIndex]}
                isMobile={true}
                onAsk={handleAsk}
                onStepClick={(step) => handleStepClick(columns[mobileColIndex].id, step)}
                selectedStepId={selectedStepIds[columns[mobileColIndex].id]}
              />
            </div>
          </div>
          {/* Mobile Pill Removed */}
        </div>

      </main>

      {/* Desktop Background Decor */}
      <div className="hidden md:block fixed bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white/50 to-transparent pointer-events-none z-0" />
    </div>
  );
};

export default App;