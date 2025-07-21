/**
 * A system to create any RPG ruleset without needing to code
 * Author: Seregras
 * Software License: GNU GPLv3
 */

// export const needed by SystemSettingsForm
export const _system_ignore_settings=[];       // array of strings containing settings that should not be displayed, can be empty []


// Import Modules
import { gActorSheet } from "./gactorsheet.js";
import { sItemSheet } from "./sitemsheet.js";
import { gActor } from "./a-entity.js";
import { gItem } from "./i-entity.js";
import { SBOX } from "./config.js";
import { auxMeth } from "./auxmeth.js";
import { sToken } from "./sandboxtoken.js";
import { SandboxToolsForm } from "./sb-tools-form.js";
import { SandboxAPI } from "./sb-api.js";
import { DropDownMenu } from "./dropdownmenu.js";
import { SystemSettingsForm } from "./system-settings-form.js";
import { SBBugReport } from "./sb-bug-report.js";

import  { 
          sb_settings_menus,
          sb_settings_registration 
        } from "./sb-settings-registration.js";
import  { 
          SETTINGATTRIBUTE,
          sb_item_sheet_get_game_setting
        } from "./sb-setting-constants.js";
import  { ITEMATTRIBUTE } from "./sb-itemsheet-constants.js"
import  { 
          sb_sheet_appwindow_id,
          sb_sheet_display_id_in_window_caption,
          sb_sheet_display_show_to_others_in_sheet_caption,
          sb_sheet_display_show_infoform_source_in_sheet_caption,
          sb_sheet_item_delete_protection_add_caption_icon,
          sb_sheet_toggle_delete_item_visible,
          adaptItemSheetGeoMetrics
        }  from "./sb-sheet-functions.js";
import { SOCKETCONSTANTS } from "./sb-socket-constants.js";
import { socketHandler } from "./sb-socket-functions.js";
import { versionManagement } from "./sb-version-management.js";
import { getSandboxItemIconFile } from "./sb-itemsheet-helpers.js";
import { SandboxSearchForm } from "./sb-search-form.js";
import { fvtt_core_prototypes } from "./fvtt_core_prototypes.js";
import { registerHandlebarsHelpers } from "./handlebars_helpers.js";


// ALONDAAR this function creates a macro when data is dragged to the macro hotbar
async function createSandboxMacro(data, slot) {
    if (data.type != "rollable") return;
    let rollData = data.data;

    // Add quotes to the strings if they are NOT null/true/false
    rollData.attrID = await placeholderParser(rollData.attrID);
    rollData.attKey = await placeholderParser(rollData.attKey);
    rollData.citemID = await placeholderParser(rollData.citemID);
    rollData.citemKey = await placeholderParser(rollData.citemKey);
    rollData.tableKey = await placeholderParser(rollData.tableKey);

    // Do not put whitespace above the start of the macro,
    // or else (command === m.command) is always false
    const command =
        `let rollData = {
    attrID: ${rollData.attrID},
    attKey: ${rollData.attKey},
    citemID: ${rollData.citemID},
    citemKey: ${rollData.citemKey},
    ciRoll: ${rollData.ciRoll},
    isFree: ${rollData.isFree},
    tableKey: ${rollData.tableKey},
    useData: ${rollData.useData}
};

// This is the ID the macro was dragged from
// For checking Free Table ID's
let originalActorId = "${data.actorId}";

const sourcespeaker = ChatMessage.getSpeaker(); // speaker is alwasy defined in v10 macros
let sourceactor;                // actor is always defined in v10 macros
if (sourcespeaker.token){
  sourceactor = game.actors.tokens[sourcespeaker.token];
}
if (!sourceactor) {
  sourceactor = game.actors.get(sourcespeaker.actor);
}
if (sourceactor) {
    let letsContinue = true;
    // Check if actor possess the citem
    if(rollData.citemKey != null)
        if(!sourceactor.system.citems.find(ci => ci.ciKey === rollData.citemKey))
            return ui.notifications.warn("Current actor does not possess the required citem.");

    // Check if the free table item still exists
    if(rollData.isFree)
        if(!sourceactor.system.attributes[rollData.tableKey].tableitems.find(ti => ti.id === rollData.citemID))
            return ui.notifications.warn("Current actor does not possess the referenced Free Table id.");
        // Check if the selected actor is the original
        else if (sourceactor.id != originalActorId)
            await Dialog.confirm({
                title: "ARE YOU SURE ABOUT THAT?",
                content: "You are about to roll a Free Table id that isn't from the same actor you created the macro from.<br><br>This may have unintended results due to targetting a different id owned by that actor.",
                yes: () => {},
                no: () => {letsContinue = false;},
                defaultYes: true
            });

        if(letsContinue)
            sourceactor.sheet._onRollCheck(${rollData.attrID}, ${rollData.attKey}, ${rollData.citemID}, ${rollData.citemKey}, ${rollData.ciRoll}, ${rollData.isFree}, ${rollData.tableKey}, ${rollData.useData});
    } else
    ui.notifications.warn("Couldn't find actor. Select a token.");`;

    let actorName = game.actors.get(data.actorId).name;
    if (game.user.isGM)
        actorName = "GM";
    let macroName = "[" + actorName + "] " + rollData.tag;

    let macro = game.macros.contents.find(m => (m.name === macroName) && (m.command === command));
    if (!macro) {
        macro = await Macro.create({
            name: macroName,
            type: "script",
            img: rollData.img,
            command: command,
            flags: {},
            permission: game.actors.get(data.actorId).permission
        });
        ui.notifications.info('Macro created.');
    }

    await game.user.assignHotbarMacro(macro, slot);
    return false;
}

// ALONDAAR Add quotes to the strings if they are NOT null/true/false
async function placeholderParser(str) {
    if (str != null && str != true && str != false) {
        str = "\"" + str + "\"";
    }
    return str;
}


async function setupCustomCSS(){  
  if (game.modules.get("custom-css")!=null){
    try{
      console.log('Sandbox | Attempting linking with module CustomCSS');
      const customcsssrc='/modules/custom-css/SettingsForm.js';
      const mymodule = await import(customcsssrc);
      const foo = mymodule.default; // Default export
      const SettingsForm = mymodule.SettingsForm; // Named export
      game.system.customcssform=SettingsForm;
      console.log('Sandbox | Successful link with module CustomCSS');
    } 
    catch(err){
      console.warn(`Sandbox | 
Could not add link to module CustomCSS.
Shortcut in the Settings Sidebar to CustomCSS form will not be added.
Apart from that, everything else will work`);
      game.system.customcssform=null;
    }
  } else {
    game.system.customcssform=null;
  }          
}

/* -------------------------------------------- */
/*  Hooks                 */
/* -------------------------------------------- */

Hooks.once("init", async function () {
    console.log("Sandbox | Ready");
    
    
    //console.log(game.system);
    
    setupCustomCSS();
    
    // DropDown menu listeners
    DropDownMenu.eventListeners();
    ContextMenu.eventListeners()
    
    console.log(`Sandbox | Initializing System`);

    /**
     * Set an initiative formula for the system
     * @type {String}
     */

    CONFIG.debug.hooks = false;
    CONFIG.Actor.documentClass = gActor;
    CONFIG.Item.documentClass = gItem;
    CONFIG.Token.documentClass = sToken;

    auxMeth.buildSheetHML();
    registerHandlebarsHelpers();
        
    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("dnd5e", gActorSheet, { makeDefault: true });
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("dnd5e", sItemSheet, { makeDefault: true });


    sb_settings_menus();
    sb_settings_registration();
    
    
  
    fvtt_core_prototypes();

    CONFIG.Combat.initiative = {
        formula: "1d20",
        decimals: 2
    };

    // register socket handler
    game.socket.on("system.sandbox", (data) => {
      socketHandler(data);           
    });

    

    let oAPI = new SandboxAPI();
    oAPI.initialize();
    // set browser tab title
    document.title=`${game.world.title} • Foundry VTT ${game.version} • ${game.system.title} ${game.system.version}` ;
    
});

