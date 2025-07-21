import { ITEMATTRIBUTE } from "./sb-itemsheet-constants.js"
import { DropDownMenu } from "./dropdownmenu.js";
import { SandboxExpressionEditorForm } from "./sb-expression-editor-form.js";
import { SandboxTableFilterEditorForm } from "./sb-table-filter-editor-form.js";
import { SandboxLookupTableEditorForm } from "./sb-lookup-table-editor-form.js";
import { sb_string_is_valid_table_filter } from "./sb-table-filters.js";
import { sb_string_is_valid_lookup_table } from "./sb-lookup-table.js";

import * as stringCasing from './sb-strings-case.js';
import { SETTINGATTRIBUTE } from "./sb-setting-constants.js";
import { sb_item_sheet_get_game_setting } from "./sb-setting-constants.js";
import { transliterate  } from "./transliteration_2.1.8_bundle.esm.min.js"; 
import { INVALID_KEY_CHARACTERS } from "./sb-key-validate.js";
import { SandboxKeyValidate } from "./sb-key-validate.js";
import { SystemSettingsForm } from "./system-settings-form.js";
import { sb_custom_dialog_confirm } from "./sb-custom-dialogs.js";
import { SandboxSearchForm } from "./sb-search-form.js";

export function activateHelpers(html,item){
  try{
    // menu bar
    html.find('#sb-item-helpers-menu-bar-item-show-sandbox-settings').click(ev => {
        let f = new SystemSettingsForm();
        f.render(true,{focus:true});
    });
    // auto generate all
    html.find('#sb-item-helpers-menu-bar-item-autogenerateall').click(ev => {
      sb_item_sheet_autogenerate_all(item,html, item.type);
    });
    // validate all 
    html.find('#sb-item-helpers-menu-bar-item-validateall').click(ev => {
      switch (item.type.toUpperCase()) {
          case 'PROPERTY':
            sb_item_sheet_validate_input(html, ITEMATTRIBUTE[item.type.toUpperCase()].KEY, item.type, item.id);
            sb_item_sheet_validate_input(html, ITEMATTRIBUTE[item.type.toUpperCase()].LIST, item.type, item.id);
            sb_item_sheet_validate_input(html, ITEMATTRIBUTE[item.type.toUpperCase()].CHECKGROUP, item.type, item.id);
            
            break;
          case "MULTIPANEL":
            sb_item_sheet_validate_input(html, ITEMATTRIBUTE[item.type.toUpperCase()].KEY, item.type, item.id);
            break;
          case "PANEL":
            sb_item_sheet_validate_input(html, ITEMATTRIBUTE[item.type.toUpperCase()].KEY, item.type, item.id);
            break;
          case "SHEETTAB":
            sb_item_sheet_validate_input(html, ITEMATTRIBUTE[item.type.toUpperCase()].KEY, item.type, item.id);
            break;
          case "GROUP":
            sb_item_sheet_validate_input(html, ITEMATTRIBUTE[item.type.toUpperCase()].KEY, item.type, item.id);
            break;
          case "LOOKUP":
            sb_item_sheet_validate_input(html, ITEMATTRIBUTE[item.type.toUpperCase()].KEY, item.type, item.id);
            break;
          case "cITEM":
            break;
          default:
            break;
        }
    });
    // clear all
    html.find('#sb-item-helpers-menu-bar-item-clearall').click(ev => {
      sb_item_sheet_clear_all(item,html, item.type);
    });
    
    let dropDownMenuOptions={
      downVerticalAdjustment:1,
      upVerticalAdjustment:2,
      expandLeft:true,
      expandRight:false
    };
    
    let input;
    // all items have name
    input=sb_item_sheet_get_input(html,'name','ITEM');
    if (input != null && input.length > 0) {  
      let menuItems=[];
      menuItems = sb_item_sheet_dropdown_add_casing_menuitems(html,menuItems,ITEMATTRIBUTE.ITEM.NAME);
      menuItems = sb_item_sheet_add_separator(menuItems);
      menuItems = sb_item_sheet_dropdown_add_default_menuitems(html,menuItems,ITEMATTRIBUTE.ITEM.NAME);             
      new DropDownMenu(html, `#sb-itemsheet-helper-dropdown-name-${item.id}`, menuItems,dropDownMenuOptions);
    }
    
    // properties etc
    if(item.type=="property" || item.type=="panel" || item.type=="multipanel" || item.type=="group" || item.type=="sheettab" || item.type=="lookup"){
      // KEY
      input=sb_item_sheet_get_input(html, 'key', item.type);
      if (input != null && input.length > 0) {  
        let menuItems=[];
        menuItems = sb_item_sheet_dropdown_add_editor(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].KEY,item); 
        menuItems = sb_item_sheet_dropdown_add_autogenerate(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].KEY,item);
        menuItems = sb_item_sheet_dropdown_add_validate(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].KEY,item);
        menuItems = sb_item_sheet_add_separator(menuItems);
        menuItems = sb_item_sheet_dropdown_add_casing_menuitems(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].KEY);
        menuItems = sb_item_sheet_add_separator(menuItems);
        if(item.type=="property"){
          menuItems = sb_item_sheet_dropdown_add_copy_property_as_menuitems(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].KEY);
        }
        menuItems = sb_item_sheet_add_separator(menuItems);
        menuItems = sb_item_sheet_dropdown_add_default_menuitems(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].KEY);
        menuItems = sb_item_sheet_add_separator(menuItems);
        menuItems = sb_item_sheet_dropdown_add_search(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].KEY,item);
        
        new DropDownMenu(html, `#sb-itemsheet-helper-dropdown-key-${item.id}`, menuItems,dropDownMenuOptions);
      }
    }
    if(item.type=="property"){
      // DATATYPE
      input=sb_item_sheet_get_input(html, 'key', item.type);
      if (input != null && input.length > 0) {  
        let menuItems=[];
        menuItems = sb_item_sheet_dropdown_add_autogenerate_property_icon(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].KEY,item);
        new DropDownMenu(html, `#sb-itemsheet-helper-dropdown-datatype-${item.id}`, menuItems,dropDownMenuOptions);
      }
    }
    if(item.type=="property"){
      // DEFAULT
      input=sb_item_sheet_get_input(html, 'default', item.type);
      if (input != null && input.length > 0) {  
        let menuItems=[];
        menuItems = sb_item_sheet_dropdown_add_editor(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].DEFAULT,item); 
        menuItems = sb_item_sheet_add_separator(menuItems);
        menuItems = sb_item_sheet_dropdown_add_default_menuitems(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].DEFAULT);  
        new DropDownMenu(html, `#sb-itemsheet-helper-dropdown-default-${item.id}`, menuItems,dropDownMenuOptions);
      }
    }
    if(item.type=="property" || item.type=="panel" || item.type=="multipanel" || item.type=="sheettab"){
      //TAG/TITLE
      input=sb_item_sheet_get_input(html, 'tag', item.type);
      if (input != null && input.length > 0) {  
        let menuItems=[];
        menuItems = sb_item_sheet_dropdown_add_editor(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].TAG,item); 
        menuItems = sb_item_sheet_dropdown_add_autogenerate(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].TAG,item);
        menuItems = sb_item_sheet_add_separator(menuItems);
        menuItems = sb_item_sheet_dropdown_add_casing_menuitems(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].TAG);
        menuItems = sb_item_sheet_add_separator(menuItems);
        menuItems = sb_item_sheet_dropdown_add_default_menuitems(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].TAG);  
        new DropDownMenu(html, `#sb-itemsheet-helper-dropdown-tag-${item.id}`, menuItems,dropDownMenuOptions);
      }
    }
    if(item.type=="property"){
      // tooltip
      input=sb_item_sheet_get_input(html, 'tooltip', item.type);
      if (input != null && input.length > 0) {  
        let menuItems=[];
        menuItems = sb_item_sheet_dropdown_add_editor(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].TOOLTIP,item); 
        menuItems = sb_item_sheet_dropdown_add_autogenerate(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].TOOLTIP,item); 
        menuItems = sb_item_sheet_add_separator(menuItems);
        menuItems = sb_item_sheet_dropdown_add_casing_menuitems(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].TOOLTIP);
        menuItems = sb_item_sheet_add_separator(menuItems);
        menuItems = sb_item_sheet_dropdown_add_default_menuitems(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].TOOLTIP);  
        new DropDownMenu(html, `#sb-itemsheet-helper-dropdown-tooltip-${item.id}`, menuItems,dropDownMenuOptions);
      }
    }
    
    if(item.type=="property"){
      // table filter
      input=sb_item_sheet_get_input(html, 'tablefilter', item.type);
      if (input != null && input.length > 0) {  
        let menuItems=[];        
        menuItems = sb_item_sheet_dropdown_add_filter(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].TABLEFILTER,item);
        menuItems = sb_item_sheet_dropdown_add_editor(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].TABLEFILTER,item); 
        menuItems = sb_item_sheet_add_separator(menuItems);
        menuItems = sb_item_sheet_dropdown_add_default_menuitems(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].TABLEFILTER);  
        new DropDownMenu(html, `#sb-itemsheet-helper-dropdown-tablefilter-${item.id}`, menuItems,dropDownMenuOptions);
      }
    }
    if(item.type=="lookup"){
      // lookup table
      input=sb_item_sheet_get_input(html, 'lookuptable', item.type);
      if (input != null && input.length > 0) {  
        let menuItems=[];        
        menuItems = sb_item_sheet_dropdown_add_lookuptable(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].LOOKUPTABLE,item);
        menuItems = sb_item_sheet_dropdown_add_editor(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].LOOKUPTABLE,item);
        menuItems = sb_item_sheet_add_separator(menuItems);
        menuItems = sb_item_sheet_dropdown_add_default_menuitems(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].LOOKUPTABLE);  
        new DropDownMenu(html, `#sb-itemsheet-helper-dropdown-lookuptable-${item.id}`, menuItems,dropDownMenuOptions);
      }
    }
    
    
    
    if(item.type=="property" || item.type=="cItem"){
      // rollname
      input=sb_item_sheet_get_input(html, 'rollname', item.type);
      if (input != null && input.length > 0) {  
        let menuItems=[];
        menuItems = sb_item_sheet_dropdown_add_editor(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].ROLLNAME,item); 
        menuItems = sb_item_sheet_dropdown_add_autogenerate(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].ROLLNAME,item);        
        menuItems = sb_item_sheet_dropdown_add_casing_menuitems(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].ROLLNAME);
        menuItems = sb_item_sheet_dropdown_add_default_menuitems(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].ROLLNAME);  
        new DropDownMenu(html, `#sb-itemsheet-helper-dropdown-rollname-${item.id}`, menuItems,dropDownMenuOptions);
      }
    }
    if(item.type=="property" || item.type=="cItem"){
      // rollid
      input=sb_item_sheet_get_input(html, 'rollid', item.type);
      if (input != null && input.length > 0) {  
        let menuItems=[];
        menuItems = sb_item_sheet_dropdown_add_editor(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].ROLLID,item); 
        menuItems = sb_item_sheet_dropdown_add_autogenerate(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].ROLLID,item);   
        menuItems = sb_item_sheet_add_separator(menuItems);
        menuItems = sb_item_sheet_dropdown_add_casing_menuitems(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].ROLLID);
        menuItems = sb_item_sheet_add_separator(menuItems);
        menuItems = sb_item_sheet_dropdown_add_default_menuitems(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].ROLLID);  
        new DropDownMenu(html, `#sb-itemsheet-helper-dropdown-rollid-${item.id}`, menuItems,dropDownMenuOptions);
      }
    }
    if(item.type=="property" || item.type=="cItem" ){
      // ROLLEXP
      input = sb_item_sheet_get_input(html, 'rollexp', item.type);
      if (input != null && input.length > 0) {  
        let menuItems=[];
        menuItems = sb_item_sheet_dropdown_add_editor(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].ROLLEXP,item); 
        menuItems = sb_item_sheet_add_separator(menuItems);
        menuItems = sb_item_sheet_dropdown_add_default_menuitems(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].ROLLEXP);  
        new DropDownMenu(html, `#sb-itemsheet-helper-dropdown-rollexp-${item.id}`, menuItems,dropDownMenuOptions);
      }
    }
    
    if(item.type=="cItem" ){
      // maxuses
      input = sb_item_sheet_get_input(html, 'maxuses', item.type);
      if (input != null && input.length > 0) {  
        let menuItems=[];
        menuItems = sb_item_sheet_dropdown_add_editor(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].MAXUSES,item); 
        menuItems = sb_item_sheet_add_separator(menuItems);
        menuItems = sb_item_sheet_dropdown_add_default_menuitems(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].MAXUSES);  
        new DropDownMenu(html, `#sb-itemsheet-helper-dropdown-maxuses-${item.id}`, menuItems,dropDownMenuOptions);
      }
      // mods condat
      for (let index = 0; index < item.system.mods.length; index++) {
        input = sb_item_sheet_get_input(html, 'condat', item.type,index);
        if (input != null && input.length > 0) {  
          let menuItems=[];
          menuItems = sb_item_sheet_dropdown_add_editor(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].CONDAT,item,index); 
          menuItems = sb_item_sheet_add_separator(menuItems);
          menuItems = sb_item_sheet_dropdown_add_default_menuitems(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].CONDAT,index);  
          new DropDownMenu(html, `#sb-itemsheet-helper-dropdown-${index}-condat-${item.id}`, menuItems,dropDownMenuOptions);
        }
      }
      // mods value
      for (let index = 0; index < item.system.mods.length; index++) {
        input = sb_item_sheet_get_input(html, 'value', item.type,index);
        if (input != null && input.length > 0) {  
          let menuItems=[];
          menuItems = sb_item_sheet_dropdown_add_editor(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].VALUE,item,index); 
          menuItems = sb_item_sheet_add_separator(menuItems);
          menuItems = sb_item_sheet_dropdown_add_default_menuitems(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].VALUE,index);  
          new DropDownMenu(html, `#sb-itemsheet-helper-dropdown-${index}-value-${item.id}`, menuItems,dropDownMenuOptions);
        }
      }
    }
    
    if(item.type=="property"){
      // automax
      input = sb_item_sheet_get_input(html, 'automax', item.type);
      if (input != null && input.length > 0) {  
        let menuItems=[];
        menuItems = sb_item_sheet_dropdown_add_editor(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].AUTOMAX,item); 
        menuItems = sb_item_sheet_add_separator(menuItems);
        menuItems = sb_item_sheet_dropdown_add_default_menuitems(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].AUTOMAX);  
        new DropDownMenu(html, `#sb-itemsheet-helper-dropdown-automax-${item.id}`, menuItems,dropDownMenuOptions);
      }
    }
    if(item.type=="property"){ 
      // auto
      input = sb_item_sheet_get_input(html, 'auto', item.type);
      if (input != null && input.length > 0) {  
        let menuItems=[];
        menuItems = sb_item_sheet_dropdown_add_editor(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].AUTO,item); 
        menuItems = sb_item_sheet_add_separator(menuItems);
        menuItems = sb_item_sheet_dropdown_add_default_menuitems(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].AUTO);  
        new DropDownMenu(html, `#sb-itemsheet-helper-dropdown-auto-${item.id}`, menuItems,dropDownMenuOptions);
      }
    }
    if(item.type=="property"){
      // checkgroup
      input = sb_item_sheet_get_input(html, 'checkgroup', item.type);
      if (input != null && input.length > 0) {  
        let menuItems=[];
        menuItems = sb_item_sheet_dropdown_add_editor(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].CHECKGROUP,item); 
        menuItems = sb_item_sheet_dropdown_add_validate(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].CHECKGROUP,item);
        menuItems = sb_item_sheet_add_separator(menuItems);
        menuItems = sb_item_sheet_dropdown_add_default_menuitems(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].CHECKGROUP);  
        new DropDownMenu(html, `#sb-itemsheet-helper-dropdown-checkgroup-${item.id}`, menuItems,dropDownMenuOptions);
      }
    }
    if(item.type=="property"){
      // list
      input = sb_item_sheet_get_input(html, 'list', item.type);
      if (input != null && input.length > 0) {  
        let menuItems=[];
        menuItems = sb_item_sheet_dropdown_add_editor(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].LIST,item); 
        menuItems = sb_item_sheet_dropdown_add_validate(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].LIST,item);
        menuItems = sb_item_sheet_add_separator(menuItems);
        menuItems = sb_item_sheet_dropdown_add_default_menuitems(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].LIST);  
        new DropDownMenu(html, `#sb-itemsheet-helper-dropdown-list-${item.id}`, menuItems,dropDownMenuOptions);
      }
    }
    if(item.type=="property"){
      // listauto
      input = sb_item_sheet_get_input(html, 'listauto', item.type);
      if (input != null && input.length > 0) {  
        let menuItems=[];
        menuItems = sb_item_sheet_dropdown_add_editor(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].LISTAUTO,item); 
        menuItems = sb_item_sheet_add_separator(menuItems);
        menuItems = sb_item_sheet_dropdown_add_default_menuitems(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].LISTAUTO);  
        new DropDownMenu(html, `#sb-itemsheet-helper-dropdown-listauto-${item.id}`, menuItems,dropDownMenuOptions);
      }
    }
    
    
    if(item.type=="property" || item.type=="panel"  ){
      //fontgroup
      input=sb_item_sheet_get_input(html, 'fontgroup', item.type);
      if (input != null && input.length > 0) {  
        let menuItems=[];
        menuItems = sb_item_sheet_dropdown_add_editor(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].FONTGROUP,item); 
        menuItems = sb_item_sheet_dropdown_add_autogenerate(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].FONTGROUP,item); 
        menuItems = sb_item_sheet_add_separator(menuItems);
        menuItems = sb_item_sheet_dropdown_add_copy_input_as_css_menuitems(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].FONTGROUP);  
        menuItems = sb_item_sheet_add_separator(menuItems);
        menuItems = sb_item_sheet_dropdown_add_default_menuitems(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].FONTGROUP);  
        new DropDownMenu(html, `#sb-itemsheet-helper-dropdown-fontgroup-${item.id}`, menuItems,dropDownMenuOptions);
      }
    }
    if(item.type=="property" || item.type=="panel"){
      //inputgroup
      input=sb_item_sheet_get_input(html, 'inputgroup', item.type);
      if (input != null && input.length > 0) {  
        let menuItems=[];
        menuItems = sb_item_sheet_dropdown_add_editor(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].INPUTGROUP,item); 
        menuItems = sb_item_sheet_dropdown_add_autogenerate(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].INPUTGROUP,item); 
        menuItems = sb_item_sheet_add_separator(menuItems);
        menuItems = sb_item_sheet_dropdown_add_copy_input_as_css_menuitems(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].INPUTGROUP); 
        menuItems = sb_item_sheet_add_separator(menuItems);
        menuItems = sb_item_sheet_dropdown_add_default_menuitems(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].INPUTGROUP);  
        new DropDownMenu(html, `#sb-itemsheet-helper-dropdown-inputgroup-${item.id}`, menuItems,dropDownMenuOptions);
      }
    } 
    if(item.type=="multipanel" || item.type=="panel"){
      //headergroup
      input=sb_item_sheet_get_input(html, 'headergroup', item.type);
      if (input != null && input.length > 0) {  
        let menuItems=[];
        menuItems = sb_item_sheet_dropdown_add_editor(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].HEADERGROUP,item); 
        menuItems = sb_item_sheet_dropdown_add_autogenerate(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].HEADERGROUP,item);
        menuItems = sb_item_sheet_add_separator(menuItems);
        menuItems = sb_item_sheet_dropdown_add_copy_input_as_css_menuitems(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].HEADERGROUP); 
        menuItems = sb_item_sheet_add_separator(menuItems);
        menuItems = sb_item_sheet_dropdown_add_default_menuitems(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].HEADERGROUP);  
        new DropDownMenu(html, `#sb-itemsheet-helper-dropdown-headergroup-${item.id}`, menuItems,dropDownMenuOptions);
      }
    }
    
    //
    if(item.type=="multipanel" || item.type=="panel" || item.type=="sheettab"){
      //visibleif
      input=sb_item_sheet_get_input(html, 'visibleif', item.type);
      if (input != null && input.length > 0) {  
        let menuItems=[];
        menuItems = sb_item_sheet_dropdown_add_editor(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].VISIBLEIF,item);   
        menuItems = sb_item_sheet_add_separator(menuItems);
        menuItems = sb_item_sheet_dropdown_add_default_menuitems(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].VISIBLEIF);  
        new DropDownMenu(html, `#sb-itemsheet-helper-dropdown-visibleif-${item.id}`, menuItems,dropDownMenuOptions);
      }
    }
    if(item.type=="multipanel" || item.type=="panel" || item.type=="sheettab"){
      //visiblevalue
      input=sb_item_sheet_get_input(html, 'visiblevalue', item.type);
      if (input != null && input.length > 0) {  
        let menuItems=[];
        menuItems = sb_item_sheet_dropdown_add_editor(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].VISIBLEVALUE,item);   
        menuItems = sb_item_sheet_add_separator(menuItems);
        menuItems = sb_item_sheet_dropdown_add_default_menuitems(html,menuItems,ITEMATTRIBUTE[item.type.toUpperCase()].VISIBLEVALUE);  
        new DropDownMenu(html, `#sb-itemsheet-helper-dropdown-visiblevalue-${item.id}`, menuItems,dropDownMenuOptions);
      }
    }
    
    
  } catch(err){
    console.error("Sandbox | ItemSheetHelpers |" + err);
  }
}

