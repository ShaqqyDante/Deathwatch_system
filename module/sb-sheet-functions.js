import  { 
          SETTINGATTRIBUTE,
          sb_item_sheet_get_game_setting
        } from "./sb-setting-constants.js";
import  { 
          ITEM_SHEET_HEIGHT,
          ITEM_SHEET_PROPERTY_HEIGHT,
          ITEM_SHEET_DEFAULT_WIDTH,
          ITEM_SHEET_TABS
        } from "./sb-itemsheet-constants.js";
import { SOCKETCONSTANTS } from "./sb-socket-constants.js";
import { showPlayer } from "./sb-socket-functions.js";
import { SandboxActorPropertiesManagerForm } from "./sb-actor-properties-manager-form.js";




export function sb_sheet_appwindow_id(id){
  // FOR V10
  // item             :sItemSheet-Item-8Wdrh3wOYzx5S5rE
  // compendium item  :sItemSheet-Compendium-world-equipment-GdgvW214tin4odiA
  // actor            :gActorSheet-Actor-8I8j7C8KRYY6zQSK
  // token actor      :gActorSheet-Scene-DmeAh0YMgGpmMQMy-Token-hLsCtoj51KDZQH5Z
  // compendium actor :gActorSheet-Compendium-world-npcs-0ChCP1wIY8gmkJc3  
  // infoform item    :SandboxInfoForm-Item-a4cTIwVWm7QtnztR
  // infoform actor   :SandboxInfoForm-Actor-7HRHBFQJC9zeLrIE  
  // infoform compendium actor   :SandboxInfoForm-Compendium-world-npcs-Actor-0ChCP1wIY8gmkJc3
  // infoform compendium item    :SandboxInfoForm-Compendium-world-equipment-Item-7CZ8chj1hcsdhsR3
  //
  // FOR V11
  // item                : sItemSheet-Item-P7FIaPdJUfxOGIFK
  // compendium item     : sItemSheet-Compendium-world-equipment-Item-7CZ8chj1hcsdhsR3
  // actor               : gActorSheet-Actor-7HRHBFQJC9zeLrIE
  // token actor         : gActorSheet-Scene-DmeAh0YMgGpmMQMy-Token-Rdm8s0n3XscsCVHC-Actor-WMyf8KSkCZcRpCoV
  // compendium actor    : gActorSheet-Compendium-world-npcs-Actor-0ChCP1wIY8gmkJc3
  // compendium item     : sItemSheet-Compendium-world-equipment-Item-zn6GGnulevCr0m5m
  // infoform actor      : SandboxInfoForm-Actor-7HRHBFQJC9zeLrIE
  // infoform item       : SandboxInfoForm-Item-a4cTIwVWm7QtnztR
  // infoform compendium actor   :SandboxInfoForm-Compendium-world-npcs-Actor-0ChCP1wIY8gmkJc3
  // infoform compendium item    :SandboxInfoForm-Compendium-world-equipment-Item-7CZ8chj1hcsdhsR3
  let appwindowinfo={
    type:null,
    id:null,
    scene:null,
    compendium:{type:null,name:null}
  };
  let substrings=id.split("-");
  let sheettype=substrings[0];
  if (isNewerVersion(game.version,11)){
    // for v11
    switch(sheettype){
      case 'sItemSheet':
        appwindowinfo.type='Item';
        switch(substrings[1]){
          case 'Item':
            appwindowinfo.id=substrings[2];
            break;
          case 'Compendium':
            appwindowinfo.id=substrings[5];
            appwindowinfo.compendium.type=substrings[2];
            appwindowinfo.compendium.name=substrings[3];
            break;
          default:          
        }
        break;
      case 'gActorSheet':
        switch(substrings[1]){
          case 'Actor':
            appwindowinfo.type='Actor';
            appwindowinfo.id=substrings[2];
            break;
          case 'Scene':
            appwindowinfo.type='Token';
            appwindowinfo.id=substrings[4];
            appwindowinfo.scene=substrings[2];
            break;
          case 'Compendium':
            appwindowinfo.type='Actor';
            appwindowinfo.id=substrings[5];
            appwindowinfo.compendium.type=substrings[2];
            appwindowinfo.compendium.name=substrings[3];
            break;
          default:          
        }
        break;
      case 'SandboxInfoForm':
        switch(substrings[1]){
          case 'Item':
            appwindowinfo.type='Item';
            appwindowinfo.id=substrings[2];
            break;
          case 'Actor':
            appwindowinfo.type='Actor';
            appwindowinfo.id=substrings[2];            
            break;
          case 'Compendium':
            appwindowinfo.type=substrings[4];
            appwindowinfo.id=substrings[5];
            appwindowinfo.compendium.type=substrings[2];
            appwindowinfo.compendium.name=substrings[3];
            break;
          default:          
        }
        break;
      default:      
    } 
  } else{
    // for v10
    switch(sheettype){
      case 'sItemSheet':
        appwindowinfo.type='Item';
        switch(substrings[1]){
          case 'Item':
            appwindowinfo.id=substrings[2];
            break;
          case 'Compendium':
            appwindowinfo.id=substrings[4];
            appwindowinfo.compendium.type=substrings[2];
            appwindowinfo.compendium.name=substrings[3];
            break;
          default:          
        }
        break;
      case 'gActorSheet':
        switch(substrings[1]){
          case 'Actor':
            appwindowinfo.type='Actor';
            appwindowinfo.id=substrings[2];
            break;
          case 'Scene':
            appwindowinfo.type='Token';
            appwindowinfo.id=substrings[4];
            appwindowinfo.scene=substrings[2];
            break;
          case 'Compendium':
            appwindowinfo.type='Actor';
            appwindowinfo.id=substrings[4];
            appwindowinfo.compendium.type=substrings[2];
            appwindowinfo.compendium.name=substrings[3];
            break;
          default:          
        }
        break;
      case 'SandboxInfoForm':
        switch(substrings[1]){
          case 'Item':
            appwindowinfo.type='Item';
            appwindowinfo.id=substrings[2];
            break;
          case 'Actor':
            appwindowinfo.type='Actor';
            appwindowinfo.id=substrings[2];            
            break;
          case 'Compendium':
            appwindowinfo.type=substrings[4];
            appwindowinfo.id=substrings[5];
            appwindowinfo.compendium.type=substrings[2];
            appwindowinfo.compendium.name=substrings[3];
            break;
          default:          
        }
        break;
      default:      
    }    
  }  
  return appwindowinfo;  
}



