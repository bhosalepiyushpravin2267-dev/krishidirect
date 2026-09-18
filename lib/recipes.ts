import type { CartItem, Category, CropListing } from "@/types/marketplace";

export interface ProduceItem {
    id: string;
    name: string;
    category?: Category;
    fallbackPricePerKg: number;
}

export interface RecipeIngredient {
    produceId: string;
    quantityKg: number;
}

export interface Recipe {
    id: string;
    name: string;
    cuisine: string;
    description: string;
    ingredients: RecipeIngredient[];
}

export const PRODUCE_CATALOG: ProduceItem[] = [
    { id: "tomato", name: "Tomato", category: "tomato", fallbackPricePerKg: 22 },
    { id: "onion", name: "Onion", category: "onion", fallbackPricePerKg: 18 },
    { id: "potato", name: "Potato", category: "potato", fallbackPricePerKg: 16 },
    { id: "leafy-greens", name: "Palak / Leafy greens", category: "leafy-greens", fallbackPricePerKg: 12 },
    { id: "peas", name: "Green peas", fallbackPricePerKg: 60 },
    { id: "capsicum", name: "Capsicum", fallbackPricePerKg: 40 },
    { id: "cauliflower", name: "Cauliflower", fallbackPricePerKg: 28 },
    { id: "carrot", name: "Carrot", fallbackPricePerKg: 30 },
    { id: "beans", name: "French beans", fallbackPricePerKg: 45 },
    { id: "ginger", name: "Ginger", fallbackPricePerKg: 80 },
    { id: "garlic", name: "Garlic", fallbackPricePerKg: 90 },
    { id: "okra", name: "Bhindi (okra)", fallbackPricePerKg: 35 },
];

export const POPULAR_RECIPES: Recipe[] = [
    {
        id: "pav-bhaji",
        name: "Pav Bhaji",
        cuisine: "Mumbai street food",
        description: "Mashed mixed vegetables with buttery pav flavours.",
        ingredients: [
            { produceId: "potato", quantityKg: 0.4 },
            { produceId: "tomato", quantityKg: 0.35 },
            { produceId: "onion", quantityKg: 0.25 },
            { produceId: "peas", quantityKg: 0.15 },
            { produceId: "capsicum", quantityKg: 0.15 },
            { produceId: "cauliflower", quantityKg: 0.2 },
        ],
    },
    {
        id: "paneer-butter-masala",
        name: "Paneer Butter Masala",
        cuisine: "North Indian",
        description: "Fresh tomato-onion gravy vegetables for a classic curry.",
        ingredients: [
            { produceId: "tomato", quantityKg: 0.5 },
            { produceId: "onion", quantityKg: 0.3 },
            { produceId: "capsicum", quantityKg: 0.1 },
            { produceId: "ginger", quantityKg: 0.03 },
            { produceId: "garlic", quantityKg: 0.03 },
        ],
    },
    {
        id: "veg-biryani",
        name: "Veg Biryani",
        cuisine: "Hyderabadi",
        description: "Layered rice needs a colourful mix of farm vegetables.",
        ingredients: [
            { produceId: "onion", quantityKg: 0.4 },
            { produceId: "tomato", quantityKg: 0.2 },
            { produceId: "potato", quantityKg: 0.3 },
            { produceId: "peas", quantityKg: 0.15 },
            { produceId: "carrot", quantityKg: 0.15 },
            { produceId: "beans", quantityKg: 0.1 },
        ],
    },
    {
        id: "aloo-gobi",
        name: "Aloo Gobi",
        cuisine: "Punjabi",
        description: "Potato and cauliflower dry sabzi staples.",
        ingredients: [
            { produceId: "potato", quantityKg: 0.4 },
            { produceId: "cauliflower", quantityKg: 0.5 },
            { produceId: "tomato", quantityKg: 0.2 },
            { produceId: "onion", quantityKg: 0.15 },
        ],
    },
    {
        id: "palak-paneer",
        name: "Palak Paneer",
        cuisine: "North Indian",
        description: "Spinach-forward gravy with onion and tomato.",
        ingredients: [
            { produceId: "leafy-greens", quantityKg: 0.5 },
            { produceId: "tomato", quantityKg: 0.15 },
            { produceId: "onion", quantityKg: 0.15 },
            { produceId: "garlic", quantityKg: 0.02 },
        ],
    },
    {
        id: "bhindi-masala",
        name: "Bhindi Masala",
        cuisine: "Home-style",
        description: "Okra cooked with onion-tomato masala.",
        ingredients: [
            { produceId: "okra", quantityKg: 0.4 },
            { produceId: "onion", quantityKg: 0.2 },
            { produceId: "tomato", quantityKg: 0.2 },
        ],
    },
];

export function getProduce(id: string): ProduceItem | undefined {
    return PRODUCE_CATALOG.find((item) => item.id === id);
}

export function livePricePerKg(
    produce: ProduceItem,
    listings: CropListing[]
): number {
    if (!produce.category) {
        return produce.fallbackPricePerKg;
    }

    const match = listings.find((listing) => listing.category === produce.category);

    if (!match) {
        return produce.fallbackPricePerKg;
    }

    return match.unit === "quintal"
        ? match.pricePerUnit / 100
        : match.pricePerUnit;
}

export function recipeIngredientLines(
    recipe: Recipe,
    listings: CropListing[]
): Array<{
    produce: ProduceItem;
    quantityKg: number;
    pricePerKg: number;
    lineTotal: number;
}> {
    return recipe.ingredients
        .map((ingredient) => {
            const produce = getProduce(ingredient.produceId);
            if (!produce) return null;
            const pricePerKg = livePricePerKg(produce, listings);
            return {
                produce,
                quantityKg: ingredient.quantityKg,
                pricePerKg,
                lineTotal: ingredient.quantityKg * pricePerKg,
            };
        })
        .filter((row): row is NonNullable<typeof row> => row !== null);
}

export function recipeToCartItems(
    recipe: Recipe,
    listings: CropListing[]
): CartItem[] {
    return recipeIngredientLines(recipe, listings).map((row) => ({
        id: `produce-${row.produce.id}`,
        name: row.produce.name,
        quantityKg: row.quantityKg,
        pricePerKg: row.pricePerKg,
        unitLabel: "kg",
    }));
}
