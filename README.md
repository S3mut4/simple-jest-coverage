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
│   ├── minimalpayment.test.ts     # Minimal suite: 9 test cases
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

## Student Tasks

1. **Bank**: Add withdraw tests to increase coverage (see TODO in `test/bank/bank.test.ts`)
2. **Subscription**: Added `getPrice` tests for BasicPlan and PremiumPlan (including discount for 12+ months) to increase coverage (see TODOs in `test/subscription/subscription.test.ts`)
3. **PaymentService**: Implemented PaymentService with strict type validation and 100% test coverage (TC-001 through TC-025).

## PaymentService test suites

There are two suites on purpose:

- **Full suite** (`payment.test.ts`): the original design from boundary value analysis and equivalence partitioning, including runtime type checks (strings, `undefined`, objects, arrays, booleans, functions).
- **Minimal suite** (`minimalpayment.test.ts`): the 9 test cases that remain after mutation testing with Stryker. Each one kills at least one mutant no other test kills, and together they reach the same mutation score as the full suite (38/39; the survivor is an equivalent mutant).

The comparison shows that most of the full suite is redundant from a fault-detection point of view. See `minimalpayment.md` for the reasoning behind each test.

## Coverage

Run `npm run test:coverage` to see the coverage report.
Coverage thresholds are configured in `jest.config.js`.
HTML report is generated in `coverage/lcov-report/index.html`.
