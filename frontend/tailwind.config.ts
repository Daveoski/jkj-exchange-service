import type { Config } from 'tailwindcss';
// Semantic colours are CSS variables (RGB channels) defined in globals.css for the light
// "Day" theme and the "Night edition" theme, so one class adapts to both.
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        midnight:'#071425', ocean:'#0F2540', card:'#10243D', gold:'#E6B35E', light:'#F5F8FA', ink:'#132436', teal:'#1BAF94', royal:'#13306B',
        canvas:token('canvas'), 'canvas-alt':token('canvas-alt'),
        surface:token('surface'), 'surface-2':token('surface-2'), 'surface-3':token('surface-3'),
        line:token('line'), 'line-strong':token('line-strong'),
        fg:token('fg'), 'fg-soft':token('fg-soft'), muted:token('muted'), subtle:token('subtle'),
        accent:token('accent'), 'accent-strong':token('accent-strong'), 'accent-soft':token('accent-soft'), 'accent-line':token('accent-line'),
        contrast:token('contrast'), 'contrast-hover':token('contrast-hover'), 'on-contrast':token('on-contrast'),
      },
      fontFamily: {
        sans:['var(--font-sans)','system-ui','-apple-system','Segoe UI','Arial','sans-serif'],
        display:['var(--font-display)','Georgia','Times New Roman','serif'],
        brand:['var(--font-brand)','Georgia','serif']
      },
      boxShadow:{soft:'0 16px 55px rgb(var(--shadow) / .09)',glow:'0 18px 70px rgba(230,179,94,.14)',lift:'0 30px 80px -20px rgb(var(--shadow) / .35)'},
      keyframes:{
        marquee:{from:{transform:'translateX(0)'},to:{transform:'translateX(-50%)'}},
        draw:{from:{strokeDashoffset:'420'},to:{strokeDashoffset:'0'}},
        pulseRing:{'0%':{transform:'scale(.6)',opacity:'.9'},'100%':{transform:'scale(2.2)',opacity:'0'}},
        drift:{'0%,100%':{transform:'translate3d(0,0,0)'},'50%':{transform:'translate3d(-18px,14px,0)'}},
        slideIn:{from:{transform:'translateX(100%)'},to:{transform:'translateX(0)'}},
        fadeUp:{from:{opacity:'0',transform:'translateY(14px)'},to:{opacity:'1',transform:'translateY(0)'}},
        twinkle:{'0%,100%':{opacity:'.25'},'50%':{opacity:'.9'}}
      },
      animation:{
        marquee:'marquee 38s linear infinite',
        draw:'draw 2.4s cubic-bezier(.65,0,.35,1) .3s both',
        'pulse-ring':'pulseRing 2.6s ease-out infinite',
        drift:'drift 14s ease-in-out infinite',
        'slide-in':'slideIn .32s cubic-bezier(.22,1,.36,1)',
        'fade-up':'fadeUp .5s cubic-bezier(.22,1,.36,1) both',
        twinkle:'twinkle 3.2s ease-in-out infinite'
      }
    }
  }, plugins: []
};
export default config;
