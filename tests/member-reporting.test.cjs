const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const { NextRequest } = require('next/server')
const { membershipHistory } = require('../.portal-test/reporting/rules.js')
const { activeMembersCsv } = require('../.portal-test/reporting/reporting.js')
const { filterAttendees, parsePage, paginationPages } = require('../.portal-test/reporting/event-attendance.js')

test('pagination windows include boundaries/current page, ellipses and single-gap page buttons',()=>{
  assert.deepEqual(paginationPages(1,0),[])
  assert.deepEqual(paginationPages(3,5),[1,2,3,4,5])
  assert.deepEqual(paginationPages(1,20),[1,2,3,4,'ellipsis',20])
  assert.deepEqual(paginationPages(4,20),[1,2,3,4,5,'ellipsis',20])
  assert.deepEqual(paginationPages(10,20),[1,'ellipsis',9,10,11,'ellipsis',20])
  assert.deepEqual(paginationPages(20,20),[1,'ellipsis',17,18,19,20])
  for(let total=1;total<=50;total++)for(let page=1;page<=total;page++) {
    const window=paginationPages(page,total),numbers=window.filter(n=>typeof n==='number')
    assert.ok(numbers.includes(page))
    assert.equal(numbers[0],1)
    assert.equal(numbers[numbers.length-1],total)
    assert.equal(new Set(numbers).size,numbers.length)
    assert.ok(window.length<=7)
  }
})

test('page input rejects malformed values and stays within PostgreSQL integer bounds',()=>{
  for(const value of [undefined,'','-2','0','3.5','1e2','abc'])assert.equal(parsePage(value),1)
  assert.equal(parsePage('0002'),2)
  assert.equal(parsePage('9999999999999999999999999'),2147483647)
})

test('event roster search matches names and emails literally and keeps alphabetical order',()=>{
  const rows=[{id:'b',member:{full_name:'Zoe Member',email:'zoe@ufl.edu'}},{id:'a',member:{full_name:'Amy Member',email:'amy@ufl.edu'}},{id:'c',member:null}]
  assert.deepEqual(filterAttendees(rows,'MEMBER').map(r=>r.id),['a','b'])
  assert.deepEqual(filterAttendees(rows,' ZOE@UFL.EDU ').map(r=>r.id),['b'])
  assert.equal(filterAttendees(rows,'%_').length,0)
  assert.equal(rows[0].id,'b')
  assert.equal(filterAttendees(rows,'').length,3)
})

test('membership history uses event dates, preserves semester scope and recalculates after corrections', () => {
  const terms = [{id:'a',starts_on:'2026-08-01',external_counts_for_membership:false},{id:'b',starts_on:'2027-01-01',external_counts_for_membership:false}]
  const events = Array.from({length:5},(_,i) => ({id:String(i),semester_id:'a',starts_at:`2026-09-0${i+1}T18:00:00-04:00`,category:i<2?'gbm':'general',base_points:i<2?10:5}))
  const attendance = events.map(e=>({event_id:e.id,checked_in_at:'2026-11-01T18:00:00Z'}))
  const adjustments = [{semester_id:'a',points:10},{semester_id:'b',points:-5}]
  const result = membershipHistory(terms,events,attendance,adjustments)
  assert.equal(result.firstAttendance,events[0].starts_at)
  assert.equal(result.activeSemesters,1)
  assert.equal(result.lifetimePoints,40)
  assert.deepEqual(result.terms.map(t=>[t.semester.id,t.points,t.active]),[['b',-5,false],['a',45,true]])
  const corrected = membershipHistory(terms,events,attendance.slice(1),adjustments)
  assert.equal(corrected.firstAttendance,events[1].starts_at)
  assert.equal(corrected.activeSemesters,0)
  const empty = membershipHistory(terms,events,[],[])
  assert.equal(empty.firstAttendance,null)
  assert.ok(empty.terms.every(t=>!t.hasRecords))
})

test('CSV escapes quotes, commas and newlines; neutralizes formulas and retains negative numeric points', () => {
  const csv = activeMembersCsv('Fall 2026',[{full_name:'  =HYPERLINK("bad")',email:'x@ufl.edu',gbms:2,qualifying_events:3,points:-5},{full_name:'Name, "Quoted"\nNext',email:'y@ufl.edu',gbms:2,qualifying_events:4,points:45}])
  assert.ok(csv.startsWith('\uFEFF"Semester","Name","UF email"'))
  assert.ok(csv.includes('"\'  =HYPERLINK(""bad"")"'))
  assert.ok(csv.includes('"Name, ""Quoted""\nNext"'))
  assert.ok(csv.includes('"-5"'))
  assert.ok(csv.endsWith('\r\n'))
  assert.equal(activeMembersCsv('Empty',[]).split('\r\n').length,2)
})

