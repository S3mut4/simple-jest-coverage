# Simple Jest Coverage

A TypeScript project with Jest for testing and code coverage. Contains three example modules: **Bank**, **Payment** and **Subscription** (with inheritance).

## Project Structure

```
src/
├── bank/
│   └── bank.ts
├── payment/
│   └── payment.ts
└── subscription/
    ├── subscription.ts
    ├── basic-plan.ts
    └── premium-plan.ts

test/
├── bank/
│   └── bank.test.ts
├── payment/
│   ├── payment.test.ts            # Full suite: TC-001 to TC-025 (31 executions)
│   ├── TC_payment.md              # Test case tables for the full suite
│   ├── minimalpayment.test.ts     # Minimal suite: 13 test cases
│   └── minimalpayment.md          # Test case tables for the minimal suite
└── subscription/
    └── subscription.test.ts
```

## Setup

```bash
npm install
```

## Commands

- `npm test` — run tests
- `npm run test:coverage` — run tests with coverage report
- `npm run format` — format code (no semicolons)
- `npm run mutation` — run Stryker mutation testing

## Student Tasks

1. **Bank**: Add withdraw tests to increase coverage (see TODO in `test/bank/bank.test.ts`)
2. **Subscription**: Added `getPrice` tests for BasicPlan and PremiumPlan (including discount for 12+ months) to increase coverage (see TODOs in `test/subscription/subscription.test.ts`)
3. **PaymentService**: Implemented PaymentService with strict type validation and 100% test coverage (TC-001 through TC-025).

## PaymentService test suites

There are two suites on purpose:

- **Full suite** (`payment.test.ts`): the original design from boundary value analysis and equivalence partitioning, including runtime type checks (strings, `undefined`, objects, arrays, booleans, functions).
- **Minimal suite** (`minimalpayment.test.ts`): 13 test cases. 6 were selected with Stryker mutation testing: each one is the only test in the suite that kills at least one mutant. The other 7 are kept for spec requirements and known bugs that Stryker does not generate mutants for (lower bound of the discount range, discounts applied to the current amount, the `NaN` bug found in review, type coercion). Error messages are not checked, because the spec only requires "throw an error".

Mutation score on `payment.ts` with both suites: 39/40 (the survivor is an equivalent mutant). Most of the full suite is redundant against Stryker's mutants, but Stryker only applies syntactic mutations, so the full suite still catches realistic bugs the minimal suite misses (e.g. `=== 0` instead of `<= 0`, or accepting `Infinity`). A high mutation score does not mean every requirement is tested. See `minimalpayment.md` for the reasoning behind each test.

## Stryker

Run the mutation tests, then check which tests are essential in each suite:

```bash
npm run mutation

# Full suite
node find-redundant-tests.mjs reports/mutation/mutation.json payment.ts payment.test.ts

# Minimal suite
node find-redundant-tests.mjs reports/mutation/mutation.json payment.ts minimalpayment.test.ts
```

The HTML report is generated in `reports/mutation/mutation.html`.

## Coverage

Run `npm run test:coverage` to see the coverage report.
Coverage thresholds are configured in `jest.config.js`.
HTML report is generated in `coverage/lcov-report/index.html`.