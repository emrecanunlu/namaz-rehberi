export type Locale = "tr" | "en";

const tr = {
  appName: "Namaz Rehberim",
  tabs: {
    today: "Bugün",
    prayer: "Namaz",
    duas: "Dualar",
    qibla: "Kıble",
    tracking: "Takip",
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
        title: "Namaz Rehberim'e hoş geldin",
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
    subtitle: "Bugünün duası, namaz vakitleri ve adım adım rehber",
    todaysDua: "Bugünün duası",
    allDuas: "Tüm dualar",
    quickStart: "Hızlı başla",
    howToPray: "Namaz nasıl kılınır?",
    howToPrayHint: "Sabah’tan yatsıya adım adım rehber",
    fajrGuide: "Sabah namazı rehberi",
    fajrHint: "2 rekat farz — tek tek adımlar",
    prayerTimes: "Namaz vakitleri",
    nextPrayer: "Sıradaki vakit",
    untilPrayer: "kalan süre",
    tomorrowFajr: "Yarın imsak",
    cityLabel: "İl",
    hoursShort: "sa",
    minutesShort: "dk",
    secondsShort: "sn",
    startPrayer: "Namaza başla",
    startPrayerHint: "{{prayer}} — adım adım namaz oturumu",
    startPrayerCta: "Başla",
    openQibla: "Kıble bul",
  },
  session: {
    stepOf: "{{current}} / {{total}}",
    next: "Sonraki",
    prev: "Önceki",
    finish: "Bitir",
    close: "Kapat",
    autoImam: "Sesli kıldırıcı",
    autoImamHint: "Hoca gibi sesli yönlendirir; adım bitince geçer",
    expandHint: "Tam metin ve meal için adıma dokun",
    poseTapHint: "Fotoğrafa dokun — büyüt",
    poseCloseHint: "Kapatmak için dokun",
    stepsCount: "adım",
    sectionLabel: "{{section}} · {{rakat}}. rekat",
    sectionOnly: "{{section}}",
    sectionPickTitle: "Bölümler",
    sectionPickHint:
      "Bir bölüme dokun; sadece o kısmın adımlarıyla kıldırıcı açılır.",
    sectionCompleted: "Tamamlandı",
    sectionReady: "Başla",
    sectionReplay: "Tekrar kıl",
    sectionRakat: "{{count}} rekat",
    backToSections: "Bölümlere dön",
    nextIn: "Sonraki adım",
    finishIn: "Bölüm bitiyor",
    skipWait: "Hemen geç",
    readingHint: "Okunuşu takip et — ezber için buraya bak",
    section: {
      sunnah: "İlk sünnet",
      fard: "Farz",
      lastSunnah: "Son sünnet",
      witr: "Vitir",
    },
    cues: {
      niyet: "Niyet et",
      tekbir: "Allahu ekber",
      subhaneke: "Sübhaneke oku",
      kiyamSure: "İhlas suresini oku",
      kiyamFatiha: "Fatiha oku",
      ruku: "Rükuya git",
      kavme: "Doğrul",
      rabbena: "Rabbena lekel hamd",
      secde: "Secdeye git",
      secde2: "İkinci secdeye git",
      oturma: "Otur",
      teshehhudFirst: "Ettehiyyatü oku",
      teshehhudLast: "Ettehiyyatü oku",
      salavat: "Salavat oku",
      rabbenaAtina: "Rabbena duasını oku",
      selam: "Selam ver",
      kunutTekbir: "Elleri kaldır, tekbir al",
      kunut: "Kunut duasını oku",
    },
    meal: "Meal",
    reading: "Okunuş",
    texts: {
      niyet: {
        title: "Niyet",
        meaning: "Allah rızası için namaz kılmaya niyet ettim.",
      },
      tekbir: {
        title: "Tekbir",
        meaning: "Allah en büyüktür.",
      },
      subhaneke: {
        title: "Sübhaneke",
        meaning:
          "Allah’ım! Seni hamdinle birlikte tenzih ederim. Senin adın mübarektir, şanın yücedir. Senden başka ilah yoktur.",
      },
      fatiha: {
        title: "Fatiha Suresi",
        meaning:
          "Rahman ve Rahim olan Allah’ın adıyla. Hamd, âlemlerin Rabbi Allah’adır. O Rahman’dır, Rahim’dir. Din gününün sahibidir. Yalnız sana ibadet eder, yalnız senden yardım dileriz. Bizi doğru yola ilet; nimet verdiklerinin yoluna; gazaba uğrayanların ve sapmışların yoluna değil.",
      },
      ihlas: {
        title: "İhlas Suresi",
        meaning:
          "Rahman ve Rahim olan Allah’ın adıyla. De ki: O Allah birdir. Allah Samed’dir (her şey O’na muhtaçtır, O hiçbir şeye muhtaç değildir). O doğurmamış ve doğmamıştır. Hiçbir şey O’na denk değildir.",
      },
      ruku: {
        title: "Rüku tesbihi",
        meaning: "Yüce Rabbimi tüm noksanlıklardan tenzih ederim. (Üç kez)",
      },
      semiallah: {
        title: "Kavme",
        meaning: "Allah, kendisine hamd edeni işitir.",
      },
      rabbena: {
        title: "Hamd",
        meaning: "Rabbimiz! Hamd sanadır.",
      },
      secde: {
        title: "Secde tesbihi",
        meaning: "En yüce Rabbimi tüm noksanlıklardan tenzih ederim. (Üç kez)",
      },
      ettehiyyatu: {
        title: "Ettehiyyatü",
        meaning:
          "Dil, beden ve mal ile yapılan bütün övgüler Allah’adır. Ey Peygamber! Allah’ın selamı, rahmeti ve bereketi senin üzerine olsun. Selam bizim ve Allah’ın salih kulları üzerine olsun. Şahitlik ederim ki Allah’tan başka ilah yoktur; yine şahitlik ederim ki Muhammed O’nun kulu ve elçisidir.",
      },
      salavat: {
        title: "Salavat",
        meaning:
          "Allah’ım! Muhammed’e ve Muhammed’in ailesine salat eyle; İbrahim’e ve İbrahim’in ailesine salat ettiğin gibi. Şüphesiz sen övülmeye layıksın, şanındır. Allah’ım! Muhammed’e ve Muhammed’in ailesine bereket ver; İbrahim’e ve İbrahim’in ailesine bereket verdiğin gibi. Şüphesiz sen övülmeye layıksın, şanındır.",
      },
      rabbenaAtina: {
        title: "Rabbena duası",
        meaning:
          "Rabbimiz! Bize dünyada iyilik ver, ahirette de iyilik ver ve bizi ateş azabından koru.",
      },
      kunut: {
        title: "Kunut duası",
        meaning:
          "Allah’ım! Senden yardım ister, bağışlanma dileriz; sana hayırla övgüde bulunuruz. Seni inkâr etmeyiz; sana isyan edeni bırakır ve ondan uzaklaşırız. Allah’ım! Yalnız sana ibadet eder, senin için namaz kılar ve secde ederiz. Sana yönelir, sana koşarız. Rahmetini umar, azabından korkarız. Senin azabın kâfirlere ulaşır.",
      },
      selam: {
        title: "Selam",
        meaning: "Allah’ın selamı ve rahmeti üzerinize olsun.",
      },
    },
    poses: {
      niyet: { title: "Niyet" },
      tekbir: {
        title: "Tekbir",
        titleWithRakat: "{{rakat}}. rekat — tekbir",
        detail:
          "Elleri kulak hizasına kaldır. Allahu Ekber diyerek devam et; elleri bağla.",
      },
      kiyam: {
        title: "Kıyam",
        titleWithRakat: "{{rakat}}. rekat — kıyam",
        detailSure:
          "Ayakta Sübhaneke (ilk rekat), Euzü-Besmele, Fatiha ve bir sure oku.",
        detailFatiha:
          "Ayakta Fatiha oku (Hanefi’de bu rekatta sure şart değil).",
      },
      ruku: {
        title: "Rüku",
        titleWithRakat: "{{rakat}}. rekat — rüku",
        detail:
          "Tekbir ile belden eğil, elleri dizlere koy. Üç kez Sübhane Rabbiyel Azîm de.",
      },
      kavme: {
        title: "Kavme",
        titleWithRakat: "{{rakat}}. rekat — kavme",
        detail:
          "Doğrulurken Semiallahu limen hamideh, doğrulunca Rabbena lekel hamd de.",
      },
      secde: {
        title: "Secde",
        titleWithRakat: "{{rakat}}. rekat — secde",
        detail:
          "Alın, burun, avuçlar, dizler ve ayak parmakları yere değsin. Üç kez Sübhane Rabbiyel A'lâ.",
      },
      oturma: {
        title: "İki secde arası",
        titleWithRakat: "{{rakat}}. rekat — oturuş",
        detail: "Tekbir ile otur. Kısa sükûnet; istersen Allahümmeğfirli de.",
      },
      teshehhud: {
        title: "Teşehhüd",
        titleWithRakat: "{{rakat}}. rekat — teşehhüd",
        detailFirst: "Ettehiyyatü oku; ardından ayağa kalk.",
        detailLast:
          "Ettehiyyatü, Allahümme salli, Allahümme barik ve Rabbena dualarını oku.",
      },
      kunut: {
        title: "Kunut",
        titleWithRakat: "{{rakat}}. rekat — Kunut",
        detail:
          "Elleri kaldırıp tekbirden sonra Kunut duasını oku; ardından rükuya geç.",
      },
      selam: {
        title: "Selam",
        titleWithRakat: "Selam",
        detail:
          "Önce sağa, sonra sola Esselamu aleykum ve rahmetullah diyerek bitir.",
      },
    },
  },
  prayerTimes: {
    fajr: "İmsak",
    sunrise: "Güneş",
    dhuhr: "Öğle",
    asr: "İkindi",
    maghrib: "Akşam",
    isha: "Yatsı",
    methodHint: "Diyanet Türkiye hesaplaması",
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
    location: "Konum",
    city: "İl",
    citySearch: "İl ara…",
    useLocation: "Konumumu kullan",
    cityManual: "Elle seçildi",
    cityAuto: "Konumdan",
    locationDenied: "Konum izni yok. Varsayılan veya seçtiğin il kullanılıyor.",
    about: "Hakkında",
    aboutText:
      "Namaz Rehberim — adım adım kılınış, günlük dua ve il bazlı namaz vakitleri.",
    report: "Namaz raporu",
    reportHint: "Günlük tamamlanan namaz ve rekatlar",
  },
  qibla: {
    title: "Kıble bulucu",
    hint: "Telefonu yatay tut; altın işaret Kâbe yönünü gösterir.",
    bearing: "KIBLE",
    calibrating: "Pusula kalibre ediliyor…",
    aligned: "Kıbleye dönüksün",
    turn: "{{direction}} {{degrees}}° çevir",
    left: "Sola",
    right: "Sağa",
    distance: "Kâbe’ye ≈ {{km}} km",
    gpsOn: "GPS konumu",
    gpsHint: "Anlık konumla hesaplanıyor",
    cityFallback: "Seçili ile göre yaklaşık yön",
    permissionDenied: "Konum izni yok — il merkezi kullanılıyor",
  },
  report: {
    title: "Namaz Takibi",
    subtitle: "İlerlemeni günlük, haftalık ve aylık takip et",
    daily: "Günlük",
    weekly: "Haftalık",
    monthly: "Aylık",
    weekSummary: "Son 7 gün",
    weekProgress: "Bu hafta {{done}}/{{total}} namaz",
    monthSummary: "{{done}} namaz · {{rakats}} rekat",
    completed: "Tamamlanan",
    streak: "Seri (gün)",
    rakatsShort: "Rekat",
    less: "Az",
    more: "Çok",
    colorLegend: "Günde tamamlanan namaz",
    colorNone: "0",
    colorFull: "5",
    fullDays: "Tam gün",
    bestStreak: "En uzun seri",
    consistency: "Devamlılık",
    prevMonth: "Önceki ay",
    nextMonth: "Sonraki ay",
    backToToday: "Bu ay",
    oldestMonth: "En eski",
    shareReport: "Raporu paylaş",
    sharePreview: "Paylaşım önizlemesi",
    shareAsImage: "Görsel olarak paylaş",
    preparingShare: "Görsel hazırlanıyor…",
    shareUnavailable: "Bu cihazda paylaşım kullanılamıyor.",
    shareError: "Rapor görseli hazırlanamadı. Lütfen tekrar dene.",
    shareBrand: "Namaz Rehberim",
    shareDaily: "Günlük rapor",
    shareWeekly: "Haftalık rapor",
    shareMonthly: "Aylık rapor",
    shareSummary: "{{done}} namaz · {{rakats}} rekat",
    shareFooter: "İbadet yolculuğum",
    empty: "Henüz geçmiş kayıt yok. Yukarıdan işaretle veya namaz kıldır.",
    today: "Bugün",
    todayMark: "Bugün",
    todayMarkHint: "Elle işaretle veya kıldırıcıyla tamamla",
    todaySummary: "{{done}}/{{total}} namaz · {{rakats}} rekat",
    markDone: "Tamamlandı",
    markTodo: "İşaretle",
    markPartial: "Devam ediyor",
    rakatProgress: "{{done}}/{{total}} rekat",
    history: "Geçmiş",
    rakats: "{{count}} rekat",
    prayersDone: "{{count}} namaz",
    none: "Tamamlanan namaz yok",
  },
  prayer: {
    intro:
      "Diğer uygulamalardan farkı: kılınış + il bazlı vakitler. Her namazı adım adım takip et.",
    guideTitle: "Namaz Nasıl Kılınır",
    startSession: "Otomatik namaz kıldırıcı",
    startSessionHint: "{{prayer}} — sesli adım adım kıldırıcıya geç",
    startThis: "Bu namazı kıldır",
    openGuide: "Rehberi aç",
  },
  duas: {
    headerTitle: "Günlük Dualar",
    todayLabel: "Bugün · {{current}}/{{total}}",
    allTitle: "Tüm günlük dualar",
    allHint: "Her gün sıradaki dua otomatik seçilir. Yarın yeni bir dua gelir.",
    expandHint: "Detay için duaya dokun",
    arabicLabel: "Arapça",
    readingLabel: "Okunuş",
    meaningLabel: "Meal",
    listen: "Dinle",
    stopListen: "Durdur",
  },
  prayers: {
    sabah: {
      name: "Sabah Namazı",
      summary: "2 sünnet + 2 farz (Diyanet)",
      niyet: {
        sunnah: "Sabah namazının sünnetini kılmaya niyet et. Kıbleye dön.",
        fard: "Sabah namazının farzını kılmaya niyet et. Kıbleye dön.",
      },
    },
    ogle: {
      name: "Öğle Namazı",
      summary: "4 ilk sünnet + 4 farz + 2 son sünnet (Diyanet)",
      niyet: {
        sunnah: "Öğle namazının ilk sünnetini kılmaya niyet et. Kıbleye dön.",
        fard: "Öğle namazının farzını kılmaya niyet et. Kıbleye dön.",
        lastSunnah:
          "Öğle namazının son sünnetini kılmaya niyet et. Kıbleye dön.",
      },
    },
    ikindi: {
      name: "İkindi Namazı",
      summary: "4 sünnet + 4 farz (Diyanet)",
      niyet: {
        sunnah: "İkindi namazının sünnetini kılmaya niyet et. Kıbleye dön.",
        fard: "İkindi namazının farzını kılmaya niyet et. Kıbleye dön.",
      },
    },
    aksam: {
      name: "Akşam Namazı",
      summary: "3 farz + 2 son sünnet (Diyanet)",
      niyet: {
        fard: "Akşam namazının farzını kılmaya niyet et. Kıbleye dön.",
        lastSunnah:
          "Akşam namazının son sünnetini kılmaya niyet et. Kıbleye dön.",
      },
    },
    yatsi: {
      name: "Yatsı Namazı",
      summary: "4 sünnet + 4 farz + 2 son sünnet + 3 vitir (Diyanet)",
      niyet: {
        sunnah: "Yatsı namazının ilk sünnetini kılmaya niyet et. Kıbleye dön.",
        fard: "Yatsı namazının farzını kılmaya niyet et. Kıbleye dön.",
        lastSunnah:
          "Yatsı namazının son sünnetini kılmaya niyet et. Kıbleye dön.",
        witr: "Vitir namazını kılmaya niyet et. Kıbleye dön.",
      },
    },
  },
  duaItems: {
    "15": {
      title: "Âyetel Kürsî",
      meaning:
        "Allah, O’ndan başka ilâh yoktur; diridir, her şeyin varlığı O’na bağlı ve dayalıdır. Ne uykusu gelir ne de uyur. Göklerde ve yerde ne varsa hepsi O’nundur. O’nun izni olmadıkça katında hiçbir kimse şefaat edemez. Onların önlerinde ve arkalarında olanları O bilir. O’nun ilminden hiçbir şeyi — dilediği müstesna — kimse bilgisi içine sığdıramaz. O’nun kürsüsü gökleri ve yeri içine almıştır. Onları korumak kendisine zor gelmez. O yücedir, mutlak büyüktür. (Bakara 2/255)",
      occasion: "Korunma ve zikir için · Bakara 255",
    },
    "16": {
      title: "İhlâs Suresi",
      meaning:
        "De ki: “O, Allah’tır, tektir. Allah Samed’dir. O doğurmamış ve doğmamıştır. O’nun hiçbir dengi yoktur.” (İhlâs 112/1–4)",
      occasion: "Tevhid ve zikir için · İhlâs 1–4",
    },
    "17": {
      title: "Felak Suresi",
      meaning:
        "De ki: “Yarattığı şeylerin kötülüğünden, karanlığı çöktüğü zaman gecenin kötülüğünden, düğümlere üfleyenlerin kötülüğünden, haset ettiği zaman hasetçinin kötülüğünden sabah aydınlığının Rabbine sığınırım.” (Felak 113/1–5)",
      occasion: "Kötülüklerden Allah’a sığınmak için · Felak 1–5",
    },
    "18": {
      title: "Nâs Suresi",
      meaning:
        "De ki: “Cinlerden ve insanlardan; insanların kalplerine vesvese veren sinsi vesvesecinin kötülüğünden, insanların Rabbine, insanların Melik’ine, insanların İlâh’ına sığınırım.” (Nâs 114/1–6)",
      occasion: "Vesveseden Allah’a sığınmak için · Nâs 1–6",
    },
    "19": {
      title: "Kalem 51–52 (Nazar ayetleri)",
      meaning:
        "O inkârcılar Kur’an’ı işittikleri zaman, seni gözleriyle devireceklermiş gibi bakar, “Şüphe yok, o bir delidir” derler. Oysa Kur’an, âlemler için öğütten başka bir şey değildir. (Kalem 68/51–52)",
      occasion:
        "Halk arasında nazar ayetleri olarak bilinir · Kalem 51–52",
    },
    "1": {
      title: "Sabah duası",
      meaning:
        "Sabaha erdik ve mülk Allah’ındır. Hamd Allah’adır. Allah’tan başka ilah yoktur; O tektir, ortağı yoktur. Mülk O’nundur, hamd O’nadır ve O her şeye kadirdir. Rabbim! Bu günün hayrını ve sonrasının hayrını Senden isterim; bu günün şerrinden ve sonrasının şerrinden Sana sığınırım. Rabbim! Tembellikten ve kötü ihtiyarlıktan Sana sığınırım. Rabbim! Cehennem azabından ve kabir azabından Sana sığınırım.",
      occasion: "Sabah uyanınca",
    },
    "2": {
      title: "Korunma duası",
      meaning:
        "Yerde ve gökte O’nun ismi anıldığında hiçbir şeyin zarar veremeyeceği Allah’ın adıyla. O işitendir, bilendir.",
      occasion: "Güne başlarken",
    },
    "3": {
      title: "İstiğfar",
      meaning:
        "Kendisinden başka ilah olmayan, diri ve kayyum olan yüce Allah’tan bağışlanma dilerim ve O’na tövbe ederim.",
      occasion: "Gün içinde",
    },
    "4": {
      title: "Şükür duası",
      meaning:
        "Allah’ım! Bende veya yarattıklarından herhangi birinde bu sabah bulunan her nimet Sendendir; yalnız Sensin, ortağın yoktur. Öyleyse hamd de şükür de Sanadır.",
      occasion: "Nimet görünce",
    },
    "5": {
      title: "Kolaylık duası",
      meaning:
        "Musa dedi ki: “Rabbim! Göğsümü genişlet, işimi kolaylaştır; dilimin düğümünü çöz ki sözümü iyi anlasınlar.” (Tâhâ 20/25–28)",
      occasion: "Zorluk anında · Tâhâ 25–28",
    },
    "6": {
      title: "Hidayet duası",
      meaning:
        "Bizi dosdoğru yola ilet; nimet verdiklerinin yoluna — gazaba uğrayanların ve sapmışların yoluna değil. (Fâtiha 1/6–7)",
      occasion: "Her namazda · Fâtiha 6–7",
    },
    "7": {
      title: "Aile duası",
      meaning:
        "Onlar derler ki: “Rabbimiz! Eşlerimizi ve çocuklarımızı bize göz aydınlığı kıl; bizi takva sahiplerine önder eyle.” (Furkân 25/74)",
      occasion: "Aile için · Furkân 74",
    },
    "8": {
      title: "İlim duası",
      meaning:
        "Gerçek hükümdar olan Allah yücedir. Kur’an sana vahyedilirken vahiy tamamlanmadan acele etme; de ki: “Rabbim! ilmimi artır.” (Tâhâ 20/114)",
      occasion: "Öğrenirken · Tâhâ 114",
    },
    "9": {
      title: "Sıkıntı duası",
      meaning:
        "Zünnûn’u (Yunus’u) da an; öfkelenerek gitmiş, kendisini sıkmayacağımızı sanmıştı. Sonra karanlıklar içinde seslendi: “Senden başka ilah yoktur. Seni tenzih ederim; gerçekten ben zalimlerden oldum.” (Enbiyâ 21/87)",
      occasion: "Darlıkta · Enbiyâ 87",
    },
    "10": {
      title: "Akşam duası",
      meaning:
        "Akşama erdik ve mülk Allah’ındır. Hamd Allah’adır. Allah’tan başka ilah yoktur; O tektir, ortağı yoktur. Mülk O’nundur, hamd O’nadır ve O her şeye kadirdir. Rabbim! Bu gecenin hayrını ve sonrasının hayrını Senden isterim; bu gecenin şerrinden ve sonrasının şerrinden Sana sığınırım. Rabbim! Tembellikten ve kötü ihtiyarlıktan Sana sığınırım. Rabbim! Cehennem azabından ve kabir azabından Sana sığınırım.",
      occasion: "Akşam olunca",
    },
    "11": {
      title: "Uyku duası",
      meaning:
        "Allah’ım! Senin isminle ölür (uyur) ve Senin isminle dirilirim (uyanırım).",
      occasion: "Yatmadan önce",
    },
    "12": {
      title: "Tövbe duası",
      meaning:
        "İkisi dediler ki: “Rabbimiz! Biz kendimize zulmettik. Bizi bağışlamaz ve bize merhamet etmezsen elbette hüsrana uğrayanlardan oluruz.” (A’râf 7/23)",
      occasion: "Tövbe için · A’râf 23",
    },
    "13": {
      title: "Rızık duası",
      meaning:
        "Allah’ım! Senden faydalı ilim, temiz rızık ve kabul edilen amel isterim.",
      occasion: "İş / geçim",
    },
    "14": {
      title: "Sabır duası",
      meaning:
        "“Sen bizden ancak Rabbimizin âyetleri gelince onlara iman etmemizden ötürü öç alıyorsun. Rabbimiz! Üzerimize sabır yağdır ve bizi Müslümanlar olarak vefat ettir.” (A’râf 7/126)",
      occasion: "Sabır gerektiğinde · A’râf 126",
    },
  },
} as const;

