import { Link, NavLink } from "react-router-dom";
import type { Session } from "../domain";
import { profileNames } from "../profileOptions";
import { Bag } from "./Shared";

export function ShopHeader({
  count,
  session,
}: {
  count: number;
  session: Session;
}) {
  const isStaff = session === "staff";
  return (
    <>
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
            <NavLink to={isStaff ? "/staff" : "/orders"}>
              {isStaff ? "Кабинет сотрудника" : "Мои заказы"}
            </NavLink>
            <NavLink to="/account" className="profile-link">
              Профиль{" "}
              <span className="profile-name">{profileNames[session]}</span>
            </NavLink>
          </nav>
          <Link
            className="cart-link"
            to="/cart"
            aria-label={`Корзина, ${count} шт.`}
          >
            <Bag />
            <span>Корзина</span>
            <span className="cart-count">{count}</span>
          </Link>
        </header>
      </div>
    </>
  );
}
