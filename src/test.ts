import { Effect, Console, pipe } from "effect";
import { transformFile } from "./transformer.js";

const testCases = [
  {
    name: "Simple chapter:verse",
    input: "Psalm 23:1",
    expected: "[Psalm 23:1](/ps.23v1)",
  },
  {
    name: "Chapter range",
    input: "Psalm 23-24",
    expected: "[Psalm 23-24](/ps.23-24)",
  },
  {
    name: "Chapter range with end verse",
    input: "Psalm 23-24:2",
    expected: "[Psalm 23-24:2](/ps.23-24v2)",
  },
  {
    name: "Chapter:verse to chapter:verse",
    input: "Psalm 23:4-24:2",
    expected: "[Psalm 23:4-24:2](/ps.23v4-24v2)",
  },
  {
    name: "Abbreviated book",
    input: "Ps 23",
    expected: "[Ps 23](/ps.23)",
  },
  {
    name: "No space between book and chapter",
    input: "Ps23:1",
    expected: "[Ps23:1](/ps.23v1)",
  },
  {
    name: "Comma separated verses",
    input: "Ps23:1,2,6",
    expected: "[Ps23:1](/ps.23v1),[2](/ps.23v2),[6](/ps.23v6)",
  },
  {
    name: "Genesis",
    input: "Genesis 1",
    expected: "[Genesis 1](/gen.1)",
  },
  {
    name: "Gen abbreviated",
    input: "Gen 1",
    expected: "[Gen 1](/gen.1)",
  },
  {
    name: "Exodus",
    input: "Exodus 1",
    expected: "[Exodus 1](/exod.1)",
  },
  {
    name: "Exod abbreviated",
    input: "Exod 1",
    expected: "[Exod 1](/exod.1)",
  },
  {
    name: "Leviticus",
    input: "Leviticus 1",
    expected: "[Leviticus 1](/lev.1)",
  },
  {
    name: "Lev abbreviated",
    input: "Lev 1",
    expected: "[Lev 1](/lev.1)",
  },
  {
    name: "Numbers",
    input: "Numbers 1",
    expected: "[Numbers 1](/num.1)",
  },
  {
    name: "Num abbreviated",
    input: "Num 1",
    expected: "[Num 1](/num.1)",
  },
  {
    name: "Deuteronomy",
    input: "Deuteronomy 1",
    expected: "[Deuteronomy 1](/deut.1)",
  },
  {
    name: "Deu abbreviated",
    input: "Deu 1",
    expected: "[Deu 1](/deut.1)",
  },
];

const runTests = Effect.gen(function* () {
  yield* Console.log("Running tests...\n");

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    const result = yield* transformFile(testCase.input, "english");

    if (result === testCase.expected) {
      yield* Console.log(`✓ ${testCase.name}`);
      passed++;
    } else {
      yield* Console.log(`✗ ${testCase.name}`);
      yield* Console.log(`  Input:    "${testCase.input}"`);
      yield* Console.log(`  Expected: "${testCase.expected}"`);
      yield* Console.log(`  Got:      "${result}"`);
      failed++;
    }
  }

  yield* Console.log(`\n${passed} passed, ${failed} failed`);

  if (failed > 0) {
    return yield* Effect.fail(new Error(`${failed} tests failed`));
  }
});

Effect.runPromise(runTests).catch((e) => {
  console.error(e);
  process.exit(1);
});
