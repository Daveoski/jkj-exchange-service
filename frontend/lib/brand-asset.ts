import {readFileSync} from 'node:fs';
import {join} from 'node:path';
// Brand images as data URLs for build-time image generation (next/og), which can't fetch
// relative URLs.
export function brandDataUrl(file:'jkj-emblem.png'|'jkj-emblem-dark.png'|'jkj-logo.png'|'jkj-logo-dark.png'){
 return `data:image/png;base64,${readFileSync(join(process.cwd(),'public','brand',file)).toString('base64')}`;
}
