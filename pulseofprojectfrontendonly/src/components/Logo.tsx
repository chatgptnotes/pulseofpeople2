import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'horizontal' | 'stacked' | 'icon-only';
  showTagline?: boolean;
  className?: string;
  theme?: 'light' | 'dark';
}

export default function Logo({
  size = 'medium',
  variant = 'horizontal',
  showTagline = false,
  className = '',
  theme = 'light'
}: LogoProps) {

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          width: 120,
          height: 40,
          tagline: 'text-xs'
        };
      case 'large':
        return {
          width: 240,
          height: 80,
          tagline: 'text-sm'
        };
      default: // medium
        return {
          width: 180,
          height: 60,
          tagline: 'text-xs'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  // For icon-only variant, show a smaller version
  if (variant === 'icon-only') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <img
          src="/assets/images/logo.png"
          alt="POP"
          className="h-10 w-auto"
          onError={(e) => {
            // Fallback to text if image not found
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <div className="hidden text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          POP
        </div>
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={`text-center ${className}`}>
        <img
          src="/assets/images/logo.png"
          alt="Pulse of People"
          style={{ width: sizeClasses.width, height: 'auto' }}
          className="mx-auto"
          onError={(e) => {
            // Fallback to text if image not found
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <div className="hidden">
          <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            P•O•P
          </div>
          <div className="text-gray-600 font-medium">
            pulse of people
          </div>
        </div>
        {showTagline && (
          <div className={`${sizeClasses.tagline} text-gray-500 mt-2`}>
            by Animal-I • Animal-i Initiative
          </div>
        )}
      </div>
    );
  }

  // Horizontal variant (default)
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="/assets/images/logo.png"
        alt="Pulse of People"
        style={{ height: sizeClasses.height, width: 'auto' }}
        onError={(e) => {
          // Fallback to text version if image not found
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling?.classList.remove('hidden');
        }}
      />
      {/* Fallback text version */}
      <div className="hidden flex items-center space-x-3">
        <div className="flex items-center">
          <span className="text-3xl font-bold text-purple-600">P</span>
          <span className="text-2xl text-purple-600 mx-1">•</span>
          <span className="text-3xl font-bold text-purple-600">O</span>
          <span className="text-2xl text-purple-600 mx-1">•</span>
          <span className="text-3xl font-bold text-blue-600">P</span>
        </div>
        <div className="border-l-2 border-gray-300 pl-3">
          <div className="text-gray-600 text-sm font-medium">pulse of people</div>
          {showTagline && (
            <div className={`${sizeClasses.tagline} text-gray-500`}>
              by Animal-I
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Export individual logo variations for specific use cases
export const PulseLogoHorizontal = (props: Omit<LogoProps, 'variant'>) => (
  <Logo {...props} variant="horizontal" />
);

export const PulseLogoStacked = (props: Omit<LogoProps, 'variant'>) => (
  <Logo {...props} variant="stacked" />
);

export const PulseLogoIcon = (props: Omit<LogoProps, 'variant'>) => (
  <Logo {...props} variant="icon-only" />
);

// Simplified logo for mobile/small spaces
export const PulseLogoCompact = ({ className = '' }: { className?: string }) => (
  <div className={`flex items-center ${className}`}>
    <img
      src="/assets/images/logo.png"
      alt="POP"
      className="h-8 w-auto"
      onError={(e) => {
        // Fallback to text if image not found
        e.currentTarget.style.display = 'none';
        e.currentTarget.nextElementSibling?.classList.remove('hidden');
      }}
    />
    <div className="hidden flex items-center space-x-2">
      <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
        POP
      </span>
      <span className="text-xs text-gray-600">by Animal-I</span>
    </div>
  </div>
);