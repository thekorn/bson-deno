# Caveats

- we dont check for the exception type in some of the tests as it is not supported, those tests include:
  - `bigint_test.ts`
  - `bson_corpus.prose.test.ts`
- `bson_compliance_test.ts` has one _skipped_ testcase, the timestamp init is not working correctly
- `bson_types_construction_test.ts` has skipped testcase as constructing a function call is not an option
