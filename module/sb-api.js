const _system_id='sandbox';  // system true name(id)
import { auxMeth } from "./auxmeth.js";
import { sb_custom_dialog_prompt,
         sb_custom_dialog_confirm
       } from "./sb-custom-dialogs.js";
import  { getSandboxItemIconFile } from "./sb-itemsheet-helpers.js";
import  { SandboxJSONImportForm } from "./sb-json-import-form.js";
import { GameFolderPicker } from "./game-folder-picker-form.js";
import { lookupV,lookupX,lookupColumnCount,lookupRowCount,lookupList } from "./sb-lookup-table.js";

import { Parser } from "./parser.js";


// Usage: 
//    let api=game.system.api;
//    api.BuildActorTemplates();   
export class SandboxAPI {
  // ---------------------------------------------------------------- 
  // Initialize                                                       
  // ----------------------------------------------------------------     
  initialize() {   
      console.log("Sandbox | Initializing API");
      game.system.api={
        BuildActorTemplates,
        CheckcItemConsistency,
        Actor_GetFromName,
        Actor_GetFromSheet,
        Actor_GetFromSelectedToken,
        ActorProperty_HasProperty,
        ActorProperty_GetProperty,
        ActorProperty_GetValue,
        ActorProperty_SetValue,
        ActorProperty_ToggleValue,
        ActorcItem_GetFromName,
        ActorcItem_IsActive,
        ActorcItem_Activate,
        ActorcItem_Deactivate,
        ActorcItem_ToggleActivation,
        ActorcItem_ChangeActivation,
        ActorcItem_Consume,
        ActorcItem_Recharge,
        ActorcItem_ChangeUses,
        ActorcItem_IncreaseUses,
        ActorcItem_DecreaseUses,
        ActorcItem_Add,
        ActorcItem_Delete,
        ActorcItem_IncreaseNumber,
        ActorcItem_DecreaseNumber,
        cItem_GetFromName,
        ActorSheet_GetFromActor,
        ActorSheet_Render,
        SystemSetting_GetValue,
        SystemSetting_SetValue,
        SheetInfo_GetFromSheetId,
        fontAwesomeIconPicker,
        fileExists,
        getSandboxItemDefaultIconFile,
        getGameWorldInfo,
        updateItemsPackImg,
        updateItemsImg,
        updateItemsAllImg,
        replaceAllMissingImages,
        GameFolderPicker,
        importJSON,
        _deleteAll,
        lookupV,
        lookupX,
        lookupRowCount,
        lookupColumnCount,
        lookupList,
        _extractAPIFunction,
        _extractAPIFunctions,
        _ActorProperty_RemoveProperty,
        mathParser,
        sum,floor,ceil 
       
      };           
    
  }
}


//
function _parserTest(expression){
  const parser = new Parser();
  let result;
  try{
    console.log('_parserTest\n');
    console.log(expression);
    result = parser.parse(expression);
    console.log(' = ' + result );
    
  } catch(err){
    console.log(err.message);
  }
  return result;
}
function _parserTestAll(){
  const mathTests = [
  ['1', 1],
  [' 2 ', 2],
  ['1 + 2', 3],
  [' 1 + 2 ', 3],
  ['1 + 2 * 3', 7],
  ['(1 + 2) * 3', 9],
  ['5 - 2', 3],
  ['5 - 2 - 1', 2],
  ['12 / 2 / 3', 2],
  ['2 ^ 3 + 1', 9],
  ['-2 ^ 2', -4],
  ['(-2) ^ 2', 4],
  ['-2 ^ 2 + 1', -3],
  ['cos(0) + 3 * -4 / -2 ^ 2', 4]
]

const parser = new Parser()
let result

for (const [expression, expected] of mathTests) {
  try {
    result = parser.parse(expression)
    console.assert(result == expected)
  } catch (err) {
    //const lines = '-'.repeat(process.stdout.columns)
    //console.log(lines)
    console.log(`Expression failed: "${expression}"`)
    console.log(`Expected result: ${expected}`)
    console.log(`Actual result: ${result}`)
    //console.log(lines)
    throw err
  }
}

console.log('All tests passed! 🎉')
}
// 


function _APIFunctionRequiredArguments(functionName){
  let returnValue=0;
  switch (functionName){
      case 'lookupV':
        returnValue=3;
        break;
      case 'lookupX':
        returnValue=4;
        break;  
      case 'lookupColumnCount':
        returnValue=1;
        break;
      case 'lookupRowCount':
        returnValue=1;
        break; 
      case 'lookupList':
        returnValue=2;
        break;
      case 'sum':
      case 'floor':
      case 'ceil':
        returnValue=1;
        break;
    }
  return returnValue;
}

async function sum(expr) {
  let returnValue=expr;
  try {
    returnValue = eval(expr);
    //console.log('sum(' + expr +') = ' + returnValue );
  } catch {
    // not a valid expression
  }  
  return returnValue;
}

async function floor(expr) {
  let returnValue=expr;
  try {
    returnValue = Math.floor(eval(expr));    
  } catch {
    // not a valid expression
  }  
  return returnValue;
}

async function ceil(expr) {
  let returnValue=expr;
  try {
    returnValue = Math.ceil(eval(expr));    
  } catch {
    // not a valid expression
  }  
  return returnValue;
}

async function mathParser(expr){
      let returnValue=expr;
      if (typeof (expr) != "string") return expr;
      if (expr.length == 0) return expr;
      returnValue = await mathParserFn(returnValue,'floor');
      returnValue = await mathParserFn(returnValue,'ceil');
      returnValue = await mathParserFn(returnValue,'sum');
      
      return returnValue;
    }
    
async function mathParserFn(expr,functionName){
      let returnValue=expr;
      if (typeof (expr) != "string") return expr;
      if (expr.length == 0) return expr;
          // finds functions, with three levels of nested ()
      let strSeparator=';';
      let expArray=null;
      switch(functionName){
        case 'sum':
          expArray=expr.match(/sum\([^)(]*(?:\([^)(]*(?:\([^)(]*(?:\([^)(]*\)[^)(]*)*\)[^)(]*)*\)[^)(]*)*\)/g);
          break;
        case 'floor':
          expArray=expr.match(/floor\([^)(]*(?:\([^)(]*(?:\([^)(]*(?:\([^)(]*\)[^)(]*)*\)[^)(]*)*\)[^)(]*)*\)/g);
          break;
        case 'ceil':
          expArray=expr.match(/ceil\([^)(]*(?:\([^)(]*(?:\([^)(]*(?:\([^)(]*\)[^)(]*)*\)[^)(]*)*\)[^)(]*)*\)/g);
          break;
      }
      if (expArray != null) {
        for (let i = 0; i < expArray.length; i++) {
          let tochange = expArray[i];
          // lookupV(@{TXT_STR_TOTAL};D_D_STRENGTH;4)
          // get rid of surrounding ()
          let checkthis=tochange.substr(functionName.length + 1,tochange.length - functionName.length - 2);
          // @{TXT_STR_TOTAL};D_D_STRENGTH;4                
          //console.log('extractAPIFunction tochange',tochange);
          let blocks = _parseArgs(checkthis,strSeparator);                
          let args = [];
          for (let a = 0; a < blocks.length; a++) {          
            let argument = blocks[a];
            // check if any API are in blocks
            argument = await mathParser(argument);          
            args.push(argument);
          }
          let replaceValue=await _APIFunctionRun(functionName,args) ;                        
          returnValue = await returnValue.replace(tochange, replaceValue);
        }
      }
      
      return returnValue;
    }




// splits string on separator but not if separator are inside a ()
function _parseArgs(str,separator=';',startBracket='(',endBracket=')') {
  let result = [], item = '', depth = 0;
  function push() { if (item) result.push(item); item = ''; }
  for (let i = 0, c; c = str[i], i < str.length; i++) {
    if (!depth && c === separator) push();
    else {
      item += c;
      if (c === startBracket) depth++;
      if (c === endBracket) depth--;
    }
  }
  push();
  return result;
}



