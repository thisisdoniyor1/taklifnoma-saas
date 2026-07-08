// Transliteration maps: Latin → script for each language
// Used to convert names entered in Latin alphabet to the viewer's language script

const LATIN_TO_RU = {
  'shch':'щ','sch':'щ','shtch':'щ',
  'zh':'ж','kh':'х','ts':'ц','ch':'ч','sh':'ш','yu':'ю','ya':'я','yo':'ё',
  'a':'а','b':'б','v':'в','g':'г','d':'д','e':'е','z':'з','i':'и','j':'дж',
  'y':'й','k':'к','l':'л','m':'м','n':'н','o':'о','p':'п','r':'р',
  's':'с','t':'т','u':'у','f':'ф','h':'х','c':'к','q':'к','w':'в','x':'кс',
};

const LATIN_TO_UZ_CYRL = {
  "o'": 'ў', "o’": 'ў', "o‘": 'ў', "o`": 'ў',
  "g'": 'ғ', "g’": 'ғ', "g‘": 'ғ', "g`": 'ғ',
  'shch':'шч','sh':'ш','ch':'ч','zh':'ж','kh':'х','gh':'ғ','ng':'нг','ts':'тс',
  'a':'а','b':'б','d':'д','e':'е','f':'ф','g':'г','h':'ҳ','i':'и',
  'j':'ж','k':'к','l':'л','m':'м','n':'н','o':'о','p':'п','q':'қ',
  'r':'р','s':'с','t':'т','u':'у','v':'в','w':'в','x':'х','y':'й','z':'з',
};

const LATIN_TO_TJ = {
  "o'": 'ӯ', "o’": 'ӯ', "o‘": 'ӯ', "o`": 'ӯ',
  "g'": 'ғ', "g’": 'ғ', "g‘": 'ғ', "g`": 'ғ',
  'sh':'ш','ch':'ч','zh':'ж','kh':'х','gh':'ғ','ts':'тс',
  'a':'а','b':'б','d':'д','e':'е','f':'ф','g':'г','h':'ҳ','i':'и',
  'j':'ҷ','k':'к','l':'л','m':'м','n':'н','o':'о','p':'п','q':'қ',
  'r':'р','s':'с','t':'т','u':'у','v':'в','w':'в','x':'х','y':'й','z':'з',
};

const CYRILLIC_TO_LATIN = {
  'щ': 'shch', 'ж': 'zh', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 
  'ю': 'yu', 'я': 'ya', 'ё': 'yo', 'ғ': 'gh', 'қ': 'q', 'ҳ': 'h', 'ҷ': 'j', 'ӣ': 'i', 'ӯ': 'u',
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'з': 'z', 'и': 'i', 
  'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 
  'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'э': 'e'
};

function transliterate(text, map) {
  if (!text) return text;
  let result = '';
  let i = 0;
  const lower = text.toLowerCase();
  while (i < lower.length) {
    // Try longest match first (up to 4 chars)
    let matched = false;
    for (let len = 4; len >= 1; len--) {
      const chunk = lower.slice(i, i + len);
      if (map[chunk]) {
        const replacement = map[chunk];
        // Preserve original capitalisation
        if (text[i] === text[i].toUpperCase() && text[i] !== text[i].toLowerCase()) {
          result += replacement[0].toUpperCase() + replacement.slice(1);
        } else {
          result += replacement;
        }
        i += len;
        matched = true;
        break;
      }
    }
    if (!matched) {
      result += text[i];
      i++;
    }
  }
  return result;
}

// Returns the name in the correct script for the given language
// If the name already contains Cyrillic or matches the target script, returns as-is
export function localizedName(name, language) {
  if (!name) return name;

  const hasCyrillic = /[\u0400-\u04FF]/.test(name);

  if (language === 'en') {
    if (hasCyrillic) {
      return transliterate(name, CYRILLIC_TO_LATIN);
    }
    return name;
  }

  // Target is a Cyrillic language
  if (hasCyrillic) return name;

  // Otherwise transliterate from Latin to the target script
  switch (language) {
    case 'ru':      return transliterate(name, LATIN_TO_RU);
    case 'uz_cyrl': return transliterate(name, LATIN_TO_UZ_CYRL);
    case 'tj':      return transliterate(name, LATIN_TO_TJ);
    default:        return name;
  }
}

