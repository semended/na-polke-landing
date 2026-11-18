import type { Product } from "../domain";
import { products } from "../products";

export function ProductPhoto({ product }: { product: Product }) {
  const imageId = product.imageId ?? product.id;
  if (!products.some((sample) => sample.id === imageId)) {
    return <span className="photo-placeholder">Фото пока нет</span>;
  }
  return (
    <img
      src={`${import.meta.env.BASE_URL}products/${imageId}.png`}
      alt={product.name}
      loading="lazy"
    />
  );
}
