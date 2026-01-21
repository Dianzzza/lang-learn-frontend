/**
 * @file UserFlashcardsManager.tsx
 * @brief Panel zarządzania własnymi fiszkami użytkownika (CRUD).
 *
 * Umożliwia użytkownikowi:
 * 1. Tworzenie nowych fiszek w wybranej kategorii.
 * 2. Edycję istniejących fiszek.
 * 3. Usuwanie fiszek.
 * 4. Przeglądanie listy fiszek w danej kategorii.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import styles from '@/styles/FlashcardCreator.module.css';
import { apiRequest } from '@/lib/api';

/**
 * Reprezentacja kategorii pobranej z API.
 */
interface Category {
  id: number;
  name: string;
}

/**
 * Struktura fiszki w panelu edycji.
 */
interface Flashcard {
  id: number;
  front: string;
  back: string;
  categoryId: number | null;
}

/**
 * Komponent UserFlashcardsManager.
 *
 * @returns {JSX.Element} Widok kreatora fiszek.
 */
export default function UserFlashcardsManager() {
  const router = useRouter();
  
  // --- STANY DANYCH ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- STANY FORMULARZA ---
  /**
   * ID fiszki aktualnie edytowanej.
   * Jeśli null, formularz działa w trybie "Dodaj nową".
   * Jeśli number, formularz działa w trybie "Edytuj istniejącą".
   */
  const [editingId, setEditingId] = useState<number | null>(null);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [saving, setSaving] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  /**
   * Efekt 1: Inicjalizacja - pobranie listy kategorii.
   */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await apiRequest<Category[]>('/categories', 'GET');
        setCategories(data);
        // Automatycznie wybierz pierwszą kategorię
        if (data.length > 0) {
          setSelectedCategoryId(data[0].id);
        }
      } catch (e) {
        console.error('Błąd ładowania kategorii:', e);
        alert('Nie udało się załadować kategorii.');
      }
    };
    loadCategories();
  }, []);

  /**
   * Efekt 2: Pobranie fiszek po zmianie kategorii.
   * Pobiera TYLKO fiszki należące do użytkownika (endpoint `/flashcards/user`).
   */
  useEffect(() => {
    const loadFlashcards = async () => {
      if (!selectedCategoryId || !token) {
        setFlashcards([]);
        return;
      }
      setIsLoading(true);
      try {
        const data = await apiRequest<Flashcard[]>(
          `/flashcards/user?categoryId=${selectedCategoryId}`,
          'GET',
          undefined,
          token
        );
        setFlashcards(data);
      } catch (e) {
        console.error('Błąd ładowania fiszek:', e);
        alert('Nie udało się załadować fiszek.');
      } finally {
        setIsLoading(false);
      }
    };
    loadFlashcards();
  }, [selectedCategoryId, token]);

  /** Resetuje formularz do stanu początkowego (tryb dodawania). */
  const resetForm = () => {
    setEditingId(null);
    setFront('');
    setBack('');
  };

  /**
   * Obsługa dodawania nowej fiszki (POST).
   */
  const handleCreate = async () => {
    if (!token) {
      alert('Musisz być zalogowany.');
      return;
    }
    if (!selectedCategoryId) {
      alert('Wybierz kategorię.');
      return;
    }
    if (!front.trim() || !back.trim()) {
      alert('Uzupełnij przód i tył fiszki.');
      return;
    }

    try {
      setSaving(true);
      const created = await apiRequest<Flashcard>(
        '/flashcards',
        'POST',
        {
          front,
          back,
          categoryId: selectedCategoryId,
          isGlobal: false, // Fiszki użytkownika są zawsze prywatne
        },
        token
      );
      // Aktualizacja lokalnego stanu (Optymistycznie lub po sukcesie)
      setFlashcards((prev) => [...prev, created]);
      resetForm();
    } catch (e: any) {
      console.error('Błąd tworzenia fiszki:', e);
      alert(e?.message ?? 'Nie udało się dodać fiszki.');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Przełącza formularz w tryb edycji, wypełniając pola danymi wybranej fiszki.
   */
  const startEdit = (card: Flashcard) => {
    setEditingId(card.id);
    setFront(card.front);
    setBack(card.back);
  };

  /**
   * Obsługa zapisu zmian w istniejącej fiszce (PUT).
   */
  const handleUpdate = async () => {
    if (!editingId) return;
    if (!token) {
      alert('Musisz być zalogowany.');
      return;
    }
    if (!front.trim() || !back.trim()) {
      alert('Uzupełnij przód i tył fiszki.');
      return;
    }

    try {
      setSaving(true);
      const updated = await apiRequest<Flashcard>(
        `/flashcards/${editingId}`,
        'PUT',
        { front, back },
        token
      );
      // Aktualizacja elementu w tablicy
      setFlashcards((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      resetForm();
    } catch (e: any) {
      console.error('Błąd aktualizacji fiszki:', e);
      alert(e?.message ?? 'Nie udało się zaktualizować fiszki.');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Obsługa usuwania fiszki (DELETE).
   */
  const handleDelete = async (id: number) => {
    if (!token) {
      alert('Musisz być zalogowany.');
      return;
    }
    if (!confirm('Na pewno usunąć tę fiszkę?')) return;

    try {
      await apiRequest(
        `/flashcards/${id}`,
        'DELETE',
        undefined,
        token
      );
      // Usunięcie z lokalnego stanu
      setFlashcards((prev) => prev.filter((c) => c.id !== id));
      
      // Jeśli usuwamy fiszkę, która była właśnie edytowana, czyścimy formularz
      if (editingId === id) {
        resetForm();
      }
    } catch (e: any) {
      console.error('Błąd usuwania fiszki:', e);
      alert(e?.message ?? 'Nie udało się usunąć fiszki.');
    }
  };

  const isEditing = editingId !== null;

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>
            <span className={styles.titleIcon}>🃏</span>
            Twoje fiszki
          </h1>

          {/* Selektor kategorii */}
          <div className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.labelIcon}>🏷️</span>
                Kategoria
              </label>
              <select
                value={selectedCategoryId ?? ''}
                onChange={(e) =>
                  setSelectedCategoryId(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className={styles.select}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Formularz Edytora (Współdzielony dla Create/Update) */}
          <div className={styles.stepContent}>
            <div className={styles.stepHeader}>
              <h2 className={styles.stepTitle}>
                <span className={styles.stepIcon}>
                  {isEditing ? '✏️' : '➕'}
                </span>
                {isEditing ? 'Edytuj fiszkę' : 'Dodaj nową fiszkę'}
              </h2>
            </div>

            <div className={styles.cardEditor}>
              <div className={styles.cardSides}>
                <div className={styles.cardSide}>
                  <label className={styles.cardLabel}>
                    <span className={styles.cardIcon}>📖</span>
                    Przód
                  </label>
                  <textarea
                    placeholder="Co chcesz się nauczyć?"
                    value={front}
                    onChange={(e) => setFront(e.target.value)}
                    className={styles.cardTextarea}
                    rows={3}
                  />
                </div>
                <div className={styles.cardSide}>
                  <label className={styles.cardLabel}>
                    <span className={styles.cardIcon}>💡</span>
                    Tył
                  </label>
                  <textarea
                    placeholder="Jaka jest odpowiedź?"
                    value={back}
                    onChange={(e) => setBack(e.target.value)}
                    className={styles.cardTextarea}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className={styles.stepActions}>
              <button
                onClick={() => router.push('/flashcards')}
                className={styles.backBtn}
              >
                ← Wróć do zestawów
              </button>
              {isEditing && (
                <button
                  onClick={resetForm}
                  className={styles.backBtn}
                >
                  Anuluj edycję
                </button>
              )}
              <button
                onClick={isEditing ? handleUpdate : handleCreate}
                disabled={saving}
                className={styles.saveBtn}
              >
                <span className={styles.saveIcon}>
                  {isEditing ? '💾' : '➕'}
                </span>
                {saving
                  ? 'Zapisywanie...'
                  : isEditing
                  ? 'Zapisz zmiany'
                  : 'Dodaj fiszkę'}
              </button>
            </div>
          </div>

          {/* Lista podglądu fiszek */}
          <div className={styles.cardsPreview}>
            <h2 className={styles.previewTitle}>
              <span className={styles.previewIcon}>📋</span>
              Fiszki w tej kategorii
            </h2>

            {isLoading ? (
              <div className={styles.loadingText}>
                Ładowanie fiszek...
              </div>
            ) : flashcards.length === 0 ? (
              <div className={styles.emptyState}>
                Brak fiszek w tej kategorii.
              </div>
            ) : (
              <div className={styles.previewCards}>
                {flashcards.map((card) => (
                  <div
                    key={card.id}
                    className={styles.previewCard}
                  >
                    <div className={styles.previewCardFront}>
                      <strong>Przód:</strong> {card.front}
                    </div>
                    <div className={styles.previewCardBack}>
                      <strong>Tył:</strong> {card.back}
                    </div>
                    <div className={styles.cardActions}>
                      <button
                        onClick={() => startEdit(card)}
                        className={styles.editBtn}
                      >
                        ✏️ Edytuj
                      </button>
                      <button
                        onClick={() => handleDelete(card.id)}
                        className={styles.deleteCardBtn}
                      >
                        🗑️ Usuń
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}