// Translate common venue names to the selected language
export function translateLocation(location, language) {
  if (!location) return location;
  const loc = location.trim();

  // Map known English venue phrases → localized
  const knownMaps = {
    'Wedding house Farel, Khujand': {
      uz_cyrl: '«Форель» тўйхонаси, Хўжанд',
      ru: 'Ресторан «Форель», Худжанд',
      tj: 'Тӯйхонаи «Форел», Хуҷанд',
      en: 'Wedding house Forel, Khujand',
    },
    'Wedding House Farel, Khujand': {
      uz_cyrl: '«Форель» тўйхонаси, Хўжанд',
      ru: 'Ресторан «Форель», Худжанд',
      tj: 'Тӯйхонаи «Форел», Хуҷанд',
      en: 'Wedding House Forel, Khujand',
    },
    'Farel, Khujand': {
      uz_cyrl: '«Форель», Хўжанд',
      ru: '«Форель», Худжанд',
      tj: '«Форел», Хуҷанд',
      en: 'Forel, Khujand',
    },
    'Wedding house Forel, Khujand': {
      uz_cyrl: '«Форель» тўйхонаси, Хўжанд',
      ru: 'Ресторан «Форель», Худжанд',
      tj: 'Тӯйхонаи «Форел», Хуҷанд',
      en: 'Wedding house Forel, Khujand',
    },
    'Wedding House Forel, Khujand': {
      uz_cyrl: '«Форель» тўйхонаси, Хўжанд',
      ru: 'Ресторан «Форель», Худжанд',
      tj: 'Тӯйхонаи «Форел», Хуҷанд',
      en: 'Wedding House Forel, Khujand',
    },
    'Forel, Khujand': {
      uz_cyrl: '«Форель», Хўжанд',
      ru: '«Форель», Худжанд',
      tj: '«Форел», Хуҷанд',
      en: 'Forel, Khujand',
    },
    'Wedding House': {
      uz_cyrl: 'Тўй зали',
      ru: 'Свадебный дом',
      tj: 'Хонаи арӯсӣ',
      en: 'Wedding House',
    },
    'Wedding house': {
      uz_cyrl: 'Тўй зали',
      ru: 'Свадебный дом',
      tj: 'Хонаи арӯсӣ',
      en: 'Wedding House',
    },
    'OQ SAROY': {
      uz_cyrl: 'ОҚ САРОЙ',
      ru: 'ОҚ САРОЙ',
      tj: 'ОҚ САРОЙ',
      en: 'OQ SAROY',
    },
    'ROYAL PALACE': {
      uz_cyrl: 'ШОҲОНА САРОЙ',
      ru: 'КОРОЛЕВСКИЙ ДВОРЕЦ',
      tj: 'ҚАСРИ ШОҲОНА',
      en: 'ROYAL PALACE',
    }
  };

  for (const [key, translations] of Object.entries(knownMaps)) {
    if (loc.toLowerCase().startsWith(key.toLowerCase())) {
      const rest = loc.slice(key.length);
      const translated = translations[language] || translations.en;
      return translated + localizedName(rest, language);
    }
  }
  return localizedName(loc, language);
}

// Helper to resolve and automatically localize/translate the welcome text
export function getWelcomeText(welcomeText, language, t) {
  const defaultTexts = [
    // English defaults
    "we invite you to share in the joy of our wedding day. your presence will make our celebration complete as we begin our new life together.",
    "we invite you to share in the joy of our wedding day. your presence will make our celebration complete as we begin our new life together",
    // Russian defaults
    "с радостью приглашаем вас разделить с нами счастье этого особенного дня. ваше присутствие сделает наш праздник незабываемым.",
    "с радостью приглашаем вас разделить с нами счастье этого особенного дня. ваше присутствие сделает наш праздник незабываемым",
    // Uzbek Cyrillic defaults
    "қалбимизда чексиз қувонч билан сизни никоҳ тўйимиз тантанасига таклиф этамиз. сизнинг ташрифингиз ушбу кунни биз учун янада аҳамиятли қилади.",
    "қалбимизда чексиз қувонч билан сизни никоҳ тўйимиз тантанасига таклиф этамиз. сизнинг ташрифингиз ушбу кунни биз учун янада аҳамиятли қилади",
    "сизларни ушбу қувончли кунимизда, никоҳ тўйимиз шодиёнасида кўришдан мамнунмиз. сизнинг ташрифингиз тўйимизни янада файзли қилади.",
    "сизларни ушбу қувончли кунимизда, никоҳ тўйимиз шодиёнасида кўришдан мамнунмиз. сизнинг ташрифингиз тўйимизни янада файзли қилади",
    // Tajik defaults
    "бо шодмонӣ дар қалб мо шуморо ба ҷашни тӯйи никоҳи худ даъват менамоем. ҳузури шумо ин рӯзи махсусро барои мо фаромӯшнашаванда мегардонад.",
    "бо шодмонӣ дар қалб мо шуморо ба ҷашни тӯйи никоҳи худ даъват менамоем. ҳузури шумо ин рӯзи махсусро барои мо фаромӯшнашаванда мегардонад",
    // Uzbek Latin defaults / common placeholders
    "qalbimizda cheksiz quvonch bilan sizni nikoh to'yimiz tantanasiga taklif etamiz. sizning tashrifingiz ushbu kunni biz uchun yanada ahamiyatli qiladi.",
    "qalbimizda cheksiz quvonch bilan sizni nikoh to'yimiz tantanasiga taklif etamiz. sizning tashrifingiz ushbu kunni biz uchun yanada ahamiyatli qiladi",
    "uzoq kutilgan quvonchli kunimizda sizni ko’rishdan cheksiz baxtiyor bo’lamiz.",
    "uzoq kutilgan quvonchli kunimizda sizni ko’rishdan cheksiz baxtiyor bo’lamiz",
    "biz sizni hayotimizning eng quvonchli kunida — nikoh to'yimizda ko'rishdan baxtiyor bo'lamiz.",
    "biz sizni hayotimizning eng quvonchli kunida — nikoh to'yimizda ko'rishdan baxtiyor bo'lamiz",
    "biz sizni hayotimizning eng quvonchli kunida - nikoh to'yimizda ko'rishdan baxtiyor bo'lamiz",
    "biz sizni hayotimizning eng quvonchli kunida nikoh to'yimizda ko'rishdan baxtiyor bo'lamiz",
    "bizning baxtli kunimizga xush kelibsiz!",
    "bizning baxtli kunimizga xush kelibsiz"
  ];

  if (!welcomeText || !welcomeText.trim()) {
    return t('invitation.speech');
  }

  const trimmedLower = welcomeText.trim().toLowerCase();
  
  // Check if it matches any of the default texts
  const isDefault = defaultTexts.some(def => trimmedLower === def || trimmedLower.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") === def.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ""));
  
  if (isDefault) {
    return t('invitation.speech');
  }

  // Otherwise, it's a custom text. Transliterate it to the selected language
  return localizedName(welcomeText, language);
}
