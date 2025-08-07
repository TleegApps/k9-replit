import { Clock, User, BookOpen, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Article } from "@shared/schema";

interface ResourceCardProps {
  article: Article;
  compact?: boolean;
}

export default function ResourceCard({ article, compact = false }: ResourceCardProps) {
  const getAuthorInitials = () => {
    if (!article.authorName) return 'A';
    return article.authorName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatPublishDate = () => {
    if (!article.publishedAt) return 'Recently published';
    return new Date(article.publishedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'health':
        return 'bg-mint/20 text-mint';
      case 'training':
        return 'bg-mustard/20 text-mustard';
      case 'nutrition':
        return 'bg-lavender/20 text-lavender';
      case 'grooming':
        return 'bg-mint/20 text-mint';
      default:
        return 'bg-softgray text-midnight/70';
    }
  };

  return (
    <Card className={`clay-morphic rounded-3xl shadow-clay hover:shadow-clay-hover transition-all group ${
      compact ? 'p-4' : 'p-6'
    }`}>
      <CardContent className="p-0">
        <div className="space-y-4">
          {/* Image */}
          {!compact && (
            <div className="relative">
              <img
                src={article.imageUrl || "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"}
                alt={article.title}
                className="w-full h-48 object-cover rounded-2xl"
                data-testid={`article-image-${article.id}`}
              />
              {article.isVetApproved && (
                <Badge className="absolute top-3 left-3 bg-mint text-midnight">
                  Vet Approved
                </Badge>
              )}
            </div>
          )}

          {/* Content */}
          <div className="space-y-3">
            {/* Category and Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              {article.category && (
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getCategoryColor(article.category)}`}
                >
                  {article.category}
                </Badge>
              )}
              {article.isVetApproved && (
                <Badge variant="secondary" className="text-xs bg-mint/20 text-mint">
                  Vet Approved
                </Badge>
              )}
              {compact && (
                <Badge variant="secondary" className="text-xs bg-softgray text-midnight/70">
                  {article.readTime || 5} min read
                </Badge>
              )}
            </div>

            {/* Title and Excerpt */}
            <div>
              <h3 
                className={`font-montserrat font-bold text-midnight group-hover:text-mustard transition-colors ${
                  compact ? 'text-lg line-clamp-2' : 'text-xl line-clamp-2'
                }`}
                data-testid={`article-title-${article.id}`}
              >
                {article.title}
              </h3>
              {article.excerpt && (
                <p className={`text-midnight/70 mt-2 ${compact ? 'text-sm line-clamp-2' : 'line-clamp-3'}`}>
                  {article.excerpt}
                </p>
              )}
            </div>

            {/* Author and Meta */}
            <div className="flex items-center justify-between pt-3 border-t border-lavender/20">
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-mint text-midnight text-xs font-semibold">
                    {getAuthorInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-xs">
                  <div className="font-medium text-midnight">
                    {article.authorName || 'Expert Author'}
                  </div>
                  {article.authorCredentials && (
                    <div className="text-midnight/60">{article.authorCredentials}</div>
                  )}
                </div>
              </div>
              
              {!compact && (
                <div className="flex items-center space-x-3 text-xs text-midnight/60">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{article.readTime || 5} min read</span>
                  </div>
                  <span>{formatPublishDate()}</span>
                </div>
              )}
            </div>

            {/* Action Button */}
            <Link href={`/resources/${article.slug}`}>
              <Button
                className="w-full bg-mustard text-midnight py-3 rounded-2xl font-semibold shadow-clay hover:shadow-clay-hover transform group-hover:scale-105 transition-all duration-300"
                data-testid={`read-article-${article.id}`}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Read Full Article
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
