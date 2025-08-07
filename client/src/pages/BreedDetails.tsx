import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { ArrowLeft, Heart, Plus, Share, Star, MapPin, Clock, Scale, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useStore } from "@/store/useStore";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import BreedCard from "@/components/breed/BreedCard";
import ProductCard from "@/components/products/ProductCard";
import type { Breed, Product, Article } from "@shared/schema";

export default function BreedDetails() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { addBreedToComparison, showToast } = useStore();
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch breed details
  const { data: breed, isLoading, error } = useQuery({
    queryKey: ["/api/breeds", id],
    queryFn: async () => {
      const response = await fetch(`/api/breeds/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Breed not found");
        }
        throw new Error("Failed to fetch breed details");
      }
      return response.json();
    },
    enabled: !!id,
  });

  // Fetch related products
  const { data: relatedProducts } = useQuery({
    queryKey: ["/api/products", { breedTags: breed?.name }],
    queryFn: async () => {
      const response = await fetch(`/api/products?search=${encodeURIComponent(breed.name)}&limit=4`);
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
    enabled: !!breed?.name,
  });

  // Fetch related articles
  const { data: relatedArticles } = useQuery({
    queryKey: ["/api/articles", { breed: breed?.name }],
    queryFn: async () => {
      const response = await fetch(`/api/articles?search=${encodeURIComponent(breed.name)}&limit=3`);
      if (!response.ok) throw new Error("Failed to fetch articles");
      return response.json();
    },
    enabled: !!breed?.name,
  });

  // Fetch similar breeds
  const { data: similarBreeds } = useQuery({
    queryKey: ["/api/breeds", { similar: true }],
    queryFn: async () => {
      const response = await fetch("/api/breeds?limit=4");
      if (!response.ok) throw new Error("Failed to fetch similar breeds");
      return response.json();
    },
  });

  // Save breed mutation
  const saveBreedMutation = useMutation({
    mutationFn: async () => {
      if (isSaved) {
        return apiRequest("DELETE", `/api/saved-items?itemType=breed&itemId=${id}`);
      } else {
        return apiRequest("POST", "/api/saved-items", {
          itemType: "breed",
          itemId: id,
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
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      showToast("Failed to save breed. Please try again.", "error");
    },
  });

  const handleSaveToggle = () => {
    if (!isAuthenticated) {
      showToast("Please sign in to save breeds", "info");
      return;
    }
    saveBreedMutation.mutate();
  };

  const handleAddToComparison = () => {
    if (breed) {
      addBreedToComparison(breed);
      showToast(`${breed.name} added to comparison`, "success");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Breed link copied to clipboard!", "success");
    } catch (error) {
      showToast("Failed to copy link. Please try again.", "error");
    }
  };

  const getTraitColor = (value: number | null) => {
    if (!value) return "bg-softgray";
    if (value <= 2) return "bg-mint";
    if (value <= 4) return "bg-mustard";
    return "bg-lavender";
  };

  const getTraitLabel = (value: number | null) => {
    if (!value) return "Unknown";
    if (value <= 2) return "Low";
    if (value <= 4) return "Moderate";
    return "High";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-softgray rounded w-32"></div>
            <div className="h-12 bg-softgray rounded w-3/4"></div>
            <div className="h-64 bg-softgray rounded-2xl"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-48 bg-softgray rounded-2xl"></div>
              <div className="h-48 bg-softgray rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !breed) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="clay-morphic rounded-3xl p-12 shadow-clay text-center">
            <CardContent className="p-0">
              <div className="space-y-4">
                <h3 className="font-montserrat font-bold text-xl text-midnight">
                  {error?.message || "Breed Not Found"}
                </h3>
                <p className="text-midnight/60">
                  The breed you're looking for doesn't exist or couldn't be loaded.
                </p>
                <Link href="/">
                  <Button className="bg-mustard text-midnight">
                    Return Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const traits = [
    { name: "Energy Level", key: "energyLevel", icon: "⚡", description: "Daily exercise and activity needs" },
    { name: "Friendliness", key: "friendliness", icon: "😊", description: "How well they get along with people" },
    { name: "Trainability", key: "trainability", icon: "🎓", description: "How easy they are to train" },
    { name: "Grooming Needs", key: "groomingNeeds", icon: "✂️", description: "Maintenance and grooming requirements" },
    { name: "Exercise Needs", key: "exerciseNeeds", icon: "🏃", description: "Required physical activity level" },
    { name: "Shedding Level", key: "sheddingLevel", icon: "🧹", description: "How much they shed" },
    { name: "Barking Level", key: "barkingLevel", icon: "🔊", description: "How much they bark" },
  ];

  const prosAndCons = breed.prosAndCons as { pros: string[]; cons: string[] } | null;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="space-y-4">
          <Link href="/">
            <Button
              variant="outline"
              className="border-lavender/30 hover:bg-lavender/10"
              data-testid="back-button"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Breeds
            </Button>
          </Link>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <h1 className="font-montserrat font-bold text-4xl lg:text-5xl text-midnight" data-testid="breed-name">
                  {breed.name}
                </h1>
                {breed.origin && (
                  <div className="flex items-center space-x-2 text-midnight/70">
                    <MapPin className="w-4 h-4" />
                    <span>Originally from {breed.origin}</span>
                  </div>
                )}
                {breed.lifeSpan && (
                  <div className="flex items-center space-x-2 text-midnight/70">
                    <Clock className="w-4 h-4" />
                    <span>Life span: {breed.lifeSpan}</span>
                  </div>
                )}
              </div>

              <p className="text-lg text-midnight/70 leading-relaxed">
                {breed.description || "A wonderful dog breed with unique characteristics and loyal temperament."}
              </p>

              <div className="flex flex-wrap gap-2">
                {breed.temperament?.split(',').slice(0, 4).map((trait, index) => (
                  <Badge key={index} variant="secondary" className="bg-lavender/20 text-lavender">
                    {trait.trim()}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col space-y-3 lg:w-48">
              <Button
                onClick={handleSaveToggle}
                variant="outline"
                className={`border-red-200 hover:bg-red-50 ${isSaved ? 'bg-red-50' : ''}`}
                disabled={saveBreedMutation.isPending}
                data-testid="save-breed-button"
              >
                <Heart className={`w-4 h-4 mr-2 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                {isSaved ? 'Saved' : 'Save Breed'}
              </Button>
              
              <Button
                onClick={handleAddToComparison}
                className="bg-mustard text-midnight shadow-clay hover:shadow-clay-hover"
                data-testid="add-to-comparison-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to Compare
              </Button>
              
              <Button
                onClick={handleShare}
                variant="outline"
                className="border-lavender/30 hover:bg-lavender/10"
                data-testid="share-breed-button"
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full lg:w-auto bg-softgray rounded-2xl p-1">
            <TabsTrigger value="overview" className="rounded-xl">Overview</TabsTrigger>
            <TabsTrigger value="traits" className="rounded-xl">Traits</TabsTrigger>
            <TabsTrigger value="care" className="rounded-xl">Care Guide</TabsTrigger>
            <TabsTrigger value="products" className="rounded-xl">Products</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image */}
              <Card className="clay-morphic rounded-3xl p-6 shadow-clay">
                <CardContent className="p-0">
                  <img
                    src={breed.imageUrl || "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"}
                    alt={`${breed.name} breed profile`}
                    className="w-full h-64 lg:h-80 object-cover rounded-2xl"
                    data-testid="breed-image"
                  />
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="clay-morphic rounded-3xl p-6 shadow-clay">
                <CardContent className="p-0 space-y-6">
                  <h3 className="font-montserrat font-bold text-xl text-midnight">Quick Stats</h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-midnight/70">
                        <Scale className="w-4 h-4" />
                        <span className="text-sm font-medium">Weight</span>
                      </div>
                      <p className="font-semibold text-midnight">
                        {breed.weightMin && breed.weightMax 
                          ? `${breed.weightMin}-${breed.weightMax} lbs`
                          : 'Weight varies'
                        }
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-midnight/70">
                        <Ruler className="w-4 h-4" />
                        <span className="text-sm font-medium">Height</span>
                      </div>
                      <p className="font-semibold text-midnight">
                        {breed.heightMin && breed.heightMax 
                          ? `${breed.heightMin}-${breed.heightMax} in`
                          : 'Height varies'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-midnight">Characteristics</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <span>👶</span>
                        <span className={breed.goodWithChildren ? 'text-mint' : 'text-midnight/40'}>
                          Good with Kids
                        </span>
                        <span className={`text-xs ${breed.goodWithChildren ? 'text-mint' : 'text-midnight/40'}`}>
                          {breed.goodWithChildren ? '✓' : '✗'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>🐕</span>
                        <span className={breed.goodWithOtherDogs ? 'text-mint' : 'text-midnight/40'}>
                          Dog-Friendly
                        </span>
                        <span className={`text-xs ${breed.goodWithOtherDogs ? 'text-mint' : 'text-midnight/40'}`}>
                          {breed.goodWithOtherDogs ? '✓' : '✗'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>🐱</span>
                        <span className={breed.goodWithCats ? 'text-mint' : 'text-midnight/40'}>
                          Cat-Friendly
                        </span>
                        <span className={`text-xs ${breed.goodWithCats ? 'text-mint' : 'text-midnight/40'}`}>
                          {breed.goodWithCats ? '✓' : '✗'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>🏠</span>
                        <span className={breed.apartmentFriendly ? 'text-mint' : 'text-midnight/40'}>
                          Apartment OK
                        </span>
                        <span className={`text-xs ${breed.apartmentFriendly ? 'text-mint' : 'text-midnight/40'}`}>
                          {breed.apartmentFriendly ? '✓' : '✗'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Summary */}
            {breed.aiSummary && (
              <Card className="clay-morphic rounded-3xl p-6 shadow-clay">
                <CardContent className="p-0">
                  <h3 className="font-montserrat font-bold text-xl text-midnight mb-4">
                    Expert Overview
                  </h3>
                  <p className="text-midnight/80 leading-relaxed whitespace-pre-line">
                    {breed.aiSummary}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Pros and Cons */}
            {prosAndCons && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="clay-morphic rounded-3xl p-6 shadow-clay border-2 border-mint/20">
                  <CardContent className="p-0">
                    <h3 className="font-montserrat font-bold text-lg text-mint mb-4 flex items-center">
                      <span className="mr-2">✓</span>
                      Pros
                    </h3>
                    <ul className="space-y-2">
                      {prosAndCons.pros.map((pro, index) => (
                        <li key={index} className="flex items-start space-x-2 text-midnight/80">
                          <span className="text-mint mt-1">•</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="clay-morphic rounded-3xl p-6 shadow-clay border-2 border-mustard/20">
                  <CardContent className="p-0">
                    <h3 className="font-montserrat font-bold text-lg text-mustard mb-4 flex items-center">
                      <span className="mr-2">⚠</span>
                      Considerations
                    </h3>
                    <ul className="space-y-2">
                      {prosAndCons.cons.map((con, index) => (
                        <li key={index} className="flex items-start space-x-2 text-midnight/80">
                          <span className="text-mustard mt-1">•</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Traits Tab */}
          <TabsContent value="traits" className="space-y-6">
            <Card className="clay-morphic rounded-3xl p-6 shadow-clay">
              <CardContent className="p-0 space-y-6">
                <h3 className="font-montserrat font-bold text-xl text-midnight">Breed Traits</h3>
                
                <div className="space-y-6">
                  {traits.map((trait) => {
                    const value = breed[trait.key as keyof Breed] as number;
                    return (
                      <Tooltip key={trait.key}>
                        <TooltipTrigger asChild>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-midnight flex items-center gap-2">
                                <span>{trait.icon}</span>
                                {trait.name}
                              </span>
                              <span className="text-sm font-mono text-midnight">
                                {getTraitLabel(value)} ({value || 0}/5)
                              </span>
                            </div>
                            <div className="w-full h-3 bg-softgray rounded-full">
                              <div
                                className={`h-3 rounded-full trait-bar transition-all duration-500 ${getTraitColor(value)}`}
                                style={{ width: `${((value || 0) / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{trait.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Care Guide Tab */}
          <TabsContent value="care" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="clay-morphic rounded-3xl p-6 shadow-clay">
                <CardContent className="p-0 space-y-4">
                  <h3 className="font-montserrat font-bold text-lg text-midnight">Exercise Needs</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Daily Exercise</span>
                      <span className="font-semibold">
                        {breed.exerciseNeeds && breed.exerciseNeeds >= 4 ? '2+ hours' :
                         breed.exerciseNeeds && breed.exerciseNeeds >= 3 ? '1-2 hours' :
                         breed.exerciseNeeds && breed.exerciseNeeds >= 2 ? '30-60 min' : '15-30 min'}
                      </span>
                    </div>
                    <Progress value={((breed.exerciseNeeds || 0) / 5) * 100} className="h-2" />
                  </div>
                  <p className="text-sm text-midnight/70">
                    This breed requires {getTraitLabel(breed.exerciseNeeds).toLowerCase()} daily exercise and mental stimulation.
                  </p>
                </CardContent>
              </Card>

              <Card className="clay-morphic rounded-3xl p-6 shadow-clay">
                <CardContent className="p-0 space-y-4">
                  <h3 className="font-montserrat font-bold text-lg text-midnight">Grooming Requirements</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Grooming Frequency</span>
                      <span className="font-semibold">
                        {breed.groomingNeeds && breed.groomingNeeds >= 4 ? 'Daily' :
                         breed.groomingNeeds && breed.groomingNeeds >= 3 ? 'Weekly' :
                         breed.groomingNeeds && breed.groomingNeeds >= 2 ? 'Bi-weekly' : 'Monthly'}
                      </span>
                    </div>
                    <Progress value={((breed.groomingNeeds || 0) / 5) * 100} className="h-2" />
                  </div>
                  <p className="text-sm text-midnight/70">
                    This breed has {getTraitLabel(breed.groomingNeeds).toLowerCase()} grooming requirements.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Related Articles */}
            {relatedArticles && relatedArticles.length > 0 && (
              <Card className="clay-morphic rounded-3xl p-6 shadow-clay">
                <CardContent className="p-0 space-y-4">
                  <h3 className="font-montserrat font-bold text-lg text-midnight">Related Care Articles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {relatedArticles.slice(0, 3).map((article: Article) => (
                      <Link key={article.id} href={`/resources/${article.slug}`}>
                        <div className="p-4 rounded-2xl border border-lavender/30 hover:bg-lavender/5 transition-colors cursor-pointer">
                          <h4 className="font-semibold text-sm text-midnight line-clamp-2 mb-2">
                            {article.title}
                          </h4>
                          <p className="text-xs text-midnight/60">
                            {article.readTime || 5} min read
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            {relatedProducts && relatedProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((product: Product) => (
                  <ProductCard key={product.id} product={product} compact />
                ))}
              </div>
            ) : (
              <Card className="clay-morphic rounded-3xl p-12 shadow-clay text-center">
                <CardContent className="p-0">
                  <div className="space-y-4">
                    <h3 className="font-montserrat font-bold text-xl text-midnight">No Products Found</h3>
                    <p className="text-midnight/60">
                      We don't have specific products for this breed yet, but check out our general dog products.
                    </p>
                    <Link href="/products">
                      <Button className="bg-mustard text-midnight">
                        Browse All Products
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Similar Breeds */}
        {similarBreeds && similarBreeds.length > 0 && (
          <section className="space-y-6">
            <h2 className="font-montserrat font-bold text-2xl text-midnight">Similar Breeds</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarBreeds
                .filter((similarBreed: Breed) => similarBreed.id !== breed.id)
                .slice(0, 4)
                .map((similarBreed: Breed) => (
                  <BreedCard key={similarBreed.id} breed={similarBreed} compact />
                ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
