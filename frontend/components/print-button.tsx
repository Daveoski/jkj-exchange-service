'use client';
import {Printer} from 'lucide-react';
export function PrintButton({className=''}:{className?:string}){
 return <button type="button" onClick={()=>window.print()} className={className}><Printer size={17}/> Print</button>;
}