function sb_item_sheet_dropdown_add_validate(html,menu,oAttribute,item){
  let returnMenu;
  let menuItems=[
      {
        name: "Validate",
        icon: "<i class='fas fa-spell-check fa-fw'></i>",  
        tooltip:"Validate ",
        condition:true,
        callback: () => {
          sb_item_sheet_validate_input(html, oAttribute,item.type, item.id);
        }
      }    
    ];
    // add default menu items to  with supplied menu
    returnMenu= menu.concat(menuItems);
    return returnMenu;
}

function sb_item_sheet_dropdown_add_search(html,menu,oAttribute,item){
  let returnMenu;
  let menuItems=[
      {
        name: "Search",
        icon: "<i class='fas fa-magnifying-glass fa-fw'></i>",  
        tooltip:"Search for references to this key ",
        condition:true,
        callback: () => {
          //sb_item_sheet_validate_input(html, oAttribute,item.type, item.id);
          let elementInput=sb_item_sheet_get_input(html,'key',item.type);
          if (elementInput!=null && elementInput.length>0){   
            let sKey=elementInput[0].value; 
            //sb_item_sheet_validate_key(validatingitemtype,itemName,itemid,typeClass,sKey,enforcedvalidation);
            let f = new SandboxSearchForm({search_for:sKey});
            f.render(true,{focus:true});  
          }
          
        }
      }    
    ];
    // add default menu items to  with supplied menu
    returnMenu= menu.concat(menuItems);
    return returnMenu;
}

