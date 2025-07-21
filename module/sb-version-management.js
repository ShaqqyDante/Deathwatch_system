import  { 
          SETTINGATTRIBUTE,
          sb_item_sheet_get_game_setting
        } from "./sb-setting-constants.js";
import { sb_custom_dialog_prompt,
         sb_custom_dialog_confirm} from "./sb-custom-dialogs.js";
import  { getSandboxItemIconFile } from "./sb-itemsheet-helpers.js";
import { auxMeth } from "./auxmeth.js";

export async function versionManagement(){
  // check if world flag for system version has been set
  const WORLD_LAST_CORE_VERSION_USED = sb_item_sheet_get_game_setting("sandbox", SETTINGATTRIBUTE.WORLD_LAST_CORE_VERSION_USED.ID);
  const WORLD_LAST_SYSTEM_VERSION_USED = sb_item_sheet_get_game_setting("sandbox", SETTINGATTRIBUTE.WORLD_LAST_SYSTEM_VERSION_USED.ID);
  
  let worldHasData=true;
  let versionDataFound=false;
  // pre v0.14.0, the sandbox did not save the version used with the world
  if(WORLD_LAST_SYSTEM_VERSION_USED==''){
    // not set yet
    console.log('Sandbox | versionManagement | World last system used not set');
    // check if the world has any data
    if(game.items.size==0 && game.actors.size == 0 ){
      // new world
      worldHasData=false;
      console.log('Sandbox | versionManagement | World has no items/actors');
    }
    if(worldHasData){    
      console.log('Sandbox | versionManagement | World has items/actors');      
      // check all actors for version data  _stats(added in foundry v10)
      for (let [key, actor] of  game.actors.entries()) {	
        if(actor._stats.systemVersion!=null){
          // actor found with version data
          console.log(key + " = " + actor.name)
          versionDataFound=true;
          break;
        }
      }                  
      // check all items for version data
      if(!versionDataFound){
        for (let [key, item] of  game.items.entries()) {	
          if(item._stats.systemVersion!=null){
            // actor found with version data
            console.log(key + " = " + item.name)
            versionDataFound=true;
            break;
          }
        } 
      }            
      // if world has data and no version info is found for any actors/items then assume this is a migrated world from pre 0.14.0
      if(!versionDataFound){  
        // inform user
        await sb_custom_dialog_prompt(game.i18n.localize("Warning"),game.i18n.localize("SANDBOX.VersionManagementBeforeMigrationBody"),game.i18n.localize("Ok"),'Warning');
        // start migration
        await migrate_Older_To_0_14();
        // migration complete
        await sb_custom_dialog_prompt(game.i18n.localize("Information"),game.i18n.localize("SANDBOX.VersionManagementAfterMigrationBody"),game.i18n.localize("Ok"),'Information');
        // remind user        
        await sb_custom_dialog_prompt(game.i18n.localize("Warning"),game.i18n.localize("SANDBOX.VersionManagementAfterMigrationTo10NoticeBody"),game.i18n.localize("Ok"),'Warning');
        
      }
    } else {
      // no actors or items found, assume new world
    }
    
    
  } else {
    // version info found in world settings
    console.log('Sandbox | versionManagement | World last Foundry core used:' + WORLD_LAST_CORE_VERSION_USED);
    console.log('Sandbox | versionManagement | World last Sandbox system used:' + WORLD_LAST_SYSTEM_VERSION_USED);
    // for future migrations use this data
    if (isNewerVersion(game.version, WORLD_LAST_CORE_VERSION_USED)) {
      console.log('Sandbox | versionManagement | World started with newer version of Foundry:' + game.version);      
    }
    if (isNewerVersion(game.system.version, WORLD_LAST_SYSTEM_VERSION_USED)) {
      console.log('Sandbox | versionManagement | World started with newer version of Sandbox:' + game.system.version);
    }
  }
  
  // check if world has Sandbox extensions installed and actve
  let isSandboxExtensionsActive=false;
  if (game.modules.get("sandbox-extensions")!=null ){
    isSandboxExtensionsActive=game.modules.get("sandbox-extensions").active;
    console.log('Sandbox | versionManagement | Sandbox Extension is active:' + isSandboxExtensionsActive);
    if(isSandboxExtensionsActive){      
      await sb_custom_dialog_prompt(game.i18n.localize("Information"),game.i18n.localize("SANDBOX.VersionManagementExtensionsWarningBody"))
      // disable the module
      let moduleSettings = game.settings.get('core','moduleConfiguration')
      moduleSettings['sandbox-extensions'] = false;
      await game.settings.set('core','moduleConfiguration',moduleSettings)
      let answer = await sb_custom_dialog_confirm(game.i18n.localize("SETTINGS.ReloadPromptTitle"),'<p>' +game.i18n.localize("SETTINGS.ReloadPromptBody") +'</p>',game.i18n.localize("Yes"),game.i18n.localize("No"))
      if(answer){
        // reload for settings to take effect
        location.reload();
      }
    }   
  }
  
  // update world setting for versions 
  await game.settings.set(game.system.id, SETTINGATTRIBUTE.WORLD_LAST_SYSTEM_VERSION_USED.ID, game.system.version);  
  await game.settings.set(game.system.id, SETTINGATTRIBUTE.WORLD_LAST_CORE_VERSION_USED.ID, game.version);  
}


