import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Star, Users, Heart, Play, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BreedCard from "@/components/breed/BreedCard";
import { useQuery } from "@tanstack/react-query";
import type { Breed } from "@shared/schema";

export default function Landing() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch featured breeds for hero section
  const { data: featuredBreeds } = useQuery({
    queryKey: ["/api/breeds", { limit: 4 }],
    queryFn: async () => {
      const response = await fetch("/api/breeds?limit=4");
      if (!response.ok) throw new Error("Failed to fetch breeds");
      return response.json();
    },
  });

  // Auto-rotate hero images
  useEffect(() => {
    if (!featuredBreeds?.length) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % featuredBreeds.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [featuredBreeds]);

  const stats = [
    { label: "Dog Breeds", value: "200+", icon: "🐕" },
    { label: "Comparisons", value: "50K+", icon: "📊" },
    { label: "Happy Users", value: "25K+", icon: "❤️" },
  ];

  const features = [
    {
      title: "AI-Powered Matching",
      description: "Our advanced AI analyzes your lifestyle and preferences to recommend the perfect dog breeds for you.",
      icon: "🧠",
    },
    {
      title: "Side-by-Side Comparison",
      description: "Compare up to 4 breeds simultaneously with detailed trait analysis and expert insights.",
      icon: "⚖️",
    },
    {
      title: "Expert Resources",
      description: "Access veterinarian-approved articles, training guides, and health information.",
      icon: "📚",
    },
    {
      title: "Product Recommendations",
      description: "Discover breed-specific products and accessories tailored to your dog's needs.",
      icon: "🛍️",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-12 lg:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-up">
              <div className="space-y-6">
                <h1 className="font-montserrat font-bold text-4xl lg:text-6xl text-midnight leading-tight">
                  Find Your Perfect
                  <span className="text-mustard"> Dog Breed</span>
                </h1>
                <p className="text-xl text-midnight/70 font-opensans">
                  Compare breeds side-by-side, take our AI-powered breed finder quiz, and discover everything you need to know about your future furry companion.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/quiz">
                  <Button 
                    className="w-full sm:w-auto bg-mustard text-midnight px-8 py-4 rounded-2xl font-montserrat font-semibold shadow-clay hover:shadow-clay-hover transform hover:scale-105 transition-all duration-300"
                    data-testid="take-quiz-button"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Take AI Breed Quiz
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto bg-white text-midnight px-8 py-4 rounded-2xl font-montserrat font-semibold shadow-clay hover:shadow-clay-hover border border-lavender/30 transition-all duration-300"
                  onClick={() => document.getElementById('featured-breeds')?.scrollIntoView({ behavior: 'smooth' })}
                  data-testid="explore-breeds-button"
                >
                  Explore Breeds
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center" data-testid={`stat-${index}`}>
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="font-montserrat font-bold text-2xl text-midnight">{stat.value}</div>
                    <div className="text-sm text-midnight/60">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Dog Breeds Showcase */}
            <div className="relative animate-fade-in">
              {featuredBreeds && featuredBreeds.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {featuredBreeds.slice(0, 4).map((breed: Breed, index: number) => (
                    <div
                      key={breed.id}
                      className={`clay-morphic rounded-3xl p-4 shadow-clay transition-all duration-500 ${
                        index === 1 ? 'mt-8' : index === 2 ? '-mt-4' : ''
                      }`}
                    >
                      <img
                        src={breed.imageUrl || `https://images.unsplash.com/photo-${
                          index === 0 ? '1552053831-71594a27632d' :
                          index === 1 ? '1589941013453-ec89f33b5e95' :
                          index === 2 ? '1583337130417-3346a1be7dee' :
                          '1518717758536-85ae29035b6d'
                        }?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300`}
                        alt={breed.name}
                        className="w-full h-48 object-cover rounded-2xl mb-3"
                      />
                      <h3 className="font-montserrat font-semibold text-midnight">{breed.name}</h3>
                      <p className="text-sm text-midnight/60">
                        {breed.temperament?.split(',')[0] || 'Wonderful companion'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-gentle">
          <ChevronDown className="w-6 h-6 text-midnight/60" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16" style={{background: 'linear-gradient(to right, rgba(165, 217, 184, 0.2), rgba(216, 191, 216, 0.2))'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-montserrat font-bold text-3xl lg:text-4xl text-midnight mb-4">
              Why Choose K9Kompare?
            </h2>
            <p className="text-lg text-midnight/70 max-w-2xl mx-auto">
              We combine expert knowledge, cutting-edge AI, and comprehensive data to help you make the best decision for your family.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="clay-morphic rounded-3xl p-6 shadow-clay hover:shadow-clay-hover transition-all group">
                <CardContent className="p-0 text-center">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="font-montserrat font-semibold text-lg text-midnight mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-midnight/70">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Breeds Section */}
      <section id="featured-breeds" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-montserrat font-bold text-3xl lg:text-4xl text-midnight mb-4">
              Popular Dog Breeds
            </h2>
            <p className="text-lg text-midnight/70 max-w-2xl mx-auto">
              Explore some of the most beloved dog breeds and discover what makes each one special.
            </p>
          </div>

          {featuredBreeds && featuredBreeds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {featuredBreeds.map((breed: Breed) => (
                <BreedCard key={breed.id} breed={breed} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

          <div className="text-center">
            <Link href="/compare">
              <Button
                className="bg-mustard text-midnight px-8 py-4 rounded-2xl font-semibold shadow-clay hover:shadow-clay-hover transition-all"
                data-testid="view-all-breeds-button"
              >
                View All Breeds
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-midnight/5 to-lavender/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="clay-morphic rounded-3xl p-12 shadow-clay">
            <CardContent className="p-0 space-y-6">
              <div className="space-y-4">
                <h2 className="font-montserrat font-bold text-3xl text-midnight">
                  Ready to Find Your Perfect Match?
                </h2>
                <p className="text-lg text-midnight/70 max-w-2xl mx-auto">
                  Take our comprehensive AI-powered quiz and get personalized breed recommendations based on your lifestyle, experience, and preferences.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Link href="/quiz" className="flex-1">
                  <Button
                    className="w-full bg-mustard text-midnight px-8 py-4 rounded-2xl font-semibold shadow-clay hover:shadow-clay-hover transform hover:scale-105 transition-all duration-300"
                    data-testid="start-quiz-cta"
                  >
                    Start Quiz Now
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="flex-1 bg-white text-midnight px-8 py-4 rounded-2xl font-semibold shadow-clay hover:shadow-clay-hover border border-lavender/30 transition-all duration-300"
                  onClick={() => document.querySelector('nav')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Sign In First
                </Button>
              </div>

              <div className="flex items-center justify-center space-x-6 pt-6 text-sm text-midnight/60">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-mustard fill-mustard" />
                  <span>Expert-backed data</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-mint" />
                  <span>25K+ satisfied users</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span>100% free to use</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
