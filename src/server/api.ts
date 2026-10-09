import { createServerFn } from '@tanstack/react-start'
import { and, eq, sql } from 'drizzle-orm'
import { db } from '../db'
import { initAndSeedDatabase } from '../db/init'
import * as schema from '../db/schema'
import {
  calculateDaysRemaining,
  evaluateRecipeMatch,
  getExpiryStatus,
  type RecommendedRecipe,
  type UserIngredientWithStatus,
} from '../lib/recommendations'
import {
  addIngredientSchema,
  addShoppingItemSchema,
  bulkAddIngredientsSchema,
  updateIngredientSchema,
  updateProfileSchema,
} from '../lib/validations'

// Helper to get active demo user ID
async function getDemoUser() {
  await initAndSeedDatabase()
  const [foundUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, 'demo@fridgefirst.com'))

  let user = foundUser
  if (!user) {
    const [created] = await db
      .insert(schema.users)
      .values({
        name: 'Chef Yuka',
        email: 'demo@fridgefirst.com',
        password: 'password123',
        dietaryPreferences: JSON.stringify(['halal', 'cepat']),
        allergies: JSON.stringify(['kacang']),
        defaultServings: 2,
        preferredUnit: 'metric',
      })
      .returning()
    user = created
  }
  return user
}

// 1. GET DASHBOARD SUMMARY
export const getDashboardSummaryFn = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await getDemoUser()

  // Fetch user ingredients
  const rawUserIngredients = await db
    .select()
    .from(schema.userIngredients)
    .where(eq(schema.userIngredients.userId, user.id))

  const userItems: UserIngredientWithStatus[] = rawUserIngredients.map((item: any) => {
    const days = calculateDaysRemaining(item.expiryDate)
    return {
      ...item,
      daysRemaining: days,
      status: getExpiryStatus(days),
    }
  })

  // Expiry statistics
  const expiringSoonItems = userItems.filter(
    (item: UserIngredientWithStatus) => item.status === 'Expiring' || item.status === 'Expired'
  )
  const useSoonItems = userItems.filter(
    (item: UserIngredientWithStatus) => item.status === 'Use Soon'
  )

  // Fetch all recipes & their ingredients
  const allRecipes = await db.select().from(schema.recipes)
  const allRecipeIngredients = await db.select().from(schema.recipeIngredients)
  const userFavorites = await db
    .select()
    .from(schema.favorites)
    .where(eq(schema.favorites.userId, user.id))
  const favoriteIds = new Set(userFavorites.map((f: any) => f.recipeId))

  // Map ingredients by recipeId
  const ingredientsByRecipe = new Map<number, typeof allRecipeIngredients>()
  for (const ri of allRecipeIngredients) {
    const list = ingredientsByRecipe.get(ri.recipeId) || []
    list.push(ri)
    ingredientsByRecipe.set(ri.recipeId, list)
  }

  // Evaluate recipes
  const recommendedRecipes: RecommendedRecipe[] = allRecipes.map((recipe: any) => {
    const rIngredients = ingredientsByRecipe.get(recipe.id) || []
    return evaluateRecipeMatch(recipe, rIngredients, userItems, favoriteIds.has(recipe.id))
  })

  // Sort by waste score and fridge match
  const cookNowCandidates = [...recommendedRecipes].sort((a, b) => {
    if (b.wasteScore !== a.wasteScore) return b.wasteScore - a.wasteScore
    return b.fridgeMatchPercentage - a.fridgeMatchPercentage
  })

  const topCookNow = cookNowCandidates.slice(0, 3)
  const readyToCookCount = recommendedRecipes.filter((r) => r.fridgeMatchPercentage === 100).length

  // Estimated food waste prevented in kg
  const preventedWasteKg = Math.max(
    1.2,
    Number(((expiringSoonItems.length * 0.45 + useSoonItems.length * 0.3 + userItems.length * 0.12)).toFixed(1))
  )

  // Category breakdown for Recharts
  const categoryCounts: Record<string, number> = {}
  for (const item of userItems) {
    const cat = item.category.charAt(0).toUpperCase() + item.category.slice(1)
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
  }

  const categoryChartData = Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    count,
  }))

  return {
    totalIngredients: userItems.length,
    readyToCookCount,
    expiringSoonCount: expiringSoonItems.length,
    useSoonCount: useSoonItems.length,
    preventedWasteKg,
    topCookNow,
    expiringItems: userItems
      .filter((i) => i.daysRemaining <= 4)
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 6),
    categoryChartData,
    userName: user.name,
  }
})

