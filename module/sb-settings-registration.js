import { SystemSettingsForm } from "./system-settings-form.js";
import { SandboxToolsForm } from "./sb-tools-form.js";
import * as stringCasing from './sb-strings-case.js'
import { SETTINGATTRIBUTE } from "./sb-setting-constants.js"
export function sb_settings_menus() {
    // menu for tools
    game.settings.registerMenu("sandbox", "SETTINGS_FORMS_TOOLS", {
      name: `sandbox.settings.forms.SETTINGS_FORMS_TOOLS.Name`,
      label: `sandbox.settings.forms.SETTINGS_FORMS_TOOLS.Name`,
      hint: `sandbox.settings.forms.SETTINGS_FORMS_TOOLS.Hint`,
      icon: "fas fa-toolbox",
      type: SandboxToolsForm,
      restricted: true
    });  
    // menu for the Setting Form SETTING_FORMS_SETTINGS
    game.settings.registerMenu("sandbox", "SETTING_FORMS_SETTINGS", {
      name: `sandbox.settings.forms.SETTING_FORMS_SETTINGS.Name`,
      label: `sandbox.settings.forms.SETTING_FORMS_SETTINGS.Name`,
      hint: `sandbox.settings.forms.SETTING_FORMS_SETTINGS.Hint`,
      icon: "fas fa-cog",
      type: SystemSettingsForm,
      restricted: true
    }); 
}

