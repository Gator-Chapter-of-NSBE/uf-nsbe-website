import { spawnSync } from 'node:child_process'

for (const args of [
  [
    'node_modules/typescript/bin/tsc',
    'lib/calendar/google.ts',
    'next-env.d.ts',
    '--outDir',
    '.portal-test/calendar-build',
    '--module',
    'commonjs',
    '--target',
    'ES2020',
    '--skipLibCheck',
  ],
  ['--test', 'tests/calendar.test.cjs'],
]) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}
