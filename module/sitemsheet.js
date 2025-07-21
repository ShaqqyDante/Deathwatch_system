/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */

import { auxMeth } from "./auxmeth.js";
import { activateHelpers } from "./sb-itemsheet-helpers.js";
import { SETTINGATTRIBUTE }           from "./sb-setting-constants.js";
import { sb_item_sheet_get_game_setting } from "./sb-setting-constants.js";
import { sb_custom_dialog_confirm,
          confirmRemoveSubItem} from "./sb-custom-dialogs.js";
import { sb_lookupTable_to_string, sb_string_to_lookupTable,lookupColumns } from "./sb-lookup-table.js";
import  { 
          ITEM_SHEET_HEIGHT,
          ITEM_SHEET_PROPERTY_HEIGHT,
          ITEM_SHEET_DEFAULT_WIDTH,
          ITEM_SHEET_TABS,
          TYPECLASS
        } from "./sb-itemsheet-constants.js";
import { lookupList } from "./sb-lookup-table.js";

export class sItemSheet extends ItemSheet {

    constructor(...args) {
      super(...args);                  
    }

    /** @override */
    static get defaultOptions() {
      
        return mergeObject(super.defaultOptions, {
            classes: ["sandbox", "sheet", "item"],
            width: 520,
            height: 500,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
        });
    }

    /* -------------------------------------------- */

    /** @override */
    get template() {
        const path = "systems/sandbox/templates/";
        return `${path}/${this.item.type}.html`;
    }
    


    /** @override */
    async getData() {

        if (this.item.type == "cItem")
            await this.checkStillUnique();

        const item = this.item;
        const data = super.getData();
        let secrets = this.item.isOwner;
        if (game.user.isGM) secrets = true;
        data.enrichedBiography = await TextEditor.enrichHTML(this.item.system.description, {secrets:secrets, entities:true,async: true});
        data.flags = item.flags;
        // enable when dev
        const OPTION_SHOW_ITEM_HELPERS= sb_item_sheet_get_game_setting("sandbox", SETTINGATTRIBUTE.OPTION_SHOW_ITEM_HELPERS.ID);
        if (OPTION_SHOW_ITEM_HELPERS && game.user.isGM ){
          data.showhelpers=true;
        } else {
          data.showhelpers=false;
        }
        // check for ctalink module
        let isctalinkActive=false;        
        if (game.modules.get("ctalink")!=null ){
          isctalinkActive=game.modules.get("ctalink").active;          
        } 
        data.showctalink=isctalinkActive;
        
        data.showiconselector=false;
        const iconselectorenabled=true;
        if (this.item.type == "cItem" && iconselectorenabled){
          // check if enabled
          data.showiconselector=true;
          // icon selector
          switch (data.item.system.icon){
            case 'BOOK':
              data.item.system.icon='fa-book';
              break;
            case 'VIAL':
              data.item.system.icon='fa-vial';
              break;
            case 'STAR':
              data.item.system.icon='fa-star';
              break;
          }
        }
        if (this.item.type == "property" && (this.item.system.datatype == "label" || this.item.system.datatype == "button"  || this.item.system.datatype == "simplenumeric" || this.item.system.datatype == "radio" || this.item.system.datatype == "simpletext" || this.item.system.datatype == "list" || this.item.system.datatype == "badge" || this.item.system.datatype == "checkbox" || this.item.system.datatype == "textarea") && iconselectorenabled){
          // check if enabled
          data.showiconselector=true;
          if(this.item.system.labelformat == "D"){
            // adapt to icon
            //data.item.system.labelformat="I";
          }
          if(data.item.system.icon==''){
            // set default icon
            data.item.system.icon='fa-dice-d20';
          }
          
        }
        data.showradiotypeselector=false;
        if(this.item.type == "property" && this.item.system.datatype == "radio" ){
          data.showradiotypeselector=true;
          // icon selector
          switch (data.item.system.radiotype){
            case 'C':
              data.item.system.radiotype='fa-circle';
              break;
            case 'S':
              data.item.system.radiotype='fa-square';
              break;
            case '':
              data.item.system.radiotype='fa-circle';
              break;
          }
        }
        // for list only
        let lookupOptions=[];
        let lookupOptionsColumns=[];
        if (this.item.type == "property" &&  this.item.system.datatype == "list"){
          if(this.item.system.listoptionsLookupUse){
            let firstLookup=this.item.system.listoptionsLookupKey;
            const lookups=game.items.filter(y => y.type == "lookup");
            if(lookups!=null){
              lookups.forEach((el) => {
                if(el.system.lookupKey!=''){
                  if(firstLookup=='') firstLookup=el.system.lookupKey
                  let  lookup={'value':'','name':''};
                  lookup.value=el.system.lookupKey;                
                  lookup.name=el.name;
                  lookupOptions.push(lookup); 
                }
              });
            }
            
            let lookupCols=game.items.find(y => y.type == "lookup" && y.system.lookupKey==firstLookup);
            if(lookupCols!=null){
              for (let col = 0; col < lookupCols.system.lookupTable.columns.length; col++) { 
                let  column={'value':'','name':''};
                column.value=col;                
                column.name=lookupCols.system.lookupTable.columns[col];                            
                lookupOptionsColumns.push(column);
              }
            }
          }
        }
        data.lookupOptions=lookupOptions;
        data.lookupOptionsColumns=lookupOptionsColumns;
        
        
        // specials for lookup
        if(this.item.type == "lookup"){          
          data.lookupTable=sb_lookupTable_to_string(data.item.system.lookupTable);                    
        }
        
        

        return data;

    }

