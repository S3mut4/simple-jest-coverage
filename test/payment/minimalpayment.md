# PaymentService — Minimal test suite

13 test cases, chosen for two different reasons (column **Why**):

1. **6 tests selected by mutation testing with Stryker, marked _Stryker_.** Each one is the only test in this suite that kills at least one mutant: TC-002, TC-010, TC-014, TC-015, TC-024, TC-025.
2. **7 tests kept for requirements and known bugs, marked _spec_ or _regression_.** Stryker reports them as redundant, because it only applies syntactic mutations (operators, conditions, literals). They cover bugs Stryker does not generate: a wrong lower bound such as `>= 1`, a discount applied to the initial amount instead of the current one, the `NaN` bug found in review, or type coercion with the global `isFinite`.

Mutation score on `payment.ts` (both suites run together): 39/40 killed. The only survivor (`percent >= 0` → `percent > 0`) is an equivalent mutant: a 0% discount changes nothing, so no test can kill it.

**Error messages are not checked.** The spec only says "throw an error", so the constructor tests use `toThrow()` without a message. As a consequence, a mutant that changes the error message survives in this suite. The full suite (`payment.test.ts`) still checks the message.

A high mutation score does not mean every requirement is tested: the score only measures the mutants the tool generates.

## constructor

### Boundary

| ID | Description | Precondition | Input | Expected Result | Why |
|---|---|---|---|---|---|
| TC-002 | Amount on the lower limit (0) | — | `initialAmount = 0` | Throws an error | _Stryker_ — `<= 0` vs `< 0` |
| TC-003 | Create instance with a decimal amount | — | `initialAmount = 0.01` | Instance created, `getAmount()` = 0.01, `getIsPaid()` = false | _spec_ — valid side of the "greater than 0" boundary: catches a lower limit set too high, and the only decimal amount in the suite, so it catches `Number.isInteger` used instead of `Number.isFinite`. Also the only check that `isPaid` starts as `false` |

### Negative

| ID | Description | Precondition | Input | Expected Result | Why |
|---|---|---|---|---|---|
| TC-005 | Amount is `NaN` | — | `initialAmount = NaN` | Throws an error | _regression_ — the `NaN` bug found in review. No Stryker mutant removes only this check |

---

## applyDiscount

### Boundary

| ID | Description | Precondition | Input | Expected Result | Why |
|---|---|---|---|---|---|
| TC-010 | Percent just below the lower limit | `new PaymentService(100)` | `percent = -0.01` | Discount ignored, `getAmount()` = 100, `getIsPaid()` = false | _Stryker_ — `percent >= 0` check |
| TC-012 | Percent just above the lower limit | `new PaymentService(100)` | `percent = 0.01` | `getAmount()` ≈ 99.99 | _spec_ — the only test that proves the lower bound is 0: TC-011 (0%) cannot, because applying 0% and ignoring the discount give the same result. Also catches rounding of decimal percentages and `Number.isInteger` used instead of `Number.isFinite` |
| TC-014 | Percent on the upper limit (100) | `new PaymentService(100)` | `percent = 100` | `getAmount()` = 0 | _Stryker_ — `<= 100` vs `< 100` |
| TC-015 | Percent just above the upper limit | `new PaymentService(100)` | `percent = 100.01` | Discount ignored, `getAmount()` = 100 | _Stryker_ — `percent <= 100` check |

### Positive

| ID | Description | Precondition | Input | Expected Result | Why |
|---|---|---|---|---|---|
| TC-017 | Additional discount applies to the current amount | `new PaymentService(100)` | 1. `percent = 20`<br>2. `percent = 50` | 1. `getAmount()` = 80<br>2. `getAmount()` = 40 | _spec_ — the only test of the chaining requirement (catches a discount applied to the initial amount) and of the spec example (20% of 100 = 80) |
| TC-018 | Discount ignored once paid | `new PaymentService(100)`, `pay()` called | `percent = 20` | `getAmount()` = 100, `getIsPaid()` = true | _spec_ — "do nothing if the payment has already been completed" |

### Negative

| ID | Description | Precondition | Input | Expected Result | Why |
|---|---|---|---|---|---|
| TC-019 | Percent is `NaN` | `new PaymentService(100)` | `percent = NaN` | Discount ignored, `getAmount()` = 100 | _regression_ — the `NaN` bug found in review. Catches a validation written only with `typeof` or in negative form (`percent < 0 \|\| percent > 100`), where `NaN` passes |
| TC-021 | Percent is a string | `new PaymentService(100)` | `percent = '20'` | Discount ignored, `getAmount()` = 100 | _regression_ — type coercion: catches the global `isFinite` (`isFinite('20')` is `true`) instead of `Number.isFinite` |

---

## pay

### Positive

| ID | Description | Precondition | Input | Expected Result | Why |
|---|---|---|---|---|---|
| TC-024 | First payment succeeds | `new PaymentService(100)` | `pay()` | Returns `true`, `getIsPaid()` = true | _Stryker_ — `return true` and `isPaid = true` |
| TC-025 | Duplicate payment is rejected | `new PaymentService(100)`, `pay()` called | `pay()` | Returns `false`, `getIsPaid()` = true | _Stryker_ — duplicate-payment check |