import { spawnSync } from 'node:child_process'

for (const args of [
  [
    'node_modules/typescript/bin/tsc',
    'lib/portal/rules.ts',
    '--outDir',
    '.portal-test/rules',
    '--module',
    'commonjs',
    '--target',
    'ES2020',
    '--skipLibCheck',
  ],
  ['--test', 'tests/portal-rules.test.cjs'],
]) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}
