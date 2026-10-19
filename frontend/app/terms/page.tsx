import Link from 'next/link';
import {LegalPage,type LegalSection} from '@/components/legal-page';
import {BUSINESS} from '@/lib/constants';
export const metadata={title:'Website Terms',description:'The terms that apply to using the JKJ Exchange Services website, including exchange-rate information, enquiries and verification.',alternates:{canonical:'/terms'}};

const mail=<a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>;

const sections:LegalSection[]=[
 {id:'acceptance',title:'About these terms',body:<>
  <p>These terms apply to your use of this website, operated by <strong>JKJ Exchange Services</strong> (“JKJ”, “we”, “us”), a business based in Nigeria. By using the website you agree to them. If you do not agree, please do not use the website.</p>
  <p>These terms cover the website only. Any transaction you choose to make with JKJ will be governed by the specific terms we confirm with you for that transaction.</p>
 </>},
 {id:'nature',title:'What this website is — and isn’t',body:<>
  <p>This website provides general information about JKJ and lets you contact us or request a quote. It is <strong>not</strong> a payment platform:</p>
  <ul><li>No funds are received, held, exchanged or transferred through this website.</li><li>Nothing on the website is an offer to enter into a transaction, a guarantee of availability, or financial, legal, tax or investment advice.</li><li>Submitting an enquiry does not create a contract or oblige either you or JKJ to proceed.</li></ul>
 </>},
 {id:'rates',title:'Exchange rates and quotes',body:<>
  <p>The exchange-rate pop-up shows two kinds of information:</p>
  <ul><li><strong>Market reference rates</strong> — mid-market rates obtained automatically from public, third-party data sources and updated periodically. They may be delayed, may differ from rates available in Nigeria, and are shown for general information only.</li><li><strong>JKJ indicative rates</strong> (when shown) — a guide published by JKJ that may change at any time without notice.</li></ul>
  <div className="callout">No rate shown on this website is an offer or a guaranteed rate. The rate, fees, timing and terms for any transaction are agreed with you directly, for that transaction, before you commit. The “quick estimate” calculator is for illustration only.</div>
  <p>JKJ is not responsible for any decision you make based solely on rate information displayed on this website.</p>
 </>},
 {id:'your-use',title:'Your responsibilities',body:<>
  <p>When you use this website or send an enquiry, you agree to:</p>
  <ul><li>provide accurate, current information and only submit enquiries on your own behalf or with authority to act for your business;</li><li>not send passwords, PINs, one-time codes, card numbers, full bank credentials or identity documents through the website;</li><li>use our services only for lawful purposes and not in connection with prohibited goods, fraud, sanctions evasion or any other unlawful activity; and</li><li>confirm supplier payment instructions directly with your supplier before relying on them.</li></ul>
 </>},
 {id:'compliance',title:'Verification, compliance and our right to decline',body:<>
  <p>Before any transaction, JKJ may ask for identity verification, supporting documents (such as invoices) and information about the purpose of the payment, in line with applicable Nigerian laws and regulations, including anti-money-laundering and counter-terrorist-financing requirements such as the Money Laundering (Prevention and Prohibition) Act 2022.</p>
  <p>We may decline or stop discussing any request at our discretion — for example, if verification is incomplete, a route is unavailable, or a request appears unlawful or high-risk — and we may report suspicious activity to the relevant authorities where the law requires.</p>
 </>},
 {id:'fraud',title:'Fraud warning and official channels',body:<>
  <p>JKJ only communicates through the contact details published on this website:</p>
  <ul><li>WhatsApp: {BUSINESS.whatsappDisplay}</li><li>Phone: {BUSINESS.phoneDisplay}</li><li>Email: {mail}</li></ul>
  <p>We will <strong>never</strong> ask for your passwords, PINs or one-time codes. If you receive a message claiming to be from JKJ through any other channel, or asking you to pay into an unexpected account, do not act on it — contact us directly to confirm.</p>
 </>},
 {id:'third-parties',title:'Third-party names, trademarks and links',body:<>
  <p>Alipay, WeChat Pay, WhatsApp and the names of banks or other providers are trademarks of their respective owners. They are mentioned only to describe payment methods customers ask about and do not imply any partnership, affiliation or endorsement.</p>
  <p>Links to third-party websites or apps are provided for convenience. We are not responsible for their content, availability or privacy practices.</p>
 </>},
 {id:'ip',title:'Intellectual property',body:<p>The JKJ name, logo, website design, text and images are owned by or licensed to JKJ. You may view and share pages for personal or business reference, including our QR code, but you may not copy, modify or use our branding in a way that suggests you are JKJ or are endorsed by us.</p>},
 {id:'acceptable-use',title:'Acceptable use',body:<p>You must not misuse the website — including by attempting unauthorised access to any part of it, interfering with its operation, submitting automated or bulk enquiries, scraping it at scale, or introducing malicious code. We may block access or take other appropriate action if we detect misuse.</p>},
 {id:'liability',title:'Disclaimers and limitation of liability',body:<>
  <p>We work to keep the website accurate and available, but it is provided “as is” and “as available”. To the fullest extent permitted by Nigerian law, we exclude all warranties not expressly stated in these terms, and JKJ is not liable for any indirect or consequential loss, or for any loss arising from reliance on general website information (including rate information), service interruptions, or events outside our reasonable control.</p>
  <p>Nothing in these terms limits any liability that cannot lawfully be limited, or any rights you have under the Federal Competition and Consumer Protection Act 2018 or other applicable law.</p>
 </>},
 {id:'privacy',title:'Privacy',body:<p>Our <Link href="/privacy">privacy notice</Link> explains how we handle personal data submitted through this website.</p>},
 {id:'changes',title:'Changes to these terms',body:<p>We may update these terms from time to time. The “last updated” date shows the current version. Continuing to use the website after changes means you accept the updated terms.</p>},
 {id:'law',title:'Governing law and disputes',body:<p>These terms are governed by the laws of the Federal Republic of Nigeria. If a dispute arises, please contact us first so we can try to resolve it informally. Otherwise, the courts of Nigeria will have jurisdiction.</p>},
 {id:'contact',title:'Contact us',body:<p>Questions about these terms: {mail}, or visit our <Link href="/contact">contact page</Link>.</p>},
];

export default function Terms(){return <LegalPage eyebrow="WEBSITE INFORMATION" title="Website terms" description="The terms that apply when you use the JKJ Exchange Services website, view exchange-rate information or send us an enquiry." intro={<p>Please read these terms carefully. They explain what this website does, how exchange-rate information should be understood, and what we expect from everyone who uses it.</p>} sections={sections}/>}
