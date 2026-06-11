import { GradeLevel, SubjectType } from "@prisma/client";

// Sınıflara göre hangi derslerin gösterileceğini belirleyen merkez harita.
export const CURRICULUM_MAP: Record<GradeLevel, SubjectType[]> = {
    OKUL_ONCESI: [
        SubjectType.TUM_DERSLER,
        SubjectType.DIL_VE_KONUSMA,
        SubjectType.MOTOR_GELISIM,
        SubjectType.GORSEL_SANATLAR,
        SubjectType.MUZIK,
        SubjectType.SERBEST_ETKINLIK
    ],
    SINIF_1: [
        SubjectType.TUM_DERSLER,
        SubjectType.TURKCE,
        SubjectType.MATEMATIK,
        SubjectType.HAYAT_BILGISI,
        SubjectType.GORSEL_SANATLAR,
        SubjectType.MUZIK,
        SubjectType.BEDEN_EGITIMI,
        SubjectType.SERBEST_ETKINLIK
    ],
    SINIF_2: [
        SubjectType.TUM_DERSLER,
        SubjectType.TURKCE,
        SubjectType.MATEMATIK,
        SubjectType.HAYAT_BILGISI,
        SubjectType.INGILIZCE,
        SubjectType.GORSEL_SANATLAR,
        SubjectType.MUZIK,
        SubjectType.BEDEN_EGITIMI,
        SubjectType.SERBEST_ETKINLIK
    ],
    SINIF_3: [
        SubjectType.TUM_DERSLER,
        SubjectType.TURKCE,
        SubjectType.MATEMATIK,
        SubjectType.HAYAT_BILGISI,
        SubjectType.FEN_BILIMLERI,
        SubjectType.INGILIZCE,
        SubjectType.GORSEL_SANATLAR,
        SubjectType.MUZIK,
        SubjectType.BEDEN_EGITIMI,
        SubjectType.SERBEST_ETKINLIK
    ],
    SINIF_4: [
        SubjectType.TUM_DERSLER,
        SubjectType.TURKCE,
        SubjectType.MATEMATIK,
        SubjectType.FEN_BILIMLERI,
        SubjectType.SOSYAL_BILGILER,
        SubjectType.INGILIZCE,
        SubjectType.DIN_KULTURU,
        SubjectType.GORSEL_SANATLAR,
        SubjectType.MUZIK,
        SubjectType.BEDEN_EGITIMI,
        SubjectType.BILISIM
    ],
    GENEL: [
        SubjectType.TUM_DERSLER,
        SubjectType.REHBERLIK,
        SubjectType.BILISIM,
        SubjectType.BEDEN_EGITIMI,
        SubjectType.GORSEL_SANATLAR,
        SubjectType.MUZIK
    ]
};

// UI için formatlayıcı fonksiyon (Örn: FEN_BILIMLERI -> Fen Bilimleri)
export const formatSubject = (subject: SubjectType | string): string => {
    if (subject === "TUM_DERSLER") return "Tümü";
    return subject
        .replace(/_/g, " ")
        .replace(/I/g, "ı")
        .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
        .replace("Turkce", "Türkçe")
        .replace("Matematik", "Matematik")
        .replace("Hayat Bilgisi", "Hayat Bilgisi")
        .replace("Fen Bilimleri", "Fen Bilimleri")
        .replace("Sosyal Bilgiler", "Sosyal Bilgiler")
        .replace("Ingilizce", "İngilizce")
        .replace("Din Kulturu", "Din Kültürü")
        .replace("Beden Egitimi", "Beden Eğitimi")
        .replace("Bilisim", "Bilişim")
        .replace("Gorsel Sanatlar", "Görsel Sanatlar")
        .replace("Muzik", "Müzik")
        .replace("Dil Ve Konusma", "Dil ve Konuşma")
        .replace("Motor Gelisim", "Motor Gelişim");
};