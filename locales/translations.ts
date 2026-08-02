export type Locale = "tr" | "en";

const tr = {
  appName: "Namaz Rehberi",
  tabs: {
    today: "Bugün",
    prayer: "Namaz",
    duas: "Dualar",
    settings: "Ayarlar",
  },
  common: {
    next: "İleri",
    skip: "Atla",
    start: "Başla",
    today: "Bugün",
    back: "Geri",
    rakat: "rekat",
    notFound: "Namaz bulunamadı.",
  },
  onboarding: {
    progress: "{{current}} / {{total}}",
    slides: {
      welcome: {
        accent: "Hoş geldin",
        title: "Namaz Rehberi'ne hoş geldin",
        description:
          "Bu uygulama vakit hatırlatmaz. Amacı, namazı adım adım öğrenmen ve her gün yeni bir dua ile tanışman.",
      },
      prayer: {
        accent: "Rehber",
        title: "Namaz nasıl kılınır?",
        description:
          "Sabah’tan yatsıya her namazı tek tek adımlarla takip et. Niyet, tekbir, rüku, secde — hepsi sırayla.",
      },
      dua: {
        accent: "Günlük dua",
        title: "Her gün farklı dua",
        description:
          "Bugünün duası Arapça, okunuş ve anlamıyla seni bekliyor. Yarın yeni bir dua gelir.",
      },
      ready: {
        accent: "Başla",
        title: "Hazırsın",
        description:
          "Sekmeler: Bugün, Namaz, Dualar ve Ayarlar. İstediğin yerden başlayabilirsin.",
      },
    },
  },
  home: {
    subtitle: "Bugünün duası ve adım adım namaz rehberi",
    todaysDua: "Bugünün duası",
    allDuas: "Tüm dualar",
    quickStart: "Hızlı başla",
    howToPray: "Namaz nasıl kılınır?",
    howToPrayHint: "Sabah’tan yatsıya adım adım rehber",
    fajrGuide: "Sabah namazı rehberi",
    fajrHint: "2 rekat farz — tek tek adımlar",
  },
  prayer: {
    intro:
      "Diğer uygulamalardan farkı: vakit değil, kılınış. Her namazı adım adım takip et.",
    guideTitle: "Namaz Nasıl Kılınır",
  },
  duas: {
    headerTitle: "Günlük Dualar",
    todayLabel: "Bugün · {{current}}/{{total}}",
    allTitle: "Tüm günlük dualar",
    allHint: "Her gün sıradaki dua otomatik seçilir. Yarın yeni bir dua gelir.",
  },
  settings: {
    title: "Ayarlar",
    appearance: "Görünüm",
    theme: "Tema",
    themeSystem: "Sistem",
    themeLight: "Açık",
    themeDark: "Koyu",
    language: "Dil",
    languageTr: "Türkçe",
    languageEn: "English",
    about: "Hakkında",
    aboutText:
      "Namaz Rehberi — adım adım kılınış ve her gün farklı dua. Vakit uygulaması değil.",
  },
  prayers: {
    sabah: {
      name: "Sabah Namazı",
      summary: "2 rekat farz. Erkekler için sünnet 2 rekat da vardır.",
      steps: {
        "0": { title: "Niyet", detail: "Kalbden sabah namazının farzını kılmaya niyet et. Kıbleye dön." },
        "1": { title: "İftitah tekbiri", detail: "Elleri kulak hizasına kaldırıp tekbir al." },
        "2": { title: "Kıyam", detail: "Elleri bağla. Sübhaneke, Euzü-Besmele, Fatiha ve bir sure oku." },
        "3": { title: "Rüku", detail: "Tekbir ile rükua eğil. Üç kez Sübhane Rabbiyel Azim de." },
        "4": { title: "Kalkış", detail: "Doğrulurken Semiallahu limen hamideh, ardından Rabbena lekel hamd de." },
        "5": { title: "Secde", detail: "Tekbir ile secdeye git. Üç kez Sübhane Rabbiyel Ala de. Otur, tekrar secde." },
        "6": { title: "2. rekat", detail: "Ayağa kalk. Fatiha + sure, rüku, secdeler. Son oturuşta Ettehiyyatu, Salli-Barik, Rabbena duaları." },
        "7": { title: "Selam", detail: "Sağa ve sola selam vererek namazı bitir." },
      },
    },
    ogle: {
      name: "Öğle Namazı",
      summary: "4 rekat farz. Öncesinde 4, sonrasında 2 rekat sünnet vardır.",
      steps: {
        "0": { title: "Niyet ve tekbir", detail: "Öğle farzına niyet et. İftitah tekbiri al." },
        "1": { title: "1. ve 2. rekat", detail: "Her rekatta Fatiha + sure. 2. rekat sonunda oturup Ettehiyyatu oku, ayağa kalk." },
        "2": { title: "3. ve 4. rekat", detail: "Bu rekatlarda yalnız Fatiha yeterlidir (Hanefi). Rüku ve secdeleri tamamla." },
        "3": { title: "Son oturuş ve selam", detail: "Ettehiyyatu, Salli-Barik, Rabbena duaları. Sağa-sola selam." },
      },
    },
    ikindi: {
      name: "İkindi Namazı",
      summary: "4 rekat farz. Öncesinde 4 rekat sünnet vardır.",
      steps: {
        "0": { title: "Niyet", detail: "İkindi farzına niyet et ve tekbir al." },
        "1": { title: "İlk iki rekat", detail: "Fatiha + sure. İkinci rekatta ilk oturuş (Ettehiyyatu)." },
        "2": { title: "Son iki rekat", detail: "Fatiha ile tamamla. Son oturuşta duaları oku ve selam ver." },
      },
    },
    aksam: {
      name: "Akşam Namazı",
      summary: "3 rekat farz. Sonrasında 2 rekat sünnet vardır.",
      steps: {
        "0": { title: "Niyet ve tekbir", detail: "Akşam farzına niyet et. İftitah tekbiri al." },
        "1": { title: "1. ve 2. rekat", detail: "Fatiha + sure. 2. rekat sonunda otur, Ettehiyyatu oku, kalk." },
        "2": { title: "3. rekat", detail: "Yalnız Fatiha. Rüku, secdeler. Son oturuşta tüm dualar ve selam." },
      },
    },
    yatsi: {
      name: "Yatsı Namazı",
      summary: "4 rekat farz. Öncesi 4, sonrası 2 sünnet; ayrıca 3 rekat vitir vardır.",
      steps: {
        "0": { title: "Niyet", detail: "Yatsı farzına niyet et ve tekbir al." },
        "1": { title: "Dört rekat", detail: "İlk iki rekatta Fatiha + sure, orta oturuş. Son iki rekatta Fatiha. Dualar ve selam." },
        "2": { title: "Vitir (önerilir)", detail: "3 rekat vitir: 3. rekatta Fatiha + sure sonrası Kunut duası okunur." },
      },
    },
  },
  duaItems: {
    "1": { title: "Sabah duası", meaning: "Sabaha erdik; mülk Allah'ındır. Her işimiz O'na emanet.", occasion: "Sabah uyanınca" },
    "2": { title: "Korunma duası", meaning: "Allah'ın ismiyle; O'nun ismiyle hiçbir şey zarar veremez.", occasion: "Güne başlarken" },
    "3": { title: "İstiğfar", meaning: "Yüce Allah'tan bağışlanma dilerim.", occasion: "Gün içinde" },
    "4": { title: "Şükür duası", meaning: "Âlemlerin Rabbi Allah'a hamd olsun.", occasion: "Nimet görünce" },
    "5": { title: "Kolaylık duası", meaning: "Rabbim, göğsümü aç ve işimi kolaylaştır.", occasion: "Zorluk anında" },
    "6": { title: "Hidayet duası", meaning: "Bizi doğru yola ilet.", occasion: "Her namazda" },
    "7": { title: "Aile duası", meaning: "Rabbimiz, eşlerimizi ve çocuklarımızı göz aydınlığı eyle.", occasion: "Aile için" },
    "8": { title: "İlim duası", meaning: "Rabbim, ilmimi artır.", occasion: "Öğrenirken" },
    "9": { title: "Sıkıntı duası", meaning: "Senden başka ilah yok. Seni tenzih ederim; ben zalimlerden oldum. (Yunus aleyhisselam)", occasion: "Darlıkta" },
    "10": { title: "Akşam duası", meaning: "Akşama erdik; mülk Allah'ındır.", occasion: "Akşam olunca" },
    "11": { title: "Uyku duası", meaning: "Allah'ım, Senin isminle ölür ve dirilirim.", occasion: "Yatmadan önce" },
    "12": { title: "Tövbe duası", meaning: "Rabbimiz, kendimize zulmettik. Affetmez ve merhamet etmezsen hüsrana uğrarız.", occasion: "Tövbe için" },
    "13": { title: "Rızık duası", meaning: "Allah'ım, faydalı ilim ve temiz rızık isterim.", occasion: "İş / geçim" },
    "14": { title: "Sabır duası", meaning: "Rabbimiz, üzerimize sabır yağdır.", occasion: "Sabır gerektiğinde" },
  },
} as const;