Hooks.once('ready', async () => {
    console.log("Sandbox | Ready | Start");
    game.user.setFlag('world','updateItemMapsDisabled',false);
    game.user.setFlag('world','reloadAfterTemplateRebuildDisabled',false);
    
    
    
    Hooks.on("hotbarDrop", (bar, data, slot) => createSandboxMacro(data, slot)); // ALONDAAR

    //Custom styling

    if (game.settings.get("sandbox", "customStyle") != "") {
        const link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = game.settings.get("sandbox", "customStyle");
        await document.getElementsByTagName('head')[0].appendChild(link);
    }
    const OPTION_SHEET_RESIZABLE_CONTENT = sb_item_sheet_get_game_setting("sandbox", SETTINGATTRIBUTE.OPTION_SHEET_RESIZABLE_CONTENT.ID);
    if(OPTION_SHEET_RESIZABLE_CONTENT){
      // add resize css
      const link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = 'systems/sandbox/styles/sb-resizable-content.css';
        await document.getElementsByTagName('head')[0].appendChild(link);
    }
    //Gets current sheets
    await auxMeth.getSheets();

    //GM ROLL MENU TEMPLATE
    //Sets roll menu close to hotbar THIS IS SOMETHING FOR ME STREAMS, TO REMOVE IF YOU LIKE
    if (game.user.isGM) {

        game.data.rolldc = 3;
        // in v10 body class is changed
        //let basedoc = document.getElementsByClassName("vtt game system-sandbox");
        let basedoc = document.getElementsByClassName("vtt system-sandbox");
        
        let hotbar = document.createElement("DIV");
        hotbar.className = "dcroll-bar";
        hotbar.setAttribute("id", "dcroll-bar");

        basedoc[0].appendChild(hotbar);

        let backgr = document.createElement("DIV");
        backgr.className = "dc-input";

        let header = document.createElement("DIV");
        header.className = "dc-header";
        //header.textContent = "DC";
        let incDC = document.createElement("I");
        incDC.setAttribute( "class", "sb-dc-btn sb-dc-increase fas fa-square-plus" );
        incDC.setAttribute( "data-tooltip", "Increase Difficulty Class(CTRL+CLICK to change by 10)" );        
        incDC.setAttribute( "data-tooltip-direction", "UP" );
        incDC.addEventListener("click", async (event) => {
          event.preventDefault();
          event.stopPropagation();
          let change=1;
          if (event.ctrlKey) {
            change=10
          }
          sInput.value = Number(sInput.value) + change
          await game.settings.set("sandbox", "diff", Number(sInput.value));
        });
        
        
        let decDC = document.createElement("I");
        decDC.setAttribute( "class", "sb-dc-btn sb-dc-decrease fas fa-square-minus" );
        decDC.setAttribute( "data-tooltip", "Decrease Difficulty Class(CTRL+CLICK to change by 10)" );
        decDC.setAttribute( "data-tooltip-direction", "UP" );
        decDC.addEventListener("click", async (event) => {
          event.preventDefault();
          event.stopPropagation();
          let change=1;
          if (event.ctrlKey) {
            change=10
          }
          sInput.value = Number(sInput.value) - change
          await game.settings.set("sandbox", "diff", Number(sInput.value));
        });

        let spanDC = document.createElement("SPAN");
        spanDC.innerHTML='DC';
        spanDC.setAttribute( "class", "dc-header" );

        //header.appendChild(decDC);
        header.appendChild(spanDC);
        //header.appendChild(incDC);
        

        let form = document.createElement("FORM");
        form.className = "dcinput-form";
        let sInput = document.createElement("INPUT");
        sInput.className = "dcinput-box";
        sInput.setAttribute("type", "text");
        sInput.setAttribute("name", "dc");
        sInput.setAttribute("value", "");

        let initvalue = 0;

        sInput.value = game.settings.get("sandbox", "diff");

        sInput.addEventListener("keydown", async (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (event.key == "Backspace" || event.key == "Delete") {
                sInput.value = 0;
            }else if (event.key == "Enter") {                
                await game.settings.set("sandbox", "diff", sInput.value);
            }else if (event.key == "-") {                
                sInput.value = "-";
            }else {
                if (!isNaN(event.key))
                    sInput.value += event.key;
            }
            if (!isNaN(sInput.value)) {
                sInput.value = parseInt(sInput.value);
            }
        });
        sInput.addEventListener("focusout", async (event) => {
            event.preventDefault();
            event.stopPropagation();           
            await game.settings.set("sandbox", "diff", sInput.value);
        });
        form.appendChild(decDC);
        form.appendChild(sInput);
        form.appendChild(incDC); 
                                
        backgr.appendChild(header);
        backgr.appendChild(form);

        if (game.settings.get("sandbox", "showDC")) {
          await hotbar.appendChild(backgr);
          let sDCs=game.settings.get("sandbox", "useDCList");
          let aDCs=sDCs.split(";");
          let menuItems=[];
          for (let i = 0; i < aDCs.length; i++) {
            let entry=aDCs[i].split(":");
            if(entry.length==2){
              let entryMenu=
                {
                name:'<span class="dc-input-dropdown-value">' + entry[1] + '</span>' + entry[0],
                icon:'',
                condition:true,
                callback: async(event) => {
                  //console.log(entry[0], entry[1]);
                  sInput.value = Number(entry[1]);
                  await game.settings.set("sandbox", "diff", Number(sInput.value));
                }
              };
              menuItems.push(entryMenu);  
            }
          }
          if(menuItems.length>0){
            let selectorDC = document.createElement("I");
            selectorDC.setAttribute( "id", "sb-dc-selector" )
            //selectorDC.setAttribute( "class", "sb-dc-btn fas fa-caret-down" );
            selectorDC.setAttribute( "class", "sb-dc-btn fas fa-square-caret-up" );
            
            selectorDC.setAttribute( "data-tooltip", "System defined Difficulty Classes" );
            selectorDC.setAttribute( "data-tooltip-direction", "UP" );
            spanDC.appendChild(selectorDC);
            let dropDownMenuOptions={
              downVerticalAdjustment:0,
              upVerticalAdjustment:0,
              onOpen:function(){   
                // move dc to front to get the dropdown atop of any windows
                $(".dcroll-bar").css('z-index','9999');                
              },
              onClose:function(){   
                // move dc back to normal position
                $(".dcroll-bar").css('z-index','70');                
              }
            };
            new DropDownMenu($(".dcroll-bar"), `#sb-dc-selector`, menuItems,dropDownMenuOptions);            
          }
        }


        await auxMeth.rollToMenu();
        SBOX.showshield = false;

        if (game.settings.get("sandbox", "tokenOptions")) {
            document.addEventListener("keydown", (event) => {
                if (event.key == "Control") {
                    SBOX.showshield = true;
                }

            });

            document.addEventListener("keyup", (event) => {
                SBOX.showshield = false;

            });
        }

    }

    // update custom item maps
    await auxMeth.updateItemMaps();
    if(game.user.isGM){
      await versionManagement()
    }
    console.log("Sandbox | Ready | Completed");
});



