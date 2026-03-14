import { StrictMode, useDeferredValue, useEffect, useId, useMemo, useState, startTransition } from 'react'
import { createRoot } from 'react-dom/client'

type SectionId = 'market' | 'deals' | 'planner' | 'membership'
type CategoryId = 'produce' | 'bakery' | 'dairy' | 'meat' | 'frozen' | 'pantry' | 'snacks' | 'drinks'
type FilterId = 'all' | 'organic' | 'weekly' | 'protein' | 'family' | 'quick'
type DeliverySlotId = 'today' | 'morning' | 'evening' | 'weekend'

type Product = {
  id: string
  name: string
  category: CategoryId
  subtitle: string
  brand: string
  price: number
  unit: string
  rating: number
  reviews: number
  stock: number
  organic: boolean
  weekly: boolean
  protein: boolean
  family: boolean
  quick: boolean
  tags: string[]
  origin: string
  accent: string
  description: string
}

type Bundle = {
  id: string
  name: string
  category: CategoryId
  description: string
  savings: string
  accent: string
  productIds: string[]
}

type Recipe = {
  id: string
  title: string
  time: string
  difficulty: string
  accent: string
  ingredientIds: string[]
}

type DeliverySlot = {
  id: DeliverySlotId
  label: string
  window: string
  fee: string
}

type Activity = {
  id: string
  title: string
  detail: string
  time: string
}

const categoryLabels: Record<CategoryId, string> = {
  produce: 'Produce',
  bakery: 'Bakery',
  dairy: 'Dairy',
  meat: 'Meat',
  frozen: 'Frozen',
  pantry: 'Pantry',
  snacks: 'Snacks',
  drinks: 'Drinks',
}

