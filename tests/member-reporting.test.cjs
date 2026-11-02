const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const { NextRequest } = require('next/server')
const { membershipHistory } = require('../.portal-test/reporting/rules.js')
const { activeMembersCsv } = require('../.portal-test/reporting/reporting.js')

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
  const code = ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText
  vm.runInNewContext(code,{module,exports:module.exports,require(id){return Object.hasOwn(overrides,id)?overrides[id]:require(id)}},{filename:file})
  return module.exports
}
const {readAll} = loadTs('lib/portal/read-all.ts',{'server-only':{}})
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
