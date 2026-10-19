import type {MetadataRoute} from 'next';
import {SITE_URL,services} from '@/lib/constants';
export default function sitemap():MetadataRoute.Sitemap{return ['','about','services','how-it-works','contact','request-quote','qr','privacy','terms',...services.map(s=>'services/'+s.slug)].map(p=>({url:p?`${SITE_URL}/${p}`:SITE_URL,lastModified:new Date(),changeFrequency:p?'monthly':'weekly',priority:p?0.6:1}));}