const products: Product[] = [
  {
    "id": "product-1",
    "name": "Farm Baguette 1",
    "category": "bakery",
    "subtitle": "Bakery favorite for fast weekly planning",
    "brand": "Oregon Pantry Co.",
    "price": 3.34,
    "unit": "per lb",
    "rating": 4.3,
    "reviews": 47,
    "stock": 13,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Bakery",
      "Everyday",
      "Quick"
    ],
    "origin": "Texas",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for bakery baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-2",
    "name": "Harvest Yogurt 2",
    "category": "dairy",
    "subtitle": "Dairy favorite for fast weekly planning",
    "brand": "Idaho Pantry Co.",
    "price": 4.19,
    "unit": "each",
    "rating": 4.6,
    "reviews": 64,
    "stock": 18,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Dairy",
      "Everyday",
      "Quick"
    ],
    "origin": "Maine",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for dairy baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-3",
    "name": "Golden Chicken 3",
    "category": "meat",
    "subtitle": "Meat favorite for fast weekly planning",
    "brand": "Arizona Pantry Co.",
    "price": 5.04,
    "unit": "per box",
    "rating": 4.9,
    "reviews": 81,
    "stock": 23,
    "organic": true,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Meat",
      "Organic",
      "Quick"
    ],
    "origin": "Florida",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for meat baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-4",
    "name": "Morning Dumplings 4",
    "category": "frozen",
    "subtitle": "Frozen favorite for fast weekly planning",
    "brand": "Texas Pantry Co.",
    "price": 5.89,
    "unit": "per pack",
    "rating": 4.2,
    "reviews": 98,
    "stock": 28,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": true,
    "tags": [
      "Frozen",
      "Everyday",
      "Family"
    ],
    "origin": "Washington",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for frozen baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-5",
    "name": "River Pasta 5",
    "category": "pantry",
    "subtitle": "Pantry favorite for fast weekly planning",
    "brand": "Maine Pantry Co.",
    "price": 6.74,
    "unit": "per lb",
    "rating": 4.5,
    "reviews": 115,
    "stock": 33,
    "organic": false,
    "weekly": false,
    "protein": true,
    "family": false,
    "quick": true,
    "tags": [
      "Pantry",
      "Everyday",
      "Quick"
    ],
    "origin": "Vermont",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for pantry baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-6",
    "name": "Fresh Granola 6",
    "category": "snacks",
    "subtitle": "Snacks favorite for fast weekly planning",
    "brand": "Florida Pantry Co.",
    "price": 7.59,
    "unit": "each",
    "rating": 4.8,
    "reviews": 132,
    "stock": 38,
    "organic": true,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Snacks",
      "Organic",
      "Quick"
    ],
    "origin": "Georgia",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for snacks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-7",
    "name": "Daily Juice 7",
    "category": "drinks",
    "subtitle": "Drinks favorite for fast weekly planning",
    "brand": "Washington Pantry Co.",
    "price": 8.44,
    "unit": "per box",
    "rating": 4.1,
    "reviews": 149,
    "stock": 43,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Drinks",
      "Everyday",
      "Quick"
    ],
    "origin": "California",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for drinks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-8",
    "name": "Crisp Apples 8",
    "category": "produce",
    "subtitle": "Produce favorite for fast weekly planning",
    "brand": "Vermont Pantry Co.",
    "price": 9.29,
    "unit": "per pack",
    "rating": 4.4,
    "reviews": 166,
    "stock": 48,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": true,
    "tags": [
      "Produce",
      "Everyday",
      "Family"
    ],
    "origin": "Oregon",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for produce baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-9",
    "name": "Velvet Cheese 9",
    "category": "bakery",
    "subtitle": "Bakery favorite for fast weekly planning",
    "brand": "Georgia Pantry Co.",
    "price": 10.14,
    "unit": "per lb",
    "rating": 4.7,
    "reviews": 183,
    "stock": 53,
    "organic": true,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Bakery",
      "Organic",
      "Quick"
    ],
    "origin": "Idaho",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for bakery baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-10",
    "name": "Sunny Tomatoes 10",
    "category": "dairy",
    "subtitle": "Dairy favorite for fast weekly planning",
    "brand": "California Pantry Co.",
    "price": 10.99,
    "unit": "each",
    "rating": 4,
    "reviews": 200,
    "stock": 58,
    "organic": false,
    "weekly": true,
    "protein": true,
    "family": false,
    "quick": true,
    "tags": [
      "Dairy",
      "Everyday",
      "Quick"
    ],
    "origin": "Arizona",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for dairy baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-11",
    "name": "Farm Baguette 11",
    "category": "meat",
    "subtitle": "Meat favorite for fast weekly planning",
    "brand": "Oregon Pantry Co.",
    "price": 11.84,
    "unit": "per box",
    "rating": 4.3,
    "reviews": 217,
    "stock": 63,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Meat",
      "Everyday",
      "Quick"
    ],
    "origin": "Texas",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for meat baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-12",
    "name": "Harvest Yogurt 12",
    "category": "frozen",
    "subtitle": "Frozen favorite for fast weekly planning",
    "brand": "Idaho Pantry Co.",
    "price": 12.69,
    "unit": "per pack",
    "rating": 4.6,
    "reviews": 234,
    "stock": 68,
    "organic": true,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": false,
    "tags": [
      "Frozen",
      "Organic",
      "Family"
    ],
    "origin": "Maine",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for frozen baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-13",
    "name": "Golden Chicken 13",
    "category": "pantry",
    "subtitle": "Pantry favorite for fast weekly planning",
    "brand": "Arizona Pantry Co.",
    "price": 13.54,
    "unit": "per lb",
    "rating": 4.9,
    "reviews": 251,
    "stock": 73,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Pantry",
      "Everyday",
      "Quick"
    ],
    "origin": "Florida",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for pantry baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-14",
    "name": "Morning Dumplings 14",
    "category": "snacks",
    "subtitle": "Snacks favorite for fast weekly planning",
    "brand": "Texas Pantry Co.",
    "price": 14.39,
    "unit": "each",
    "rating": 4.2,
    "reviews": 268,
    "stock": 8,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Snacks",
      "Everyday",
      "Quick"
    ],
    "origin": "Washington",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for snacks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-15",
    "name": "River Pasta 15",
    "category": "drinks",
    "subtitle": "Drinks favorite for fast weekly planning",
    "brand": "Maine Pantry Co.",
    "price": 15.24,
    "unit": "per box",
    "rating": 4.5,
    "reviews": 285,
    "stock": 13,
    "organic": true,
    "weekly": false,
    "protein": true,
    "family": false,
    "quick": false,
    "tags": [
      "Drinks",
      "Organic",
      "Quick"
    ],
    "origin": "Vermont",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for drinks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-16",
    "name": "Fresh Granola 16",
    "category": "produce",
    "subtitle": "Produce favorite for fast weekly planning",
    "brand": "Florida Pantry Co.",
    "price": 16.09,
    "unit": "per pack",
    "rating": 4.8,
    "reviews": 302,
    "stock": 18,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": true,
    "tags": [
      "Produce",
      "Everyday",
      "Family"
    ],
    "origin": "Georgia",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for produce baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-17",
    "name": "Daily Juice 17",
    "category": "bakery",
    "subtitle": "Bakery favorite for fast weekly planning",
    "brand": "Washington Pantry Co.",
    "price": 16.94,
    "unit": "per lb",
    "rating": 4.1,
    "reviews": 319,
    "stock": 23,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Bakery",
      "Everyday",
      "Quick"
    ],
    "origin": "California",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for bakery baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-18",
    "name": "Crisp Apples 18",
    "category": "dairy",
    "subtitle": "Dairy favorite for fast weekly planning",
    "brand": "Vermont Pantry Co.",
    "price": 2.49,
    "unit": "each",
    "rating": 4.4,
    "reviews": 336,
    "stock": 28,
    "organic": true,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Dairy",
      "Organic",
      "Quick"
    ],
    "origin": "Oregon",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for dairy baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-19",
    "name": "Velvet Cheese 19",
    "category": "meat",
    "subtitle": "Meat favorite for fast weekly planning",
    "brand": "Georgia Pantry Co.",
    "price": 3.34,
    "unit": "per box",
    "rating": 4.7,
    "reviews": 353,
    "stock": 33,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Meat",
      "Everyday",
      "Quick"
    ],
    "origin": "Idaho",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for meat baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-20",
    "name": "Sunny Tomatoes 20",
    "category": "frozen",
    "subtitle": "Frozen favorite for fast weekly planning",
    "brand": "California Pantry Co.",
    "price": 4.19,
    "unit": "per pack",
    "rating": 4,
    "reviews": 370,
    "stock": 38,
    "organic": false,
    "weekly": true,
    "protein": true,
    "family": true,
    "quick": true,
    "tags": [
      "Frozen",
      "Everyday",
      "Family"
    ],
    "origin": "Arizona",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for frozen baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-21",
    "name": "Farm Baguette 21",
    "category": "pantry",
    "subtitle": "Pantry favorite for fast weekly planning",
    "brand": "Oregon Pantry Co.",
    "price": 5.04,
    "unit": "per lb",
    "rating": 4.3,
    "reviews": 387,
    "stock": 43,
    "organic": true,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Pantry",
      "Organic",
      "Quick"
    ],
    "origin": "Texas",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for pantry baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-22",
    "name": "Harvest Yogurt 22",
    "category": "snacks",
    "subtitle": "Snacks favorite for fast weekly planning",
    "brand": "Idaho Pantry Co.",
    "price": 5.89,
    "unit": "each",
    "rating": 4.6,
    "reviews": 404,
    "stock": 48,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Snacks",
      "Everyday",
      "Quick"
    ],
    "origin": "Maine",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for snacks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-23",
    "name": "Golden Chicken 23",
    "category": "drinks",
    "subtitle": "Drinks favorite for fast weekly planning",
    "brand": "Arizona Pantry Co.",
    "price": 6.74,
    "unit": "per box",
    "rating": 4.9,
    "reviews": 421,
    "stock": 53,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Drinks",
      "Everyday",
      "Quick"
    ],
    "origin": "Florida",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for drinks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-24",
    "name": "Morning Dumplings 24",
    "category": "produce",
    "subtitle": "Produce favorite for fast weekly planning",
    "brand": "Texas Pantry Co.",
    "price": 7.59,
    "unit": "per pack",
    "rating": 4.2,
    "reviews": 438,
    "stock": 58,
    "organic": true,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": false,
    "tags": [
      "Produce",
      "Organic",
      "Family"
    ],
    "origin": "Washington",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for produce baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-25",
    "name": "River Pasta 25",
    "category": "bakery",
    "subtitle": "Bakery favorite for fast weekly planning",
    "brand": "Maine Pantry Co.",
    "price": 8.44,
    "unit": "per lb",
    "rating": 4.5,
    "reviews": 455,
    "stock": 63,
    "organic": false,
    "weekly": false,
    "protein": true,
    "family": false,
    "quick": true,
    "tags": [
      "Bakery",
      "Everyday",
      "Quick"
    ],
    "origin": "Vermont",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for bakery baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-26",
    "name": "Fresh Granola 26",
    "category": "dairy",
    "subtitle": "Dairy favorite for fast weekly planning",
    "brand": "Florida Pantry Co.",
    "price": 9.29,
    "unit": "each",
    "rating": 4.8,
    "reviews": 472,
    "stock": 68,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Dairy",
      "Everyday",
      "Quick"
    ],
    "origin": "Georgia",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for dairy baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-27",
    "name": "Daily Juice 27",
    "category": "meat",
    "subtitle": "Meat favorite for fast weekly planning",
    "brand": "Washington Pantry Co.",
    "price": 10.14,
    "unit": "per box",
    "rating": 4.1,
    "reviews": 489,
    "stock": 73,
    "organic": true,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Meat",
      "Organic",
      "Quick"
    ],
    "origin": "California",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for meat baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-28",
    "name": "Crisp Apples 28",
    "category": "frozen",
    "subtitle": "Frozen favorite for fast weekly planning",
    "brand": "Vermont Pantry Co.",
    "price": 10.99,
    "unit": "per pack",
    "rating": 4.4,
    "reviews": 506,
    "stock": 8,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": true,
    "tags": [
      "Frozen",
      "Everyday",
      "Family"
    ],
    "origin": "Oregon",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for frozen baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-29",
    "name": "Velvet Cheese 29",
    "category": "pantry",
    "subtitle": "Pantry favorite for fast weekly planning",
    "brand": "Georgia Pantry Co.",
    "price": 11.84,
    "unit": "per lb",
    "rating": 4.7,
    "reviews": 523,
    "stock": 13,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Pantry",
      "Everyday",
      "Quick"
    ],
    "origin": "Idaho",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for pantry baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-30",
    "name": "Sunny Tomatoes 30",
    "category": "snacks",
    "subtitle": "Snacks favorite for fast weekly planning",
    "brand": "California Pantry Co.",
    "price": 12.69,
    "unit": "each",
    "rating": 4,
    "reviews": 540,
    "stock": 18,
    "organic": true,
    "weekly": true,
    "protein": true,
    "family": false,
    "quick": false,
    "tags": [
      "Snacks",
      "Organic",
      "Quick"
    ],
    "origin": "Arizona",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for snacks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-31",
    "name": "Farm Baguette 31",
    "category": "drinks",
    "subtitle": "Drinks favorite for fast weekly planning",
    "brand": "Oregon Pantry Co.",
    "price": 13.54,
    "unit": "per box",
    "rating": 4.3,
    "reviews": 557,
    "stock": 23,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Drinks",
      "Everyday",
      "Quick"
    ],
    "origin": "Texas",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for drinks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-32",
    "name": "Harvest Yogurt 32",
    "category": "produce",
    "subtitle": "Produce favorite for fast weekly planning",
    "brand": "Idaho Pantry Co.",
    "price": 14.39,
    "unit": "per pack",
    "rating": 4.6,
    "reviews": 574,
    "stock": 28,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": true,
    "tags": [
      "Produce",
      "Everyday",
      "Family"
    ],
    "origin": "Maine",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for produce baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-33",
    "name": "Golden Chicken 33",
    "category": "bakery",
    "subtitle": "Bakery favorite for fast weekly planning",
    "brand": "Arizona Pantry Co.",
    "price": 15.24,
    "unit": "per lb",
    "rating": 4.9,
    "reviews": 591,
    "stock": 33,
    "organic": true,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Bakery",
      "Organic",
      "Quick"
    ],
    "origin": "Florida",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for bakery baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-34",
    "name": "Morning Dumplings 34",
    "category": "dairy",
    "subtitle": "Dairy favorite for fast weekly planning",
    "brand": "Texas Pantry Co.",
    "price": 16.09,
    "unit": "each",
    "rating": 4.2,
    "reviews": 608,
    "stock": 38,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Dairy",
      "Everyday",
      "Quick"
    ],
    "origin": "Washington",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for dairy baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-35",
    "name": "River Pasta 35",
    "category": "meat",
    "subtitle": "Meat favorite for fast weekly planning",
    "brand": "Maine Pantry Co.",
    "price": 16.94,
    "unit": "per box",
    "rating": 4.5,
    "reviews": 625,
    "stock": 43,
    "organic": false,
    "weekly": false,
    "protein": true,
    "family": false,
    "quick": true,
    "tags": [
      "Meat",
      "Everyday",
      "Quick"
    ],
    "origin": "Vermont",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for meat baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-36",
    "name": "Fresh Granola 36",
    "category": "frozen",
    "subtitle": "Frozen favorite for fast weekly planning",
    "brand": "Florida Pantry Co.",
    "price": 2.49,
    "unit": "per pack",
    "rating": 4.8,
    "reviews": 642,
    "stock": 48,
    "organic": true,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": false,
    "tags": [
      "Frozen",
      "Organic",
      "Family"
    ],
    "origin": "Georgia",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for frozen baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-37",
    "name": "Daily Juice 37",
    "category": "pantry",
    "subtitle": "Pantry favorite for fast weekly planning",
    "brand": "Washington Pantry Co.",
    "price": 3.34,
    "unit": "per lb",
    "rating": 4.1,
    "reviews": 659,
    "stock": 53,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Pantry",
      "Everyday",
      "Quick"
    ],
    "origin": "California",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for pantry baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-38",
    "name": "Crisp Apples 38",
    "category": "snacks",
    "subtitle": "Snacks favorite for fast weekly planning",
    "brand": "Vermont Pantry Co.",
    "price": 4.19,
    "unit": "each",
    "rating": 4.4,
    "reviews": 676,
    "stock": 58,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Snacks",
      "Everyday",
      "Quick"
    ],
    "origin": "Oregon",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for snacks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-39",
    "name": "Velvet Cheese 39",
    "category": "drinks",
    "subtitle": "Drinks favorite for fast weekly planning",
    "brand": "Georgia Pantry Co.",
    "price": 5.04,
    "unit": "per box",
    "rating": 4.7,
    "reviews": 693,
    "stock": 63,
    "organic": true,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Drinks",
      "Organic",
      "Quick"
    ],
    "origin": "Idaho",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for drinks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-40",
    "name": "Sunny Tomatoes 40",
    "category": "produce",
    "subtitle": "Produce favorite for fast weekly planning",
    "brand": "California Pantry Co.",
    "price": 5.89,
    "unit": "per pack",
    "rating": 4,
    "reviews": 710,
    "stock": 68,
    "organic": false,
    "weekly": true,
    "protein": true,
    "family": true,
    "quick": true,
    "tags": [
      "Produce",
      "Everyday",
      "Family"
    ],
    "origin": "Arizona",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for produce baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-41",
    "name": "Farm Baguette 41",
    "category": "bakery",
    "subtitle": "Bakery favorite for fast weekly planning",
    "brand": "Oregon Pantry Co.",
    "price": 6.74,
    "unit": "per lb",
    "rating": 4.3,
    "reviews": 727,
    "stock": 73,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Bakery",
      "Everyday",
      "Quick"
    ],
    "origin": "Texas",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for bakery baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-42",
    "name": "Harvest Yogurt 42",
    "category": "dairy",
    "subtitle": "Dairy favorite for fast weekly planning",
    "brand": "Idaho Pantry Co.",
    "price": 7.59,
    "unit": "each",
    "rating": 4.6,
    "reviews": 744,
    "stock": 8,
    "organic": true,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Dairy",
      "Organic",
      "Quick"
    ],
    "origin": "Maine",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for dairy baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-43",
    "name": "Golden Chicken 43",
    "category": "meat",
    "subtitle": "Meat favorite for fast weekly planning",
    "brand": "Arizona Pantry Co.",
    "price": 8.44,
    "unit": "per box",
    "rating": 4.9,
    "reviews": 761,
    "stock": 13,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Meat",
      "Everyday",
      "Quick"
    ],
    "origin": "Florida",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for meat baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-44",
    "name": "Morning Dumplings 44",
    "category": "frozen",
    "subtitle": "Frozen favorite for fast weekly planning",
    "brand": "Texas Pantry Co.",
    "price": 9.29,
    "unit": "per pack",
    "rating": 4.2,
    "reviews": 778,
    "stock": 18,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": true,
    "tags": [
      "Frozen",
      "Everyday",
      "Family"
    ],
    "origin": "Washington",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for frozen baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-45",
    "name": "River Pasta 45",
    "category": "pantry",
    "subtitle": "Pantry favorite for fast weekly planning",
    "brand": "Maine Pantry Co.",
    "price": 10.14,
    "unit": "per lb",
    "rating": 4.5,
    "reviews": 795,
    "stock": 23,
    "organic": true,
    "weekly": false,
    "protein": true,
    "family": false,
    "quick": false,
    "tags": [
      "Pantry",
      "Organic",
      "Quick"
    ],
    "origin": "Vermont",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for pantry baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-46",
    "name": "Fresh Granola 46",
    "category": "snacks",
    "subtitle": "Snacks favorite for fast weekly planning",
    "brand": "Florida Pantry Co.",
    "price": 10.99,
    "unit": "each",
    "rating": 4.8,
    "reviews": 812,
    "stock": 28,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Snacks",
      "Everyday",
      "Quick"
    ],
    "origin": "Georgia",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for snacks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-47",
    "name": "Daily Juice 47",
    "category": "drinks",
    "subtitle": "Drinks favorite for fast weekly planning",
    "brand": "Washington Pantry Co.",
    "price": 11.84,
    "unit": "per box",
    "rating": 4.1,
    "reviews": 829,
    "stock": 33,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Drinks",
      "Everyday",
      "Quick"
    ],
    "origin": "California",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for drinks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-48",
    "name": "Crisp Apples 48",
    "category": "produce",
    "subtitle": "Produce favorite for fast weekly planning",
    "brand": "Vermont Pantry Co.",
    "price": 12.69,
    "unit": "per pack",
    "rating": 4.4,
    "reviews": 846,
    "stock": 38,
    "organic": true,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": false,
    "tags": [
      "Produce",
      "Organic",
      "Family"
    ],
    "origin": "Oregon",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for produce baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-49",
    "name": "Velvet Cheese 49",
    "category": "bakery",
    "subtitle": "Bakery favorite for fast weekly planning",
    "brand": "Georgia Pantry Co.",
    "price": 13.54,
    "unit": "per lb",
    "rating": 4.7,
    "reviews": 863,
    "stock": 43,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Bakery",
      "Everyday",
      "Quick"
    ],
    "origin": "Idaho",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for bakery baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-50",
    "name": "Sunny Tomatoes 50",
    "category": "dairy",
    "subtitle": "Dairy favorite for fast weekly planning",
    "brand": "California Pantry Co.",
    "price": 14.39,
    "unit": "each",
    "rating": 4,
    "reviews": 880,
    "stock": 48,
    "organic": false,
    "weekly": true,
    "protein": true,
    "family": false,
    "quick": true,
    "tags": [
      "Dairy",
      "Everyday",
      "Quick"
    ],
    "origin": "Arizona",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for dairy baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-51",
    "name": "Farm Baguette 51",
    "category": "meat",
    "subtitle": "Meat favorite for fast weekly planning",
    "brand": "Oregon Pantry Co.",
    "price": 15.24,
    "unit": "per box",
    "rating": 4.3,
    "reviews": 897,
    "stock": 53,
    "organic": true,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Meat",
      "Organic",
      "Quick"
    ],
    "origin": "Texas",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for meat baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-52",
    "name": "Harvest Yogurt 52",
    "category": "frozen",
    "subtitle": "Frozen favorite for fast weekly planning",
    "brand": "Idaho Pantry Co.",
    "price": 16.09,
    "unit": "per pack",
    "rating": 4.6,
    "reviews": 914,
    "stock": 58,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": true,
    "tags": [
      "Frozen",
      "Everyday",
      "Family"
    ],
    "origin": "Maine",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for frozen baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-53",
    "name": "Golden Chicken 53",
    "category": "pantry",
    "subtitle": "Pantry favorite for fast weekly planning",
    "brand": "Arizona Pantry Co.",
    "price": 16.94,
    "unit": "per lb",
    "rating": 4.9,
    "reviews": 931,
    "stock": 63,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Pantry",
      "Everyday",
      "Quick"
    ],
    "origin": "Florida",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for pantry baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-54",
    "name": "Morning Dumplings 54",
    "category": "snacks",
    "subtitle": "Snacks favorite for fast weekly planning",
    "brand": "Texas Pantry Co.",
    "price": 2.49,
    "unit": "each",
    "rating": 4.2,
    "reviews": 948,
    "stock": 68,
    "organic": true,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Snacks",
      "Organic",
      "Quick"
    ],
    "origin": "Washington",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for snacks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-55",
    "name": "River Pasta 55",
    "category": "drinks",
    "subtitle": "Drinks favorite for fast weekly planning",
    "brand": "Maine Pantry Co.",
    "price": 3.34,
    "unit": "per box",
    "rating": 4.5,
    "reviews": 965,
    "stock": 73,
    "organic": false,
    "weekly": false,
    "protein": true,
    "family": false,
    "quick": true,
    "tags": [
      "Drinks",
      "Everyday",
      "Quick"
    ],
    "origin": "Vermont",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for drinks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-56",
    "name": "Fresh Granola 56",
    "category": "produce",
    "subtitle": "Produce favorite for fast weekly planning",
    "brand": "Florida Pantry Co.",
    "price": 4.19,
    "unit": "per pack",
    "rating": 4.8,
    "reviews": 982,
    "stock": 8,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": true,
    "tags": [
      "Produce",
      "Everyday",
      "Family"
    ],
    "origin": "Georgia",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for produce baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-57",
    "name": "Daily Juice 57",
    "category": "bakery",
    "subtitle": "Bakery favorite for fast weekly planning",
    "brand": "Washington Pantry Co.",
    "price": 5.04,
    "unit": "per lb",
    "rating": 4.1,
    "reviews": 999,
    "stock": 13,
    "organic": true,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Bakery",
      "Organic",
      "Quick"
    ],
    "origin": "California",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for bakery baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-58",
    "name": "Crisp Apples 58",
    "category": "dairy",
    "subtitle": "Dairy favorite for fast weekly planning",
    "brand": "Vermont Pantry Co.",
    "price": 5.89,
    "unit": "each",
    "rating": 4.4,
    "reviews": 1016,
    "stock": 18,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Dairy",
      "Everyday",
      "Quick"
    ],
    "origin": "Oregon",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for dairy baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-59",
    "name": "Velvet Cheese 59",
    "category": "meat",
    "subtitle": "Meat favorite for fast weekly planning",
    "brand": "Georgia Pantry Co.",
    "price": 6.74,
    "unit": "per box",
    "rating": 4.7,
    "reviews": 1033,
    "stock": 23,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Meat",
      "Everyday",
      "Quick"
    ],
    "origin": "Idaho",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for meat baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-60",
    "name": "Sunny Tomatoes 60",
    "category": "frozen",
    "subtitle": "Frozen favorite for fast weekly planning",
    "brand": "California Pantry Co.",
    "price": 7.59,
    "unit": "per pack",
    "rating": 4,
    "reviews": 1050,
    "stock": 28,
    "organic": true,
    "weekly": true,
    "protein": true,
    "family": true,
    "quick": false,
    "tags": [
      "Frozen",
      "Organic",
      "Family"
    ],
    "origin": "Arizona",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for frozen baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-61",
    "name": "Farm Baguette 61",
    "category": "pantry",
    "subtitle": "Pantry favorite for fast weekly planning",
    "brand": "Oregon Pantry Co.",
    "price": 8.44,
    "unit": "per lb",
    "rating": 4.3,
    "reviews": 1067,
    "stock": 33,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Pantry",
      "Everyday",
      "Quick"
    ],
    "origin": "Texas",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for pantry baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-62",
    "name": "Harvest Yogurt 62",
    "category": "snacks",
    "subtitle": "Snacks favorite for fast weekly planning",
    "brand": "Idaho Pantry Co.",
    "price": 9.29,
    "unit": "each",
    "rating": 4.6,
    "reviews": 1084,
    "stock": 38,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Snacks",
      "Everyday",
      "Quick"
    ],
    "origin": "Maine",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for snacks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-63",
    "name": "Golden Chicken 63",
    "category": "drinks",
    "subtitle": "Drinks favorite for fast weekly planning",
    "brand": "Arizona Pantry Co.",
    "price": 10.14,
    "unit": "per box",
    "rating": 4.9,
    "reviews": 1101,
    "stock": 43,
    "organic": true,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Drinks",
      "Organic",
      "Quick"
    ],
    "origin": "Florida",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for drinks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-64",
    "name": "Morning Dumplings 64",
    "category": "produce",
    "subtitle": "Produce favorite for fast weekly planning",
    "brand": "Texas Pantry Co.",
    "price": 10.99,
    "unit": "per pack",
    "rating": 4.2,
    "reviews": 1118,
    "stock": 48,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": true,
    "tags": [
      "Produce",
      "Everyday",
      "Family"
    ],
    "origin": "Washington",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for produce baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-65",
    "name": "River Pasta 65",
    "category": "bakery",
    "subtitle": "Bakery favorite for fast weekly planning",
    "brand": "Maine Pantry Co.",
    "price": 11.84,
    "unit": "per lb",
    "rating": 4.5,
    "reviews": 1135,
    "stock": 53,
    "organic": false,
    "weekly": false,
    "protein": true,
    "family": false,
    "quick": true,
    "tags": [
      "Bakery",
      "Everyday",
      "Quick"
    ],
    "origin": "Vermont",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for bakery baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-66",
    "name": "Fresh Granola 66",
    "category": "dairy",
    "subtitle": "Dairy favorite for fast weekly planning",
    "brand": "Florida Pantry Co.",
    "price": 12.69,
    "unit": "each",
    "rating": 4.8,
    "reviews": 1152,
    "stock": 58,
    "organic": true,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Dairy",
      "Organic",
      "Quick"
    ],
    "origin": "Georgia",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for dairy baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-67",
    "name": "Daily Juice 67",
    "category": "meat",
    "subtitle": "Meat favorite for fast weekly planning",
    "brand": "Washington Pantry Co.",
    "price": 13.54,
    "unit": "per box",
    "rating": 4.1,
    "reviews": 1169,
    "stock": 63,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Meat",
      "Everyday",
      "Quick"
    ],
    "origin": "California",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for meat baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-68",
    "name": "Crisp Apples 68",
    "category": "frozen",
    "subtitle": "Frozen favorite for fast weekly planning",
    "brand": "Vermont Pantry Co.",
    "price": 14.39,
    "unit": "per pack",
    "rating": 4.4,
    "reviews": 1186,
    "stock": 68,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": true,
    "tags": [
      "Frozen",
      "Everyday",
      "Family"
    ],
    "origin": "Oregon",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for frozen baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-69",
    "name": "Velvet Cheese 69",
    "category": "pantry",
    "subtitle": "Pantry favorite for fast weekly planning",
    "brand": "Georgia Pantry Co.",
    "price": 15.24,
    "unit": "per lb",
    "rating": 4.7,
    "reviews": 1203,
    "stock": 73,
    "organic": true,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Pantry",
      "Organic",
      "Quick"
    ],
    "origin": "Idaho",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for pantry baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-70",
    "name": "Sunny Tomatoes 70",
    "category": "snacks",
    "subtitle": "Snacks favorite for fast weekly planning",
    "brand": "California Pantry Co.",
    "price": 16.09,
    "unit": "each",
    "rating": 4,
    "reviews": 1220,
    "stock": 8,
    "organic": false,
    "weekly": true,
    "protein": true,
    "family": false,
    "quick": true,
    "tags": [
      "Snacks",
      "Everyday",
      "Quick"
    ],
    "origin": "Arizona",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for snacks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-71",
    "name": "Farm Baguette 71",
    "category": "drinks",
    "subtitle": "Drinks favorite for fast weekly planning",
    "brand": "Oregon Pantry Co.",
    "price": 16.94,
    "unit": "per box",
    "rating": 4.3,
    "reviews": 1237,
    "stock": 13,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Drinks",
      "Everyday",
      "Quick"
    ],
    "origin": "Texas",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for drinks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-72",
    "name": "Harvest Yogurt 72",
    "category": "produce",
    "subtitle": "Produce favorite for fast weekly planning",
    "brand": "Idaho Pantry Co.",
    "price": 2.49,
    "unit": "per pack",
    "rating": 4.6,
    "reviews": 1254,
    "stock": 18,
    "organic": true,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": false,
    "tags": [
      "Produce",
      "Organic",
      "Family"
    ],
    "origin": "Maine",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for produce baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-73",
    "name": "Golden Chicken 73",
    "category": "bakery",
    "subtitle": "Bakery favorite for fast weekly planning",
    "brand": "Arizona Pantry Co.",
    "price": 3.34,
    "unit": "per lb",
    "rating": 4.9,
    "reviews": 1271,
    "stock": 23,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Bakery",
      "Everyday",
      "Quick"
    ],
    "origin": "Florida",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for bakery baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-74",
    "name": "Morning Dumplings 74",
    "category": "dairy",
    "subtitle": "Dairy favorite for fast weekly planning",
    "brand": "Texas Pantry Co.",
    "price": 4.19,
    "unit": "each",
    "rating": 4.2,
    "reviews": 1288,
    "stock": 28,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Dairy",
      "Everyday",
      "Quick"
    ],
    "origin": "Washington",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for dairy baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-75",
    "name": "River Pasta 75",
    "category": "meat",
    "subtitle": "Meat favorite for fast weekly planning",
    "brand": "Maine Pantry Co.",
    "price": 5.04,
    "unit": "per box",
    "rating": 4.5,
    "reviews": 1305,
    "stock": 33,
    "organic": true,
    "weekly": false,
    "protein": true,
    "family": false,
    "quick": false,
    "tags": [
      "Meat",
      "Organic",
      "Quick"
    ],
    "origin": "Vermont",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for meat baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-76",
    "name": "Fresh Granola 76",
    "category": "frozen",
    "subtitle": "Frozen favorite for fast weekly planning",
    "brand": "Florida Pantry Co.",
    "price": 5.89,
    "unit": "per pack",
    "rating": 4.8,
    "reviews": 1322,
    "stock": 38,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": true,
    "tags": [
      "Frozen",
      "Everyday",
      "Family"
    ],
    "origin": "Georgia",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for frozen baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-77",
    "name": "Daily Juice 77",
    "category": "pantry",
    "subtitle": "Pantry favorite for fast weekly planning",
    "brand": "Washington Pantry Co.",
    "price": 6.74,
    "unit": "per lb",
    "rating": 4.1,
    "reviews": 1339,
    "stock": 43,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Pantry",
      "Everyday",
      "Quick"
    ],
    "origin": "California",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for pantry baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-78",
    "name": "Crisp Apples 78",
    "category": "snacks",
    "subtitle": "Snacks favorite for fast weekly planning",
    "brand": "Vermont Pantry Co.",
    "price": 7.59,
    "unit": "each",
    "rating": 4.4,
    "reviews": 1356,
    "stock": 48,
    "organic": true,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Snacks",
      "Organic",
      "Quick"
    ],
    "origin": "Oregon",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for snacks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-79",
    "name": "Velvet Cheese 79",
    "category": "drinks",
    "subtitle": "Drinks favorite for fast weekly planning",
    "brand": "Georgia Pantry Co.",
    "price": 8.44,
    "unit": "per box",
    "rating": 4.7,
    "reviews": 1373,
    "stock": 53,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Drinks",
      "Everyday",
      "Quick"
    ],
    "origin": "Idaho",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for drinks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-80",
    "name": "Sunny Tomatoes 80",
    "category": "produce",
    "subtitle": "Produce favorite for fast weekly planning",
    "brand": "California Pantry Co.",
    "price": 9.29,
    "unit": "per pack",
    "rating": 4,
    "reviews": 1390,
    "stock": 58,
    "organic": false,
    "weekly": true,
    "protein": true,
    "family": true,
    "quick": true,
    "tags": [
      "Produce",
      "Everyday",
      "Family"
    ],
    "origin": "Arizona",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for produce baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-81",
    "name": "Farm Baguette 81",
    "category": "bakery",
    "subtitle": "Bakery favorite for fast weekly planning",
    "brand": "Oregon Pantry Co.",
    "price": 10.14,
    "unit": "per lb",
    "rating": 4.3,
    "reviews": 1407,
    "stock": 63,
    "organic": true,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Bakery",
      "Organic",
      "Quick"
    ],
    "origin": "Texas",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for bakery baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-82",
    "name": "Harvest Yogurt 82",
    "category": "dairy",
    "subtitle": "Dairy favorite for fast weekly planning",
    "brand": "Idaho Pantry Co.",
    "price": 10.99,
    "unit": "each",
    "rating": 4.6,
    "reviews": 1424,
    "stock": 68,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Dairy",
      "Everyday",
      "Quick"
    ],
    "origin": "Maine",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for dairy baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-83",
    "name": "Golden Chicken 83",
    "category": "meat",
    "subtitle": "Meat favorite for fast weekly planning",
    "brand": "Arizona Pantry Co.",
    "price": 11.84,
    "unit": "per box",
    "rating": 4.9,
    "reviews": 1441,
    "stock": 73,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Meat",
      "Everyday",
      "Quick"
    ],
    "origin": "Florida",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for meat baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-84",
    "name": "Morning Dumplings 84",
    "category": "frozen",
    "subtitle": "Frozen favorite for fast weekly planning",
    "brand": "Texas Pantry Co.",
    "price": 12.69,
    "unit": "per pack",
    "rating": 4.2,
    "reviews": 1458,
    "stock": 8,
    "organic": true,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": false,
    "tags": [
      "Frozen",
      "Organic",
      "Family"
    ],
    "origin": "Washington",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for frozen baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-85",
    "name": "River Pasta 85",
    "category": "pantry",
    "subtitle": "Pantry favorite for fast weekly planning",
    "brand": "Maine Pantry Co.",
    "price": 13.54,
    "unit": "per lb",
    "rating": 4.5,
    "reviews": 1475,
    "stock": 13,
    "organic": false,
    "weekly": false,
    "protein": true,
    "family": false,
    "quick": true,
    "tags": [
      "Pantry",
      "Everyday",
      "Quick"
    ],
    "origin": "Vermont",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for pantry baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-86",
    "name": "Fresh Granola 86",
    "category": "snacks",
    "subtitle": "Snacks favorite for fast weekly planning",
    "brand": "Florida Pantry Co.",
    "price": 14.39,
    "unit": "each",
    "rating": 4.8,
    "reviews": 1492,
    "stock": 18,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Snacks",
      "Everyday",
      "Quick"
    ],
    "origin": "Georgia",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for snacks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-87",
    "name": "Daily Juice 87",
    "category": "drinks",
    "subtitle": "Drinks favorite for fast weekly planning",
    "brand": "Washington Pantry Co.",
    "price": 15.24,
    "unit": "per box",
    "rating": 4.1,
    "reviews": 1509,
    "stock": 23,
    "organic": true,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Drinks",
      "Organic",
      "Quick"
    ],
    "origin": "California",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for drinks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-88",
    "name": "Crisp Apples 88",
    "category": "produce",
    "subtitle": "Produce favorite for fast weekly planning",
    "brand": "Vermont Pantry Co.",
    "price": 16.09,
    "unit": "per pack",
    "rating": 4.4,
    "reviews": 1526,
    "stock": 28,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": true,
    "tags": [
      "Produce",
      "Everyday",
      "Family"
    ],
    "origin": "Oregon",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for produce baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-89",
    "name": "Velvet Cheese 89",
    "category": "bakery",
    "subtitle": "Bakery favorite for fast weekly planning",
    "brand": "Georgia Pantry Co.",
    "price": 16.94,
    "unit": "per lb",
    "rating": 4.7,
    "reviews": 1543,
    "stock": 33,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Bakery",
      "Everyday",
      "Quick"
    ],
    "origin": "Idaho",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for bakery baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-90",
    "name": "Sunny Tomatoes 90",
    "category": "dairy",
    "subtitle": "Dairy favorite for fast weekly planning",
    "brand": "California Pantry Co.",
    "price": 2.49,
    "unit": "each",
    "rating": 4,
    "reviews": 1560,
    "stock": 38,
    "organic": true,
    "weekly": true,
    "protein": true,
    "family": false,
    "quick": false,
    "tags": [
      "Dairy",
      "Organic",
      "Quick"
    ],
    "origin": "Arizona",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for dairy baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-91",
    "name": "Farm Baguette 91",
    "category": "meat",
    "subtitle": "Meat favorite for fast weekly planning",
    "brand": "Oregon Pantry Co.",
    "price": 3.34,
    "unit": "per box",
    "rating": 4.3,
    "reviews": 1577,
    "stock": 43,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Meat",
      "Everyday",
      "Quick"
    ],
    "origin": "Texas",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for meat baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-92",
    "name": "Harvest Yogurt 92",
    "category": "frozen",
    "subtitle": "Frozen favorite for fast weekly planning",
    "brand": "Idaho Pantry Co.",
    "price": 4.19,
    "unit": "per pack",
    "rating": 4.6,
    "reviews": 1594,
    "stock": 48,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": true,
    "tags": [
      "Frozen",
      "Everyday",
      "Family"
    ],
    "origin": "Maine",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for frozen baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-93",
    "name": "Golden Chicken 93",
    "category": "pantry",
    "subtitle": "Pantry favorite for fast weekly planning",
    "brand": "Arizona Pantry Co.",
    "price": 5.04,
    "unit": "per lb",
    "rating": 4.9,
    "reviews": 1611,
    "stock": 53,
    "organic": true,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Pantry",
      "Organic",
      "Quick"
    ],
    "origin": "Florida",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for pantry baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-94",
    "name": "Morning Dumplings 94",
    "category": "snacks",
    "subtitle": "Snacks favorite for fast weekly planning",
    "brand": "Texas Pantry Co.",
    "price": 5.89,
    "unit": "each",
    "rating": 4.2,
    "reviews": 1628,
    "stock": 58,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Snacks",
      "Everyday",
      "Quick"
    ],
    "origin": "Washington",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for snacks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-95",
    "name": "River Pasta 95",
    "category": "drinks",
    "subtitle": "Drinks favorite for fast weekly planning",
    "brand": "Maine Pantry Co.",
    "price": 6.74,
    "unit": "per box",
    "rating": 4.5,
    "reviews": 1645,
    "stock": 63,
    "organic": false,
    "weekly": false,
    "protein": true,
    "family": false,
    "quick": true,
    "tags": [
      "Drinks",
      "Everyday",
      "Quick"
    ],
    "origin": "Vermont",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for drinks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-96",
    "name": "Fresh Granola 96",
    "category": "produce",
    "subtitle": "Produce favorite for fast weekly planning",
    "brand": "Florida Pantry Co.",
    "price": 7.59,
    "unit": "per pack",
    "rating": 4.8,
    "reviews": 1662,
    "stock": 68,
    "organic": true,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": false,
    "tags": [
      "Produce",
      "Organic",
      "Family"
    ],
    "origin": "Georgia",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for produce baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-97",
    "name": "Daily Juice 97",
    "category": "bakery",
    "subtitle": "Bakery favorite for fast weekly planning",
    "brand": "Washington Pantry Co.",
    "price": 8.44,
    "unit": "per lb",
    "rating": 4.1,
    "reviews": 1679,
    "stock": 73,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Bakery",
      "Everyday",
      "Quick"
    ],
    "origin": "California",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for bakery baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-98",
    "name": "Crisp Apples 98",
    "category": "dairy",
    "subtitle": "Dairy favorite for fast weekly planning",
    "brand": "Vermont Pantry Co.",
    "price": 9.29,
    "unit": "each",
    "rating": 4.4,
    "reviews": 1696,
    "stock": 8,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Dairy",
      "Everyday",
      "Quick"
    ],
    "origin": "Oregon",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for dairy baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-99",
    "name": "Velvet Cheese 99",
    "category": "meat",
    "subtitle": "Meat favorite for fast weekly planning",
    "brand": "Georgia Pantry Co.",
    "price": 10.14,
    "unit": "per box",
    "rating": 4.7,
    "reviews": 1713,
    "stock": 13,
    "organic": true,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Meat",
      "Organic",
      "Quick"
    ],
    "origin": "Idaho",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for meat baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-100",
    "name": "Sunny Tomatoes 100",
    "category": "frozen",
    "subtitle": "Frozen favorite for fast weekly planning",
    "brand": "California Pantry Co.",
    "price": 10.99,
    "unit": "per pack",
    "rating": 4,
    "reviews": 1730,
    "stock": 18,
    "organic": false,
    "weekly": true,
    "protein": true,
    "family": true,
    "quick": true,
    "tags": [
      "Frozen",
      "Everyday",
      "Family"
    ],
    "origin": "Arizona",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for frozen baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-101",
    "name": "Farm Baguette 101",
    "category": "pantry",
    "subtitle": "Pantry favorite for fast weekly planning",
    "brand": "Oregon Pantry Co.",
    "price": 11.84,
    "unit": "per lb",
    "rating": 4.3,
    "reviews": 1747,
    "stock": 23,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Pantry",
      "Everyday",
      "Quick"
    ],
    "origin": "Texas",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for pantry baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-102",
    "name": "Harvest Yogurt 102",
    "category": "snacks",
    "subtitle": "Snacks favorite for fast weekly planning",
    "brand": "Idaho Pantry Co.",
    "price": 12.69,
    "unit": "each",
    "rating": 4.6,
    "reviews": 1764,
    "stock": 28,
    "organic": true,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Snacks",
      "Organic",
      "Quick"
    ],
    "origin": "Maine",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for snacks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-103",
    "name": "Golden Chicken 103",
    "category": "drinks",
    "subtitle": "Drinks favorite for fast weekly planning",
    "brand": "Arizona Pantry Co.",
    "price": 13.54,
    "unit": "per box",
    "rating": 4.9,
    "reviews": 1781,
    "stock": 33,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Drinks",
      "Everyday",
      "Quick"
    ],
    "origin": "Florida",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for drinks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-104",
    "name": "Morning Dumplings 104",
    "category": "produce",
    "subtitle": "Produce favorite for fast weekly planning",
    "brand": "Texas Pantry Co.",
    "price": 14.39,
    "unit": "per pack",
    "rating": 4.2,
    "reviews": 1798,
    "stock": 38,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": true,
    "tags": [
      "Produce",
      "Everyday",
      "Family"
    ],
    "origin": "Washington",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for produce baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-105",
    "name": "River Pasta 105",
    "category": "bakery",
    "subtitle": "Bakery favorite for fast weekly planning",
    "brand": "Maine Pantry Co.",
    "price": 15.24,
    "unit": "per lb",
    "rating": 4.5,
    "reviews": 1815,
    "stock": 43,
    "organic": true,
    "weekly": false,
    "protein": true,
    "family": false,
    "quick": false,
    "tags": [
      "Bakery",
      "Organic",
      "Quick"
    ],
    "origin": "Vermont",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for bakery baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-106",
    "name": "Fresh Granola 106",
    "category": "dairy",
    "subtitle": "Dairy favorite for fast weekly planning",
    "brand": "Florida Pantry Co.",
    "price": 16.09,
    "unit": "each",
    "rating": 4.8,
    "reviews": 1832,
    "stock": 48,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Dairy",
      "Everyday",
      "Quick"
    ],
    "origin": "Georgia",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for dairy baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-107",
    "name": "Daily Juice 107",
    "category": "meat",
    "subtitle": "Meat favorite for fast weekly planning",
    "brand": "Washington Pantry Co.",
    "price": 16.94,
    "unit": "per box",
    "rating": 4.1,
    "reviews": 1849,
    "stock": 53,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Meat",
      "Everyday",
      "Quick"
    ],
    "origin": "California",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for meat baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-108",
    "name": "Crisp Apples 108",
    "category": "frozen",
    "subtitle": "Frozen favorite for fast weekly planning",
    "brand": "Vermont Pantry Co.",
    "price": 2.49,
    "unit": "per pack",
    "rating": 4.4,
    "reviews": 1866,
    "stock": 58,
    "organic": true,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": false,
    "tags": [
      "Frozen",
      "Organic",
      "Family"
    ],
    "origin": "Oregon",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for frozen baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-109",
    "name": "Velvet Cheese 109",
    "category": "pantry",
    "subtitle": "Pantry favorite for fast weekly planning",
    "brand": "Georgia Pantry Co.",
    "price": 3.34,
    "unit": "per lb",
    "rating": 4.7,
    "reviews": 1883,
    "stock": 63,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Pantry",
      "Everyday",
      "Quick"
    ],
    "origin": "Idaho",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for pantry baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-110",
    "name": "Sunny Tomatoes 110",
    "category": "snacks",
    "subtitle": "Snacks favorite for fast weekly planning",
    "brand": "California Pantry Co.",
    "price": 4.19,
    "unit": "each",
    "rating": 4,
    "reviews": 1900,
    "stock": 68,
    "organic": false,
    "weekly": true,
    "protein": true,
    "family": false,
    "quick": true,
    "tags": [
      "Snacks",
      "Everyday",
      "Quick"
    ],
    "origin": "Arizona",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for snacks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-111",
    "name": "Farm Baguette 111",
    "category": "drinks",
    "subtitle": "Drinks favorite for fast weekly planning",
    "brand": "Oregon Pantry Co.",
    "price": 5.04,
    "unit": "per box",
    "rating": 4.3,
    "reviews": 1917,
    "stock": 73,
    "organic": true,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Drinks",
      "Organic",
      "Quick"
    ],
    "origin": "Texas",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for drinks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-112",
    "name": "Harvest Yogurt 112",
    "category": "produce",
    "subtitle": "Produce favorite for fast weekly planning",
    "brand": "Idaho Pantry Co.",
    "price": 5.89,
    "unit": "per pack",
    "rating": 4.6,
    "reviews": 1934,
    "stock": 8,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": true,
    "tags": [
      "Produce",
      "Everyday",
      "Family"
    ],
    "origin": "Maine",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for produce baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-113",
    "name": "Golden Chicken 113",
    "category": "bakery",
    "subtitle": "Bakery favorite for fast weekly planning",
    "brand": "Arizona Pantry Co.",
    "price": 6.74,
    "unit": "per lb",
    "rating": 4.9,
    "reviews": 1951,
    "stock": 13,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Bakery",
      "Everyday",
      "Quick"
    ],
    "origin": "Florida",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for bakery baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-114",
    "name": "Morning Dumplings 114",
    "category": "dairy",
    "subtitle": "Dairy favorite for fast weekly planning",
    "brand": "Texas Pantry Co.",
    "price": 7.59,
    "unit": "each",
    "rating": 4.2,
    "reviews": 1968,
    "stock": 18,
    "organic": true,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Dairy",
      "Organic",
      "Quick"
    ],
    "origin": "Washington",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for dairy baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-115",
    "name": "River Pasta 115",
    "category": "meat",
    "subtitle": "Meat favorite for fast weekly planning",
    "brand": "Maine Pantry Co.",
    "price": 8.44,
    "unit": "per box",
    "rating": 4.5,
    "reviews": 1985,
    "stock": 23,
    "organic": false,
    "weekly": false,
    "protein": true,
    "family": false,
    "quick": true,
    "tags": [
      "Meat",
      "Everyday",
      "Quick"
    ],
    "origin": "Vermont",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for meat baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-116",
    "name": "Fresh Granola 116",
    "category": "frozen",
    "subtitle": "Frozen favorite for fast weekly planning",
    "brand": "Florida Pantry Co.",
    "price": 9.29,
    "unit": "per pack",
    "rating": 4.8,
    "reviews": 2002,
    "stock": 28,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": true,
    "tags": [
      "Frozen",
      "Everyday",
      "Family"
    ],
    "origin": "Georgia",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for frozen baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-117",
    "name": "Daily Juice 117",
    "category": "pantry",
    "subtitle": "Pantry favorite for fast weekly planning",
    "brand": "Washington Pantry Co.",
    "price": 10.14,
    "unit": "per lb",
    "rating": 4.1,
    "reviews": 2019,
    "stock": 33,
    "organic": true,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Pantry",
      "Organic",
      "Quick"
    ],
    "origin": "California",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for pantry baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-118",
    "name": "Crisp Apples 118",
    "category": "snacks",
    "subtitle": "Snacks favorite for fast weekly planning",
    "brand": "Vermont Pantry Co.",
    "price": 10.99,
    "unit": "each",
    "rating": 4.4,
    "reviews": 2036,
    "stock": 38,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Snacks",
      "Everyday",
      "Quick"
    ],
    "origin": "Oregon",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for snacks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-119",
    "name": "Velvet Cheese 119",
    "category": "drinks",
    "subtitle": "Drinks favorite for fast weekly planning",
    "brand": "Georgia Pantry Co.",
    "price": 11.84,
    "unit": "per box",
    "rating": 4.7,
    "reviews": 2053,
    "stock": 43,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Drinks",
      "Everyday",
      "Quick"
    ],
    "origin": "Idaho",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for drinks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-120",
    "name": "Sunny Tomatoes 120",
    "category": "produce",
    "subtitle": "Produce favorite for fast weekly planning",
    "brand": "California Pantry Co.",
    "price": 12.69,
    "unit": "per pack",
    "rating": 4,
    "reviews": 2070,
    "stock": 48,
    "organic": true,
    "weekly": true,
    "protein": true,
    "family": true,
    "quick": false,
    "tags": [
      "Produce",
      "Organic",
      "Family"
    ],
    "origin": "Arizona",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for produce baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-121",
    "name": "Farm Baguette 121",
    "category": "bakery",
    "subtitle": "Bakery favorite for fast weekly planning",
    "brand": "Oregon Pantry Co.",
    "price": 13.54,
    "unit": "per lb",
    "rating": 4.3,
    "reviews": 2087,
    "stock": 53,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Bakery",
      "Everyday",
      "Quick"
    ],
    "origin": "Texas",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for bakery baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-122",
    "name": "Harvest Yogurt 122",
    "category": "dairy",
    "subtitle": "Dairy favorite for fast weekly planning",
    "brand": "Idaho Pantry Co.",
    "price": 14.39,
    "unit": "each",
    "rating": 4.6,
    "reviews": 2104,
    "stock": 58,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Dairy",
      "Everyday",
      "Quick"
    ],
    "origin": "Maine",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for dairy baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-123",
    "name": "Golden Chicken 123",
    "category": "meat",
    "subtitle": "Meat favorite for fast weekly planning",
    "brand": "Arizona Pantry Co.",
    "price": 15.24,
    "unit": "per box",
    "rating": 4.9,
    "reviews": 2121,
    "stock": 63,
    "organic": true,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Meat",
      "Organic",
      "Quick"
    ],
    "origin": "Florida",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for meat baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-124",
    "name": "Morning Dumplings 124",
    "category": "frozen",
    "subtitle": "Frozen favorite for fast weekly planning",
    "brand": "Texas Pantry Co.",
    "price": 16.09,
    "unit": "per pack",
    "rating": 4.2,
    "reviews": 2138,
    "stock": 68,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": true,
    "tags": [
      "Frozen",
      "Everyday",
      "Family"
    ],
    "origin": "Washington",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for frozen baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-125",
    "name": "River Pasta 125",
    "category": "pantry",
    "subtitle": "Pantry favorite for fast weekly planning",
    "brand": "Maine Pantry Co.",
    "price": 16.94,
    "unit": "per lb",
    "rating": 4.5,
    "reviews": 2155,
    "stock": 73,
    "organic": false,
    "weekly": false,
    "protein": true,
    "family": false,
    "quick": true,
    "tags": [
      "Pantry",
      "Everyday",
      "Quick"
    ],
    "origin": "Vermont",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for pantry baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-126",
    "name": "Fresh Granola 126",
    "category": "snacks",
    "subtitle": "Snacks favorite for fast weekly planning",
    "brand": "Florida Pantry Co.",
    "price": 2.49,
    "unit": "each",
    "rating": 4.8,
    "reviews": 2172,
    "stock": 8,
    "organic": true,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Snacks",
      "Organic",
      "Quick"
    ],
    "origin": "Georgia",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for snacks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-127",
    "name": "Daily Juice 127",
    "category": "drinks",
    "subtitle": "Drinks favorite for fast weekly planning",
    "brand": "Washington Pantry Co.",
    "price": 3.34,
    "unit": "per box",
    "rating": 4.1,
    "reviews": 2189,
    "stock": 13,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Drinks",
      "Everyday",
      "Quick"
    ],
    "origin": "California",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for drinks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-128",
    "name": "Crisp Apples 128",
    "category": "produce",
    "subtitle": "Produce favorite for fast weekly planning",
    "brand": "Vermont Pantry Co.",
    "price": 4.19,
    "unit": "per pack",
    "rating": 4.4,
    "reviews": 2206,
    "stock": 18,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": true,
    "tags": [
      "Produce",
      "Everyday",
      "Family"
    ],
    "origin": "Oregon",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for produce baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-129",
    "name": "Velvet Cheese 129",
    "category": "bakery",
    "subtitle": "Bakery favorite for fast weekly planning",
    "brand": "Georgia Pantry Co.",
    "price": 5.04,
    "unit": "per lb",
    "rating": 4.7,
    "reviews": 2223,
    "stock": 23,
    "organic": true,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Bakery",
      "Organic",
      "Quick"
    ],
    "origin": "Idaho",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for bakery baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-130",
    "name": "Sunny Tomatoes 130",
    "category": "dairy",
    "subtitle": "Dairy favorite for fast weekly planning",
    "brand": "California Pantry Co.",
    "price": 5.89,
    "unit": "each",
    "rating": 4,
    "reviews": 2240,
    "stock": 28,
    "organic": false,
    "weekly": true,
    "protein": true,
    "family": false,
    "quick": true,
    "tags": [
      "Dairy",
      "Everyday",
      "Quick"
    ],
    "origin": "Arizona",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for dairy baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-131",
    "name": "Farm Baguette 131",
    "category": "meat",
    "subtitle": "Meat favorite for fast weekly planning",
    "brand": "Oregon Pantry Co.",
    "price": 6.74,
    "unit": "per box",
    "rating": 4.3,
    "reviews": 2257,
    "stock": 33,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Meat",
      "Everyday",
      "Quick"
    ],
    "origin": "Texas",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for meat baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-132",
    "name": "Harvest Yogurt 132",
    "category": "frozen",
    "subtitle": "Frozen favorite for fast weekly planning",
    "brand": "Idaho Pantry Co.",
    "price": 7.59,
    "unit": "per pack",
    "rating": 4.6,
    "reviews": 2274,
    "stock": 38,
    "organic": true,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": false,
    "tags": [
      "Frozen",
      "Organic",
      "Family"
    ],
    "origin": "Maine",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for frozen baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-133",
    "name": "Golden Chicken 133",
    "category": "pantry",
    "subtitle": "Pantry favorite for fast weekly planning",
    "brand": "Arizona Pantry Co.",
    "price": 8.44,
    "unit": "per lb",
    "rating": 4.9,
    "reviews": 2291,
    "stock": 43,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Pantry",
      "Everyday",
      "Quick"
    ],
    "origin": "Florida",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for pantry baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-134",
    "name": "Morning Dumplings 134",
    "category": "snacks",
    "subtitle": "Snacks favorite for fast weekly planning",
    "brand": "Texas Pantry Co.",
    "price": 9.29,
    "unit": "each",
    "rating": 4.2,
    "reviews": 2308,
    "stock": 48,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Snacks",
      "Everyday",
      "Quick"
    ],
    "origin": "Washington",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for snacks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-135",
    "name": "River Pasta 135",
    "category": "drinks",
    "subtitle": "Drinks favorite for fast weekly planning",
    "brand": "Maine Pantry Co.",
    "price": 10.14,
    "unit": "per box",
    "rating": 4.5,
    "reviews": 2325,
    "stock": 53,
    "organic": true,
    "weekly": false,
    "protein": true,
    "family": false,
    "quick": false,
    "tags": [
      "Drinks",
      "Organic",
      "Quick"
    ],
    "origin": "Vermont",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for drinks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-136",
    "name": "Fresh Granola 136",
    "category": "produce",
    "subtitle": "Produce favorite for fast weekly planning",
    "brand": "Florida Pantry Co.",
    "price": 10.99,
    "unit": "per pack",
    "rating": 4.8,
    "reviews": 2342,
    "stock": 58,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": true,
    "tags": [
      "Produce",
      "Everyday",
      "Family"
    ],
    "origin": "Georgia",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for produce baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-137",
    "name": "Daily Juice 137",
    "category": "bakery",
    "subtitle": "Bakery favorite for fast weekly planning",
    "brand": "Washington Pantry Co.",
    "price": 11.84,
    "unit": "per lb",
    "rating": 4.1,
    "reviews": 2359,
    "stock": 63,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Bakery",
      "Everyday",
      "Quick"
    ],
    "origin": "California",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for bakery baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-138",
    "name": "Crisp Apples 138",
    "category": "dairy",
    "subtitle": "Dairy favorite for fast weekly planning",
    "brand": "Vermont Pantry Co.",
    "price": 12.69,
    "unit": "each",
    "rating": 4.4,
    "reviews": 2376,
    "stock": 68,
    "organic": true,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Dairy",
      "Organic",
      "Quick"
    ],
    "origin": "Oregon",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for dairy baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-139",
    "name": "Velvet Cheese 139",
    "category": "meat",
    "subtitle": "Meat favorite for fast weekly planning",
    "brand": "Georgia Pantry Co.",
    "price": 13.54,
    "unit": "per box",
    "rating": 4.7,
    "reviews": 2393,
    "stock": 73,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Meat",
      "Everyday",
      "Quick"
    ],
    "origin": "Idaho",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for meat baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-140",
    "name": "Sunny Tomatoes 140",
    "category": "frozen",
    "subtitle": "Frozen favorite for fast weekly planning",
    "brand": "California Pantry Co.",
    "price": 14.39,
    "unit": "per pack",
    "rating": 4,
    "reviews": 2410,
    "stock": 8,
    "organic": false,
    "weekly": true,
    "protein": true,
    "family": true,
    "quick": true,
    "tags": [
      "Frozen",
      "Everyday",
      "Family"
    ],
    "origin": "Arizona",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for frozen baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-141",
    "name": "Farm Baguette 141",
    "category": "pantry",
    "subtitle": "Pantry favorite for fast weekly planning",
    "brand": "Oregon Pantry Co.",
    "price": 15.24,
    "unit": "per lb",
    "rating": 4.3,
    "reviews": 2427,
    "stock": 13,
    "organic": true,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Pantry",
      "Organic",
      "Quick"
    ],
    "origin": "Texas",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for pantry baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-142",
    "name": "Harvest Yogurt 142",
    "category": "snacks",
    "subtitle": "Snacks favorite for fast weekly planning",
    "brand": "Idaho Pantry Co.",
    "price": 16.09,
    "unit": "each",
    "rating": 4.6,
    "reviews": 2444,
    "stock": 18,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Snacks",
      "Everyday",
      "Quick"
    ],
    "origin": "Maine",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for snacks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-143",
    "name": "Golden Chicken 143",
    "category": "drinks",
    "subtitle": "Drinks favorite for fast weekly planning",
    "brand": "Arizona Pantry Co.",
    "price": 16.94,
    "unit": "per box",
    "rating": 4.9,
    "reviews": 2461,
    "stock": 23,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Drinks",
      "Everyday",
      "Quick"
    ],
    "origin": "Florida",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for drinks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-144",
    "name": "Morning Dumplings 144",
    "category": "produce",
    "subtitle": "Produce favorite for fast weekly planning",
    "brand": "Texas Pantry Co.",
    "price": 2.49,
    "unit": "per pack",
    "rating": 4.2,
    "reviews": 2478,
    "stock": 28,
    "organic": true,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": false,
    "tags": [
      "Produce",
      "Organic",
      "Family"
    ],
    "origin": "Washington",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for produce baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-145",
    "name": "River Pasta 145",
    "category": "bakery",
    "subtitle": "Bakery favorite for fast weekly planning",
    "brand": "Maine Pantry Co.",
    "price": 3.34,
    "unit": "per lb",
    "rating": 4.5,
    "reviews": 2495,
    "stock": 33,
    "organic": false,
    "weekly": false,
    "protein": true,
    "family": false,
    "quick": true,
    "tags": [
      "Bakery",
      "Everyday",
      "Quick"
    ],
    "origin": "Vermont",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for bakery baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-146",
    "name": "Fresh Granola 146",
    "category": "dairy",
    "subtitle": "Dairy favorite for fast weekly planning",
    "brand": "Florida Pantry Co.",
    "price": 4.19,
    "unit": "each",
    "rating": 4.8,
    "reviews": 2512,
    "stock": 38,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Dairy",
      "Everyday",
      "Quick"
    ],
    "origin": "Georgia",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for dairy baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-147",
    "name": "Daily Juice 147",
    "category": "meat",
    "subtitle": "Meat favorite for fast weekly planning",
    "brand": "Washington Pantry Co.",
    "price": 5.04,
    "unit": "per box",
    "rating": 4.1,
    "reviews": 2529,
    "stock": 43,
    "organic": true,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Meat",
      "Organic",
      "Quick"
    ],
    "origin": "California",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for meat baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-148",
    "name": "Crisp Apples 148",
    "category": "frozen",
    "subtitle": "Frozen favorite for fast weekly planning",
    "brand": "Vermont Pantry Co.",
    "price": 5.89,
    "unit": "per pack",
    "rating": 4.4,
    "reviews": 2546,
    "stock": 48,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": true,
    "tags": [
      "Frozen",
      "Everyday",
      "Family"
    ],
    "origin": "Oregon",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for frozen baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-149",
    "name": "Velvet Cheese 149",
    "category": "pantry",
    "subtitle": "Pantry favorite for fast weekly planning",
    "brand": "Georgia Pantry Co.",
    "price": 6.74,
    "unit": "per lb",
    "rating": 4.7,
    "reviews": 2563,
    "stock": 53,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Pantry",
      "Everyday",
      "Quick"
    ],
    "origin": "Idaho",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for pantry baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-150",
    "name": "Sunny Tomatoes 150",
    "category": "snacks",
    "subtitle": "Snacks favorite for fast weekly planning",
    "brand": "California Pantry Co.",
    "price": 7.59,
    "unit": "each",
    "rating": 4,
    "reviews": 2580,
    "stock": 58,
    "organic": true,
    "weekly": true,
    "protein": true,
    "family": false,
    "quick": false,
    "tags": [
      "Snacks",
      "Organic",
      "Quick"
    ],
    "origin": "Arizona",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for snacks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-151",
    "name": "Farm Baguette 151",
    "category": "drinks",
    "subtitle": "Drinks favorite for fast weekly planning",
    "brand": "Oregon Pantry Co.",
    "price": 8.44,
    "unit": "per box",
    "rating": 4.3,
    "reviews": 2597,
    "stock": 63,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Drinks",
      "Everyday",
      "Quick"
    ],
    "origin": "Texas",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for drinks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-152",
    "name": "Harvest Yogurt 152",
    "category": "produce",
    "subtitle": "Produce favorite for fast weekly planning",
    "brand": "Idaho Pantry Co.",
    "price": 9.29,
    "unit": "per pack",
    "rating": 4.6,
    "reviews": 2614,
    "stock": 68,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": true,
    "tags": [
      "Produce",
      "Everyday",
      "Family"
    ],
    "origin": "Maine",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for produce baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-153",
    "name": "Golden Chicken 153",
    "category": "bakery",
    "subtitle": "Bakery favorite for fast weekly planning",
    "brand": "Arizona Pantry Co.",
    "price": 10.14,
    "unit": "per lb",
    "rating": 4.9,
    "reviews": 2631,
    "stock": 73,
    "organic": true,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Bakery",
      "Organic",
      "Quick"
    ],
    "origin": "Florida",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for bakery baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-154",
    "name": "Morning Dumplings 154",
    "category": "dairy",
    "subtitle": "Dairy favorite for fast weekly planning",
    "brand": "Texas Pantry Co.",
    "price": 10.99,
    "unit": "each",
    "rating": 4.2,
    "reviews": 2648,
    "stock": 8,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Dairy",
      "Everyday",
      "Quick"
    ],
    "origin": "Washington",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for dairy baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-155",
    "name": "River Pasta 155",
    "category": "meat",
    "subtitle": "Meat favorite for fast weekly planning",
    "brand": "Maine Pantry Co.",
    "price": 11.84,
    "unit": "per box",
    "rating": 4.5,
    "reviews": 2665,
    "stock": 13,
    "organic": false,
    "weekly": false,
    "protein": true,
    "family": false,
    "quick": true,
    "tags": [
      "Meat",
      "Everyday",
      "Quick"
    ],
    "origin": "Vermont",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for meat baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-156",
    "name": "Fresh Granola 156",
    "category": "frozen",
    "subtitle": "Frozen favorite for fast weekly planning",
    "brand": "Florida Pantry Co.",
    "price": 12.69,
    "unit": "per pack",
    "rating": 4.8,
    "reviews": 2682,
    "stock": 18,
    "organic": true,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": false,
    "tags": [
      "Frozen",
      "Organic",
      "Family"
    ],
    "origin": "Georgia",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for frozen baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-157",
    "name": "Daily Juice 157",
    "category": "pantry",
    "subtitle": "Pantry favorite for fast weekly planning",
    "brand": "Washington Pantry Co.",
    "price": 13.54,
    "unit": "per lb",
    "rating": 4.1,
    "reviews": 2699,
    "stock": 23,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Pantry",
      "Everyday",
      "Quick"
    ],
    "origin": "California",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for pantry baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-158",
    "name": "Crisp Apples 158",
    "category": "snacks",
    "subtitle": "Snacks favorite for fast weekly planning",
    "brand": "Vermont Pantry Co.",
    "price": 14.39,
    "unit": "each",
    "rating": 4.4,
    "reviews": 2716,
    "stock": 28,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Snacks",
      "Everyday",
      "Quick"
    ],
    "origin": "Oregon",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for snacks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-159",
    "name": "Velvet Cheese 159",
    "category": "drinks",
    "subtitle": "Drinks favorite for fast weekly planning",
    "brand": "Georgia Pantry Co.",
    "price": 15.24,
    "unit": "per box",
    "rating": 4.7,
    "reviews": 2733,
    "stock": 33,
    "organic": true,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Drinks",
      "Organic",
      "Quick"
    ],
    "origin": "Idaho",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for drinks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-160",
    "name": "Sunny Tomatoes 160",
    "category": "produce",
    "subtitle": "Produce favorite for fast weekly planning",
    "brand": "California Pantry Co.",
    "price": 16.09,
    "unit": "per pack",
    "rating": 4,
    "reviews": 2750,
    "stock": 38,
    "organic": false,
    "weekly": true,
    "protein": true,
    "family": true,
    "quick": true,
    "tags": [
      "Produce",
      "Everyday",
      "Family"
    ],
    "origin": "Arizona",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for produce baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-161",
    "name": "Farm Baguette 161",
    "category": "bakery",
    "subtitle": "Bakery favorite for fast weekly planning",
    "brand": "Oregon Pantry Co.",
    "price": 16.94,
    "unit": "per lb",
    "rating": 4.3,
    "reviews": 2767,
    "stock": 43,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Bakery",
      "Everyday",
      "Quick"
    ],
    "origin": "Texas",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for bakery baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-162",
    "name": "Harvest Yogurt 162",
    "category": "dairy",
    "subtitle": "Dairy favorite for fast weekly planning",
    "brand": "Idaho Pantry Co.",
    "price": 2.49,
    "unit": "each",
    "rating": 4.6,
    "reviews": 2784,
    "stock": 48,
    "organic": true,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Dairy",
      "Organic",
      "Quick"
    ],
    "origin": "Maine",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for dairy baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-163",
    "name": "Golden Chicken 163",
    "category": "meat",
    "subtitle": "Meat favorite for fast weekly planning",
    "brand": "Arizona Pantry Co.",
    "price": 3.34,
    "unit": "per box",
    "rating": 4.9,
    "reviews": 2801,
    "stock": 53,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Meat",
      "Everyday",
      "Quick"
    ],
    "origin": "Florida",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for meat baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-164",
    "name": "Morning Dumplings 164",
    "category": "frozen",
    "subtitle": "Frozen favorite for fast weekly planning",
    "brand": "Texas Pantry Co.",
    "price": 4.19,
    "unit": "per pack",
    "rating": 4.2,
    "reviews": 2818,
    "stock": 58,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": true,
    "tags": [
      "Frozen",
      "Everyday",
      "Family"
    ],
    "origin": "Washington",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for frozen baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-165",
    "name": "River Pasta 165",
    "category": "pantry",
    "subtitle": "Pantry favorite for fast weekly planning",
    "brand": "Maine Pantry Co.",
    "price": 5.04,
    "unit": "per lb",
    "rating": 4.5,
    "reviews": 2835,
    "stock": 63,
    "organic": true,
    "weekly": false,
    "protein": true,
    "family": false,
    "quick": false,
    "tags": [
      "Pantry",
      "Organic",
      "Quick"
    ],
    "origin": "Vermont",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for pantry baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-166",
    "name": "Fresh Granola 166",
    "category": "snacks",
    "subtitle": "Snacks favorite for fast weekly planning",
    "brand": "Florida Pantry Co.",
    "price": 5.89,
    "unit": "each",
    "rating": 4.8,
    "reviews": 2852,
    "stock": 68,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Snacks",
      "Everyday",
      "Quick"
    ],
    "origin": "Georgia",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for snacks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-167",
    "name": "Daily Juice 167",
    "category": "drinks",
    "subtitle": "Drinks favorite for fast weekly planning",
    "brand": "Washington Pantry Co.",
    "price": 6.74,
    "unit": "per box",
    "rating": 4.1,
    "reviews": 2869,
    "stock": 73,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Drinks",
      "Everyday",
      "Quick"
    ],
    "origin": "California",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for drinks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-168",
    "name": "Crisp Apples 168",
    "category": "produce",
    "subtitle": "Produce favorite for fast weekly planning",
    "brand": "Vermont Pantry Co.",
    "price": 7.59,
    "unit": "per pack",
    "rating": 4.4,
    "reviews": 2886,
    "stock": 8,
    "organic": true,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": false,
    "tags": [
      "Produce",
      "Organic",
      "Family"
    ],
    "origin": "Oregon",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for produce baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-169",
    "name": "Velvet Cheese 169",
    "category": "bakery",
    "subtitle": "Bakery favorite for fast weekly planning",
    "brand": "Georgia Pantry Co.",
    "price": 8.44,
    "unit": "per lb",
    "rating": 4.7,
    "reviews": 2903,
    "stock": 13,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Bakery",
      "Everyday",
      "Quick"
    ],
    "origin": "Idaho",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for bakery baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-170",
    "name": "Sunny Tomatoes 170",
    "category": "dairy",
    "subtitle": "Dairy favorite for fast weekly planning",
    "brand": "California Pantry Co.",
    "price": 9.29,
    "unit": "each",
    "rating": 4,
    "reviews": 2920,
    "stock": 18,
    "organic": false,
    "weekly": true,
    "protein": true,
    "family": false,
    "quick": true,
    "tags": [
      "Dairy",
      "Everyday",
      "Quick"
    ],
    "origin": "Arizona",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for dairy baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-171",
    "name": "Farm Baguette 171",
    "category": "meat",
    "subtitle": "Meat favorite for fast weekly planning",
    "brand": "Oregon Pantry Co.",
    "price": 10.14,
    "unit": "per box",
    "rating": 4.3,
    "reviews": 2937,
    "stock": 23,
    "organic": true,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Meat",
      "Organic",
      "Quick"
    ],
    "origin": "Texas",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for meat baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-172",
    "name": "Harvest Yogurt 172",
    "category": "frozen",
    "subtitle": "Frozen favorite for fast weekly planning",
    "brand": "Idaho Pantry Co.",
    "price": 10.99,
    "unit": "per pack",
    "rating": 4.6,
    "reviews": 2954,
    "stock": 28,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": true,
    "tags": [
      "Frozen",
      "Everyday",
      "Family"
    ],
    "origin": "Maine",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for frozen baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-173",
    "name": "Golden Chicken 173",
    "category": "pantry",
    "subtitle": "Pantry favorite for fast weekly planning",
    "brand": "Arizona Pantry Co.",
    "price": 11.84,
    "unit": "per lb",
    "rating": 4.9,
    "reviews": 2971,
    "stock": 33,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Pantry",
      "Everyday",
      "Quick"
    ],
    "origin": "Florida",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for pantry baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-174",
    "name": "Morning Dumplings 174",
    "category": "snacks",
    "subtitle": "Snacks favorite for fast weekly planning",
    "brand": "Texas Pantry Co.",
    "price": 12.69,
    "unit": "each",
    "rating": 4.2,
    "reviews": 2988,
    "stock": 38,
    "organic": true,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Snacks",
      "Organic",
      "Quick"
    ],
    "origin": "Washington",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for snacks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-175",
    "name": "River Pasta 175",
    "category": "drinks",
    "subtitle": "Drinks favorite for fast weekly planning",
    "brand": "Maine Pantry Co.",
    "price": 13.54,
    "unit": "per box",
    "rating": 4.5,
    "reviews": 3005,
    "stock": 43,
    "organic": false,
    "weekly": false,
    "protein": true,
    "family": false,
    "quick": true,
    "tags": [
      "Drinks",
      "Everyday",
      "Quick"
    ],
    "origin": "Vermont",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for drinks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-176",
    "name": "Fresh Granola 176",
    "category": "produce",
    "subtitle": "Produce favorite for fast weekly planning",
    "brand": "Florida Pantry Co.",
    "price": 14.39,
    "unit": "per pack",
    "rating": 4.8,
    "reviews": 3022,
    "stock": 48,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": true,
    "tags": [
      "Produce",
      "Everyday",
      "Family"
    ],
    "origin": "Georgia",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for produce baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-177",
    "name": "Daily Juice 177",
    "category": "bakery",
    "subtitle": "Bakery favorite for fast weekly planning",
    "brand": "Washington Pantry Co.",
    "price": 15.24,
    "unit": "per lb",
    "rating": 4.1,
    "reviews": 3039,
    "stock": 53,
    "organic": true,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Bakery",
      "Organic",
      "Quick"
    ],
    "origin": "California",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for bakery baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-178",
    "name": "Crisp Apples 178",
    "category": "dairy",
    "subtitle": "Dairy favorite for fast weekly planning",
    "brand": "Vermont Pantry Co.",
    "price": 16.09,
    "unit": "each",
    "rating": 4.4,
    "reviews": 3056,
    "stock": 58,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Dairy",
      "Everyday",
      "Quick"
    ],
    "origin": "Oregon",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for dairy baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-179",
    "name": "Velvet Cheese 179",
    "category": "meat",
    "subtitle": "Meat favorite for fast weekly planning",
    "brand": "Georgia Pantry Co.",
    "price": 16.94,
    "unit": "per box",
    "rating": 4.7,
    "reviews": 3073,
    "stock": 63,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Meat",
      "Everyday",
      "Quick"
    ],
    "origin": "Idaho",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for meat baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-180",
    "name": "Sunny Tomatoes 180",
    "category": "frozen",
    "subtitle": "Frozen favorite for fast weekly planning",
    "brand": "California Pantry Co.",
    "price": 2.49,
    "unit": "per pack",
    "rating": 4,
    "reviews": 3090,
    "stock": 68,
    "organic": true,
    "weekly": true,
    "protein": true,
    "family": true,
    "quick": false,
    "tags": [
      "Frozen",
      "Organic",
      "Family"
    ],
    "origin": "Arizona",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for frozen baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-181",
    "name": "Farm Baguette 181",
    "category": "pantry",
    "subtitle": "Pantry favorite for fast weekly planning",
    "brand": "Oregon Pantry Co.",
    "price": 3.34,
    "unit": "per lb",
    "rating": 4.3,
    "reviews": 3107,
    "stock": 73,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Pantry",
      "Everyday",
      "Quick"
    ],
    "origin": "Texas",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for pantry baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-182",
    "name": "Harvest Yogurt 182",
    "category": "snacks",
    "subtitle": "Snacks favorite for fast weekly planning",
    "brand": "Idaho Pantry Co.",
    "price": 4.19,
    "unit": "each",
    "rating": 4.6,
    "reviews": 3124,
    "stock": 8,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Snacks",
      "Everyday",
      "Quick"
    ],
    "origin": "Maine",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for snacks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-183",
    "name": "Golden Chicken 183",
    "category": "drinks",
    "subtitle": "Drinks favorite for fast weekly planning",
    "brand": "Arizona Pantry Co.",
    "price": 5.04,
    "unit": "per box",
    "rating": 4.9,
    "reviews": 3141,
    "stock": 13,
    "organic": true,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Drinks",
      "Organic",
      "Quick"
    ],
    "origin": "Florida",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for drinks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-184",
    "name": "Morning Dumplings 184",
    "category": "produce",
    "subtitle": "Produce favorite for fast weekly planning",
    "brand": "Texas Pantry Co.",
    "price": 5.89,
    "unit": "per pack",
    "rating": 4.2,
    "reviews": 3158,
    "stock": 18,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": true,
    "tags": [
      "Produce",
      "Everyday",
      "Family"
    ],
    "origin": "Washington",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for produce baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-185",
    "name": "River Pasta 185",
    "category": "bakery",
    "subtitle": "Bakery favorite for fast weekly planning",
    "brand": "Maine Pantry Co.",
    "price": 6.74,
    "unit": "per lb",
    "rating": 4.5,
    "reviews": 3175,
    "stock": 23,
    "organic": false,
    "weekly": false,
    "protein": true,
    "family": false,
    "quick": true,
    "tags": [
      "Bakery",
      "Everyday",
      "Quick"
    ],
    "origin": "Vermont",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for bakery baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-186",
    "name": "Fresh Granola 186",
    "category": "dairy",
    "subtitle": "Dairy favorite for fast weekly planning",
    "brand": "Florida Pantry Co.",
    "price": 7.59,
    "unit": "each",
    "rating": 4.8,
    "reviews": 3192,
    "stock": 28,
    "organic": true,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Dairy",
      "Organic",
      "Quick"
    ],
    "origin": "Georgia",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for dairy baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-187",
    "name": "Daily Juice 187",
    "category": "meat",
    "subtitle": "Meat favorite for fast weekly planning",
    "brand": "Washington Pantry Co.",
    "price": 8.44,
    "unit": "per box",
    "rating": 4.1,
    "reviews": 3209,
    "stock": 33,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Meat",
      "Everyday",
      "Quick"
    ],
    "origin": "California",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for meat baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-188",
    "name": "Crisp Apples 188",
    "category": "frozen",
    "subtitle": "Frozen favorite for fast weekly planning",
    "brand": "Vermont Pantry Co.",
    "price": 9.29,
    "unit": "per pack",
    "rating": 4.4,
    "reviews": 3226,
    "stock": 38,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": true,
    "tags": [
      "Frozen",
      "Everyday",
      "Family"
    ],
    "origin": "Oregon",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for frozen baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-189",
    "name": "Velvet Cheese 189",
    "category": "pantry",
    "subtitle": "Pantry favorite for fast weekly planning",
    "brand": "Georgia Pantry Co.",
    "price": 10.14,
    "unit": "per lb",
    "rating": 4.7,
    "reviews": 3243,
    "stock": 43,
    "organic": true,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Pantry",
      "Organic",
      "Quick"
    ],
    "origin": "Idaho",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for pantry baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-190",
    "name": "Sunny Tomatoes 190",
    "category": "snacks",
    "subtitle": "Snacks favorite for fast weekly planning",
    "brand": "California Pantry Co.",
    "price": 10.99,
    "unit": "each",
    "rating": 4,
    "reviews": 3260,
    "stock": 48,
    "organic": false,
    "weekly": true,
    "protein": true,
    "family": false,
    "quick": true,
    "tags": [
      "Snacks",
      "Everyday",
      "Quick"
    ],
    "origin": "Arizona",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for snacks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-191",
    "name": "Farm Baguette 191",
    "category": "drinks",
    "subtitle": "Drinks favorite for fast weekly planning",
    "brand": "Oregon Pantry Co.",
    "price": 11.84,
    "unit": "per box",
    "rating": 4.3,
    "reviews": 3277,
    "stock": 53,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Drinks",
      "Everyday",
      "Quick"
    ],
    "origin": "Texas",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for drinks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-192",
    "name": "Harvest Yogurt 192",
    "category": "produce",
    "subtitle": "Produce favorite for fast weekly planning",
    "brand": "Idaho Pantry Co.",
    "price": 12.69,
    "unit": "per pack",
    "rating": 4.6,
    "reviews": 3294,
    "stock": 58,
    "organic": true,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": false,
    "tags": [
      "Produce",
      "Organic",
      "Family"
    ],
    "origin": "Maine",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for produce baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-193",
    "name": "Golden Chicken 193",
    "category": "bakery",
    "subtitle": "Bakery favorite for fast weekly planning",
    "brand": "Arizona Pantry Co.",
    "price": 13.54,
    "unit": "per lb",
    "rating": 4.9,
    "reviews": 3311,
    "stock": 63,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Bakery",
      "Everyday",
      "Quick"
    ],
    "origin": "Florida",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for bakery baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-194",
    "name": "Morning Dumplings 194",
    "category": "dairy",
    "subtitle": "Dairy favorite for fast weekly planning",
    "brand": "Texas Pantry Co.",
    "price": 14.39,
    "unit": "each",
    "rating": 4.2,
    "reviews": 3328,
    "stock": 68,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Dairy",
      "Everyday",
      "Quick"
    ],
    "origin": "Washington",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for dairy baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-195",
    "name": "River Pasta 195",
    "category": "meat",
    "subtitle": "Meat favorite for fast weekly planning",
    "brand": "Maine Pantry Co.",
    "price": 15.24,
    "unit": "per box",
    "rating": 4.5,
    "reviews": 3345,
    "stock": 73,
    "organic": true,
    "weekly": false,
    "protein": true,
    "family": false,
    "quick": false,
    "tags": [
      "Meat",
      "Organic",
      "Quick"
    ],
    "origin": "Vermont",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for meat baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-196",
    "name": "Fresh Granola 196",
    "category": "frozen",
    "subtitle": "Frozen favorite for fast weekly planning",
    "brand": "Florida Pantry Co.",
    "price": 16.09,
    "unit": "per pack",
    "rating": 4.8,
    "reviews": 3362,
    "stock": 8,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": true,
    "tags": [
      "Frozen",
      "Everyday",
      "Family"
    ],
    "origin": "Georgia",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for frozen baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-197",
    "name": "Daily Juice 197",
    "category": "pantry",
    "subtitle": "Pantry favorite for fast weekly planning",
    "brand": "Washington Pantry Co.",
    "price": 16.94,
    "unit": "per lb",
    "rating": 4.1,
    "reviews": 3379,
    "stock": 13,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Pantry",
      "Everyday",
      "Quick"
    ],
    "origin": "California",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for pantry baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-198",
    "name": "Crisp Apples 198",
    "category": "snacks",
    "subtitle": "Snacks favorite for fast weekly planning",
    "brand": "Vermont Pantry Co.",
    "price": 2.49,
    "unit": "each",
    "rating": 4.4,
    "reviews": 3396,
    "stock": 18,
    "organic": true,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Snacks",
      "Organic",
      "Quick"
    ],
    "origin": "Oregon",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for snacks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-199",
    "name": "Velvet Cheese 199",
    "category": "drinks",
    "subtitle": "Drinks favorite for fast weekly planning",
    "brand": "Georgia Pantry Co.",
    "price": 3.34,
    "unit": "per box",
    "rating": 4.7,
    "reviews": 3413,
    "stock": 23,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Drinks",
      "Everyday",
      "Quick"
    ],
    "origin": "Idaho",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for drinks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-200",
    "name": "Sunny Tomatoes 200",
    "category": "produce",
    "subtitle": "Produce favorite for fast weekly planning",
    "brand": "California Pantry Co.",
    "price": 4.19,
    "unit": "per pack",
    "rating": 4,
    "reviews": 3430,
    "stock": 28,
    "organic": false,
    "weekly": true,
    "protein": true,
    "family": true,
    "quick": true,
    "tags": [
      "Produce",
      "Everyday",
      "Family"
    ],
    "origin": "Arizona",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for produce baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-201",
    "name": "Farm Baguette 201",
    "category": "bakery",
    "subtitle": "Bakery favorite for fast weekly planning",
    "brand": "Oregon Pantry Co.",
    "price": 5.04,
    "unit": "per lb",
    "rating": 4.3,
    "reviews": 3447,
    "stock": 33,
    "organic": true,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Bakery",
      "Organic",
      "Quick"
    ],
    "origin": "Texas",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for bakery baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-202",
    "name": "Harvest Yogurt 202",
    "category": "dairy",
    "subtitle": "Dairy favorite for fast weekly planning",
    "brand": "Idaho Pantry Co.",
    "price": 5.89,
    "unit": "each",
    "rating": 4.6,
    "reviews": 3464,
    "stock": 38,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Dairy",
      "Everyday",
      "Quick"
    ],
    "origin": "Maine",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for dairy baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-203",
    "name": "Golden Chicken 203",
    "category": "meat",
    "subtitle": "Meat favorite for fast weekly planning",
    "brand": "Arizona Pantry Co.",
    "price": 6.74,
    "unit": "per box",
    "rating": 4.9,
    "reviews": 3481,
    "stock": 43,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Meat",
      "Everyday",
      "Quick"
    ],
    "origin": "Florida",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for meat baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-204",
    "name": "Morning Dumplings 204",
    "category": "frozen",
    "subtitle": "Frozen favorite for fast weekly planning",
    "brand": "Texas Pantry Co.",
    "price": 7.59,
    "unit": "per pack",
    "rating": 4.2,
    "reviews": 3498,
    "stock": 48,
    "organic": true,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": false,
    "tags": [
      "Frozen",
      "Organic",
      "Family"
    ],
    "origin": "Washington",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for frozen baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-205",
    "name": "River Pasta 205",
    "category": "pantry",
    "subtitle": "Pantry favorite for fast weekly planning",
    "brand": "Maine Pantry Co.",
    "price": 8.44,
    "unit": "per lb",
    "rating": 4.5,
    "reviews": 3515,
    "stock": 53,
    "organic": false,
    "weekly": false,
    "protein": true,
    "family": false,
    "quick": true,
    "tags": [
      "Pantry",
      "Everyday",
      "Quick"
    ],
    "origin": "Vermont",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for pantry baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-206",
    "name": "Fresh Granola 206",
    "category": "snacks",
    "subtitle": "Snacks favorite for fast weekly planning",
    "brand": "Florida Pantry Co.",
    "price": 9.29,
    "unit": "each",
    "rating": 4.8,
    "reviews": 3532,
    "stock": 58,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Snacks",
      "Everyday",
      "Quick"
    ],
    "origin": "Georgia",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for snacks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-207",
    "name": "Daily Juice 207",
    "category": "drinks",
    "subtitle": "Drinks favorite for fast weekly planning",
    "brand": "Washington Pantry Co.",
    "price": 10.14,
    "unit": "per box",
    "rating": 4.1,
    "reviews": 3549,
    "stock": 63,
    "organic": true,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Drinks",
      "Organic",
      "Quick"
    ],
    "origin": "California",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for drinks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-208",
    "name": "Crisp Apples 208",
    "category": "produce",
    "subtitle": "Produce favorite for fast weekly planning",
    "brand": "Vermont Pantry Co.",
    "price": 10.99,
    "unit": "per pack",
    "rating": 4.4,
    "reviews": 3566,
    "stock": 68,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": true,
    "tags": [
      "Produce",
      "Everyday",
      "Family"
    ],
    "origin": "Oregon",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for produce baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-209",
    "name": "Velvet Cheese 209",
    "category": "bakery",
    "subtitle": "Bakery favorite for fast weekly planning",
    "brand": "Georgia Pantry Co.",
    "price": 11.84,
    "unit": "per lb",
    "rating": 4.7,
    "reviews": 3583,
    "stock": 73,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Bakery",
      "Everyday",
      "Quick"
    ],
    "origin": "Idaho",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for bakery baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-210",
    "name": "Sunny Tomatoes 210",
    "category": "dairy",
    "subtitle": "Dairy favorite for fast weekly planning",
    "brand": "California Pantry Co.",
    "price": 12.69,
    "unit": "each",
    "rating": 4,
    "reviews": 3600,
    "stock": 8,
    "organic": true,
    "weekly": true,
    "protein": true,
    "family": false,
    "quick": false,
    "tags": [
      "Dairy",
      "Organic",
      "Quick"
    ],
    "origin": "Arizona",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for dairy baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-211",
    "name": "Farm Baguette 211",
    "category": "meat",
    "subtitle": "Meat favorite for fast weekly planning",
    "brand": "Oregon Pantry Co.",
    "price": 13.54,
    "unit": "per box",
    "rating": 4.3,
    "reviews": 3617,
    "stock": 13,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Meat",
      "Everyday",
      "Quick"
    ],
    "origin": "Texas",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for meat baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-212",
    "name": "Harvest Yogurt 212",
    "category": "frozen",
    "subtitle": "Frozen favorite for fast weekly planning",
    "brand": "Idaho Pantry Co.",
    "price": 14.39,
    "unit": "per pack",
    "rating": 4.6,
    "reviews": 3634,
    "stock": 18,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": true,
    "tags": [
      "Frozen",
      "Everyday",
      "Family"
    ],
    "origin": "Maine",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for frozen baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-213",
    "name": "Golden Chicken 213",
    "category": "pantry",
    "subtitle": "Pantry favorite for fast weekly planning",
    "brand": "Arizona Pantry Co.",
    "price": 15.24,
    "unit": "per lb",
    "rating": 4.9,
    "reviews": 3651,
    "stock": 23,
    "organic": true,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Pantry",
      "Organic",
      "Quick"
    ],
    "origin": "Florida",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for pantry baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-214",
    "name": "Morning Dumplings 214",
    "category": "snacks",
    "subtitle": "Snacks favorite for fast weekly planning",
    "brand": "Texas Pantry Co.",
    "price": 16.09,
    "unit": "each",
    "rating": 4.2,
    "reviews": 3668,
    "stock": 28,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Snacks",
      "Everyday",
      "Quick"
    ],
    "origin": "Washington",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for snacks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-215",
    "name": "River Pasta 215",
    "category": "drinks",
    "subtitle": "Drinks favorite for fast weekly planning",
    "brand": "Maine Pantry Co.",
    "price": 16.94,
    "unit": "per box",
    "rating": 4.5,
    "reviews": 3685,
    "stock": 33,
    "organic": false,
    "weekly": false,
    "protein": true,
    "family": false,
    "quick": true,
    "tags": [
      "Drinks",
      "Everyday",
      "Quick"
    ],
    "origin": "Vermont",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for drinks baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-216",
    "name": "Fresh Granola 216",
    "category": "produce",
    "subtitle": "Produce favorite for fast weekly planning",
    "brand": "Florida Pantry Co.",
    "price": 2.49,
    "unit": "per pack",
    "rating": 4.8,
    "reviews": 3702,
    "stock": 38,
    "organic": true,
    "weekly": true,
    "protein": false,
    "family": true,
    "quick": false,
    "tags": [
      "Produce",
      "Organic",
      "Family"
    ],
    "origin": "Georgia",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for produce baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-217",
    "name": "Daily Juice 217",
    "category": "bakery",
    "subtitle": "Bakery favorite for fast weekly planning",
    "brand": "Washington Pantry Co.",
    "price": 3.34,
    "unit": "per lb",
    "rating": 4.1,
    "reviews": 3719,
    "stock": 43,
    "organic": false,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Bakery",
      "Everyday",
      "Quick"
    ],
    "origin": "California",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for bakery baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-218",
    "name": "Crisp Apples 218",
    "category": "dairy",
    "subtitle": "Dairy favorite for fast weekly planning",
    "brand": "Vermont Pantry Co.",
    "price": 4.19,
    "unit": "each",
    "rating": 4.4,
    "reviews": 3736,
    "stock": 48,
    "organic": false,
    "weekly": true,
    "protein": false,
    "family": false,
    "quick": true,
    "tags": [
      "Dairy",
      "Everyday",
      "Quick"
    ],
    "origin": "Oregon",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for dairy baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-219",
    "name": "Velvet Cheese 219",
    "category": "meat",
    "subtitle": "Meat favorite for fast weekly planning",
    "brand": "Georgia Pantry Co.",
    "price": 5.04,
    "unit": "per box",
    "rating": 4.7,
    "reviews": 3753,
    "stock": 53,
    "organic": true,
    "weekly": false,
    "protein": false,
    "family": false,
    "quick": false,
    "tags": [
      "Meat",
      "Organic",
      "Quick"
    ],
    "origin": "Idaho",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for meat baskets with strong repeat-purchase behavior."
  },
  {
    "id": "product-220",
    "name": "Sunny Tomatoes 220",
    "category": "frozen",
    "subtitle": "Frozen favorite for fast weekly planning",
    "brand": "California Pantry Co.",
    "price": 5.89,
    "unit": "per pack",
    "rating": 4,
    "reviews": 3770,
    "stock": 58,
    "organic": false,
    "weekly": true,
    "protein": true,
    "family": true,
    "quick": true,
    "tags": [
      "Frozen",
      "Everyday",
      "Family"
    ],
    "origin": "Arizona",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "description": "Balanced flavor, reliable shelf life, and a clean fit for frozen baskets with strong repeat-purchase behavior."
  }
]

