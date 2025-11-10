// pages/flashcards/create.tsx
// EKRAN 2: Tworzenie własnych zestawów fiszek

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import styles from '@/styles/FlashcardCreator.module.css';

interface FlashcardData {
  id: string;
  front: string;
  back: string;
  image?: string;
  audio?: string;
  hint?: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

interface DeckData {
  title: string;
  description: string;
  category: string;
  difficulty: 'Łatwe' | 'Średnie' | 'Trudne';
  tags: string[];
  isPublic: boolean;
  estimatedTime: string;
}

export default function FlashcardCreator() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [deckData, setDeckData] = useState<DeckData>({
    title: '',
    description: '',
    category: 'Vocabulary',
    difficulty: 'Łatwe',
    tags: [],
    isPublic: false,
    estimatedTime: '10-15 min'
  });

  const [flashcards, setFlashcards] = useState<FlashcardData[]>([
    {
      id: '1',
      front: '',
      back: '',
      tags: [],
      difficulty: 'easy'
    }
  ]);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [tagInput, setTagInput] = useState('');
  const [importMode, setImportMode] = useState<'manual' | 'csv' | 'ai'>('manual');

  const categories = ['Vocabulary', 'Grammar', 'Business', 'Conversation', 'Pronunciation'];
  const difficulties = ['Łatwe', 'Średnie', 'Trudne'];

  // 🃏 DODAJ NOWĄ FISZKĘ
  const addNewCard = () => {
    const newCard: FlashcardData = {
      id: Date.now().toString(),
      front: '',
      back: '',
      tags: [],
      difficulty: 'easy'
    };
    setFlashcards([...flashcards, newCard]);
    setCurrentCardIndex(flashcards.length);
  };

  // 🗑️ USUŃ FISZKĘ
  const deleteCard = (index: number) => {
    if (flashcards.length === 1) return; // Zawsze przynajmniej 1 karta
    
    const newCards = flashcards.filter((_, i) => i !== index);
    setFlashcards(newCards);
    
    if (currentCardIndex >= newCards.length) {
      setCurrentCardIndex(newCards.length - 1);
    }
  };

  // ✏️ AKTUALIZUJ FISZKĘ
  const updateCard = (index: number, field: keyof FlashcardData, value: any) => {
    const newCards = [...flashcards];
    newCards[index] = { ...newCards[index], [field]: value };
    setFlashcards(newCards);
  };

