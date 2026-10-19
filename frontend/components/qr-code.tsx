import {qrSvg} from '@/lib/qr';
// Server component: the QR SVG is generated at build time, so no client JavaScript is needed.
export function QrCode({className='',label}:{className?:string;label?:string}){
 return <div className={`overflow-hidden rounded-2xl bg-white ${className}`} aria-label={label} dangerouslySetInnerHTML={{__html:qrSvg()}}/>;
}
