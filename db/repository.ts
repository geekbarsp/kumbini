import { createClient, type Client, type InStatement } from '@libsql/client';

export type Product = { id:string; slug:string; name:string; maker:string; category:string; description:string; story:string; image:string; price:number; stock:number; featured:number };

let client:Client|undefined;
function getClient(){
  client??=createClient({url:process.env.TURSO_DATABASE_URL||'file:local.db',authToken:process.env.TURSO_AUTH_TOKEN});
  return client;
}

class Statement{
  args:unknown[]=[];
  constructor(public sql:string){}
  bind(...args:unknown[]){this.args=args;return this}
  async run(){return getClient().execute({sql:this.sql,args:this.args as never[]})}
  async first<T>(){const result=await this.run();return (result.rows[0] as T|undefined)??null}
  async all<T>(){const result=await this.run();return {results:result.rows as unknown as T[]}}
  toInput():InStatement{return {sql:this.sql,args:this.args as never[]}}
}

class Database{
  prepare(sql:string){return new Statement(sql)}
  async batch(statements:Statement[]){return getClient().batch(statements.map(s=>s.toInput()),'write')}
}
const database=new Database();

const seed: Product[] = [
  {id:'chair-solihiya',slug:'solihiya-lounge-chair',name:'Solihiya Lounge Chair',maker:'Casa Marikit',category:'Home',description:'A low lounge chair hand-caned in traditional solihiya weave, with a solid Philippine mahogany frame.',story:'Built in Pampanga by a third-generation furniture workshop.',image:'https://images.unsplash.com/photo-1598300056393-4aac492f4344?auto=format&fit=crop&w=1000&q=85',price:1280000,stock:8,featured:1},
  {id:'tote-habi',slug:'handwoven-market-tote',name:'Handwoven Market Tote',maker:'Habi Studio',category:'Accessories',description:'An everyday carryall woven from abacá and finished with vegetable-tanned leather handles.',story:'Woven over three days by a small women-led cooperative in Bicol.',image:'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1000&q=85',price:245000,stock:22,featured:1},
  {id:'stoneware-taal',slug:'taal-stoneware-set',name:'Taal Stoneware Set',maker:'Likhang Lupa',category:'Tableware',description:'Four softly speckled stoneware pieces, wheel-thrown and glazed by hand.',story:'Each piece is fired in small batches in a Batangas hillside studio.',image:'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1000&q=85',price:390000,stock:16,featured:1},
  {id:'lamp-capiz',slug:'capiz-glow-lamp',name:'Capiz Glow Lamp',maker:'Isla Lightworks',category:'Home',description:'A warm table light built from hand-cut capiz shell and brushed brass.',story:'Assembled by artisan metalworkers and shell cutters in Cebu.',image:'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=85',price:565000,stock:11,featured:0},
  {id:'throw-inabel',slug:'inabel-grid-throw',name:'Inabel Grid Throw',maker:'Amianan Loom',category:'Textiles',description:'A graphic cotton throw woven on traditional upright looms.',story:'The pattern is a modern study of classic Ilocano binakul geometry.',image:'https://images.unsplash.com/photo-1583845112203-454c2254edb3?auto=format&fit=crop&w=1000&q=85',price:320000,stock:18,featured:0},
  {id:'tray-narra',slug:'narra-serving-tray',name:'Narra Serving Tray',maker:'Ukit Works',category:'Tableware',description:'A sculptural serving tray shaped from responsibly reclaimed narra.',story:'Carved and finished by hand in a Laguna family workshop.',image:'https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?auto=format&fit=crop&w=1000&q=85',price:285000,stock:14,featured:0},
  {id:'vase-terracotta',slug:'terracotta-stem-vase',name:'Terracotta Stem Vase',maker:'Likhang Lupa',category:'Home',description:'A tall, tactile vessel for a single dramatic branch or gathered stems.',story:'Hand-coiled with locally sourced clay and fired to a sun-warmed tone.',image:'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1000&q=85',price:175000,stock:20,featured:0},
  {id:'pouch-pandan',slug:'pandan-weekend-pouch',name:'Pandan Weekend Pouch',maker:'Habi Studio',category:'Accessories',description:'A softly structured woven pouch with cotton lining and brass zip.',story:'Natural pandan leaves are prepared, dyed, and woven entirely by hand.',image:'https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=1000&q=85',price:128000,stock:25,featured:0},
];

export async function prepareDatabase(){
  const db=database;
  await db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, maker TEXT NOT NULL, category TEXT NOT NULL, description TEXT NOT NULL, story TEXT NOT NULL, image TEXT NOT NULL, price INTEGER NOT NULL, stock INTEGER NOT NULL DEFAULT 0, featured INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL)'),
    db.prepare('CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, user_id TEXT, email TEXT NOT NULL, customer_name TEXT NOT NULL, phone TEXT NOT NULL, address TEXT NOT NULL, city TEXT NOT NULL, postal_code TEXT NOT NULL, payment_method TEXT NOT NULL, status TEXT NOT NULL DEFAULT \'confirmed\', subtotal INTEGER NOT NULL, shipping INTEGER NOT NULL, total INTEGER NOT NULL, created_at INTEGER NOT NULL)'),
    db.prepare('CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT NOT NULL REFERENCES orders(id), product_id TEXT NOT NULL REFERENCES products(id), product_name TEXT NOT NULL, unit_price INTEGER NOT NULL, quantity INTEGER NOT NULL)'),
    db.prepare('CREATE TABLE IF NOT EXISTS wishlists (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, product_id TEXT NOT NULL REFERENCES products(id), created_at INTEGER NOT NULL)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_orders_user_created ON orders(user_id, created_at)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)'),
    db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_wishlists_user_product ON wishlists(user_id, product_id)'),
  ]);
  for(const p of seed){await db.prepare('INSERT OR IGNORE INTO products (id,slug,name,maker,category,description,story,image,price,stock,featured,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').bind(p.id,p.slug,p.name,p.maker,p.category,p.description,p.story,p.image,p.price,p.stock,p.featured,Date.now()).run()}
  return db;
}
