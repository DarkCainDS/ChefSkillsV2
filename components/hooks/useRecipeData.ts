import { useEffect, useState } from "react";
import { loadJsonCategory } from "../../utils/cache/jsonLoader";
import { validateJsonRecipes } from "../../utils/cache/validator";

export function useRecipeData(category: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const json = await loadJsonCategory(category);
      const valid = validateJsonRecipes(json);

      if (mounted) {
        setData(valid);
        setLoading(false);
      }
    };

    load();
    return () => { mounted = false };
  }, [category]);

  return { data, loading };
}
