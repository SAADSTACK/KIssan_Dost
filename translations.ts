import { LanguageOption } from './types';

export const getDirection = (lang: LanguageOption): 'rtl' | 'ltr' => {
  return lang === 'English' ? 'ltr' : 'rtl';
};

export const translations = {
  English: {
    appTitle: "Kissan Dost",
    aiPlatform: "AI PLATFORM",
    welcomeTitle: "Your Expert",
    welcomeTitleHighlight: "Agricultural Advisor",
    welcomeSubtitle: "Get instant diagnosis for crop diseases, real-time Mandi prices, and climate-smart farming strategies.",
    inputPlaceholder: "Ask about crop diseases, market prices, or farming advice...",
    voiceInput: "Voice Input",
    askButton: "Ask Kissan Dost",
    settings: {
      title: "Settings",
      language: "Language Preference",
      appearance: "Appearance",
      darkMode: "Dark Mode",
      bubbleStyle: "Message Bubble Style",
      fontSize: "Font Size",
      fontSizeOptions: {
        small: "Small",
        normal: "Normal",
        large: "Large"
      },
      done: "Done"
    },
    message: {
      advisorResponse: "Advisor Response",
      analysisResult: "Analysis Result",
      diagnosis: "Diagnosis / Analysis",
      actionPlan: "Action Plan",
      strategicAdvice: "Strategic Advice",
      sources: "Sources",
      analyzing: "Analyzing data & market trends...",
      errorTitle: "Response Error",
      loading: "Thinking..."
    }
  },
  Urdu: {
    appTitle: "کسان دوست",
    aiPlatform: "اے آئی پلیٹ فارم",
    welcomeTitle: "آپ کا ماہر",
    welcomeTitleHighlight: "زرعی مشیر",
    welcomeSubtitle: "فصلوں کی بیماریوں کی فوری تشخیص، منڈی کے تازہ ترین نرخ، اور موسمیاتی کاشتکاری کی حکمت عملی حاصل کریں۔",
    inputPlaceholder: "فصل کی بیماری، منڈی کے نرخ، یا کاشتکاری کے مشورے پوچھیں...",
    voiceInput: "آواز ان پٹ",
    askButton: "کسان دوست سے پوچھیں",
    settings: {
      title: "ترتیبات",
      language: "زبان کا انتخاب",
      appearance: "ظاہری شکل",
      darkMode: "ڈارک موڈ",
      bubbleStyle: "میسج ببل کا انداز",
      fontSize: "فونٹ کا سائز",
      fontSizeOptions: {
        small: "چھوٹا",
        normal: "نارمل",
        large: "بڑا"
      },
      done: "مکمل"
    },
    message: {
      advisorResponse: "مشیر کا جواب",
      analysisResult: "تجزیہ کا نتیجہ",
      diagnosis: "تشخیص / تجزیہ",
      actionPlan: "عمل کا منصوبہ",
      strategicAdvice: "اسٹریٹجک مشورہ",
      sources: "ذرائع",
      analyzing: "ڈیٹا اور مارکیٹ کے رجحانات کا تجزیہ کیا جا رہا ہے...",
      errorTitle: "جواب میں خرابی",
      loading: "سوچ رہا ہے..."
    }
  },
  'Punjabi (Pakistani)': {
    appTitle: "کسان دوست",
    aiPlatform: "اے آئی پلیٹ فارم",
    welcomeTitle: "تہاڈا ماہر",
    welcomeTitleHighlight: "زرعی مشیر",
    welcomeSubtitle: "فصلاں دیاں بیماریاں دی فوری تشخیص، منڈی دے تازے ریٹ، تے موسمیاتی کھیتی باڑی دیاں حکمت عملیاں حاصل کرو۔",
    inputPlaceholder: "فصل دی بیماری، منڈی دے ریٹ، یا کھیتی باڑی دے مشورے پچھو...",
    voiceInput: "آواز ان پٹ",
    askButton: "کسان دوست کولوں پچھو",
    settings: {
      title: "ترتیبات",
      language: "زبان دا انتخاب",
      appearance: "ظاہری شکل",
      darkMode: "ڈارک موڈ",
      bubbleStyle: "میسج ببل دا انداز",
      fontSize: "فونٹ دا سائز",
      fontSizeOptions: {
        small: "چھوٹا",
        normal: "نارمل",
        large: "وڈا"
      },
      done: "مکمل"
    },
    message: {
      advisorResponse: "مشیر دا جواب",
      analysisResult: "تجزیہ دا نتیجہ",
      diagnosis: "تشخیص / تجزیہ",
      actionPlan: "عمل دا منصوبہ",
      strategicAdvice: "اسٹریٹجک مشورہ",
      sources: "ذرائع",
      analyzing: "ڈیٹا تے مارکیٹ دے رجحانات دا تجزیہ کیتا جا رہیا اے...",
      errorTitle: "جواب وچ خرابی",
      loading: "سوچ رہیا اے..."
    }
  },
  Sindhi: {
    appTitle: "ڪسان دوست",
    aiPlatform: "AI پليٽ فارم",
    welcomeTitle: "توهان جو ماهر",
    welcomeTitleHighlight: "زرعي صلاحڪار",
    welcomeSubtitle: "فصلن جي بيمارين جي فوري تشخيص، منڊي جا ريٽ، ۽ موسمياتي زراعت جي حڪمت عملي حاصل ڪريو.",
    inputPlaceholder: "فصل جي بيماري، منڊي جي قيمت، يا پوکي بابت صلاح پڇو...",
    voiceInput: "آواز ان پٽ",
    askButton: "ڪسان دوست کان پڇو",
    settings: {
      title: "سيٽنگون",
      language: "ٻولي جي چونڊ",
      appearance: "ظاهري شڪل",
      darkMode: "ڊارڪ موڊ",
      bubbleStyle: "ميسيج ببل جو انداز",
      fontSize: "فونٽ جي سائيز",
      fontSizeOptions: {
        small: "ننڍو",
        normal: "نارمل",
        large: "وڏو"
      },
      done: "مڪمل"
    },
    message: {
      advisorResponse: "صلاحڪار جو جواب",
      analysisResult: "تجزيو نتيجو",
      diagnosis: "تشخيص / تجزيو",
      actionPlan: "عملي منصوبو",
      strategicAdvice: "اسٽريٽجڪ مشورو",
      sources: "ذريعا",
      analyzing: "ڊيٽا ۽ مارڪيٽ جي رجحانن جو تجزيو ڪري رهيو آهي...",
      errorTitle: "جواب ۾ غلطي",
      loading: "سوچي رهيو آهي..."
    }
  },
  Pashto: {
    appTitle: "کسان دوست",
    aiPlatform: "AI پلیټ فارم",
    welcomeTitle: "ستاسو ماهر",
    welcomeTitleHighlight: "کرنیز مشاور",
    welcomeSubtitle: "د فصلونو ناروغیو فوري تشخیص، د منډي نرخونه، او د اقلیمي کرنې ستراتیژۍ ترلاسه کړئ.",
    inputPlaceholder: "د فصل ناروغۍ، د بازار نرخونه، یا د کرنې مشوره وپوښتئ...",
    voiceInput: "غږ ان پټ",
    askButton: "د کسان دوست نه وپوښتئ",
    settings: {
      title: "ترتیبات",
      language: "د ژبې انتخاب",
      appearance: "ظاهري بڼه",
      darkMode: "تاره موډ",
      bubbleStyle: "د پیغام بلبل سټایل",
      fontSize: "د فونټ کچه",
      fontSizeOptions: {
        small: "کوچنی",
        normal: "نورمال",
        large: "لوی"
      },
      done: "بشپړ",
    },
    message: {
      advisorResponse: "د مشاور ځواب",
      analysisResult: "د تحلیل پایله",
      diagnosis: "تشخیص / تحلیل",
      actionPlan: "د عمل پلان",
      strategicAdvice: "ستراتیژیکه مشوره",
      sources: "سرچینې",
      analyzing: "د معلوماتو او بازار رجحاناتو تحلیل کول...",
      errorTitle: "د ځواب تېروتنه",
      loading: "فکر کول..."
    }
  }
};