// 2. GET FRIDGE ITEMS
export const getFridgeItemsFn = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await getDemoUser()

  const rawUserIngredients = await db
    .select()
    .from(schema.userIngredients)
    .where(eq(schema.userIngredients.userId, user.id))

  const items: UserIngredientWithStatus[] = rawUserIngredients
    .map((item: any) => {
      const days = calculateDaysRemaining(item.expiryDate)
      return {
        ...item,
        daysRemaining: days,
        status: getExpiryStatus(days),
      }
    })
    .sort((a: any, b: any) => a.daysRemaining - b.daysRemaining)

  return { items }
})

// 3. ADD INGREDIENT TO FRIDGE
export const addFridgeIngredientFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => addIngredientSchema.parse(data))
  .handler(async ({ data }) => {
    const user = await getDemoUser()
    const now = new Date()
    const expiryDate = data.expiryDate
      ? new Date(data.expiryDate)
      : new Date(now.getTime() + (data.expiryDays || 7) * 24 * 60 * 60 * 1000)

    const [inserted] = await db
      .insert(schema.userIngredients)
      .values({
        userId: user.id,
        ingredientId: data.ingredientId || null,
        customName: data.name,
        category: data.category,
        quantity: data.quantity,
        unit: data.unit,
        storageLocation: data.storageLocation,
        purchasedDate: now,
        expiryDate,
        notes: data.notes || '',
      })
      .returning()

    return { success: true, item: inserted }
  })

// 4. BULK ADD INGREDIENTS
export const bulkAddFridgeIngredientsFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => bulkAddIngredientsSchema.parse(data))
  .handler(async ({ data }) => {
    const user = await getDemoUser()
    const masterIngredients = await db.select().from(schema.ingredients)

    const rawNames = data.rawInput
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    const now = new Date()
    const insertedItems = []

    for (const rawName of rawNames) {
      const lower = rawName.toLowerCase()
      const matched = masterIngredients.find(
        (m: any) =>
          m.name.toLowerCase() === lower ||
          m.name.toLowerCase().includes(lower) ||
          lower.includes(m.name.toLowerCase())
      )

      const category = matched ? matched.category : 'lainnya'
      const unit = matched ? matched.defaultUnit : 'buah'
      const shelfDays = matched ? matched.defaultShelfLifeDays : 7
      const expiryDate = new Date(now.getTime() + shelfDays * 24 * 60 * 60 * 1000)

      const [inserted] = await db
        .insert(schema.userIngredients)
        .values({
          userId: user.id,
          ingredientId: matched ? matched.id : null,
          customName: rawName,
          category,
          quantity: 1,
          unit,
          storageLocation: matched ? matched.storageLocation : data.defaultStorageLocation,
          purchasedDate: now,
          expiryDate,
        })
        .returning()

      insertedItems.push(inserted)
    }

    return { success: true, count: insertedItems.length, items: insertedItems }
  })

// 5. UPDATE FRIDGE INGREDIENT
export const updateFridgeIngredientFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => updateIngredientSchema.parse(data))
  .handler(async ({ data }) => {
    const updateValues: Record<string, any> = { updatedAt: new Date() }
    if (data.customName !== undefined) updateValues.customName = data.customName
    if (data.category !== undefined) updateValues.category = data.category
    if (data.quantity !== undefined) updateValues.quantity = data.quantity
    if (data.unit !== undefined) updateValues.unit = data.unit
    if (data.storageLocation !== undefined) updateValues.storageLocation = data.storageLocation
    if (data.expiryDate !== undefined) updateValues.expiryDate = new Date(data.expiryDate)
    if (data.notes !== undefined) updateValues.notes = data.notes

    const [updated] = await db
      .update(schema.userIngredients)
      .set(updateValues)
      .where(eq(schema.userIngredients.id, data.id))
      .returning()

    return { success: true, item: updated }
  })