    /* -------------------------------------------- */

    /** @override */

    activateListeners(html) {
        super.activateListeners(html);

        // Activate tabs
        let tabs = html.find('.tabs');
        let initial = this._sheetTab;
        new TabsV2(tabs, {
            initial: initial,
            callback: clicked => this._sheetTab = clicked.data("tab")
        });

        //Drag end event 
        this.form.ondrop = ev => this._onDrop(ev);

        

        // Checks if the attribute of the cItem is variable, or it's value stays constant on each cItem
        html.find('.check-isconstant').click(ev => {
            const li = $(ev.currentTarget);
            const value = ev.target.value;
            let obj = li.attr("name");
            let namechain = obj.split(".");
            let name = namechain[1];
            let index = namechain[0];
            const propis = this.item.system.properties;
            const prop = propis[index];

            if (prop.isconstant) {
                prop.isconstant = false;
            }
            else {
                prop.isconstant = true;
            }

            //this.item.data.data.properties = propis;
            //this.item.update(this.item.data);

            this.item.update({ "system.properties": this.item.system.properties });
        });

        // Checks if a Mod is executable only one
        html.find('.check-once').click(ev => {
            const li = $(ev.currentTarget);
            const value = ev.target.value;
            let index = li.attr("index");
            const mod = this.item.system.mods[index];

            if (mod.once) {
                mod.once = false;
            }
            else {
                mod.once = true;
            }

            this.item.update({ "system.mods": this.item.system.mods });
            //this.item.update(this.item.data);
        });

        html.find('.mod-add').click(ev => {
            this.adnewCIMod();
        });

        html.find('.check-hasuses').click(ev => {
            let activated = this._element[0].getElementsByClassName("check-hasactivation");
            const value = ev.target.checked;
            if (value)
                activated[0].checked = true;

        });

        html.find('.check-hasactivation').click(ev => {
            let uses = this._element[0].getElementsByClassName("check-hasuses");
            const value = ev.target.checked;
            if (!value)
                uses[0].checked = false;

        });

        html.find('.imgsrc-filepicker').click(ev => {

            new FilePicker({
                type: "image",
                displayMode: "tiles",
                current: this.item.system.imgsrc,
                callback: imagePath => this.item.update({ "system.imgsrc": imagePath }),
            }).browse(this.item.system.imgsrc);
        });
        
        html.find('.checkonPath').click(ev => {

            new FilePicker({
                type: "image",
                displayMode: "tiles",
                current: this.item.system.onPath,
                callback: imagePath => this.item.update({ "system.onPath": imagePath }),
            }).browse(this.item.system.checkonPath);
        });
        
        //
        

        html.find('.checkoffPath').click(ev => {

            new FilePicker({
                type: "image",
                displayMode: "tiles",
                current: this.item.system.offPath,
                callback: imagePath => this.item.update({ "system.offPath": imagePath }),
            }).browse(this.item.system.checkoffPath);
        });

        html.find('.tokeniconpath').click(ev => {

            new FilePicker({
                type: "image",
                displayMode: "tiles",
                current: this.item.system.tokeniconpath,
                callback: imagePath => this.item.update({ "system.tokeniconpath": imagePath }),
            }).browse(this.item.system.tokeniconpath);
        });
        
        html.find('#citem-consume-icon').click(async(ev) => {
          let api=game.system.api;
          let selectedicon = await api.fontAwesomeIconPicker(this.item.system.icon,'fa-book', ' for consumable cItem ' + this.item.name );
          if(selectedicon!=''){
            this.item.update({ "system.icon": selectedicon })
          }
        });  
        
        html.find('#property-icon').click(async(ev) => {
          let api=game.system.api;
          let selectedicon = await api.fontAwesomeIconPicker(this.item.system.icon,'fa-dice-d20' , ' for label icon for property ' + this.item.name);
          if(selectedicon!=''){
            this.item.update({ "system.icon": selectedicon })
          }
        });
        
        html.find('#property-radioreseticon').click(async(ev) => {
          let api=game.system.api;
          let selectedicon = await api.fontAwesomeIconPicker(this.item.system.radioResetIcon,'fa-times-circle' , ' for radio reset icon for property ' + this.item.name);
          if(selectedicon!=''){
            this.item.update({ "system.radioResetIcon": selectedicon })
          }
        });
        
        html.find('#property-radiotype').click(async(ev) => {
          let api=game.system.api;
          let selectedicon = await api.fontAwesomeIconPicker(this.item.system.radiotype,'fa-circle' , ' for radiotype for property ' + this.item.name);
          if(selectedicon!=''){
            this.item.update({ "system.radiotype": selectedicon })
          }
        });
        

        html.find('.mod-input').change(ev => {
            const li = $(ev.currentTarget);
            const value = ev.target.value;
            let obj = li.attr("name");
            let namechain = obj.split(".");
            let name = namechain[1];
            let index = namechain[0];

            this.editmodInput(index, name, value);
        });

        html.find('.mod-delete').click(async (ev) => {
            const li = $(ev.currentTarget);
            const value = ev.target.value;
            let obj = li.attr("name");
            // ask user for confirmation
            
            let namechain = obj.split(".");
            let index = namechain[0];            
            const bOkToProceed=await confirmRemoveSubItem(this.item.name,this.item.type.toLowerCase(),this.item.system.mods[index].name,game.i18n.localize("SANDBOX.cItemModifikation") +'['+ index +']');
            if(bOkToProceed){ 
              
              this.deletemodInput(index);
            }
        });

        html.find('.modcitem-edit').click(async (ev) => {

            let citemId = ev.target.parentElement.getAttribute("citemId");
            let ciKey = ev.target.parentElement.getAttribute("ciKey");
            let citemname=ev.target.innerText;
            //let citem = game.items.get(citemId);
            let citem = await auxMeth.getcItem(citemId, ciKey);
            if(typeof citem == 'undefined'){
              // could not find the citem
              let errmsg='Sandbox | Citem to show not found. Name:['+ citemname + '] id:['+ citemId +']' + ' ciKey:['+ ciKey +']';
              console.error(errmsg);
              ui.notifications.error(errmsg);
            } else {
              citem.sheet.render(true);
            }
        });

        html.find('.modcitem-delete').click(async(ev) => {
            const mods = this.item.system.mods;
            let cindex = ev.target.parentElement.parentElement.getAttribute("cindex");
            let modId = ev.target.parentElement.parentElement.getAttribute("mod");
            
            // ask user for confirmation
            let parentName=this.item.system.mods[modId].name;
            let parentType=game.i18n.localize("SANDBOX.ItemTypecItem").toLowerCase() + ' <strong>' + this.item.name + '</strong> ' + game.i18n.localize("SANDBOX.cItemModifikation").toLowerCase() + '['+ modId +']'
            let itemName=this.item.system.mods[modId].items[cindex].name
            let itemType=game.i18n.localize("SANDBOX.ItemTypecItem")
            //const bOkToProceed=await sb_custom_dialog_confirm('Confirm deletion?',`This will delete <b>${this.item.system.mods[modId].items[cindex].name}</b> from this MOD(<b>${this.item.system.mods[modId].name}</b>)<br>Do you want to proceed?<br>` ); 
            const bOkToProceed=await confirmRemoveSubItem(parentName,parentType,itemName,itemType);
            if(bOkToProceed){            
              this.item.system.mods[modId].items.splice(cindex, 1);
              this.item.update({ "system.mods": mods });
            }
            
        });
        
        
        
        activateHelpers(html, this.item);

        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        let subitems = this.getsubItems();
        if (subitems == null) {

            return;
        }

        // Edit Tab item
        html.find('.item-edit').click(async (ev) => {
            const li = $(ev.currentTarget).parents(".property");
            const toedit = subitems[li.data("itemId")];
            let itemname=li[0].innerText;
            //console.log(this.item.type);
            
            let mysubtype;
            if (this.item.type == "sheettab" || this.item.type == "multipanel")
                mysubtype = "panel";
            if (this.item.type == "panel" || this.item.type == "group")
                mysubtype = "property";
            if (this.item.type == "cItem")
                mysubtype = "group";

            //console.log(mysubtype);
            const item = await auxMeth.getTElement(toedit.id, mysubtype, toedit.ikey);
            if(typeof item == 'undefined'){
              // could not find the item
              let errmsg='Sandbox | Item to show not found. Name:['+ itemname + '] id:['+ toedit.id +']';
              console.error(errmsg);
              ui.notifications.error(errmsg);
            } else {
            
              item.sheet.render(true);
            }
        });

        // Delete tab Item
        html.find('.item-delete').click(async (ev) => {
            const li = $(ev.currentTarget).parents(".property");
            let todelete = li.data("itemId");
            
            let obj = subitems[todelete];
            let subitem=game.items.get(obj.id);
            let subitemtype='';
            if(subitem!=null){
              subitemtype=subitem.type[0].toUpperCase() + subitem.type.slice(1);
            }            
            // ask user for confirmation
            const bOkToProceed=await confirmRemoveSubItem(this.item.name,this.item.type.toLowerCase(),obj.name,subitemtype);            
            if(bOkToProceed){
              if (this.item.type == "cItem") {
                  //let group = game.items.get(obj.id);
                  let group = await auxMeth.getTElement(obj.id, "group", obj.ikey);
                  if (group.system.isUnique) {
                      this.item.system.isUnique = false;
                  }
              }
              const prop = subitems.splice(todelete, 1);
              li.slideUp(200, () => this.render(false));
              this.updateLists(subitems);
            }
        });

        // Top Item
        html.find('.item-top').click(ev => {
            const li = $(ev.currentTarget).parents(".property");
            let itemindex = li.data("itemId");
            if (itemindex > 0)
                subitems.splice(itemindex - 1, 0, subitems.splice(itemindex, 1)[0]);
            this.updateLists(subitems);
        });

        // Bottom Item
        html.find('.item-bottom').click(ev => {
            const li = $(ev.currentTarget).parents(".property");
            let itemindex = li.data("itemId");
            if (itemindex < subitems.length - 1)
                subitems.splice(itemindex + 1, 0, subitems.splice(itemindex, 1)[0]);
            this.updateLists(subitems);
        });

        html.find('.macroselector').change(ev => {
            ev.preventDefault();
            const li = $(ev.currentTarget);
            this.item.update({ "system.macroid": li.value });
        });
        
    }
    
    

