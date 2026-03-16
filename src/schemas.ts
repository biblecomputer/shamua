import { Schema } from "effect";

export const ChapterVerseSchema = Schema.Struct({
  chapter: Schema.Number,
  verse: Schema.OptionFromNullOr(Schema.Number),
});

export type ChapterVerse = typeof ChapterVerseSchema.Type;

export const BibleReferenceSchema = Schema.Struct({
  originalText: Schema.String,
  bookName: Schema.String,
  urlCode: Schema.String,
  start: ChapterVerseSchema,
  end: Schema.OptionFromNullOr(ChapterVerseSchema),
});

export type BibleReference = typeof BibleReferenceSchema.Type;

export const ParsedVerseListSchema = Schema.Struct({
  originalText: Schema.String,
  bookName: Schema.String,
  urlCode: Schema.String,
  chapter: Schema.Number,
  verses: Schema.Array(Schema.Number),
});

export type ParsedVerseList = typeof ParsedVerseListSchema.Type;

export const ParseResultSchema = Schema.Union(
  Schema.Struct({
    _tag: Schema.Literal("Reference"),
    value: BibleReferenceSchema,
  }),
  Schema.Struct({
    _tag: Schema.Literal("VerseList"),
    value: ParsedVerseListSchema,
  })
);

export type ParseResult = typeof ParseResultSchema.Type;

export const CliOptionsSchema = Schema.Struct({
  input: Schema.String,
  output: Schema.String,
  language: Schema.String,
});

export type CliOptions = typeof CliOptionsSchema.Type;