// 6. DELETE FRIDGE INGREDIENT
export const deleteFridgeIngredientFn = createServerFn({ method: 'POST' })
  .validator((id: unknown) => Number(id))
  .handler(async ({ data: id }) => {
    await db.delete(schema.userIngredients).where(eq(schema.userIngredients.id, id))
    return { success: true }
  })

// 7. GET RECIPES WITH RECOMMENDATIONS
export const getRecipesFn = createServerFn({ method: 'GET' })
  .validator((filters: unknown) => {
    if (!filters || typeof filters !== 'object') return {}
    return filters as {
      search?: string
      category?: string
      difficulty?: string
      maxTime?: number
      isVegetarian?: boolean
      onlyReady?: boolean
      sortBy?: 'match' | 'waste' | 'missing' | 'time'
    }
  })
  .handler(async ({ data: filters }) => {
    const user = await getDemoUser()

    // Fetch user fridge items
    const rawUserIngredients = await db
      .select()
      .from(schema.userIngredients)
      .where(eq(schema.userIngredients.userId, user.id))

    const userItems: UserIngredientWithStatus[] = rawUserIngredients.map((item: any) => {
      const days = calculateDaysRemaining(item.expiryDate)
      return {
        ...item,
        daysRemaining: days,
        status: getExpiryStatus(days),
      }
    })

    // Fetch all recipes & ingredients
    const allRecipes = await db.select().from(schema.recipes)
    const allRecipeIngredients = await db.select().from(schema.recipeIngredients)
    const userFavorites = await db
      .select()
      .from(schema.favorites)
      .where(eq(schema.favorites.userId, user.id))
    const favoriteIds = new Set(userFavorites.map((f: any) => f.recipeId))

    const ingredientsByRecipe = new Map<number, typeof allRecipeIngredients>()
    for (const ri of allRecipeIngredients) {
      const list = ingredientsByRecipe.get(ri.recipeId) || []
      list.push(ri)
      ingredientsByRecipe.set(ri.recipeId, list)
    }

    let evaluated: RecommendedRecipe[] = allRecipes.map((recipe: any) => {
      const rIngredients = ingredientsByRecipe.get(recipe.id) || []
      return evaluateRecipeMatch(recipe, rIngredients, userItems, favoriteIds.has(recipe.id))
    })

    // Apply filters
    if (filters.search) {
      const s = filters.search.toLowerCase()
      evaluated = evaluated.filter(
        (r) =>
          r.title.toLowerCase().includes(s) ||
          r.description.toLowerCase().includes(s) ||
          r.tags.some((t) => t.toLowerCase().includes(s))
      )
    }

    if (filters.category && filters.category !== 'Semua') {
      evaluated = evaluated.filter((r) => r.category === filters.category)
    }

    if (filters.difficulty && filters.difficulty !== 'Semua') {
      evaluated = evaluated.filter((r) => r.difficulty === filters.difficulty)
    }

    if (filters.maxTime) {
      evaluated = evaluated.filter((r) => r.totalTimeMinutes <= Number(filters.maxTime))
    }

    if (filters.isVegetarian) {
      evaluated = evaluated.filter((r) => r.isVegetarian)
    }

    if (filters.onlyReady) {
      evaluated = evaluated.filter((r) => r.fridgeMatchPercentage === 100)
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'waste'
    evaluated.sort((a, b) => {
      if (sortBy === 'waste') {
        if (b.wasteScore !== a.wasteScore) return b.wasteScore - a.wasteScore
        return b.fridgeMatchPercentage - a.fridgeMatchPercentage
      }
      if (sortBy === 'match') {
        if (b.fridgeMatchPercentage !== a.fridgeMatchPercentage)
          return b.fridgeMatchPercentage - a.fridgeMatchPercentage
        return a.missingIngredientsCount - b.missingIngredientsCount
      }
      if (sortBy === 'missing') {
        if (a.missingIngredientsCount !== b.missingIngredientsCount)
          return a.missingIngredientsCount - b.missingIngredientsCount
        return b.fridgeMatchPercentage - a.fridgeMatchPercentage
      }
      if (sortBy === 'time') {
        if (a.totalTimeMinutes !== b.totalTimeMinutes)
          return a.totalTimeMinutes - b.totalTimeMinutes
        return b.fridgeMatchPercentage - a.fridgeMatchPercentage
      }
      return 0
    })

    return { recipes: evaluated }
  })

// 8. GET RECIPE DETAIL
export const getRecipeDetailFn = createServerFn({ method: 'GET' })
  .validator((recipeId: unknown) => Number(recipeId))
  .handler(async ({ data: recipeId }) => {
    const user = await getDemoUser()

    const [recipe] = await db
      .select()
      .from(schema.recipes)
      .where(eq(schema.recipes.id, recipeId))

    if (!recipe) {
      throw new Error(`Resep dengan ID ${recipeId} tidak ditemukan`)
    }

    const recipeIngredients = await db
      .select()
      .from(schema.recipeIngredients)
      .where(eq(schema.recipeIngredients.recipeId, recipeId))

    const rawUserIngredients = await db
      .select()
      .from(schema.userIngredients)
      .where(eq(schema.userIngredients.userId, user.id))

    const userItems: UserIngredientWithStatus[] = rawUserIngredients.map((item: any) => {
      const days = calculateDaysRemaining(item.expiryDate)
      return {
        ...item,
        daysRemaining: days,
        status: getExpiryStatus(days),
      }
    })

    const [favorite] = await db
      .select()
      .from(schema.favorites)
      .where(and(eq(schema.favorites.userId, user.id), eq(schema.favorites.recipeId, recipeId)))

    const detailed = evaluateRecipeMatch(recipe, recipeIngredients, userItems, !!favorite)

    return { recipe: detailed }
  })

// 9. ADD MISSING INGREDIENTS TO SHOPPING LIST
export const addMissingToShoppingListFn = createServerFn({ method: 'POST' })
  .validator((recipeId: unknown) => Number(recipeId))
  .handler(async ({ data: recipeId }) => {
    const user = await getDemoUser()

    const recipeIngredients = await db
      .select()
      .from(schema.recipeIngredients)
      .where(eq(schema.recipeIngredients.recipeId, recipeId))

    const rawUserIngredients = await db
      .select()
      .from(schema.userIngredients)
      .where(eq(schema.userIngredients.userId, user.id))

    const userItems: UserIngredientWithStatus[] = rawUserIngredients.map((item: any) => {
      const days = calculateDaysRemaining(item.expiryDate)
      return {
        ...item,
        daysRemaining: days,
        status: getExpiryStatus(days),
      }
    })

    const [recipe] = await db
      .select()
      .from(schema.recipes)
      .where(eq(schema.recipes.id, recipeId))

    const evaluated = evaluateRecipeMatch(recipe, recipeIngredients, userItems)
    const missing = evaluated.ingredientsList.filter((item: any) => !item.hasIngredient)

    const masterIngredients = await db.select().from(schema.ingredients)
    let addedCount = 0

    for (const item of missing) {
      const matchedMaster = masterIngredients.find(
        (m: any) => m.name.toLowerCase() === item.name.toLowerCase()
      )

      const [existing] = await db
        .select()
        .from(schema.shoppingListItems)
        .where(
          and(
            eq(schema.shoppingListItems.userId, user.id),
            eq(schema.shoppingListItems.name, item.name),
            eq(schema.shoppingListItems.isBought, false)
          )
        )

      if (!existing) {
        await db.insert(schema.shoppingListItems).values({
          userId: user.id,
          ingredientId: matchedMaster ? matchedMaster.id : null,
          name: item.name,
          quantity: item.requiredQuantity,
          unit: item.unit,
          category: matchedMaster ? matchedMaster.category : 'lainnya',
          isBought: false,
          recipeId,
        })
        addedCount++
      }
    }

    return { success: true, addedCount }
  })

// 10. GET SHOPPING LIST
export const getShoppingListFn = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await getDemoUser()
  const items = await db
    .select()
    .from(schema.shoppingListItems)
    .where(eq(schema.shoppingListItems.userId, user.id))
    .orderBy(schema.shoppingListItems.isBought, schema.shoppingListItems.id)

  return { items }
})

