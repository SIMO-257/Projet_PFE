/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx,css}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4AF37',
          light: '#FFD700',
          dark: '#B8965F',
          muted: '#8B6914',
        },
        burgundy: {
          DEFAULT: '#651939',
          light: '#8B4049',
          dark: '#4A1515',
          900: '#2D0F0F',
          800: '#3D1515',
          700: '#1A0507',
          600: '#400106',
          500: '#260101',
        },
        ticket: {
          active: '#2d1b2e',
          border: '#6b5a3d',
        }
      },
      fontFamily: {
        sora: ['Sora', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['Courier New', 'Courier', 'monospace'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'pulse-glow-slow': 'pulseGlow 3s ease-in-out infinite',
        'pulse-glow-fast': 'pulseGlow 1.5s ease-in-out infinite',
        'pulse-ring': 'pulseRing 2s ease-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ticket-pulse': 'ticketPulse 2s ease-in-out infinite',
        'ticket-pulse-slow': 'ticketPulse 3s ease-in-out infinite',
        'ticket-pulse-fast': 'ticketPulse 1.5s ease-in-out infinite',
        'ticket-wave': 'ticketWave 2s ease-out infinite',
        'nfc-wave': 'nfcWave 2s ease-out infinite',
        'success-pulse': 'successPulse 2s infinite',
        'checkmark-circle': 'checkmarkCircle 0.6s ease-in-out both',
        'checkmark-path': 'checkmarkPath 0.5s ease-in-out 0.5s both',
        'rotate-slow': 'rotate 20s linear infinite',
        'spin': 'spin 2s linear infinite',
        'shimmer': 'shimmer 2s infinite',
        'gradient-shift': 'gradientShift 3s ease infinite',
        'bounce': 'bounce 1s infinite',
        'fill-line': 'fillLine 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both',
        'circle-grow': 'circleGrow 0.5s ease-out forwards',
        'accordion-slide': 'accordionSlide 0.3s ease-out',
        'draw-check': 'drawCheck 0.8s ease-out 0.3s forwards',
        'progress-pulse': 'progressPulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0.5' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)', transform: 'scale(1)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 215, 0, 0.5)', transform: 'scale(1.05)' }
        },
        pulseRing: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.3)', opacity: '0' }
        },
        ticketPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)', transform: 'scale(1)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 215, 0, 0.5)', transform: 'scale(1.05)' }
        },
        ticketWave: {
          '0%': { transform: 'translate(-50%, -50%) scale(0.8)', opacity: '0.5' },
          '100%': { transform: 'translate(-50%, -50%) scale(1.8)', opacity: '0' }
        },
        nfcWave: {
          '0%': { transform: 'translate(-50%, -50%) scale(0.8)', opacity: '0.5' },
          '100%': { transform: 'translate(-50%, -50%) scale(1.8)', opacity: '0' }
        },
        successPulse: {
          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(72, 187, 120, 0.7)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 25px rgba(72, 187, 120, 0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(72, 187, 120, 0)' }
        },
        checkmarkCircle: {
          'from': { strokeDashoffset: '157' },
          'to': { strokeDashoffset: '0' }
        },
        checkmarkPath: {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' }
        },
        rotate: {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' }
        },
        spin: {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(-25%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
          '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' }
        },
        fillLine: {
          '0%': { transform: 'scaleX(0)', transformOrigin: 'left' },
          '100%': { transform: 'scaleX(1)', transformOrigin: 'left' }
        },
        circleGrow: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        accordionSlide: {
          'from': { opacity: '0', transform: 'translateY(-10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        drawCheck: {
          'to': { strokeDashoffset: '0' }
        },
        progressPulse: {
          '0%, 100%': { opacity: '0.7' },
          '50%': { opacity: '1' }
        }
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(255, 215, 0, 0.3)',
        'glow-gold-lg': '0 0 40px rgba(255, 215, 0, 0.5)',
        'card': '0 20px 40px rgba(0, 0, 0, 0.5)',
        'button': '0 4px 15px rgba(212, 175, 119, 0.3)',
        'button-hover': '0 6px 20px rgba(212, 175, 119, 0.4)',
      }
    }
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        },
        '.scrollbar-custom': {
          '&::-webkit-scrollbar': {
            width: '4px'
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '10px'
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(212, 175, 55, 0.3)',
            borderRadius: '10px'
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(212, 175, 55, 0.5)'
          }
        }
      })
    }
  ]
};
