import { useCallback, useEffect, useState } from "react";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(read<T>(key, initial));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          /* storage indisponível */
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, update, hydrated] as const;
}

export type FavItem = { id: string; tipo: string; nome: string; href: string };

export function useFavoritos() {
  const [favoritos, setFavoritos, hydrated] = useLocalState<FavItem[]>("gh:favoritos", []);
  const isFav = (id: string) => favoritos.some((f) => f.id === id);
  const toggle = (item: FavItem) =>
    setFavoritos((prev) => (prev.some((f) => f.id === item.id) ? prev.filter((f) => f.id !== item.id) : [item, ...prev]));
  return { favoritos, isFav, toggle, hydrated };
}

export type RecentItem = { nome: string; href: string; tipo: string };

export function registrarRecente(item: RecentItem) {
  if (typeof window === "undefined") return;
  try {
    const prev = read<RecentItem[]>("gh:recentes", []);
    const next = [item, ...prev.filter((p) => p.href !== item.href)].slice(0, 8);
    window.localStorage.setItem("gh:recentes", JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function useRecentes() {
  const [recentes] = useLocalState<RecentItem[]>("gh:recentes", []);
  return recentes;
}