function sb_item_sheet_dropdown_add_autogenerate(html,menu,oAttribute,item){
  let returnMenu;
  let menuItems=[
      {
        name: "Auto generate",
        icon: "<i class='fas fa-wand-magic-sparkles fa-fw'></i>",  
        tooltip:"Auto generate ",
        condition:true,
        callback: () => {
          sb_item_sheet_autogenerate_input(html, oAttribute, item.type);
        }
      }    
    ];
    // add default menu items to  with supplied menu
    returnMenu= menu.concat(menuItems);
    return returnMenu;
}

function sb_item_sheet_dropdown_add_autogenerate_property_icon(html,menu,oAttribute,item){
  let returnMenu;
  let menuItems=[
      {
        name: "Autogenerate icon",
        icon: "<i class='fas fa-wand-magic-sparkles fa-fw'></i>",  
        tooltip:"Update property icon based on datatype",
        condition:true,
        callback: () => {
          sb_item_sheet_autogenerate_icon(html,item);
        }
      },
      {
        name: "Reset icon",
        icon: "<i class='fas fa-rotate-left fa-fw'></i>",  
        tooltip:"Reset property icon to Sandbox defaulte",
        condition:true,
        callback: () => {
          sb_item_sheet_autogenerate_icon(html,item,true);
        }
      }
    ];
    // add default menu items to  with supplied menu
    returnMenu= menu.concat(menuItems);
    return returnMenu;
}

function sb_item_sheet_dropdown_add_editor(html,menu,oAttribute,item,index=null){
  let returnMenu;
  let menuItems=[
      {
        name: "Edit...",
        icon: "<i class='fas fa-code fa-fw'></i>",
        tooltip:"Open Expression editor",
        condition:true,
        callback: () => {
          sb_item_sheet_edit_input(html,oAttribute,item.type,item.id,item.system.datatype,false,index);
        }
      }    
    ];
    // add default menu items to  with supplied menu
    returnMenu= menu.concat(menuItems);
    return returnMenu;
}

function sb_item_sheet_dropdown_add_filter(html,menu,oAttribute,item){
  let returnMenu;
  let menuItems=[
      {
        name: "Filter...",
        icon: "<i class='fas fa-filter fa-fw'></i>",
        tooltip:"Open Filter editor",
        condition:true,
        callback: () => {
          sb_item_sheet_edit_input(html,oAttribute,item.type,item.id,item.system.datatype,true);
        }
      }    
    ];
    // add default menu items to  with supplied menu
    returnMenu= menu.concat(menuItems);
    return returnMenu;
}