export function sb_sheet_item_delete_protection_add_caption_icon(html) {
  const OPTION_ACTIVATE_ITEM_DELETE_PROTECTION = sb_item_sheet_get_game_setting("sandbox", SETTINGATTRIBUTE.OPTION_ACTIVATE_ITEM_DELETE_PROTECTION.ID);
  if (OPTION_ACTIVATE_ITEM_DELETE_PROTECTION) {    
    let sheetelementid = html[0].id;
    // get window title
    let insertafterthis = html.find('.window-title');
    if (insertafterthis) {
      // create toggle button
      //let sToggle = '<input type="checkbox" id="' + sheetelementid + '-sbe-sheet-toggle-delete-item-visible" class="sbe-sheet-toggle-delete-item-visible-checkbox" title="'+game.i18n.localize('sandbox-extensions.sbe-sheet-toggle-delete-item-visible-label-tooltip')+'"><a style="margin-left:0px;"><label for="' + sheetelementid + '-sbe-sheet-toggle-delete-item-visible" class="sbe-sheet-toggle-delete-item-visible-label" title="'+game.i18n.localize('sandbox-extensions.sbe-sheet-toggle-delete-item-visible-label-tooltip')+'">'+game.i18n.localize('sandbox-extensions.sbe-sheet-toggle-delete-item-visible-label-caption')+'</label></a>';
      let sToggle = '<input type="checkbox" id="' + sheetelementid + '-sb-sheet-toggle-delete-item-visible" class="sb-sheet-toggle-delete-item-visible-checkbox" title="'+game.i18n.localize("SANDBOX.SheetToggleDeleteItemVisibleLabelTooltip")+'"><label for="' + sheetelementid + '-sb-sheet-toggle-delete-item-visible" class="sb-sheet-toggle-delete-item-visible-label"  title="'+game.i18n.localize("SANDBOX.SheetToggleDeleteItemVisibleLabelTooltip")+'">'+game.i18n.localize("SANDBOX.SheetToggleDeleteItemVisibleLabelCaption")+'</label>';
      // insert button
      insertafterthis.after(sToggle);              
      // add event listener for user to toggle
      html.find('#' + sheetelementid + '-sb-sheet-toggle-delete-item-visible').click(ev => {
        sb_sheet_toggle_delete_item_visible(html);
      });      
    }
  }
}

export function sb_sheet_toggle_delete_item_visible(html) {
  const OPTION_ACTIVATE_ITEM_DELETE_PROTECTION = sb_item_sheet_get_game_setting("sandbox", SETTINGATTRIBUTE.OPTION_ACTIVATE_ITEM_DELETE_PROTECTION.ID);
  if (OPTION_ACTIVATE_ITEM_DELETE_PROTECTION) {  
    try {
      // get document from the element(used for popout combability)     
      let doc = html[0].ownerDocument;
      let sheetelementid;
      // for some updates the return html is a form
      if (html[0].nodeName == 'FORM') {
        sheetelementid = html[0].parentElement.parentElement.id;
      } else {
        sheetelementid = html[0].id;
      }
      let sheet = doc.getElementById(sheetelementid);
      if (sheet !== null) {
        //let deletes = sheet.getElementsByClassName(delete_btn_class);
        let deletes = sheet.querySelectorAll('.ci-delete, .item-delete,.citem-delete,.mod-delete,.modcitem-delete.mod-citem');
        // get current state of hiding
        let chkelement = doc.getElementById(sheetelementid + '-sb-sheet-toggle-delete-item-visible');
        let chkvalue = false;
        if (chkelement !== null) {
          chkvalue = chkelement.checked;
        }
        for (let i = 0; i < deletes.length; i++) {
          if (deletes[i].nodeName == 'A') {
            let style = getComputedStyle(deletes[i]);

            if (chkvalue) {
              deletes[i].style.display = 'inline';
            } else {
              deletes[i].style.display = 'none';
            }
          }
        }
        // free tables hide/show add cell/row
        let plusrows= sheet.querySelectorAll('.sb-table-plus-row');
        for (let i = 0; i < plusrows.length; i++) {
          if (chkvalue) {
            plusrows[i].style.display = 'table-row';
          } else {
            plusrows[i].style.display = 'none';
          }
        }
        
        
      }
    } catch (err) {
      console.log('Sandbox | sb_sheet_toggle_delete_item_visible Err:' + err.message);
    }
  }
}



