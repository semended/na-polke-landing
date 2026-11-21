import { Link, NavLink, useLocation } from "react-router-dom";
import { money, type Session } from "../domain";
import { profileNames } from "../profileOptions";
import { Bag } from "./Shared";
import { CatalogSearch } from "./CatalogSearch";

export function ShopHeader({
  count,
  total,
  session,
}: {
  count: number;
  total: number;
  session: Session;
}) {
  const { pathname } = useLocation();
  const isStaff = session === "staff";
  return (
    <header className="shop-masthead">
      <div className="header wrap">
        <Link className="logo" to="/catalog" aria-label="На полке, главная">
          <span aria-hidden="true" className="shop-mark" />
          на полке
        </Link>
        <CatalogSearch key={pathname} />
        <nav className="nav" aria-label="Основное меню">
          <NavLink to="/catalog">Каталог</NavLink>
          <NavLink to={isStaff ? "/staff" : "/orders"}>
            {isStaff ? "Кабинет сотрудника" : "Мои заказы"}
          </NavLink>
          <NavLink
            to="/account"
            className="profile-link"
            aria-label={`Профиль · ${profileNames[session]}`}
          >
            <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M4.5 21v-2a7.5 7.5 0 0 1 15 0v2" />
            </svg>
            <span>
              {session === "guest" ? "Профиль" : profileNames[session]}
            </span>
          </NavLink>
        </nav>
        <Link
          className="cart-link"
          to="/cart"
          aria-label={`Корзина, ${count} шт., ${money(total)}`}
        >
          <Bag />
          <span>{count ? money(total) : "Корзина"}</span>
          {count > 0 && <span className="cart-count">{count}</span>}
        </Link>
      </div>
    </header>
  );
}
