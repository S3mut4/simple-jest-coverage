# Stryker

Run on the **full suite** (25 test cases, 31 executions), before the reduction.

```
Ran 12.89 tests per mutant on average.
--------------|------------------|----------|-----------|------------|----------|----------|
              | % Mutation score |          |           |            |          |          |
File          |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
--------------|--------|---------|----------|-----------|------------|----------|----------|
All files     |  96.59 |   96.59 |       85 |         0 |          3 |        0 |        0 |
 bank         |  90.00 |   90.00 |        9 |         0 |          1 |        0 |        0 |
  bank.ts     |  90.00 |   90.00 |        9 |         0 |          1 |        0 |        0 |
 payment      |  97.44 |   97.44 |       76 |         0 |          2 |        0 |        0 |
  payment.ts  |  97.50 |   97.50 |       39 |         0 |          1 |        0 |        0 |
  payment2.ts |  97.37 |   97.37 |       37 |         0 |          1 |        0 |        0 |
--------------|--------|---------|----------|-----------|------------|----------|----------|
```

> **Kills (unique)**: mutants each test kills, measured on the full suite. "Unique" means no other test in the full suite kills that mutant. After the reduction, TC-005 and TC-019 become the only killers of the `isFinite` removal in their method, because their duplicates were removed.

## constructor

### Boundary

| ID     | Description                       | Precondition | Input            | Expected Result                        | Kills (unique) | Decision                                                          |
| ------ | --------------------------------- | ------------ | ---------------- | -------------------------------------- | -------------- | ----------------------------------------------------------------- |
| TC-001 | Amount just below the lower limit | —            | `amount = -0.01` | Throws `Amount must be greater than 0` | 6 (—)          | ❌ Remove. TC-002 kills the same mutants plus `<=` → `<`           |
| TC-002 | Amount on the lower limit (0)     | —            | `amount = 0`     | Throws `Amount must be greater than 0` | 7 (`<=` → `<`) | ✅ Keep                                                            |
| TC-003 | Amount just above the lower limit | —            | `amount = 0.01`  | Instance created, `getAmount()` = 0.01 | 5 (—)          | ✅ Keep. Valid-side boundary; replaces TC-004 as the positive case |

### Positive

| ID     | Description             | Precondition | Input          | Expected Result                       | Kills (unique) | Decision                                             |
| ------ | ----------------------- | ------------ | -------------- | ------------------------------------- | -------------- | ---------------------------------------------------- |
| TC-004 | Nominal positive amount | —            | `amount = 100` | Instance created, `getAmount()` = 100 | 5 (—)          | ❌ Remove. Same equivalence class and kills as TC-003 |

### Negative

| ID     | Description                                                  | Precondition | Input                                                      | Expected Result                                       | Kills (unique) | Decision                                                                    |
| ------ | ------------------------------------------------------------ | ------------ | ---------------------------------------------------------- | ----------------------------------------------------- | -------------- | --------------------------------------------------------------------------- |
| TC-005 | Amount is `NaN`                                              | —            | `amount = NaN`                                             | Throws `Amount must be greater than 0`                | 6 (—)          | ✅ Keep. Kills removal of `isFinite`; regression for the bug found in review |
| TC-006 | Amount is `Infinity`                                         | —            | `amount = Infinity`                                        | Throws `Amount must be greater than 0`                | 6 (—)          | ❌ Remove. Identical kills to TC-005                                         |
| TC-007 | Amount is a string                                           | —            | `amount = '100'`                                           | Throws `Amount must be greater than 0`                | 6 (—)          | ❌ Remove. Identical kills to TC-005                                         |
| TC-008 | Amount is missing                                            | —            | `amount = undefined`                                       | Throws `Amount must be greater than 0`                | 6 (—)          | ❌ Remove. Identical kills to TC-005                                         |
| TC-009 | Amount is a non-number type (data-driven, one run per input) | —            | `amount` = `{ amount: 100 }`, `[100]`, `true`, `() => 100` | Throws `Amount must be greater than 0` for each input | 6 each (—)     | ❌ Remove. 4 runs, identical kills to TC-005                                 |

