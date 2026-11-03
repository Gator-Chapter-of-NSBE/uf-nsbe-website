const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const { createRequire } = require('node:module')
const {
  normalizeEvent,
  eventDay,
  eventSchedule,
  groupEvents,
  descriptionText,
} = require('../.portal-test/calendar-build/lib/calendar/events.js')
// Keep the production server-only guard; provide its no-op server marker in Node tests.
const compiled =
  require.resolve('../.portal-test/calendar-build/lib/calendar/google.js')
const serverModule = { exports: {} }
const localRequire = createRequire(compiled)
vm.runInNewContext(fs.readFileSync(compiled, 'utf8'), {
  module: serverModule,
  exports: serverModule.exports,
  require: (id) => (id === 'server-only' ? {} : localRequire(id)),
  fetch,
  Date,
  URL,
  URLSearchParams,
  AbortSignal,
  process,
  Map,
  Set,
})
const { fetchCalendarEvents } = serverModule.exports

test('Trailblazers source excludes CEB titles and never changes the public chapter calendar source', async()=>{
  const calls=[]
  const module={exports:{}}
  vm.runInNewContext(fs.readFileSync(compiled,'utf8'),{
    module,exports:module.exports,require:id=>id==='server-only'?{}:localRequire(id),
    Date,URL,URLSearchParams,AbortSignal,Map,Set,
    process:{env:{GOOGLE_CALENDAR_API_KEY:'test-only-key'}},
    fetch:async url=>{
      calls.push(new URL(url))
      return {ok:true,json:async()=>({items:['Trailblazers Meeting','CEB Meeting','Sunday CEB','trailblazers workshop'].map((summary,i)=>({id:String(i),summary,start:{dateTime:'2099-11-05T18:00:00-05:00'},end:{dateTime:'2099-11-05T19:00:00-05:00'}}))})}
    },
  })
  const result=await module.exports.getCheckInCalendarEvents('trailblazers')
  assert.equal(result.status,'ready')
  assert.equal(result.events.length,2)
  assert.ok(result.events.every(e=>/trailblazers/i.test(e.title)))
  assert.equal(result.calendarId,'vpresident.ufnsbe@gmail.com')
  await module.exports.getCalendarEvents()
  assert.ok(calls[0].pathname.includes(encodeURIComponent('vpresident.ufnsbe@gmail.com')))
  assert.ok(!calls[1].pathname.includes('vpresident.ufnsbe'))
})
const now = new Date('2026-11-01T06:00:00Z')
const event = (id = 'meeting') => ({
  id,
  summary: 'Chapter meeting',
  start: { dateTime: '2026-11-05T18:00:00-05:00' },
  end: { dateTime: '2026-11-05T19:00:00-05:00' },
  htmlLink: 'https://www.google.com/calendar/event?eid=test',
})

test('pagination expands recurring occurrences, follows empty pages, and deduplicates IDs', async () => {
  const calls = []
  const pages = [
    { items: [event('series_1')], nextPageToken: 'two' },
    { items: [], nextPageToken: 'three' },
    {
      items: [
        event('series_1'),
        event('series_2'),
        { ...event('cancelled'), status: 'cancelled' },
      ],
    },
  ]
  const result = await fetchCalendarEvents({
    apiKey: 'test-only-key',
    calendarId: 'chapter@example.test',
    now,
    fetcher: async (url, options) => {
      calls.push(new URL(url))
      assert.equal(options.next.revalidate, 300)
      return Response.json(pages.shift())
    },
  })
  assert.equal(result.status, 'ready')
  assert.equal(result.events.length, 2)
  assert.equal(calls.length, 3)
  assert.equal(calls[0].searchParams.get('singleEvents'), 'true')
  assert.equal(calls[0].searchParams.get('orderBy'), 'startTime')
  assert.equal(calls[2].searchParams.get('pageToken'), 'three')
  assert.ok(calls[0].searchParams.get('timeMax'))
  assert.ok(!calls[0].searchParams.get('fields').includes('attendees'))
})

