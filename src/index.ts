#!/usr/bin/env node

import { Effect, pipe, Console } from "effect";
import { Command, Options } from "@effect/cli";
import { NodeContext, NodeRuntime } from "@effect/platform-node";
import { FileSystem } from "@effect/platform";
import { transformFile } from "./transformer.js";
import type { SupportedLanguage } from "./books.js";
import { PDFParse } from "pdf-parse";

const isPdfFile = (path: string): boolean => path.toLowerCase().endsWith(".pdf");

const formatPdfTextAsMarkdown = (text: string): string => {
  let result = text;

  // Remove page markers like "-- 1 of 22 --"
  result = result.replace(/^--\s*\d+\s+of\s+\d+\s*--$/gm, "");

  // Main title: CATECHISMUS at the start
  result = result.replace(/^(CATECHISMUS)\s*$/m, "# $1\n");

  // Zondag sections become ## headings
  result = result.replace(/^(Zondag\s+\d+)\s*$/gm, "\n## $1\n");

  // Section titles (ALL CAPS lines that are section headers)
  const sectionTitles = [
    "HET EERSTE DEEL",
    "HET TWEEDE DEEL",
    "HET DERDE DEEL",
    "VAN DES MENSEN ELLENDE",
    "VAN DES MENSEN VERLOSSING",
    "VAN DE DANKBAARHEID, DIE MEN GODE VOOR DE VERLOSSING SCHULDIG IS",
    "VAN GOD DEN VADER EN ONZE SCHEPPING",
    "VAN GOD DEN ZOON EN ONZE VERLOSSING",
    "VAN GOD DEN HEILIGEN GEEST EN ONZE HEILIGMAKING",
    "VAN DE SACRAMENTEN",
    "VAN DEN HEILIGEN DOOP",
    "VAN HET HEILIG AVONDMAAL ONZES HEEREN",
    "VAN DE WET",
    "VAN HET GEBED",
  ];

  for (const title of sectionTitles) {
    const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(new RegExp(`^(${escaped})\\s*$`, "gm"), "\n### $1\n");
  }

  // Question numbers: standalone numbers at start of line followed by question text
  // Handle both single-line and multi-line questions (ending with ?)
  result = result.replace(/^(\d+)\s*\n([\s\S]*?\?)\s*$/gm, (_match, num, question) => {
    // Clean up the question text (remove extra newlines, normalize spaces)
    const cleanQuestion = question.replace(/\s+/g, " ").trim();
    return `\n#### Vraag ${num}: ${cleanQuestion}\n`;
  });

  // Clean up multiple blank lines
  result = result.replace(/\n{3,}/g, "\n\n");

  return result.trim();
};

const convertPdfToMarkdown = (pdfBuffer: Uint8Array): Effect.Effect<string, Error, never> =>
  Effect.tryPromise({
    try: async () => {
      const pdf = new PDFParse({ data: pdfBuffer });
      const textResult = await pdf.getText();
      return formatPdfTextAsMarkdown(textResult.text);
    },
    catch: (error) => new Error(`Failed to parse PDF: ${error}`),
  });

const inputOption = Options.file("input").pipe(
  Options.withAlias("i"),
  Options.withDescription("Input markdown file path")
);

const outputOption = Options.file("output").pipe(
  Options.withAlias("o"),
  Options.withDescription("Output markdown file path")
);

const languageOption = Options.text("language").pipe(
  Options.withAlias("l"),
  Options.withDefault("english"),
  Options.withDescription("Language for Bible book names (default: english)")
);

const shamua = Command.make(
  "shamua",
  { input: inputOption, output: outputOption, language: languageOption },
  ({ input, output, language }) =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;

      // Validate language
      if (language !== "english" && language !== "dutch") {
        yield* Console.error(`Unsupported language: ${language}. Supported: 'english', 'dutch'.`);
        return yield* Effect.fail(new Error(`Unsupported language: ${language}`));
      }

      const supportedLanguage: SupportedLanguage = language as SupportedLanguage;

      // Read input file
      yield* Console.log(`Reading input file: ${input}`);

      let content: string;
      if (isPdfFile(input)) {
        yield* Console.log("Detected PDF file, converting to text...");
        const pdfBuffer = yield* fs.readFile(input);
        content = yield* convertPdfToMarkdown(pdfBuffer);
      } else {
        content = yield* fs.readFileString(input);
      }

      // Transform content
      yield* Console.log("Processing Bible references...");
      const transformed = yield* transformFile(content, supportedLanguage);

      // Write output file
      yield* Console.log(`Writing output file: ${output}`);
      yield* fs.writeFileString(output, transformed);

      yield* Console.log("Done!");
    })
);

const cli = Command.run(shamua, {
  name: "shamua",
  version: "0.1.0",
});

pipe(
  cli(process.argv),
  Effect.provide(NodeContext.layer),
  NodeRuntime.runMain
);