function sb_item_sheet_dropdown_add_lookuptable(html,menu,oAttribute,item){
  let returnMenu;
  let menuItems=[
      {
        name: "Table Editor...",
        icon: "<i class='fas fa-table fa-fw'></i>",
        tooltip:"Open Lookup Table editor",
        condition:true,
        callback: () => {
        //sb_item_sheet_edit_input(html,oAttribute,typeClass,itemid,propertydatatype='',OPTION_USE_TABLE_FILTERS=false){
          sb_item_sheet_edit_input(html,oAttribute,item.type,item.id,'lookuptable',true);
        }
      }    
    ];
    // add default menu items to  with supplied menu
    returnMenu= menu.concat(menuItems);
    return returnMenu;
}



function sb_item_sheet_dropdown_add_icon_picker(html,menu,oAttribute,item){
  let returnMenu;
  let menuItems=[
      {
        name: "Icon Picker...",
        icon: "<i class='fas fa-file-upload fa-fw'></i>",
        tooltip:"Open Icon Picker",
        condition:true,
        callback:async () => {
          //sb_item_sheet_edit_input(html,oAttribute,item.type,item.id,item.system.datatype,false);
          let api=game.system.api;
          let selectedicon = await api.fontAwesomeIconPicker(item.system.icon);
          if(selectedicon!=''){
            //debugger;
            let target = html.find(ITEMATTRIBUTE[item.type.toUpperCase()][oAttribute.ATTRIBUTE.toUpperCase()].IDENTIFIER);
            if (target!=null && target.length>0){
              target[0].value=selectedicon;
              // trigger onchange event
              const event = new Event('change', { bubbles: true });  
              target[0].dispatchEvent(event);
            }
          }
        }
      }    
    ];
    // add default menu items to  with supplied menu
    returnMenu= menu.concat(menuItems);
    return returnMenu;
}

function sb_item_sheet_add_separator(menu) {
  let returnMenu;
  let defaultMenuItems = [
    {
      separator:true     
    }
  ];
  // add default menu items to  with supplied menu
  returnMenu = menu.concat(defaultMenuItems);
  return returnMenu;
}

function sb_item_sheet_dropdown_add_copy_property_as_menuitems(html,menu,oAttribute){
  let returnMenu;
  let defaultMenuItems=[
      {
        name: "Copy as actor",
        icon: `<i class='fas fa-at fa-fw'></i>`,
        tooltip:"Copy Key as actor property(@{key})",
        condition:true,
        callback: () => {
          sb_item_sheet_copy_input_as_actor_property(html,oAttribute);
        }
      },
      {
        name: "Copy as cItem",
        icon: `<i class='fas fa-hashtag fa-fw'></i>`,
        tooltip:"Copy Key as cItem property(#{key})",
        condition:true,
        callback: () => {
          sb_item_sheet_copy_input_as_citem_property(html,oAttribute);
        }
      },
      {
        name: "Copy as dialog",
        icon: `<i class="icon-d"></i>`,
        tooltip:"Copy Key as dialog property(d{key})",
        condition:true,
        callback: () => {
          sb_item_sheet_copy_input_as_dialog_property(html,oAttribute);
        }
      }
      
    ];
    // add default menu items to  with supplied menu
    returnMenu= menu.concat(defaultMenuItems);
    return returnMenu;
}
//
function sb_item_sheet_dropdown_add_copy_input_as_css_menuitems(html,menu,oAttribute){
  let returnMenu;
  let defaultMenuItems=[
      {
        name: "Copy as CSS",
        icon: `<i class='fab fa-css3-alt fa-fw'></i>`,
        tooltip:"Copy as CSS Rule Set",
        condition:true,
        callback: () => {
          sb_item_sheet_copy_input_as_css(html,oAttribute);
        }
      }
      
    ];
    // add default menu items to  with supplied menu
    returnMenu= menu.concat(defaultMenuItems);
    return returnMenu;
}

function sb_item_sheet_dropdown_add_casing_menuitems(html,menu,oAttribute){
  let returnMenu;
  let defaultMenuItems=[
      {
        name: "UPPER CASE",
        icon: `<i class="icon-uppercase"></i>`,
        tooltip:"Change to upper case",
        condition:true,
        callback: () => {
          sb_item_sheet_changecase_input(html,oAttribute,stringCasing.CASING.CASE.UPPERCASE); 
        }
      },
      {
        name: "lower case",
        icon: `<i class="icon-lowercase"></i>`,
        tooltip:"Change to lower case",
        condition:true,
        callback: () => {
          sb_item_sheet_changecase_input(html,oAttribute,stringCasing.CASING.CASE.LOWERCASE);
        }
      },
      {
        name: "Title Case",
        icon: `<i class='fas fa-font-case fa-fw'></i>`,        
        tooltip:"Change to title case",
        condition:true,
        callback: () => {
          sb_item_sheet_changecase_input(html,oAttribute,stringCasing.CASING.CASE.TITLECASE);
        }
      }
    ];
    // add default menu items to  with supplied menu
    returnMenu= menu.concat(defaultMenuItems);
    return returnMenu;
}

function sb_item_sheet_dropdown_add_default_menuitems(html, menu, oAttribute, index = null) {
  let returnMenu;
  let defaultMenuItems = [
    {
      name: "Cut",
      icon: "<i class='fas fa-cut fa-fw'></i>",
      tooltip: "Cut to Clipboard",
      condition: true,
      callback: () => {
        sb_item_sheet_cut_input(html, oAttribute, '', '', index);
      }
    },
    {
      name: "Copy",
      icon: "<i class='fas fa-copy fa-fw'></i>",
      tooltip: "Copy to Clipboard",
      condition: true,
      callback: () => {
        sb_item_sheet_copy_input(html, oAttribute, '', '', index);
      }
    },
    {
      name: "Paste",
      icon: "<i class='fas fa-paste fa-fw'></i>",
      tooltip: "Paste from Clipboard",
      condition: true,
      callback: () => {
        sb_item_sheet_paste_input(html, oAttribute, index);
      }
    },
    {
      separator: true
    },
    {
      name: "Clear",
      icon: "<i class='fas fa-times-circle fa-fw'></i>",
      tooltip: "Clear input",
      condition: true,
      callback: () => {
        sb_item_sheet_clear_input(html, oAttribute.IDENTIFIER, true, index);
      }
    }
  ];
  // add default menu items to  with supplied menu
  returnMenu = menu.concat(defaultMenuItems);
  return returnMenu;
}

function sb_item_sheet_get_input(html,sAttribute,sTypeClass,index=null){ 
    let objInput=null; 
    let sIdentifier= ITEMATTRIBUTE[sTypeClass.toUpperCase()][sAttribute.toUpperCase()].IDENTIFIER;
    if(index!=null){
      sIdentifier=sIdentifier.replaceAll('{index}',index);
    }
    objInput = html.find(`${sIdentifier}`);
    return objInput;
  }
  
async function sb_item_sheet_cut_input(html,oAttribute,sPrefix='',sSuffix='',index=null){ 
  let elementInput= null;
  let sIdentifier=oAttribute.IDENTIFIER;
  if(index!=null){
      sIdentifier=sIdentifier.replaceAll('{index}',index);
    }
  let sValue='';
  elementInput= html.find(`${sIdentifier}`);
  if (elementInput!=null && elementInput.length>0){
    sValue=elementInput[0].value;
    if (sValue.length>0){     
      let sEnclosed=sPrefix + sValue + sSuffix;
      await navigator.clipboard.writeText(sEnclosed);
      // and empty it
      elementInput[0].value= '';
      // trigger onchange event
      const event = new Event('change', { bubbles: true });  
      elementInput[0].dispatchEvent(event);
      ui.notifications.info(oAttribute.CAPTION +" cut to Clipboard as ["+ sEnclosed +"]");
    }
    else{
      ui.notifications.warn(oAttribute.CAPTION +" not cut to Clipboard(empty string)");
    }
  }                                                            
}

function sb_item_sheet_copy_input(html,oAttribute,sPrefix='',sSuffix='',index=null){ 
  let elementInput= null;
  let sIdentifier=oAttribute.IDENTIFIER;
  if(index!=null){
      sIdentifier=sIdentifier.replaceAll('{index}',index);
    }
  let sValue='';
  elementInput= html.find(`${sIdentifier}`);
  if (elementInput!=null && elementInput.length>0){
    sValue=elementInput[0].value;
    if (sValue.length>0){     
      let sEnclosed=sPrefix + sValue + sSuffix;
      navigator.clipboard.writeText(sEnclosed);     
      ui.notifications.info(oAttribute.CAPTION +" copied to Clipboard as ["+ sEnclosed +"]");
    }
    else{
      ui.notifications.warn(oAttribute.CAPTION +" not copied to Clipboard(empty string)");
    }
  }                                                            
}

