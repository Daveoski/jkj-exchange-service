import QRCode from 'qrcode';
import {SITE_URL} from './constants';

const MIN_VERSION=5; // 37×37 modules: small enough to scan easily, large enough that the badge is a small fraction

// Builds a branded QR code as SVG markup. Error correction level H tolerates ~30% damage;
// the centre badge covers about 4% of the symbol, leaving a wide safety margin.
export function qrSvg(text:string=SITE_URL,{logo=true,dark='#071425',light='#ffffff'}:{logo?:boolean;dark?:string;light?:string}={}){
 let qr=QRCode.create(text,{errorCorrectionLevel:'H'});
 if(qr.version<MIN_VERSION)qr=QRCode.create(text,{errorCorrectionLevel:'H',version:MIN_VERSION});
 const size=qr.modules.size;const margin=4;const total=size+margin*2;
 const badge=logo?(Math.round(size*0.2)|1):0;const start=Math.floor((size-badge)/2);const end=start+badge;
 const inBadge=(r:number,c:number)=>logo&&r>=start&&r<end&&c>=start&&c<end;
 // Finder patterns stay square: rounded "eyes" look nicer but measurably hurt decoding on some scanners.
 let path='';
 for(let r=0;r<size;r++)for(let c=0;c<size;c++){if(qr.modules.get(r,c)&&!inBadge(r,c))path+=`M${c+margin} ${r+margin}h1v1h-1z`;}
 const b0=start+margin;
 const badgeSvg=logo?`<rect x="${b0-.4}" y="${b0-.4}" width="${badge+.8}" height="${badge+.8}" rx="${badge*.26}" fill="${light}"/><rect x="${b0+.3}" y="${b0+.3}" width="${badge-.6}" height="${badge-.6}" rx="${badge*.2}" fill="#E6B35E"/><text x="${b0+badge/2}" y="${b0+badge/2}" dy=".36em" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="900" font-size="${badge*.34}" letter-spacing="-.03em" fill="${dark}">JKJ</text>`:'';
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges" role="img" aria-label="QR code linking to ${text}"><rect width="${total}" height="${total}" fill="${light}"/><path d="${path}" fill="${dark}"/><g shape-rendering="geometricPrecision">${badgeSvg}</g></svg>`;
}
