import { z } from 'zod'

export const categoryEnum = z.enum([
  'sayur',
  'buah',
  'protein',
  'karbohidrat',
  'dairy',
  'bumbu',
  'frozen',
  'lainnya',
])

export const storageLocationEnum = z.enum(['fridge', 'freezer', 'pantry'])

export const addIngredientSchema = z.object({
  name: z.string().min(1, 'Nama bahan wajib diisi'),
  ingredientId: z.number().optional().nullable(),
  category: categoryEnum,
  quantity: z.number().positive('Jumlah harus lebih dari 0'),
  unit: z.string().min(1, 'Satuan wajib dipilih'),
  storageLocation: storageLocationEnum.default('fridge'),
  expiryDays: z.number().int().positive().optional().default(7),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
})

export const bulkAddIngredientsSchema = z.object({
  rawInput: z.string().min(1, 'Masukkan minimal satu nama bahan'),
  defaultStorageLocation: storageLocationEnum.default('fridge'),
})

export const updateIngredientSchema = z.object({
  id: z.number().int().positive(),
  customName: z.string().min(1, 'Nama bahan wajib diisi').optional(),
  category: categoryEnum.optional(),
  quantity: z.number().positive('Jumlah harus lebih dari 0').optional(),
  unit: z.string().min(1).optional(),
  storageLocation: storageLocationEnum.optional(),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
})

export const addShoppingItemSchema = z.object({
  name: z.string().min(1, 'Nama item wajib diisi'),
  quantity: z.number().positive().default(1),
  unit: z.string().min(1).default('buah'),
  category: categoryEnum.default('lainnya'),
  recipeId: z.number().optional().nullable(),
  ingredientId: z.number().optional().nullable(),
})

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  defaultServings: z.number().int().min(1).max(20).default(2),
  preferredUnit: z.enum(['metric', 'imperial']).default('metric'),
  dietaryPreferences: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
})

export const recipeFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  maxTime: z.number().optional(),
  difficulty: z.string().optional(),
  isVegetarian: z.boolean().optional(),
  onlyReady: z.boolean().optional(),
  sortBy: z.enum(['match', 'waste', 'missing', 'time']).default('waste'),
})