function sb_item_sheet_copy_input_as_css(html,oAttribute){ 
  sb_item_sheet_copy_input(html,oAttribute,'.sandbox.sheet .','{\n}');                                                           
} 

function sb_item_sheet_copy_input_as_actor_property(html,oAttribute){ 
  sb_item_sheet_copy_input(html,oAttribute,'@{','}');                                                           
}                           

function sb_item_sheet_copy_input_as_citem_property(html,oAttribute){ 
  sb_item_sheet_copy_input(html,oAttribute,'#{','}');                                                           
} 

function sb_item_sheet_copy_input_as_dialog_property(html,oAttribute){ 
  sb_item_sheet_copy_input(html,oAttribute,'d{','}');                                                           
}

function sb_item_sheet_paste_input(html,oAttribute,index=null){
navigator.clipboard.readText()
  .then(text => {
    // `text` contains the text read from the clipboard          
    let elementInput= null;                    
    let sIdentifier=oAttribute.IDENTIFIER;
    if(index!=null){
      sIdentifier=sIdentifier.replaceAll('{index}',index);
    }
    elementInput= html.find(`${sIdentifier}`);
    if (elementInput!=null && elementInput.length>0){
      elementInput[0].value= text;
      // trigger onchange event
      const event = new Event('change', { bubbles: true });  
      elementInput[0].dispatchEvent(event); 
    } 
  })
  .catch(err => {
    // maybe user didn't grant access to read from clipboard
    ui.notifications.warn('Error when attempting to paste to ' + oAttribute.CAPTION,err);
  });            
}
  
function sb_item_sheet_clear_input(html,sIdentifier,triggeronchange=true,index=null){  
  let elementInput= null;
  if(index!=null){
      sIdentifier=sIdentifier.replaceAll('{index}',index);
    }
  elementInput= html.find(`${sIdentifier}`);
  if (elementInput!=null && elementInput.length>0){
    switch (sIdentifier){
      case ITEMATTRIBUTE.LOOKUP.LOOKUPTABLE.IDENTIFIER:
        elementInput[0].value= '{"columns":["Range Low","Range High"],"rows":[]}'; 
        break;
      default:
        elementInput[0].value= ''; 
        break;
    }
    
    if(triggeronchange){
      // trigger onchange event
      const event = new Event('change', { bubbles: true });       
      elementInput[0].dispatchEvent(event); 
    }
  }
}
  
async function sb_item_sheet_edit_input(html,oAttribute,typeClass,itemid,propertydatatype='',OPTION_USE_TABLE_FILTERS=false,index=null){
  let sExpression=sb_item_sheet_get_input(html,oAttribute.ATTRIBUTE,typeClass,index)[0].value;
  let itemName=sb_item_sheet_get_input(html,'name','ITEM')[0].value;
  let itemtargetelement=ITEMATTRIBUTE[typeClass.toUpperCase()][oAttribute.ATTRIBUTE.toUpperCase()].IDENTIFIER; 
  if(index!=null){
      itemtargetelement=itemtargetelement.replaceAll('{index}',index);
    }
  let options = {
      expression: sExpression,
      itemid: itemid,
      itemname:itemName,
      itemtype:typeClass.toLowerCase(),
      itemlabel:oAttribute.CAPTION,
      itemtargetelement:itemtargetelement,
      itemlinebreaker:oAttribute.LINEBREAKER
    }; 
  // check if this is a table filter
  if(propertydatatype=='table' && typeClass.toLowerCase()=='property' && OPTION_USE_TABLE_FILTERS){      
    let bOkToProceed=true;
    // check if any content/filter exists
    if (sExpression.length>0){
      // check if valid filter
      if (sb_string_is_valid_table_filter(sExpression)==null){
        // ask user open table filter editor anyway(empty)
        bOkToProceed=await sb_custom_dialog_confirm('Warning - Invalid Table Filter','This filter <br><div class="sb-code-block-container"><p class="sb-code-block-content">'+sExpression+'</p></div><br> is invalid, the table filter editor will display it as empty.<br>Do you want to proceed?<br>' );              
      }
    }

    if(bOkToProceed){
      new SandboxTableFilterEditorForm(options).render(true,{focus:true}); 
    }
  } else if(propertydatatype=='lookuptable' && typeClass.toLowerCase()=='lookup'){
    let bOkToProceed=true;
    // check if any content/filter exists
    if (sExpression.length>0){
      // check if valid filter
      if (sb_string_is_valid_lookup_table(sExpression)==''){
        // ask user open table filter editor anyway(empty)
        bOkToProceed=await sb_custom_dialog_confirm('Warning - Invalid Lookup Table','This lookup table <br><div class="sb-code-block-container"><p class="sb-code-block-content">'+sExpression+'</p></div><br> is invalid, the lookup table editor will display it as empty.<br>Do you want to proceed?<br>' );              
      }
    }

    if(bOkToProceed){
      new SandboxLookupTableEditorForm(options).render(true,{focus:true}); 
    }
  } else{
    new SandboxExpressionEditorForm(options).render(true,{focus:true}); 
  }
}
 
function sb_item_sheet_changecase_input(html,oAttribute,casetype){ 
  let elementInput= null;
  let sIdentifier=oAttribute.IDENTIFIER;
  let sValue='';
  let sNewValue='';
  elementInput= html.find(`${sIdentifier}`);
  if (elementInput!=null && elementInput.length>0){
    sValue=elementInput[0].value;
    if (sValue.length>0){     
      switch(casetype){
        case stringCasing.CASING.CASE.UPPERCASE:
          sNewValue=sValue.toUpperCase();
          break;
        case stringCasing.CASING.CASE.LOWERCASE:
          sNewValue=sValue.toLowerCase();
          break;
        case stringCasing.CASING.CASE.TITLECASE:
          sNewValue=stringCasing.stringToTitleCase(sValue);
          break;
      }
      if (sValue != sNewValue){
        // and change it
        elementInput[0].value=sNewValue ;
        // trigger onchange event
        const event = new Event('change', { bubbles: true });  
        elementInput[0].dispatchEvent(event);
      }
    }

  }                                                            
}



