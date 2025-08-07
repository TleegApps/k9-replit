import { useState } from "react";
import { Heart, Star, Info, Plus, Check } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useStore } from "@/store/useStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { Breed } from "@shared/schema";

interface BreedCardProps {
  breed: Breed;
  matchPercentage?: number;
  showComparison?: boolean;
  compact?: boolean;
}

export default function BreedCard({ 
  breed, 
  matchPercentage, 
  showComparison = true, 
  compact = false 
}: BreedCardProps) {
  const { isAuthenticated } = useAuth();
  const { comparedBreeds, addBreedToComparison, removeBreedFromComparison, showToast } = useStore();
  const [isSaved, setIsSaved] = useState(false);
  const queryClient = useQueryClient();

  const isInComparison = comparedBreeds.some(b => b.id === breed.id);
  const canAddToComparison = comparedBreeds.length < 4;

  const saveBreedMutation = useMutation({
    mutationFn: async () => {
      if (isSaved) {
        return apiRequest("DELETE", "/api/saved-items", undefined, {
          params: { itemType: "breed", itemId: breed.id.toString() }
        });
      } else {
        return apiRequest("POST", "/api/saved-items", {
          itemType: "breed",
          itemId: breed.id.toString()
        });
      }
    },
    onSuccess: () => {
      setIsSaved(!isSaved);
      showToast(
        isSaved ? "Breed removed from saved items" : "Breed saved successfully", 
        "success"
      );
      queryClient.invalidateQueries({ queryKey: ["/api/saved-items"] });
    },
    onError: () => {
      showToast("Failed to save breed. Please try again.", "error");
    },
  });

  const handleComparisonToggle = () => {
    if (isInComparison) {
      removeBreedFromComparison(breed.id);
      showToast(`${breed.name} removed from comparison`, "info");
    } else if (canAddToComparison) {
      addBreedToComparison(breed);
      showToast(`${breed.name} added to comparison`, "success");
    } else {
      showToast("Maximum 4 breeds can be compared at once", "error");
    }
  };

  const handleSaveToggle = () => {
    if (!isAuthenticated) {
      showToast("Please sign in to save breeds", "info");
      return;
    }
    saveBreedMutation.mutate();
  };

  const getWeightRange = () => {
    if (breed.weightMin && breed.weightMax) {
      return `${breed.weightMin}-${breed.weightMax} lbs`;
    }
    return "Weight varies";
  };

  const getHeightRange = () => {
    if (breed.heightMin && breed.heightMax) {
      return `${breed.heightMin}-${breed.heightMax} in`;
    }
    return "Height varies";
  };

  const getTraitColor = (value: number | null) => {
    if (!value) return "bg-softgray";
    if (value <= 2) return "bg-mint";
    if (value <= 4) return "bg-mustard";
    return "bg-lavender";
  };

  return (
    <Card className={`clay-morphic rounded-3xl shadow-clay hover:shadow-clay-hover transition-all group ${
      compact ? 'p-4' : 'p-6'
    }`}>
      <CardContent className="p-0">
        <div className="relative">
          {/* Image */}
          <div className="relative mb-4">
            <img
              src={breed.imageUrl || "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"}
              alt={`${breed.name} breed profile`}
              className={`w-full object-cover rounded-2xl ${compact ? 'h-32' : 'h-48'}`}
              data-testid={`breed-image-${breed.id}`}
            />
            
            {/* Save Button */}
            <Button
              onClick={handleSaveToggle}
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white"
              disabled={saveBreedMutation.isPending}
              data-testid={`save-breed-${breed.id}`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-midnight/60'}`} />
            </Button>

            {/* Match Percentage */}
            {matchPercentage && (
              <div className="absolute bottom-2 left-2">
                <Badge className="bg-mint text-midnight font-mono text-sm font-semibold">
                  {matchPercentage}% Match
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-montserrat font-bold text-xl text-midnight" data-testid={`breed-name-${breed.id}`}>
                {breed.name}
              </h3>
              <p className="text-midnight/60 text-sm">
                {breed.description || "Wonderful companion breed"}
              </p>
              <div className="flex justify-center items-center space-x-4 mt-2 text-xs text-midnight/60">
                <span>{getWeightRange()}</span>
                <span>•</span>
                <span>{getHeightRange()}</span>
              </div>
            </div>

            {/* Traits */}
            {!compact && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-midnight">Energy Level</span>
                        <div className="flex items-center space-x-1">
                          <div className="w-16 h-1.5 bg-softgray rounded-full">
                            <div 
                              className={`h-1.5 rounded-full trait-bar ${getTraitColor(breed.energyLevel)}`}
                              style={{ width: `${((breed.energyLevel || 0) / 5) * 100}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs">{breed.energyLevel || 0}/5</span>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>How much daily exercise and activity this breed needs</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-midnight">Friendliness</span>
                        <div className="flex items-center space-x-1">
                          <div className="w-16 h-1.5 bg-softgray rounded-full">
                            <div 
                              className={`h-1.5 rounded-full trait-bar ${getTraitColor(breed.friendliness)}`}
                              style={{ width: `${((breed.friendliness || 0) / 5) * 100}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs">{breed.friendliness || 0}/5</span>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>How well this breed gets along with people and other animals</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-midnight">Trainability</span>
                        <div className="flex items-center space-x-1">
                          <div className="w-16 h-1.5 bg-softgray rounded-full">
                            <div 
                              className={`h-1.5 rounded-full trait-bar ${getTraitColor(breed.trainability)}`}
                              style={{ width: `${((breed.trainability || 0) / 5) * 100}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs">{breed.trainability || 0}/5</span>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>How easy this breed is to train and how quickly they learn</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-midnight">Grooming</span>
                        <div className="flex items-center space-x-1">
                          <div className="w-16 h-1.5 bg-softgray rounded-full">
                            <div 
                              className={`h-1.5 rounded-full trait-bar ${getTraitColor(breed.groomingNeeds)}`}
                              style={{ width: `${((breed.groomingNeeds || 0) / 5) * 100}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs">{breed.groomingNeeds || 0}/5</span>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>How much grooming and maintenance this breed requires</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Boolean traits as badges */}
                <div className="flex flex-wrap gap-1">
                  {breed.goodWithChildren && (
                    <Badge variant="secondary" className="text-xs bg-mint/20 text-mint">
                      Kid-Friendly
                    </Badge>
                  )}
                  {breed.apartmentFriendly && (
                    <Badge variant="secondary" className="text-xs bg-lavender/20 text-lavender">
                      Apartment OK
                    </Badge>
                  )}
                  {breed.goodWithOtherDogs && (
                    <Badge variant="secondary" className="text-xs bg-mustard/20 text-mustard">
                      Dog-Friendly
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <Link href={`/breeds/${breed.id}`}>
                <Button
                  variant="outline"
                  className="w-full rounded-2xl border-lavender/30 hover:bg-lavender/10 transition-all"
                  data-testid={`view-breed-details-${breed.id}`}
                >
                  <Info className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </Link>

              {showComparison && (
                <Button
                  onClick={handleComparisonToggle}
                  variant={isInComparison ? "default" : "outline"}
                  className={`w-full rounded-2xl transition-all ${
                    isInComparison 
                      ? 'bg-mustard text-midnight shadow-clay hover:shadow-clay-hover' 
                      : 'border-mustard/50 text-mustard hover:bg-mustard/10'
                  }`}
                  disabled={!isInComparison && !canAddToComparison}
                  data-testid={`compare-breed-${breed.id}`}
                >
                  {isInComparison ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      In Comparison
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Compare
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
