import { eq, sql } from 'drizzle-orm'
import { db } from './index'
import * as schema from './schema'
import { SEED_INGREDIENTS, SEED_RECIPES } from './seed-data'

const CREATE_TABLE_QUERIES = [
  sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      avatar_url TEXT,
      dietary_preferences TEXT NOT NULL DEFAULT '[]',
      allergies TEXT NOT NULL DEFAULT '[]',
      default_servings INTEGER NOT NULL DEFAULT 2,
      preferred_unit TEXT NOT NULL DEFAULT 'metric',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `,
  sql`
    CREATE TABLE IF NOT EXISTS ingredients (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      default_shelf_life_days INTEGER NOT NULL DEFAULT 7,
      default_unit TEXT NOT NULL DEFAULT 'gram',
      icon TEXT,
      storage_location TEXT NOT NULL DEFAULT 'fridge',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `,
  sql`
    CREATE TABLE IF NOT EXISTS user_ingredients (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE SET NULL,
      custom_name TEXT,
      category TEXT NOT NULL,
      quantity DOUBLE PRECISION NOT NULL DEFAULT 1,
      unit TEXT NOT NULL,
      storage_location TEXT NOT NULL DEFAULT 'fridge',
      purchased_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      expiry_date TIMESTAMP NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `,
  sql`
    CREATE TABLE IF NOT EXISTS recipes (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT NOT NULL,
      prep_time_minutes INTEGER NOT NULL,
      cook_time_minutes INTEGER NOT NULL,
      total_time_minutes INTEGER NOT NULL,
      difficulty TEXT NOT NULL,
      servings INTEGER NOT NULL DEFAULT 2,
      category TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]',
      instructions TEXT NOT NULL,
      is_vegetarian BOOLEAN NOT NULL DEFAULT FALSE,
      calories INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `,
  sql`
    CREATE TABLE IF NOT EXISTS recipe_ingredients (
      id SERIAL PRIMARY KEY,
      recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      quantity DOUBLE PRECISION NOT NULL,
      unit TEXT NOT NULL,
      is_optional BOOLEAN NOT NULL DEFAULT FALSE,
      notes TEXT
    );
  `,
  sql`
    CREATE TABLE IF NOT EXISTS shopping_list_items (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      quantity DOUBLE PRECISION NOT NULL DEFAULT 1,
      unit TEXT NOT NULL,
      category TEXT NOT NULL,
      is_bought BOOLEAN NOT NULL DEFAULT FALSE,
      recipe_id INTEGER REFERENCES recipes(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `,
  sql`
    CREATE TABLE IF NOT EXISTS favorites (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `,
  sql`
    CREATE TABLE IF NOT EXISTS cooking_history (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      rating TEXT,
      notes TEXT,
      cooked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `,
]

export async function initAndSeedDatabase() {
  try {
    // 1. Create tables one by one (ensure all tables exist even if new ones were added)
    for (const query of CREATE_TABLE_QUERIES) {
      await db.execute(query)
    }

    if (globalThis.__FRIDGE_DB_INITIALIZED__) {
      return
    }

    // 2. Check and Seed Demo User
    const [demoUserFound] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, 'demo@fridgefirst.com'))
    let demoUser = demoUserFound

    if (!demoUser) {
      const [newUser] = await db
        .insert(schema.users)
        .values({
          name: 'Chef Yuka',
          email: 'demo@fridgefirst.com',
          password: 'password123',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          dietaryPreferences: JSON.stringify(['halal', 'cepat']),
          allergies: JSON.stringify(['kacang']),
          defaultServings: 2,
          preferredUnit: 'metric',
        })
        .returning()
      demoUser = newUser
    }

    // 3. Check and Seed Master Ingredients
    const existingIngredients = await db.select().from(schema.ingredients)
    const ingredientMap = new Map<string, number>()

    for (const item of existingIngredients) {
      ingredientMap.set(item.name.toLowerCase().trim(), item.id)
    }

    if (existingIngredients.length < SEED_INGREDIENTS.length) {
      for (const ing of SEED_INGREDIENTS) {
        if (!ingredientMap.has(ing.name.toLowerCase().trim())) {
          const [inserted] = await db
            .insert(schema.ingredients)
            .values({
              name: ing.name,
              category: ing.category,
              defaultShelfLifeDays: ing.defaultShelfLifeDays,
              defaultUnit: ing.defaultUnit,
              icon: ing.icon,
              storageLocation: ing.storageLocation,
            })
            .returning()
          ingredientMap.set(ing.name.toLowerCase().trim(), inserted.id)
        }
      }
    }

    // 4. Check and Seed Recipes
    const existingRecipes = await db.select().from(schema.recipes)
    if (existingRecipes.length < SEED_RECIPES.length) {
      for (const rec of SEED_RECIPES) {
        const found = existingRecipes.find((r: any) => r.title === rec.title)
        if (!found) {
          const [insertedRecipe] = await db
            .insert(schema.recipes)
            .values({
              title: rec.title,
              description: rec.description,
              imageUrl: rec.imageUrl,
              prepTimeMinutes: rec.prepTimeMinutes,
              cookTimeMinutes: rec.cookTimeMinutes,
              totalTimeMinutes: rec.totalTimeMinutes,
              difficulty: rec.difficulty,
              servings: rec.servings,
              category: rec.category,
              tags: JSON.stringify(rec.tags),
              instructions: JSON.stringify(rec.instructions),
              isVegetarian: rec.isVegetarian,
              calories: rec.calories,
            })
            .returning()

          // Add recipe ingredients
          for (const item of rec.ingredients) {
            let matchedIngId = ingredientMap.get(item.name.toLowerCase().trim())
            if (!matchedIngId) {
              for (const [key, id] of ingredientMap.entries()) {
                if (key.includes(item.name.toLowerCase().trim()) || item.name.toLowerCase().trim().includes(key)) {
                  matchedIngId = id
                  break
                }
              }
            }

            // Insert all recipe ingredients so recipes have their full ingredient lists
            await db.insert(schema.recipeIngredients).values({
              recipeId: insertedRecipe.id,
              ingredientId: matchedIngId ?? null,
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              isOptional: item.isOptional ?? false,
              notes: item.notes ?? '',
            })
          }
        }
      }
    }

    // 5. Seed default starter items in user's fridge if empty
    if (demoUser) {
      const existingUserIngredients = await db
        .select()
        .from(schema.userIngredients)
        .where(sql`${schema.userIngredients.userId} = ${demoUser.id}`)

      if (existingUserIngredients.length === 0) {
        const now = new Date()
        const dayMs = 24 * 60 * 60 * 1000

        const starterFridgeItems = [
          { name: 'Telur Ayam', qty: 6, unit: 'butir', daysLeft: 12, cat: 'protein', loc: 'fridge' },
          { name: 'Beras / Nasi Putih', qty: 2, unit: 'piring', daysLeft: 20, cat: 'karbohidrat', loc: 'pantry' },
          { name: 'Bawang Merah', qty: 10, unit: 'siung', daysLeft: 14, cat: 'bumbu', loc: 'pantry' },
          { name: 'Bawang Putih', qty: 8, unit: 'siung', daysLeft: 14, cat: 'bumbu', loc: 'pantry' },
          { name: 'Cabai Rawit Merah', qty: 10, unit: 'buah', daysLeft: 1, cat: 'bumbu', loc: 'fridge' }, // Expiring!
          { name: 'Kubis / Kol', qty: 150, unit: 'gram', daysLeft: 2, cat: 'sayur', loc: 'fridge' }, // Expiring!
          { name: 'Wortel', qty: 2, unit: 'buah', daysLeft: 4, cat: 'sayur', loc: 'fridge' }, // Use soon!
          { name: 'Bakso Sapi', qty: 8, unit: 'butir', daysLeft: 3, cat: 'protein', loc: 'fridge' }, // Use soon!
          { name: 'Kecap Manis', qty: 1, unit: 'sdm', daysLeft: 60, cat: 'bumbu', loc: 'pantry' },
          { name: 'Minyak Goreng', qty: 10, unit: 'sdm', daysLeft: 80, cat: 'bumbu', loc: 'pantry' },
          { name: 'Saus Tiram', qty: 1, unit: 'sdm', daysLeft: 40, cat: 'bumbu', loc: 'fridge' },
          { name: 'Garam', qty: 10, unit: 'sdt', daysLeft: 100, cat: 'bumbu', loc: 'pantry' },
        ]

        for (const it of starterFridgeItems) {
          const ingId = ingredientMap.get(it.name.toLowerCase().trim())
          const exp = new Date(now.getTime() + it.daysLeft * dayMs)
          await db.insert(schema.userIngredients).values({
            userId: demoUser.id,
            ingredientId: ingId ?? null,
            customName: it.name,
            category: it.cat,
            quantity: it.qty,
            unit: it.unit,
            storageLocation: it.loc,
            purchasedDate: new Date(now.getTime() - 2 * dayMs),
            expiryDate: exp,
          })
        }
      }
    }

    globalThis.__FRIDGE_DB_INITIALIZED__ = true
    console.log('✅ FridgeFirst database initialized and seeded successfully!')
  } catch (err) {
    console.error('Error during initAndSeedDatabase:', err)
  }
}