async function sb_item_sheet_autogenerate_input(html,oAttribute,typeClass,triggeronchange=true){ 
    let sKey='';
    let key_prefix='';
    let key_prefix_setting='';  
    let autogenerated='N/A';    
    let full_prefix=''; 
    let sItemName='';
    let sBase='';    
    
    const key_separator=stringCasing.CASING.SEPARATOR.KEY; 
    const css_separator=stringCasing.CASING.SEPARATOR.CSS;
    const keyCase=stringCasing.CASING.CASENR[sb_item_sheet_get_game_setting("sandbox", SETTINGATTRIBUTE.OPTION_KEY_CONVERT_TO_CASE.ID)];
    const cssCase=stringCasing.CASING.CASENR[sb_item_sheet_get_game_setting("sandbox", SETTINGATTRIBUTE.OPTION_CSS_CONVERT_TO_CASE.ID)];
    const useprefixsuffix=sb_item_sheet_get_game_setting("sandbox", SETTINGATTRIBUTE.OPTION_USE_PREFIX_SUFFIX.ID);
    const OPTION_CONFIRM_ATTRIBUTE_OVERWRITE=sb_item_sheet_get_game_setting("sandbox", SETTINGATTRIBUTE.OPTION_CONFIRM_ATTRIBUTE_OVERWRITE.ID);
    const itemName=sb_item_sheet_get_input(html,'name','ITEM')[0].value;
    if(useprefixsuffix){
      switch(typeClass.toUpperCase()) {
        case 'PROPERTY':
          // check if to use datatype as prefix
          const usedatatype=sb_item_sheet_get_game_setting("sandbox", SETTINGATTRIBUTE.OPTION_USE_DATATYPE_PREFIX.ID);
          if(usedatatype==false){
            key_prefix_setting=SETTINGATTRIBUTE.PREFIX_PROPERTY.ID;
          }
          else{
            // get the datatype
            const datatype=sb_item_sheet_get_input(html,ITEMATTRIBUTE.PROPERTY.DATATYPE.ATTRIBUTE,'PROPERTY')[0].value;
            switch (datatype) {
              case 'simpletext':
                key_prefix_setting = SETTINGATTRIBUTE.PREFIX_PROPERTY_SIMPLETEXT.ID;
                break;
              case 'simplenumeric':
                key_prefix_setting = SETTINGATTRIBUTE.PREFIX_PROPERTY_SIMPLENUMERIC.ID;
                break;
              case 'checkbox':
                key_prefix_setting = SETTINGATTRIBUTE.PREFIX_PROPERTY_CHECKBOX.ID;
                break;
              case 'radio':
                key_prefix_setting = SETTINGATTRIBUTE.PREFIX_PROPERTY_RADIO.ID;
                break;
              case 'textarea':
                key_prefix_setting = SETTINGATTRIBUTE.PREFIX_PROPERTY_TEXTAREA.ID;
                break;
              case 'list':
                key_prefix_setting = SETTINGATTRIBUTE.PREFIX_PROPERTY_LIST.ID;
                break;
              case 'label':
                key_prefix_setting = SETTINGATTRIBUTE.PREFIX_PROPERTY_LABEL.ID;
                break;
              case 'badge':
                key_prefix_setting = SETTINGATTRIBUTE.PREFIX_PROPERTY_BADGE.ID;
                break;
              case 'table':
                key_prefix_setting = SETTINGATTRIBUTE.PREFIX_PROPERTY_TABLE.ID;
                break;
              case 'button':
                key_prefix_setting = SETTINGATTRIBUTE.PREFIX_PROPERTY_BUTTON.ID;
                break;
            }
          }
          break;
        case "MULTIPANEL":
          key_prefix_setting=SETTINGATTRIBUTE.PREFIX_MULTIPANEL.ID;
          break; 
        case "PANEL":
          key_prefix_setting=SETTINGATTRIBUTE.PREFIX_PANEL.ID;
          break; 
        case "SHEETTAB":
          key_prefix_setting=SETTINGATTRIBUTE.PREFIX_TAB.ID;
          break; 
        case "GROUP":
          key_prefix_setting=SETTINGATTRIBUTE.PREFIX_GROUP.ID;
          break;   
        case "LOOKUP":
          key_prefix_setting=SETTINGATTRIBUTE.PREFIX_LOOKUP.ID;
          break;   
        case "cITEM":            
          break;  
        default:
          break;            
      }         
      if(key_prefix_setting.length>0){
        key_prefix = sb_item_sheet_get_game_setting("sandbox",key_prefix_setting);
      } 
    }
    switch(oAttribute.ATTRIBUTE){
      case 'key':        
        // check if itemname already begins with prefix then dont add it                                                           
        if (key_prefix!=''){        
          full_prefix=key_prefix + key_separator;
          if(itemName.toUpperCase().startsWith(full_prefix.toUpperCase())){
            sKey=itemName;
          }
          else{
            sKey=full_prefix +  itemName;
          }
        }
        else{
          sKey=itemName;
        }                                                          
        sKey=sb_item_sheet_to_slug(sKey,key_separator,keyCase); 
        autogenerated=sKey;                   
        break;
      case 'tag':                                            
        full_prefix=key_prefix + key_separator;              
        if(itemName.toUpperCase().startsWith(full_prefix.toUpperCase())){
          // get rid of prefix
          sItemName=itemName.slice(full_prefix.length);
        }
        else{
          sItemName= itemName;
        }                       
        autogenerated= sItemName; 
        break;
      case 'tooltip':         
        full_prefix=key_prefix + key_separator;
        sItemName='';       
        if(itemName.toUpperCase().startsWith(full_prefix.toUpperCase())){
          // get rid of prefix
          sItemName=itemName.slice(full_prefix.length);
        }
        else{
          sItemName= itemName;
        }             
        autogenerated= sItemName;
        break;
      case 'rollname':         
        if (typeClass.toUpperCase()=='PROPERTY'){            
          sBase=itemName;
        } 
        else if(typeClass.toUpperCase()=='CITEM'){   
          sBase='#{name}';
        }
        else{
          sBase=itemName;
        } 
        let suffix_rollname='';        
        if(useprefixsuffix){
          suffix_rollname=' ' + sb_item_sheet_get_game_setting("sandbox", SETTINGATTRIBUTE.SUFFIX_ROLLNAME.ID);           
        }
        autogenerated= sBase +  suffix_rollname; 
        break;      
      case 'rollid':
        if (typeClass.toUpperCase()=='PROPERTY'){       
            sBase=html.find(`${ITEMATTRIBUTE.PROPERTY.KEY.IDENTIFIER}`)[0].value;
          }
        else{
          sBase=itemName;
        }  
        let suffix_rollid='';
        if(useprefixsuffix){
          suffix_rollid=key_separator + sb_item_sheet_get_game_setting("sandbox", SETTINGATTRIBUTE.SUFFIX_ROLLID.ID);    
        }
        let sRollID=sBase +  suffix_rollid;                                                                         
        autogenerated= sb_item_sheet_to_slug(sRollID,key_separator,keyCase);
        break;
      case 'fontgroup':         
        sKey=sb_item_sheet_get_input(html,'key',typeClass)[0].value;
        let suffix_fontgroup='';
        if(useprefixsuffix){
          suffix_fontgroup=css_separator + sb_item_sheet_get_game_setting("sandbox", SETTINGATTRIBUTE.SUFFIX_FONTGROUP.ID);    
        }
        let sFontGroup=sKey +  suffix_fontgroup;                 
        autogenerated=sb_item_sheet_sanitize_css( sb_item_sheet_to_slug(sFontGroup,css_separator,cssCase));
        break; 
      case 'inputgroup':         
        sKey=sb_item_sheet_get_input(html,'key',typeClass)[0].value; 
        let suffix_inputgroup='';
        if(useprefixsuffix){
          suffix_inputgroup=css_separator + sb_item_sheet_get_game_setting("sandbox", SETTINGATTRIBUTE.SUFFIX_INPUTGROUP.ID);      
        }        
        let sInputGroup=sb_item_sheet_sanitize_css( sb_item_sheet_to_slug(sKey +  suffix_inputgroup,css_separator,cssCase)); 
//        if (typeClass.toUpperCase()=='PROPERTY'){ 
//          const datatype = sb_item_sheet_get_input(html, ITEMATTRIBUTE.PROPERTY.DATATYPE.ATTRIBUTE, 'PROPERTY')[0].value;
//        
//          sInputGroup+= ' ' + sb_item_sheet_sanitize_css( sb_item_sheet_to_slug('sandbox-property-data-type-' + datatype,css_separator,cssCase));
//        }
        autogenerated=sInputGroup; 
        break;
      case 'headergroup':         
        sKey=sb_item_sheet_get_input(html,'key',typeClass)[0].value; 
        let suffix_headergroup='';
        if(useprefixsuffix){
          suffix_headergroup=css_separator + sb_item_sheet_get_game_setting("sandbox", SETTINGATTRIBUTE.SUFFIX_HEADERGROUP.ID);     
        }
        let sHeaderGroup=sKey +  suffix_headergroup;                                                                        
        autogenerated= sb_item_sheet_sanitize_css(sb_item_sheet_to_slug(sHeaderGroup,css_separator,cssCase)); 
        break;
      default:
        break;
    }
    let elementInput= null;
    let sIdentifier=oAttribute.IDENTIFIER;
    elementInput= html.find(`${sIdentifier}`);
    if (elementInput!=null && elementInput.length>0){
      // check if have content 
      // OPTION_CONFIRM_ATTRIBUTE_OVERWRITE
      let bOkToProceed=true;
      if (elementInput[0].value.length>0 && OPTION_CONFIRM_ATTRIBUTE_OVERWRITE && (elementInput[0].value != autogenerated)){
        bOkToProceed=await sb_custom_dialog_confirm('Confirm Autogenerate',`The autogenerated data for attribute "${oAttribute.CAPTION}" is different than existing data, do you want to overwrite?<br><br> To avoid this confirmation dialog, you can change <b>Confirm attribute overwrite</b> in Settings` );
      }
      if(bOkToProceed && elementInput[0].value != autogenerated){
        elementInput[0].value= autogenerated;
        if(triggeronchange){
          // trigger onchange event
          const event = new Event('change', { bubbles: true });       
          elementInput[0].dispatchEvent(event); 
        }
      }
    }     
  }
  
