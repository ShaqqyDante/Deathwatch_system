// -----------------------------------------------
// Export const needs defined in 
//   export const _system_ignore_settings=[];       // array of strings containing settings that should not be displayed
// -----------------------------------------------
import { _system_ignore_settings } from   './sandbox.js';
import { sb_custom_dialog_prompt,
         sb_custom_dialog_confirm} from "./sb-custom-dialogs.js";  

export class SystemSettingsForm extends FormApplication {
  static SystemID='';
  static SystemName='';
  static SystemSettingIgnoreList;
  static initialize() {
    this.SystemID=game.system.id; 
    this.SystemSettingIgnoreList=_system_ignore_settings;
    this.SystemName=game.system.title; 
    console.log('Sandbox | Initialized SystemSettingsForm');
  }   
    
  static get defaultOptions() {
    const defaults = super.defaultOptions;  
    const overrides = {
      height: 'auto',
      id: 'system-settings-form',
      template: `systems/${this.SystemID}/templates/system-settings-form.hbs`,
      title: `Configure System Settings`,
      userId: game.userId,
      closeOnSubmit: false, // do not close when submitted
      submitOnChange: false, // submit when any input changes 
      resizable:true,
      width:600
    };  
    const mergedOptions = foundry.utils.mergeObject(defaults, overrides);    
    return mergedOptions;
  }  
  
  activateListeners(html) {
    super.activateListeners(html);
    html.find('button[name="reset"]').click(this._onResetDefaults.bind(this));
    html.find('button[name="enablealloptions"]').click(this._onEnableAllOptions.bind(this));
    html.find('button[name="disablealloptions"]').click(this._onDisableAllOptions.bind(this));
    html.find('.system-settings-category-toggle').click(this._onToggleCategoryVisibility.bind(this));
    html.find('#system-settings-category-expand-all').click(this._onExpandAllCategories.bind(this));
    html.find('#system-settings-category-collapse-all').click(this._onCollapseAllCategories.bind(this));
    
  }
  
  getData(options) {      
    let data;
    let settings=[];
    let categories=[];
    let category='General';
    let setting; 
    let nsetting;
    let dtype;
    let mapSettings=game.settings.settings;
    
    for(let k of mapSettings.keys()){ 
      let isCheckbox=false;     
      let isRange=false;
      let isSelect=false; 
      let choices;
      let range={"min": 0, "max": 0,"step": 1};
      let filePicker; 
      let filePickerType;
      let type;     
      let ignoreThisSetting=false;
      if (k.split('.')[0]==SystemSettingsForm.SystemID){
      //if(k.toString().startsWith(SystemSettingsForm.SystemID)){                       
        setting=mapSettings.get(k);
        // check if to display this
        if (SystemSettingsForm.SystemSettingIgnoreList.length>0){
          if(SystemSettingsForm.SystemSettingIgnoreList.includes(setting.key)){             
            ignoreThisSetting=true;
          }
        }  
        // check for hidden
        if(setting.hasOwnProperty("hidden")){
          if(setting.hidden==true){
            ignoreThisSetting=true;
          }
        }
        if (!ignoreThisSetting){   
          dtype= setting.type.name;
          if (setting.hasOwnProperty('category')){
            //console.warn(setting.name + ' category:'+ setting.category);
            category=setting.category;
          } else {
            category='GENERAL';
          }
          switch(dtype){          
            case('Number'): 
              type='Number';
              if(setting.hasOwnProperty("range")){
                isRange=true; 
                range.min=setting.range.min;
                range.max=setting.range.max;
                range.step=setting.range.step;
              }
              else{
                isRange=false;
              }
              break;
            case('Boolean'):
              type='Boolean';
              isCheckbox=true;
              break;
            case('String'):  
              type='String';  
              // check for choices 
              if (setting.hasOwnProperty('choices')){
                isSelect=true; 
                choices=setting.choices;
              }  
              if (setting.hasOwnProperty('filePicker')){
                filePicker=true;
                if (setting.hasOwnProperty('fileType')){
                  filePickerType=setting.fileType; 
                } else {
                  filePickerType='any';               
                }
              }
              break;
            default:
              type=dtype;
          }         
          nsetting={"id":k.toString() ,"type":type,"isCheckbox":isCheckbox,"isRange":isRange,"range":range,"isSelect":isSelect,"choices":choices,"filePicker":filePicker,"filePickerType":filePickerType,"name":game.i18n.localize(setting.name),"hint":game.i18n.localize(setting.hint),"value":systemsettingsform_get_game_setting(SystemSettingsForm.SystemID, setting.key)}
          settings.push(nsetting);
          if(!categories.hasOwnProperty(category)){
            categories[category]=Array();
          }
          categories[category].push(nsetting);
        }        
      }
    }
    
    data={     
      system_name:SystemSettingsForm.SystemName, 
      settings:settings,
      categories:categories
    }     
    return data;
  }    
  
