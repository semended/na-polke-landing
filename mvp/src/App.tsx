import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector, addItem, selectCount } from "./store";
import { canBuy } from "./domain";
import { storageReadFailed } from "./storage";
import { ShopHeader } from "./components/ShopHeader";
import { ShopRoutes } from "./ShopRoutes";

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
      <ShopHeader count={count} session={session} />
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
          <ShopRoutes onAdd={add} />
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
            <br />
            <a
              className="backlink"
              href="https://github.com/semended/na-polke-landing/blob/main/SOURCES.md#фотографии-в-приложении-этапа-3"
            >
              Источники фотографий
            </a>
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