async function _extractAPIFunctions(expr, actorattributes, citemattributes, exprmode = false, noreg = false, number = 1, uses = 0, maxuses = 1) {
  let returnValue=expr;
  if(returnValue.length>0){
    returnValue = await _extractAPIFunction('lookupV', returnValue, actorattributes, citemattributes, exprmode , noreg , number , uses , maxuses);
    returnValue = await _extractAPIFunction('lookupX', returnValue, actorattributes, citemattributes, exprmode , noreg , number , uses , maxuses);
    returnValue = await _extractAPIFunction('lookupColumnCount', returnValue, actorattributes, citemattributes, exprmode , noreg , number , uses , maxuses);
    returnValue = await _extractAPIFunction('lookupRowCount', returnValue, actorattributes, citemattributes, exprmode , noreg , number , uses , maxuses);
    returnValue = await _extractAPIFunction('lookupList', returnValue, actorattributes, citemattributes, exprmode , noreg , number , uses , maxuses);
  }
  return returnValue;
}
async function _extractAPIFunction(functionName, expr, actorattributes, citemattributes, exprmode = false, noreg = false, number = 1, uses = 0, maxuses = 1) {
    
    if(expr=='') return expr
    let returnValue=expr;
    //console.log('extractAPIFunction expr:',expr);
    let expArray=null;
    //let regExpStr=`(?<=\\b${functionName}\\b\\().*?(?=\\))`;
    //let getLookupX = rawexp.match(/(?<=\blookupx\b\().*?(?=\))/g);
    //let regExpStr=`${functionName}\([^)(]*(?:\([^)(]*(?:\([^)(]*(?:\([^)(]*\)[^)(]*)*\)[^)(]*)*\)[^)(]*)*\)`;
    //let re = new RegExp(regExpStr, 'g');
    //expArray = returnValue.match(re);
        
    // finds functions, with three levels of nested ()
    switch(functionName){
      case 'lookupV':
        expArray=expr.match(/lookupV\([^)(]*(?:\([^)(]*(?:\([^)(]*(?:\([^)(]*\)[^)(]*)*\)[^)(]*)*\)[^)(]*)*\)/g);
        break;
      case 'lookupX':
        expArray=expr.match(/lookupX\([^)(]*(?:\([^)(]*(?:\([^)(]*(?:\([^)(]*\)[^)(]*)*\)[^)(]*)*\)[^)(]*)*\)/g);
        break;
      case 'lookupColumnCount':
        expArray=expr.match(/lookupColumnCount\([^)(]*(?:\([^)(]*(?:\([^)(]*(?:\([^)(]*\)[^)(]*)*\)[^)(]*)*\)[^)(]*)*\)/g);
        break;
      case 'lookupRowCount':
        expArray=expr.match(/lookupRowCount\([^)(]*(?:\([^)(]*(?:\([^)(]*(?:\([^)(]*\)[^)(]*)*\)[^)(]*)*\)[^)(]*)*\)/g);
        break;
      case 'lookupList':
        expArray=expr.match(/lookupList\([^)(]*(?:\([^)(]*(?:\([^)(]*(?:\([^)(]*\)[^)(]*)*\)[^)(]*)*\)[^)(]*)*\)/g);
        break;
    }
                
    if (expArray != null) {
      for (let i = 0; i < expArray.length; i++) {
        let tochange = expArray[i];
        // lookupV(@{TXT_STR_TOTAL};D_D_STRENGTH;4)
        // get rid of surrounding ()
        let checkthis=tochange.substr(functionName.length + 1,tochange.length - functionName.length - 2);
        // @{TXT_STR_TOTAL};D_D_STRENGTH;4                
        //console.log('extractAPIFunction tochange',tochange);
        let blocks = _parseArgs(checkthis);                
        let args = [];
        for (let a = 0; a < blocks.length; a++) {          
          let argument = blocks[a];
          // check if any API are in blocks
          argument = await _extractAPIFunctions(argument, actorattributes, citemattributes, exprmode , noreg , number , uses , maxuses);
          argument = await auxMeth.autoParser(argument, actorattributes, citemattributes, exprmode, noreg, number,uses,maxuses);
          args.push(argument);
        }
        let replaceValue=await _APIFunctionRun(functionName,args) ;                        
        returnValue = await returnValue.replace(tochange, replaceValue);
        }
    }           
    return returnValue;
  }

async function _APIFunctionRun(functionName,args,isAsync=true){
  let returnValue=null;
  // get the number of required arguments for function
  let requiredArgumentsCount=_APIFunctionRequiredArguments(functionName);

  if(args.length<requiredArgumentsCount){
    ui.notifications.warn("Function ["+ functionName +"] requires minimum " + requiredArgumentsCount +" arguments");
    return returnValue;
  }
  if(isAsync){
    switch (args.length) {
      case 0:
        returnValue = await game.system.api[functionName]();
        break;
      case 1:
        returnValue = await game.system.api[functionName](args[0]);
        break;
      case 2:
        returnValue = await game.system.api[functionName](args[0], args[1]);
        break;
      case 3:
        returnValue = await game.system.api[functionName](args[0], args[1], args[2]);
        break;
      case 4:
        returnValue = await game.system.api[functionName](args[0], args[1], args[2], args[3]);
        break;
      case 5:
        returnValue = await game.system.api[functionName](args[0], args[1], args[2], args[3], args[4]);
        break;
      case 6:
        returnValue = await game.system.api[functionName](args[0], args[1], args[2], args[3], args[4],args[5]);
        break;
      case 7:
        returnValue = await game.system.api[functionName](args[0], args[1], args[2], args[3], args[4],args[5],args[6]);
        break; 
      case 8:
        returnValue = await game.system.api[functionName](args[0], args[1], args[2], args[3], args[4],args[5],args[6],args[7]);
        break;
      case 9:
        returnValue = await game.system.api[functionName](args[0], args[1], args[2], args[3], args[4],args[5],args[6],args[7],args[8]);
        break;
      case 10:
        returnValue = await game.system.api[functionName](args[0], args[1], args[2], args[3], args[4],args[5],args[6],args[7],args[8],args[9]);
        break;
      default:
        ui.notifications.error("Out of depth in  function _APIFunctionRun for function ["+ functionName +"] requires minimum " + requiredArgumentsCount +" arguments");
        break;
    }
  } else{
      switch (args.length) {
      case 0:
        returnValue = game.system.api[functionName]();
        break;
      case 1:
        returnValue = game.system.api[functionName](args[0]);
        break;
      case 2:
        returnValue = game.system.api[functionName](args[0], args[1]);
        break;
      case 3:
        returnValue = game.system.api[functionName](args[0], args[1], args[2]);
        break;
      case 4:
        returnValue = game.system.api[functionName](args[0], args[1], args[2], args[3]);
        break;
      case 5:
        returnValue = game.system.api[functionName](args[0], args[1], args[2], args[3], args[4]);
        break;
      case 6:
        returnValue = game.system.api[functionName](args[0], args[1], args[2], args[3], args[4],args[5]);
        break;
      case 7:
        returnValue = game.system.api[functionName](args[0], args[1], args[2], args[3], args[4],args[5],args[6]);
        break; 
      case 8:
        returnValue = game.system.api[functionName](args[0], args[1], args[2], args[3], args[4],args[5],args[6],args[7]);
        break;
      case 9:
        returnValue = game.system.api[functionName](args[0], args[1], args[2], args[3], args[4],args[5],args[6],args[7],args[8]);
        break;
      case 10:
        returnValue = game.system.api[functionName](args[0], args[1], args[2], args[3], args[4],args[5],args[6],args[7],args[8],args[9]);
        break;
      default:
        ui.notifications.error("Out of depth in  function _APIFunctionRun for function ["+ functionName +"] requires minimum " + requiredArgumentsCount +" arguments");
        break;
    }
  }
  return returnValue;  
    
}




async function _ActorProperty_RemoveProperty(actor,propertyKey,actortype=''){
  if(actor!=null){
    let prompttitle =game.i18n.format("SANDBOX.ConfirmRemoveActorProperty_Title",{actortype:actortype});
    let promptbody  =game.i18n.format("SANDBOX.ConfirmRemoveActorProperty_Body",{propertykey:propertyKey,actorname:actor.name,actortype:actortype});
    if(actor.system.attributes.hasOwnProperty(propertyKey)){
      let answer=await sb_custom_dialog_confirm(prompttitle,promptbody,game.i18n.localize("Yes"),game.i18n.localize("No"));  
      if (answer){          
        await actor.update({ [`system.attributes.-=${propertyKey}`]: null });
        console.log(`_ActorProperty_RemoveProperty | Removed actor property ${propertyKey}`);
      }
    }
  }
}

async function _deleteAll(){ 
  // check for gm
  if (!game.user.isGM){
    // notify
    await sb_custom_dialog_prompt(game.i18n.localize("SANDBOX.GMAuthorityRequiredTitle"),game.i18n.localize("SANDBOX.GMAuthorityRequiredBody"),game.i18n.localize("Ok"),'Information');
    // exit 
    return false;  
  }
    // confirm by user
  let prompttitle =game.i18n.format("SANDBOX.ConfirmDeleteDocumentsTitle",{documenttype:'all Actors, Items and their Folders'});
  let promptbody=game.i18n.format("SANDBOX.ConfirmDeleteDocumentsBody",{documenttype:'all Actors, Items and their Folders'});
  let answer=await sb_custom_dialog_confirm(prompttitle,promptbody,game.i18n.localize("Yes"),game.i18n.localize("No"));  
  if (answer){  
    console.warn('Sandbox | Deleting all actors/items/folders');
    let ids;
    ids = game.items.map(item => item.id);
    await Item.deleteDocuments(ids);
    ids = game.actors.map(actor => actor.id);
    await Actor.deleteDocuments(ids);
    ids = game.folders.map(folder => folder.id);
    await Folder.deleteDocuments(ids);
    console.warn('Sandbox | Deleted all actors/items/folders');
  } else {
    console.log('Sandbox | Delete aborted');
  }
  
    
}

async function importJSON(){  
  // check for gm
  if (!game.user.isGM){
    // notify
    await sb_custom_dialog_prompt(game.i18n.localize("SANDBOX.GMAuthorityRequiredTitle"),game.i18n.localize("SANDBOX.GMAuthorityRequiredBody"),game.i18n.localize("Ok"),'Information');
    // exit 
    return false;  
  }
  let options={};
  new SandboxJSONImportForm(options).render(true,{focus:true}); 
}








function  getSandboxItemDefaultIconFile(itemtype,datatype,rollable){
  return getSandboxItemIconFile(itemtype,datatype,rollable);
}

async function replaceAllMissingImages(){
  // check for gm
  if (!game.user.isGM){
    // notify
    await sb_custom_dialog_prompt(game.i18n.localize("SANDBOX.GMAuthorityRequiredTitle"),game.i18n.localize("SANDBOX.GMAuthorityRequiredBody"),game.i18n.localize("Ok"),'Information');
    // exit 
    return false;  
  }
  
}