    async listMacros() {
        let macros = this._element[0].getElementsByClassName("macroselector");

        if (macros == null)
            return;

        let selector = macros[0];

        if (selector == null)
            return;

        var length = selector.options.length;

        for (let j = length - 1; j >= 0; j--) {
            selector.options[j] = null;
        }

        var opt = document.createElement('option');
        opt.appendChild(document.createTextNode("No Macro"));
        opt.value = "";
        selector.appendChild(opt);

        for (let k = 0; k < game.macros.contents.length; k++) {
            var opt = document.createElement('option');
            opt.appendChild(document.createTextNode(game.macros.contents[k].name));
            opt.value = game.macros.contents[k].id;
            selector.appendChild(opt);
        }

        if (this.item.system.macroid == "") {
            selector.value = ""
        }
        else {
            selector.value = this.item.system.macroid;
        }

    }

    async checkItemsExisting() {

        let panels = this.item.flags.panelarray;
        let changed = false;

        for (let i = 0; i < panels.length; i++) {
            let anitem = await auxMeth.getTElement(panels[i].id, "panel", panels[i].ikey)
            if (!anitem) {
                let index = panels.indexOf(panels[i]);
                if (index > -1) {
                    panels.splice(index, 1);
                    changed = true;
                }
            }
        }

        if (changed)
            this.updatePanels();
    }

