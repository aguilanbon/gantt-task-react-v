import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
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

          Jan: 'Jan',
          Feb: 'Feb',
          Mar: 'Mar',
          Apr: 'Apr',
          Jun: 'Jun',
          Jul: 'Jul',
          Aug: 'Aug',
          Sep: 'Sep',
          Oct: 'Oct',
          Nov: 'Nov',
          Dec: 'Dec',

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

          Jan: 'Jan',
          Feb: 'Fév',
          Mar: 'Mar',
          Apr: 'Avr',
          Jun: 'Mai',
          Jul: 'Juin',
          Aug: 'Aout',
          Sep: 'Sep',
          Oct: 'Oct',
          Nov: 'Nov',
          Dec: 'Déc',

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
