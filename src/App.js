import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Navigation } from './components/layout/Navigation';
import { AppRoutes, basePath } from './Router';
import { NovelProvider } from './hooks/useNovel';
import { ReadingSettingsProvider } from './hooks/useReadingSettings';
import { ThemeProvider } from './hooks/useTheme';
import { HistoryProvider } from './store/historyStore';
import { UserProvider } from './store/userStore';
import { AuthProvider } from './store/authStore';
import { ToastProvider } from './store/toastStore';
import { StorageErrorListener } from './components/common/StorageErrorListener';

export const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <ToastProvider>
      <StorageErrorListener />
      <ThemeProvider>
        <AuthProvider>
          <NovelProvider>
            <HistoryProvider>
              <UserProvider>
                <ReadingSettingsProvider>
                  <BrowserRouter basename={basePath || undefined}>
                    <div className="app" style={{ minHeight: '100vh' }}>
                      <Header onMenuToggle={toggleMenu} isMenuOpen={isMenuOpen} />
                      <Navigation isOpen={isMenuOpen} onClose={closeMenu} />
                      <main className="main-content">
                        <AppRoutes />
                      </main>
                      <Footer />
                    </div>
                  </BrowserRouter>
                </ReadingSettingsProvider>
              </UserProvider>
            </HistoryProvider>
          </NovelProvider>
        </AuthProvider>
      </ThemeProvider>
    </ToastProvider>
  );
};
