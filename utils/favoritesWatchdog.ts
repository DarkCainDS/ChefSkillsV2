import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store/Index";

import {
  loadFavoritesFromStorage,
  saveFavoritesToStorage,
} from "../store/storage/FavoriteStorage";

import { setFavorites } from "../store/Slices/FavoriteSlice";

export function useFavoritesWatchdog(active: boolean) {
  const dispatch = useDispatch<AppDispatch>();

  const favoritesLimit = useSelector(
    (state: RootState) => state.user.favoritesLimit
  );

  const hasRun = useRef(false);

  useEffect(() => {
    if (!active) return;                // solo en FavoritesScreen
    if (hasRun.current) return;         // solo una vez
    hasRun.current = true;

    const run = async () => {
      console.log("🛡 Nuevo Watchdog: verificando favoritos...");

      const list = await loadFavoritesFromStorage();

      if (!Array.isArray(list)) {
        console.warn("⚠ Datos corruptos. Restaurando...");
        await saveFavoritesToStorage([]);
        dispatch(setFavorites([]));
        return;
      }

      if (list.length <= favoritesLimit) {
        console.log("🛡 Watchdog OK. Nada que recortar.");
        dispatch(setFavorites(list));
        return;
      }

      // recortar sin borrar todo
      const trimmed = list.slice(0, favoritesLimit);

      console.warn(
        `⚠ Exceso de favoritos (${list.length} > ${favoritesLimit}). Recortando...`
      );

      await saveFavoritesToStorage(trimmed);
      dispatch(setFavorites(trimmed));

      console.log(`🛡 Final: ${trimmed.length} favoritos.`);
    };

    run();
  }, [active, dispatch, favoritesLimit]);
}
