/**
 * @file next.config.js
 * @brief Główny plik konfiguracyjny frameworka Next.js.
 *
 * Plik ten eksportuje obiekt konfiguracyjny, który steruje zachowaniem
 * kompilatora, serwera deweloperskiego oraz procesem budowania aplikacji.
 */

/** * Typowanie konfiguracji dla lepszego wsparcia w IDE (IntelliSense).
 * @type {import('next').NextConfig} 
 */
const nextConfig = {
  /**
   * @brief Włącza tryb ścisły Reacta (React Strict Mode).
   *
   * @details W trybie deweloperskim renderuje komponenty dwukrotnie, aby wykryć
   * efekty uboczne, przestarzałe metody cyklu życia i inne potencjalne błędy.
   * Nie wpływa na wydajność w wersji produkcyjnej.
   */
  reactStrictMode: true,

  /**
   * @brief Sekcja flag eksperymentalnych.
   * Umożliwia włączenie funkcji, które nie są jeszcze stabilne w danej wersji Next.js.
   */
  experimental: {
    /**
     * @brief Włącza obsługę App Routera (katalog `app/`).
     *
     * Pozwala na korzystanie z nowoczesnych funkcji Next.js takich jak:
     * - React Server Components (RSC)
     * - Zagnieżdżone layouty
     * - Streaming SSR
     */
    appDir: true,
  },
};

module.exports = nextConfig;