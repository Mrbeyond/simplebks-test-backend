import chai, { assert } from "chai";
import chaiHttp from "chai-http";

import app from "./../index.js";

const {expect, should} = chai
should();


chai.use(chaiHttp);

describe("Authenticate", ()=>{
  const correctDetails = { 
    seller_id: "2a1348e9addc1af5aaa619b1a3679d6b",
    seller_zip_code_prefix: "30494"
  }

  const incorrectDetails = { 
    seller_id: "3442f8959a84dea7ee197c6hgjhjgfghhbjbjb32cb2df15",
    seller_zip_code_prefix: "13023"
  }

  const order_ids = [
    "698b8ecdaf8c15fe44343352cff74210",
    "3e8c191415aece16ba1ac896f535b484",
    "f732c55a86efa8dc400f0f4fae25a411",
    "b18b5fde5616ba3978e71483cf648a26",
    "f7e7da47ef2f5f88532c556e17126566",
    "6785185e9e3d0e547f7c6ae8acc7356e",
    "59f740f135c8060f0c211f5ff37a7245",
    "96e5540d02eba5ac4f6a17083cce7391",
    "7bbb2b4fd60b56329b20353470ec4080",
    "732f26c55f8366066c096f572cb73854",
    "d839ea07a528e914f89702508023da37",
    "d839ea07a528e914f89702508023da37",
    "4b4f4465ed0f3c314fcd6e082d00c288",
    "0259b4edb1ee1ebd0263f59bd790a938",
    "f245b1d57bf493d0db1e6118927db48f",
    "f063fd7dd487e7fbaa3dae8d260b2ec6"
];

  let token;
  


  describe("/Authenticate-with-correct-details", ()=>{
    it("should return 200 Ok", async()=>{
      try {
        const response = await chai.request(app).post("/authenticate")
        .send(correctDetails);

        token = response.body.token;

        response.should.have.status(200);

      } catch (error) {
        throw new Error(error.stack)
      }
    })
    it("Result seller_id should match", async()=>{
      try {
        const response = await chai.request(app).post("/authenticate")
          .send(correctDetails);

        expect(response.body.data.seller_id).to
          .equal(correctDetails.seller_id);

      } catch (error) {
        throw new Error(error.stack)
      }
    })
    it("Result seller_zip_code_prefix should match", async()=>{
      try {
        const response = await chai.request(app).post("/authenticate")
          .send(correctDetails);

        token = response.body.token;

        expect(response.body.data.seller_zip_code_prefix).to
          .equal(correctDetails.seller_zip_code_prefix);

      } catch (error) {
        throw new Error(error.stack)
      }
    })
  })

  describe("/authenticate-with-incorrect-details", ()=>{
    it("should return 404 not found", async()=>{
      try {
        const response = await chai.request(app).post("/authenticate")
          .send(incorrectDetails);

        response.should.have.status(404);
      } catch (error) {
        throw new Error(error.stack)
      }
    })
  })

  describe("/Authenticated users should see order_items", ()=>{

    it("Should return 200 Ok", async()=>{
      try {
        const response = await chai.request(app).get("/order_items")
          .set("Authorization", `Bearer ${token}`);

        response.should.have.status(200);
      } catch (error) {
        throw new Error(error.stack)
      }
    })

    it("Unauthorized seller should return 401 status code", async()=>{
      try {
        const response = await chai.request(app).get("/order_items");

        response.should.have.status(401);
      } catch (error) {
        throw new Error(error.stack)
      }
    })

    it("Data should be an array", async()=>{
      try {
        const response = await chai.request(app).get("/order_items")
          .set("Authorization", `Bearer ${token}`);

        expect(response.body.data).to.be.an("array");

      } catch (error) {
        throw new Error(error.stack)
      }
    })

    it("Limit query should be effective", async()=>{
      try {
        const limit = 20;
        const response = await chai.request(app).get(`/order_items?limit=${limit}`)
          .set("Authorization", `Bearer ${token}`);

        expect(response.body.data).to.have.lengthOf.below(101)
        expect(response.body.data).to.have.lengthOf.below(limit+1)
      } catch (error) {
        throw new Error(error.stack)
      }
    })

    it("Result should have limit, total and offset", async()=>{
      try {
        const response = await chai.request(app).get("/order_items?limit=20")
          .set("Authorization", `Bearer ${token}`);

        expect(response.body).to.have.property("limit");
        expect(response.body).to.have.property("offset");
        expect(response.body).to.have.property("total");
      } catch (error) {
        throw new Error(error.stack)
      }
    })


    it("Result ensure required fields in the data array", async()=>{
      try {
        const response = await chai.request(app).get("/order_items?limit=20")
          .set("Authorization", `Bearer ${token}`);

        if(response.body.data.length){
          const first_item = response.body.data[0];
          expect(first_item).to.be.an('object').that.has.all
          .keys(
            "id",
            "product_id",
            "product_category",
            "price",
            "order_id",
            "date"
          );

        }else{
          return true;
        }
      } catch (error) {
        throw new Error(error.stack)
      }
    })

  })

  describe("/Update user account", ()=>{

    it("Update should return 200 Ok", async()=>{
      try {
        const payload = {seller_city: "test_city", seller_state: "test_state"}
        const response = await chai.request(app).put("/account")
         .send(payload).set("Authorization", `Bearer ${token}`);

        response.should.have.status(200);
      } catch (error) {
        throw new Error(error.stack)
      }
    })

    it("unauthorized seller should return status 401", async()=>{
      try {
        const payload = {seller_city: "test_city", seller_state: "test_state"}
        const response = await chai.request(app).put("/account")
         .send(payload);

        response.should.have.status(401);
      } catch (error) {
        throw new Error(error.stack)
      }
    })

    it("Update either city or state return 200", async()=>{
      try {
        const payload = [{seller_city: "test_city"}, {seller_state: "test_state"}]
        const randomPayload = payload[Math.floor(Math.random() * 2)];
        const response = await chai.request(app).put("/account")
         .send(randomPayload).set("Authorization", `Bearer ${token}`);

        response.should.have.status(200);
      } catch (error) {
        throw new Error(error.stack)
      }
    })

    it("Empty update data should return 400", async()=>{
      try {
        const payload = {}
        const response = await chai.request(app).put("/account")
         .send(payload).set("Authorization", `Bearer ${token}`);

        response.should.have.status(400);
      } catch (error) {
        throw new Error(error.stack)
      }
    })

    it("Update should return the corrrect updated details", async()=>{
      try {
        const random_number = Math.random().toString();
        const payload = {
          seller_city: "test_city" + random_number.slice(3,6),
          seller_state: "test_state" + random_number.slice(2,4)
        }
        const response = await chai.request(app).put("/account")
         .send(payload).set("Authorization", `Bearer ${token}`);

         expect(response.body.data.seller_city).to.be
         .equal(payload.seller_city)

         expect(response.body.data.seller_state).to.be
         .equal(payload.seller_state)

      } catch (error) {
        throw new Error(error.stack)
      }
    })

    it("Update should return city and state keys", async()=>{
      try {
        const payload = {seller_city: "test_city", seller_state: "test_state"}
        const response = await chai.request(app).put("/account")
         .send(payload).set("Authorization", `Bearer ${token}`);

         expect(response.body.data).to.be.an('object').that.has.all
          .keys(
            "seller_state",
            "seller_city",
          );
      } catch (error) {
        throw new Error(error.stack)
      }
    })
    
  })

  describe("/Order Details", ()=>{ 

    it("Correct order_id  should return 200 Ok", async()=>{
      try {

        const response = await chai.request(app).get(`/order_items/${order_ids[0]}`)
        .set("Authorization", `Bearer ${token}`);

        response.should.have.status(200);
      } catch (error) {
        throw new Error(error.stack)
      }
    })


    it("Unauthorized seller should return status 401", async()=>{
      try {
        
        const response = await chai.request(app).delete(`/order_items/${order_ids[0]}`)

        response.should.have.status(401);
      } catch (error) {
        throw new Error(error.stack)
      }
    }) 

    it("Invalid order_id should return status 404", async()=>{
      try {
        
        const response = await chai.request(app).get(`/order_items/jbhvhbjnbjhbhvhv`)
          .set("Authorization", `Bearer ${token}`);

        response.should.have.status(404);
      } catch (error) {
        throw new Error(error.stack)
      }
    }) 
    
  })



  describe("/Delete Order Item", ()=>{



    it("Successful Delete should return 200 Ok", async()=>{
      try {     

        const response = await chai.request(app).delete(`/order_items/${order_ids[0]}`)
          .set("Authorization", `Bearer ${token}`);

        response.should.have.status(200);
      } catch (error) {
        throw new Error(error.stack)
      }
    })


    it("unauthorized seller should return status 401", async()=>{
      try {
        
        const response = await chai.request(app).delete(`/order_items/${order_ids[0]}`)

        response.should.have.status(401);
      } catch (error) {
        throw new Error(error.stack)
      }
    })

    it("Invalid order_id should return status 403", async()=>{
      try {
        
        const response = await chai.request(app).delete(`/order_items/fgfggfgfggf`)
        .set("Authorization", `Bearer ${token}`);

        response.should.have.status(403);

      } catch (error) {
        throw new Error(error.stack)
      }
    })     
  })



})


