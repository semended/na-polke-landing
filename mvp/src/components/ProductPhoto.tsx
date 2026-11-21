import { useState } from "react";
import type { Product } from "../domain";
import { photoSizes, photoUrl } from "../productPhotos";

type Props = {
  product: Pick<Product, "id" | "name" | "imageId">;
  sizes?: string;
  eager?: boolean;
  className?: string;
};

export function ProductPhoto({
  product,
  sizes = "(max-width: 550px) 90vw, 360px",
  eager = false,
  className,
}: Props) {
  const id = product.imageId ?? product.id;
  const size = photoSizes.get(id);
  const [failedId, setFailedId] = useState<string>();
  if (!size || failedId === id)
    return <span className="photo-placeholder">Фото пока нет</span>;

  const [width, height] = size;
  return (
    <img
      className={className}
      src={photoUrl(id)}
      srcSet={`${photoUrl(id, true)} ${Math.ceil(width / 2)}w, ${photoUrl(id)} ${width}w`}
      sizes={sizes}
      alt={product.name}
      width={width}
      height={height}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailedId(id)}
    />
  );
}
