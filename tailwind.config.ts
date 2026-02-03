import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			zen: {
  				stone: 'hsl(var(--zen-stone))',
  				bamboo: 'hsl(var(--zen-bamboo))',
  				sand: 'hsl(var(--zen-sand))',
  				ink: 'hsl(var(--zen-ink))',
  				paper: 'hsl(var(--zen-paper))',
  				moss: 'hsl(var(--zen-moss))',
  				clay: 'hsl(var(--zen-clay))',
  				water: 'hsl(var(--zen-water))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI',
  				'Roboto',
  				'Helvetica Neue',
  				'Arial',
  				'sans-serif'
  			]
  		},
  		fontSize: {
  			'2xs': [
  				'0.625rem',
  				{
  					lineHeight: '0.875rem'
  				}
  			]
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			'zen-sm': '0 1px 3px -1px hsl(30 10% 12% / 0.04)',
  			zen: '0 2px 8px -2px hsl(30 10% 12% / 0.06)',
  			'zen-md': '0 4px 16px -4px hsl(30 10% 12% / 0.08)',
  			'zen-lg': '0 8px 30px -8px hsl(30 10% 12% / 0.12)',
  			'zen-xl': '0 16px 50px -12px hsl(30 10% 12% / 0.16)'
  		},
  		animation: {
  			'zen-fade-in': 'zenFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
  			'zen-slide-up': 'zenSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards',
  			'zen-slide-down': 'zenSlideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards',
  			'zen-scale-in': 'zenScaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  			'zen-spin': 'zenSpin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite',
  			'zen-pulse': 'zenPulse 2s ease-in-out infinite',
  			'zen-progress': 'zenProgress 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  			'zen-float': 'zenFloat 4s ease-in-out infinite',
  			'zen-breathe': 'zenBreathe 3s ease-in-out infinite',
  			'zen-ripple': 'zenRipple 0.6s ease-out forwards',
  			'fade-in': 'zenFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
  			'slide-up': 'zenSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards',
  			'scale-in': 'zenScaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  			'spin-slow': 'zenSpin 2s linear infinite',
  			progress: 'zenProgress 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		keyframes: {
  			zenFadeIn: {
  				from: {
  					opacity: '0',
  					transform: 'translateY(8px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			zenSlideUp: {
  				from: {
  					opacity: '0',
  					transform: 'translateY(16px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			zenSlideDown: {
  				from: {
  					opacity: '0',
  					transform: 'translateY(-16px)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			zenScaleIn: {
  				from: {
  					opacity: '0',
  					transform: 'scale(0.97)'
  				},
  				to: {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			},
  			zenSpin: {
  				to: {
  					transform: 'rotate(360deg)'
  				}
  			},
  			zenPulse: {
  				'0%, 100%': {
  					opacity: '1'
  				},
  				'50%': {
  					opacity: '0.5'
  				}
  			},
  			zenProgress: {
  				from: {
  					width: '0%'
  				}
  			},
  			zenFloat: {
  				'0%, 100%': {
  					transform: 'translateY(0)'
  				},
  				'50%': {
  					transform: 'translateY(-4px)'
  				}
  			},
  			zenBreathe: {
  				'0%, 100%': {
  					opacity: '0.4'
  				},
  				'50%': {
  					opacity: '0.7'
  				}
  			},
  			zenRipple: {
  				'0%': {
  					transform: 'scale(0)',
  					opacity: '0.5'
  				},
  				'100%': {
  					transform: 'scale(2.5)',
  					opacity: '0'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		transitionTimingFunction: {
  			'zen-ease': 'cubic-bezier(0.16, 1, 0.3, 1)',
  			'zen-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  		},
  		transitionDuration: {
  			'400': '400ms',
  			'600': '600ms',
  			'800': '800ms'
  		},
  		spacing: {
  			'18': '4.5rem',
  			'22': '5.5rem'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
