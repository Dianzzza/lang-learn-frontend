'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import styles from '@/styles/FlashcardCreator.module.css';
import { apiRequest } from '@/lib/api';

interface Category {
  id: number;
  name: string;
}

interface FlashcardData {
  id: string;
  front: string;
  back: string;
}

export default function SimpleFlashcardCreator() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([
    { id: '1', front: '', back: '' },
  ]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // pobierz istniejące kategorie z backendu
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await apiRequest<Category[]>('/categories', 'GET');
        setCategories(data);
        if (data.length > 0) {
          setSelectedCategoryId(data[0].id);
        }
      } catch (e) {
        console.error('Błąd ładowania kategorii:', e);
        alert('Nie udało się załadować kategorii');
      }
    };
    loadCategories();
  }, []);

  // dodaj nową pustą fiszkę
  const addNewCard = () => {
    const newCard: FlashcardData = {
      id: Date.now().toString(),
      front: '',
      back: '',
    };
    setFlashcards((prev) => [...prev, newCard]);
    setCurrentCardIndex(flashcards.length);
  };

  // usuń fiszkę
  const deleteCard = (index: number) => {
    if (flashcards.length === 1) return;
    const newCards = flashcards.filter((_, i) => i !== index);
    setFlashcards(newCards);
    if (currentCardIndex >= newCards.length) {
      setCurrentCardIndex(newCards.length - 1);
    }
  };

  // aktualizuj front/back
  const updateCard = (
    index: number,
    field: keyof FlashcardData,
    value: string
  ) => {
    const newCards = [...flashcards];
    newCards[index] = { ...newCards[index], [field]: value };
    setFlashcards(newCards);
  };

  // zapisz fiszki do wybranej kategorii
  const saveFlashcards = async () => {
    if (!selectedCategoryId) {
      alert('Wybierz kategorię.');
      return;
    }

    const completedCards = flashcards.filter(
      (card) => card.front.trim() && card.back.trim()
    );
    if (completedCards.length === 0) {
      alert('Dodaj przynajmniej jedną uzupełnioną fiszkę.');
      return;
    }

    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('token')
        : null;
    if (!token) {
      alert('Musisz być zalogowany, aby dodać fiszki.');
      return;
    }

    try {
      setIsSaving(true);
      for (const card of completedCards) {
        await apiRequest(
          '/flashcards',
          'POST',
          {
            front: card.front,
            back: card.back,
            categoryId: selectedCategoryId,
            isGlobal: false, // prywatne fiszki użytkownika
          },
          token
        );
      }
      alert('Fiszki zapisane!');
      router.push('/flashcards');
    } catch (e: any) {
      console.error('Błąd zapisu fiszek:', e);
      alert(e?.message ?? 'Nie udało się zapisać fiszek.');
    } finally {
      setIsSaving(false);
    }
  };

  const currentCard = flashcards[currentCardIndex];

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>
            <span className={styles.titleIcon}>➕</span>
            Dodaj własne fiszki
          </h1>

          {/* wybór istniejącej kategorii */}
          <div className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.labelIcon}>🏷️</span>
                Kategoria (istniejąca)
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

          {/* edycja jednej aktualnej karty */}
          <div className={styles.stepContent}>
            <div className={styles.stepHeader}>
              <h2 className={styles.stepTitle}>
                <span className={styles.stepIcon}>🃏</span>
                Fiszka {currentCardIndex + 1} z {flashcards.length}
              </h2>
            </div>

            {/* nawigacja po kartach */}
            <div className={styles.cardNavigation}>
              <button
                onClick={() =>
                  setCurrentCardIndex(Math.max(0, currentCardIndex - 1))
                }
                disabled={currentCardIndex === 0}
                className={styles.navBtn}
              >
                ← Poprzednia
              </button>
              <div className={styles.cardCounter}>
                {currentCardIndex + 1} / {flashcards.length}
              </div>
              <button
                onClick={() =>
                  setCurrentCardIndex(
                    Math.min(
                      flashcards.length - 1,
                      currentCardIndex + 1
                    )
                  )
                }
                disabled={currentCardIndex === flashcards.length - 1}
                className={styles.navBtn}
              >
                Następna →
              </button>
            </div>

            {/* edytor przód/tył */}
            <div className={styles.cardEditor}>
              <div className={styles.cardSides}>
                <div className={styles.cardSide}>
                  <label className={styles.cardLabel}>
                    <span className={styles.cardIcon}>📖</span>
                    Przód (słowo/pytanie)
                  </label>
                  <textarea
                    placeholder="Co chcesz się nauczyć?"
                    value={currentCard.front}
                    onChange={(e) =>
                      updateCard(
                        currentCardIndex,
                        'front',
                        e.target.value
                      )
                    }
                    className={styles.cardTextarea}
                    rows={3}
                  />
                </div>

                <div className={styles.cardSide}>
                  <label className={styles.cardLabel}>
                    <span className={styles.cardIcon}>💡</span>
                    Tył (odpowiedź/tłumaczenie)
                  </label>
                  <textarea
                    placeholder="Jaka jest odpowiedź?"
                    value={currentCard.back}
                    onChange={(e) =>
                      updateCard(
                        currentCardIndex,
                        'back',
                        e.target.value
                      )
                    }
                    className={styles.cardTextarea}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* akcje kart */}
            <div className={styles.cardActions}>
              <button
                onClick={addNewCard}
                className={styles.addCardBtn}
              >
                <span className={styles.addIcon}>➕</span>
                Dodaj kolejną fiszkę
              </button>

              {flashcards.length > 1 && (
                <button
                  onClick={() => deleteCard(currentCardIndex)}
                  className={styles.deleteCardBtn}
                >
                  <span className={styles.deleteIcon}>🗑️</span>
                  Usuń tę fiszkę
                </button>
              )}
            </div>

            {/* zapis */}
            <div className={styles.stepActions}>
              <button
                onClick={() => router.push('/flashcards')}
                className={styles.backBtn}
              >
                ← Anuluj
              </button>
              <button
                onClick={saveFlashcards}
                disabled={isSaving}
                className={styles.saveBtn}
              >
                <span className={styles.saveIcon}>💾</span>
                {isSaving ? 'Zapisywanie...' : 'Zapisz fiszki'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
