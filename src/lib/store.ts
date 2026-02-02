import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface SwipeAnswer {
  scenarioId: string;
  answer: 'yes' | 'no';
  timestamp: number;
}

export interface GameState {
  // Current game state
  currentIndex: number;
  answers: SwipeAnswer[];
  history: SwipeAnswer[]; // For undo functionality
  isComplete: boolean;
  
  // Settings
  soundEnabled: boolean;
  highContrastMode: boolean;
  
  // Actions
  recordAnswer: (scenarioId: string, answer: 'yes' | 'no') => void;
  undoLastAnswer: () => SwipeAnswer | null;
  resetGame: () => void;
  setCurrentIndex: (index: number) => void;
  markComplete: () => void;
  toggleSound: () => void;
  toggleHighContrast: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentIndex: 0,
      answers: [],
      history: [],
      isComplete: false,
      soundEnabled: false,
      highContrastMode: false,

      // Record an answer
      recordAnswer: (scenarioId, answer) => {
        const newAnswer: SwipeAnswer = {
          scenarioId,
          answer,
          timestamp: Date.now(),
        };
        
        set((state) => ({
          answers: [...state.answers.filter((a) => a.scenarioId !== scenarioId), newAnswer],
          history: [...state.history, newAnswer],
          currentIndex: state.currentIndex + 1,
        }));
      },

      // Undo the last answer
      undoLastAnswer: () => {
        const state = get();
        if (state.history.length === 0) return null;
        
        const lastAnswer = state.history[state.history.length - 1];
        
        set((state) => ({
          answers: state.answers.filter((a) => a.scenarioId !== lastAnswer.scenarioId),
          history: state.history.slice(0, -1),
          currentIndex: Math.max(0, state.currentIndex - 1),
          isComplete: false,
        }));
        
        return lastAnswer;
      },

      // Reset game state
      resetGame: () => {
        set({
          currentIndex: 0,
          answers: [],
          history: [],
          isComplete: false,
        });
      },

      // Set current index manually
      setCurrentIndex: (index) => {
        set({ currentIndex: index });
      },

      // Mark game as complete
      markComplete: () => {
        set({ isComplete: true });
      },

      // Toggle sound
      toggleSound: () => {
        set((state) => ({ soundEnabled: !state.soundEnabled }));
      },

      // Toggle high contrast
      toggleHighContrast: () => {
        set((state) => ({ highContrastMode: !state.highContrastMode }));
      },
    }),
    {
      name: 'swipe-game-storage',
      partialize: (state) => ({
        soundEnabled: state.soundEnabled,
        highContrastMode: state.highContrastMode,
      }),
    }
  )
);

// Room-specific store (not persisted across rooms)
interface RoomState {
  roomCode: string | null;
  sessionId: string | null;
  roomAnswers: Map<string, SwipeAnswer>;
  setRoom: (roomCode: string, sessionId: string) => void;
  addRoomAnswer: (answer: SwipeAnswer) => void;
  removeRoomAnswer: (scenarioId: string) => void;
  clearRoom: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  roomCode: null,
  sessionId: null,
  roomAnswers: new Map(),

  setRoom: (roomCode, sessionId) => {
    set({ roomCode, sessionId, roomAnswers: new Map() });
  },

  addRoomAnswer: (answer) => {
    set((state) => {
      const newAnswers = new Map(state.roomAnswers);
      newAnswers.set(answer.scenarioId, answer);
      return { roomAnswers: newAnswers };
    });
  },

  removeRoomAnswer: (scenarioId) => {
    set((state) => {
      const newAnswers = new Map(state.roomAnswers);
      newAnswers.delete(scenarioId);
      return { roomAnswers: newAnswers };
    });
  },

  clearRoom: () => {
    set({ roomCode: null, sessionId: null, roomAnswers: new Map() });
  },
}));

// Reveal slideshow state
interface RevealState {
  currentSlide: number;
  isAutoPlaying: boolean;
  setCurrentSlide: (index: number) => void;
  nextSlide: (total: number) => void;
  prevSlide: () => void;
  toggleAutoPlay: () => void;
}

export const useRevealStore = create<RevealState>((set) => ({
  currentSlide: 0,
  isAutoPlaying: false,

  setCurrentSlide: (index) => {
    set({ currentSlide: index });
  },

  nextSlide: (total) => {
    set((state) => ({
      currentSlide: state.currentSlide < total - 1 ? state.currentSlide + 1 : state.currentSlide,
    }));
  },

  prevSlide: () => {
    set((state) => ({
      currentSlide: state.currentSlide > 0 ? state.currentSlide - 1 : 0,
    }));
  },

  toggleAutoPlay: () => {
    set((state) => ({ isAutoPlaying: !state.isAutoPlaying }));
  },
}));
