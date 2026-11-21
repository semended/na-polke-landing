import { useState } from "react";
import { Empty } from "../components/Shared";
import { ProductEditor } from "../components/ProductEditor";
import { StaffOrders } from "../components/StaffOrders";
import { money, type Product } from "../domain";
import { selectVisibleOrders, useAppSelector } from "../store";
import "../styles/staff.css";

function StaffWorkspace() {
  const inventory = useAppSelector((state) => state.inventory);
  const orders = useAppSelector(selectVisibleOrders);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [notice, setNotice] = useState("");

  function edit(product: Product | "new") {
    setNotice("");
    setEditing(product);
  }

  function finish(name: string) {
    setEditing(null);
    setNotice(`Товар «${name}» сохранён.`);
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Кабинет сотрудника</h1>
        </div>
      </div>
      <StaffOrders orders={orders} />
      <section className="work-panel">
        <div className="work-row">
          <h2>Товары</h2>
          {editing === null && (
            <button className="btn" onClick={() => edit("new")}>
              Добавить товар
            </button>
          )}
        </div>
        <p role="status" className="work-notice">
          {notice}
        </p>
        {editing === "new" && (
          <ProductEditor onSaved={finish} onCancel={() => setEditing(null)} />
        )}
        <ul className="work-list">
          {inventory.map((product) => (
            <li key={product.id}>
              <div className="work-row">
                <span>
                  <strong>{product.name}</strong>
                  <small>
                    {product.size} · {money(product.price)} ·{" "}
                    {product.archived
                      ? "В архиве"
                      : product.available === false
                        ? "Нет в наличии"
                        : "В наличии"}
                  </small>
                </span>
                {editing === null && (
                  <button
                    className="work-link"
                    aria-label={`Редактировать ${product.name}`}
                    onClick={() => edit(product)}
                  >
                    Редактировать
                  </button>
                )}
              </div>
              {editing && editing !== "new" && editing.id === product.id && (
                <ProductEditor
                  product={editing}
                  onSaved={finish}
                  onCancel={() => setEditing(null)}
                />
              )}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export function Staff() {
  const session = useAppSelector((state) => state.session);
  if (session !== "staff") {
    return (
      <Empty
        title="Войдите как сотрудник"
        action="Выбрать профиль"
        to="/account"
      >
        Кабинет с заявками и редактором товаров доступен профилю сотрудника.
      </Empty>
    );
  }
  return <StaffWorkspace />;
}