export function sb_sheet_display_id_in_window_caption(html, sheettype, appwindowinfo) {
  const OPTION_DISPLAY_ID_IN_SHEET_CAPTION = sb_item_sheet_get_game_setting("sandbox", SETTINGATTRIBUTE.OPTION_DISPLAY_ID_IN_SHEET_CAPTION.ID); 
  if (OPTION_DISPLAY_ID_IN_SHEET_CAPTION) {
    if (game.user.isGM) {
      let foldername = '';
      let newelementid = 'sb-show-in-console-' + appwindowinfo.id; 
      if (appwindowinfo.compendium.type==null){
        // get folder based on type
        switch (sheettype) {
          case 'Actor':
            let actor = game.actors.get(appwindowinfo.id);
            if (actor != null) {
              if (actor.folder != null) {
                foldername = actor.folder.name;
              }
            }
            break;
          case 'Item':
            let item = game.items.get(appwindowinfo.id);
            if (item != null) {
              if (item.folder != null) {
                foldername = item.folder.name;
              }
            }
            break;
        }
        if (foldername.length > 0) {
          foldername = ' in Folder [' + foldername + ']';
        }        
      } else {
        // compendium
        foldername = ' in Compendium [' + appwindowinfo.compendium.type + '.' + appwindowinfo.compendium.name + ']';
      }
      // get window title
      let insertafterthis = html.find('.window-title');
      if (insertafterthis) {
        let mgrlink='';
        if(sheettype=='Actor'){
          mgrlink='CTRL + Click to show Actor Properties Manager.';
        }
        insertafterthis.after('<a id="' + newelementid + '" title="' + sheettype + ' [' + appwindowinfo.id + ']' + foldername + '<br>Click to show data in Console.<br>'+ mgrlink+'"><i class="fas fa-tag"></i> Info</a>');
        switch (sheettype) {
          case 'Actor':            
            // if token
            // need to get the actor from the canvas so use the secondary id            
            if (appwindowinfo.type=="Token") {                                                       
              html.find('#' + newelementid).click(ev => {
                let token = canvas.tokens.placeables.find(y=>y.id==appwindowinfo.id); 
                let actor=token.actor;
                if (ev.ctrlKey) {                    
                    console.log(actor.system.attributes);                    
                    let options = {
                      actor:{
                        id:actor.id,
                        name:actor.name,
                      },
                      token:{
                        id:appwindowinfo.id,
                        name:token.name
                      },
                      compendium:{
                        type:null,
                        name:null
                      }
                    };
                    let f = new SandboxActorPropertiesManagerForm(options).render(true, { focus: true });                                      
                  } else {
                    // output this to console on purpose
                    console.log(actor);
                  }
              });                              
            } else {
              // check for compendium
              if (appwindowinfo.compendium.type==null){
                // normal actor
                html.find('#' + newelementid).click(ev => {
                  let actor=game.actors.get(appwindowinfo.id);
                  if (ev.ctrlKey) {                    
                    console.log(actor.system.attributes);                    
                    let options = {
                      actor:{
                        id:actor.id,
                        name:actor.name,
                      },
                      token:{
                        id:null,
                        name:null
                      },
                      compendium:{
                        type:null,
                        name:null
                      }
                    };
                    let f = new SandboxActorPropertiesManagerForm(options).render(true, { focus: true });                                      
                  } else {
                    // output this to console on purpose
                    console.log(actor);
                  }
                });
              } else {
                // compendium actor
                html.find('#' + newelementid).click(async (ev) => {
                 const pack=game.packs.get(appwindowinfo.compendium.type + "." + appwindowinfo.compendium.name);
                 const actor = await pack.getDocument(appwindowinfo.id);
                 if (ev.ctrlKey) {                    
                    console.log(actor.system.attributes);                    
                    let options = {
                      actor:{
                        id:actor.id,
                        name:actor.name,
                      },
                      token:{
                        id:null,
                        name:null
                      },
                      compendium:{
                        type:appwindowinfo.compendium.type,
                        name:appwindowinfo.compendium.name
                      }
                    };
                    let f = new SandboxActorPropertiesManagerForm(options).render(true, { focus: true });                                      
                  } else {
                    // output this to console on purpose
                    console.log(actor);
                  }
                 });
              }
            }                        
            break;
          case 'Item':
            if (appwindowinfo.compendium.type==null){
              // normal item
              html.find('#' + newelementid).click(async ev => {
                // output this to console on purpose
                console.log(game.items.get(appwindowinfo.id));                                                                              
              });  
            } else {
              // compendium item
              html.find('#' + newelementid).click(async (ev) => {
                 const pack=game.packs.get(appwindowinfo.compendium.type + "." + appwindowinfo.compendium.name);
                 const compendiumitem = await pack.getDocument(appwindowinfo.id);
                 // output this to console on purpose
                 console.log(compendiumitem);
              });
            }
            break;
        }
      }
    }
  }
}

