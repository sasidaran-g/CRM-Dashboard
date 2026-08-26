"use client";

import { useEffect, useState } from "react";

import type { CustomerFilters, SavedFilter } from "@/lib/types";

const STORAGE_KEY = "crm-saved-filters";

export function useSavedFilters() {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      setSavedFilters(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
  }, []);

  function persist(next: SavedFilter[]) {
    setSavedFilters(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function saveFilter(name: string, filters: CustomerFilters) {
    const next = [...savedFilters, { id: crypto.randomUUID(), name, filters }];
    persist(next);
  }

  function deleteFilter(id: string) {
    persist(savedFilters.filter((filter) => filter.id !== id));
  }

  return { savedFilters, saveFilter, deleteFilter };
}
