export interface StepItem {
  id: string;
  title: string;
  description: string;
  iconType?: 'build' | 'move' | 'think' | 'finish';
}

export interface ColumnData {
  id: string;
  parentId: string | null;
  parentStepId?: string | null; // The step in the previous column that triggered this
  title: string;
  steps: StepItem[];
  isLoading: boolean;
  type: 'input' | 'list';
}

export interface GemniResponseSchema {
  steps: Array<{
    title: string;
    description: string;
  }>;
}
