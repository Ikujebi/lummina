import { classifyMatter } from "./classifier";

export function enrichMatter<T extends { title: string; description?: string | null }>(
  matter: T
) {
  return {
    ...matter,
    type: classifyMatter(matter), // 👈 adds type safely
  };
}

export function enrichMatters<T extends { title: string; description?: string | null }>(
  matters: T[]
) {
  return matters.map(enrichMatter);
}