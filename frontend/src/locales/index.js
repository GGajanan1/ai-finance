// All translations in a single JS module — avoids JSON encoding/BOM issues
// Stubs use English text; native translations are marked TODO for contributors

const en = {
  nav: { dashboard:"Dashboard", equities:"Equities", sentiment:"Sentiment", macro:"Macro", settings:"Settings", systemStatus:"System Status", allSystemsOnline:"All Systems Online" },
  dashboard: { title:"Market Overview", subtitle:"Real-time institutional-grade analytics", yieldCurve:"Yield Curve (10Y-2Y)", inflationRate:"Inflation Rate", fedFundsRate:"Fed Funds Rate", finbertSentiment:"FinBERT Sentiment", searchTicker:"Search Ticker", analyzingHeadlines:"Analyzing latest headlines...", noSentimentData:"No sentiment data available for {{ticker}}.", activeWatchlist:"Active Watchlist", live:"● Live", addTicker:"Add Ticker", watchlistEmpty:"Watchlist is empty", source:"Source: yfinance" },
  equities: { title:"Equities", subtitle:"Search and analyze individual stocks", searchPlaceholder:"Search ticker or company...", analyzing:"Running AI Agent Analysis...", priceHistory:"Price History", aiAnalysis:"AI Agent Analysis", noData:"No data available" },
  sentiment: { title:"Sentiment Analysis", subtitle:"FinBERT powered news sentiment", analyzeCustom:"Analyze Custom News", placeholder:"Paste a news article or headline...", analyze:"Analyze", analyzing:"Analyzing...", results:"Results", confidence:"Confidence", agentSummary:"Agent Summary" },
  macro: { title:"Macroeconomic Data", subtitle:"Global economic indicators via World Bank & FRED", customizeTable:"Customize Table", dashboardConfig:"Dashboard Configuration", trackedCountries:"Tracked Countries (ISO-3)", trackedIndicators:"Tracked Indicators", selectIndicator:"-- Select an Indicator to Add --", globalIndicators:"Global Economic Indicators", loadingData:"Loading live data...", dataUnavailable:"Data unavailable", countryPlaceholder:"e.g. JPN, GBR" },
  settings: { title:"User Settings", subtitle:"Configure your AI Finance Toolkit preferences", defaultTicker:"Default Dashboard Ticker", defaultTickerHint:"Leave empty for general market news.", defaultTickerPlaceholder:"e.g. AAPL (leave empty for general)", newsLimit:"Number of News Articles to Analyze", newsLimitHint:"How many articles FinBERT should analyze (Max: 20).", refreshInterval:"Dashboard Auto-Refresh Interval (Seconds)", language:"Display Language", languageHint:"Changes the UI language immediately.", save:"Save Settings", saved:"Settings saved!", group:{ international:"International", indian:"Indian Languages" } },
  common: { loading:"Loading...", error:"An error occurred", retry:"Retry", na:"N/A", aiFinance:"AI Finance", hedgeFundStack:"Hedge Fund Stack", signIn:"Sign in with Google", signOut:"Sign Out", signingIn:"Signing in...", loginTitle:"Welcome to AI Finance", loginSubtitle:"Institutional-grade analytics powered by AI", loginDescription:"Sign in to sync your watchlist, settings, and macro preferences across devices.", signOutConfirm:"Are you sure you want to sign out?", signOutYes:"Yes, Sign Out", signOutCancel:"Cancel" },
  indicators: { "NY.GDP.MKTP.KD.ZG":"GDP Growth (Annual %)", "FP.CPI.TOTL.ZG":"Inflation Rate (%)", "SL.UEM.TOTL.ZS":"Unemployment Rate (%)", "FR.INR.REAL":"Real Interest Rate (%)", "BN.CAB.XOKA.GD.ZS":"Current Account Balance (% of GDP)", "GC.DOD.TOTL.GD.ZS":"Central Government Debt (% of GDP)", "BX.KLT.DINV.WD.GD.ZS":"FDI (% of GDP)" }
};

