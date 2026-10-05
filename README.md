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
│   └── payment2.ts          # Peer implementation under review
└── subscription/
    ├── subscription.ts
    ├── basic-plan.ts
    └── premium-plan.ts

test/
├── bank/
│   └── bank.test.ts
├── payment/
│   ├── payment.test.ts
│   ├── payment2.test.ts     # Reduced suite (11 tests) after mutation analysis
│   └── TC_payment2.md       # Test case tables with mutation results
└── subscription/
    └── subscription.test.ts

stryker.config.json          # Stryker configuration (Jest runner, disableBail)
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

## Student Tasks

1. Bank: Add withdraw tests to increase coverage (see TODO in `test/bank/bank.test.ts`)
2. Subscription: Added `getPrice` tests for BasicPlan and PremiumPlan (including discount for 12+ months) to increase coverage (see TODOs in `test/subscription/subscription.test.ts`)
3. PaymentService: Implemented PaymentService with strict type validation and 100% test coverage (TC-001 through TC-025).
4. PaymentService code review (this branch): reviewed a peer's implementation (`payment2.ts`), found and fixed input validation bugs (`NaN`, `Infinity` and runtime non-number values passed the range checks), and reduced its test suite from 31 to 11 executions with the same mutation score.

## Coverage

Run `npm run test:coverage` to see the coverage report. Coverage thresholds are configured in `jest.config.ts`. HTML report is generated in `coverage/lcov-report/index.html`.

## Mutation Testing

Run `npx stryker run`. The HTML report is generated in `reports/mutation/mutation.html` (ignored by git).

`disableBail: true` is enabled in `stryker.config.json`, so each mutant runs against every test that covers it. This makes "Killed by" list **all** killing tests instead of only the first one, which is what you need to find redundant tests.

| File | Mutation score | Killed | Survived |
| --- | --- | --- | --- |
| `bank.ts` | 90.00% | 9 | 1 |
| `payment.ts` | 97.50% | 39 | 1 |
| `payment2.ts` | 97.37% | 37 | 1 |

The survivors in `payment.ts` and `payment2.ts` are the same **equivalent mutant** (the lower bound of the discount: `>= 0` → `> 0` / `< 0` → `<= 0`). It only changes behavior at 0%, where ignoring the discount and applying a 0% discount give the same result, so no test can kill it.

Analysis and test reduction criteria for `payment2.ts`: see `test/payment/TC_payment2.md`.