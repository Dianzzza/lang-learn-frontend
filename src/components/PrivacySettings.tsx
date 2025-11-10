
'use client';

import { useState } from 'react';
import styles from '../styles/SettingsForm.module.css';

// TypeScript types
interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showProgress: boolean;
  showActivity: boolean;
  allowFriendRequests: boolean;
  emailNewsletters: boolean;
}

interface PrivacySettingsProps {
  settings: PrivacySettings;
  onSave: (data: PrivacySettings) => Promise<void>;
  isLoading: boolean;
  onExportData: () => void;
  onDeleteAccount: () => void;
}

export default function PrivacySettings({ 
  settings, 
  onSave, 
  isLoading, 
  onExportData, 
  onDeleteAccount 
}: PrivacySettingsProps) {
  const [formData, setFormData] = useState<PrivacySettings>(settings);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  const handleInputChange = (field: keyof PrivacySettings, value: any): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    try {
      await onSave(formData);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving privacy settings:', error);
    }
  };

  const getVisibilityDescription = (visibility: PrivacySettings['profileVisibility']): string => {
    switch (visibility) {
      case 'public': return 'Wszyscy użytkownicy mogą zobaczyć Twój profil';
      case 'friends': return 'Tylko Twoi znajomi mogą zobaczyć Twój profil';
      case 'private': return 'Tylko Ty możesz zobaczyć swój profil';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.titleIcon}>🛡️</span>
          Prywatność i dane
        </h2>
        <p className={styles.description}>
          Kontroluj widoczność swoich danych i zarządzaj kontem
        </p>
      </div>

      <div className={styles.sectionsContainer}>
        
        {/* Privacy Settings */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>👁️</span>
              Widoczność profilu
            </h3>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            
            {/* Profile Visibility */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.labelText}>Kto może zobaczyć Twój profil?</span>
              </label>
              
              <div className={styles.toggleList}>
                {(['public', 'friends', 'private'] as const).map((visibility) => (
                  <label
                    key={visibility}
                    className={`${styles.toggleItem} ${formData.profileVisibility === visibility ? styles.selected : ''}`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value={visibility}
                      checked={formData.profileVisibility === visibility}
                      onChange={(e) => handleInputChange('profileVisibility', e.target.value)}
                      className={styles.radioInput}
                    />
                    <div className={styles.toggleInfo}>
                      <div className={styles.toggleIcon}>
                        {visibility === 'public' ? '🌍' : visibility === 'friends' ? '👥' : '🔒'}
                      </div>
                      <div className={styles.toggleText}>
                        <div className={styles.toggleTitle}>
                          {visibility === 'public' ? 'Publiczny' : 
                           visibility === 'friends' ? 'Znajomi' : 'Prywatny'}
                        </div>
                        <div className={styles.toggleDescription}>
                          {getVisibilityDescription(visibility)}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Profile Details Toggles */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span className={styles.labelText}>Szczegóły profilu</span>
              </label>
              
              <div className={styles.toggleList}>
                
                <div className={styles.toggleItem}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleIcon}>📈</span>
                    <div className={styles.toggleText}>
                      <div className={styles.toggleTitle}>Pokaż postęp nauki</div>
                      <div className={styles.toggleDescription}>Statystyki i ukończone kursy</div>
                    </div>
                  </div>
                  <label className={styles.toggleLabel}>
                    <input
                      type="checkbox"
                      checked={formData.showProgress}
                      onChange={() => handleInputChange('showProgress', !formData.showProgress)}
                      className={styles.toggleInput}
                    />
                    <div className={styles.toggle}>
                      <div className={styles.toggleSlider}></div>
                    </div>
                  </label>
                </div>

                <div className={styles.toggleItem}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleIcon}>⚡</span>
                    <div className={styles.toggleText}>
                      <div className={styles.toggleTitle}>Pokaż ostatnią aktywność</div>
                      <div className={styles.toggleDescription}>Historia ostatnich lekcji</div>
                    </div>
                  </div>
                  <label className={styles.toggleLabel}>
                    <input
                      type="checkbox"
                      checked={formData.showActivity}
                      onChange={() => handleInputChange('showActivity', !formData.showActivity)}
                      className={styles.toggleInput}
                    />
                    <div className={styles.toggle}>
                      <div className={styles.toggleSlider}></div>
                    </div>
                  </label>
                </div>

                <div className={styles.toggleItem}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleIcon}>👋</span>
                    <div className={styles.toggleText}>
                      <div className={styles.toggleTitle}>Pozwól na zaproszenia do znajomych</div>
                      <div className={styles.toggleDescription}>Inni mogą wysyłać zaproszenia</div>
                    </div>
                  </div>
                  <label className={styles.toggleLabel}>
                    <input
                      type="checkbox"
                      checked={formData.allowFriendRequests}
                      onChange={() => handleInputChange('allowFriendRequests', !formData.allowFriendRequests)}
                      className={styles.toggleInput}
                    />
                    <div className={styles.toggle}>
                      <div className={styles.toggleSlider}></div>
                    </div>
                  </label>
                </div>

                <div className={styles.toggleItem}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleIcon}>📬</span>
                    <div className={styles.toggleText}>
                      <div className={styles.toggleTitle}>Newsletter</div>
                      <div className={styles.toggleDescription}>Porady i nowości od LangLearn</div>
                    </div>
                  </div>
                  <label className={styles.toggleLabel}>
                    <input
                      type="checkbox"
                      checked={formData.emailNewsletters}
                      onChange={() => handleInputChange('emailNewsletters', !formData.emailNewsletters)}
                      className={styles.toggleInput}
                    />
                    <div className={styles.toggle}>
                      <div className={styles.toggleSlider}></div>
                    </div>
                  </label>
                </div>

              </div>
            </div>

            {/* Submit Privacy */}
            <div className={styles.actions}>
              <button
                type="submit"
                disabled={!hasChanges || isLoading}
                className={`${styles.saveBtn} ${!hasChanges ? styles.disabled : ''}`}
              >
                {isLoading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Zapisywanie...
                  </>
                ) : (
                  <>
                    <span className={styles.saveIcon}>💾</span>
                    Zapisz ustawienia prywatności
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Data Management */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>💾</span>
              Zarządzanie danymi
            </h3>
            <p className={styles.sectionDescription}>
              Eksportuj lub usuń swoje dane
            </p>
          </div>

          <div className={styles.toggleList}>
            <button
              onClick={onExportData}
              className={styles.toggleItem}
            >
              <div className={styles.toggleInfo}>
                <span className={styles.toggleIcon}>📄</span>
                <div className={styles.toggleText}>
                  <div className={styles.toggleTitle}>Eksportuj dane</div>
                  <div className={styles.toggleDescription}>
                    Pobierz kopię swoich danych w formacie JSON
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Account Deletion */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⚠️</span>
              Strefa niebezpieczna
            </h3>
            <p className={styles.sectionDescription}>
              Nieodwracalne akcje na koncie
            </p>
          </div>

          <div className={styles.toggleList}>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className={`${styles.toggleItem} ${styles.dangerItem}`}
              >
                <div className={styles.toggleInfo}>
                  <span className={styles.toggleIcon}>🗑️</span>
                  <div className={styles.toggleText}>
                    <div className={styles.toggleTitle}>Usuń konto</div>
                    <div className={styles.toggleDescription}>
                      Trwale usuń swoje konto i wszystkie dane
                    </div>
                  </div>
                </div>
              </button>
            ) : (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h4 className={styles.sectionTitle}>
                    <span className={styles.sectionIcon}>⚠️</span>
                    Czy na pewno chcesz usunąć konto?
                  </h4>
                  <p className={styles.sectionDescription}>
                    Ta akcja jest nieodwracalna. Wszystkie dane zostaną trwale usunięte.
                  </p>
                </div>
                
                <div className={styles.actions}>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className={styles.cancelBtn}
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={onDeleteAccount}
                    className={styles.dangerBtn}
                  >
                    Tak, usuń konto
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}