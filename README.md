# simple-jest-coverage

A TypeScript project with Jest for testing and code coverage, and Stryker for mutation testing. Contains three example modules: Bank, Payment and Subscription (with inheritance).

> **Branch `review/payment2-mutation`** — study and code-review branch. It contains a peer's `PaymentService` implementation (`payment2.ts`) with the fixes suggested in review, its test suite and a mutation testing analysis. **Do not merge into `main`**: the implementation belongs to the peer's own PR.

## Project Structure

```
src/
├── bank/
│   └── bank.ts
├── payment/
│   ├── payment.ts
│   └── payment2.ts                # Peer implementation under review
└── subscription/
    ├── subscription.ts
    ├── basic-plan.ts
    └── premium-plan.ts

test/
├── bank/
│   └── bank.test.ts
├── payment/
│   ├── payment.test.ts
│   ├── payment2.test.ts           # Reduced suite (11 tests) after mutation analysis
│   └── TC_payment2.md             # Test case tables with mutation results
└── subscription/
    └── subscription.test.ts

scripts/
└── find-redundant-tests.mjs       # Reads Stryker's JSON report, flags redundant tests

stryker.config.json                # Stryker configuration (Jest runner, perTest, disableBail)
```

## Setup

```
npm install
```

## Commands

* `npm test` — run tests
* `npm run test:coverage` — run tests with coverage report
* `npm run format` — format code (no semicolons)
* `npx stryker run` — run mutation testing
* `node scripts/find-redundant-tests.mjs reports/mutation/mutation.json [file]` — flag redundant tests from the last Stryker run (e.g. `[file]` = `payment2`)

## Student Tasks

1. Bank: Add withdraw tests to increase coverage (see TODO in `test/bank/bank.test.ts`)
2. Subscription: Added `getPrice` tests for BasicPlan and PremiumPlan (including discount for 12+ months) to increase coverage (see TODOs in `test/subscription/subscription.test.ts`)
3. PaymentService: Implemented PaymentService with strict type validation and 100% test coverage (TC-001 through TC-025).
4. PaymentService code review (this branch): reviewed a peer's implementation (`payment2.ts`), found and reported input validation bugs (`NaN`, `Infinity` and runtime non-number values passed the range checks; fixed by the author in the PR), and reduced its test suite from 31 to 11 executions with the same mutation score.

## Coverage

Run `npm run test:coverage` to see the coverage report. Coverage thresholds are configured in `jest.config.ts`. HTML report is generated in `coverage/lcov-report/index.html`.

## Mutation Testing

Run `npx stryker run`. Reports are generated in `reports/mutation/` (ignored by git): `mutation.html` to browse, `mutation.json` for the script.

`stryker.config.json`:

```json
{
  "packageManager": "npm",
  "reporters": ["html", "clear-text", "progress", "json"],
  "testRunner": "jest",
  "coverageAnalysis": "perTest",
  "disableBail": true
}
```

* `coverageAnalysis: "perTest"` — Stryker records which tests cover and kill each mutant (`killedBy`). Required by the script.
* `disableBail: true` — each mutant runs against every test that covers it, so "Killed by" lists **all** killing tests instead of only the first one. Without it you cannot tell which tests are redundant.

### Results

| File | Mutation score | Killed | Survived |
| --- | --- | --- | --- |
| `bank.ts` | 90.00% | 9 | 1 |
| `payment.ts` | 97.50% | 39 | 1 |
| `payment2.ts` | 97.37% | 37 | 1 |

The survivors in `payment.ts` and `payment2.ts` are the same **equivalent mutant** (the lower bound of the discount: `>= 0` → `> 0` / `< 0` → `<= 0`). It only changes behavior at 0%, where ignoring the discount and applying a 0% discount give the same result, so no test can kill it.

### Redundant tests: candidates, not deletions

`find-redundant-tests.mjs` computes the minimal set of tests that kills every mutant **Stryker generated**. On `payment2.ts` it keeps 6 of 11 and flags TC-003, TC-005, TC-017, TC-018 and TC-019 as redundant. They are kept anyway:

| Tests | Why they stay |
| --- | --- |
| TC-005, TC-019 | Regression tests for the `NaN` bug found in review. Stryker does not generate a mutant that removes the `isFinite` check, so the score cannot see their value. |
| TC-018 | Only test of the requirement "do nothing if the payment has already been completed". Deleting `\|\| this.isPaid` from the guard is caught by this test alone. |
| TC-003, TC-017 | Valid-side boundary of the amount, and the requirement "each additional discount applies to the current amount". |

The mutation score measures a suite against the mutants the tool generates, and no tool generates them all. Use the script to find candidates, then decide against the spec.

Analysis and test reduction criteria for `payment2.ts`: see `test/payment/TC_payment2.md`.