export function sb_settings_registration() {
  // SHOW OPTIONS
     game.settings.register("sandbox", SETTINGATTRIBUTE.OPTION_SHOWADV.ID, {
        name: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_SHOWADV.ID}.Name`,
        hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_SHOWADV.ID}.Hint`,
        scope: "world",
        config: false,
        default: `${SETTINGATTRIBUTE.OPTION_SHOWADV.DEFAULT}`,
        type: Boolean,
        category:`sandbox.settings.categories.SHOW_OPTIONS`,
        requiresrender:true
    });
    game.settings.register("sandbox", SETTINGATTRIBUTE.OPTION_SHOWSIMPLEROLLER.ID, {
        name: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_SHOWSIMPLEROLLER.ID}.Name`,
        hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_SHOWSIMPLEROLLER.ID}.Hint`,
        scope: "world",
        config: false,
        default: `${SETTINGATTRIBUTE.OPTION_SHOWSIMPLEROLLER.DEFAULT}`,
        type: Boolean,
        category:`sandbox.settings.categories.SHOW_OPTIONS`,
        requiresrender:true
    });
    game.settings.register("sandbox", SETTINGATTRIBUTE.OPTION_CONSISTENCYCHECK.ID, {
        name: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_CONSISTENCYCHECK.ID}.Name`,
        hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_CONSISTENCYCHECK.ID}.Hint`,
        scope: "world",
        config: false,
        default: `${SETTINGATTRIBUTE.OPTION_CONSISTENCYCHECK.DEFAULT}`,
        type: Boolean,
        hidden: true
    });
    game.settings.register("sandbox", SETTINGATTRIBUTE.OPTION_SHOWDC.ID, {
        name: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_SHOWDC.ID}.Name`,
        hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_SHOWDC.ID}.Hint`,
        scope: "world",
        config: false,
        default: `${SETTINGATTRIBUTE.OPTION_SHOWDC.DEFAULT}`,
        type: Boolean,
        category:`sandbox.settings.categories.SHOW_OPTIONS`,
        requiresreload:true
    });
    
    game.settings.register("sandbox", SETTINGATTRIBUTE.OPTION_USEDCLIST.ID, {
        name: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_USEDCLIST.ID}.Name`,
        hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_USEDCLIST.ID}.Hint`,
        scope: "world",
        config: false,
        default: `${SETTINGATTRIBUTE.OPTION_USEDCLIST.DEFAULT}`,
        type: String,
        category:`sandbox.settings.categories.SHOW_OPTIONS`,
        requiresreload:true
    });
    
    game.settings.register("sandbox", SETTINGATTRIBUTE.OPTION_SHOWLASTROLL.ID, {
        name: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_SHOWLASTROLL.ID}.Name`,
        hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_SHOWLASTROLL.ID}.Hint`,
        scope: "world",
        config: false,
        default: `${SETTINGATTRIBUTE.OPTION_SHOWLASTROLL.DEFAULT}`,
        type: Boolean,
        category:`sandbox.settings.categories.SHOW_OPTIONS`,
        requiresreload:true
    });
    game.settings.register("sandbox", SETTINGATTRIBUTE.OPTION_DIFF.ID, {
        name: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_DIFF.ID}.Name`,
        hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_DIFF.ID}.Hint`,
        scope: "world",
        config: false,
        default: `${SETTINGATTRIBUTE.OPTION_DIFF.DEFAULT}`,
        type: Number,
        hidden: true
    });
    game.settings.register("sandbox", SETTINGATTRIBUTE.OPTION_ROLLMOD.ID, {
        name: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_ROLLMOD.ID}.Name`,
        hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_ROLLMOD.ID}.Hint`,
        scope: "world",
        config: false,
        default: `${SETTINGATTRIBUTE.OPTION_ROLLMOD.DEFAULT}`,
        type: Boolean,
        category:`sandbox.settings.categories.SHOW_OPTIONS`,
        requiresrender:true        
    });
    // general options
    game.settings.register("sandbox", SETTINGATTRIBUTE.OPTION_TOKENOPTIONS.ID, {
        name: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_TOKENOPTIONS.ID}.Name`,
        hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_TOKENOPTIONS.ID}.Hint`,
        scope: "world",
        config: false,
        default: `${SETTINGATTRIBUTE.OPTION_TOKENOPTIONS.DEFAULT}`,
        type: Boolean,
        category:`sandbox.settings.categories.GENERAL_OPTIONS`
    });
    game.settings.register("sandbox", SETTINGATTRIBUTE.OPTION_CUSTOMSTYLE.ID, {
        name: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_CUSTOMSTYLE.ID}.Name`,
        hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_CUSTOMSTYLE.ID}.Hint`,
        scope: "world",
        config: false,
        default: `${SETTINGATTRIBUTE.OPTION_CUSTOMSTYLE.DEFAULT}`,
        type: String,
        filePicker: 'filepickertype',
        fileType:"textextended",
        category:`sandbox.settings.categories.GENERAL_OPTIONS`,
        disableresetdefault:true,
        requiresreload:true
    });
    game.settings.register("sandbox", SETTINGATTRIBUTE.OPTION_INITKEY.ID, {
        name: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_INITKEY.ID}.Name`,
        hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_INITKEY.ID}.Hint`,
        scope: "world",
        config: false,
        default: `${SETTINGATTRIBUTE.OPTION_INITKEY.DEFAULT}`,
        type: String,
        category:`sandbox.settings.categories.GENERAL_OPTIONS`,
        disableresetdefault:true,
        requiresreload:true
    });
            
    
    game.settings.register("sandbox", SETTINGATTRIBUTE.OPTION_AUXSETTEXT1.ID, {
        name: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_AUXSETTEXT1.ID}.Name`,
        hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_AUXSETTEXT1.ID}.Hint`,
        scope: "world",
        config: false,
        default: `${SETTINGATTRIBUTE.OPTION_AUXSETTEXT1.DEFAULT}`,
        type: String,
        hidden: true
    });
    game.settings.register("sandbox", SETTINGATTRIBUTE.OPTION_IDDICT.ID, {
        name: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_IDDICT.ID}.Name`,
        hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_IDDICT.ID}.Hint`,
        scope: "world",
        config: false,
        default: `${SETTINGATTRIBUTE.OPTION_IDDICT.DEFAULT}`,
        type: String,
        hidden: true,
        disableresetdefault:true
    }); 
    
    // special settings used for world data
    game.settings.register("sandbox", SETTINGATTRIBUTE.WORLD_LAST_CORE_VERSION_USED.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.WORLD_LAST_CORE_VERSION_USED.ID}.Name`,
      default: `${SETTINGATTRIBUTE.WORLD_LAST_CORE_VERSION_USED.DEFAULT}`,
      type: String,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.WORLD_LAST_CORE_VERSION_USED.ID}.Hint`,
      hidden:true,
      disableresetdefault:true
    });
    
    game.settings.register("sandbox", SETTINGATTRIBUTE.WORLD_LAST_SYSTEM_VERSION_USED.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.WORLD_LAST_SYSTEM_VERSION_USED.ID}.Name`,
      default: `${SETTINGATTRIBUTE.WORLD_LAST_SYSTEM_VERSION_USED.DEFAULT}`,
      type: String,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.WORLD_LAST_SYSTEM_VERSION_USED.ID}.Hint`,
      hidden:true,
      disableresetdefault:true
    });
     
    
    // citem options
    game.settings.register("sandbox", SETTINGATTRIBUTE.OPTION_USE_CITEM_INFO_FORM_FOR_PLAYERS.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_USE_CITEM_INFO_FORM_FOR_PLAYERS.ID}.Name`,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_USE_CITEM_INFO_FORM_FOR_PLAYERS.ID}.Hint`,
      scope: "world",
      config: false,
      type: Boolean,
      default: `${SETTINGATTRIBUTE.OPTION_USE_CITEM_INFO_FORM_FOR_PLAYERS.DEFAULT}`,
      category: `sandbox.settings.categories.CITEM_OPTIONS`  
    }); 
    game.settings.register("sandbox", SETTINGATTRIBUTE.OPTION_USE_CITEM_INFO_FORM_FOR_GMS.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_USE_CITEM_INFO_FORM_FOR_GMS.ID}.Name`,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_USE_CITEM_INFO_FORM_FOR_GMS.ID}.Hint`,
      scope: "world",
      config: false,
      type: Boolean,
      default: `${SETTINGATTRIBUTE.OPTION_USE_CITEM_INFO_FORM_FOR_GMS.DEFAULT}`,
      category: `sandbox.settings.categories.CITEM_OPTIONS`  
    }); 
    // -----------------------  
    // Sheet options  
    // -----------------------
    game.settings.register("sandbox", SETTINGATTRIBUTE.OPTION_ACTIVATE_ITEM_DELETE_PROTECTION.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_ACTIVATE_ITEM_DELETE_PROTECTION.ID}.Name`,
      default: `${SETTINGATTRIBUTE.OPTION_ACTIVATE_ITEM_DELETE_PROTECTION.DEFAULT}`,
      type: Boolean,
      scope: 'client',
      config: true,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_ACTIVATE_ITEM_DELETE_PROTECTION.ID}.Hint`,
      category: `sandbox.settings.categories.SHEET_OPTIONS`,
      requireshardrender:true
    });
    
    
    game.settings.register("sandbox", SETTINGATTRIBUTE.OPTION_SHEET_RESIZABLE_CONTENT.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_SHEET_RESIZABLE_CONTENT.ID}.Name`,
      default: `${SETTINGATTRIBUTE.OPTION_SHEET_RESIZABLE_CONTENT.DEFAULT}`,
      type: Boolean,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_SHEET_RESIZABLE_CONTENT.ID}.Hint`,
      category: `sandbox.settings.categories.SHEET_OPTIONS`,
      requiresreload:true
    });
    
    game.settings.register("sandbox", SETTINGATTRIBUTE.OPTION_DISPLAY_ID_IN_SHEET_CAPTION.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_DISPLAY_ID_IN_SHEET_CAPTION.ID}.Name`,
      default: `${SETTINGATTRIBUTE.OPTION_DISPLAY_ID_IN_SHEET_CAPTION.DEFAULT}`,
      type: Boolean,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_DISPLAY_ID_IN_SHEET_CAPTION.ID}.Hint`,
      category: `sandbox.settings.categories.SHEET_OPTIONS`,
      requireshardrender:true
    }); 
    game.settings.register("sandbox", SETTINGATTRIBUTE.OPTION_DISPLAY_SHOW_TO_OTHERS_IN_SHEET_CAPTION.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_DISPLAY_SHOW_TO_OTHERS_IN_SHEET_CAPTION.ID}.Name`,
      default: `${SETTINGATTRIBUTE.OPTION_DISPLAY_SHOW_TO_OTHERS_IN_SHEET_CAPTION.DEFAULT}`,
      type: Boolean,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_DISPLAY_SHOW_TO_OTHERS_IN_SHEET_CAPTION.ID}.Hint`,
      category: `sandbox.settings.categories.SHEET_OPTIONS`,
      requireshardrender:true
    });
    
      
    // -----------------------
    // Item sheet show options
    // -----------------------
    game.settings.register("sandbox", SETTINGATTRIBUTE.OPTION_SHOW_ITEM_HELPERS.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_SHOW_ITEM_HELPERS.ID}.Name`,
      default: `${SETTINGATTRIBUTE.OPTION_SHOW_ITEM_HELPERS.DEFAULT}`,
      type: Boolean,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_SHOW_ITEM_HELPERS.ID}.Hint`,
      category: `sandbox.settings.categories.ITEM_SHEET_OPTIONS`,
      requiresrender:true
    });
    game.settings.register("sandbox", SETTINGATTRIBUTE.OPTION_ADAPT_ITEM_SHEET_POSITION.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_ADAPT_ITEM_SHEET_POSITION.ID}.Name`,
      default: `${SETTINGATTRIBUTE.OPTION_ADAPT_ITEM_SHEET_POSITION.DEFAULT}`,
      type: Boolean,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_ADAPT_ITEM_SHEET_POSITION.ID}.Hint`,
      category: `sandbox.settings.categories.ITEM_SHEET_OPTIONS`,
        requiresrender:true
      
    });
    game.settings.register("sandbox", SETTINGATTRIBUTE.OPTION_SET_DEFAULT_ITEM_TAB.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_SET_DEFAULT_ITEM_TAB.ID}.Name`,
      default: `${SETTINGATTRIBUTE.OPTION_SET_DEFAULT_ITEM_TAB.DEFAULT}`,
      type: Boolean,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_SET_DEFAULT_ITEM_TAB.ID}.Hint`,
      category: `sandbox.settings.categories.ITEM_SHEET_OPTIONS`
    });
    
    // -----------------------
    // key validation options
    // -----------------------
    game.settings.register("sandbox", SETTINGATTRIBUTE.OPTION_ENFORCED_VALIDATION.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_ENFORCED_VALIDATION.ID}.Name`,
      default: `${SETTINGATTRIBUTE.OPTION_ENFORCED_VALIDATION.DEFAULT}`,
      type: Boolean,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_ENFORCED_VALIDATION.ID}.Hint`,
      category: `sandbox.settings.categories.KEY_VALIDATION_OPTIONS`
    });
    // ----------------------
    // Autogeneration options
    // ----------------------
    //
    game.settings.register("sandbox", SETTINGATTRIBUTE.OPTION_AUTOGENERATE_PROPERTY_ICON.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_AUTOGENERATE_PROPERTY_ICON.ID}.Name`,
      default: `${SETTINGATTRIBUTE.OPTION_AUTOGENERATE_PROPERTY_ICON.DEFAULT}`,
      type: Boolean,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_AUTOGENERATE_PROPERTY_ICON.ID}.Hint`,
      category: `sandbox.settings.categories.AUTOGENERATION_OPTIONS`
    });
    game.settings.register("sandbox", SETTINGATTRIBUTE.OPTION_CONFIRM_BATCH_OVERWRITE.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_CONFIRM_BATCH_OVERWRITE.ID}.Name`,
      default: `${SETTINGATTRIBUTE.OPTION_CONFIRM_BATCH_OVERWRITE.DEFAULT}`,
      type: Boolean,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_CONFIRM_BATCH_OVERWRITE.ID}.Hint`,
      category: `sandbox.settings.categories.AUTOGENERATION_OPTIONS`
    });
    //OPTION_CONFIRM_ATTRIBUTE_OVERWRITE
    game.settings.register("sandbox", SETTINGATTRIBUTE.OPTION_CONFIRM_ATTRIBUTE_OVERWRITE.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_CONFIRM_ATTRIBUTE_OVERWRITE.ID}.Name`,
      default: `${SETTINGATTRIBUTE.OPTION_CONFIRM_ATTRIBUTE_OVERWRITE.DEFAULT}`,
      type: Boolean,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_CONFIRM_ATTRIBUTE_OVERWRITE.ID}.Hint`,
      category: `sandbox.settings.categories.AUTOGENERATION_OPTIONS`
    });
    
    game.settings.register("sandbox", SETTINGATTRIBUTE.OPTION_KEY_CONVERT_TO_CASE.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_KEY_CONVERT_TO_CASE.ID}.Name`,
      default: `${SETTINGATTRIBUTE.OPTION_KEY_CONVERT_TO_CASE.DEFAULT}`,
      type: String, 
      choices: {
        0: stringCasing.CASING.CASE.NONE,
        1: stringCasing.CASING.CASE.LOWERCASE,
        2: stringCasing.CASING.CASE.UPPERCASE,
        3: stringCasing.CASING.CASE.TITLECASE
      },        
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_KEY_CONVERT_TO_CASE.ID}.Hint`,
      category: `sandbox.settings.categories.AUTOGENERATION_OPTIONS`
    });
    game.settings.register("sandbox", SETTINGATTRIBUTE.OPTION_CSS_CONVERT_TO_CASE.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_CSS_CONVERT_TO_CASE.ID}.Name`,
      default: `${SETTINGATTRIBUTE.OPTION_CSS_CONVERT_TO_CASE.DEFAULT}`,
      type: String, 
      choices: {
        0: stringCasing.CASING.CASE.NONE,
        1: stringCasing.CASING.CASE.LOWERCASE,
        2: stringCasing.CASING.CASE.UPPERCASE,
        3: stringCasing.CASING.CASE.TITLECASE
      },        
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_CSS_CONVERT_TO_CASE.ID}.Hint`,
      category: `sandbox.settings.categories.AUTOGENERATION_OPTIONS`
    });
    game.settings.register("sandbox", SETTINGATTRIBUTE.OPTION_TRANSLITERATE_NON_LATIN.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_TRANSLITERATE_NON_LATIN.ID}.Name`,
      default: `${SETTINGATTRIBUTE.OPTION_TRANSLITERATE_NON_LATIN.DEFAULT}`,
      type: Boolean,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_TRANSLITERATE_NON_LATIN.ID}.Hint`,
      category: `sandbox.settings.categories.AUTOGENERATION_OPTIONS`
    });
    game.settings.register("sandbox", SETTINGATTRIBUTE.OPTION_USE_PREFIX_SUFFIX.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_USE_PREFIX_SUFFIX.ID}.Name`,
      default: `${SETTINGATTRIBUTE.OPTION_USE_PREFIX_SUFFIX.DEFAULT}`,
      type: Boolean,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_USE_PREFIX_SUFFIX.ID}.Hint`,
      category: `sandbox.settings.categories.AUTOGENERATION_OPTIONS`
    });
    game.settings.register("sandbox", SETTINGATTRIBUTE.OPTION_USE_DATATYPE_PREFIX.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_USE_DATATYPE_PREFIX.ID}.Name`,
      default: `${SETTINGATTRIBUTE.OPTION_USE_DATATYPE_PREFIX.DEFAULT}`,
      type: Boolean,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.OPTION_USE_DATATYPE_PREFIX.ID}.Hint`,
      category: `sandbox.settings.categories.AUTOGENERATION_OPTIONS`
    });
    // -----------------
    // Prefixes/suffixes
    // -----------------
    game.settings.register("sandbox", SETTINGATTRIBUTE.PREFIX_PROPERTY.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.PREFIX_PROPERTY.ID}.Name`,
      default: `${SETTINGATTRIBUTE.PREFIX_PROPERTY.DEFAULT}`,
      type: String,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.PREFIX_PROPERTY.ID}.Hint`,
      category: `sandbox.settings.categories.AUTOGENERATION_PREFIXES_SUFFIXES`
    }); 
    game.settings.register("sandbox", SETTINGATTRIBUTE.PREFIX_PROPERTY_SIMPLETEXT.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.PREFIX_PROPERTY_SIMPLETEXT.ID}.Name`,
      default: `${SETTINGATTRIBUTE.PREFIX_PROPERTY_SIMPLETEXT.DEFAULT}`,
      type: String,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.PREFIX_PROPERTY_SIMPLETEXT.ID}.Hint`,
      category: `sandbox.settings.categories.AUTOGENERATION_PREFIXES_SUFFIXES`        
    });
    game.settings.register("sandbox", SETTINGATTRIBUTE.PREFIX_PROPERTY_SIMPLENUMERIC.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.PREFIX_PROPERTY_SIMPLENUMERIC.ID}.Name`,
      default: `${SETTINGATTRIBUTE.PREFIX_PROPERTY_SIMPLENUMERIC.DEFAULT}`,
      type: String,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.PREFIX_PROPERTY_SIMPLENUMERIC.ID}.Hint`,
      category: `sandbox.settings.categories.AUTOGENERATION_PREFIXES_SUFFIXES`        
    });
    game.settings.register("sandbox", SETTINGATTRIBUTE.PREFIX_PROPERTY_CHECKBOX.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.PREFIX_PROPERTY_CHECKBOX.ID}.Name`,
      default: `${SETTINGATTRIBUTE.PREFIX_PROPERTY_CHECKBOX.DEFAULT}`,
      type: String,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.PREFIX_PROPERTY_CHECKBOX.ID}.Hint`,
      category: `sandbox.settings.categories.AUTOGENERATION_PREFIXES_SUFFIXES`        
    });
    game.settings.register("sandbox", SETTINGATTRIBUTE.PREFIX_PROPERTY_RADIO.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.PREFIX_PROPERTY_RADIO.ID}.Name`,
      default: `${SETTINGATTRIBUTE.PREFIX_PROPERTY_RADIO.DEFAULT}`,
      type: String,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.PREFIX_PROPERTY_RADIO.ID}.Hint`,
      category: `sandbox.settings.categories.AUTOGENERATION_PREFIXES_SUFFIXES`        
    });
    game.settings.register("sandbox", SETTINGATTRIBUTE.PREFIX_PROPERTY_TEXTAREA.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.PREFIX_PROPERTY_TEXTAREA.ID}.Name`,
      default: `${SETTINGATTRIBUTE.PREFIX_PROPERTY_TEXTAREA.DEFAULT}`,
      type: String,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.PREFIX_PROPERTY_TEXTAREA.ID}.Hint`,
      category: `sandbox.settings.categories.AUTOGENERATION_PREFIXES_SUFFIXES`        
    });
    game.settings.register("sandbox", SETTINGATTRIBUTE.PREFIX_PROPERTY_LIST.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.PREFIX_PROPERTY_LIST.ID}.Name`,
      default: `${SETTINGATTRIBUTE.PREFIX_PROPERTY_LIST.DEFAULT}`,
      type: String,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.PREFIX_PROPERTY_LIST.ID}.Hint`,
      category: `sandbox.settings.categories.AUTOGENERATION_PREFIXES_SUFFIXES`        
    });
    game.settings.register("sandbox", SETTINGATTRIBUTE.PREFIX_PROPERTY_LABEL.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.PREFIX_PROPERTY_LABEL.ID}.Name`,
      default: `${SETTINGATTRIBUTE.PREFIX_PROPERTY_LABEL.DEFAULT}`,
      type: String,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.PREFIX_PROPERTY_LABEL.ID}.Hint`,
      category: `sandbox.settings.categories.AUTOGENERATION_PREFIXES_SUFFIXES`        
    });
    game.settings.register("sandbox", SETTINGATTRIBUTE.PREFIX_PROPERTY_BADGE.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.PREFIX_PROPERTY_BADGE.ID}.Name`,
      default: `${SETTINGATTRIBUTE.PREFIX_PROPERTY_BADGE.DEFAULT}`,
      type: String,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.PREFIX_PROPERTY_BADGE.ID}.Hint`,
      category: `sandbox.settings.categories.AUTOGENERATION_PREFIXES_SUFFIXES`        
    });
    game.settings.register("sandbox", SETTINGATTRIBUTE.PREFIX_PROPERTY_TABLE.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.PREFIX_PROPERTY_TABLE.ID}.Name`,
      default: `${SETTINGATTRIBUTE.PREFIX_PROPERTY_TABLE.DEFAULT}`,
      type: String,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.PREFIX_PROPERTY_TABLE.ID}.Hint`,
      category: `sandbox.settings.categories.AUTOGENERATION_PREFIXES_SUFFIXES`        
    });
    game.settings.register("sandbox", SETTINGATTRIBUTE.PREFIX_PROPERTY_BUTTON.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.PREFIX_PROPERTY_BUTTON.ID}.Name`,
      default: `${SETTINGATTRIBUTE.PREFIX_PROPERTY_BUTTON.DEFAULT}`,
      type: String,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.PREFIX_PROPERTY_BUTTON.ID}.Hint`,
      category: `sandbox.settings.categories.AUTOGENERATION_PREFIXES_SUFFIXES`        
    });
    game.settings.register("sandbox", SETTINGATTRIBUTE.PREFIX_PANEL.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.PREFIX_PANEL.ID}.Name`,
      default: `${SETTINGATTRIBUTE.PREFIX_PANEL.DEFAULT}`,
      type: String,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.PREFIX_PANEL.ID}.Hint`,
      category: `sandbox.settings.categories.AUTOGENERATION_PREFIXES_SUFFIXES`        
    });
    game.settings.register("sandbox", SETTINGATTRIBUTE.PREFIX_MULTIPANEL.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.PREFIX_MULTIPANEL.ID}.Name`,
      default: `${SETTINGATTRIBUTE.PREFIX_MULTIPANEL.DEFAULT}`,
      type: String,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.PREFIX_MULTIPANEL.ID}.Hint`,
      category: `sandbox.settings.categories.AUTOGENERATION_PREFIXES_SUFFIXES`        
    }); 
    
    game.settings.register("sandbox", SETTINGATTRIBUTE.PREFIX_GROUP.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.PREFIX_GROUP.ID}.Name`,
      default: `${SETTINGATTRIBUTE.PREFIX_GROUP.DEFAULT}`,
      type: String,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.PREFIX_GROUP.ID}.Hint`,
      category: `sandbox.settings.categories.AUTOGENERATION_PREFIXES_SUFFIXES`        
    });
    
    game.settings.register("sandbox", SETTINGATTRIBUTE.PREFIX_LOOKUP.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.PREFIX_LOOKUP.ID}.Name`,
      default: `${SETTINGATTRIBUTE.PREFIX_LOOKUP.DEFAULT}`,
      type: String,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.PREFIX_LOOKUP.ID}.Hint`,
      category: `sandbox.settings.categories.AUTOGENERATION_PREFIXES_SUFFIXES`        
    });
    
    
    game.settings.register("sandbox", SETTINGATTRIBUTE.PREFIX_TAB.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.PREFIX_TAB.ID}.Name`,
      default: `${SETTINGATTRIBUTE.PREFIX_TAB.DEFAULT}`,
      type: String,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.PREFIX_TAB.ID}.Hint`,
      category: `sandbox.settings.categories.AUTOGENERATION_PREFIXES_SUFFIXES`        
    }); 
    game.settings.register("sandbox", SETTINGATTRIBUTE.SUFFIX_FONTGROUP.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.SUFFIX_FONTGROUP.ID}.Name`,
      default: `${SETTINGATTRIBUTE.SUFFIX_FONTGROUP.DEFAULT}`,
      type: String,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.SUFFIX_FONTGROUP.ID}.Hint`,
      category: `sandbox.settings.categories.AUTOGENERATION_PREFIXES_SUFFIXES`        
    }); 
    game.settings.register("sandbox", SETTINGATTRIBUTE.SUFFIX_INPUTGROUP.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.SUFFIX_INPUTGROUP.ID}.Name`,
      default: `${SETTINGATTRIBUTE.SUFFIX_INPUTGROUP.DEFAULT}`,
      type: String,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.SUFFIX_INPUTGROUP.ID}.Hint`,
      category: `sandbox.settings.categories.AUTOGENERATION_PREFIXES_SUFFIXES`        
    });
    game.settings.register("sandbox", SETTINGATTRIBUTE.SUFFIX_HEADERGROUP.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.SUFFIX_HEADERGROUP.ID}.Name`,
      default: `${SETTINGATTRIBUTE.SUFFIX_HEADERGROUP.DEFAULT}`,
      type: String,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.SUFFIX_HEADERGROUP.ID}.Hint`,
      category: `sandbox.settings.categories.AUTOGENERATION_PREFIXES_SUFFIXES`        
    });         
    game.settings.register("sandbox", SETTINGATTRIBUTE.SUFFIX_ROLLID.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.SUFFIX_ROLLID.ID}.Name`,
      default: `${SETTINGATTRIBUTE.SUFFIX_ROLLID.DEFAULT}`,
      type: String,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.SUFFIX_ROLLID.ID}.Hint`,
      category: `sandbox.settings.categories.AUTOGENERATION_PREFIXES_SUFFIXES`        
    });      
    game.settings.register("sandbox", SETTINGATTRIBUTE.SUFFIX_ROLLNAME.ID, {
      name: `sandbox.settings.settings.${SETTINGATTRIBUTE.SUFFIX_ROLLNAME.ID}.Name`,
      default: `${SETTINGATTRIBUTE.SUFFIX_ROLLNAME.DEFAULT}`,
      type: String,
      scope: 'world',
      config: false,
      hint: `sandbox.settings.settings.${SETTINGATTRIBUTE.SUFFIX_ROLLNAME.ID}.Hint`,
      category: `sandbox.settings.categories.AUTOGENERATION_PREFIXES_SUFFIXES`        
    });
  
}