Hooks.on("renderSidebarTab", createExportButtons);

function createExportButtons(sidebar, jq) {

    if (sidebar._element[0].id != "settings")
        return;

    if (!game.user.isGM)
        return;
    //NEW SETTINGS OPTIONS
    let settingstab = jq.get(0).querySelector('#settings-game');
    // with drop down 
    // check if module Custom CSS is installed and activated
    let isCustomCSSActive=false;
    if (game.modules.get("custom-css")!=null && game.system.customcssform!=null){
      isCustomCSSActive=game.modules.get("custom-css").active;
    }
    let menuItems=[
      {
        name: "Build Actor Templates",
        icon: "<i class='fas fa-rotate fa-fw'></i>",
        tooltip:"Build(or re-builds) actor templates",
        condition:true,
        callback: async() => {
          let api=game.system.api;
          await api.BuildActorTemplates(); 
        }
      },  
      
      {
        name: "Check Consistency",
        icon: "<i class='fas fa-box-check fa-fw'></i>",
        tooltip:"Checks and repairs items/actors for missing/invalid data",
        condition:true,
        callback: async() => {
          await auxMeth.checkConsistency();
        }
      },            
      {
        name: "Custom CSS",
        tooltip:"Display module Custom CSS",
        icon: "<i class='fas fa-file-code fa-fw'></i>",
        condition:isCustomCSSActive,
        callback: html => {
          let f = new game.system.customcssform();
          f.render(true,{focus:true});
        }
      },
      {
        name: "JSON Export",
        icon: "<i class='fas fa-file-export fa-fw'></i>",
        tooltip:"Run JSON Export tool",
        condition:true,
        callback: html => {auxMeth.exportBrowser();}
      },
      {
        name: "JSON Import",
        tooltip:"Run JSON Import tool",
        icon: "<i class='fas fa-file-import fa-fw'></i>",
        condition:true,
        callback: html => {auxMeth.getImportFile();}
      },
      {
        name: "Sandbox Settings",
        tooltip:"Display Sandbox System Settings",
        icon: "<i class='fas fa-cog fa-fw'></i>",
        condition:true,
        callback: html => {console.log(html)
          let f = new SystemSettingsForm();
          f.render(true,{focus:true});
        }
      },  
      {
        name: "Sandbox Tools",
        tooltip:"Display Sandbox Tools",
        icon: "<i class='fas fa-toolbox fa-fw'></i>",
        condition:true,
        callback: html => {
          let f = new SandboxToolsForm();
          f.render(true,{focus:true});
        }
      },
      {
        name: "Bug Report",
        tooltip:"Display Bug Report Form",
        icon: "<i class='fas fa-bug fa-fw'></i>",
        condition:true,
        callback: html => {
          SBBugReport();
        }
      },  
      {
        name: "Search",
        tooltip:"Search Sandbox Items",
        icon: "<i class='fas fa-magnifying-glass fa-fw'></i>",
        condition:true,
        callback: html => {
          let f = new SandboxSearchForm();
          f.render(true,{focus:true});
        }
      }      
    ];     

    // new h2 after
    let sandboxheader=document.createElement("H2");
    sandboxheader.innerHTML = `${game.system.title}`;        
    let sandboxheader_parent = jq.get(0).querySelector('#settings > h2:nth-child(5)');
    let game_details=jq.get(0).querySelector('#game-details');    
    settingstab.parentNode.insertBefore(sandboxheader,game_details.nextSibling);    
    let sandboxquickmenu=document.createElement("UL");    
    let htmlmenubar=document.createElement("LI");
    htmlmenubar.className += " sb-menu-bar";
    for(let menuitem of menuItems ){
      if(menuitem.condition){
        let menubutton=document.createElement("A");
        menubutton.innerHTML=menuitem.icon ;
        //menubutton.setAttribute("title",menuitem.name);
        menubutton.dataset.tooltip = menuitem.name;
        menubutton.className += " sb-menu-bar-button";
        menubutton.addEventListener("click",menuitem.callback);
        htmlmenubar.appendChild(menubutton);
      }
    }    
    sandboxquickmenu.innerHTML=`<li><i id="sb-game-system-sandbox-quickmenu-icon" class="fas fa-bars" title="Show Sandbox Quick Menu"></i> Sandbox Tools</li>`;
    sandboxquickmenu.setAttribute("id", "sb-game-system-sandbox-quickmenu");        
    settingstab.parentNode.insertBefore(htmlmenubar,sandboxheader.nextSibling);    
}

Hooks.on("sandbox.updateSystemSetting", async(systemid,options) => {
  console.log('Sandbox | updateSystemSetting:' + systemid);
  if(systemid=="sandbox"){
    
    // broadcast changes
    game.socket.emit("system.sandbox", {
        op: SOCKETCONSTANTS.MSG.OPERATIONS.CLIENT_REFRESH,
        data:{
          askForReload:options.askForReload,
          requiresHardRender:options.requiresHardRender,
          requiresRender:options.requiresRender        
        }
    });
    auxMeth.clientRefresh(options);
  }
});

//COPIED FROM A MODULE. TO SHOW A SHIELD ON A TOKEN AND LINK THE ATTRIBUTE
Hooks.on("hoverToken", (token, hovered) => {
  //console.log('hoverToken');
    if (!game.settings.get("sandbox", "tokenOptions"))
        return;

    if (token.actor == null)
        return;

    if (token.actor.system.tokenshield == null)
        return;

    let shieldprop = token.actor.system.tokenshield;
    //console.log(shieldprop);

    if (token.actor.system.attributes[shieldprop] == null)
        return;

    let ca = token.actor.system.attributes[shieldprop].value;

    let template = $(`
<div class="section">
<div class="value"><i class="fas fa-shield-alt"></i>${ca}</div>
</div>
`);

    if (hovered && SBOX.showshield) {
        let canvasToken = canvas.tokens.placeables.find((tok) => tok.id === token.id);

        let dmtktooltip = $(`<div class="dmtk-tooltip"></div>`);
        dmtktooltip.css('left', (canvasToken.worldTransform.tx + ((token.width) * canvas.scene._viewPosition.scale)) + 'px');
        dmtktooltip.css('top', (canvasToken.worldTransform.ty) + 'px');
        dmtktooltip.html(template);
        $('body.game').append(dmtktooltip);
    } else {
        $('.dmtk-tooltip').remove();
    }

});

//Hooks.on("updateActor", async (actor, updateData, options, userId) => {
//  const updateDataJSON=JSON.stringify(updateData);
//  const expandedUpdateData = JSON.parse(updateDataJSON);
//  console.log('updateActor - updateData',expandedUpdateData);
//  console.log('updateActor - actor',actor);
//});