  // 🏷️ DODAJ TAG
  const addTag = () => {
    if (tagInput.trim() && !deckData.tags.includes(tagInput.trim())) {
      setDeckData({
        ...deckData,
        tags: [...deckData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  // 🗑️ USUŃ TAG
  const removeTag = (tagToRemove: string) => {
    setDeckData({
      ...deckData,
      tags: deckData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // 💾 ZAPISZ ZESTAW
  const saveDeck = async () => {
    const completedCards = flashcards.filter(card => 
      card.front.trim() && card.back.trim()
    );

    if (!deckData.title.trim()) {
      alert('Wprowadź tytuł zestawu!');
      return;
    }

    if (completedCards.length === 0) {
      alert('Dodaj przynajmniej jedną fiszkę!');
      return;
    }

    // TODO: Zapisz do bazy danych
    console.log('Saving deck:', { deckData, flashcards: completedCards });
    
    // Przekieruj do zestawu
    router.push('/flashcards');
  };

  // 📤 IMPORT CSV
  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split('\n').filter(line => line.trim());
      
      const importedCards: FlashcardData[] = lines.map((line, index) => {
        const [front, back, hint = ''] = line.split(',').map(s => s.trim());
        return {
          id: `imported-${index}`,
          front: front || '',
          back: back || '',
          hint: hint || undefined,
          tags: [],
          difficulty: 'easy' as const
        };
      }).filter(card => card.front && card.back);

      if (importedCards.length > 0) {
        setFlashcards(importedCards);
        setCurrentCardIndex(0);
      }
    };
    reader.readAsText(file);
  };

  // 🤖 AI GENERATION (placeholder)
  const generateWithAI = async () => {
    // TODO: Integracja z AI do generowania fiszek
    alert('Funkcja AI będzie dostępna wkrótce!');
  };

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.container}>
          
          {/* 📈 PROGRESS INDICATOR */}
          <div className={styles.progressIndicator}>
            <div className={styles.steps}>
              <div className={`${styles.step} ${currentStep >= 1 ? styles.active : ''}`}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepLabel}>Informacje</div>
              </div>
              <div className={styles.stepConnector}></div>
              <div className={`${styles.step} ${currentStep >= 2 ? styles.active : ''}`}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepLabel}>Fiszki</div>
              </div>
              <div className={styles.stepConnector}></div>
              <div className={`${styles.step} ${currentStep >= 3 ? styles.active : ''}`}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepLabel}>Podgląd</div>
              </div>
            </div>
          </div>

          {/* 🎯 STEP 1: DECK INFO */}
          {currentStep === 1 && (
            <div className={styles.stepContent}>
              <div className={styles.stepHeader}>
                <h2 className={styles.stepTitle}>
                  <span className={styles.stepIcon}>📝</span>
                  Informacje o zestawie
                </h2>
                <p className={styles.stepDescription}>
                  Podaj podstawowe informacje o swoim zestawie fiszek
                </p>
              </div>

              <div className={styles.form}>
                
                {/* TYTUŁ */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span className={styles.labelIcon}>📚</span>
                    Tytuł zestawu *
                  </label>
                  <input
                    type="text"
                    placeholder="np. Business English Vocabulary"
                    value={deckData.title}
                    onChange={(e) => setDeckData({...deckData, title: e.target.value})}
                    className={styles.input}
                  />
                </div>

                {/* OPIS */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span className={styles.labelIcon}>📄</span>
                    Opis zestawu
                  </label>
                  <textarea
                    placeholder="Opisz co zawiera ten zestaw fiszek..."
                    value={deckData.description}
                    onChange={(e) => setDeckData({...deckData, description: e.target.value})}
                    className={styles.textarea}
                    rows={3}
                  />
                </div>

                {/* KATEGORIA & POZIOM */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      <span className={styles.labelIcon}>🏷️</span>
                      Kategoria
                    </label>
                    <select
                      value={deckData.category}
                      onChange={(e) => setDeckData({...deckData, category: e.target.value})}
                      className={styles.select}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      <span className={styles.labelIcon}>📊</span>
                      Poziom trudności
                    </label>
                    <select
                      value={deckData.difficulty}
                      onChange={(e) => setDeckData({...deckData, difficulty: e.target.value as any})}
                      className={styles.select}
                    >
                      {difficulties.map(diff => (
                        <option key={diff} value={diff}>{diff}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* TAGI */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span className={styles.labelIcon}>🏷️</span>
                    Tagi (ułatwią wyszukiwanie)
                  </label>
                  <div className={styles.tagInput}>
                    <input
                      type="text"
                      placeholder="Dodaj tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      className={styles.input}
                    />
                    <button 
                      type="button" 
                      onClick={addTag}
                      className={styles.addTagBtn}
                    >
                      Dodaj
                    </button>
                  </div>
                  {deckData.tags.length > 0 && (
                    <div className={styles.tagsPreview}>
                      {deckData.tags.map(tag => (
                        <span key={tag} className={styles.tag}>
                          #{tag}
                          <button 
                            onClick={() => removeTag(tag)}
                            className={styles.removeTag}
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* USTAWIENIA */}
                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={deckData.isPublic}
                      onChange={(e) => setDeckData({...deckData, isPublic: e.target.checked})}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkboxText}>
                      <span className={styles.checkboxIcon}>🌐</span>
                      Udostępnij publicznie (inni użytkownicy będą mogli używać)
                    </span>
                  </label>
                </div>

              </div>

              <div className={styles.stepActions}>
                <button 
                  onClick={() => setCurrentStep(2)}
                  disabled={!deckData.title.trim()}
                  className={styles.nextBtn}
                >
                  Dalej: Dodaj fiszki →
                </button>
              </div>
            </div>
          )}

          {/* 🃏 STEP 2: CARDS CREATION */}
          {currentStep === 2 && (
            <div className={styles.stepContent}>
              <div className={styles.stepHeader}>
                <h2 className={styles.stepTitle}>
                  <span className={styles.stepIcon}>🃏</span>
                  Tworzenie fiszek
                </h2>
                <p className={styles.stepDescription}>
                  Dodaj karty do swojego zestawu. Karta {currentCardIndex + 1} z {flashcards.length}
                </p>
              </div>

              {/* 🔄 IMPORT MODES */}
              <div className={styles.importModes}>
                <button 
                  className={`${styles.modeBtn} ${importMode === 'manual' ? styles.active : ''}`}
                  onClick={() => setImportMode('manual')}
                >
                  <span className={styles.modeIcon}>✏️</span>
                  Ręczne dodawanie
                </button>
                <button 
                  className={`${styles.modeBtn} ${importMode === 'csv' ? styles.active : ''}`}
                  onClick={() => setImportMode('csv')}
                >
                  <span className={styles.modeIcon}>📄</span>
                  Import z CSV
                </button>
                <button 
                  className={`${styles.modeBtn} ${importMode === 'ai' ? styles.active : ''}`}
                  onClick={() => setImportMode('ai')}
                >
                  <span className={styles.modeIcon}>🤖</span>
                  Generuj z AI
                </button>
              </div>

              {/* ✏️ MANUAL MODE */}
              {importMode === 'manual' && (
                <div className={styles.manualMode}>
                  
                  {/* 📋 CARD NAVIGATION */}
                  <div className={styles.cardNavigation}>
                    <button 
                      onClick={() => setCurrentCardIndex(Math.max(0, currentCardIndex - 1))}
                      disabled={currentCardIndex === 0}
                      className={styles.navBtn}
                    >
                      ← Poprzednia
                    </button>
                    
                    <div className={styles.cardCounter}>
                      {currentCardIndex + 1} / {flashcards.length}
                    </div>
                    
                    <button 
                      onClick={() => setCurrentCardIndex(Math.min(flashcards.length - 1, currentCardIndex + 1))}
                      disabled={currentCardIndex === flashcards.length - 1}
                      className={styles.navBtn}
                    >
                      Następna →
                    </button>
                  </div>

                  {/* 🃏 CARD EDITOR */}
                  <div className={styles.cardEditor}>
                    <div className={styles.cardSides}>
                      
                      {/* PRZÓD */}
                      <div className={styles.cardSide}>
                        <label className={styles.cardLabel}>
                          <span className={styles.cardIcon}>📖</span>
                          Przód karty (pytanie/słowo)
                        </label>
                        <textarea
                          placeholder="Co chcesz się nauczyć?"
                          value={flashcards[currentCardIndex]?.front || ''}
                          onChange={(e) => updateCard(currentCardIndex, 'front', e.target.value)}
                          className={styles.cardTextarea}
                          rows={4}
                        />
                      </div>

                      {/* TYŁ */}
                      <div className={styles.cardSide}>
                        <label className={styles.cardLabel}>
                          <span className={styles.cardIcon}>💡</span>
                          Tył karty (odpowiedź/tłumaczenie)
                        </label>
                        <textarea
                          placeholder="Jaka jest odpowiedź?"
                          value={flashcards[currentCardIndex]?.back || ''}
                          onChange={(e) => updateCard(currentCardIndex, 'back', e.target.value)}
                          className={styles.cardTextarea}
                          rows={4}
                        />
                      </div>
                    </div>

                    {/* 💡 PODPOWIEDŹ */}
                    <div className={styles.cardExtras}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          <span className={styles.labelIcon}>💡</span>
                          Podpowiedź (opcjonalnie)
                        </label>
                        <input
                          type="text"
                          placeholder="Dodaj podpowiedź..."
                          value={flashcards[currentCardIndex]?.hint || ''}
                          onChange={(e) => updateCard(currentCardIndex, 'hint', e.target.value)}
                          className={styles.input}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          <span className={styles.labelIcon}>📊</span>
                          Trudność karty
                        </label>
                        <select
                          value={flashcards[currentCardIndex]?.difficulty || 'easy'}
                          onChange={(e) => updateCard(currentCardIndex, 'difficulty', e.target.value)}
                          className={styles.select}
                        >
                          <option value="easy">Łatwa</option>
                          <option value="medium">Średnia</option>
                          <option value="hard">Trudna</option>
                        </select>
                      </div>
                    </div>

                    {/* 🖼️ MEDIA ATTACHMENTS */}
                    <div className={styles.mediaSection}>
                      <h4 className={styles.mediaTitle}>
                        <span className={styles.mediaIcon}>📎</span>
                        Załączniki (opcjonalnie)
                      </h4>
                      <div className={styles.mediaButtons}>
                        <label className={styles.mediaBtn}>
                          <span className={styles.mediaBtnIcon}>🖼️</span>
                          Dodaj obraz
                          <input type="file" accept="image/*" className={styles.hiddenInput} />
                        </label>
                        <label className={styles.mediaBtn}>
                          <span className={styles.mediaBtnIcon}>🎵</span>
                          Dodaj dźwięk
                          <input type="file" accept="audio/*" className={styles.hiddenInput} />
                        </label>
                      </div>
                    </div>

                  </div>

                  {/* 🎮 CARD ACTIONS */}
                  <div className={styles.cardActions}>
                    <button 
                      onClick={addNewCard}
                      className={styles.addCardBtn}
                    >
                      <span className={styles.addIcon}>➕</span>
                      Dodaj nową fiszkę
                    </button>
                    
                    {flashcards.length > 1 && (
                      <button 
                        onClick={() => deleteCard(currentCardIndex)}
                        className={styles.deleteCardBtn}
                      >
                        <span className={styles.deleteIcon}>🗑️</span>
                        Usuń fiszkę
                      </button>
                    )}
                  </div>

                </div>
              )}

              {/* 📄 CSV IMPORT MODE */}
              {importMode === 'csv' && (
                <div className={styles.csvMode}>
                  <div className={styles.csvInfo}>
                    <h4 className={styles.csvTitle}>
                      <span className={styles.csvIcon}>📄</span>
                      Import z pliku CSV
                    </h4>
                    <p className={styles.csvDescription}>
                      Uploaduj plik CSV z kolumnami: Przód,Tył,Podpowiedź
                    </p>
                    <div className={styles.csvExample}>
                      <strong>Przykład:</strong><br />
                      Hello,Cześć,Podstawowe powitanie<br />
                      Goodbye,Do widzenia,Pożegnanie
                    </div>
                  </div>
                  <div className={styles.csvUpload}>
                    <label className={styles.uploadBtn}>
                      <span className={styles.uploadIcon}>📤</span>
                      Wybierz plik CSV
                      <input 
                        type="file" 
                        accept=".csv"
                        onChange={handleCSVImport}
                        className={styles.hiddenInput}
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* 🤖 AI MODE */}
              {importMode === 'ai' && (
                <div className={styles.aiMode}>
                  <div className={styles.aiInfo}>
                    <h4 className={styles.aiTitle}>
                      <span className={styles.aiIcon}>🤖</span>
                      Generowanie fiszek z AI
                    </h4>
                    <p className={styles.aiDescription}>
                      AI pomoże Ci wygenerować fiszki na podstawie tematu lub tekstu
                    </p>
                  </div>
                  <div className={styles.aiInput}>
                    <textarea
                      placeholder="Opisz temat lub wklej tekst, z którego AI wygeneruje fiszki..."
                      className={styles.textarea}
                      rows={6}
                    />
                    <button 
                      onClick={generateWithAI}
                      className={styles.generateBtn}
                    >
                      <span className={styles.generateIcon}>✨</span>
                      Wygeneruj fiszki
                    </button>
                  </div>
                </div>
              )}

              <div className={styles.stepActions}>
                <button 
                  onClick={() => router.push('/flashcards')}
                  className={styles.backBtn}
                >
                  ← Anuluj
                </button>
                <button 
                  onClick={() => setCurrentStep(3)}
                  disabled={flashcards.filter(c => c.front.trim() && c.back.trim()).length === 0}
                  className={styles.nextBtn}
                >
                  Dalej: Podgląd →
                </button>
              </div>
            </div>
          )}

          {/* 👁️ STEP 3: PREVIEW & SAVE */}
          {currentStep === 3 && (
            <div className={styles.stepContent}>
              <div className={styles.stepHeader}>
                <h2 className={styles.stepTitle}>
                  <span className={styles.stepIcon}>👁️</span>
                  Podgląd zestawu
                </h2>
                <p className={styles.stepDescription}>
                  Sprawdź swój zestaw przed zapisaniem
                </p>
              </div>

              {/* 📊 DECK SUMMARY */}
              <div className={styles.deckSummary}>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryHeader}>
                    <h3 className={styles.summaryTitle}>
                      <span className={styles.summaryIcon}>📚</span>
                      {deckData.title}
                    </h3>
                    <div className={styles.summaryMeta}>
                      <span className={styles.summaryCategory}>{deckData.category}</span>
                      <span className={styles.summaryDifficulty}>{deckData.difficulty}</span>
                    </div>
                  </div>
                  {deckData.description && (
                    <p className={styles.summaryDescription}>
                      {deckData.description}
                    </p>
                  )}
                  <div className={styles.summaryStats}>
                    <div className={styles.summaryStat}>
                      <span className={styles.summaryStatIcon}>🃏</span>
                      <span>{flashcards.filter(c => c.front.trim() && c.back.trim()).length} kart</span>
                    </div>
                    <div className={styles.summaryStat}>
                      <span className={styles.summaryStatIcon}>⏱️</span>
                      <span>{deckData.estimatedTime}</span>
                    </div>
                  </div>
                  {deckData.tags.length > 0 && (
                    <div className={styles.summaryTags}>
                      {deckData.tags.map(tag => (
                        <span key={tag} className={styles.summaryTag}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 🃏 CARDS PREVIEW */}
              <div className={styles.cardsPreview}>
                <h4 className={styles.previewTitle}>
                  <span className={styles.previewIcon}>🃏</span>
                  Podgląd fiszek ({flashcards.filter(c => c.front.trim() && c.back.trim()).length})
                </h4>
                <div className={styles.previewCards}>
                  {flashcards
                    .filter(card => card.front.trim() && card.back.trim())
                    .slice(0, 6) // Show first 6 cards
                    .map((card, index) => (
                    <div key={card.id} className={styles.previewCard}>
                      <div className={styles.previewCardFront}>
                        <strong>Przód:</strong> {card.front}
                      </div>
                      <div className={styles.previewCardBack}>
                        <strong>Tył:</strong> {card.back}
                      </div>
                      {card.hint && (
                        <div className={styles.previewCardHint}>
                          <strong>Podpowiedź:</strong> {card.hint}
                        </div>
                      )}
                    </div>
                  ))}
                  {flashcards.filter(c => c.front.trim() && c.back.trim()).length > 6 && (
                    <div className={styles.moreCards}>
                      ... i {flashcards.filter(c => c.front.trim() && c.back.trim()).length - 6} więcej kart
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.stepActions}>
                <button 
                  onClick={() => setCurrentStep(2)}
                  className={styles.backBtn}
                >
                  ← Wstecz
                </button>
                <button 
                  onClick={saveDeck}
                  className={styles.saveBtn}
                >
                  <span className={styles.saveIcon}>💾</span>
                  Zapisz zestaw
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}
