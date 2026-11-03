const { test } = require('node:test')
const assert = require('node:assert/strict')
const {
  isUfEmail,
  summarizeSemester,
} = require('../.portal-test/rules/rules.js')

const term = { id: 'fall', external_counts_for_membership: false }
const event = (id, category = 'general', semester_id = 'fall') => ({
  id,
  category,
  semester_id,
  base_points: category === 'gbm' ? 10 : category === 'external' ? 15 : 5,
})
const attend = (...ids) => ids.map((event_id) => ({ event_id }))

test('UF email restriction rejects suffix tricks and malformed addresses', () => {
  for (const value of ['person@ufl.edu', ' Person@UFL.EDU '])
    assert.equal(isUfEmail(value), true)
  for (const value of [
    null,
    undefined,
    '',
    'person@gmail.com',
    'person@fakeufl.edu',
    'person@ufl.edu.evil.test',
    'person@@ufl.edu',
    'person name@ufl.edu',
  ])
    assert.equal(isUfEmail(value), false)
})

test('active membership requires both two GBMs and three qualifying events', () => {
  const events = [
    event('g1', 'gbm'),
    event('g2', 'gbm'),
    event('e1'),
    event('e2'),
    event('e3'),
  ]
  const full = summarizeSemester(
    term,
    events,
    attend(...events.map((e) => e.id)),
    [],
  )
  assert.equal(full.active, true)
  assert.equal(full.points, 35)
  assert.equal(
    summarizeSemester(term, events, attend('g1', 'e1', 'e2', 'e3'), []).active,
    false,
  )
  assert.equal(
    summarizeSemester(term, events, attend('g1', 'g2', 'e1', 'e2'), []).active,
    false,
  )
})

test('external events award points but membership eligibility is a term policy', () => {
  const events = [
    event('g1', 'gbm'),
    event('g2', 'gbm'),
    event('e1'),
    event('e2'),
    event('x', 'external'),
  ]
  const attendance = attend(...events.map((e) => e.id))
  const excluded = summarizeSemester(term, events, attendance, [])
  const included = summarizeSemester(
    { ...term, external_counts_for_membership: true },
    events,
    attendance,
    [],
  )
  assert.equal(excluded.points, 45)
  assert.equal(excluded.active, false)
  assert.equal(included.active, true)
  assert.equal(included.points, excluded.points)
})

test('term totals exclude other semesters, duplicate attendance, and unrecorded bonuses', () => {
  const events = [event('a'), event('b', 'gbm', 'spring')]
  const result = summarizeSemester(term, events, attend('a', 'a', 'b'), [
    { semester_id: 'spring', points: 30 },
  ])
  assert.equal(result.points, 5)
  assert.equal(result.attended.length, 1)
  assert.equal(result.bonusPoints, 0)
  assert.equal(result.gbms, 0)
})

test('explicit positive and negative admin adjustments affect points, not attendance status', () => {
  const result = summarizeSemester(
    term,
    [],
    [],
    [
      { semester_id: 'fall', points: 30 },
      { semester_id: 'fall', points: -5 },
    ],
  )
  assert.equal(result.points, 25)
  assert.equal(result.active, false)
  assert.equal(result.qualifyingEvents, 0)
})

test('Trailblazers attendance cannot award points or satisfy chapter membership even with a malformed points value', () => {
  const events = [event('g1','gbm'),event('g2','gbm'),event('a'),event('b'),{...event('tb','trailblazers'),base_points:999}]
  const summary = summarizeSemester(term,events,attend(...events.map(e=>e.id)),[])
  assert.equal(summary.basePoints,30)
  assert.equal(summary.qualifyingEvents,2)
  assert.equal(summary.active,false)
  assert.equal(summary.attended.length,4)
})
