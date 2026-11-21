import { useState, type FormEvent } from "react";
import type { Product } from "../domain";
import { categories } from "../products";
import { saveProduct, useAppDispatch } from "../store";
import "../styles/staff.css";

type EditorProps = {
  product?: Product;
  onSaved: (name: string) => void;
  onCancel: () => void;
};

export function ProductEditor({ product, onSaved, onCancel }: EditorProps) {
  const dispatch = useAppDispatch();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (key: string) => String(data.get(key) ?? "").trim();
    const name = text("name");
    const size = text("size");
    const price = Number(data.get("price"));
    if (!name || !size || !Number.isSafeInteger(price) || price <= 0) {
      setError("Укажите название, фасовку и цену в целых рублях больше нуля.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      await dispatch(
        saveProduct({
          original: product,
          updated: {
            ...product,
            id: product?.id ?? `product-${crypto.randomUUID()}`,
            name,
            size,
            price,
            tone: product?.tone ?? "cream",
            category: text("category"),
            flavor: text("flavor"),
            description: text("description"),
            available: data.has("available"),
            archived: data.has("archived"),
          },
        }),
      ).unwrap();
      onSaved(name);
    } catch (reason) {
      setError(
        typeof reason === "string"
          ? reason
          : "Не удалось сохранить товар. Попробуйте ещё раз.",
      );
      setBusy(false);
    }
  }

  return (
    <form
      className="work-editor"
      aria-label={product ? `Редактирование ${product.name}` : "Новый товар"}
      onSubmit={submit}
    >
      <h3>{product ? "Редактировать товар" : "Новый товар"}</h3>
      <div className="fields">
        <label className="field">
          Название
          <input
            name="name"
            defaultValue={product?.name}
            maxLength={120}
            required
          />
        </label>
        <label className="field">
          Категория
          <select name="category" defaultValue={product?.category}>
            {categories
              .filter((category) => category !== "Все")
              .map((category) => (
                <option key={category}>{category}</option>
              ))}
          </select>
        </label>
        <label className="field">
          Фасовка
          <input
            name="size"
            defaultValue={product?.size}
            placeholder="Например, 160 г"
            maxLength={60}
            required
          />
        </label>
        <label className="field">
          Цена, ₽
          <input
            name="price"
            type="number"
            min="1"
            step="1"
            defaultValue={product?.price}
            required
          />
        </label>
        <label className="field full">
          Вкус
          <input name="flavor" defaultValue={product?.flavor} maxLength={120} />
        </label>
        <label className="field full">
          Описание
          <textarea
            name="description"
            rows={3}
            defaultValue={product?.description}
            maxLength={1000}
          />
        </label>
      </div>
      <label className="work-check">
        <input
          name="available"
          type="checkbox"
          defaultChecked={product?.available !== false}
        />{" "}
        В наличии
      </label>
      {product && (
        <label className="work-check">
          <input
            name="archived"
            type="checkbox"
            defaultChecked={product.archived}
          />{" "}
          В архиве — скрыть из каталога
        </label>
      )}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      <div className="work-actions">
        <button className="btn" disabled={busy}>
          {busy ? "Сохраняем…" : "Сохранить товар"}
        </button>
        <button
          type="button"
          className="btn secondary"
          disabled={busy}
          onClick={onCancel}
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
