import { useEffect, useState } from "react";
import { getVersionedImage } from "../../utils/versionedImage";

export function useVersionedImage(url?: string | null) {
  const [img, setImg] = useState<{ uri: string } | null>(null);

  useEffect(() => {
    let mounted = true;

    getVersionedImage(url).then((src) => {
      if (mounted) setImg(src);
    });

    return () => {
      mounted = false;
    };
  }, [url]);

  return img;
}
