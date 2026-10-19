import {ImageResponse} from 'next/og';
export const alt='JKJ Exchange Services — RMB & USD supplier payment enquiries';
export const size={width:1200,height:630};
export const contentType='image/png';
export default function OpengraphImage(){
 return new ImageResponse(
  <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',justifyContent:'space-between',padding:'72px 80px',backgroundColor:'#071425',backgroundImage:'radial-gradient(circle at 80% 20%, rgba(37,136,156,.4), rgba(7,20,37,0) 50%)',color:'#fff',fontFamily:'Georgia, serif'}}>
   <div style={{display:'flex',alignItems:'center',gap:22}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',width:84,height:84,borderRadius:20,background:'#E6B35E',color:'#071425',fontSize:30,fontWeight:900,fontFamily:'Arial'}}>JKJ</div>
    <div style={{display:'flex',flexDirection:'column'}}><div style={{fontSize:34,fontWeight:700,fontFamily:'Arial',display:'flex'}}>JKJ&nbsp;<span style={{color:'#E6B35E'}}>EXCHANGE</span></div><div style={{fontSize:16,letterSpacing:8,color:'#cbd5e1',fontFamily:'Arial'}}>SERVICES</div></div>
   </div>
   <div style={{display:'flex',flexDirection:'column'}}>
    <div style={{fontSize:78,lineHeight:1.05,letterSpacing:-2}}>Global trade moves.</div>
    <div style={{fontSize:78,lineHeight:1.05,letterSpacing:-2,color:'#E6B35E',fontStyle:'italic'}}>So should your business.</div>
   </div>
   <div style={{display:'flex',gap:18,fontSize:24,color:'#cbd5e1',fontFamily:'Arial'}}>{['RMB / CNY','USD','Alipay','WeChat Pay','Bank transfers'].map(x=><div key={x} style={{display:'flex',padding:'10px 20px',borderRadius:999,border:'1px solid rgba(255,255,255,.2)'}}>{x}</div>)}</div>
  </div>,
  size
 );
}
