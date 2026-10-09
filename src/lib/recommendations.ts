export type ExpiryStatus = 'Fresh' | 'Use Soon' | 'Expiring' | 'Expired'

export interface UserIngredientWithStatus {
  id: number
  userId: number
  ingredientId: number | null
  customName: string | null
  category: string
  quantity: number
  unit: string
  storageLocation: string
  purchasedDate: string | Date
  expiryDate: string | Date
  notes?: string | null
  daysRemaining: number
  status: ExpiryStatus
}

export interface MatchedRecipeIngredient {
  recipeIngredientId: number
  name: string
  requiredQuantity: number
  unit: string
  isOptional: boolean
  hasIngredient: boolean
  matchedUserIngredient?: UserIngredientWithStatus
  status: 'have' | 'use_soon' | 'expiring' | 'expired' | 'missing'
}

export interface RecommendedRecipe {
  id: number
  title: string
  description: string
  imageUrl: string
  prepTimeMinutes: number
  cookTimeMinutes: number
  totalTimeMinutes: number
  difficulty: string
  servings: number
  category: string
  tags: string[]
  instructions: Array<{ step: number; title: string; description: string; timerMinutes?: number }>
  isVegetarian: boolean
  calories?: number | null
  fridgeMatchPercentage: number
  wasteScore: number
  totalIngredientsCount: number
  matchedIngredientsCount: number
  missingIngredientsCount: number
  expiringRescuedCount: number
  ingredientsList: MatchedRecipeIngredient[]
  isFavorite?: boolean
}

export function calculateDaysRemaining(expiryDate: string | Date): number {
  const exp = new Date(expiryDate).getTime()
  const now = new Date().getTime()
  return Math.ceil((exp - now) / (1000 * 60 * 60 * 24))
}

export function getExpiryStatus(daysRemaining: number): ExpiryStatus {
  if (daysRemaining < 0) return 'Expired'
  if (daysRemaining <= 2) return 'Expiring'
  if (daysRemaining <= 5) return 'Use Soon'
  return 'Fresh'
}

export function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function isIngredientMatch(
  userItem: { ingredientId: number | null; customName: string | null },
  recipeItem: { ingredientId: number; name: string }
): boolean {
  if (userItem.ingredientId && userItem.ingredientId === recipeItem.ingredientId) {
    return true
  }

  const uName = normalizeIngredientName(userItem.customName || '')
  const rName = normalizeIngredientName(recipeItem.name)

  if (!uName || !rName) return false

  return uName.includes(rName) || rName.includes(uName)
}

export function evaluateRecipeMatch(
  recipe: any,
  recipeIngredients: any[],
  userIngredients: UserIngredientWithStatus[],
  isFavorite = false
): RecommendedRecipe {
  let matchedCount = 0
  let expiringRescuedCount = 0
  let useSoonRescuedCount = 0
  let wastePoints = 0

  const detailedIngredients: MatchedRecipeIngredient[] = recipeIngredients.map((rIng) => {
    // Find matching user ingredient
    const matched = userIngredients.find((uIng) => isIngredientMatch(uIng, rIng))

    if (matched) {
      matchedCount++
      if (matched.status === 'Expiring') {
        expiringRescuedCount++
        wastePoints += 45
      } else if (matched.status === 'Use Soon') {
        useSoonRescuedCount++
        wastePoints += 30
      } else if (matched.status === 'Expired') {
        wastePoints += 10
      } else {
        wastePoints += 15
      }

      let ingredientStatus: 'have' | 'use_soon' | 'expiring' | 'expired' = 'have'
      if (matched.status === 'Expiring') ingredientStatus = 'expiring'
      else if (matched.status === 'Use Soon') ingredientStatus = 'use_soon'
      else if (matched.status === 'Expired') ingredientStatus = 'expired'

      return {
        recipeIngredientId: rIng.id,
        name: rIng.name,
        requiredQuantity: Number(rIng.quantity),
        unit: rIng.unit,
        isOptional: rIng.isOptional,
        hasIngredient: true,
        matchedUserIngredient: matched,
        status: ingredientStatus,
      }
    }

    return {
      recipeIngredientId: rIng.id,
      name: rIng.name,
      requiredQuantity: Number(rIng.quantity),
      unit: rIng.unit,
      isOptional: rIng.isOptional,
      hasIngredient: false,
      status: 'missing',
    }
  })

  const totalIngredients = recipeIngredients.length
  const matchPercentage =
    totalIngredients === 0 ? 100 : Math.round((matchedCount / totalIngredients) * 100)
  const missingCount = Math.max(0, totalIngredients - matchedCount)

  // Waste Score calculation:
  // Heavily reward using expiring & use soon ingredients, scaled by how much of the recipe can be cooked
  let calculatedWasteScore = 0
  if (matchedCount > 0 && totalIngredients > 0) {
    const baseWeight = (wastePoints / (totalIngredients * 35)) * 100
    const matchBonus = matchPercentage / 100
    const expiringBonus = expiringRescuedCount * 15 + useSoonRescuedCount * 8
    calculatedWasteScore = Math.min(
      100,
      Math.max(5, Math.round(baseWeight * matchBonus + expiringBonus))
    )
  }

  // Parse tags and instructions if string
  let tags: string[] = []
  try {
    tags = typeof recipe.tags === 'string' ? JSON.parse(recipe.tags) : recipe.tags || []
  } catch {
    tags = []
  }

  let instructions: any[] = []
  try {
    instructions =
      typeof recipe.instructions === 'string'
        ? JSON.parse(recipe.instructions)
        : recipe.instructions || []
  } catch {
    instructions = []
  }

  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    imageUrl: recipe.imageUrl,
    prepTimeMinutes: recipe.prepTimeMinutes,
    cookTimeMinutes: recipe.cookTimeMinutes,
    totalTimeMinutes: recipe.totalTimeMinutes,
    difficulty: recipe.difficulty,
    servings: recipe.servings,
    category: recipe.category,
    tags,
    instructions,
    isVegetarian: recipe.isVegetarian,
    calories: recipe.calories,
    fridgeMatchPercentage: matchPercentage,
    wasteScore: calculatedWasteScore,
    totalIngredientsCount: totalIngredients,
    matchedIngredientsCount: matchedCount,
    missingIngredientsCount: missingCount,
    expiringRescuedCount,
    ingredientsList: detailedIngredients,
    isFavorite,
  }
}
