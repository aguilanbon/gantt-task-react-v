import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'fr',
    debug: false,
    interpolation: {
      escapeValue: false, 
    },
    resources: {
      en: {
        translation: {
          January: 'January',
          February: 'February',
          March: 'March',
          April: 'April',
          May: 'May',
          June: 'June',
          July: 'July',
          August: 'August',
          September: 'September',
          October: 'October',
          November: 'November',
          December: 'December',

          // days
          Mon: 'Mon',
          Tue: 'Tue',
          Wed: 'Wed',
          Thu: 'Thu',
          Fri: 'Fri',
          Sat: 'Sat',
          Sun: 'Sun',
        },
      },
      fr: {
        translation: {
          January: 'Janvier',
          February: 'Février',
          March: 'Mars',
          April: 'Avril',
          May: 'Mai',
          June: 'Juin',
          July: 'Juillet',
          August: 'Août',
          September: 'Septembre',
          October: 'Octobre',
          November: 'Novembre',
          December: 'Décembre',

          // days
          Mon: 'Lun',
          Tue: 'Mar',
          Wed: 'Mer',
          Thu: 'Jeu',
          Fri: 'Ven',
          Sat: 'Sam',
          Sun: 'Dim',
        },
      },
    },
  });

export default i18n;
