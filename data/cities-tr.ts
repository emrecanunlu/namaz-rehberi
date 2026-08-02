export type CitySource = "auto" | "manual";

export type TurkeyCity = {
  id: string;
  nameTr: string;
  nameEn: string;
  lat: number;
  lng: number;
};

/** İl merkezleri (yaklaşık) — en yakın il eşlemesi için */
export const TURKEY_CITIES: TurkeyCity[] = [
  { id: "adana", nameTr: "Adana", nameEn: "Adana", lat: 37.0, lng: 35.3213 },
  { id: "adiyaman", nameTr: "Adıyaman", nameEn: "Adiyaman", lat: 37.7648, lng: 38.2786 },
  { id: "afyonkarahisar", nameTr: "Afyonkarahisar", nameEn: "Afyonkarahisar", lat: 38.7507, lng: 30.5567 },
  { id: "agri", nameTr: "Ağrı", nameEn: "Agri", lat: 39.7191, lng: 43.0503 },
  { id: "aksaray", nameTr: "Aksaray", nameEn: "Aksaray", lat: 38.3687, lng: 34.037 },
  { id: "amasya", nameTr: "Amasya", nameEn: "Amasya", lat: 40.6499, lng: 35.8353 },
  { id: "ankara", nameTr: "Ankara", nameEn: "Ankara", lat: 39.9334, lng: 32.8597 },
  { id: "antalya", nameTr: "Antalya", nameEn: "Antalya", lat: 36.8969, lng: 30.7133 },
  { id: "ardahan", nameTr: "Ardahan", nameEn: "Ardahan", lat: 41.1105, lng: 42.7022 },
  { id: "artvin", nameTr: "Artvin", nameEn: "Artvin", lat: 41.1828, lng: 41.8183 },
  { id: "aydin", nameTr: "Aydın", nameEn: "Aydin", lat: 37.856, lng: 27.8416 },
  { id: "balikesir", nameTr: "Balıkesir", nameEn: "Balikesir", lat: 39.6484, lng: 27.8826 },
  { id: "bartin", nameTr: "Bartın", nameEn: "Bartin", lat: 41.6344, lng: 32.3375 },
  { id: "batman", nameTr: "Batman", nameEn: "Batman", lat: 37.8812, lng: 41.1351 },
  { id: "bayburt", nameTr: "Bayburt", nameEn: "Bayburt", lat: 40.2552, lng: 40.2249 },
  { id: "bilecik", nameTr: "Bilecik", nameEn: "Bilecik", lat: 40.1506, lng: 29.9833 },
  { id: "bingol", nameTr: "Bingöl", nameEn: "Bingol", lat: 38.8855, lng: 40.4966 },
  { id: "bitlis", nameTr: "Bitlis", nameEn: "Bitlis", lat: 38.4006, lng: 42.1095 },
  { id: "bolu", nameTr: "Bolu", nameEn: "Bolu", lat: 40.735, lng: 31.6061 },
  { id: "burdur", nameTr: "Burdur", nameEn: "Burdur", lat: 37.7203, lng: 30.2906 },
  { id: "bursa", nameTr: "Bursa", nameEn: "Bursa", lat: 40.1885, lng: 29.061 },
  { id: "canakkale", nameTr: "Çanakkale", nameEn: "Canakkale", lat: 40.1553, lng: 26.4142 },
  { id: "cankiri", nameTr: "Çankırı", nameEn: "Cankiri", lat: 40.6013, lng: 33.6135 },
  { id: "corum", nameTr: "Çorum", nameEn: "Corum", lat: 40.5506, lng: 34.9556 },
  { id: "denizli", nameTr: "Denizli", nameEn: "Denizli", lat: 37.7765, lng: 29.0864 },
  { id: "diyarbakir", nameTr: "Diyarbakır", nameEn: "Diyarbakir", lat: 37.9144, lng: 40.2306 },
  { id: "duzce", nameTr: "Düzce", nameEn: "Duzce", lat: 40.8438, lng: 31.1565 },
  { id: "edirne", nameTr: "Edirne", nameEn: "Edirne", lat: 41.6771, lng: 26.5557 },
  { id: "elazig", nameTr: "Elazığ", nameEn: "Elazig", lat: 38.681, lng: 39.2264 },
  { id: "erzincan", nameTr: "Erzincan", nameEn: "Erzincan", lat: 39.75, lng: 39.5 },
  { id: "erzurum", nameTr: "Erzurum", nameEn: "Erzurum", lat: 39.9, lng: 41.27 },
  { id: "eskisehir", nameTr: "Eskişehir", nameEn: "Eskisehir", lat: 39.7767, lng: 30.5206 },
  { id: "gaziantep", nameTr: "Gaziantep", nameEn: "Gaziantep", lat: 37.0662, lng: 37.3833 },
  { id: "giresun", nameTr: "Giresun", nameEn: "Giresun", lat: 40.9128, lng: 38.3895 },
  { id: "gumushane", nameTr: "Gümüşhane", nameEn: "Gumushane", lat: 40.4386, lng: 39.5086 },
  { id: "hakkari", nameTr: "Hakkâri", nameEn: "Hakkari", lat: 37.5744, lng: 43.7408 },
  { id: "hatay", nameTr: "Hatay", nameEn: "Hatay", lat: 36.4018, lng: 36.3498 },
  { id: "igdir", nameTr: "Iğdır", nameEn: "Igdir", lat: 39.9167, lng: 44.0333 },
  { id: "isparta", nameTr: "Isparta", nameEn: "Isparta", lat: 37.7648, lng: 30.5566 },
  { id: "istanbul", nameTr: "İstanbul", nameEn: "Istanbul", lat: 41.0082, lng: 28.9784 },
  { id: "izmir", nameTr: "İzmir", nameEn: "Izmir", lat: 38.4237, lng: 27.1428 },
  { id: "kahramanmaras", nameTr: "Kahramanmaraş", nameEn: "Kahramanmaras", lat: 37.5858, lng: 36.9371 },
  { id: "karabuk", nameTr: "Karabük", nameEn: "Karabuk", lat: 41.2061, lng: 32.6204 },
  { id: "karaman", nameTr: "Karaman", nameEn: "Karaman", lat: 37.1759, lng: 33.2287 },
  { id: "kars", nameTr: "Kars", nameEn: "Kars", lat: 40.6013, lng: 43.0975 },
  { id: "kastamonu", nameTr: "Kastamonu", nameEn: "Kastamonu", lat: 41.3887, lng: 33.7827 },
  { id: "kayseri", nameTr: "Kayseri", nameEn: "Kayseri", lat: 38.7312, lng: 35.4787 },
  { id: "kilis", nameTr: "Kilis", nameEn: "Kilis", lat: 36.7184, lng: 37.1212 },
  { id: "kirikkale", nameTr: "Kırıkkale", nameEn: "Kirikkale", lat: 39.8468, lng: 33.5153 },
  { id: "kirklareli", nameTr: "Kırklareli", nameEn: "Kirklareli", lat: 41.7333, lng: 27.2167 },
  { id: "kirsehir", nameTr: "Kırşehir", nameEn: "Kirsehir", lat: 39.1425, lng: 34.1709 },
  { id: "kocaeli", nameTr: "Kocaeli", nameEn: "Kocaeli", lat: 40.8533, lng: 29.8815 },
  { id: "konya", nameTr: "Konya", nameEn: "Konya", lat: 37.8746, lng: 32.4932 },
  { id: "kutahya", nameTr: "Kütahya", nameEn: "Kutahya", lat: 39.4167, lng: 29.9833 },
  { id: "malatya", nameTr: "Malatya", nameEn: "Malatya", lat: 38.3552, lng: 38.3095 },
  { id: "manisa", nameTr: "Manisa", nameEn: "Manisa", lat: 38.6191, lng: 27.4289 },
  { id: "mardin", nameTr: "Mardin", nameEn: "Mardin", lat: 37.3212, lng: 40.7245 },
  { id: "mersin", nameTr: "Mersin", nameEn: "Mersin", lat: 36.8121, lng: 34.6415 },
  { id: "mugla", nameTr: "Muğla", nameEn: "Mugla", lat: 37.2153, lng: 28.3636 },
  { id: "mus", nameTr: "Muş", nameEn: "Mus", lat: 38.7432, lng: 41.5065 },
  { id: "nevsehir", nameTr: "Nevşehir", nameEn: "Nevsehir", lat: 38.6939, lng: 34.6857 },
  { id: "nigde", nameTr: "Niğde", nameEn: "Nigde", lat: 37.9667, lng: 34.6793 },
  { id: "ordu", nameTr: "Ordu", nameEn: "Ordu", lat: 40.9839, lng: 37.8764 },
  { id: "osmaniye", nameTr: "Osmaniye", nameEn: "Osmaniye", lat: 37.0742, lng: 36.2478 },
  { id: "rize", nameTr: "Rize", nameEn: "Rize", lat: 41.0201, lng: 40.5234 },
  { id: "sakarya", nameTr: "Sakarya", nameEn: "Sakarya", lat: 40.7889, lng: 30.4053 },
  { id: "samsun", nameTr: "Samsun", nameEn: "Samsun", lat: 41.2867, lng: 36.33 },
  { id: "sanliurfa", nameTr: "Şanlıurfa", nameEn: "Sanliurfa", lat: 37.1591, lng: 38.7969 },
  { id: "siirt", nameTr: "Siirt", nameEn: "Siirt", lat: 37.9333, lng: 41.95 },
  { id: "sinop", nameTr: "Sinop", nameEn: "Sinop", lat: 42.0231, lng: 35.1531 },
  { id: "sirnak", nameTr: "Şırnak", nameEn: "Sirnak", lat: 37.5164, lng: 42.4611 },
  { id: "sivas", nameTr: "Sivas", nameEn: "Sivas", lat: 39.7477, lng: 37.0179 },
  { id: "tekirdag", nameTr: "Tekirdağ", nameEn: "Tekirdag", lat: 40.9833, lng: 27.5167 },
  { id: "tokat", nameTr: "Tokat", nameEn: "Tokat", lat: 40.3167, lng: 36.55 },
  { id: "trabzon", nameTr: "Trabzon", nameEn: "Trabzon", lat: 41.0015, lng: 39.7178 },
  { id: "tunceli", nameTr: "Tunceli", nameEn: "Tunceli", lat: 39.1079, lng: 39.5401 },
  { id: "usak", nameTr: "Uşak", nameEn: "Usak", lat: 38.6823, lng: 29.4082 },
  { id: "van", nameTr: "Van", nameEn: "Van", lat: 38.4891, lng: 43.4089 },
  { id: "yalova", nameTr: "Yalova", nameEn: "Yalova", lat: 40.65, lng: 29.2667 },
  { id: "yozgat", nameTr: "Yozgat", nameEn: "Yozgat", lat: 39.8181, lng: 34.8147 },
  { id: "zonguldak", nameTr: "Zonguldak", nameEn: "Zonguldak", lat: 41.4564, lng: 31.7987 },
];

export const DEFAULT_CITY_ID = "istanbul";

export function getCityById(id: string): TurkeyCity {
  return TURKEY_CITIES.find((c) => c.id === id) ?? TURKEY_CITIES.find((c) => c.id === DEFAULT_CITY_ID)!;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function findNearestCity(lat: number, lng: number): TurkeyCity {
  let best = TURKEY_CITIES[0];
  let bestDist = Number.POSITIVE_INFINITY;
  for (const city of TURKEY_CITIES) {
    const d = haversineKm(lat, lng, city.lat, city.lng);
    if (d < bestDist) {
      bestDist = d;
      best = city;
    }
  }
  return best;
}

export function cityDisplayName(city: TurkeyCity, locale: "tr" | "en") {
  return locale === "tr" ? city.nameTr : city.nameEn;
}
