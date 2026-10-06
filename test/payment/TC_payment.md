## constructor

### Boundary

| ID | Description | Precondition | Input | Expected Result |
|---|---|---|---|---|
| TC-001 | Amount just below the lower limit | — | `initialAmount = -0.01` | Throws `Initial amount must be greater than 0` |
| TC-002 | Amount on the lower limit (0) | — | `initialAmount = 0` | Throws `Initial amount must be greater than 0` |
| TC-003 | Amount just above the lower limit | — | `initialAmount = 0.01` | Instance created, `getAmount()` = 0.01, `getIsPaid()` = false |

### Positive

| ID | Description | Precondition | Input | Expected Result |
|---|---|---|---|---|
| TC-004 | Nominal positive amount | — | `initialAmount = 100` | Instance created, `getAmount()` = 100, `getIsPaid()` = false |

### Negative

| ID | Description | Precondition | Input | Expected Result |
|---|---|---|---|---|
| TC-005 | Amount is `NaN` | — | `initialAmount = NaN` | Throws `Initial amount must be greater than 0` |
| TC-006 | Amount is `Infinity` | — | `initialAmount = Infinity` | Throws `Initial amount must be greater than 0` |
| TC-007 | Amount is a string | — | `initialAmount = '100'` | Throws `Initial amount must be greater than 0` |
| TC-008 | Amount is missing | — | `initialAmount = undefined` | Throws `Initial amount must be greater than 0` |
| TC-009 | Amount is a non-number type (data-driven, one run per input) | — | `initialAmount` = `{ amount: 100 }`, `[100]`, `true`, `() => 100` | Throws `Initial amount must be greater than 0` for each input |

---

## applyDiscount

### Boundary

| ID | Description | Precondition | Input | Expected Result |
|---|---|---|---|---|
| TC-010 | Percent just below the lower limit | `new PaymentService(100)` | `percent = -0.01` | Discount ignored, `getAmount()` = 100, `getIsPaid()` = false |
| TC-011 | Percent on the lower limit (0) | `new PaymentService(100)` | `percent = 0` | `getAmount()` = 100 |
| TC-012 | Percent just above the lower limit | `new PaymentService(100)` | `percent = 0.01` | `getAmount()` ≈ 99.99 |
| TC-013 | Percent just below the upper limit | `new PaymentService(100)` | `percent = 99.99` | `getAmount()` ≈ 0.01 |
| TC-014 | Percent on the upper limit (100) | `new PaymentService(100)` | `percent = 100` | `getAmount()` = 0 |
| TC-015 | Percent just above the upper limit | `new PaymentService(100)` | `percent = 100.01` | Discount ignored, `getAmount()` = 100, `getIsPaid()` = false |

### Positive

| ID | Description | Precondition | Input | Expected Result |
|---|---|---|---|---|
| TC-016 | Nominal discount | `new PaymentService(100)` | `percent = 20` | `getAmount()` = 80 |
| TC-017 | Additional discount applies to the current amount | `new PaymentService(100)` | 1. `percent = 20`<br>2. `percent = 50` | 1. `getAmount()` = 80<br>2. `getAmount()` = 40 |
| TC-018 | Discount ignored once paid | `new PaymentService(100)`, `pay()` called | `percent = 20` | No error thrown, `getAmount()` = 100, `getIsPaid()` = true |

### Negative

| ID | Description | Precondition | Input | Expected Result |
|---|---|---|---|---|
| TC-019 | Percent is `NaN` | `new PaymentService(100)` | `percent = NaN` | Discount ignored, `getAmount()` = 100, `getIsPaid()` = false |
| TC-020 | Percent is `Infinity` | `new PaymentService(100)` | `percent = Infinity` | Discount ignored, `getAmount()` = 100, `getIsPaid()` = false |
| TC-021 | Percent is a string | `new PaymentService(100)` | `percent = '20'` | Discount ignored, `getAmount()` = 100, `getIsPaid()` = false |
| TC-022 | Percent is missing | `new PaymentService(100)` | `percent = undefined` | Discount ignored, `getAmount()` = 100, `getIsPaid()` = false |
| TC-023 | Percent is a non-number type (data-driven, one run per input) | `new PaymentService(100)` | `percent` = `{ percent: 50 }`, `[20]`, `true`, `() => 50` | Discount ignored for each input, `getAmount()` = 100, `getIsPaid()` = false |

---

## pay

### Positive

| ID | Description | Precondition | Input | Expected Result |
|---|---|---|---|---|
| TC-024 | First payment succeeds | `new PaymentService(100)` | `pay()` | Returns `true`, `getIsPaid()` = true |
| TC-025 | Duplicate payment is rejected | `new PaymentService(100)`, `pay()` called | `pay()` | Returns `false`, `getIsPaid()` = true, `getAmount()` = 100 |
