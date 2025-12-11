export function validateJsonRecipes(json: any) {
  if (!json || !json.recipes) return [];

  return json.recipes.map((r: any) => ({
    ...r,
    rating: r.rating ?? null,
    servings: r.servings ?? null,
    time: r.time ?? null,
    difficulty: r.difficulty ?? null,
  }));
}
