/**
 * Version Footer Component
 * Displays app version and last updated date
 * Auto-increments on git push via pre-commit hook
 *
 * Style: Gray text, 11px font, appears on all pages
 */

import React from 'react';
import { Info as InfoIcon } from '@mui/icons-material';

// Version imported from package.json
const APP_VERSION = '1.0.0'; // This will be replaced by build script
const LAST_UPDATED = '2025-11-09'; // This will be replaced by build script

interface VersionFooterProps {
  className?: string;
  variant?: 'default' | 'minimal';
}

function VersionFooter({
  className = '',
  variant = 'default'
}: VersionFooterProps) {
  return (
    <footer
      className={`version-footer ${className}`}
      style={{
        background: '#F9FAFB',
        borderTop: '1px solid #E5E7EB',
        padding: variant === 'minimal' ? '8px 16px' : '12px 24px',
        textAlign: 'center',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '11px',
        color: '#6B7280',
        lineHeight: '1.4',
      }}>
        {variant === 'default' && (
          <InfoIcon style={{ fontSize: '13px', color: '#9CA3AF' }} />
        )}
        <span>
          Version <strong>{APP_VERSION}</strong>
        </span>
        <span style={{ color: '#D1D5DB' }}>•</span>
        <span>
          Last Updated: {LAST_UPDATED}
        </span>
      </div>

      {variant === 'default' && (
        <div style={{
          fontSize: '10px',
          color: '#9CA3AF',
          marginTop: '4px',
        }}>
          Pulse of People Platform
        </div>
      )}
    </footer>
  );
}

/**
 * Minimal version for sidebars or compact spaces
 */
export function MinimalVersionFooter() {
  return <VersionFooter variant="minimal" />;
}

// Export as both default and named export for compatibility
export { VersionFooter };
export default VersionFooter;
