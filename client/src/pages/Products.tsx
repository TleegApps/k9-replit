import { useState } from "react";
import { Filter, ShoppingCart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/store/useStore";
import ProductGrid from "@/components/products/ProductGrid";

const featuredCategories = [
  {
    id: "food",
    name: "Food & Treats",
    description: "Premium nutrition for every breed and life stage",
    icon: "🥘",
    color: "bg-mint/20 text-mint",
  },
  {
    id: "toys",
    name: "Toys & Enrichment", 
    description: "Interactive toys for mental stimulation and fun",
    icon: "🎾",
    color: "bg-mustard/20 text-mustard",
  },
  {
    id: "grooming",
    name: "Grooming & Care",
    description: "Professional tools for coat and health maintenance",
    icon: "✂️",
    color: "bg-lavender/20 text-lavender",
  },
  {
    id: "health",
    name: "Health & Wellness",
    description: "Supplements and health products for optimal wellbeing",
    icon: "🏥",
    color: "bg-mint/20 text-mint",
  },
];

const popularProducts = [
  {
    title: "New Owner Starter Kits",
    description: "Everything you need for your new puppy",
    badge: "Most Popular",
  },
  {
    title: "Breed-Specific Foods",
    description: "Nutrition tailored to your dog's breed needs",
    badge: "Vet Recommended",
  },
  {
    title: "Interactive Puzzle Toys",
    description: "Mental stimulation for intelligent breeds",
    badge: "Expert Choice",
  },
];

export default function Products() {
  const { toggleFilterSidebar, cartItems } = useStore();
  const [selectedCategory, setSelectedCategory] = useState("all");

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <h1 className="font-montserrat font-bold text-4xl lg:text-5xl text-midnight">
              Breed-Specific Products
            </h1>
            <p className="text-xl text-midnight/70 max-w-3xl mx-auto">
              Discover products tailored to your dog's breed, size, and specific needs. Curated by veterinarians and dog experts for optimal health and happiness.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={toggleFilterSidebar}
              variant="outline"
              className="border-lavender/50 text-lavender hover:bg-lavender/10"
              data-testid="open-filters-button"
            >
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
            
            {cartItems.length > 0 && (
              <div className="flex items-center space-x-2 bg-mustard/10 px-4 py-2 rounded-2xl">
                <ShoppingCart className="w-4 h-4 text-mustard" />
                <span className="text-sm font-medium text-mustard">
                  {cartItems.length} items in cart
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Featured Categories */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="font-montserrat font-bold text-3xl text-midnight">
              Shop by Category
            </h2>
            <p className="text-lg text-midnight/70">
              Find exactly what you need for your furry friend
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCategories.map((category) => (
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
                  <p className="text-sm text-midnight/70 mb-4">
                    {category.description}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-lavender/30 hover:bg-lavender/10 w-full"
                  >
                    Browse {category.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Popular Collections */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="font-montserrat font-bold text-3xl text-midnight">
              Popular Collections
            </h2>
            <p className="text-lg text-midnight/70">
              Handpicked collections for every dog owner
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularProducts.map((collection, index) => (
              <Card
                key={index}
                className="clay-morphic rounded-3xl p-6 shadow-clay hover:shadow-clay-hover transition-all group cursor-pointer"
                data-testid={`collection-${index}`}
              >
                <CardContent className="p-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-to-br from-mustard to-mint rounded-xl flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-midnight" />
                      </div>
                      <span className="bg-mustard text-midnight px-3 py-1 rounded-full text-xs font-semibold">
                        {collection.badge}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-montserrat font-bold text-lg text-midnight mb-2">
                        {collection.title}
                      </h3>
                      <p className="text-sm text-midnight/70">
                        {collection.description}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-lavender/30 hover:bg-lavender/10"
                    >
                      Explore Collection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Product Grid */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="font-montserrat font-bold text-3xl text-midnight">
              All Products
            </h2>
            <p className="text-lg text-midnight/70">
              Browse our complete selection of dog products
            </p>
          </div>

          <ProductGrid categoryFilter={selectedCategory} />
        </section>

        {/* CTA Section */}
        <section>
          <Card className="clay-morphic rounded-3xl p-8 shadow-clay bg-gradient-to-r from-mint/10 to-lavender/10">
            <CardContent className="p-0 text-center">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-montserrat font-bold text-3xl text-midnight">
                    Need Help Choosing?
                  </h3>
                  <p className="text-lg text-midnight/70 max-w-2xl mx-auto">
                    Take our AI quiz to get personalized product recommendations based on your dog's breed, age, and specific needs.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                  <Button
                    className="flex-1 bg-mustard text-midnight px-6 py-3 rounded-2xl font-semibold shadow-clay hover:shadow-clay-hover transition-all"
                    data-testid="take-product-quiz"
                  >
                    Take Product Quiz
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-lavender/30 hover:bg-lavender/10 px-6 py-3 rounded-2xl font-semibold"
                    data-testid="contact-experts"
                  >
                    Ask an Expert
                  </Button>
                </div>

                <div className="text-sm text-midnight/60 space-y-1">
                  <p>✓ Free shipping on orders over $50</p>
                  <p>✓ 30-day money-back guarantee</p>
                  <p>✓ Expert customer support</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
