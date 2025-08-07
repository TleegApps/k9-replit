import { useState } from "react";
import { X, Crown, Save, Share, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useStore } from "@/store/useStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { Breed } from "@shared/schema";

interface TraitComparison {
  name: string;
  key: keyof Breed;
  description: string;
  icon: string;
}

const traits: TraitComparison[] = [
  { name: "Energy Level", key: "energyLevel", description: "Daily exercise and activity needs", icon: "⚡" },
  { name: "Friendliness", key: "friendliness", description: "How well they get along with people", icon: "😊" },
  { name: "Trainability", key: "trainability", description: "How easy they are to train", icon: "🎓" },
  { name: "Grooming Needs", key: "groomingNeeds", description: "Maintenance and grooming requirements", icon: "✂️" },
  { name: "Exercise Needs", key: "exerciseNeeds", description: "Required physical activity level", icon: "🏃" },
  { name: "Shedding Level", key: "sheddingLevel", description: "How much they shed", icon: "🧹" },
  { name: "Barking Level", key: "barkingLevel", description: "How much they bark", icon: "🔊" },
];

const booleanTraits = [
  { name: "Good with Children", key: "goodWithChildren" as keyof Breed, icon: "👶" },
  { name: "Good with Other Dogs", key: "goodWithOtherDogs" as keyof Breed, icon: "🐕" },
  { name: "Good with Cats", key: "goodWithCats" as keyof Breed, icon: "🐱" },
  { name: "Apartment Friendly", key: "apartmentFriendly" as keyof Breed, icon: "🏠" },
];

