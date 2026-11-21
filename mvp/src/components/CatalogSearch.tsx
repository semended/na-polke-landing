import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

export function CatalogSearch() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [draft, setDraft] = useState("");
  const inCatalog = pathname === "/catalog";
  const value = inCatalog ? (params.get("q") ?? "") : draft;

  function update(query: string) {
    if (!inCatalog) {
      setDraft(query);
      return;
    }
    const next = new URLSearchParams(params);
    next.delete("page");
    if (query) next.set("q", query);
    else next.delete("q");
    setParams(next, { replace: true });
  }

  return (
    <form
      className="search"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        if (!inCatalog)
          navigate({
            pathname: "/catalog",
            search: new URLSearchParams({ q: value }).toString(),
          });
      }}
    >
      <button type="submit" aria-label="Найти товары">
        <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m16 16 5 5" />
        </svg>
      </button>
      <input
        aria-label="Поиск товаров"
        placeholder="Найти на полке"
        value={value}
        onChange={(event) => update(event.target.value)}
      />
      {value && (
        <button
          type="button"
          aria-label="Очистить поиск"
          onClick={() => update("")}
        >
          ×
        </button>
      )}
    </form>
  );
}
