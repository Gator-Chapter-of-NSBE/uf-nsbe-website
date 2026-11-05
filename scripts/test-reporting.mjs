import { spawnSync } from 'node:child_process'

for (const args of [
  ['node_modules/typescript/bin/tsc','lib/portal/rules.ts','lib/portal/reporting.ts','lib/portal/event-attendance.ts','--outDir','.portal-test/reporting','--module','commonjs','--target','ES2020','--skipLibCheck'],
  ['--test','tests/member-reporting.test.cjs'],
]) {
  const result = spawnSync(process.execPath,args,{ stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}
