const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm'), ts = require('typescript')
const code = ts.transpileModule(fs.readFileSync('lib/agent-search.ts','utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText
const mod = {exports:{}}, seen = []
let unavailable = false
const fetch = async url => {
  seen.push(url)
  if (unavailable || seen.length === 1) return {ok:false}
  return {ok:true,json:async()=>({results:[{title:'Example',url:'https://example.org/article',content:'Source summary'}, {title:'Invalid',url:'javascript:alert(1)'}]})}
}
vm.runInNewContext(code,{module:mod,exports:mod.exports,URL,AbortSignal,fetch})
;(async()=>{
  const result = await mod.exports.searchWeb('ข่าว AI')
  assert.equal(seen.length,2)
  assert.equal(seen[1].searchParams.get('q'),'ข่าว AI')
  assert.equal(seen[1].searchParams.get('format'),'json')
  assert.equal(result.results.length,1)
  assert.equal(result.results[0].url,'https://example.org/article')
  unavailable = true
  await assert.rejects(mod.exports.searchWeb('test'),/temporarily unavailable/)
  console.log('PASS: keyless search, fallback, source filtering and unavailable service')
})().catch(error=>{console.error(error);process.exitCode=1})
