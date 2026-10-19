import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { midnight:'#071425', ocean:'#0F2540', card:'#10243D', gold:'#E6B35E', light:'#F5F8FA', ink:'#132436', teal:'#1BAF94' },
      fontFamily: {
        sans:['var(--font-sans)','system-ui','-apple-system','Segoe UI','Arial','sans-serif'],
        display:['var(--font-display)','Georgia','Times New Roman','serif']
      },
      boxShadow:{soft:'0 16px 55px rgba(7,20,37,.09)',glow:'0 18px 70px rgba(230,179,94,.14)',lift:'0 30px 80px -20px rgba(7,20,37,.35)'},
      keyframes:{
        marquee:{from:{transform:'translateX(0)'},to:{transform:'translateX(-50%)'}},
        draw:{from:{strokeDashoffset:'420'},to:{strokeDashoffset:'0'}},
        pulseRing:{'0%':{transform:'scale(.6)',opacity:'.9'},'100%':{transform:'scale(2.2)',opacity:'0'}},
        drift:{'0%,100%':{transform:'translate3d(0,0,0)'},'50%':{transform:'translate3d(-18px,14px,0)'}},
        slideIn:{from:{transform:'translateX(100%)'},to:{transform:'translateX(0)'}},
        fadeUp:{from:{opacity:'0',transform:'translateY(14px)'},to:{opacity:'1',transform:'translateY(0)'}}
      },
      animation:{
        marquee:'marquee 38s linear infinite',
        draw:'draw 2.4s cubic-bezier(.65,0,.35,1) .3s both',
        'pulse-ring':'pulseRing 2.6s ease-out infinite',
        drift:'drift 14s ease-in-out infinite',
        'slide-in':'slideIn .32s cubic-bezier(.22,1,.36,1)',
        'fade-up':'fadeUp .5s cubic-bezier(.22,1,.36,1) both'
      }
    }
  }, plugins: []
};
export default config;