const hi = {
  nav: { dashboard:"डैशबोर्ड", equities:"इक्विटी", sentiment:"भावना", macro:"मैक्रो", settings:"सेटिंग्स", systemStatus:"सिस्टम स्थिति", allSystemsOnline:"सभी सिस्टम ऑनलाइन" },
  dashboard: { title:"बाज़ार अवलोकन", subtitle:"रियल-टाइम संस्थागत विश्लेषण", yieldCurve:"यील्ड कर्व (10Y-2Y)", inflationRate:"मुद्रास्फीति दर", fedFundsRate:"फेड फंड्स दर", finbertSentiment:"FinBERT भावना", searchTicker:"टिकर खोजें", analyzingHeadlines:"समाचार विश्लेषण हो रहा है...", noSentimentData:"{{ticker}} के लिए कोई डेटा नहीं।", activeWatchlist:"सक्रिय वॉचलिस्ट", live:"● लाइव", addTicker:"टिकर जोड़ें", watchlistEmpty:"वॉचलिस्ट खाली है", source:"स्रोत: yfinance" },
  equities: { title:"इक्विटी", subtitle:"शेयरों की खोज और विश्लेषण", searchPlaceholder:"टिकर खोजें...", analyzing:"AI विश्लेषण चल रहा है...", priceHistory:"मूल्य इतिहास", aiAnalysis:"AI विश्लेषण", noData:"डेटा उपलब्ध नहीं" },
  sentiment: { title:"भावना विश्लेषण", subtitle:"FinBERT समाचार भावना", analyzeCustom:"कस्टम विश्लेषण", placeholder:"समाचार यहाँ पेस्ट करें...", analyze:"विश्लेषण करें", analyzing:"विश्लेषण हो रहा है...", results:"परिणाम", confidence:"विश्वास", agentSummary:"एजेंट सारांश" },
  macro: { title:"समष्टि आर्थिक डेटा", subtitle:"विश्व बैंक और FRED के माध्यम से संकेतक", customizeTable:"तालिका अनुकूलित करें", dashboardConfig:"कॉन्फ़िगरेशन", trackedCountries:"ट्रैक किए गए देश", trackedIndicators:"ट्रैक किए गए संकेतक", selectIndicator:"-- संकेतक चुनें --", globalIndicators:"वैश्विक संकेतक", loadingData:"लाइव डेटा लोड हो रहा है...", dataUnavailable:"डेटा अनुपलब्ध", countryPlaceholder:"उदा. JPN, GBR" },
  settings: { title:"उपयोगकर्ता सेटिंग्स", subtitle:"अपनी प्राथमिकताएँ कॉन्फ़िगर करें", defaultTicker:"डिफ़ॉल्ट टिकर", defaultTickerHint:"सामान्य समाचार के लिए खाली छोड़ें।", defaultTickerPlaceholder:"उदा. AAPL", newsLimit:"समाचार लेखों की संख्या", newsLimitHint:"FinBERT कितने लेखों का विश्लेषण करे (अधिकतम: 20)।", refreshInterval:"ऑटो-रिफ्रेश अंतराल (सेकंड)", language:"प्रदर्शन भाषा", languageHint:"UI भाषा तुरंत बदलती है।", save:"सेटिंग्स सहेजें", saved:"सेटिंग्स सहेजी गईं!", group:{ international:"अंतर्राष्ट्रीय", indian:"भारतीय भाषाएँ" } },
  common: { loading:"लोड हो रहा है...", error:"त्रुटि हुई", retry:"पुनः प्रयास", na:"उपलब्ध नहीं", aiFinance:"AI Finance", hedgeFundStack:"Hedge Fund Stack", signIn:"Google से साइन इन करें", signOut:"साइन आउट", signingIn:"साइन इन हो रहा है...", loginTitle:"AI Finance में आपका स्वागत है", loginSubtitle:"AI द्वारा संचालित संस्थागत विश्लेषण", loginDescription:"अपनी वॉचलिस्ट और सेटिंग्स सिंक करने के लिए साइन इन करें।", signOutConfirm:"क्या आप वाकई साइन आउट करना चाहते हैं?", signOutYes:"हाँ, साइन आउट", signOutCancel:"रद्द करें" },
  indicators: { "NY.GDP.MKTP.KD.ZG":"GDP वृद्धि (वार्षिक %)", "FP.CPI.TOTL.ZG":"मुद्रास्फीति दर (%)", "SL.UEM.TOTL.ZS":"बेरोजगारी दर (%)", "FR.INR.REAL":"वास्तविक ब्याज दर (%)", "BN.CAB.XOKA.GD.ZS":"चालू खाता शेष (%)", "GC.DOD.TOTL.GD.ZS":"सरकारी ऋण (%)", "BX.KLT.DINV.WD.GD.ZS":"प्रत्यक्ष विदेशी निवेश (%)" }
};

// Stub template — contributors replace values with native language text
const makeStub = (overrides = {}) => ({ ...en, ...overrides });

export const resources = {
  en:  { translation: en },
  hi:  { translation: hi },
  // Indian — stubs (contribute native translations by editing these objects)
  bn:  { translation: makeStub() },  // Bengali - বাংলা
  te:  { translation: makeStub() },  // Telugu - తెలుగు
  mr:  { translation: makeStub() },  // Marathi - मराठी
  ta:  { translation: makeStub() },  // Tamil - தமிழ்
  ur:  { translation: makeStub() },  // Urdu - اردو
  gu:  { translation: makeStub() },  // Gujarati - ગુજરાતી
  kn:  { translation: makeStub() },  // Kannada - ಕನ್ನಡ
  ml:  { translation: makeStub() },  // Malayalam - മലയാളം
  or:  { translation: makeStub() },  // Odia - ଓଡ଼ିଆ
  pa:  { translation: makeStub() },  // Punjabi - ਪੰਜਾਬੀ
  as:  { translation: makeStub() },  // Assamese - অসমীয়া
  mai: { translation: makeStub() },  // Maithili - मैथिली
  sa:  { translation: makeStub() },  // Sanskrit - संस्कृतम्
  ks:  { translation: makeStub() },  // Kashmiri - كٲشُر
  ne:  { translation: makeStub() },  // Nepali - नेपाली
  sd:  { translation: makeStub() },  // Sindhi - سنڌي
  kok: { translation: makeStub() },  // Konkani - कोंकणी
  doi: { translation: makeStub() },  // Dogri - डोगरी
  brx: { translation: makeStub() },  // Bodo - बड़ो
  mni: { translation: makeStub() },  // Manipuri - মৈতৈলোন্
  sat: { translation: makeStub() },  // Santali - ᱥᱟᱱᱛᱟᱲᱤ
  // International — stubs
  zh:  { translation: makeStub() },  // Simplified Chinese - 中文
  fr:  { translation: makeStub() },  // French - Français
  ar:  { translation: makeStub() },  // Arabic - العربية
};
