import { SBOX } from "./config.js";
import { auxMeth } from "./auxmeth.js";
import { SETTINGATTRIBUTE }           from "./sb-setting-constants.js";
import { sb_custom_dialog_confirm,
         confirmRemoveSubItem } from "./sb-custom-dialogs.js";
import { sb_item_sheet_get_game_setting } from "./sb-setting-constants.js";
import { sb_table_filter_passed } from "./sb-table-filters.js";
import { sb_property_has_valid_table_filter } from "./sb-table-filters.js";
import { lookupList } from "./sb-lookup-table.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */

export class gActorSheet extends ActorSheet {

    /** @override */
    static get defaultOptions() {
      
        return mergeObject(super.defaultOptions, {
            classes: ["sandbox", "sheet", "actor"],
            scrollY: [".sheet-body", ".scrollable", ".tab"],
            width: 650,
            height: 600,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
        });
    }

    /* -------------------------------------------- */

    /** @override */
    async getData() {
        const actor = this.actor;
        const data = super.getData();        
        let secrets = this.actor.isOwner;
        
        if (game.user.isGM) secrets = true;
        data.enrichedBiography = await TextEditor.enrichHTML(this.actor.system.biography, {secrets:secrets, entities:true,async: true});
        const flags = actor.flags;

        //console.log('getData',data);

        return data;
    }

    /* -------------------------------------------- */

    /** @override */
    //    get template() {
    //        return this.getHTMLPath();
    //    }

    async maximize() {
        //console.log('maximize')
        //let _mytemplate = await game.actors.find(y => y.system.istemplate && y.system.gtemplate == this.actor.system.gtemplate);
        let _mytemplate = await auxMeth.getActorTemplate(this.actor.system.gtemplate);
        if (_mytemplate != null)
            this.position.height = _mytemplate.system.setheight;
        super.maximize();
    }

    async _renderInner(data, options) {
        let templateHTML = await auxMeth.getTempHTML(this.actor.system.gtemplate, this.actor.system.istemplate);

        //IMPORTANT!! ANY CHECKBOX IN TEMPLATE NEEDS THIS!!!
        templateHTML = templateHTML.replace('{{checked="" actor.system.biovisible}}=""', '{{checked actor.system.biovisible}}');
        templateHTML = templateHTML.replace('{{checked="" actor.system.resizable}}=""', '{{checked actor.system.resizable}}');
        templateHTML = templateHTML.replace('{{checked="" actor.system.istemplate}}=""', '{{checked actor.system.istemplate}}');

        const template = await Handlebars.compile(templateHTML);

        const html = template(duplicate(data));
        this.form = $(html)[0];

        if (html === "") throw new Error(`No data was returned from template`);
        return $(html);
    }

    async getTemplateHTML(_html) {
        if (this.actor.system.istemplate && this.actor.system.gtemplate != "Default") {
            let _template = game.actors.find(y => y.system.istemplate && y.system.gtemplate == this.actor.system.gtemplate);
            let html = _template.system._html;
            return html;
        }

        else {
            return _html;
        }

    }


    /* -------------------------------------------- */

