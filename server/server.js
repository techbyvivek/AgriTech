require('dotenv').config();
const app=require('./app');
const connectDB=require('./config/db');
const port=Number(process.env.PORT)||8000;
async function start(){
  if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32)throw new Error('JWT_SECRET must be configured with at least 32 characters in server/.env');
  await connectDB();
  app.listen(port,()=>console.log(`Agri-Tech API running at http://localhost:${port}`));
}
start().catch(err=>{console.error('Startup failed:',err.message);process.exit(1);});
