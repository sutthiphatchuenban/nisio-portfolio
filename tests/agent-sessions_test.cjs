const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript')
const code=ts.transpileModule(fs.readFileSync('app/api/admin/agent/sessions/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText
const rows=new Map(),mod={exports:{}};let user=null
const prisma={
  $queryRaw:async(_,email)=>[...rows.values()].filter(row=>row.owner===email),
  $executeRaw:async(parts,...v)=>{const sql=parts.join('');if(sql.includes('INSERT')){rows.set(v[0],{id:v[0],owner:v[1],title:'แชตใหม่'});return 1}if(sql.includes('UPDATE')){const row=rows.get(v[1]);if(!row||row.owner!==v[2])return 0;row.title=v[0];return 1}if(sql.includes('DELETE')){const row=rows.get(v[0]);if(!row||row.owner!==v[1]||row.locked)return 0;rows.delete(v[0]);return 1}throw Error(sql)}
}
const mocks={'next-auth':{getServerSession:async()=>user},'next/server':{NextResponse:{json:(body,opts)=>({body,status:opts?.status||200})}},'@/lib/auth':{authOptions:{}},'@/lib/prisma':{__esModule:true,default:prisma}}
vm.runInNewContext(code,{module:mod,exports:mod.exports,require:name=>name in mocks?mocks[name]:require(name)})
const api=mod.exports, req=body=>({json:async()=>body})
;(async()=>{
  assert.equal((await api.GET()).status,401);user={user:{role:'ADMIN',email:'one@example.com'}}
  const created=await api.POST();assert.equal(created.status,201);const id=created.body.id
  assert.equal((await api.GET()).body.sessions.length,1)
  assert.equal((await api.PATCH(req({id,title:'งานเขียน'}))).status,200)
  user={user:{role:'ADMIN',email:'two@example.com'}}
  assert.equal((await api.GET()).body.sessions.length,0);assert.equal((await api.PATCH(req({id,title:'อื่น'}))).status,404);assert.equal((await api.DELETE(req({id}))).status,409)
  user={user:{role:'ADMIN',email:'one@example.com'}};rows.get(id).locked=true;assert.equal((await api.DELETE(req({id}))).status,409);rows.get(id).locked=false;assert.equal((await api.DELETE(req({id}))).status,200)
  console.log('PASS: session creation, rename, deletion, owner isolation and active lock')
})().catch(e=>{console.error(e);process.exitCode=1})
