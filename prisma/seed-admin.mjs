import "dotenv/config";
import {randomBytes,scrypt as scryptCallback} from "node:crypto";
import {promisify} from "node:util";
import {PrismaPg} from "@prisma/adapter-pg";
import {PrismaClient} from "../src/generated/prisma/client.js";
const scrypt=promisify(scryptCallback);
const email=process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password=process.env.ADMIN_INITIAL_PASSWORD;
const name=process.env.ADMIN_NAME||"Diamond Black Administrator";
if(!email||!password||password.length<14||!process.env.DATABASE_URL)throw new Error("Set DATABASE_URL, ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD (minimum 14 characters).");
const salt=randomBytes(16).toString("hex");
const derived=await scrypt(password,salt,64);
const hash=Buffer.from(derived).toString("hex");
const passwordHash="scrypt$"+salt+"$"+hash;
const prisma=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
try{const exists=await prisma.adminUser.findUnique({where:{email}});if(exists)console.log("Administrator already exists; no changes made.");else{await prisma.adminUser.create({data:{email,name,passwordHash,role:"SUPER_ADMIN"}});console.log("Administrator provisioned. Remove ADMIN_INITIAL_PASSWORD now.");}}finally{await prisma.$disconnect();}