// 11. TOGGLE SHOPPING ITEM BOUGHT
export const toggleShoppingItemBoughtFn = createServerFn({ method: 'POST' })
  .validator((params: unknown) => params as { id: number; isBought: boolean })
  .handler(async ({ data }) => {
    const [updated] = await db
      .update(schema.shoppingListItems)
      .set({ isBought: data.isBought })
      .where(eq(schema.shoppingListItems.id, data.id))
      .returning()

    return { success: true, item: updated }
  })

// 12. ADD MANUAL SHOPPING ITEM
export const addManualShoppingItemFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => addShoppingItemSchema.parse(data))
  .handler(async ({ data }) => {
    const user = await getDemoUser()
    const [inserted] = await db
      .insert(schema.shoppingListItems)
      .values({
        userId: user.id,
        name: data.name,
        quantity: data.quantity,
        unit: data.unit,
        category: data.category,
        ingredientId: data.ingredientId || null,
        recipeId: data.recipeId || null,
        isBought: false,
      })
      .returning()

    return { success: true, item: inserted }
  })

// 13. DELETE SHOPPING ITEM
export const deleteShoppingItemFn = createServerFn({ method: 'POST' })
  .validator((id: unknown) => Number(id))
  .handler(async ({ data: id }) => {
    await db.delete(schema.shoppingListItems).where(eq(schema.shoppingListItems.id, id))
    return { success: true }
  })

