"use strict";

import jsonwebtoken from "jsonwebtoken";
import { unauthorized } from "./../controller/res.js";
const {sign, verify } = jsonwebtoken;
const tempKey = "SIMPLEBKS_TEST_20202-01-14-mrbeyond";

const createToken=async(payload)=>{
  let token = await sign(payload, tempKey);
  return token;
}

const verifyToken=async(token)=>{
  let payload = await verify(token, tempKey);
  // console.log({payload});
  return payload;
}

const authenticateToken=async(req, res, next)=>{
  let { authorization } = req.headers;
    if(!authorization) return unauthorized(res);
    let token = authorization.split(" ")[1]; // get the  token in [1]
    if(!token) return unauthorized(res);
    try {
      /** Verify the token */
      const payload = await verifyToken(token);
      req.auth_creds = payload; 
      next();  
    } catch (e) {
      return unauthorized(res);
    }
}



export default {
  createToken,
  verifyToken,
  authenticateToken
}