const bundles: Bundle[] = [
  {
    "id": "bundle-1",
    "name": "Bakery Starter 1",
    "category": "bakery",
    "description": "A compact bakery assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "11%",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "productIds": [
      "product-1",
      "product-2",
      "product-3",
      "product-4",
      "product-5",
      "product-6"
    ]
  },
  {
    "id": "bundle-2",
    "name": "Dairy Starter 2",
    "category": "dairy",
    "description": "A compact dairy assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "12%",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "productIds": [
      "product-6",
      "product-7",
      "product-8",
      "product-9",
      "product-10",
      "product-11"
    ]
  },
  {
    "id": "bundle-3",
    "name": "Meat Starter 3",
    "category": "meat",
    "description": "A compact meat assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "13%",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "productIds": [
      "product-11",
      "product-12",
      "product-13",
      "product-14",
      "product-15",
      "product-16"
    ]
  },
  {
    "id": "bundle-4",
    "name": "Frozen Starter 4",
    "category": "frozen",
    "description": "A compact frozen assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "14%",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "productIds": [
      "product-16",
      "product-17",
      "product-18",
      "product-19",
      "product-20",
      "product-21"
    ]
  },
  {
    "id": "bundle-5",
    "name": "Pantry Starter 5",
    "category": "pantry",
    "description": "A compact pantry assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "15%",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "productIds": [
      "product-21",
      "product-22",
      "product-23",
      "product-24",
      "product-25",
      "product-26"
    ]
  },
  {
    "id": "bundle-6",
    "name": "Snacks Starter 6",
    "category": "snacks",
    "description": "A compact snacks assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "16%",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "productIds": [
      "product-26",
      "product-27",
      "product-28",
      "product-29",
      "product-30",
      "product-31"
    ]
  },
  {
    "id": "bundle-7",
    "name": "Drinks Starter 7",
    "category": "drinks",
    "description": "A compact drinks assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "17%",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "productIds": [
      "product-31",
      "product-32",
      "product-33",
      "product-34",
      "product-35",
      "product-36"
    ]
  },
  {
    "id": "bundle-8",
    "name": "Produce Starter 8",
    "category": "produce",
    "description": "A compact produce assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "18%",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "productIds": [
      "product-36",
      "product-37",
      "product-38",
      "product-39",
      "product-40",
      "product-41"
    ]
  },
  {
    "id": "bundle-9",
    "name": "Bakery Starter 9",
    "category": "bakery",
    "description": "A compact bakery assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "19%",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "productIds": [
      "product-41",
      "product-42",
      "product-43",
      "product-44",
      "product-45",
      "product-46"
    ]
  },
  {
    "id": "bundle-10",
    "name": "Dairy Starter 10",
    "category": "dairy",
    "description": "A compact dairy assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "20%",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "productIds": [
      "product-46",
      "product-47",
      "product-48",
      "product-49",
      "product-50",
      "product-51"
    ]
  },
  {
    "id": "bundle-11",
    "name": "Meat Starter 11",
    "category": "meat",
    "description": "A compact meat assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "21%",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "productIds": [
      "product-51",
      "product-52",
      "product-53",
      "product-54",
      "product-55",
      "product-56"
    ]
  },
  {
    "id": "bundle-12",
    "name": "Frozen Starter 12",
    "category": "frozen",
    "description": "A compact frozen assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "22%",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "productIds": [
      "product-56",
      "product-57",
      "product-58",
      "product-59",
      "product-60",
      "product-61"
    ]
  },
  {
    "id": "bundle-13",
    "name": "Pantry Starter 13",
    "category": "pantry",
    "description": "A compact pantry assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "23%",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "productIds": [
      "product-61",
      "product-62",
      "product-63",
      "product-64",
      "product-65",
      "product-66"
    ]
  },
  {
    "id": "bundle-14",
    "name": "Snacks Starter 14",
    "category": "snacks",
    "description": "A compact snacks assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "24%",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "productIds": [
      "product-66",
      "product-67",
      "product-68",
      "product-69",
      "product-70",
      "product-71"
    ]
  },
  {
    "id": "bundle-15",
    "name": "Drinks Starter 15",
    "category": "drinks",
    "description": "A compact drinks assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "25%",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "productIds": [
      "product-71",
      "product-72",
      "product-73",
      "product-74",
      "product-75",
      "product-76"
    ]
  },
  {
    "id": "bundle-16",
    "name": "Produce Starter 16",
    "category": "produce",
    "description": "A compact produce assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "26%",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "productIds": [
      "product-76",
      "product-77",
      "product-78",
      "product-79",
      "product-80",
      "product-81"
    ]
  },
  {
    "id": "bundle-17",
    "name": "Bakery Starter 17",
    "category": "bakery",
    "description": "A compact bakery assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "27%",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "productIds": [
      "product-81",
      "product-82",
      "product-83",
      "product-84",
      "product-85",
      "product-86"
    ]
  },
  {
    "id": "bundle-18",
    "name": "Dairy Starter 18",
    "category": "dairy",
    "description": "A compact dairy assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "28%",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "productIds": [
      "product-86",
      "product-87",
      "product-88",
      "product-89",
      "product-90",
      "product-91"
    ]
  },
  {
    "id": "bundle-19",
    "name": "Meat Starter 19",
    "category": "meat",
    "description": "A compact meat assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "29%",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "productIds": [
      "product-91",
      "product-92",
      "product-93",
      "product-94",
      "product-95",
      "product-96"
    ]
  },
  {
    "id": "bundle-20",
    "name": "Frozen Starter 20",
    "category": "frozen",
    "description": "A compact frozen assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "30%",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "productIds": [
      "product-96",
      "product-97",
      "product-98",
      "product-99",
      "product-100",
      "product-101"
    ]
  },
  {
    "id": "bundle-21",
    "name": "Pantry Starter 21",
    "category": "pantry",
    "description": "A compact pantry assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "31%",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "productIds": [
      "product-101",
      "product-102",
      "product-103",
      "product-104",
      "product-105",
      "product-106"
    ]
  },
  {
    "id": "bundle-22",
    "name": "Snacks Starter 22",
    "category": "snacks",
    "description": "A compact snacks assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "32%",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "productIds": [
      "product-106",
      "product-107",
      "product-108",
      "product-109",
      "product-110",
      "product-111"
    ]
  },
  {
    "id": "bundle-23",
    "name": "Drinks Starter 23",
    "category": "drinks",
    "description": "A compact drinks assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "33%",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "productIds": [
      "product-111",
      "product-112",
      "product-113",
      "product-114",
      "product-115",
      "product-116"
    ]
  },
  {
    "id": "bundle-24",
    "name": "Produce Starter 24",
    "category": "produce",
    "description": "A compact produce assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "34%",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "productIds": [
      "product-116",
      "product-117",
      "product-118",
      "product-119",
      "product-120",
      "product-121"
    ]
  },
  {
    "id": "bundle-25",
    "name": "Bakery Starter 25",
    "category": "bakery",
    "description": "A compact bakery assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "35%",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "productIds": [
      "product-121",
      "product-122",
      "product-123",
      "product-124",
      "product-125",
      "product-126"
    ]
  },
  {
    "id": "bundle-26",
    "name": "Dairy Starter 26",
    "category": "dairy",
    "description": "A compact dairy assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "36%",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "productIds": [
      "product-126",
      "product-127",
      "product-128",
      "product-129",
      "product-130",
      "product-131"
    ]
  },
  {
    "id": "bundle-27",
    "name": "Meat Starter 27",
    "category": "meat",
    "description": "A compact meat assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "37%",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "productIds": [
      "product-131",
      "product-132",
      "product-133",
      "product-134",
      "product-135",
      "product-136"
    ]
  },
  {
    "id": "bundle-28",
    "name": "Frozen Starter 28",
    "category": "frozen",
    "description": "A compact frozen assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "38%",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "productIds": [
      "product-136",
      "product-137",
      "product-138",
      "product-139",
      "product-140",
      "product-141"
    ]
  },
  {
    "id": "bundle-29",
    "name": "Pantry Starter 29",
    "category": "pantry",
    "description": "A compact pantry assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "39%",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "productIds": [
      "product-141",
      "product-142",
      "product-143",
      "product-144",
      "product-145",
      "product-146"
    ]
  },
  {
    "id": "bundle-30",
    "name": "Snacks Starter 30",
    "category": "snacks",
    "description": "A compact snacks assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "40%",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "productIds": [
      "product-146",
      "product-147",
      "product-148",
      "product-149",
      "product-150",
      "product-151"
    ]
  },
  {
    "id": "bundle-31",
    "name": "Drinks Starter 31",
    "category": "drinks",
    "description": "A compact drinks assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "41%",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "productIds": [
      "product-151",
      "product-152",
      "product-153",
      "product-154",
      "product-155",
      "product-156"
    ]
  },
  {
    "id": "bundle-32",
    "name": "Produce Starter 32",
    "category": "produce",
    "description": "A compact produce assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "42%",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "productIds": [
      "product-156",
      "product-157",
      "product-158",
      "product-159",
      "product-160",
      "product-161"
    ]
  },
  {
    "id": "bundle-33",
    "name": "Bakery Starter 33",
    "category": "bakery",
    "description": "A compact bakery assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "43%",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "productIds": [
      "product-161",
      "product-162",
      "product-163",
      "product-164",
      "product-165",
      "product-166"
    ]
  },
  {
    "id": "bundle-34",
    "name": "Dairy Starter 34",
    "category": "dairy",
    "description": "A compact dairy assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "44%",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "productIds": [
      "product-166",
      "product-167",
      "product-168",
      "product-169",
      "product-170",
      "product-171"
    ]
  },
  {
    "id": "bundle-35",
    "name": "Meat Starter 35",
    "category": "meat",
    "description": "A compact meat assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "45%",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "productIds": [
      "product-171",
      "product-172",
      "product-173",
      "product-174",
      "product-175",
      "product-176"
    ]
  },
  {
    "id": "bundle-36",
    "name": "Frozen Starter 36",
    "category": "frozen",
    "description": "A compact frozen assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "46%",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "productIds": [
      "product-176",
      "product-177",
      "product-178",
      "product-179",
      "product-180",
      "product-181"
    ]
  },
  {
    "id": "bundle-37",
    "name": "Pantry Starter 37",
    "category": "pantry",
    "description": "A compact pantry assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "47%",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "productIds": [
      "product-181",
      "product-182",
      "product-183",
      "product-184",
      "product-185",
      "product-186"
    ]
  },
  {
    "id": "bundle-38",
    "name": "Snacks Starter 38",
    "category": "snacks",
    "description": "A compact snacks assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "48%",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "productIds": [
      "product-186",
      "product-187",
      "product-188",
      "product-189",
      "product-190",
      "product-191"
    ]
  },
  {
    "id": "bundle-39",
    "name": "Drinks Starter 39",
    "category": "drinks",
    "description": "A compact drinks assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "49%",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "productIds": [
      "product-191",
      "product-192",
      "product-193",
      "product-194",
      "product-195",
      "product-196"
    ]
  },
  {
    "id": "bundle-40",
    "name": "Produce Starter 40",
    "category": "produce",
    "description": "A compact produce assortment built for weekday speed, better basket value, and fewer repeat trips.",
    "savings": "50%",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "productIds": [
      "product-196",
      "product-197",
      "product-198",
      "product-199",
      "product-200",
      "product-201"
    ]
  }
]

