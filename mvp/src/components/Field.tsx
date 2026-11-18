import { useId } from "react";
interface Props {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  multiline?: boolean;
}
export function Field({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  multiline = false,
}: Props) {
  const id = useId();
  const common = {
    id,
    name,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
    "aria-invalid": !!error,
    "aria-describedby": error ? `${id}-error` : undefined,
  };
  return (
    <div className={`field ${multiline ? "full" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea {...common} rows={3} />
      ) : (
        <input
          {...common}
          type={type}
          autoComplete={
            name === "name" ? "given-name" : name === "phone" ? "tel" : "off"
          }
        />
      )}
      {error ? (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
