import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Menu, X, ShoppingCart, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navigation() {
  const [location] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { searchQuery, setSearchQuery, cartItems, toggleFilterSidebar } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { href: "/compare", label: "Compare Breeds" },
    { href: "/quiz", label: "AI Quiz" },
    { href: "/products", label: "Products" },
    { href: "/resources", label: "Resources" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results or trigger search
      toggleFilterSidebar();
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-lavender/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-mustard to-mint rounded-xl shadow-clay flex items-center justify-center">
              <svg className="w-6 h-6 text-midnight" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <span className="font-montserrat font-bold text-xl text-midnight">K9Kompare</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-midnight hover:text-mustard transition-colors font-medium ${
                  location === item.href ? 'text-mustard' : ''
                }`}
                data-testid={`nav-link-${item.label.toLowerCase().replace(' ', '-')}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Input
                type="text"
                placeholder="Search breeds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-softgray rounded-2xl border border-lavender/30 focus:outline-none focus:ring-2 focus:ring-mustard/50 focus:border-mustard transition-all"
                data-testid="search-input"
              />
              <Search className="w-5 h-5 text-midnight/60 absolute left-3 top-2.5" />
            </form>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link href="/cart" className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="p-2 rounded-xl bg-softgray shadow-clay hover:shadow-clay-hover"
                data-testid="cart-button"
              >
                <ShoppingCart className="w-5 h-5 text-midnight" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-mustard text-midnight text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {cartItems.length}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Authentication */}
            {isLoading ? (
              <div className="w-8 h-8 bg-softgray rounded-full animate-pulse" />
            ) : isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-1 rounded-full" data-testid="user-menu">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.profileImageUrl || undefined} />
                      <AvatarFallback className="bg-mustard text-midnight">
                        {user.firstName?.[0] || user.email?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center space-x-2" data-testid="profile-link">
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/saved" className="flex items-center space-x-2" data-testid="saved-link">
                      <span>Saved Items</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href="/api/logout" className="flex items-center space-x-2" data-testid="logout-link">
                      <span>Sign Out</span>
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                asChild
                className="bg-mustard text-midnight px-4 py-2 rounded-2xl font-medium shadow-clay hover:shadow-clay-hover transition-all duration-200"
                data-testid="sign-in-button"
              >
                <a href="/api/login">Sign In</a>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden p-2 rounded-xl bg-softgray shadow-clay"
                  data-testid="mobile-menu-button"
                >
                  <Menu className="w-6 h-6 text-midnight" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-6 mt-6">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="relative">
                    <Input
                      type="text"
                      placeholder="Search breeds..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-softgray rounded-2xl border border-lavender/30"
                      data-testid="mobile-search-input"
                    />
                    <Search className="w-5 h-5 text-midnight/60 absolute left-3 top-2.5" />
                  </form>

                  {/* Mobile Navigation */}
                  <div className="flex flex-col space-y-4">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`text-lg font-medium transition-colors ${
                          location === item.href 
                            ? 'text-mustard' 
                            : 'text-midnight hover:text-mustard'
                        }`}
                        data-testid={`mobile-nav-link-${item.label.toLowerCase().replace(' ', '-')}`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
