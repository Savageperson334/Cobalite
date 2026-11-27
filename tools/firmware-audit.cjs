#!/usr/bin/env node
/* Read-only inventory of user-supplied Cobalt firmware containers.
 * Original implementation from documented framing; no firmware, write or MIDI commands.
 */
"use strict";
const fs=require("node:fs"),crypto=require("node:crypto"),path=require("node:path");
const roles=["panel","master","slave"],sha=b=>crypto.createHash("sha256").update(b).digest("hex");
function inspect(raw){
 if(!Buffer.isBuffer(raw)||raw.length<20||raw.length>8*1024*1024)throw Error("unexpected input size");
 let pos=0,role=-1,count=0,index=0,ended=false,first=null,hash=crypto.createHash("sha256");
 while(pos<raw.length){
  if(ended||raw[pos]!==240)throw Error("unexpected frame at "+pos);
  const end=raw.indexOf(247,pos+1);if(end<0)throw Error("unterminated frame");
  const frame=raw.subarray(pos,end+1);pos=end+1;
  if(frame.length<9||frame[1]!==0||frame[2]!==0x21||frame[3]!==7||frame[4]!==0x19||frame[5]!==0||frame[6]>2)throw Error("not a Cobalt update frame");
  if(frame.subarray(1,-1).some(x=>x>127))throw Error("non MIDI data byte");
  const command=frame[7];
  if(role<0){
   if(command!==127||frame.length!==11)throw Error("missing start frame");
   role=frame[6];count=frame[8]+128*frame[9];if(count<1||count>8192)throw Error("unexpected image packet count");continue;
  }
  if(role!==frame[6])throw Error("mixed image roles");
  if(command===126){if(frame.length!==9||index!==count)throw Error("incomplete image");ended=true;continue;}
  if(command!==0||frame.length!==167||frame[8]+128*frame[9]!==index||index>=count)throw Error("unexpected data packet "+index);
  const unpacked=Buffer.alloc(133);
  for(let group=0;group<19;group++){const bits=frame[17+group*8];for(let j=0;j<7;j++)unpacked[group*7+j]=frame[10+group*8+j]|(((bits>>(6-j))&1)<<7);}
  if(unpacked.subarray(128).some(x=>x!==0))throw Error("nonzero padding");
  let sum=0;for(let i=0;i<128;i++)sum+=unpacked[i];const seal=[(sum>>8)&15,(sum>>12)&15,sum&15,(sum>>4)&15];if(seal.some((x,i)=>x!==frame[162+i]))throw Error("checksum mismatch at packet "+index);
  const bytes=unpacked.subarray(0,128);if(!first)first=Buffer.from(bytes);hash.update(bytes);index++;
 }
 if(!ended||!first)throw Error("missing end frame");
 const stack=first.readUInt32LE(0),reset=first.readUInt32LE(4),base=0x410000;
 const stackPlausible=role===0?stack>=0x20000000&&stack<=0x20020000:stack>=0x20400000&&stack<=0x20460000;
 const resetPlausible=(reset&1)===1&&(reset-1)>=base&&(reset-1)<base+count*128;
 const hex=x=>"0x"+x.toString(16).padStart(8,"0");
 return {role:roles[role],packetCount:count,containerBytes:raw.length,imageBytes:count*128,containerSha256:sha(raw),imageSha256:hash.digest("hex"),initialStack:hex(stack),resetVector:hex(reset),stackPlausible,resetPlausible,containerIntegrity:"passed"};
}
function inventory(files){
 if(files.length!==3)throw Error("supply exactly three stock Cobalt .syx files (panel/master/slave)");
 const report=files.map(file=>({file:path.basename(file),...inspect(fs.readFileSync(file))}));
 if(new Set(report.map(x=>x.role)).size!==3)throw Error("need all three distinct roles");
 return {format:"cobalite-stock-inventory-v1",warning:"Checksums and plausible vectors do not establish authenticity, version matching, compatibility or safe recovery. No device access.",images:report.sort((a,b)=>roles.indexOf(a.role)-roles.indexOf(b.role))};
}
if(require.main===module){try{console.log(JSON.stringify(inventory(process.argv.slice(2)),null,2));}catch(e){console.error("Audit rejected: "+e.message);process.exitCode=1;}}
module.exports={inspect,inventory};
