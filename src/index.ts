#!/usr/bin/env node

import { Effect, pipe, Console } from "effect";
import { Command, Options } from "@effect/cli";
import { NodeContext, NodeRuntime } from "@effect/platform-node";
import { FileSystem } from "@effect/platform";
import { transformFile } from "./transformer.js";
import type { SupportedLanguage } from "./books.js";

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
      if (language !== "english") {
        yield* Console.error(`Unsupported language: ${language}. Only 'english' is currently supported.`);
        return yield* Effect.fail(new Error(`Unsupported language: ${language}`));
      }

      const supportedLanguage: SupportedLanguage = language as SupportedLanguage;

      // Read input file
      yield* Console.log(`Reading input file: ${input}`);
      const content = yield* fs.readFileString(input);

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