async function sb_item_sheet_autogenerate_all(item,html,typeClass){
  let bOkToProceed=true;  
  const bRequireConfirmation=sb_item_sheet_get_game_setting("sandbox", SETTINGATTRIBUTE.OPTION_CONFIRM_BATCH_OVERWRITE.ID);
  if (bRequireConfirmation){
      bOkToProceed=await sb_custom_dialog_confirm('Confirm Autogenerate All','This will overwrite fields with <b>Autogenerate</b> option, do you want to proceed?<br><br> To avoid this confirmation dialog, you can change <b>Confirm batch overwrite</b> in Settings' );
  }
    if (bOkToProceed){                 
      switch(typeClass.toUpperCase()) {     
        case 'PROPERTY':
          const datatype = sb_item_sheet_get_input(html, ITEMATTRIBUTE.PROPERTY.DATATYPE.ATTRIBUTE, 'PROPERTY')[0].value;
           sb_item_sheet_autogenerate_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].KEY,typeClass,false);
           sb_item_sheet_autogenerate_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].TAG,typeClass,false);          
           sb_item_sheet_autogenerate_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].TOOLTIP,typeClass,false);          
           sb_item_sheet_autogenerate_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].FONTGROUP,typeClass,false);
           sb_item_sheet_autogenerate_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].INPUTGROUP,typeClass,false);  
           sb_item_sheet_autogenerate_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].ROLLNAME,typeClass,false);
           sb_item_sheet_autogenerate_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].ROLLID,typeClass,false); 
           sb_item_sheet_autogenerate_icon(html,item);
          break;
        case "MULTIPANEL":
           sb_item_sheet_autogenerate_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].KEY,typeClass,false);
           sb_item_sheet_autogenerate_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].TAG,typeClass,false);
           sb_item_sheet_autogenerate_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].HEADERGROUP,typeClass,false);
          break; 
        case "PANEL":
           sb_item_sheet_autogenerate_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].KEY,typeClass,false);
           sb_item_sheet_autogenerate_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].TAG,typeClass,false);
           sb_item_sheet_autogenerate_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].FONTGROUP,typeClass,false);
           sb_item_sheet_autogenerate_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].INPUTGROUP,typeClass,false);
           sb_item_sheet_autogenerate_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].HEADERGROUP,typeClass,false);
          break; 
        case "SHEETTAB":
           sb_item_sheet_autogenerate_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].KEY,typeClass,false);
           sb_item_sheet_autogenerate_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].TAG,typeClass,false);
          break; 
        case "GROUP":
           sb_item_sheet_autogenerate_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].KEY,typeClass,false);
          break;   
        case "LOOKUP":
           sb_item_sheet_autogenerate_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].KEY,typeClass,false);
          break; 
        case "CITEM": 
           sb_item_sheet_autogenerate_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].ROLLNAME,typeClass,false);
           sb_item_sheet_autogenerate_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].ROLLID,typeClass,false); 
          break;  
        default:
          break;            
      }
      // trigger onsubmit event                
      item.sheet.submit();

    }
}
 
async function sb_item_sheet_clear_all(item,html,typeClass){
  let bOkToProceed=true;  
  const bRequireConfirmation=sb_item_sheet_get_game_setting("sandbox", SETTINGATTRIBUTE.OPTION_CONFIRM_BATCH_OVERWRITE.ID);
  if (bRequireConfirmation){
    bOkToProceed=await sb_custom_dialog_confirm('Confirm Clear All','This will overwrite fields with <b>Clear</b> option, do you want to proceed?<br><br> To avoid this confirmation dialog, you can change <b>Confirm batch overwrite</b> in Settings' );
  }
  if (bOkToProceed){
    switch(typeClass.toUpperCase()) {    
      case 'PROPERTY':
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].KEY.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].TAG.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].TOOLTIP.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].TABLEFILTER.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].FONTGROUP.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].INPUTGROUP.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].ROLLEXP.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].ROLLNAME.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].ROLLID.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].AUTO.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].AUTOMAX.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].DEFAULT.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].CHECKGROUP.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].LIST.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].LISTAUTO.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].CHECKEDPATH.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].UNCHECKEDPATH.IDENTIFIER,false);
        break;
      case "MULTIPANEL":
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].KEY.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].TAG.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].HEADERGROUP.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].VISIBLEIF.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].VISIBLEVALUE.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].VISIBLEOPERATOR.IDENTIFIER,false); 
        break; 
      case "PANEL":
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].KEY.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].TAG.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].FONTGROUP.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].INPUTGROUP.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].HEADERGROUP.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].VISIBLEIF.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].VISIBLEVALUE.IDENTIFIER,false); 
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].VISIBLEOPERATOR.IDENTIFIER,false); 
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].IMAGEPATH.IDENTIFIER,false);
        break; 
      case "SHEETTAB":
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].KEY.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].TAG.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].VISIBLEIF.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].VISIBLEVALUE.IDENTIFIER,false); 
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].VISIBLEOPERATOR.IDENTIFIER,false); 
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].CONTROL.IDENTIFIER,false); 
        break; 
      case "GROUP":
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].KEY.IDENTIFIER,false);
        break;   
      case "LOOKUP":
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].KEY.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].LOOKUPTABLE.IDENTIFIER,false);
        break; 
      case "CITEM": 
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].ROLLEXP.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].ROLLNAME.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].ROLLID.IDENTIFIER,false);
        sb_item_sheet_clear_input(html,ITEMATTRIBUTE[typeClass.toUpperCase()].ICONPATH.IDENTIFIER,false);
        break;  
      default:
        break;            
    }
    // trigger onsubmit event
    item.sheet.submit();
  }
}
  

function sb_item_sheet_sanitize_css(scss) {
  // /^[0-9]|^-([0-9])/gu  fill find string starting with a number OR 1 hyphen followed by number 
  let sreturn = scss;
  // CSS class name cannot start with a number 
  if (/^[0-9]/gu.test(sreturn)) {
    // add two hyphens
    sreturn = '--' + sreturn;
  }
  // or a single hyphen followed by a digit
  if(/^-([0-9])/gu.test(sreturn)){
    sreturn = '-' + sreturn;
  }
  return sreturn;
}

function sb_item_sheet_to_slug(text,separator,useCase=stringCasing.CASING.CASE.NONE){
  let sReturn=text;
  const transliteratenonlatin=sb_item_sheet_get_game_setting("sandbox", SETTINGATTRIBUTE.OPTION_TRANSLITERATE_NON_LATIN.ID);
  const enforcedvalidation=sb_item_sheet_get_game_setting("sandbox", SETTINGATTRIBUTE.OPTION_ENFORCED_VALIDATION.ID);
  if(transliteratenonlatin||enforcedvalidation){
    // alphabet transliterations
    sReturn=transliterate(sReturn);
  }

  if(enforcedvalidation){
    sReturn=sReturn.replace(INVALID_KEY_CHARACTERS.ENFORCED, '_'); 
  }
  else{
    sReturn=sReturn.replace(INVALID_KEY_CHARACTERS.DEFAULT, '_');          
  }          
  switch(useCase){
    case stringCasing.CASING.CASE.NONE:
      // no change        
      break;
    case stringCasing.CASING.CASE.LOWERCASE:
      sReturn=sReturn.toLowerCase();
      break;
    case stringCasing.CASING.CASE.UPPERCASE:
       sReturn=sReturn.toUpperCase();
      break;
    case stringCasing.CASING.CASE.TITLECASE:           
        sReturn=sReturn.replaceAll(stringCasing.CASING.SEPARATOR.KEY,' ');
        sReturn=sReturn.replaceAll(stringCasing.CASING.SEPARATOR.CSS,' ');
        sReturn= stringCasing.stringToTitleCase(sReturn);                             
      break;    
  }        
  if(separator==stringCasing.CASING.SEPARATOR.KEY){
    sReturn=sReturn.replaceAll(stringCasing.CASING.SEPARATOR.CSS, separator) ;
  }  
  if(separator==stringCasing.CASING.SEPARATOR.CSS){
    sReturn=sReturn.replaceAll(stringCasing.CASING.SEPARATOR.KEY, separator) ;
  }        
  sReturn=sReturn.replace(/\s+/g, separator) ; 
  sReturn=sReturn.trim();
  return sReturn;
}  