    async _onDrop(event) {
        //Initial checks
        event.preventDefault();
        event.stopPropagation();
        let dropitem;
        let dropmod = false;
        let modId;

        //        if(event==null)
        //            return;

        if (event.target.classList.contains("itemdrop-area")) {
            console.log("dropping on mod");
            dropmod = true;
            modId = event.target.getAttribute("mod");
        }

        else if (event.target.parentElement.classList.contains("itemdrop-area")) {
            console.log("NOT dropping on mod");
            dropmod = true;
            modId = event.target.parentElement.getAttribute("mod");
        }

        let dropmodcitem = false;

        try {
            // 
            let dropdata = JSON.parse(event.dataTransfer.getData('text/plain'));
            dropitem = await Item.implementation.fromDropData(dropdata);

            let acceptableObj = "";
            if (this.item.type == "panel" || this.item.type == "group") {
                acceptableObj = "property";
            }

            else if (this.item.type == "sheettab" || this.item.type == "multipanel") {
                acceptableObj = "panel";
            }

            //else if(this.item.data.type=="cItem" && !this.item.data.data.isUnique){
            else if (this.item.type == "cItem") {
                acceptableObj = "group";
            }

            else if (this.item.type == "property" && this.item.system.datatype == "table") {
                acceptableObj = "group";
            }

            else if (this.item.type == "property" && this.item.system.datatype != "table") {
                acceptableObj = "panel";
            }

            else {
                console.log("object not allowed");
                return false;
            }

            if (dropitem.type !== acceptableObj) {
                if (this.item.type == "sheettab" && (dropitem.type == "multipanel" || dropitem.type == "panel")) {

                }

                else if (this.item.type == "cItem" && dropitem.type == "cItem" && dropmod) {
                    dropmodcitem = true;
                    if(dropitem.system.ciKey!=''){
                      await this.addItemToMod(modId, dropitem.id, dropitem.system.ciKey);
                    } else {
                      // also update the original citems cikey if it for some reason has lost it
                      let orginalcitem=await game.items.get(dropitem.id);
                      if(orginalcitem!=null){
                        if(orginalcitem.system.ciKey==''){
                          await orginalcitem.update({ "system.ciKey": dropitem.id });
                          console.log('Sandbox | addcItem | Patched ciKey for cItem ['+ orginalcitem.name +']')
                        }
                      }
                      await this.addItemToMod(modId, dropitem.id, dropitem.id);
                    }
                }


                else if (this.item.type == "cItem" && (dropitem.type == "panel" || dropitem.type == "multipanel") && this.item.system.hasdialog) {

                }

                else if (this.item.type == "property" && dropitem.type == "multipanel" && this.item.system.hasdialog) {

                }

                else {
                    console.log("object not allowed");
                    return false;
                }

            }


        }
        catch (err) {
            console.log("ItemCollection | drop error")
            console.log(event.dataTransfer.getData('text/plain'));
            console.log(err);
            return false;
        }

        if (dropmodcitem)
            return;

        let keyCode = this.getitemKey(dropitem);
        let itemKey = dropitem.system[keyCode];

        const itemData = this.item.system;
        //console.log(itemKey + " " + keyCode);
        let newItem = {}
        setProperty(newItem, itemKey, {});
        newItem[itemKey].id = dropitem.id;
        newItem[itemKey].name = dropitem.name;
        newItem[itemKey].ikey = itemKey;
        //console.log(newItem);
        if (this.item.type == "group" && dropitem.type == "property") {
            newItem[itemKey].isconstant = true;
        }

        //console.log(newItem);

        if (this.item.type != "property") {
            //Add element id to panel
            const subitems = await this.getsubItems();
            //console.log(subitems);

            for (let i = 0; i < subitems.length; i++) {
                if (subitems[i].id == dropitem.id) {
                    return;
                }
            }

            if (!subitems.find(y => y.id == newItem[itemKey].id))
                await subitems.push(newItem[itemKey]);



            if (this.item.type == "cItem" && dropitem.type == "group" && dropitem.system.isUnique) {
                itemData.isUnique = true;
                itemData.uniqueGID = dropitem.id;
                await this.item.update({ "system": itemData });
            }

            else if (this.item.system.hasdialog && (dropitem.type == "panel" || dropitem.type == "multipanel")) {
                const myitem = this.item.system;
                await this.item.update({ "system.dialogID": dropitem.id, "system.dialogName": dropitem.system.panelKey });
            }

            else {
                await this.updateLists(subitems);

            }



        }

        else {

            if (this.item.system.datatype == "table" && dropitem.type == "group") {
                const myitem = this.item.system;
                myitem.group.id = dropitem.id;
                //TODO --- No sería Title?
                myitem.group.name = dropitem.name;
                myitem.group.ikey = itemKey;
                this.item.system.group = myitem.group;
                //await this.item.update(this.item.data);

                await this.item.update({ "system.group": myitem.group });
            }
            else if (this.item.system.hasdialog && (dropitem.type == "panel" || dropitem.type == "multipanel")) {
                const myitem = this.item.system;

                await this.item.update({ "system.dialogID": dropitem.id, "system.dialogName": dropitem.system.panelKey });
            }


        }
        //console.log("updated");
        //console.log(this.item.data.data);

    }

