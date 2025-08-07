import {
  users,
  breeds,
  comparisons,
  quizResponses,
  products,
  articles,
  savedItems,
  newsletterSubscriptions,
  type User,
  type UpsertUser,
  type Breed,
  type InsertBreed,
  type Comparison,
  type InsertComparison,
  type QuizResponse,
  type InsertQuizResponse,
  type Product,
  type Article,
  type SavedItem,
  type InsertSavedItem,
  type NewsletterSubscription,
  type InsertNewsletterSubscription,
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, and, inArray, sql, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, customerId: string, subscriptionId?: string): Promise<User>;

  // Breed operations
  getBreeds(limit?: number, offset?: number): Promise<Breed[]>;
  getBreedById(id: number): Promise<Breed | undefined>;
  getBreedByName(name: string): Promise<Breed | undefined>;
  searchBreeds(query: string): Promise<Breed[]>;
  createBreed(breed: InsertBreed): Promise<Breed>;
  updateBreed(id: number, updates: Partial<InsertBreed>): Promise<Breed>;
  
  // Comparison operations
  getComparisons(userId?: string, isPublic?: boolean): Promise<Comparison[]>;
  getComparisonById(id: number): Promise<Comparison | undefined>;
  createComparison(comparison: InsertComparison): Promise<Comparison>;
  updateComparison(id: number, updates: Partial<InsertComparison>): Promise<Comparison>;
  deleteComparison(id: number): Promise<void>;
  
  // Quiz operations
  createQuizResponse(response: InsertQuizResponse): Promise<QuizResponse>;
  getQuizResponses(userId?: string, sessionId?: string): Promise<QuizResponse[]>;
  
  // Product operations
  getProducts(categoryId?: number, limit?: number, offset?: number): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  searchProducts(query: string): Promise<Product[]>;
  
  // Article operations
  getArticles(category?: string, limit?: number, offset?: number): Promise<Article[]>;
  getArticleById(id: number): Promise<Article | undefined>;
  getArticleBySlug(slug: string): Promise<Article | undefined>;
  searchArticles(query: string): Promise<Article[]>;
  
  // Saved items operations
  getSavedItems(userId: string, itemType?: string): Promise<SavedItem[]>;
  createSavedItem(savedItem: InsertSavedItem): Promise<SavedItem>;
  deleteSavedItem(userId: string, itemType: string, itemId: string): Promise<void>;
  
  // Newsletter operations
  subscribeNewsletter(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;
  unsubscribeNewsletter(email: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, customerId: string, subscriptionId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Breed operations
  async getBreeds(limit = 50, offset = 0): Promise<Breed[]> {
    return await db
      .select()
      .from(breeds)
      .limit(limit)
      .offset(offset);
  }

  async getBreedById(id: number): Promise<Breed | undefined> {
    const [breed] = await db.select().from(breeds).where(eq(breeds.id, id));
    return breed;
  }

  async getBreedByName(name: string): Promise<Breed | undefined> {
    const [breed] = await db.select().from(breeds).where(eq(breeds.name, name));
    return breed;
  }

  async searchBreeds(query: string): Promise<Breed[]> {
    return await db
      .select()
      .from(breeds)
      .where(ilike(breeds.name, `%${query}%`))
      .limit(20);
  }

  async createBreed(breed: InsertBreed): Promise<Breed> {
    const [newBreed] = await db.insert(breeds).values(breed).returning();
    return newBreed;
  }

  async updateBreed(id: number, updates: Partial<InsertBreed>): Promise<Breed> {
    const [updatedBreed] = await db
      .update(breeds)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(breeds.id, id))
      .returning();
    return updatedBreed;
  }

  // Comparison operations
  async getComparisons(userId?: string, isPublic?: boolean): Promise<Comparison[]> {
    let query = db.select().from(comparisons);
    
    const conditions = [];
    if (userId) conditions.push(eq(comparisons.userId, userId));
    if (typeof isPublic === 'boolean') conditions.push(eq(comparisons.isPublic, isPublic));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(comparisons.createdAt));
  }

  async getComparisonById(id: number): Promise<Comparison | undefined> {
    const [comparison] = await db.select().from(comparisons).where(eq(comparisons.id, id));
    return comparison;
  }

  async createComparison(comparison: InsertComparison): Promise<Comparison> {
    const [newComparison] = await db.insert(comparisons).values(comparison).returning();
    return newComparison;
  }

  async updateComparison(id: number, updates: Partial<InsertComparison>): Promise<Comparison> {
    const [updatedComparison] = await db
      .update(comparisons)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(comparisons.id, id))
      .returning();
    return updatedComparison;
  }

  async deleteComparison(id: number): Promise<void> {
    await db.delete(comparisons).where(eq(comparisons.id, id));
  }

  // Quiz operations
  async createQuizResponse(response: InsertQuizResponse): Promise<QuizResponse> {
    const [newResponse] = await db.insert(quizResponses).values(response).returning();
    return newResponse;
  }

  async getQuizResponses(userId?: string, sessionId?: string): Promise<QuizResponse[]> {
    let query = db.select().from(quizResponses);
    
    const conditions = [];
    if (userId) conditions.push(eq(quizResponses.userId, userId));
    if (sessionId) conditions.push(eq(quizResponses.sessionId, sessionId));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(quizResponses.createdAt));
  }

  // Product operations
  async getProducts(categoryId?: number, limit = 20, offset = 0): Promise<Product[]> {
    let query = db.select().from(products);
    
    if (categoryId) {
      query = query.where(eq(products.categoryId, categoryId));
    }
    
    return await query.limit(limit).offset(offset);
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async searchProducts(query: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(ilike(products.name, `%${query}%`))
      .limit(20);
  }

  // Article operations
  async getArticles(category?: string, limit = 10, offset = 0): Promise<Article[]> {
    let query = db.select().from(articles);
    
    if (category) {
      query = query.where(eq(articles.category, category));
    }
    
    return await query
      .where(sql`${articles.publishedAt} IS NOT NULL`)
      .orderBy(desc(articles.publishedAt))
      .limit(limit)
      .offset(offset);
  }

  async getArticleById(id: number): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article;
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.slug, slug));
    return article;
  }

  async searchArticles(query: string): Promise<Article[]> {
    return await db
      .select()
      .from(articles)
      .where(
        and(
          ilike(articles.title, `%${query}%`),
          sql`${articles.publishedAt} IS NOT NULL`
        )
      )
      .limit(20);
  }

  // Saved items operations
  async getSavedItems(userId: string, itemType?: string): Promise<SavedItem[]> {
    let query = db.select().from(savedItems).where(eq(savedItems.userId, userId));
    
    if (itemType) {
      query = query.where(and(eq(savedItems.userId, userId), eq(savedItems.itemType, itemType)));
    }
    
    return await query.orderBy(desc(savedItems.createdAt));
  }

  async createSavedItem(savedItem: InsertSavedItem): Promise<SavedItem> {
    const [newSavedItem] = await db.insert(savedItems).values(savedItem).returning();
    return newSavedItem;
  }

  async deleteSavedItem(userId: string, itemType: string, itemId: string): Promise<void> {
    await db
      .delete(savedItems)
      .where(
        and(
          eq(savedItems.userId, userId),
          eq(savedItems.itemType, itemType),
          eq(savedItems.itemId, itemId)
        )
      );
  }

  // Newsletter operations
  async subscribeNewsletter(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    const [newSubscription] = await db
      .insert(newsletterSubscriptions)
      .values(subscription)
      .onConflictDoUpdate({
        target: newsletterSubscriptions.email,
        set: { isActive: true },
      })
      .returning();
    return newSubscription;
  }

  async unsubscribeNewsletter(email: string): Promise<void> {
    await db
      .update(newsletterSubscriptions)
      .set({ isActive: false })
      .where(eq(newsletterSubscriptions.email, email));
  }
}

export const storage = new DatabaseStorage();
