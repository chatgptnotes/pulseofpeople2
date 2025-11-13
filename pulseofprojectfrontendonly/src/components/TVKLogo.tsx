import React from 'react'

interface TVKLogoProps {
  size?: 'small' | 'medium' | 'large'
  className?: string
}

/**
 * TVK (Tamilaga Vettri Kazhagam) Party Logo Component
 *
 * Features the traditional TVK emblem with two elephants
 * and the party symbol in circular format
 */
export const TVKLogo: React.FC<TVKLogoProps> = ({ size = 'medium', className = '' }) => {
  const sizeMap = {
    small: 32,
    medium: 48,
    large: 64
  }

  const dimension = sizeMap[size]

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background Circle */}
      <circle cx="100" cy="100" r="100" fill="#C41E3A" />

      {/* Yellow Band */}
      <rect x="0" y="65" width="200" height="70" fill="#FFD700" />

      {/* Central Circle */}
      <circle cx="100" cy="100" r="25" fill="#C41E3A" />

      {/* Decorative stars around center */}
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180
        const x = 100 + Math.cos(angle) * 20
        const y = 100 + Math.sin(angle) * 20
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="1.5"
            fill="#FFD700"
          />
        )
      })}

      {/* Simplified elephant silhouettes */}
      <g opacity="0.8">
        {/* Left elephant */}
        <ellipse cx="55" cy="100" rx="12" ry="15" fill="#808080" />
        <ellipse cx="55" cy="95" rx="8" ry="10" fill="#808080" />
        <path d="M 50 85 Q 45 80 48 75" stroke="#808080" strokeWidth="3" fill="none" />
        <rect x="52" y="110" width="3" height="15" fill="#808080" rx="1" />
        <rect x="57" y="110" width="3" height="15" fill="#808080" rx="1" />

        {/* Right elephant */}
        <ellipse cx="145" cy="100" rx="12" ry="15" fill="#808080" />
        <ellipse cx="145" cy="95" rx="8" ry="10" fill="#808080" />
        <path d="M 150 85 Q 155 80 152 75" stroke="#808080" strokeWidth="3" fill="none" />
        <rect x="140" y="110" width="3" height="15" fill="#808080" rx="1" />
        <rect x="145" y="110" width="3" height="15" fill="#808080" rx="1" />
      </g>

      {/* Center symbol - stylized lotus/flame */}
      <g>
        <path
          d="M 100 115 Q 95 105 100 95 Q 105 105 100 115 Z"
          fill="#FFD700"
        />
        <circle cx="100" cy="98" r="3" fill="#32CD32" />
      </g>
    </svg>
  )
}

export default TVKLogo