const recipes: Recipe[] = [
  {
    "id": "recipe-1",
    "title": "Farm Bowl 1",
    "time": "16 min",
    "difficulty": "Medium",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "ingredientIds": [
      "product-1",
      "product-2",
      "product-3",
      "product-4",
      "product-5"
    ]
  },
  {
    "id": "recipe-2",
    "title": "Harvest Bowl 2",
    "time": "17 min",
    "difficulty": "Quick",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "ingredientIds": [
      "product-8",
      "product-9",
      "product-10",
      "product-11",
      "product-12"
    ]
  },
  {
    "id": "recipe-3",
    "title": "Golden Bowl 3",
    "time": "18 min",
    "difficulty": "Easy",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "ingredientIds": [
      "product-15",
      "product-16",
      "product-17",
      "product-18",
      "product-19"
    ]
  },
  {
    "id": "recipe-4",
    "title": "Morning Bowl 4",
    "time": "19 min",
    "difficulty": "Medium",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "ingredientIds": [
      "product-22",
      "product-23",
      "product-24",
      "product-25",
      "product-26"
    ]
  },
  {
    "id": "recipe-5",
    "title": "River Bowl 5",
    "time": "20 min",
    "difficulty": "Quick",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "ingredientIds": [
      "product-29",
      "product-30",
      "product-31",
      "product-32",
      "product-33"
    ]
  },
  {
    "id": "recipe-6",
    "title": "Fresh Bowl 6",
    "time": "21 min",
    "difficulty": "Easy",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "ingredientIds": [
      "product-36",
      "product-37",
      "product-38",
      "product-39",
      "product-40"
    ]
  },
  {
    "id": "recipe-7",
    "title": "Daily Bowl 7",
    "time": "22 min",
    "difficulty": "Medium",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "ingredientIds": [
      "product-43",
      "product-44",
      "product-45",
      "product-46",
      "product-47"
    ]
  },
  {
    "id": "recipe-8",
    "title": "Crisp Bowl 8",
    "time": "23 min",
    "difficulty": "Quick",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "ingredientIds": [
      "product-50",
      "product-51",
      "product-52",
      "product-53",
      "product-54"
    ]
  },
  {
    "id": "recipe-9",
    "title": "Velvet Bowl 9",
    "time": "24 min",
    "difficulty": "Easy",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "ingredientIds": [
      "product-57",
      "product-58",
      "product-59",
      "product-60",
      "product-61"
    ]
  },
  {
    "id": "recipe-10",
    "title": "Sunny Bowl 10",
    "time": "25 min",
    "difficulty": "Medium",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "ingredientIds": [
      "product-64",
      "product-65",
      "product-66",
      "product-67",
      "product-68"
    ]
  },
  {
    "id": "recipe-11",
    "title": "Farm Bowl 11",
    "time": "26 min",
    "difficulty": "Quick",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "ingredientIds": [
      "product-71",
      "product-72",
      "product-73",
      "product-74",
      "product-75"
    ]
  },
  {
    "id": "recipe-12",
    "title": "Harvest Bowl 12",
    "time": "27 min",
    "difficulty": "Easy",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "ingredientIds": [
      "product-78",
      "product-79",
      "product-80",
      "product-81",
      "product-82"
    ]
  },
  {
    "id": "recipe-13",
    "title": "Golden Bowl 13",
    "time": "28 min",
    "difficulty": "Medium",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "ingredientIds": [
      "product-85",
      "product-86",
      "product-87",
      "product-88",
      "product-89"
    ]
  },
  {
    "id": "recipe-14",
    "title": "Morning Bowl 14",
    "time": "29 min",
    "difficulty": "Quick",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "ingredientIds": [
      "product-92",
      "product-93",
      "product-94",
      "product-95",
      "product-96"
    ]
  },
  {
    "id": "recipe-15",
    "title": "River Bowl 15",
    "time": "30 min",
    "difficulty": "Easy",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "ingredientIds": [
      "product-99",
      "product-100",
      "product-101",
      "product-102",
      "product-103"
    ]
  },
  {
    "id": "recipe-16",
    "title": "Fresh Bowl 16",
    "time": "31 min",
    "difficulty": "Medium",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "ingredientIds": [
      "product-106",
      "product-107",
      "product-108",
      "product-109",
      "product-110"
    ]
  },
  {
    "id": "recipe-17",
    "title": "Daily Bowl 17",
    "time": "32 min",
    "difficulty": "Quick",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "ingredientIds": [
      "product-113",
      "product-114",
      "product-115",
      "product-116",
      "product-117"
    ]
  },
  {
    "id": "recipe-18",
    "title": "Crisp Bowl 18",
    "time": "33 min",
    "difficulty": "Easy",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "ingredientIds": [
      "product-120",
      "product-121",
      "product-122",
      "product-123",
      "product-124"
    ]
  },
  {
    "id": "recipe-19",
    "title": "Velvet Bowl 19",
    "time": "34 min",
    "difficulty": "Medium",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "ingredientIds": [
      "product-127",
      "product-128",
      "product-129",
      "product-130",
      "product-131"
    ]
  },
  {
    "id": "recipe-20",
    "title": "Sunny Bowl 20",
    "time": "35 min",
    "difficulty": "Quick",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "ingredientIds": [
      "product-134",
      "product-135",
      "product-136",
      "product-137",
      "product-138"
    ]
  },
  {
    "id": "recipe-21",
    "title": "Farm Bowl 21",
    "time": "36 min",
    "difficulty": "Easy",
    "accent": "linear-gradient(135deg, #f59e0b 0%, #fb7185 45%, #22c55e 100%)",
    "ingredientIds": [
      "product-141",
      "product-142",
      "product-143",
      "product-144",
      "product-145"
    ]
  },
  {
    "id": "recipe-22",
    "title": "Harvest Bowl 22",
    "time": "37 min",
    "difficulty": "Medium",
    "accent": "linear-gradient(135deg, #22c55e 0%, #10b981 50%, #0f766e 100%)",
    "ingredientIds": [
      "product-148",
      "product-149",
      "product-150",
      "product-151",
      "product-152"
    ]
  },
  {
    "id": "recipe-23",
    "title": "Golden Bowl 23",
    "time": "38 min",
    "difficulty": "Quick",
    "accent": "linear-gradient(135deg, #84cc16 0%, #14b8a6 55%, #2563eb 100%)",
    "ingredientIds": [
      "product-155",
      "product-156",
      "product-157",
      "product-158",
      "product-159"
    ]
  },
  {
    "id": "recipe-24",
    "title": "Morning Bowl 24",
    "time": "39 min",
    "difficulty": "Easy",
    "accent": "linear-gradient(135deg, #f97316 0%, #ef4444 50%, #7c3aed 100%)",
    "ingredientIds": [
      "product-162",
      "product-163",
      "product-164",
      "product-165",
      "product-166"
    ]
  },
  {
    "id": "recipe-25",
    "title": "River Bowl 25",
    "time": "40 min",
    "difficulty": "Medium",
    "accent": "linear-gradient(135deg, #38bdf8 0%, #6366f1 45%, #f472b6 100%)",
    "ingredientIds": [
      "product-169",
      "product-170",
      "product-171",
      "product-172",
      "product-173"
    ]
  },
  {
    "id": "recipe-26",
    "title": "Fresh Bowl 26",
    "time": "41 min",
    "difficulty": "Quick",
    "accent": "linear-gradient(135deg, #fb7185 0%, #f43f5e 50%, #f59e0b 100%)",
    "ingredientIds": [
      "product-176",
      "product-177",
      "product-178",
      "product-179",
      "product-180"
    ]
  },
  {
    "id": "recipe-27",
    "title": "Daily Bowl 27",
    "time": "42 min",
    "difficulty": "Easy",
    "accent": "linear-gradient(135deg, #4ade80 0%, #22c55e 55%, #16a34a 100%)",
    "ingredientIds": [
      "product-183",
      "product-184",
      "product-185",
      "product-186",
      "product-187"
    ]
  },
  {
    "id": "recipe-28",
    "title": "Crisp Bowl 28",
    "time": "43 min",
    "difficulty": "Medium",
    "accent": "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #60a5fa 100%)",
    "ingredientIds": [
      "product-190",
      "product-191",
      "product-192",
      "product-193",
      "product-194"
    ]
  }
]

