#!/usr/bin/env node
/* Runs every headless test suite in the repository and reports a summary. Usage: npm test */
"use strict";
const fs=require("node:fs"),path=require("node:path"),{spawnSync}=require("node:child_process");
const root=path.join(__dirname,"..");
const dirs=["prototype","prototype/archive","tools"];
const suites=dirs.flatMap(d=>fs.readdirSync(path.join(root,d)).filter(f=>/test.*\.cjs$|-test\.cjs$/.test(f)&&f!=="run-tests.cjs").sort().map(f=>path.join(d,f)));
let failed=0;
for(const s of suites){
 const t=Date.now(),r=spawnSync(process.execPath,[path.join(root,s)],{cwd:root,encoding:"utf8"});
 const ok=r.status===0,secs=((Date.now()-t)/1000).toFixed(1);
 console.log((ok?"PASS ":"FAIL ")+s+" ("+secs+" s)");
 if(!ok){failed++;process.stdout.write((r.stdout||"").split("\n").slice(-5).join("\n")+"\n"+(r.stderr||"").split("\n").slice(0,12).join("\n")+"\n");}
}
console.log((suites.length-failed)+"/"+suites.length+" suites passed. Headless checks only: no browser audio, listening or hardware testing.");
process.exitCode=failed?1:0;
