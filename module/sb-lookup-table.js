import { auxMeth } from "./auxmeth.js";


function stringIsNumber(str){
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
         !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

function getColumnIndex(lookup,strColumnName){
  let returnValue=-1;
  // assume a validated lookup
  for (let col = 0; col < lookup.system.lookupTable.columns.length; col++) { 
    if(lookup.system.lookupTable.columns[col]==strColumnName){
      returnValue=col;
      break;
    }
  }
  return returnValue;
}

// lookupV(lookupValue;lookupKey;returnColumn;exactMatch=false;defaultReturn='') 
// returns empty string if error or not found
export async function lookupV(lookupValue,lookupKey,returnColumn,exactMatch=false,defaultReturn=''){  
  let returnvalue=defaultReturn;  
  let lookup = await auxMeth.getTElement(null, "lookup", lookupKey);
 
  // basic checks
  if(!sb_lookupTable_passes_basic_check(lookupKey,lookup)){
    return returnvalue;
  }    
  // column checks
  returnColumn=sb_lookupTable_passes_column_check(lookupKey,lookup,returnColumn,'return');
  if(returnColumn==-1){
    return returnvalue;
  }    
  
  for (let row = 0; row < lookup.system.lookupTable.rows.length; row++) {      
    if(Number(lookupValue)>=Number(lookup.system.lookupTable.rows[row][0]) && Number(lookupValue)<=Number(lookup.system.lookupTable.rows[row][1])){
      //console.log(`${lookupValue}>=${lookup.system.lookupTable.rows[row][0]} && ${lookupValue}<=${lookup.system.lookupTable.rows[row][1]}`);
      returnvalue=lookup.system.lookupTable.rows[row][returnColumn];
      return returnvalue;
    }
  }  
  if(!exactMatch){
    if(Number(lookupValue)<Number(lookup.system.lookupTable.rows[0][0])){
      returnvalue=lookup.system.lookupTable.rows[0][returnColumn];
      return returnvalue;
    }
  }
  if(!exactMatch){
    if(Number(lookupValue)>Number(lookup.system.lookupTable.rows[lookup.system.lookupTable.rows.length-1][1])){
      returnvalue=lookup.system.lookupTable.rows[lookup.system.lookupTable.rows.length-1][returnColumn];
      return returnvalue;
    }
  }
  return returnvalue;
}


//lookupX(lookupValue;lookupKey;lookupColumn;returnColumn;defaultReturn='') // always exact match
export async function lookupX(lookupValue,lookupKey,lookupColumn,returnColumn,defaultReturn=''){
  let returnvalue=defaultReturn;
  let lookup = await auxMeth.getTElement(null, "lookup", lookupKey);
  // basic checks
  if(!sb_lookupTable_passes_basic_check(lookupKey,lookup)){
    return returnvalue;
  }    
  
  // column checks
  returnColumn=sb_lookupTable_passes_column_check(lookupKey,lookup,returnColumn,'return');
  if(returnColumn==-1){
    return returnvalue;
  } 
  
  lookupColumn=sb_lookupTable_passes_column_check(lookupKey,lookup,lookupColumn,'lookup');
  if(lookupColumn==-1){
    return returnvalue;
  }     
  
  for (let row = 0; row < lookup.system.lookupTable.rows.length; row++) {    
    if((lookupValue)==(lookup.system.lookupTable.rows[row][lookupColumn])){
      returnvalue=lookup.system.lookupTable.rows[row][returnColumn];
      return returnvalue;
    }
  }  
  return returnvalue;  
}
// returns character separated string with all values from specific column
export async function lookupList(lookupKey,returnColumn,strSeparator='|'){
  let returnvalue='';
  let lookup = await auxMeth.getTElement(null, "lookup", lookupKey);
  // basic checks
  if(!sb_lookupTable_passes_basic_check(lookupKey,lookup)){
    return returnvalue;
  } 
  
  // column checks
  returnColumn=sb_lookupTable_passes_column_check(lookupKey,lookup,returnColumn,'return');
  if(returnColumn==-1){
    return returnvalue;
  } 
    
  for (let row = 0; row < lookup.system.lookupTable.rows.length; row++) { 
    if(row==0){
      returnvalue=lookup.system.lookupTable.rows[row][returnColumn];
    } else{
      returnvalue+=strSeparator+lookup.system.lookupTable.rows[row][returnColumn];
    }
    
  }
  return returnvalue;
}

// returns array of string with all columns name
export async function lookupColumns(lookupKey){
  let returnvalue=[];
  let lookup = await auxMeth.getTElement(null, "lookup", lookupKey);
  // basic checks
  if(!sb_lookupTable_passes_basic_check(lookupKey,lookup,false,false)){
    return returnvalue;
  } 
  for (let col = 0; col < lookup.system.lookupTable.columns.length; col++) { 
    returnvalue.push(lookup.system.lookupTable.columns[col]);
  }
  return returnvalue;
}

export async function lookupColumnCount(lookupKey){
  let returnvalue=0;
  let lookup = await auxMeth.getTElement(null, "lookup", lookupKey);
  // basic checks
  if(!sb_lookupTable_passes_basic_check(lookupKey,lookup,false,false)){
    return returnvalue;
  } 
  returnvalue=lookup.system.lookupTable.columns.length;      
  return returnvalue;
}

export async function lookupRowCount(lookupKey){
  let returnvalue=0;
  let lookup = await auxMeth.getTElement(null, "lookup", lookupKey);
  // basic checks
  if(!sb_lookupTable_passes_basic_check(lookupKey,lookup,false,false)){
    return returnvalue;
  } 
  returnvalue=lookup.system.lookupTable.rows.length;      
  return returnvalue;
}



function sb_lookupTable_passes_basic_check(lookupKey,lookup,checkRows=true,checkColumns=true){  
  if(lookup==null) {
    ui.notifications.warn('Unable to find Lookup item with key:['+ lookupKey +']');
    return false;
  }
  if(!sb_is_valid_lookupTable(lookup.system.lookupTable)) {
    ui.notifications.warn('Lookup item ['+ lookup.name  +'] with key:['+ lookupKey +'] have invalid lookup table');
    return false;
  }

  if(checkColumns && lookup.system.lookupTable.columns.length==0){
    ui.notifications.warn('Lookup item ['+ lookup.name  +'] with key:['+ lookupKey +'] have no columns');
    return false;
  }

  if(checkRows && lookup.system.lookupTable.rows.length==0){
    ui.notifications.warn('Lookup item ['+ lookup.name  +'] with key:['+ lookupKey +'] have no rows');
    return false;
  }
  return true;
}

// returns -1 if failed, else the column index
function sb_lookupTable_passes_column_check(lookupKey,lookup,columnToCheck,columnType='return'){  
  let returnColumn=columnToCheck;  
  if(!stringIsNumber(returnColumn)){    
    returnColumn = getColumnIndex(lookup,returnColumn);
    if(returnColumn==-1){
      // not found
      ui.notifications.warn('Lookup for item ['+ lookup.name  +'] with key:['+ lookupKey +'] can not find '+ columnType + ' column ['+ columnToCheck +']');
      return -1;
    }    
  }
  if(Number(returnColumn)<0 || Number(returnColumn)>=lookup.system.lookupTable.columns.length){
    ui.notifications.warn(`Lookup for item ${lookup.name} with key:[${lookupKey}] can not be made for ${columnType} column [${returnColumn}]. Minimum ${columnType} column is [0], maximum ${columnType} column is [${lookup.system.lookupTable.columns.length - 1}]`);
    return -1;
  }
  
  // all tests passed
  return returnColumn;
}

export function sb_lookupTable_to_string(lookupTable){
  try {
      return (JSON.stringify(lookupTable));
    } catch (e) {
      console.error('sb_string_to_lookupTable | ' + e.message);
      return '';
    }
}

export function sb_string_to_lookupTable(sLookupTable){  
  try {
      return (JSON.parse(sLookupTable));
    } catch (e) {
      console.error('sb_string_to_lookupTable | ' + e.message);
      return '';
    }  
}


// returns the lookup(as string) if valid, else empty string
export function sb_string_is_valid_lookup_table(slookuptable) {
  // check lookuptable if it is a valid json
  let lookupTable = sb_string_to_lookupTable(slookuptable);
  if(lookupTable=='') return '';    
  if(!sb_is_valid_lookupTable(lookupTable)) return '';
  return slookuptable;    
}

// returns true if valid lookup table(object) else false
export function sb_is_valid_lookupTable(lookupTable){
  if(lookupTable==null) return false;
  if(!lookupTable.hasOwnProperty('columns')) return false; 
  if(!lookupTable.hasOwnProperty('rows')) return false;
  if(lookupTable.columns.length<2) return false;
  return true;
}


