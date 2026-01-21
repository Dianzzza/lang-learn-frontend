/**
 * @file reset-password.tsx
 * @brief Strona ustawiania nowego hasła.
 *
 * Jest to końcowy etap procesu odzyskiwania konta.
 * Użytkownik trafia tutaj z linku w emailu, który zawiera token weryfikacyjny (np. ?token=xyz).
 *
 * Główne funkcje:
 * 1. Odczyt tokena z parametru URL (`router.query.token`).
 * 2. Walidacja formularza (długość hasła, zgodność haseł).
 * 3. Komunikacja z API w celu finalnej zmiany hasła.
 * 4. Przekierowanie na stronę logowania po sukcesie.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
// Ten styl zostanie utworzony w późniejszym etapie
import styles from "../styles/resetPassword.module.css";
import { apiRequest } from "../lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  // Pobranie tokena z URL (np. /reset-password?token=12345abcdef)
  const { token } = router.query;

  // --- STANY FORMULARZA ---
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // --- STANY UI ---
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Efekt sprawdzający obecność tokena po załadowaniu routera.
   */
  useEffect(() => {
    // Next.js router.query jest puste przy pierwszym renderze po stronie serwera/hydracji
    if (token === undefined) return;
    if (!token) setError("Brak tokenu resetu hasła.");
  }, [token]);

  /**
   * Prosta walidacja klienta przed wysłaniem żądania.
   */
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

  /**
   * Obsługa wysłania formularza.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;
    
    // Zabezpieczenie typu tokena (musi być stringiem, nie tablicą)
    if (typeof token !== "string") {
      setError("Nieprawidłowy token.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Wywołanie API zmieniającego hasło w bazie
      const res = await apiRequest<{ message: string }>("api/auth/reset-password", "POST", {
        token,
        newPassword: password,
      });

      setSuccess(res.message);
      // Automatyczne przekierowanie na stronę główną/logowania po 2 sekundach
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

        {/* Sekcja komunikatów zwrotnych */}
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        {/* Formularz widoczny tylko jeśli nie ma sukcesu */}
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