async function migrate_Older_To_0_14(){
  console.log('Sandbox | Running migration updates for pre 0.14 worlds');
  await game.user.setFlag('world','updateItemMapsDisabled',true)
  ui.notifications.info('Migration | Updating radio properties',{console:false});
  //
  console.log('Sandbox | Updating radio properties');
  // Properties radio 
  let properties=game.items.filter(y=> y.type=='property' && y.system.datatype=='radio')
  let new_icon=null;
  for (let i = 0; i < properties.length; i++) {
    new_icon=null;
    switch (properties[i].system.radiotype){
      case 'C':
        new_icon='fa-circle';
        break;
      case 'S':
        new_icon='fa-square';
        break;
      case '':
        new_icon='fa-circle';
        break;
      default:
        new_icon='fa-circle';
        break;
    }
    if(new_icon!=null){
      console.log('Sandbox | Updating radio property ['+ properties[i].name  +'] key ['+ properties[i].system.attKey +']')
      await properties[i].update({ "system.radiotype": new_icon });
    } 
  } 
  console.log('Sandbox | Radio properties updated');
  //
  console.log('Sandbox | Updating consumable cItems properties');   
  let citems=game.items.filter(y=> y.type=='cItem' && y.system.usetype=='CON')  
  for (let i = 0; i < citems.length; i++) {
    new_icon=null;
    switch (citems[i].system.icon){
      case 'BOOK':
        new_icon='fa-book';
        break;
      case 'VIAL':
        new_icon='fa-vial';
        break;
      case 'STAR':
        new_icon='fa-star';
        break;
      case '':
        new_icon='fa-book';
        break;
      default:
        new_icon='fa-book';
        break;
    }
    if(new_icon!=null){
      console.log('Sandbox | Updating consumable cItem ['+ citems[i].name  +'] consume icon ['+ citems[i].system.icon +'] -> '+ '[' + new_icon +']');
      await citems[i].update({ "system.icon": new_icon });
    } 
  } 
  console.log('Sandbox | Consumable cItems properties updated');
  
  //
  let answer = await sb_custom_dialog_confirm(game.i18n.localize("SANDBOX.VersionManagementUpdateItemImagesPromptTitle"),game.i18n.localize("SANDBOX.VersionManagementUpdateItemImagesPromptBody"),game.i18n.localize("Yes"),game.i18n.localize("No"))
  if(answer){
    let api=game.system.api;
    await api.updateItemsAllImg();
    
    
  }
  ui.notifications.info('Migration | Running consistency checks',{console:false});
  await auxMeth.checkConsistency();
  
  await game.user.setFlag('world','updateItemMapsDisabled',false);
  // update custom item maps
  await auxMeth.updateItemMaps();
  console.log('Sandbox | Migration updates for pre 0.14 worlds completed');
}