  async _updateObject(event, formData) {
    const expandedData = foundry.utils.expandObject(formData);
    //console.log(expandedData);
    if (expandedData.hasOwnProperty(SystemSettingsForm.SystemID)){    
      let keys=Object.keys(expandedData[SystemSettingsForm.SystemID]); 
      //console.log(keys);
      let currentValue;
      let askForReload=false;
      let requiresHardRender=false;
      let requiresRender=false;
      let setting;
      for(let i=0;i<keys.length;i++){
        let sKey=keys[i];
        let sNewValue=expandedData[SystemSettingsForm.SystemID][keys[i]];
        //
        // get current setting
        currentValue = systemsettingsform_get_game_setting(SystemSettingsForm.SystemID, sKey);
        // check if it has changed
        if(currentValue!=sNewValue){
          // save it     
          console.log('Saving setting ' + sKey + ':' + sNewValue + ' for system ' + SystemSettingsForm.SystemID);
          await game.settings.set(SystemSettingsForm.SystemID, sKey, sNewValue);
          // check if this setting requires reload
          setting = game.settings.settings.get(SystemSettingsForm.SystemID +"." + sKey);
          if(setting!=null){
            if(setting.hasOwnProperty('requiresreload')){
              if(setting.requiresreload){
                askForReload=true;
              }
            }
            if(setting.hasOwnProperty('requireshardrender')){
              if(setting.requireshardrender){
                requiresHardRender=true;
              }
            }
            if(setting.hasOwnProperty('requiresrender')){
              if(setting.requiresrender){
                requiresRender=true;
              }
            }
          }
        }
      }
      
      if(askForReload || requiresRender || requiresHardRender){
        Hooks.call(`sandbox.updateSystemSetting`,`${SystemSettingsForm.SystemID}`,{askForReload:askForReload,requiresRender:requiresRender,requiresHardRender:requiresHardRender});
      }  
    }
  }
  
  _onResetDefaults(event) {     
    event.preventDefault();
    const button = event.currentTarget;
    const form = button.form;    
    for ( let [k, v] of game.settings.settings.entries() ) {      
        // restore only for this system         
        // v8 uses system, v9 uses namespace
        if (v.module==SystemSettingsForm.SystemID || v.namespace==SystemSettingsForm.SystemID ){                
           // check if to ignore this   
          let ignoreThisSetting=false; 
          if (SystemSettingsForm.SystemSettingIgnoreList.length>0){
            if(SystemSettingsForm.SystemSettingIgnoreList.includes(v.key)){ 
              ignoreThisSetting=true;
            }
          }  
          if(v.hasOwnProperty("disableresetdefault")){
            if(v.disableresetdefault==true){
              ignoreThisSetting=true;
            }
          }
          // check for hidden
          if(v.hasOwnProperty("hidden")){
            if(v.hidden==true){
              ignoreThisSetting=true;
            }
          }
          if (!ignoreThisSetting){                                
            let input = form[k];            
            if (input.type === "checkbox"){              
              input.checked = v.default;    
            }
            else if (input){
              input.value = v.default;
            } 
            $(input).change();
          }
        }
      
    }
  }
  
  
  _onEnableAllOptions(event){
    event.preventDefault();
    const button = event.currentTarget;
    const form = button.form; 
    this._ToggleAllOptions(form,true)
  }
  _onDisableAllOptions(event){
    event.preventDefault();
    const button = event.currentTarget;
    const form = button.form; 
    this._ToggleAllOptions(form,false)
  }
  
