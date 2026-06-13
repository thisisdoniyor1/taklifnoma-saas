const DATE_LOCALE_BY_LANGUAGE = {
  en: 'en-GB',
  ru: 'ru-RU',
  uz_cyrl: 'uz-Cyrl-UZ',
  tj: 'tg-TJ',
};

export const formatLocalizedDateLabel = (value, language, emptyLabel) => {
  if (!value) {
    return emptyLabel;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(DATE_LOCALE_BY_LANGUAGE[language] || DATE_LOCALE_BY_LANGUAGE.en);
};
