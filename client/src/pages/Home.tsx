import { useEffect } from "react";
import { Link } from "wouter";
import { Plus, TrendingUp, BookOpen, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useStore } from "@/store/useStore";
import { useQuery } from "@tanstack/react-query";
import BreedComparison from "@/components/breed/BreedComparison";
import BreedCard from "@/components/breed/BreedCard";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Breed, Comparison, SavedItem } from "@shared/schema";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { comparedBreeds, showToast } = useStore();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  // Fetch user's saved comparisons
  const { data: savedComparisons, error: comparisonsError } = useQuery({
    queryKey: ["/api/comparisons", { userId: user?.id }],
    enabled: !!user?.id,
    retry: false,
  });

  // Fetch user's saved breeds
  const { data: savedBreeds, error: savedBreedsError } = useQuery({
    queryKey: ["/api/saved-items", { itemType: "breed" }],
    enabled: !!user?.id,
    retry: false,
  });

  // Fetch popular breeds for recommendations
  const { data: popularBreeds } = useQuery({
    queryKey: ["/api/breeds", { limit: 8 }],
    queryFn: async () => {
      const response = await fetch("/api/breeds?limit=8");
      if (!response.ok) throw new Error("Failed to fetch breeds");
      return response.json();
    },
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (comparisonsError && isUnauthorizedError(comparisonsError as Error)) {
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
  }, [comparisonsError, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="clay-morphic rounded-3xl p-8 shadow-clay text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-mustard to-mint rounded-full animate-spin mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
          <h3 className="font-montserrat font-semibold text-xl text-midnight mb-2">Loading Your Dashboard...</h3>
          <p className="text-midnight/60">Please wait while we prepare your personalized experience</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Welcome Header */}
        <div className="text-center space-y-4">
          <h1 className="font-montserrat font-bold text-4xl lg:text-5xl text-midnight">
            Welcome back, {user?.firstName || 'Dog Lover'}!
          </h1>
          <p className="text-xl text-midnight/70 max-w-2xl mx-auto">
            Continue exploring dog breeds, manage your comparisons, or discover new resources to help you find your perfect companion.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/quiz">
            <Card className="clay-morphic rounded-3xl p-6 shadow-clay hover:shadow-clay-hover transition-all group cursor-pointer">
              <CardContent className="p-0 text-center">
                <div className="w-16 h-16 bg-mustard/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-mustard/30 transition-colors">
                  <span className="text-3xl">🧠</span>
                </div>
                <h3 className="font-montserrat font-semibold text-lg text-midnight mb-2">Take AI Quiz</h3>
                <p className="text-sm text-midnight/70">Get personalized breed recommendations</p>
              </CardContent>
            </Card>
          </Link>

          <Card 
            className="clay-morphic rounded-3xl p-6 shadow-clay hover:shadow-clay-hover transition-all group cursor-pointer"
            onClick={() => document.getElementById('breed-comparison')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <CardContent className="p-0 text-center">
              <div className="w-16 h-16 bg-mint/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-mint/30 transition-colors">
                <span className="text-3xl">⚖️</span>
              </div>
              <h3 className="font-montserrat font-semibold text-lg text-midnight mb-2">Compare Breeds</h3>
              <p className="text-sm text-midnight/70">Add breeds to side-by-side comparison</p>
            </CardContent>
          </Card>

          <Link href="/resources">
            <Card className="clay-morphic rounded-3xl p-6 shadow-clay hover:shadow-clay-hover transition-all group cursor-pointer">
              <CardContent className="p-0 text-center">
                <div className="w-16 h-16 bg-lavender/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-lavender/30 transition-colors">
                  <BookOpen className="w-8 h-8 text-lavender" />
                </div>
                <h3 className="font-montserrat font-semibold text-lg text-midnight mb-2">Expert Resources</h3>
                <p className="text-sm text-midnight/70">Read vet-approved articles and guides</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Breed Comparison Section */}
        <section id="breed-comparison">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-montserrat font-bold text-2xl text-midnight">Breed Comparison</h2>
            {comparedBreeds.length === 0 && (
              <Button
                onClick={() => document.getElementById('popular-breeds')?.scrollIntoView({ behavior: 'smooth' })}
                variant="outline"
                className="border-mustard/50 text-mustard hover:bg-mustard/10"
                data-testid="add-breeds-button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Breeds
              </Button>
            )}
          </div>
          <BreedComparison />
        </section>

        {/* Saved Comparisons */}
        {savedComparisons && savedComparisons.length > 0 && (
          <section>
            <h2 className="font-montserrat font-bold text-2xl text-midnight mb-6">Your Saved Comparisons</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedComparisons.slice(0, 3).map((comparison: Comparison) => (
                <Card key={comparison.id} className="clay-morphic rounded-3xl p-6 shadow-clay hover:shadow-clay-hover transition-all group">
                  <CardContent className="p-0">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-montserrat font-semibold text-lg text-midnight">{comparison.name}</h3>
                        <p className="text-sm text-midnight/60">
                          {Array.isArray(comparison.breedIds) ? comparison.breedIds.length : 0} breeds compared
                        </p>
                      </div>
                      <div className="text-xs text-midnight/50">
                        Created {new Date(comparison.createdAt!).toLocaleDateString()}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-lavender/30 hover:bg-lavender/10"
                        data-testid={`load-comparison-${comparison.id}`}
                      >
                        Load Comparison
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Popular Breeds Section */}
        <section id="popular-breeds">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-montserrat font-bold text-2xl text-midnight">Popular Dog Breeds</h2>
            <Link href="/compare">
              <Button
                variant="outline"
                className="border-lavender/50 text-lavender hover:bg-lavender/10"
                data-testid="view-all-breeds"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                View All
              </Button>
            </Link>
          </div>
          
          {popularBreeds && popularBreeds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularBreeds.slice(0, 4).map((breed: Breed) => (
                <BreedCard key={breed.id} breed={breed} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }, (_, i) => (
                <Card key={i} className="clay-morphic rounded-3xl p-6 shadow-clay animate-pulse">
                  <CardContent className="p-0">
                    <div className="w-full h-48 bg-softgray rounded-2xl mb-4"></div>
                    <div className="h-6 bg-softgray rounded mb-2"></div>
                    <div className="h-4 bg-softgray rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Saved Breeds */}
        {savedBreeds && savedBreeds.length > 0 && (
          <section>
            <h2 className="font-montserrat font-bold text-2xl text-midnight mb-6">Your Saved Breeds</h2>
            <div className="text-center py-8">
              <p className="text-midnight/60 mb-4">Saved breeds functionality coming soon!</p>
              <Button
                variant="outline"
                className="border-mint/50 text-mint hover:bg-mint/10"
                data-testid="view-saved-breeds"
              >
                View Saved Breeds
              </Button>
            </div>
          </section>
        )}

        {/* Featured Products CTA */}
        <section>
          <Card className="clay-morphic rounded-3xl p-8 shadow-clay bg-gradient-to-r from-mint/10 to-lavender/10">
            <CardContent className="p-0 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-mustard/20 rounded-full flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8 text-mustard" />
                </div>
                <h3 className="font-montserrat font-bold text-2xl text-midnight">Discover Breed-Specific Products</h3>
                <p className="text-midnight/70 max-w-2xl mx-auto">
                  Find the perfect products for your dog based on their breed characteristics, size, and needs.
                </p>
                <Link href="/products">
                  <Button
                    className="bg-mustard text-midnight px-8 py-3 rounded-2xl font-semibold shadow-clay hover:shadow-clay-hover transition-all"
                    data-testid="shop-products-cta"
                  >
                    Shop Products
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