const deliverySlots: DeliverySlot[] = [
  {
    "id": "today",
    "label": "Express today",
    "window": "45-60 min",
    "fee": "$6.90"
  },
  {
    "id": "morning",
    "label": "Tomorrow morning",
    "window": "08:00-11:00",
    "fee": "$3.90"
  },
  {
    "id": "evening",
    "label": "Tomorrow evening",
    "window": "18:00-21:00",
    "fee": "$2.90"
  },
  {
    "id": "weekend",
    "label": "Weekend saver",
    "window": "Sat-Sun",
    "fee": "$1.90"
  }
]

const storeActivity: Activity[] = [
  {
    "id": "activity-1",
    "title": "Bakery aisle refreshed",
    "detail": "7 items updated with new promos, fresh arrival timing, and better stock certainty.",
    "time": "1h ago"
  },
  {
    "id": "activity-2",
    "title": "Dairy aisle refreshed",
    "detail": "8 items updated with new promos, fresh arrival timing, and better stock certainty.",
    "time": "2h ago"
  },
  {
    "id": "activity-3",
    "title": "Meat aisle refreshed",
    "detail": "9 items updated with new promos, fresh arrival timing, and better stock certainty.",
    "time": "3h ago"
  },
  {
    "id": "activity-4",
    "title": "Frozen aisle refreshed",
    "detail": "10 items updated with new promos, fresh arrival timing, and better stock certainty.",
    "time": "4h ago"
  },
  {
    "id": "activity-5",
    "title": "Pantry aisle refreshed",
    "detail": "11 items updated with new promos, fresh arrival timing, and better stock certainty.",
    "time": "5h ago"
  },
  {
    "id": "activity-6",
    "title": "Snacks aisle refreshed",
    "detail": "12 items updated with new promos, fresh arrival timing, and better stock certainty.",
    "time": "6h ago"
  },
  {
    "id": "activity-7",
    "title": "Drinks aisle refreshed",
    "detail": "13 items updated with new promos, fresh arrival timing, and better stock certainty.",
    "time": "7h ago"
  },
  {
    "id": "activity-8",
    "title": "Produce aisle refreshed",
    "detail": "6 items updated with new promos, fresh arrival timing, and better stock certainty.",
    "time": "8h ago"
  },
  {
    "id": "activity-9",
    "title": "Bakery aisle refreshed",
    "detail": "7 items updated with new promos, fresh arrival timing, and better stock certainty.",
    "time": "9h ago"
  },
  {
    "id": "activity-10",
    "title": "Dairy aisle refreshed",
    "detail": "8 items updated with new promos, fresh arrival timing, and better stock certainty.",
    "time": "10h ago"
  },
  {
    "id": "activity-11",
    "title": "Meat aisle refreshed",
    "detail": "9 items updated with new promos, fresh arrival timing, and better stock certainty.",
    "time": "11h ago"
  },
  {
    "id": "activity-12",
    "title": "Frozen aisle refreshed",
    "detail": "10 items updated with new promos, fresh arrival timing, and better stock certainty.",
    "time": "12h ago"
  },
  {
    "id": "activity-13",
    "title": "Pantry aisle refreshed",
    "detail": "11 items updated with new promos, fresh arrival timing, and better stock certainty.",
    "time": "13h ago"
  },
  {
    "id": "activity-14",
    "title": "Snacks aisle refreshed",
    "detail": "12 items updated with new promos, fresh arrival timing, and better stock certainty.",
    "time": "14h ago"
  },
  {
    "id": "activity-15",
    "title": "Drinks aisle refreshed",
    "detail": "13 items updated with new promos, fresh arrival timing, and better stock certainty.",
    "time": "15h ago"
  },
  {
    "id": "activity-16",
    "title": "Produce aisle refreshed",
    "detail": "6 items updated with new promos, fresh arrival timing, and better stock certainty.",
    "time": "16h ago"
  },
  {
    "id": "activity-17",
    "title": "Bakery aisle refreshed",
    "detail": "7 items updated with new promos, fresh arrival timing, and better stock certainty.",
    "time": "17h ago"
  },
  {
    "id": "activity-18",
    "title": "Dairy aisle refreshed",
    "detail": "8 items updated with new promos, fresh arrival timing, and better stock certainty.",
    "time": "18h ago"
  },
  {
    "id": "activity-19",
    "title": "Meat aisle refreshed",
    "detail": "9 items updated with new promos, fresh arrival timing, and better stock certainty.",
    "time": "19h ago"
  },
  {
    "id": "activity-20",
    "title": "Frozen aisle refreshed",
    "detail": "10 items updated with new promos, fresh arrival timing, and better stock certainty.",
    "time": "20h ago"
  },
  {
    "id": "activity-21",
    "title": "Pantry aisle refreshed",
    "detail": "11 items updated with new promos, fresh arrival timing, and better stock certainty.",
    "time": "21h ago"
  },
  {
    "id": "activity-22",
    "title": "Snacks aisle refreshed",
    "detail": "12 items updated with new promos, fresh arrival timing, and better stock certainty.",
    "time": "22h ago"
  },
  {
    "id": "activity-23",
    "title": "Drinks aisle refreshed",
    "detail": "13 items updated with new promos, fresh arrival timing, and better stock certainty.",
    "time": "23h ago"
  },
  {
    "id": "activity-24",
    "title": "Produce aisle refreshed",
    "detail": "6 items updated with new promos, fresh arrival timing, and better stock certainty.",
    "time": "24h ago"
  }
]

