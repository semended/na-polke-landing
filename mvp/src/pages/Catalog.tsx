import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { categories } from "../products";
import { filterProducts } from "../domain";
import { fetchProducts, useAppDispatch, useAppSelector } from "../store";
import { ProductCard } from "../components/ProductCard";
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
  function update(key: string, value: string) {
    setParams(
      (p) => {
        if (value) p.set(key, value);
        else p.delete(key);
        return p;
      },
      { replace: true },
    );
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Каталог товаров</h1>
          <p>Выберите товары для самовывоза.</p>
        </div>
        <div className="search">
          <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10" cy="10" r="6" />
            <path d="m15 15 6 6" />
          </svg>
          <input
            aria-label="Поиск товаров"
            placeholder="Название или вкус"
            value={query}
            onChange={(e) => update("q", e.target.value)}
          />
          {query ? (
            <button onClick={() => update("q", "")} aria-label="Очистить поиск">
              ×
            </button>
          ) : null}
        </div>
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
        <span className="count" aria-live="polite">
          {status === "succeeded"
            ? `${list.length} из ${items.length} товаров`
            : ""}
        </span>
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
        <div className="products catalog-products">
          {list.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onAdd={onAdd}
              quantity={cart[p.id]}
            />
          ))}
        </div>
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
