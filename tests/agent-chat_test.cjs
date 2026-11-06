const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
function load(file, mocks, context = {}) {
  const js = ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText
  const mod={exports:{}}
  vm.runInNewContext(js,{module:mod,exports:mod.exports,require:name=>name in mocks ? mocks[name] : require(name),URL,AbortSignal,Buffer,process,console,...context},{filename:file})
  return mod.exports
}
const response={json:(body,options)=>({body,status:options?.status || 200})}
let session=null, history=[], created=[], calls=0, generatedStatus='draft', apiFormat='chat', lastUrl='', requests=new Map()
const sid='11111111-1111-4111-8111-111111111111', sid2='22222222-2222-4222-8222-222222222222', sessions=new Map([[sid,[]],[sid2,[]]]), locks=new Set()
const prisma={
  $queryRaw:async(strings,...values)=>{const sql=strings.join('');if(sql.includes('agent_request')){const item=requests.get(values[0]);return item && item.sessionId===values[2] ? [item] : []}return sessions.has(values[0]) ? [{messages:sessions.get(values[0])}] : []},
  $executeRaw:async(strings,...values)=>{const sql=strings.join('');if(sql.includes('SET active_request=') && !sql.includes('SET active_request=NULL')){if(!sessions.has(values[1])||locks.has(values[1]))return 0;locks.add(values[1]);return 1}if(sql.includes('SET active_request=NULL')){locks.delete(values[0]);return 1}if(sql.includes('INSERT INTO agent_request')){if(requests.has(values[0]))return 0;requests.set(values[0],{status:'running',sessionId:values[2]});return 1}if(sql.includes('UPDATE agent_request')){requests.set(values[2],{...requests.get(values[2]),status:'done',response:JSON.parse(values[0]),response_status:values[1]});return 1}if(sql.includes('SET messages=')){history=JSON.parse(values[0]);sessions.set(values[2],history);return 1}throw Error(sql)},
  project:{findMany:async()=>[],findFirst:async()=>null,create:async({data})=>{created.push(data);return {id:'project-1',...data}}},
  blogPost:{findMany:async()=>[]}
}
async function mockProvider(url){calls++;lastUrl=url;const tool={id:'call-1',function:{name:'create_project',arguments:JSON.stringify({title:'Test project',description:'A detailed test description',technologies:['TS'],status:generatedStatus})}};const output=calls%2?{role:'assistant',tool_calls:[tool]}:{role:'assistant',content:'Done'};return {ok:true,json:async()=>apiFormat==='anthropic'?{content:calls%2?[{type:'tool_use',id:tool.id,name:tool.function.name,input:JSON.parse(tool.function.arguments)}]:[{type:'text',text:'Done'}]}:apiFormat==='responses'?{output:calls%2?[{type:'function_call',call_id:tool.id,name:tool.function.name,arguments:tool.function.arguments}]:[{type:'message',content:[{type:'output_text',text:'Done'}]}]}:{choices:[{message:output}]}}}
const agent=load('app/api/admin/agent/chat/route.ts',{
  '@/lib/agent-search':{searchWeb:async()=>({results:[]})},
  '@/lib/meeting-store':{MeetingStore:{}},
  '@/lib/agent-anthropic':load('lib/agent-anthropic.ts',{}),
  'next/server':{NextResponse:response},'next-auth':{getServerSession:async()=>session},'@/lib/auth':{authOptions:{}},
  '@/lib/prisma':{__esModule:true,default:prisma},'@/lib/agent-config':{getAgentConfig:async()=>({base_url:'https://provider.example/v1',model:'test',encrypted_key:'encrypted',api_format:apiFormat}),decrypt:()=> 'secret',validateEndpoint:async url=>url,providerSessionId:()=> 'session',providerPost:(base,path,key,payload)=>mockProvider(base+path)}
})

async function run(){
  let r=await agent.POST({json:async()=>({message:'สร้างโปรเจกต์เป็นฉบับร่าง',sessionId:sid,requestId:require('crypto').randomUUID()})});assert.equal(r.status,401)
  session={user:{role:'ADMIN',email:'test@example.invalid'}}
  const replayId=require('crypto').randomUUID()
  const replayRequest={json:async()=>({message:'สร้างโปรเจกต์เป็นฉบับร่าง',sessionId:sid,requestId:replayId})}
  r=await agent.POST(replayRequest);assert.equal(r.status,200);assert.equal(created.length,1);assert.equal(created[0].status,'draft');assert.equal(r.body.actions[0].id,'project-1');assert.equal(history.length,2);const previousCalls=calls;r=await agent.POST(replayRequest);assert.equal(r.status,200);assert.equal(created.length,1);assert.equal(calls,previousCalls)
  generatedStatus='published';r=await agent.POST({json:async()=>({message:'สร้างโปรเจกต์เป็นฉบับร่าง',sessionId:sid,requestId:require('crypto').randomUUID()})});assert.equal(r.status,200);assert.equal(created.length,1);assert.equal(r.body.actions.length,0)
  apiFormat='responses'; generatedStatus='draft';r=await agent.POST({json:async()=>({message:'สร้างโปรเจกต์เป็นฉบับร่าง',sessionId:sid,requestId:require('crypto').randomUUID()})});assert.equal(r.status,200);assert.equal(created.length,2);assert.equal(lastUrl,'https://provider.example/v1/responses');
  apiFormat='anthropic';r=await agent.POST({json:async()=>({message:'สร้างโปรเจกต์เป็นฉบับร่าง',sessionId:sid,requestId:require('crypto').randomUUID()})});assert.equal(r.status,200);assert.equal(created.length,3);assert.equal(lastUrl,'https://provider.example/v1/messages');
  const priorLength=sessions.get(sid).length; r=await agent.POST({json:async()=>({message:'แชตใหม่',sessionId:sid2,requestId:require('crypto').randomUUID()})});assert.equal(r.status,200);assert.equal(sessions.get(sid).length,priorLength);assert.equal(sessions.get(sid2).length,2);r=await agent.POST({json:async()=>({message:'wrong session',sessionId:sid2,requestId:replayId})});assert.equal(r.status,409)
  console.log('PASS: agent authentication, draft creation, publication guard, idempotency, history and all three provider formats')
}
run().catch(error=>{console.error(error);process.exitCode=1})
