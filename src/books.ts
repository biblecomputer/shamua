import { Schema } from "effect";

export const BibleBookSchema = Schema.Struct({
  name: Schema.String,
  abbreviations: Schema.Array(Schema.String),
  urlCode: Schema.String,
});

export type BibleBook = typeof BibleBookSchema.Type;

export const englishBooks: ReadonlyArray<BibleBook> = [
  // Old Testament
  { name: "Genesis", abbreviations: ["Gen", "Ge", "Gn"], urlCode: "gen" },
  { name: "Exodus", abbreviations: ["Exod", "Exo", "Ex"], urlCode: "exod" },
  { name: "Leviticus", abbreviations: ["Lev", "Le", "Lv"], urlCode: "lev" },
  { name: "Numbers", abbreviations: ["Num", "Nu", "Nm", "Nb"], urlCode: "num" },
  { name: "Deuteronomy", abbreviations: ["Deut", "Deu", "De", "Dt"], urlCode: "deut" },
  { name: "Joshua", abbreviations: ["Josh", "Jos", "Jsh"], urlCode: "josh" },
  { name: "Judges", abbreviations: ["Judg", "Jdg", "Jg", "Jdgs"], urlCode: "judg" },
  { name: "Ruth", abbreviations: ["Ruth", "Rth", "Ru"], urlCode: "ruth" },
  { name: "1 Samuel", abbreviations: ["1 Sam", "1Sam", "1 Sa", "1Sa", "I Sam", "I Sa"], urlCode: "1sam" },
  { name: "2 Samuel", abbreviations: ["2 Sam", "2Sam", "2 Sa", "2Sa", "II Sam", "II Sa"], urlCode: "2sam" },
  { name: "1 Kings", abbreviations: ["1 Kgs", "1Kgs", "1 Ki", "1Ki", "I Kgs", "I Ki"], urlCode: "1kgs" },
  { name: "2 Kings", abbreviations: ["2 Kgs", "2Kgs", "2 Ki", "2Ki", "II Kgs", "II Ki"], urlCode: "2kgs" },
  { name: "1 Chronicles", abbreviations: ["1 Chr", "1Chr", "1 Ch", "1Ch", "I Chr", "I Ch"], urlCode: "1chr" },
  { name: "2 Chronicles", abbreviations: ["2 Chr", "2Chr", "2 Ch", "2Ch", "II Chr", "II Ch"], urlCode: "2chr" },
  { name: "Ezra", abbreviations: ["Ezra", "Ezr"], urlCode: "ezra" },
  { name: "Nehemiah", abbreviations: ["Neh", "Ne"], urlCode: "neh" },
  { name: "Esther", abbreviations: ["Esth", "Est", "Es"], urlCode: "esth" },
  { name: "Job", abbreviations: ["Job", "Jb"], urlCode: "job" },
  { name: "Psalm", abbreviations: ["Ps", "Psa", "Pslm", "Psm", "Pss"], urlCode: "ps" },
  { name: "Psalms", abbreviations: ["Pss"], urlCode: "ps" },
  { name: "Proverbs", abbreviations: ["Prov", "Pro", "Prv", "Pr"], urlCode: "prov" },
  { name: "Ecclesiastes", abbreviations: ["Eccl", "Ecc", "Ec", "Qoh"], urlCode: "eccl" },
  { name: "Song of Solomon", abbreviations: ["Song", "Song of Songs", "SoS", "Sg", "Cant"], urlCode: "song" },
  { name: "Isaiah", abbreviations: ["Isa", "Is"], urlCode: "isa" },
  { name: "Jeremiah", abbreviations: ["Jer", "Je", "Jr"], urlCode: "jer" },
  { name: "Lamentations", abbreviations: ["Lam", "La"], urlCode: "lam" },
  { name: "Ezekiel", abbreviations: ["Ezek", "Eze", "Ezk"], urlCode: "ezek" },
  { name: "Daniel", abbreviations: ["Dan", "Da", "Dn"], urlCode: "dan" },
  { name: "Hosea", abbreviations: ["Hos", "Ho"], urlCode: "hos" },
  { name: "Joel", abbreviations: ["Joel", "Jl"], urlCode: "joel" },
  { name: "Amos", abbreviations: ["Amos", "Am"], urlCode: "amos" },
  { name: "Obadiah", abbreviations: ["Obad", "Ob"], urlCode: "obad" },
  { name: "Jonah", abbreviations: ["Jonah", "Jon", "Jnh"], urlCode: "jonah" },
  { name: "Micah", abbreviations: ["Mic", "Mc"], urlCode: "mic" },
  { name: "Nahum", abbreviations: ["Nah", "Na"], urlCode: "nah" },
  { name: "Habakkuk", abbreviations: ["Hab", "Hb"], urlCode: "hab" },
  { name: "Zephaniah", abbreviations: ["Zeph", "Zep", "Zp"], urlCode: "zeph" },
  { name: "Haggai", abbreviations: ["Hag", "Hg"], urlCode: "hag" },
  { name: "Zechariah", abbreviations: ["Zech", "Zec", "Zc"], urlCode: "zech" },
  { name: "Malachi", abbreviations: ["Mal", "Ml"], urlCode: "mal" },
  // New Testament
  { name: "Matthew", abbreviations: ["Matt", "Mt"], urlCode: "matt" },
  { name: "Mark", abbreviations: ["Mark", "Mrk", "Mk"], urlCode: "mark" },
  { name: "Luke", abbreviations: ["Luke", "Luk", "Lk"], urlCode: "luke" },
  { name: "John", abbreviations: ["John", "Jhn", "Jn"], urlCode: "john" },
  { name: "Acts", abbreviations: ["Acts", "Act", "Ac"], urlCode: "acts" },
  { name: "Romans", abbreviations: ["Rom", "Ro", "Rm"], urlCode: "rom" },
  { name: "1 Corinthians", abbreviations: ["1 Cor", "1Cor", "1 Co", "1Co", "I Cor", "I Co"], urlCode: "1cor" },
  { name: "2 Corinthians", abbreviations: ["2 Cor", "2Cor", "2 Co", "2Co", "II Cor", "II Co"], urlCode: "2cor" },
  { name: "Galatians", abbreviations: ["Gal", "Ga"], urlCode: "gal" },
  { name: "Ephesians", abbreviations: ["Eph", "Ephes"], urlCode: "eph" },
  { name: "Philippians", abbreviations: ["Phil", "Php", "Pp"], urlCode: "phil" },
  { name: "Colossians", abbreviations: ["Col", "Co"], urlCode: "col" },
  { name: "1 Thessalonians", abbreviations: ["1 Thess", "1Thess", "1 Th", "1Th", "I Thess", "I Th"], urlCode: "1thess" },
  { name: "2 Thessalonians", abbreviations: ["2 Thess", "2Thess", "2 Th", "2Th", "II Thess", "II Th"], urlCode: "2thess" },
  { name: "1 Timothy", abbreviations: ["1 Tim", "1Tim", "1 Ti", "1Ti", "I Tim", "I Ti"], urlCode: "1tim" },
  { name: "2 Timothy", abbreviations: ["2 Tim", "2Tim", "2 Ti", "2Ti", "II Tim", "II Ti"], urlCode: "2tim" },
  { name: "Titus", abbreviations: ["Titus", "Tit", "Ti"], urlCode: "titus" },
  { name: "Philemon", abbreviations: ["Phlm", "Phm", "Pm"], urlCode: "phlm" },
  { name: "Hebrews", abbreviations: ["Heb", "He"], urlCode: "heb" },
  { name: "James", abbreviations: ["Jas", "Jm"], urlCode: "jas" },
  { name: "1 Peter", abbreviations: ["1 Pet", "1Pet", "1 Pe", "1Pe", "I Pet", "I Pe"], urlCode: "1pet" },
  { name: "2 Peter", abbreviations: ["2 Pet", "2Pet", "2 Pe", "2Pe", "II Pet", "II Pe"], urlCode: "2pet" },
  { name: "1 John", abbreviations: ["1 John", "1John", "1 Jn", "1Jn", "I John", "I Jn"], urlCode: "1john" },
  { name: "2 John", abbreviations: ["2 John", "2John", "2 Jn", "2Jn", "II John", "II Jn"], urlCode: "2john" },
  { name: "3 John", abbreviations: ["3 John", "3John", "3 Jn", "3Jn", "III John", "III Jn"], urlCode: "3john" },
  { name: "Jude", abbreviations: ["Jude", "Jud", "Jd"], urlCode: "jude" },
  { name: "Revelation", abbreviations: ["Rev", "Re", "Rv"], urlCode: "rev" },
];

export const booksByLanguage = {
  english: englishBooks,
} as const;

export type SupportedLanguage = keyof typeof booksByLanguage;

export const SupportedLanguageSchema = Schema.Literal("english");