const merchandisingNotes = [
  "Bakery note 1: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Dairy note 2: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Meat note 3: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Frozen note 4: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Pantry note 5: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Snacks note 6: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Drinks note 7: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Produce note 8: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Bakery note 9: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Dairy note 10: strong margin, clear weekly utility, and repeat demand from California.",
  "Meat note 11: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Frozen note 12: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Pantry note 13: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Snacks note 14: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Drinks note 15: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Produce note 16: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Bakery note 17: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Dairy note 18: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Meat note 19: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Frozen note 20: strong margin, clear weekly utility, and repeat demand from California.",
  "Pantry note 21: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Snacks note 22: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Drinks note 23: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Produce note 24: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Bakery note 25: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Dairy note 26: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Meat note 27: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Frozen note 28: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Pantry note 29: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Snacks note 30: strong margin, clear weekly utility, and repeat demand from California.",
  "Drinks note 31: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Produce note 32: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Bakery note 33: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Dairy note 34: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Meat note 35: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Frozen note 36: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Pantry note 37: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Snacks note 38: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Drinks note 39: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Produce note 40: strong margin, clear weekly utility, and repeat demand from California.",
  "Bakery note 41: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Dairy note 42: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Meat note 43: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Frozen note 44: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Pantry note 45: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Snacks note 46: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Drinks note 47: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Produce note 48: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Bakery note 49: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Dairy note 50: strong margin, clear weekly utility, and repeat demand from California.",
  "Meat note 51: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Frozen note 52: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Pantry note 53: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Snacks note 54: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Drinks note 55: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Produce note 56: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Bakery note 57: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Dairy note 58: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Meat note 59: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Frozen note 60: strong margin, clear weekly utility, and repeat demand from California.",
  "Pantry note 61: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Snacks note 62: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Drinks note 63: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Produce note 64: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Bakery note 65: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Dairy note 66: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Meat note 67: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Frozen note 68: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Pantry note 69: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Snacks note 70: strong margin, clear weekly utility, and repeat demand from California.",
  "Drinks note 71: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Produce note 72: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Bakery note 73: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Dairy note 74: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Meat note 75: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Frozen note 76: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Pantry note 77: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Snacks note 78: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Drinks note 79: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Produce note 80: strong margin, clear weekly utility, and repeat demand from California.",
  "Bakery note 81: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Dairy note 82: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Meat note 83: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Frozen note 84: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Pantry note 85: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Snacks note 86: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Drinks note 87: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Produce note 88: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Bakery note 89: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Dairy note 90: strong margin, clear weekly utility, and repeat demand from California.",
  "Meat note 91: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Frozen note 92: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Pantry note 93: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Snacks note 94: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Drinks note 95: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Produce note 96: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Bakery note 97: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Dairy note 98: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Meat note 99: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Frozen note 100: strong margin, clear weekly utility, and repeat demand from California.",
  "Pantry note 101: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Snacks note 102: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Drinks note 103: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Produce note 104: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Bakery note 105: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Dairy note 106: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Meat note 107: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Frozen note 108: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Pantry note 109: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Snacks note 110: strong margin, clear weekly utility, and repeat demand from California.",
  "Drinks note 111: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Produce note 112: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Bakery note 113: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Dairy note 114: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Meat note 115: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Frozen note 116: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Pantry note 117: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Snacks note 118: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Drinks note 119: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Produce note 120: strong margin, clear weekly utility, and repeat demand from California.",
  "Bakery note 121: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Dairy note 122: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Meat note 123: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Frozen note 124: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Pantry note 125: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Snacks note 126: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Drinks note 127: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Produce note 128: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Bakery note 129: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Dairy note 130: strong margin, clear weekly utility, and repeat demand from California.",
  "Meat note 131: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Frozen note 132: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Pantry note 133: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Snacks note 134: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Drinks note 135: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Produce note 136: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Bakery note 137: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Dairy note 138: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Meat note 139: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Frozen note 140: strong margin, clear weekly utility, and repeat demand from California.",
  "Pantry note 141: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Snacks note 142: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Drinks note 143: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Produce note 144: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Bakery note 145: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Dairy note 146: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Meat note 147: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Frozen note 148: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Pantry note 149: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Snacks note 150: strong margin, clear weekly utility, and repeat demand from California.",
  "Drinks note 151: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Produce note 152: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Bakery note 153: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Dairy note 154: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Meat note 155: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Frozen note 156: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Pantry note 157: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Snacks note 158: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Drinks note 159: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Produce note 160: strong margin, clear weekly utility, and repeat demand from California.",
  "Bakery note 161: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Dairy note 162: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Meat note 163: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Frozen note 164: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Pantry note 165: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Snacks note 166: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Drinks note 167: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Produce note 168: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Bakery note 169: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Dairy note 170: strong margin, clear weekly utility, and repeat demand from California.",
  "Meat note 171: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Frozen note 172: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Pantry note 173: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Snacks note 174: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Drinks note 175: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Produce note 176: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Bakery note 177: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Dairy note 178: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Meat note 179: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Frozen note 180: strong margin, clear weekly utility, and repeat demand from California.",
  "Pantry note 181: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Snacks note 182: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Drinks note 183: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Produce note 184: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Bakery note 185: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Dairy note 186: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Meat note 187: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Frozen note 188: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Pantry note 189: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Snacks note 190: strong margin, clear weekly utility, and repeat demand from California.",
  "Drinks note 191: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Produce note 192: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Bakery note 193: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Dairy note 194: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Meat note 195: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Frozen note 196: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Pantry note 197: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Snacks note 198: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Drinks note 199: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Produce note 200: strong margin, clear weekly utility, and repeat demand from California.",
  "Bakery note 201: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Dairy note 202: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Meat note 203: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Frozen note 204: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Pantry note 205: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Snacks note 206: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Drinks note 207: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Produce note 208: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Bakery note 209: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Dairy note 210: strong margin, clear weekly utility, and repeat demand from California.",
  "Meat note 211: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Frozen note 212: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Pantry note 213: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Snacks note 214: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Drinks note 215: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Produce note 216: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Bakery note 217: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Dairy note 218: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Meat note 219: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Frozen note 220: strong margin, clear weekly utility, and repeat demand from California.",
  "Pantry note 221: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Snacks note 222: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Drinks note 223: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Produce note 224: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Bakery note 225: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Dairy note 226: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Meat note 227: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Frozen note 228: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Pantry note 229: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Snacks note 230: strong margin, clear weekly utility, and repeat demand from California.",
  "Drinks note 231: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Produce note 232: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Bakery note 233: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Dairy note 234: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Meat note 235: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Frozen note 236: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Pantry note 237: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Snacks note 238: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Drinks note 239: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Produce note 240: strong margin, clear weekly utility, and repeat demand from California.",
  "Bakery note 241: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Dairy note 242: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Meat note 243: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Frozen note 244: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Pantry note 245: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Snacks note 246: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Drinks note 247: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Produce note 248: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Bakery note 249: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Dairy note 250: strong margin, clear weekly utility, and repeat demand from California.",
  "Meat note 251: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Frozen note 252: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Pantry note 253: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Snacks note 254: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Drinks note 255: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Produce note 256: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Bakery note 257: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Dairy note 258: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Meat note 259: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Frozen note 260: strong margin, clear weekly utility, and repeat demand from California.",
  "Pantry note 261: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Snacks note 262: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Drinks note 263: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Produce note 264: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Bakery note 265: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Dairy note 266: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Meat note 267: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Frozen note 268: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Pantry note 269: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Snacks note 270: strong margin, clear weekly utility, and repeat demand from California.",
  "Drinks note 271: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Produce note 272: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Bakery note 273: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Dairy note 274: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Meat note 275: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Frozen note 276: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Pantry note 277: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Snacks note 278: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Drinks note 279: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Produce note 280: strong margin, clear weekly utility, and repeat demand from California.",
  "Bakery note 281: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Dairy note 282: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Meat note 283: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Frozen note 284: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Pantry note 285: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Snacks note 286: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Drinks note 287: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Produce note 288: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Bakery note 289: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Dairy note 290: strong margin, clear weekly utility, and repeat demand from California.",
  "Meat note 291: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Frozen note 292: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Pantry note 293: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Snacks note 294: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Drinks note 295: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Produce note 296: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Bakery note 297: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Dairy note 298: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Meat note 299: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Frozen note 300: strong margin, clear weekly utility, and repeat demand from California.",
  "Pantry note 301: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Snacks note 302: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Drinks note 303: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Produce note 304: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Bakery note 305: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Dairy note 306: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Meat note 307: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Frozen note 308: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Pantry note 309: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Snacks note 310: strong margin, clear weekly utility, and repeat demand from California.",
  "Drinks note 311: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Produce note 312: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Bakery note 313: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Dairy note 314: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Meat note 315: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Frozen note 316: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Pantry note 317: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Snacks note 318: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Drinks note 319: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Produce note 320: strong margin, clear weekly utility, and repeat demand from California.",
  "Bakery note 321: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Dairy note 322: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Meat note 323: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Frozen note 324: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Pantry note 325: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Snacks note 326: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Drinks note 327: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Produce note 328: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Bakery note 329: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Dairy note 330: strong margin, clear weekly utility, and repeat demand from California.",
  "Meat note 331: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Frozen note 332: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Pantry note 333: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Snacks note 334: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Drinks note 335: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Produce note 336: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Bakery note 337: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Dairy note 338: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Meat note 339: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Frozen note 340: strong margin, clear weekly utility, and repeat demand from California.",
  "Pantry note 341: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Snacks note 342: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Drinks note 343: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Produce note 344: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Bakery note 345: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Dairy note 346: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Meat note 347: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Frozen note 348: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Pantry note 349: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Snacks note 350: strong margin, clear weekly utility, and repeat demand from California.",
  "Drinks note 351: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Produce note 352: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Bakery note 353: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Dairy note 354: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Meat note 355: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Frozen note 356: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Pantry note 357: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Snacks note 358: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Drinks note 359: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Produce note 360: strong margin, clear weekly utility, and repeat demand from California.",
  "Bakery note 361: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Dairy note 362: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Meat note 363: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Frozen note 364: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Pantry note 365: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Snacks note 366: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Drinks note 367: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Produce note 368: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Bakery note 369: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Dairy note 370: strong margin, clear weekly utility, and repeat demand from California.",
  "Meat note 371: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Frozen note 372: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Pantry note 373: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Snacks note 374: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Drinks note 375: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Produce note 376: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Bakery note 377: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Dairy note 378: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Meat note 379: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Frozen note 380: strong margin, clear weekly utility, and repeat demand from California.",
  "Pantry note 381: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Snacks note 382: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Drinks note 383: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Produce note 384: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Bakery note 385: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Dairy note 386: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Meat note 387: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Frozen note 388: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Pantry note 389: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Snacks note 390: strong margin, clear weekly utility, and repeat demand from California.",
  "Drinks note 391: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Produce note 392: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Bakery note 393: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Dairy note 394: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Meat note 395: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Frozen note 396: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Pantry note 397: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Snacks note 398: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Drinks note 399: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Produce note 400: strong margin, clear weekly utility, and repeat demand from California.",
  "Bakery note 401: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Dairy note 402: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Meat note 403: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Frozen note 404: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Pantry note 405: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Snacks note 406: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Drinks note 407: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Produce note 408: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Bakery note 409: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Dairy note 410: strong margin, clear weekly utility, and repeat demand from California.",
  "Meat note 411: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Frozen note 412: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Pantry note 413: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Snacks note 414: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Drinks note 415: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Produce note 416: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Bakery note 417: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Dairy note 418: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Meat note 419: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Frozen note 420: strong margin, clear weekly utility, and repeat demand from California.",
  "Pantry note 421: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Snacks note 422: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Drinks note 423: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Produce note 424: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Bakery note 425: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Dairy note 426: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Meat note 427: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Frozen note 428: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Pantry note 429: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Snacks note 430: strong margin, clear weekly utility, and repeat demand from California.",
  "Drinks note 431: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Produce note 432: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Bakery note 433: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Dairy note 434: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Meat note 435: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Frozen note 436: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Pantry note 437: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Snacks note 438: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Drinks note 439: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Produce note 440: strong margin, clear weekly utility, and repeat demand from California.",
  "Bakery note 441: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Dairy note 442: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Meat note 443: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Frozen note 444: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Pantry note 445: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Snacks note 446: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Drinks note 447: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Produce note 448: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Bakery note 449: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Dairy note 450: strong margin, clear weekly utility, and repeat demand from California.",
  "Meat note 451: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Frozen note 452: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Pantry note 453: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Snacks note 454: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Drinks note 455: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Produce note 456: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Bakery note 457: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Dairy note 458: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Meat note 459: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Frozen note 460: strong margin, clear weekly utility, and repeat demand from California.",
  "Pantry note 461: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Snacks note 462: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Drinks note 463: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Produce note 464: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Bakery note 465: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Dairy note 466: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Meat note 467: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Frozen note 468: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Pantry note 469: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Snacks note 470: strong margin, clear weekly utility, and repeat demand from California.",
  "Drinks note 471: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Produce note 472: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Bakery note 473: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Dairy note 474: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Meat note 475: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Frozen note 476: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Pantry note 477: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Snacks note 478: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Drinks note 479: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Produce note 480: strong margin, clear weekly utility, and repeat demand from California.",
  "Bakery note 481: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Dairy note 482: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Meat note 483: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Frozen note 484: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Pantry note 485: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Snacks note 486: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Drinks note 487: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Produce note 488: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Bakery note 489: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Dairy note 490: strong margin, clear weekly utility, and repeat demand from California.",
  "Meat note 491: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Frozen note 492: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Pantry note 493: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Snacks note 494: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Drinks note 495: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Produce note 496: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Bakery note 497: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Dairy note 498: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Meat note 499: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Frozen note 500: strong margin, clear weekly utility, and repeat demand from California.",
  "Pantry note 501: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Snacks note 502: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Drinks note 503: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Produce note 504: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Bakery note 505: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Dairy note 506: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Meat note 507: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Frozen note 508: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Pantry note 509: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Snacks note 510: strong margin, clear weekly utility, and repeat demand from California.",
  "Drinks note 511: strong margin, clear weekly utility, and repeat demand from Oregon.",
  "Produce note 512: strong margin, clear weekly utility, and repeat demand from Idaho.",
  "Bakery note 513: strong margin, clear weekly utility, and repeat demand from Arizona.",
  "Dairy note 514: strong margin, clear weekly utility, and repeat demand from Texas.",
  "Meat note 515: strong margin, clear weekly utility, and repeat demand from Maine.",
  "Frozen note 516: strong margin, clear weekly utility, and repeat demand from Florida.",
  "Pantry note 517: strong margin, clear weekly utility, and repeat demand from Washington.",
  "Snacks note 518: strong margin, clear weekly utility, and repeat demand from Vermont.",
  "Drinks note 519: strong margin, clear weekly utility, and repeat demand from Georgia.",
  "Produce note 520: strong margin, clear weekly utility, and repeat demand from California."
] as const