    getsubItems() {

        let subitems;

        if (this.item.type == "panel" || this.item.type == "group") {
            subitems = this.item.system.properties;
        }

        else if (this.item.type == "sheettab" || this.item.type == "multipanel") {
            subitems = this.item.system.panels;
        }

        else if (this.item.type == "cItem") {
            subitems = this.item.system.groups;
        }

        //console.log(subitems);

        return subitems;
    }

    getitemKey(itemdata) {

        let objKey;
        //console.log(itemdata.type);
        if (itemdata.type == "property") {
            objKey = "attKey";
        }

        else if (itemdata.type == "panel" || itemdata.type == "multipanel") {
            objKey = "panelKey";
        }

        else if (itemdata.type == "group") {
            objKey = "groupKey";
        }

        return objKey;
    }

    async updateLists(subitems) {
        if (this.item.type == "panel" || this.item.type == "group") {
            await this.item.update({ "system.properties": subitems });
            //this.item.data.data.properties = subitems;
        }

        else if (this.item.type == "sheettab" || this.item.type == "multipanel") {
            await this.item.update({ "system.panels": subitems });
            //this.item.data.data.panels = subitems;
        }

        else if (this.item.type == "cItem") {
            //console.log(subitems);
            await this.item.update({ "system.groups": subitems });
            //this.item.data.data.groups = subitems;
        }

        //console.log("updated");
        //await this.item.update(this.item.data);

        return subitems;
    }

    async checkStillUnique() {
        let isUnique = false;
        const groups = this.item.system.groups;
        for (let j = groups.length - 1; j >= 0; j--) {
            let groupId = groups[j].id;
            //let groupObj = game.items.get(groupId);
            let groupObj = await auxMeth.getTElement(groupId, "group", groups[j].ikey);

            //Checks if group still exist
            if (groupObj != null) {
                if (groupObj.system.isUnique) {
                    isUnique = true;
                }
            }
            else {
                groups.splice(j, 1);
            }

        }
        //console.log(isUnique);
        if (isUnique) {
            if (!this.item.system.isUnique) {
                this.item.system.isUnique = true;
            }
        }
        else {
            if (this.item.system.isUnique) {
                this.item.system.isUnique = false;
            }
        }
    }

