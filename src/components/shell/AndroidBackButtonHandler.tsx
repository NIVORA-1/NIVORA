'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function AndroidBackButtonHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const { isSidebarOpen, setIsSidebarOpen } = useApp();

  useEffect(() => {
    let removeListener: (() => void) | null = null;

    async function initCapacitor() {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (!Capacitor.isNativePlatform()) {
          return;
        }

        // Initialize Status Bar & Splash Screen
        try {
          const { StatusBar, Style } = await import('@capacitor/status-bar');
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#090d16' });
        } catch (e) {
          // Status bar plugin not supported or error
        }

        try {
          const { SplashScreen } = await import('@capacitor/splash-screen');
          await SplashScreen.hide();
        } catch (e) {
          // Splash screen error
        }

        // Set up hardware Back Button listener
        const { App } = await import('@capacitor/app');
        const listener = await App.addListener('backButton', ({ canGoBack }) => {
          // 1. Check if sidebar is open
          if (isSidebarOpen) {
            setIsSidebarOpen(false);
            return;
          }

          // 2. Check if any modal or overlay dialog is open in DOM
          const openModals = document.querySelectorAll(
            '[role="dialog"], .fixed.inset-0:not(.hidden), [data-state="open"]'
          );
          if (openModals.length > 0) {
            // Find close button or trigger escape
            const lastModal = openModals[openModals.length - 1];
            const closeBtn = lastModal.querySelector('button[aria-label="Close"], button.close, [data-modal-close]') as HTMLButtonElement | null;
            if (closeBtn) {
              closeBtn.click();
              return;
            }
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));
            return;
          }

          // 3. Navigation check
          const isRootScreen = !pathname || pathname === '/' || pathname === '/home' || pathname === '/dashboard' || pathname === '/login';

          if (isRootScreen) {
            App.exitApp();
          } else if (canGoBack || window.history.length > 1) {
            router.back();
          } else {
            router.push('/home');
          }
        });

        removeListener = () => {
          listener.remove();
        };
      } catch (err) {
        console.warn('Capacitor native listeners could not be initialized:', err);
      }
    }

    initCapacitor();

    return () => {
      if (removeListener) removeListener();
    };
  }, [router, pathname, isSidebarOpen, setIsSidebarOpen]);

  return null;
}
