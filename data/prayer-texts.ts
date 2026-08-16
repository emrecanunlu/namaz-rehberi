import type { PrayerVoiceId } from "@/data/prayer-build";

export type PrayerText = {
  arabic: string;
  latin: string;
};

/** Tam Arapça + okunuş — meal i18n: session.texts.<id>.meaning */
export const PRAYER_TEXTS: Record<PrayerVoiceId, PrayerText> = {
  tekbir: {
    arabic: "اللهُ أَكْبَرُ",
    latin: "Allahu Ekber",
  },
  subhaneke: {
    arabic:
      "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلَهَ غَيْرُكَ",
    latin:
      "Sübhaneke Allahümme ve bihamdike ve tebarekesmüke ve teala ceddüke ve la ilahe gayruk",
  },
  fatiha: {
    arabic:
      "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
    latin:
      "Bismillahirrahmanirrahim. Elhamdü lillahi rabbil alemin. Errahmanirrahim. Maliki yevmiddin. İyyake na'büdu ve iyyake nestein. İhdinas sıratal müstakim. Sıratallezine en'amte aleyhim gayril magdubi aleyhim ve lad-dallin",
  },
  ihlas: {
    arabic:
      "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
    latin:
      "Bismillahirrahmanirrahim. Kul hüvallahu ehad. Allahüs-samed. Lem yelid ve lem yuled. Ve lem yekün lehu küfüven ehad",
  },
  ruku: {
    arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
    latin: "Sübhane Rabbiyel Azîm",
  },
  semiallah: {
    arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ",
    latin: "Semiallahu limen hamideh",
  },
  rabbena: {
    arabic: "رَبَّنَا وَلَكَ الْحَمْدُ",
    latin: "Rabbena lekel hamd",
  },
  secde: {
    arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
    latin: "Sübhane Rabbiyel A'lâ",
  },
  ettehiyyatu: {
    arabic:
      "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
    latin:
      "Ettehiyyatü lillahi ves-salavatü vet-tayyibat. Esselamu aleyke eyyühen-nebiyyü ve rahmetullahi ve berakatüh. Esselamu aleyna ve ala ibadillahis-salihin. Eşhedü en la ilahe illallah ve eşhedü enne Muhammeden abdühu ve rasulüh",
  },
  salavat: {
    arabic:
      "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ ۝ اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
    latin:
      "Allahümme salli ala Muhammedin ve ala ali Muhammed. Kema salleyte ala İbrahime ve ala ali İbrahim. İnneke hamidün mecid. Allahümme barik ala Muhammedin ve ala ali Muhammed. Kema barekte ala İbrahime ve ala ali İbrahim. İnneke hamidün mecid",
  },
  rabbenaAtina: {
    arabic:
      "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    latin:
      "Rabbena atina fid-dünya haseneten ve fil-ahirati haseneten ve kına azaben-nar",
  },
  kunut: {
    arabic:
      "اللَّهُمَّ إِنَّا نَسْتَعِينُكَ وَنَسْتَغْفِرُكَ وَنُثْنِي عَلَيْكَ الْخَيْرَ وَلَا نَكْفُرُكَ وَنَخْلَعُ وَنَتْرُكُ مَنْ يَفْجُرُكَ ۝ اللَّهُمَّ إِيَّاكَ نَعْبُدُ وَلَكَ نُصَلِّي وَنَسْجُدُ وَإِلَيْكَ نَسْعَى وَنَحْفِدُ نَرْجُو رَحْمَتَكَ وَنَخْشَى عَذَابَكَ إِنَّ عَذَابَكَ بِالْكُفَّارِ مُلْحِقٌ",
    latin:
      "Allahümme inna nesteinüke ve nestağfiruke ve nüsnî aleykel-hayr. Ve la nekfüruke ve nahleu ve netruku men yefcuruk. Allahümme iyyake na'büdü ve leke nüsalli ve nescüdü ve ileyke nes'a ve nahfid. Nercu rahmeteke ve nahşa azabek. İnne azabeke bil-küffari mülhik",
  },
  selam: {
    arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ",
    latin: "Esselamu aleykum ve rahmetullah",
  },
};

export function getPrayerText(
  voiceId: PrayerVoiceId | undefined,
): PrayerText | null {
  if (!voiceId) return null;
  return PRAYER_TEXTS[voiceId] ?? null;
}