const sections: Array<{ id: SectionId; label: string }> = [
  {
    "id": "market",
    "label": "Market"
  },
  {
    "id": "deals",
    "label": "Deals"
  },
  {
    "id": "planner",
    "label": "Meal planner"
  },
  {
    "id": "membership",
    "label": "Membership"
  }
]

const categoryTabs: Array<{ id: CategoryId; label: string }> = [
  {
    "id": "produce",
    "label": "Produce"
  },
  {
    "id": "bakery",
    "label": "Bakery"
  },
  {
    "id": "dairy",
    "label": "Dairy"
  },
  {
    "id": "meat",
    "label": "Meat"
  },
  {
    "id": "frozen",
    "label": "Frozen"
  },
  {
    "id": "pantry",
    "label": "Pantry"
  },
  {
    "id": "snacks",
    "label": "Snacks"
  },
  {
    "id": "drinks",
    "label": "Drinks"
  }
]

const filterTabs: Array<{ id: FilterId; label: string }> = [
  {
    "id": "all",
    "label": "All"
  },
  {
    "id": "organic",
    "label": "Organic"
  },
  {
    "id": "weekly",
    "label": "Weekly"
  },
  {
    "id": "protein",
    "label": "Protein"
  },
  {
    "id": "family",
    "label": "Family"
  },
  {
    "id": "quick",
    "label": "Quick"
  }
]

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const getProduct = (id: string) => products.find((product) => product.id === id) ?? products[0]

