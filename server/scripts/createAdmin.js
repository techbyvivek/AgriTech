require('dotenv').config();
const readline=require('readline');
const bcrypt=require('bcryptjs');
const mongoose=require('mongoose');
const User=require('../models/User');
const rl=readline.createInterface({input:process.stdin,output:process.stdout});
const ask=q=>new Promise(resolve=>rl.question(q,resolve));
(async()=>{try{
  if(!process.env.MONGO_URI)throw new Error('MONGO_URI missing in .env');
  await mongoose.connect(process.env.MONGO_URI);
  const name=(await ask('Admin name: ')).trim();
  const email=(await ask('Admin email: ')).trim().toLowerCase();
  const password=await ask('Admin password (minimum 12 characters): ');
  if(!name||!email||password.length<12)throw new Error('Name/email are required and password must be at least 12 characters.');
  if(await User.exists({email}))throw new Error('An account with this email already exists.');
  const hash=await bcrypt.hash(password,12);
  await User.create({name,email,password:hash,role:'admin',isVerified:true});
  console.log('Admin account created. Keep these credentials secure.');
}catch(e){console.error('Could not create admin:',e.message);process.exitCode=1;}finally{rl.close();await mongoose.disconnect().catch(()=>{});}})();