---

## applyDiscount

### Boundary

| ID     | Description                           | Precondition              | Input                 | Expected Result                       | Kills (unique)                    | Decision                                                                                                            |
| ------ | ------------------------------------- | ------------------------- | --------------------- | ------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| TC-010 | Percentage just below the lower limit | `new PaymentService(100)` | `percentage = -0.01`  | Discount ignored, `getAmount()` = 100 | 11 (`percentage < 0` → `false`)   | ✅ Keep                                                                                                              |
| TC-011 | Percentage on the lower limit (0)     | `new PaymentService(100)` | `percentage = 0`      | `getAmount()` = 100                   | 5 (—)                             | ❌ Remove. Its boundary mutant (`< 0` → `<= 0`) is equivalent: a 0% discount changes nothing, so no test can kill it |
| TC-012 | Percentage just above the lower limit | `new PaymentService(100)` | `percentage = 0.01`   | `getAmount()` ≈ 99.99                 | 14 (—)                            | ❌ Remove. Identical kills to TC-014/TC-017                                                                          |
| TC-013 | Percentage just below the upper limit | `new PaymentService(100)` | `percentage = 99.99`  | `getAmount()` ≈ 0.01                  | 14 (—)                            | ❌ Remove. Identical kills to TC-014/TC-017                                                                          |
| TC-014 | Percentage on the upper limit (100)   | `new PaymentService(100)` | `percentage = 100`    | `getAmount()` = 0                     | 15 (`> 100` → `>= 100`)           | ✅ Keep                                                                                                              |
| TC-015 | Percentage just above the upper limit | `new PaymentService(100)` | `percentage = 100.01` | Discount ignored, `getAmount()` = 100 | 11 (`percentage > 100` → `false`) | ✅ Keep                                                                                                              |

### Positive

| ID     | Description                                       | Precondition                              | Input                                        | Expected Result                                | Kills (unique)               | Decision                                                                                          |
| ------ | ------------------------------------------------- | ----------------------------------------- | -------------------------------------------- | ---------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------- |
| TC-016 | Nominal discount                                  | `new PaymentService(100)`                 | `percentage = 20`                            | `getAmount()` = 80                             | 14 (—)                       | ❌ Remove. Contained in TC-017 (first step and assertion)                                          |
| TC-017 | Additional discount applies to the current amount | `new PaymentService(100)`                 | 1. `percentage = 20`<br>2. `percentage = 50` | 1. `getAmount()` = 80<br>2. `getAmount()` = 40 | 14 (—)                       | ✅ Keep. Only test of the chaining requirement; TC-014 alone (result 0) is a weak arithmetic check |
| TC-018 | Discount ignored once paid                        | `new PaymentService(100)`, `pay()` called | `percentage = 20`                            | `getAmount()` = 100                            | 11 (`this.isPaid` → `false`) | ✅ Keep. Drop the `.not.toThrow()` assertion: it adds nothing                                      |

### Negative

