// Reads Stryker's JSON report and finds which tests are needed and which are redundant.
// Requirements in stryker.config.json:
//   "reporters": [..., "json"], "coverageAnalysis": "perTest", "disableBail": true
// Usage: node find-redundant-tests.mjs [path/to/mutation.json] [source file filter] [test file filter]
// Example: node find-redundant-tests.mjs reports/mutation/mutation.json payment.ts payment.test.ts
// The test file filter analyses one suite at a time: when two suites contain the same
// test, neither copy is "unique", so mixing suites hides which tests are essential.

import { readFileSync } from 'node:fs'

const reportPath = process.argv[2] ?? 'reports/mutation/mutation.json'
const fileFilter = process.argv[3] ?? ''
const testFileFilter = process.argv[4] ?? ''
const report = JSON.parse(readFileSync(reportPath, 'utf8'))

// Map test id -> readable name (only TC id when present), only for the selected suite
const testNames = new Map()
for (const [testFilePath, testFile] of Object.entries(report.testFiles ?? {})) {
  // Match the whole file name, so "payment.test.ts" does not match "minimalpayment.test.ts"
  const fileName = testFilePath.split('/').pop()
  if (
    testFileFilter &&
    fileName !== testFileFilter &&
    testFilePath !== testFileFilter
  )
    continue
  for (const test of testFile.tests) {
    const tcMatch = test.name.match(/TC-\d+.*$/)
    testNames.set(test.id, tcMatch ? tcMatch[0] : test.name)
  }
}
const nameOf = (testId) => testNames.get(testId) ?? testId

// Collect killed mutants and who kills them
const killedMutants = []
let survivedCount = 0
for (const [filePath, file] of Object.entries(report.files)) {
  if (!filePath.includes(fileFilter)) continue
  for (const mutant of file.mutants) {
    if (mutant.status === 'Killed') {
      // A mutant killed only by tests of another suite counts as survived for this suite
      // Only count killers from the selected suite
      const killers = (mutant.killedBy ?? []).filter((testId) =>
        testNames.has(testId),
      )
      if (killers.length === 0) {
        survivedCount++
        continue
      }
      killedMutants.push({
        label: `${filePath}:${mutant.location.start.line} ${mutant.mutatorName}`,
        killers,
      })
    } else if (mutant.status === 'Survived') {
      survivedCount++
    }
  }
}

const allKilledHaveKillers = Object.values(report.files).every((file) =>
  file.mutants.every(
    (mutant) =>
      mutant.status !== 'Killed' || (mutant.killedBy ?? []).length > 0,
  ),
)
if (!allKilledHaveKillers) {
  console.log(
    'Some killed mutants have no "killedBy" list: check coverageAnalysis is "perTest".',
  )
}
if (testNames.size === 0) {
  console.log(`No tests match the test file filter "${testFileFilter}".`)
}

// Kills and unique kills per test
const testStats = new Map()
for (const mutant of killedMutants) {
  for (const testId of mutant.killers) {
    const stats = testStats.get(testId) ?? { kills: 0, unique: [] }
    stats.kills++
    if (mutant.killers.length === 1) stats.unique.push(mutant.label)
    testStats.set(testId, stats)
  }
}

// Minimal set: tests with unique kills first, then greedy cover of the rest
const keptTests = new Set(
  [...testStats]
    .filter(([, stats]) => stats.unique.length > 0)
    .map(([id]) => id),
)
let uncovered = killedMutants.filter(
  (mutant) => !mutant.killers.some((testId) => keptTests.has(testId)),
)
while (uncovered.length > 0) {
  const coverCount = new Map()
  for (const mutant of uncovered) {
    for (const testId of mutant.killers) {
      coverCount.set(testId, (coverCount.get(testId) ?? 0) + 1)
    }
  }
  const [bestTest] = [...coverCount].sort((a, b) => b[1] - a[1])[0]
  keptTests.add(bestTest)
  uncovered = uncovered.filter((mutant) => !mutant.killers.includes(bestTest))
}

// Output
const suiteLabel = testFileFilter
  ? ` (suite: ${testFileFilter})`
  : ' (all suites)'
console.log(
  `\nMutants: ${killedMutants.length} killed, ${survivedCount} survived${suiteLabel}\n`,
)
console.log('Test'.padEnd(70), 'Kills', ' Unique', ' Decision')
const sortedTests = [...testStats].sort((a, b) =>
  nameOf(a[0]).localeCompare(nameOf(b[0])),
)
for (const [testId, stats] of sortedTests) {
  const decision = keptTests.has(testId)
    ? stats.unique.length > 0
      ? 'KEEP (unique kill)'
      : 'KEEP (needed to cover)'
    : 'redundant'
  console.log(
    nameOf(testId).slice(0, 69).padEnd(70),
    String(stats.kills).padStart(5),
    String(stats.unique.length).padStart(7),
    ' ' + decision,
  )
}
console.log(
  `\nMinimal set: ${keptTests.size} of ${testStats.size} tests kill all ${killedMutants.length} mutants.`,
)
console.log(
  'Tests that kill nothing do not appear in the list: they are redundant too.\n',
)
