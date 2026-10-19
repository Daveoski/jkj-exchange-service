export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://jkj-exchange-service.vercel.app').replace(/\/$/, '');
export const BUSINESS = {
  name:'JKJ Exchange Services',
  whatsapp:'2348039622879',
  whatsappDisplay:'+234 803 962 2879',
  phone:'+2348118731958',
  phoneInternational:'+2348118731958',
  phoneDisplay:'+234 811 873 1958',
  email:'jideofork@gmail.com',
  location:'Nigeria • Serving international trade inquiries'
};
export const whatsappLink = (message='Hello JKJ Exchange Services, I would like to inquire about your RMB and USD payment services.') => `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(message)}`;

export type Service = {
  slug:string;title:string;short:string;tag:string;icon:string;description:string;
  overview:string[];forWho:string[];useCases:string[];prepare:string[];considerations:string[];faqs:{q:string;a:string}[];
};

export const services:Service[] = [
  {slug:'rmb',title:'RMB Supplier Payments',tag:'CHINA TRADE',icon:'¥',
   short:'Make enquiries about settling eligible payments with suppliers in China in Chinese yuan.',
   description:'Tell us what you need to pay, where your supplier is based and the expected currency. Our team can discuss the requirements, available channels and a tailored quotation.',
   overview:[
    'Most Chinese manufacturers, wholesalers and market traders invoice in renminbi (RMB), also written as CNY. Whether you are buying stock from a factory in Guangdong, sourcing goods in Yiwu or paying a trading company in Shenzhen, your supplier will usually ask to be paid in RMB — either into a Chinese bank account or through a local payment app.',
    'JKJ Exchange Services helps Nigerian importers and businesses work out how to settle those RMB invoices. You tell us the amount, the supplier’s preferred receiving channel and your deadline; we talk you through the routes that may be available, the information we will need, and give you a quote for your specific request before anything moves.'
   ],
   forWho:['Importers buying stock from Chinese factories and wholesalers','Traders restocking from major Chinese wholesale markets','Businesses paying deposits or balances on production orders','Individuals paying for samples or small first orders'],
   useCases:['Paying a deposit so the factory can start production','Settling the balance before goods are released for shipping','Paying for samples, packaging, tooling or moulds','Paying a sourcing agent, inspection company or freight forwarder in China'],
   prepare:['The supplier’s proforma invoice or order confirmation','The amount in RMB and the date it is due','How the supplier wants to receive payment (bank, Alipay or WeChat Pay)','Your preferred way for us to contact you'],
   considerations:['Rates and availability change daily, so your quote is confirmed at the time of the transaction.','Identity verification and documentation checks may apply before any transaction.','Always confirm the supplier’s receiving details with them directly. Fraudsters sometimes send fake “new account” messages.'],
   faqs:[
    {q:'Is RMB the same as CNY?',a:'Yes. Renminbi (RMB) is the name of China’s currency and CNY is its official currency code. Both refer to the Chinese yuan (¥).'},
    {q:'How do I know what rate I will get?',a:'The rates pop-up on our website shows indicative reference rates. Your actual rate depends on the amount, the receiving channel and timing, and JKJ confirms it with you directly before you commit.'},
    {q:'Can you pay any bank or account in China?',a:'Tell us the receiving bank or app and the city. We will confirm whether a route is available for your request and what details are needed.'}
   ]},
  {slug:'usd',title:'USD Payment Support',tag:'GLOBAL TRADE',icon:'$',
   short:'Ask about US dollar payment requirements for your international business transactions.',
   description:'For importers and businesses with USD-denominated invoices, JKJ can review your needs and communicate available payment options and requirements.',
   overview:[
    'Not every supplier invoices in yuan. Many exporters — in China, Hong Kong, the UAE, Turkey, Europe and the Americas — quote and invoice in US dollars. Freight forwarders, inspection companies and other trade service providers often bill in dollars too.',
    'If your invoice says USD, JKJ can review the request with you: who you are paying, where they are, how they want to receive funds and by when. We explain the options and requirements that may apply and provide a tailored quote, so you can decide with the full picture in front of you.'
   ],
   forWho:['Importers with US dollar invoices from overseas suppliers','Businesses paying international logistics or service providers','Buyers dealing with exporters that only quote in dollars','Companies settling recurring international supplier bills'],
   useCases:['Paying a USD invoice for goods or raw materials','Settling freight, shipping or inspection fees billed in dollars','Paying deposits to exporters who only accept USD','Settling balances on international purchase orders'],
   prepare:['The invoice showing the USD amount and the beneficiary’s country','When the payment is due','A short description of the goods or services being paid for','Your preferred contact method'],
   considerations:['International transfers can pass through intermediary banks, which may deduct fees and add time.','Supporting documents such as an invoice may be required for compliance.','All payments are subject to compliance and sanctions screening.'],
   faqs:[
    {q:'Can you help with suppliers outside China?',a:'Yes. USD and other international supplier-payment enquiries are welcome, subject to availability and compliance checks.'},
    {q:'What documents might I need?',a:'Usually an invoice or proforma, plus identity verification. We tell you exactly what is required for your request when we contact you.'},
    {q:'How long does a USD payment take?',a:'Timing depends on the route, the receiving bank and any intermediary banks. We discuss realistic timelines for your specific request before you proceed.'}
   ]},
  {slug:'alipay',title:'Alipay Enquiries',tag:'PAYMENT CHANNEL',icon:'A',
   short:'Discuss payment requests involving Alipay accounts used by participating Chinese suppliers.',
   description:'Share the basic details of the payment channel requested by your supplier and we can discuss whether the arrangement can be supported.',
   overview:[
    'Alipay is one of China’s most widely used mobile payment platforms. Many small suppliers, online sellers and market traders prefer to receive payment directly into their Alipay account — especially for smaller orders, samples and purchases from online wholesale platforms.',
    'If your supplier has asked to be paid by Alipay, tell us about the order. JKJ will discuss whether an arrangement can be supported for your request, what information is needed and the quote that applies.'
   ],
   forWho:['Buyers ordering from online wholesale and retail platforms in China','Small suppliers who prefer Alipay over bank transfer','Buyers paying for samples or trial orders','Traders with frequent smaller purchases'],
   useCases:['Paying a supplier’s Alipay account for goods','Settling an online order that requires an Alipay payment','Paying for product samples before a bulk order','Paying small balances or extra charges'],
   prepare:['The amount in RMB','An order screenshot, invoice or quotation','The supplier’s Alipay details — share these privately when we contact you, not in the public form','Your deadline'],
   considerations:['Alipay is a trademark of its owner. JKJ is not affiliated with, or endorsed by, Alipay.','Recipient account limits and verification rules on the supplier’s side may apply.','Double-check the recipient’s account name with your supplier before paying.'],
   faqs:[
    {q:'Do I need my own Alipay account?',a:'Not necessarily. Tell us how your supplier wants to be paid and we will explain the options that may be available.'},
    {q:'Is there a minimum amount?',a:'Requirements vary by request. Share the amount when you enquire and we will let you know.'}
   ]},
  {slug:'wechat',title:'WeChat Pay Enquiries',tag:'PAYMENT CHANNEL',icon:'W',
   short:'Explore suitable arrangements for supplier requests involving WeChat Pay.',
   description:'Our team can review the requested channel and explain documentation and availability before any transaction proceeds.',
   overview:[
    'WeChat is where much of China’s business conversation happens, and WeChat Pay is built right into it. It is common for suppliers you chat with on WeChat to send a payment QR code or ask you to pay through WeChat Pay.',
    'If your supplier has requested WeChat Pay, JKJ can review the request with you, explain what is required and whether an arrangement can be supported, and give you a quote before anything proceeds.'
   ],
   forWho:['Buyers who negotiate with suppliers directly on WeChat','Suppliers who send WeChat Pay QR codes for payment','Buyers paying for samples, small orders or extra charges','Traders working with individual sellers or small workshops'],
   useCases:['Paying a supplier’s WeChat Pay QR code','Settling small orders agreed in a WeChat chat','Paying for samples or urgent add-ons','Paying small service providers in China'],
   prepare:['The amount in RMB','A screenshot of the order or agreement','The supplier’s WeChat Pay QR code or details — share privately when we contact you','When payment is needed'],
   considerations:['WeChat and WeChat Pay are trademarks of their owner. JKJ is not affiliated with, or endorsed by, them.','Recipient limits and verification rules may apply.','Be cautious of last-minute changes to payment QR codes and confirm with your supplier by voice or video.'],
   faqs:[
    {q:'My supplier sent a QR code. Can you work with that?',a:'Tell us about it when you enquire. We will explain what is needed and whether the arrangement can be supported.'},
    {q:'Is WeChat Pay different from Alipay?',a:'They are separate Chinese payment platforms. Suppliers usually prefer one or the other — just tell us which one your supplier asked for.'}
   ]},
  {slug:'bank',title:'Bank Transfer Enquiries',tag:'BANKING',icon:'↗',
   short:'Ask about cross-border bank payment requirements for international invoices.',
   description:'Contact us about supplier bank-payment instructions. Relevant checks, intermediary processing and banking restrictions may apply.',
   overview:[
    'Larger suppliers and established companies often prefer payment by bank transfer to their corporate account. Their invoice will usually list a bank name, account number and a SWIFT/BIC code.',
    'JKJ can review your supplier’s bank-payment requirements with you, explain the routes that may be available, the checks and documents involved, and give you a clear quote before anything moves.'
   ],
   forWho:['Importers paying established manufacturers with corporate accounts','Businesses settling larger invoices','Buyers whose suppliers require payment that matches the invoice name','Companies that need clear payment records for accounting'],
   useCases:['Paying a supplier’s corporate bank account in China or abroad','Settling large production orders or contracts','Paying invoices that must match the supplier’s company name','Making payments that need a clear paper trail'],
   prepare:['The invoice with the supplier’s company name and country','The currency and amount','When the payment is due','Your preferred contact method — share bank details privately when we contact you'],
   considerations:['Intermediary (correspondent) banks may deduct fees and add processing time.','Banks may request supporting documents, and some payments can be delayed by compliance reviews.','Never act on emailed changes to bank details without confirming directly with your supplier.'],
   faqs:[
    {q:'What is a SWIFT code?',a:'A SWIFT/BIC code identifies a bank for international transfers. It usually appears on your supplier’s invoice together with their account details.'},
    {q:'Why might the supplier receive less than I sent?',a:'Intermediary banks sometimes deduct fees along the way. We explain how charges may apply to your route before you proceed.'}
   ]}
];

export const SERVICE_OPTIONS = [
  {value:'rmb',label:'RMB supplier payment'},
  {value:'usd',label:'USD supplier payment'},
  {value:'alipay',label:'Alipay'},
  {value:'wechat',label:'WeChat Pay'},
  {value:'bank',label:'Bank transfer'},
  {value:'other',label:'Other enquiry'}
] as const;
export const SERVICE_LABELS:Record<string,string> = Object.fromEntries(SERVICE_OPTIONS.map(o=>[o.value,o.label]));
export const DEFAULT_CURRENCY:Record<string,string> = {rmb:'CNY',usd:'USD',alipay:'CNY',wechat:'CNY',bank:'USD',other:'OTHER'};
export const LEGAL_UPDATED = '19 October 2026';
