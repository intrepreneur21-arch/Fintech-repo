/**
 * Client-side i18n translations
 * Supports English, Hindi, and Marathi
 */

type Language = "en" | "hi" | "mr";

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

const translations: Translations = {
  // Common
  "common.dashboard": {
    en: "Dashboard",
    hi: "डैशबोर्ड",
    mr: "डॅशबोर्ड",
  },
  "common.createPage": {
    en: "Create Payment Page",
    hi: "भुगतान पृष्ठ बनाएं",
    mr: "पेमेंट पेज बनवा",
  },
  "common.settings": {
    en: "Settings",
    hi: "सेटिंग्स",
    mr: "सेटिंग्स",
  },
  "common.logout": {
    en: "Logout",
    hi: "लॉगआउट",
    mr: "लॉगआउट",
  },

  // Dashboard
  "dashboard.title": {
    en: "Dashboard",
    hi: "डैशबोर्ड",
    mr: "डॅशबोर्ड",
  },
  "dashboard.welcome": {
    en: "Welcome back",
    hi: "वापस स्वागत है",
    mr: "परत आपले स्वागत आहे",
  },
  "dashboard.totalPages": {
    en: "Total Pages",
    hi: "कुल पृष्ठ",
    mr: "एकूण पृष्ठे",
  },
  "dashboard.transactions": {
    en: "Transactions",
    hi: "लेनदेन",
    mr: "व्यवहार",
  },
  "dashboard.totalRevenue": {
    en: "Total Revenue",
    hi: "कुल राजस्व",
    mr: "एकूण महसूल",
  },
  "dashboard.thisMonth": {
    en: "This Month",
    hi: "इस महीने",
    mr: "या महिन्यात",
  },
  "dashboard.paymentPages": {
    en: "Payment Pages",
    hi: "भुगतान पृष्ठ",
    mr: "पेमेंट पेजेस",
  },
  "dashboard.recentTransactions": {
    en: "Recent Transactions",
    hi: "हाल के लेनदेन",
    mr: "अलीकडील व्यवहार",
  },
  "dashboard.noPagesYet": {
    en: "No payment pages yet. Create one to get started!",
    hi: "अभी तक कोई भुगतान पृष्ठ नहीं। शुरू करने के लिए एक बनाएं!",
    mr: "अजून कोणतेही पेमेंट पेज नाहीत. सुरुवात करण्यासाठी एक बनवा!",
  },
  "dashboard.noTransactions": {
    en: "No transactions yet",
    hi: "अभी तक कोई लेनदेन नहीं",
    mr: "अजून कोणतेही व्यवहार नाहीत",
  },

  // Create Page
  "createPage.title": {
    en: "Create Payment Page",
    hi: "भुगतान पृष्ठ बनाएं",
    mr: "पेमेंट पेज बनवा",
  },
  "createPage.description": {
    en: "Use AI to generate a payment page with a simple prompt",
    hi: "एक सरल प्रॉम्प्ट के साथ एक भुगतान पृष्ठ बनाने के लिए AI का उपयोग करें",
    mr: "साध्या प्रॉम्प्टसह पेमेंट पेज तयार करण्यासाठी AI वापरा",
  },
  "createPage.language": {
    en: "Language",
    hi: "भाषा",
    mr: "भाषा",
  },
  "createPage.prompt": {
    en: "Your Prompt",
    hi: "आपका प्रॉम्प्ट",
    mr: "आपले प्रॉम्प्ट",
  },
  "createPage.promptPlaceholder": {
    en: "E.g., Payment page banao for Online Course, ₹5000, collect email and phone",
    hi: "उदा., ऑनलाइन कोर्स के लिए भुगतान पृष्ठ बनाएं, ₹5000, ईमेल और फोन एकत्र करें",
    mr: "उदा., ऑनलाइन कोर्सासाठी पेमेंट पेज बनवा, ₹5000, ईमेल आणि फोन गोळा करा",
  },
  "createPage.promptHint": {
    en: "Include: product name, amount (₹), contact fields (email/phone), and billing type (one-time or monthly)",
    hi: "शामिल करें: उत्पाद का नाम, राशि (₹), संपर्क क्षेत्र (ईमेल/फोन), और बिलिंग प्रकार (एकबारी या मासिक)",
    mr: "समाविष्ट करा: उत्पादाचे नाव, रक्कम (₹), संपर्क क्षेत्र (ईमेल/फोन), आणि बिलिंग प्रकार (एकबारी किंवा मासिक)",
  },
  "createPage.createButton": {
    en: "Create Payment Page",
    hi: "भुगतान पृष्ठ बनाएं",
    mr: "पेमेंट पेज बनवा",
  },
  "createPage.creating": {
    en: "Creating...",
    hi: "बना रहे हैं...",
    mr: "तयार करत आहे...",
  },
  "createPage.proTips": {
    en: "Pro Tips",
    hi: "प्रो टिप्स",
    mr: "प्रो टिप्स",
  },
  "createPage.includeAmount": {
    en: "Include Amount",
    hi: "राशि शामिल करें",
    mr: "रक्कम समाविष्ट करा",
  },
  "createPage.contactFields": {
    en: "Contact Fields",
    hi: "संपर्क क्षेत्र",
    mr: "संपर्क क्षेत्र",
  },
  "createPage.billingType": {
    en: "Billing Type",
    hi: "बिलिंग प्रकार",
    mr: "बिलिंग प्रकार",
  },

  // Plan
  "plan.freePlan": {
    en: "Free Plan",
    hi: "मुक्त योजना",
    mr: "मुक्त योजना",
  },
  "plan.starterPlan": {
    en: "Starter Plan",
    hi: "स्टार्टर योजना",
    mr: "स्टार्टर योजना",
  },
  "plan.proPlan": {
    en: "Pro Plan",
    hi: "प्रो योजना",
    mr: "प्रो योजना",
  },
  "plan.currentPlan": {
    en: "Current Plan",
    hi: "वर्तमान योजना",
    mr: "वर्तमान योजना",
  },
  "plan.pagesCreated": {
    en: "Pages Created",
    hi: "बनाए गए पृष्ठ",
    mr: "तयार केलेले पृष्ठे",
  },
  "plan.upgradePlan": {
    en: "Upgrade Plan",
    hi: "योजना अपग्रेड करें",
    mr: "योजना अपग्रेड करा",
  },

  // Language
  "language.english": {
    en: "English",
    hi: "अंग्रेजी",
    mr: "इंग्रजी",
  },
  "language.hindi": {
    en: "हिंदी (Hindi)",
    hi: "हिंदी (Hindi)",
    mr: "हिंदी (Hindi)",
  },
  "language.marathi": {
    en: "मराठी (Marathi)",
    hi: "मराठी (Marathi)",
    mr: "मराठी (Marathi)",
  },
};

export const i18n = {
  t: (key: string, language: Language = "en"): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translation[language] || translation["en"] || key;
  },

  getTranslations: (language: Language) => {
    const result: Record<string, string> = {};
    Object.entries(translations).forEach(([key, trans]) => {
      result[key] = trans[language] || trans["en"] || key;
    });
    return result;
  },
};