    async refreshCIAttributes(basehtml) {
        //console.log("updating CItem attr");

        //const html = await basehtml.find(".attribute-list")[0];
        //html.innerHTML = '';
        let attributetable=await basehtml.find(".attribute-table-body")[0];

        let attrArray = [];
        let tosave = false;

        let attributes = this.item.system.attributes ?? this.options.system.attributes;
        let groups = this.item.system.groups ?? this.options.system.groups;
        let newgroups = duplicate(groups);
        let changegroups = false;
        for (let j = groups.length - 1; j >= 0; j--) {
            let groupId = groups[j].id;
            //let propObj = game.items.get(groupId);
            let propObj = await auxMeth.getTElement(groupId, "group", groups[j].ikey);

            if (groupId != propObj.id) {
                changegroups = true;
                newgroups[j].id = propObj.id;
            }

            if (propObj != null) {
                let propertyIds = propObj.system.properties;
                let tbl_row;
                let tbl_cell;
                for (let i = propertyIds.length - 1; i >= 0; i--) {
                    
                    let propertyId = propertyIds[i].id;
                    //let ppObj = game.items.get(propertyId);
                    let ppObj = await auxMeth.getTElement(propertyId, "property", propertyIds[i].ikey);

                    if (ppObj != null) {
                        if (!ppObj.system.ishidden || game.user.isGM) {
                            let property = ppObj.system;

//                            let new_container = document.createElement("DIV");
//                            new_container.className = "new-row";
//                            new_container.setAttribute("id", "row-" + i);
//
//                            let new_row = document.createElement("DIV");
//                            new_row.className = "flexblock-left";
//                            new_row.setAttribute("id", i);

                            tbl_row  = attributetable.insertRow(0);


                            if (property.datatype != "group" && property.datatype != "label") {
                                let label = document.createElement("H3");
                                label.className = "label-free";
                                if(property.tag==''){
                                  label.textContent = ppObj.name;
                                } else {
                                  label.textContent = property.tag;
                                }
                                let input;
                                /// check if this citem has this property 
                                if (!hasProperty(attributes, property.attKey)) {
                                    setProperty(attributes, property.attKey, {});
                                    let value='';
                                    if (property.datatype === "simplenumeric") {
                                      value = await auxMeth.autoParser(property.defvalue, null, attributes, false);
                                      value = await game.system.api._extractAPIFunctions(value,null, attributes, false); 
                                    } 
                                    else if (property.datatype === "list") {
                                      if(property.defvalue!=''){
                                        value = await auxMeth.autoParser(property.defvalue, null, attributes, true);
                                        value = await game.system.api._extractAPIFunctions(value,null, attributes, true); 
                                      } else{
                                        // use the first entry of the list as value
                                        value = await auxMeth.getListPropertyFirstOption(ppObj,null, attributes);
                                      }
                                    }
                                    else {
                                      value = await auxMeth.autoParser(property.defvalue, null, attributes, true);
                                      value = await game.system.api._extractAPIFunctions(value,null, attributes, true); 
                                    }
                                    attributes[property.attKey].value = value;
                                    tosave = true;
                                }
                                let attribute = attributes[property.attKey];
                                if (attribute.ishidden == null) {
                                    attribute.ishidden = false;
                                    tosave = true;
                                }
                                
                                if (attribute.value == null) {
                                  attribute.value = "";
                                }
                                
                                if (attribute.value == "") {
                                  if (property.datatype === "simplenumeric" || property.datatype === "radio") {                                        
                                    attribute.value = 0;
                                  }                                    
                                }

                                if (property.datatype != "list") {
                                    //console.log("editando");

                                    if (property.datatype === "textarea") {
                                        input = document.createElement("TEXTAREA");
                                        input.setAttribute("name", property.attKey);
                                        input.textContent = attribute.value;
                                        if (property.inputsize == "S") {
                                            input.className = "texteditor-small";
                                        }

                                        else if (property.inputsize == "L") {
                                            input.className = "texteditor-large";
                                        }
                                        else {
                                            input.className = "texteditor-med";
                                        }
                                    } 
                                    else if (property.datatype === "radio") {
                                      let readOnly=false;
                                      if (!property.editable && !game.user.isGM)
                                        readOnly=true;
                                      if (property.auto!=''){
                                        readOnly=true;
                                      } 
                                    
                                      let maxValue=await auxMeth.autoParser(property.automax, null, attributes, false);;                                      
                                      let value=this.item.system.attributes[property.attKey].value;
                                      if(maxValue<value){ 
                                        maxValue=value;
                                      }
                                      input=await this.createRadioInputsForcItem(this.item,ppObj,value,maxValue,ppObj.system.radiotype,ppObj.system.radiotype,readOnly);
                                    }
                                    else {
                                        input = document.createElement("INPUT");
                                        input.setAttribute("name", property.attKey);
                                        if (property.datatype === "simplenumeric") {
                                            input.setAttribute("type", "number");
                                            input.className = "input-smallmed";
                                            if (property.auto != "" && property.auto != null) {
                                                let atvalue = await auxMeth.autoParser(property.auto, null, attributes, false);
                                                input.setAttribute("value", atvalue);
                                                input.setAttribute("readonly", "true");
                                            }
                                            else {
                                                input.setAttribute("value", attribute.value);
                                            }

                                        }
                                        else if (property.datatype === "simpletext") {
                                            input.setAttribute("type", "text");
                                            input.className = "input-med";
                                            input.setAttribute("value", attribute.value);
                                        }

                                        else if (property.datatype === "checkbox") {
                                            input.setAttribute("type", "checkbox");
                                            let setvalue = false;
                                            //console.log(attribute.value);
                                            if (attribute.value === true || attribute.value === "true") {
                                                setvalue = true;
                                            }

                                            if (attribute.value === "false")
                                                attribute.value = false;

                                            //console.log(setvalue);
                                            input.checked = setvalue;
                                        }
                                    }

                                }
                                //LIST
                                else {
                                  input = document.createElement("SELECT");
                                  input.className = "input-med";
                                  input.setAttribute("name", property.attKey);
                                  // add options to list
                                  let addList=await auxMeth.getListPropertyOptions(ppObj,null, attributes);                                                                                                      
                                  
                                  if(addList.length>0){
                                    input=auxMeth.addOptionsToSelectFromList(input,addList,attribute.value,'|',true)
                                  }
                                }

                                label.className += " att-input-label";
                                
                                if (property.datatype != "radio") {
                                  input.className += " att-input";
                                  input.addEventListener("change", (event) => this.updateFormInput(event.target.name, event.target.value, propertyId, propertyIds[i].ikey));                                                                
                                  if (!game.user.isGM) {
                                    input.setAttribute("readonly", "true");
                                  }
                                }

                                tbl_cell = tbl_row.insertCell(-1);
                                tbl_cell.className='sb-citem-attribute-list-entry-label';
                                
                                let cell_label;
                                if(property.tag==''){
                                  cell_label = ppObj.name;
                                } else {
                                   cell_label= property.tag;
                                }

                                
                                let cell_content=auxMeth.sb_two_col_card(`<img title="${cell_label}" src="${ppObj.img}" class="sb-citem-table-icon" /> `,  cell_label);
                            
                                tbl_cell.innerHTML=cell_content;
                                
                                tbl_cell.addEventListener('click', function(){
                                  const item=game.items.get(ppObj.id);
                                  if(item!=null){
                                    item.sheet.render(true,{focus:true});
                                  }
                                });
                                
                                                                
                                
                                tbl_cell = tbl_row.insertCell(-1);
                                if (property.datatype != "label")
                                    tbl_cell.appendChild(input);
                                    

                                

                                //TEST
                                // if(!property.ishidden){
                                //     let new_div = document.createElement("DIV");
                                //     new_div.className = "citem-attribute";

                                //     let mode_block = document.createElement("INPUT");
                                //     mode_block.className = "visible-input";
                                //     mode_block.setAttribute("id", i);
                                //     mode_block.setAttribute("type", "checkbox");
                                //     let setvalue = false;

                                //     if (attribute.ishidden == null)
                                //         attribute.ishidden = false;

                                //     if (attribute.ishidden === true || attribute.ishidden === "true") {
                                //         setvalue = true;
                                //     }

                                //     if (attribute.ishidden === "false")
                                //         attribute.ishidden = false;


                                //     mode_block.checked = setvalue;
                                //     mode_block.addEventListener("change", (event) => this.updateAttVisibility(property.attKey, event.target.checked));
                                //     //TEST END

                                //     new_div.appendChild(mode_block);
                                //     await new_row.appendChild(new_div);
                                // }

                                //await html.appendChild(new_container);

                            }
                        }

                    }

                    else {
                        propertyIds.splice(i, 1);
                    }



                }
            }

            else {
                groups.splice(j, 1);
            }

        }
        //console.log(html);
        if (this.item.permission.default > CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER || this.item.permission[game.user.id] > CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER || game.user.isGM) {
            if (tosave) {
                this.item.update({ "system.attributes": attributes });
                //this.item.data.data.attributes = attributes;
                //this.item.update(this.item.data);
            }

            if (changegroups) {
                this.item.update({ "system.groups": newgroups });
            }
        }



    }

