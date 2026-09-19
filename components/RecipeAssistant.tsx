// components/RecipeAssistant.tsx
"use client";

import { useMemo, useState } from "react";
import { Search, ChefHat, ShoppingCart, X, Plus, Check } from "lucide-react";

/* -------------------------------------------------- */
/* Types                                               */
/* -------------------------------------------------- */

export interface CartItem {
  name: string;
  quantityGrams: number;
  pricePerKg: number;
  /** Present only when this item came from a real marketplace listing
   * ("Add to Cart" / "Buy Now") rather than a Recipe Assistant ingredient.
   * Lets a placed order be attributed to the right farmer in
   * "Offers Received" — Recipe Assistant ingredients have no real farmer
   * behind them, so these stay undefined for those. */
  farmerId?: string;
  farmerName?: string;
  listingId?: string;
}

interface RecipeIngredient {
  name: string;
  grams: number;
  pricePerKg: number;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  servings: number;
  ingredients: RecipeIngredient[];
}

interface RecipeAssistantProps {
  /** Called once with every ingredient in the selected recipe when the
   * customer clicks "Add All Ingredients to Cart". */
  onAddToCart: (items: CartItem[]) => void;
}

/* -------------------------------------------------- */
/* Sample recipe data                                  */
/* -------------------------------------------------- */
// Retail per-kg prices here are for the Recipe Assistant only — a separate,
// consumer-facing price scale from the wholesale ₹/quintal prices farmers
// list in CustomerMarketplaceFeed. Swap for a real pricing API later.

const RECIPES: Recipe[] = [
  {
    id: "pav-bhaji",
    name: "Pav Bhaji",
    description: "Mashed mixed-vegetable curry, Mumbai street-food style.",
    servings: 4,
    ingredients: [
      { name: "Potato", grams: 500, pricePerKg: 20 },
      { name: "Tomato", grams: 300, pricePerKg: 30 },
      { name: "Onion", grams: 200, pricePerKg: 25 },
      { name: "Capsicum", grams: 150, pricePerKg: 40 },
      { name: "Green Peas", grams: 100, pricePerKg: 60 },
    ],
  },
  {
    id: "paneer-butter-masala",
    name: "Paneer Butter Masala",
    description: "Paneer cubes in a rich, creamy tomato gravy.",
    servings: 3,
    ingredients: [
      { name: "Paneer", grams: 250, pricePerKg: 320 },
      { name: "Tomato", grams: 400, pricePerKg: 30 },
      { name: "Onion", grams: 150, pricePerKg: 25 },
      { name: "Capsicum", grams: 100, pricePerKg: 40 },
    ],
  },
  {
    id: "veg-biryani",
    name: "Veg Biryani",
    description: "Layered rice with mixed vegetables and whole spices.",
    servings: 4,
    ingredients: [
      { name: "Carrot", grams: 150, pricePerKg: 35 },
      { name: "Beans", grams: 100, pricePerKg: 50 },
      { name: "Potato", grams: 150, pricePerKg: 20 },
      { name: "Green Peas", grams: 100, pricePerKg: 60 },
      { name: "Onion", grams: 200, pricePerKg: 25 },
    ],
  },
  {
    id: "aloo-gobi",
    name: "Aloo Gobi",
    description: "Dry-roasted potato and cauliflower with everyday spices.",
    servings: 3,
    ingredients: [
      { name: "Potato", grams: 400, pricePerKg: 20 },
      { name: "Cauliflower", grams: 500, pricePerKg: 30 },
      { name: "Tomato", grams: 100, pricePerKg: 30 },
    ],
  },
  {
    id: "bhindi-masala",
    name: "Bhindi Masala",
    description: "Okra stir-fried with onion and tomato masala.",
    servings: 3,
    ingredients: [
      { name: "Okra (Bhindi)", grams: 500, pricePerKg: 45 },
      { name: "Onion", grams: 150, pricePerKg: 25 },
      { name: "Tomato", grams: 200, pricePerKg: 30 },
    ],
  },
  {
    id: "palak-paneer",
    name: "Palak Paneer",
    description: "Paneer cubes simmered in a smooth spinach gravy.",
    servings: 3,
    ingredients: [
      { name: "Spinach (Palak)", grams: 500, pricePerKg: 25 },
      { name: "Paneer", grams: 250, pricePerKg: 320 },
      { name: "Tomato", grams: 100, pricePerKg: 30 },
      { name: "Onion", grams: 100, pricePerKg: 25 },
    ],
  },
];

