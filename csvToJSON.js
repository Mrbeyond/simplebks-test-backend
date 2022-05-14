"use strict";

import { readFileSync } from "fs";
import { join } from "path";

const csvToJSON =async(file_name)=> {
  try {
    const csv = readFileSync(join(__dirname, file_name), 
        {encoding:"utf-8"},
        (error)=>{
          if(error){
            console.log({error});
            process.exit(1)
          }
        }
      )
    const csvLines = csv.split("\n");
    const headers = csvLines.shift();
    const columns = headers.split(",").map(header=>header.trim().replace(/"/g,""));
    const json = [];
    csvLines.forEach((row) => {
      const currentRow = row.split(",");
      const tempObj = {};
      for(let i = 0; i< columns.length; i++ ){
        let data = currentRow[i]??"";
        data = data.trim().replace(/"/g, "");
        tempObj[columns[i]] = data;
      }
      json.push(tempObj)      
    });
    // console.log({json});
     return json
    
  } catch (error) {
    console.log({error});
    process.exit(1);
  }

}

export default {
  csvToJSON
}