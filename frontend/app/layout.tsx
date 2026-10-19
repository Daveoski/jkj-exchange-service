import type {Metadata,Viewport} from 'next';
import {Cinzel,Fraunces,Manrope} from 'next/font/google';
import './globals.css';
import {BUSINESS,SITE_URL,TAGLINE,services} from '@/lib/constants';

const display=Fraunces({subsets:['latin'],variable:'--font-display',display:'swap',axes:['opsz','SOFT']});
const sans=Manrope({subsets:['latin'],variable:'--font-sans',display:'swap'});
const brand=Cinzel({subsets:['latin'],variable:'--font-brand',display:'swap',weight:['600','700']});

// Runs before first paint: saved choice, else the device setting. Prevents a theme flash.
const themeInit=`(function(){var d=document.documentElement;d.classList.add('js');try{var t=localStorage.getItem('jkj-theme');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';d.dataset.theme=t;d.style.colorScheme=t;}catch(e){d.dataset.theme='light';}})();`;

export const metadata: Metadata={
  metadataBase:new URL(SITE_URL),
  title:{default:'JKJ Exchange Services | RMB & USD Supplier Payment Enquiries',template:'%s | JKJ Exchange Services'},
  description:'Talk to JKJ Exchange Services about RMB and USD supplier payments, China imports, Alipay, WeChat Pay and international bank transfer enquiries. Request a personalised quote.',
  applicationName:'JKJ Exchange Services',
  keywords:['JKJ Exchange','RMB payments Nigeria','pay China supplier','USD international supplier','Alipay Nigeria enquiries','WeChat Pay supplier payments'],
  alternates:{canonical:'/'},
  openGraph:{title:'JKJ Exchange Services | Trade Without the Guesswork',description:'Payment enquiries for importers. RMB, USD and supplier payment options, discussed directly with our team.',type:'website',locale:'en_NG',siteName:'JKJ Exchange Services',url:SITE_URL},
  twitter:{card:'summary_large_image',title:'JKJ Exchange Services',description:'RMB, USD and supplier payment enquiries, discussed directly with our team.'},
  robots:{index:true,follow:true},
  formatDetection:{telephone:false},
};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:[{media:'(prefers-color-scheme: light)',color:'#ffffff'},{media:'(prefers-color-scheme: dark)',color:'#050b14'}]};

const jsonLd={
  '@context':'https://schema.org',
  '@type':'FinancialService',
  name:BUSINESS.name,
  url:SITE_URL,
  logo:SITE_URL+'/brand/jkj-logo.png',
  image:SITE_URL+'/brand/jkj-logo.png',
  slogan:TAGLINE,
  email:BUSINESS.email,
  telephone:BUSINESS.phoneInternational,
  areaServed:{'@type':'Country',name:'Nigeria'},
  description:'Enquiries for RMB and USD supplier payments, Alipay, WeChat Pay and international bank transfers.',
  contactPoint:[
    {'@type':'ContactPoint',telephone:BUSINESS.phoneInternational,contactType:'customer service',areaServed:'NG',availableLanguage:['English']},
    {'@type':'ContactPoint',telephone:'+'+BUSINESS.whatsapp,contactType:'customer service',contactOption:'WhatsApp'}
  ],
  hasOfferCatalog:{'@type':'OfferCatalog',name:'Payment enquiries',itemListElement:services.map(s=>({'@type':'Offer',itemOffered:{'@type':'Service',name:s.title,description:s.short}}))}
};

export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en" className={`${display.variable} ${sans.variable} ${brand.variable}`} suppressHydrationWarning>
  <head><script dangerouslySetInnerHTML={{__html:themeInit}}/></head>
  <body className="font-sans antialiased">
   <a href="#main" className="sr-only z-[100] rounded-full bg-gold px-5 py-3 font-bold text-midnight focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
   {children}
   <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
  </body>
 </html>;
}
