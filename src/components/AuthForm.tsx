import { useState, type FormEvent } from "react";
import { normPhone, prettyPhone } from "../lib/time";
import { useApp } from "../state/AppContext";

/** Вход по телефону: номер → код. В демо подходит любой код из 4 цифр. */
export function AuthForm({ onDone, submitLabel = "Войти" }: { onDone?: () => void; submitLabel?: string }) {
  const { login } = useApp();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const norm = normPhone(phone);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (step === "phone") {
      if (!norm) return setError("Введите номер полностью: 10 цифр после +7");
      setError("");
      setStep("code");
      return;
    }
    if (!/^\d{4}$/.test(code)) return setError("Введите 4 цифры из СМС");
    login(norm!);
    onDone?.();
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      {step === "phone" ? (
        <label className="grid gap-2">
          <span className="caption">Номер телефона</span>
          <input
            key="phone"
            className="field mono"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+7 900 000-00-00"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-invalid={!!error}
            autoFocus
          />
        </label>
      ) : (
        <label className="grid gap-2">
          <span className="caption">Код из СМС на {prettyPhone(norm!)}</span>
          <input
            key="code"
            className="field mono tracking-[0.4em]"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={4}
            placeholder="0000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            aria-invalid={!!error}
            autoFocus
          />
        </label>
      )}
      {error && (
        <p role="alert" className="text-[14px]" style={{ color: "var(--busy-ink)" }}>
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-primary w-full">
        {step === "phone" ? "Получить код" : submitLabel}
      </button>
      {step === "code" ? (
        <div className="flex items-center justify-between gap-3">
          <p className="caption">Демо: подойдёт любой код.</p>
          <button
            type="button"
            className="min-h-[44px] text-[14px] text-muted underline underline-offset-4 hover:text-ink"
            onClick={() => {
              setStep("phone");
              setCode("");
              setError("");
            }}
          >
            Изменить номер
          </button>
        </div>
      ) : (
        <p className="caption">Пароль не нужен: пришлём код в СМС.</p>
      )}
    </form>
  );
}
