import type { Session } from "./domain";

export const profileNames: Record<Session, string> = {
  guest: "Гость",
  anna: "Анна",
  ivan: "Иван",
  staff: "Сотрудник",
};

export const profileDestinations: Record<Session, string> = {
  guest: "/catalog",
  anna: "/orders",
  ivan: "/orders",
  staff: "/staff",
};
