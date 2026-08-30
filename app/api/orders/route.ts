import { NextResponse } from 'next/server';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { prepareDatabase } from '@/db/repository';

export const dynamic='force-dynamic';

export async function GET(){
  const user=await getChatGPTUser();
  if(!user)return NextResponse.json({error:'Sign in to see your orders.'},{status:401});
  const db=await prepareDatabase();
  const orders=await db.prepare('SELECT id,status,total,created_at as createdAt FROM orders WHERE user_id=? ORDER BY created_at DESC').bind(user.userId).all();
  return NextResponse.json({orders:orders.results,user:{email:user.email,name:user.displayName}});
}