| ID     | Description                                                      | Precondition              | Input                                                        | Expected Result                                      | Kills (unique) | Decision                                                                    |
| ------ | ---------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------ | ---------------------------------------------------- | -------------- | --------------------------------------------------------------------------- |
| TC-019 | Percentage is `NaN`                                              | `new PaymentService(100)` | `percentage = NaN`                                           | Discount ignored, `getAmount()` = 100                | 10 (—)         | ✅ Keep. Kills removal of `isFinite`; regression for the bug found in review |
| TC-020 | Percentage is `Infinity`                                         | `new PaymentService(100)` | `percentage = Infinity`                                      | Discount ignored, `getAmount()` = 100                | 7 (—)          | ❌ Remove. Same class as TC-015 (above 100)                                  |
| TC-021 | Percentage is a string                                           | `new PaymentService(100)` | `percentage = '20'`                                          | Discount ignored, `getAmount()` = 100                | 10 (—)         | ❌ Remove. Identical kills to TC-019                                         |
| TC-022 | Percentage is missing                                            | `new PaymentService(100)` | `percentage = undefined`                                     | Discount ignored, `getAmount()` = 100                | 10 (—)         | ❌ Remove. Identical kills to TC-019                                         |
| TC-023 | Percentage is a non-number type (data-driven, one run per input) | `new PaymentService(100)` | `percentage` = `{ percent: 50 }`, `[20]`, `true`, `() => 50` | Discount ignored for each input, `getAmount()` = 100 | 10 each (—)    | ❌ Remove. 4 runs, identical kills to TC-019                                 |

---

## pay

### Positive

| ID     | Description                   | Precondition                              | Input   | Expected Result | Kills (unique)                       | Decision                                                                         |
| ------ | ----------------------------- | ----------------------------------------- | ------- | --------------- | ------------------------------------ | -------------------------------------------------------------------------------- |
| TC-024 | First payment succeeds        | `new PaymentService(100)`                 | `pay()` | Returns `true`  | 6 (`return true` → `false`)          | ✅ Keep                                                                           |
| TC-025 | Duplicate payment is rejected | `new PaymentService(100)`, `pay()` called | `pay()` | Returns `false` | 7 (3 mutants of the duplicate check) | ✅ Keep. Drop the `getAmount()` = 100 assertion: `pay()` never touches the amount |

---

## Mutation testing summary

|                                                   | Full suite                           | Reduced suite           |
| ------------------------------------------------- | ------------------------------------ | ----------------------- |
| Test cases                                        | 25                                   | 11                      |
| Executions (with data-driven)                     | 31                                   | 11                      |
| Mutants killed                                    | 37/38 (97.37%, Stryker)              | 37/38 (97.37%, Stryker) |
| Surviving mutant                                  | `percentage < 0` → `percentage <= 0` | same                    |
| Effective score (excluding the equivalent mutant) | 100%                                 | 100%                    |

**Kept (11):** TC-002, TC-003, TC-005, TC-010, TC-014, TC-015, TC-017, TC-018, TC-019, TC-024, TC-025.

**Surviving mutant is equivalent.** `percentage < 0` → `percentage <= 0` only changes behavior at 0%, where "ignore the discount" and "apply a 0% discount" both leave the amount unchanged. No test can observe the difference.

---

# Stryker (after reduction)

Run on the **reduced suite** (11 test cases). Same score for `payment2.ts` (97.37%) with fewer tests per mutant (9.23 vs 12.89).

```
s3mut4@MacBookPro simple-jest-coverage % node find-redundant-tests.mjs reports/mutation/mutation.json payment2

Mutants: 37 killed, 1 survived

Test                                                                   Kills  Unique  Decision
TC-002: Throw error when amount is 0                                       8       2  KEEP (unique kill)
TC-003: Create instance with minimum valid positive amount                 5       0  redundant
TC-005: Throw error when amount is NaN                                     6       0  redundant
TC-010: Ignore discount when percentage is just below 0%                  14       1  KEEP (unique kill)
TC-014: Apply 100% discount boundary                                      15       1  KEEP (unique kill)
TC-015: Ignore discount when percentage exceeds 100%                      12       1  KEEP (unique kill)
TC-017: Apply consecutive discounts on updated amount                     14       0  redundant
TC-018: Ignore discount if payment is already completed                   11       0  redundant
TC-019: Ignore discount when percentage is NaN                            13       0  redundant
TC-024: Return true on first payment                                       7       1  KEEP (unique kill)
TC-025: Return false on duplicate payment attempt                          8       3  KEEP (unique kill)

Minimal set: 6 of 11 tests kill all 37 mutants.
Tests that kill nothing do not appear in the list: they are redundant too.
```