Hooks.on("preUpdateActor", async (actor, updateData, options, userId) => {
    
//    const updateDataJSON=JSON.stringify(updateData);
//    const expandedUpdateData = JSON.parse(updateDataJSON);
//    console.log('preUpdateActor - updateData',expandedUpdateData);
//    console.log('preUpdateActor - actor',actor);
    //console.log(actor);
    //console.log('preUpdateActor')
    //console.log(updateData);
    //console.log(data.data.istemplate);
    //console.log("preup");
    
    // make sure that actor has originalId(used for id/integrity checks)    
    if (actor.getFlag('sandbox','originalId') == null ) {
      console.log('Sandbox | preUpdateActor | ' + 'Updating originalId for actor ['+ actor.name +']')
      if (!hasProperty(updateData, "flags")){                     
        // update carries no flags
        setProperty(updateData, "flags", {'sandbox':{'originalId':actor.id}});
      } else {
        // update has flags        
        if (!hasProperty(updateData.flags, "sandbox")){
          // update carries no sandbox flags
          setProperty(updateData.flags,'sandbox',{'originalId':actor.id});
          
        } else {
          // update carries sandbox flags
          updateData.flags.sandbox.originalId=actor.id;
        }
      }
    }
        
    if (updateData.name) {
        if (!actor.system.istemplate) {
            if (!updateData.token)
                setProperty(updateData, "token", {});
            updateData.token.name = updateData.name;
        }
        else {
            delete updateData.name;
        }
    }
    if (updateData["system.rollmode"]) {
        if (!hasProperty(updateData, "system"))
            setProperty(updateData, "system", {});
        updateData.data.rollmode = updateData["system.rollmode"];
    }
});


Hooks.on("createActor", async (actor,options,userId) => {
  //console.log('createActor')
  //console.log(actor)
  //console.log(options)
  
  if (actor.getFlag('sandbox','originalId') == null){
    // newly created or imported by json export from older sandbox
    // set new originalId
    console.log('createActor | New actor created')
    actor.setFlag('sandbox','originalId', actor.id ); 
  } else {
    // imported or duplicated
    let importflags=actor.getFlag("sandbox", "import")
    if(importflags!=null && importflags.importedTime==0){
      console.log('createActor | Actor [' + actor.name + '] created from import')
      importflags.importedTime=Date.now()
      // update marker
      actor.setFlag('sandbox','import',importflags);
    } else {
      console.log('createActor | Actor [' + actor.name + '] created from duplicated')
      // update originalId
      actor.setFlag('sandbox','originalId', actor.id );
    }
    
  }
     
});


Hooks.on("preUpdateItem", async (item, updateData, options, userId) => {
    //console.log("Sandbox | preUpdateItem Hook | ciKey:" + item.system.ciKey );    
    //console.log(updateData);
    
    // make sure that item has originalId(used for id/integrity checks)    
    if (item.getFlag('sandbox','originalId') == null ) {
      console.log('Sandbox | preUpdateItem | ' + 'Updating originalId for item ['+ item.name +']')
      if (!hasProperty(updateData, "flags")){                     
        // update carries no flags
        setProperty(updateData, "flags", {'sandbox':{'originalId':item.id}});
      } else {
        // update has flags        
        if (!hasProperty(updateData.flags, "sandbox")){
          // update carries no sandbox flags
          setProperty(updateData.flags,'sandbox',{'originalId':item.id});
          
        } else {
          // update carries sandbox flags
          updateData.flags.sandbox.originalId=item.id;
        }
      }
    }
    
    if (item.type == "cItem" && game.user.isGM) {
        if (item.system.ciKey == "") {
            if (!hasProperty(updateData, "system"))
                setProperty(updateData, "system", {});
            updateData.system.ciKey = item.id;
        }
    }
    const OPTION_AUTOGENERATE_PROPERTY_ICON = sb_item_sheet_get_game_setting("sandbox", SETTINGATTRIBUTE.OPTION_AUTOGENERATE_PROPERTY_ICON.ID);
    if(item.type=="property" && OPTION_AUTOGENERATE_PROPERTY_ICON){
      if(updateData.hasOwnProperty('system')){
        let iconbasefilename="systems/sandbox/styles/icons/propertytypes/sb_property_";
        let iconfile;
        if(updateData.system.hasOwnProperty('datatype')){
          // property and datatype change                              
          if((updateData.system.datatype=="badge" || updateData.system.datatype=="label" || updateData.system.datatype=="checkbox" || updateData.system.datatype=="list" || updateData.system.datatype=="radio" || updateData.system.datatype=="simplenumeric" || updateData.system.datatype=="simpletext" || updateData.system.datatype=="textarea") && item.system.hasroll){
            //iconfile=iconbasefilename + 'die.svg'; 
            iconfile=iconbasefilename + updateData.system.datatype + '_rollable.svg'; 
          } else {
            iconfile=iconbasefilename + updateData.system.datatype + '.svg'; 
          }                               
          updateData.img=iconfile;
        } else if(updateData.system.hasOwnProperty('hasroll')){
          if((item.system.datatype=="badge" || item.system.datatype=="label" || item.system.datatype=="checkbox" || item.system.datatype=="list" || item.system.datatype=="radio" || item.system.datatype=="simplenumeric" || item.system.datatype=="simpletext" || item.system.datatype=="textarea") && updateData.system.hasroll){
            //iconfile=iconbasefilename + 'die.svg'; 
            iconfile=iconbasefilename + item.system.datatype + '_rollable.svg';
          } else {
            iconfile=iconbasefilename + item.system.datatype + '.svg'; 
          }                               
          updateData.img=iconfile;
        }
      }
    }
});

Hooks.on("createItem", async (item,options,userId) => {
    //console.log(item);
    if (item.getFlag('sandbox','originalId') == null){
    // newly created or imported by json export from older sandbox
    // set new originalId
    console.log('createItem | New item created')
    item.setFlag('sandbox','originalId', item.id ); 
  } else {
    // imported or duplicated
    let importflags=item.getFlag("sandbox", "import")
    if(importflags!=null && importflags.importedTime==0){
      console.log('createItem | Item [' + item.name + '] created from import')
      importflags.importedTime=Date.now()
      // update marker
      item.setFlag('sandbox','import',importflags);
    } else {
      console.log('createItem | Item [' + item.name + '] created from duplicated')
      // update originalId
      item.setFlag('sandbox','originalId', item.id );
    }
    
  }
    
    let do_update = false;
    let image = "";
    if (item.type == "cItem" && game.user.isGM) {
        //console.log(entity);

        if (item.system.ciKey == "") {
            item.system.ciKey = item.id;
            //do_update = true;
        }
        

        for (let i = 0; i < item.system.mods.length; i++) {
            const mymod = item.system.mods[i];
            if (mymod.citem != item.id) {
                mymod.citem = item.id;
                do_update = true;
            }

        }
        //BEWARE OF THIS, THIS WAS NEEDED WHEN DUPLICATING CITEMS IN THE PAST!!
        if (do_update){
          // Ramses00: commented te following
          //  await entity.update(entity, { diff: false });
        }
    }

});

Hooks.on("updateItem", async (item, updateData, options, userId) => {
  // console.log('updateitem');
  //console.log(item);
  // update custom item maps
  await auxMeth.updateItemMaps();
  // check if update was for table property filter
  try{
    // check if property
    if(item.type=='property'){
      // check if table
      if(item.system.datatype=='table'){
        if(updateData.hasOwnProperty('system')){
          // check if it was for tablefilter        
          if(updateData.system.hasOwnProperty('tableoptions')){
            if(updateData.system.tableoptions.hasOwnProperty('filter')){            
              // force rerender on all open actor sheets
              // check all open windows
              for (let app in ui.windows){
                // if actor or item sheet
                if(ui.windows[app].options.baseApplication=='ActorSheet'){
                  // render the sheet
                  ui.windows[app].render(true);
                }
              }
            }
          }
        }  
      }
    }
  } catch (err) {
    console.error('SBE   | updateItem Err:' + err.message);
  }  
    
    
    
    
});

