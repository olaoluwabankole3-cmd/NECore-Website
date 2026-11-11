// Vercel serverless function. No credentials are committed to the repository.
// Configure RESEND_API_KEY, CONTACT_TO_EMAIL and CONTACT_FROM_EMAIL in Vercel Project Settings.
module.exports = async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Method not allowed.'})}
  const {RESEND_API_KEY,CONTACT_TO_EMAIL,CONTACT_FROM_EMAIL}=process.env;
  if(!RESEND_API_KEY||!CONTACT_TO_EMAIL||!CONTACT_FROM_EMAIL){return res.status(503).json({error:'Demo enquiries are not configured yet. Please contact the NECore team through its approved business channel.'})}
  const b=req.body||{};
  if(b.website){return res.status(200).json({ok:true})} // bot honeypot
  const clean=(s,max)=>typeof s==='string'?s.trim().slice(0,max):'';
  const fullName=clean(b.fullName,100),email=clean(b.email,160),company=clean(b.company,120),role=clean(b.role,100),interest=clean(b.interest,90),message=clean(b.message,2000);
  if(fullName.length<2||!/^\S+@\S+\.\S+$/.test(email)||!company||!interest||message.length<10||b.agree!=='on')return res.status(400).json({error:'Please complete the required fields and consent checkbox.'});
  const permitted=['Verification engine','Risk intelligence','Compliance workflows','API & developer integration','Pilot partnership','General enquiry'];
  if(!permitted.includes(interest))return res.status(400).json({error:'Please select a valid area of interest.'});
  const content=[`NECore public website enquiry`,`Full name: ${fullName}`,`Work email: ${email}`,`Organization: ${company}`,`Role: ${role}`,`Interest: ${interest}`,`Message:`,message].join('\n');
  try{
    const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:CONTACT_FROM_EMAIL,to:[CONTACT_TO_EMAIL],subject:`NECore enquiry: ${interest}`,text:content,reply_to:email}),signal:AbortSignal.timeout(12000)});
    if(!response.ok)return res.status(502).json({error:'Email delivery is temporarily unavailable. Please try again later.'});
    return res.status(200).json({ok:true});
  }catch{return res.status(502).json({error:'Unable to deliver your enquiry at this time. Please try again later.'})}
};