  _ToggleAllOptions(form,enable=true){
    for ( let [k, v] of game.settings.settings.entries() ) {      
        // restore only for this system         
        // v8 uses module, v9 uses namespace
        if (v.module==SystemSettingsForm.SystemID || v.namespace==SystemSettingsForm.SystemID ){                
           // check if to ignore this   
          let ignoreThisSetting=false; 
          if (SystemSettingsForm.SystemSettingIgnoreList.length>0){
            if(SystemSettingsForm.SystemSettingIgnoreList.includes(v.key)){ 
              ignoreThisSetting=true;
            }
          }  
          // check for hidden
          if(v.hasOwnProperty("hidden")){
            if(v.hidden==true){
              ignoreThisSetting=true;
            }
          }
          if (!ignoreThisSetting){                                
            let input = form[k];            
            if (input.type === "checkbox"){              
              if(enable){
                input.checked = true;    
              } else {
                input.checked = false;
              }
                
            }
            
            $(input).change();
          }
        }
      
    }
  }
  
  
  _onToggleCategoryVisibility(event){
    event.preventDefault();
    let target=event.target.getAttribute('data-target');
    if (target!=null){
      
      let category_settings=document.getElementById('system-settings-category-settings-' + target);
      if (category_settings!=null){
        let toggleicon=document.getElementById('system-settings-category-toggle-icon-' + target);
        if(category_settings.style.display=='block' ){
          category_settings.style.display='none';
          toggleicon.classList.remove("fa-minus-square");
          toggleicon.classList.add("fa-plus-square");
        } else {
          category_settings.style.display='block';
          toggleicon.classList.remove("fa-plus-square");
          toggleicon.classList.add("fa-minus-square");
        }
      }
      // trigger resize of window
      this.setPosition({height: 'auto', width: 600});
    }
  }
  _onExpandAllCategories(event){
    event.preventDefault();
    this._ToggleAllcategories(true);
  }
  _onCollapseAllCategories(event){
    event.preventDefault();
    this._ToggleAllcategories(false);
    
  }
  
  _ToggleAllcategories(expand=false){
    // get all categories blocks
    let categoryblocks = document.getElementsByClassName('system-settings-category-settings');        
    for (let i = 0; i < categoryblocks.length; i++) {
      if(expand){
        categoryblocks[i].style.display='block';
      } else {
        categoryblocks[i].style.display='none';
      }      
    }
    let toggleicons = document.getElementsByClassName('system-settings-category-toggle-icon');
    for (let i = 0; i < toggleicons.length; i++) {
      if(expand){
        toggleicons[i].classList.remove("fa-plus-square");
        toggleicons[i].classList.add("fa-minus-square");
      } else {
        toggleicons[i].classList.remove("fa-minus-square");
        toggleicons[i].classList.add("fa-plus-square");
      }      
    }
    
    
    // trigger resize of window
    this.setPosition({height: 'auto', width: 600});
  }
  
}
  function systemsettingsform_get_game_setting(systemID,settingName){
    let setting=null;
    try{
      setting=game.settings.get(systemID, settingName);
    }
    catch(err){
      console.warn(settingName + ` is not found for system ` + systemID);
    }
    if (setting==null) {
      return  '';
    }
    else{
      return setting;
    }
  }
  
  
  Hooks.once('init', () => {      
    SystemSettingsForm.initialize();
  });