function loadTs(file, overrides) {
  const module = {exports:{}}
  const code = ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText
  vm.runInNewContext(code,{module,exports:module.exports,URLSearchParams,require(id){return Object.hasOwn(overrides,id)?overrides[id]:require(id)}},{filename:file})
  return module.exports
}
const {readAll} = loadTs('lib/portal/read-all.ts',{'server-only':{}})

test('stale event pages redirect to a valid page while preserving search and filters',async()=>{
  const calls=[]
  const client={
    from(){return {select(){return this},order(){return this},range:async()=>({data:[{id:'term',name:'Fall'}],error:null})}},
    rpc:async(name,args)=>{calls.push(args);return {data:args.p_page===1?[{total_count:31}]:[],error:null}},
  }
  const {default:Page}=loadTs('app/portal/admin/previous-events/page.tsx',{
    'next/navigation':{redirect(url){throw new Error(`REDIRECT:${url}`)}},
    '@/lib/portal/session':{requireAdmin:async()=>({supabase:client})},
    '@/lib/portal/read-all':{readAll},
    '@/lib/portal/event-attendance':require('../.portal-test/reporting/event-attendance.js'),
    '@/components/site/primitives':{Container:()=>null,Section:()=>null},
    '@/components/portal/event-pagination':{EventPagination:()=>null},
    '@/lib/check-in':{fieldClass:''},
  })
  await assert.rejects(Page({searchParams:Promise.resolve({q:' Workshop ',semester:'term',category:'general',page:'30'})}),error=>{
    assert.ok(error.message.startsWith('REDIRECT:'),error.message)
    const url=new URL(error.message.replace('REDIRECT:',''),'http://localhost')
    assert.equal(url.searchParams.get('page'),'2')
    assert.equal(url.searchParams.get('q'),'Workshop')
    assert.equal(url.searchParams.get('semester'),'term')
    assert.equal(url.searchParams.get('category'),'general')
    return true
  })
  assert.equal(calls.length,2)
  assert.equal(calls[0].p_page,30)
  assert.equal(calls[0].p_query,'Workshop')
  assert.equal(calls[1].p_page,1)
})
function route({ user=true,admin=true,rows=[],failed=false,term=true }={}) {
  const client = {
    auth:{getUser:async()=>({data:{user:user?{id:'admin'}:null},error:null})},
    rpc(name){return name==='is_portal_admin'?Promise.resolve({data:admin,error:null}):{range:async(a,b)=>({data:failed?null:rows.slice(a,b+1),error:failed?{}:null})}},
    from(){return {select(){return this},eq(){return this},maybeSingle:async()=>({data:term?{name:'Fall 2026'}:null,error:null})}},
  }
  return loadTs('app/portal/admin/active-members/export/route.ts',{
    '@/lib/supabase/server':{createClient:async()=>client},
    '@/lib/portal/read-all':{readAll},
    '@/lib/portal/reporting':{activeMembersCsv},
  }).GET
}
const request = (id='90000000-0000-0000-0000-000000000001') => new NextRequest(`http://localhost/portal/admin/active-members/export?semester=${id}`)
test('program-only attendance does not create chapter membership history or move the chapter joining date',()=>{
  const term={id:'fall',starts_on:'2026-08-01'}
  const trail={id:'tb',semester_id:'fall',starts_at:'2026-08-01T18:00:00Z',category:'trailblazers',base_points:0}
  const chapter={id:'gbm',semester_id:'fall',starts_at:'2026-09-01T18:00:00Z',category:'gbm',base_points:10}
  const only=membershipHistory([term],[trail],[{event_id:'tb'}],[])
  assert.equal(only.firstAttendance,null)
  assert.equal(only.terms[0].hasRecords,false)
  const both=membershipHistory([term],[trail,chapter],[{event_id:'tb'},{event_id:'gbm'}],[])
  assert.equal(both.firstAttendance,chapter.starts_at)
  assert.equal(both.lifetimePoints,10)
})
test('export rejects unauthenticated, non-admin, invalid and unknown semester requests',async()=>{
  for(const [options,id,status] of [[{user:false},undefined,401],[{admin:false},undefined,403],[{},'bad',400],[{term:false},undefined,404],[{failed:true},undefined,503]]) {
    const response = await route(options)(request(id))
    assert.equal(response.status,status)
    assert.equal(response.headers.get('cache-control'),'private, no-store')
  }
})
test('export downloads every active member beyond API response caps and handles empty reports',async()=>{
  const rows = Array.from({length:1001},(_,i)=>({full_name:`Member ${i}`,email:`member${i}@ufl.edu`,gbms:2,qualifying_events:3,points:35}))
  const response = await route({rows})(request())
  assert.equal(response.status,200)
  assert.match(response.headers.get('content-disposition'),/^attachment;/)
  assert.equal(response.headers.get('content-type'),'text/csv; charset=utf-8')
  const csv=await response.text()
  assert.equal(csv.trimEnd().split('\r\n').length,1002)
  assert.ok(csv.includes('member1000@ufl.edu'))
  const empty=await route()(request())
  assert.equal((await empty.text()).trimEnd().split('\r\n').length,1)
})