// 14. TRANSFER BOUGHT ITEMS TO FRIDGE INVENTORY
export const transferBoughtItemsToFridgeFn = createServerFn({ method: 'POST' }).handler(async () => {
  const user = await getDemoUser()
  const boughtItems = await db
    .select()
    .from(schema.shoppingListItems)
    .where(sql`${schema.shoppingListItems.userId} = ${user.id} AND ${schema.shoppingListItems.isBought} = TRUE`)

  if (boughtItems.length === 0) {
    return { success: true, count: 0 }
  }

  const masterIngredients = await db.select().from(schema.ingredients)
  const now = new Date()
  let transferredCount = 0

  for (const item of boughtItems) {
    const master = masterIngredients.find(
      (m: any) =>
        m.id === item.ingredientId ||
        m.name.toLowerCase() === item.name.toLowerCase() ||
        item.name.toLowerCase().includes(m.name.toLowerCase())
    )

    const shelfDays = master ? master.defaultShelfLifeDays : 7
    const location = master ? master.storageLocation : 'fridge'
    const expiryDate = new Date(now.getTime() + shelfDays * 24 * 60 * 60 * 1000)

    await db.insert(schema.userIngredients).values({
      userId: user.id,
      ingredientId: master ? master.id : null,
      customName: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      storageLocation: location,
      purchasedDate: now,
      expiryDate,
    })

    // Remove from shopping list
    await db.delete(schema.shoppingListItems).where(eq(schema.shoppingListItems.id, item.id))
    transferredCount++
  }

  return { success: true, count: transferredCount }
})

// 15. GET & UPDATE USER PROFILE
export const getUserProfileFn = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await getDemoUser()
  let dietaryPreferences: string[] = []
  let allergies: string[] = []
  try {
    dietaryPreferences = JSON.parse(user.dietaryPreferences || '[]')
  } catch {
    dietaryPreferences = []
  }
  try {
    allergies = JSON.parse(user.allergies || '[]')
  } catch {
    allergies = []
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      defaultServings: user.defaultServings,
      preferredUnit: user.preferredUnit,
      dietaryPreferences,
      allergies,
    },
  }
})

export const updateUserProfileFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => updateProfileSchema.parse(data))
  .handler(async ({ data }) => {
    const user = await getDemoUser()
    const [updated] = await db
      .update(schema.users)
      .set({
        name: data.name,
        defaultServings: data.defaultServings,
        preferredUnit: data.preferredUnit,
        dietaryPreferences: JSON.stringify(data.dietaryPreferences),
        allergies: JSON.stringify(data.allergies),
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, user.id))
      .returning()

    return { success: true, user: updated }
  })