    async createRadioInputsForcItem(citem,property,value,maxValue,onIcon,offIcon,readOnly){
      let radioInput=document.createElement("DIV");
      radioInput.setAttribute('class',`radio-input-citem ${property.system.attKey} ${property.system.inputgroup}`);
      radioInput.setAttribute('data-property-key',property.system.attKey);
      radioInput.setAttribute('data-property-type','radio');
      radioInput.setAttribute('attid',property.id);
      if (!readOnly){
        let anchor=document.createElement('A');
        anchor.setAttribute('clickvalue','0');
        anchor.setAttribute('class','radio-element');
        anchor.setAttribute('data-property-key',property.system.attKey);
        anchor.setAttribute('data-radio-element-value','0');
        let radio=document.createElement('I');
        radio.setAttribute('class','far ' + property.system.radioResetIcon);
        anchor.addEventListener("click",async (event) =>                     
          await this.item.update({ [`system.attributes.${property.system.attKey}.value`]: '0' })
        );
        
        anchor.appendChild(radio);
        radioInput.appendChild(anchor);
      }
      
      for (let i = 1; i <= maxValue; i++) {
        let radio=document.createElement('I');
        if(value>=i){
          radio.setAttribute('class','fas ' + onIcon);
        } else{
          radio.setAttribute('class','far ' + offIcon);
        }
        
        if(!readOnly){
          let anchor=document.createElement('A');
          anchor.setAttribute('clickvalue','i');
          anchor.setAttribute('class','radio-element');
          anchor.setAttribute('data-property-key',property.system.attKey);
          anchor.setAttribute('data-radio-element-value',i);
          anchor.appendChild(radio);
          anchor.addEventListener("click", async (event) =>             
            await this.item.update({ [`system.attributes.${property.system.attKey}.value`]: i.toString() })
          );
          radioInput.appendChild(anchor);
        } else {
          radioInput.appendChild(radio);
        }                
      }      
      return radioInput;
    }


    async updateAttVisibility(name, value) {

        await this.item.update({ [`system.attributes.${name}.ishidden`]: value });
    }