type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>;
};

const en: DeepStringify<typeof tr> = {
  appName: "My Prayer Guide",
  tabs: {
    today: "Today",
    prayer: "Prayer",
    duas: "Duas",
    qibla: "Qibla",
    tracking: "Tracking",
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
        title: "Welcome to My Prayer Guide",
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
    subtitle: "Today’s dua, prayer times, and a step-by-step guide",
    todaysDua: "Today’s dua",
    allDuas: "All duas",
    quickStart: "Quick start",
    howToPray: "How to pray?",
    howToPrayHint: "Step-by-step from Fajr to Isha",
    fajrGuide: "Fajr prayer guide",
    fajrHint: "2 fard rakahs — one step at a time",
    prayerTimes: "Prayer times",
    nextPrayer: "Next prayer",
    untilPrayer: "remaining",
    tomorrowFajr: "Tomorrow Fajr",
    cityLabel: "City",
    hoursShort: "h",
    minutesShort: "m",
    secondsShort: "s",
    startPrayer: "Start prayer",
    startPrayerHint: "{{prayer}} — step-by-step prayer session",
    startPrayerCta: "Start",
    openQibla: "Find Qibla",
  },
  session: {
    stepOf: "{{current}} / {{total}}",
    next: "Next",
    prev: "Previous",
    finish: "Finish",
    close: "Close",
    autoImam: "Voice guide",
    autoImamHint: "Guides you aloud like an imam; advances when a step ends",
    expandHint: "Tap a step for full text and meaning",
    poseTapHint: "Tap photo to enlarge",
    poseCloseHint: "Tap to close",
    stepsCount: "steps",
    sectionLabel: "{{section}} · rakah {{rakat}}",
    sectionOnly: "{{section}}",
    sectionPickTitle: "Parts",
    sectionPickHint: "Tap a part to open the guide with only those steps.",
    sectionCompleted: "Completed",
    sectionReady: "Start",
    sectionReplay: "Pray again",
    sectionRakat: "{{count}} rakahs",
    backToSections: "Back to parts",
    nextIn: "Next step",
    finishIn: "Ending this part",
    skipWait: "Skip wait",
    readingHint: "Follow the reading — look here to memorize",
    section: {
      sunnah: "First sunnah",
      fard: "Fard",
      lastSunnah: "Last sunnah",
      witr: "Witr",
    },
    cues: {
      niyet: "Make your intention",
      tekbir: "Allahu Akbar",
      subhaneke: "Recite Subhanaka",
      kiyamSure: "Recite Surah Al-Ikhlas",
      kiyamFatiha: "Recite Al-Fatiha",
      ruku: "Go to ruku",
      kavme: "Rise",
      rabbena: "Rabbana lakal hamd",
      secde: "Go to sujud",
      secde2: "Go to the second sujud",
      oturma: "Sit",
      teshehhudFirst: "Recite Tashahhud",
      teshehhudLast: "Recite Tashahhud",
      salavat: "Recite the salawat",
      rabbenaAtina: "Recite the Rabbana dua",
      selam: "Give salam",
      kunutTekbir: "Raise your hands and say the takbir",
      kunut: "Recite the Qunut dua",
    },
    meal: "Meaning",
    reading: "Transliteration",
    texts: {
      niyet: {
        title: "Intention",
        meaning: "I intend to pray for the sake of Allah.",
      },
      tekbir: {
        title: "Takbir",
        meaning: "Allah is the Greatest.",
      },
      subhaneke: {
        title: "Subhanaka",
        meaning:
          "O Allah, glory and praise be to You. Blessed is Your name, exalted is Your majesty. There is no god but You.",
      },
      fatiha: {
        title: "Surah Al-Fatiha",
        meaning:
          "In the name of Allah, the Most Gracious, the Most Merciful. All praise is for Allah, Lord of the worlds. The Most Gracious, the Most Merciful. Master of the Day of Judgment. You alone we worship, and You alone we ask for help. Guide us on the straight path — the path of those You have blessed, not of those who earn anger, nor of those who go astray.",
      },
      ihlas: {
        title: "Surah Al-Ikhlas",
        meaning:
          "In the name of Allah, the Most Gracious, the Most Merciful. Say: He is Allah, One. Allah, the Eternal Refuge. He neither begets nor is born, and there is none comparable to Him.",
      },
      ruku: {
        title: "Ruku tasbih",
        meaning: "Glory be to my Lord, the Magnificent. (Three times)",
      },
      semiallah: {
        title: "Qawmah",
        meaning: "Allah hears those who praise Him.",
      },
      rabbena: {
        title: "Praise",
        meaning: "Our Lord, to You belongs all praise.",
      },
      secde: {
        title: "Sujud tasbih",
        meaning: "Glory be to my Lord, the Most High. (Three times)",
      },
      ettehiyyatu: {
        title: "Tashahhud",
        meaning:
          "All greetings, prayers and good things are for Allah. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. I bear witness that there is no god but Allah, and I bear witness that Muhammad is His servant and Messenger.",
      },
      salavat: {
        title: "Salawat",
        meaning:
          "O Allah, send prayers upon Muhammad and the family of Muhammad, as You sent prayers upon Ibrahim and the family of Ibrahim. You are Praiseworthy, Glorious. O Allah, bless Muhammad and the family of Muhammad, as You blessed Ibrahim and the family of Ibrahim. You are Praiseworthy, Glorious.",
      },
      rabbenaAtina: {
        title: "Rabbana dua",
        meaning:
          "Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.",
      },
      kunut: {
        title: "Qunut dua",
        meaning:
          "O Allah, we seek Your help and forgiveness, and we praise You with good. We do not deny You; we leave and forsake whoever disobeys You. O Allah, You alone we worship; for You we pray and prostrate; to You we strive. We hope for Your mercy and fear Your punishment. Your punishment reaches the disbelievers.",
      },
      selam: {
        title: "Salam",
        meaning: "Peace and the mercy of Allah be upon you.",
      },
    },
    poses: {
      niyet: { title: "Intention" },
      tekbir: {
        title: "Takbir",
        titleWithRakat: "Rakah {{rakat}} — takbir",
        detail:
          "Raise hands to ear level. Say Allahu Akbar and fold your hands.",
      },
      kiyam: {
        title: "Standing",
        titleWithRakat: "Rakah {{rakat}} — standing",
        detailSure:
          "Standing: Subhanaka (first rakah), Ta’awwudh-Basmala, Al-Fatiha and a surah.",
        detailFatiha:
          "Standing: recite Al-Fatiha (no surah required in this rakah in Hanafi).",
      },
      ruku: {
        title: "Ruku",
        titleWithRakat: "Rakah {{rakat}} — ruku",
        detail:
          "Bow with takbir, hands on knees. Say Subhana Rabbiyal Azim three times.",
      },
      kavme: {
        title: "Qawmah",
        titleWithRakat: "Rakah {{rakat}} — qawmah",
        detail:
          "Rise saying Sami’allahu liman hamidah, then Rabbana lakal hamd.",
      },
      secde: {
        title: "Sujud",
        titleWithRakat: "Rakah {{rakat}} — sujud",
        detail:
          "Forehead, nose, palms, knees and toes on the ground. Say Subhana Rabbiyal A’la three times.",
      },
      oturma: {
        title: "Between sujuds",
        titleWithRakat: "Rakah {{rakat}} — sitting",
        detail: "Sit briefly with takbir. You may say Allahummaghfir li.",
      },
      teshehhud: {
        title: "Tashahhud",
        titleWithRakat: "Rakah {{rakat}} — tashahhud",
        detailFirst: "Recite Tashahhud, then stand.",
        detailLast: "Recite Tashahhud, Salawat and the Rabbena duas.",
      },
      kunut: {
        title: "Qunut",
        titleWithRakat: "Rakah {{rakat}} — Qunut",
        detail:
          "After raising hands with takbir, recite Qunut, then go to ruku.",
      },
      selam: {
        title: "Salam",
        titleWithRakat: "Salam",
        detail: "Turn right then left saying Essalamu alaykum wa rahmatullah.",
      },
    },
  },
  prayerTimes: {
    fajr: "Fajr",
    sunrise: "Sunrise",
    dhuhr: "Dhuhr",
    asr: "Asr",
    maghrib: "Maghrib",
    isha: "Isha",
    methodHint: "Turkey Diyanet calculation",
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
    location: "Location",
    city: "City",
    citySearch: "Search city…",
    useLocation: "Use my location",
    cityManual: "Chosen manually",
    cityAuto: "From location",
    locationDenied:
      "Location permission denied. Using the default or selected city.",
    about: "About",
    aboutText:
      "My Prayer Guide — step-by-step prayer, daily dua, and city-based prayer times.",
    report: "Prayer report",
    reportHint: "Daily completed prayers and rakahs",
  },
  qibla: {
    title: "Qibla finder",
    hint: "Hold the phone flat; the gold marker points to the Kaaba.",
    bearing: "QIBLA",
    calibrating: "Calibrating compass…",
    aligned: "Facing the Qibla",
    turn: "Turn {{direction}} {{degrees}}°",
    left: "left",
    right: "right",
    distance: "≈ {{km}} km to the Kaaba",
    gpsOn: "GPS location",
    gpsHint: "Calculated from your live position",
    cityFallback: "Approximate direction from selected city",
    permissionDenied: "No location permission — using city center",
  },
  report: {
    title: "Prayer Tracking",
    subtitle: "Follow your daily, weekly, and monthly progress",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    weekSummary: "Last 7 days",
    weekProgress: "{{done}}/{{total}} prayers this week",
    monthSummary: "{{done}} prayers · {{rakats}} rakahs",
    completed: "Completed",
    streak: "Streak (days)",
    rakatsShort: "Rakahs",
    less: "Less",
    more: "More",
    colorLegend: "Prayers completed that day",
    colorNone: "0",
    colorFull: "5",
    fullDays: "Full days",
    bestStreak: "Best streak",
    consistency: "Consistency",
    prevMonth: "Previous month",
    nextMonth: "Next month",
    backToToday: "This month",
    oldestMonth: "Oldest",
    shareReport: "Share report",
    sharePreview: "Share preview",
    shareAsImage: "Share as image",
    preparingShare: "Preparing image…",
    shareUnavailable: "Sharing is not available on this device.",
    shareError: "The report image could not be created. Please try again.",
    shareBrand: "My Prayer Guide",
    shareDaily: "Daily report",
    shareWeekly: "Weekly report",
    shareMonthly: "Monthly report",
    shareSummary: "{{done}} prayers · {{rakats}} rakahs",
    shareFooter: "My prayer journey",
    empty: "No history yet. Mark above or finish with the guide.",
    today: "Today",
    todayMark: "Today",
    todayMarkHint: "Mark manually or finish with the guide",
    todaySummary: "{{done}}/{{total}} prayers · {{rakats}} rakahs",
    markDone: "Done",
    markTodo: "Mark",
    markPartial: "In progress",
    rakatProgress: "{{done}}/{{total}} rakahs",
    history: "History",
    rakats: "{{count}} rakahs",
    prayersDone: "{{count}} prayers",
    none: "No prayers completed",
  },
  prayer: {
    intro:
      "Unlike other apps: how to pray plus city-based times. Follow each prayer step by step.",
    guideTitle: "How to Pray",
    startSession: "Guided prayer session",
    startSessionHint: "{{prayer}} — open the voice-guided session",
    startThis: "Start this prayer",
    openGuide: "Open guide",
  },
  duas: {
    headerTitle: "Daily Duas",
    todayLabel: "Today · {{current}}/{{total}}",
    allTitle: "All daily duas",
    allHint:
      "Each day picks the next dua automatically. Tomorrow brings a new one.",
    expandHint: "Tap a dua for details",
    arabicLabel: "Arabic",
    readingLabel: "Transliteration",
    meaningLabel: "Meaning",
    listen: "Listen",
    stopListen: "Stop",
  },
  prayers: {
    sabah: {
      name: "Fajr Prayer",
      summary: "2 sunnah + 2 fard (Diyanet)",
      niyet: {
        sunnah: "Intend the sunnah of Fajr. Face the Qibla.",
        fard: "Intend the fard of Fajr. Face the Qibla.",
      },
    },
    ogle: {
      name: "Dhuhr Prayer",
      summary: "4 first sunnah + 4 fard + 2 last sunnah (Diyanet)",
      niyet: {
        sunnah: "Intend the first sunnah of Dhuhr. Face the Qibla.",
        fard: "Intend the fard of Dhuhr. Face the Qibla.",
        lastSunnah: "Intend the last sunnah of Dhuhr. Face the Qibla.",
      },
    },
    ikindi: {
      name: "Asr Prayer",
      summary: "4 sunnah + 4 fard (Diyanet)",
      niyet: {
        sunnah: "Intend the sunnah of Asr. Face the Qibla.",
        fard: "Intend the fard of Asr. Face the Qibla.",
      },
    },
    aksam: {
      name: "Maghrib Prayer",
      summary: "3 fard + 2 last sunnah (Diyanet)",
      niyet: {
        fard: "Intend the fard of Maghrib. Face the Qibla.",
        lastSunnah: "Intend the last sunnah of Maghrib. Face the Qibla.",
      },
    },
    yatsi: {
      name: "Isha Prayer",
      summary: "4 sunnah + 4 fard + 2 last sunnah + 3 Witr (Diyanet)",
      niyet: {
        sunnah: "Intend the first sunnah of Isha. Face the Qibla.",
        fard: "Intend the fard of Isha. Face the Qibla.",
        lastSunnah: "Intend the last sunnah of Isha. Face the Qibla.",
        witr: "Intend the Witr prayer. Face the Qibla.",
      },
    },
  },
  duaItems: {
    "15": {
      title: "Ayat al-Kursi",
      meaning:
        "Allah—there is no god except Him—is the Ever-Living, the Sustainer of all. Neither drowsiness nor sleep overtakes Him. To Him belongs all that is in the heavens and on earth. Who could intercede with Him without His permission? He knows what is before them and what is behind them, while they encompass nothing of His knowledge except what He wills. His Throne extends over the heavens and the earth, and preserving them does not tire Him. He is the Most High, the Magnificent. (Al-Baqarah 2:255)",
      occasion: "For protection and remembrance · Al-Baqarah 255",
    },
    "16": {
      title: "Surah Al-Ikhlas",
      meaning:
        "Say: “He is Allah, the One; Allah, the Eternal Refuge. He neither begets nor is born, and there is none comparable to Him.” (Al-Ikhlas 112:1–4)",
      occasion: "For affirmation of faith and remembrance · Al-Ikhlas 1–4",
    },
    "17": {
      title: "Surah Al-Falaq",
      meaning:
        "Say: “I seek refuge in the Lord of daybreak from the evil of what He has created, from the evil of the night when it grows dark, from the evil of those who blow on knots, and from the evil of an envier when they envy.” (Al-Falaq 113:1–5)",
      occasion: "Seeking Allah’s refuge from evil · Al-Falaq 1–5",
    },
    "18": {
      title: "Surah An-Nas",
      meaning:
        "Say: “I seek refuge in the Lord of humankind, the Sovereign of humankind, the God of humankind, from the evil of the retreating whisperer who whispers into the hearts of humankind—from among jinn and humankind.” (An-Nas 114:1–6)",
      occasion: "Seeking Allah’s refuge from whispers · An-Nas 1–6",
    },
    "19": {
      title: "Al-Qalam 51–52 (commonly called the evil-eye verses)",
      meaning:
        "The disbelievers almost strike you down with their looks when they hear the Reminder, and they say, “He is certainly mad.” Yet it is only a reminder to all worlds. (Al-Qalam 68:51–52)",
      occasion:
        "Commonly known as the evil-eye verses · Al-Qalam 51–52",
    },
    "1": {
      title: "Morning dua",
      meaning:
        "We have entered the morning and dominion belongs to Allah. All praise is for Allah. There is no god but Allah alone, with no partner. To Him belong dominion and praise, and He is over all things competent. My Lord, I ask You for the good of this day and of what follows it, and I seek refuge in You from the evil of this day and of what follows it. My Lord, I seek refuge in You from laziness and from the evil of old age, and from the punishment of the Fire and the punishment of the grave.",
      occasion: "Upon waking",
    },
    "2": {
      title: "Protection dua",
      meaning:
        "In the name of Allah, with Whose name nothing on earth or in heaven can cause harm, and He is the All-Hearing, the All-Knowing.",
      occasion: "Starting the day",
    },
    "3": {
      title: "Istighfar",
      meaning:
        "I seek forgiveness from Allah, the Most Great — there is no god but He, the Ever-Living, the Sustainer — and I repent to Him.",
      occasion: "During the day",
    },
    "4": {
      title: "Gratitude dua",
      meaning:
        "O Allah, whatever blessing has come to me or to any of Your creation this morning is from You alone, with no partner. To You belong all praise and all thanks.",
      occasion: "When blessed",
    },
    "5": {
      title: "Ease dua",
      meaning:
        "Moses said: “My Lord, expand my chest for me, make my task easy, and untie the knot from my tongue so they may understand my speech.” (Ta-Ha 20:25–28)",
      occasion: "In difficulty · Ta-Ha 25–28",
    },
    "6": {
      title: "Guidance dua",
      meaning:
        "Guide us to the straight path — the path of those You have blessed, not of those who earned anger, nor of those who went astray. (Al-Fatiha 1:6–7)",
      occasion: "In every prayer · Al-Fatiha 6–7",
    },
    "7": {
      title: "Family dua",
      meaning:
        "Those who say: “Our Lord, grant us comfort in our spouses and offspring, and make us leaders for the righteous.” (Al-Furqan 25:74)",
      occasion: "For family · Al-Furqan 74",
    },
    "8": {
      title: "Knowledge dua",
      meaning:
        "So exalted is Allah, the True King. Do not hasten with the Quran before its revelation is completed to you, and say: “My Lord, increase me in knowledge.” (Ta-Ha 20:114)",
      occasion: "While learning · Ta-Ha 114",
    },
    "9": {
      title: "Distress dua",
      meaning:
        "And remember the Companion of the Fish (Yunus), when he went off in anger and thought We would not decree upon him. Then he called out in the darkness: “There is no god but You; glory be to You. I was among the wrongdoers.” (Al-Anbiya 21:87)",
      occasion: "In hardship · Al-Anbiya 87",
    },
    "10": {
      title: "Evening dua",
      meaning:
        "We have entered the evening and dominion belongs to Allah. All praise is for Allah. There is no god but Allah alone, with no partner. To Him belong dominion and praise, and He is over all things competent. My Lord, I ask You for the good of this night and of what follows it, and I seek refuge in You from its evil and from what follows it. My Lord, I seek refuge in You from laziness and from the evil of old age, and from the punishment of the Fire and the punishment of the grave.",
      occasion: "At evening",
    },
    "11": {
      title: "Sleep dua",
      meaning: "O Allah, in Your name I die (sleep) and I live (wake).",
      occasion: "Before sleep",
    },
    "12": {
      title: "Repentance dua",
      meaning:
        "They both said: “Our Lord, we have wronged ourselves. If You do not forgive us and have mercy on us, we will surely be among the losers.” (Al-A‘raf 7:23)",
      occasion: "For repentance · Al-A‘raf 23",
    },
    "13": {
      title: "Provision dua",
      meaning:
        "O Allah, I ask You for beneficial knowledge, pure provision, and accepted deeds.",
      occasion: "Work / livelihood",
    },
    "14": {
      title: "Patience dua",
      meaning:
        "“You take revenge on us only because we believed in the signs of our Lord when they came to us. Our Lord, pour upon us patience and let us die as Muslims.” (Al-A‘raf 7:126)",
      occasion: "When patience is needed · Al-A‘raf 126",
    },
  },
};

export const translations = { tr, en };
export type TranslationKeys = typeof tr;