export function sb_sheet_display_show_infoform_source_in_sheet_caption(html,appwindowinfo){
  if(game.user.isGM){
    let newelementid = 'sb-show-infoform-source-' + appwindowinfo.id;
      let insertafterthis = html.find('.window-title');
      if (insertafterthis) {
        insertafterthis.after('<a id="' + newelementid + '" title="Show info source"><i class="fas fa-magnifying-glass"></i></i> Source</a>');
      }
      html.find('#' + newelementid).click(ev => { 
        sb_sheeet_show_infoform_source(appwindowinfo);  
      });
  }
}

async function sb_sheeet_show_infoform_source(appwindowinfo){
  if(appwindowinfo.compendium.type!=null && appwindowinfo.compendium.name!=null){
    const pack=game.packs.get(appwindowinfo.compendium.type + "." + appwindowinfo.compendium.name);
    const compendiumdoc = await pack.getDocument(appwindowinfo.id);
    if(compendiumdoc!=null){
      compendiumdoc.sheet.render(true,{focus:true});
    }
  } else if(appwindowinfo.type=="Item"){
    const item = game.items.get(appwindowinfo.id);
    if(item!=null){
      item.sheet.render(true,{focus:true});
    }
    
  } else if(appwindowinfo.type=='Actor'){
    const actor = game.actors.get(appwindowinfo.id);
    if(actor!=null){
      actor.sheet.render(true,{focus:true});
    }
  } else if(appwindowinfo.type=='Token'){
    const token=canvas.tokens.placeables.find(y => y.id == appwindowinfo.id);
    if(token!=null){
      token.actor.sheet.render(true,{focus:true});
    }
  }
  
}


export function sb_sheet_display_show_to_others_in_sheet_caption(html, sheettype, appwindowinfo,reshowable=false,defaultshowclass='') {
  //console.log('sb_sheet_display_show_to_others_in_sheet_caption')
  
  const OPTION_DISPLAY_SHOW_TO_OTHERS_IN_SHEET_CAPTION = sb_item_sheet_get_game_setting("sandbox", SETTINGATTRIBUTE.OPTION_DISPLAY_SHOW_TO_OTHERS_IN_SHEET_CAPTION.ID); 
  if (OPTION_DISPLAY_SHOW_TO_OTHERS_IN_SHEET_CAPTION) {            
    if (html[0].classList.contains('sb-info-form-reshowable')||reshowable|| game.user.isGM){
      let showid;
      let showtype;
      let showclass;  
      let showFromScene='';
      let showcompendiumtype='';
      let showcompendiumname='';
      if(defaultshowclass!=''){
        showclass=defaultshowclass;
      } else{
        if (html[0].classList.contains('sb-info-form-show-image-only')){
          showclass='sb-info-form-show-image-only';
        }
        if (html[0].classList.contains('sb-info-form-show-name-and-image')){
          showclass='sb-info-form-show-name-and-image';
        }
        if (html[0].classList.contains('sb-info-form-show-all')){
          showclass='sb-info-form-show-all';
        }
      }
      let newelementid = 'sb-show-others-' + appwindowinfo.id;
      let insertafterthis = html.find('.window-title');
      if (insertafterthis) {
        insertafterthis.after('<a id="' + newelementid + '" title="Show info to others"><i class="fas fa-eye"></i> Show</a>');
        switch (sheettype) {
          case 'Actor':
            // if the actorid is double(ie MwTr94GekOCihrC-6bX8wMQkdZ9OyOQa), then it is a unlinked token, 
            // need to get the actor from the canvas so use the secondary id            
            if (appwindowinfo.type=="Token") {              
              showid=appwindowinfo.id;
              showtype='Token';    
              showFromScene=appwindowinfo.scene;
            } else {
              // check for compendium
              if (appwindowinfo.compendium.type==null){
                // normal actor
                showid=appwindowinfo.id;
                showtype='Actor';
              } else {
                // compendium actor                                
                // TODO
                //console.warn('Sandbox | sb_sheet_display_show_to_others_in_sheet_caption | support for compendium actor not there yet')
                showid=appwindowinfo.id;
                showcompendiumtype = appwindowinfo.compendium.type;
                showcompendiumname = appwindowinfo.compendium.name;
                showtype='Actor';
              }
            }                    
            break;
          case 'Item':     
            if (appwindowinfo.compendium.type==null){
              // normal item
              showid=appwindowinfo.id;
              showtype='Item';
            } else {
              // compendium item
              // TODO
              //console.warn('Sandbox | sb_sheet_display_show_to_others_in_sheet_caption | support for compendium item not there yet')
              showid=appwindowinfo.id;              
              showcompendiumtype = appwindowinfo.compendium.type;
              showcompendiumname = appwindowinfo.compendium.name;
              showtype='Item';
            }
            break;
        }
        html.find('#' + newelementid).click(ev => { 
          //console.log('Sandbox | sb_sheet_display_show_to_others_in_sheet_caption');
          sb_sheet_showplayers_info_form(showid,showtype,showclass,showcompendiumtype,showcompendiumname,showFromScene);
        });
      }
    }
  }
}

