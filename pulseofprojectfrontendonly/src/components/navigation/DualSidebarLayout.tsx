/**
 * Dual Sidebar Layout - FIXED VERSION
 * Fixes: Sidebars disappearing on page navigation
 * Changes:
 * 1. Added mounted state to prevent premature rendering
 * 2. Added default fallback values
 * 3. Better localStorage error handling
 * 4. Force primary sidebar to always be visible
 * 5. Debounced localStorage saves
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import PrimarySidebar from './PrimarySidebar';
import SecondarySidebar from './SecondarySidebar';
import { MobileNavigation } from '../MobileResponsive';

interface DualSidebarLayoutProps {
  children: React.ReactNode;
}

const DEFAULT_STATE = {
  activeCategory: null,
  isPinned: false,
};

export default function DualSidebarLayout({ children }: DualSidebarLayoutProps) {
  // Core state
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [secondarySidebarOpen, setSecondarySidebarOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const isPrimaryExpanded = false; // Primary sidebar never expands

  // Prevent flickering during mount
  const [isMounted, setIsMounted] = useState(true); // Start as true to show sidebars immediately

  // Prevent multiple localStorage saves
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Load saved state from localStorage with error handling
  useEffect(() => {
    let mounted = true;

    const loadSavedState = () => {
      try {
        const saved = localStorage.getItem('dual-sidebar-state');

        if (saved && mounted) {
          const state = JSON.parse(saved);

          // Validate parsed state
          if (typeof state === 'object' && state !== null) {
            setActiveCategory(state.activeCategory || null);
            setIsPinned(state.isPinned || false);
            setSecondarySidebarOpen(state.isPinned || false);

            console.log('[DualSidebar] State restored from localStorage:', state);
          } else {
            console.warn('[DualSidebar] Invalid state in localStorage, using defaults');
            resetToDefaults();
          }
        } else if (mounted) {
          console.log('[DualSidebar] No saved state, using defaults');
          resetToDefaults();
        }
      } catch (e) {
        console.error('[DualSidebar] Failed to load sidebar state, resetting to defaults:', e);
        // Clear corrupted data
        localStorage.removeItem('dual-sidebar-state');
        resetToDefaults();
      } finally {
        if (mounted) {
          setIsMounted(true);
        }
      }
    };

    // Load state immediately
    loadSavedState();

    return () => {
      mounted = false;
    };
  }, []); // Only run once on mount

  // Reset to default state
  const resetToDefaults = () => {
    setActiveCategory(DEFAULT_STATE.activeCategory);
    setIsPinned(DEFAULT_STATE.isPinned);
    setSecondarySidebarOpen(false);
  };

  // Debounced save to localStorage
  const saveState = useCallback((category: string | null, pinned: boolean) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        const state = {
          activeCategory: category,
          isPinned: pinned,
        };
        localStorage.setItem('dual-sidebar-state', JSON.stringify(state));
        console.log('[DualSidebar] State saved:', state);
      } catch (e) {
        console.error('[DualSidebar] Failed to save state:', e);
      }
    }, 300); // Debounce by 300ms
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    if (isMounted) {
      saveState(activeCategory, isPinned);
    }
  }, [activeCategory, isPinned, isMounted, saveState]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleCategoryHover = (categoryId: string | null) => {
    // Only update if the category is different AND not pinned
    if (categoryId && !isPinned && categoryId !== activeCategory) {
      // Hover on icon opens secondary panel (if not pinned)
      setActiveCategory(categoryId);
      setSecondarySidebarOpen(true);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    if (activeCategory === categoryId && secondarySidebarOpen) {
      // Clicking the same category toggles it
      if (!isPinned) {
        setSecondarySidebarOpen(false);
        setActiveCategory(null);
      }
    } else {
      // Open secondary sidebar with new category
      setActiveCategory(categoryId);
      setSecondarySidebarOpen(true);
    }
  };

  const handleCloseSecondarySidebar = () => {
    if (!isPinned) {
      setSecondarySidebarOpen(false);
      // Don't clear activeCategory so it reopens to same category
    }
  };

  // Auto-collapse secondary sidebar on mouse leave
  const handleSecondaryMouseLeave = () => {
    if (!isPinned) {
      // Add small delay before closing to prevent accidental closes
      setTimeout(() => {
        setSecondarySidebarOpen(false);
      }, 300);
    }
  };

  const handleTogglePin = () => {
    const newPinned = !isPinned;
    setIsPinned(newPinned);

    // If unpinning, close the secondary sidebar
    if (!newPinned) {
      setSecondarySidebarOpen(false);
    }
  };

  // Calculate content margin based on sidebar state
  const getContentMarginLeft = () => {
    const primaryWidth = isPrimaryExpanded ? 200 : 64;
    if (secondarySidebarOpen) {
      return primaryWidth + 280; // Primary + Secondary
    }
    return primaryWidth; // Just primary
  };

  // Don't render until state is loaded to prevent flicker
  if (!isMounted) {
    return (
      <div className="dual-sidebar-layout loading">
        <div className="loading-spinner">Loading...</div>
        <style jsx>{`
          .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #F3F4F6;
          }
          .loading-spinner {
            color: #6B7280;
            font-size: 14px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dual-sidebar-layout">
      {/* Mobile Navigation - Only visible on mobile */}
      <MobileNavigation />

      {/* Primary Sidebar - Always visible, explicitly shown */}
      <PrimarySidebar
        activeCategory={activeCategory}
        onCategoryClick={handleCategoryClick}
        onCategoryHover={handleCategoryHover}
        className="primary-sidebar-always-visible"
      />

      {/* Secondary Sidebar - Slides in/out */}
      <SecondarySidebar
        key={activeCategory || 'none'}
        activeCategory={activeCategory}
        isOpen={secondarySidebarOpen}
        isPinned={isPinned}
        isPrimaryExpanded={isPrimaryExpanded}
        onClose={handleCloseSecondarySidebar}
        onTogglePin={handleTogglePin}
        onMouseLeave={handleSecondaryMouseLeave}
      />

      {/* Main Content */}
      <main
        className="main-content"
        style={{
          marginLeft: `${getContentMarginLeft()}px`,
          transition: 'margin-left 0.3s ease-in-out',
        }}
      >
        {children}
      </main>

      <style jsx>{`
        .dual-sidebar-layout {
          min-height: 100vh;
          background: #F3F4F6;
          position: relative;
        }

        :global(.primary-sidebar-always-visible) {
          /* Force primary sidebar to always be visible */
          display: flex !important;
          opacity: 1 !important;
          visibility: visible !important;
          position: fixed !important;
          left: 0 !important;
          top: 0 !important;
          z-index: 1000 !important;
        }

        .main-content {
          min-height: 100vh;
          padding: 0;
          transition: margin-left 0.3s ease-in-out;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