function App() {
  const searchId = useId()
  const [activeSection, setActiveSection] = useState<SectionId>('market')
  const [activeCategory, setActiveCategory] = useState<CategoryId>('produce')
  const [activeFilter, setActiveFilter] = useState<FilterId>('all')
  const [activeSlot, setActiveSlot] = useState<DeliverySlotId>('evening')
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [cart, setCart] = useState<Record<string, number>>(() => ({ "product-3": 2, "product-11": 1, "product-24": 3, "product-51": 1 }))
  const [favorite, setFavorite] = useState<Record<string, boolean>>(() => Object.fromEntries(products.map((product) => [product.id, product.weekly && product.organic])))
  const [featuredBundleId, setFeaturedBundleId] = useState(bundles[4].id)
  const [heroProductId, setHeroProductId] = useState(products[15].id)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroProductId((current) => {
        const index = products.findIndex((product) => product.id === current)
        return products[(index + 1 + products.length) % products.length].id
      })
    }, 6000)

    return () => window.clearInterval(timer)
  }, [])

  const visibleProducts = useMemo(() => {
    const term = deferredSearch.trim().toLowerCase()
    return products.filter((product) => {
      const matchesCategory = product.category === activeCategory
      const matchesFilter = activeFilter === 'all' || (activeFilter === 'organic' ? product.organic : activeFilter === 'weekly' ? product.weekly : activeFilter === 'protein' ? product.protein : activeFilter === 'family' ? product.family : product.quick)
      const matchesSearch = term.length === 0 || `${product.name} ${product.subtitle} ${product.brand} ${product.origin}`.toLowerCase().includes(term)
      return matchesCategory && matchesFilter && matchesSearch
    })
  }, [activeCategory, activeFilter, deferredSearch])

  const featuredBundle = useMemo(() => bundles.find((bundle) => bundle.id === featuredBundleId) ?? bundles[0], [featuredBundleId])
  const heroProduct = useMemo(() => getProduct(heroProductId), [heroProductId])

  const cartItems = useMemo(() => Object.entries(cart).filter(([, qty]) => qty > 0).map(([id, qty]) => ({ product: getProduct(id), qty })), [cart])

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.qty, 0)
    const itemCount = cartItems.reduce((sum, item) => sum + item.qty, 0)
    const savings = cartItems.reduce((sum, item) => sum + (item.product.weekly ? item.product.price * item.qty * 0.08 : 0), 0)
    const deliveryFee = Number(deliverySlots.find((slot) => slot.id === activeSlot)?.fee.replace("$", "") ?? 0)
    return { subtotal, itemCount, savings, deliveryFee, total: subtotal - savings + deliveryFee }
  }, [activeSlot, cartItems])

  const categorySpend = useMemo(() => {
    const sum = new Map<string, number>()
    cartItems.forEach(({ product, qty }) => {
      sum.set(product.category, (sum.get(product.category) ?? 0) + product.price * qty)
    })
    return [...sum.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)
  }, [cartItems])

  const toggleFavorite = (id: string) => {
    startTransition(() => {
      setFavorite((current) => ({ ...current, [id]: !current[id] }))
    })
  }

  const addToCart = (id: string, amount = 1) => {
    startTransition(() => {
      setCart((current) => ({ ...current, [id]: (current[id] ?? 0) + amount }))
    })
  }

  const updateCart = (id: string, delta: number) => {
    startTransition(() => {
      setCart((current) => ({ ...current, [id]: Math.max(0, (current[id] ?? 0) + delta) }))
    })
  }

  return (
    <>
      <style>{styles}</style>
      <div className="grocery-shell">
        <aside className="sidebar">
          <div className="brand-block">
            <div className="brand-mark" />
            <div>
              <p className="eyebrow">Single-file grocery app</p>
              <h1>grocery store</h1>
            </div>
          </div>
          <nav className="main-nav">
            {sections.map((section) => (
              <button
                key={section.id}
                className={section.id === activeSection ? "nav-pill active" : "nav-pill"}
                onClick={() => setActiveSection(section.id)}
                type="button"
              >
                {section.label}
              </button>
            ))}
          </nav>
          <section className="sidebar-card">
            <p className="section-kicker">Basket snapshot</p>
            <div className="metric-stack">
              <div><strong>{totals.itemCount}</strong><span>items in cart</span></div>
              <div><strong>{currency.format(totals.savings)}</strong><span>active savings</span></div>
              <div><strong>{currency.format(totals.total)}</strong><span>projected checkout</span></div>
            </div>
          </section>
          <section className="sidebar-card">
            <p className="section-kicker">Store activity</p>
            <div className="activity-list">
              {storeActivity.slice(0, 6).map((item) => (
                <article key={item.id} className="activity-item">
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                  <span>{item.time}</span>
                </article>
              ))}
            </div>
          </section>
        </aside>

        <main className="content">
          <header className="topbar">
            <div>
              <p className="eyebrow">Storefront</p>
              <h2>Fresh groceries, dense catalog, delivery planning.</h2>
            </div>
            <label className="searchbox" htmlFor={searchId}>
              <span>Search products</span>
              <input id={searchId} onChange={(event) => setSearch(event.target.value)} placeholder="Produce, dairy, pantry, brand, origin" type="search" value={search} />
            </label>
          </header>

          <section className="hero" style={{ backgroundImage: `${heroProduct.accent}, radial-gradient(circle at top left, rgba(255,255,255,0.26), transparent 40%)` }}>
            <div className="hero-copy">
              <p className="eyebrow">Seasonal feature</p>
              <h3>{heroProduct.name}</h3>
              <p>{heroProduct.description}</p>
              <div className="hero-meta">
                <span>{heroProduct.brand}</span>
                <span>{currency.format(heroProduct.price)} {heroProduct.unit}</span>
                <span>{heroProduct.rating} rating</span>
              </div>
              <div className="hero-actions">
                <button className="primary-action" onClick={() => addToCart(heroProduct.id)} type="button">Add to cart</button>
                <button className="secondary-action" onClick={() => toggleFavorite(heroProduct.id)} type="button">{favorite[heroProduct.id] ? "Saved" : "Save item"}</button>
              </div>
            </div>
            <div className="hero-grid">
              {deliverySlots.map((slot) => (
                <button key={slot.id} className={slot.id === activeSlot ? "page-card active" : "page-card"} onClick={() => setActiveSlot(slot.id)} type="button">
                  <strong>{slot.label}</strong>
                  <span>{slot.window}</span>
                  <b>{slot.fee}</b>
                </button>
              ))}
            </div>
          </section>

          <section className="filter-row">
            <div className="chip-row">
              {categoryTabs.map((tab) => (
                <button key={tab.id} className={tab.id === activeCategory ? "chip active" : "chip"} onClick={() => setActiveCategory(tab.id)} type="button">{tab.label}</button>
              ))}
            </div>
            <div className="chip-row subdued">
              {filterTabs.map((tab) => (
                <button key={tab.id} className={tab.id === activeFilter ? "chip compact active" : "chip compact"} onClick={() => setActiveFilter(tab.id)} type="button">{tab.label}</button>
              ))}
            </div>
          </section>

          <div className="content-grid">
            <section className="panel bundle-panel">
              <div className="section-head">
                <div><p className="section-kicker">Bundles</p><h3>Basket builders and promo packs</h3></div>
                <span>{bundles.length} sets</span>
              </div>
              <div className="bundle-grid">
                {bundles.filter((bundle) => bundle.category === activeCategory).slice(0, 8).map((bundle) => (
                  <button key={bundle.id} className={bundle.id === featuredBundleId ? "bundle-card active" : "bundle-card"} onClick={() => setFeaturedBundleId(bundle.id)} style={{ backgroundImage: `${bundle.accent}, linear-gradient(180deg, rgba(15,23,42,0.3), rgba(15,23,42,0.94))` }} type="button">
                    <strong>{bundle.name}</strong>
                    <p>{bundle.description}</p>
                    <span>Save {bundle.savings}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="panel catalog-panel">
              <div className="section-head">
                <div><p className="section-kicker">Catalog</p><h3>{categoryLabels[activeCategory]} picks for this run</h3></div>
                <span>{visibleProducts.length} products</span>
              </div>
              <div className="product-list">
                {visibleProducts.slice(0, 14).map((product) => (
                  <article key={product.id} className="product-row">
                    <div className="product-badge" style={{ backgroundImage: product.accent }} />
                    <div className="product-main">
                      <strong>{product.name}</strong>
                      <span>{product.subtitle}</span>
                    </div>
                    <div className="product-tags">
                      {product.tags.map((tag) => <span key={tag}>{tag}</span>)}
                    </div>
                    <div className="product-meta">
                      <span>{currency.format(product.price)}</span>
                      <span>{product.unit}</span>
                    </div>
                    <div className="product-meta">
                      <span>{product.rating} stars</span>
                      <span>{product.stock} in stock</span>
                    </div>
                    <div className="row-actions">
                      <button className={favorite[product.id] ? "like-button active" : "like-button"} onClick={() => toggleFavorite(product.id)} type="button">{favorite[product.id] ? "Saved" : "Save"}</button>
                      <button className="primary-action compact" onClick={() => addToCart(product.id)} type="button">Add</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel insight-panel">
              <div className="section-head"><div><p className="section-kicker">Merchandising</p><h3>What drives this basket</h3></div></div>
              <div className="insight-stack">
                <article className="insight-card emphasis">
                  <strong>{featuredBundle.name}</strong>
                  <p>{featuredBundle.description}</p>
                  <span>Potential bundle savings: {featuredBundle.savings}</span>
                </article>
                <article className="insight-card">
                  <strong>Basket distribution</strong>
                  <div className="artist-stack">
                    {categorySpend.map(([category, spend]) => (
                      <div key={category} className="artist-row"><span>{categoryLabels[category as CategoryId]}</span><b>{currency.format(spend)}</b></div>
                    ))}
                  </div>
                </article>
                <article className="insight-card">
                  <strong>Planning note</strong>
                  <p>{merchandisingNotes[(visibleProducts.length * 5) % merchandisingNotes.length]}</p>
                </article>
              </div>
            </section>

            <section className="panel cart-panel">
              <div className="section-head">
                <div><p className="section-kicker">Cart</p><h3>Checkout preview</h3></div>
                <span>{totals.itemCount} items</span>
              </div>
              <div className="cart-list">
                {cartItems.map(({ product, qty }) => (
                  <article key={product.id} className="cart-row">
                    <div><strong>{product.name}</strong><p>{product.brand}</p></div>
                    <div className="stepper">
                      <button className="ghost-button" onClick={() => updateCart(product.id, -1)} type="button">-</button>
                      <span>{qty}</span>
                      <button className="ghost-button" onClick={() => updateCart(product.id, 1)} type="button">+</button>
                    </div>
                    <span>{currency.format(product.price * qty)}</span>
                  </article>
                ))}
              </div>
              <div className="checkout-summary">
                <div><span>Subtotal</span><b>{currency.format(totals.subtotal)}</b></div>
                <div><span>Savings</span><b>-{currency.format(totals.savings)}</b></div>
                <div><span>Delivery</span><b>{currency.format(totals.deliveryFee)}</b></div>
                <div className="summary-total"><span>Total</span><b>{currency.format(totals.total)}</b></div>
              </div>
            </section>

            <section className="panel lower-panel">
              <div className="two-column">
                <div>
                  <div className="section-head compact"><div><p className="section-kicker">Recipes</p><h3>Use what is already in the basket</h3></div></div>
                  <div className="recipe-list">
                    {recipes.slice(0, 5).map((recipe) => (
                      <article key={recipe.id} className="recipe-card">
                        <div className="mini-cover" style={{ backgroundImage: recipe.accent }}>{recipe.time}</div>
                        <div><strong>{recipe.title}</strong><p>{recipe.difficulty}</p><span>{recipe.ingredientIds.map(getProduct).slice(0, 3).map((item) => item.name).join(" · ")}</span></div>
                      </article>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="section-head compact"><div><p className="section-kicker">Membership</p><h3>Delivery and savings plan</h3></div></div>
                  <div className="membership-card">
                    <strong>Green Cart+</strong>
                    <p>Free delivery over $35, member-only produce drops, rotating bakery promos, and priority weekend windows.</p>
                    <div className="membership-metrics">
                      <div><b>4.8%</b><span>avg monthly savings</span></div>
                      <div><b>2x</b><span>faster checkout repeats</span></div>
                      <div><b>12</b><span>exclusive drops this month</span></div>
                    </div>
                    <button className="primary-action" type="button">Start membership</button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>

        <aside className="summary-rail">
          <div className="summary-card spotlight" style={{ backgroundImage: heroProduct.accent }}>
            <p className="section-kicker">Featured item</p>
            <h3>{heroProduct.name}</h3>
            <p>{heroProduct.origin} · {heroProduct.brand}</p>
          </div>
          <div className="summary-card">
            <p className="section-kicker">Inventory confidence</p>
            <div className="metric-stack">
              <div><strong>{visibleProducts.filter((product) => product.stock > 20).length}</strong><span>healthy stock products</span></div>
              <div><strong>{visibleProducts.filter((product) => product.organic).length}</strong><span>organic options</span></div>
              <div><strong>{visibleProducts.filter((product) => product.weekly).length}</strong><span>weekly deal lines</span></div>
            </div>
          </div>
          <div className="summary-card">
            <p className="section-kicker">Bundle contents</p>
            <div className="queue-list">
              {featuredBundle.productIds.map((id) => getProduct(id)).map((product) => (
                <button key={product.id} className="queue-item" onClick={() => addToCart(product.id)} type="button">
                  <div><strong>{product.name}</strong><span>{currency.format(product.price)} · {product.unit}</span></div>
                  <b>Add</b>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}

const styles = `
:root { color-scheme: light; font-family: "Manrope", "Segoe UI", sans-serif; background: #f4efe7; color: #14281d; }
* { box-sizing: border-box; }
html, body, #root { margin: 0; min-height: 100%; }
body { min-height: 100vh; background: radial-gradient(circle at top left, rgba(250, 204, 21, 0.16), transparent 24%), radial-gradient(circle at right 20%, rgba(34, 197, 94, 0.14), transparent 22%), linear-gradient(180deg, #fffdf8 0%, #f4efe7 100%); }
button, input { font: inherit; }
.grocery-shell { display: grid; grid-template-columns: 280px minmax(0, 1fr) 320px; gap: 22px; min-height: 100vh; padding: 22px; }
.sidebar, .summary-rail, .panel, .hero, .topbar, .filter-row { border: 1px solid rgba(20, 40, 29, 0.08); background: rgba(255, 252, 246, 0.86); backdrop-filter: blur(14px); box-shadow: 0 20px 50px rgba(20, 40, 29, 0.08); }
.sidebar, .summary-rail { border-radius: 30px; padding: 20px; display: flex; flex-direction: column; gap: 18px; }
.content { display: flex; flex-direction: column; gap: 18px; }
.brand-block { display: flex; gap: 14px; align-items: center; }
.brand-mark { width: 56px; height: 56px; border-radius: 20px; background: linear-gradient(135deg, #f59e0b, #22c55e); }
.eyebrow, .section-kicker { margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.18em; font-size: 11px; color: #6b7f74; }
h1, h2, h3, p { margin: 0; }
.main-nav, .metric-stack, .activity-list, .hero-copy, .hero-grid, .product-list, .queue-list, .recipe-list, .insight-stack, .cart-list { display: flex; flex-direction: column; gap: 12px; }
.nav-pill, .chip, .page-card, .bundle-card, .queue-item, .like-button, .ghost-button, .secondary-action { border: 0; cursor: pointer; transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease; }
.nav-pill { border-radius: 18px; background: #f3ede3; color: #32463c; padding: 14px 16px; text-align: left; }
.nav-pill.active { background: linear-gradient(135deg, rgba(34,197,94,0.16), rgba(245,158,11,0.16)); color: #14281d; }
.sidebar-card, .summary-card { border-radius: 24px; background: rgba(255,255,255,0.72); padding: 16px; }
.summary-card.spotlight { color: white; min-height: 180px; display: flex; flex-direction: column; justify-content: end; }
.metric-stack strong { display: block; font-size: 28px; }
.metric-stack span { color: #6b7f74; font-size: 13px; }
.activity-item { border-top: 1px solid rgba(20, 40, 29, 0.08); padding-top: 12px; }
.activity-item:first-child { border-top: 0; padding-top: 0; }
.activity-item p, .activity-item span { color: #6b7f74; font-size: 13px; margin-top: 4px; }
.topbar { border-radius: 28px; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; gap: 20px; }
.topbar h2 { font-size: clamp(28px, 3vw, 40px); max-width: 13ch; }
.searchbox { min-width: 300px; display: grid; gap: 8px; color: #6b7f74; }
.searchbox input { border-radius: 18px; border: 1px solid rgba(20,40,29,0.12); background: rgba(255,255,255,0.9); color: #14281d; padding: 14px 16px; }
.hero { border-radius: 34px; padding: 28px; display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.8fr); gap: 18px; background-size: cover; }
.hero-copy h3 { font-size: clamp(34px, 5vw, 54px); max-width: 11ch; }
.hero-copy p:last-of-type { max-width: 60ch; color: rgba(20,40,29,0.78); }
.hero-meta, .hero-actions, .stepper, .membership-metrics { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
.hero-meta span, .membership-metrics div { padding: 8px 12px; border-radius: 999px; background: rgba(255,255,255,0.36); color: #14281d; font-size: 13px; }
.hero-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.page-card { border-radius: 24px; padding: 16px; background: rgba(255,255,255,0.36); text-align: left; min-height: 120px; color: #14281d; }
.page-card.active { background: rgba(255,255,255,0.78); transform: translateY(-2px); }
.page-card span, .page-card b { display: block; margin-top: 8px; }
.primary-action, .secondary-action, .ghost-button { border-radius: 999px; padding: 12px 18px; }
.primary-action { border: 0; background: #14281d; color: white; font-weight: 700; cursor: pointer; }
.primary-action.compact { padding: 10px 14px; }
.secondary-action, .ghost-button { background: rgba(255,255,255,0.42); color: #14281d; border: 1px solid rgba(20,40,29,0.12); }
.filter-row { border-radius: 24px; padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }
.chip-row { display: flex; gap: 10px; flex-wrap: wrap; }
.chip { padding: 10px 14px; border-radius: 999px; background: #f3ede3; color: #32463c; }
.chip.compact { padding: 8px 12px; font-size: 13px; }
.chip.active { background: #14281d; color: white; }
.content-grid { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.8fr); gap: 18px; }
.panel { border-radius: 30px; padding: 22px; }
.bundle-panel, .catalog-panel, .lower-panel { grid-column: 1 / 2; }
.insight-panel, .cart-panel { grid-column: 2 / 3; }
.lower-panel { grid-column: 1 / 3; }
.section-head { display: flex; justify-content: space-between; align-items: end; gap: 16px; margin-bottom: 16px; }
.section-head.compact { margin-bottom: 14px; }
.section-head h3 { font-size: 24px; }
.section-head span { color: #6b7f74; font-size: 13px; }
.bundle-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.bundle-card { border-radius: 24px; padding: 18px; color: white; text-align: left; min-height: 220px; display: flex; flex-direction: column; gap: 10px; justify-content: end; }
.bundle-card.active { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(20,40,29,0.12); }
.bundle-card p { color: rgba(255,255,255,0.84); line-height: 1.5; }
.product-list { gap: 10px; }
.product-row { display: grid; grid-template-columns: 16px minmax(0, 1.2fr) minmax(0, 0.9fr) 120px 120px 140px; gap: 12px; align-items: center; border-radius: 20px; padding: 12px; background: rgba(250,248,244,0.88); }
.product-badge { min-height: 64px; border-radius: 999px; }
.product-main strong { display: block; }
.product-main span { color: #6b7f74; font-size: 13px; }
.product-tags { display: flex; gap: 8px; flex-wrap: wrap; }
.product-tags span { border-radius: 999px; background: #eef4ec; padding: 6px 10px; color: #32463c; font-size: 12px; }
.product-meta { display: grid; gap: 6px; color: #32463c; font-size: 13px; }
.row-actions { display: flex; gap: 8px; justify-content: end; }
.like-button { border-radius: 999px; padding: 10px 12px; background: #f3ede3; color: #14281d; }
.like-button.active { background: rgba(34,197,94,0.14); color: #15803d; }
.insight-card, .recipe-card, .membership-card, .queue-item, .cart-row { border-radius: 22px; background: rgba(250,248,244,0.88); padding: 16px; }
.insight-card.emphasis { background: linear-gradient(135deg, rgba(34,197,94,0.14), rgba(245,158,11,0.18)); }
.insight-card p, .membership-card p { margin-top: 8px; color: #32463c; line-height: 1.6; }
.artist-stack { display: grid; gap: 10px; margin-top: 12px; }
.artist-row { display: flex; justify-content: space-between; gap: 12px; color: #32463c; }
.cart-row, .queue-item { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.cart-row p, .queue-item span { margin-top: 4px; color: #6b7f74; font-size: 13px; }
.checkout-summary { margin-top: 14px; display: grid; gap: 10px; }
.checkout-summary div { display: flex; justify-content: space-between; gap: 12px; color: #32463c; }
.summary-total { padding-top: 10px; border-top: 1px solid rgba(20,40,29,0.08); font-size: 18px; }
.two-column { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.recipe-card { display: grid; grid-template-columns: 82px minmax(0, 1fr); gap: 14px; align-items: center; }
.mini-cover { width: 82px; height: 82px; border-radius: 20px; display: grid; place-items: center; color: white; font-weight: 700; }
.recipe-card p, .recipe-card span { color: #6b7f74; }
.membership-metrics { margin: 16px 0; }
.membership-metrics div { display: grid; gap: 6px; min-width: 120px; }
.membership-metrics b { font-size: 24px; }
.nav-pill:hover, .chip:hover, .page-card:hover, .bundle-card:hover, .queue-item:hover, .like-button:hover, .ghost-button:hover, .secondary-action:hover { transform: translateY(-2px); }
@media (max-width: 1380px) { .grocery-shell { grid-template-columns: 240px minmax(0, 1fr); } .summary-rail { grid-column: 1 / 3; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 1080px) { .grocery-shell { grid-template-columns: 1fr; } .content-grid { grid-template-columns: 1fr; } .bundle-panel, .catalog-panel, .lower-panel, .insight-panel, .cart-panel { grid-column: auto; } .bundle-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .hero { grid-template-columns: 1fr; } .topbar { flex-direction: column; align-items: stretch; } .summary-rail { grid-template-columns: 1fr; } }
@media (max-width: 760px) { .grocery-shell { padding: 14px; gap: 14px; } .bundle-grid, .hero-grid, .two-column { grid-template-columns: 1fr; } .product-row { grid-template-columns: 14px minmax(0, 1fr); } .product-tags, .product-meta, .row-actions { grid-column: 2 / 3; } .cart-row, .queue-item { flex-direction: column; align-items: stretch; } }
`

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
