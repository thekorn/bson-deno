# Caveats

- we dont check for the exception type in some of the tests as it is not supported, those tests include:
  - `bigint_test.ts`
  - `bson_corpus.prose.test.ts`
- `test/bson_compliance_test.ts` has one _skipped_ testcase, the timestamp init is not working correctly
