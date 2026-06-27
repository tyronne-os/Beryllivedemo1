import { NextRequest, NextResponse } from "next/server";
import fs from "fs"; import path from "path";

export async function POST(req: NextRequest) {
  try {
    const {name,email} = await req.json();
    if (!name||!email) return NextResponse.json({error:"Missing fields"},{status:400});
    const file = path.join(process.cwd(),"leads.json");
    const leads = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file,"utf-8")) : [];
    leads.push({name,email,ts:new Date().toISOString()});
    fs.writeFileSync(file,JSON.stringify(leads,null,2));
    return NextResponse.json({ok:true});
  } catch { return NextResponse.json({error:"Server error"},{status:500}); }
}
