export const INVALID_KEY_CHARACTERS={
  DEFAULT  :/[\u{0000}-\u{002c}\u{002e}-\u{002f}\u{003a}-\u{0040}\u{005b}-\u{005e}\u{0060}\u{007b}-\u{007e}\u{00a0}-\u{00bf}]/gu,
  ENFORCED :/[\u{0000}-\u{002c}\u{002e}-\u{002f}\u{003a}-\u{0040}\u{005b}-\u{005e}\u{0060}\u{007b}-\u{007e}\u{00a0}-\u{00bf}\u{00ff}-\u{10ffff}]/gu
};

function hasvalidcharacters(sKey,mode='DEFAULT'){
  let format;
  let breturn=false;
  if(mode=='DEFAULT'){
    format=INVALID_KEY_CHARACTERS.DEFAULT;
  }
  else{
    format=INVALID_KEY_CHARACTERS.ENFORCED;
  }  
  // reset lastindex of regex, needed for /g
  format.lastIndex=0;
  if (format.test(sKey)){     
    breturn= false;       
  } 
  else{
    breturn= true;
  }
  return breturn;
}

export function SandboxKeyValidate(validatingitemtype,validatingitemid,sKey,enforcedvalidation=true){ 
  //console.log(validatingitemtype,validatingitemid,sKey,enforcedvalidation );
  let validchars;
  let objResult = {
    warnings:  [],
    errors: []
  };    
  let items;          
                 
  // check that it has anything
  if(sKey.length==0){           
    objResult.errors.push('Key is empty'); 
  }
  else{  
    // general syntax check 
    // check for valid characters
    if(enforcedvalidation){
      validchars=hasvalidcharacters(sKey,'ENFORCED')
      if(!validchars){
        // fail         
        objResult.errors.push('Key contains invalid characters'); 
      }
      // check for starting characters
      // it can not start with a digit due to css
      if (/^[0-9]/.test(sKey)){
        objResult.errors.push('Key can not start with a number'); 
      }
    }  
    else{
      // default validation
      validchars=hasvalidcharacters(sKey,'DEFAULT');
      if(!validchars){
        // fail         
        objResult.errors.push('Key contains invalid characters'); 
      }
    }
    
    // now check against the rest of the items in the database
    items = game.items.filter(y=>(y.type=="property" && y.system.attKey==sKey)||(y.type=="panel" && y.system.panelKey==sKey)||(y.type=="multipanel" && y.system.panelKey==sKey) || (y.type=="sheettab" && y.system.tabKey==sKey)||(y.type=="group" && y.system.groupKey==sKey) ||(y.type=="lookup" && y.system.lookupKey==sKey)  );          
    if (items.length>0){
      // found items, check each one                 
      items.forEach(function(item)  {   
        // check if this is the item 
        if (item!=null){
          
          let foldername='';
          if(item.folder!=null){
            foldername=item.folder.name ;
          }
          if (item.id!==validatingitemid){ 
            if(enforcedvalidation){
              objResult.errors.push('Key exists for ' + item.type.toLowerCase() + ' [' + item.name+'] in folder['+ foldername +']');
            }
            else{
              // relaxed validation
              if(validatingitemtype.toUpperCase()=='PANEL'||validatingitemtype.toUpperCase()=='MULTIPANEL' ){          
                // special for panels/multipanels 
                if(item.type.toUpperCase()=='PANEL' || item.type.toUpperCase()=='MULTIPANEL'){               
                  objResult.errors.push('Key exists for ' + item.type.toLowerCase() + ' [' + item.name+'] in folder['+ foldername +']');
                }
                else{
                  // just a warning
                  objResult.warnings.push('Key exists for ' + item.type.toLowerCase() + ' [' + item.name+'] in folder['+ foldername +']'); 
                }
              }            
              else{
                // keys for these types can exist for other item types
                if(item.type.toUpperCase()==validatingitemtype.toUpperCase()){                             
                  objResult.errors.push('Key exists for ' + item.type.toLowerCase() + ' [' + item.name+'] in folder['+ foldername +']');
                }
                else{
                  objResult.warnings.push('Key exists for ' + item.type.toLowerCase() + ' [' + item.name+'] in folder['+ foldername +']');
                }
                
              }
            }            
          }
        } 
      });   
    } 
  }  
  
 return objResult;

}

