export interface BreedComparisonData {
  breed: {
    id: number;
    name: string;
    imageUrl: string | null;
    description: string | null;
  };
  traits: {
    energyLevel: number;
    friendliness: number;
    groomingNeeds: number;
    trainability: number;
    healthIssues: number;
    exerciseNeeds: number;
    sheddingLevel: number;
    barkingLevel: number;
  };
  booleanTraits: {
    goodWithChildren: boolean;
    goodWithOtherDogs: boolean;
    goodWithCats: boolean;
    apartmentFriendly: boolean;
  };
  matchPercentage?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'scale';
  options: {
    value: string;
    label: string;
    description?: string;
    icon?: string;
    weight?: number;
  }[];
  required: boolean;
}

export interface ProductFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  breedTags?: string[];
  sizeTags?: string[];
  inStock?: boolean;
}

export interface ArticleFilter {
  category?: string;
  isVetApproved?: boolean;
  tags?: string[];
}

export interface SearchSuggestion {
  type: 'breed' | 'product' | 'article';
  id: string | number;
  name: string;
  imageUrl?: string;
  description?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Extend the existing types from shared schema when needed
export interface EnrichedBreed {
  id: number;
  name: string;
  imageUrl: string | null;
  description: string | null;
  temperament: string | null;
  origin: string | null;
  lifeSpan: string | null;
  weightRange: string;
  heightRange: string;
  traits: {
    energyLevel: number;
    friendliness: number;
    groomingNeeds: number;
    trainability: number;
    healthIssues: number;
    exerciseNeeds: number;
    sheddingLevel: number;
    barkingLevel: number;
  };
  booleanTraits: {
    goodWithChildren: boolean;
    goodWithOtherDogs: boolean;
    goodWithCats: boolean;
    apartmentFriendly: boolean;
  };
  aiSummary: string | null;
  prosAndCons: {
    pros: string[];
    cons: string[];
  } | null;
}

export interface QuizResultBreed {
  breedName: string;
  matchPercentage: number;
  reasoning: string;
  pros: string[];
  cons: string[];
  breed?: EnrichedBreed;
}
