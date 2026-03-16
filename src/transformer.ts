import { Effect, Option, pipe } from "effect";
import type { BibleReference, ChapterVerse, ParseResult, ParsedVerseList } from "./schemas.js";
import type { SupportedLanguage } from "./books.js";
import { getAllMatches } from "./parser.js";

const formatChapterVerse = (cv: ChapterVerse): string =>
  pipe(
    cv.verse,
    Option.match({
      onNone: () => `${cv.chapter}`,
      onSome: (v) => `${cv.chapter}v${v}`,
    })
  );

const buildUrl = (ref: BibleReference): string => {
  const startPart = formatChapterVerse(ref.start);

  return pipe(
    ref.end,
    Option.match({
      onNone: () => `/${ref.urlCode}.${startPart}`,
      onSome: (end) => {
        const endPart = formatChapterVerse(end);
        return `/${ref.urlCode}.${startPart}-${endPart}`;
      },
    })
  );
};

const referenceToMarkdown = (ref: BibleReference): string => {
  const url = buildUrl(ref);
  return `[${ref.originalText}](${url})`;
};

const verseListToMarkdown = (vl: ParsedVerseList): string => {
  const bookWithChapter = vl.originalText.split(":")[0];
  const firstVerse = vl.verses[0];
  const restVerses = vl.verses.slice(1);

  // First link includes book and chapter with first verse
  const firstLink = `[${bookWithChapter}:${firstVerse}](/${vl.urlCode}.${vl.chapter}v${firstVerse})`;

  // Rest are just verse numbers
  const restLinks = restVerses.map(
    (v) => `[${v}](/${vl.urlCode}.${vl.chapter}v${v})`
  );

  return [firstLink, ...restLinks].join(",");
};

const parseResultToMarkdown = (result: ParseResult): string => {
  switch (result._tag) {
    case "Reference":
      return referenceToMarkdown(result.value);
    case "VerseList":
      return verseListToMarkdown(result.value);
  }
};

export const transformText = (
  text: string,
  language: SupportedLanguage
): Effect.Effect<string, never, never> =>
  pipe(
    getAllMatches(text, language),
    Effect.map((matches) => {
      if (matches.length === 0) {
        return text;
      }

      let result = "";
      let lastIndex = 0;

      for (const { match, index, result: parseResult } of matches) {
        // Add text before this match
        result += text.slice(lastIndex, index);
        // Add the transformed reference
        result += parseResultToMarkdown(parseResult);
        lastIndex = index + match.length;
      }

      // Add any remaining text
      result += text.slice(lastIndex);

      return result;
    })
  );

export const transformFile = (
  content: string,
  language: SupportedLanguage
): Effect.Effect<string, never, never> =>
  pipe(
    Effect.succeed(content.split("\n")),
    Effect.flatMap((lines) =>
      Effect.all(lines.map((line) => transformText(line, language)))
    ),
    Effect.map((transformedLines) => transformedLines.join("\n"))
  );
