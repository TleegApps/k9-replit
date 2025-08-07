import { create } from 'zustand';
import type { Breed, Comparison, QuizResponse } from '@shared/schema';

interface BreedState {
  selectedBreeds: Breed[];
  comparedBreeds: Breed[];
  searchQuery: string;
  filters: {
    size: string[];
    energyLevel: number;
    goodWithChildren: boolean;
    goodWithOtherDogs: boolean;
    goodWithCats: boolean;
    groomingNeeds: string;
    experience: string;
  };
  isFilterSidebarOpen: boolean;
}

interface QuizState {
  currentStep: number;
  totalSteps: number;
  responses: Record<string, any>;
  results: QuizResponse | null;
  isCompleted: boolean;
}

interface UIState {
  isLoading: boolean;
  currentPage: string;
  cartItems: number[];
  toast: {
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  };
}

interface StoreState extends BreedState, QuizState, UIState {
  // Breed actions
  setSelectedBreeds: (breeds: Breed[]) => void;
  addBreedToComparison: (breed: Breed) => void;
  removeBreedFromComparison: (breedId: number) => void;
  clearComparison: () => void;
  setSearchQuery: (query: string) => void;
  updateFilters: (filters: Partial<BreedState['filters']>) => void;
  resetFilters: () => void;
  toggleFilterSidebar: () => void;
  
  // Quiz actions
  updateQuizResponse: (step: string, value: any) => void;
  nextQuizStep: () => void;
  previousQuizStep: () => void;
  resetQuiz: () => void;
  setQuizResults: (results: QuizResponse) => void;
  
  // UI actions
  setLoading: (loading: boolean) => void;
  setCurrentPage: (page: string) => void;
  addToCart: (productId: number) => void;
  removeFromCart: (productId: number) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

const initialFilters = {
  size: [],
  energyLevel: 3,
  goodWithChildren: false,
  goodWithOtherDogs: false,
  goodWithCats: false,
  groomingNeeds: '',
  experience: '',
};

export const useStore = create<StoreState>((set, get) => ({
  // Initial state
  selectedBreeds: [],
  comparedBreeds: [],
  searchQuery: '',
  filters: initialFilters,
  isFilterSidebarOpen: false,
  
  currentStep: 1,
  totalSteps: 8,
  responses: {},
  results: null,
  isCompleted: false,
  
  isLoading: false,
  currentPage: '/',
  cartItems: [],
  toast: {
    show: false,
    message: '',
    type: 'info',
  },
  
  // Breed actions
  setSelectedBreeds: (breeds) => set({ selectedBreeds: breeds }),
  
  addBreedToComparison: (breed) => set((state) => {
    const { comparedBreeds } = state;
    if (comparedBreeds.length >= 4) {
      return state; // Max 4 breeds for comparison
    }
    if (comparedBreeds.some(b => b.id === breed.id)) {
      return state; // Breed already in comparison
    }
    return { comparedBreeds: [...comparedBreeds, breed] };
  }),
  
  removeBreedFromComparison: (breedId) => set((state) => ({
    comparedBreeds: state.comparedBreeds.filter(breed => breed.id !== breedId)
  })),
  
  clearComparison: () => set({ comparedBreeds: [] }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  updateFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),
  
  resetFilters: () => set({ filters: initialFilters }),
  
  toggleFilterSidebar: () => set((state) => ({
    isFilterSidebarOpen: !state.isFilterSidebarOpen
  })),
  
  // Quiz actions
  updateQuizResponse: (step, value) => set((state) => ({
    responses: { ...state.responses, [step]: value }
  })),
  
  nextQuizStep: () => set((state) => {
    const nextStep = Math.min(state.currentStep + 1, state.totalSteps);
    return { currentStep: nextStep };
  }),
  
  previousQuizStep: () => set((state) => {
    const prevStep = Math.max(state.currentStep - 1, 1);
    return { currentStep: prevStep };
  }),
  
  resetQuiz: () => set({
    currentStep: 1,
    responses: {},
    results: null,
    isCompleted: false,
  }),
  
  setQuizResults: (results) => set({
    results,
    isCompleted: true,
  }),
  
  // UI actions
  setLoading: (loading) => set({ isLoading: loading }),
  
  setCurrentPage: (page) => set({ currentPage: page }),
  
  addToCart: (productId) => set((state) => {
    if (!state.cartItems.includes(productId)) {
      return { cartItems: [...state.cartItems, productId] };
    }
    return state;
  }),
  
  removeFromCart: (productId) => set((state) => ({
    cartItems: state.cartItems.filter(id => id !== productId)
  })),
  
  showToast: (message, type) => set({
    toast: { show: true, message, type }
  }),
  
  hideToast: () => set((state) => ({
    toast: { ...state.toast, show: false }
  })),
}));
