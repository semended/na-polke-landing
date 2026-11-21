import type { FormEventHandler } from "react";
import type { Checkout } from "../domain";
import { Field } from "./Field";

type Props = {
  draft: Checkout;
  errors: Partial<Record<keyof Checkout, string>>;
  busy: boolean;
  submitError: string | null;
  onChange: (key: keyof Checkout, value: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export function CheckoutContactForm({
  draft,
  errors,
  busy,
  submitError,
  onChange,
  onSubmit,
}: Props) {
  return (
    <form
      className="checkout-form"
      id="checkout"
      onSubmit={onSubmit}
      noValidate
    >
      <h2>Ваши контакты</h2>
      <p className="form-hint">
        Имя и телефон обязательны. Данные останутся только в этом браузере.
      </p>
      <fieldset disabled={busy}>
        <div className="fields">
          <Field
            label="Имя"
            name="name"
            value={draft.name}
            onChange={(v) => onChange("name", v)}
            error={errors.name}
          />
          <Field
            label="Телефон"
            name="phone"
            type="tel"
            value={draft.phone}
            onChange={(v) => onChange("phone", v)}
            error={errors.phone}
          />
          <Field
            label="Комментарий"
            name="comment"
            value={draft.comment}
            onChange={(v) => onChange("comment", v)}
            error={errors.comment}
            multiline
          />
        </div>
      </fieldset>
      <p className="field-note">
        Телефон: +7 или 8 и ещё 10 цифр. Комментарий — до 500 символов.
      </p>
      <h2 className="delivery-title">Получение заказа</h2>
      <div className="pickup">
        <span className="pickup-dot" />
        <div>
          <b>Самовывоз · бесплатно</b>
          <p>
            Оплата при получении. Наличие и время самовывоза уточняет сотрудник.
          </p>
        </div>
      </div>
      {submitError ? (
        <p className="form-error" role="alert">
          {submitError}
        </p>
      ) : null}
      {busy ? (
        <p className="subtle" role="status">
          Сохраняем ваш учебный заказ…
        </p>
      ) : null}
    </form>
  );
}
