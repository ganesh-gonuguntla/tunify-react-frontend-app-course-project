/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
  keyframes: {
    slideUp: {
      '0%': { transform: 'translateY(50px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
  },
  animation: {
    slideUp: 'slideUp 0.3s ease-out',
  },
},
  },
  plugins: [],
};



module.exports = {
  theme: {
    extend: {
      colors: {
        playerGray: '#9ca3af',
      },
      boxShadow: {
        player: '0 10px 40px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'player-gradient': 'linear-gradient(135deg, #000000, #2d004d, #6a0dad)',
      },
      keyframes: {
        rotate: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        slideUp: {
          from: { transform: 'translate(-50%, 100%)' },
          to: { transform: 'translate(-50%, 0)' },
        },
      },
      animation: {
        rotate: 'rotate 10s linear infinite',
        slideUp: 'slideUp 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
