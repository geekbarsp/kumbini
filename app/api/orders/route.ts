import { NextRequest, NextResponse } from 'next/server';
import { prepareDatabase } from '@/db/repository';

export const dynamic='force-dynamic';

export async function GET(request:NextRequest){
  const orderId=request.nextUrl.searchParams.get('orderId')?.trim().toUpperCase();
  const email=request.nextUrl.searchParams.get('email')?.trim().toLowerCase();
  if(!orderId||!email)return NextResponse.json({error:'Enter your order number and checkout email.'},{status:400});
  const db=await prepareDatabase();
  const order=await db.prepare('SELECT id,status,total,customer_name as customerName,city,created_at as createdAt FROM orders WHERE id=? AND lower(email)=?').bind(orderId,email).first<Record<string,unknown>>();
  if(!order)return NextResponse.json({error:'We could not find an order with those details.'},{status:404});
  const items=await db.prepare('SELECT product_name as productName,unit_price as unitPrice,quantity FROM order_items WHERE order_id=?').bind(orderId).all<Record<string,unknown>>();
  return NextResponse.json({order:{...order,items:items.results}});
}
