export interface Hizb {
  id: number;
  nameFr: string;
  nameAr: string;
  nameWo: string;
  firstWords?: string;
}

export const HIZB_LIST: Hizb[] = [
  { id: 1, nameFr: "Hizb 1 (Al-Fatiha)", nameAr: "الحزب ١ (الفاتحة)", nameWo: "Hizb 1 (Al-Fatiha)", firstWords: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ" },
  { id: 2, nameFr: "Hizb 2 (Al-Baqarah 75)", nameAr: "الحزب ٢ (البقرة ٧٥)", nameWo: "Hizb 2 (Al-Baqarah 75)", firstWords: "۞ أَفَتَطْمَعُونَ أَن" },
  { id: 3, nameFr: "Hizb 3 (Al-Baqarah 142)", nameAr: "الحزب ٣ (البقرة ١٤٢)", nameWo: "Hizb 3 (Al-Baqarah 142)", firstWords: "۞ سَيَقُولُ ٱلسُّفَهَآءُ" },
  { id: 4, nameFr: "Hizb 4 (Al-Baqarah 203)", nameAr: "الحزب ٤ (البقرة ٢٠٣)", nameWo: "Hizb 4 (Al-Baqarah 203)", firstWords: "۞ وَٱذْكُرُوا۟ ٱللَّهَ" },
  { id: 5, nameFr: "Hizb 5 (Al-Baqarah 253)", nameAr: "الحزب ٥ (البقرة ٢٥٣)", nameWo: "Hizb 5 (Al-Baqarah 253)", firstWords: "۞ تِلْكَ ٱلرُّسُلُ" },
  { id: 6, nameFr: "Hizb 6 (Al-Imran 15)", nameAr: "الحزب ٦ (آل عمران ١٥)", nameWo: "Hizb 6 (Al-Imran 15)", firstWords: "۞ قُلْ أَؤُنَبِّئُكُم" },
  { id: 7, nameFr: "Hizb 7 (Al-Imran 93)", nameAr: "الحزب ٧ (آل عمران ٩٣)", nameWo: "Hizb 7 (Al-Imran 93)", firstWords: "۞ كُلُّ ٱلطَّعَامِ" },
  { id: 8, nameFr: "Hizb 8 (Al-Imran 171)", nameAr: "الحزب ٨ (آل عمران ١٧١)", nameWo: "Hizb 8 (Al-Imran 171)", firstWords: "۞ يَسْتَبْشِرُونَ بِنِعْمَةٍۢ" },
  { id: 9, nameFr: "Hizb 9 (An-Nisa 24)", nameAr: "الحزب ٩ (النساء ٢٤)", nameWo: "Hizb 9 (An-Nisa 24)", firstWords: "۞ وَٱلْمُحْصَنَٰتُ مِنَ" },
  { id: 10, nameFr: "Hizb 10 (An-Nisa 88)", nameAr: "الحزب ١٠ (النساء ٨٨)", nameWo: "Hizb 10 (An-Nisa 88)", firstWords: "۞ فَمَا لَكُمْ" },
  { id: 11, nameFr: "Hizb 11 (An-Nisa 148)", nameAr: "الحزب ١١ (النساء ١٤٨)", nameWo: "Hizb 11 (An-Nisa 148)", firstWords: "۞ لَّا يُحِبُّ" },
  { id: 12, nameFr: "Hizb 12 (Al-Ma'idah 1)", nameAr: "الحزب ١٢ (المائدة ١)", nameWo: "Hizb 12 (Al-Ma'idah 1)", firstWords: "۞ وَٱتْلُ عَلَيْهِمْ" },
  { id: 13, nameFr: "Hizb 13 (Al-Ma'idah 82)", nameAr: "الحزب ١٣ (المائدة ٨٢)", nameWo: "Hizb 13 (Al-Ma'idah 82)", firstWords: "۞ لَتَجِدَنَّ أَشَدَّ" },
  { id: 14, nameFr: "Hizb 14 (Al-An'am 36)", nameAr: "الحزب ١٤ (الأنعام ٣٦)", nameWo: "Hizb 14 (Al-An'am 36)", firstWords: "۞ إِنَّمَا يَسْتَجِيبُ" },
  { id: 15, nameFr: "Hizb 15 (Al-An'am 111)", nameAr: "الحزب ١٥ (الأنعام ١١١)", nameWo: "Hizb 15 (Al-An'am 111)", firstWords: "۞ وَلَوْ أَنَّنَا" },
  { id: 16, nameFr: "Hizb 16 (Al-A'raf 1)", nameAr: "الحزب ١٦ (الأعراف ١)", nameWo: "Hizb 16 (Al-A'raf 1)", firstWords: "الٓمٓصٓ" },
  { id: 17, nameFr: "Hizb 17 (Al-A'raf 88)", nameAr: "الحزب ١٧ (الأعراف ٨٨)", nameWo: "Hizb 17 (Al-A'raf 88)", firstWords: "۞ قَالَ ٱلْمَلَأُ" },
  { id: 18, nameFr: "Hizb 18 (Al-A'raf 171)", nameAr: "الحزب ١٨ (الأعراف ١٧١)", nameWo: "Hizb 18 (Al-A'raf 171)", firstWords: "۞ وَإِذْ نَتَقْنَا" },
  { id: 19, nameFr: "Hizb 19 (Al-Anfal 41)", nameAr: "الحزب ١٩ (الأنفال ٤١)", nameWo: "Hizb 19 (Al-Anfal 41)", firstWords: "۞ وَٱعْلَمُوٓا۟ أَنَّمَا" },
  { id: 20, nameFr: "Hizb 20 (At-Tawbah 34)", nameAr: "الحزب ٢٠ (التوبة ٣٤)", nameWo: "Hizb 20 (At-Tawbah 34)", firstWords: "۞ يَٰٓأَيُّهَا ٱلَّذِينَ" },
  { id: 21, nameFr: "Hizb 21 (At-Tawbah 93)", nameAr: "الحزب ٢١ (التوبة ٩٣)", nameWo: "Hizb 21 (At-Tawbah 93)", firstWords: "۞ إِنَّمَا ٱلسَّبِيلُ" },
  { id: 22, nameFr: "Hizb 22 (Yunus 26)", nameAr: "الحزب ٢٢ (يونس ٢٦)", nameWo: "Hizb 22 (Yunus 26)", firstWords: "۞ لِّلَّذِينَ أَحْسَنُوا۟" },
  { id: 23, nameFr: "Hizb 23 (Hud 6)", nameAr: "الحزب ٢٣ (هود ٦)", nameWo: "Hizb 23 (Hud 6)", firstWords: "۞ وَمَا مِن" },
  { id: 24, nameFr: "Hizb 24 (Hud 84)", nameAr: "الحزب ٢٤ (هود ٨٤)", nameWo: "Hizb 24 (Hud 84)", firstWords: "۞ وَإِلَىٰ مَدْيَنَ" },
  { id: 25, nameFr: "Hizb 25 (Yusuf 53)", nameAr: "الحزب ٢٥ (يوسف ٥٣)", nameWo: "Hizb 25 (Yusuf 53)", firstWords: "۞ وَمَآ أُبَرِّئُ" },
  { id: 26, nameFr: "Hizb 26 (Ar-Ra'd 19)", nameAr: "الحزب ٢٦ (الرعد ١٩)", nameWo: "Hizb 26 (Ar-Ra'd 19)", firstWords: "۞ أَفَمَن يَعْلَمُ" },
  { id: 27, nameFr: "Hizb 27 (Ibrahim 1)", nameAr: "الحزب ٢٧ (إبراهيم ١)", nameWo: "Hizb 27 (Ibrahim 1)", firstWords: "الٓر ۚ تِلْكَ" },
  { id: 28, nameFr: "Hizb 28 (An-Nahl 75)", nameAr: "الحزب ٢٨ (النحل ٧٥)", nameWo: "Hizb 28 (An-Nahl 75)", firstWords: "۞ وَقَالَ ٱللَّهُ" },
  { id: 29, nameFr: "Hizb 29 (Al-Isra 1)", nameAr: "الحزب ٢٩ (الإسراء ١)", nameWo: "Hizb 29 (Al-Isra 1)", firstWords: "سُبْحَٰنَ ٱلَّذِىٓ أَسْرَىٰ" },
  { id: 30, nameFr: "Hizb 30 (Al-Isra 99)", nameAr: "الحزب ٣٠ (الإسراء ٩٩)", nameWo: "Hizb 30 (Al-Isra 99)", firstWords: "۞ أَوَلَمْ يَرَوْا۟" },
  { id: 31, nameFr: "Hizb 31 (Al-Kahf 75)", nameAr: "الحزب ٣١ (الكهف ٧٥)", nameWo: "Hizb 31 (Al-Kahf 75)", firstWords: "۞ قَالَ أَلَمْ" },
  { id: 32, nameFr: "Hizb 32 (Maryam 59)", nameAr: "الحزب ٣٢ (مريم ٥٩)", nameWo: "Hizb 32 (Maryam 59)", firstWords: "طه" },
  { id: 33, nameFr: "Hizb 33 (Al-Anbiya 1)", nameAr: "الحزب ٣٣ (الأنبياء ١)", nameWo: "Hizb 33 (Al-Anbiya 1)", firstWords: "ٱقْتَرَبَ لِلنَّاسِ حِسَابُهُمْ" },
  { id: 34, nameFr: "Hizb 34 (Al-Mu'minun 1)", nameAr: "الحزب ٣٤ (المؤمنون ١)", nameWo: "Hizb 34 (Al-Mu'minun 1)", firstWords: "يَٰٓأَيُّهَا ٱلنَّاسُ ٱتَّقُوا۟" },
  { id: 35, nameFr: "Hizb 35 (An-Nur 21)", nameAr: "الحزب ٣٥ (النور ٢١)", nameWo: "Hizb 35 (An-Nur 21)", firstWords: "قَدْ أَفْلَحَ ٱلْمُؤْمِنُونَ" },
  { id: 36, nameFr: "Hizb 36 (Al-Furqan 21)", nameAr: "الحزب ٣٦ (الفرقان ٢١)", nameWo: "Hizb 36 (Al-Furqan 21)", firstWords: "۞ يَٰٓأَيُّهَا ٱلَّذِينَ" },
  { id: 37, nameFr: "Hizb 37 (Ash-Shu'ara 1)", nameAr: "الحزب ٣٧ (الشعراء ١)", nameWo: "Hizb 37 (Ash-Shu'ara 1)", firstWords: "۞ وَقَالَ ٱلَّذِينَ" },
  { id: 38, nameFr: "Hizb 38 (An-Naml 56)", nameAr: "الحزب ٣٨ (النمل ٥٦)", nameWo: "Hizb 38 (An-Naml 56)", firstWords: "۞ قَالُوٓا۟ أَنُؤْمِنُ" },
  { id: 39, nameFr: "Hizb 39 (Al-Qasas 51)", nameAr: "الحزب ٣٩ (القصص ٥١)", nameWo: "Hizb 39 (Al-Qasas 51)", firstWords: "۞ فَمَا كَانَ" },
  { id: 40, nameFr: "Hizb 40 (Al-Ankabut 46)", nameAr: "الحزب ٤٠ (العنكبوت ٤٦)", nameWo: "Hizb 40 (Al-Ankabut 46)", firstWords: "۞ وَلَقَدْ وَصَّلْنَا" },
  { id: 41, nameFr: "Hizb 41 (Luqman 22)", nameAr: "الحزب ٤١ (لقمان ٢٢)", nameWo: "Hizb 41 (Luqman 22)", firstWords: "۞ وَلَا تُجَٰدِلُوٓا۟" },
  { id: 42, nameFr: "Hizb 42 (Al-Ahzab 31)", nameAr: "الحزب ٤٢ (الأحزاب ٣١)", nameWo: "Hizb 42 (Al-Ahzab 31)", firstWords: "۞ وَمَن يُسْلِمْ" },
  { id: 43, nameFr: "Hizb 43 (Saba 24)", nameAr: "الحزب ٤٣ (سبأ ٢٤)", nameWo: "Hizb 43 (Saba 24)", firstWords: "۞ وَمَن يَقْنُتْ" },
  { id: 44, nameFr: "Hizb 44 (Ya-Sin 28)", nameAr: "الحزب ٤٤ (يس ٢٨)", nameWo: "Hizb 44 (Ya-Sin 28)", firstWords: "۞ قُلْ مَن" },
  { id: 45, nameFr: "Hizb 45 (As-Saffat 145)", nameAr: "الحزب ٤٥ (الصافات ١٤٥)", nameWo: "Hizb 45 (As-Saffat 145)", firstWords: "۞ وَمَآ أَنزَلْنَا" },
  { id: 46, nameFr: "Hizb 46 (Sad 21)", nameAr: "الحزب ٤٦ (ص ٢١)", nameWo: "Hizb 46 (Sad 21)", firstWords: "۞ فَنَبَذْنَٰهُ بِٱلْعَرَآءِ" },
  { id: 47, nameFr: "Hizb 47 (Az-Zumar 32)", nameAr: "الحزب ٤٧ (الزمر ٣٢)", nameWo: "Hizb 47 (Az-Zumar 32)", firstWords: "۞ فَمَنْ أَظْلَمُ" },
  { id: 48, nameFr: "Hizb 48 (Ghafir 40)", nameAr: "الحزب ٤٨ (غافر ٤٠)", nameWo: "Hizb 48 (Ghafir 40)", firstWords: "۞ وَيَٰقَوْمِ مَا" },
  { id: 49, nameFr: "Hizb 49 (Fussilat 47)", nameAr: "الحزب ٤٩ (فصلت ٤٧)", nameWo: "Hizb 49 (Fussilat 47)", firstWords: "۞ إِلَيْهِ يُرَدُّ" },
  { id: 50, nameFr: "Hizb 50 (Ash-Shura 27)", nameAr: "الحزب ٥٠ (الشورى ٢٧)", nameWo: "Hizb 50 (Ash-Shura 27)", firstWords: "۞ قَٰلَ أَوَلَوْ" },
  { id: 51, nameFr: "Hizb 51 (Al-Ahqaf 1)", nameAr: "الحزب ٥١ (الأحقاف ١)", nameWo: "Hizb 51 (Al-Ahqaf 1)", firstWords: "حمٓ" },
  { id: 52, nameFr: "Hizb 52 (Adh-Dhariyat 31)", nameAr: "الحزب ٥٢ (الذاريات ٣١)", nameWo: "Hizb 52 (Adh-Dhariyat 31)", firstWords: "۞ لَّقَدْ رَضِىَ" },
  { id: 53, nameFr: "Hizb 53 (An-Najm 1)", nameAr: "الحزب ٥٣ (النجم ١)", nameWo: "Hizb 53 (An-Najm 1)", firstWords: "۞ قَالَ فَمَا" },
  { id: 54, nameFr: "Hizb 54 (Al-Hadid 1)", nameAr: "الحزب ٥٤ (الحديد ١)", nameWo: "Hizb 54 (Al-Hadid 1)", firstWords: "ٱلرَّحْمَٰنُ" },
  { id: 55, nameFr: "Hizb 55 (Al-Mujadilah 1 - Qad sami'a)", nameAr: "الحزب ٥٥ (المجادلة ١ - قد سمع)", nameWo: "Hizb 55 (Al-Mujadilah 1 - Qad sami'a)", firstWords: "قَدْ سَمِعَ ٱللَّهُ" },
  { id: 56, nameFr: "Hizb 56 (Al-Jumu'ah 1)", nameAr: "الحزب ٥٦ (الجمعة ١)", nameWo: "Hizb 56 (Al-Jumu'ah 1)", firstWords: "يُسَبِّحُ لِلَّهِ مَا" },
  { id: 57, nameFr: "Hizb 57 (Al-Mulk 1 - Tabaraka)", nameAr: "الحزب ٥٧ (الملك ١ - تبارك)", nameWo: "Hizb 57 (Al-Mulk 1 - Tabaraka)", firstWords: "تَبَٰرَكَ ٱلَّذِى بِيَدِهِ" },
  { id: 58, nameFr: "Hizb 58 (Al-Insan 1)", nameAr: "الحزب ٥٨ (الإنسان ١)", nameWo: "Hizb 58 (Al-Insan 1)", firstWords: "قُلْ أُوحِىَ إِلَىَّ" },
  { id: 59, nameFr: "Hizb 59 (An-Naba 1 - Amma)", nameAr: "الحزب ٥٩ (النبأ ١ - عم)", nameWo: "Hizb 59 (An-Naba 1 - Amma)", firstWords: "عَمَّ يَتَسَآءَلُونَ" },
  { id: 60, nameFr: "Hizb 60 (Al-A'la 1 - Sabbihi)", nameAr: "الحزب ٦٠ (الأعلى ١ - سبح)", nameWo: "Hizb 60 (Al-A'la 1 - Sabbihi)", firstWords: "سَبِّحِ ٱسْمَ رَبِّكَ" }
];

export const getHizbName = (value: number, lang: string, notStartedLabel: string): string => {
  if (value === 0) return notStartedLabel;
  const hizb = HIZB_LIST.find(h => h.id === value);
  if (!hizb) return `${value} Hizb`;
  
  const suffix = hizb.firstWords ? ` (${hizb.firstWords})` : '';
  if (lang === 'ar') return `${hizb.nameAr}${suffix}`;
  if (lang === 'wo') return `${hizb.nameWo}${suffix}`;
  return `${hizb.nameFr}${suffix}`;
};