async function sb_sheet_showplayers_info_form(showid,showtype,showclass,showcompendiumtype='',showcompendiumname='',showFromScene='') {
  //console.warn('sbe_sheet_showplayers_info_form,id:' + showid + ',type:'+showtype+',class:'+showclass+',scene:'+showFromScene);
  //
  let objectname='';
  let datasource='';
  let token_actor_id='';
  let actor_token_id='';
  let token;
  let compendium='';
  switch (showtype) {
    case('Item'):
      let item=null;
      if(showcompendiumtype.length>0 && showcompendiumname.length>0){
        const pack=await game.packs.get(showcompendiumtype + '.' + showcompendiumname);
        item = await pack.getDocument(showid);
      } else {
        item = game.items.get(showid);
      }
      if (item != null) {
        objectname=item.name;
        datasource=`<input type="hidden" id="show-info-content-datasource-item" name="show-info-content-datasource-item" value="Item">`;
        if(showcompendiumtype.length>0 && showcompendiumname.length>0){
          compendium='Compendium '
          datasource+=`<input type="hidden" id="show-info-content-datasource-compendium" name="show-info-content-datasource-compendium-type" value="`+ showcompendiumtype+`">`;
          datasource+=`<input type="hidden" id="show-info-content-datasource-compendium" name="show-info-content-datasource-compendium-name" value="`+ showcompendiumname+`">`;
        }
      }
      break;
    case('Actor'):
      let actor =null;
      if(showcompendiumtype.length>0 && showcompendiumname.length>0){
        const pack=game.packs.get(showcompendiumtype + '.' + showcompendiumname);
        actor = await pack.getDocument(showid);
      } else {
        actor = game.actors.get(showid)
      }
      // get token from current scene with linked actor
      token=canvas.tokens.placeables.find(y => y.actor.id == showid && y.document.actorLink);
      if(token!=null){
        actor_token_id=token.id;
        if(showFromScene==''){
          // get scend id from token
          showFromScene=token.scene.id;
        }
      }
      if (actor != null) {
        objectname=actor.name;
        datasource=`<input type="hidden" id="show-info-content-datasource-actor" name="show-info-content-datasource-actor" value="Actor">`;
        if(showcompendiumtype.length>0 && showcompendiumname.length>0){
          compendium='Compendium '
          datasource+=`<input type="hidden" id="show-info-content-datasource-compendium" name="show-info-content-datasource-compendium-type" value="`+ showcompendiumtype+`">`;
          datasource+=`<input type="hidden" id="show-info-content-datasource-compendium" name="show-info-content-datasource-compendium-name" value="`+ showcompendiumname+`">`;          
        } else {
          // only show token/actor source selector from non compendium
          let disableTokenSource='';
          if(showFromScene==''){
            disableTokenSource ='disabled';
          }
          datasource+=`
                     <br><label>From : </label>
                    <input class="sb-info-form-option" type="radio" id="show-info-content-datasource-actor" name="show-info-content-datasource" value="Actor" title="Use actor as source" checked>
                    <label class="sb-info-form-option" for="show-info-content-datasource-actor">Actor</label>
                    <input class="sb-info-form-option" type="radio" id="show-info-content-datasource-token" name="show-info-content-datasource" value="Token" title="Use token on current scene as source" ` + disableTokenSource +`>
                    <label class="sb-info-form-option" for="show-info-content-datasource-token">Token</label>
                    `;
        }
      }
      break;
    case('Token'):
      token = canvas.tokens.placeables.find(y => y.id == showid);
      if (token != null) {
        objectname= token.name;
        // get the parent actor for the token for later use
        token_actor_id=token.document.actorId;        
        datasource=`
                     <br><label>From : </label>
                    <input class="sb-info-form-option" type="radio" id="show-info-content-datasource-actor" name="show-info-content-datasource" value="Actor" title="Use tokens actor on current scene as source">
                    <label class="sb-info-form-option" for="show-info-content-datasource-actor">Actor</label>
                    <input class="sb-info-form-option" type="radio" id="show-info-content-datasource-token" name="show-info-content-datasource" value="Token" title="Use tokens on current scene as source" checked>
                    <label class="sb-info-form-option" for="show-info-content-datasource-token">Token</label>
                    `;
      }
      break;
  }
  // generate dialog to ask userwhat data to show
  let htmlUsers='';
  // generate user list
  let users = game.users.filter(user => user.active);
  let actor;
  let actorimg="icons/svg/mystery-man.svg";
  let username='';
  let charactername='';
  let userid;
  // Build checkbox list for all active players
  users.forEach(user => {           
    username=user.name;
    if(user.isGM){
      username +='[GM]'
    }
    userid=user.id;
    if (user.character!=null){             
      actor=game.actors.get(user.character.id);
      if(actor!=null){
        actorimg=actor.img;
      }
      charactername=user.character.name;
      
    } else {
      charactername=user.name;      
      // use the user avatar if any
      if (user.avatar!=null){
        actorimg=user.avatar;
      }      
    }
    htmlUsers+='<div class="sb-info-form-playerinfo"><input type="checkbox" class="sb-info-form-playerselected" name="' + username +'" value="' + userid +'"  checked><img class="sb-info-form-portrait-img"  src="' + actorimg +'"</img><p>' + charactername+'<br>[' + username  +']' + '</p></div>';
  });
  
  // 
  //
  let showAll='';
  let showImageOnly='';
  let showNameAndImage='';
  switch (showclass){
    case 'sb-info-form-show-all':
      showAll='checked';      
      break;
    case 'sb-info-form-show-name-and-image':
      showAll='disabled';
      showNameAndImage='checked';
      break;
    case 'sb-info-form-show-image-only':
      showAll='disabled';
      showImageOnly='checked';
      showNameAndImage='disabled';
      break;
  }
  let d=new Dialog({
    title: `Show [` + compendium + showtype + '] ' + objectname + ' to others',
    content: `
          <style>
            
          </style>
          <script>
            function sbeshowInfoToggleUserSelection(){
              // get current value of "Selected users"
              const toselectedusers=document.getElementById("show-info-to-selected").checked;
              let fsSelectedUsers=document.getElementById("show-info-selected-users");
              if(toselectedusers){
                fsSelectedUsers.disabled = false;
              } else {
                fsSelectedUsers.disabled = true;
              }
            }
          </script>
            <form>
          <div class="sb-info-form-column-float"> 
            <fieldset class="sb-info-form-basic" style="text-align:left;">
                <legend style="text-align:left;">Show as</legend> 

                  <input class="sb-info-form-option" type="radio" id="show-info-as-form" name="show-info-show-type" value="FORM" checked>
                  <label class="sb-info-form-option" for="show-info-as-form">Pop-up</label><br>
               
                  
                  <input class="sb-info-form-option" type="radio" id="show-info-as-chat" name="show-info-show-type" value="CHAT" >
                  <label class="sb-info-form-option" for="show-info-as-chat">Chat</label><br>
                
                  <input class="sb-info-form-option" type="radio" id="show-info-as-chat-compact" name="show-info-show-type" value="CHAT_COMPACT" >
                  <label class="sb-info-form-option" for="show-info-as-chat-compact">Chat(compact)</label><br>
                
            </fieldset> 
          </div>
          <div class="sb-info-form-column-float"> 
            <fieldset class="sb-info-form-basic" style="text-align:left;">
                <legend style="text-align:left;">Show what</legend>
                                  
                  <input class="sb-info-form-option" id="show-info-content-description" name="show-info-content" type="radio" value="all" ` + showAll + ` />
                  <label class="sb-info-form-option" for="show-info-content-description">Image, name and info</label><br>
                                                     
                  <input class="sb-info-form-option" id="show-info-content-name" name="show-info-content" type="radio" value="name-and-image" ` + showNameAndImage + ` />
                  <label class="sb-info-form-option" for="show-info-content-name">Image and name</label><br>
                   
                  <input class="sb-info-form-option" id="show-info-content-image" name="show-info-content" type="radio" value="image-only" ` + showImageOnly + `/>  
                  <label class="sb-info-form-option" for="show-info-content-image">Image only</label>
                  `+datasource+`
              </fieldset>
          </div>
          
          <div class="sb-info-form-column-float">
          <fieldset class="sb-info-form-basic" style="text-align:left;">
                <legend style="text-align:left;">Show to</legend> 
                
                  <input class="sb-info-form-option" type="radio" id="show-info-to-all" name="show-info-show-to" value="ALL" onclick="sbeshowInfoToggleUserSelection();" checked>
                  <label class="sb-info-form-option" for="show-info-to-all">All players & GM</label><br>

                  <input class="sb-info-form-option"  type="radio" id="show-info-to-gm" name="show-info-show-to" value="GM" onclick="sbeshowInfoToggleUserSelection();">
                  <label class="sb-info-form-option" for="show-info-to-gm">GM(s) only</label><br>
    
                  <input class="sb-info-form-option" type="radio" id="show-info-to-selected" name="show-info-show-to" value="SELECTED" onclick="sbeshowInfoToggleUserSelection();">
                  <label class="sb-info-form-option" for="show-info-to-selected">Selected players</label><br>
                
                  <input class="sb-info-form-option" type="radio" id="show-info-to-myself" name="show-info-show-to" value="MYSELF" onclick="sbeshowInfoToggleUserSelection();">
                  <label class="sb-info-form-option" for="show-info-to-myself">Myself</label><br>
           </fieldset>
          </div>
          

          <fieldset id="show-info-selected-users" style="text-align:left;" disabled>
            <legend style="text-align:left;">Selected players</legend>
            `+htmlUsers+`
          </fieldset>   
                

      </form>
            `,
    buttons: {
      yes: {
        icon: "<i class='fas fa-check'></i>",
        label: `Show`,
        callback: async (html) => {
          // assemble data
          // what to show                    
          let who_show=(html.find('input[name="show-info-show-to"]:checked').val() || 'none'); 
          if(who_show=='SELECTED'){
            // get users
            const selectedplayers = document.getElementsByClassName("sb-info-form-playerselected"); 
            if(selectedplayers.length>0){
              who_show='';
              // get them
              for (let i = 0; i < selectedplayers.length; i++){
                if(selectedplayers[i].checked){                          
                  who_show+=selectedplayers[i].value +';' ;                  
                }
              }
              if(who_show==''){
                who_show='none';
              }
            } else {
              who_show='none';
            }
          }
          const what_show=(html.find('input[name="show-info-content"]:checked').val() || 'none'); 
          const how_show=(html.find('input[name="show-info-show-type"]:checked').val() || 'none'); 
          // check for compendium
          const compendiumtype=(html.find('input[name="show-info-content-datasource-compendium-type"]').val() || ''); 
          const compendiumname=(html.find('input[name="show-info-content-datasource-compendium-name"]').val() || '');
          // for tokens, check if user wanted to use data from the parent actor
          if(showtype=='Actor'){
            const datasource=(html.find('input[name="show-info-content-datasource"]:checked').val() || 'Actor');
            if(datasource=='Token'){
              showtype='Token'; 
              showid=actor_token_id;
            }
          }
          if(showtype=='Token'){
            const datasource=(html.find('input[name="show-info-content-datasource"]:checked').val() || 'Token');
            if(datasource=='Actor'){
              showtype='TokenActor';              
            }
          }
          if(what_show !='none' && who_show !='none' && how_show!='none'){                        
            if(how_show=='CHAT' ){
              sb_sheet_showplayers_info_chat(showid,showtype,what_show,who_show,compendiumtype,compendiumname,false);
            } else if(how_show=='CHAT_COMPACT'){
              sb_sheet_showplayers_info_chat(showid,showtype,what_show,who_show,compendiumtype,compendiumname,true);
            } else {
              //  show popup
              let show_name=false;
              let show_image=false;
              let show_description=false;            
              console.log('Show to players ' + showtype + ' : ' + showid );
              switch(what_show){
                case 'all':
                  show_name=true;
                  show_image=true;
                  show_description=true;
                  break;
                case 'image-only':
                  show_image=true;
                  break;
                case 'name-and-image':
                  show_name=true;
                  show_image=true;
                  break;
              }
              
              let msg={
                  op:SOCKETCONSTANTS.MSG.OPERATIONS.SHOW_PLAYERS,
                  from:game.user.id,
                  data:{
                    id: showid,
                    type:showtype,
                    class:showclass,
                    scene:showFromScene,
                    compendiumtype:compendiumtype,
                    compendiumname:compendiumname,
                    show:{
                      name:show_name,
                      image:show_image,
                      description:show_description,
                      who:who_show
                    }
                  }
                }
              
              if(who_show=='MYSELF'){                
                showPlayer(msg)
              } else {
                // send through socket to client to show popup
                game.socket.emit(SOCKETCONSTANTS.CONNECTION.NAME, msg);
              }
            }
          } else{
            // notify user no msg will be sent
            ui.notifications.warn('Show to others | No content or recipients selected to show');
          }
        }
      },
      no: {
        icon: "<i class='fas fa-times'></i>",
        label: `Cancel`
      }
    },
    default: "yes",
    close: (html) => {
    }
  });
  d.options.width = 575;
  d.position.width = 575;
  d.options.height=0;
  d.position.height=0;
  d.options.resizable=true;
  d.render(true);
}

