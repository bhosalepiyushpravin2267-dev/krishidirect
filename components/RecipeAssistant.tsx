"use client";

import { useMemo, useState } from "react";
import { ChefHat, Search, ShoppingBasket } from "lucide-react";

import { formatINRExact } from "@/lib/utils";
import {
    POPULAR_RECIPES,
    recipeIngredientLines,
    recipeToCartItems,
} from "@/lib/recipes";
import type { CartItem, CropListing } from "@/types/marketplace";

interface RecipeAssistantProps {
    listings: CropListing[];
    onAddAllToCart: (items: CartItem[]) => void;
}

export default function RecipeAssistant({
    listings,
    onAddAllToCart,
}: RecipeAssistantProps) {
    const [query, setQuery] = useState("");
    const [selectedId, setSelectedId] = useState(POPULAR_RECIPES[0]?.id ?? "");
    const [addedFlash, setAddedFlash] = useState(false);

    const recipes = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return POPULAR_RECIPES;
        return POPULAR_RECIPES.filter(
            (recipe) =>
                recipe.name.toLowerCase().includes(q) ||
                recipe.cuisine.toLowerCase().includes(q) ||
                recipe.description.toLowerCase().includes(q)
        );
    }, [query]);

    const selected =
        recipes.find((recipe) => recipe.id === selectedId) ?? recipes[0];

    const lines = selected
        ? recipeIngredientLines(selected, listings)
        : [];

    const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);

    return (
        <section className="mb-8 overflow-hidden rounded-3xl border border-[#E4DCC8] bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-[#E4DCC8] bg-[#1B4332] px-5 py-5 text-[#FBF7EF] sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex items-start gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#E8A33D] text-[#1B4332]">
                        <ChefHat className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#B9C9BB]">
                            Recipe Assistant
                        </p>
                        <h2 className="font-serif text-2xl font-semibold">
                            Find vegetables by dish
                        </h2>
                        <p className="mt-1 text-sm text-[#D8E5DC]">
                            Pick a favourite recipe, see farm-fresh quantities and a live total, then add everything to your cart.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:p-6">
                <div>
                    <label className="relative block">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A8370]" />
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search dishes, e.g. Pav Bhaji"
                            className="w-full rounded-2xl border border-[#E4DCC8] bg-[#FBF7EF] py-3 pl-10 pr-4 text-sm text-[#1B4332] outline-none ring-[#1B4332] focus:ring-2"
                        />
                    </label>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {recipes.length === 0 && (
                            <p className="col-span-full text-sm text-[#8A8370]">
                                No dishes match that search. Try Pav Bhaji, Veg Biryani, or Palak Paneer.
                            </p>
                        )}

                        {recipes.map((recipe) => {
                            const isActive = selected?.id === recipe.id;
                            return (
                                <button
                                    key={recipe.id}
                                    type="button"
                                    onClick={() => setSelectedId(recipe.id)}
                                    className={`rounded-2xl border p-4 text-left transition ${
                                        isActive
                                            ? "border-[#1B4332] bg-[#EAF1EC]"
                                            : "border-[#E4DCC8] bg-[#FBF7EF] hover:border-[#1B4332]"
                                    }`}
                                >
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8A8370]">
                                        {recipe.cuisine}
                                    </p>
                                    <p className="mt-1 font-serif text-lg font-semibold text-[#1B4332]">
                                        {recipe.name}
                                    </p>
                                    <p className="mt-1 text-xs text-[#8A8370]">
                                        {recipe.description}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="rounded-2xl border border-[#E4DCC8] bg-[#FBF7EF] p-4 sm:p-5">
                    {selected ? (
                        <>
                            <h3 className="font-serif text-xl font-semibold text-[#1B4332]">
                                {selected.name} vegetables
                            </h3>
                            <p className="mt-1 text-sm text-[#8A8370]">
                                Prices update from nearby farmer listings when a matching crop is available.
                            </p>

                            <ul className="mt-4 space-y-2">
                                {lines.map((line) => (
                                    <li
                                        key={line.produce.id}
                                        className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 text-sm"
                                    >
                                        <div>
                                            <p className="font-medium text-[#1B4332]">
                                                {line.produce.name}
                                            </p>
                                            <p className="text-xs text-[#8A8370]">
                                                {line.quantityKg} kg · {formatINRExact(line.pricePerKg)}/kg
                                            </p>
                                        </div>
                                        <p className="font-semibold text-[#1B4332]">
                                            {formatINRExact(line.lineTotal)}
                                        </p>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-4 flex items-center justify-between border-t border-[#E4DCC8] pt-4">
                                <p className="text-sm text-[#8A8370]">Live total</p>
                                <p className="font-serif text-2xl font-semibold text-[#1B4332]">
                                    {formatINRExact(total)}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    onAddAllToCart(
                                        recipeToCartItems(selected, listings)
                                    );
                                    setAddedFlash(true);
                                    window.setTimeout(() => setAddedFlash(false), 1800);
                                }}
                                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1B4332] px-4 py-3 text-sm font-semibold text-[#FBF7EF]"
                            >
                                <ShoppingBasket className="h-4 w-4" />
                                {addedFlash
                                    ? "Added all ingredients"
                                    : "Add All Ingredients to Cart"}
                            </button>
                        </>
                    ) : (
                        <p className="text-sm text-[#8A8370]">
                            Select a dish to see its vegetable basket.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
