import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { dogApiService } from "./services/dogApi";
import { openaiService } from "./services/openai";
import Stripe from "stripe";
import { insertBreedSchema, insertComparisonSchema, insertQuizResponseSchema, insertSavedItemSchema, insertNewsletterSubscriptionSchema } from "@shared/schema";

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
}) : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Breed routes
  app.get('/api/breeds', async (req, res) => {
    try {
      const { limit, offset, search } = req.query;
      
      if (search) {
        const breeds = await storage.searchBreeds(search as string);
        res.json(breeds);
      } else {
        const breeds = await storage.getBreeds(
          limit ? parseInt(limit as string) : undefined,
          offset ? parseInt(offset as string) : undefined
        );
        res.json(breeds);
      }
    } catch (error) {
      console.error("Error fetching breeds:", error);
      res.status(500).json({ message: "Failed to fetch breeds" });
    }
  });

  app.get('/api/breeds/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const breed = await storage.getBreedById(parseInt(id));
      
      if (!breed) {
        return res.status(404).json({ message: "Breed not found" });
      }
      
      res.json(breed);
    } catch (error) {
      console.error("Error fetching breed:", error);
      res.status(500).json({ message: "Failed to fetch breed" });
    }
  });

  app.post('/api/breeds/sync', async (req, res) => {
    try {
      // Sync breeds from The Dog API
      await dogApiService.syncBreeds();
      res.json({ message: "Breeds synced successfully" });
    } catch (error) {
      console.error("Error syncing breeds:", error);
      res.status(500).json({ message: "Failed to sync breeds" });
    }
  });

  // Comparison routes
  app.get('/api/comparisons', async (req, res) => {
    try {
      const { userId, isPublic } = req.query;
      const comparisons = await storage.getComparisons(
        userId as string,
        isPublic ? isPublic === 'true' : undefined
      );
      res.json(comparisons);
    } catch (error) {
      console.error("Error fetching comparisons:", error);
      res.status(500).json({ message: "Failed to fetch comparisons" });
    }
  });

  app.get('/api/comparisons/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const comparison = await storage.getComparisonById(parseInt(id));
      
      if (!comparison) {
        return res.status(404).json({ message: "Comparison not found" });
      }
      
      res.json(comparison);
    } catch (error) {
      console.error("Error fetching comparison:", error);
      res.status(500).json({ message: "Failed to fetch comparison" });
    }
  });

  app.post('/api/comparisons', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertComparisonSchema.parse({ ...req.body, userId });
      
      const comparison = await storage.createComparison(validatedData);
      res.status(201).json(comparison);
    } catch (error) {
      console.error("Error creating comparison:", error);
      res.status(400).json({ message: "Failed to create comparison" });
    }
  });

  app.put('/api/comparisons/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      // Check if user owns the comparison
      const existingComparison = await storage.getComparisonById(parseInt(id));
      if (!existingComparison || existingComparison.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const comparison = await storage.updateComparison(parseInt(id), req.body);
      res.json(comparison);
    } catch (error) {
      console.error("Error updating comparison:", error);
      res.status(400).json({ message: "Failed to update comparison" });
    }
  });

  app.delete('/api/comparisons/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      // Check if user owns the comparison
      const existingComparison = await storage.getComparisonById(parseInt(id));
      if (!existingComparison || existingComparison.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteComparison(parseInt(id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting comparison:", error);
      res.status(400).json({ message: "Failed to delete comparison" });
    }
  });

  // Quiz routes
  app.post('/api/quiz/submit', async (req, res) => {
    try {
      const { responses, userId, sessionId } = req.body;
      
      // Generate AI recommendations
      const results = await openaiService.generateBreedRecommendations(responses);
      
      const validatedData = insertQuizResponseSchema.parse({
        userId,
        sessionId,
        responses,
        results,
      });
      
      const quizResponse = await storage.createQuizResponse(validatedData);
      res.status(201).json(quizResponse);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      res.status(400).json({ message: "Failed to submit quiz" });
    }
  });

  app.get('/api/quiz/results', async (req, res) => {
    try {
      const { userId, sessionId } = req.query;
      const results = await storage.getQuizResponses(
        userId as string,
        sessionId as string
      );
      res.json(results);
    } catch (error) {
      console.error("Error fetching quiz results:", error);
      res.status(500).json({ message: "Failed to fetch quiz results" });
    }
  });

  // Product routes
  app.get('/api/products', async (req, res) => {
    try {
      const { categoryId, limit, offset, search } = req.query;
      
      if (search) {
        const products = await storage.searchProducts(search as string);
        res.json(products);
      } else {
        const products = await storage.getProducts(
          categoryId ? parseInt(categoryId as string) : undefined,
          limit ? parseInt(limit as string) : undefined,
          offset ? parseInt(offset as string) : undefined
        );
        res.json(products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getProductById(parseInt(id));
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Article routes
  app.get('/api/articles', async (req, res) => {
    try {
      const { category, limit, offset, search } = req.query;
      
      if (search) {
        const articles = await storage.searchArticles(search as string);
        res.json(articles);
      } else {
        const articles = await storage.getArticles(
          category as string,
          limit ? parseInt(limit as string) : undefined,
          offset ? parseInt(offset as string) : undefined
        );
        res.json(articles);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.get('/api/articles/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const article = await storage.getArticleBySlug(slug);
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      res.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  // Saved items routes
  app.get('/api/saved-items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { itemType } = req.query;
      
      const savedItems = await storage.getSavedItems(userId, itemType as string);
      res.json(savedItems);
    } catch (error) {
      console.error("Error fetching saved items:", error);
      res.status(500).json({ message: "Failed to fetch saved items" });
    }
  });

  app.post('/api/saved-items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertSavedItemSchema.parse({ ...req.body, userId });
      
      const savedItem = await storage.createSavedItem(validatedData);
      res.status(201).json(savedItem);
    } catch (error) {
      console.error("Error saving item:", error);
      res.status(400).json({ message: "Failed to save item" });
    }
  });

  app.delete('/api/saved-items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { itemType, itemId } = req.query;
      
      await storage.deleteSavedItem(userId, itemType as string, itemId as string);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing saved item:", error);
      res.status(400).json({ message: "Failed to remove saved item" });
    }
  });

  // Newsletter routes
  app.post('/api/newsletter/subscribe', async (req, res) => {
    try {
      const validatedData = insertNewsletterSubscriptionSchema.parse(req.body);
      const subscription = await storage.subscribeNewsletter(validatedData);
      res.status(201).json(subscription);
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      res.status(400).json({ message: "Failed to subscribe to newsletter" });
    }
  });

  app.post('/api/newsletter/unsubscribe', async (req, res) => {
    try {
      const { email } = req.body;
      await storage.unsubscribeNewsletter(email);
      res.status(204).send();
    } catch (error) {
      console.error("Error unsubscribing from newsletter:", error);
      res.status(400).json({ message: "Failed to unsubscribe from newsletter" });
    }
  });

  // Stripe payment routes
  if (stripe) {
    app.post("/api/create-payment-intent", async (req, res) => {
      try {
        const { amount } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: "usd",
        });
        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error: any) {
        res.status(500).json({ message: "Error creating payment intent: " + error.message });
      }
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}
