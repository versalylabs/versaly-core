"use client";

import { useState, useEffect, useCallback } from "react";
import {
  VERSALY_PRODUCTS,
  DEFAULT_PRODUCT_CATEGORIES,
  VersalyProduct,
} from "@/data/products-catalog";

export const PRODUCTS_CATALOG_STORAGE_KEY = "versaly_products_catalog";
export const PRODUCT_CATEGORIES_STORAGE_KEY = "versaly_product_categories_v2";
export const PRODUCTS_UPDATED_EVENT = "versaly_products_updated";
export const CATEGORIES_UPDATED_EVENT = "versaly_product_categories_updated";

export const PRODUCT_COLOR_PALETTE: Record<string, string> = {
  semplo: "#10b981", // emerald
  adversoft: "#8b5cf6", // violet
  vehisoft: "#6366f1", // indigo
  versandry: "#06b6d4", // cyan
  lipatim: "#3b82f6", // blue
  "melio-rms": "#f59e0b", // amber
  melio: "#f59e0b",
};

const FALLBACK_PALETTE = [
  "#10b981",
  "#6366f1",
  "#06b6d4",
  "#8b5cf6",
  "#3b82f6",
  "#f59e0b",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#a855f7",
  "#84cc16",
  "#0ea5e9",
  "#e11d48",
];

export function getProductColor(slugOrName: string): string {
  if (!slugOrName) return "#6366f1";
  const clean = slugOrName.toLowerCase().replace(/[^a-z0-9]/g, "-");
  if (PRODUCT_COLOR_PALETTE[clean]) return PRODUCT_COLOR_PALETTE[clean];
  for (const [key, color] of Object.entries(PRODUCT_COLOR_PALETTE)) {
    if (clean.includes(key)) return color;
  }
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % FALLBACK_PALETTE.length;
  return FALLBACK_PALETTE[index];
}

/**
 * Reads all products from localStorage with safe fallback to VERSALY_PRODUCTS
 */
export function getStoredProducts(): VersalyProduct[] {
  if (typeof window === "undefined") {
    return VERSALY_PRODUCTS;
  }
  try {
    const raw = localStorage.getItem(PRODUCTS_CATALOG_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_CATALOG_STORAGE_KEY, JSON.stringify(VERSALY_PRODUCTS));
      return VERSALY_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure Semplo is present
      const hasSemplo = parsed.some((p: VersalyProduct) => p.slug === "semplo");
      if (!hasSemplo) {
        const semplo = VERSALY_PRODUCTS.find((p) => p.slug === "semplo");
        if (semplo) {
          const merged = [semplo, ...parsed];
          localStorage.setItem(PRODUCTS_CATALOG_STORAGE_KEY, JSON.stringify(merged));
          return merged;
        }
      }
      return parsed;
    }
  } catch (err) {
    console.error("Error reading products catalog from storage:", err);
  }
  return VERSALY_PRODUCTS;
}

/**
 * Persists products to localStorage and broadcasts update event
 */
export function saveStoredProducts(products: VersalyProduct[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PRODUCTS_CATALOG_STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new CustomEvent(PRODUCTS_UPDATED_EVENT, { detail: products }));
  } catch (err) {
    console.error("Error saving products catalog:", err);
  }
}

/**
 * Reads all product categories from localStorage
 */
export function getStoredCategories(): string[] {
  if (typeof window === "undefined") {
    return DEFAULT_PRODUCT_CATEGORIES;
  }
  try {
    const raw = localStorage.getItem(PRODUCT_CATEGORIES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCT_CATEGORIES_STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCT_CATEGORIES));
      return DEFAULT_PRODUCT_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error("Error reading categories from storage:", err);
  }
  return DEFAULT_PRODUCT_CATEGORIES;
}

/**
 * Persists categories to localStorage and broadcasts update event
 */
export function saveStoredCategories(categories: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PRODUCT_CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    window.dispatchEvent(new CustomEvent(CATEGORIES_UPDATED_EVENT, { detail: categories }));
  } catch (err) {
    console.error("Error saving categories:", err);
  }
}

/**
 * Real-time Reactive Hook for Products Catalog
 */
export function useProductsCatalog() {
  const [products, setProductsState] = useState<VersalyProduct[]>(() => getStoredProducts());

  const reloadProducts = useCallback(() => {
    const fresh = getStoredProducts();
    setProductsState(fresh);
  }, []);

  useEffect(() => {
    reloadProducts();

    const handleUpdate = (e?: Event) => {
      if (e && (e as CustomEvent).detail && Array.isArray((e as CustomEvent).detail)) {
        setProductsState((e as CustomEvent).detail);
      } else {
        reloadProducts();
      }
    };

    window.addEventListener(PRODUCTS_UPDATED_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("focus", reloadProducts);

    return () => {
      window.removeEventListener(PRODUCTS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("focus", reloadProducts);
    };
  }, [reloadProducts]);

  const setProducts = useCallback(
    (action: VersalyProduct[] | ((prev: VersalyProduct[]) => VersalyProduct[])) => {
      setProductsState((prev) => {
        const next = typeof action === "function" ? action(prev) : action;
        saveStoredProducts(next);
        return next;
      });
    },
    []
  );

  return {
    products,
    setProducts,
    reloadProducts,
  };
}

/**
 * Real-time Reactive Hook for Product Industry Categories
 */
export function useProductCategories() {
  const [categories, setCategoriesState] = useState<string[]>(() => getStoredCategories());

  const reloadCategories = useCallback(() => {
    const fresh = getStoredCategories();
    setCategoriesState(fresh);
  }, []);

  useEffect(() => {
    reloadCategories();

    const handleUpdate = (e?: Event) => {
      if (e && (e as CustomEvent).detail && Array.isArray((e as CustomEvent).detail)) {
        setCategoriesState((e as CustomEvent).detail);
      } else {
        reloadCategories();
      }
    };

    window.addEventListener(CATEGORIES_UPDATED_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("focus", reloadCategories);

    return () => {
      window.removeEventListener(CATEGORIES_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("focus", reloadCategories);
    };
  }, [reloadCategories]);

  const setCategories = useCallback(
    (action: string[] | ((prev: string[]) => string[])) => {
      setCategoriesState((prev) => {
        const next = typeof action === "function" ? action(prev) : action;
        saveStoredCategories(next);
        return next;
      });
    },
    []
  );

  return {
    categories,
    setCategories,
    reloadCategories,
  };
}