async function sb_sheet_showplayers_info_chat(showid,showtype,what_show,who_show,showcompendiumtype='',showcompendiumname='',compact_mode=false) {  
  let chatname='';
  let chatimage='';
  let whisperrecipients='';
  let objectname;
  let objectimage;
  let objectinfo;
  let token;
  switch (showtype) {
    case('Item'):
      let item=null;
      if(showcompendiumtype.length>0 && showcompendiumname.length>0){
        const pack=await game.packs.get(showcompendiumtype + '.' + showcompendiumname);
        item = await pack.getDocument(showid);
      } else {
        item = game.items.get(showid);
      }
      if (item != null) {
        objectname=item.name;
        objectimage=item.img;
        objectinfo=item.system.description;
      }
      break;
    case('Actor'):
      let actor=null;
      if(showcompendiumtype.length>0 && showcompendiumname.length>0){
        const pack=await game.packs.get(showcompendiumtype + '.' + showcompendiumname);
        actor = await pack.getDocument(showid);
      } else {
        actor = game.actors.get(showid)
      }
      if (actor != null) {
        objectname=actor.name;
        objectimage=actor.img;
        objectinfo=actor.system.biography;
      }
      break;
    case('Token'):
      token = canvas.tokens.placeables.find(y => y.id == showid);
      if (token != null) {
        objectname= token.name;
        objectimage=token.document.texture.src; //  token.img;
        objectinfo=token.actor.system.biography;
      }
      break;
    case('TokenActor'):
      token = canvas.tokens.placeables.find(y => y.id == showid);
      if (token != null) {
        objectname= token.actor.name;
        objectimage=token.actor.img; //  token.img;
        objectinfo=token.actor.system.biography;
      }
      break;
  }    
  switch(what_show){
    case 'all':            
      break;
    case 'image-only':      
      objectname=null;
      objectinfo=null;
      break;
    case 'name-and-image':      
      objectinfo=null;
      break;
  }
  
  if (game.user.character!=null){ 
    let actor=game.actors.get(game.user.character.id);
    if(actor!=null){
      chatimage=actor.img;      
      chatname=actor.name;
    }        
  } else {
    chatimage = game.user.avatar;
    chatname = game.user.name;
  }  
  // determine recipiencts
  let targets=[];
  let iswhisper=false;
  switch(who_show){
    case 'ALL':            
      break;
    case 'MYSELF':
      iswhisper=true;
      whisperrecipients=game.user.name ;
      targets.push(game.user.id);
      break;
    case 'GM':
      iswhisper=true;
      whisperrecipients='GM' ;
      // whisper to GMs
      targets= ChatMessage.getWhisperRecipients('GM');
      // add self
      targets.push(game.user.id);
      break;
    default:
      iswhisper=true;
      whisperrecipients= '';
      // parse name list
      const arrRecipients = who_show.split(";");
      let recipient;
      for (let i = 0; i < arrRecipients.length; i++){
        targets.push(arrRecipients[i]);
        recipient=game.users.get(arrRecipients[i]);
        if (recipient!=null){
          if(whisperrecipients.length==0){
            whisperrecipients=recipient.name;
          } else {
            whisperrecipients+=', ' + recipient.name;
          }
        }
      }
      // add self
      targets.push(game.user.id);
  }      
  let msgData = {
      token:{
          img:chatimage,
          name:chatname
      },
      objectinfo: objectinfo,
      objectname:objectname,
      objectimage:objectimage,
      compact_mode:compact_mode,
      actor:chatname,
      user: game.user.name,
      isWhisper:iswhisper,
      whisperTo:whisperrecipients
    };
  renderTemplate("systems/sandbox/templates/sb-info-chat-msg-all.hbs", msgData).then(html => {
      ChatMessage.create({
          speaker: ChatMessage.getSpeaker(),  // R800 2023-05-21
          content: html,
          whisper: targets
      });
  });                            
}


