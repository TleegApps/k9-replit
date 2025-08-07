import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/store/useStore";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

export default function Footer() {
  const { showToast } = useStore();
  const [email, setEmail] = useState("");

  const newsletterMutation = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest("POST", "/api/newsletter/subscribe", { email });
    },
    onSuccess: () => {
      showToast("Successfully subscribed to newsletter!", "success");
      setEmail("");
    },
    onError: (error) => {
      showToast("Failed to subscribe. Please try again.", "error");
    },
  });

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      newsletterMutation.mutate(email);
    }
  };

  const footerLinks = {
    compare: [
      { href: "/compare", label: "Breed Comparison Tool" },
      { href: "/compare/popular", label: "Popular Comparisons" },
      { href: "/breeds/sizes", label: "Size Categories" },
      { href: "/breeds/energy", label: "Energy Levels" },
      { href: "/saved-comparisons", label: "Save Comparisons" },
    ],
    discover: [
      { href: "/quiz", label: "AI Breed Quiz" },
      { href: "/breeds", label: "All Dog Breeds" },
      { href: "/breeds/profiles", label: "Breed Profiles" },
      { href: "/adoption", label: "Adoption Resources" },
      { href: "/resources", label: "Expert Articles" },
    ],
    support: [
      { href: "/help", label: "Help Center" },
      { href: "/contact", label: "Contact Us" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/api-docs", label: "API Documentation" },
    ],
  };

  const socialLinks = [
    {
      href: "https://twitter.com/k9kompare",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
        </svg>
      ),
      label: "Twitter",
    },
    {
      href: "https://facebook.com/k9kompare",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
        </svg>
      ),
      label: "Facebook",
    },
    {
      href: "https://pinterest.com/k9kompare",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.752-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.001 12.017.001z"/>
        </svg>
      ),
      label: "Pinterest",
    },
    {
      href: "https://github.com/k9kompare",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.2 0C5.5 0 .2 5.3.2 11.8c0 5.2 3.4 9.6 8.1 11.1.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4C17.3 4.7 18.3 5 18.3 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.7-1.5 8.1-5.9 8.1-11.1C24.2 5.3 18.9.1 12.2.1z"/>
        </svg>
      ),
      label: "GitHub",
    },
  ];

  return (
    <footer className="bg-midnight text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-mustard to-mint rounded-xl shadow-clay flex items-center justify-center">
                <svg className="w-6 h-6 text-midnight" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <span className="font-montserrat font-bold text-xl">K9Kompare</span>
            </Link>
            <p className="text-white/70 text-sm">
              The ultimate platform for comparing dog breeds, finding your perfect match, and accessing expert resources for dog care.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label={social.label}
                  data-testid={`social-link-${social.label.toLowerCase()}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Compare */}
          <div>
            <h3 className="font-montserrat font-semibold text-lg mb-4">Compare</h3>
            <ul className="space-y-2 text-sm text-white/70">
              {footerLinks.compare.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-mustard transition-colors"
                    data-testid={`footer-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Discover */}
          <div>
            <h3 className="font-montserrat font-semibold text-lg mb-4">Discover</h3>
            <ul className="space-y-2 text-sm text-white/70">
              {footerLinks.discover.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-mustard transition-colors"
                    data-testid={`footer-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-montserrat font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-white/70">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-mustard transition-colors"
                    data-testid={`footer-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 clay-morphic rounded-3xl p-8 shadow-clay text-center">
          <h3 className="font-montserrat font-bold text-2xl text-midnight mb-4">Stay Updated</h3>
          <p className="text-midnight/70 mb-6 max-w-md mx-auto">
            Get the latest expert tips, breed guides, and product recommendations delivered to your inbox.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-3 rounded-2xl border border-lavender/30 focus:outline-none focus:ring-2 focus:ring-mustard/50 focus:border-mustard transition-all"
              data-testid="newsletter-email-input"
            />
            <Button
              type="submit"
              disabled={newsletterMutation.isPending}
              className="bg-mustard text-midnight px-6 py-3 rounded-2xl font-semibold shadow-clay hover:shadow-clay-hover transition-all whitespace-nowrap disabled:opacity-50"
              data-testid="newsletter-subscribe-button"
            >
              {newsletterMutation.isPending ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/60 text-sm">
            © 2024 K9Kompare. All rights reserved. Built with ❤️ for dog lovers.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <span className="text-white/40 text-xs">Powered by</span>
            <div className="flex items-center space-x-4 text-xs text-white/60">
              <span>The Dog API</span>
              <span>•</span>
              <span>OpenAI</span>
              <span>•</span>
              <span>Supabase</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
