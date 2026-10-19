import {ImageResponse} from 'next/og';
import {brandDataUrl} from '@/lib/brand-asset';
import {TAGLINE} from '@/lib/constants';
export const alt='JKJ Exchange Services — RMB & USD supplier payment enquiries';
export const size={width:1200,height:630};
export const contentType='image/png';
export default function OpengraphImage(){
 const emblem=brandDataUrl('jkj-emblem-dark.png');
 return new ImageResponse(
  <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',justifyContent:'space-between',padding:'64px 80px',backgroundColor:'#071425',backgroundImage:'radial-gradient(circle at 80% 20%, rgba(37,136,156,.4), rgba(7,20,37,0) 50%)',color:'#fff',fontFamily:'Georgia, serif'}}>
   <div style={{display:'flex',alignItems:'center',gap:24}}>
    <img src={emblem} width={154} height={115} alt=""/>
    <div style={{display:'flex',flexDirection:'column'}}><div style={{fontSize:38,fontWeight:700,letterSpacing:2,display:'flex'}}>JKJ&nbsp;<span style={{color:'#E6B35E'}}>EXCHANGE</span></div><div style={{fontSize:16,letterSpacing:9,color:'#cbd5e1',fontFamily:'Arial'}}>SERVICES</div></div>
   </div>
   <div style={{display:'flex',flexDirection:'column'}}>
    <div style={{fontSize:76,lineHeight:1.05,letterSpacing:-2}}>Global trade moves.</div>
    <div style={{fontSize:76,lineHeight:1.05,letterSpacing:-2,color:'#E6B35E',fontStyle:'italic'}}>So should your business.</div>
   </div>
   <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
    <div style={{display:'flex',gap:14,fontSize:22,color:'#cbd5e1',fontFamily:'Arial'}}>{['RMB / CNY','USD','Alipay','WeChat Pay','Bank transfers'].map(x=><div key={x} style={{display:'flex',padding:'9px 18px',borderRadius:999,border:'1px solid rgba(255,255,255,.2)'}}>{x}</div>)}</div>
    <div style={{fontSize:18,letterSpacing:3,color:'#E6B35E',fontFamily:'Arial'}}>{TAGLINE.toUpperCase()}</div>
   </div>
  </div>,
  size
 );
}