Hooks.on("createToken", async (token, options, userId) => {

    if (game.settings.get("sandbox", "tokenOptions") && game.user.isGM) {
        let tokenData = token;
        let sameTokens = canvas.tokens.placeables.filter((tok) => tok.document.actorId === tokenData.actorId);

        if (token.actor.isToken) {
            let tokennumber = 0;
            if (sameTokens.length > 0) {
                tokennumber = sameTokens.length;
            }
            let newname = token.name + " " + tokennumber.toString();

            if (tokennumber < 2)
                newname = token.name;

            token.update({ name: newname });
            token.actor.update({name:newname});
            // update the first one
            if(tokennumber==2){
              // check if the first token has the original name
              
              if(sameTokens[0].name==token.name){
                const firstTokenName=token.name + " 1"; 
                sameTokens[0].document.update({ name: firstTokenName });
                sameTokens[0].document.actor.update({name:firstTokenName});
                // check if this token is in combat
                if(sameTokens[0].document.inCombat){
                  // search all combabtans for this token, it might be several 
                  const combatTracker = game.combats.apps[0];
                  for(const combatant of combatTracker.viewed.combatants){
                    if(combatant.tokenId==sameTokens[0].document.id){
                      // update combatant
                      combatant.update({name: firstTokenName});
                    }
                  }
                  
                }
              }
            }
        }


    }

});

Hooks.on("deleteToken", (scene, token) => {
    $('.dmtk-tooltip').remove();
});

Hooks.on('createCombatant', (combat, combatantId, options) => {
    combatantId.initiative = 1;
});

//Hooks.on("preCreateActor", (actor,data,options,userId) => {
Hooks.on("preCreateActor", (actor,data,options,userId) => {  
  //console.log('preCreateActor')
  //console.log(options)
  if (actor.token != null)
    actor.token.name = actor.name;
  
});

Hooks.on("deleteActor", (actor) => {
    //console.log(actor);
});



Hooks.on("renderGameFolderPicker",async (app, html,data) => { 
  titleToTooltip(app,html)
});


Hooks.on("renderSandboxInfoForm",async (app, html,data) => {  
  //console.log('Sandbox | renderSandboxInfoForm');
  //console.log(html)
  let appwindowinfo = sb_sheet_appwindow_id(app.id); 
  sb_sheet_display_show_to_others_in_sheet_caption(html,appwindowinfo.type, appwindowinfo);
  sb_sheet_display_show_infoform_source_in_sheet_caption(html,appwindowinfo);
  await app.scrollBarTest(html);
  
  html.find('.window-resizable-handle').mouseup(ev => {
        ev.preventDefault();
        app.scrollBarTest(html);
    });
  titleToTooltip(app,html)
});

Hooks.on("rendersItemSheet", async (app, html, data) => {
   
    //console.log("Sandbox | rendersItemSheet | " + app.document.type + ':' + app.document.name);
    //console.log(app);
    
    let appwindowinfo = sb_sheet_appwindow_id(app.id);  
    sb_sheet_display_id_in_window_caption(html,'Item', appwindowinfo);
    sb_sheet_display_show_to_others_in_sheet_caption(html,'Item', appwindowinfo,true,'sb-info-form-show-all');
    sb_sheet_item_delete_protection_add_caption_icon(html);
    
    app.customCallOverride(html,app.object);
    sb_sheet_toggle_delete_item_visible(html); 
    if (app.object.type == "cItem") {
        await app.refreshCIAttributes(html);
    }
    if (app.object.type == "property") {
        app.listMacros(html);
    }
    // if not already loaded
    if(app._priorState<=0){
      adaptItemSheetGeoMetrics(app,html);
    }
//    await app.scrollBarTest(html);
//    app._setScrollStates();
//    
//    
//    
//    html.find('.window-resizable-handle').mouseup(ev => {
//        ev.preventDefault();
//        app.scrollBarTest(html);
//    });
    

    
    
    titleToTooltip(app,html)
});

function titleToTooltip(_app, [...html],useFoundryStandard=false) {
  if (true){
  (Array.isArray(html) ? html : [html])
  .forEach(root => {
    if (root instanceof HTMLElement) {
      root.querySelectorAll("[title]")
      .forEach(element => {        
        replaceTitleWithToolTip(element,useFoundryStandard)
      });
      }
    });
  }
}

function replaceTitleWithToolTip(element,useFoundryStandard=false){
  let title = element.title;  
  title=title.replaceAll('\n','<br>')
  if(title!=null && title!=''){
    if(useFoundryStandard){
      element.dataset.tooltip = title;
    } else {
      element.addEventListener("mouseover", async event => showsbToolTip(element, title, event));
      element.addEventListener("mouseout", event => game.tooltip.deactivate());        
    }
    element.removeAttribute("title");
  }
}

function showsbToolTip(element,title,event){
  //const tooltipData = prepareTooltipData(combatant);  // A function I presume you have
  //const content = await renderTemplate("your/tooltip/template.hbs", tooltipData);   
  game.tooltip.activate(element, {text: title ,cssClass: "sb-tooltip"});
  //game.tooltip.activate(element, { text: element.title, direction: TooltipManager.TOOLTIP_DIRECTIONS.LEFT, cssClass: 'sb-tooltip' });
}


async function hideChatMsgSecrets(chatmsgid,hide){  
  let chatmsg=await game.messages.get(chatmsgid)
  if(chatmsg!=null){
    //console.log(chatmsg)
    // get the content and find the secrets
    let parser = new DOMParser();
    let html = await parser.parseFromString(chatmsg.content, 'text/html');
    let msgupdated=false;
    if(html!=null){
      //console.log(html)
      let secrets=html.querySelectorAll('.secret')
      if(secrets!=null){
        if(secrets.length>0){
          //console.log(secrets)
          for (let i = 0; i < secrets.length; i++) {
            if(hide){
              // remove revealed
              if(secrets[i].classList.contains("revealed")){
                secrets[i].classList.remove('revealed')
                msgupdated=true;
              }
            } else {
              // add revealed  
              if(!secrets[i].classList.contains("revealed")){
                secrets[i].classList.add('revealed')
                msgupdated=true;
              }              
            }
          }           
        }
      }      
    }
    if(msgupdated){
      await chatmsg.update({        
        content: html.documentElement.innerHTML    
      });
    }
  }
}

Hooks.on("renderSystemSettingsForm", async (app, html, data) => {
  titleToTooltip(app,html)
});

Hooks.on("renderSandboxExpressionEditorForm", async (app, html, data) => {
  titleToTooltip(app,html,true)
});

Hooks.on("renderSandboxTableFilterEditorForm", async (app, html, data) => {
  titleToTooltip(app,html,true)
});

Hooks.on("renderSandboxJSONImportForm", async (app, html, data) => {
  titleToTooltip(app,html,true)
});

Hooks.on("renderSandboxToolsForm", async (app, html, data) => {
  titleToTooltip(app,html,true)
});

