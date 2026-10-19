import {SiteHeader} from './site-header';
import {SiteFooter} from './site-footer';
import {FloatingContact} from './floating-contact';
import {RevealObserver} from './reveal-observer';
export function PublicShell({children}:{children:React.ReactNode}){return <><SiteHeader/><main id="main">{children}</main><SiteFooter/><FloatingContact/><RevealObserver/></>}
