import { Effect, Option, pipe } from "effect";
import type { BibleBook, SupportedLanguage } from "./books.js";
import { booksByLanguage } from "./books.js";
import type { BibleReference, ChapterVerse, ParseResult, ParsedVerseList } from "./schemas.js";

const escapeRegExp = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildBookPattern = (books: ReadonlyArray<BibleBook>): string => {
  const allNames = books.flatMap((book) => [book.name, ...book.abbreviations]);
  const sortedNames = [...allNames].sort((a, b) => b.length - a.length);
  return sortedNames.map(escapeRegExp).join("|");
};

const createReferencePattern = (bookPattern: string): RegExp => {
  // Match patterns like:
  // "Book Chapter" (Genesis 1)
  // "Book Chapter:Verse" (Genesis 1:1)
  // "Book. Chapter:Verse" (Rom. 14:8) - Dutch style with period after abbreviation
  // "Book Chapter-Chapter" (Psalm 23-24)
  // "Book Chapter-Chapter:Verse" (Psalm 23-24:2)
  // "Book Chapter:Verse-Chapter:Verse" (Psalm 23:4-24:2)
  // "Book Chapter:Verse-Verse" (Psalm 23:1-5)
  // "BookChapter:Verse" (Ps23:1) - no space
  // "BookChapter:Verse,Verse,Verse" (Ps23:1,2,6) - comma separated verses
  // Note: \.? allows optional period after book name (Dutch abbreviations use periods)
  const pattern = `(${bookPattern})\\.?\\s*(\\d+)(?::(\\d+))?(?:(?:,\\d+)+|(?:[-–](\\d+)(?::(\\d+))?))?`;
  return new RegExp(pattern, "gi");
};

const createVerseListPattern = (bookPattern: string): RegExp => {
  // Match comma-separated verse patterns like "Ps23:1,2,6" or "Ps. 23:1,2,6"
  const pattern = `(${bookPattern})\\.?\\s*(\\d+):(\\d+)((?:,\\d+)+)`;
  return new RegExp(pattern, "gi");
};

const findBook = (
  name: string,
  books: ReadonlyArray<BibleBook>
): Option.Option<BibleBook> => {
  const normalizedName = name.toLowerCase();
  return Option.fromNullable(
    books.find(
      (book) =>
        book.name.toLowerCase() === normalizedName ||
        book.abbreviations.some((abbr) => abbr.toLowerCase() === normalizedName)
    )
  );
};

const parseChapterVerse = (
  chapter: string,
  verse: string | undefined
): ChapterVerse => ({
  chapter: parseInt(chapter, 10),
  verse: Option.fromNullable(verse ? parseInt(verse, 10) : null),
});

export const parseReference = (
  match: RegExpMatchArray,
  books: ReadonlyArray<BibleBook>
): Option.Option<BibleReference> => {
  const [fullMatch, bookName, chapter, verse, endChapterOrVerse, endVerse] = match;

  return pipe(
    findBook(bookName, books),
    Option.map((book): BibleReference => {
      const start = parseChapterVerse(chapter, verse);

      // Determine end reference
      let end: Option.Option<ChapterVerse> = Option.none();

      if (endChapterOrVerse !== undefined) {
        if (endVerse !== undefined) {
          // Pattern: Chapter:Verse-Chapter:Verse or Chapter-Chapter:Verse
          end = Option.some({
            chapter: parseInt(endChapterOrVerse, 10),
            verse: Option.some(parseInt(endVerse, 10)),
          });
        } else if (Option.isSome(start.verse)) {
          // Pattern: Chapter:Verse-Verse (same chapter, different verse)
          end = Option.some({
            chapter: start.chapter,
            verse: Option.some(parseInt(endChapterOrVerse, 10)),
          });
        } else {
          // Pattern: Chapter-Chapter
          end = Option.some({
            chapter: parseInt(endChapterOrVerse, 10),
            verse: Option.none(),
          });
        }
      }

      return {
        originalText: fullMatch,
        bookName: bookName,
        urlCode: book.urlCode,
        start,
        end,
      };
    })
  );
};

