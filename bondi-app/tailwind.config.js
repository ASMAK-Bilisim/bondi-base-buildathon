/** @type {import('tailwindcss').Config} */
export default {
	mode: 'jit',
	content: ['./src/**/*.{html,tsx}'],
	theme: {
		fontSize: {
			'app-display-1': ['80px', '94px'],
			'app-display-2': ['72px', '82px'],
			'app-display-3': ['60px', '72px'],
			'app-headline-1': ['42px', '48px'],
			'app-headline-2': ['38px', '46px'],
			'app-headline-3': ['32px', '40px'],
			'app-title-1': ['28px', '34px'],
			'app-title-2': ['24px', '32px'],
			'app-subtitle': ['18px', '20px'],
			'app-body-1': ['18px', '26px'],
			'app-body-2': ['16px', '24px'],
			'app-detail': ['14px', '18px'],
			'app-smallest-text': ['12px', '16px'],
			'app-big-display': ['80px', '80px'],
		},
		extend: {
			fontFamily: {
				inter: ['Inter', 'sans-serif'],
				mello: ['MelloCondensed', 'sans-serif'],
			},
			colors: {
				'app-primary-1': '#D8FEAA',
				'app-primary-2': '#1C544E',
				'app-accent': '#F49C4A',
				'app-dark': '#071F1E',
				'app-light': '#F2FBF9',
				'app-dark-mint': '#D4E7E2',

				// credit-score colors
				'app-credit-100': '#4280F0',
				'app-credit-90': '#4FC484',
				'app-credit-70': '#FBD932',
				'app-credit-50': '#FF7D2C',
				'app-credit-30': '#E12836',
			},
			boxShadow: {
				'red': '0 0 1px 0 rgba(239, 68, 68, 0.2)',
				'red-glow': '0 0 2px 0 rgba(239, 68, 68, 0.4), inset 0 0 2px 0 rgba(239, 68, 68, 0.4)',
			},
			keyframes: {
				pulseGlow: {
					'0%, 100%': { boxShadow: '0 0 2px 0 rgba(239, 68, 68, 0.4), inset 0 0 2px 0 rgba(239, 68, 68, 0.4)' },
					'50%': { boxShadow: '0 0 4px 2px rgba(239, 68, 68, 0.6), inset 0 0 4px 2px rgba(239, 68, 68, 0.6)' },
				},
				shake: {
					'0%, 100%': { transform: 'rotate(0deg)' },
					'20%, 60%': { transform: 'rotate(-7deg)' },
					'40%, 80%': { transform: 'rotate(7deg)' },
				},
				'pulse-subtle': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' },
				},
				'pulse-border': {
					'0%, 100%': { borderColor: '#f2fbf9', opacity: '1' },
					'15%, 85%': { borderColor: '#f2fbf9', opacity: '0.9' },
					'30%, 70%': { borderColor: '#f2fbf9', opacity: '0.8' },
					'50%': { borderColor: '#f2fbf9', opacity: '0.7' },
				}
			},
			animation: {
				pulseGlow: 'pulseGlow 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
					shake: 'shake 0.5s ease-in-out',
					'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
					'pulse-border': 'pulse-border 3s ease-in-out infinite',
			},
			screens: {
				'xs': '480px',
				// => @media (min-width: 480px) { ... }
		  
				'sm': '640px',
				// => @media (min-width: 640px) { ... }
		  
				'md': '768px',
				// => @media (min-width: 768px) { ... }
		  
				'lg': '1024px',
				// => @media (min-width: 1024px) { ... }
		  
				'xl': '1280px',
				// => @media (min-width: 1280px) { ... }

				'2xl': '1400px', // Add this new breakpoint
		  
				'3xl': '1680px',
				// => @media (min-width: 1536px) { ... }

				'4xl': '1920px',
		  
			},
		},
	},
};