    async updateFormInput(name, value, propId, propKey) {
      //console.log('sItemSheet | updateFormInput');
        //console.log(value);
        let setvalue;

        //let propObj = await game.items.get(propId);
        let propObj = await auxMeth.getTElement(propId, "property", propKey);
        if (propObj.system.datatype == "checkbox") {
            setvalue = true;
            let attKey = [propObj.system.attKey];

            let currentvalue = this.item.system.attributes[attKey].value;

            if (currentvalue == true || currentvalue == "true") {
                setvalue = false;
            }

            this.item.system.attributes[propObj.system.attKey].value = setvalue;

        }

        else {
            setvalue = value;
            this.item.system.attributes[propObj.system.attKey].value = setvalue;

        }

        await this.item.update({ [`system.attributes.${name}.value`]: setvalue });
        //await this.item.update({"data.attributes":this.item.data.data.attributes},{diff:false});

        //this.item.update(this.item.data);
    }


    async adnewCIMod() {
        const mods = this.item.system.mods;

        let newindex = mods.length - 1;
        if (newindex < 0) {
            newindex = 0;
        }
        else {

            newindex = mods[mods.length - 1].index + 1;
        }

        let newMod = {};
        newMod.name = "New Mod";
        newMod.index = newindex;
        newMod.type = "ADD";
        newMod.attribute = "";
        newMod.selectnum = "";
        newMod.listmod = "INCLUDE";
        newMod.items = [];
        newMod.citem = this.item.id;


        await mods.push(newMod);

        await this.item.update({ "system.mods": mods });

        //this.item.update(this.item.data);

        //console.log(mods);
    }

    async editmodInput(index, name, value) {
        const mods = this.item.system.mods;
        const obj = mods[index];
        obj[name] = value;
        //this.item.data.data.mods = mods;

        //this.item.update(this.item.data);

        this.item.update({ "system.mods": mods });
    }

    async deletemodInput(index) {
        const mods = this.item.system.mods;
        mods.splice(index, 1);


        this.item.update({ "system.mods": mods });

        //this.item.update(this.item.data);
    }

    async addItemToMod(modId, citemId, ciKey) {
        //console.log(citemId);
        const mods = this.item.system.mods;
        const mod = mods[modId];
        //let citem = game.items.get(citemId);
        let citem = await auxMeth.getcItem(citemId, ciKey);
        let arrayItem = {};
        arrayItem.id = citemId;
        arrayItem.name = citem.name;
        arrayItem.ciKey = ciKey;

        if (!mod.items.includes(citemId))
            mod.items.push(arrayItem);
        this.item.update({ "system.mods": mods });

        //this.item.update(this.item.data);
    }

    async customCallOverride(basehtml, data) {

    }


async upDateTabBodiesHeight(){
      let basehtml = this.element;
      if(!basehtml.hasOwnProperty('length')) 
         return 
      //let bground = basehtml.find(".window-content");
      let sheader = await basehtml.find(".sheet-header");
      let wheader = await basehtml.find(".window-header");
      let stabs = await basehtml.find(".atabs");
      let tabhandler = await basehtml.find(".tab");
      for (let j = 0; j < tabhandler.length; j++) {
          let mytab = tabhandler[j];

          let totalheight = parseInt(basehtml[0].style.height) - parseInt(wheader[0].clientHeight) - parseInt(sheader[0].clientHeight) - parseInt(stabs[0].clientHeight) - 15;
          mytab.style.height = totalheight + "px";
      } 
      this.sheetHasBeenResized=true; 
    }
    async scrollBarTest(basehtml) {
        const wcontent = await this._element[0].getElementsByClassName("window-content");
        let newheight = parseInt(wcontent[0].offsetHeight) - 152;

        const html = await basehtml.find(".scrollable");
        for (let i = 0; i < html.length; i++) {
            let scrollNode = html[i];
            scrollNode.style.height = newheight + "px";

        }

    }

    // call before super._render
    async _saveScrollStates() {

        //console.log("getting scroll");
        let scrollStates = [];

        let html = this._element;

        if (html == null)
            return;

        let lists = html.find(".scrollable");

        for (let list of lists) {
            scrollStates.push($(list).scrollTop());
        }

        return scrollStates;
    }

    // call after super._render
    async _setScrollStates() {
        //console.log("setting scroll");
        let html = this._element;

        if (html == null)
            return;

        if (this.scrollStates) {

            let lists = html.find(".scrollable");

            for (let i = 0; i < lists.length; i++) {
                let newEl = $(lists[i]);
                let newScroll = parseInt(this.scrollStates[i]);
                newEl[0].scrollTop = newScroll;
            }
        }
    }

    async _render(force = false, options = {}) {

        this.scrollStates = await this._saveScrollStates();

        await super._render(force, options);

    }

    /** @override */
    async _updateObject(event, formData) {
      //console.log('sItemSheet | _updateObject')
      if(this.item.type == "lookup"){
        const data = foundry.utils.expandObject(formData);
        // convert lookup table json string to object
        data.system.lookupTable=sb_string_to_lookupTable(data.lookupTable);
        //                              
        return this.object.update(data);
        
        
      } else {
        super._updateObject(event, formData);
      }
    }
}
