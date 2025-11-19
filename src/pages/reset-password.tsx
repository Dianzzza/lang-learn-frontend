import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/resetPassword.module.css";
import { apiRequest } from "../lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Jeśli nie ma tokenu → czekamy aż się pojawi po stronie klienta
  useEffect(() => {
    if (token === undefined) return;
    if (!token) setError("Brak tokenu resetu hasła.");
  }, [token]);

  const validateForm = () => {
    if (password.length < 6) {
      setError("Hasło musi mieć co najmniej 6 znaków.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Hasła muszą być takie same.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;
    if (typeof token !== "string") {
      setError("Nieprawidłowy token.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiRequest<{ message: string }>("/api/auth/reset-password", "POST", {
        token,
        newPassword: password,
      });

      setSuccess(res.message);
      setTimeout(() => router.push("/"), 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Wystąpił błąd";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>Ustaw nowe hasło</h1>

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        {!success && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <label>
              Nowe hasło
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </label>

            <label>
              Powtórz hasło
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? "Przetwarzanie..." : "Zmień hasło"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