function ingredientCost(ingredient: RecipeIngredient): number {
  return (ingredient.grams / 1000) * ingredient.pricePerKg;
}

function recipeTotal(recipe: Recipe): number {
  return recipe.ingredients.reduce((sum, i) => sum + ingredientCost(i), 0);
}

function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

/* -------------------------------------------------- */
/* Component                                           */
/* -------------------------------------------------- */

export default function RecipeAssistant({ onAddToCart }: RecipeAssistantProps) {
  const [query, setQuery] = useState("");
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  const filteredRecipes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return RECIPES;
    return RECIPES.filter((r) => r.name.toLowerCase().includes(q));
  }, [query]);

  const handleAddAll = () => {
    if (!activeRecipe) return;
    const items: CartItem[] = activeRecipe.ingredients.map((i) => ({
      name: i.name,
      quantityGrams: i.grams,
      pricePerKg: i.pricePerKg,
    }));
    onAddToCart(items);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <div className="w-full max-w-full rounded-3xl border border-[#E4DCC8] bg-white p-5 shadow-sm sm:p-6">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#EAF1EC]">
          <ChefHat className="h-5 w-5 text-[#1B4332]" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-semibold text-[#1B4332]">
            Recipe Assistant
          </h2>
          <p className="text-xs text-[#8A8370]">
            Find a recipe, get the exact vegetables you need
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A8370]" />
        <input
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setQuery(e.target.value)
          }
          placeholder="Search recipes, e.g. Pav Bhaji"
          className="w-full rounded-xl border border-[#E4DCC8] bg-white py-2.5 pl-9 pr-3 text-sm text-[#3D4A42] outline-none focus:border-[#1B4332]"
        />
      </div>

      {/* Recipe grid */}
      {filteredRecipes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E4DCC8] py-10 text-center text-sm text-[#8A8370]">
          No recipes match &ldquo;{query}&rdquo;.
        </div>
      ) : (
        <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <button
              key={recipe.id}
              onClick={() => setActiveRecipe(recipe)}
              className="flex w-full min-w-0 flex-col items-start rounded-2xl border border-[#E4DCC8] bg-[#FBF7EF] p-4 text-left transition-colors hover:border-[#1B4332]"
            >
              <p className="font-semibold text-[#1B4332]">{recipe.name}</p>
              <p className="mt-1 text-xs text-[#8A8370]">{recipe.description}</p>
              <div className="mt-3 flex w-full items-center justify-between">
                <span className="text-xs text-[#8A8370]">
                  {recipe.ingredients.length} ingredients
                </span>
                <span className="font-semibold text-[#C4622D]">
                  ≈ {formatINR(recipeTotal(recipe))}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Ingredient breakdown modal */}
      {activeRecipe && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setActiveRecipe(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#1B4332]">
                  {activeRecipe.name}
                </h3>
                <p className="text-xs text-[#8A8370]">
                  Serves {activeRecipe.servings}
                </p>
              </div>
              <button
                onClick={() => setActiveRecipe(null)}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#EFE8D6] text-[#3D4A42]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 space-y-2">
              {activeRecipe.ingredients.map((ingredient) => (
                <div
                  key={ingredient.name}
                  className="flex items-center justify-between rounded-xl bg-[#FBF7EF] px-3.5 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-[#1B4332]">
                      {ingredient.name}
                    </p>
                    <p className="text-xs text-[#8A8370]">
                      {ingredient.grams} g · {formatINR(ingredient.pricePerKg)}/kg
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-[#C4622D]">
                    {formatINR(ingredientCost(ingredient))}
                  </span>
                </div>
              ))}
            </div>

            <div className="mb-5 flex items-center justify-between rounded-xl bg-[#EAF1EC] px-4 py-3">
              <span className="text-sm font-medium text-[#1B4332]">
                Total price
              </span>
              <span className="text-lg font-bold text-[#1B4332]">
                {formatINR(recipeTotal(activeRecipe))}
              </span>
            </div>

            <button
              onClick={handleAddAll}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1B4332] py-3.5 text-sm font-semibold text-[#FBF7EF] transition-colors hover:bg-[#2D6A4F]"
            >
              {justAdded ? (
                <>
                  <Check className="h-4 w-4" /> Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" /> Add All Ingredients to Cart
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
