/**
 * Dual Sidebar Layout - Main container for the two-sidebar navigation
 * Manages state and interactions between primary and secondary sidebars
 */

import React, { useState, useEffect } from 'react';
import PrimarySidebar from './PrimarySidebar';
import SecondarySidebar from './SecondarySidebar';

interface DualSidebarLayoutProps {
  children: React.ReactNode;
}

export default function DualSidebarLayout({ children }: DualSidebarLayoutProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [secondarySidebarOpen, setSecondarySidebarOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dual-sidebar-state');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        setActiveCategory(state.activeCategory);
        setIsPinned(state.isPinned);
        setSecondarySidebarOpen(state.isPinned);
      } catch (e) {
        console.error('Failed to load sidebar state:', e);
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    const state = {
      activeCategory,
      isPinned,
    };
    localStorage.setItem('dual-sidebar-state', JSON.stringify(state));
  }, [activeCategory, isPinned]);

  const handleCategoryClick = (categoryId: string) => {
    if (activeCategory === categoryId && secondarySidebarOpen) {
      // Clicking the same category closes it (unless pinned)
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

  const handleTogglePin = () => {
    setIsPinned(!isPinned);
  };

  // Calculate content margin based on sidebar state
  const getContentMarginLeft = () => {
    if (secondarySidebarOpen) {
      return 64 + 280; // Primary + Secondary
    }
    return 64; // Just primary
  };

  return (
    <div className="dual-sidebar-layout">
      {/* Primary Sidebar - Always visible */}
      <PrimarySidebar
        activeCategory={activeCategory}
        onCategoryClick={handleCategoryClick}
      />

      {/* Secondary Sidebar - Slides in/out */}
      <SecondarySidebar
        activeCategory={activeCategory}
        isOpen={secondarySidebarOpen}
        isPinned={isPinned}
        onClose={handleCloseSecondarySidebar}
        onTogglePin={handleTogglePin}
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