async function replaceAllMissingItemImages(itemtype){
  // check for gm
  if (!game.user.isGM){
    // notify
    await sb_custom_dialog_prompt(game.i18n.localize("SANDBOX.GMAuthorityRequiredTitle"),game.i18n.localize("SANDBOX.GMAuthorityRequiredBody"),game.i18n.localize("Ok"),'Information');
    // exit 
    return false;  
  }
  await replaceMissingItemImages("property");
  await replaceMissingItemImages("panel");
  await replaceMissingItemImages("multipanel");
  await replaceMissingItemImages("sheettab");
  await replaceMissingItemImages("group");  
  await replaceMissingItemImages("lookup"); 
  await replaceMissingItemImages("cItem");
}

async function replaceMissingItemImages(itemtype){
let rollable=false;
let api=game.system.api;
let fileexists;
items = await game.items.filter(y=>(y.type==itemtype ));
for (let i = 0; i < items.length; i++) {
   fileexists=await api.fileExists(items[i].img)
   if(!fileexists){     
     rollable=false;
     if(itemtype=='property'){
        if (items[i].system.hasroll){
          rollable=true;
        }
      } 
     iconfile=api.getSandboxItemDefaultIconFile(itemtype,items[i].system.datatype,rollable)
     console.log('Sandbox | Updating ' + itemtype + ' item [' + items[i].name + '] image')
     await items[i].update({[`img`]: iconfile});
   }
  }
}

async function replaceMissingActorImages(itemtype){
let rollable=false;
let api=game.system.api;
let fileexists;
items = await game.items.filter(y=>(y.type==itemtype ));
for (let i = 0; i < items.length; i++) {
   fileexists=await api.fileExists(items[i].img)
   if(!fileexists){     
     rollable=false;
     if(itemtype=='property'){
        if (items[i].system.hasroll){
          rollable=true;
        }
      } 
     iconfile=api.getSandboxItemDefaultIconFile(itemtype,items[i].system.datatype,rollable)
     console.log('Sandbox | Updating ' + itemtype + ' item [' + items[i].name + '] image')
     await items[i].update({[`img`]: iconfile});
   }
  }
}

async function updateItemsAllImg(){
  // check for gm
  if (!game.user.isGM){
    // notify
    await sb_custom_dialog_prompt(game.i18n.localize("SANDBOX.GMAuthorityRequiredTitle"),game.i18n.localize("SANDBOX.GMAuthorityRequiredBody"),game.i18n.localize("Ok"),'Information');
    // exit 
    return false;  
  }
  await updateItemsImg('property','systems/sandbox/docs/icons/sh_prop_icon.png');  
  await updateItemsImg('panel','systems/sandbox/docs/icons/sh_panel_icon.png');  
  await updateItemsImg('multipanel','systems/sandbox/docs/icons/sh_panel_icon.png');
  await updateItemsImg('sheettab','systems/sandbox/docs/icons/sh_tab_icon.png');
  await updateItemsImg('group','systems/sandbox/docs/icons/sh_group_icon.png');
  await updateItemsImg('cItem','systems/sandbox/docs/icons/sh_citem_icon.png');
  // compendiums
  await updateItemsPackImg('property','systems/sandbox/docs/icons/sh_prop_icon.png');  
  await updateItemsPackImg('panel','systems/sandbox/docs/icons/sh_panel_icon.png');  
  await updateItemsPackImg('multipanel','systems/sandbox/docs/icons/sh_panel_icon.png');
  await updateItemsPackImg('sheettab','systems/sandbox/docs/icons/sh_tab_icon.png');
  await updateItemsPackImg('group','systems/sandbox/docs/icons/sh_group_icon.png');
  await updateItemsPackImg('cItem','systems/sandbox/docs/icons/sh_citem_icon.png');
}

async function updateItemsPackImg(itemtype,previousstandarddimg) {
  // check for gm
  if (!game.user.isGM){
    // notify
    await sb_custom_dialog_prompt(game.i18n.localize("SANDBOX.GMAuthorityRequiredTitle"),game.i18n.localize("SANDBOX.GMAuthorityRequiredBody"),game.i18n.localize("Ok"),'Information');
    // exit 
    return false;  
  }
  let updateCount=0;
  await ui.notifications.info('Migration | Updating images for [' + itemtype + '] items in compendiums',{console:false});
  console.log('Sandbox | Updating images for [' + itemtype + '] items in compendiums');
  for (let pack of game.packs) {
    if (pack.documentName != "Item")
      continue;
    const packContents = await pack.getDocuments();  
    // filter on image used is standard or empty
    let items=packContents.filter(y =>  (y.type==itemtype && (y.img == previousstandarddimg || y.img=='')))
    console.log('Sandbox | Updating images for ' + items.length + ' [' + itemtype + '] items of ' + packContents.length +  ' items in compendium [' + pack.title + ']' )
    let iconfile=null;
    let rollable;
    for (let i = 0; i < items.length; i++) {            
      rollable=false;
      if(itemtype=='property'){
        if (items[i].system.hasroll){
          rollable=true;
        }
      }            
      // get new iconfile
      iconfile=getSandboxItemIconFile(itemtype,items[i].system.datatype,rollable);
      console.log('Sandbox | Updating image for [' + itemtype + '] item [' + items[i].name + '] in compendium [' + pack.title + ']');
      await items[i].update({[`img`]: iconfile});
      updateCount=updateCount+1;
    }
    if(items.length>0){
      console.log('Sandbox | Updated images for ' + updateCount + ' [' + itemtype + '] items in compendium [' + pack.title + ']' );
    }
  }
  console.log('Sandbox | Update images for [' + itemtype + '] items in compendiums complete');
}


async function updateItemsImg(itemtype,previousstandarddimg){
  // check for gm
  if (!game.user.isGM){
    // notify
    await sb_custom_dialog_prompt(game.i18n.localize("SANDBOX.GMAuthorityRequiredTitle"),game.i18n.localize("SANDBOX.GMAuthorityRequiredBody"),game.i18n.localize("Ok"),'Information');
    // exit 
    return false;  
  }
  let updateCount=0;
  await ui.notifications.info('Migration | Updating images for [' + itemtype + '] items',{console:false});
  console.log('Sandbox | Updating images for [' + itemtype + '] items');
  // filter on image used is standard or empty
  let items=game.items.filter(y=> y.type==itemtype && (y.img == previousstandarddimg || y.img==''))
  console.log('Sandbox | Updating images for ' + items.length + ' [' + itemtype + '] items of ' + game.items.size + ' items')
  let iconfile=null;
  let rollable;
  for (let i = 0; i < items.length; i++) {        
    // get new iconfile
    rollable=false;
    if(itemtype=='property'){
      if (items[i].system.hasroll){
        rollable=true;
      }
    }            
    iconfile=getSandboxItemIconFile(itemtype,items[i].system.datatype,rollable)
    console.log('Sandbox | Updating [' + itemtype + '] item [' + items[i].name + '] image')
    
    await items[i].update({[`img`]: iconfile});
    updateCount=updateCount+1;
    
  }
  if(items.length>0){
      console.log('Sandbox | Updated images for ' + updateCount + ' [' + itemtype + '] items' );
  }
  console.log('Sandbox | Update images for [' + itemtype + '] items complete');
}



async function fileExists(url){
  let result=false;
  // look in data first
  try{
    const findInData =await FilePicker.browse('data',url);    
    if (findInData!=null){
      result=true;
    } 
  }
  catch(err){        
  }
  // if not found in data, look in public
  if(!result){
    try{
      const findInData =await FilePicker.browse('public',url);    
      if (findInData!=null){
        result=true;
      } 
    }
    catch(err){        
    }         
  }

  return result;
}


function checkMatchingBrackets_1(s){
  let stck=[]; 
  // loop through each element in the string
  for(let i=0; i<s.length; i++){
    // last added bracket
    let char=stck[stck.length-1];
    console.log('s[i]:' + s[i] + ' char:'+ char);
    if(s[i]=="(" || s[i]=="{" || s[i]=="["){
      stck.push(s[i]);
    } else if((char=="(" && s[i]==")") || 
            (char=="{" && s[i]=="}") ||
            (char=="[" && s[i]=="]")){
      stck.pop();      
    } else if(!s[i]=="(" && !s[i]==")" && !s[i]=="[" && !s[i]=="]" && !s[i]=="{" && !s[i]=="}") {    
      // non brackets charcters, ignore these
      console.log(s[i]);  
      return false;
    }
  }
  // check  empty stack  
  return stck.length ? false:true;
}


//                                                                               
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<o>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 
//                                                                               
//                       Functions for handling system settings                          
//                                                                               
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<o>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 
//
function SystemSetting_GetValue(settingname){
  let returnvalue=null;
  // check for setting
  let setting = game.settings.settings.get(_system_id + "." + settingname)
  if (setting!=null){    
    // check that it is not hidden
    let okToUse=true;
    if(setting.hasOwnProperty("hidden")){
      if(setting.hidden){
        okToUse=false
      }
    }
    if(okToUse){
      // get actual value
      let settingvalue=game.settings.get(_system_id, settingname); 
      returnvalue =  settingvalue;
    }
  }       
  return returnvalue;  
}

