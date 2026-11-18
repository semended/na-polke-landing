import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector, addItem, selectCount } from "./store";
import { Account } from "./pages/Account";
import { Staff } from "./pages/Staff";
import { canBuy } from "./domain";
import { storageReadFailed } from "./storage";
import { Bag, Empty } from "./components/Shared";
import { Home } from "./pages/Home";
import { Catalog } from "./pages/Catalog";
import { Product } from "./pages/Product";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { Orders, OrderDetail } from "./pages/Orders";
const pageTitles: Record<string, string> = {
  catalog: "Каталог",
  product: "Товар",
  cart: "Корзина",
  checkout: "Оформление",
  orders: "Заказы",
  account: "Профиль",
  staff: "Кабинет сотрудника",
};

export default function App() {
  const dispatch = useAppDispatch();
  const count = useAppSelector(selectCount);
  const session = useAppSelector((state) => state.session);
  const inventory = useAppSelector((state) => state.inventory);
  const location = useLocation();
  const main = useRef<HTMLElement>(null);
  const [toast, setToast] = useState("");
  const [storageError, setStorageError] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    clearTimeout(timer.current);
    setToast("");
    window.scrollTo(0, 0);
    main.current?.focus({ preventScroll: true });
    document.title =
      (pageTitles[location.pathname.split("/")[1]] ?? "Каталог и заказы") +
      " — На полке";
  }, [location.pathname]);
  useEffect(() => {
    const fail = () => setStorageError(true);
    window.addEventListener("storage-unavailable", fail);
    return () => {
      window.removeEventListener("storage-unavailable", fail);
      clearTimeout(timer.current);
    };
  }, []);
  function add(id: string) {
    const product = inventory.find((p) => p.id === id);
    if (!product || !canBuy(product)) return;
    dispatch(addItem(id));
    setToast(`${product.name} — в корзине`);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 2300);
  }
  return (
    <>
      <a
        className="skip"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
        }}
      >
        К содержимому
      </a>
      <div className="topbar">
        Учебный магазин · Самовывоз и оплата при получении
      </div>
      <div className="wrap">
        <header className="header">
          <Link className="logo" to="/" aria-label="На полке, главная">
            на полке
          </Link>
          <nav className="nav" aria-label="Основное меню">
            <NavLink to="/catalog">Каталог</NavLink>
            <NavLink to={session === "staff" ? "/staff" : "/orders"}>
              {session === "staff" ? "Кабинет сотрудника" : "Мои заказы"}
            </NavLink>
            <NavLink to="/account">Профиль</NavLink>
          </nav>
          <Link
            className="cart-link"
            to="/cart"
            aria-label={`Корзина, ${count} шт.`}
          >
            <Bag />
            <span className="cart-label">Корзина</span>
            <span className="cart-count">{count}</span>
          </Link>
        </header>
      </div>
      {storageError ? (
        <div className="storage-warning" role="alert">
          Браузер не разрешает сохранять данные. Изменения могут потеряться
          после закрытия страницы. Разрешите локальное хранилище, чтобы
          сохранить заказ.
        </div>
      ) : null}
      <main className="wrap main" id="main" ref={main} tabIndex={-1}>
        {storageReadFailed ? (
          <section className="empty" role="alert">
            <h1>Не удалось прочитать сохранённые данные</h1>
            <p>
              Разрешите браузеру доступ к локальному хранилищу и перезагрузите
              страницу. Запись отключена, чтобы сохранить прежнюю корзину и
              историю.
            </p>
            <button className="btn" onClick={() => window.location.reload()}>
              Перезагрузить страницу
            </button>
          </section>
        ) : (
          <Routes>
            <Route path="/" element={<Home onAdd={add} />} />
            <Route path="/catalog" element={<Catalog onAdd={add} />} />
            <Route path="/product/:id" element={<Product onAdd={add} />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/account" element={<Account />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route
              path="*"
              element={
                <Empty title="Такой страницы нет">
                  Вернитесь в каталог и выберите новый вкус.
                </Empty>
              }
            />
          </Routes>
        )}
      </main>
      <div className="wrap">
        <footer className="footer">
          <Link className="logo" to="/">
            на полке
          </Link>
          <span>
            Учебный магазин. Цены демонстрационные.
            <br />
            Данные сохраняются только в этом браузере.
          </span>
        </footer>
      </div>
      <div
        className={`toast ${toast ? "show" : ""}`}
        role="status"
        aria-live="polite"
      >
        {toast}
      </div>
    </>
  );
}
