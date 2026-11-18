import { useNavigate } from "react-router-dom";
import { switchSession, useAppDispatch, useAppSelector } from "../store";
import "./staff.css";

const profiles = {
  guest: { name: "Гость", path: "/catalog" },
  anna: { name: "Анна", path: "/orders" },
  ivan: { name: "Иван", path: "/orders" },
  staff: { name: "Сотрудник", path: "/staff" },
} as const;

export function Account() {
  const session = useAppSelector((state) => state.session);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  function enter(profile: keyof typeof profiles) {
    dispatch(switchSession(profile));
    navigate(profiles[profile].path);
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Демо-вход</h1>
          <p>
            Выберите профиль. Заказы и изменения каталога хранятся в этом
            браузере.
          </p>
        </div>
      </div>
      <section className="work-panel profile-panel">
        <h2>Сейчас вы — {profiles[session].name}</h2>
        <p>
          Покупатели видят свои заказы. Сотрудник видит заявки магазина и может
          обновлять каталог.
        </p>
        <div className="work-actions" aria-label="Демо-профили">
          <button className="btn secondary" onClick={() => enter("anna")}>
            Войти как Анна
          </button>
          <button className="btn secondary" onClick={() => enter("ivan")}>
            Войти как Иван
          </button>
          <button className="btn" onClick={() => enter("staff")}>
            Войти как сотрудник
          </button>
        </div>
        <button className="work-link" onClick={() => enter("guest")}>
          {session === "guest" ? "Продолжить как гость" : "Выйти из профиля"}
        </button>
      </section>
    </>
  );
}