async function SystemSetting_SetValue(settingname,newvalue){  
  // check for setting
  let setting = game.settings.settings.get(_system_id + "." + settingname)
  if (setting!=null){    
    // check that it is not hidden
    let okToUse=true;
    if(setting.hasOwnProperty("hidden")){
      if(setting.hidden){
        okToUse=false
      }
    }
    if(okToUse){
      let validvalue=true;           
      let validationerror='';
      // check for correct datatype
      switch(setting.type.name){
        case 'String':                    
          break;
        case 'Number': 
          if(typeof newvalue=='string'){
            // check if it can be used as a number
            if(isNaN(newvalue)){
              validvalue=false;
              validationerror='is not a valid number';
            }
          }
          break;
        case 'Boolean':
          // check true/false
          if(!(newvalue==0 || newvalue==false || newvalue=='' || newvalue==1 || newvalue==true || newvalue=='true')){
            validvalue=false;
            validationerror="is not a valid boolean[0,1,true,false,'true','']";
          }                    
          break;
      }
      // check choices
      if(setting.hasOwnProperty('choices')){
        // this means it has to be a number and between 0 and length of choices
        const choicecount=Object.keys(setting.choices).length
        if(newvalue<0 || newvalue >= choicecount){
          validvalue=false;
          validationerror='is not a valid choice[0-'+ (choicecount - 1) +']';
        }
      }
      // check range
      if(setting.hasOwnProperty('range')){
        if(newvalue<setting.range.min || newvalue>setting.range.max){
          validvalue=false;
          validationerror='is outside valid range['+ setting.range.min + '-' + setting.range.max +']';
        }
      }
      if(validvalue){
        // set actual value
        await game.settings.set(_system_id, settingname,newvalue); 
      } else {
        // invalid
        const errmsg='Sandbox API | SystemSetting_SetValue | Invalid value['+ newvalue +'] '+  validationerror +' for setting ' + setting.name
        ui.notifications.error(errmsg);
        console.error(errmsg);
      }
    } else {
      const errmsg='Sandbox API | SystemSetting_SetValue | Setting ['+ settingname +'] not useable.'
      ui.notifications.error(errmsg);
      console.error(errmsg);
    } 
  } else {
    // not found
    const errmsg='Sandbox API | SystemSetting_SetValue | Setting ['+ settingname +'] not found.'
    ui.notifications.error(errmsg);
    console.error(errmsg);
  }
}

async function CheckcItemConsistency(){
  await auxMeth.checkConsistency();
}


// **************************************************************** 
// Macro:        BuildActorTemplates                                                    
// Description:  Build all actor templates.
//               Useful if the template does not show normally
// Parameters :  actortemplatename - optional, if set only this template will rebuild                               
// Example :     for building only the template named _PlayerCharacter
//               BuildActorTemplates('_PlayerCharacter');
//                      
// ================================================================ 
// Date       Version  Author               Description             
// ---------- -------- -------------------- ----------------------- 
// 2021-12-16 1.0.0    Ramses800            Macro created.         
// **************************************************************** 
async function BuildActorTemplates(actortemplatename=''){
  let actortemplates;
  let buildOk=true;
  game.user.setFlag('world','reloadAfterTemplateRebuildDisabled',true);
  if(actortemplatename==''){
    // get all actor templates
    actortemplates=await game.actors.filter(y => y.type=="character" && y.system.istemplate==true);    
  }
  else{
    // get specific actor
    actortemplates=await game.actors.filter(y => y.type=="character" && y.system.istemplate==true && y.name==actortemplatename);
  }    
  if(actortemplates.length>0){ 
    // loop all actors
    //actortemplates.forEach(async function(actortemplate)  { 
    for(let actortemplate of actortemplates){  
      if(actortemplate!=null){
        
        ui.notifications.info('Building actor template '+ actortemplate.name );
        console.log('Sandbox | Building actor template '+ actortemplate.name );                
        try{
          await actortemplate.sheet.buildSheet();         
          ui.notifications.info('Sandbox | Build complete for actor template '+ actortemplate.name );
        }
        catch(err){
          ui.notifications.error('Error building actor template ' + actortemplate.name);
          console.err('Sandbox | Error building actor template' + actortemplate.name);
          console.err(err);          
          buildOk=false;
        }
      }
    };    
    game.user.setFlag('world','reloadAfterTemplateRebuildDisabled',false);
    if(buildOk){      
      await auxMeth.checkConsistency();      
      //await sb_custom_dialog_prompt(game.i18n.localize("Information"),game.i18n.localize("SANDBOX.BuildActorTemplatesCompleteBody"),game.i18n.localize("Ok"),'Information');
      
      // reload to refresh all
      location.reload();
    }
  }
  else{
    ui.notifications.warn('No actor template found');
  }
    
}

//                                                                               
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<o>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 
//                                                                               
//                          Functions for getting Actor                          
//                                                                               
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<o>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 
//                                                                               

// ***************************************************************************** 
// Function:       Actor_GetFromName                                       
// Description:    Get actor with name 
// Parameters:     name as string                
// Returns:        actor, returns null if not found                              
// ============================================================================= 
// Date       Version  Author               Description                          
// ---------- -------- -------------------- ------------------------------------ 
// 2022-04-30 1.0.0    Ramses800            Function created                      
// ***************************************************************************** 
function Actor_GetFromName(actorname){
  let actor;
  actor=game.actors.getName(actorname); 
  if(actor==null){
    ui.notifications.warn('Actor_GetFromName | No Actor found with name [' + actorname + ']');
  }
  return actor;
}

// ***************************************************************************** 
// Function:       Actor_GetFromSheet                 
// Parameters:     event            
// Return:         Returns the actor that called this macro from its Sandbox sheet
//                 If no actor found, it returns null. 
//                 This means generally that the macro have 
//                 been run from the hot bar
// ============================================================================= 
// Date       Version  Author               Description             
// ---------- -------- -------------------- ------------------------------------
// 2021-11-30 1.0.0    Ramses800            Function created                          
// *****************************************************************************  
function Actor_GetFromSheet(event) {
  let returnactor;  
  let cp = event.composedPath();
  for (let key in cp) {
    if (cp.hasOwnProperty(key)) {
      if ((typeof (cp[key]) !== "undefined" && cp[key] !== null)) {
        if ((typeof (cp[key].classList) !== "undefined" && cp[key].classList !== null)) {
          if (cp[key].classList.contains('sandbox') && cp[key].classList.contains('sheet') && cp[key].classList.contains('actor')) {
            //console.log(cp[key].id);  //actor-MMwTr94GekOCihrC   or actor-MMwTr94GekOCihrC-6bX8wMQkdZ9OyOQa
            let sheetinfo=SheetInfo_GetFromSheetId(cp[key].id);
            if(sheetinfo.documentclass!=null && sheetinfo.documentid!=null){
              switch (sheetinfo.documentclass){
                case "Actor":
                  returnactor = game.actors.get(sheetinfo.documentid);
                  break;
                case "Token":
                  let token = canvas.tokens.placeables.find(y=>y.id==sheetinfo.documentid);
                  if (token != null) {
                    returnactor = token.actor;
                  }
                  break;
              }
            }
            // exit for loop, no need to look anymore
            break;
          }
        }
      }
    }
  }
  return returnactor;
}
// ***************************************************************************** 
// Function:       Actor_GetFromSelectedToken                                         
// Description:    Get selected tokens actor                                      
// Returns:        actor, returns null if not found                              
// ============================================================================= 
// Date       Version  Author               Description                          
// ---------- -------- -------------------- ------------------------------------ 
// 2022-04-30 1.0.0    Ramses800            Function created                      
// ***************************************************************************** 
function Actor_GetFromSelectedToken(){
  let actor; // default null
  // get selected token
  let selected = canvas.tokens.controlled; 
  if (selected!=null){
    if(selected.length>0){
      if(selected.length==1){
        let token = selected[0];          
        actor=token.actor;          
      } else{
        ui.notifications.warn('Actor_GetFromSelectedToken | More than one token is selected');
      }
    } else{
      ui.notifications.warn('Actor_GetFromSelectedToken | No token selected');
    }     
  } else{
    ui.notifications.error('Actor_GetFromSelectedToken | Error getting selected tokens');
  }
  return actor;
}

//                                                                               
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<o>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 
//                                                                               
//                    Functions for handling Actor properties                    
//                                                                               
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<o>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 
// 

// ***************************************************************************** 
// Function:       ActorProperty_ToggleValue                                   
// Description:    Toggles a actor checkbox property                
// Parameters:     actor,propertykey                                             
// ============================================================================= 
// Date       Version  Author               Description                          
// ---------- -------- -------------------- ------------------------------------ 
// 2022-04-30 1.0.0    Ramses800            Routine created                      
// ***************************************************************************** 
async function ActorProperty_ToggleValue(actor,propertykey){  
  if (actor !== null && propertykey!=='' ) {    
    let value=ActorProperty_GetValue(actor, propertykey);
    if(value!=null){
      if (value==false){
        await ActorProperty_SetValue(actor, propertykey, true);
      } else {
        await ActorProperty_SetValue(actor, propertykey, false);
      }
    }
  } else {
    ui.notifications.warn('ActorProperty_ToggleValue | Invalid parameters');
  }   
}

// ***************************************************************************** 
// Function:       ActorProperty_HasProperty                                              
// Description:    Checks if actor has property                        
// Parameters:     actor,propertykey                                             
// Returns:        returns true if actor has property, else false                
// ============================================================================= 
// Date       Version  Author               Description                          
// ---------- -------- -------------------- ------------------------------------ 
// 2022-04-30 1.0.0    Ramses800            Routine created                      
// ***************************************************************************** 
function ActorProperty_HasProperty(actor,propertykey){
  let returnvalue=false; // default
  if (actor !== null && propertykey!=='' ) {
    if (actor.system.attributes.hasOwnProperty(propertykey)) {
      returnvalue=true;
    } else {
      ui.notifications.warn('ActorProperty_HasProperty | The actor[' + actor.name + '] does not have property with key [' + propertykey + ']');
    }   
  } 
  else {
    ui.notifications.warn('ActorProperty_HasProperty | Invalid parameters');
  }
  return returnvalue;
}

