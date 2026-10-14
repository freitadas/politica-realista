import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { rateLimit } from 'express-rate-limit';
import pg from 'pg';

// This service is optional. The GitHub + Render Static Site runs independently.
const PORT = Number(process.env.PORT || 3000);
const DATABASE_URL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;
if (!DATABASE_URL || !JWT_SECRET || JWT_SECRET.length < 32 || !CLIENT_ORIGIN) {
  console.error('Set DATABASE_URL, CLIENT_ORIGIN and a random JWT_SECRET of 32+ chars');
  process.exit(1);
}
const pool = new pg.Pool({connectionString:DATABASE_URL, max:5, ssl: process.env.DB_SSL === 'true' ? {rejectUnauthorized:true}:undefined});
const app=express();
app.disable('x-powered-by');
app.set('trust proxy',1);
app.use(helmet());
const origins = CLIENT_ORIGIN.split(',').map(x=>x.trim()).filter(Boolean);
app.use(cors({origin(origin,cb){if(!origin||origins.includes(origin))return cb(null,true);return cb(new Error('Origin not allowed'));},methods:['GET','POST','DELETE','OPTIONS'],allowedHeaders:['Content-Type','Authorization']}));
app.use(express.json({limit:'1mb'}));
app.use(rateLimit({windowMs:15*60*1000,limit:150,standardHeaders:'draft-7',legacyHeaders:false}));
app.get('/api/health',async(req,res)=>{
  try {await pool.query('SELECT 1');res.json({ok:true,service:'mandato-cloud'});} catch {res.status(503).json({ok:false});}
});
const authLimiter=rateLimit({windowMs:15*60*1000,limit:12,standardHeaders:'draft-7',legacyHeaders:false});
const fail=(res,code,message)=>res.status(code).json({error:message});
const validEmail=(email)=>typeof email==='string' && email.length<=120 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validPassword=(pass)=>typeof pass==='string'&&pass.length>=10&&pass.length<=128;
const makeToken=(id)=>jwt.sign({sub:id},JWT_SECRET,{expiresIn:'7d',issuer:'mandato',audience:'mandato-game'});

app.post('/api/auth/register',authLimiter,async(req,res)=>{
  const email=String(req.body?.email||'').toLowerCase().trim(),password=req.body?.password;
  if(!validEmail(email)||!validPassword(password))return fail(res,400,'E-mail ou senha inválidos');
  try {
    const passwordHash=await bcrypt.hash(password,12);
    const created=await pool.query('INSERT INTO mandato_users (email,password_hash) VALUES ($1,$2) ON CONFLICT (email) DO NOTHING RETURNING id',[email,passwordHash]);
    if(!created.rowCount)return fail(res,409,'Essa conta já existe');
    res.status(201).json({token:makeToken(created.rows[0].id)});
  }catch(e){console.error('register failed',e.message);return fail(res,500,'Falha interna');}
});
app.post('/api/auth/login',authLimiter,async(req,res)=>{
  const email=String(req.body?.email||'').toLowerCase().trim(),password=req.body?.password;
  if(!validEmail(email)||!validPassword(password))return fail(res,400,'Credenciais inválidas');
  try {
    const result=await pool.query('SELECT id,password_hash FROM mandato_users WHERE email=$1',[email]);
    const valid=result.rowCount>0 && await bcrypt.compare(password,result.rows[0].password_hash);
    if(!valid)return fail(res,401,'E-mail ou senha incorretos');
    res.json({token:makeToken(result.rows[0].id)});
  }catch(e){console.error('login failed',e.message);return fail(res,500,'Falha interna');}
});
function mustAuth(req,res,next){
  const token=req.headers.authorization?.match(/^Bearer (\S+)$/i)?.[1];
  if(!token)return fail(res,401,'Sessão não autenticada');
  try {req.userId=jwt.verify(token,JWT_SECRET,{issuer:'mandato',audience:'mandato-game'}).sub;next();}
  catch {return fail(res,401,'Sessão expirada ou inválida');}
}
app.use('/api/saves',mustAuth);
const validId=s=>typeof s==='string' && /^[a-zA-Z0-9_-]{1,90}$/.test(s);
app.get('/api/saves',async(req,res)=>{
  try {const result=await pool.query('SELECT slot_id AS "slotId",name,updated_at AS "updatedAt" FROM mandato_saves WHERE user_id=$1 ORDER BY updated_at DESC',[req.userId]);res.json({saves:result.rows});}
  catch(e){console.error(e.message);fail(res,500,'Falha ao listar salvamentos');}
});
app.get('/api/saves/:slotId',async(req,res)=>{
  if(!validId(req.params.slotId))return fail(res,400,'ID inválido');
  try {const r=await pool.query('SELECT data FROM mandato_saves WHERE user_id=$1 AND slot_id=$2',[req.userId,req.params.slotId]);if(!r.rowCount)return fail(res,404,'Carreira não encontrada');res.json({data:r.rows[0].data});}
  catch(e){console.error(e.message);fail(res,500,'Falha ao carregar');}
});
app.post('/api/saves',async(req,res)=>{
  const {slotId,name,data}=req.body||{};
  if(!validId(slotId)||typeof name!=='string'||name.length>90||!data||typeof data!=='object'||Array.isArray(data)||typeof data.candidate!=='string'||!Array.isArray(data.regions))return fail(res,400,'Dados do jogo inválidos');
  try {
    const r=await pool.query('SELECT count(*)::int AS n FROM mandato_saves WHERE user_id=$1',[req.userId]);
    const existing=await pool.query('SELECT 1 FROM mandato_saves WHERE user_id=$1 AND slot_id=$2',[req.userId,slotId]);
    if(!existing.rowCount&&r.rows[0].n>=5)return fail(res,409,'Limite de cinco carreiras na nuvem');
    await pool.query('INSERT INTO mandato_saves(user_id,slot_id,name,data,updated_at) VALUES($1,$2,$3,$4,NOW()) ON CONFLICT(user_id,slot_id) DO UPDATE SET name=EXCLUDED.name,data=EXCLUDED.data,updated_at=NOW()', [req.userId,slotId,name,JSON.stringify(data)]);
    res.json({saved:true});
  }catch(e){console.error(e.message);fail(res,500,'Falha ao salvar');}
});
app.delete('/api/saves/:slotId',async(req,res)=>{
  if(!validId(req.params.slotId))return fail(res,400,'ID inválido');
  try{await pool.query('DELETE FROM mandato_saves WHERE user_id=$1 AND slot_id=$2',[req.userId,req.params.slotId]);res.json({deleted:true});}
  catch(e){console.error(e.message);fail(res,500,'Falha ao excluir');}
});
app.use((err,req,res,next)=>{console.error('request error',err.message);res.status(400).json({error:'Requisição não aceita'});});
try {
  await pool.query(`CREATE TABLE IF NOT EXISTS mandato_users (
    id BIGSERIAL PRIMARY KEY,email VARCHAR(120) UNIQUE NOT NULL,password_hash TEXT NOT NULL,created_at TIMESTAMPTZ DEFAULT NOW());`);
  await pool.query(`CREATE TABLE IF NOT EXISTS mandato_saves (
    user_id BIGINT NOT NULL REFERENCES mandato_users(id) ON DELETE CASCADE,
    slot_id VARCHAR(90) NOT NULL,name VARCHAR(90) NOT NULL,data JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),PRIMARY KEY(user_id,slot_id));`);
  app.listen(PORT,'0.0.0.0',()=>console.log(`Mandato Cloud listening on ${PORT}`));
} catch(e) {console.error('Database setup failed',e.message);process.exit(1);}
