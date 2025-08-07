import { useState } from "react";
import { Search, BookOpen, Filter, User, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import ResourceCard from "@/components/resources/ResourceCard";
import { useStore } from "@/store/useStore";
import { apiRequest } from "@/lib/queryClient";
import type { Article } from "@shared/schema";

const resourceCategories = [
  {
    id: "health",
    name: "Health & Wellness",
    description: "Vet-backed health guides and medical information",
    icon: "🏥",
    color: "bg-mint/20 text-mint",
    count: 24,
  },
  {
    id: "training",
    name: "Training & Behavior",
    description: "Expert training tips and behavioral guidance",
    icon: "🎾",
    color: "bg-mustard/20 text-mustard",
    count: 18,
  },
  {
    id: "nutrition",
    name: "Nutrition & Diet",
    description: "Feeding guidelines and nutritional advice",
    icon: "🥘",
    color: "bg-lavender/20 text-lavender", 
    count: 15,
  },
  {
    id: "grooming",
    name: "Grooming & Care",
    description: "Grooming techniques and care routines",
    icon: "✂️",
    color: "bg-mint/20 text-mint",
    count: 12,
  },
];

const featuredExperts = [
  {
    name: "Dr. Sarah Wilson",
    credentials: "DVM, Veterinary Medicine",
    specialty: "Health & Wellness",
    articles: 12,
    avatar: "SW",
  },
  {
    name: "Maria Johnson",
    credentials: "Professional Groomer",
    specialty: "Grooming & Care",
    articles: 8,
    avatar: "MJ",
  },
  {
    name: "Robert Chen",
    credentials: "Certified Dog Trainer",
    specialty: "Training & Behavior",
    articles: 15,
    avatar: "RC",
  },
  {
    name: "Dr. Anna Lopez",
    credentials: "Veterinary Nutritionist",
    specialty: "Nutrition & Diet",
    articles: 10,
    avatar: "AL",
  },
];

export default function Resources() {
  const { showToast } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [newsletterEmail, setNewsletterEmail] = useState("");

  // Fetch articles
  const { data: articles, isLoading, error } = useQuery({
    queryKey: ["/api/articles", { category: selectedCategory !== "all" ? selectedCategory : undefined, search: searchQuery }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory !== "all") params.append('category', selectedCategory);
      params.append('limit', '20');
      
      const response = await fetch(`/api/articles?${params}`);
      if (!response.ok) throw new Error('Failed to fetch articles');
      return response.json();
    },
  });

  // Newsletter subscription
  const newsletterMutation = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest("POST", "/api/newsletter/subscribe", { email });
    },
    onSuccess: () => {
      showToast("Successfully subscribed to newsletter!", "success");
      setNewsletterEmail("");
    },
    onError: () => {
      showToast("Failed to subscribe. Please try again.", "error");
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is automatically triggered by query key change
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      newsletterMutation.mutate(newsletterEmail);
    }
  };

  const sortedArticles = articles ? [...articles].sort((a: Article, b: Article) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.publishedAt || b.createdAt!).getTime() - new Date(a.publishedAt || a.createdAt!).getTime();
      case 'popular':
        return (b.readTime || 0) - (a.readTime || 0); // Using readTime as a popularity proxy
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  }) : [];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <h1 className="font-montserrat font-bold text-4xl lg:text-5xl text-midnight">
              Expert Resources & Guides
            </h1>
            <p className="text-xl text-midnight/70 max-w-3xl mx-auto">
              Veterinarian-backed articles, training guides, and health resources to help you provide the best care for your dog.
            </p>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search articles, topics, or breeds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-3xl border border-lavender/30 focus:outline-none focus:ring-2 focus:ring-mustard/50 focus:border-mustard transition-all shadow-clay"
                data-testid="resource-search-input"
              />
              <Search className="w-6 h-6 text-midnight/60 absolute left-4 top-4" />
            </div>
          </form>
        </div>

        {/* Categories */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="font-montserrat font-bold text-3xl text-midnight">
              Browse by Category
            </h2>
            <p className="text-lg text-midnight/70">
              Find expert guidance on every aspect of dog care
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resourceCategories.map((category) => (
              <Card
                key={category.id}
                className="clay-morphic rounded-3xl p-6 shadow-clay hover:shadow-clay-hover transition-all group cursor-pointer"
                onClick={() => setSelectedCategory(category.id)}
                data-testid={`category-${category.id}`}
              >
                <CardContent className="p-0 text-center">
                  <div className="w-16 h-16 bg-softgray rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white transition-colors">
                    <span className="text-3xl">{category.icon}</span>
                  </div>
                  <h3 className="font-montserrat font-semibold text-lg text-midnight mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-midnight/70 mb-3">
                    {category.description}
                  </p>
                  <Badge variant="secondary" className="bg-lavender/20 text-lavender text-xs">
                    {category.count} articles
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Featured Experts */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="font-montserrat font-bold text-3xl text-midnight">
              Meet Our Experts
            </h2>
            <p className="text-lg text-midnight/70">
              Learn from veterinarians, trainers, and certified professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredExperts.map((expert, index) => (
              <Card key={index} className="clay-morphic rounded-3xl p-6 shadow-clay">
                <CardContent className="p-0 text-center">
                  <div className="w-16 h-16 bg-mint rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-midnight font-semibold text-lg">{expert.avatar}</span>
                  </div>
                  <h3 className="font-montserrat font-semibold text-lg text-midnight mb-1">
                    {expert.name}
                  </h3>
                  <p className="text-sm text-midnight/70 mb-2">{expert.credentials}</p>
                  <Badge variant="secondary" className="bg-mustard/20 text-mustard text-xs mb-3">
                    {expert.specialty}
                  </Badge>
                  <p className="text-xs text-midnight/60">
                    {expert.articles} published articles
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Articles Section */}
        <section className="space-y-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="font-montserrat font-bold text-3xl text-midnight mb-2">
                Latest Articles
              </h2>
              <p className="text-lg text-midnight/70">
                {selectedCategory !== "all" 
                  ? `${resourceCategories.find(c => c.id === selectedCategory)?.name} articles`
                  : "All expert resources and guides"
                }
              </p>
            </div>

            <div className="flex gap-4 items-center">
              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 bg-white rounded-2xl border border-lavender/30" data-testid="category-filter">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {resourceCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort Filter */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-white rounded-2xl border border-lavender/30" data-testid="sort-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="alphabetical">A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Articles Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }, (_, i) => (
                <Card key={i} className="clay-morphic rounded-3xl p-6 shadow-clay animate-pulse">
                  <CardContent className="p-0 space-y-4">
                    <div className="w-full h-48 bg-softgray rounded-2xl"></div>
                    <div className="h-6 bg-softgray rounded"></div>
                    <div className="h-4 bg-softgray rounded w-3/4"></div>
                    <div className="h-10 bg-softgray rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="clay-morphic rounded-3xl p-12 shadow-clay text-center">
              <CardContent className="p-0">
                <div className="space-y-4">
                  <h3 className="font-montserrat font-bold text-xl text-midnight">
                    Failed to Load Articles
                  </h3>
                  <p className="text-midnight/60">
                    There was an error loading the articles. Please try again later.
                  </p>
                  <Button 
                    onClick={() => window.location.reload()} 
                    className="bg-mustard text-midnight"
                  >
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : sortedArticles.length === 0 ? (
            <Card className="clay-morphic rounded-3xl p-12 shadow-clay text-center">
              <CardContent className="p-0">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-lavender/30 rounded-full flex items-center justify-center mx-auto">
                    <BookOpen className="w-8 h-8 text-lavender" />
                  </div>
                  <h3 className="font-montserrat font-bold text-xl text-midnight">No Articles Found</h3>
                  <p className="text-midnight/60">
                    {searchQuery 
                      ? "No articles match your search criteria. Try different keywords."
                      : "No articles available in this category yet."
                    }
                  </p>
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                    className="bg-mustard text-midnight"
                    data-testid="clear-filters"
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedArticles.map((article: Article) => (
                <ResourceCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </section>

        {/* Newsletter Signup */}
        <section>
          <Card className="clay-morphic rounded-3xl p-8 shadow-clay bg-gradient-to-r from-mint/10 to-lavender/10">
            <CardContent className="p-0 text-center">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-mustard/20 rounded-full flex items-center justify-center mx-auto">
                    <Award className="w-8 h-8 text-mustard" />
                  </div>
                  <h3 className="font-montserrat font-bold text-3xl text-midnight">
                    Stay Updated with Expert Tips
                  </h3>
                  <p className="text-lg text-midnight/70 max-w-2xl mx-auto">
                    Get the latest expert tips, breed guides, and product recommendations delivered to your inbox weekly.
                  </p>
                </div>
                
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="Your email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    className="flex-1 px-4 py-3 rounded-2xl border border-lavender/30 focus:outline-none focus:ring-2 focus:ring-mustard/50 focus:border-mustard transition-all"
                    data-testid="newsletter-email"
                  />
                  <Button
                    type="submit"
                    disabled={newsletterMutation.isPending}
                    className="bg-mustard text-midnight px-6 py-3 rounded-2xl font-semibold shadow-clay hover:shadow-clay-hover transition-all whitespace-nowrap disabled:opacity-50"
                    data-testid="newsletter-subscribe"
                  >
                    {newsletterMutation.isPending ? "Subscribing..." : "Subscribe"}
                  </Button>
                </form>

                <div className="text-sm text-midnight/60 space-y-1">
                  <p>✓ Weekly expert articles and tips</p>
                  <p>✓ Breed-specific care guides</p>
                  <p>✓ Product recommendations and deals</p>
                  <p className="text-xs">Unsubscribe anytime. We respect your privacy.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
