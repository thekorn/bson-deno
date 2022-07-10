# Caveats

- we dont check for the exception type in `bigint_test.ts` as its not supported. we just check if an error is thrown
- `test/bson_compliance_test.ts` has one _skipped_ testcase, the timestamp init is not working correctly
