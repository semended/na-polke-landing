import { Link } from "react-router-dom";
import { type Product, money } from "../domain";
import { ProductPhoto } from "./ProductPhoto";
import { Arrow } from "./Shared";

export function FeaturedShelf({ products }: { products: Product[] }) {
  const chocolate = products.filter(
    (p) =>
      p.category === "Шоколад" &&
      p.available !== false &&
      ["maltesers", "marabou"].includes(p.id),
  );
  const drink = products.find(
    (p) =>
      p.id === "fanta" && p.category === "Газировка" && p.available !== false,
  );
  if (!chocolate.length && !drink) return null;
  return (
    <section className="features" aria-label="Подборки магазина">
      {chocolate.length > 0 && (
        <Link
          className="feature chocolate-feature"
          to="/catalog?category=Шоколад"
          aria-label="Смотреть шоколад"
        >
          <div className="feature-copy">
            <h2>
              Шоколад
              <br />к чаю
            </h2>
            <span className="feature-action">
              Выбрать <Arrow />
            </span>
          </div>
          <div className="feature-art" aria-hidden="true">
            {chocolate.map((product) => (
              <ProductPhoto
                key={product.id}
                product={product}
                sizes="230px"
                className={`feature-pack pack-${product.id}`}
                eager
              />
            ))}
          </div>
        </Link>
      )}
      {drink && (
        <Link
          className="feature drink-feature"
          to={`/product/${drink.id}`}
          aria-label={`Посмотреть ${drink.name}`}
        >
          <div className="feature-copy">
            <h2>{drink.flavor}</h2>
            <span className="feature-flavor">{drink.name}</span>
            <span className="feature-action">
              {money(drink.price)} <Arrow />
            </span>
          </div>
          <div className="feature-art" aria-hidden="true">
            <ProductPhoto
              product={drink}
              sizes="140px"
              className="feature-pack"
              eager
            />
          </div>
        </Link>
      )}
    </section>
  );
}
