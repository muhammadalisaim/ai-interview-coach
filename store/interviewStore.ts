import { create } from 'zustand';
import { InterviewStatus, ExperienceLevel, InterviewMode } from '../types';

export interface CurrentQuestionItem {
  id: string;
  text: string;
  position?: number;
  isFollowUp?: boolean;
}

export interface InterviewStoreState {
  sessionId: string | null;
  role: string;
  level: ExperienceLevel;
  mode: InterviewMode;
  currentQuestion: CurrentQuestionItem | null;
  questionIndex: number;
  totalQuestions: number;
  status: InterviewStatus;
  timeLimitSec: number;
  showCaptions: boolean;
  inputMode: 'voice' | 'text';
  error: string | null;
  set: (p: Partial<InterviewStoreState>) => void;
  reset: () => void;
}

const initialState = {
  sessionId: null,
  role: 'Frontend Developer',
  level: 'fresher' as ExperienceLevel,
  mode: 'full' as InterviewMode,
  currentQuestion: null,
  questionIndex: 0,
  totalQuestions: 5,
  status: 'idle' as InterviewStatus,
  timeLimitSec: 180, // 3 minutes standard limit
  showCaptions: true,
  inputMode: 'voice' as 'voice' | 'text',
  error: null,
};

export const useInterviewStore = create<InterviewStoreState>((set) => ({
  ...initialState,
  set: (p) => set(p),
  reset: () => set(initialState),
}));
