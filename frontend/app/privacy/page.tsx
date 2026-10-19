import Link from 'next/link';
import {LegalPage,type LegalSection} from '@/components/legal-page';
import {BUSINESS} from '@/lib/constants';
export const metadata={title:'Privacy Notice',description:'How JKJ Exchange Services collects, uses, shares and protects personal data under the Nigeria Data Protection Act 2023.',alternates:{canonical:'/privacy'}};

const mail=<a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>;

const sections:LegalSection[]=[
 {id:'who',title:'Who we are',body:<>
  <p><strong>JKJ Exchange Services</strong> (“JKJ”, “we”, “us”) is a business based in Nigeria that responds to enquiries about international supplier payments. For the personal data described in this notice, JKJ is the <strong>data controller</strong>.</p>
  <p>Privacy contact: {mail} · WhatsApp {BUSINESS.whatsappDisplay} · Phone {BUSINESS.phoneDisplay}.</p>
 </>},
 {id:'collect',title:'Personal data we collect',body:<>
  <p><strong>Information you give us</strong> when you submit the enquiry form or contact us:</p>
  <ul><li>Full name, email address and phone/WhatsApp number</li><li>Business name (optional)</li><li>The service you are asking about, the currency, an approximate amount (optional) and your preferred contact method</li><li>The message you write and any later correspondence with us</li><li>Your confirmation that we may use these details to respond</li></ul>
  <p><strong>Information collected automatically:</strong></p>
  <ul><li>A one-way, keyed hash derived from your IP address and from your email address, used only for rate-limiting to prevent spam and abuse. We do not store your raw IP address with your enquiry.</li><li>Standard technical logs kept by our hosting provider (for example, request time, page requested and IP address) for security and reliability.</li><li>If anti-spam verification (Cloudflare Turnstile) is enabled on the form, Cloudflare processes limited device and interaction signals to tell humans from bots.</li></ul>
  <div className="callout"><strong>Please don’t send sensitive information through this website.</strong> Never include passwords, PINs, one-time codes, card numbers, full bank-account credentials or identity documents in the form. If verification is needed, we will explain a safe way to provide it.</div>
 </>},
 {id:'use',title:'How we use your data and our lawful bases',body:<>
  <p>Under the Nigeria Data Protection Act 2023 (NDPA) we must have a lawful basis for each use of personal data:</p>
  <table><thead><tr><th>Purpose</th><th>Lawful basis</th></tr></thead><tbody>
   <tr><td>Responding to your enquiry, contacting you by your chosen method and preparing a quotation</td><td>Your consent (given on the form) and steps taken at your request before entering into a contract</td></tr>
   <tr><td>Sending you a confirmation email with your enquiry reference</td><td>Steps taken at your request; our legitimate interest in giving you a record of your enquiry</td></tr>
   <tr><td>Managing follow-ups and keeping records of enquiries</td><td>Legitimate interest in running our business responsibly</td></tr>
   <tr><td>Preventing spam, fraud and abuse; securing the website</td><td>Legitimate interest in protecting our customers, staff and systems</td></tr>
   <tr><td>Identity verification and record-keeping if a transaction proceeds</td><td>Compliance with legal obligations, including anti-money-laundering law</td></tr>
  </tbody></table>
  <p>We do not use your data for automated decision-making that has legal or similarly significant effects on you, and we do not sell your personal data. We will only send marketing messages if you separately agree to receive them.</p>
 </>},
 {id:'share',title:'Who we share data with',body:<>
  <p>We share personal data only as needed to run this website and respond to you, with service providers acting on our instructions:</p>
  <table><thead><tr><th>Provider</th><th>Purpose</th></tr></thead><tbody>
   <tr><td>Vercel</td><td>Website and API hosting</td></tr>
   <tr><td>Neon</td><td>Secure database storage of enquiries</td></tr>
   <tr><td>Resend</td><td>Delivering enquiry notifications and confirmation emails</td></tr>
   <tr><td>Cloudflare (if enabled)</td><td>Anti-spam verification on the enquiry form</td></tr>
   <tr><td>WhatsApp / your email or phone provider</td><td>When you choose to contact us, or ask us to contact you, through these channels</td></tr>
  </tbody></table>
  <p>We may also disclose information where required by law, regulation or a lawful request from a competent authority, or to protect the rights, property or safety of JKJ, our customers or others.</p>
  <p>Exchange-rate figures on our website are fetched by our servers from public data sources. No information about you is sent to those sources.</p>
 </>},
 {id:'transfers',title:'International transfers',body:<>
  <p>Our hosting, database and email providers operate servers outside Nigeria, including in the United States. Where personal data is transferred outside Nigeria, we do so in line with the NDPA — relying on the transfer being necessary to respond to your request and on the contractual data-protection commitments these providers offer — and we take reasonable steps to ensure your data receives an adequate level of protection.</p>
 </>},
 {id:'retention',title:'How long we keep data',body:<>
  <ul>
   <li><strong>Enquiries that do not lead to a transaction:</strong> kept for up to 24 months after our last contact with you, then deleted.</li>
   <li><strong>Where a transaction proceeds:</strong> related records are kept for as long as required by law, including at least five years where anti-money-laundering rules apply.</li>
   <li><strong>Rate-limiting hashes:</strong> automatically deleted after about 48 hours.</li>
   <li><strong>Email delivery and hosting logs:</strong> kept by our providers for limited periods under their own retention policies.</li>
  </ul>
  <p>You can ask us to delete your enquiry sooner — see “Your rights” below.</p>
 </>},
 {id:'security',title:'How we protect your data',body:<>
  <p>We use appropriate technical and organisational measures, including encrypted connections (HTTPS), access to enquiries restricted to authorised staff with individual passwords stored as one-way hashes, session protection, rate limiting and security headers. Raw IP addresses are not stored with enquiries.</p>
  <p>No system is completely secure. If a personal-data breach occurs that is likely to put your rights at risk, we will notify the Nigeria Data Protection Commission and, where required, affected individuals, in line with the NDPA.</p>
 </>},
 {id:'rights',title:'Your rights',body:<>
  <p>Under the NDPA you have the right to:</p>
  <ul><li>be informed about how your data is used (this notice);</li><li>access a copy of the personal data we hold about you;</li><li>have inaccurate or incomplete data corrected;</li><li>have your data deleted where there is no longer a lawful reason to keep it;</li><li>restrict or object to certain processing, including processing based on legitimate interests;</li><li>withdraw your consent at any time (this does not affect processing already carried out);</li><li>receive your data in a commonly used format and have it transmitted to another controller, where applicable; and</li><li>lodge a complaint with the <strong>Nigeria Data Protection Commission (NDPC)</strong>.</li></ul>
  <p>To exercise any of these rights, email {mail}. We may need to verify your identity, and we aim to respond within 30 days.</p>
 </>},
 {id:'cookies',title:'Cookies and browser storage',body:<>
  <p>Public visitors are not tracked: we do not use advertising or analytics cookies.</p>
  <ul><li><strong>Exchange-rate pop-up:</strong> your browser’s session storage remembers that you have already seen the pop-up, so it doesn’t reappear on every page. It is cleared when you close the tab.</li><li><strong>Staff sign-in:</strong> a strictly necessary, secure cookie keeps authorised JKJ staff signed in to the private dashboard.</li><li>Fonts and images are served from our own website; no third-party font or tracking services are loaded.</li></ul>
 </>},
 {id:'children',title:'Children',body:<p>Our services are intended for businesses and adults. This website is not directed at anyone under 18, and we do not knowingly collect their personal data.</p>},
 {id:'changes',title:'Changes to this notice',body:<p>We may update this notice from time to time. The “last updated” date at the top shows when it was last changed. Significant changes will be highlighted on this page.</p>},
 {id:'contact',title:'Contact us',body:<p>Questions or requests about your personal data: {mail}. You can also reach us through our <Link href="/contact">contact page</Link>.</p>},
];

export default function Privacy(){return <LegalPage eyebrow="YOUR DATA, RESPECTED" title="Privacy notice" description="How JKJ Exchange Services collects, uses and protects your personal data, and the rights you have under Nigerian law." intro={<p>This notice explains how we handle personal data when you visit this website, send us an enquiry or contact us. It is written to meet the requirements of the <strong>Nigeria Data Protection Act 2023</strong>.</p>} sections={sections}/>}
