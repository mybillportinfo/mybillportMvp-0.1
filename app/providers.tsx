'use client';

import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

function ThemedToaster() {
  const { isDark } = useTheme();
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: isDark ? '#1e293b' : '#ffffff',
          color: isDark ? '#f1f5f9' : '#0F172A',
          borderRadius: '12px',
          fontSize: '14px',
          border: isDark ? 'none' : '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        },
        success: {
          iconTheme: { primary: '#2dd4bf', secondary: isDark ? '#1e293b' : '#ffffff' },
        },
        error: {
          iconTheme: { primary: '#f87171', secondary: isDark ? '#1e293b' : '#ffffff' },
        },
      }}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          {children}
          <ThemedToaster />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