Hooks.on("rendergActorSheet", async (app, html, data) => {
    //console.log("Sandbox | rendergActorSheet");
    //console.log(app);
    //console.log(data);
    let appwindowinfo = sb_sheet_appwindow_id(app.id);  
    sb_sheet_display_id_in_window_caption(html,'Actor', appwindowinfo);
    sb_sheet_display_show_to_others_in_sheet_caption(html,'Actor', appwindowinfo,true,'sb-info-form-show-all');
    sb_sheet_item_delete_protection_add_caption_icon(html);
    const actor = app.actor;

    if (actor.token == null)
        actor.listSheets();
    //if(!actor.data.data.istemplate && !actor.data.flags.ischeckingauto){
    if (!actor.system.istemplate) {
        await app.refreshCItems(html);
        app.handleGMinputs(html);
        app.refreshBadge(html);
        await app.populateRadioInputs(html);
        app.modifyLists(html);
        app.setImages(html);
        app.setCheckboxImages(html);
        app.addHeaderButtons(html);
        app.customCallOverride(html);
        sb_sheet_toggle_delete_item_visible(html);
        
        await app.setSheetStyle(actor,'rendergActorSheet');
        //app.scrollBarLoad(html);

        actor.setInputColor();

//        html.find('.window-resizable-handle').mouseup(ev => {
//          console.log('window-resizable-handle | mouseup');
//            ev.preventDefault();
//            app.setSheetStyle(actor,'mouseup');
//        });
    }

    app.displaceTabs2(null, html);
    await app._setScrollStates();
    
    
    let sheetbody;
    // for some updates the return html is a form
    //debugger;
    if (html[0].nodeName == 'FORM') {
      //sheetelementid = html[0].parentElement.parentElement.id;
      sheetbody=html.find('.sheet-body');
    } else {
      //sheetelementid = html[0].id;
      sheetbody=html.find('.sheet-body');
    }
    // add a ResizeObserver to trigger the resize of conntent
    app.resizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
            //console.log('width', entry.contentRect.width);
            //console.log('height', entry.contentRect.height);
            //
            app.upDateTabBodiesHeight();
                                                        
      });
    });
    
    
    if(sheetbody!=null){
      if(sheetbody.length>0){
        app.resizeObserver.observe(sheetbody[0]);                
      }
    }
    titleToTooltip(app,html);
});

Hooks.on("closegActorSheet", async (app, html) => {
    
    //console.log(entity);
    //console.log(eventData);
    // console.log("closing sheet");
    let character = app.object;
    if (character.flags.ischeckingauto)
        character.flags.ischeckingauto = false;
    
    app.resizeObserver.disconnect();
    
    
    
});

Hooks.on("renderChatMessage", async (app, html, data) => {
//        console.log(app);
//        console.log(data);
//        console.log(html);
    let speakerimg="icons/svg/mystery-man.svg";
    let speakeractor=null;;
    if(typeof data.message.speaker.actor==='string' ){        
      speakeractor=game.actors.get(data.message.speaker.actor);
      if(speakeractor!=null){
        speakerimg=speakeractor.img;
      }
    } else {
      // use user image
      speakerimg = game.users.get(data.message.user).avatar
    }
    let hide = false;
    let messageId = app.id;
    let msg = game.messages.get(messageId);

    let msgIndex = game.messages.contents.indexOf(msg);

    let _html = await html[0].outerHTML;
    let realuser = game.users.get(data.message.user);
    let alias = data.alias;
    //
    //    if(((data.cssClass == "whisper")||(data.message.type==1)) && game.user.id!=data.message.user && !game.user.isgM)
    //        hide=true;

    //console.log(hide);
    if (_html.includes("dice-roll") && !_html.includes("table-draw")) {  
        let flavor = app.flavor;
        if (flavor.length==0){
          flavor="Free Roll"
        }
        let rollData = {
            token: {
                img: speakerimg,
                name: "Free Roll"
            },
            actor: alias,
            flavor: flavor,
            formula: app.rolls[0].formula,
            mod: 0,
            result: app.rolls[0].total,
            dice: app.rolls[0].dice,
            user: realuser.name,
            showresult: true
        };
        await renderTemplate("systems/sandbox/templates/dice.html", rollData).then(async newhtml => {
            let container = html[0];
            let content = html.find('.dice-roll');
            content.replaceWith(newhtml);
            _html = await html[0].outerHTML;
//          // check if the last message, then             
//            if (game.user.isGM) {
//              await auxMeth.rollToMenu(newhtml);
//            }
        });
        // scroll to the bottom
        const chatlog=document.querySelector("#chat-log");
        if(chatlog!=null){
          chatlog.scrollTop = chatlog.scrollHeight;
        }
        
    }
    //console.log(html);
    if (!_html.includes("roll-template")) {
        //console.log(_html);
        if (_html.includes("table-draw")) {
            let mytableID = data.message.flags.core.RollTable;
            let mytable = game.tables.get(mytableID);
            let tableresult = mytable.getResultsForRoll(app.rolls[0].total)[0].text;
            html.find('.dice-roll');
            if (mytable.permission.default == 0)
                hide = true;
        }

        let msgData = {
            message: data.message.content,
            user: alias,
            isWhisper: data.isWhisper,
            whisperTo: data.whisperTo,
            token: {
                img: speakerimg,
                name: "Free Roll"
            },
        };
        await renderTemplate("systems/sandbox/templates/sbmessage.html", msgData).then(async newhtml => {
            while (html.firstChild) {
                html.removeChild(html.lastChild);
            }
            html[0].innerHTML = newhtml;
        });
        // scroll to the bottom
        const chatlog=document.querySelector("#chat-log");
        if(chatlog!=null){
          chatlog.scrollTop = chatlog.scrollHeight;
        }
    }

    let deletebutton = $(html).find(".roll-message-delete")[0];
    //console.log(deletebutton);
    if (deletebutton != null) {
        if (game.user.isGM) {
            $(html).find(".roll-message-delete").click(async ev => {
                msg.delete(html);
            });
            
              auxMeth.rollToMenu();
            
        }

        else {
            deletebutton.style.display = "none";
        }
    }
    //console.log(html);
    let iamWhispered = data.message.whisper.find(y => y == game.user.id);
    if (iamWhispered == null && data.message.whisper.length>0) {
        hide = true;
    }

    if (!game.user.isGM && hide && (game.user.id != data.author.id )) {
        //console.log(html);
        //console.log(_html);
        html.hide();
    }

    //ROLL INSTRUCTIONS
    let header = $(html).find(".message-header");
    header.remove();
    //console.log("tirando");
    let detail = await $(html).find(".roll-detail")[0];
    let result = $(html).find(".roll-result")[0];
    let clickdetail = $(html).find(".roll-detail-button")[0];
    let clickmain = $(html).find(".roll-main-button")[0];
    let citemlink = $(html).find(".roll-citemlink")[0];
    
    //  Hide/show secrets,        
    //console.log('chat message | check for secrets')
    let secrets=$(html).find(".secret");
    if(secrets!=null){            
      if(secrets.length>0){
        //console.log('chat message | found secrets')         
        let rollheader= $(html).find(".roll-header")[0];
        let deletebutton = $(html).find(".roll-delete-button")[0];
        // only check the first secrete, all secrets in a msg is hidden/revealed att the same time  
        if(secrets[0].classList.contains('revealed')){
          // revealed
          if(game.user.isGM){ 
            // add hide button  
            let iconspan =document.createElement("span");
            iconspan.className="roll-secrets-visibility";
                    
            let iconbutton = document.createElement("i");
            iconbutton.className='secrethandlebtn fas fa-eye-slash';
            iconbutton.setAttribute("title",game.i18n.localize("SANDBOX.ChatMessageSecretHide"))
            iconspan.appendChild(iconbutton);
            // add eventlister
            iconbutton.addEventListener("click", async event => hideChatMsgSecrets(app.id,true));
            
            rollheader.insertBefore(iconspan,deletebutton);
          } else{
            // non-gm
            // do nothing
          }
        } else {
          // secret
          if(game.user.isGM){             
            // add reveal icon button
            let iconspan =document.createElement("span");
            iconspan.className="roll-secrets-visibility";
            let iconbutton = document.createElement("i");
            iconbutton.className='secrethandlebtn fas fa-eye';
            iconbutton.setAttribute("title",game.i18n.localize("SANDBOX.ChatMessageSecretReveal"))  
            iconspan.appendChild(iconbutton);
            // add eventlister
            iconbutton.addEventListener("click", async event => hideChatMsgSecrets(app.id,false)); 
            rollheader.insertBefore(iconspan,deletebutton);
          } else
          {
            // non-gm
            // remove the elements
            for (let i = 0; i < secrets.length; i++) {
              secrets[i].remove();
            }
          }                        
        }
        
      }
    }            
    
 
    if (detail == null) {

        return;

    }

    if (result == null) {
        return;
    }

    if (clickdetail == null) {
        return;
    }

    if (clickmain == null) {

        return;
    }

    if (!game.user.isGM && data.message.blind) {
        detail.style.display = "none";
        result.style.display = "none";
        clickdetail.style.display = "none";
        clickmain.style.display = "none";
    }

    let detaildisplay = detail.style.display;
    detail.style.display = "none";

    let resultdisplay = result.style.display;


    let clickdetaildisplay = clickdetail.style.display;

    let clickmaindisplay = clickmain.style.display;
    clickmain.style.display = "none";


    $(html).find(".roll-detail-button").click(ev => {
        detail.style.display = detaildisplay;
        result.style.display = "none";
        $(html).find(".roll-detail-button").hide();
        $(html).find(".roll-main-button").show();
    });

    $(html).find(".roll-main-button").click(ev => {
        result.style.display = resultdisplay;
        detail.style.display = "none";
        $(html).find(".roll-detail-button").show();
        $(html).find(".roll-main-button").hide();
    });

    if (citemlink) {
        $(html).find(".roll-citemlink").click(ev => {
            let mylinkId = ev.target.getAttribute("id");

            if (mylinkId) {                                
                let showCitemInfoOnly=false;
                if (game.user.isGM){
                  const OPTION_USE_CITEM_INFO_FORM_FOR_GMS = sb_item_sheet_get_game_setting("sandbox", SETTINGATTRIBUTE.OPTION_USE_CITEM_INFO_FORM_FOR_GMS.ID);
                  if (OPTION_USE_CITEM_INFO_FORM_FOR_GMS){
                    showCitemInfoOnly=true;
                  }
                } else {
                  const OPTION_USE_CITEM_INFO_FORM_FOR_PLAYERS = sb_item_sheet_get_game_setting("sandbox", SETTINGATTRIBUTE.OPTION_USE_CITEM_INFO_FORM_FOR_PLAYERS.ID);
                  if(OPTION_USE_CITEM_INFO_FORM_FOR_PLAYERS){
                    showCitemInfoOnly=true;
                  }
                }
                const item = game.items.get(mylinkId);
                if(showCitemInfoOnly){
                  auxMeth.showCIitemInfo(item);
                } else {
                  item.sheet.render(true);
                }
            }

        });
    }
   titleToTooltip(app,html);
});




