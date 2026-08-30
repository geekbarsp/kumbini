import { NextResponse } from 'next/server';
import { prepareDatabase, type Product } from '@/db/repository';

export const dynamic = 'force-dynamic';

export async function GET(){
  try{
    const db=await prepareDatabase();
    const result=await db.prepare('SELECT id,slug,name,maker,category,description,story,image,price,stock,featured FROM products WHERE stock > 0 ORDER BY featured DESC, created_at DESC').all<Product>();
    return NextResponse.json({products:result.results});
  }catch(error){
    console.error('Product catalog error',error);
    return NextResponse.json({error:'Catalog unavailable'},{status:500});
  }
}