// **************************************************************** 
// Function:       ActorProperty_GetValue
// Parameters:     actor,propertykey            
// Return:         Returns the value of an actor property 
//                 If no value is found, it returns null. 
// ================================================================ 
// Date       Version  Author               Description             
// ---------- -------- -------------------- -----------------------
// 2021-11-30 1.0.0    Ramses800            Macro created                          
// **************************************************************** 
function ActorProperty_GetValue(actor,propertykey) {
  let returnvalue;  // default null
  if (actor !== null && propertykey!=='' ) {
    if (ActorProperty_HasProperty(actor,propertykey)) {
      returnvalue=actor.system.attributes[propertykey].value;
    } 
  } else {
    ui.notifications.warn('ActorProperty_GetValue | Invalid parameters');
  }
  return returnvalue;
}

// **************************************************************** 
// Function:       ActorProperty_GetProperty
// Parameters:     actor,propertykey            
// Return:         Returns the actor property 
//                 If no property is found, it returns null. 
// ================================================================ 
// Date       Version  Author               Description             
// ---------- -------- -------------------- -----------------------
// 2021-11-30 1.0.0    Ramses800            Macro created                          
// **************************************************************** 
function ActorProperty_GetProperty(actor,propertykey) {
  let returnvalue;  // default null
  if (actor !== null && propertykey!=='' ) {
    if (ActorProperty_HasProperty(actor,propertykey)) {
      returnvalue=actor.system.attributes[propertykey];
    } 
  } else {
    ui.notifications.warn('ActorProperty_GetProperty | Invalid parameters');
  }
  return returnvalue;
}

/* **************************************************************** 
// Function:       ActorProperty_SetValue
// Description:    Sets the value/max of an actor property
// Parameters:     actor,propertykey,newvalue,newmax             
// ================================================================ 
// Date       Version  Author               Description             
// ---------- -------- -------------------- -----------------------
// 2021-11-30 1.0.0    Ramses800            Macro created                          
// ****************************************************************/
async function ActorProperty_SetValue(actor,propertykey,newvalue=null,newmax=null) {
  if (actor !== null && propertykey!=='' ) {
    // check that this actor has the attribute
    if (ActorProperty_HasProperty(actor,propertykey)) {       
      // update this actors property      
      // get property from items db
      let propertyid=actor.system.attributes[propertykey].id;
      let property=game.items.get(propertyid);
      if(property!=null){
        let value=null; // default
        let max=null; // default
        // get type of property
        let propertytype=property.system.datatype;
        switch (propertytype){          
          case 'simpletext':
            value=''+newvalue;  // force to string
            max=null;
            break;
          case 'simplenumeric':
            value=newvalue;
            max=newmax;
            break;
          case 'checkbox':
            if(newvalue==true || newvalue==false){
              value=newvalue;
            } else if(newvalue==1) {
              value=true;
            } else if(newvalue==0){
              value=false;
            } else {
              value=false;
            }
            max=null;
            break;
          case 'textarea':
            value=newvalue;
            max=null;
            break;
          case 'list':
            value=newvalue;
            max=null;
            break;          
          case 'badge':
            value=parseInt(newvalue); // make integer
            max=newmax;
            break; 
          case 'radio':
            value=newvalue;
            max=newmax;
            break;
          case 'label':
          case 'table':
          case 'button':
          default:
            // invalid type, not allowed
            return;
            break;
        }                
        // when updating a value, always set 'modified:=true'
        // when updating a max  , always set 'modmax:=true'
        if(value!==null && max!==null){
          // set value and max
          await actor.update({[`system.attributes.${propertykey}.modmax`]: true,[`system.attributes.${propertykey}.max`]: max,[`system.attributes.${propertykey}.value`]: value,[`system.attributes.${propertykey}.modified`]: true});        
        } else if(value!==null && max==null ){
          // set value only
          await actor.update({[`system.attributes.${propertykey}.value`]: value, [`system.attributes.${propertykey}.modified`]: true});        
        } else if(value==null && max!==null ){
          // only set max
          await actor.update({[`system.attributes.${propertykey}.max`]: max, [`system.attributes.${propertykey}.modmax`]: true});
        }
      } else {
        ui.notifications.warn('ActorProperty_SetValue | Invalid new value for this property['+ propertykey +'] type('+ propertytype +')');
      }      
    } 
  } else {
    ui.notifications.warn('ActorProperty_SetValue | Invalid parameters');
  }    
}

//                                                                               
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<o>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 
//                                                                               
//                      Functions for handling actor cItems                      
//                                                                               
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<o>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 
//
// ***************************************************************************** 
// Function:       ActorcItem_GetFromName                                                 
// Description:    Checks if actor has cItem                         
// Parameters:     actor,citemname                                               
// Returns:        returns actorcitem if actor has cItem, else null                   
// ============================================================================= 
// Date       Version  Author               Description                          
// ---------- -------- -------------------- ------------------------------------ 
// 2022-04-30 1.0.0    Ramses800            Routine created                      
// ***************************************************************************** 
function ActorcItem_GetFromName(actor,citemname) {
  let actorcitem;  // default null
  if (actor !== null && citemname !== '') {
    actorcitem = actor.system.citems.find(y => y.name == citemname);
  } else {
    ui.notifications.warn('ActorcItem_GetFromName | Invalid parameters');
  }
  return actorcitem;
}

/* --------------------------------------------------------------------------------
//                               Activation Functions                              
// --------------------------------------------------------------------------------*/

/* ********************************************************************************
/* Routine          : ActorcItem_IsActive                                      
/* Description      : Returns the current Active state for actor citem 
/* Parameters       : actor,actorcitem                                         
/* Returns          : true or false                                            
/* ================================================================================
/* Date       Version  Author                         Description
/* ---------- -------- ------------------------------ -----------------------------
/* 2022-06-02 1.0.0    Ramses800                      Routine created       
/* *********************************************************************************/
function ActorcItem_IsActive(actor,actorcitem){
  let returnvalue=false;  // default false
  if (actor !== null && actorcitem !== null) {
    returnvalue=actorcitem.isactive;
  } else {
    ui.notifications.warn('ActorcItem_IsActive | Invalid parameters');  
  }
  return returnvalue;
}

/* ********************************************************************************
/* Routine          : ActorcItem_Activate                                      
/* Description      : Sets the current Active state for actor citem to ACTIVE
/* Parameters       : actor,actorcitem                                         
/* ================================================================================
/* Date       Version  Author                         Description
/* ---------- -------- ------------------------------ -----------------------------
/* 2022-06-02 1.0.0    Ramses800                      Routine created       
/* *********************************************************************************/
function ActorcItem_Activate(actor,actorcitem){
  if (actor !== null && actorcitem !== null) {
    ActorcItem_ChangeActivation(actor,actorcitem,true);
  } else {
    ui.notifications.warn('ActorcItem_Activate | Invalid parameters');  
  }
}

/* ********************************************************************************
/* Routine          : ActorcItem_Deactivate                                    
/* Description      : Sets the current Active state for actor citem to INACTIVE
/* Version    
/* Parameters       : actor,actorcitem                                         
/* ================================================================================
/* Date       Version  Author                         Description
/* ---------- -------- ------------------------------ -----------------------------
/* 2022-06-02 1.0.0    Ramses800                      Routine created       
/* *********************************************************************************/
function ActorcItem_Deactivate(actor,actorcitem){
  if (actor !== null && actorcitem !== null) {
    ActorcItem_ChangeActivation(actor,actorcitem,false);
  } else {
    ui.notifications.warn('ActorcItem_Deactivate | Invalid parameters');  
  }
}

/* ********************************************************************************
/* Routine          : ActorcItem_ToggleActivation                              
/* Description      : Toggles the current Active state for actor citem between 
/*                    ACTIVE/INACTIVE       
/* Version                                        
/* Parameters       : actor,actorcitem                                         
/* ================================================================================
/* Date       Version  Author                         Description
/* ---------- -------- ------------------------------ -----------------------------
/* 2022-06-02 1.0.0    Ramses800                      Routine created       
/* *********************************************************************************/
async function ActorcItem_ToggleActivation(actor,actorcitem){
  if (actor !== null && actorcitem !== null) {
    let status=ActorcItem_IsActive(actor,actorcitem);
    if(status){
      await ActorcItem_ChangeActivation(actor,actorcitem,false);
    } else {
      await ActorcItem_ChangeActivation(actor,actorcitem,true);
    }
  } else {
    ui.notifications.warn('ActorcItem_ToggleActivation | Invalid parameters');  
  }
}

/* ********************************************************************************
/* Routine          : ActorcItem_ChangeActivation                              
/* Description      : Changes the current Active state for actor citem to param
/*                    eter new value                                               
/* Parameters       : actor,actorcitem,newvalue=true                           
/* ================================================================================
/* Date       Version  Author                         Description
/* ---------- -------- ------------------------------ -----------------------------
/* 2022-06-02 1.0.0    Ramses800                      Routine created       
/* *********************************************************************************/
async function ActorcItem_ChangeActivation(actor,actorcitem,newvalue=true){
  if (actor !== null && actorcitem !== null) {    
    // check if this is a ACTIVATION citem
    if(actorcitem.usetype=="ACT"){          
      if(newvalue && !actorcitem.isactive){
        // activate   
        await actor.sheet.useCIIcon(actorcitem.id, actorcitem.ciKey, true, false, true);  
      } else if(!newvalue && actorcitem.isactive){
        // deactvate
        await actor.sheet.useCIIcon(actorcitem.id, actorcitem.ciKey, false, false, true);      
      }
    } else {
      ui.notifications.warn('ActorcItem_ChangeActivation | cItem with name [' + actorcitem.name + '] does not have ACTIVATION'); 
    }
  } else {
    ui.notifications.warn('ActorcItem_ChangeActivation | Invalid parameters');  
  } 
}

/* --------------------------------------------------------------------------------
/*                             Uses(Consume) Functions                             
/* --------------------------------------------------------------------------------*/

