import {ImageResponse} from 'next/og';
import {qrSvg} from '@/lib/qr';
import {brandDataUrl} from '@/lib/brand-asset';
import {SITE_URL,TAGLINE} from '@/lib/constants';
export const dynamic='force-static';
// A print-ready 1200×1500 card: the JKJ emblem, the QR code and the website address.
export function GET(){
 const src=`data:image/svg+xml;base64,${Buffer.from(qrSvg()).toString('base64')}`;
 const host=SITE_URL.replace(/^https?:\/\//,'');
 return new ImageResponse(
  <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#ffffff',fontFamily:'Arial'}}>
   <img src={brandDataUrl('jkj-emblem.png')} width={190} height={142} alt=""/>
   <div style={{display:'flex',marginTop:14,fontSize:38,fontWeight:700,letterSpacing:3,color:'#071425',fontFamily:'Georgia'}}>JKJ&nbsp;<span style={{color:'#C98B2C'}}>EXCHANGE</span>&nbsp;SERVICES</div>
   <div style={{marginTop:6,marginBottom:28,fontSize:17,letterSpacing:5,color:'#C98B2C'}}>{TAGLINE.toUpperCase()}</div>
   <img src={src} width={860} height={860} alt=""/>
   <div style={{marginTop:26,fontSize:34,fontWeight:700,color:'#071425'}}>Scan to visit our website</div>
   <div style={{marginTop:8,fontSize:28,color:'#5b6b7d'}}>{host}</div>
  </div>,
  {width:1200,height:1500,headers:{'Content-Disposition':'inline; filename="jkj-exchange-website-qr.png"','Cache-Control':'public, max-age=86400'}}
 );
}
