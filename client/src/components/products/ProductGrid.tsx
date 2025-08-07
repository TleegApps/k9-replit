import { useState } from "react";
import { Filter, Grid, List, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "./ProductCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@shared/schema";
import type { ProductFilter } from "@/types";

const categories = [
  { value: "all", label: "All Products" },
  { value: "food", label: "Food & Treats" },
  { value: "toys", label: "Toys & Enrichment" },
  { value: "grooming", label: "Grooming" },
  { value: "health", label: "Health & Wellness" },
  { value: "accessories", label: "Accessories" },
];

const sortOptions = [
  { value: "name", label: "Name A-Z" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "popularity", label: "Most Popular" },
];

interface ProductGridProps {
  searchQuery?: string;
  categoryFilter?: string;
  showFilters?: boolean;
}

export default function ProductGrid({ 
  searchQuery = "", 
  categoryFilter = "all",
  showFilters = true 
}: ProductGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter);
  const [selectedSort, setSelectedSort] = useState("name");
  const [search, setSearch] = useState(searchQuery);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ProductFilter>({});

  const { data: products, isLoading, error } = useQuery({
    queryKey: ["/api/products", { 
      search, 
      categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
      ...filters,
      page: currentPage,
      limit: 20 
    }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory !== "all") params.append('categoryId', selectedCategory);
      params.append('limit', '20');
      params.append('offset', ((currentPage - 1) * 20).toString());
      
      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const sortProducts = (products: Product[]) => {
    if (!products) return [];
    
    return [...products].sort((a, b) => {
      switch (selectedSort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return parseFloat(a.price.toString()) - parseFloat(b.price.toString());
        case 'price-high':
          return parseFloat(b.price.toString()) - parseFloat(a.price.toString());
        case 'rating':
          return (parseFloat(b.rating?.toString() || '0')) - (parseFloat(a.rating?.toString() || '0'));
        case 'popularity':
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        default:
          return 0;
      }
    });
  };

  const sortedProducts = sortProducts(products || []);

  if (error) {
    return (
      <Card className="clay-morphic rounded-3xl p-8 shadow-clay text-center">
        <CardContent className="p-0">
          <div className="space-y-4">
            <h3 className="font-montserrat font-bold text-xl text-midnight">Failed to Load Products</h3>
            <p className="text-midnight/60">
              There was an error loading the products. Please try again later.
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
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      {showFilters && (
        <Card className="clay-morphic rounded-3xl p-6 shadow-clay">
          <CardContent className="p-0">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1 max-w-md">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-softgray rounded-2xl border border-lavender/30"
                    data-testid="product-search-input"
                  />
                  <Search className="w-5 h-5 text-midnight/60 absolute left-3 top-2.5" />
                </div>
              </form>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 bg-softgray rounded-2xl border border-lavender/30" data-testid="category-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={selectedSort} onValueChange={setSelectedSort}>
                <SelectTrigger className="w-48 bg-softgray rounded-2xl border border-lavender/30" data-testid="sort-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex bg-softgray rounded-2xl p-1">
                <Button
                  onClick={() => setViewMode('grid')}
                  size="sm"
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  className="p-2 rounded-xl"
                  data-testid="grid-view-button"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => setViewMode('list')}
                  size="sm"
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  className="p-2 rounded-xl"
                  data-testid="list-view-button"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Info */}
      <div className="flex justify-between items-center">
        <p className="text-midnight/70">
          {isLoading ? "Loading products..." : `${sortedProducts.length} products found`}
        </p>
        {selectedCategory !== "all" && (
          <Button
            onClick={() => {
              setSelectedCategory("all");
              setCurrentPage(1);
            }}
            variant="outline"
            size="sm"
            className="border-lavender/30"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Products Grid/List */}
      {isLoading ? (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {Array.from({ length: 8 }, (_, i) => (
            <Card key={i} className="clay-morphic rounded-3xl p-6 shadow-clay">
              <CardContent className="p-0 space-y-4">
                <Skeleton className="w-full h-48 rounded-2xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full rounded-2xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sortedProducts.length === 0 ? (
        <Card className="clay-morphic rounded-3xl p-12 shadow-clay text-center">
          <CardContent className="p-0">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-lavender/30 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-8 h-8 text-lavender" />
              </div>
              <h3 className="font-montserrat font-bold text-xl text-midnight">No Products Found</h3>
              <p className="text-midnight/60 max-w-md mx-auto">
                We couldn't find any products matching your criteria. Try adjusting your search or filters.
              </p>
              <Button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("all");
                  setFilters({});
                  setCurrentPage(1);
                }}
                className="bg-mustard text-midnight"
                data-testid="clear-all-filters"
              >
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1 lg:grid-cols-2'
        }`}>
          {sortedProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              compact={viewMode === 'list'} 
            />
          ))}
        </div>
      )}

      {/* Pagination would go here if needed */}
      {sortedProducts.length >= 20 && (
        <div className="flex justify-center">
          <Button
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="bg-mustard text-midnight px-8 py-3 rounded-2xl"
            data-testid="load-more-products"
          >
            Load More Products
          </Button>
        </div>
      )}
    </div>
  );
}
