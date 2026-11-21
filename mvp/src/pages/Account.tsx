import { useNavigate } from "react-router-dom";
import { ProfileChooser } from "../components/ProfileChooser";
import type { Session } from "../domain";
import { profileDestinations } from "../profileOptions";
import { switchSession, useAppDispatch, useAppSelector } from "../store";

export function Account() {
  const session = useAppSelector((state) => state.session);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  function enter(profile: Session) {
    dispatch(switchSession(profile));
    navigate(profileDestinations[profile]);
  }

  return <ProfileChooser session={session} onChoose={enter} />;
}