/* ********************************************************************************
/* Routine          : ActorcItem_Consume                                       
/* Description      : Consumes one use of a CONSUMABLE actor citem 
/* Version                               
/* Parameters       : actor,actorcitem                                         
/* ================================================================================
/* Date       Version  Author                         Description
/* ---------- -------- ------------------------------ -----------------------------
/* 2022-06-02 1.0.0    Ramses800                      Routine created       
/* *********************************************************************************/
async function ActorcItem_Consume(actor,actorcitem){
  if (actor !== null && actorcitem !== null) {    
    // check if consumable        
    if(actorcitem.usetype=="CON"){
      if(actorcitem.uses>0){
        // consume  
        await actor.sheet.useCIIcon(actorcitem.id, actorcitem.ciKey, true, true, true);               
      } else {
        ui.notifications.warn('ActorcItem_Consume | cItem with name [' + actorcitem.name + '] has no charges left');
      }      
    } else {
      ui.notifications.warn('ActorcItem_Consume | cItem with name [' + actorcitem.name + '] is not CONSUMABLE');
    }    
  } else {
    ui.notifications.warn('ActorcItem_Consume | Invalid parameters');  
  } 
}

/* ********************************************************************************
/* Routine          : ActorcItem_Recharge                                      
/* Description      : Recharges a CONSUMABLE actor citem                        
/* Parameters       : actor,actorcitem                                         
/* ================================================================================
/* Date       Version  Author                         Description
/* ---------- -------- ------------------------------ -----------------------------
/* 2022-06-02 1.0.0    Ramses800                      Routine created       
/* *********************************************************************************/
async function ActorcItem_Recharge(actor,actorcitem){
  if (actor !== null && actorcitem !== null) {    
    // check if consumable        
    if(actorcitem.usetype=="CON"){      
      if(actorcitem.rechargable==true){
        // recharge 
        await actor.sheet.rechargeCI(actorcitem.id, actorcitem.ciKey);         
      } else {
        ui.notifications.warn('ActorcItem_Recharge | cItem with name [' + actorcitem.name + '] cannot be recharged');
      }      
    } else {
      ui.notifications.warn('ActorcItem_Recharge | cItem with name [' + actorcitem.name + '] is not CONSUMABLE');
    }    
  } else {
    ui.notifications.warn('ActorcItem_Recharge | Invalid parameters');  
  } 
}

/* ********************************************************************************
/* Routine          : ActorcItem_ChangeUses                                    
/* Description      : Change current USES of a CONSUMABLE actor citem               
/* Parameters       : actor,actorcitem,newvalue=0                              
/* ================================================================================
/* Date       Version  Author                         Description
/* ---------- -------- ------------------------------ -----------------------------
/* 2022-06-02 1.0.0    Ramses800                      Routine created       
/* *********************************************************************************/
async function ActorcItem_ChangeUses(actor,actorcitem,newvalue=0) {
  if (actor !== null && actorcitem !== null) {
    // check if consumable        
    if (actorcitem.usetype == "CON") {
      if (newvalue <= actorcitem.maxuses && newvalue >= 0) {
        await actor.sheet.changeCIUses(actorcitem.id, newvalue);
      } else {
        ui.notifications.warn('ActorcItem_ChangeUses | Invalid new value(' + newvalue + ') for cItem ' + actorcitem.name + 'Min:0 Max:' + actorcitem.maxuses);
      }
    } else {
      ui.notifications.warn('ActorcItem_ChangeUses | cItem with name [' + actorcitem.name + '] is not CONSUMABLE');
    }
  } else {
    ui.notifications.warn('ActorcItem_ChangeUses | Invalid parameters');
  }
}

/* ********************************************************************************
/* Routine          : ActorcItem_IncreaseUses                                  
/* Description      : Increases current USES by 1 of a CONSUMABLE actor citem      
/* Parameters       : actor,actorcitem                                         
/* ================================================================================
/* Date       Version  Author                         Description
/* ---------- -------- ------------------------------ -----------------------------
/* 2022-06-02 1.0.0    Ramses800                      Routine created       
/* *********************************************************************************/
async function ActorcItem_IncreaseUses(actor,actorcitem) {
  if (actor !== null && actorcitem !== null) {
    // check if consumable        
    if (actorcitem.usetype == "CON") {
      if(actorcitem.uses<actorcitem.maxuses){           
        await actor.sheet.changeCIUses(actorcitem.id, parseInt(actorcitem.uses)+1);
      } else {
        ui.notifications.warn('ActorcItem_IncreaseUses | cItem with name [' + actorcitem.name + '] charges can not be increased over ['+ actorcitem.maxuses +']');
      } 
    } else {
      ui.notifications.warn('ActorcItem_IncreaseUses | cItem with name [' + actorcitem.name + '] is not CONSUMABLE');
    }
  } else {
    ui.notifications.warn('ActorcItem_IncreaseUses | Invalid parameters');
  }
}

/* ********************************************************************************
/* Routine          : ActorcItem_DecreaseUses                                  
/* Description      : Decreases current USES by 1 of a CONSUMABLE actor citem 
/* Version      
/* Parameters       : actor,actorcitem                                         
/* ================================================================================
/* Date       Version  Author                         Description
/* ---------- -------- ------------------------------ -----------------------------
/* 2022-06-02 1.0.0    Ramses800                      Routine created       
/* *********************************************************************************/
async function ActorcItem_DecreaseUses(actor,actorcitem) {
  if (actor !== null && actorcitem !== null) {
    // check if consumable        
    if (actorcitem.usetype == "CON") {
      if(actorcitem.uses>0){           
        await actor.sheet.changeCIUses(actorcitem.id, parseInt(actorcitem.uses)-1);
      } else {
        ui.notifications.warn('ActorcItem_DecreaseUses | cItem with name [' + actorcitem.name + '] charges can not be decreased below [0]');
      } 
    } else {
      ui.notifications.warn('ActorcItem_DecreaseUses | cItem with name [' + actorcitem.name + '] is not CONSUMABLE');
    }
  } else {
    ui.notifications.warn('ActorcItem_DecreaseUses | Invalid parameters');
  }
}

/* --------------------------------------------------------------------------------
/*                               Add/Remove Functions                              
/* --------------------------------------------------------------------------------*/

/* ********************************************************************************
/* Routine          : ActorcItem_Add                                               
/* Description      : Adds a cItem to the actor                                       
/* Parameters       : actor,citem,number=1                                         
/* Returns          : The actor cItem created(Promise)
/* Special Logic    : Use this with "await" to be able to use the returned citem
/*                    EXAMPLE
/*                    actorcitem = await ActorcItem_Add(actor,citem) ;
/*                    await ActorcItem_IncreaseNumber(actor,actorcitem);        
/*                    await ActorcItem_Activate(actor,actorcitem);                   
/* ================================================================================
/* Date       Version  Author                         Description
/* ---------- -------- ------------------------------ -----------------------------
/* 2022-06-02 1.0.0    Ramses800                Routine created       
/* *********************************************************************************/
async function ActorcItem_Add(actor,citem,number=1){
  // check if actor already has this citem
  let actorcitem = actor.system.citems.find(y=>y.ciKey == citem.system.ciKey); 
  if(actorcitem==null){
    // prepare citem to be added to actor    
    let subitems =await actor.addcItem(citem,null,null,number);
    if (actor.isToken) {
      let myToken = canvas.tokens.get(actor.token.id);
      await myToken.document.update({ "actorData.system.citems": subitems });
    }
    else {
      await actor.update({ "system.citems": subitems });
    }
    // if added quantity is more than 1, adjust uses 
    // (seems to be a small bug in Sandbox addcItem that only adds uses for 1 item regardless of number supplied)    
    if(number>1){
      let actorcitem = actor.system.citems.find(y=>y.ciKey == citem.system.ciKey);
      let newuses=parseInt(actorcitem.maxuses*number);
      let citemIDs = duplicate(actor.system.citems);
      let citemNew = citemIDs.find(y => y.id == actorcitem.id);
      citemNew.uses = parseInt(newuses); 
      await actor.update({ "system.citems": citemIDs });
    }
    // get the new actor citem    
    actorcitem = actor.system.citems.find(y=>y.ciKey == citem.system.ciKey)       
  } else {
    // actor has this citem, increase number
    ActorcItem_IncreaseNumber(actor,actorcitem,number);
  } 
  // return actorcitem      
  return actorcitem;
}

/* ********************************************************************************
/* Routine          : ActorcItem_Delete                                            
/* Description      : Deletes a cItem from the actor                                  
/* Parameters       : actor,actorcitem                                             
/* ================================================================================
/* Date       Version  Author                         Description
/* ---------- -------- ------------------------------ -----------------------------
/* 2022-06-02 1.0.0    Ramses800                Routine created       
/* *********************************************************************************/
async function ActorcItem_Delete(actor,actorcitem){       
  if (actor!=null){                   
    if (actorcitem!=null){  
      //debugger;
      let subitems = await actor.deletecItem(actorcitem.id, false);              
      if (actor.isToken) {
        let myToken = canvas.tokens.get(actor.token.id);
        await myToken.actor.update({ "system": subitems.system });                  
      }
      else {
        await actor.update({ "system": subitems.system });
      }                              
    }
  }                                                
}

/* --------------------------------------------------------------------------------
/*                                 Number Functions                                
/* --------------------------------------------------------------------------------*/