function sb_item_sheet_validate_input(html,oAttribute,typeClass,itemid){  
  const enforcedvalidation=sb_item_sheet_get_game_setting("sandbox", SETTINGATTRIBUTE.OPTION_ENFORCED_VALIDATION.ID);
  const itemName=sb_item_sheet_get_input(html,'name','ITEM')[0].value;                                                    
  let validatingitemtype='';
  switch(typeClass.toUpperCase()) {
    case 'PROPERTY':
      validatingitemtype='property';              
      break;
    case "MULTIPANEL":
      validatingitemtype='multipanel';
      break; 
    case "PANEL":
      validatingitemtype='panel';
      break; 
    case "TAB":
      validatingitemtype='sheettab';
      break; 
    case "GROUP":
      validatingitemtype='group';
      break;
    case "LOOKUP":
      validatingitemtype='lookup';
      break; 
    case "cITEM":            
      break;  
    default:
      break;            
  }         
  let elementInput= null;         
  switch(oAttribute.ATTRIBUTE){
    case 'key':       
      elementInput=sb_item_sheet_get_input(html,'key',typeClass);
      if (elementInput!=null && elementInput.length>0){   
        let sKey=elementInput[0].value; 
        sb_item_sheet_validate_key(validatingitemtype,itemName,itemid,typeClass,sKey,enforcedvalidation);
      }        
      break;
    case 'checkgroup':                  
      elementInput=sb_item_sheet_get_input(html,'checkgroup',typeClass);
      if (elementInput!=null && elementInput.length>0){ 
        let sCheckGroup=elementInput[0].value;                                      
        sb_item_sheet_validate_checkgroup(itemName,sCheckGroup,typeClass);
      } 
      break; 
    case 'list':                
      elementInput=sb_item_sheet_get_input(html,'list',typeClass);
      if (elementInput!=null && elementInput.length>0){  
        let sList=elementInput[0].value;                                    
        sb_item_sheet_validate_list(itemName,sList,typeClass);
      } 
      break;
    case 'filter':
      //

       
      elementInput=sb_item_sheet_get_input(html,'filter',typeClass);
      if (elementInput!=null && elementInput.length>0){  
        let sTooltip=elementInput[0].value;                                    
        sb_item_sheet_validate_table_filter(itemName,sTooltip,typeClass);
      }
      break;
    
    default:
      break;
  }                             
}
//                                                                  
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 
//                                                                  
//                 Item Sheet Validation functions                  
//                                                                  
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 
//                                                                  
  
function sb_item_sheet_validate_table_filter(itemName, tableFilter,typeClass) {  
  let sHeader= 'Table filter validation for ' + typeClass + ' [' + itemName +']';       

  if (tableFilter.length>0 && sb_string_is_valid_table_filter(tableFilter)==null){                                                  
    let msg='Table Filter is invalid';        
    ui.notifications.error(sHeader + ' returned validation error:<br>' + msg);                               
  }     
  else{                     
    ui.notifications.info(sHeader + ' returned valid.' );
  }                                                          
} 

// function for validate check group
function sb_item_sheet_validate_checkgroup(itemName, validatingCheckgroup,typeClass) {  
  let sHeader= 'Check Group validation for ' + typeClass + ' [' + itemName +']';       
  // look for spaces, special characters, only allow semicolons,underscores, hyphens
  let format = /[ `½§£¤!@#$%^&*()+=\[\]{}':"\\|,.<>\/?~]/;
  if (format.test(validatingCheckgroup)){                                                  
    let msg='Check Group contains invalid characters';        
    ui.notifications.error(sHeader + ' returned validation error:<br>' + msg);                               
  }     
  else{                     
    ui.notifications.info(sHeader + ' returned valid.' );
  }                                                          
} 

// function for validate lists
function sb_item_sheet_validate_list(itemName, validatingList,typeClass) {  
  let sHeader= 'Options(a,b,c) validation for ' + typeClass + ' [' + itemName +']'; 
  // lists are a comma separated string example 'Male,Female,A Big Strong Prawn,Other,Non Binary'
  // the imporatnt part are that there are no spaces next to any commas, spaces between words are ok
  // look for spaces next to commas or at start/end of string    
  let format = /\s(\,)|\,\s|(^\s)|(\s$)/g;    
  if (format.test(validatingList)){
    let msg='Options(a,b,c) contains invalid characters(space(s) next to a comma or space(s) at start/end of string)';        
    ui.notifications.error(sHeader + ' returned validation error:<br>' + msg);                               
  }   
  else{                     
    ui.notifications.info(sHeader + ' returned valid.' );
  }                                                          
}

// function for checking if this key is valid
function sb_item_sheet_validate_key(validatingitemtype,itemName, validatingitemid,typeClass,sKey,enforcedvalidation) {  
  let sHeader= 'Key validation for key [' + sKey + '] for ' + typeClass + ' [' + itemName +']'; 
  // use module validate function      
  const  objResult = SandboxKeyValidate(validatingitemtype,validatingitemid,sKey,enforcedvalidation);
  // check for warnings and errors    
  if (objResult.warnings.length>0 || objResult.errors.length>0){    
    objResult.warnings.forEach(function(msg){
      ui.notifications.warn(sHeader + ' returned validation warning:<br>' + msg);      
    });  
     objResult.errors.forEach(function(msg){
      ui.notifications.error(sHeader + ' returned validation error:<br>' + msg);      
    });                   
  }     
  else{                     
    ui.notifications.info(sHeader + ' returned valid.' );
  }                                                          
}
  
async function sb_item_sheet_autogenerate_icon(html,item,usedefault=false){     
  let icondefaultfilename='systems/sandbox/docs/icons/sh_prop_icon.png';  
  // get item id
//  let sheetelementid;
//  // for some updates the return html is a form
//  if (html[0].nodeName == 'FORM') {
//    sheetelementid = html[0].parentElement.parentElement.id;
//  } else {
//    sheetelementid = html[0].id;
//  }
  let itemid=item.id;//sheetelementid.replace('item-','');
  // get the property
  let property=await game.items.get(itemid);        
  if (property!=null){      
    let iconfile='';
    if(usedefault){
      iconfile=icondefaultfilename;
    } else{
      // get datatype        
      const datatype=sb_item_sheet_get_input(html,ITEMATTRIBUTE.PROPERTY.DATATYPE.ATTRIBUTE,'PROPERTY')[0].value;
      let rollable=false;
      switch(datatype){
        case('label'):                                        
        case('checkbox'):
        case('list'):
        case('radio'):
        case('simplenumeric'):
        case('simpletext'):
        case('badge'):
        case('textarea'):
          // check hasroll for item
          rollable=sb_item_sheet_get_input(html,ITEMATTRIBUTE.PROPERTY.ROLLABLE.ATTRIBUTE,'PROPERTY')[0].checked;          
          break;
        case('table'):
        case('button'):                                   
        default:                
          break;
      }
      iconfile = getSandboxItemIconFile('property',datatype,rollable);

    }      
    await property.update({[`img`]: `${iconfile}`});
  }

}



export function getSandboxItemIconFile(itemtype,datatype='',rollable=false){    
    let iconfile='';
    switch(itemtype){
      case "property":
        let iconbasefilename="systems/sandbox/styles/icons/propertytypes/sb_property_";
        let icondefaultfilename='systems/sandbox/docs/icons/sh_prop_icon.png';
        switch(datatype){
          case('label'):                                        
          case('checkbox'):
          case('list'):
          case('radio'):
          case('simplenumeric'):
          case('simpletext'):
          case('badge'):
          case('textarea'):          
            if(rollable){
              iconfile=iconbasefilename + datatype + '_rollable.svg'; 
            } else {
              iconfile=iconbasefilename + datatype + '.svg'; 
            }
            break;
          case('table'):
          case('button'):        
            // assemble file path
            iconfile=iconbasefilename + datatype + '.svg';        
            break;
          case('created'):
            iconfile=iconbasefilename + datatype + '.svg';
            break;
          default:
            // use sb default
            iconfile=icondefaultfilename;       
            break;
        }
        break;
      case "panel":
        iconfile="systems/sandbox/styles/icons/itemtypes/sb_item_panel.svg";
        break;
      case "sheettab":
        iconfile="systems/sandbox/styles/icons/itemtypes/sb_item_sheettab.svg";
        break;
      case "multipanel":
        iconfile="systems/sandbox/styles/icons/itemtypes/sb_item_multipanel.svg";
        break;
      case "group":
        iconfile="systems/sandbox/styles/icons/itemtypes/sb_item_group.svg";
        break;
      case "lookup":
        iconfile="systems/sandbox/styles/icons/itemtypes/sb_item_lookup.svg";
        break;
      case "cItem":
        iconfile="systems/sandbox/styles/icons/itemtypes/sb_item_citem.svg";
        break;
      case "missing":
        iconfile="systems/sandbox/styles/icons/other/sb_missing.svg";        
        break;
      case "mystery-man":
        iconfile="icons/svg/mystery-man.svg";        
        break;
      default:
        iconfile="systems/sandbox/styles/icons/other/sb_unknown.svg";        
        break;
    }
    
    
    return iconfile;
  }
//                                                                  
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 
//                                                                  
//                        Support functions                         
//                                                                  
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 
//
