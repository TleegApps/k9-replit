import { useState, useEffect } from "react";
import { ArrowLeft, Trophy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import QuizComponent from "@/components/quiz/QuizComponent";
import BreedCard from "@/components/breed/BreedCard";
import { useStore } from "@/store/useStore";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { QuizResultBreed } from "@/types";
import type { Breed } from "@shared/schema";

export default function Quiz() {
  const { isCompleted, results, resetQuiz } = useStore();
  const [showDetailedResults, setShowDetailedResults] = useState(false);

  // Fetch breed details for results
  const { data: allBreeds } = useQuery({
    queryKey: ["/api/breeds"],
    queryFn: async () => {
      const response = await fetch("/api/breeds");
      if (!response.ok) throw new Error("Failed to fetch breeds");
      return response.json();
    },
  });

  const enrichResults = (quizResults: any[]): QuizResultBreed[] => {
    if (!allBreeds || !quizResults) return [];
    
    return quizResults.map((result) => {
      const breed = allBreeds.find((b: Breed) => 
        b.name.toLowerCase() === result.breedName.toLowerCase()
      );
      
      return {
        ...result,
        breed,
      };
    });
  };

  const enrichedResults = results ? enrichResults(results.results || results) : [];

  const handleStartNewQuiz = () => {
    resetQuiz();
    setShowDetailedResults(false);
  };

  const handleQuizComplete = (quizResults: any) => {
    // Results are automatically handled by the store
    console.log("Quiz completed:", quizResults);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button
              variant="outline"
              className="mb-4 border-lavender/30 hover:bg-lavender/10"
              data-testid="back-to-home"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          {!isCompleted ? (
            <div className="text-center space-y-4">
              <h1 className="font-montserrat font-bold text-4xl lg:text-5xl text-midnight">
                AI-Powered Breed Finder Quiz
              </h1>
              <p className="text-xl text-midnight/70 max-w-2xl mx-auto">
                Answer a few questions about your lifestyle and preferences, and our AI will recommend the perfect dog breeds for you.
              </p>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Trophy className="w-8 h-8 text-mustard" />
                <h1 className="font-montserrat font-bold text-4xl lg:text-5xl text-midnight">
                  Your Perfect Matches!
                </h1>
              </div>
              <p className="text-xl text-midnight/70 max-w-2xl mx-auto">
                Based on your responses, here are the dog breeds that best match your lifestyle and preferences.
              </p>
            </div>
          )}
        </div>

        {/* Quiz Component */}
        {!isCompleted ? (
          <QuizComponent onComplete={handleQuizComplete} />
        ) : (
          /* Results Section */
          <div className="space-y-12">
            
            {/* Top Results */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-montserrat font-bold text-2xl text-midnight">Your Top Matches</h2>
                <div className="space-x-2">
                  <Button
                    onClick={() => setShowDetailedResults(!showDetailedResults)}
                    variant="outline"
                    className="border-lavender/50 text-lavender hover:bg-lavender/10"
                    data-testid="toggle-detailed-results"
                  >
                    {showDetailedResults ? 'Hide' : 'Show'} Details
                  </Button>
                  <Button
                    onClick={handleStartNewQuiz}
                    variant="outline"
                    className="border-mint/50 text-mint hover:bg-mint/10"
                    data-testid="retake-quiz-button"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retake Quiz
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {enrichedResults.slice(0, 3).map((result, index) => (
                  <Card
                    key={index}
                    className={`clay-morphic rounded-3xl p-6 shadow-clay ${
                      index === 0 ? 'border-2 border-mint' : ''
                    }`}
                  >
                    <CardContent className="p-0">
                      <div className="text-center mb-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                          index === 0 ? 'bg-mint' : index === 1 ? 'bg-mustard/30' : 'bg-lavender/30'
                        }`}>
                          <span className="text-2xl">
                            {index === 0 ? '🏆' : index === 1 ? '🥈' : '🥉'}
                          </span>
                        </div>
                        <Badge className={`font-mono text-sm font-semibold ${
                          index === 0 ? 'bg-mint text-midnight' : 
                          index === 1 ? 'bg-mustard text-midnight' : 
                          'bg-lavender text-midnight'
                        }`}>
                          {result.matchPercentage}% Match
                        </Badge>
                      </div>
                      
                      {result.breed ? (
                        <>
                          <img
                            src={result.breed.imageUrl || "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"}
                            alt={`${result.breedName} - AI quiz match`}
                            className="w-full h-32 object-cover rounded-2xl mb-4"
                          />
                          <h3 className="font-montserrat font-bold text-lg text-midnight text-center mb-2">
                            {result.breedName}
                          </h3>
                          <p className="text-sm text-midnight/70 text-center mb-4">
                            {result.reasoning}
                          </p>

                          {showDetailedResults && (
                            <div className="space-y-4 border-t border-lavender/20 pt-4">
                              <div>
                                <h4 className="font-semibold text-mint text-sm mb-2">✓ Perfect for you because:</h4>
                                <ul className="space-y-1 text-xs text-midnight/70">
                                  {result.pros.slice(0, 3).map((pro: string, i: number) => (
                                    <li key={i}>• {pro}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold text-mustard text-sm mb-2">⚠ Things to consider:</h4>
                                <ul className="space-y-1 text-xs text-midnight/70">
                                  {result.cons.slice(0, 2).map((con: string, i: number) => (
                                    <li key={i}>• {con}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          <div className="mt-4 space-y-2">
                            <Link href={`/breeds/${result.breed.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-lavender/30 hover:bg-lavender/10"
                                data-testid={`view-breed-${result.breed.id}`}
                              >
                                Learn More
                              </Button>
                            </Link>
                          </div>
                        </>
                      ) : (
                        <div className="text-center space-y-4">
                          <div className="w-full h-32 bg-softgray rounded-2xl mb-4"></div>
                          <h3 className="font-montserrat font-bold text-lg text-midnight">
                            {result.breedName}
                          </h3>
                          <p className="text-sm text-midnight/70">{result.reasoning}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* All Results */}
            {enrichedResults.length > 3 && (
              <div className="space-y-6">
                <h3 className="font-montserrat font-bold text-xl text-midnight">Other Great Matches</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {enrichedResults.slice(3).map((result, index) => (
                    result.breed && (
                      <BreedCard
                        key={result.breed.id}
                        breed={result.breed}
                        matchPercentage={result.matchPercentage}
                        compact={true}
                      />
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            <Card className="clay-morphic rounded-3xl p-8 shadow-clay bg-gradient-to-r from-mint/10 to-lavender/10">
              <CardContent className="p-0 text-center">
                <div className="space-y-6">
                  <h3 className="font-montserrat font-bold text-2xl text-midnight">What's Next?</h3>
                  <p className="text-midnight/70 max-w-2xl mx-auto">
                    Now that you know which breeds match your lifestyle, explore detailed breed information, compare your favorites, or browse breed-specific products.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                    <Button
                      onClick={() => {
                        // Add top matches to comparison
                        enrichedResults.slice(0, 3).forEach(result => {
                          if (result.breed) {
                            // This would need to be implemented in the store
                            console.log('Add to comparison:', result.breed);
                          }
                        });
                      }}
                      className="flex-1 bg-mustard text-midnight px-6 py-3 rounded-2xl font-semibold shadow-clay hover:shadow-clay-hover transition-all"
                      data-testid="compare-top-matches"
                    >
                      Compare Top Matches
                    </Button>
                    <Link href="/products" className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full border-lavender/30 hover:bg-lavender/10 px-6 py-3 rounded-2xl font-semibold"
                        data-testid="shop-products-quiz"
                      >
                        Shop Products
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
