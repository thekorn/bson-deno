# Caveats

- we dont check for the exception type in some of the tests as it is not
  supported, those tests include:
  - `bigint_test.ts`
  - `bson_corpus.prose.test.ts`
- `bson_compliance_test.ts` has one _skipped_ testcase, the timestamp init is
  not working correctly
- `bson_types_construction_test.ts` has skipped testcase as constructing a
  function call is not an option
- lots of skipped tests in `decimal128_test.ts`

## missing test suites

See `./missingTestsSuites.json` for a list of all missing test suites- those
tests still needs to be ported.
