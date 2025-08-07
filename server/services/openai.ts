import OpenAI from "openai";
import { storage } from "../storage";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

interface QuizResponse {
  livingSituation: string;
  exerciseTime: string;
  experience: string;
  familySituation: string;
  groomingPreference: string;
  sizePref: string;
  energyPreference: string;
  trainabilityImportance: string;
}

interface BreedMatch {
  breedName: string;
  matchPercentage: number;
  reasoning: string;
  pros: string[];
  cons: string[];
}

class OpenAIService {
  async generateBreedRecommendations(responses: QuizResponse): Promise<BreedMatch[]> {
    try {
      // Get available breeds from database
      const breeds = await storage.getBreeds(100);
      const breedInfo = breeds.map(breed => ({
        name: breed.name,
        temperament: breed.temperament,
        energyLevel: breed.energyLevel,
        friendliness: breed.friendliness,
        groomingNeeds: breed.groomingNeeds,
        trainability: breed.trainability,
        exerciseNeeds: breed.exerciseNeeds,
        goodWithChildren: breed.goodWithChildren,
        apartmentFriendly: breed.apartmentFriendly,
        weightMin: breed.weightMin,
        weightMax: breed.weightMax
      }));

      const prompt = `
You are a dog breed expert helping someone find their perfect dog match. Based on their quiz responses and the available dog breeds, provide the top 5 breed recommendations with match percentages.

User Quiz Responses:
- Living Situation: ${responses.livingSituation}
- Daily Exercise Time Available: ${responses.exerciseTime}
- Dog Ownership Experience: ${responses.experience}
- Family Situation: ${responses.familySituation}
- Grooming Preference: ${responses.groomingPreference}
- Size Preference: ${responses.sizePref}
- Energy Level Preference: ${responses.energyPreference}
- Trainability Importance: ${responses.trainabilityImportance}

Available Dog Breeds:
${JSON.stringify(breedInfo, null, 2)}

Please analyze the user's responses against each breed's characteristics and provide the top 5 matches. Consider factors like:
- Living space compatibility
- Exercise requirements vs available time
- Experience level needed
- Family compatibility
- Grooming needs
- Size preferences
- Energy level match
- Training requirements

Respond with a JSON array of exactly 5 breed matches, ordered by match percentage (highest first). Each match should have:
- breedName: exact name from the breed list
- matchPercentage: number between 60-98
- reasoning: 2-3 sentence explanation of why this breed fits
- pros: array of 3-4 positive aspects for this user
- cons: array of 2-3 potential challenges or considerations

Ensure match percentages are realistic and reflect genuine compatibility.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert dog breed consultant with extensive knowledge of breed characteristics, temperaments, and care requirements. Provide accurate, helpful breed recommendations based on user preferences."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2000,
      });

      const result = JSON.parse(response.choices[0].message.content || '{"matches": []}');
      return result.matches || result;
      
    } catch (error) {
      console.error("Error generating breed recommendations:", error);
      throw new Error("Failed to generate breed recommendations");
    }
  }

  async generateBreedSummary(breedName: string, breedData: any): Promise<string> {
    try {
      const prompt = `
Create a comprehensive, engaging summary for the ${breedName} dog breed. Use the following data and your expert knowledge:

Breed Data:
- Temperament: ${breedData.temperament || 'Not specified'}
- Origin: ${breedData.origin || 'Unknown'}
- Life Span: ${breedData.lifeSpan || 'Unknown'}
- Weight: ${breedData.weightMin}-${breedData.weightMax} lbs
- Height: ${breedData.heightMin}-${breedData.heightMax} inches
- Energy Level: ${breedData.energyLevel}/5
- Friendliness: ${breedData.friendliness}/5
- Trainability: ${breedData.trainability}/5
- Exercise Needs: ${breedData.exerciseNeeds}/5

Write a 3-4 paragraph summary that covers:
1. Brief history and origin
2. Personality and temperament characteristics
3. Physical characteristics and care needs
4. Ideal owner and living situation

Make it informative, engaging, and helpful for potential dog owners. Focus on practical information that helps people understand if this breed is right for them.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a professional dog breed expert writing informative content for potential dog owners. Your writing should be accurate, engaging, and practical."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      return response.choices[0].message.content || '';
      
    } catch (error) {
      console.error("Error generating breed summary:", error);
      throw new Error("Failed to generate breed summary");
    }
  }

  async generateBreedProsAndCons(breedName: string, breedData: any): Promise<{pros: string[], cons: string[]}> {
    try {
      const prompt = `
Based on the ${breedName} breed characteristics, generate a balanced list of pros and cons for potential owners.

Breed Data:
- Temperament: ${breedData.temperament || 'Not specified'}
- Energy Level: ${breedData.energyLevel}/5
- Friendliness: ${breedData.friendliness}/5
- Grooming Needs: ${breedData.groomingNeeds}/5
- Trainability: ${breedData.trainability}/5
- Health Issues: ${breedData.healthIssues}/5
- Exercise Needs: ${breedData.exerciseNeeds}/5
- Good with Children: ${breedData.goodWithChildren}
- Good with Other Dogs: ${breedData.goodWithOtherDogs}
- Apartment Friendly: ${breedData.apartmentFriendly}

Provide 4-5 pros and 3-4 cons in JSON format. Be honest and specific about both positive traits and potential challenges.

Respond with JSON in this format:
{
  "pros": ["specific positive trait 1", "specific positive trait 2", ...],
  "cons": ["specific challenge 1", "specific challenge 2", ...]
}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a dog breed expert providing balanced, honest assessments of breed characteristics for potential owners."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 600,
      });

      const result = JSON.parse(response.choices[0].message.content || '{"pros": [], "cons": []}');
      return result;
      
    } catch (error) {
      console.error("Error generating breed pros and cons:", error);
      throw new Error("Failed to generate breed pros and cons");
    }
  }
}

export const openaiService = new OpenAIService();