export default function BreedComparison() {
  const { isAuthenticated } = useAuth();
  const { comparedBreeds, removeBreedFromComparison, showToast } = useStore();
  const [comparisonName, setComparisonName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const queryClient = useQueryClient();

  const saveComparisonMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest("POST", "/api/comparisons", {
        name,
        breedIds: comparedBreeds.map(b => b.id),
        isPublic: false,
      });
    },
    onSuccess: () => {
      showToast("Comparison saved successfully!", "success");
      setComparisonName("");
      setShowSaveDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/comparisons"] });
    },
    onError: () => {
      showToast("Failed to save comparison. Please try again.", "error");
    },
  });

  const handleSaveComparison = () => {
    if (!isAuthenticated) {
      showToast("Please sign in to save comparisons", "info");
      return;
    }
    if (comparedBreeds.length < 2) {
      showToast("Add at least 2 breeds to save a comparison", "error");
      return;
    }
    setShowSaveDialog(true);
  };

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/compare?breeds=${comparedBreeds.map(b => b.id).join(',')}`;
      await navigator.clipboard.writeText(url);
      showToast("Comparison link copied to clipboard!", "success");
    } catch (error) {
      showToast("Failed to copy link. Please try again.", "error");
    }
  };

  const getBestInTrait = (traitKey: keyof Breed) => {
    if (comparedBreeds.length === 0) return null;
    
    return comparedBreeds.reduce((best, current) => {
      const currentValue = current[traitKey] as number;
      const bestValue = best[traitKey] as number;
      
      if (!currentValue) return best;
      if (!bestValue) return current;
      
      return currentValue > bestValue ? current : best;
    });
  };

  const getTraitColor = (value: number | null) => {
    if (!value) return "bg-softgray";
    if (value <= 2) return "bg-mint";
    if (value <= 4) return "bg-mustard";
    return "bg-lavender";
  };

  if (comparedBreeds.length === 0) {
    return (
      <Card className="clay-morphic rounded-3xl p-8 shadow-clay text-center">
        <CardContent className="p-0">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-lavender/30 rounded-full flex items-center justify-center mx-auto">
              <Plus className="w-8 h-8 text-lavender" />
            </div>
            <h3 className="font-montserrat font-bold text-xl text-midnight">Start Comparing Breeds</h3>
            <p className="text-midnight/60 max-w-md mx-auto">
              Select up to 4 dog breeds to compare their traits, characteristics, and care requirements side-by-side.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-montserrat font-bold text-2xl text-midnight">
            Breed Comparison ({comparedBreeds.length}/4)
          </h2>
          <p className="text-midnight/60">
            Compare traits and characteristics to find your perfect match
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleSaveComparison}
            variant="outline"
            className="border-mint/50 text-mint hover:bg-mint/10"
            data-testid="save-comparison-button"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            className="border-lavender/50 text-lavender hover:bg-lavender/10"
            data-testid="share-comparison-button"
          >
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Breed Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-w-max overflow-x-auto">
        {comparedBreeds.map((breed) => (
          <Card key={breed.id} className="clay-morphic rounded-3xl p-6 shadow-clay min-w-80">
            <CardContent className="p-0">
              <div className="relative">
                {/* Remove Button */}
                <Button
                  onClick={() => removeBreedFromComparison(breed.id)}
                  size="sm"
                  variant="ghost"
                  className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-sm hover:bg-red-50 z-10"
                  data-testid={`remove-breed-${breed.id}`}
                >
                  <X className="w-4 h-4 text-red-500" />
                </Button>

                {/* Breed Image and Info */}
                <div className="text-center mb-6">
                  <img
                    src={breed.imageUrl || "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"}
                    alt={`${breed.name} breed profile`}
                    className="w-full h-48 object-cover rounded-2xl mb-4"
                    data-testid={`comparison-breed-image-${breed.id}`}
                  />
                  <h3 className="font-montserrat font-bold text-xl text-midnight">
                    {breed.name}
                  </h3>
                  <p className="text-midnight/60 text-sm">
                    {breed.description || "Wonderful companion breed"}
                  </p>
                </div>

                {/* Trait Scores */}
                <div className="space-y-4">
                  {traits.map((trait) => {
                    const value = breed[trait.key] as number;
                    const bestBreed = getBestInTrait(trait.key);
                    const isBest = bestBreed?.id === breed.id;

                    return (
                      <Tooltip key={trait.key}>
                        <TooltipTrigger asChild>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-midnight flex items-center gap-1">
                              <span>{trait.icon}</span>
                              {trait.name}
                            </span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 h-2 bg-softgray rounded-full">
                                <div
                                  className={`h-2 rounded-full trait-bar transition-all duration-500 ${getTraitColor(value)}`}
                                  style={{ width: `${((value || 0) / 5) * 100}%` }}
                                />
                              </div>
                              <span className="text-xs font-mono text-midnight w-8">
                                {value || 0}/5
                              </span>
                              {isBest && value && (
                                <Crown className="w-4 h-4 text-mustard" />
                              )}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{trait.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}

                  {/* Boolean Traits */}
                  <div className="pt-4 border-t border-lavender/20">
                    <h4 className="text-sm font-semibold text-midnight mb-3">Characteristics</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {booleanTraits.map((trait) => {
                        const value = breed[trait.key] as boolean;
                        return (
                          <div key={trait.key} className="flex items-center space-x-2">
                            <span className="text-sm">{trait.icon}</span>
                            <span className="text-xs text-midnight/70">{trait.name}</span>
                            <span className={`text-xs ${value ? 'text-mint' : 'text-midnight/40'}`}>
                              {value ? '✓' : '✗'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Size Info */}
                  <div className="pt-4 border-t border-lavender/20">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-medium text-midnight">Weight</span>
                        <p className="text-midnight/60">
                          {breed.weightMin && breed.weightMax 
                            ? `${breed.weightMin}-${breed.weightMax} lbs` 
                            : 'Varies'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-midnight">Height</span>
                        <p className="text-midnight/60">
                          {breed.heightMin && breed.heightMax 
                            ? `${breed.heightMin}-${breed.heightMax} in` 
                            : 'Varies'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Breed Slot */}
        {comparedBreeds.length < 4 && (
          <Card className="clay-morphic rounded-3xl p-6 shadow-clay min-w-80 border-2 border-dashed border-lavender/50 flex items-center justify-center">
            <CardContent className="p-0">
              <div className="text-center">
                <div className="w-16 h-16 bg-lavender/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-lavender" />
                </div>
                <h3 className="font-montserrat font-semibold text-lg text-midnight mb-2">
                  Add Breed
                </h3>
                <p className="text-sm text-midnight/60 mb-4">
                  Compare up to 4 breeds
                </p>
                <Button
                  variant="outline"
                  className="border-lavender/50 text-lavender hover:bg-lavender/10"
                  data-testid="add-breed-to-comparison"
                >
                  Choose Breed
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="space-y-4">
            <div>
              <h3 className="font-montserrat font-bold text-lg text-midnight">
                Save Comparison
              </h3>
              <p className="text-midnight/60 text-sm">
                Give your comparison a name to save it for later
              </p>
            </div>
            
            <div>
              <input
                type="text"
                placeholder="e.g., Family-friendly large breeds"
                value={comparisonName}
                onChange={(e) => setComparisonName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-lavender/30 focus:outline-none focus:ring-2 focus:ring-mustard/50 focus:border-mustard transition-all"
                data-testid="comparison-name-input"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => setShowSaveDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => saveComparisonMutation.mutate(comparisonName)}
                disabled={!comparisonName.trim() || saveComparisonMutation.isPending}
                className="flex-1 bg-mustard text-midnight"
                data-testid="save-comparison-confirm"
              >
                {saveComparisonMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