type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>;
};

const en: DeepStringify<typeof tr> = {
  appName: "Prayer Guide",
  tabs: {
    today: "Today",
    prayer: "Prayer",
    duas: "Duas",
    settings: "Settings",
  },
  common: {
    next: "Next",
    skip: "Skip",
    start: "Get started",
    today: "Today",
    back: "Back",
    rakat: "rakahs",
    notFound: "Prayer not found.",
  },
  onboarding: {
    progress: "{{current}} / {{total}}",
    slides: {
      welcome: {
        accent: "Welcome",
        title: "Welcome to Prayer Guide",
        description:
          "This app does not track prayer times. It helps you learn how to pray step by step and meet a new dua every day.",
      },
      prayer: {
        accent: "Guide",
        title: "How to pray",
        description:
          "Follow each prayer from Fajr to Isha step by step — intention, takbir, ruku, sujud.",
      },
      dua: {
        accent: "Daily dua",
        title: "A different dua each day",
        description:
          "Today’s dua comes with Arabic, transliteration, and meaning. Tomorrow brings a new one.",
      },
      ready: {
        accent: "Begin",
        title: "You’re ready",
        description:
          "Tabs: Today, Prayer, Duas, and Settings. Start wherever you like.",
      },
    },
  },
  home: {
    subtitle: "Today’s dua and a step-by-step prayer guide",
    todaysDua: "Today’s dua",
    allDuas: "All duas",
    quickStart: "Quick start",
    howToPray: "How to pray?",
    howToPrayHint: "Step-by-step from Fajr to Isha",
    fajrGuide: "Fajr prayer guide",
    fajrHint: "2 fard rakahs — one step at a time",
  },
  prayer: {
    intro:
      "Unlike other apps: not times, but how to pray. Follow each prayer step by step.",
    guideTitle: "How to Pray",
  },
  duas: {
    headerTitle: "Daily Duas",
    todayLabel: "Today · {{current}}/{{total}}",
    allTitle: "All daily duas",
    allHint: "Each day picks the next dua automatically. Tomorrow brings a new one.",
  },
  settings: {
    title: "Settings",
    appearance: "Appearance",
    theme: "Theme",
    themeSystem: "System",
    themeLight: "Light",
    themeDark: "Dark",
    language: "Language",
    languageTr: "Türkçe",
    languageEn: "English",
    about: "About",
    aboutText:
      "Prayer Guide — step-by-step prayer and a different dua each day. Not a prayer-time app.",
  },
  prayers: {
    sabah: {
      name: "Fajr Prayer",
      summary: "2 fard rakahs. There are also 2 sunnah rakahs for men.",
      steps: {
        "0": { title: "Intention", detail: "Make the intention for Fajr fard in your heart. Face the Qibla." },
        "1": { title: "Opening takbir", detail: "Raise your hands to ear level and say the takbir." },
        "2": { title: "Standing", detail: "Fold your hands. Recite Subhanaka, Ta’awwudh-Basmala, Al-Fatiha and a surah." },
        "3": { title: "Ruku", detail: "Bow with takbir. Say Subhana Rabbiyal Azim three times." },
        "4": { title: "Rising", detail: "As you rise say Sami’allahu liman hamidah, then Rabbana lakal hamd." },
        "5": { title: "Sujud", detail: "Go to prostration with takbir. Say Subhana Rabbiyal A’la three times. Sit, then prostrate again." },
        "6": { title: "2nd rakah", detail: "Stand. Al-Fatiha + surah, ruku, sujud. In the final sitting: Tashahhud, Salawat, Rabbena duas." },
        "7": { title: "Salam", detail: "End the prayer by turning right then left with salam." },
      },
    },
    ogle: {
      name: "Dhuhr Prayer",
      summary: "4 fard rakahs. 4 sunnah before and 2 after.",
      steps: {
        "0": { title: "Intention and takbir", detail: "Intend Dhuhr fard. Say the opening takbir." },
        "1": { title: "1st and 2nd rakahs", detail: "Al-Fatiha + surah each. Sit after the 2nd for Tashahhud, then stand." },
        "2": { title: "3rd and 4th rakahs", detail: "Al-Fatiha alone is enough (Hanafi). Complete ruku and sujud." },
        "3": { title: "Final sitting and salam", detail: "Tashahhud, Salawat, Rabbena duas. Salam right and left." },
      },
    },
    ikindi: {
      name: "Asr Prayer",
      summary: "4 fard rakahs. 4 sunnah before.",
      steps: {
        "0": { title: "Intention", detail: "Intend Asr fard and say the takbir." },
        "1": { title: "First two rakahs", detail: "Al-Fatiha + surah. First sitting after the second rakah (Tashahhud)." },
        "2": { title: "Last two rakahs", detail: "Complete with Al-Fatiha. Recite the final duas and give salam." },
      },
    },
    aksam: {
      name: "Maghrib Prayer",
      summary: "3 fard rakahs. 2 sunnah after.",
      steps: {
        "0": { title: "Intention and takbir", detail: "Intend Maghrib fard. Say the opening takbir." },
        "1": { title: "1st and 2nd rakahs", detail: "Al-Fatiha + surah. Sit after the 2nd, recite Tashahhud, then stand." },
        "2": { title: "3rd rakah", detail: "Al-Fatiha only. Ruku, sujud. Final sitting with all duas and salam." },
      },
    },
    yatsi: {
      name: "Isha Prayer",
      summary: "4 fard rakahs. 4 sunnah before, 2 after; plus 3 Witr.",
      steps: {
        "0": { title: "Intention", detail: "Intend Isha fard and say the takbir." },
        "1": { title: "Four rakahs", detail: "Al-Fatiha + surah in the first two, middle sitting. Al-Fatiha in the last two. Duas and salam." },
        "2": { title: "Witr (recommended)", detail: "3 Witr rakahs: after Al-Fatiha + surah in the 3rd, recite the Qunut dua." },
      },
    },
  },
  duaItems: {
    "1": { title: "Morning dua", meaning: "We have entered the morning; dominion belongs to Allah. We entrust all our affairs to Him.", occasion: "Upon waking" },
    "2": { title: "Protection dua", meaning: "In the name of Allah; nothing can harm with His name.", occasion: "Starting the day" },
    "3": { title: "Istighfar", meaning: "I seek forgiveness from Allah, the Most Great.", occasion: "During the day" },
    "4": { title: "Gratitude dua", meaning: "All praise is for Allah, Lord of the worlds.", occasion: "When blessed" },
    "5": { title: "Ease dua", meaning: "My Lord, expand my chest and make my affair easy.", occasion: "In difficulty" },
    "6": { title: "Guidance dua", meaning: "Guide us to the straight path.", occasion: "In every prayer" },
    "7": { title: "Family dua", meaning: "Our Lord, grant us comfort in our spouses and offspring.", occasion: "For family" },
    "8": { title: "Knowledge dua", meaning: "My Lord, increase me in knowledge.", occasion: "While learning" },
    "9": { title: "Distress dua", meaning: "There is no god but You; glory be to You. I was among the wrongdoers. (Prophet Yunus)", occasion: "In hardship" },
    "10": { title: "Evening dua", meaning: "We have entered the evening; dominion belongs to Allah.", occasion: "At evening" },
    "11": { title: "Sleep dua", meaning: "O Allah, in Your name I die and I live.", occasion: "Before sleep" },
    "12": { title: "Repentance dua", meaning: "Our Lord, we have wronged ourselves. If You do not forgive us and have mercy, we will be among the losers.", occasion: "For repentance" },
    "13": { title: "Provision dua", meaning: "O Allah, I ask You for beneficial knowledge and pure provision.", occasion: "Work / livelihood" },
    "14": { title: "Patience dua", meaning: "Our Lord, pour upon us patience.", occasion: "When patience is needed" },
  },
};

export const translations = { tr, en };
export type TranslationKeys = typeof tr;