// 16. TOGGLE FAVORITE RECIPE
export const toggleFavoriteRecipeFn = createServerFn({ method: 'POST' })
  .validator((recipeId: unknown) => Number(recipeId))
  .handler(async ({ data: recipeId }) => {
    const user = await getDemoUser()
    const [existing] = await db
      .select()
      .from(schema.favorites)
      .where(and(eq(schema.favorites.userId, user.id), eq(schema.favorites.recipeId, recipeId)))

    if (existing) {
      await db.delete(schema.favorites).where(eq(schema.favorites.id, existing.id))
      return { isFavorite: false }
    } else {
      await db.insert(schema.favorites).values({
        userId: user.id,
        recipeId,
      })
      return { isFavorite: true }
    }
  })

// 17. GET MASTER INGREDIENTS LIST
export const getMasterIngredientsFn = createServerFn({ method: 'GET' }).handler(async () => {
  await initAndSeedDatabase()
  const master = await db.select().from(schema.ingredients)
  return { ingredients: master }
})

// 18. GET "USE IT UP" RECOMMENDATIONS (Fokus selamatkan 2-3 bahan paling kritis)
export const getUseItUpRecommendationsFn = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await getDemoUser()

  const rawUserIngredients = await db
    .select()
    .from(schema.userIngredients)
    .where(eq(schema.userIngredients.userId, user.id))

  const userItems: UserIngredientWithStatus[] = rawUserIngredients
    .map((item: any) => {
      const days = calculateDaysRemaining(item.expiryDate)
      return {
        ...item,
        daysRemaining: days,
        status: getExpiryStatus(days),
      }
    })
    .sort((a: any, b: any) => a.daysRemaining - b.daysRemaining)

  // Ambil 3 bahan paling mendesak
  const criticalItems = userItems.slice(0, 3)

  // Ambil semua resep & evaluasi kecocokan dengan bahan kritis
  const allRecipes = await db.select().from(schema.recipes)
  const allRecipeIngredients = await db.select().from(schema.recipeIngredients)
  const userFavorites = await db
    .select()
    .from(schema.favorites)
    .where(eq(schema.favorites.userId, user.id))
  const favoriteIds = new Set(userFavorites.map((f: any) => f.recipeId))

  const ingredientsByRecipe = new Map<number, typeof allRecipeIngredients>()
  for (const ri of allRecipeIngredients) {
    const list = ingredientsByRecipe.get(ri.recipeId) || []
    list.push(ri)
    ingredientsByRecipe.set(ri.recipeId, list)
  }

  const evaluated = allRecipes.map((recipe: any) => {
    const rIngredients = ingredientsByRecipe.get(recipe.id) || []
    const rec = evaluateRecipeMatch(recipe, rIngredients, userItems, favoriteIds.has(recipe.id))

    // Hitung berapa banyak bahan kritis yang dipakai dalam resep ini
    const criticalRescued = criticalItems.filter((crit: any) =>
      rec.ingredientsList.some(
        (ing: any) => ing.hasIngredient && ing.name.toLowerCase().includes(crit.customName.toLowerCase()) || crit.customName.toLowerCase().includes(ing.name.toLowerCase())
      )
    )

    return {
      ...rec,
      criticalRescuedCount: criticalRescued.length,
      criticalRescuedNames: criticalRescued.map((c: any) => c.customName),
    }
  })

  // Filter resep yang menyelamatkan minimal 1 bahan kritis, lalu sort berdasarkan jumlah bahan kritis yang diselamatkan
  const rescueRecipes = evaluated
    .filter((r: any) => r.criticalRescuedCount > 0)
    .sort((a: any, b: any) => {
      if (b.criticalRescuedCount !== a.criticalRescuedCount) {
        return b.criticalRescuedCount - a.criticalRescuedCount
      }
      if (b.wasteScore !== a.wasteScore) {
        return b.wasteScore - a.wasteScore
      }
      return b.fridgeMatchPercentage - a.fridgeMatchPercentage
    })

  return {
    criticalIngredients: criticalItems,
    rescueRecipes,
  }
})

