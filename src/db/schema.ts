import { relations } from 'drizzle-orm'
import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

// 1. Users Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  avatarUrl: text('avatar_url'),
  dietaryPreferences: text('dietary_preferences').notNull().default('[]'), // JSON string: ["vegetarian", "halal", "quick"]
  allergies: text('allergies').notNull().default('[]'), // JSON string: ["kacang", "seafood"]
  defaultServings: integer('default_servings').notNull().default(2),
  preferredUnit: text('preferred_unit').notNull().default('metric'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 2. Master Ingredients (~60 common items)
export const ingredients = pgTable('ingredients', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  category: text('category').notNull(), // 'sayur' | 'buah' | 'protein' | 'karbohidrat' | 'dairy' | 'bumbu' | 'frozen' | 'lainnya'
  defaultShelfLifeDays: integer('default_shelf_life_days').notNull().default(7),
  defaultUnit: text('default_unit').notNull().default('gram'),
  icon: text('icon'),
  storageLocation: text('storage_location').notNull().default('fridge'), // 'fridge' | 'freezer' | 'pantry'
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// 3. User Ingredients (Items in User's Fridge/Pantry/Freezer)
export const userIngredients = pgTable('user_ingredients', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  ingredientId: integer('ingredient_id').references(() => ingredients.id, {
    onDelete: 'set null',
  }),
  customName: text('custom_name'),
  category: text('category').notNull(),
  quantity: doublePrecision('quantity').notNull().default(1),
  unit: text('unit').notNull(),
  storageLocation: text('storage_location').notNull().default('fridge'),
  purchasedDate: timestamp('purchased_date').defaultNow().notNull(),
  expiryDate: timestamp('expiry_date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// 4. Recipes Table (20+ Indonesian & International Recipes)
export const recipes = pgTable('recipes', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url').notNull(),
  prepTimeMinutes: integer('prep_time_minutes').notNull(),
  cookTimeMinutes: integer('cook_time_minutes').notNull(),
  totalTimeMinutes: integer('total_time_minutes').notNull(),
  difficulty: text('difficulty').notNull(), // 'Mudah' | 'Sedang' | 'Sulit'
  servings: integer('servings').notNull().default(2),
  category: text('category').notNull(), // 'Nasi & Mie' | 'Sup & Kuah' | 'Tumisan' | 'Lauk Protein' | 'Sarapan & Snack' | 'Pasta & Western'
  tags: text('tags').notNull().default('[]'), // JSON array: ["indonesian", "halal", "quick"]
  instructions: text('instructions').notNull(), // JSON array of steps: [{ step: 1, title: 'Persiapan', text: '...' }]
  isVegetarian: boolean('is_vegetarian').notNull().default(false),
  calories: integer('calories'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// 5. Recipe Ingredients Relation Table
export const recipeIngredients = pgTable('recipe_ingredients', {
  id: serial('id').primaryKey(),
  recipeId: integer('recipe_id')
    .references(() => recipes.id, { onDelete: 'cascade' })
    .notNull(),
  ingredientId: integer('ingredient_id').references(() => ingredients.id, {
    onDelete: 'cascade',
  }),
  name: text('name').notNull(),
  quantity: doublePrecision('quantity').notNull(),
  unit: text('unit').notNull(),
  isOptional: boolean('is_optional').notNull().default(false),
  notes: text('notes'),
})

// 6. Shopping List Items
export const shoppingListItems = pgTable('shopping_list_items', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  ingredientId: integer('ingredient_id').references(() => ingredients.id, {
    onDelete: 'set null',
  }),
  name: text('name').notNull(),
  quantity: doublePrecision('quantity').notNull().default(1),
  unit: text('unit').notNull(),
  category: text('category').notNull(),
  isBought: boolean('is_bought').notNull().default(false),
  recipeId: integer('recipe_id').references(() => recipes.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// 7. Favorites Table
export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  recipeId: integer('recipe_id')
    .references(() => recipes.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// 8. Cooking History Table
export const cookingHistory = pgTable('cooking_history', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  recipeId: integer('recipe_id')
    .references(() => recipes.id, { onDelete: 'cascade' })
    .notNull(),
  rating: text('rating'), // 'masak_lagi' | 'oke' | 'tidak_akan_ulang'
  notes: text('notes'),
  cookedAt: timestamp('cooked_at').defaultNow().notNull(),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  userIngredients: many(userIngredients),
  shoppingListItems: many(shoppingListItems),
  favorites: many(favorites),
  cookingHistory: many(cookingHistory),
}))

export const userIngredientsRelations = relations(userIngredients, ({ one }) => ({
  user: one(users, {
    fields: [userIngredients.userId],
    references: [users.id],
  }),
  ingredient: one(ingredients, {
    fields: [userIngredients.ingredientId],
    references: [ingredients.id],
  }),
}))

export const recipesRelations = relations(recipes, ({ many }) => ({
  recipeIngredients: many(recipeIngredients),
  favorites: many(favorites),
}))

export const recipeIngredientsRelations = relations(recipeIngredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeIngredients.recipeId],
    references: [recipes.id],
  }),
  ingredient: one(ingredients, {
    fields: [recipeIngredients.ingredientId],
    references: [ingredients.id],
  }),
}))

export const shoppingListItemsRelations = relations(shoppingListItems, ({ one }) => ({
  user: one(users, {
    fields: [shoppingListItems.userId],
    references: [users.id],
  }),
  ingredient: one(ingredients, {
    fields: [shoppingListItems.ingredientId],
    references: [ingredients.id],
  }),
  recipe: one(recipes, {
    fields: [shoppingListItems.recipeId],
    references: [recipes.id],
  }),
}))

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  recipe: one(recipes, {
    fields: [favorites.recipeId],
    references: [recipes.id],
  }),
}))