/* ********************************************************************************
/* Routine          : ActorcItem_IncreaseNumber                                
/* Description      : Increases current NUMBER by parameter number(default 1)  
/*                    of an actor citem                                            
/* Parameters       : actor,actorcitem,number=1                                
/* ================================================================================
/* Date       Version  Author                         Description
/* ---------- -------- ------------------------------ -----------------------------
/* 2022-06-02 1.0.0    Ramses800                      Routine created       
/* *********************************************************************************/
async function ActorcItem_IncreaseNumber(actor,actorcitem,number=1){
  // increase number 
  let newnumber=parseInt(actorcitem.number)+number;              
  // account for uses
  let newuses=parseInt(actorcitem.uses) + (Math.round(actorcitem.maxuses/actorcitem.number)*number);                          
  let citemIDs = duplicate(actor.system.citems);
  let citemNew = citemIDs.find(y => y.id == actorcitem.id);
  citemNew.number = newnumber;                                
  citemNew.uses = parseInt(newuses);
  await actor.update({ "system.citems": citemIDs });
}

/* ********************************************************************************
/* Routine          : ActorcItem_DecreaseNumber                                
/* Description      : Decreases current NUMBER by 1 of an actor citem               
/* Parameters       : actor,actorcitem                                         
/* ================================================================================
/* Date       Version  Author                         Description
/* ---------- -------- ------------------------------ -----------------------------
/* 2022-06-02 1.0.0    Ramses800                      Routine created       
/* *********************************************************************************/
async function ActorcItem_DecreaseNumber(actor,actorcitem){
  // decrease number
  if(parseInt(actorcitem.number)>0){ 
    let newnumber=parseInt(actorcitem.number)-1;              
    // account for uses
    let newuses=parseInt(actorcitem.uses) - (Math.round(actorcitem.maxuses/actorcitem.number)*1);
    let maxuses=actorcitem.maxuses; 
    if (newuses<0){
      newuses=0;
    }                         
    let citemIDs = duplicate(actor.system.citems);
    let citemNew = citemIDs.find(y => y.id == actorcitem.id);
    citemNew.number = newnumber;                                
    citemNew.uses = parseInt(newuses); 
    citemNew.maxuses = parseInt(maxuses);
    await actor.update({ "system.citems": citemIDs });
  }
}

//                                                                               
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<o>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 
//                                                                               
//                      Functions for handling cItems                      
//                                                                               
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<o>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 
//    

/* ********************************************************************************
/* Routine          : cItem_GetFromName                                           
/* Parameters       : citemname                                                
/* Returns          : Returns cItem from items database                        
/* ================================================================================
/* Date       Version  Author                         Description
/* ---------- -------- ------------------------------ -----------------------------
/* 2022-06-02 1.0.0    Ramses800                      Routine created       
/* *********************************************************************************/
function cItem_GetFromName(citemname){
  let citem=game.items.find(y=>y.name == citemname && y.type=="cItem");
  if(citem==null){
     ui.notifications.warn('cItem_GetFromName | The cItem with name [' + citemname + '] can not be found in the items database');
  }
  return citem;
}

//                                                                               
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<o>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 
//                                                                               
//                          Functions for Actor Sheets                          
//                                                                               
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<o>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 
//  
function ActorSheet_GetFromActor(actor){
  let actorsheet;
  if(actor==null){
    ui.notifications.warn('ActorSheet_Render | No Actor data supplied');
  } else {
    actorsheet=actor.sheet;       
  } 
  return actorsheet;
}

function ActorSheet_Render(actorsheet){
  if(actorsheet==null){
    ui.notifications.warn('ActorSheet_Render | No Actor Sheet found');
  } else {
    actorsheet.render(true,{focus:true});
  }        
}


//                                                                               
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<o>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 
//                                                                               
//                                Support Functions                          
//                                                                               
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<o>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 
// 
function SheetInfo_GetFromSheetId(sheetid){         
  let sheetinfo={
    documentclass:null,
    sheetclass:null,
    documentid:null,
    sceneid:null,
    compendium_type:null,
    compendium_name:null
  };
  let substrings=sheetid.split("-");
  
  if(substrings.length>0){
    sheetinfo.sheetclass=substrings[0];
    switch (substrings[0]){
      case "gActorSheet":        
        if(substrings.length>1){
          switch (substrings[1]){
            case "Actor":
              // actor            :gActorSheet-Actor-8I8j7C8KRYY6zQSK
              if(substrings.length>2){
                sheetinfo.documentclass=substrings[1];
                sheetinfo.documentid=substrings[2];
              }
              break;
            case "Scene":
              // token actor      :gActorSheet-Scene-8VQZqtjzEgqqaPDK-Token-MPWjc8w15806WYt1
              if(substrings.length>4){
                sheetinfo.documentclass=substrings[3];
                sheetinfo.documentid=substrings[4];
                sheetinfo.sceneid=substrings[2];
              }
              break;
            case "Compendium":
              // compendium actor :gActorSheet-Compendium-world-monsters-PbY9XcLCKKGrlvtU              
              if(substrings.length>4){
                sheetinfo.documentclass=substrings[1];
                sheetinfo.documentid=substrings[4];
                sheetinfo.compendium_name=substrings[3];
                sheetinfo.compendium_type=substrings[2];
              }
              break;
          }
        }                  
        break;
      case "sItemSheet":                
        if(substrings.length>1){
          switch (substrings[1]){            
            case "Item":
              //sItemSheet-Item-Wif4h38I0OiNapG1
              if(substrings.length>2){
                sheetinfo.documentclass=substrings[1];
                sheetinfo.documentid=substrings[2];
              }
              break;
            case "Compendium":
              //sItemSheet-Compendium-world-equipment-OuRNFgwaueUsYhFh
              if(substrings.length>4){
                sheetinfo.documentclass=substrings[1];
                sheetinfo.documentid=substrings[4];
                sheetinfo.compendium_name=substrings[3];
                sheetinfo.compendium_type=substrings[2];
              }
              break;
          }
        }
        break;
    }             
  }          
  return sheetinfo;  
}


