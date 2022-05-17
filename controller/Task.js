"use strict";

import middleware from "./../middleware/auth.js";
const { createToken } = middleware;
import DB from "./../db.js";
import { badRequest, internal, notFound, success } from "./res.js";

class Task{

  static async authenticate(req, res){
    try {
      const {seller} = await DB();
      let { seller_zip_code_prefix, seller_id} = req.body;

      if(!seller_id || ! seller_zip_code_prefix){
        return badRequest(res, "zip_code_prefix and seller_id required");
      }
      const _seller = await seller.findOne({seller_id, seller_zip_code_prefix});
      if(!_seller){
        return notFound(res, "Not matched details");
      }
      const token = await createToken({ seller_zip_code_prefix, seller_id});
      return success(res, {data:_seller, token});      
    } catch (error) {
      return internal(res, error.stack)
    }
  }

  static processQuery(req){
    let limit = Number(req.query.limit);
    limit = isNaN(limit)?20:(limit>100?100:(limit<1?20:limit));
    let offset = Number(req.query.offset);
    offset = isNaN(offset)?0:offset;
    let sort = req.query.sort?? "shipping_limit_date"
    sort = sort.toLowerCase()=="price"? "price":sort;
    let dir = req.query.dir?? "ASC";
    dir = dir.toUpperCase() == "DESC"? -1: 1;
    return {offset,  limit, sort, dir}
  }

  static async getOrders(req, res){
    try {
      const { order} = await DB();
      const {seller_id} = req.auth_creds;
      const {limit, offset, dir, sort} = Task.processQuery(req);
      const cursor = await order.aggregate([
        {
          $facet:{
            "data":[
              { $match:{ seller_id:seller_id }},
              {$sort:{[sort]:dir}},
              {'$lookup':{
                from:'product',
                localField:'product_id',//fildname of a
                foreignField:'product_id',//field name of b
                as:'products' // you can also use id fiels it will replace id with the document
              }},
              {$unwind:"$products"},
              {$project:{
              _id:0,
              id: "$order_item_id",
              product_id: 1,
              order_id: "$order_id",
              product_category: "$products.product_category_name",
              price: 1,
              date: "$shipping_limit_date"
              }},
              {$skip:offset},
              {$limit:limit}
            ],
            "total":[
              { $match:{ seller_id:seller_id }},
              {$count: "total"}
            ]
          },
        },
        { $set: { total: { $first: "$total.total" } } }
      ]
      ).toArray()


     const orders = Object.assign({},{...cursor[0],offset, limit} );
     

      return success(res, orders)

    } catch (error) {
      return internal(res, error.stack)
    }
  }

  static async getSingleOrder(req, res){
    try {
      const { order} = await DB();
      let {id} = req.params;
      const cursor = await order.aggregate([
        { $match:{ order_id:id }},
        {'$lookup':{
          from:'product',
          localField:'product_id',//fildname of a
          foreignField:'product_id',//field name of b
          as:'products' // you can also use id fiels it will replace id with the document
        }},
        {$unwind:"$products"},
        {$project:{
        _id:0,
        id: "$order_item_id",
        product_id: 1,
        order_id: "$order_id",
        product_category: "$products.product_category_name",
        price: 1,
        date: "$shipping_limit_date"
        }},
      ]).toArray();
      if(!cursor.length) return notFound(res)
      return success(res,{data:cursor[0]});

    } catch (error) {
      return internal(res, error.stack)
    }
  }

  static async deleteOrder(req, res){
    try {
      const { order} = await DB();
      let {id} = req.params;

      // NOTE: in real project the query should confirm both order_id and 
      // const {seller_id} = req.auth_creds; 
      // order owner of matches current seller.

      const cursor = await order.deleteOne({order_id:id})
      const count = cursor.deletedCount;
      if(count) return success(res,{message:"Successfuly deleted"});
      return res.status(403).send({message:"You are forbidden to perform this operation"})
    } catch (error) {
      return internal(res, error.stack)
    }
  }

 static async updateSeller(req, res){
   try {
    const {seller} = await DB();
    const {seller_id} = req.auth_creds;
    const {seller_city, seller_state } = req.body;
    if(!seller_city && ! seller_state) return badRequest(res);
    const payload={};
    if(seller_city) payload.seller_city = seller_city
    if(seller_state) payload.seller_state = seller_state

    seller.findOneAndUpdate({seller_id}, 
        { $set:payload }, {returnDocument:"after"},
        (err, result)=>{

          if(err) return internal(res, err.stack);

          const data = {
              seller_city: result.value.seller_city,
              seller_state: result.value.seller_state,
            }

          return success(res, {data});

        }
      );
   } catch (error) {
    return internal(res, error.stack)
   }
 }


}


export default Task