export function adaptItemSheetGeoMetrics (gItemSheet, html)  {
  const typeClass = gItemSheet.item.type;
  const OPTION_ADAPT_ITEM_SHEET_POSITION = sb_item_sheet_get_game_setting("sandbox", SETTINGATTRIBUTE.OPTION_ADAPT_ITEM_SHEET_POSITION.ID);
  if(OPTION_ADAPT_ITEM_SHEET_POSITION){
    // make room for details menu by  increasing the item sheet window height                    
    if (game.user.isGM) {      
      // for updates the return html is a form
      if (html[0].nodeName !== 'FORM') { 
      }
      
        let sheetheight=ITEM_SHEET_HEIGHT[typeClass.toUpperCase()]; 
        if (typeClass.toUpperCase() == 'PROPERTY') {
          const datatype = gItemSheet.item.system.datatype;
          if(datatype=="") {
            // use simpletext as new default
            sheetheight = ITEM_SHEET_PROPERTY_HEIGHT['SIMPLETEXT'];
          } else {
            sheetheight = ITEM_SHEET_PROPERTY_HEIGHT[datatype.toUpperCase()];
          }
        }
        // center window
        let newtop = (window.innerHeight - (sheetheight)) / 2;
        if (newtop < 0) {
          newtop = 0;
        }
        gItemSheet.setPosition({top: newtop});
        gItemSheet.setPosition({height: sheetheight, width: ITEM_SHEET_DEFAULT_WIDTH});
      
    }
  }
  const OPTION_SET_DEFAULT_ITEM_TAB = sb_item_sheet_get_game_setting("sandbox", SETTINGATTRIBUTE.OPTION_SET_DEFAULT_ITEM_TAB.ID); 
    if (OPTION_SET_DEFAULT_ITEM_TAB ) {
      // set default tab shown for items
      if (game.user.isGM) {
        // for updates the return html is a form
        if (html[0].nodeName !== 'FORM') {
          const detailstabname = ITEM_SHEET_TABS[typeClass.toUpperCase()].DETAILS;
          // activate tab
          gItemSheet._tabs[0].activate(detailstabname);
        }
      }
    }
};