import {ImageResponse} from 'next/og';
import {qrSvg} from '@/lib/qr';
import {SITE_URL} from '@/lib/constants';
export const dynamic='force-static';
// A print-ready 1200×1500 card: the QR code with the JKJ name and website address.
export function GET(){
 const src=`data:image/svg+xml;base64,${Buffer.from(qrSvg()).toString('base64')}`;
 const host=SITE_URL.replace(/^https?:\/\//,'');
 return new ImageResponse(
  <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#ffffff',fontFamily:'Arial'}}>
   <div style={{display:'flex',alignItems:'center',gap:18,marginBottom:40}}><div style={{display:'flex',alignItems:'center',justifyContent:'center',width:76,height:76,borderRadius:18,background:'#E6B35E',color:'#071425',fontSize:28,fontWeight:900}}>JKJ</div><div style={{display:'flex',flexDirection:'column'}}><div style={{display:'flex',fontSize:40,fontWeight:700,color:'#071425'}}>JKJ&nbsp;<span style={{color:'#C98B2C'}}>EXCHANGE</span></div><div style={{fontSize:18,letterSpacing:9,color:'#5b6b7d'}}>SERVICES</div></div></div>
   <img src={src} width={980} height={980} alt=""/>
   <div style={{marginTop:36,fontSize:34,fontWeight:700,color:'#071425'}}>Scan to visit our website</div>
   <div style={{marginTop:10,fontSize:28,color:'#5b6b7d'}}>{host}</div>
  </div>,
  {width:1200,height:1500,headers:{'Content-Disposition':'inline; filename="jkj-exchange-website-qr.png"','Cache-Control':'public, max-age=86400'}}
 );
}
