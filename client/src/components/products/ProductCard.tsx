import { useState } from "react";
import { Heart, Star, ShoppingCart, Eye } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/store/useStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export default function ProductCard({ product, compact = false }: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const { addToCart, showToast } = useStore();
  const [isSaved, setIsSaved] = useState(false);
  const queryClient = useQueryClient();

  const saveProductMutation = useMutation({
    mutationFn: async () => {
      if (isSaved) {
        return apiRequest("DELETE", "/api/saved-items", undefined, {
          params: { itemType: "product", itemId: product.id.toString() }
        });
      } else {
        return apiRequest("POST", "/api/saved-items", {
          itemType: "product",
          itemId: product.id.toString()
        });
      }
    },
    onSuccess: () => {
      setIsSaved(!isSaved);
      showToast(
        isSaved ? "Product removed from saved items" : "Product saved successfully", 
        "success"
      );
      queryClient.invalidateQueries({ queryKey: ["/api/saved-items"] });
    },
    onError: () => {
      showToast("Failed to save product. Please try again.", "error");
    },
  });

  const handleAddToCart = () => {
    addToCart(product.id);
    showToast(`${product.name} added to cart`, "success");
  };

  const handleSaveToggle = () => {
    if (!isAuthenticated) {
      showToast("Please sign in to save products", "info");
      return;
    }
    saveProductMutation.mutate();
  };

  const renderRating = () => {
    const rating = product.rating ? parseFloat(product.rating.toString()) : 0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center space-x-1">
        {/* Full stars */}
        {Array.from({ length: fullStars }, (_, i) => (
          <Star key={`full-${i}`} className="w-3 h-3 fill-mustard text-mustard" />
        ))}
        {/* Half star */}
        {hasHalfStar && <Star className="w-3 h-3 fill-mustard/50 text-mustard" />}
        {/* Empty stars */}
        {Array.from({ length: emptyStars }, (_, i) => (
          <Star key={`empty-${i}`} className="w-3 h-3 text-midnight/20" />
        ))}
        <span className="text-xs text-midnight/60 ml-1">
          ({product.reviewCount || 0})
        </span>
      </div>
    );
  };

  const formatPrice = () => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(product.price.toString()));
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
              src={product.imageUrl || "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"}
              alt={product.name}
              className={`w-full object-cover rounded-2xl ${compact ? 'h-32' : 'h-48'}`}
              data-testid={`product-image-${product.id}`}
            />
            
            {/* Save Button */}
            <Button
              onClick={handleSaveToggle}
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white"
              disabled={saveProductMutation.isPending}
              data-testid={`save-product-${product.id}`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-midnight/60'}`} />
            </Button>

            {/* Stock Status */}
            {!product.inStock && (
              <div className="absolute inset-0 bg-midnight/50 rounded-2xl flex items-center justify-center">
                <Badge variant="destructive" className="text-white">
                  Out of Stock
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-montserrat font-semibold text-lg text-midnight line-clamp-2" data-testid={`product-name-${product.id}`}>
                  {product.name}
                </h3>
                {!compact && product.description && (
                  <p className="text-sm text-midnight/60 line-clamp-2 mt-1">
                    {product.description}
                  </p>
                )}
              </div>
              <div className="text-right ml-4">
                <div className="font-montserrat font-bold text-xl text-midnight">
                  {formatPrice()}
                </div>
                {renderRating()}
              </div>
            </div>

            {/* Tags */}
            {!compact && (product.breedTags || product.sizeTags) && (
              <div className="flex flex-wrap gap-1">
                {product.breedTags && Array.isArray(product.breedTags) && 
                  (product.breedTags as string[]).slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-mint/20 text-mint">
                      {tag}
                    </Badge>
                  ))
                }
                {product.sizeTags && Array.isArray(product.sizeTags) && 
                  (product.sizeTags as string[]).slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-lavender/20 text-lavender">
                      {tag}
                    </Badge>
                  ))
                }
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="w-full bg-mustard text-midnight py-3 rounded-2xl font-semibold shadow-clay hover:shadow-clay-hover transform group-hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid={`add-to-cart-${product.id}`}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              
              <Link href={`/products/${product.id}`}>
                <Button
                  variant="outline"
                  className="w-full rounded-2xl border-lavender/30 hover:bg-lavender/10 transition-all"
                  data-testid={`view-product-details-${product.id}`}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
