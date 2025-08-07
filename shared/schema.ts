import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dog breeds table
export const breeds = pgTable("breeds", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  apiId: varchar("api_id").unique(), // The Dog API breed ID
  description: text("description"),
  temperament: varchar("temperament", { length: 500 }),
  origin: varchar("origin", { length: 255 }),
  lifeSpan: varchar("life_span", { length: 50 }),
  weightMin: integer("weight_min"),
  weightMax: integer("weight_max"),
  heightMin: integer("height_min"),
  heightMax: integer("height_max"),
  imageUrl: varchar("image_url"),
  // Trait scores (1-5)
  energyLevel: integer("energy_level"),
  friendliness: integer("friendliness"),
  groomingNeeds: integer("grooming_needs"),
  trainability: integer("trainability"),
  healthIssues: integer("health_issues"),
  exerciseNeeds: integer("exercise_needs"),
  sheddingLevel: integer("shedding_level"),
  barkingLevel: integer("barking_level"),
  // Boolean traits
  goodWithChildren: boolean("good_with_children"),
  goodWithOtherDogs: boolean("good_with_other_dogs"),
  goodWithCats: boolean("good_with_cats"),
  apartmentFriendly: boolean("apartment_friendly"),
  // AI-generated content
  aiSummary: text("ai_summary"),
  prosAndCons: jsonb("pros_and_cons"), // {pros: string[], cons: string[]}
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User breed comparisons
export const comparisons = pgTable("comparisons", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 255 }).notNull(),
  breedIds: jsonb("breed_ids").notNull(), // array of breed IDs
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quiz responses and results
export const quizResponses = pgTable("quiz_responses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  sessionId: varchar("session_id"), // For anonymous users
  responses: jsonb("responses").notNull(), // quiz question responses
  results: jsonb("results"), // breed match results with scores
  createdAt: timestamp("created_at").defaultNow(),
});

// Product categories
export const productCategories = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: varchar("image_url"),
  categoryId: integer("category_id").references(() => productCategories.id),
  breedTags: jsonb("breed_tags"), // array of breed names this product is suitable for
  sizeTags: jsonb("size_tags"), // array of dog sizes (toy, small, medium, large)
  rating: decimal("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").default(0),
  inStock: boolean("in_stock").default(true),
  stripeProductId: varchar("stripe_product_id"),
  stripePriceId: varchar("stripe_price_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Educational articles
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  imageUrl: varchar("image_url"),
  authorName: varchar("author_name", { length: 255 }),
  authorCredentials: varchar("author_credentials", { length: 255 }),
  category: varchar("category", { length: 100 }),
  tags: jsonb("tags"), // array of tags
  readTime: integer("read_time"), // estimated read time in minutes
  isVetApproved: boolean("is_vet_approved").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User saved items (breeds, comparisons, articles)
export const savedItems = pgTable("saved_items", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  itemType: varchar("item_type", { length: 50 }).notNull(), // 'breed', 'comparison', 'article', 'product'
  itemId: varchar("item_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Newsletter subscriptions
export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertBreedSchema = createInsertSchema(breeds).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertComparisonSchema = createInsertSchema(comparisons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuizResponseSchema = createInsertSchema(quizResponses).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSavedItemSchema = createInsertSchema(savedItems).omit({
  id: true,
  createdAt: true,
});

export const insertNewsletterSubscriptionSchema = createInsertSchema(newsletterSubscriptions).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Breed = typeof breeds.$inferSelect;
export type InsertBreed = z.infer<typeof insertBreedSchema>;
export type Comparison = typeof comparisons.$inferSelect;
export type InsertComparison = z.infer<typeof insertComparisonSchema>;
export type QuizResponse = typeof quizResponses.$inferSelect;
export type InsertQuizResponse = z.infer<typeof insertQuizResponseSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type SavedItem = typeof savedItems.$inferSelect;
export type InsertSavedItem = z.infer<typeof insertSavedItemSchema>;
export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;
export type InsertNewsletterSubscription = z.infer<typeof insertNewsletterSubscriptionSchema>;
