import { NextRequest, NextResponse } from 'next/server';
import { prepareDatabase, type Product } from '@/db/repository';

type CheckoutBody={customer?:{name?:string;email?:string;phone?:string;address?:string;city?:string;postalCode?:string};paymentMethod?:string;items?:Array<{productId:string;quantity:number}>};

export async function POST(request:NextRequest){
  try{
    const body=(await request.json()) as CheckoutBody;
    const c=body.customer;
    if(!c?.name||!c.email?.includes('@')||!c.phone||!c.address||!c.city||!c.postalCode||!body.items?.length)return NextResponse.json({error:'Please complete every checkout field.'},{status:400});
    if(!['cod','bank'].includes(body.paymentMethod||''))return NextResponse.json({error:'Choose a valid payment method.'},{status:400});
    const quantities=new Map<string,number>();
    for(const item of body.items){if(!item.productId||!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>10)return NextResponse.json({error:'Invalid cart quantity.'},{status:400});quantities.set(item.productId,(quantities.get(item.productId)||0)+item.quantity)}
    const db=await prepareDatabase();
    const products:Product[]=[];
    for(const [id,quantity] of quantities){const product=await db.prepare('SELECT id,slug,name,maker,category,description,story,image,price,stock,featured FROM products WHERE id=?').bind(id).first<Product>();if(!product||product.stock<quantity)return NextResponse.json({error:`${product?.name||'An item'} is no longer available in that quantity.`},{status:409});products.push(product)}
    const subtotal=products.reduce((sum,p)=>sum+p.price*(quantities.get(p.id)||0),0);
    const shipping=subtotal>=500000?0:18000;
    const id=`KMB-${crypto.randomUUID().slice(0,8).toUpperCase()}`;
    const statements=[db.prepare('INSERT INTO orders (id,user_id,email,customer_name,phone,address,city,postal_code,payment_method,status,subtotal,shipping,total,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,null,c.email.trim().toLowerCase(),c.name.trim(),c.phone.trim(),c.address.trim(),c.city.trim(),c.postalCode.trim(),body.paymentMethod,'confirmed',subtotal,shipping,subtotal+shipping,Date.now())];
    for(const p of products){const q=quantities.get(p.id)!;statements.push(db.prepare('INSERT INTO order_items (order_id,product_id,product_name,unit_price,quantity) VALUES (?,?,?,?,?)').bind(id,p.id,p.name,p.price,q));statements.push(db.prepare('UPDATE products SET stock=stock-? WHERE id=? AND stock>=?').bind(q,p.id,q))}
    await db.batch(statements);
    return NextResponse.json({order:{id,total:subtotal+shipping,status:'confirmed'}});
  }catch(error){console.error('Checkout error',error);return NextResponse.json({error:'We could not place your order. Please try again.'},{status:500})}
}
