export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://jkj-exchange-service.vercel.app').replace(/\/$/, '');
export const BUSINESS = {
  name:'JKJ Exchange Services',
  whatsapp:'2348039622879',
  whatsappDisplay:'0803 962 2879',
  phone:'08118731958',
  phoneInternational:'+2348118731958',
  phoneDisplay:'0811 873 1958',
  email:'jideofork@gmail.com',
  location:'Nigeria • Serving international trade inquiries'
};
export const whatsappLink = (message='Hello JKJ Exchange Services, I would like to inquire about your RMB and USD payment services.') => `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(message)}`;
export const services = [
  {slug:'rmb',title:'RMB Supplier Payments',short:'Make enquiries about settling eligible payments with suppliers in China in Chinese yuan.',tag:'CHINA TRADE',icon:'¥',description:'Tell us what you need to pay, where your supplier is based and the expected currency. Our team can discuss the requirements, available channels and a tailored quotation.'},
  {slug:'usd',title:'USD Payment Support',short:'Ask about US dollar payment requirements for your international business transactions.',tag:'GLOBAL TRADE',icon:'$',description:'For importers and businesses with USD-denominated invoices, JKJ can review your needs and communicate available payment options and requirements.'},
  {slug:'alipay',title:'Alipay Enquiries',short:'Discuss payment requests involving Alipay accounts used by participating Chinese suppliers.',tag:'PAYMENT CHANNEL',icon:'A',description:'Share the basic details of the payment channel requested by your supplier and we can discuss whether the arrangement can be supported.'},
  {slug:'wechat',title:'WeChat Pay Enquiries',short:'Explore suitable arrangements for supplier requests involving WeChat Pay.',tag:'PAYMENT CHANNEL',icon:'W',description:'Our team can review the requested channel and explain documentation and availability before any transaction proceeds.'},
  {slug:'bank',title:'Bank Transfer Enquiries',short:'Ask about cross-border bank payment requirements for international invoices.',tag:'BANKING',icon:'↗',description:'Contact us about supplier bank-payment instructions. Relevant checks, intermediary processing and banking restrictions may apply.'}
] as const;
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
