#!/usr/bin/env node
/* Tests for firmware-audit.cjs using synthetic update files built from the documented frame format.
 * No real firmware is used or produced; images are random bytes with plausible vectors.
 */
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),os=require("node:os"),path=require("node:path"),crypto=require("node:crypto"),{execFileSync}=require("node:child_process");
const {inspect,inventory}=require("./firmware-audit.cjs");
const sha=b=>crypto.createHash("sha256").update(b).digest("hex");
const HEAD=[0xF0,0,0x21,7,0x19,0];

function image(role,packets=4,seed=role+1){
 let x=seed*2654435761>>>0;const img=Buffer.alloc(packets*128);
 for(let i=0;i<img.length;i++){x^=x<<13;x>>>=0;x^=x>>>17;x^=x<<5;x>>>=0;img[i]=x&255;}
 img.writeUInt32LE(role===0?0x20010000:0x20410000,0);img.writeUInt32LE(0x410101,4);
 return img;
}
function frames(role,img,{padding=0}={}){
 const count=img.length/128,out=[[...HEAD,role,0x7F,count&127,count>>7,0xF7]];
 for(let idx=0;idx<count;idx++){
  const u=Buffer.alloc(133);img.copy(u,0,idx*128,idx*128+128);u[130]=padding;
  const body=[];for(let g=0;g<19;g++){let bits=0;for(let j=0;j<7;j++){const b=u[g*7+j];body.push(b&127);bits|=(b>>7)<<(6-j);}body.push(bits);}
  let sum=0;for(let i=0;i<128;i++)sum+=u[i];
  out.push([...HEAD,role,0,idx&127,idx>>7,...body,(sum>>8)&15,(sum>>12)&15,sum&15,(sum>>4)&15,0xF7]);
 }
 out.push([...HEAD,role,0x7E,0xF7]);
 return out;
}
const join=fs_=>Buffer.from(fs_.flat());

// Valid containers decode to the original image and report its hashes and vectors.
for(const role of [0,1,2]){
 const img=image(role),raw=join(frames(role,img)),r=inspect(raw);
 assert.equal(r.role,["panel","master","slave"][role]);
 assert.equal(r.packetCount,4);assert.equal(r.imageBytes,512);assert.equal(r.containerBytes,raw.length);
 assert.equal(r.imageSha256,sha(img));assert.equal(r.containerSha256,sha(raw));
 assert.equal(r.resetVector,"0x00410101");assert(r.stackPlausible&&r.resetPlausible);
 assert.equal(r.containerIntegrity,"passed");
}

// Each kind of damage is rejected with a specific reason.
const reject=(mutate,pattern,role=1)=>{const f=frames(role,image(role));mutate(f);assert.throws(()=>inspect(join(f)),pattern);};
reject(f=>{f[1][162]^=1;},/checksum mismatch at packet 0/);
reject(f=>{f[2][20]^=1;},/checksum mismatch at packet 1/);
reject(f=>{f[0][4]=0x18;},/not a Cobalt update frame/);
reject(f=>{f[2][6]=2;},/mixed image roles/);
reject(f=>{f.pop();},/missing end frame/);
reject(f=>{f.splice(3,1);},/unexpected data packet 2/);
reject(f=>{f.splice(f.length-2,1);},/incomplete image/);
reject(f=>{[f[1],f[2]]=[f[2],f[1]];},/unexpected data packet 0/);
reject(f=>{f[1][30]=0x80;},/non MIDI data byte/);
reject(f=>{f.push([0x01]);},/unexpected frame/);
reject(f=>{f.shift();},/missing start frame/);
reject(f=>{f[f.length-1].pop();},/unterminated frame/);
assert.throws(()=>inspect(join(frames(1,image(1),{padding:1}))),/nonzero padding/);
assert.throws(()=>inspect(Buffer.alloc(4)),/unexpected input size/);

// Implausible vectors are reported, not rejected.
{const img=image(2);img.writeUInt32LE(0x00001000,0);img.writeUInt32LE(0x410100,4);const r=inspect(join(frames(2,img)));assert(!r.stackPlausible&&!r.resetPlausible);}

// Inventory needs exactly one file per role, and the CLI exits non-zero with a reason on bad input.
const dir=fs.mkdtempSync(path.join(os.tmpdir(),"cobalite-audit-"));
try{
 const file=(name,role,img=image(role))=>{const p=path.join(dir,name);fs.writeFileSync(p,join(frames(role,img)));return p;};
 const files=[file("slave.syx",2),file("panel.syx",0),file("master.syx",1)];
 const inv=inventory(files);
 assert.equal(inv.format,"cobalite-stock-inventory-v1");assert.deepEqual(inv.images.map(x=>x.role),["panel","master","slave"]);
 assert.throws(()=>inventory(files.slice(0,2)),/exactly three/);
 assert.throws(()=>inventory([files[0],files[0],files[1]]),/three distinct roles/);
 const cli=path.join(__dirname,"firmware-audit.cjs");
 const ok=JSON.parse(execFileSync(process.execPath,[cli,...files],{encoding:"utf8"}));
 assert.deepEqual(ok,inv);
 const bad=path.join(dir,"bad.syx");fs.writeFileSync(bad,Buffer.from([0xF0,1,2,0xF7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]));
 let failed=false;try{execFileSync(process.execPath,[cli,files[0],files[1],bad],{encoding:"utf8",stdio:["ignore","pipe","pipe"]});}catch(e){failed=true;assert.equal(e.status,1);assert.match(e.stderr,/Audit rejected:/);}
 assert(failed,"CLI should reject a malformed file");
}finally{fs.rmSync(dir,{recursive:true,force:true});}

console.log("firmware-audit: valid decode and hashes, 14 rejection cases, plausibility flags, inventory roles and CLI exit codes passed.");
