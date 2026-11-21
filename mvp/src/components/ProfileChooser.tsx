import type { Session } from "../domain";
import { profileNames } from "../profileOptions";
import "../styles/staff.css";

export function ProfileChooser({
  session,
  onChoose,
}: {
  session: Session;
  onChoose: (profile: Session) => void;
}) {
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
        <h2>Сейчас вы — {profileNames[session]}</h2>
        <p>
          Покупатели видят свои заказы. Сотрудник видит заявки магазина и может
          обновлять каталог.
        </p>
        <div className="work-actions" aria-label="Демо-профили">
          <button className="btn secondary" onClick={() => onChoose("anna")}>
            Войти как Анна
          </button>
          <button className="btn secondary" onClick={() => onChoose("ivan")}>
            Войти как Иван
          </button>
          <button className="btn" onClick={() => onChoose("staff")}>
            Войти как сотрудник
          </button>
        </div>
        <button className="work-link" onClick={() => onChoose("guest")}>
          {session === "guest" ? "Продолжить как гость" : "Выйти из профиля"}
        </button>
      </section>
    </>
  );
}
