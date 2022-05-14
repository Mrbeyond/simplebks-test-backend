import  cstToJson  from "./csvToJSON.js";
const {csvToJSON} = cstToJson
import { MongoClient } from "mongodb";
// local connection below not used
// const uri = 'mongodb://localhost:27017';
const uri = "mongodb+srv://simplebks:dldauA5SxdxnzM9j@cluster0.jrm6k.mongodb.net/application?retryWrites=true&w=majority";


// Database Name
const dbName = 'application';



const client = new MongoClient(uri, {useNewUrlParser: true,useUnifiedTopology: true});

const DB=async()=>{
  try {
    await client.connect();

  const database = client.db(dbName);
    

  // shortened the collection name
  const seller = database.collection("seller");
  const order = database.collection("order");
  const product = database.collection("product");

  database.listCollections().toArray()
  .then(async(collections)=>{
    // console.log({collections});

    // if no collections
    if(!collections.length){
      const sellers = await csvToJSON("olist_sellers_dataset.csv");
      const orders = await csvToJSON("olist_order_items_dataset.csv");
      const products = await csvToJSON("olist_products_dataset.csv");

      // console.log(sellers.length, typeof sellers);
      // console.log(orders.length, typeof orders);
      // console.log(products.length, typeof products);

      await seller.insertMany(sellers);
      await order.insertMany(orders);
      await product.insertMany(products);

    }
  })
  
  return { database, seller, product, order }
  } catch (error) {      
    console.log({error});
    process.exit(1)
  }
} 



export default DB