Hooks.on("renderDialog", async (app, html, data) => {
  const htmlDom = html[0];
  if (app.data.citemdialog) {
    const OPTION_USE_CITEM_INFO_FORM_FOR_PLAYERS = sb_item_sheet_get_game_setting("sandbox", SETTINGATTRIBUTE.OPTION_USE_CITEM_INFO_FORM_FOR_PLAYERS.ID);
    const OPTION_USE_CITEM_INFO_FORM_FOR_GMS = sb_item_sheet_get_game_setting("sandbox", SETTINGATTRIBUTE.OPTION_USE_CITEM_INFO_FORM_FOR_GMS.ID);
    let showCitemInfoOnly = false;
    if (game.user.isGM) {
      if (OPTION_USE_CITEM_INFO_FORM_FOR_GMS) {
        showCitemInfoOnly = true;
      }
    } else {
      if (OPTION_USE_CITEM_INFO_FORM_FOR_PLAYERS) {
        showCitemInfoOnly = true;
      }
    }
    let checkbtns = htmlDom.getElementsByClassName("dialog-check");
    let dialogDiv = htmlDom.getElementsByClassName("item-dialog");
    let button = htmlDom.getElementsByClassName("dialog-button")[0];
    let links = htmlDom.getElementsByClassName("linkable");

    let actorId = dialogDiv[0].getAttribute("actorId");
    let selectnum = dialogDiv[0].getAttribute("selectnum");
    const actor = game.actors.get(actorId);
    setProperty(actor.flags, "selection", []);
    button.disabled = true;

    for (let i = 0; i < checkbtns.length; i++) {
      let check = checkbtns[i];
      check.addEventListener("change", (event) => {
        let itemId = event.target.getAttribute("itemId");
        if (event.target.checked) {
          actor.flags.selection.push(itemId);
        } else {
          actor.flags.selection.splice(actor.flags.selection.indexOf(itemId), 1);
        }
        let selected = actor.flags.selection.length;
        if (selected != selectnum) {
          button.disabled = true;
        } else {
          button.disabled = false;
        }
      });
    }
    for (let j = 0; j < links.length; j++) {
      links[j].addEventListener("click", async (event) => {
        let itemId = event.target.getAttribute("itemId");
        let ciKey = event.target.getAttribute("ciKey");
        let citem = await auxMeth.getcItem(itemId, ciKey);
        if (!showCitemInfoOnly) {
          citem.sheet.render(true);
        } else {
          auxMeth.showCIitemInfo(citem);
        }
      });
    }

  }

  if (app.data.citemText) {
    htmlDom.addEventListener("keydown", function (event) {
      event.stopPropagation();
    }, true);

    let t_area = htmlDom.getElementsByClassName("texteditor-large");
    //console.log(t_area);
    t_area[0].disabled = true;
    t_area[0].addEventListener("change", (event) => {
      app.data.dialogValue = event.target.value;

    });

    let lock_content = htmlDom.getElementsByClassName("lockcontent");
    let lock_button = htmlDom.getElementsByClassName("lock");
    let lock_open = htmlDom.getElementsByClassName("lockopen");

    let button = htmlDom.getElementsByClassName("dialog-button")[0];
    button.disabled = true;

    lock_open[0].style.display = "none";
    lock_button[0].addEventListener("click", function (event) {
      event.stopPropagation();
      //console.log("locking");
      lock_open[0].style.display = "block";
      lock_button[0].style.display = "none";
      t_area[0].disabled = false;
      button.disabled = true;
    }, true);

    lock_open[0].addEventListener("click", function (event) {
      event.stopPropagation();
      //console.log("unlocking");
      lock_button[0].style.display = "block";
      lock_open[0].style.display = "none";
      button.disabled = false;
      t_area[0].disabled = true;
    }, true);
  }

  if (app.data.exportDialog) {
    let checkbtns = htmlDom.getElementsByClassName("checkbox");
    for (let i = 0; i < checkbtns.length; i++) {
      let check = checkbtns[i];
      check.addEventListener("change", (event) => {
        let checkgroup = event.target.getAttribute("folderid");
        var newevent = new Event('change');
        if (checkgroup != null) {
          for (let j = 0; j < checkbtns.length; j++) {
            let othercheck = checkbtns[j];
            if (othercheck.getAttribute("parentid") == checkgroup && othercheck != check) {
              if (event.target.checked) {
                if (!othercheck.checked) {
                  othercheck.checked = true;
                  othercheck.dispatchEvent(newevent);
                }
              } else {
                if (othercheck.checked) {
                  othercheck.checked = false;
                  othercheck.dispatchEvent(newevent);
                }
              }
            }
          }
        }
      });
    }
  }

  if (app.data.rollDialog) {
    let checkbtns = htmlDom.getElementsByClassName("checkbox");
    for (let i = 0; i < checkbtns.length; i++) {
      let check = checkbtns[i];
      check.addEventListener("change", (event) => {
        let checkgroup = event.target.getAttribute("checkGroup");
        if (event.target.checked && checkgroup != "") {
          for (let j = 0; j < checkbtns.length; j++) {
            let othercheck = checkbtns[j];
            if (othercheck.getAttribute("checkGroup") == checkgroup && othercheck != check)
              othercheck.checked = false;
          }
        }
      });
    }

    let allfields = htmlDom.getElementsByClassName("rdialogInput");
    let dialogProps = {};

    for (let k = 0; k < allfields.length; k++) {
      let myKey = allfields[k].getAttribute("attKey");
      setProperty(dialogProps, myKey, {});
//            if (allfields[k].type == "checkbox") {
//
//                dialogProps[myKey].value = allfields[k].checked;
//            }
//            else {
      dialogProps[myKey].value = allfields[k].value;
      if (allfields[k].classList.contains("hasarrows")) {
        let sInputArrows = document.createElement("SPAN");
        let arrContainer = document.createElement("A");
        arrContainer.className = "arrcontainer";
        arrContainer.style.display = "inline-block";
        arrContainer.setAttribute("attKey", allfields[k].getAttribute("attKey"));
        let arrUp = document.createElement("I");
        arrUp.className = "arrup";
        let arrDown = document.createElement("I");
        arrDown.className = "arrdown";

        arrContainer.appendChild(arrUp);
        arrContainer.appendChild(arrDown);
        sInputArrows.appendChild(arrContainer);
        allfields[k].parentElement.insertBefore(sInputArrows, allfields[k].nextSibling);

        arrUp.addEventListener("click", async (event) => {
          event.preventDefault();
          let attKey = event.target.parentElement.getAttribute("attkey");
          let currentValue = event.target.parentElement.parentElement.previousElementSibling.value;
          dialogProps[attKey].value = parseInt(currentValue) + 1;
          allfields[k].value = dialogProps[attKey].value;
          var newevent = new Event('change');
          allfields[k].dispatchEvent(newevent);
        });

        arrDown.addEventListener("click", async (event) => {
          event.preventDefault();
          let attKey = event.target.parentElement.getAttribute("attkey");
          let currentValue = event.target.parentElement.parentElement.previousElementSibling.value;
          dialogProps[attKey].value = parseInt(currentValue) - 1;
          allfields[k].value = dialogProps[attKey].value;
          var newevent = new Event('change');
          allfields[k].dispatchEvent(newevent);
        });
      }

      if (allfields[k].classList.contains("defvalue") || allfields[k].classList.contains("isauto")) {
        let deffield = allfields[k];
        let propDef = game.items.find(y => y.system.attKey == myKey);
        let defexpr;
        if (allfields[k].classList.contains("isauto")) {
          defexpr = propDef.system.auto;
        } else {
          defexpr = propDef.system.defvalue;
        }
        if (!propDef.system.editable && !game.user.isGM) {
          deffield.disabled = true;
        }

        let finalvalue = defexpr;

        if (isNaN(defexpr)) {
          defexpr = await auxMeth.parseDialogProps(defexpr, dialogProps);
          //static async autoParser(expr, attributes, itemattributes, exprmode, noreg = false, number = 1, uses = 0, maxuses = 1) 
          finalvalue = await auxMeth.autoParser(defexpr, app.data.actorattributes, app.data.citemattributes, false, null, app.data.number, app.data.uses, app.data.maxuses);
          finalvalue = await game.system.api._extractAPIFunctions(finalvalue, app.data.actorattributes, app.data.citemattributes, false, null, app.data.number, app.data.uses, app.data.maxuses);
        }

        if (propDef.system.datatype == "checkbox") {
          let checkfinal = false;
          if (finalvalue === "true") {
            checkfinal = true;
          } else {
            checkfinal = false;
          }

          deffield.checked = checkfinal;
        } else {
          deffield.value = finalvalue;
        }

      }
      //}

    }

    let autofields = htmlDom.getElementsByClassName("isauto");

    for (let n = 0; n < autofields.length; n++) {
      let autofield = autofields[n];
      autofield.disabled = true;
    }

    for (let j = 0; j < allfields.length; j++) {
      let thisinput = allfields[j];
      //if (!thisinput.classList.contains("isauto")) {
      thisinput.addEventListener("change", async (event) => {
        for (let k = 0; k < autofields.length; k++) {
          let changedvalue = event.target.value;
          let changekey = event.target.getAttribute("attKey");
          let changeProp = game.items.find(y => y.system.attKey == changekey);
          if (changeProp == null)
            return;
          if (changeProp.system.datatype == "checkbox")
            changedvalue = event.target.checked;
          dialogProps[changekey].value = changedvalue;
          let autofield = autofields[k];
          let propKey = autofield.getAttribute("attKey");
          let propObj = await game.items.find(y => y.system.attKey == propKey);
          let autoexpr = propObj.system.auto;
          autoexpr = await auxMeth.parseDialogProps(autoexpr, dialogProps);          
          let finalvalue = await auxMeth.autoParser(autoexpr, app.data.attributes, app.data.citemattributes, false, null, app.data.number, app.data.uses, app.data.maxuses);
          finalvalue = await game.system.api._extractAPIFunctions(finalvalue, app.data.actorattributes, app.data.citemattributes, false, null, app.data.number, app.data.uses, app.data.maxuses);
          //console.log(finalvalue);
          autofield.value = finalvalue;
          dialogProps[propKey].value = finalvalue;
        }
        // get new roll name for dialogTitle
        let dialogTitle=app.data.rollname;
        dialogTitle = await auxMeth.parseDialogProps(dialogTitle, dialogProps);  
        dialogTitle = await auxMeth.basicParser(dialogTitle,app.data.actor);
        dialogTitle = await auxMeth.autoParser(dialogTitle, app.data.actor.system.attributes, app.data.citemattributes, false, null, app.data.number, app.data.uses, app.data.maxuses);
        dialogTitle = await game.system.api._extractAPIFunctions(dialogTitle, app.data.actorattributes, app.data.citemattributes, false, null, app.data.number, app.data.uses, app.data.maxuses);
        console.log(dialogTitle);
        // update title
        let titleElement = htmlDom.getElementsByClassName("window-title");
        titleElement[0].innerText=dialogTitle;
      });
    }
  }

  titleToTooltip(app, html);

});