async function fontAwesomeIconPicker(selectedclass='',defaultclass='', addToTitle='') {
  let sTitle=`Icon Picker` + addToTitle;
  let html=`
    <style>
    
    </style>
    <script>
    
    async function iconPickerReadJSONFile(sfileurl){
      let result = null;      
      const response = await fetch(sfileurl);
      if (!response.ok) {
        const message = 'Icon Picker : Can not read icon file, response[' + response.status +']';
        ui.notifications.error(message);
      } else {
        result = await response.json();
      }  
      return result;
    }
  
    async function iconPickerLoadIcons(){
      
      let iconshtml='';
      let iconcount= 0;  
      let iconarray=[];
      let iconsjson=null; 
      // load from json, start with brands
      iconsjson = await iconPickerReadJSONFile("systems/sandbox/module/fontawesome-icons-brands.json"); 
      if (iconsjson!=null){
        iconsjson.forEach(function(item){          
          // check if ends with ::before
          if(item.selector!=null){
            if(item.selector.trim().endsWith(':before')){ 
              // split selectors
              const selectors=item.selector.split(',');
              // use the first selector and get rid starting . and ending  of ::before
              const selector='fa-brands ' + selectors[0].trim().substr(1, selectors[0].trim().length - 8 );                               
              iconcount = iconcount + 1;              
              iconarray.push(selector);
            }
          }
  
        });
      }
      // load from json, the rest
      iconsjson = await iconPickerReadJSONFile("systems/sandbox/module/fontawesome-icons.json"); 
      if (iconsjson!=null){
        iconsjson.forEach(function(item){          
          // check if ends with ::before
          if(item.selector!=null){
            if(item.selector.trim().endsWith(':before')){ 
              // split selectors
              const selectors=item.selector.split(',');
              // use the first selector and get rid starting . and ending  of ::before
              const selector=selectors[0].trim().substr(1, selectors[0].trim().length - 8 );                               
              iconcount = iconcount + 1;              
              iconarray.push(selector);
            }
          }
  
        });
      }
      console.log('Sandbox | IconPicker | icons loaded:' + iconcount);

      if (iconarray.length>0) {                               
        // sort array
        iconarray.sort((a, b) => a.localeCompare(b));
        // get any filter active
        let textfilter=document.getElementById("sb-icon-picker-filter").value;
        
        if(textfilter.length>0){
          // check for multiple search
          let filterused=textfilter.trim().split(' ')
          for (let i = 0; i < filterused.length; i++) {
            if(filterused[i].trim().length>0){
              iconarray=iconarray.filter(name => name.includes(filterused[i].trim()));
            }
          } 
          
        } 
        // output array
        for (var i = 0; i < iconarray.length; i++) {      
          iconshtml+= '<div class="sb-icon-picker-displayframe" title="' + iconarray[i] +'" dataitem="' + iconarray[i] +'"  onclick="iconPickerSelectIcon();"><i dataitem="' + iconarray[i] +'" class="sb-icon-picker-displayicon fas ' + iconarray[i] +'"  ></i></div>';
        }
        // update div
        document.getElementById("sb-icon-picker-body").innerHTML=iconshtml;
      }
    }
     
    function iconPickerLoadPreviousIcons(){
      let previousicons='';
      let current_previous_used_icons=game.user.getFlag('world','sb-icon-picker-previous-used-icons');
      if(current_previous_used_icons!=null){
        if(current_previous_used_icons.length>0){                                                                
          // add other prevoius
          for (let i = 0; i < current_previous_used_icons.length; i++) {
            previousicons+= '<div class="sb-icon-picker-displayframe" title="' + current_previous_used_icons[i] +'" dataitem="' + current_previous_used_icons[i] +'"  onclick="iconPickerSelectIcon();"><i dataitem="' + current_previous_used_icons[i] +'" class="sb-icon-picker-displayicon fas ' + current_previous_used_icons[i] +'"  ></i></div>';
          } 
        // update div
        document.getElementById("sb-icon-picker-previous-selected-body").innerHTML=previousicons;
        }
      }
    }
  
  
    function iconPickerLoadStandardIcons(){
      const standardicons=['fa-book','fa-vial','fa-star','fa-dice-d20','fa-dice-d12','fa-dice-d10','fa-dice-d8','fa-dice-d6','fa-dice-d4','fa-circle','fa-square','fa-file-alt','fa-times-circle'];
      let iconshtml='';
      for (let i = 0; i < standardicons.length; i++) {
          iconshtml+= '<div class="sb-icon-picker-displayframe" title="' + standardicons[i] +'" dataitem="' + standardicons[i] +'"  onclick="iconPickerSelectIcon();"><i dataitem="' + standardicons[i] +'" class="sb-icon-picker-displayicon fas ' + standardicons[i] +'"  ></i></div>';
      } 
      // update div
      document.getElementById("sb-icon-picker-standard-icons-body").innerHTML=iconshtml;
        
      
    }
  
  
  
    function iconPickerSelectIcon() {        
      let target=event.target;  
      let selector=target.getAttribute('dataitem');
      document.getElementById("sb-icon-picker-selected-icon-class").value=selector;
      document.getElementById("sb-icon-picker-selected-icon-preview").className = 'sb-icon-picker-displayicon fas ' + selector;
    }
    function iconPickerSelectedIconTextChanged() {
      let selector=document.getElementById("sb-icon-picker-selected-icon-class").value;
      document.getElementById("sb-icon-picker-selected-icon-preview").className = 'sb-icon-picker-displayicon fas ' + selector;
    }
    function iconPickerFilter() {
      iconPickerLoadIcons(); 
    }
    function iconPickerFilterClear() {
      document.getElementById("sb-icon-picker-filter").value='';
      iconPickerLoadIcons(); 
    }
    function iconPickerBringToFront(){
      let dialog_element=document.getElementById('sb-icon-picker-dialog'); 
      if(dialog_element!=null){
        // get app id 
        const appID=dialog_element.getAttribute('data-appid');
        if(appID!=null){
          let app=ui.windows[appID];
          if (app!=null){    
            // attempt to bring to the front
            app.bringToTop(); 
          }
        }
      }
    }
  
    </script>
    <fieldset>
      <legend class="sb-icon-picker-title">Icon library</legend>
      <div>
        <span class="sb-icon-picker-span-no-break" >
          <label class="sb-icon-picker-label-no-break" for="sb-icon-picker-filter">Search filter</label><input type="text" id="sb-icon-picker-filter" onkeyup="iconPickerFilter()"/>
          <button class="sb-icon-picker-button-filter" type="button" onclick="iconPickerFilter()" title="Search"><i  class="fa-solid fa-magnifying-glass"></i></button> 
          <button class="sb-icon-picker-button-filter" type="button" onclick="iconPickerFilterClear()" title="Clear filter"><i  class="fa-solid fa-times-circle"></i></button> 
        </span>
      </div>
      <div id="sb-icon-picker-body" class ="sb-icon-picker-body">
      </div>
    </fieldset> 
  
    <fieldset class="sb-icon-picker-default-icon">
      <legend class="sb-icon-picker-title">Default icon</legend>
      <div id="sb-icon-picker-default-icon-body" class ="sb-icon-picker-default-icon-body">        
        <div class="sb-icon-picker-displayframe" title="${defaultclass}" dataitem="${defaultclass}"  onclick="iconPickerSelectIcon();"><i dataitem="${defaultclass}" class="sb-icon-picker-displayicon fas ${defaultclass}"  ></i></div>
      </div>
    </fieldset>  
  
    <fieldset class="sb-icon-picker-standard-icon">
      <legend class="sb-icon-picker-title">Standard icons</legend>
      <div id="sb-icon-picker-standard-icons-body" class ="sb-icon-picker-standard-icons-body">                
      </div>
    </fieldset>  
  
    <fieldset class="sb-icon-picker-previous-icons">
      <legend class="sb-icon-picker-title">Previously used icons</legend>
      <div id="sb-icon-picker-previous-selected-body" class ="sb-icon-picker-previous-selected-body">
      </div>
    </fieldset>  
    <fieldset>
      <legend class="sb-icon-picker-title">Selected icon</legend>
      <div>      
        <span class="sb-icon-picker-span-no-break" >
          <label class="sb-icon-picker-label-no-break">Selected icon</label>
          <div class="sb-icon-picker-displayframe"><i id="sb-icon-picker-selected-icon-preview" class="sb-icon-picker-displayicon fas ${selectedclass}" ></i></div>
          <input style="margin-left: 12px;" type="text" disabled id="sb-icon-picker-selected-icon-class" class="sb-icon-picker-selected-icon-class" onchange="iconPickerSelectedIconTextChanged()" value="${selectedclass}"/>                
        </span>
      </div>
    </fieldset>
    <script>
    iconPickerLoadIcons();
    iconPickerLoadStandardIcons();
    iconPickerLoadPreviousIcons();
    // make sure the dialog is in front
    iconPickerBringToFront();
    </script>
    
    `;
  
  
  let dialog = new Promise((resolve, reject) => {
    new Dialog({
      title: sTitle,
      content: html,      
      buttons: {
        ok: {
          icon: '<i class ="fas fa-check"></i>',
          label: `OK`,
          callback: async() => {
            const selectedicon=document.getElementById("sb-icon-picker-selected-icon-class").value;
            // get previous
            let current_previous_used_icons=game.user.getFlag('world','sb-icon-picker-previous-used-icons');
            
            let updated_previous_used_icons=[];
            
            // add it                
            updated_previous_used_icons.push(selectedicon);
            if(current_previous_used_icons!=null){
              if(current_previous_used_icons.length>0){                                                                
                // add other prevoius
                let icons_added=1;
                for (let i = 0; i < current_previous_used_icons.length; i++) {
                  // only use the lastest x
                  if(icons_added==18){
                    break;
                  }
                  // only add others
                  if(current_previous_used_icons[i]!=selectedicon){
                    updated_previous_used_icons.push(current_previous_used_icons[i]);
                    icons_added = icons_added + 1;
                  }
                } 
              }
            }
            
            game.user.setFlag('world','sb-icon-picker-previous-used-icons',updated_previous_used_icons)
            resolve(selectedicon);
          }
        },
        cancel: {
          icon: '<i class ="fas fa-times"></i>',
          label: `Cancel`,
          callback: () => {  
            // game.user.unsetFlag('world','sb-icon-picker-previous-used-icons');
            resolve('');
          }
        }
      },
      default: "ok",
      close: () => {
        resolve('')
      }      
    }).render(true,{
            width: "632",
            height: "750",
            resizable: false,
            id:"sb-icon-picker-dialog",
            closeOnSubmit:false
    });
  });
  let answer = await dialog;
  return answer;
}

async function getGameWorldInfo(){
  let compendiumcount=game.packs.size;
  let compendiumactortotalcount=0;
  let compendiumactorcount=0;
  let compendiumactortemplatecount=0;
  let compendiumitemcount=0;
  let compendiumpropertycount=0;
  let compendiumcitemcount=0;
  let compendiumpanelcount=0;
  let compendiummultipanelcount=0;
  let compendiumsheettabcount=0;
  let compendiumgroupcount=0;
  let compendiumlookupcount=0;
  
  let count=0;

  for (let pack of game.packs) {      
      if (pack.documentName == "Item"){          
        const packContents = await pack.getDocuments();
        compendiumitemcount += packContents.length;
        compendiumpropertycount   += await packContents.filter(y =>y.type=='property').length;
        compendiumcitemcount      += await packContents.filter(y =>y.type=='cItem').length;
        compendiumpanelcount      += await packContents.filter(y =>y.type=='panel').length;
        compendiummultipanelcount += await packContents.filter(y =>y.type=='multipanel').length;
        compendiumsheettabcount   += await packContents.filter(y =>y.type=='sheettab').length;
        compendiumgroupcount      += await packContents.filter(y =>y.type=='group').length;                        
        compendiumlookupcount      += await packContents.filter(y =>y.type=='lookup').length;
      } else if(pack.documentName == "Actor"){
        const packContents = await pack.getDocuments();
        compendiumactortotalcount +=packContents.length;;
        count=await packContents.filter(y =>y.system.istemplate==false).length;
        compendiumactorcount+=count;
        count=await packContents.filter(y =>y.system.istemplate==true).length;
        compendiumactortemplatecount+=count;
      }
  }
  
  let gameworldinfo={
    game:{
      items:{
        total:game.items.size,
        properties:game.items.filter(y=> y.type=='property').length,
        citems:game.items.filter(y=> y.type=='cItem').length,
        panels:game.items.filter(y=> y.type=='panel').length,
        multipanels:game.items.filter(y=> y.type=='multipanel').length,
        sheettabs:game.items.filter(y=> y.type=='sheettab').length,
        groups:game.items.filter(y=> y.type=='group').length,
        lookups:game.items.filter(y=> y.type=='lookup').length
      },
      actors:{
        total:game.actors.size,
        actors:game.actors.filter(y=> y.system.istemplate==false).length,
        actortemplates:game.actors.filter(y=> y.system.istemplate==true).length
      }
    },
    compendium:{      
      total:compendiumcount,
      items:{
        total:compendiumitemcount,
        properties:compendiumpropertycount,
        citems:compendiumcitemcount,
        panels:compendiumpanelcount,
        multipanels:compendiummultipanelcount,
        sheettabs:compendiumsheettabcount,
        groups:compendiumgroupcount,
        lookups:compendiumlookupcount
      },
      actors:{
        total:compendiumactortotalcount,
        actors:compendiumactorcount,
        actortemplates:compendiumactortemplatecount
      }
    },
    folders:{
      total:game.folders.size
    }
  };
  return gameworldinfo;
}