test('missing keys do not fetch; API failures, bad pagination and timeouts return fallback', async () => {
  assert.equal(
    (
      await fetchCalendarEvents({
        calendarId: 'test',
        fetcher: () => {
          throw Error('Must not fetch')
        },
      })
    ).status,
    'unconfigured',
  )
  for (const fetcher of [
    async () => new Response('', { status: 403 }),
    async () => {
      throw Error('timeout')
    },
    async () => Response.json({ items: 'bad' }),
    async () => Response.json({ items: [event()], nextPageToken: 'repeated' }),
  ]) {
    const result = await fetchCalendarEvents({
      apiKey: 'private-key',
      calendarId: 'test',
      now,
      fetcher,
    })
    assert.equal(result.status, 'unavailable')
    assert.equal(result.events.length, 0)
    assert.ok(!JSON.stringify(result).includes('private-key'))
  }
})

test('a successful empty calendar is distinct from an unavailable one', async () => {
  const result = await fetchCalendarEvents({
    apiKey: 'test',
    calendarId: 'test',
    now,
    fetcher: async () => Response.json({}),
  })
  assert.equal(result.status, 'ready')
  assert.equal(result.events.length, 0)
})

test('all-day dates stay local and multi-day exclusive ends display inclusively', () => {
  const day = normalizeEvent(
    { id: 'day', start: { date: '2026-11-01' }, end: { date: '2026-11-02' } },
    now,
  )
  assert.equal(eventDay(day), '2026-11-01')
  assert.equal(eventSchedule(day), 'All day')
  const multi = normalizeEvent(
    { id: 'trip', start: { date: '2026-11-01' }, end: { date: '2026-11-04' } },
    now,
  )
  assert.match(eventSchedule(multi), /Nov 3, 2026/)
  assert.equal(
    normalizeEvent(
      {
        id: 'ended',
        start: { date: '2026-10-30' },
        end: { date: '2026-11-01' },
      },
      now,
    ),
    null,
  )
})

test('Eastern dates and daylight-saving fold are ordered by actual instants', () => {
  const previousDay = normalizeEvent(
    {
      ...event(),
      start: { dateTime: '2026-11-06T01:00:00Z' },
      end: { dateTime: '2026-11-06T02:00:00Z' },
    },
    now,
  )
  assert.equal(eventDay(previousDay), '2026-11-05')
  const early = normalizeEvent(
    {
      ...event('early'),
      start: { dateTime: '2026-11-01T01:30:00-04:00' },
      end: { dateTime: '2026-11-01T02:30:00-05:00' },
    },
    new Date('2026-11-01T04:00:00Z'),
  )
  const late = normalizeEvent(
    {
      ...event('late'),
      start: { dateTime: '2026-11-01T01:15:00-05:00' },
      end: { dateTime: '2026-11-01T02:15:00-05:00' },
    },
    new Date('2026-11-01T04:00:00Z'),
  )
  assert.equal(groupEvents([late, early])[0].events[0].id, 'early')
})

test('cancelled, ended, and malformed events are excluded; unsafe links are discarded', () => {
  assert.equal(normalizeEvent({ ...event(), status: 'cancelled' }, now), null)
  assert.equal(
    normalizeEvent({ ...event(), end: { dateTime: 'invalid' } }, now),
    null,
  )
  assert.equal(
    normalizeEvent(
      { id: 'bad', start: { date: '2026-02-30' }, end: { date: '2026-03-03' } },
      now,
    ),
    null,
  )
  assert.equal(
    normalizeEvent({ ...event(), htmlLink: 'javascript:alert(1)' }, now).url,
    null,
  )
  assert.equal(
    normalizeEvent({ ...event(), htmlLink: 'https://evil.test/' }, now).url,
    null,
  )
})

test('rich descriptions become plain text without running HTML or scripts', () => {
  assert.equal(
    descriptionText(
      '<p>Meet &amp; connect<br>Room &#49;</p><script>alert(1)</script>',
    ),
    'Meet & connect\nRoom 1',
  )
  assert.equal(descriptionText('&#99999999;'), '')
})