// 19. RECORD COOKING HISTORY & RATING
export const recordCookingHistoryFn = createServerFn({ method: 'POST' })
  .validator((params: unknown) => params as { recipeId: number; rating?: 'masak_lagi' | 'oke' | 'tidak_akan_ulang'; notes?: string })
  .handler(async ({ data }) => {
    const user = await getDemoUser()

    const [recorded] = await db
      .insert(schema.cookingHistory)
      .values({
        userId: user.id,
        recipeId: data.recipeId,
        rating: data.rating || 'masak_lagi',
        notes: data.notes || '',
      })
      .returning()

    return { success: true, history: recorded }
  })

// 20. GET COOKING HISTORY
export const getCookingHistoryFn = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await getDemoUser()

  const rawHistory = await db
    .select()
    .from(schema.cookingHistory)
    .where(eq(schema.cookingHistory.userId, user.id))
    .orderBy(sql`${schema.cookingHistory.cookedAt} DESC`)

  const allRecipes = await db.select().from(schema.recipes)
  const recipeMap = new Map(allRecipes.map((r: any) => [r.id, r]))

  const historyWithRecipes = rawHistory.map((item: any) => {
    const r = recipeMap.get(item.recipeId)
    return {
      ...item,
      recipe: r || null,
    }
  })

  return { history: historyWithRecipes }
})

// 21. GET USER FAVORITES
export const getFavoritesFn = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await getDemoUser()

  const rawFavorites = await db
    .select()
    .from(schema.favorites)
    .where(eq(schema.favorites.userId, user.id))

  const favoriteRecipeIds = new Set(rawFavorites.map((f: any) => f.recipeId))
  const allRecipes = await db.select().from(schema.recipes)
  const favorites = allRecipes.filter((r: any) => favoriteRecipeIds.has(r.id))

  return { favorites }
})

// 22. SEED STARTER PANTRY PACK (Empty state quick fix)
export const seedStarterPantryFn = createServerFn({ method: 'POST' }).handler(async () => {
  const user = await getDemoUser()
  const masterIngredients = await db.select().from(schema.ingredients)
  const ingMap = new Map<string, any>(masterIngredients.map((m: any) => [m.name.toLowerCase().trim(), m]))

  const now = new Date()
  const dayMs = 24 * 60 * 60 * 1000

  const starterFridgeItems = [
    { name: 'Telur Ayam', qty: 6, unit: 'butir', daysLeft: 12, cat: 'protein', loc: 'fridge' },
    { name: 'Beras / Nasi Putih', qty: 2, unit: 'piring', daysLeft: 20, cat: 'karbohidrat', loc: 'pantry' },
    { name: 'Bawang Merah', qty: 8, unit: 'siung', daysLeft: 14, cat: 'bumbu', loc: 'pantry' },
    { name: 'Bawang Putih', qty: 6, unit: 'siung', daysLeft: 14, cat: 'bumbu', loc: 'pantry' },
    { name: 'Cabai Rawit Merah', qty: 8, unit: 'buah', daysLeft: 1, cat: 'bumbu', loc: 'fridge' }, // Expiring!
    { name: 'Kubis / Kol', qty: 150, unit: 'gram', daysLeft: 2, cat: 'sayur', loc: 'fridge' }, // Expiring!
    { name: 'Wortel', qty: 2, unit: 'buah', daysLeft: 4, cat: 'sayur', loc: 'fridge' }, // Use soon!
    { name: 'Bakso Sapi', qty: 6, unit: 'butir', daysLeft: 3, cat: 'protein', loc: 'fridge' }, // Use soon!
    { name: 'Kecap Manis', qty: 1, unit: 'sdm', daysLeft: 60, cat: 'bumbu', loc: 'pantry' },
    { name: 'Minyak Goreng', qty: 10, unit: 'sdm', daysLeft: 80, cat: 'bumbu', loc: 'pantry' },
  ]

  let count = 0
  for (const it of starterFridgeItems) {
    const matched = ingMap.get(it.name.toLowerCase().trim())
    const exp = new Date(now.getTime() + it.daysLeft * dayMs)
    await db.insert(schema.userIngredients).values({
      userId: user.id,
      ingredientId: matched ? matched.id : null,
      customName: it.name,
      category: it.cat,
      quantity: it.qty,
      unit: it.unit,
      storageLocation: it.loc,
      purchasedDate: now,
      expiryDate: exp,
    })
    count++
  }

  return { success: true, count }
})
