# PaymentService — Minimal test suite

9 test cases. Mutation score on `payment.ts`: 38/39 killed. The only survivor (`percent >= 0` → `percent > 0`) is an equivalent mutant: a 0% discount changes nothing, so no test can kill it.

Each test kills at least one mutant that no other test in the suite kills (column **Protects**).

## constructor

### Boundary

| ID     | Description                   | Precondition | Input               | Expected Result                                | Protects        |
| ------ | ----------------------------- | ------------ | ------------------- | ---------------------------------------------- | --------------- |
| TC-002 | Amount on the lower limit (0) | —            | `initialAmount = 0` | Throws `Initial amount must be greater than 0` | `<= 0` vs `< 0` |

### Negative

| ID     | Description     | Precondition | Input                 | Expected Result                                | Protects                            |
| ------ | --------------- | ------------ | --------------------- | ---------------------------------------------- | ----------------------------------- |
| TC-005 | Amount is `NaN` | —            | `initialAmount = NaN` | Throws `Initial amount must be greater than 0` | `isFinite` check in the constructor |

---

## applyDiscount

### Boundary

| ID     | Description                        | Precondition              | Input              | Expected Result                                              | Protects               |
| ------ | ---------------------------------- | ------------------------- | ------------------ | ------------------------------------------------------------ | ---------------------- |
| TC-010 | Percent just below the lower limit | `new PaymentService(100)` | `percent = -0.01`  | Discount ignored, `getAmount()` = 100, `getIsPaid()` = false | `percent >= 0` check   |
| TC-014 | Percent on the upper limit (100)   | `new PaymentService(100)` | `percent = 100`    | `getAmount()` = 0                                            | `<= 100` vs `< 100`    |
| TC-015 | Percent just above the upper limit | `new PaymentService(100)` | `percent = 100.01` | Discount ignored, `getAmount()` = 100                        | `percent <= 100` check |

### Positive

| ID     | Description                | Precondition                              | Input          | Expected Result                           | Protects                         |
| ------ | -------------------------- | ----------------------------------------- | -------------- | ----------------------------------------- | -------------------------------- |
| TC-018 | Discount ignored once paid | `new PaymentService(100)`, `pay()` called | `percent = 20` | `getAmount()` = 100, `getIsPaid()` = true | `this.isPaid` check in the guard |

### Negative

| ID     | Description         | Precondition              | Input            | Expected Result                       | Protects                                                                      |
| ------ | ------------------- | ------------------------- | ---------------- | ------------------------------------- | ----------------------------------------------------------------------------- |
| TC-021 | Percent is a string | `new PaymentService(100)` | `percent = '20'` | Discount ignored, `getAmount()` = 100 | `isFinite` check in applyDiscount (NaN is already rejected by `percent >= 0`) |

---

## pay

### Positive

| ID     | Description                   | Precondition                              | Input   | Expected Result                       | Protects                            |
| ------ | ----------------------------- | ----------------------------------------- | ------- | ------------------------------------- | ----------------------------------- |
| TC-024 | First payment succeeds        | `new PaymentService(100)`                 | `pay()` | Returns `true`, `getIsPaid()` = true  | `return true` and `isPaid = true`   |
| TC-025 | Duplicate payment is rejected | `new PaymentService(100)`, `pay()` called | `pay()` | Returns `false`, `getIsPaid()` = true | Duplicate-payment check (3 mutants) |

---

## Optional (recommended): 11 test cases

Not needed for the mutation score, but they cover requirements no mutation tool generates mutants for.

| ID     | Description                                       | Precondition              | Input                                  | Expected Result                                | Why                                                                                     |
| ------ | ------------------------------------------------- | ------------------------- | -------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------- |
| TC-017 | Additional discount applies to the current amount | `new PaymentService(100)` | 1. `percent = 20`<br>2. `percent = 50` | 1. `getAmount()` = 80<br>2. `getAmount()` = 40 | Only test of the chaining requirement: catches a discount applied to the initial amount |
| TC-019 | Percent is `NaN`                                  | `new PaymentService(100)` | `percent = NaN`                        | Discount ignored, `getAmount()` = 100          | Regression for the NaN bug found in review (negative-form guard)                        |