    /** @override */
    activateListeners(html) {
        //console.log(html);
        super.activateListeners(html);

        const actor = this.actor;

        // Activate tabs
        let tabs = html.find('.tabs');
        let initial = this._sheetTab;

        new TabsV2(tabs, {
            initial: initial,
            callback: clicked => {
                this._sheetTab = clicked.data("tab");
                let li = clicked.parents(".tabs");
                let alltabs = li.children();
                //                for(let i=0;i<alltabs.length;i++){
                //                    let tab = alltabs[i];
                //                    let datatab = tab.getAttribute("data-tab");
                //                    if(datatab==clicked.data("tab")){
                //                        actor.data.flags.selectedtab = i;
                //                    }
                //
                //                }

            }
        });
        
        
        html.find('.gsheet-backg-filepicker').click(ev => {

            new FilePicker({
                type: "image",
                displayMode: "tiles",
                current: this.actor.system.backg,
                callback: imagePath => this.actor.update({ "system.backg": imagePath })
            }).browse(this.actor.system.backg);
        });

        
        html.find('.tab-button').click(ev => {
            ev.preventDefault();

            const tabs = $(this._element)[0].getElementsByClassName("tab-button");
            let firstpassed = false;

            for (let x = 0; x < tabs.length; x++) {
                if (tabs[x].classList.contains("underlined"))
                    tabs[x].className = tabs[x].className.replace("underlined", "");

                if (tabs[x].classList.contains("visible-tab") && !firstpassed) {
                    firstpassed = true;
                    this._tabs[0].firstvisible = tabs[x].dataset.tab;
                }

            }

            let thistab = $(ev.currentTarget);
            //console.log(thistab);
            thistab[0].className += " underlined";

        });

        html.find('.macrobutton').click(ev => {
            ev.preventDefault();
            const li = $(ev.currentTarget);
            let macroId = $(ev.currentTarget).attr("macroid");
            let macro = game.macros.get(macroId);
            macro.execute();
        });

        html.find('.badge-click').click(async (ev) => {
            ev.preventDefault();
            const attributes = this.actor.system.attributes;

            let attKey = $(ev.currentTarget).attr("attKey");
            let attId = $(ev.currentTarget).attr("attId");
            //let property = game.items.get(attId);
            let property = await auxMeth.getTElement(attId, "property", attKey);

            let oldvalue = parseInt(attributes[attKey].value);

            if (oldvalue < 1)
                return;

            let newvalue = oldvalue - 1;

            if (newvalue < 0)
                newvalue = 0;

            if (newvalue > attributes[attKey].max) {
                newvalue = attributes[attKey].max;
            }

            let stringvalue = "";
            stringvalue = newvalue.toString();

            await this.actor.update({ [`system.attributes.${attKey}.value`]: stringvalue });

            this.actor.sendMsgChat("USES 1 ", property.system.tag, "TOTAL: " + newvalue);
            if (property.system.rollexp != "")
                this._onRollCheck(attId, attKey, null, null, false);
            //this.actor.sendMsgChat("Utiliza 1",property.data.data.tag, "Le quedan " + newvalue); to  this.actor.sendMsgChat("Uses 1",property.data.data.tag, "Remains " + newvalue);

        });

        html.find('.badge-clickgm').click(async (ev) => {
            ev.preventDefault();
            const attributes = this.actor.system.attributes;

            let attKey = $(ev.currentTarget).attr("attKey");

            let newvalue = await parseInt(attributes[attKey].value) + 1;

            if (newvalue > attributes[attKey].max) {
                newvalue = attributes[attKey].max;
            }

            let stringvalue = "";
            stringvalue = newvalue.toString();

            await this.actor.update({ [`system.attributes.${attKey}.value`]: stringvalue });

        });

        html.find('.arrup').click(async (ev) => {
            ev.preventDefault();
            const attributes = this.actor.system.attributes;

            let attKey = ev.target.parentElement.getAttribute("attKey");

            let arrlock = ev.target.parentElement.getAttribute("arrlock");

            if (arrlock != null && !game.user.isGM)
                return;

            let newvalue = parseInt(attributes[attKey].value) + 1;

            let stringvalue = "";
            stringvalue = newvalue.toString();

            await this.actor.update({ [`system.attributes.${attKey}.value`]: stringvalue });

        });

        html.find('.arrdown').click(async (ev) => {
            ev.preventDefault();
            const attributes = this.actor.system.attributes;

            let attKey = ev.target.parentElement.getAttribute("attKey");

            let arrlock = ev.target.parentElement.getAttribute("arrlock");

            if (arrlock != null && !game.user.isGM)
                return;

            let newvalue = parseInt(attributes[attKey].value) - 1;

            let stringvalue = "";
            stringvalue = newvalue.toString();

            await this.actor.update({ [`system.attributes.${attKey}.value`]: stringvalue });

        });

        // table header sorting
        html.find('.propheader').click(ev => {
            event.preventDefault();

            let attKey = $(ev.currentTarget).attr("attKey");
            let tableKey = ev.target.parentElement.getAttribute("tableKey");
            if (this.sortOption == null)
                this.sortOption = {};
            this.sortOption[tableKey] = attKey;
            this.render(true);

        });

        html.find('.nameheader').click(ev => {
            event.preventDefault();

            let attKey = $(ev.currentTarget).attr("attKey");
            let tableKey = ev.target.parentElement.getAttribute("tableKey");
            if (this.sortOption == null)
                this.sortOption = {};
            this.sortOption[tableKey] = "name";
            this.render(true);

        });
        
        

        html.find('.rollable').click(ev => {
            ev.preventDefault();
            //console.log("Aqui");
            let attId = $(ev.currentTarget).attr("attid");
            let citemId;
            citemId = $(ev.currentTarget).attr("item_id");
            let attKey = $(ev.currentTarget).attr("id");
            this._onRollCheck(attId, attKey, citemId, null, false);

        });

        // Alondaar Drag events for macros.
        if (this.actor.isOwner) {
            let handler = ev => this._onDragStart(ev);
            // Find all items on the character sheet.
            html.find('.rollable').each((i, rollable) => {
                // Add draggable attribute and dragstart listener.
                rollable.setAttribute("draggable", true);
                rollable.addEventListener("dragstart", handler, false);
            });
        }

        html.find('.customcheck').click(ev => {
            ev.preventDefault();
            //console.log("Aqui");
            let attKey = $(ev.currentTarget).attr("attKey");

            if (this.actor.system.attributes[attKey] == null) {
                return;
            }

            let currentvalue = this.actor.system.attributes[attKey].value;
            let finalvalue = true;
            if (currentvalue)
                finalvalue = false;

            this.actor.update({ [`system.attributes.${attKey}.value`]: finalvalue, [`system.attributes.${attKey}.modified`]: true });

        });

        html.find('.roll-mode').click(ev => {
            event.preventDefault();
            const elemCode = $(ev.currentTarget)[0].children[0];

            const actorData = this.actor.system;

            if (elemCode.textContent == "1d20") {
                actorData.rollmode = "ADV";
            }

            else if (elemCode.textContent == "ADV") {
                actorData.rollmode = "DIS";
            }
            else {
                actorData.rollmode = "1d20";
            }

            this.actor.update({ "system.rollmode": actorData.rollmode }, { diff: false });

        });


        html.find('.tab-prev').click(ev => {
            event.preventDefault();
            //this.displaceTabs(true,html);
            this.displaceTabs2("prev", html);
        });

        html.find('.tab-next').click(ev => {
            event.preventDefault();
            //this.displaceTabs(false,html);
            this.displaceTabs2("next", html);
        });
        html.find('.roll-free').click(ev => {
            event.preventDefault();
            let d = new Dialog({
                title: "Select Items",
                content: '<input class="dialog-dice" type=text id="dialog-dice" value=1d6>',
                buttons: {
                    one: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "OK",
                        callback: async (html) => {
                            let diceexpr = html[0].getElementsByClassName("dialog-dice");
                            //console.log(diceexpr[0]);
                            let finalroll = this.actor.rollSheetDice(diceexpr[0].value, "Free Roll", "", this.actor.system.attributes, null);

                        }
                    },
                    two: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Cancel",
                        callback: () => { console.log("canceling dice"); }
                    }
                },
                default: "one",
                close: () => console.log("Item roll dialog was shown to player.")
            });
            d.render(true);

        });

        html.find('.mod-selector').click(async (ev) => {
            event.preventDefault();

            //Get items
            const citems = this.actor.system.citems;
            let allselitems = citems.filter(y => y.selection != null);
            let selectcitems = allselitems.find(y => y.selection.find(x => !x.selected));
            if (selectcitems == null)
                return;

            //let citemplate = game.items.get(selectcitems.id);
            let citemplate = await auxMeth.getcItem(selectcitems.id, selectcitems.ciKey);
            let acitem = selectcitems.selection.find(y => !y.selected);

            let modindex = acitem.index;
            let mod = citemplate.system.mods.find(y => y.index == modindex);

            //Right Content
            let newList = document.createElement("DIV");
            newList.className = "item-dialog";
            newList.setAttribute("actorId", this.actor.id);

            //Fill options
            if (mod.type == "ITEM") {
                let finalnum = await auxMeth.autoParser(mod.selectnum, this.actor.system.attributes, acitem.attributes, false);
                newList.setAttribute("selectnum", finalnum);
                let text = document.createElement("DIV");

                text.className = "centertext";
                text.textContent = "Please select " + finalnum + " items:";
                newList.appendChild(text);

                for (let n = 0; n < mod.items.length; n++) {

                    let ispresent = citems.some(y => y.id == mod.items[n].id);

                    if (!ispresent) {
                        let newItem = document.createElement("DIV");
                        newItem.className = "flexblock-center-nopad";

                        let newcheckBox = document.createElement("INPUT");
                        newcheckBox.className = "dialog-check";
                        newcheckBox.setAttribute("type", "checkbox");
                        newcheckBox.setAttribute("itemId", mod.items[n].id);
                        newcheckBox.setAttribute("ciKey", mod.items[n].ciKey);

                        let itemDescription = document.createElement("LABEL");
                        itemDescription.textContent = mod.items[n].name;
                        itemDescription.className = "linkable";
                        itemDescription.setAttribute("itemId", mod.items[n].id);
                        itemDescription.setAttribute("ciKey", mod.items[n].ciKey);

                        newItem.appendChild(newcheckBox);
                        newItem.appendChild(itemDescription);
                        newList.appendChild(newItem);
                    }

                }
            }



            let d = new Dialog({
                title: mod.name,
                content: newList.outerHTML,
                buttons: {
                    one: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "OK",
                        callback: async (html) => {
                            const flags = this.actor.flags;
                            let subitems;
                            var checkedBoxes = html.find('.dialog-check');

                            for (let i = 0; i < checkedBoxes.length; i++) {
                                if (!checkedBoxes[i].checked)
                                    continue;
                                let citemId = checkedBoxes[i].getAttribute("itemid");
                                let citemIkey = checkedBoxes[i].getAttribute("cikey");
                                acitem.selected = true;
                                //let selcitem = game.items.get(citemId);
                                let selcitem = await auxMeth.getcItem(citemId, citemIkey);
                                subitems = await this.actor.addcItem(selcitem, selectcitems.id);
                            }
                            if (subitems)
                                await this.updateSubItems(false, subitems);
                        }
                    },
                    two: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Cancel",
                        callback: () => { console.log("canceling selection"); }
                    }
                },
                default: "one",
                close: () => console.log("cItem selection dialog was shown to player."),
                citemdialog: true
            });
            d.render(true);
        });

        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        //Drop Event TEST
        this.form.ondrop = ev => this._onDrop(ev);

        let stabs = duplicate(actor.system.tabs);
        let citems = actor.system.citems;
        let istemplate = actor.system.istemplate;

        // Edit Tab item
        html.find('.item-edit').click(async (ev) => {
            const li = $(ev.currentTarget).parents(".property");
            const tab = stabs[li.data("itemId")];
            //const item = game.items.get(tab.id);
            const item = await auxMeth.getTElement(tab.id, "sheettab", tab.ikey);
            item.sheet.render(true);
        });

        // Delete tab Item
        html.find('.item-delete').click(async(ev) => {
            const li = $(ev.currentTarget).parents(".property");
            let todelete = li.data("itemId");
            // ask user for confirmation            
            const bOkToProceed=await confirmRemoveSubItem(this.actor.name,game.i18n.localize("DOCUMENT.Actor").toLowerCase(),stabs[todelete].name,game.i18n.localize("SANDBOX.ItemTypeSheetTab"));
            if(bOkToProceed){                        
              const prop = stabs.splice(todelete, 1);
              this.actor.update({ "system.tabs": stabs });
              li.slideUp(200, () => this.render(false));
            }
        });

        // Edit citem
        html.find('.citem-edit').click(async (ev) => {
            const li = $(ev.currentTarget).parents(".property");
            const tab = citems[li.data("itemId")];
            //const item = game.items.get(tab.id);
            const item = await auxMeth.getcItem(tab.id, tab.ciKey);
            item.sheet.render(true);
        });

        // Delete cItem from list on citem tab
        html.find('.citem-delete').click(async(ev) => {
            const li = $(ev.currentTarget).parents(".property");
            let itemid = ev.target.parentElement.getAttribute("citemid");
            const item=game.items.get(itemid);
            if(item!=null){
              // ask user for confirmation              
              const bOkToProceed=await confirmRemoveSubItem(this.actor.name,game.i18n.localize("DOCUMENT.Actor").toLowerCase(),item.name,item.type);
              if(bOkToProceed){            
                this.deleteCItem(itemid);
                li.slideUp(200, () => this.render(false));
              }
            } else {
              ui.notifications.warn('Sandbox | Unable to find item ' + itemid +  '] in world database, removing it from actor');   
              this.deleteCItem(itemid);
              li.slideUp(200, () => this.render(false));
            }
        });

        // Top Item
        html.find('.item-top').click(ev => {
            const li = $(ev.currentTarget).parents(".property");
            let itemindex = li.data("itemId");
            if (itemindex > 0)
                stabs.splice(itemindex - 1, 0, stabs.splice(itemindex, 1)[0]);
            this.updateSubItems(true, stabs);
        });

        // Bottom Item
        html.find('.item-bottom').click(ev => {
            const li = $(ev.currentTarget).parents(".property");
            let itemindex = li.data("itemId");
            if (itemindex < stabs.length - 1)
                stabs.splice(itemindex + 1, 0, stabs.splice(itemindex, 1)[0]);
            this.updateSubItems(true, stabs);
        });

        //Rebuild Sheet
        html.find('.item-refresh').click(ev => {
            this.buildSheet();
        });

        //Change sheet and set attribute ids
        html.find('.selectsheet').change(ev => {
            event.preventDefault();
            const li = $(ev.currentTarget);

            let actorData = duplicate(this.actor.system);
            this.setTemplate(li[0].value, actorData);

            //this.refreshSheet(li[0].value);
            //this.actor.update({"data.gtemplate": li[0].value});

        });

        html.find('.sheet-reload').click(ev => {
            event.preventDefault();
            this.setTemplate(this.actor.system.gtemplate, null);

        });

    }

    /* ALONDAAR
    * Sets up the data transfer within a ondrop event. This function is triggered
    * when the user starts dragging any rollable element, and dataTransfer is set to the 
    * relevant data needed by the _onDrop function.
    */
    _onDragStart(event, attrID = null, attKey = null, citemID = null, citemKey = null, ciRoll = false, isFree = false, tableKey = null, useData = null) {
        // If lazily calling _onDragStart(event) with no other parameters
        // then assume you want a standard actor property (ID, Key)
        if (!attrID)
            attrID = event.currentTarget.getAttribute("attid");
        if (!attKey)
            attKey = event.currentTarget.getAttribute("id");

        let propertyItem = game.items.get(attrID);
        let tag = propertyItem.system.tag;
        // If tag is blank, use the property key instead? could also use the item's name.
        if (tag == "")
            tag = propertyItem.system.attKey;
        let img = propertyItem.img;

        // Use cItem image and name + property tag
        if (citemID != null && !isFree) {
            let cItem = game.items.get(citemID);
            tag = cItem.name + " " + tag;
            img = cItem.img;
        }

        // Use Group or Table img & name?
        if (isFree) {
            let tableItem = game.items.contents.find(i => i.system.attKey === tableKey);
            let groupItem = game.items.get(tableItem.system.group.id);
            tag = groupItem.name + " " + tag + " (" + citemID + ")";
            img = groupItem.img;
        }

        event.dataTransfer.setData("text/plain", JSON.stringify({
            type: "rollable",
            actorId: this.actor.id,
            data: {
                attrID: attrID,
                attKey: attKey,
                citemID: citemID,
                citemKey: citemKey,
                ciRoll: ciRoll,
                isFree: isFree,
                tableKey: tableKey,
                useData: useData,
                tag: tag,
                img: img
            }
        }));
    }

    async generateRollDialog(dialogID, dialogName, rollexp, rollname, rollid, actorattributes, citemattributes, number, isactive, ciuses,cimaxuses, rollcitemID, targets, useData) {        
        let dialogPanel = await auxMeth.getTElement(dialogID, "panel", dialogName);
        if (dialogPanel == null || dialogPanel == undefined) {
            console.warn("Sandbox | generateRollDialog | " + dialogName + " not found by ID");
            ui.notifications.warn("Please re-add dialog panel to roll " + rollname);
        }
        let finalContent = "";
        let dialogProps={};
        if (dialogPanel.type == "multipanel") {
            let multiClass; // ???
            let multiClassName ='multi-' +  this._getPanelWidthClass(dialogPanel.system.width);            
            let multiWrapper = `<div class="${multiClassName} multiwrapper">`;
            let wrapperEnd = `</div>`;
            finalContent += multiWrapper;
            for (let i = 0; i < dialogPanel.system.panels.length; i++) {
                let myp = dialogPanel.system.panels[i];
                //let getPanel = game.items.get(myp.id);
                let getPanel = await auxMeth.getTElement(myp.id, "panel", myp.ikey);
                finalContent += await this.generateDialogPanelHTML(getPanel,dialogProps);
            }
            finalContent += wrapperEnd;
        }
        else {
            finalContent = await this.generateDialogPanelHTML(dialogPanel,dialogProps);
        }
        
        let dialogTitle=rollname;  // used to be dialogPanel.system.title
        dialogTitle = await auxMeth.parseDialogProps(dialogTitle, dialogProps);                
        dialogTitle = await auxMeth.basicParser(dialogTitle,this.actor);
        //static async autoParser(expr, attributes, itemattributes, exprmode, noreg = false, number = 1, uses = 0, maxuses = 1) 
        dialogTitle = await auxMeth.autoParser(dialogTitle, actorattributes, citemattributes, true, false, number,ciuses,cimaxuses);
        dialogTitle = await game.system.api._extractAPIFunctions(dialogTitle,actorattributes, citemattributes, true, false, number,ciuses,cimaxuses);
        
        
        let d = new Dialog({
            title: dialogTitle,
            content: finalContent,
            buttons: {
                one: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "OK",
                    callback: async (html) => {
                        let dialogvalues = html[0].getElementsByClassName("rdialogInput");
                        let dialogProps = {};
                        for (let k = 0; k < dialogvalues.length; k++) {
                            let myKey = dialogvalues[k].getAttribute("attKey");
                            setProperty(dialogProps, myKey, {});
                            if (dialogvalues[k].type == "checkbox") {
                                dialogProps[myKey].value = dialogvalues[k].checked;
                            }
                            else {
                                dialogProps[myKey].value = dialogvalues[k].value;
                            }
                        }
                        //console.log(dialogProps);
                        this.rollExpression(rollexp, rollname, rollid, actorattributes, citemattributes, number, isactive, ciuses,cimaxuses, rollcitemID, targets, dialogProps, useData);
                    }
                },
                two: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel",
                    callback: () => { console.log("canceling selection"); }
                }
            },
            default: "one",
            rollDialog: true,
            rollname:rollname,
            actor:this.actor,
            actorattributes: actorattributes,
            citemattributes: citemattributes,
            number: number,
            uses:ciuses,
            maxuses:cimaxuses,
            isactive:isactive,
            targets:targets,
            close: () => console.log("cItem selection dialog was shown to player.")
        }, { width: null,classes: ["dialog",dialogName] });
        d.render(true);


    }

    async generateDialogPanelHTML(dialogPanel,dialogProps) {
        
        let divclassName=this._getPanelWidthClass(dialogPanel.system.width);
        let alignment = this._getContentAlignmentClass(dialogPanel.system.contentalign);        
        let textalignment = this._getTextAlignmentClass(dialogPanel.system.alignment);        
        let finalContent = `<div class="${divclassName} ${dialogPanel.system.panelKey}">`;
        let endDiv = `</div>`;

        if (dialogPanel.system.title != "") {
            finalContent += `<div class="panelheader ${dialogPanel.system.headergroup}">${dialogPanel.system.title}</div>`;
        }

        let maxcolumns = dialogPanel.system.columns;
        let currentCol = 0;
        for (let i = 0; i < parseInt(dialogPanel.system.properties.length); i++) {
            let panelPropertyRef = dialogPanel.system.properties[i];
            
            let panelProperty = await auxMeth.getTElement(panelPropertyRef.id, "property", panelPropertyRef.ikey);

            if (currentCol == 0) {
                //Create first Row
                finalContent += `<div class="new-row  ${alignment}">`;
            }            
            let labelwidth=this._getLabelWidthClass(panelProperty.system.labelsize);            
            let inputwidth=this._getInputWidthClass(panelProperty.system.inputsize);

            let defvalue = "";
            if (panelProperty.system.defvalue != "")
                defvalue = "defvalue";

            if (panelProperty.system.datatype != "button" && panelProperty.system.datatype != "table" && panelProperty.system.datatype != "textarea" && panelProperty.system.datatype != "badge" && !panelProperty.system.ishidden) {
                if (panelProperty.system.haslabel) {
                    finalContent += `<label class="${labelwidth} ${textalignment} ${panelProperty.system.fontgroup} " title="${panelProperty.system.tooltip}">${panelProperty.system.tag}</label>`;
                }
                if (panelProperty.system.datatype == "checkbox") {
                    finalContent += `<input class="rdialogInput checkbox check-${panelProperty.system.attKey} ${panelProperty.system.inputgroup} ${defvalue}" title="${panelProperty.system.tooltip}" checkGroup ="${panelProperty.system.checkgroup}" attKey ="${panelProperty.system.attKey}" type="checkbox">`;
                }
                else if (panelProperty.system.datatype == "list") {
                    finalContent += `<select  class="rdialogInput select-${panelProperty.system.attKey} ${panelProperty.system.inputgroup} ${defvalue}" title="${panelProperty.system.tooltip}" attKey ="${panelProperty.system.attKey}"  data-type="String">`;                    
                    let options = await auxMeth.getListPropertyOptions(panelProperty,this.actor.system.attributes, null);
                    options = options.split("|");
                    for (let j = 0; j < options.length; j++) {
                        finalContent += `<option  value="${options[j]}">${options[j]}</option>`;
                    }
                    finalContent += `</select>`;
                }

                else if (panelProperty.system.datatype == "label") {

                }
                else {
                    let isauto = "";
                    let arrows = "";
                    let inputGM="";
                    if (panelProperty.system.auto != "")
                        isauto = "isauto input-disabled";
                    if (panelProperty.system.arrows && (panelProperty.system.editable || game.user.isGM)) {
                        arrows = "hasarrows";
                    }
                    if (!panelProperty.system.editable) {
                        inputGM = "inputGM";
                    }
                   
                    
                    finalContent += `<input class="rdialogInput ${inputwidth} ${panelProperty.system.inputgroup} ${isauto} ${defvalue} ${arrows} ${inputGM}" attKey ="${panelProperty.system.attKey}" type="text" value="${panelProperty.system.defvalue}">`;
                }

                currentCol += 1;
            }

            if (currentCol == maxcolumns || i == parseInt(dialogPanel.system.properties.length - 1)) {
                finalContent += endDiv;
                currentCol = 0;
            }
            // add to props
            setProperty(dialogProps, panelPropertyRef.ikey, {});                         
            dialogProps[panelPropertyRef.ikey].value = panelProperty.system.defvalue;
            
        }

        finalContent += endDiv;

        return finalContent;
    }
    
    
    _getPanelWidthClass(panelWidth='1'){
      switch (panelWidth) {
        case '1':                
          return 'col-1-1';
        case '1/3':
          return 'col-1-3';
        case '2/3':
          return 'col-2-3';
        case '3/4':
          return 'col-3-4';
        case '5/6':
          return 'col-5-6';
        case '1/2':
          return 'col-1-2';
        case '1/4':
          return 'col-1-4';
        case '1/5':
          return 'col-1-5';
        case '1/6':
          return 'col-1-6';
        case '1/8':
          return 'col-1-8';
        case '3/10':
          return 'col-3-10';
        case '1/16':
          return 'col-1-16';
        case '5/8':
          return 'col-5-8';
        case '3/8':
          return 'col-3-8';
        default:
          return 'col-1-1';
          break;
      }    
    }
    
    _getTextAlignmentClass(textAlignment){
      switch (textAlignment) {
        case 'center':
          return " centertext";
        case 'right':
          return " rightext";
        case 'left':
          return " lefttext";
        default:
          return " centertext";
          break;
      }
    }
    
    _getContentAlignmentClass(contentAlignment){
      switch (contentAlignment) {
        case 'center':
          return " centercontent";
        case 'right':
          return " rightcontent";
        case 'left':
          return " leftcontent";
        default:
          return " centercontent";
          break;
      }      
    }
    
    _getInputWidthClass(inputSize='F'){
      switch (inputSize) {
        case 'F':
          return " input-free";
        case 'S':
          return " input-small";
        case 'M':
          return " input-med";
        case 'L':
          return " input-large";
        case 'T':
          return " input-tiny";
        default:
          return " input-free";
      }                
    }
    
    _getLabelWidthClass(labelSize='F'){
      switch (labelSize) {
      case 'F':
        return " label-free";        
      case 'S':
        return " label-small";
      case 'T':
        return " label-tiny";
      case 'M':
        return " label-med";
      case 'L':
        return " label-medlarge";
      default:
        return " label-free";
        break;
      }      
    }

    async _onRollCheck(attrID, attKey, citemID, citemKey = null, ciRoll = false, isFree = false, tableKey = null, useData = null) {
        //console.log("rolling att " + attrID + " item " + citemID);
        let actorattributes = this.actor.system.attributes;
        let citemattributes;
        let rollexp;
        let rollname;
        let rollid = [];
        let hasDialog = false;
        let dialogID;
        let dialogName;
        let citem;
        let property;
        let initiative = false;

        let findcitem;
        let number;
        let isactive;
        let ciuses;
        let cimaxuses=1;
        let rollcitemID;

        if (citemID != null) {
            if (!isFree) {
                //citem = await game.items.get(citemID);
                citem = await await auxMeth.getcItem(citemID, citemKey);
                findcitem = this.actor.system.citems.find(y => y.id == citemID);
                if (findcitem != null) {
                    citemattributes = findcitem.attributes;
                }
                if (citem != null)
                    rollcitemID = citemID;
            }
            else {
                if (tableKey != null) {
                    let tableItems = actorattributes[tableKey].tableitems;
                    let myFreeItem = tableItems.find(y => y.id == citemID);
                    citemattributes = myFreeItem.attributes;
                }
            }
            //console.log(citem);
        }

        if (!ciRoll) {
            property = await auxMeth.getTElement(attrID, "property", attKey);
            rollexp = property.system.rollexp;
            rollname = property.system.rollname;
            hasDialog = property.system.hasdialog;
            dialogID = property.system.dialogID;
            dialogName = property.system.dialogName;
            rollid.push(property.system.rollid);
        }
        else {
            rollexp = citem.system.roll;
            rollname = citem.system.rollname;
            hasDialog = citem.system.hasdialog;
            dialogID = citem.system.dialogID;
            dialogName = citem.system.dialogName;
            rollid.push(citem.system.rollid);
        }

        let targets = game.user.targets.ids;

        if (findcitem != null) {
            number = findcitem.number;
            isactive = findcitem.isactive;
            ciuses = findcitem.uses;
            cimaxuses=findcitem.maxuses;
        }

        if (hasDialog) {
            this.generateRollDialog(dialogID, dialogName, rollexp, rollname, rollid, actorattributes, citemattributes, number, isactive, ciuses,cimaxuses, rollcitemID, targets, useData);
        }
        else {
            this.rollExpression(rollexp, rollname, rollid, actorattributes, citemattributes, number, isactive, ciuses,cimaxuses, rollcitemID, targets, null, useData);
        }


        //return finalroll;

    }

    async rollExpression(rollexp, rollname, rollid, actorattributes, citemattributes, number, isactive, ciuses,cimaxuses=1, rollcitemID, targets, dialogProps = null, useData = null) {
        let tokenid;
        let finalroll;
        rollexp = await auxMeth.parseDialogProps(rollexp, dialogProps);
        rollexp = await auxMeth.basicParser(rollexp,this.actor);
        rollname = await auxMeth.parseDialogProps(rollname, dialogProps);
        rollname = await auxMeth.basicParser(rollname,this.actor);       
        //console.log(rollexp);        
        if (targets.length > 0 && ((rollexp.includes("#{target|") || rollexp.includes("add(")) || rollexp.includes("set("))) {
            for (let i = 0; i < targets.length; i++) {
                tokenid = canvas.tokens.placeables.find(y => y.id == targets[i]);
                //TEST SERE FOR BETTER ROLL RESULTS
                
                let finalrollprev = await this.actor.rollSheetDice(rollexp, rollname, rollid, actorattributes, citemattributes, number, isactive, ciuses,cimaxuses, tokenid, rollcitemID);
                finalroll = finalrollprev.result;
            }
        }

        else {
            if (this.actor.isToken && this.token != null)
                tokenid = this.token.id;
            //TEST SERE FOR BETTER ROLL RESULTS
            
            let finalrollprev = await this.actor.rollSheetDice(rollexp, rollname, rollid, actorattributes, citemattributes, number, isactive, ciuses,cimaxuses, null, rollcitemID, tokenid);
            finalroll = finalrollprev.result;
        }

        if (useData != null) {
            await this.activateCI(useData.id, useData.value, useData.iscon, finalroll);
        }
    }

    //Creates the attributes the first time a template is chosen for a character
    async refreshSheet(gtemplate) {
        //Gets all game properties

        //console.log(gtemplate);
        console.log("Sandbox | refreshSheet | Setting sheet for " + this.actor.name);
        //Finds master property
        await this.actor.update({ "system.gtemplate": gtemplate });


        //await this.actor.update(this.actor.data);
        //await this.actor.actorUpdater();

    }

    async setTemplate(gtemplate, actorData) {
        console.log("Sandbox | setTemplate | Setting template for " + this.actor.name);
        //console.log(actorData);

        const propitems = game.items.filter(y => y.type == "property");

        if (actorData == null)
            actorData = duplicate(this.actor.system);

        const attData = actorData.attributes;
        if (gtemplate == "" || gtemplate == null)
            gtemplate = "Default";
        actorData.gtemplate = gtemplate;

        //Looks for template and finds inputs

        var parser = new DOMParser();
        //var htmlcode = await fetch(this.getHTMLPath()).then(resp => resp.text());

        let htmlcode = await auxMeth.getTempHTML(gtemplate);
        actorData._html = htmlcode;
        //console.log(htmlcode);
        var form = await parser.parseFromString(htmlcode, 'text/html').querySelector('form');
        //console.log(form);
        //Loops the inputs and creates the related attributes

        if (form == null)
            ui.notifications.warn("Please rebuild character sheet before assigning");

        var inputs = await form.querySelectorAll('input,select,textarea');
        for (let i = 0; i < inputs.length; i++) {
            let newAtt = inputs[i];

            let attId = newAtt.getAttribute("attId");
            //console.log(newAtt);
            let attKey = newAtt.getAttribute("name");
            attKey = attKey.replace("system.attributes.", '');
            attKey = attKey.replace(".value", '');
            if (attId != null)
                await this.setAttributeValues(attId, attData, attKey);

        }

        //For special case of radioinputs
        let radioinputs = form.getElementsByClassName("radio-input");
        for (let i = 0; i < radioinputs.length; i++) {
            let newAtt = radioinputs[i];
            let attId = newAtt.getAttribute("attId");
            let attKey = newAtt.getAttribute("name");
            attKey = attKey.replace("system.attributes.", '');
            attKey = attKey.replace(".value", '');
            await this.setAttributeValues(attId, attData, attKey);
        }

        //For special cases of badges
        let badgeinputs = form.getElementsByClassName("badge-click");
        for (let i = 0; i < badgeinputs.length; i++) {
            let newAtt = badgeinputs[i];
            let attId = newAtt.getAttribute("attId");
            let attKey = newAtt.getAttribute("attKey");
            await this.setAttributeValues(attId, attData, attKey);
        }

        //For special cases of tables
        let tableinputs = form.getElementsByClassName("sbtable");
        for (let i = 0; i < tableinputs.length; i++) {
            let newAtt = tableinputs[i];
            let attId = newAtt.getAttribute("attId");
            let attKey = newAtt.getAttribute("name");
            attKey = attKey.replace("system.attributes.", '');
            attKey = attKey.replace(".value", '');
            await this.setAttributeValues(attId, attData, attKey);
        }

        //For special cases of custom checboxes
        let custominputs = form.getElementsByClassName("customcheck");
        for (let i = 0; i < custominputs.length; i++) {
            let newAtt = custominputs[i];
            let attId = newAtt.getAttribute("attId");
            let attKey = newAtt.getAttribute("name");
            if (attKey != null) {

                attKey = attKey.replace("system.attributes.", '');
                attKey = attKey.replace(".value", '');
            }
            else {
                attKey = newAtt.getAttribute("attkey");
            }

            await this.setAttributeValues(attId, attData, attKey);
        }

        //Get token settings
        //Set token mode
        let tokenbar = form.getElementsByClassName("token-bar1");
        let bar1Att = tokenbar[0].getAttribute("tkvalue");

        let tokenname = form.getElementsByClassName("token-displayName");
        let displayName = tokenname[0].getAttribute("tkvalue");

        let tokenshield = form.getElementsByClassName("token-shieldstat");
        let shield = tokenshield[0].getAttribute("tkvalue");

        let biofield = form.getElementsByClassName("check-biovisible");
        let biovisible = biofield[0].getAttribute("biovisible");

        let resizefield = form.getElementsByClassName("check-resizable");
        let resizable = biofield[0].getAttribute("resizable");

        let visifield = form.getElementsByClassName("token-visitabs");
        let visitabs = visifield[0].getAttribute("visitabs");

        actorData.displayName = CONST.TOKEN_DISPLAY_MODES[displayName];
        actorData.tokenbar1 = "attributes." + bar1Att;
        actorData.tokenshield = shield;
        if (biovisible === "false")
            biovisible = false;
        if (biovisible === "true")
            biovisible = true;
        if (resizable === "false")
            resizable = false;
        if (resizable === "true")
            resizable = true;
        actorData.biovisible = biovisible;
        actorData.resizable = resizable;
        actorData.visitabs = parseInt(visitabs);
        //console.log(actorData);
        let mytoken = await this.setTokenOptions(actorData);

        await this.actor.update({ "system": actorData, "prototypeToken": mytoken }, { diff: false });
        await this.actor.update({ "system": actorData, "prototypeToken": mytoken });
    }

    async setAttributeValues(attID, attData, propName) {

        //reference to attribute
        //console.log(attID + " " + propName);
        //const attData = this.actor.data.data.attributes;
        //const property = await game.items.get(attID);
        const property = await auxMeth.getTElement(attID, "property", propName);
        let attribute;
        try{
          attribute = property.system.attKey;
        }
        catch(err){
          console.error("Sandbox | Unable to find key for property "+ propName + " : " + err.message);
          //debugger;
          // exit
          return;
        }
        
        //console.log(attribute);
        let idkey = attData[attribute];
        let populate = false;
        if (idkey == null) {
            populate = true;
        }
        else {
            if (idkey.id == null) {
                //console.log(property.data.data.attKey + " no ID needs " + attID);
                populate = true;
            }

            //            else{
            //                if(idkey.value==null)
            //                    populate = true;
            //            }

            if (property.system.datatype == "radio" && (idkey.max == null || idkey.max == "" || idkey.value == "" || idkey.value == null)) {
                populate = true;
            }

            //            if(property.data.data.maxtop){
            //                console.log("setting");
            //                setProperty(attData[attribute],"maxblocked", true);
            //            }
            //            else{
            //                setProperty(attData[attribute],"maxblocked", false);
            //            }

        }

        if (property.system.datatype == "table") {
            // if (!hasProperty(attData[attribute], "tableitems")) {
            populate = true;
            // }

        }

        if (property.system.datatype == "checkbox") {

            if (attData[attribute] != null)
                setProperty(attData[attribute], "checkgroup", property.system.checkgroup);

        }

        //console.log(property.data.data.attKey + " " + property.data.data.datatype + " " + populate);
        if (!hasProperty(attData, attribute) || Object.keys(attData[attribute]).length == 0 || populate) {
            //console.log("populating prop");
            attData[attribute] = {};
            setProperty(attData[attribute], "id", "");
            attData[attribute].id = attID;

            //Sets id and auto
            if (property.system.datatype != "table") {

                if (!hasProperty(attData[attribute], "value"))
                    setProperty(attData[attribute], "value", "");
                setProperty(attData[attribute], "prev", "");
                await setProperty(attData[attribute], "isset", false);

                //Sets auto, auto max, and max
                if (property.system.automax != "" || property.system.datatype == "radio") {

                    setProperty(attData[attribute], "max", "");

                }

                if (property.system.datatype == "checkbox") {
                    setProperty(attData[attribute], "checkgroup", property.system.checkgroup);

                }

            }
            else {
                //console.log("setting table " + attribute);
                let tablegroup = property.system.group;
                //let groupObj = await game.items.get(tablegroup.id);
                //console.log(tablegroup);
                let groupObj = await auxMeth.getTElement(tablegroup.id, "group", tablegroup.ikey);
                if (groupObj == null) {
                    ui.notifications.warn("Please reassign group to table " + attribute);
                    console.warn("Sandbox | setAttributeValues | Error: Please reassign group to table " + attribute);
                }

                let groupprops = groupObj.system.properties;
                //console.log(groupprops);
                setProperty(attData[attribute], "istable", true);
                setProperty(attData[attribute], "totals", {});
                if (!hasProperty(this.actor.system.attributes[attribute], "tableitems")) {
                    setProperty(attData[attribute], "tableitems", []);
                }

                const attTableKey = attData[attribute];
                for (let i = 0; i < groupprops.length; i++) {
                    let propId = groupprops[i].id;
                    //let propData = game.items.get(propId);
                    let propData = await auxMeth.getTElement(propId, "property", groupprops[i].ikey);
                    let propKey = propData.system.attKey;
                    setProperty(attTableKey.totals, propKey, {});
                    const tableAtt = attTableKey.totals[propKey];
                    setProperty(tableAtt, "id", propId);
                    if (propData.system.totalize) {

                        setProperty(tableAtt, "total", "");
                        setProperty(tableAtt, "prev", "");
                    }
                    //TO FIX IN FUTURE
                    // for(let j=0;j<this.actor.data.data.attributes[attribute].tableitems.length;j++){
                    //     let tableItemProp = this.actor.data.data.attributes[attribute].tableitems[j].attributes;
                    //     if(tableItemProp[propKey]==null){
                    //         setProperty(attData[attribute], "tableitems", []);
                    //         let newtableBlock = attData[attribute];
                    //         let newtableItem = newtableBlock.tableitems;
                    //         newtableItem = this.actor.data.data.attributes[attribute].tableitems[j];
                    //         newtableItem.attributes[propKey] = {};
                    //         newtableItem.attributes[propKey].value = propData.data.data.defvalue;
                    //     }

                    // }

                }
            }


        }



        //console.log(attData[attribute]);

        //return attData;

    }

    async checkTabsExisting() {

        //Check Tabs
        let tabs = this.actor.flags.tabarray;
        let changed = false;
        const items = game.items;

        if (tabs != null) {
            for (let i = 0; i < tabs.length; i++) {
                if (!game.items.get(tabs[i].id)) {
                    let index = tabs.indexOf(tabs[i]);
                    if (index > -1) {
                        tabs.splice(index, 1);
                        changed = true;
                    }
                }
            }
        }

        if (changed)
            this.updateTabs();

    }

    /* -------------------------------------------- */

    /**
   * HTML Editors
   */

    async addNewTab(newHTML, tabitem, index) {
        console.log("Sandbox | addNewTab | Adding Tab ["+tabitem.system.tabKey+"] for actor " + this.actor.name);

        var wrapper = document.createElement('div');

        if (newHTML == null) {            
            wrapper.innerHTML = this.actor.system._html;
        }
        else {
            wrapper.innerHTML = newHTML;
        }

        let deftemplate = wrapper;
        //console.log(deftemplate);

        let tabname = tabitem.system.title;
        let tabKey = tabitem.system.tabKey;

        //Tab selector
        let p = deftemplate.querySelector("#tabs");

        let c = deftemplate.querySelector("#tab-last");

        let cindex = Array.from(p.children).indexOf(c);
        let totaltabs = parseInt(p.getAttribute("tabs"));
        let newElement = document.createElement('a');
        newElement.className = 'item tab-button';
        newElement.setAttribute('id', "tab-" + index);
        newElement.setAttribute("data-tab", tabKey);
        newElement.textContent = tabname;
        p.insertBefore(newElement, p.children[cindex]);
        p.setAttribute("tabs", totaltabs + 1);

        //ADD VISIBILITY RULES TO TAB
        if (tabitem.system.condop != "NON") {
            let attProp = ".value";
            if (tabitem.system.condat != null) {
                if (tabitem.system.condat.includes("max")) {
                    attProp = "";
                }
            }


            if (tabitem.system.condop == "EQU") {
                // if (tabitem.data.condvalue == "true" || tabitem.data.condvalue == "false" || tabitem.data.condvalue == true || tabitem.data.condvalue == false) {
                newElement.insertAdjacentHTML('beforebegin', "{{#if actor.system.attributes." + tabitem.system.condat + attProp + "}}");
                newElement.insertAdjacentHTML('afterend', "{{/if}}");
                // }
                // else {
                //     newElement.insertAdjacentHTML('afterbegin', "{{#ifCond actor.data.attributes." + tabitem.data.condat + attProp + " '" + tabitem.data.condvalue + "'}}");
                //     newElement.insertAdjacentHTML('beforeend', "{{/ifCond}}");
                // }

            }

            else if (tabitem.system.condop == "HIH") {
                newElement.insertAdjacentHTML('beforebegin', "{{#ifGreater actor.system.attributes." + tabitem.system.condat + attProp + " '" + tabitem.system.condvalue + "'}}");
                newElement.insertAdjacentHTML('afterend', "{{/ifGreater}}");
            }

            else if (tabitem.system.condop == "LOW") {
                newElement.insertAdjacentHTML('beforebegin', "{{#ifLess actor.system.attributes." + tabitem.system.condat + attProp + " '" + tabitem.system.condvalue + "'}}");
                newElement.insertAdjacentHTML('afterend', "{{/ifLess}}");
            }

            else if (tabitem.system.condop == "NOT") {
                newElement.insertAdjacentHTML('beforebegin', "{{#ifNot actor.system.attributes." + tabitem.system.condat + attProp + " '" + tabitem.system.condvalue + "'}}");
                newElement.insertAdjacentHTML('afterend', "{{/ifNot}}");
            }
        }

        if (tabitem.system.controlby == "gamemaster") {
            newElement.insertAdjacentHTML('beforebegin', "{{#isGM}}");
            newElement.insertAdjacentHTML('afterend', "{{/isGM}}");
        }

        else {
            newElement.className += " player-tab";
        }

        //Tab content
        let parentNode = deftemplate.querySelector('#sheet-body');
        let div5 = document.createElement("DIV");
        div5.className = "tab scrollable " + tabKey + "_tab";
        div5.setAttribute('id', tabKey + "_Def");
        div5.setAttribute("data-group", "primary");
        div5.setAttribute("data-tab", tabKey);
        parentNode.appendChild(div5);

        let div9 = document.createElement("DIV");
        div9.className = "new-column sbbody";
        div9.setAttribute('id', tabKey + "Body");
        div5.appendChild(div9);

        //Set token mode
        let tokenbar = deftemplate.getElementsByClassName("token-bar1");
        let tokenshield = deftemplate.getElementsByClassName("token-shieldstat");
        let tokenname = deftemplate.getElementsByClassName("token-displayName");

        let displayName = this.actor.system.displayName;
        //console.log(displayName);
        if (displayName == null)
            displayName = "NONE";

        tokenbar[0].setAttribute("tkvalue", this.actor.system.tokenbar1);
        tokenname[0].setAttribute("tkvalue", displayName);
        tokenshield[0].setAttribute("tkvalue", this.actor.system.shieldstat);

        let biovisiblefield = deftemplate.getElementsByClassName("check-biovisible");
        let resizablefield = deftemplate.getElementsByClassName("check-resizable");
        //console.log(biovisiblefield);
        biovisiblefield[0].setAttribute("biovisible", this.actor.system.biovisible);
        resizablefield[0].setAttribute("resizable", this.actor.system.resizable);

        let visitabfield = deftemplate.getElementsByClassName("token-visitabs");
        visitabfield[0].setAttribute("visitabs", this.actor.system.visitabs);

        let finalreturn = new XMLSerializer().serializeToString(deftemplate);
        return finalreturn;
    }

    async addNewPanel(newHTML, tabpanel, tabKey, tabname, firstmrow, multiID = null, multiName = null, _paneldata = null, multiheadergroup = null) {
     
        //Variables
        console.log("Sandbox | addNewPanel | Adding Panel " + tabpanel.name + " in " + tabKey);
        //console.log(tabpanel);

        //        if(tabpanel.data==null)
        //            return;

        var wrapper = document.createElement('div');
        if (newHTML == null) {
            wrapper.innerHTML = this.actor.system._html;
        }

        else {
            wrapper.innerHTML = newHTML;
        }

        //let deftemplate= wrapper;
        let deftemplate = new DOMParser().parseFromString(newHTML, "text/html");
        const actor = this.actor;
        const flags = this.actor.flags;
        const parentNode = deftemplate.querySelector('#' + tabKey + 'Body');
        //console.log(tabpanel);
        //console.log(deftemplate);

        let fontgroup = "";
        let inputgroup = "";

        if (tabpanel.system.fontgroup != null)
            fontgroup = tabpanel.system.fontgroup;

        if (tabpanel.system.inputgroup != null)
            inputgroup = tabpanel.system.inputgroup;

        //        let fontgroup = tabpanel.data.fontgroup;
        //        let inputgroup = tabpanel.data.inputgroup;

        let initial = false;
        let div6;


        if (multiID == null) {
            //console.log("INITIAL _ " + tabpanel.name + " width: " + flags.rwidth + " rows: " + flags.rows);
        }
        else {
            //console.log("INITIAL _ " + tabpanel.name + " maxrows: " + flags.maxrows + " multiwidth: " + flags.multiwidth + "maxwidth: " + flags.maxwidth);
        }

        if (flags.rwidth >= 1) {
            if (multiID == null) {
                flags.rows += 1;
                flags.rwidth = 0;
            }
            else {
                if (firstmrow) {
                    flags.rwidth = 0;
                    flags.rows += 1;
                }

            }

        }

        else if (firstmrow && flags.rwidth == 0 && flags.rows > 1) {
            flags.rows += 1;
        }

        if (flags.multiwidth >= flags.maxwidth) {
            //console.log("newmultirow");
            flags.multiwidth == 0;
        }

        if (flags.multiwidth == 0 && multiID != null) {
            flags.maxrows += 1;
            initial = true;
        }



        div6 = deftemplate.createElement("DIV");

        if (firstmrow) {

            if (flags.rwidth == 0 || flags.rwidth == 1 || (flags.multiwidth == 0 && multiID != null)) {

                initial = true;

            }

        }

        let labelwidth;
        var columns = tabpanel.system.columns;

        //Set panel width
        if (tabpanel.system.width === "1") {
            if ((firstmrow && multiID == null) || (multiID != null))
                div6.className = 'col-1-1';
            if (multiID == null) {
                flags.rwidth += 1;
            }
            else {
                flags.multiwidth += 1;
                div6.className = this.getmultiWidthClass(tabpanel.system.width);
            }

        }

        else if (tabpanel.system.width === "1/3") {
            if ((firstmrow && multiID == null) || (multiID != null))
                div6.className = 'col-1-3';
            if (multiID == null) {
                flags.rwidth += 0.333;
            }
            else {
                flags.multiwidth += 0.333;
                div6.className = this.getmultiWidthClass(tabpanel.system.width);
            }

        }

        else if (tabpanel.system.width === "2/3") {
            if ((firstmrow && multiID == null) || (multiID != null))
                div6.className = 'col-2-3';
            if (multiID == null) {
                flags.rwidth += 0.666;
            }
            else {
                flags.multiwidth += 0.666;
                div6.className = this.getmultiWidthClass(tabpanel.system.width);
            }

        }

        else if (tabpanel.system.width === "3/4") {
            if ((firstmrow && multiID == null) || (multiID != null))
                div6.className = 'col-3-4';
            if (multiID == null) {
                flags.rwidth += 0.75;
            }
            else {
                flags.multiwidth += 0.75;
                div6.className = this.getmultiWidthClass(tabpanel.system.width);
            }

        }

        else if (tabpanel.system.width === "5/6") {
            if ((firstmrow && multiID == null) || (multiID != null))
                div6.className = 'col-5-6';
            if (multiID == null) {
                flags.rwidth += 0.833;
            }
            else {
                flags.multiwidth += 0.833;
                div6.className = this.getmultiWidthClass(tabpanel.system.width);
            }

        }

        else if (tabpanel.system.width === "1/2") {
            if ((firstmrow && multiID == null) || (multiID != null))
                div6.className = 'col-1-2';
            if (multiID == null) {
                flags.rwidth += 0.5;
            }
            else {
                flags.multiwidth += 0.5;
                div6.className = this.getmultiWidthClass(tabpanel.system.width);
            }

        }

        else if (tabpanel.system.width === "1/4") {
            if ((firstmrow && multiID == null) || (multiID != null))
                div6.className = 'col-1-4';
            if (multiID == null) {
                flags.rwidth += 0.25;
            }
            else {
                flags.multiwidth += 0.25;
                div6.className = this.getmultiWidthClass(tabpanel.system.width);
            }

        }
        else if (tabpanel.system.width === "1/5") {
            if ((firstmrow && multiID == null) || (multiID != null))
                div6.className = 'col-1-5';
            if (multiID == null) {
                flags.rwidth += 0.2;
            }
            else {
                flags.multiwidth += 0.2;
                div6.className = this.getmultiWidthClass(tabpanel.system.width);
            }

        }

        else if (tabpanel.system.width === "1/6") {
            if ((firstmrow && multiID == null) || (multiID != null))
                div6.className = 'col-1-6';
            if (multiID == null) {
                flags.rwidth += 0.166;
            }
            else {
                flags.multiwidth += 0.166;
                div6.className = this.getmultiWidthClass(tabpanel.system.width);
            }

        }

        else if (tabpanel.system.width === "1/8") {
            if ((firstmrow && multiID == null) || (multiID != null))
                div6.className = 'col-1-8';
            if (multiID == null) {
                flags.rwidth += 0.125;
            }
            else {
                flags.multiwidth += 0.125;
                div6.className = this.getmultiWidthClass(tabpanel.system.width);
            }

        }
        else if (tabpanel.system.width === "3/10") {
            if ((firstmrow && multiID == null) || (multiID != null))
                div6.className = 'col-3-10';
            if (multiID == null) {
                flags.rwidth += 0.3;
            }
            else {
                flags.multiwidth += 0.3;
                div6.className = this.getmultiWidthClass(tabpanel.system.width);
            }

        }
        else if (tabpanel.system.width === "1/16") {
            if ((firstmrow && multiID == null) || (multiID != null))
                div6.className = 'col-1-16';
            if (multiID == null) {
                flags.rwidth += 0.0625;
            }
            else {
                flags.multiwidth += 0.0625;
                div6.className = this.getmultiWidthClass(tabpanel.system.width);
            }

        }
        else if (tabpanel.system.width === "5/8") {
            if ((firstmrow && multiID == null) || (multiID != null))
                div6.className = 'col-5-8';
            if (multiID == null) {
                flags.rwidth += 0.625;
            }
            else {
                flags.multiwidth += 0.625;
                div6.className = this.getmultiWidthClass(tabpanel.system.width);
            }

        }
        else if (tabpanel.system.width === "3/8") {
            if ((firstmrow && multiID == null) || (multiID != null))
                div6.className = 'col-3-8';
            if (multiID == null) {
                flags.rwidth += 0.375;
            }
            else {
                flags.multiwidth += 0.375;
                div6.className = this.getmultiWidthClass(tabpanel.system.width);
            }

        }

        else {
            if ((firstmrow && multiID == null) || (multiID != null))
                div6.className = 'col-1-1';
            if (multiID == null) {
                flags.rwidth += 1;
            }
            else {
                flags.multiwidth += 1;
                div6.className = this.getmultiWidthClass(tabpanel.system.width)
            }

        }

        if (multiID == null) {
            //console.log("PRE _ " + tabpanel.name + " width: " + flags.rwidth + " rows: " + flags.rows);
        }
        else {
            //console.log("PRE _ " + tabpanel.name + " maxrows: " + flags.maxrows + " multiwidth: " + flags.multiwidth + "maxwidth: " + flags.maxwidth);
        }

        div6.className += " " + tabpanel.system.panelKey + "_container";

        if (flags.rwidth > 0.95 && flags.rwidth <= 1)
            flags.rwidth = 1.015;


        //console.log("firstmrow: " + firstmrow);
        if (flags.rwidth > 1.015) {
            // flags.rwidth -= 1;
            // if (flags.rwidth < 0.1)
            flags.rwidth = 0;
            if (firstmrow && multiID == null) {
                flags.rows += 1;
                initial = true;
            }

        }

        //console.log("rows: " + flags.rows);

        if (flags.multiwidth > 0.95 && flags.multiwidth <= 1)
            flags.multiwidth = 1;

        if (multiID != null) {

            if (flags.multiwidth > flags.maxwidth) {
                flags.multiwidth -= flags.maxwidth;
                if (flags.multiwidth < 0.1)
                    flags.multiwidth = 0;
                flags.maxrows += 1;
                initial = true;
            }

        }

        if (multiID == null) {
            //console.log("POST _ " + tabpanel.name + " width: " + flags.rwidth + " rows: " + flags.rows + " initial:" + initial);
        }
        else {
            //console.log("POST _ " + tabpanel.name + " maxrows: " + flags.maxrows + " multiwidth: " + flags.multiwidth + "maxwidth: " + flags.maxwidth);
        }

        if (initial) {
            //console.log("creating row initial true");
        }
        else {
            //console.log("getting multirow");
        }


        //console.log(tabpanel.name + "post  width: " +flags.rwidth + " rows:" + flags.rows);

        if (tabpanel.system.title != "") {
            var new_header = deftemplate.createElement("DIV");

            if (tabpanel.system.backg == "T") {
                new_header.className = "panelheader-t";
            }
            else {
                new_header.className = "panelheader";
            }

            if (tabpanel.system.headergroup != "")
                new_header.className += " " + tabpanel.system.headergroup;

            new_header.textContent = tabpanel.system.title;
            div6.appendChild(new_header);
        }

        let properties = tabpanel.system.properties;

        var count = 0;
        var divtemp;
        var new_row = deftemplate.createElement("DIV");

        //LOAD THE PROPERTIES INPUT FIELDS
        //await properties.forEach(function (rawproperty) {
        for (let n = 0; n < properties.length; n++) {

            let rawproperty = properties[n];

            //label alignment
            if (tabpanel.system.alignment == "right") {
                labelwidth = "righttext";
            }
            else if (tabpanel.system.alignment == "center") {
                labelwidth = "centertext";
            }

            else {
                labelwidth = "";
            }

            //console.log(rawproperty);
            //let propertybase = game.items.get(rawproperty.id);
            let propertybase = await auxMeth.getTElement(rawproperty.id, "property", rawproperty.ikey);



            if (propertybase == null) {
                console.warn("The property " + rawproperty.name + " in panel " + tabpanel.name + " does not exist anymore. Please remove the reference to it");
                ui.notifications.warn("The property " + rawproperty.name + " in panel " + tabpanel.name + " does not exist anymore. Please remove the reference to it");
                throw new Error("No property!");
                return "noproperty";
            }

            else {



                let property = propertybase;

                if (property.system.attKey == null || property.system.attKey == "") {
                    ui.notifications.warn("The property " + rawproperty.name + " in panel " + tabpanel.name + " does not have a key");
                    throw new Error("No property Key!");
                    return "noproperty";
                }


                fontgroup = tabpanel.system.fontgroup;
                inputgroup = tabpanel.system.inputgroup;

                if (property.system.fontgroup != "")
                    fontgroup = property.system.fontgroup;

                if (property.system.inputgroup != "")
                    inputgroup = property.system.inputgroup;

                if (fontgroup == null)
                    fontgroup = tabpanel.system.fontgroup;
                if (inputgroup == null)
                    inputgroup = tabpanel.system.inputgroup;

                if (count == 0) {

                    new_row.className = "new-row ";
                    new_row.className += tabpanel.system.panelKey;
                    divtemp = deftemplate.createElement("DIV");

                    if (tabpanel.system.contentalign == "center") {
                        divtemp.className = "flexblock-center " + tabpanel.system.panelKey + "_row";
                    }
                    else if (tabpanel.system.contentalign == "right") {
                        divtemp.className = "flexblock-right " + tabpanel.system.panelKey + "_row";
                    }
                    else {
                        divtemp.className = "flexblock-left " + tabpanel.system.panelKey + "_row";
                    }


                    div6.appendChild(new_row);
                    new_row.appendChild(divtemp);
                }

                //Attribute input
                let sInput;
                let sInputMax;
                let sInputArrows;

                //Set Label
                if (property.system.haslabel && property.system.datatype != "table" && property.system.datatype != "badge" && property.system.datatype != "button") {
                    //Attribute label
                    var sLabel = deftemplate.createElement("H3");

                    if (property.system.labelsize == "F") {
                        labelwidth += " label-free";
                    }

                    else if (property.system.labelsize == "S") {
                        labelwidth += " label-small";
                    }

                    else if (property.system.labelsize == "T") {
                        labelwidth += " label-tiny";
                    }

                    else if (property.system.labelsize == "M") {
                        labelwidth += " label-med";
                    }

                    else if (property.system.labelsize == "L") {
                        labelwidth += " label-medlarge";
                    }

                    sLabel.className = labelwidth + " " + property.system.attKey + "_label";
                    sLabel.textContent = property.system.tag;

                    if (property.system.tooltip != null)
                        if (property.system.tooltip != "")
                            if (property.system.tooltip.length > 0)
                                sLabel.title = property.system.tooltip;

                    divtemp.appendChild(sLabel);

                    //Adds identifier
                    sLabel.setAttribute("id", property.system.attKey);
                    sLabel.setAttribute("attid", rawproperty.id);

                    if (property.system.labelformat == "B") {
                        sLabel.className += " boldtext";
                    }

                    else if (property.system.labelformat == "D" || property.system.labelformat == "I") {
                        sLabel.textContent = "";

                        let dieContainer = deftemplate.createElement("DIV");
                        dieContainer.setAttribute("title", property.system.tag);

                        let dieSymbol = deftemplate.createElement('i');
                        if(property.system.labelformat == "D"){                        
                          dieSymbol.className = "fas fa-dice-d20";
                        } else {
                          if(property.system.icon==''){
                            // set default
                            dieSymbol.className = "fas fa-dice-d20";
                          } else {
                            dieSymbol.className = "fas " + property.system.icon;
                          }
                        }
                        dieContainer.appendChild(dieSymbol);

                        sLabel.appendChild(dieContainer);

                    }

                    else if (property.system.labelformat == "S") {
                        sLabel.className += " smalltext";

                    }

                    //Sets class required for rolling
                    if (property.system.hasroll) {
                        sLabel.className += " rollable";
                    }


                    if (fontgroup != "")
                        sLabel.className += " " + fontgroup;

                    //console.log(sLabel.className + " " + sLabel.textContent);


                }

                //Check property type
                if (property.system.datatype === "checkbox") {
                    
                    if (!property.system.customcheck && (property.system.onPath == "" || property.system.offPath == "")) {
                        sInput = deftemplate.createElement("INPUT");
                        sInput.className = "input-small";
                        if (property.system.labelsize == "T")
                            sInput.className = "input-tiny";
                        sInput.setAttribute("name", "system.attributes." + property.system.attKey + ".value");
                        sInput.setAttribute("type", "checkbox");
                        if (property.system.auto != "") {
                            sInput.disabled=true;                            
                        }
                        
                        
                        sInput.setAttribute("toparse", "{{checked actor.system.attributes." + property.system.attKey + ".value}}~~");
                        sInput.setAttribute("title", property.system.tooltip);
                    }

                    else {
                        sInput = deftemplate.createElement("DIV");
                        sInput.className = "input-small";
                        if (property.system.inputsize == "T")
                            sInput.className = "input-tiny";
                        sInput.setAttribute("attKey", property.system.attKey);
                        sInput.setAttribute("onPath", property.system.onPath);
                        sInput.setAttribute("offPath", property.system.offPath);
                        sInput.setAttribute("title", property.system.tooltip);
                        sInput.className += " customcheck";
                    }
                    
                }

                //Check property type
                else if (property.system.datatype === "radio") {

                    sInput = deftemplate.createElement("DIV");
                    sInput.className = "radio-input";
                    sInput.setAttribute("name", property.system.attKey);
                    sInput.setAttribute("title", property.system.tooltip);

                }

                else if (property.system.datatype === "textarea") {

                    sInput = deftemplate.createElement("TEXTAREA");
                    if (property.system.inputsize == "S") {
                        sInput.className = "texteditor-small";
                    }

                    else if (property.system.inputsize == "L") {
                        sInput.className = "texteditor-large";
                    }
                    else {
                        sInput.className = "texteditor-med";
                    }

                    sInput.setAttribute("name", "system.attributes." + property.system.attKey + ".value");
                    sInput.setAttribute("title", property.system.tooltip);
                    sInput.textContent = "{{" + "actor.system.attributes." + property.system.attKey + ".value}}";

                }

                else if (property.system.datatype === "badge") {

                    sInput = deftemplate.createElement("DIV");
                    sInput.className = "badge-block centertext";
                    sInput.setAttribute("name", property.system.attKey);

                    let badgelabel = deftemplate.createElement("LABEL");
                    badgelabel.className = "badgelabel";
                    badgelabel.className += " badgelabel-" + property.system.attKey;
                    badgelabel.textContent = property.system.tag;
                    //
                    if (property.system.labelformat == "B") {
                        badgelabel.className += " boldtext";
                    }

                    else if (property.system.labelformat == "D" || property.system.labelformat == "I") {
                        badgelabel.textContent = "";

                        let dieContainer = deftemplate.createElement("DIV");
                        dieContainer.setAttribute("title", property.system.tag);

                        let dieSymbol = deftemplate.createElement('i');
                        if(property.system.labelformat == "D"){                        
                          dieSymbol.className = "fas fa-dice-d20";
                        } else {
                          if(property.system.icon==''){
                            // set default
                            dieSymbol.className = "fas fa-dice-d20";
                          } else {
                            dieSymbol.className = "fas " + property.system.icon;
                          }
                        }
                        dieContainer.appendChild(dieSymbol);

                        badgelabel.appendChild(dieContainer);

                    }

                    else if (property.system.labelformat == "S") {
                        badgelabel.className += " smalltext";

                    }
                    //  
                    if (property.system.tooltip != null)
                        if (property.system.tooltip != "")
                            if (property.system.tooltip.length > 0)
                                badgelabel.title = property.system.tooltip;

                    sInput.appendChild(badgelabel);

                    let extraDiv = deftemplate.createElement("DIV");
                    extraDiv.className = "badge-container";

                    let badgea = deftemplate.createElement('a');
                    badgea.className = "badge-image";
                    badgea.className += " badge-" + property.system.attKey;

                    let badgei = deftemplate.createElement('i');
                    badgei.className = "badge-click";
                    badgei.setAttribute("attKey", property.system.attKey);
                    badgei.setAttribute("attId", property._id);
                    badgei.setAttribute("title", property.system.tooltip);
                    badgea.appendChild(badgei);

                    extraDiv.appendChild(badgea);

                    if (game.user.isGM) {
                        let gmbadgea = deftemplate.createElement('a');
                        gmbadgea.setAttribute("attKey", property.system.attKey);
                        gmbadgea.setAttribute("attId", property._id);
                        gmbadgea.className = "badge-clickgm";

                        let gmbadgei = deftemplate.createElement('i');
                        gmbadgei.className = "fas fa-plus-circle";

                        gmbadgea.appendChild(gmbadgei);
                        extraDiv.appendChild(gmbadgea);
                    }

                    sInput.appendChild(extraDiv);
                }

                else if (property.system.datatype === "list") {

                    sInput = deftemplate.createElement("SELECT");
                    if (property.system.inputsize == "F") {
                        sInput.className = "input-free";
                    }

                    else if (property.system.labelsize == "S") {
                        sInput.className = "input-small";
                    }

                    else if (property.system.labelsize == "T") {
                        sInput.className = "input-tiny";
                    }

                    else if (property.system.labelsize == "M") {
                        sInput.className = "input-med";
                    }

                    else if (property.system.labelsize == "L") {
                        sInput.className = "input-medlarge";
                    }

                    else {
                        sInput.className = "input-med";
                    }

                    //sInput.className = "input-med";
                    
               // R: might need actor in handlebars
                    sInput.setAttribute("name", "system.attributes." + property.system.attKey + ".value");
                    sInput.setAttribute("title", property.system.tooltip);
                    sInput.insertAdjacentHTML('beforeend', "{{#select actor.system.attributes." + property.system.attKey + ".value}}");

                    //IM ON IT
                    var rawlist = property.system.listoptions;
                    if(rawlist.length>0){
                      var listobjects = rawlist.split(',');
                      let addedEmpty=false;
                      
                      for (var i = 0; i < listobjects.length; i++) {
                        let addThis=true;
                        if(listobjects[i]==''){
                          if(addedEmpty){
                            addThis=false;
                          } 
                          addedEmpty=true;
                        }
                        if(addThis){
                          let n_option = deftemplate.createElement("OPTION");
                          n_option.setAttribute("value", listobjects[i]);
                          n_option.textContent = listobjects[i];
                          sInput.appendChild(n_option);
                        }
                      }
                    }



                    sInput.insertAdjacentHTML('beforeend', "{{/select}}");
                }

                else if (property.system.datatype === "button") {
                    sInput = deftemplate.createElement("a");
                    sInput.setAttribute("title", property.system.tooltip);
                    if (property.system.labelformat != "D") {
                        sInput.className = "sbbutton";
                    }

                    let buttonContent = deftemplate.createElement("i");

                    buttonContent.className = property.system.attKey + "_button macrobutton";
                    if (property.system.labelformat != "D" && property.system.labelformat != "I") {
                        buttonContent.textContent = property.system.tag;
                    }
                    else {
                        if(property.system.labelformat == "D"){
                          buttonContent.className += " fas fa-dice-d20 ";
                        } else if(property.system.labelformat == "I"){
                          if(property.system.icon==''){
                            buttonContent.className += " fas fa-dice-d20 ";
                          } else {
                            buttonContent.className += " fas " + property.system.icon;
                          }
                        }
                    }

                    buttonContent.setAttribute("macroid", property.system.macroid);
                    sInput.appendChild(buttonContent);
                }

                else if (property.system.datatype === "table") {
                    new_row.className = "table-row " + property.system.attKey + "_row";

                    //TABLE LAYOUT
                    sInput = deftemplate.createElement("TABLE");
                    if (property.system.tableheight == "S") {
                        sInput.className = "table-small";
                    }
                    else if (property.system.tableheight == "M") {
                        sInput.className = "table-med";
                    }
                    else if (property.system.tableheight == "T") {
                        sInput.className = "table-tall";
                    }
                    else {
                        sInput.className = "table-free";
                    }

                    sInput.className += " sbtable";

                    sInput.setAttribute("name", "system.attributes." + property.system.attKey);
                    sInput.setAttribute("inputgroup", inputgroup);
                    sInput.setAttribute("value", "{{actor.system.attributes." + property.system.attKey + ".value}}");

                    sInput.innerHTML = '';

                    //get group
                    //const group = game.items.get(property.data.group.id);
                    const group = await auxMeth.getTElement(property.system.group.id, "group", property.system.group.ikey);

                    //Create header
                    let header = deftemplate.createElement("THEAD");
                    if (!property.system.hasheader)
                        header.style.display = "none";
                    sInput.appendChild(header);
                    let header_row = deftemplate.createElement("TR");
                    header_row.className += " " + fontgroup;
                    header_row.setAttribute("tableKey", property.system.attKey);
                    header.appendChild(header_row);
                    let firstColumnAssigned=false;
                    //Add name ta
                    if ((property.system.onlynames == "DEFAULT" || property.system.onlynames == "ONLY_NAMES")  && !property.system.isfreetable) {
                        if (!property.system.namecolumn) {
                            property.system.namecolumn = "Item";
                        }

                        let hnameCell = deftemplate.createElement("TH");
                        //hnameCell.className = "input-free";
                        hnameCell.className = "label-large";
                        hnameCell.textContent = property.system.namecolumn;
                        hnameCell.className += " tableheader nameheader sb-table-column-header-first-column";
                        firstColumnAssigned=true;
                        header_row.appendChild(hnameCell);
                    }
                    if ((property.system.onlynames == "NO_NAMES" && property.system.tableoptions.showicons==true )&& !property.system.isfreetable){
                      if (!property.system.namecolumn) {
                          property.system.namecolumn = "Item";
                      }

                      let hnameCell = deftemplate.createElement("TH");
                      
                      hnameCell.className = "sb-table-column-header-icon";
                      hnameCell.textContent = property.system.namecolumn;
                      hnameCell.title = property.system.namecolumn;
                      hnameCell.className += " tableheader nameheader sb-table-column-header-first-column";
                      firstColumnAssigned=true;
                      header_row.appendChild(hnameCell);
                    }
                    


                    if (property.system.onlynames != "ONLY_NAMES") {
                        if (property.system.hasactivation && !property.system.isfreetable) {
                            let hactiveCell = deftemplate.createElement("TH");
                            hactiveCell.className = "input-min";
                            hactiveCell.className += " tableheader";
                            if(!firstColumnAssigned){
                              firstColumnAssigned=true;
                              hactiveCell.className += " sb-table-column-header-first-column";
                            }
                            hactiveCell.textContent = property.system.tableoptions.columnheaderlabels.active;
                            hactiveCell.title = property.system.tableoptions.columnheaderlabels.active;
                            header_row.appendChild(hactiveCell);
                        }

                        if (property.system.hasunits && !property.system.isfreetable) {
                            let hnumberCell = deftemplate.createElement("TH");
                            hnumberCell.className = "input-min";
                            hnumberCell.className += " tableheader";
                            if(!firstColumnAssigned){
                              firstColumnAssigned=true;
                              hnumberCell.className += " sb-table-column-header-first-column";
                            }
                            hnumberCell.textContent = property.system.tableoptions.columnheaderlabels.num;
                            hnumberCell.title = property.system.tableoptions.columnheaderlabels.num;
                            header_row.appendChild(hnumberCell);
                        }

                        //REMOVE USES WORKSTREAM
                        if (property.system.hasuses && property.system.hasactivation && !property.system.isfreetable) {
                            let husesCell = deftemplate.createElement("TH");
                            husesCell.className = "input-uses";
                            husesCell.className += " tableheader";
                            if(!firstColumnAssigned){
                              firstColumnAssigned=true;
                              husesCell.className += " sb-table-column-header-first-column";
                            }
                            husesCell.textContent = property.system.tableoptions.columnheaderlabels.uses;
                            husesCell.title = property.system.tableoptions.columnheaderlabels.uses;
                            header_row.appendChild(husesCell);
                        }

                        if (group != null && property.system.tableoptions.showGroupProperties) {
                            
                            let hideProperties=property.system.tableoptions.groupPropertiesToHide.split(",");
                             
                            const groupprops = group.system.properties;
                            //let isfirstFree = true;
                            for (let i = 0; i < groupprops.length; i++) {
                                //console.log(groupprops[i].id + " key:" + groupprops[i].ikey + " name:" + groupprops[i].name);

                                //let propTable = game.items.get(groupprops[i].id);
                                if (hideProperties.includes(groupprops[i].ikey)){
                                  continue;
                                }
                                
                                
                                let propTable = await auxMeth.getTElement(groupprops[i].id, "property", groupprops[i].ikey);
                                if (propTable == null)
                                    break;
                                let hCell = deftemplate.createElement("TH");

                                hCell.className = "input-med";

                                if (propTable.system.labelsize == "F") {
                                    hCell.className = "label-free";

                                }
                                else if (propTable.system.labelsize == "S") {
                                    hCell.className = "label-small";
                                }
                                else if (propTable.system.labelsize == "T") {
                                    hCell.className = "label-tiny";
                                }
                                else if (propTable.system.labelsize == "L" && propTable.system.inputsize == "M") {
                                    hCell.className = "label-medlarge";
                                }
                                else if (propTable.system.labelsize == "L" && propTable.system.inputsize == "L") {
                                    hCell.className = "label-big";
                                }
                                else if (propTable.system.labelsize == "L") {
                                    hCell.className = "label-large";
                                }
                                else {
                                    hCell.className = "label-med";
                                }

                                // if(property.data.isfreetable && isfirstFree){
                                //     hCell.className += " firstcol";
                                //     isfirstFree = false;
                                // }


                                hCell.className += " tableheader propheader";
                                if(!firstColumnAssigned){
                                  firstColumnAssigned=true;
                                  hCell.className += " sb-table-column-header-first-column";
                                }
                                hCell.setAttribute("attKey", propTable.system.attKey);
                                // if tag is not set check for label format
                                if(propTable.system.tag==''){
                                  switch(propTable.system.labelformat){
                                    case 'I':                                    
                                      hCell.innerHTML='<i class="fas '+ propTable.system.icon +'"></i>';
                                      hCell.title = propTable.system.tooltip;
                                      break;
                                    case 'D':                                    
                                      hCell.innerHTML='<i class="fas fa-dice-d20"></i>'
                                      hCell.title = propTable.system.tooltip;
                                      break;
                                    default:
                                      hCell.textContent = propTable.system.tag;
                                      hCell.title = propTable.system.tooltip;
                                      break;

                                  }
                                } else {
                                  hCell.textContent = propTable.system.tag;
                                  hCell.title = propTable.system.tooltip;
                                }
                                

                                if (!propTable.system.ishidden)
                                    header_row.appendChild(hCell);
                            }
                        }
                    }

                    //Add transfer column
                    if (property.system.transferrable && !property.system.isfreetable) {
                        let transferCell = deftemplate.createElement("TH");
                        transferCell.className = "input-min tableheader";
                        header_row.appendChild(transferCell);
                    }

                    //Add delete column
                    let deleteCell = deftemplate.createElement("TH");
                    deleteCell.className = " tableheader cell-empty";
                    header_row.appendChild(deleteCell);

                    let tbody = deftemplate.createElement("TBODY");
                    tbody.className = "table";
                    tbody.className += " " + inputgroup;
                    tbody.setAttribute("id", property._id);
                    sInput.appendChild(tbody);

                }

                else {

                    sInput = deftemplate.createElement("INPUT");

                    sInput.setAttribute("name", "system.attributes." + property.system.attKey + ".value");
                    sInput.setAttribute("value", "{{actor.system.attributes." + property.system.attKey + ".value}}");
                    sInput.setAttribute("title", property.system.tooltip);

                    if (property.system.datatype === "simplenumeric") {

                        sInput.setAttribute("type", "text");
                        sInput.className = "input-min";

                        if (property.system.inputsize == "M") {
                            sInput.className = "input-med";
                        }

                        if (!hasProperty(property.system, "maxvisible")) {
                            property.system.maxvisible = true;
                        }

                        if (property.system.automax != "" && property.system.maxvisible) {
                            sInputMax = await deftemplate.createElement("INPUT");
                            sInputMax.setAttribute("type", "text");
                            sInput.className = "input-ahalf ";
                            sInputMax.className = "input-bhalf input-disabled inputGM " + property.system.attKey + ".max";
                            sInputMax.setAttribute("name", "system.attributes." + property.system.attKey + ".max");
                            sInputMax.setAttribute("value", "{{actor.system.attributes." + property.system.attKey + ".max}}");
                        }

                        if (property.system.arrows && !property.system.ishidden) {
                            sInputArrows = deftemplate.createElement("SPAN");
                            let arrContainer = deftemplate.createElement("A");
                            arrContainer.className = "arrcontainer";
                            arrContainer.style.display = "inline-block";
                            arrContainer.setAttribute("attKey", property.system.attKey);
                            let arrUp = deftemplate.createElement("I");
                            arrUp.className = "arrup";
                            //arrUp.className = "arrup fas fa-caret-up";
                            let arrDown = deftemplate.createElement("I");
                            arrDown.className = "arrdown";
                            //arrDown.className = "arrdown fas fa-caret-down";

                            if (!property.system.editable) {
                                arrContainer.setAttribute("arrlock", true);
                            }

                            arrContainer.appendChild(arrUp);
                            arrContainer.appendChild(arrDown);
                            sInputArrows.appendChild(arrContainer);
                        }


                    }

                    else if (property.system.datatype == "label") {
                        sInput.setAttribute("type", "text");
                        sInput.className = "input-free";
                        sInput.style.display = "none";
                    }

                    else {
                        sInput.setAttribute("type", "text");
                        sInput.className = "";
                        if (property.system.inputsize != null) {
                            if (property.system.inputsize == "F") {
                                sInput.className = "input-free";
                            }

                            else if (property.system.inputsize == "S") {
                                sInput.className = "input-small";
                            }

                            else if (property.system.inputsize == "M") {
                                sInput.className = "input-med";
                            }

                            else if (property.system.inputsize == "L") {
                                sInput.className = "input-large";
                            }
                            else if (property.system.inputsize == "T") {
                                sInput.className = "input-tiny";
                            }
                        }
                        else {
                            sInput.className = "input-free";
                        }
                    }

                    if (property.system.auto != "") {
                        sInput.setAttribute("readonly", "true");
                        sInput.className += " input-disabled";
                    }

                }

                //Adds identifier
                sInput.className += " " + property.system.attKey;
                sInput.setAttribute('data-property-key',property.system.attKey);
                sInput.setAttribute('data-property-type',property.system.datatype);
                if (property.system.datatype != "table")
                    sInput.className += " " + inputgroup;
                //console.log(property);
                sInput.setAttribute("attId", property._id);

                if (!property.system.editable)
                    sInput.className += " inputGM";

                if (property.system.ishidden) {
                    sInput.style.display = "none";
                    if (sLabel != null && property.system.haslabel)
                        sLabel.style.display = "none";
                }


                if (property.system.datatype != "label")
                    await divtemp.appendChild(sInput);

                if (property.system.automax != "" && property.system.maxvisible && sInputMax != null) {
                    //sInputMax.className += " " + inputgroup;
                    //divtemp.insertBefore(sInputMax, sInput.nextSibling);
                    await divtemp.appendChild(sInputMax);
                }
                if (sInputArrows != null) {
                    await divtemp.appendChild(sInputArrows);
                }

                count++;

                if (count == columns) {
                    count = 0;
                }

            }
            //}, this);
        }

        //GEt final HTML
        var parentRow;
        //console.log("rwidth: " + flags.rwidth + " rows: " + flags.rows);
        if (multiID == null) {
            //console.log(tabpanel.name + " width: " + flags.rwidth + " rows: " + flags.rows + " initial: " + initial);
        }
        else {
            //console.log(tabpanel.name + " rwidth: " + flags.rwidth + " multiwidth: " + flags.multiwidth + " initial: " + initial + " maxrows " + flags.maxrows);
        }

        let checktest = deftemplate.getElementById(tabname + "row" + flags.rows);

        if ((flags.rwidth == 0 || initial) && (firstmrow || checktest == null)) {
            //console.log("setting new row attribute");
            parentRow = deftemplate.createElement("DIV");
            parentRow.className = 'new-block';

            if (multiID == null) {
                parentRow.setAttribute('id', tabname + "row" + flags.rows);
                await parentNode.appendChild(parentRow);
            }
            else {
                let multiwclass = flags.multiwclass;
                //console.log("MultiPanel Container " + multiwclass);
                let parentRoot;
                let parentGranda = deftemplate.createElement("DIV");
                parentGranda.setAttribute('id', multiID + "multi");
                parentGranda.className = multiwclass + "-col";

                //If has header:
                if (multiName != null && multiName != "") {
                    let new_header = document.createElement("DIV");

                    if (tabpanel.system.backg == "T") {
                        new_header.className = "panelheader-t";
                    }
                    else {
                        new_header.className = "panelheader";
                    }
                    new_header.className += " " + multiheadergroup;
                    new_header.textContent = multiName;
                    await parentGranda.appendChild(new_header);
                }



                //console.log("MultiRow Container: " + multiID + "multirow" + flags.maxrows);
                parentRow.setAttribute('id', multiID + "multirow" + flags.maxrows);

                if (flags.rwidth == 0) {
                    parentRoot = document.createElement("DIV");
                    parentRoot.className = 'new-block';
                    //console.log("creating row: " + flags.rows);
                    parentRoot.setAttribute('id', tabname + "row" + flags.rows);
                    await parentNode.appendChild(parentRoot);
                    await parentRoot.appendChild(parentGranda);
                }

                else {
                    parentRoot = deftemplate.getElementById(tabname + "row" + flags.rows);
                    await parentNode.appendChild(parentRoot);
                    await parentRoot.appendChild(parentGranda);
                }

                await parentGranda.appendChild(parentRow);

                //parentGranda conditional visibility, to reorganize in method with previous ones
                //                if(_paneldata.condop!="NON"){
                //                    let attProp = ".value";
                //                    if(_paneldata.condat!=null){
                //                        if(_paneldata.condat.includes("max")){
                //                            attProp = "";
                //                        }
                //                    }
                //
                //
                //                    if(_paneldata.condop=="EQU"){
                //                        if(_paneldata.condvalue == "true"||_paneldata.condvalue == "false" || typeof _paneldata.condvalue ==="boolean"){
                //                            parentGranda.insertAdjacentHTML( 'beforebegin', "{{#if actor.data.attributes." + _paneldata.condat + attProp + "}}" );
                //                            parentGranda.insertAdjacentHTML( 'afterend', "{{/if}}" );
                //                        }
                //                        else{
                //                            parentGranda.insertAdjacentHTML( 'afterbegin', "{{#ifCond actor.data.attributes." + _paneldata.condat + attProp + " '" + _paneldata.condvalue + "'}}" );
                //                            parentGranda.insertAdjacentHTML( 'beforeend', "{{/ifCond}}" );
                //                        }
                //
                //                    }
                //
                //                    else if(_paneldata.condop=="HIH"){
                //                        parentGranda.insertAdjacentHTML( 'afterbegin', "{{#ifGreater actor.data.attributes." + _paneldata.condat + attProp + " '" + _paneldata.condvalue + "'}}" );
                //                        parentGranda.insertAdjacentHTML( 'beforeend', "{{/ifGreater}}" );
                //                    }
                //
                //                    else if(_paneldata.condop=="LOW"){
                //                        parentGranda.insertAdjacentHTML( 'afterbegin', "{{#ifLess actor.data.attributes." + _paneldata.condat + attProp + " '" + _paneldata.condvalue + "'}}" );
                //                        parentGranda.insertAdjacentHTML( 'beforeend', "{{/ifLess}}" );
                //                    }
                //                }

            }


        }

        else {

            if (multiID == null) {
                //console.log("getting existing row id " + tabname + "row" + flags.rows);
                parentRow = deftemplate.getElementById(tabname + "row" + flags.rows);
            }
            else {
                if (initial) {
                    //parentRow = deftemplate.getElementById(multiID + "multi");
                    parentRow = document.createElement("DIV");
                    parentRow.className = 'new-multiblock';

                    let parentRoot;
                    let parentGranda = deftemplate.getElementById(multiID + "multi");

                    //console.log("Creating multiRow Container: " + multiID + "multirow" + flags.maxrows);
                    parentRow.setAttribute('id', multiID + "multirow" + flags.maxrows);

                    if (flags.rwidth == 0) {
                        parentRoot = deftemplate.createElement("DIV");
                        parentRoot.className = 'new-block';
                        //console.log("creating row: " + flags.rows);
                        parentRoot.setAttribute('id', tabname + "row" + flags.rows);
                    }

                    else {
                        parentRoot = deftemplate.getElementById(tabname + "row" + flags.rows);

                    }

                    await parentNode.appendChild(parentRoot);
                    await parentRoot.appendChild(parentGranda);
                    await parentGranda.appendChild(parentRow);
                }
                else {
                    parentRow = deftemplate.getElementById(multiID + "multirow" + flags.maxrows);
                }

            }

        }
        //console.log("almost there");
        await parentRow.appendChild(div6);
        //console.log(div6);

        //ADD VISIBILITY RULES TO PANEL
        if (tabpanel.system.condop != "NON") {
            let attProp = ".value";
            if (tabpanel.system.condat != null) {
                if (tabpanel.system.condat.includes(".max")) {
                    attProp = "";
                }
            }


            if (tabpanel.system.condop == "EQU") {
                //console.log(div6);
                if ((tabpanel.system.condvalue === "true" || tabpanel.system.condvalue === "false" || tabpanel.system.condvalue === true || tabpanel.system.condvalue === false)) {
                    div6.insertAdjacentHTML('beforebegin', "{{#if actor.system.attributes." + tabpanel.system.condat + attProp + "}}");
                    div6.insertAdjacentHTML('afterend', "{{/if}}");
                }
                else {
                    div6.insertAdjacentHTML('afterbegin', "{{#ifCond actor.system.attributes." + tabpanel.system.condat + attProp + " '" + tabpanel.system.condvalue + "'}}");
                    div6.insertAdjacentHTML('beforeend', "{{/ifCond}}");
                }

            }

            else if (tabpanel.system.condop == "HIH") {
                div6.insertAdjacentHTML('afterbegin', "{{#ifGreater actor.system.attributes." + tabpanel.system.condat + attProp + " '" + tabpanel.system.condvalue + "'}}");
                div6.insertAdjacentHTML('beforeend', "{{/ifGreater}}");
            }

            else if (tabpanel.system.condop == "LOW") {
                div6.insertAdjacentHTML('afterbegin', "{{#ifLess actor.system.attributes." + tabpanel.system.condat + attProp + " '" + tabpanel.system.condvalue + "'}}");
                div6.insertAdjacentHTML('beforeend', "{{/ifLess}}");
            }

            else if (tabpanel.system.condop == "NOT") {
                div6.insertAdjacentHTML('afterbegin', "{{#ifNot actor.system.attributes." + tabpanel.system.condat + attProp + " '" + tabpanel.system.condvalue + "'}}");
                div6.insertAdjacentHTML('beforeend', "{{/ifNot}}");
            }
        }

        if (tabpanel.system.isimg) {
            div6.setAttribute("img", tabpanel.system.imgsrc);
            div6.className += " isimg";

            if (tabpanel.system.contentalign == "center")
                div6.className += " centertext";
        }

        //console.log(div6);

        //console.log("almost there 2");
        let finalreturn = new XMLSerializer().serializeToString(deftemplate);
        return finalreturn;
        //this.actor.data.data._html = deftemplate.innerHTML;

    }

    async exportHTML(htmlObject, filename) {
        const data = new FormData();
        const blob = new Blob([htmlObject], { type: 'text/html' });

        data.append('target', 'worlds/' + game.data.world.name + "/");
        data.append('upload', blob, filename + '.html');
        data.append('source', 'data');
        //console.log(data);

        fetch('upload', { method: 'POST', body: data });

    };

    /* -------------------------------------------- */

    /**
   * Builds the character sheet template based on the options included
   */

    async buildSheet() {
        const actor = this.actor;
        const tabs = actor.system.tabs;
        const flags = this.actor.flags;
        console.log("Sandbox | buildSheet | Building sheet for actor "+ actor.name);
        let newhtml = await auxMeth.buildSheetHML();
        let stringHTML = new XMLSerializer().serializeToString(newhtml);
        //console.log(stringHTML);
        await this.actor.update({ "system._html": stringHTML });

        setProperty(flags, "rows", 0);
        setProperty(flags, "rwidth", 0);
        setProperty(flags, "multiwidth", 0);
        setProperty(flags, "maxwidth", 0);
        setProperty(flags, "maxrows", 0);
        setProperty(flags, "multiwclass", "");

        //console.log(actor);

        let keychecker = await this.checkTemplateKeys(tabs);
        await this.actor.update({ "system.buildlog": keychecker.checkerMsg });
        //console.log(keychecker);
        if (keychecker.hasissue) {
            ui.notifications.warn("Template actor has consistency problems, please check Config Tab");
            return;
        }
        else {
            await this.buildHTML(tabs);
            // Note. Weird workflow.
            // This will never happen since the call chain from buildHTML ends with registerHTML that does a reload???
            console.log("Sandbox | buildSheet | Updating flags for actor "+ actor.name);
            this.actor.update({ "flags": flags }, { diff: false });
            console.log("Sandbox | buildSheet | Build complete for actor "+ actor.name);
        }


    }

    



    async checkTemplateKeys(tabs) {
        let hasissue = false;
        let compilationMsg = "";
        let myreturn = {};


        //SET CurRenT DATE
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        var sNow = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

        today = mm + '/' + dd + '/' + yyyy + ' ' + sNow;
        compilationMsg += "Last rebuilt: " + today + ", ";

        let allProps = [];
        let allTabs = [];
        let allPanels = [];
        for (let y = 0; y < tabs.length; y++) {
            //let titem = game.items.get(tabs[y].id);
            let titem = await auxMeth.getTElement(tabs[y].id, "sheettab", tabs[y].ikey);
            let tabitempanels = [];
            if (titem != null) {
                tabitempanels = titem.system.panels;
                allTabs.push(titem.system.tabKey);
            }
            else {
                allTabs.push(tabs[y].name + "_TAB_NONEXISTING");
                hasissue = true;
            }

            if (tabitempanels == null)
                tabitempanels = [];

            for (let i = 0; i < tabitempanels.length; i++) {
                //let tabpanel = game.items.get(tabitempanels[i].id);
                let tabpanel = await auxMeth.getTElement(tabitempanels[i].id, "panel", tabitempanels[i].ikey);
                console.log("Sandbox | checkTemplateKeys | Building panel with Key: " + tabitempanels[i].ikey);
                if (tabpanel == null)
                    //ui.notifications.warn("Panel not found. Key[" + tabitempanels[i].ikey + "]");
                    console.log("Sandbox | checkTemplateKeys | Panel not found. Key[" + tabitempanels[i].ikey + "]");
                //console.log(tabpanel.name);
                let panelproperties = [];
                if (tabpanel != null) {
                    if (tabpanel.system.type == "multipanel") {
                        for (let b = 0; b < tabpanel.system.panels.length; b++) {
                            //let subpanel = game.items.get(tabpanel.data.data.panels[b].id);
                            //console.log(tabpanel.system.panels[b]);
                            
                            let subpanel = await auxMeth.getTElement(tabpanel.system.panels[b].id, "panel", tabpanel.system.panels[b].ikey);
                            if (subpanel) {
                                let subproperties = subpanel.system.properties;
                                allPanels.push(subpanel.system.panelKey);
                                panelproperties = [].concat(panelproperties, subproperties);
                            }
                            else {
                                ui.notifications.warn("Please remove panel " + tabpanel.system.panels[b].name + " at multipanel " + tabpanel.name);
                                console.warn("Sandbox | checkTemplateKeys | Please remove panel " + tabpanel.system.panels[b].name + " at multipanel " + tabpanel.name);
                            }

                        }
                    }
                    else {
                        panelproperties = tabpanel.system.properties;
                        allPanels.push(tabpanel.system.panelKey);
                    }

                }
                else {
                    allPanels.push(tabitempanels[i].name + "_PANEL_NONEXISTING");
                    hasissue = true;
                }

                if (panelproperties == null)
                    panelproperties = [];

                for (let j = 0; j < panelproperties.length; j++) {
                    //let property = game.items.get(panelproperties[j].id);
                    let property = await auxMeth.getTElement(panelproperties[j].id, "property", panelproperties[j].ikey);
                    if (property != null) {
                        if (property.system.datatype == "table" && property.system.group.id == null) {
                            compilationMsg += panelproperties[j].name + " table property lacks table group";
                            hasissue = true;
                        }

                        allProps.push(property.system.attKey);


                    }
                    else {
                        allProps.push(panelproperties[j].name + "_PROP_NONEXISTING");
                        hasissue = true;
                    }

                }

            }
        }

        //CHECK FOR DUPLICATES
        let duplicateProps = allProps.filter((e, i, a) => a.indexOf(e) !== i);
        for (let n = 0; n < duplicateProps.length; n++) {
            compilationMsg += "property key " + duplicateProps[n] + " is duplicated,";
        }

        let duplicatePanels = allPanels.filter((e, i, a) => a.indexOf(e) !== i);
        for (let m = 0; m < duplicatePanels.length; m++) {
            compilationMsg += "panel key " + duplicatePanels[m] + " is duplicated, ";
        }

        let duplicateTabs = allTabs.filter((e, i, a) => a.indexOf(e) !== i);
        for (let s = 0; s < duplicateTabs.length; s++) {
            compilationMsg += "panel key " + duplicateTabs[s] + " is duplicated, ";
        }

        //CHECK FOR INCORRECT KEYS
        for (let checkPrKey in allProps) {
            if (/\s/.checkPrKey) {
                compilationMsg += "property key " + checkPrKey + " includes blank space, ";
                hasissue = true;
            }

        }

        for (let checkPaKey in allPanels) {
            if (/\s/.checkPaKey) {
                compilationMsg += "panel key " + checkPaKey + " includes blank space, ";
                hasissue = true;
            }

        }

        for (let checkTaKey in allTabs) {
            if (/\s/.checkTaKey) {
                compilationMsg += "tab key " + checkTaKey + " includes blank space, ";
                hasissue = true;
            }

        }

        //CHECK NONEXISTING TEMPLATE ELEMENTS
        let nonEmsg = "";
        let checkNonE = allProps.concat(allPanels, allTabs);
        let nonE = checkNonE.filter(y => y.includes("_NONEXISTING"));
        if (nonE.length > 0) {
            nonEmsg = ", the following elements do not exist in world (type included after _):";
            hasissue = true;
        }

        for (let r = 0; r < nonE.length; r++) {
            let noneKey = nonE[r].replace("_NONEXISTING", "");
            nonEmsg += noneKey + ", ";
        }

        compilationMsg += nonEmsg;

        //IF NOTHING WRONG
        if (!hasissue)
            compilationMsg += " SUCCESFULLY REBUILT";

        myreturn.hasissue = hasissue;
        myreturn.checkerMsg = compilationMsg;

        return myreturn;

    }

    find_duplicate_in_array(myarray) {
        let result = [];
        for (let i = 0; i < myarray.length; i++) {
            let myelement = myarray[i];
            let timespresent = myarray.filter((v) => (v === myelement)).length;
            if (timespresent > 0 && !result.includes(myelement))
                result.push(myelement);
        }
        return result;
    }

    async buildHTML(tabs) {        
        console.log("Sandbox | buildHTML | Building HTML for actor "+ this.actor.name);
        let newHTML;
        //if (game.settings.get("sandbox", "consistencycheck") != "") {
        //await auxMeth.checkConsistency();
        //}
        const flags = this.actor.flags;
        for (let y = 0; y < tabs.length; y++) {
            //const titem = game.items.get(tabs[y].id).data;
            let titemfinder = await auxMeth.getTElement(tabs[y].id, "sheettab", tabs[y].ikey);
            const titem = titemfinder;
            //console.log(titem);
            //console.log(tabs[y].ikey);
            flags.rwidth = 0;
            newHTML = await this.addNewTab(newHTML, titem, y + 1);
            //console.log(newHTML);
            let tabname = titem.system.tabKey;
            //let gtabitem = JSON.parse(titem.data.panels);
            let tabitempanels = titem.system.panels;
            //console.log(tabitempanels);
            flags.maxrows = 0;
            for (let i = 0; i < tabitempanels.length; i++) {
                //let tabpanel = game.items.get(tabitempanels[i].id);
                let tabpanel = await auxMeth.getTElement(tabitempanels[i].id, "panel", tabitempanels[i].ikey);
                //console.log(tabpanel);
                if (tabpanel.type == "panel")
                    newHTML = await this.addNewPanel(newHTML, tabpanel, titem.system.tabKey, tabname, true);
                //                if(newpanelHTML!=null)
                //                    break;
                //console.log(newHTML);
                if (tabpanel.type == "multipanel") {
                    //console.log("hay multi!");
                    let multipanels = tabpanel.system.panels;
                    let multiwidth = this.freezeMultiwidth(tabpanel);
                    let newtotalwidth = flags.rwidth + multiwidth;
                    flags.maxwidth = multiwidth;
                    flags.multiwidth = 0;
                    flags.multiwclass = this.getmultiWidthClass(tabpanel.system.width);
                    //console.log(multipanels);
                    let firstmrow = true;
                    let ismulti = true;
                    for (let j = 0; j < multipanels.length; j++) {
                        //let singlepanel = game.items.get(multipanels[j].id);
                        let singlepanel = await auxMeth.getTElement(multipanels[j].id, "panel", multipanels[j].ikey);
                        //console.log(multipanels[j]);
                        //LAst argument is only to pass the conditionals. Poorly done, to fix in the future.
                        newHTML = await this.addNewPanel(newHTML, singlepanel, titem.system.tabKey, tabname, firstmrow, tabpanel.system.panelKey, tabpanel.system.title, null, tabpanel.system.headergroup);
                        newHTML = await this.addMultipanelVisibility(newHTML, tabpanel.system.panelKey, tabpanel.system.condat, tabpanel.system.condop, tabpanel.system.condvalue);
                        if (firstmrow)
                            flags.rwidth += multiwidth;
                        firstmrow = false;
                    }
                }
            }
            //            if(newpanelHTML!=null)
            //                break;
        }
        if (newHTML == null)
            newHTML = this.actor.system._html;
        //console.log("panels built");
        await this.hideTabsinTemplate();
        //console.log(newHTML);
        var wrapper = document.createElement('div');
        wrapper.innerHTML = newHTML;
        this.actor.system._html = newHTML;
        let deftemplate = wrapper;
        //console.log(deftemplate);
        await this.registerHTML(deftemplate.querySelector("#sheet").outerHTML);
    }

    async addMultipanelVisibility(html, multiKey, att, op, val) {
        let deftemplate = new DOMParser().parseFromString(html, "text/html");
        let parentGranda = deftemplate.getElementById(multiKey + "multi");
        if (op != "NON") {
            let attProp = ".value";
            if (att != null) {
                if (att.includes(".max")) {
                    attProp = "";
                }
            }


            if (op == "EQU") {
                if (val == "true" || val == "false" || typeof val === "boolean") {
                    parentGranda.insertAdjacentHTML('beforebegin', "{{#if actor.system.attributes." + att + attProp + "}}");
                    parentGranda.insertAdjacentHTML('afterend', "{{/if}}");
                }
                else {
                    parentGranda.insertAdjacentHTML('afterbegin', "{{#ifCond actor.system.attributes." + att + attProp + " '" + val + "'}}");
                    parentGranda.insertAdjacentHTML('beforeend', "{{/ifCond}}");
                }

            }

            else if (op == "HIH") {
                parentGranda.insertAdjacentHTML('afterbegin', "{{#ifGreater actor.system.attributes." + att + attProp + " '" + val + "'}}");
                parentGranda.insertAdjacentHTML('beforeend', "{{/ifGreater}}");
            }

            else if (op == "LOW") {
                parentGranda.insertAdjacentHTML('afterbegin', "{{#ifLess actor.system.attributes." + att + attProp + " '" + val + "'}}");
                parentGranda.insertAdjacentHTML('beforeend', "{{/ifLess}}");
            }

            else if (op == "NOT") {
                parentGranda.insertAdjacentHTML('afterbegin', "{{#ifNot actor.system.attributes." + att + attProp + " '" + val + "'}}");
                parentGranda.insertAdjacentHTML('beforeend', "{{/ifNot}}");
            }
        }

        let finalreturn = new XMLSerializer().serializeToString(deftemplate);
        return finalreturn;
    }

    hideTabsinTemplate() {
        var wrapper = document.createElement('div');
        wrapper.innerHTML = this.actor.system._html;
        let deftemplate = wrapper;

        //Tab selector
        let p = deftemplate.querySelector("#tab-0");
        let c = deftemplate.querySelector("#tab-last");
        p.insertAdjacentHTML('beforebegin', "{{#if actor.system.istemplate}}");
        p.insertAdjacentHTML('beforebegin', "{{else}}");
        c.insertAdjacentHTML('afterend', "{{/if}}");


    }

    freezeMultiwidth(tabpanel) {
        let newidth = 0;
        if (tabpanel.system.width === "1") {
            newidth = 1;
        }

        else if (tabpanel.system.width === "1/3") {
            newidth = 0.333;
        }

        else if (tabpanel.system.width === "2/3") {
            newidth = 0.666;
        }

        else if (tabpanel.system.width === "5/6") {
            newidth = 0.833;
        }

        else if (tabpanel.system.width === "3/4") {
            newidth = 0.75;
        }

        else if (tabpanel.system.width === "1/2") {
            newidth = 0.5;
        }

        else if (tabpanel.system.width === "1/4") {
            newidth = 0.25;
        }

        else if (tabpanel.system.width === "1/6") {
            newidth = 0.166;
        }

        else if (tabpanel.system.width === "1/8") {
            newidth = 0.125;
        }
        else if (tabpanel.system.width === "3/10") {
            newidth = 0.3;
        }
        else if (tabpanel.system.width === "1/16") {
            newidth = 0.0625;
        }
        else if (tabpanel.system.width === "5/8") {
            newidth = 0.625;
        }
        else if (tabpanel.system.width === "3/8") {
            newidth = 0.375;
        }

        else {
            newidth = 1;
        }
        return newidth;
    }

    getmultiWidthClass(width) {
        let wclass = "";
        if (width === "1") {
            wclass = "multi-1-1";
        }

        else if (width === "1/3") {
            wclass = "multi-1-3";
        }

        else if (width === "2/3") {
            wclass = "multi-2-3";
        }

        else if (width === "5/6") {
            wclass = "multi-5-6";
        }

        else if (width === "1/2") {
            wclass = "multi-1-2";
        }

        else if (width === "1/4") {
            wclass = "multi-1-4";
        }

        else if (width === "3/4") {
            wclass = "multi-3-4";
        }

        else if (width === "1/6") {
            wclass = "multi-1-6";
        }

        else if (width === "1/8") {
            wclass = "multi-1-8";
        }
        else if (width === "3/10") {
            wclass = "multi-3-10";
        }
        else if (width === "1/16") {
            wclass = "multi-1-16";
        }
        else if (width === "5/8") {
            wclass = "multi-5-8";
        }
        else if (width === "3/8") {
            wclass = "multi-3-8";
        }

        else {
            wclass = "multi-1-1";
        }
        return wclass;
    }



    async registerHTML(htmlObject) {        
        console.log("Sandbox | registerHTML | Registering HTML for actor "+ this.actor.name);
        let stringed = htmlObject.replace('=""', '');
        stringed = stringed.replace(/toparse="/g, '');
        stringed = stringed.replace(/~~"/g, '');
        //this.actor.data.data.gtemplate = this.actor.name;
        this.refreshSheet(this.actor.name);
        //this.actor.data.data._html = stringed;
        await this.actor.update({ "system._html": stringed });
        //console.log(stringed);
        //THIS IS THE LIMITANT CHANGE:
        //await this.actor.update(this.actor.data);
        await this.actor.update();
        await auxMeth.getSheets();               
        let reloadAfterTemplateRebuildDisabled=game.user.getFlag('world','reloadAfterTemplateRebuildDisabled') || false;
        if(!reloadAfterTemplateRebuildDisabled){
          await auxMeth.checkConsistency();
          console.log("Sandbox | registerHTML | Re-loading for actor "+ this.actor.name);
          //Comment this for debug
          location.reload();
        }
    }

    /* -------------------------------------------- */

    /**
   * Drop element event
   */
    async _onDrop(event) {
        //Initial checks
        event.preventDefault();
        event.stopPropagation();
        let dropitem;
        let dropdata;

        try {
            dropdata = JSON.parse(event.dataTransfer.getData('text/plain'));
            dropitem = await Item.implementation.fromDropData(dropdata);

            if (dropitem.type !== "sheettab" && dropitem.type !== "cItem") {
                ui.notifications.warn('You can only drop sheettabs or cItems!');
                console.log("You can only drop sheettabs or cItems!");
                return false;
            }
        }
        catch (err) {
            console.error("drop error");
            console.error(event.dataTransfer.getData('text/plain'));
            console.error(err);
            return false;
        }

        if (dropdata.ownerID) {

            if (this.actor.id == dropdata.ownerID)
                return;

            this.showTransferDialog(dropdata.id, dropdata.ownerID, dropdata.tokenID);
            return;
        }

        let subitemsTag;
        let isTab = true;
        let subiDataKey;
        let isUnique = true;

        if (dropitem.type == "sheettab") {
            subitemsTag = "tabs";
            subiDataKey = "tabKey";
        }
        else if (dropitem.type == "cItem") {
            subitemsTag = "citems";
            isTab = false;
            subiDataKey = "ciKey";

            if (!dropitem.system.isUnique) {
                isUnique = false;
            }
        }

        //Add tab id to panel
        let subitems = duplicate(this.actor.system[subitemsTag]);
        let increaseNum = false;

        for (let i = 0; i < subitems.length; i++) {
            if (subitems[i].id == dropitem.id) {
                if (isUnique) {
                    ui.notifications.warn('Item is unique, can not double');
                    console.warn("item is unique, can not double");
                    return;
                }
                else {
                    subitems[i].number = parseInt(subitems[i].number) + 1;
                    subitems[i].uses = parseInt(subitems[i].uses) + parseInt(dropitem.system.maxuses);
                    increaseNum = true;
                    //await this.updateSubItems(isTab,subitems);
                    //await this.actor.actorUpdater();
                    //return;
                }

            }
        }

        if (!increaseNum) {
            if (dropitem.type == "cItem") {
                //console.log("adding cItem");
                subitems = await this.actor.addcItem(dropitem);
            }
            else {
                let itemKey = dropitem.system[subiDataKey];
                let newItem = {};
                //console.log(dropitem);
                setProperty(newItem, itemKey, {});
                newItem[itemKey].id = dropitem.id;
                newItem[itemKey].ikey = itemKey;
                newItem[itemKey].name = dropitem.name;
                //console.log(newItem);


                subitems.push(newItem[itemKey]);
                //await this.scrollbarSet();
            }
        }

        //console.log(subitems);
        await this.updateSubItems(isTab, subitems);

    }
    async updateSubItems(isTab, subitems) {

        //await this.actor.update();

        if (isTab) {
            //await this.actor.update({"data.tabs": subitems}, {diff: false});
            this.actor.system.tabs = subitems;
            await this.actor.update({ "system.tabs": subitems });
        }

        else {

            //this.actor.data.data.citems= subitems;
            //await this.actor.update(this.actor.data);
            if (this.actor.isToken) {
                let myToken = canvas.tokens.get(this.actor.token.id);
                await myToken.actor.update({ "system.citems": subitems });
            }

            else {
                //console.log(subitems);
                await this.actor.update({ "system.citems": subitems });
            }
        }
        //console.log("updating after drop");


        return subitems;
    }
    /* -------------------------------------------- */
    
    
    async refreshCItems(basehtml) {
        //console.log("refreshingCItems");
        const OPTION_USE_CITEM_INFO_FORM_FOR_PLAYERS = sb_item_sheet_get_game_setting("sandbox", SETTINGATTRIBUTE.OPTION_USE_CITEM_INFO_FORM_FOR_PLAYERS.ID);
        const OPTION_USE_CITEM_INFO_FORM_FOR_GMS = sb_item_sheet_get_game_setting("sandbox", SETTINGATTRIBUTE.OPTION_USE_CITEM_INFO_FORM_FOR_GMS.ID);
        let showCitemInfoOnly=false;
        if (game.user.isGM){
          if (OPTION_USE_CITEM_INFO_FORM_FOR_GMS){
            showCitemInfoOnly=true;
          }
        } else {
          if(OPTION_USE_CITEM_INFO_FORM_FOR_PLAYERS){
            showCitemInfoOnly=true;
          }
        }
        //TEST
        var parser = new DOMParser();
        let htmlcode = await auxMeth.getTempHTML(this.actor.system.gtemplate);
        var _basehtml = await parser.parseFromString(htmlcode, 'text/html').querySelector('form');
        if (_basehtml == null) {
            ui.notifications.warn("Please rebuild character sheet before assigning");
            return;
        }

        //console.log(basehtml);
        //GET CITEMS
        let myactor = this.actor.system;

        if (this.actor.isToken) {
            // v10 has longer ids
            let tokenId = this.id.split("-")[4];
            let mytoken = canvas.tokens.get(tokenId);
            myactor = mytoken.actor.system;
        }
        const citems = myactor.citems;
        const attributes = myactor.attributes;

        //SET TABLES INFO
        const html = await basehtml.find(".table");
        const _html = await _basehtml.querySelectorAll('table');

        //Gets all game properties
        const propitems = game.items.filter(y => y.type == "property" && y.system.datatype == "table");
        //console.log(propitems);

        let totalTables = [];
        let forceUpdate = false;

        for (let y = 0; y < html.length; y++) {
            let tableID = html[y].id;
            let tableVisible = true;
            let newElement = { tableID, tableVisible };
            totalTables.push(newElement);
        }

        for (let y = 0; y < _html.length; y++) {
            let tableID = _html[y].getAttribute("attid");
            let tableVisible = false;
            let existingTable = totalTables.find(y => y.tableID == tableID);
            let newElement = { tableID, tableVisible };
            if (existingTable == null) {
                totalTables.push(newElement);
            }

        }

        //console.log(totalTables);
        let tableHasValidFilter=null;
        for (let i = 0; i < totalTables.length; i++) {
            //console.log(totalTables[i]);
            let tableID = totalTables[i].tableID;
            //create disconnected node, this will make appends to the DOM only occur at the final stage
            // otherwise it would be slow as f*
            let table;
            try {
              if(html[i]!=null)
                table = html[i].cloneNode(true);
            }
            catch (err){
              console.error('refreshCItems | ' + err.message );
            }
            let inputgroup;
            let columncount=0;

            if (table != null) {
                table.innerHTML = '';
                inputgroup = await html[i].parentNode.getAttribute("inputgroup");
                if (inputgroup == null)
                    inputgroup = await html[i].getAttribute("inputgroup");
            }

            if (inputgroup == null)
                inputgroup = "";
            const propTable = await propitems.find(y => y.id == tableID);
            let group;
            let groupID;
            let tableKey;
            let isFree;

            if (propTable != null) {
                groupID = propTable.system.group;
                //group = game.items.get(groupID.id);
                group = await auxMeth.getTElement(groupID.id, "group", groupID.ikey);
                tableKey = propTable.system.attKey;
                isFree = propTable.system.isfreetable;
                if(!isFree){
                  tableHasValidFilter=sb_property_has_valid_table_filter(propTable); 
                }
            }

            if (group != null) {

                let groupprops = group.system.properties;
                let groupcitems;

                if (isFree) {
                    if (attributes[tableKey] != null) {
                        groupcitems = attributes[tableKey].tableitems;

                        if (this.sortOption != null) {
                            if (this.sortOption[tableKey] != null) {
                                groupcitems = groupcitems.sort(auxMeth.aTdynamicSort(this.sortOption[tableKey], propTable.system.datatype));
                            }

                        }
                    }

                    if (groupcitems == null)
                        groupcitems = [];

                }
                else {
                    groupcitems = await citems.filter(y => y.groups.find(item => item.id == groupID.id || item.ikey == groupID.ikey));
                    groupcitems = groupcitems.sort(auxMeth.dynamicSort("name"));
                    if(tableHasValidFilter!=null){
                      // only allow other sorting if no filter exists(would mess up the totals)
                      if (this.sortOption != null) {
                          if (this.sortOption[tableKey] != null && this.sortOption[tableKey] != "name") {
                              groupcitems = groupcitems.sort(auxMeth.aTdynamicSort(this.sortOption[tableKey], propTable.system.datatype));
                          }

                      }
                    }
                }
                let filter_passed_count=0;
                let hideProperties=propTable.system.tableoptions.groupPropertiesToHide.split(",");
                for (let n = 0; n < groupcitems.length; n++) {
                    
                    let ciObject = groupcitems[n];
                    if (!isFree) {
                    // check for filter                    
                      if (tableHasValidFilter!=null){
                        //console.warn('Filter found for table '+ propTable.name )
                        //console.warn(ciObject)
                        // check filter
                        if(sb_table_filter_passed(tableHasValidFilter, ciObject, filter_passed_count)){
                          // passsed
                          filter_passed_count = filter_passed_count + 1;
                        } else{
                          // skip this
                          continue;
                        }

                      }
                    }
                    
                    let ciTemplate;
                    if (!isFree) {                        
                        ciTemplate = await auxMeth.getcItem(ciObject.id, ciObject.ciKey);
                    }

                    //console.log(ciObject.name);
                    let new_row = document.createElement("TR");
                    new_row.className = "table-row " + inputgroup + " " + propTable.system.attKey + "_row";
                    let rowname = "table-row-" + ciObject.id;
                    if (!isFree)
                        rowname = ciObject.name;
                    new_row.setAttribute("name", ciObject.name);
                    new_row.setAttribute("id", ciObject.id);
                    new_row.setAttribute("ciKey", ciObject.ciKey);
                    if (table != null)
                        table.appendChild(new_row);

                    if (ciObject != null && (ciTemplate != null || isFree)) {
                        //Link Element
                        let isFirstColumnSet=false;
                        if ((propTable.system.onlynames == "DEFAULT" || propTable.system.onlynames == "ONLY_NAMES") && !isFree) {
                            let firstcell = document.createElement("TD");
                            firstcell.className = "input-free linkable tablenamecell " + propTable.system.attKey + "_namecell ";
                            if(!isFirstColumnSet){
                              firstcell.className += " sb-table-row-first-column";
                              isFirstColumnSet=true;
                            }
                            firstcell.className += " " + inputgroup;
                            // check if to use image
                            if(propTable.system.tableoptions.showicons){
                              const citem=game.items.find(y => (y.system.ciKey == ciObject.ciKey));;
                              if(citem!=null){
                                const citemimg=citem.img;
                                firstcell.innerHTML = auxMeth.sb_two_col_card(`<img title="${ciObject.name}" src="${citemimg}" class="sb-citem-table-icon" /> `,  ciObject.name);
                              } else {
                                firstcell.textContent = ciObject.name;
                              }
                            } else {
                              firstcell.textContent = ciObject.name;
                            }
                                                                                    
                            firstcell.setAttribute("item_id", ciObject.id);
                            firstcell.setAttribute("item_ciKey", ciObject.ciKey);
                            //firstcell.addEventListener("click", this.linkCItem, false);
                            firstcell.addEventListener("click", (event) => {this.linkCItem(event, showCitemInfoOnly);}, false);
                            
                            
                            new_row.appendChild(firstcell);
                        }
                        if (propTable.system.onlynames == "NO_NAMES" && !isFree) {
                          // check if to use image
                          if(propTable.system.tableoptions.showicons){
                            const citem=game.items.find(y => (y.system.ciKey == ciObject.ciKey));;
                            if(citem!=null){
                              const citemimg=citem.img;
                              let firstcell = document.createElement("TD");
                              firstcell.className = "input-free linkable tablenamecell " + propTable.system.attKey + "_namecell ";
                              if(!isFirstColumnSet){
                                firstcell.className += " sb-table-row-first-column";
                                isFirstColumnSet=true;
                              }
                              firstcell.className += " " + inputgroup;
                              firstcell.innerHTML = auxMeth.sb_two_col_card(`<img title="${ciObject.name}" src="${citemimg}" class="sb-citem-table-icon" /> `,  "");
                              firstcell.setAttribute("item_id", ciObject.id);
                              firstcell.setAttribute("item_ciKey", ciObject.ciKey);
                              //firstcell.addEventListener("click", this.linkCItem, false);
                              firstcell.addEventListener("click", (event) => {this.linkCItem(event, showCitemInfoOnly);}, false);
                              new_row.appendChild(firstcell);
                            } else {
                              firstcell.textContent = ciObject.name;
                            }
                          }
                        }


                        if ((propTable.system.onlynames != "ONLY_NAMES")) {
                            if (propTable.system.hasactivation && !isFree) {
                                let activecell = document.createElement("TD");
                                activecell.className = "input-min centertext";
                                activecell.className += " " + inputgroup;
                                if(!isFirstColumnSet){
                                  activecell.className += " sb-table-row-first-column";
                                  isFirstColumnSet=true;
                                }
                                new_row.appendChild(activecell);

                                if (ciObject.usetype == "ACT" && !isFree) {
                                    let activeinput = document.createElement("INPUT");
                                    activeinput.className = "centertext";
                                    activeinput.className += " " + inputgroup;
                                    activeinput.type = "checkbox";
                                    activeinput.checked = ciObject.isactive;

                                    activeinput.addEventListener("change", (event) => this.useCIIcon(ciObject.id, ciObject.ciKey, activeinput.checked, false, true));

                                    activecell.appendChild(activeinput);
                                }

                                else if (ciObject.usetype == "CON" && !isFree) {
                                    let inputwrapper = document.createElement('a');
                                    let torecharge = false;
                                    let isUsable=true;
                                    if (ciObject.uses > 0 || ciObject.maxuses == 0) {   
                                      isUsable=true;
                                      inputwrapper.addEventListener("click", (event) => this.useCIIcon(ciObject.id, ciObject.ciKey, false, true));
                                    }

                                    else {
                                        isUsable=false;
                                        
                                        if (ciObject.rechargable) {
                                            torecharge = true;
                                        }

                                        else {
                                            inputwrapper = document.createElement("DIV");
                                        }

                                    }

                                    inputwrapper.className = "consumable-button";
                                    if(isUsable) {
                                      inputwrapper.title = "Use item";
                                    } else {
                                      inputwrapper.title = "No uses left";
                                    }
                                    
                                    
                                    activecell.appendChild(inputwrapper);

                                    let activeinput = document.createElement('i');
                                    switch(ciObject.icon){
                                      case 'BOOK':
                                        activeinput.className = "fas fa-book";
                                        break;
                                      case 'VIAL':
                                        activeinput.className = "fas fa-vial";
                                        break;
                                      case 'STAR':
                                        activeinput.className = "fas fa-star";
                                        break;
                                      case '':
                                        activeinput.className = "fas fa-book";
                                        break;
                                      default:
                                        if(ciObject.icon !=''){
                                          activeinput.className = "fas " + ciObject.icon;
                                        } else {
                                          activeinput.className = "fas fa-book";
                                        }
                                        break;
                                    }
                                    
                                    if(!isUsable)
                                      activeinput.className += ' sb-citem-non-removable';
                                    

                                    if (torecharge) {
                                        activeinput.className = "fas fa-recycle";
                                        inputwrapper.title = "Recharge item";
                                        inputwrapper.addEventListener("click", (event) => this.rechargeCI(ciObject.id, ciObject.ciKey));
                                    }


                                    inputwrapper.appendChild(activeinput);
                                }

                            }

                            if (propTable.system.hasunits && !isFree) {
                                let numcell = document.createElement("TD");
                                numcell.className = "input-min centertext";
                                numcell.className += " " + inputgroup;
                                if(!isFirstColumnSet){
                                  numcell.className += " sb-table-row-first-column";
                                  isFirstColumnSet=true;
                                }
                                new_row.appendChild(numcell);

                                let numinput = document.createElement("INPUT");
                                numinput.setAttribute("type", "number");
                                numinput.className = "table-input table-num centertext";
                                
                                numinput.className += " " + inputgroup;

                                let ciNumber = ciObject.number;

                                numinput.value = ciObject.number;
                                numinput.addEventListener("change", (event) => this.changeCINum(ciObject.id, ciObject.ciKey, event.target.value));

                                numcell.appendChild(numinput);
                            }

                            //REMOVE USES WORKSTREAM
                            if (propTable.system.hasuses && propTable.system.hasactivation && !isFree) {
                                let usescell = document.createElement("TD");
                                usescell.className = "tabblock-center";
                                usescell.className += " " + inputgroup;
                                if(!isFirstColumnSet){
                                  usescell.className += " sb-table-row-first-column";
                                  isFirstColumnSet=true;
                                }
                                new_row.appendChild(usescell);

                                let usevalue = document.createElement("INPUT");
                                usevalue.setAttribute("type", "number");
                                usevalue.className = "table-num centertext";
                                
                                usevalue.className += " " + inputgroup;

                                usescell.appendChild(usevalue);

                                if (!propTable.system.editable && !game.user.isGM) {
                                    //usevalue.setAttribute("readonly", "true");  
                                    usevalue.className += " inputGM";
                                }

                                if (ciObject.usetype == "CON") {

                                    let maxuses = ciObject.maxuses;

                                    // if (!isFree)
                                    //     maxuses = await auxMeth.autoParser(ciTemplate.data.data.maxuses, attributes, ciObject.attributes, false);
                                    // maxuses = parseInt(maxuses);

                                    let ciuses = ciObject.uses;

                                    // if (isNaN(ciuses))
                                    //     ciObject.uses = await auxMeth.autoParser(ciuses, attributes, ciObject.attributes, false);
                                    usevalue.value = parseInt(ciObject.uses);

                                    if (maxuses == 0) {
                                        usescell.className = " table-empty";
                                        usevalue.className = " table-empty-small";
                                        usevalue.value = "∞";
                                        usevalue.setAttribute("readonly", "true");
                                    }

                                    else {
                                        let separator = document.createElement("DIV");
                                        separator.className = "table-sepnum";
                                        separator.textContent = "/";

                                        let maxusevalue = document.createElement("DIV");

                                        let numberuses = ciObject.number;
                                        if (numberuses == 0)
                                            numberuses = 1;

                                        maxusevalue.className = "table-maxuse table-num centertext";
                                        // maxusevalue.textContent = "/ " + parseInt(numberuses * maxuses);
                                        maxusevalue.textContent = parseInt(ciObject.maxuses);
                                        usevalue.addEventListener("change", (event) => this.changeCIUses(ciObject.id, event.target.value));
                                        usescell.appendChild(separator);
                                        usescell.appendChild(maxusevalue);
                                    }



                                }

                                else {
                                    usescell.className = " table-empty";
                                    usevalue.className = " table-empty-small";
                                    usevalue.value = " ";
                                    usevalue.setAttribute("readonly", "true");
                                }

                            }

                            let isfirstFree = true;
                            if(propTable.system.tableoptions.showGroupProperties){
                                // check hide list
                                for (let k = 0; k < groupprops.length; k++) {
                                    if (hideProperties.includes(groupprops[k].ikey)){
                                      continue;
                                    }
                                    let propRef = groupprops[k].id;
                                    //let propObj = game.items.get(groupprops[k].id);
                                    let propObj = await auxMeth.getTElement(groupprops[k].id, "property", groupprops[k].ikey);
                                    let propdata = propObj.system;
                                    let propKey = propObj.system.attKey;
                                    let new_cell = document.createElement("TD");
                                    let isconstant = groupprops[k].isconstant;

                                    new_cell.className = "centertext ";
                                    new_cell.className += propKey;
                                    new_cell.className += " " + inputgroup;
                                    if(!isFirstColumnSet){
                                      new_cell.className += " sb-table-row-first-column";
                                      isFirstColumnSet=true;
                                    }

                                    if (((ciObject.attributes[propKey] != null && propdata.datatype != "label") || (propdata.datatype == "label")) && !propdata.ishidden) {
                                        if (propdata.datatype == "textarea") {
                                            let textiContainer = document.createElement('a');
                                            let textSymbol = document.createElement('i');
                                            textSymbol.className = "far fa-file-alt";
                                            textiContainer.appendChild(textSymbol);
                                            new_cell.appendChild(textiContainer);
                                            new_row.appendChild(new_cell);
                                            let isdisabled = false;
                                            if (isconstant)
                                                isdisabled = true;
                                            textiContainer.addEventListener("click", (event) => {
                                                if (isFree) {
                                                    this.showFreeTextAreaDialog(ciObject.id, tableKey, propKey, isdisabled);
                                                }
                                                else {
                                                    this.showTextAreaDialog(ciObject.id, propKey, isdisabled);
                                                }
                                            });
                                        }

                                        else if (propdata.datatype != "table") {
                                            let constantvalue;
                                            let maxValue;
                                            let cvalueToString;
                                            let constantauto = false;
                                            let checknonumsum;
                                            if (propdata.datatype != "label")
                                                if (!isFree) {
                                                    if (ciTemplate.system.attributes[propKey] == null) {
                                                        ui.notifications.warn("Inconsistent cItem. Please remove and readd cItem " + ciTemplate.name + " to Actor");
                                                        console.warn(propKey + " not found in cItem:" + ciTemplate.name);
                                                    }

                                                    constantvalue = ciTemplate.system.attributes[propKey].value;
                                                    if (propdata.auto != "") {
                                                        constantauto = true;
                                                        constantvalue = propdata.auto;
                                                    }
                                                    cvalueToString = constantvalue.toString();
                                                    let nonumsum = /[#@]{|\%\[|\if\[|\?\[/g;
                                                    //let checknonumsum = cvalueToString.match(nonumsum);
                                                    checknonumsum = !Number.isNumeric(cvalueToString) && typeof cvalueToString != "boolean" ;
                                                    let t=typeof cvalueToString;
                                                    let justexpr = true;
                                                    if (propdata.datatype == "simplenumeric")
                                                        justexpr = false;
                                                    //
                                                    if (checknonumsum) {                                                    
                                                        constantvalue = await cvalueToString.replace(/\@{name}/g, this.actor.name);
                                                        constantvalue = await constantvalue.replace(/\#{name}/g, ciObject.name);
                                                        constantvalue = await constantvalue.replace(/\#{active}/g, ciObject.isactive);
                                                        constantvalue = await constantvalue.replace(/\#{uses}/g, ciObject.uses);
                                                        constantvalue = await constantvalue.replace(/\#{maxuses}/g, ciObject.maxuses);                                                                                                                                                            
                                                        constantvalue = await auxMeth.autoParser(constantvalue, this.actor.system.attributes, ciObject.attributes, justexpr, false, ciObject.number, ciObject.uses,ciObject.maxuses);
                                                        constantvalue = await game.system.api._extractAPIFunctions(constantvalue,this.actor.system.attributes, ciObject.attributes, justexpr, false, ciObject.number, ciObject.uses,ciObject.maxuses); 
                                                        constantvalue = await game.system.api.mathParser(constantvalue); 


                                                    }

                                                    if(propdata.datatype === "radio"){
                                                      maxValue = propdata.automax;
                                                      cvalueToString = maxValue.toString();
                                                      //checknonumsum = cvalueToString.match(nonumsum);
                                                      checknonumsum = !Number.isNumeric(cvalueToString) && typeof cvalueToString != "boolean";
                                                      if (checknonumsum) { 

                                                        maxValue = await cvalueToString.replace(/\#{active}/g, ciObject.isactive);
                                                        maxValue = await maxValue.replace(/\#{uses}/g, ciObject.uses);
                                                        maxValue = await maxValue.replace(/\#{maxuses}/g, ciObject.maxuses);                                                                                                                                                            
                                                        maxValue = await auxMeth.autoParser(maxValue, this.actor.system.attributes, ciObject.attributes, justexpr, false, ciObject.number, ciObject.uses,ciObject.maxuses);
                                                        maxValue = await game.system.api._extractAPIFunctions(maxValue,this.actor.system.attributes, ciObject.attributes, justexpr, false, ciObject.number, ciObject.uses,ciObject.maxuses); 
                                                        maxValue = await game.system.api.mathParser(maxValue);
                                                      }
                                                    }

                                                }
                                                else {
                                                  // for free tables
                                                  if(propdata.datatype === "radio"){
                                                    maxValue = propdata.automax;
                                                    cvalueToString = maxValue.toString();                                                      
                                                    checknonumsum = !Number.isNumeric(cvalueToString) && typeof cvalueToString != "boolean";
                                                    if (checknonumsum) {                                                     
                                                      maxValue = await cvalueToString.replace(/\#{active}/g, 0);
                                                      maxValue = await maxValue.replace(/\#{uses}/g, 1);
                                                      maxValue = await maxValue.replace(/\#{maxuses}/g, 1); 
                                                      maxValue = await auxMeth.autoParser(maxValue, this.actor.system.attributes, ciObject.attributes, true);
                                                      maxValue = await game.system.api._extractAPIFunctions(maxValue,this.actor.system.attributes, ciObject.attributes, true); 
                                                      maxValue = await game.system.api.mathParser(maxValue);
                                                    }
                                                  }
                                                  constantvalue = propdata.defvalue;
                                                }
                                                if (constantvalue == "") {
                                                  switch (propdata.datatype) {
                                                    case "radio":
                                                    case "badge":
                                                    case "simplenumeric":
                                                      constantvalue = '0';
                                                      break;
                                                    case "checkbox":
                                                      constantvalue = false;
                                                      break;
                                                    default:

                                                      break;
                                                  }
                        
                                                                                     
                                                }
                                            //AUTO FOR CITEMS CHANGED!!!
                                            // if (propdata.auto != "")
                                            //     constantvalue = ciObject.attributes[propKey].value;
                                            if (isconstant) {
                                                let cContent = constantvalue;
                                                //console.log(propdata);
                                                if (propdata.datatype == "label") {
                                                    if (propdata.labelformat == "D" || propdata.labelformat == "I") {
                                                        cContent = "";
                                                        //console.log("adding roll");
                                                        let dieContainer = document.createElement("DIV");
                                                        dieContainer.setAttribute("title", propdata.tag);
                                                        dieContainer.className = "";
                                                        if (propdata.labelsize == "S") {
                                                            dieContainer.className += "label-small";
                                                        }

                                                        else if (propdata.labelsize == "T") {
                                                            dieContainer.className += "label-tiny";
                                                        }

                                                        else if (propdata.labelsize == "M") {
                                                            dieContainer.className += "label-med";
                                                        }

                                                        else if (propdata.labelsize == "L") {
                                                            dieContainer.className += "label-large";
                                                        }

                                                        let dieSymbol = document.createElement('i');
                                                        if(propdata.labelformat == "D"){
                                                          dieSymbol.className = "fas fa-dice-d20";
                                                        } else {
                                                          if(propdata.icon == ""){
                                                            dieSymbol.className = "fas fa-dice-d20";
                                                          } else {
                                                            dieSymbol.className = "fas " + propdata.icon;
                                                          }
                                                        }
                                                        dieContainer.appendChild(dieSymbol);

                                                        new_cell.appendChild(dieContainer);
                                                    }
                                                    else {
                                                        cContent = propdata.tag;
                                                        new_cell.textContent = cContent;
                                                    }

                                                }

                                                else {

                                                    if (propdata.datatype === "checkbox") {
                                                        //console.log("checkbox");
                                                        let cellvalue = document.createElement("INPUT");
                                                        //cellvalue.className = "table-input centertext";


                                                        cellvalue = document.createElement("INPUT");
                                                        cellvalue.className = "input-small";
                                                        if (propdata.labelsize == "T")
                                                            cellvalue.className = "input-tiny";
                                                        cellvalue.setAttribute("type", "checkbox");
                                                        let setvalue = false;
                                                        //console.log(ciObject.attributes[propKey].value);
                                                        if (ciObject.attributes[propKey].value === true || ciObject.attributes[propKey].value === "true") {
                                                            setvalue = true;
                                                        }

                                                        if (ciObject.attributes[propKey].value === false || ciObject.attributes[propKey].value === "false") {
                                                            ciObject.attributes[propKey].value = false;
                                                        }

                                                        //console.log(setvalue);

                                                        cellvalue.checked = setvalue;
                                                        cellvalue.setAttribute("disabled", "disabled");
                                                        cellvalue.disabled=true;
                                                        //console.log("lol");
                                                        new_cell.appendChild(cellvalue);

                                                    } else if(propdata.datatype === "radio"){

                                                      let cellvalue=await this.createRadioInputsForcItem(ciObject,propObj,constantvalue,maxValue,propdata.radiotype,propdata.radiotype,true);
                                                      new_cell.appendChild(cellvalue);

                                                    }
                                                    else {
                                                        new_cell.textContent = cContent;
                                                    }



                                                }

                                                if (propdata.labelsize == "F") {
                                                    new_cell.className += " label-free";
                                                }

                                                else if (propdata.labelsize == "S") {
                                                    new_cell.className += " label-small";
                                                }

                                                else if (propdata.labelsize == "T") {
                                                    new_cell.className += " label-tiny";
                                                }

                                                else if (propdata.labelsize == "M") {
                                                    new_cell.className += " label-med";
                                                }

                                                else if (propdata.labelsize == "L") {
                                                    new_cell.className += " label-large";
                                                }

                                                if (propdata.hasroll) {
                                                    // Alondaar Drag events for macros.
                                                    if (this.actor.isOwner) {
                                                        let handler = ev => this._onDragStart(ev, groupprops[k].id, propdata.attKey, ciObject.id, ciObject.ciKey, false, isFree, tableKey, null);
                                                        new_cell.setAttribute("draggable", true);
                                                        new_cell.addEventListener("dragstart", handler, false);
                                                    }
                                                    new_cell.className += " rollable";
                                                    new_cell.addEventListener('click', this._onRollCheck.bind(this, groupprops[k].id, propdata.attKey, ciObject.id, ciObject.ciKey, false, isFree, tableKey, null), false);
                                                }
                                            }

                                            else {
                                                // -----------------------
                                                // not constant properties
                                                // ----------------------- 
                                                //console.log(propdata);
                                                let cellvalue = document.createElement("INPUT");
                                                //cellvalue.className = "table-input centertext";
                                                if (propdata.datatype === "checkbox") {

                                                    cellvalue = document.createElement("INPUT");
                                                    cellvalue.className = "input-small";
                                                    if (propdata.labelsize == "T")
                                                        cellvalue.className = "input-tiny";
                                                    cellvalue.className += " " + inputgroup;
                                                    cellvalue.setAttribute("type", "checkbox");
                                                    if(propdata.auto!='' || (!propdata.editable && !game.user.isGM) ){
                                                      // has auto expression, disable this
                                                      cellvalue.disabled=true;  
                                                    }
                                                    let setvalue = false;

                                                    if (ciObject.attributes[propKey].value === true || ciObject.attributes[propKey].value === "true") {
                                                        setvalue = true;
                                                    }

                                                } 


                                                else if (propdata.datatype === "list") {

                                                    cellvalue = document.createElement("SELECT");
                                                    cellvalue.className = "table-input";

                                                    cellvalue.className += " " + inputgroup;

                                                    if (propdata.inputsize == "F") {
                                                        cellvalue.className += "  table-free";
                                                    }

                                                    else if (propdata.inputsize == "S") {
                                                        cellvalue.className += " input-small";
                                                    }

                                                    else if (propdata.inputsize == "T") {
                                                        cellvalue.className += " input-tiny";
                                                    }

                                                    else if (propdata.inputsize == "M") {
                                                        cellvalue.className += " input-med";
                                                    }

                                                    else if (propdata.inputsize == "L") {
                                                        cellvalue.className += " input-large";
                                                    }

                                                    else {
                                                        cellvalue.className += "  table-free";
                                                    }

                                                    // add options to list
                                                    let addList='';
                                                    let rawlist = propdata.listoptions;
                                                    if(rawlist.length>0){                                                  

                                                      addList=rawlist.replaceAll(',','|');
                                                    }
                                                    // check for listauto
                                                    if(propdata.listoptionsAutoUse){
                                                      let autoList=propdata.listoptionsAuto;
                                                      autoList = await auxMeth.autoParser(autoList, this.actor.system.attributes, ciObject.attributes, false, false, ciObject.number, ciObject.uses,ciObject.maxuses);
                                                      autoList=autoList.replaceAll(',','|');
                                                      autoList = await game.system.api._extractAPIFunctions(autoList,this.actor.system.attributes, ciObject.attributes, false, false, ciObject.number, ciObject.uses,ciObject.maxuses);


                                                      if(autoList.length>0){                                                                      
                                                        if(addList.length>0){
                                                          addList +='|' + autoList; 
                                                        } else{
                                                          addList +=autoList; 
                                                        }                                                    
                                                      } 
                                                    }
                                                    // check if to use lookup
                                                    if(propdata.listoptionsLookupUse){
                                                      let lookupKey=propdata.listoptionsLookupKey;
                                                      let returnColumn=propdata.listoptionsLookupColumn;
                                                      let lookups=await lookupList(lookupKey,returnColumn,'|');
                                                      if(lookups.length>0){
                                                        if(addList.length>0){
                                                          addList +='|' + lookups; 
                                                        } else{
                                                          addList +=lookups; 
                                                        }
                                                      }                  
                                                    }
                                                    if(addList.length>0){
                                                      cellvalue=auxMeth.addOptionsToSelectFromList(cellvalue,addList,ciObject.attributes[propKey].value,'|',true)
                                                    }

                                                }

                                                else if (propdata.datatype === "simpletext" || propdata.datatype === "label") {
                                                    cellvalue = document.createElement("INPUT");
                                                    cellvalue.setAttribute("type", "text");

                                                    cellvalue.className = "table-input";
                                                    cellvalue.className += " " + inputgroup;
                                                    if (propdata.inputsize != null && (((k > 0) && !isFree) || isFree)) {
                                                        if (propdata.inputsize == "F") {
                                                            cellvalue.className += "  table-free";
                                                        }

                                                        else if (propdata.inputsize == "S") {
                                                            cellvalue.className += " input-small";
                                                        }

                                                        else if (propdata.inputsize == "T") {
                                                            cellvalue.className += " input-tiny";
                                                        }

                                                        else if (propdata.inputsize == "M") {
                                                            cellvalue.className += " input-med";
                                                        }

                                                        else if (propdata.inputsize == "L") {
                                                            cellvalue.className += " input-large";
                                                        }

                                                        else {
                                                            cellvalue.className += "  table-free";
                                                        }
                                                    }

                                                    if (propdata.datatype === "label") {
                                                        cellvalue.setAttribute("readonly", "true");
                                                    }

                                                }

                                                else if (propdata.datatype === "simplenumeric") {
                                                    cellvalue = document.createElement("INPUT");
                                                    cellvalue.setAttribute("type", "text");
                                                    cellvalue.className = "table-input centertext";
                                                    cellvalue.className += " " + propTable.system.inputgroup;
                                                    if (propdata.inputsize == "M") {
                                                        cellvalue.className += " input-med";
                                                    }
                                                    else if (propdata.inputsize == "T") {
                                                        cellvalue.className += " table-tiny";
                                                    }
                                                    else {
                                                        cellvalue.className += " table-small";
                                                    }
                                                }

                                                if(propdata.datatype === "radio"){  
                                                  let readOnly=false;
                                                  if (!propdata.editable && !game.user.isGM)
                                                    readOnly=true;
                                                  if (propdata.auto!='')
                                                    readOnly=true;
                                                  let cellvalue;
                                                  if(isFree){
                                                    cellvalue= await this.createRadioInputsForcItem(ciObject,propObj,ciObject.attributes[propKey].value,maxValue,propdata.radiotype,propdata.radiotype,readOnly,ciObject.id,tableKey,true);
                                                  } else{
                                                    cellvalue= await this.createRadioInputsForcItem(ciObject,propObj,ciObject.attributes[propKey].value,maxValue,propdata.radiotype,propdata.radiotype,readOnly);
                                                  }
                                                  new_cell.appendChild(cellvalue);                                                  
                                                } 
                                                else
                                                {
                                                  if (!propdata.editable && !game.user.isGM)
                                                      cellvalue.setAttribute("readonly", true);
                                                  if (propdata.datatype != "checkbox") {
                                                      //if (ciObject.attributes[propKey].value == "" || constantauto) {
                                                      if (constantauto) {  
                                                          ciObject.attributes[propKey].value = constantvalue;
                                                      }
                                                      if (ciObject.attributes[propKey].value == ""){
                                                        if(propdata.datatype === "radio" ||  propdata.datatype === "simplenumeric"){
                                                          ciObject.attributes[propKey].value=0;
                                                        }
                                                      }
                                                      cellvalue.value = ciObject.attributes[propKey].value;
                                                      // Set attribute value to the actual value for css selector functionality
                                                      cellvalue.setAttribute("value", cellvalue.value);
                                                      if (propdata.auto != "") {

                                                          cellvalue.setAttribute("readonly", true);
                                                      }
                                                  }
                                                  else {
                                                      let setvalue = false;
                                                      //console.log(ciObject.attributes[propKey].value);
                                                      if (ciObject.attributes[propKey].value === true || ciObject.attributes[propKey].value === "true") {
                                                          setvalue = true;
                                                      }
                                                      cellvalue.checked = setvalue;
                                                  }
                                                  cellvalue.className += " " + propdata.attKey;
      //                                            if (isfirstFree) {                                          
      //                                                 new_cell.className += " sb-table-row-first-column";
      //                                                 isfirstFree = false;
      //                                            }
                                                  if (!isFree) {
                                                      new_cell.addEventListener("change", (event) => {
                                                        event.preventDefault();
                                                        event.stopPropagation();
                                                        this.saveNewCIAtt(ciObject.id, groupprops[k].id, propdata.attKey, event.target.value)
                                                      }
                                                      );
                                                  }
                                                  else {
                                                      let ischeck = false;
                                                      if (propdata.datatype == "checkbox") {
                                                          ischeck = true;
                                                      }
                                                      new_cell.addEventListener("change", (event) => {
                                                        event.preventDefault();
                                                        event.stopPropagation();
                                                        this.saveNewFreeItem(ciObject.id, tableKey, propKey, event.target.value, ischeck, event.target.checked);})
                                                  }
                                                  cellvalue.setAttribute('data-property-key',propdata.attKey);
                                                  cellvalue.setAttribute('data-property-type',propdata.datatype);
                                                  cellvalue.setAttribute("data-property-value", cellvalue.value);
                                                  cellvalue.setAttribute('data-is-citem',true);
                                                  new_cell.appendChild(cellvalue);
                                                }
                                            }
                                        }
                                        new_row.appendChild(new_cell);
                                    }
                                }
                            }
                        }

                        //Add transfer column
                        if (propTable.system.transferrable && !propTable.system.isfreetable) {
                            let transferCell = document.createElement("TD");
                            transferCell.className = "ci-transfercell";

                            let wraptransferCell = document.createElement('i');
                            
                            let isTransferable=true;
                              if(ciObject.hasOwnProperty('addedBy')){
                                if(ciObject.addedType=='PAS' || ciObject.addedType=='ACT' || ciObject.addedType=='TEMPLATE'){
                                  isTransferable=false;
                                }
                              }
                            
                            //wraptransferCell.className += " " + inputgroup;
                            if(isTransferable){ 
                              //wraptransferCell.className = "ci-transfer";
                              wraptransferCell.className = "fas fa-sack sb-citem-removable";
                              wraptransferCell.title = "Drag item";
                              wraptransferCell.draggable = "true";
                            } else {
                              wraptransferCell.className = "fas fa-sack sb-citem-non-removable";
                              wraptransferCell.title = "This item cannot transferred";
                            }
                            transferCell.appendChild(wraptransferCell);
                            if(isTransferable){ 
                              let tokenID;
                              if (this.token != null)
                                  tokenID = this.token.id;
                              transferCell.addEventListener("dragstart", (event) => this.dragcItem(event, ciObject.id, ciObject.number, this.actor.id, tokenID));
                            }
                            new_row.appendChild(transferCell);
                        }


                        //Delete Element
                        if (propTable.system.editable || game.user.isGM) {
                            let deletecell = document.createElement("TD");
                            deletecell.className = "ci-delete";
                            //deletecell.className += " " + inputgroup;
                            let wrapdeleteCell = document.createElement('a');
                            wrapdeleteCell.className = "ci-delete";
                            //wrapdeleteCell.className += " " + inputgroup;
                            wrapdeleteCell.title = "Remove item";
                            deletecell.appendChild(wrapdeleteCell);

                            if (!isFree) {
                              let wrapdeleteBton = document.createElement('i');
                              let isDeletable=true;
                              if(ciObject.hasOwnProperty('addedBy')){
                                if(ciObject.addedType=='PAS' || ciObject.addedType=='ACT' || ciObject.addedType=='TEMPLATE'){
                                  isDeletable=false;
                                }
                              }
                              
                              
                              if(isDeletable){                                                                  
                                wrapdeleteBton.className = "fas fa-times-circle";
                                wrapdeleteBton.addEventListener('click', this.deleteCItem.bind(this, ciObject.id, false), false);                                                               
                              } else {
                                // added by item mod, nondeleteable
                                wrapdeleteBton.className = "fas fa-times-circle sb-citem-non-removable";
                                wrapdeleteCell.title = "This item can not be removed";
                                
                              }
                              wrapdeleteCell.appendChild(wrapdeleteBton); 
                            }
                            else {
                              let wrapdeleteBton = document.createElement('i');
                              wrapdeleteBton.className = "fas fa-times-circle";
                              wrapdeleteBton.addEventListener('click', this.deleteFreeItem.bind(this, ciObject.id, tableKey), false);
                              wrapdeleteCell.appendChild(wrapdeleteBton);
                            }

                            

                            new_row.appendChild(deletecell);
                        }


                    }

                }

                if (table != null && (groupcitems.length == 0 || (tableHasValidFilter!=null && filter_passed_count==0 ))) {
                    //Empty row;
                    let new_row = document.createElement("TR");
                    new_row.className = "empty-row";
                    new_row.className += " " + inputgroup;
                    // get header row
                    let headerRow = document.querySelector(`[tableKey='${propTable.system.attKey}']`);
                    let empty_cell = document.createElement("TD");
                    empty_cell.className = "empty-cell";
                    empty_cell.className += " " + inputgroup;
                    empty_cell.setAttribute('colspan',headerRow.childElementCount-1);
                    new_row.appendChild(empty_cell);                                        
                    
                    table.appendChild(new_row);                    
                }

                if (isFree && table != undefined) {
                    let new_row = document.createElement("TR");
                    new_row.className = "sb-table-plus-row transparent-row";
                    if (inputgroup)
                        new_row.className += " " + inputgroup;
                    new_row.setAttribute("id", propTable.system.attKey + "_plus");

                    let new_pluscell = document.createElement("TD");
                    new_pluscell.className = "pluscell";
                    new_pluscell.className += " sb-table-row-first-column";
                                      
                    let plusContainer = document.createElement("A");
                    plusContainer.className = "mod-button addRow";
                    //plusContainer.addEventListener('click',this.addFreeRow.bind(propTable.data.data.attKey),false);
                    plusContainer.addEventListener("click", (event) => this.addFreeRow(propTable.system.attKey));

                    let plusButton = document.createElement("I");
                    plusButton.className = "fas fa-plus-circle fa-1x";
                    plusButton.setAttribute("title", "Add new row"); 
                    plusContainer.appendChild(plusButton);
                    new_pluscell.appendChild(plusContainer);
                    
                    // get columns count of last row
                    const colcount = table.lastChild.cells.length;
                    // set colspan
                    new_pluscell.colSpan=colcount;
                    // add it
                    new_row.appendChild(new_pluscell);
                  
                    table.appendChild(new_row);
                }

                if (propTable.system.hastotals && table != null && propTable.system.tableoptions.showGroupProperties) {
                    let new_row = document.createElement("TR");
                    new_row.className = "totals-row";

                    let headercells = document.getElementsByTagName("table");
                    let counter = groupcitems.length;

                    let lastRow = table.children[table.children.length - 1];
                    let cellTotal = lastRow.children.length;
                    let cellcounter = 0;
                    let totalin = false;

                    if (propTable.system.onlynames != "ONLY_NAMES" && lastRow.children[cellcounter] != null) {

                        if ((propTable.system.onlynames != "NO_NAMES" || propTable.system.tableoptions.showicons) && !isFree) {
                            let empty_cell = document.createElement("TD");
                            empty_cell.textContent = "TOTAL";
                            empty_cell.className = lastRow.children[cellcounter].className;
                            empty_cell.className += " boldtext";
                            empty_cell.className = empty_cell.className.replace("linkable", "");
                            new_row.appendChild(empty_cell);
                            cellcounter += 1;
                            totalin = true;
                        }

                        if (propTable.system.hasactivation && !isFree) {
                            let empty_cell = document.createElement("TD");
                            empty_cell.className = lastRow.children[cellcounter] != null ? lastRow.children[cellcounter].className : "";
                            empty_cell.className += " sb-table-totals-row-hasactivation"; 
                            new_row.appendChild(empty_cell);
                            cellcounter += 1;
                            if (!totalin) {
                                empty_cell.textContent = "TOTAL";
                                empty_cell.className += " boldtext";
                                totalin = true;
                            }

                        }

                        if (propTable.system.hasunits && !isFree) {
                            let empty_cell = document.createElement("TD");
                            empty_cell.className = lastRow.children[cellcounter] != null ? lastRow.children[cellcounter].className : "";
                            empty_cell.className += " sb-table-totals-row-hasunits";
                            new_row.appendChild(empty_cell);
                            cellcounter += 1;
                            if (!totalin) {
                                empty_cell.textContent = "TOTAL";
                                empty_cell.className += " boldtext";
                                totalin = true;
                            }
                        }

                        if (propTable.system.hasuses && !isFree) {
                            let empty_cell = document.createElement("TD");
                            empty_cell.className = lastRow.children[cellcounter] != null ? lastRow.children[cellcounter].className : "";
                            empty_cell.className += " sb-table-totals-row-hasuses";
                            new_row.appendChild(empty_cell);
                            cellcounter += 1;
                            if (!totalin) {
                                empty_cell.textContent = "TOTAL";
                                empty_cell.className += " boldtext";
                                totalin = true;
                            }
                        }
                        if(propTable.system.tableoptions.showGroupProperties){
                          for (let k = 0; k < groupprops.length; k++) {
                            if (hideProperties.includes(groupprops[k].ikey)){
                              // skip this one
                              continue;
                            }
                            let propRef = groupprops[k].id;
                            //let propObj = game.items.get(groupprops[k].id);
                            let propObj = await auxMeth.getTElement(groupprops[k].id, "property", groupprops[k].ikey);
                            let propdata = propObj.system;
                            let propKey = propObj.system.attKey;

                            if (!propdata.ishidden) {
                                if (propdata.totalize) {
                                    let total_cell = document.createElement("TD");
                                    let newtotal;
                                    if (myactor.attributes[tableKey] != null) {
                                        let totalvalue = myactor.attributes[tableKey].totals[propKey];
                                        if (totalvalue)
                                            newtotal = totalvalue.total;
                                    }

                                    if (newtotal == null || isNaN(newtotal))
                                        newtotal = 0;
                                    total_cell.className = lastRow.children[cellcounter] != null ? lastRow.children[cellcounter].className : "";
                                    total_cell.className += " centertext";
                                    total_cell.className += " sb-table-totals-row-totalize" + propKey; 
                                    
                                    const numberAsString = newtotal.toString();
                                    let numberofdecimals=0;
                                    // String Contains Decimal
                                    if (numberAsString.includes('.')) {
                                      numberofdecimals= numberAsString.split('.')[1].length;                                   
                                    }
                                    
                                    if (numberofdecimals>2){
                                      //parseFloat(n.toFixed(4));
                                      newtotal=parseFloat(newtotal.toFixed(3));
                                    }
                                    
                                    
                                    total_cell.textContent = newtotal;  // output total
                                    new_row.appendChild(total_cell);
                                    cellcounter += 1;
                                }
                                else {
                                    let empty_cell = document.createElement("TD");
                                    empty_cell.className = lastRow.children[cellcounter] != null ? lastRow.children[cellcounter].className : "";
                                    empty_cell.className += " sb-table-totals-row-no-totalize-" + propKey; 
                                    new_row.appendChild(empty_cell);
                                    cellcounter += 1;
                                    if (!totalin) {
                                        empty_cell.textContent = "TOTAL";
                                        empty_cell.className += " boldtext";
                                        totalin = true;
                                    }
                                    

                                }
                            }

                          }
                        }

                        //For transfer cell
                        if (propTable.system.transferrable && !isFree) {
                            let empty_cell = document.createElement("TD");
                            empty_cell.className = lastRow.children[cellcounter] != null ? lastRow.children[cellcounter].className : "";
                            empty_cell.className += " sb-table-totals-row-transfer"; 
                            new_row.appendChild(empty_cell);
                            cellcounter += 1;
                        }

                        //Extra for deleted cell
                        if (propTable.system.editable || game.user.isGM) {
                            let empty_cell = document.createElement("TD");
                            empty_cell.className += " sb-table-totals-row-delete"; 
                            empty_cell.className += lastRow.children[cellcounter] != null ? lastRow.children[cellcounter].className : "";
                            new_row.appendChild(empty_cell);
                            cellcounter += 1;
                        }


                        if (table != null)
                            table.appendChild(new_row);
                    }


                }

            }

            //
            // replace the original table node with the "disconnected" node
            // DOM tree will be updated
            try {
              if(html[i]!=null)
                html[i].parentNode.replaceChild(table, html[i]);
            }
            catch (err){
              console.error('refreshCItems | ' + err.message );
            }
        }

        if (forceUpdate)
            await this.actor.update({ "system.citems": citems });
        //console.log("refreshcItem finished");
    }
    
    async createRadioInputsForcItem(citem,property,value,maxValue,onIcon,offIcon,readOnly,freeId=null,tableKey='',isFreeTable=false){
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
        anchor.addEventListener("click", (event) =>{
          event.preventDefault();
          event.stopPropagation();
          if(isFreeTable){
            this.saveNewFreeItem(freeId, tableKey, property.system.attKey, '0', false, null)
          } else{
            this.saveNewCIAtt(citem.id, property.id, property.system.attKey, '0')
          }
        });
        
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
          anchor.addEventListener("click", (event) =>{ 
            event.preventDefault();
            event.stopPropagation();
            if(isFreeTable){
              this.saveNewFreeItem(freeId, tableKey, property.system.attKey, i, false, null)
            } else{
              this.saveNewCIAtt(citem.id, property.id, property.system.attKey, i)
            }
          });
          radioInput.appendChild(anchor);
        } else {
          radioInput.appendChild(radio);
        }                
      }      
      return radioInput;
    }
    
    async dragcItem(ev, iD, number, originiD, tokenID = null) {
        ev.stopPropagation();

        let ciTemTemplate = game.items.get(iD);

        //let dragData = { type: ciTemTemplate, id: iD, ownerID: originiD, tokenID: tokenID };
        let dragData = { type: "Item",uuid:"Item."+iD, id: iD, ownerID: originiD, tokenID: tokenID };
        ev.dataTransfer.setData("text/plain", JSON.stringify(dragData));
        this._dragType = dragData.type;
    }
    async showTransferDialog(id, ownerID, tokenID) {
        let actorOwner;
        if (tokenID == null) {
            actorOwner = game.actors.get(ownerID);
        }
        else {
            let myToken = canvas.tokens.get(tokenID);
            actorOwner = myToken.actor;
        }
        let ownercItems = duplicate(actorOwner.system.citems);
        let cItem = ownercItems.find(y => y.id == id);
        let cItemOrig = await auxMeth.getcItem(id);

        let d = new Dialog({
            title: game.i18n.localize("SANDBOX.TransferFrom") + " " + actorOwner.name,
            content: `	<div class="transfer-itemmname">
<label class="label-citemtransfer">` + cItem.name + game.i18n.localize("Maximum") + ` : ` + cItem.number + `</label>
</div>
<div class="transfer-itemnumber">
<input class="input-transfer" type="number" id="transfer-number" value="1" max="`+cItem.number+`" min="1">
</div>
<div class="transfer-takeall">
<label class="label-transfer">` + game.i18n.localize("SANDBOX.TransferTakeAll") + `</label>
<input class="check-transfer" type="checkbox" id="transfer-all">
</div>
<div class="transfer-takeall">
<label class="label-transfer-consumed-first">` + game.i18n.localize("SANDBOX.TransferTransferConsumedFirst") + `</label>
<input class="check-transfer-consumed-first" type="checkbox" id="transfer-consumed-first" checked>
</div>`,
            buttons: {
                one: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize("Ok"),
                    callback: async (html) => {
                        let numElem = html[0].getElementsByClassName("input-transfer");
                        numElem = numElem[0].value;
                        let transferAll = html[0].getElementsByClassName("check-transfer");
                        transferAll = transferAll[0].checked;
                        
                        let transferConsumedFirst = html[0].getElementsByClassName("check-transfer-consumed-first");
                        transferConsumedFirst = transferConsumedFirst[0].checked;
                        
                        let mynum = 1;
                        let myuses=null;
                        let regE = /^\d+$/g;
                        let isnum = numElem.match(regE);
                        if (isnum)
                            mynum = parseInt(numElem);
                        // make sure that transfreed number is valid
                        if (mynum > cItem.number){
                          mynum = cItem.number;
                        }
                        // if 0 or negative just exit
                        if(mynum<=0){
                          return;
                        }

                        if (transferAll){
                            mynum = parseInt(cItem.number);
                            myuses= parseInt(cItem.uses);
                            cItem.number=0;
                            cItem.uses=0;
                        } else{
                          // calculate consumed uses
                          let consumeduses=(parseInt(cItem.number) * parseInt(cItemOrig.system.maxuses)) - cItem.uses 
                          if(transferConsumedFirst){
                            myuses=(mynum * parseInt(cItemOrig.system.maxuses))-consumeduses; 
                            cItem.uses=((parseInt(cItem.number) - mynum)*parseInt(cItemOrig.system.maxuses));
                          } else{    
                            myuses=(mynum * parseInt(cItemOrig.system.maxuses))
                            cItem.uses=((parseInt(cItem.number) - mynum)*parseInt(cItemOrig.system.maxuses))-consumeduses;
                          }
                          cItem.number -= mynum;
                          
                          
                        }
                        

                        
                        //REQUEST IF NOT GM
                        if (!game.user.isGM) {
                            await this.actor.requestTransferToGM(this.actor.id, ownerID, id, mynum,myuses);
                        }
                        else {
                            await actorOwner.update({ "system.citems": ownercItems })
                        }
                        let newcitems = duplicate(this.actor.system.citems);
                        let citemowned = newcitems.find(y => y.id == id);
                        if (!citemowned) {
                            newcitems = await this.actor.addcItem(cItemOrig, null, null, mynum,myuses);
                        }
                        else {
                            citemowned.number += mynum;
                            citemowned.uses += myuses;
                        }
                        await this.updateSubItems(false, newcitems);
                    }
                },
                two: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize("Cancel"),
                    callback: () => { console.log("Sandbox | showTransferDialog | Player canceled transfer dialog"); }
                }
            },
            default: "one",
            close: () => {
                console.log("Sandbox | showTransferDialog | Transfer dialog was shown to player.");
            }
        });

        d.render(true);
    }
    showTextAreaDialog(citemID, citemAttribute, disabled) {
        let citem = this.actor.system.citems.find(y => y.id == citemID);
        let ciProp = game.items.find(y => y.system.attKey == citemAttribute);
        if (ciProp == null)
            return;
        let isdisabled = ""
        if (disabled)
            isdisabled = "disabled";


        let content = `
            <textarea id="dialog-textarea-${citemID}-${citemAttribute}" class="textdialog texteditor-large ${ciProp.system.inputgroup}" ${isdisabled}>${citem.attributes[citemAttribute].value}</textarea>
            `;
        content += `
            <div class="new-row">
                <div class="lockcontent">
                    <a class="dialoglock-${citemID}-${citemAttribute} lock centertext" title="Edit"><i class="fas fa-lock fa-2x"></i></a>
                    <a class="dialoglock-${citemID}-${citemAttribute} lockopen centertext" title="Edit"><i class="fas fa-lock-open fa-2x"></i></a>
                </div>
            </div>
            `;
        let d = new Dialog({
            title: citem.name + "-" + citemAttribute,
            content: content,
            buttons: {
                one: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Save",
                    callback: async (html) => {
                        if (!disabled) {
                            citem.attributes[citemAttribute].value = d.data.dialogValue;
                            await this.actor.update({ "system.citems": this.actor.system.citems }, { diff: false });
                        }

                    }
                },
                two: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel",
                    callback: () => { console.log("canceling text edition"); }
                }
            },
            default: "one",
            close: () => {
                console.log("Text edition dialog was shown to player.");
            },
            citemText: true,
            dialogValue: citem.attributes[citemAttribute].value
        });

        d.render(true);
    }
    showFreeTextAreaDialog(freeId, freeTableKey, freePropKey, disabled) {

        let freeitem = this.actor.system.attributes[freeTableKey].tableitems.find(y => y.id == freeId);
        let ciProp = game.items.find(y => y.system.attKey == freePropKey);
        if (ciProp == null)
            return;
        let isdisabled = ""
        if (disabled)
            isdisabled = "disabled";


        let content = `
            <textarea id="dialog-textarea-${freeId}-${freePropKey}" class="textdialog texteditor-large" ${isdisabled}>${freeitem.attributes[freePropKey].value}</textarea>
            `
        if (game.user.isGM || ciProp.system.editable)
            content += `
            <div class="new-row">
                <div class="lockcontent">
                    <a class="dialoglock-${freeId}-${freePropKey} lock centertext" title="Edit"><i class="fas fa-lock fa-2x"></i></a>
                    <a class="dialoglock-${freeId}-${freePropKey} lockopen centertext" title="Edit"><i class="fas fa-lock-open fa-2x"></i></a>
                </div>
            </div>
            `

        //'<textarea id="dialog-textarea-' + freeId + "-" + freePropKey + '" class="texteditor-large ' + ciProp.data.data.inputgroup + '"' + isdisabled + '>' + freeitem.attributes[freePropKey].value + '</textarea>'

        let d = new Dialog({
            title: "Item Num " + freeId,
            content: content,
            buttons: {
                one: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Save",
                    callback: async (html) => {
                        if (!disabled) {
                            let key = "system.attributes." + freeTableKey + ".tableitems[" + freeId + "].attributes." + freePropKey + ".value";
                            let freeattributes = duplicate(this.actor.system.attributes[freeTableKey].tableitems);
                            let freeTarget = freeattributes.find(y => y.id == freeId)
                            freeTarget.attributes[freePropKey].value = d.data.dialogValue;
                            await this.actor.update({ [`system.attributes.${freeTableKey}.tableitems`]: freeattributes });
                        }

                    }
                },
                two: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel",
                    callback: () => { console.log("canceling text edition"); }
                }
            },
            default: "one",
            close: () => {
                console.log("Text edition dialog was shown to player.");
            },
            citemText: true,
            dialogValue: freeitem.attributes[freePropKey].value
        });

        d.render(true);
    }
    async saveNewCIAtt(ciId, propId, propKey, value) {
        //console.log("changing citem");
        let cItemsID = duplicate(this.actor.system.citems);
        let citem = cItemsID.find(y => y.id == ciId);
        let propObj = await auxMeth.getTElement(propId, "property", propKey);
        //console.log(value);

        if (propObj.system.datatype != "checkbox") {
            if (propObj.system.automax != "") {
                let ciMax = await auxMeth.autoParser(propObj.system.automax, this.actor.system.attributes, citem.attributes, false);
                if (value > ciMax) {
                    value = ciMax;
                }
            }
            citem.attributes[propKey].value = value;
        }

        else {

            let setvalue = true;
            if (citem.attributes[propObj.system.attKey].value) {
                setvalue = false;
            }
            citem.attributes[propObj.system.attKey].value = setvalue;

            if (propObj.system.checkgroup != null)
                if (propObj.system.checkgroup != "") {
                    let checkgroup = propObj.system.checkgroup;
                    let unparsedchkgroupArray = checkgroup.split(";");
                    let chkgroupArray = [];
                    for (let j = 0; j < unparsedchkgroupArray.length; j++) {
                        let parsedgrpCheck = await auxMeth.autoParser(unparsedchkgroupArray[j], this.actor.system.attributes, citem.attributes, true);
                        if (parsedgrpCheck == " ")
                            parsedgrpCheck = "";
                        chkgroupArray.push(parsedgrpCheck);
                    }

                    if (setvalue) {
                        for (let x = 0; x < cItemsID.length; x++) {
                            let anycitem = cItemsID[x];
                            for (const [propKey, propValues] of Object.entries(anycitem.attributes)) {

                                if (anycitem.id != ciId) {
                                    let propKeyObj = game.items.find(y => y.system.attKey == propKey);
                                    if (propKeyObj != null && propKey != "name") {

                                        if (propKeyObj.system.datatype == "checkbox" && propKeyObj.system.checkgroup != "") {
                                            let pointerchkgroupArray = propKeyObj.system.checkgroup.split(";");
                                            for (let z = 0; z < pointerchkgroupArray.length; z++) {
                                                let checkKey = pointerchkgroupArray[z];
                                                let parsedKey = await auxMeth.autoParser(checkKey, this.actor.system.attributes, anycitem.attributes, true);
                                                if (chkgroupArray.includes(parsedKey))
                                                    propValues.value = false;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
        }


        
        if (!this.actor.isToken) {
            await this.actor.update({ "system.citems": cItemsID });
        }
        else {                        
            await this.actor.token.actor.update({ "system.citems": cItemsID });
        }


    }
    async saveNewFreeItem(id, tableKey, fpropKey, value, ischeck = false, checked = null) {
        let myfreeItems = await duplicate(this.actor.system.attributes[tableKey].tableitems);
        let myItem = myfreeItems.find(y => y.id == id);

        if (ischeck) {
            value = checked;
            let propObj = game.items.find(y => y.system.attKey == fpropKey);
            if (propObj.system.checkgroup != null)
                if (propObj.system.checkgroup != "") {
                    let checkgroup = propObj.system.checkgroup;
                    let chkgroupArray = checkgroup.split(";");
                    if (value) {
                        for (const [propKey, propValues] of Object.entries(myItem.attributes)) {

                            if (propKey != propObj.system.attKey) {
                                let propKeyObj = game.items.find(y => y.system.attKey == propKey);
                                if (propKeyObj != null) {
                                    if (propKeyObj != "" && propKeyObj.system.datatype == "checkbox") {
                                        let pointerchkgroupArray = propKeyObj.system.checkgroup.split(";");
                                        for (let z = 0; z < chkgroupArray.length; z++) {
                                            let checkKey = chkgroupArray[z];
                                            let parsedKey = await auxMeth.autoParser(checkKey, this.actor.system.attributes, myItem.attributes, true);
                                            if (pointerchkgroupArray.includes(parsedKey))
                                                propValues.value = false;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
        }
        myItem.attributes[fpropKey].value = value;
        await this.actor.update({ [`system.attributes.${tableKey}.tableitems`]: myfreeItems });
    }
    
    async linkCItem(evt,showinfoonly=false) {
        //console.log();
        let item = await auxMeth.getcItem(evt.currentTarget.getAttribute("item_id"), evt.currentTarget.getAttribute("item_ciKey"));
        if(showinfoonly){
          auxMeth.showCIitemInfo(item);
        } else {
          item.sheet.render(true);
        }
    };
    
   
  
    
    
    
    
    async useCIIcon(itemId, ciKey, value, iscon = false, isactivation = false) {
      
        //const citemObj = game.items.get(itemId).data.data;
        let citemObjfinder = await auxMeth.getcItem(itemId, ciKey);
        const citemObj = citemObjfinder.system;


        if (citemObj.roll != "" && (!isactivation || (isactivation && value))) {
            let cItemData = {};
            cItemData.id = itemId;
            cItemData.value = value;
            cItemData.iscon = iscon;
            this._onRollCheck(null, null, itemId, ciKey, true, null, null, cItemData);
        }

        else {
            this.activateCI(itemId, value, iscon, null, isactivation);
        }
    }
    async activateCI(itemId, value, iscon = false, roll = null, isactivation = false) {
        const actorData = duplicate(this.actor.system);
        const citems = actorData.citems;
        const citem = citems.find(y => y.id == itemId);
        const attributes = this.actor.system.attributes;

        let citemObjfinder = await auxMeth.getcItem(itemId, citem.ciKey);
        const citemObj = citemObjfinder.system;
        let objectUses = duplicate(citem.uses);

        if (isactivation) {
            citem.isactive = value;
        }

        else {
            citem.isactive = true;
        }


        if (citem.isactive)
            citem.isreset = false;

        //console.log(citem.maxuses);
        if (iscon && citem.maxuses > 0) {
            objectUses -= 1;
            let thismaxuses = parseInt(citem.maxuses);
            if (citem.uses > 0 && citemObj.usetype == "CON") {
                let actualItems = Math.ceil(parseInt(objectUses) / (thismaxuses / citem.number));

                if (!citemObj.rechargable && citemObj.removeAfterLastUse) {
                    citem.number = actualItems;
                    if (objectUses == 0)
                        citem.number = 0;
                }


            }

            citem.uses -= 1;

            if (!citemObj.rechargable)
                citem.maxuses = parseInt(citemObj.maxuses) * parseInt(citem.number);

        }

        this.actor.flags.haschanged = true;

        if (roll != null) {
            citem.attributes._lastroll = roll;
        }

        await this.actor.update({ "system.citems": citems });
    }
    async rechargeCI(itemId, ciKey) {
        const citems = duplicate(this.actor.system.citems);
        const citem = citems.find(y => y.id == itemId);
        //const citemObj = game.items.get(itemId).data.data;
        let citemObjfinder = await auxMeth.getcItem(itemId, ciKey);
        const citemObj = citemObjfinder.system;

        let totalnumber = citem.number;
        if (totalnumber == 0)
            totalnumber = 1;

        citem.uses = citem.maxuses;
        await this.actor.update({ "system.citems": citems });
    }
    async deleteCItem(itemID, cascading = false,askforconfirmation=false) {
      let bOkToProceed=true;
      if(askforconfirmation){
        const item=game.items.get(itemID);
        if(item!=null){
          // ask user for confirmation          
          bOkToProceed=await confirmRemoveSubItem(this.actor.name,game.i18n.localize("DOCUMENT.Actor").toLowerCase(),item.name,'');
        } else {
          ui.notifications.warn('Sandbox | Unable to find item '+itemID);
        }
      } 
      if(bOkToProceed){ 
        let subitems = await this.actor.deletecItem(itemID, cascading);         
        if (this.actor.isToken) {
            let myToken = canvas.tokens.get(this.actor.token.id);

            await myToken.actor.update({ "system": subitems.system });              
        }
        else {
            await this.actor.update({ "system": subitems.system });              
        }
       }        
    }
    async addFreeRow(tableKey) {

        let myfreeItems = await duplicate(this.actor.system.attributes[tableKey].tableitems);
        let lastIndex = -1;
        if (myfreeItems.length)
            lastIndex = myfreeItems[myfreeItems.length - 1].id;

        let newItem = {};
        newItem.attributes = {};
        newItem.icon = "star";
        newItem.id = lastIndex + 1;

        //Get element values
        //let tableTemplate = game.items.find(y => y.data.type == "property" && y.data.data.datatype == "table" && y.data.data.attKey == tableKey);
        let tableTemplate = await auxMeth.getTElement(null, "property", tableKey);

        if (tableTemplate != null) {
            let tableGroup = tableTemplate.system.group.id;
            if (tableGroup != null) {
                let groupTemplate = await auxMeth.getTElement(tableTemplate.system.group.id, "group", tableTemplate.system.group.ikey);
                let groupProps = groupTemplate.system.properties;
                if (groupProps.length > 0) {
                    for (let i = 0; i < groupProps.length; i++) {
                        //let propTemplate = game.items.get(groupProps[i].id);
                        let propTemplate = await auxMeth.getTElement(groupProps[i].id, "property", groupProps[i].ikey);
                        newItem.attributes[propTemplate.system.attKey] = {};
                        let defaultValue='';
                        defaultValue = propTemplate.system.defvalue;
                        
                        if (propTemplate.system.datatype === "simplenumeric") {
                          defaultValue = await auxMeth.autoParser(defaultValue, this.actor.attributes, null, false);
                          defaultValue = await game.system.api._extractAPIFunctions(defaultValue,this.actor.attributes, null, false); 
                        } 
                        else if (propTemplate.system.datatype === "list") {
                          if(propTemplate.system.defvalue!=''){
                            defaultValue = await auxMeth.autoParser(defaultValue, this.actor.attributes, null, true);
                            defaultValue = await game.system.api._extractAPIFunctions(defaultValue,this.actor.attributes, null, true); 
                          } else{
                            // use the first entry of the list as value
                            defaultValue = await auxMeth.getListPropertyFirstOption(propTemplate,this.actor.attributes, null);
                          }
                        }
                        else {
                          defaultValue = await auxMeth.autoParser(defaultValue, this.actor.attributes, null, true);
                          defaultValue = await game.system.api._extractAPIFunctions(defaultValue,this.actor.attributes, null, true); 
                        }
                        
                        
                        if (defaultValue == null) {
                          defaultValue = "";
                        }
                        if (defaultValue == "") {
                          if (propTemplate.system.datatype === "simplenumeric" || propTemplate.system.datatype === "radio") {                                        
                            defaultValue = '0';
                          }                                    
                        }
                        newItem.attributes[propTemplate.system.attKey].value = defaultValue;
                    }
                }
            }

        }

        myfreeItems.push(newItem);
        await this.actor.update({ [`system.attributes.${tableKey}.tableitems`]: myfreeItems });


    }
    async deleteFreeItem(id, tableKey) {
      let itemtype='Table row nunber';
      let tablename='';
      // ask user for confirmation
      const tableproperty= game.system.customitemmaps.properties.get(tableKey);
      if(tableproperty!=null){
          
        tablename=tableproperty.name; // use table�s group name    
      }
      const rownr=id;
      let itemname=rownr;
      
      let parentname= this.actor.name;
      let parenttype='free table <strong>'+ tablename +'</strong> on ' +game.i18n.localize("DOCUMENT.Actor").toLowerCase();
      const bOkToProceed=await confirmRemoveSubItem(parentname,parenttype,itemname,itemtype);
      if(bOkToProceed){ 
        let myfreeItems = await duplicate(this.actor.system.attributes[tableKey].tableitems);
        myfreeItems.splice(myfreeItems.indexOf(myfreeItems.find(y => y.id == id)), 1);
        await this.actor.update({ [`system.attributes.${tableKey}.tableitems`]: myfreeItems });
      }
    }
    handleGMinputs(basehtml) {
        //SET TABLES INFO
        const gminputs = basehtml.find(".inputGM");
        for (let i = 0; i < gminputs.length; i++) {
            let input = gminputs[i];

            if (!game.user.isGM) {
                if(input.type=='checkbox'){
                  input.disabled=true;
                } else{
                  input.setAttribute("readonly", true);
                }

                if (input.type == "select-one")
                    input.className += " list-noneditable";
            }
        }
    }
    async changeCINum(itemID, ciKey, value) {

        let citemIDs = duplicate(this.actor.system.citems);
        let citem = this.actor.system.citems.find(y => y.id == itemID);
        let citemNew = citemIDs.find(y => y.id == itemID);

        if (value == 0) {
            value = 1;
        }

        if (value < 0 || isNaN(value)) {
            value = citem.number;
        }



        citemNew.number = value;

        //let cItemTemp = game.items.get(itemID);
        // let cItemTemp = await auxMeth.getcItem(itemID, ciKey);
        // let tempmaxuses = await auxMeth.autoParser(cItemTemp.data.data.maxuses, this.actor.data.data.attributes, cItemTemp.data.data.attributes, false);

        // citemNew.maxuses = parseInt(value * tempmaxuses);
        //citemNew.uses = citemNew.maxuses;

        //await this.scrollbarSet(false);
        //this.actor.update(this.actor.data);

        await this.actor.update({ "system.citems": citemIDs });

    }
    async changeCIUses(itemID, value) {
        let citemIDs = duplicate(this.actor.system.citems);
        let citem = citemIDs.find(y => y.id == itemID);
        let myindex = citemIDs.indexOf(citem);

        citem.uses = value;
        // console.log("changing");
        // if (parseInt(citem.uses) >= parseInt(citem.maxuses)) {
        //     citem.maxuses = parseInt(citem.uses);
        // }

        //await this.scrollbarSet(false);
        //await this.actor.update(this.actor.data);
        await this.actor.update({ "system.citems": citemIDs });

    }
    async refreshBadge(basehtml) {
        const html = await basehtml.find(".badge-click");
        for (let i = 0; i < html.length; i++) {
            let badgeNode = html[i];
            let propKey = badgeNode.getAttribute("attKey");
            const att = this.actor.system.attributes[propKey];
            if (att != null)
                badgeNode.textContent = att.value;
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

        //await new Promise(async ()=>{ await this._setScrollStates() },0);


        // await this._setScrollStates();
    }
    
    // modify non-citem list
    async modifyLists(basehtml) {
        const attKeys = Object.keys(this.actor.system.attributes);
        // check for lookups
        // get all lists elements
        let listElements=basehtml.find("[data-property-type='list']");
        let propertyKey;
        let property;
        for (let i = 0; i < listElements.length; i++) {
          propertyKey = listElements[i].getAttribute("data-property-key");
          let listValue=listElements[i].value;
          let isCitem=listElements[i].getAttribute("data-is-citem");
          if(!isCitem){  
            if(propertyKey!=''){              
              let property=await auxMeth.getTElement(null, "property", propertyKey);
              if (property!=null){ 
                let addList='';
                // check for listauto
                if(property.system.listoptionsAutoUse){
                  let autoList=property.system.listoptionsAuto;
                  autoList = await auxMeth.autoParser(autoList, this.actor.system.attributes, null, false);
                  autoList=autoList.replaceAll(',','|');
                  autoList = await game.system.api._extractAPIFunctions(autoList,this.actor.system.attributes, null, false); 
                  
                  
                  if(autoList.length>0){                  
                    addList +=autoList;
                  } 
                }
                // check for list lookup
                if(property.system.listoptionsLookupUse){
                  let lookupKey=property.system.listoptionsLookupKey;
                  let returnColumn=property.system.listoptionsLookupColumn;
                  let lookups=await lookupList(lookupKey,returnColumn,'|');
                  if(lookups.length>0){
                    if(addList.length>0){
                      addList +='|' + lookups; 
                    } else{
                      addList +=lookups; 
                    }
                  }                  
                }
                if(addList.length>0){
                  let value=this.actor.system.attributes[propertyKey].value;
                  
                  listElements[i]=auxMeth.addOptionsToSelectFromList(listElements[i],addList,value,'|',true);
                }
                
              }
            }
          }
        }
        // look for any mod that changes list
        attKeys.forEach((key, index) => {
            let aProp = this.actor.system.attributes[key];
            if (aProp.listedit != null) {
                let mytag = "." + key;
                let myhtmllist = basehtml.find(mytag);
                if (aProp.listedit.add != null)
                    for (let i = 0; i < aProp.listedit.add.length; i++) {
                        let addoption = aProp.listedit.add[i];
                        var option = document.createElement("option");
                        option.value = option.text = addoption;
                        if ($(myhtmllist[0]).has('option[value="' & addoption & '"]'))
                          try {
                            myhtmllist[0].add(option);
                          }
                          catch(err) {
                            console.log('modifyLists',err.message);
                          }
                    }
                if (aProp.listedit.remove != null)
                    for (let j = 0; j < aProp.listedit.remove.length; j++) {
                        let removeoption = aProp.listedit.remove[j];
                        for (var n = 0; n < myhtmllist[0].options.length; n++) {
                            if (myhtmllist[0].options[n].value === removeoption) {
                                myhtmllist[0].remove(n);
                                break;
                            }
                        }
                    }
                myhtmllist[0].value = aProp.value;
            }
        });

    }
    async populateRadioInputs(basehtml) {
        //console.log("reinput");
        const html = await basehtml.find(".radio-input");
        for (let i = 0; i < html.length; i++) {

            let radioNode = html[i];

            const attributes = this.actor.system.attributes;
            let value = 0;
            let propId = radioNode.getAttribute("attId");
            let propRawName = radioNode.getAttribute("name");
            propRawName = propRawName.replace("system.attributes.", '');
            propRawName = propRawName.replace(".value", '');
            //let property = game.items.get(propId);
            let property = await auxMeth.getTElement(propId, "property", propRawName);

            if (property != null) {

                let attKey = property.system.attKey;
                let radiotype = property.system.radiotype;

                if (attributes[attKey] != null) {
                    let maxRadios = attributes[attKey].max;
                    value = attributes[attKey].value;

                    radioNode.innerHTML = '';
                    //console.log(value);
                    let centeringTable=document.createElement('TABLE');
                    centeringTable.setAttribute('class','sb-centering-table')
                    let centeringRow=document.createElement('TR');
                    centeringRow.setAttribute('class','sb-centering-table')
                    let centeringCell=document.createElement('TD');
                    centeringCell.setAttribute('class','sb-centering-table')
                    if (maxRadios > 0) {
                        
                        for (let j = 0; j <= parseInt(maxRadios); j++) {
                            let radiocontainer = document.createElement('a');
                            let clickValue = j;
                            radiocontainer.setAttribute("clickValue", clickValue);
                            radiocontainer.className = "radio-element";
                            radiocontainer.setAttribute('data-property-key',property.system.attKey);
                            radiocontainer.setAttribute('data-radio-element-value',clickValue);
                            
                             
                            //radiocontainer.style = "font-size:14px;";
                            //if (radiotype == "S")
                            //radiocontainer.style = "font-size:16px;";


                            let radiobutton = document.createElement('i');

                            if (j == 0) {
                                radiobutton.className = "far " + property.system.radioResetIcon;
                                radiobutton.setAttribute( "title", "Reset" );
                                // if this is an auto calculated radio, or (non-editable and not gm) hide the reset icon
                                if(!property.system.auto=='' || (!property.system.editable && !game.user.isGM) ){
                                  radiocontainer.style.display = "none";; 
                                }
                            }

                            else if (value >= clickValue) {
                              radiobutton.setAttribute( "title", property.system.tooltip );
                                radiobutton.className = "fas " + radiotype;                                
                            }
                            else {
                              radiobutton.setAttribute( "title", property.system.tooltip );
                                radiobutton.className = "far " + radiotype;
                            }
                            

                            radiocontainer.appendChild(radiobutton);
                            if ((property.system.editable || game.user.isGM) && property.system.auto==''){
                                radiobutton.addEventListener("click", (event) => this.clickRadioInput(clickValue, propId, event.target));
                            } else {
                              // add class to indicated non-clickable
                              radiocontainer.className +=" sb-radio-element-non-clickable";
                            }
                            //await radioNode.appendChild(radiocontainer);
                            await centeringCell.appendChild(radiocontainer);
                        }

                    } else{
                      centeringCell.innerText='No MAX defined';
                    }
                    await centeringRow.appendChild(centeringCell);
                    await centeringTable.appendChild(centeringRow);
                    await radioNode.appendChild(centeringTable);
                }

            }

        }
    }
    //Set external images
    async setImages(basehtml) {
        const html = await basehtml.find(".isimg");
        for (let i = 0; i < html.length; i++) {
            let imgNode = html[i];
            let imgPath = imgNode.getAttribute("img");

            let imgEl = document.createElement('img');
            imgEl.className = "isimg";
            imgEl.src = imgPath;

            imgNode.appendChild(imgEl);
        }
    }
    async addHeaderButtons(basehtml) {

    }
    async customCallOverride(basehtml) {

    }
    //Set external images
    async setCheckboxImages(basehtml) {
        const html = await basehtml.find(".customcheck");
        for (let i = 0; i < html.length; i++) {
            let checkNode = html[i];
            let onPath = checkNode.getAttribute("onPath");
            let offPath = checkNode.getAttribute("offPath");
            let propKey = checkNode.getAttribute("attKey");

            if (this.actor.system.attributes[propKey] != null) {
                let myvalue = this.actor.system.attributes[propKey].value;

                let selected = offPath;
                if (myvalue)
                    selected = onPath;
                checkNode.style.backgroundImage = "url('" + selected + "')";
            }

        }
    }
    async clickRadioInput(clickValue, propId, target) {
        //let property = game.items.get(propId);
        let property = await auxMeth.getTElement(propId);
        let radiotype = property.system.radiotype;
        let attKey = property.system.attKey;
        const attributes = this.actor.system.attributes;
        
        await this.actor.update({ [`system.attributes.${attKey}.value`]: clickValue });
        
        if (clickValue > 0) {
           target.className = "fas " + radiotype;
        } 
          

       

    }
    async displaceTabs2(next = null, newhtml) {
        //console.log("displacing");
        let tabs;
        let nonbio = false;
        let actorsheet = this;

        //console.log(newhtml);

        let fakelastTab = $(newhtml).find('#tab-last');
        fakelastTab.remove();

        let biotab = $(newhtml).find('#tab-0');
        if (!this.actor.system.biovisible) {
            nonbio = true;

            if (biotab.length > 0)
                if (biotab[0].classList.contains("active"))
                    biotab[0].nextElementSibling.click();
            biotab.remove();
        }

        else {
            biotab[0].classList.add("player-tab");
        }

        if (game.user.isGM) {
            tabs = $(newhtml).find(".tab-button");
        }
        else {
            tabs = $(newhtml).find(".player-tab");
        }

        let activetab = $(newhtml).find(".tab-button.active");

        let foundfirst = false;
        let passedfirst = false;
        let maxtabs = this.actor.system.visitabs - 1;
        let totaltabs = tabs.length;
        //console.log(tabs);

        let minTab = totaltabs - (maxtabs + 1);
        if (minTab < 0)
            minTab = 0;
        if (activetab.index() > minTab) {
            tabs[minTab].classList.add("visible-tab");
        }


        let tabcounter = 0;
        let firsthidden = false;
        let firstpassed = false;
        let displaying = false;
        let displaycounter = 0;
        let fvble = actorsheet._tabs[0].active;
        if (actorsheet._tabs[0].firstvisible != null) {
            let currentOn;
            currentOn = tabs.find(y => y.dataset?.tab == actorsheet._tabs[0].firstvisible);
            tabs.each(async function (i, tab) {
                if (tab.dataset.tab == actorsheet._tabs[0].firstvisible) {
                    currentOn = tab;
                }
            })

            if (currentOn != null)
                fvble = actorsheet._tabs[0].firstvisible;

            if (nonbio && actorsheet._tabs[0].firstvisible == "description")
                fvble = actorsheet._tabs[0].active;
        }


        tabs.each(async function (i, tab) {

            if (tab.dataset.tab == fvble && !foundfirst) {
                let nexttab = tabs[i + 1];
                let prevtab = tabs[i - 1];
                let lasttab = tabs[i + maxtabs + 1];
                if (next == "prev") {
                    if (prevtab != null)
                        fvble = prevtab.dataset.tab;
                }
                else if (next == "next") {
                    if (nexttab != null && lasttab != null)
                        fvble = nexttab.dataset.tab;
                }
                actorsheet._tabs[0].firstvisible = fvble;
                foundfirst = true;
            }
        })

        tabs.each(async function (i, tab) {

            if (displaying) {
                if (displaycounter <= maxtabs) {
                    if (!tab.classList.contains("visible-tab"))
                        tab.classList.add("visible-tab");
                    tab.classList.remove("hidden-tab");
                    displaycounter += 1;
                }
                else {
                    displaying = false;
                    if (!tab.classList.contains("hidden-tab"))
                        tab.classList.add("hidden-tab");
                    tab.classList.remove("visible-tab");
                }

            }
            else {
                if (tab.dataset.tab == fvble) {
                    if (!tab.classList.contains("visible-tab"))
                        tab.classList.add("visible-tab");
                    tab.classList.remove("hidden-tab");
                    displaying = true;
                    displaycounter += 1;
                }
                else {
                    if (!tab.classList.contains("hidden-tab"))
                        tab.classList.add("hidden-tab");
                    tab.classList.remove("visible-tab");
                }

            }


        })

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
    
    async setSheetStyle(actor=null,callerFnName='') {
        
        //console.log(this.actor.data.data.gtemplate);

        //let _mytemplate = await game.actors.find(y => y.system.istemplate && y.system.gtemplate == this.actor.system.gtemplate);
        let _mytemplate = await auxMeth.getActorTemplate(this.actor.system.gtemplate);
        
        if (_mytemplate == null)
            return;
        let basehtml = this.element;
        if(!basehtml.hasOwnProperty('length')) 
          return
        
        if (this.actor.system.gtemplate == "Default")
            return;

        //console.log('Sandbox | setSheetStyle by ' + callerFnName);

        let bground = await basehtml.find(".window-content");
        let sheader = await basehtml.find(".sheet-header");
        let wheader = await basehtml.find(".window-header");
        let stabs = await basehtml.find(".atabs");

        //Set Height
        //if (_mytemplate.system.setheight != "" && !_mytemplate.system.resizable) {
        if (_mytemplate.system.setheight != "" && !this.hasOwnProperty('sheetHasBeenResized')) {
            basehtml[0].style.height = _mytemplate.system.setheight + "px";
            let tabhandler = await basehtml.find(".tab");
            for (let j = 0; j < tabhandler.length; j++) {
                let mytab = tabhandler[j];

                let totalheight = parseInt(_mytemplate.system.setheight) - parseInt(wheader[0].clientHeight) - parseInt(sheader[0].clientHeight) - parseInt(stabs[0].clientHeight) - 15;
                mytab.style.height = totalheight + "px";
            }
        }
        // set width
        if (_mytemplate.system.setwidth != "" && !_mytemplate.system.resizable) {
            basehtml[0].style.width = _mytemplate.system.setwidth + "px";
          }
        

        //Set Background
        if (_mytemplate.system.backg != "") {
            bground[0].style.background = "url(" + _mytemplate.system.backg + ") repeat";
        }


        if (!_mytemplate.system.resizable) {
            let sizehandler = await basehtml.find(".window-resizable-handle");
            sizehandler[0].style.visibility = "hidden";
        }

        else {
            let tabhandler = await basehtml.find(".tab");
            for (let j = 0; j < tabhandler.length; j++) {
                let mytab = tabhandler[j];

                let totalheight = parseInt(basehtml[0].style.height) - parseInt(wheader[0].clientHeight) - parseInt(sheader[0].clientHeight) - parseInt(stabs[0].clientHeight) - 15;
                mytab.style.height = totalheight + "px";
            }
        }
    }
    async checkAttributes(formData) {
        for (let att in formData) {
            if (att.includes("system.attributes.")) {
                let thisatt = formData[att];
                if (Array.isArray(formData[att]))
                    formData[att] = thisatt[0];

            }
        }
        //console.log(formData);

        return formData
    }
    //**override
    _onEditImage(event) {
        const attr = event.currentTarget.dataset.edit;
        const current = getProperty(this.actor, attr);
        const myactor = this.actor;
        new FilePicker({
            type: "image",
            current: current,
            callback: async (path) => {
                event.currentTarget.src = path;
                //manual overwrite of src
                let imageform = this.form.getElementsByClassName("profile-img");
                imageform[0].setAttribute("src", path);
                //myactor.data.img = path;

                //myactor.update(myactor.data);

                let mytoken = await this.setTokenOptions(myactor, path);

                if (mytoken)
                    await myactor.update({ "prototypeToken": mytoken, "img": path });

                this._onSubmit(event);
            },
            top: this.position.top + 40,
            left: this.position.left + 10
        }).browse(current);

    }
    async setTokenOptions(myactorData, path = null) {
        if (path == null)
            path = this.actor.img;
        let mytoken = await duplicate(this.actor.prototypeToken);
        if (!myactorData.istemplate) {
//            if (mytoken.light.dim == null)
//                mytoken.light.dim = 0;
//
//            if (mytoken.dimSight == null)
//                mytoken.dimSight = 0;
//
//            if (mytoken.brightLight == null)
//                mytoken.brightLight = 0;
            mytoken.texture.src = path;
            //mytoken.name = myactorData.name;
            if (game.settings.get("sandbox", "tokenOptions")) {
                let displayName = myactorData.displayName;
                if (myactorData.token) {
                    mytoken.displayName = displayName;
                    mytoken.displayBars = displayName;
                    if (myactorData.data.tokenbar1 != null)
                        mytoken.bar1.attribute = myactorData.tokenbar1;
                }
            }
        }
        return mytoken;
    }

    
    async _updateObject(event, formData) {
        //console.log(this)
        event.preventDefault();
        const expandedData = foundry.utils.expandObject(formData);
        // data correction for dynamic LIST element, sometimes(chrome/foundry bug?) the dynamically created options(from MODs/lookup) fall of the DOM before the _updateObject
        // check if any submitted attributes are LIST properties
        for (const actorProperty in expandedData.system.attributes) {          
          let property=game.items.find(y=>y.type=="property" && y.system.attKey==actorProperty && y.system.datatype=='list');
          if (property!=null){ 
            //console.log(this);
            // get this form doc
            let listElement=this.form.querySelector(`[data-property-type="list"][data-property-key="${actorProperty}"]`);
            if(listElement!=null){
              let isCitem=listElement.getAttribute("data-is-citem");
              // check the actual value
              if(listElement.value!=expandedData.system.attributes[actorProperty].value){
                //console.log("Not correct value",listElement);
                let correctedData=await listElement.value;
                if(correctedData!=null)
                formData[`system.attributes.${actorProperty}.value`]=correctedData;
              }
            }
          }          
        }
        
        
        //console.log("updateObject");
        //console.log(event);
        //console.log(event.target.name);
        //console.log(formData);
        //console.log(formData["data.biography"]);

        //await this.scrollbarSet();

        if (event.target == null && !game.user.isGM && !formData["system.biography"])
            return;

        if (event.target)
            if (event.target.name == "")
                return;


        //console.log(event);

        if (formData["system.gtemplate"] == "")
            formData["system.gtemplate"] = this.actor.system.gtemplate;


        formData = await this.checkAttributes(formData);


        //console.log("User: " + game.user.id + " is updating actor: " + this.actor.name + " target: " + event.target.name);

        if (event.target != null) {
            let target = event.target.name;
            let escapeForm = false;
            //console.log(target);

            if (target == "system.gtemplate")
                return;

            //if(!escapeForm){
            //console.log("form changed");
            //console.log(event.target.name);
            let property;
            let modmax = false;
            if (target.includes(".max")) {
                modmax = true;
            }
            if (target != null && target!='name') {
                target = target.replace(".value", "");
                target = target.replace(".max", "");
                let targetSplit=target.split(".");
                if(targetSplit.length>1){
                  let attri = targetSplit[2];
                  //console.log(attri);
                  //property = game.items.find(y => y.data.type == "property" && y.data.data.attKey == attri);
                  property = await auxMeth.getTElement("NONE", "property", attri);
                  //console.log(property);
                }
            }
            if (property != null) {
                if (property.system.datatype != "checkbox") {
                    formData[event.target.name] = event.target.value;
                }
                else {
                    formData[event.target.name] = event.target.checked;
                }
                let attrimodified = target + ".modified";
                let attrimodmax = target + ".modmax";
                if (!modmax) {
                    formData[attrimodified] = true;
                }
                else {
                    formData[attrimodmax] = true;
                }
            }
            else {
                if (target == "system.biovisible") {
                    formData["system.biovisible"] = event.target.checked;
                }
                else if (target == "system.resizable") {
                    formData["system.resizable"] = event.target.checked;
                }
                else if (target == "system.istemplate") {
                    formData["system.istemplate"] = event.target.checked;
                }
                else {
                    formData[event.target.name] = event.currentTarget.value;
                }
            }
        }
        //console.log(formData);
        //console.log("updating form");
        await super._updateObject(event, formData);
    }

    /* -------------------------------------------- */

}

