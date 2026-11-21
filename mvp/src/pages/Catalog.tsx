import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { categories } from "../products";
import { filterProducts } from "../domain";
import {
  decreaseItem,
  fetchProducts,
  useAppDispatch,
  useAppSelector,
} from "../store";
import { ProductCard } from "../components/ProductCard";
import { FeaturedShelf } from "../components/FeaturedShelf";

const batchSize = 24;

export function Catalog({ onAdd }: { onAdd: (id: string) => void }) {
  const dispatch = useAppDispatch();
  const [params, setParams] = useSearchParams();
  const mode = params.get("demo") || "";
  const query = params.get("q") || "";
  const requestedCategory = params.get("category") || "Все";
  const category = categories.includes(requestedCategory)
    ? requestedCategory
    : "Все";
  const { items, status, error } = useAppSelector((s) => s.catalog);
  const cart = useAppSelector((s) => s.cart);
  useEffect(() => {
    void dispatch(fetchProducts({ mode }));
  }, [mode, dispatch]);
  const list = filterProducts(items, query, category);
  const requestedPage = Number(params.get("page"));
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, Math.max(1, Math.ceil(list.length / batchSize)))
      : 1;
  const visible = list.slice(0, page * batchSize);

  function update(key: "category" | "page", value: string) {
    setParams(
      (p) => {
        if (key === "category") p.delete("page");
        if (value) p.set(key, value);
        else p.delete(key);
        return p;
      },
      { replace: true },
    );
  }
  return (
    <>
      {!query && category === "Все" && status === "succeeded" && (
        <FeaturedShelf products={items} />
      )}
      <div className="catalog-title">
        <h1>Каталог товаров</h1>
        <span className="count" aria-live="polite">
          {status === "succeeded" ? list.length : ""}
        </span>
      </div>
      <div className="filter-row">
        <div className="tabs" aria-label="Категории">
          {categories.map((c) => (
            <button
              key={c}
              className={`tab ${c === category ? "active" : ""}`}
              aria-pressed={c === category}
              onClick={() => update("category", c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      {status === "loading" || status === "idle" ? (
        <div className="loading" role="status">
          <span className="spinner" />
          Загружаем товары…
        </div>
      ) : status === "failed" ? (
        <div className="empty" role="alert">
          <h2>Товары не загрузились</h2>
          <p>{error}</p>
          <button
            className="btn"
            onClick={() => {
              if (mode) setParams({});
              else void dispatch(fetchProducts({}));
            }}
          >
            Повторить загрузку
          </button>
        </div>
      ) : list.length ? (
        <>
          <div className="products catalog-products">
            {visible.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAdd={onAdd}
                onDecrease={(id) => dispatch(decreaseItem(id))}
                quantity={cart[p.id]}
              />
            ))}
          </div>
          {visible.length < list.length && (
            <div className="catalog-more">
              <span>
                Показано {visible.length} из {list.length}
              </span>
              <button
                className="btn secondary"
                onClick={() => update("page", String(page + 1))}
              >
                Показать ещё
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty">
          <h2>
            {items.length ? "Ничего не нашлось" : "В каталоге пока нет товаров"}
          </h2>
          <p>
            {items.length
              ? "Попробуйте другое название или сбросьте фильтры."
              : "Попробуйте загрузить каталог ещё раз."}
          </p>
          <button
            className="btn"
            onClick={() => {
              setParams({});
              if (!mode) void dispatch(fetchProducts({}));
            }}
          >
            {items.length ? "Сбросить фильтры" : "Повторить загрузку"}
          </button>
        </div>
      )}
    </>
  );
}
