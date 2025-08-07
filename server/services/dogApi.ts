import { storage } from "../storage";
import type { InsertBreed } from "@shared/schema";

interface DogApiBreed {
  id: number;
  name: string;
  bred_for?: string;
  breed_group?: string;
  life_span?: string;
  temperament?: string;
  origin?: string;
  reference_image_id?: string;
  image?: {
    id: string;
    url: string;
    width: number;
    height: number;
  };
  weight?: {
    imperial: string;
    metric: string;
  };
  height?: {
    imperial: string;
    metric: string;
  };
}

class DogApiService {
  private baseUrl = 'https://api.thedogapi.com/v1';
  private apiKey = process.env.DOG_API_KEY || process.env.THE_DOG_API_KEY;

  private async fetchFromApi(endpoint: string): Promise<any> {
    const headers: Record<string, string> = {};
    if (this.apiKey) {
      headers['x-api-key'] = this.apiKey;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, { headers });
    
    if (!response.ok) {
      throw new Error(`Dog API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  async getAllBreeds(): Promise<DogApiBreed[]> {
    return this.fetchFromApi('/breeds');
  }

  async getBreedImage(imageId: string): Promise<string> {
    try {
      const image = await this.fetchFromApi(`/images/${imageId}`);
      return image.url;
    } catch (error) {
      console.error(`Failed to fetch image ${imageId}:`, error);
      return '';
    }
  }

  private parseWeightRange(weightStr?: string): { min: number; max: number } | null {
    if (!weightStr) return null;
    
    const matches = weightStr.match(/(\d+)\s*-\s*(\d+)/);
    if (matches) {
      return {
        min: parseInt(matches[1]),
        max: parseInt(matches[2])
      };
    }
    
    const singleMatch = weightStr.match(/(\d+)/);
    if (singleMatch) {
      const weight = parseInt(singleMatch[1]);
      return { min: weight, max: weight };
    }
    
    return null;
  }

  private parseHeightRange(heightStr?: string): { min: number; max: number } | null {
    if (!heightStr) return null;
    
    const matches = heightStr.match(/(\d+)\s*-\s*(\d+)/);
    if (matches) {
      return {
        min: parseInt(matches[1]),
        max: parseInt(matches[2])
      };
    }
    
    const singleMatch = heightStr.match(/(\d+)/);
    if (singleMatch) {
      const height = parseInt(singleMatch[1]);
      return { min: height, max: height };
    }
    
    return null;
  }

  private generateTraitScores(temperament?: string, breedGroup?: string): {
    energyLevel: number;
    friendliness: number;
    groomingNeeds: number;
    trainability: number;
    healthIssues: number;
    exerciseNeeds: number;
    sheddingLevel: number;
    barkingLevel: number;
  } {
    // Basic trait scoring based on temperament and breed group
    const traits = temperament?.toLowerCase() || '';
    const group = breedGroup?.toLowerCase() || '';
    
    return {
      energyLevel: this.scoreFromTraits(traits, ['energetic', 'active', 'lively'], ['calm', 'gentle', 'lazy']),
      friendliness: this.scoreFromTraits(traits, ['friendly', 'outgoing', 'social'], ['aloof', 'reserved', 'aggressive']),
      groomingNeeds: this.scoreFromTraits(traits, ['long', 'coat', 'fluffy'], ['short', 'smooth']),
      trainability: this.scoreFromTraits(traits, ['intelligent', 'obedient', 'eager'], ['stubborn', 'independent']),
      healthIssues: group.includes('toy') ? 4 : group.includes('working') ? 2 : 3,
      exerciseNeeds: this.scoreFromTraits(traits, ['active', 'energetic', 'working'], ['calm', 'gentle']),
      sheddingLevel: this.scoreFromTraits(traits, ['double coat', 'long'], ['short', 'wire']),
      barkingLevel: this.scoreFromTraits(traits, ['alert', 'watchful'], ['quiet', 'calm'])
    };
  }

  private scoreFromTraits(traits: string, positiveKeywords: string[], negativeKeywords: string[]): number {
    let score = 3; // Default middle score
    
    positiveKeywords.forEach(keyword => {
      if (traits.includes(keyword)) score += 1;
    });
    
    negativeKeywords.forEach(keyword => {
      if (traits.includes(keyword)) score -= 1;
    });
    
    return Math.max(1, Math.min(5, score));
  }

  private generateBooleanTraits(temperament?: string, breedGroup?: string): {
    goodWithChildren: boolean;
    goodWithOtherDogs: boolean;
    goodWithCats: boolean;
    apartmentFriendly: boolean;
  } {
    const traits = temperament?.toLowerCase() || '';
    const group = breedGroup?.toLowerCase() || '';
    
    return {
      goodWithChildren: traits.includes('gentle') || traits.includes('patient') || traits.includes('friendly'),
      goodWithOtherDogs: traits.includes('social') || traits.includes('friendly') || !traits.includes('aggressive'),
      goodWithCats: traits.includes('gentle') || group.includes('toy') || group.includes('non-sporting'),
      apartmentFriendly: group.includes('toy') || group.includes('non-sporting') || traits.includes('calm')
    };
  }

  async syncBreeds(): Promise<void> {
    try {
      console.log('Starting breed sync from The Dog API...');
      
      const apiBreeds = await this.getAllBreeds();
      console.log(`Fetched ${apiBreeds.length} breeds from API`);
      
      for (const apiBreed of apiBreeds) {
        try {
          // Check if breed already exists
          const existingBreed = await storage.getBreedByName(apiBreed.name);
          
          if (existingBreed) {
            console.log(`Breed ${apiBreed.name} already exists, skipping...`);
            continue;
          }
          
          // Get image URL if available
          let imageUrl = '';
          if (apiBreed.reference_image_id) {
            imageUrl = await this.getBreedImage(apiBreed.reference_image_id);
          } else if (apiBreed.image?.url) {
            imageUrl = apiBreed.image.url;
          }
          
          // Parse weight and height
          const weight = this.parseWeightRange(apiBreed.weight?.metric);
          const height = this.parseHeightRange(apiBreed.height?.metric);
          
          // Generate trait scores
          const traits = this.generateTraitScores(apiBreed.temperament, apiBreed.breed_group);
          const booleanTraits = this.generateBooleanTraits(apiBreed.temperament, apiBreed.breed_group);
          
          const breedData: InsertBreed = {
            name: apiBreed.name,
            apiId: apiBreed.id.toString(),
            description: apiBreed.bred_for || null,
            temperament: apiBreed.temperament || null,
            origin: apiBreed.origin || null,
            lifeSpan: apiBreed.life_span || null,
            weightMin: weight?.min || null,
            weightMax: weight?.max || null,
            heightMin: height?.min || null,
            heightMax: height?.max || null,
            imageUrl: imageUrl || null,
            ...traits,
            ...booleanTraits,
            aiSummary: null,
            prosAndCons: null,
          };
          
          await storage.createBreed(breedData);
          console.log(`Created breed: ${apiBreed.name}`);
          
        } catch (error) {
          console.error(`Error processing breed ${apiBreed.name}:`, error);
        }
      }
      
      console.log('Breed sync completed successfully');
      
    } catch (error) {
      console.error('Error syncing breeds:', error);
      throw error;
    }
  }
}

export const dogApiService = new DogApiService();