export const parseVerseList = (
  match: RegExpMatchArray,
  books: ReadonlyArray<BibleBook>
): Option.Option<ParsedVerseList> => {
  const [fullMatch, bookName, chapter, firstVerse, restVerses] = match;

  return pipe(
    findBook(bookName, books),
    Option.map((book): ParsedVerseList => {
      const verses = [
        parseInt(firstVerse, 10),
        ...restVerses.slice(1).split(",").map((v) => parseInt(v, 10)),
      ];

      return {
        originalText: fullMatch,
        bookName: bookName,
        urlCode: book.urlCode,
        chapter: parseInt(chapter, 10),
        verses,
      };
    })
  );
};

export const findAllReferences = (
  text: string,
  language: SupportedLanguage
): Effect.Effect<ReadonlyArray<ParseResult>, never, never> =>
  Effect.sync(() => {
    const books = booksByLanguage[language];
    const bookPattern = buildBookPattern(books);
    const verseListPattern = createVerseListPattern(bookPattern);
    const referencePattern = createReferencePattern(bookPattern);

    const results: ParseResult[] = [];
    const processedRanges: Array<{ start: number; end: number }> = [];

    // First, find verse lists (comma-separated)
    const verseListMatches = [...text.matchAll(verseListPattern)];
    for (const match of verseListMatches) {
      const parsed = parseVerseList(match, books);
      if (Option.isSome(parsed)) {
        results.push({ _tag: "VerseList", value: parsed.value });
        processedRanges.push({
          start: match.index!,
          end: match.index! + match[0].length,
        });
      }
    }

    // Then find regular references, but skip those already processed
    const referenceMatches = [...text.matchAll(referencePattern)];
    for (const match of referenceMatches) {
      const matchStart = match.index!;
      const matchEnd = matchStart + match[0].length;

      // Skip if this match overlaps with an already processed range
      const overlaps = processedRanges.some(
        (range) => matchStart < range.end && matchEnd > range.start
      );

      if (!overlaps) {
        const parsed = parseReference(match, books);
        if (Option.isSome(parsed)) {
          results.push({ _tag: "Reference", value: parsed.value });
        }
      }
    }

    return results;
  });

export const getAllMatches = (
  text: string,
  language: SupportedLanguage
): Effect.Effect<
  ReadonlyArray<{ match: string; index: number; result: ParseResult }>,
  never,
  never
> =>
  Effect.sync(() => {
    const books = booksByLanguage[language];
    const bookPattern = buildBookPattern(books);
    const verseListPattern = createVerseListPattern(bookPattern);
    const referencePattern = createReferencePattern(bookPattern);

    const results: Array<{ match: string; index: number; result: ParseResult }> = [];
    const processedRanges: Array<{ start: number; end: number }> = [];

    // First, find verse lists
    const verseListMatches = [...text.matchAll(verseListPattern)];
    for (const match of verseListMatches) {
      const parsed = parseVerseList(match, books);
      if (Option.isSome(parsed)) {
        results.push({
          match: match[0],
          index: match.index!,
          result: { _tag: "VerseList", value: parsed.value },
        });
        processedRanges.push({
          start: match.index!,
          end: match.index! + match[0].length,
        });
      }
    }

    // Then find regular references
    const referenceMatches = [...text.matchAll(referencePattern)];
    for (const match of referenceMatches) {
      const matchStart = match.index!;
      const matchEnd = matchStart + match[0].length;

      const overlaps = processedRanges.some(
        (range) => matchStart < range.end && matchEnd > range.start
      );

      if (!overlaps) {
        const parsed = parseReference(match, books);
        if (Option.isSome(parsed)) {
          results.push({
            match: match[0],
            index: match.index!,
            result: { _tag: "Reference", value: parsed.value },
          });
        }
      }
    }

    // Sort by index
    return results.sort((a, b) => a.index - b.index);
  });
