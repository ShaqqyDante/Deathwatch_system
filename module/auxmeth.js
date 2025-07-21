import { SBOX } from "./config.js";
import { SandboxInfoForm } from "./sb-info-form.js";
import {
    sb_custom_dialog_prompt,
    sb_custom_dialog_confirm,
    sb_custom_dialog_duplicate_handling
} from "./sb-custom-dialogs.js";


export class auxMeth {

    /** Gets Sheets */
    static async getSheets() {
        //console.log("getting sheets");

        let templates = [];


        templates.push("Default");

        let templatenames = game.actors.filter(y => y.system.istemplate);

        for (let i = 0; i < templatenames.length; i++) {

            templates.push(templatenames[i].name);
        }

        //console.log(templates);
        return templates;

    }

    static async registerDicID(relativeID, objectID, ciKey = null) {

        let jsontxt = game.settings.get("sandbox", "idDict");
        let idDict = {};

        if (jsontxt != null) {
            idDict = JSON.parse(jsontxt);
        }

        else {
            idDict.ids = {};
        }
        if (ciKey) {
            if (ciKey != relativeID)
                idDict.ids[ciKey] = objectID;
        }

        idDict.ids[relativeID] = objectID;


        const myJSON = JSON.stringify(idDict);
        if (game.user.isGM)
            await game.settings.set("sandbox", "idDict", myJSON);
    }

    static async getcItem(id, ciKey = null) {
        //console.log("getting cItem");
        let ciTemplate = game.items.get(id);

        if (ciTemplate == null) {
            let jsontxt = game.settings.get("sandbox", "idDict");

            if (jsontxt != null) {
                let idDict = JSON.parse(jsontxt);
                if (idDict.ids[id] != null) {
                    ciTemplate = game.items.get(idDict.ids[id]);
                }
                if (ciTemplate == null) {
                    if (idDict.ids[ciKey] != null) {
                        ciTemplate = game.items.get(idDict.ids[ciKey]);
                    }
                }
            }


        }

        if (ciTemplate == null) {
            //let allcitems = ;
            //let is_here = game.items.filter(y => Boolean(y.system.ciKey)).find(y => y.system.ciKey == id);
            let is_here = game.system.customitemmaps.citemsbycikey.get(id);
            if (!is_here)
                //is_here = game.items.filter(y => Boolean(y.system.ciKey)).find(y => y.system.ciKey == ciKey);
                is_here = game.system.customitemmaps.citemsbycikey.get(ciKey);
            if (is_here) {
                ciTemplate = is_here;
                await auxMeth.registerDicID(id, is_here.id, ciKey);
            }
        }

        //To correct post 0.9
        if (ciTemplate == null) {
            //let allcitems = ;
            let is_here = game.items.filter(y => Boolean(y._source.system.ciKey)).find(y => y._source.system.ciKey == id);
            if (!is_here)
                is_here = game.items.filter(y => Boolean(y._source.system.ciKey)).find(y => y._source.system.ciKey == ciKey);
            if (is_here) {
                ciTemplate = is_here;
                await auxMeth.registerDicID(id, is_here.id, ciKey);
            }
        }

        if (ciTemplate == null) {

            let locatedPack;
            let locatedId;
            let found = false;
            for (let pack of game.packs) {
                if (found)
                    continue;
                if (pack.documentName != "Item")
                    continue;
                const packContents = await pack.getDocuments();
                //let citems = ;
                let newciKey = id;
                if (ciKey != null)
                    newciKey = ciKey;
                let is_here = packContents.filter(y => Boolean(y.system)).find(y => y.system.ciKey == id || y.id == id || y.system.ciKey == newciKey);
                if (is_here) {
                    locatedPack = pack;
                    locatedId = is_here.id;
                    found = true;
                }
            }



            if (locatedPack != null) {
                let findFolder = game.folders.find(y => y.name == locatedPack.title);

                if (!findFolder)
                    findFolder = await Folder.create({ name: locatedPack.title, type: "Item" });

                let importedobject = await game.items.importFromCompendium(locatedPack, locatedId, { folder: findFolder.id }, { keepId: true });
                //console.log(importedobject);
                ciTemplate = importedobject;

                //ciObject.id = ciTemplate.id;
            }


        }

        return ciTemplate;
    }

    // creates Map based on specific key, for quick searching    
    static async updateItemMaps() {
        let updateItemMapsDisabled = game.user.getFlag('world', 'updateItemMapsDisabled') || false;
        if (!updateItemMapsDisabled) {
            let items;
            let itemsummary = '';
            game.system.customitemmaps = {};
            // properties
            game.system.customitemmaps.properties = new Map();
            items = await game.items.filter(y => (y.type == "property"));
            for (let i = 0; i < items.length; i++) {
                game.system.customitemmaps.properties.set(items[i].system.attKey, items[i]);
            }
            itemsummary += 'Properties[' + items.length + ']';
            // panels
            game.system.customitemmaps.panels = new Map();
            items = await game.items.filter(y => (y.type == "panel"));
            for (let i = 0; i < items.length; i++) {
                game.system.customitemmaps.panels.set(items[i].system.panelKey, items[i]);
            }
            itemsummary += ' Panels[' + items.length + ']';
            // multipanels
            game.system.customitemmaps.multipanels = new Map();
            items = await game.items.filter(y => (y.type == "multipanel"));
            for (let i = 0; i < items.length; i++) {
                game.system.customitemmaps.multipanels.set(items[i].system.panelKey, items[i]);
            }
            itemsummary += ' Multipanels[' + items.length + ']';
            // sheettabs
            game.system.customitemmaps.sheettabs = new Map();
            items = await game.items.filter(y => (y.type == "sheettab"));
            for (let i = 0; i < items.length; i++) {
                game.system.customitemmaps.sheettabs.set(items[i].system.tabKey, items[i]);
            }
            itemsummary += ' Sheettabs[' + items.length + ']';
            // groups
            game.system.customitemmaps.groups = new Map();
            items = await game.items.filter(y => (y.type == "group"));
            for (let i = 0; i < items.length; i++) {
                game.system.customitemmaps.groups.set(items[i].system.groupKey, items[i]);
            }
            itemsummary += ' Groups[' + items.length + ']';
            // lookups
            game.system.customitemmaps.lookups = new Map();
            items = await game.items.filter(y => (y.type == "lookup"));
            for (let i = 0; i < items.length; i++) {
                game.system.customitemmaps.lookups.set(items[i].system.lookupKey, items[i]);
            }
            itemsummary += ' Lookups[' + items.length + ']';
            
            // citems by ciKey
            game.system.customitemmaps.citemsbycikey = new Map();
            items = await game.items.filter(y => (y.type == "cItem"));
            for (let i = 0; i < items.length; i++) {
                game.system.customitemmaps.citemsbycikey.set(items[i].system.ciKey, items[i]);
            }
            itemsummary += ' Citems[' + items.length + ']';
            
            // actor templates(not really a item but still)
            game.system.customitemmaps.actortemplates = new Map();
            items = await game.actors.filter(y => y.system.istemplate);            
            for (let i = 0; i < items.length; i++) {
                game.system.customitemmaps.actortemplates.set(items[i].name, items[i]);
            }
            itemsummary += ' ActorTemplates[' + items.length + ']';
            
            console.log('Sandbox | updateItemMaps | Updated | ' + itemsummary);
        }
    }

    static async getActorTemplate(key = null) {
      let actorTemplate = game.system.customitemmaps.actortemplates.get(key);
      return actorTemplate;
    }
    static async getTElement(id, type = null, key = null) {
        //console.log(id + " " + type + " " + key);
        if (id != null && id.match(/_\d+/g) != null) // Skip IDs that are from CREATE mods (ie, oaisjdo123_# <--)
            return;
        if(id=='NONE' && type=='property' && key==null)
          return;
        let myElem=null;
        
        if(id!=null) 
          myElem = game.items.get(id);

        let propKey = "";

        if (type == "property") {
            propKey = "attKey";
        }
        if (type == "panel") {
            propKey = "panelKey";
        }
        if (type == "multipanel") {
            propKey = "panelKey";
        }
        if (type == "sheettab") {
            propKey = "tabKey";
        }
        if (type == "group") {
            propKey = "groupKey";
        }
        if (type == "lookup") {
            propKey = "lookupKey";
        }
        
        if (key != null && myElem != null) {
            if (key === '' && myElem != null) {
                key = myElem.system[propKey];
            } else {
                if (myElem.system[propKey] != key)
                    myElem = null;
            }
        }
        if (myElem == null && key != null && key != '') {
            if (type == "property") {
                //myElem = await game.items.find(y =>y.type=='property' &&  y.system.attKey == key); 
                myElem = game.system.customitemmaps.properties.get(key);
            }
            if (type == "panel") {
                //myElem = await game.items.find(y =>y.type=='panel' &&  y.system.panelKey == key);
                myElem = game.system.customitemmaps.panels.get(key);
            }
            if (type == "multipanel") {
                //myElem = await game.items.find(y =>y.type=='multipanel' &&  y.system.panelKey == key);
                myElem = game.system.customitemmaps.multipanels.get(key)
            }
            if (type == "sheettab") {
                //myElem = await game.items.find(y =>y.type=='sheettab' &&  y.system.tabKey == key);
                myElem = game.system.customitemmaps.sheettabs.get(key);
            }
            if (type == "group") {
                //myElem = await game.items.find(y =>y.type=='group' &&  y.system.groupKey == key);
                myElem = game.system.customitemmaps.groups.get(key);
            }
            if (type == "lookup") {
                //myElem = await game.items.find(y =>y.type=='group' &&  y.system.groupKey == key);
                myElem = game.system.customitemmaps.lookups.get(key);
            }
        }


        //To correct post 0.9
        if (myElem == null) {
            let is_here = game.items.filter(y => Boolean(y._source.system[propKey])).find(y => y._source.system[propKey] == id);
            if (is_here) {
                myElem = is_here;
            }
        }

        if (myElem == null && key != null && key != '') {
            let locatedPack;
            let locatedId;
            for (let pack of game.packs) {
                if (pack.documentName != "Item")
                    continue;
                const packContents = await pack.getDocuments();
                let is_here = packContents.filter(y => Boolean(y.system)).find(y => y.system[propKey] == key);
                if (is_here) {
                    locatedPack = pack;
                    locatedId = is_here.id;
                }


            }

            if (locatedPack != null) {
                let findFolder = game.folders.find(y => y.name == locatedPack.title);

                if (!findFolder)
                    findFolder = await Folder.create({ name: locatedPack.title, type: "Item" });

                let importedobject = await game.items.importFromCompendium(locatedPack, locatedId, { folder: findFolder.id }, { keepId: true });
                //console.log(importedobject);
                myElem = importedobject;
            }
        }
        if (myElem == null) {
            console.error('Sandbox | Unable to find item (' + type + ') with ID:' + id + ' key(' + propKey + '):' + key);
            return;
        }
        return myElem;
    }

    static async getTempHTML(gtemplate, istemplate = false) {

        let html = "";

        let mytemplate = gtemplate;
        if (gtemplate != "Default") {

            let _template = await game.actors.find(y => y.system.istemplate && y.system.gtemplate == gtemplate);

            if (_template != null) {
                html = _template.system._html;
            }

        }

        if (html === null || html === "") {
            //console.log("defaulting template");
            gtemplate = "Default";
            html = await fetch(this.getHTMLPath(gtemplate)).then(resp => resp.text());

        }

        return html;
    }

    static getHTMLPath(gtemplate) {
        let path = "worlds/" + game.data.world.name;
        //        const path = "systems/sandbox/templates/" + game.data.world + "/";
        var gtemplate = "";

        if (gtemplate === "" || gtemplate === "Default") {
            gtemplate = "character";
            path = "systems/sandbox/templates/";
        }

        let templatepath = `${path}/${gtemplate}.html`;
        //console.log(templatepath);

        return templatepath;
    }

    /* -------------------------------------------- */

    static async retrieveBTemplate() {

        var form = await fetch("systems/sandbox/templates/character.html").then(resp => resp.text());

        return form;

    }

    static async buildSheetHML() {
        console.log("Sandbox | buildSheetHML | Building base html");
        var parser = new DOMParser();
        var htmlcode = await auxMeth.retrieveBTemplate();
        let html = parser.parseFromString(htmlcode, 'text/html');
        return html;
    }

    //EXPORT TEST
    static recurseFolders(folders, parentid) {
        let returnHTML = '<ul class="sb-json-export-ul">'
        let margin = 0;
        for (let i = 0; i < folders.length; i++) {
            let thisfolder = folders[i];
            if (thisfolder.folder != null) {
                thisfolder = thisfolder.folder;
            }
            // ul approach
            if (thisfolder.children.length > 0) {
                returnHTML += `<li class="sb-json-export-li"><label class="sb-json-export-li-label" for="sb-json-export-${thisfolder.id}"><input class="exportDialog checkbox sb-json-export-checkbox" id="sb-json-export-${thisfolder.id}" folderid ="${thisfolder.id}" parentid="${parentid}" type="checkbox">${thisfolder.name}</label>`;
            } else {
                returnHTML += `<li class="sb-json-export-li"><label class="sb-json-export-li-label" for="sb-json-export-${thisfolder.id}"><input class="exportDialog checkbox sb-json-export-checkbox" id="sb-json-export-${thisfolder.id}" folderid ="${thisfolder.id}" parentid="${parentid}" type="checkbox">${thisfolder.name}</label>`;
            }
            returnHTML += this.recurseFolders(thisfolder.children, thisfolder.id);
            returnHTML += `</li>`;
        }
        returnHTML += `</ul>`;
        return returnHTML;
    }

    static exportBrowser() {

        let entities = {};

        entities.actors = [];
        entities.items = [];
        entities.folders = [];

        let allfolders = game.folders.contents.filter(y => y.type == "Item" || y.type == "Actor");


        //console.log(itemfolders);
        let rootItemFolders = game.folders.contents.filter(y => y.type == "Item" && y.depth == 1);
        let rootActorFolders = game.folders.contents.filter(y => y.type == "Actor" && y.depth == 1);
        let finalContent = `<div class="exportbrowser">`;
        let endDiv = `</div>`;

        // ul approach
        finalContent += `<ul class="sb-json-export-ul">`;
        finalContent += `<li class="sb-json-export-li"><label class="sb-json-export-li-label" for="sb-json-export-folderroot"><input class="exportDialog checkbox sb-json-export-checkbox" id="sb-json-export-folderroot" folderid ="folderroot" type="checkbox">FOLDERS</label>`;
        finalContent += `<ul class="sb-json-export-ul">`;
        // items
        finalContent += `<li class="sb-json-export-li"><label class="sb-json-export-li-label" for="sb-json-export-itemroot"><input class="exportDialog checkbox sb-json-export-checkbox" id="sb-json-export-itemroot" folderid ="itemroot" parentid="folderroot" type="checkbox">ITEMS</label>`;
        finalContent += this.recurseFolders(rootItemFolders, "itemroot");
        finalContent += `</li>`;
        // actors
        finalContent += `<li class="sb-json-export-li"><label class="sb-json-export-li-label" for="sb-json-export-actorroot"><input class="exportDialog checkbox sb-json-export-checkbox" id="sb-json-export-actorroot" folderid ="actorroot" parentid="folderroot" type="checkbox">ACTORS</label>`;
        finalContent += this.recurseFolders(rootActorFolders, "actorroot");
        finalContent += `</li>`;

        finalContent += `</ul>`;
        finalContent += `</li>`;
        finalContent += `</ul>`;

        finalContent += endDiv;

        let d = new Dialog({
            title: "Choose folders to export",
            content: finalContent,
            buttons: {
                ok: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "OK",

                    callback: async (html) => {
                        console.log('Sandbox | JSON Export | Running consistency check before export');
                        await auxMeth.checkConsistency();
                        ui.notifications.info("Sandbox JSON Export started...")
                        let selectedfolder = html[0].getElementsByClassName("exportDialog");
                        for (let k = 0; k < selectedfolder.length; k++) {
                            let folderKey = selectedfolder[k].getAttribute("folderid");
                            if (selectedfolder[k].checked) {
                                let theFolder;
                                // check for root folders
                                if (folderKey == 'itemroot') {
                                    let rootitems = game.items.filter(y => y.folder === null)

                                    //console.log(rootitems)
                                    for (let n = 0; n < rootitems.length; n++) {
                                        entities.items.push(rootitems[n]);
                                    }

                                } else if (folderKey == 'actorroot') {
                                    let rootactors = game.actors.filter(y => y.folder === null)
                                    //console.log(rootactors)
                                    for (let n = 0; n < rootactors.length; n++) {
                                        entities.actors.push(rootactors[n]);
                                    }

                                } else {
                                    theFolder = allfolders.find(y => y.id == folderKey);
                                }
                                if (theFolder != null) {
                                    entities.folders.push(theFolder);

                                    for (let n = 0; n < theFolder.contents.length; n++) {
                                        if (theFolder.contents[n].documentName == "Item") {
                                            entities.items.push(theFolder.contents[n]);
                                        }
                                        if (theFolder.contents[n].documentName == "Actor") {
                                            entities.actors.push(theFolder.contents[n]);
                                        }
                                    }
                                }
                            }
                        }
                        //console.log(entities);
                        let saveresult = await auxMeth.exportTree(true, entities);

                        ui.notifications.info(`Exported completed`, { "permanent": true });
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel",
                    callback: () => { console.log("canceling selection"); }
                }
            },
            default: "cancel",
            exportDialog: true,
            close: () => console.log("cItem selection dialog was shown to player.")
        });

        d.options.height = 600;
        d.position.height = 600;
        d.options.resizable = true;
        d.render(true);
    }

    static nowToTimestamp() {
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();
        let HH = String(today.getHours()).padStart(2, '0');
        let nn = String(today.getMinutes()).padStart(2, '0');
        let ss = String(today.getSeconds()).padStart(2, '0');

        return yyyy + mm + dd + HH + nn + ss;
    }

    static convertToValidFilename(string) {
        return (string.replace(/[\/|\\:*?"<>]/g, "_"));
    }


    static exportTree(writeFile = true, groups = null) {
        ui.notifications.info("Exporting data...");
        let allData = null;
        const metadata = {
            world: game.world.id,
            system: game.system.id,
            coreVersion: game.version,
            systemVersion: game.system.version
        };

        allData = JSON.stringify(groups, null, 2);

        console.log(`Exporting ${groups.actors.length} Actors and ${groups.items.length} Items of the world`);
        ui.notifications.info(`Exporting ${groups.actors.length} Actors and ${groups.items.length} Items`);
        //Trigger file save procedure
        let filename = '';
        if (game.actors.size + game.items.size == groups.actors.length + groups.items.length) {
            filename = game.world.id + "-export-all-" + auxMeth.nowToTimestamp() + ".json";
        } else {
            if (groups.folders.length == 1) {
                filename = game.world.id + "-export-" + groups.folders[0].name + "-" + auxMeth.nowToTimestamp() + ".json";
            } else {
                filename = game.world.id + "-export-subset-" + auxMeth.nowToTimestamp() + ".json";
            }
        }
        filename = auxMeth.convertToValidFilename(filename);

        if (writeFile) auxMeth.writeJSONToFile(filename, allData);
        return {
            filename,
            allData
        }
    }

    static async writeJSONToFile(filename, data) {
        ui.notifications.info(`Saving exported data to file...`);
        saveDataToFile(data, "application/json", filename);
        console.log(`Saved to file ${filename}`);

    }

    static async getImportFile() {
        // ask user to proceed
        let prompttitle = game.i18n.format("SANDBOX.confirmStartImportPromptTitle", {});
        let promptbody = '<h4>' + game.i18n.localize("AreYouSure") + '</h4>';
        promptbody += '<p>' + game.i18n.format("SANDBOX.confirmStartImportPromptBody", {}) + '</p>';
        let answer = await sb_custom_dialog_confirm(prompttitle, promptbody, game.i18n.localize("Yes"), game.i18n.localize("No"));
        if (!answer) {
            return 0;
        }
        let currentinput = `worlds/${game.world.id}`;
        new FilePicker({
            current: currentinput,
            type: "json",
            callback: filePath => auxMeth.importTree(filePath),
        }).browse();

    }

    static async getSandboxFlag(obj, flag, value = null) {
        if (!obj.hasOwnProperty('flags')) {
            // no flags at all, add it
            console.log('getSandboxFlag | Adding flags');
            obj.flags = {};
        }
        if (!obj.flags.hasOwnProperty('sandbox')) {
            // no sandbox flags, add it
            console.log('getSandboxFlag | Adding sandbox flags');
            obj.flags.sandbox = {};
        }
        if (!obj.flags.sandbox.hasOwnProperty(flag)) {
            // no such sandbox flag
            if (value != null) {
                // add it
                console.log('getSandboxFlag | Adding sandbox flag [' + flag + ']');
                obj.flags.sandbox[flag] = value;
                return value;
            } else {
                return null;
            }
        } else {
            console.log('getSandboxFlag | Found sandbox flag [' + flag + ']', obj.flags.sandbox[flag]);
            return obj.flags.sandbox[flag];
        }
    }
    /* -------------------------------------------- */
    static async importTree(exportfilePath) {
        //let exportfilePath = "worlds/" + gameName + "/export.json";
        await console.log('Sandbox | importTree | ' + `Data import from file ${exportfilePath} started`)
        await ui.notifications.info(`Data import from file ${exportfilePath} started`, { console: false });
        const response = await fetch(exportfilePath);
        const importedPack = await response.json();
        const actors = importedPack.actors;
        const items = importedPack.items;
        const folders = importedPack.folders;

        let idCollection = {};
        let originalId = null;
        await console.log('Sandbox | importTree | Importing actors phase 1')
        for (let i = 0; i < actors.length; i++) {
            let anactor = actors[i];
            // compability check
            if (!anactor.hasOwnProperty('system')) {
                // to old data(pre v10) exit and set error                                                         
                sb_custom_dialog_prompt(game.i18n.localize("SANDBOX.ImportDataIsFromPreV10Title"), game.i18n.localize("SANDBOX.ImportDataIsFromPreV10Body"), 'Ok', 'Error')
                console.error('Sandbox | importTree | Data in file ' + exportfilePath + ' is missing [system] property');
                return false;
            }
            let istemplate = duplicate(anactor.system.istemplate);
            // -------------------------------------------
            // detailed import, will be expanded in future                       
            originalId = null;
            // check for sandbox flags
            originalId = await auxMeth.getSandboxFlag(anactor, 'originalId', anactor._id)
            // prepare import flag
            anactor.flags.sandbox.import = { 'importedTime': 0 };  // add/reset marker for import before the create
            anactor.flags.sandbox.import.importId = originalId;
            // check if import has _stats(v10 and forward)
            if (anactor.hasOwnProperty('_stats')) {
                anactor.flags.sandbox.import.systemVersion = anactor._stats.systemVersion;
                anactor.flags.sandbox.import.coreVersion = anactor._stats.coreVersion;
                anactor.flags.sandbox.import.createdTime = anactor._stats.createdTime;
                anactor.flags.sandbox.import.modifiedTime = anactor._stats.modifiedTime;
                anactor.flags.sandbox.import.lastModifiedBy = anactor._stats.lastModifiedBy;
            }

            // end detailed import
            // -------------------------------------------

            let result = await Actor.create(anactor);
            if (anactor.folder)
                result.setFlag('sandbox', 'folder', anactor.folder);
            result.setFlag('sandbox', 'istemplate', istemplate);


            idCollection[anactor._id] = result._id;
        }
        await console.log('Sandbox | importTree | Importing items phase 1')
        for (let i = 0; i < items.length; i++) {
            let anitem = items[i];
            // -------------------------------------------
            // detailed import, will be expanded in future                       
            originalId = null;
            // check for sandbox flags
            originalId = await auxMeth.getSandboxFlag(anitem, 'originalId', anitem._id)
            // prepare import flag
            anitem.flags.sandbox.import = { 'importedTime': 0 };  // add/reset marker for import before the create
            anitem.flags.sandbox.import.importId = originalId;
            // check if import has _stats(v10 and forward)
            if (anitem.hasOwnProperty('_stats')) {
                anitem.flags.sandbox.import.systemVersion = anitem._stats.systemVersion;
                anitem.flags.sandbox.import.coreVersion = anitem._stats.coreVersion;
                anitem.flags.sandbox.import.createdTime = anitem._stats.createdTime;
                anitem.flags.sandbox.import.modifiedTime = anitem._stats.modifiedTime;
                anitem.flags.sandbox.import.lastModifiedBy = anitem._stats.lastModifiedBy;
            }

            // end detailed import
            // -------------------------------------------


            let result = await Item.create(anitem);
            if (anitem.folder)
                result.setFlag('sandbox', 'folder', anitem.folder);
            idCollection[anitem._id] = result._id;
        }

        await ui.notifications.info(`Importing folders from file...`, { console: false });
        await console.log('Sandbox | importTree | Importing folders phase 1')
        for (let i = 0; i < folders.length; i++) {
            let afolder = folders[i];
            let result = await Folder.create({ name: afolder.name, type: afolder.type });
            if (afolder.folder)
                result.realparent = afolder.folder;
            idCollection[afolder._id] = result._id;
        }

        for (let folder of game.folders.contents) {
            if (hasProperty(idCollection, folder.realparent))
                folder.update({ "folder": idCollection[folder.realparent] });
        }

        await console.log('Sandbox | importTree | Folders imported')
        await ui.notifications.info(`Folders imported from file`, { console: false });
        await console.log('Sandbox | importTree | Importing items phase 2')
        await ui.notifications.info(`Importing items from file...`, { console: false });
        for (let item of game.items.contents) {
            let finalitem = await duplicate(item);
            //console.log("importing item: " + finalitem.name);

            if (item.type == "property") {
                if (hasProperty(idCollection, finalitem.dialogID) && finalitem.system.dialogID != "")
                    finalitem.system.dialogID = idCollection[finalitem.system.dialogID];

                if (hasProperty(idCollection, finalitem.system.group.id) && finalitem.system.group.id != "")
                    finalitem.system.group.id = idCollection[finalitem.system.group.id];
            }

            if (item.type == "panel" || item.type == "group") {
                if (finalitem.system.properties.length > 0) {
                    for (let property of finalitem.system.properties) {
                        if (hasProperty(idCollection, property.id)) {
                            property.id = idCollection[property.id];
                        }
                        else {
                            let findprop = game.items.get(property.id);
                            if (findprop == null) {
                                findprop = game.items.find(y => y.type == "property" && y.system.attKey == property.ikey);
                            }
                            if (findprop != null)
                                property.id = findprop.id;

                        }

                    }
                }
            }

            if (item.type == "multipanel" || item.type == "sheettab") {
                if (finalitem.system.panels.length > 0) {
                    for (let panel of finalitem.system.panels) {
                        if (hasProperty(idCollection, panel.id))
                            panel.id = idCollection[panel.id];
                    }
                }
            }

            if (item.type == "cItem") {
                if (finalitem.system.groups.length > 0) {
                    for (let group of finalitem.system.groups) {
                        if (hasProperty(idCollection, group.id)) {
                            group.id = idCollection[group.id];
                        }
                        else {
                            let findgroup = game.items.get(group.id);
                            if (findgroup == null) {
                                findgroup = game.items.find(y => y.type == "group" && y.system.groupKey == group.ikey);
                            }
                            if (findgroup != null)
                                group.id = findgroup.id;

                        }

                    }
                }

                if (item.system.mods.length > 0) {
                    for (let mod of finalitem.system.mods) {
                        if (mod.items.length > 0) {
                            for (let moditem of mod.items) {
                                if (hasProperty(idCollection, moditem.id)) {
                                    moditem.id = idCollection[moditem.id];
                                }

                                else {
                                    let findcitem = game.items.get(moditem.id);
                                    if (findcitem == null) {
                                        findcitem = game.items.find(y => y.type == "cItem" && y.system.ciKey == moditem.id);
                                    }

                                    if (findcitem == null) {
                                        findcitem = game.items.find(y => y.type == "cItem" && y.name == moditem.name);
                                    }

                                    if (findcitem != null)
                                        moditem.id = findcitem.id;

                                }

                            }
                        }
                    }
                }

                if (item.system.dialogID != "")
                    finalitem.system.dialogID = idCollection[finalitem.system.dialogID];
            }

            let folderlink = idCollection[item.getFlag("sandbox", "folder")];
            if (folderlink) {
                await item.update({ "system": finalitem.system, "folder": folderlink });
            }
            else {
                await item.update({ "system": finalitem.system });
            }



        }
        await ui.notifications.info(`Items imported from file`, { console: false });

        await console.log('Sandbox | importTree | Items imported')
        await ui.notifications.info(`Importing actors from file...`, { console: false });
        await console.log('Sandbox | importTree | Importing actors phase 2')
        for (let actor of game.actors.contents) {
            let finalactor = await duplicate(actor);
            //console.log("importing actor: " + finalactor.name);
            if (finalactor.token != null)
                if (finalactor.token.actorId != null)
                    if (hasProperty(idCollection, finalactor.token.actorId))
                        finalactor.token.actorId = idCollection[finalactor.token.actorId];

            if (actor.system.citems.length > 0)
                for (let citem of finalactor.system.citems) {
                    if (hasProperty(idCollection, citem.id)) {
                        citem.id = idCollection[citem.id];
                        citem.addedBy = idCollection[citem.addedBy];

                        if (citem.groups) {
                            for (let group of citem.groups) {
                                if (hasProperty(idCollection, group.id))
                                    group.id = idCollection[group.id];
                            }
                        }

                        if (citem.mods)
                            for (let mod of citem.mods) {
                                if (hasProperty(idCollection, mod.citem))
                                    mod.citem = idCollection[mod.citem];
                            }
                    }
                }

            if (actor.system.tabs.length > 0)
                for (let tab of finalactor.system.tabs) {
                    if (hasProperty(idCollection, tab.id)) {
                        tab.id = idCollection[tab.id];

                    }
                }

            for (var key in finalactor.system.attributes) {
                if (finalactor.system.attributes[key].id != null) {
                    if (hasProperty(idCollection, finalactor.system.attributes[key].id))
                        finalactor.system.attributes[key].id = idCollection[finalactor.system.attributes[key].id];
                }
            }

            let folderlink = await idCollection[actor.getFlag("sandbox", "folder")];
            finalactor.system.istemplate = await actor.getFlag("sandbox", "istemplate");

            if (folderlink) {
                await actor.update({ "system": finalactor.system, "folder": folderlink });
            }
            else {
                await actor.update({ "system": finalactor.system });
            }


        }
        await ui.notifications.info(`Actors imported from file`, { console: false });
        await ui.notifications.info(`Import from file completed`, { console: false });

        await console.log('Sandbox | importTree | Import completed')
        await sb_custom_dialog_prompt(game.i18n.localize("Information"), game.i18n.localize("SANDBOX.ImportCompletedBody"), game.i18n.localize("Ok"), 'Information');
    }


    /* -------------------------------------------- */



    static async isNumeric(str) {
        if (typeof str != "string") return false // we only process strings!  
        return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
            !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
    }

    static async regParser(expr, attributes, itemattributes) {
        let regArray = [];
        let expreg = expr.match(/(?<=\$\<).*?(?=\>)/g);
        if (expreg != null) {

            //Substitute string for current value
            for (let i = 0; i < expreg.length; i++) {
                let attname = "$<" + expreg[i] + ">";
                let attvalue = "";

                let regblocks = expreg[i].split(";");

                let regobject = {};
                regobject.index = regblocks[0];
                regobject.expr = regblocks[1];
                regobject.result = await auxMeth.autoParser(regblocks[1], attributes, itemattributes, false, true);
                regArray.push(regobject);

                expr = expr.replace(attname, attvalue);

            }

            let exprparse = expr.match(/(?<=\$)[0-9]+/g);

            for (let i = 0; i < exprparse.length; i++) {
                let regindex = exprparse[i];

                let attname = "$" + regindex;
                let regObj = regArray.find(y => y.index == regindex);

                let attvalue = "";
                if (regObj != null)
                    attvalue = regObj.result;

                //console.log(attvalue);
                expr = expr.replace(attname, attvalue);
            }
        }

        return expr;
    }

    static async parseDialogProps(expr, dialogProps) {
        //console.log(expr);
        var itemresult = expr.match(/(?<=\bd\{).*?(?=\})|(?<=\wd\{).*?(?=\})/g);
        if (itemresult != null && dialogProps != null) {
            //console.log(itemresult);
            //Substitute string for current value
            for (let i = 0; i < itemresult.length; i++) {
                let attname = "d{" + itemresult[i] + "}";
                let attvalue;

                if (dialogProps[itemresult[i]] != null)
                    attvalue = dialogProps[itemresult[i]].value;
                else {
                    attvalue = 0;
                }

                if ((attvalue !== false) && (attvalue !== true)) {
                    if ((attvalue == "" || attvalue == null))
                        attvalue = 0;
                }

                if (attvalue == null)
                    attvalue = 0;

                expr = expr.replace(attname, attvalue);

            }

        }

        return expr;
    }
    static async basicParser(expr,actor=null,actorcitem=null){
      let returnValue=expr;
      // parses basic things
      if(expr.length==0) return returnValue;
      if(expr.includes("#{diff}")){
        let diff = await game.settings.get("sandbox", "diff");
        if (diff == null)
            diff = 0;
        if (isNaN(diff))
            diff = 0;
        returnValue = returnValue.replace(/\#{diff}/g, diff);
      }
      if(actor!=null){        
        returnValue = returnValue.replace(/\@{name}/g, actor.name);
      }
      if(actorcitem!=null){
        // for future when i rewritten other functions to pass actor,actorcitem
      }
      if(returnValue.includes("#{targetname}")){
        let firstTarget=game.user.targets.first();
        if(firstTarget!=null){
          returnValue = await returnValue.replace(/\#{targetname}/g, firstTarget.document.name);
        } else{
          returnValue = await returnValue.replace(/\#{targetname}/g, game.i18n.localize("SANDBOX.RollExpressionNoTargetsSelected"));
        }
      }
      // parse target(s) name
      if (returnValue.includes("#{targetlist}")) {
        let targets = game.user.targets.ids;
        if (targets.length > 0) {
          let targetnames = '';
          let targettoken = null;
          for (let i = 0; i < targets.length; i++) {
            targettoken = canvas.tokens.placeables.find(y => y.id == targets[i]);
            if (targettoken != null) {
              if (targetnames.length == 0) {
                targetnames = targettoken.name;
              } else {
                targetnames = targetnames + '&#44 ' + targettoken.name;
              }
            }
          }          
          returnValue = await returnValue.replace(/\#{targetlist}/g, targetnames);
        } else {
          returnValue = await returnValue.replace(/\#{targetlist}/g, game.i18n.localize("SANDBOX.RollExpressionNoTargetsSelected"));
        }
      }
      return returnValue;
    }
    
    
    

    static async autoParser(expr, attributes, itemattributes, exprmode, noreg = false, number = 1, uses = 0, maxuses = 1) {      
        const initialexp = expr;
        var toreturn = expr;
        //console.log("autoParser | ", expr);
        


        if (typeof (expr) != "string")
            return expr;

        let diff = await game.settings.get("sandbox", "diff");
        if (diff == null)
            diff = 0;
        if (isNaN(diff))
            diff = 0;
        expr = expr.replace(/\#{diff}/g, diff);
        //console.log(itemattributes);
        //console.log(number);
        //console.log(exprmode);

        //PARSE TO TEXT
        let textexpr = expr.match(/[|]/g);
        if (textexpr != null && (expr.charAt(0) == "|")) {
            //console.log("has | ");
            expr = expr.substr(1, expr.length);
            exprmode = true;
        }

        //console.log(exprmode);

        //Expression register. Recommended to avoid REgex shennanigans
        let regArray = [];
        let expreg;
        if (!noreg)
            expreg = expr.match(/(?<=\$\<).*?(?=\>)/g);
        if (expreg != null) {

            //Substitute string for current value
            for (let i = 0; i < expreg.length; i++) {

                let attname = "$<" + expreg[i] + ">";
                let attvalue = "";

                let regblocks = expreg[i].split(";");

                let regobject = {};
                regobject.index = regblocks[0];
                regobject.expr = expreg[i].replace(regblocks[0] + ";", '');
                //console.log(regobject.expr);
                let internalvBle = regobject.expr.match(/(?<=\$)[0-9]+/g);
                if (internalvBle != null) {
                    for (let k = 0; k < internalvBle.length; k++) {
                        let regindex = internalvBle[k];
                        let regObj = await regArray.find(y => y.index == regindex);
                        let vbvalue = "";
                        if (regObj != null)
                            vbvalue = regObj.result;
                        regobject.expr = regobject.expr.replace("$" + regindex, vbvalue);
                    }

                }
                //console.log(regobject.expr);
                //console.log('Sandbox | autoParser | recursive | initialexp:[' + initialexp +'] regobject.expr:[' + regobject.expr + ']');
                regobject.result = await auxMeth.autoParser(regobject.expr, attributes, itemattributes, false, true);
                //console.log(regobject.result);

                await regArray.push(regobject);

                expr = expr.replace(attname, attvalue);

            }

            let exprparse = expr.match(/(?<=\$)[0-9]+/g);
            if (exprparse != null) {
                for (let i = 0; i < exprparse.length; i++) {
                    let regindex = exprparse[i];

                    let attname = "$" + regindex;
                    let regObj = regArray.find(y => y.index == regindex);

                    let attvalue = "";
                    if (regObj != null)
                        attvalue = regObj.result;

                    //console.log(regindex);
                    //console.log(attvalue);

                    expr = expr.replace(attname, attvalue);
                    expr = expr.trimStart();
                }
            }

            //console.log(expr);

        }

        //console.log(expr);
        //console.log(regArray);

        //Parses last roll
        if (itemattributes != null && expr.includes("#{roll}")) {
            expr = expr.replace(/\#{roll}/g, itemattributes._lastroll);
        }

        //Parses number of citems
        if (itemattributes != null && expr.includes("#{num}")) {
            expr = expr.replace(/\#{num}/g, number);
        }

        //Parses uses of citems
        if (itemattributes != null && expr.includes("#{uses}")) {
            expr = expr.replace(/\#{uses}/g, uses);
        }
        //Parses maxuses of citems
        if (itemattributes != null && expr.includes("#{maxuses}")) {
            expr = expr.replace(/\#{maxuses}/g, maxuses);
        }

        if (itemattributes != null && expr.includes("#{name}")) {
            //console.log("has name");
            expr = expr.replace(/\#{name}/g, itemattributes.name);
        }

        //console.log(expr);
        expr = expr.toString();

        //PARSE ITEM ATTRIBUTES
        var itemresult = expr.match(/(?<=\#\{).*?(?=\})/g);
        if (itemresult != null && itemattributes != null) {

            //Substitute string for current value
            for (let i = 0; i < itemresult.length; i++) {
                let attname = "#{" + itemresult[i] + "}";
                let attvalue;

                if (itemattributes[itemresult[i]] != null)
                    attvalue = itemattributes[itemresult[i]].value;
                else {
                    //ui.notifications.warn("cItem property " + itemresult[i] + " of cItem " + itemattributes.name +" does not exist");
                    attvalue = 0;
                }

                if ((attvalue !== false) && (attvalue !== true)) {
                    if ((attvalue == "" || attvalue == null))
                        attvalue = 0;
                }

                if (attvalue == null)
                    attvalue = 0;

                if (!itemresult[i].includes("#{target|"))
                    expr = expr.replace(attname, attvalue);

            }

        }
        //console.log(expr);
        //PARSE ACTOR ATTRIBUTES

        var result = expr.match(/(?<=\@\{).*?(?=\})/g);
        if (result != null) {

            //Substitute string for current value
            for (let i = 0; i < result.length; i++) {
                let rawattname = result[i];
                let attProp = "value";
                let attTotal;
                if (rawattname.includes(".max")) {
                    rawattname = rawattname.replace(".max", "");
                    attProp = "max";
                }

                if (rawattname.includes(".totals.")) {
                    let splitter = rawattname.split('.');
                    rawattname = splitter[0];
                    attTotal = splitter[2];
                    attProp = "total";
                }

                let attname = "@{" + result[i] + "}";
                let attvalue;

                if (attributes != null) {
                    let myatt = attributes[rawattname];


                    if (myatt != null) {
                        if (attTotal != null && attTotal != "")
                            myatt = attributes[rawattname].totals[attTotal];
                        if (myatt != null)
                            attvalue = myatt[attProp];
                    }
                    else {
                        let fromcItem = false;
                        let mycitem = "";
                        if (itemattributes != null) {
                            fromcItem = true;
                            mycitem = " from citem: " + itemattributes.name;
                        }

                        ui.notifications.warn("Property " + rawattname + mycitem + " does not exist");
                        //console.log(expr);
                    }

                    if ((attvalue !== false) && (attvalue !== true)) {
                        if ((attvalue == "" || attvalue == null))
                            attvalue = 0;
                    }

                    if (attvalue == null)
                        attvalue = 0;

                }
                else {
                    attvalue = 0;
                }

                expr = expr.replace(attname, attvalue);
            }

        }

        //PARSE ITEM ATTRIBUTE
        //console.log(expr);
        var attcresult = expr.match(/(?<=\-\-)\S*?(?=\-\-)/g);
        if (attcresult != null) {

            //Substitute string for current value
            for (let i = 0; i < attcresult.length; i++) {
                let attname = "--" + attcresult[i] + "--";
                let attvalue;
                if (itemattributes[attcresult[i]] != null)
                    attvalue = itemattributes[attcresult[i]].value;
                if (attvalue == "" || attvalue == null)
                    attvalue = 0;
                //console.log(attname + " " + attvalue);
                let nonvalid = /\,|\[|\]|\(|\)|\;/g;
                let nonvalidexpr = attcresult[i].match(nonvalid);

                if (!nonvalidexpr)
                    expr = expr.replace(attname, attvalue);
            }

        }

        //console.log(expr);

        //PARSE ACTOR ATTRIBUTE
        var attpresult = expr.match(/(?<=\_\_)\S*?(?=\_\_)/g);
        if (attpresult != null) {

            //Substitute string for current value
            for (let i = 0; i < attpresult.length; i++) {
                let debugname = attpresult[i];
                //console.log(debugname);
                let attname = "__" + attpresult[i] + "__";
                let attvalue = 0;
                if (attributes != null) {
                    if (attributes[attpresult[i]] != null)
                        attvalue = attributes[attpresult[i]].value;

                    //                    if(attvalue=="")
                    //                        attvalue = 0;
                }

                let nonvalid = /\,|\[|\]|\(|\)|\;/g;
                let nonvalidexpr = attpresult[i].match(nonvalid);
                //console.log(attvalue);

                if (!nonvalidexpr)
                    expr = expr.replace(attname, attvalue);
            }

        }

        //console.log(expr);

        //NEW SMART PARSING
        let sums_are_num = false;
        let safety_break = 0;
        let useMathParser=false;
        while (!sums_are_num) {
            //console.log(expr);
            sums_are_num = true;
            if (safety_break > 7)
                break;

            //console.log(expr);
if(!useMathParser){
            //PARSE CEIL
            let ceilmatch = /\bceil\(/g;
            var ceilResultArray;
            var ceilResult = [];

            while (ceilResultArray = ceilmatch.exec(expr)) {
                //console.log(maxResultArray.index + ' ' + mrmatch.lastIndex);
                let suba = expr.substring(ceilmatch.lastIndex, expr.length);
                let subb = auxMeth.getParenthesString(suba);
                ceilResult.push(subb);
            }

            if (ceilResult != null) {
                //Substitute string for current value        
                for (let i = 0; i < ceilResult.length; i++) {
                    let ceilExpr = ceilResult[i];
                    let tochange = "ceil(" + ceilExpr + ")";

                    let maxpresent = /\bif\[|\bmax\(|\bmin\(|\bsum\(|\%\[|\bfloor\(|\bceil\(|\bcount[E|L|H]\(|\?\[|[a-zA-Z]/g;
                    let maxpresentcheck = ceilExpr.match(maxpresent);

                    if (!maxpresentcheck) {
                        //if(isNaN(ceilExpr)){
                        //                            let roll = new Roll(ceilExpr).roll();
                        //                            let finalvalue = roll.total;
                        //                            expr = expr.replace(tochange,parseInt(finalvalue));


                        let test = eval(ceilExpr);
                        let finalstring = "ceil(" + test + ")";
                        let roll = new Roll(finalstring);
                        await roll.evaluate({ async: true });
                        finalstring = roll.total;
                        expr = expr.replace(tochange, finalstring);
                        //}

                    }

                }
            }
}
            //console.log(expr);
if(!useMathParser){
            //PARSE FLOOR
            let floormatch = /\bfloor\(/g;
            var floorResultArray;
            var floorResult = [];

            while (floorResultArray = floormatch.exec(expr)) {
                //console.log(maxResultArray.index + ' ' + mrmatch.lastIndex);
                let suba = expr.substring(floormatch.lastIndex, expr.length);
                let subb = auxMeth.getParenthesString(suba);
                floorResult.push(subb);
            }

            if (floorResult != null) {
                //Substitute string for current value        
                for (let i = 0; i < floorResult.length; i++) {
                    let floorExpr = floorResult[i];
                    let tochange = "floor(" + floorExpr + ")";

                    let maxpresent = /\bif\[|\bmax\(|\bmin\(|\bsum\(|\%\[|\bfloor\(|\bceil\(|\bcount[E|L|H]\(|\?\[|[a-zA-Z]/g;
                    let maxpresentcheck = floorExpr.match(maxpresent);

                    if (!maxpresentcheck) {
                        if (isNaN(floorExpr)) {
                            //                            let roll = new Roll(floorExpr).roll();
                            //                            let finalvalue = roll.total;
                            //                            expr = expr.replace(tochange,parseInt(finalvalue)); 
                            //console.log(floorExpr);

                            let test = eval(floorExpr);
                            //console.log(test);
                            let finalstring = "floor(" + test + ")";
                            let roll = new Roll(finalstring);
                            await roll.evaluate({ async: true });
                            finalstring = roll.total;
                            expr = expr.replace(tochange, finalstring);
                        }

                    }

                }
            }
        }

            //console.log(expr);

            //PARSE MAX ROLL
            //var maxresult = expr.match(/(?<=\maxdie\().*?(?=\))/g);
            let mxmatch = /maxdie\(/g;
            var maxdieArray;
            var maxDie = [];

            while (maxdieArray = mxmatch.exec(expr)) {
                //console.log(maxResultArray.index + ' ' + mrmatch.lastIndex);
                let suba = expr.substring(mxmatch.lastIndex, expr.length);
                let subb = auxMeth.getParenthesString(suba);
                maxDie.push(subb);
            }

            if (maxDie != null) {
                for (let i = 0; i < maxDie.length; i++) {
                    let tochange = "maxdie(" + maxDie[i] + ")";

                    let mdieexpr = maxDie[i].split(";");
                    let mdieroll = mdieexpr[0];
                    let mdiemode = mdieexpr[1];

                    if (mdiemode == null || mdiemode == "true") {
                        mdiemode = true;
                    }
                    else {
                        mdiemode = false;
                    }

                    let newroll = new Roll(mdieroll);
                    await newroll.evaluate({ async: true });

                    let attvalue = 0;
                    for (let j = 0; j < newroll.dice.length; j++) {
                        let diceexp = newroll.dice[j];
                        if (mdiemode) {
                            attvalue += parseInt(diceexp.results.length) * parseInt(diceexp.faces);
                        }
                        else {
                            attvalue = parseInt(diceexp.faces);
                        }

                    }


                    expr = expr.replace(tochange, attvalue);
                }
            }

            //console.log(expr);

            //MAXOF
            //var maxResult = expr.match(/(?<=\max\().*?(?=\))/g);
            let mrmatch = /\bmax\(/g;
            var maxResultArray;
            var maxResult = [];

            while (maxResultArray = mrmatch.exec(expr)) {
                //console.log(maxResultArray.index + ' ' + mrmatch.lastIndex);
                let suba = expr.substring(mrmatch.lastIndex, expr.length);
                let subb = auxMeth.getParenthesString(suba);
                maxResult.push(subb);
            }

            if (maxResult != null) {
                //Substitute string for current value        
                for (let i = 0; i < maxResult.length; i++) {
                    //console.log(maxResult[i]);
                    let ifpresent = /\bif\[|\bmax\(|\bmin\(|\bsum\(|\%\[|\bceil\(|\bfloor\(|\bcount[E|L|H]\(|\?\[/g;
                    let ifpresentcheck = maxResult[i].match(ifpresent);

                    if (!ifpresentcheck) {
                        let blocks = maxResult[i].split(",");
                        let finalvalue = 0;
                        let valueToMax = Array();
                        let nonumber = false;
                        for (let n = 0; n < blocks.length; n++) {
                            let pushblock = blocks[n];
                            let nonumsum = /[#@]{|\%\[|\if\[|\?\[/g;
                            let checknonumsum = blocks[n].match(nonumsum);
                            //console.log(pushblock);
                            if (!checknonumsum) {
                                if (isNaN(pushblock)) {
                                    let roll = new Roll(blocks[n]);
                                    await roll.evaluate({ async: true });
                                    pushblock = roll.total;
                                }

                                valueToMax.push(parseInt(pushblock));
                            }
                            else {
                                //console.log("nonumber");
                                nonumber = true;
                            }
                        }
                        if (!nonumber) {
                            finalvalue = Math.max.apply(Math, valueToMax);
                            let tochange = "max(" + maxResult[i] + ")";
                            expr = expr.replace(tochange, parseInt(finalvalue));
                        }

                        else {
                            sums_are_num = false;
                        }
                    }

                    else {
                        sums_are_num = false;
                    }


                }
            }

            //console.log(expr);

            //MINOF
            //var minResult = expr.match(/(?<=\min\().*?(?=\))/g);
            let minmatch = /\bmin\(/g;
            var minResultArray;
            var minResult = [];

            while (minResultArray = minmatch.exec(expr)) {
                //console.log(maxResultArray.index + ' ' + mrmatch.lastIndex);
                let suba = expr.substring(minmatch.lastIndex, expr.length);
                let subb = auxMeth.getParenthesString(suba);
                minResult.push(subb);
            }
            if (minResult != null) {
                //Substitute string for current value        
                for (let i = 0; i < minResult.length; i++) {
                    let ifpresent = /\bif\[|\bmax\(|\bmin\(|\bsum\(|\%\[|\bceil\(|\bfloor\(|\bcount[E|L|H]\(|\?\[/g;
                    let ifpresentcheck = minResult[i].match(ifpresent);

                    if (!ifpresentcheck) {
                        let blocks = minResult[i].split(",");
                        let finalvalue;
                        let valueToMin = Array();
                        let nonumber = false;
                        for (let n = 0; n < blocks.length; n++) {
                            let pushblock = blocks[n];
                            //console.log(pushblock);
                            let nonumsum = /[#@]{|\%\[|\if\[|\?\[/g;
                            let checknonumsum = blocks[n].match(nonumsum);
                            if (!checknonumsum) {
                                if (isNaN(pushblock)) {
                                    let roll = new Roll(blocks[n]);
                                    await roll.evaluate({ async: true });
                                    pushblock = roll.total;
                                }

                                valueToMin.push(parseInt(pushblock));
                            }
                            else {
                                nonumber = true;
                            }
                        }
                        if (!nonumber) {
                            finalvalue = Math.min.apply(Math, valueToMin);
                            let tochange = "min(" + minResult[i] + ")";
                            expr = expr.replace(tochange, parseInt(finalvalue));
                        }

                        else {
                            sums_are_num = false;
                        }
                    }

                    else {
                        sums_are_num = false;
                    }


                }
            }

            //console.log(expr);
            //console.log(sums_are_num);

            //COUNTIF
            //console.log(expr);
            //var countIfResult = expr.match(/(?<=\bcountE\b\().*?(?=\))/g);
            let cifmatch = /\bcountE\(/g;
            var countIfResultArray;
            var countIfResult = [];

            while (countIfResultArray = cifmatch.exec(expr)) {
                //console.log(maxResultArray.index + ' ' + mrmatch.lastIndex);
                let suba = expr.substring(cifmatch.lastIndex, expr.length);
                let subb = auxMeth.getParenthesString(suba);
                countIfResult.push(subb);
            }
            if (countIfResult != null) {
                //Substitute string for current value        
                for (let i = 0; i < countIfResult.length; i++) {
                    //                let debugname = attpresult[i];


                    let splitter = countIfResult[i].split(";");
                    let comparer = countIfResult[i].replace(splitter[0] + ";", '');
                    let blocks = splitter[0].split(",");
                    let finalvalue = 0;
                    let valueIf = Array();
                    let nonumber = false;

                    for (let n = 0; n < blocks.length; n++) {
                        if (!isNaN(blocks[n])) {
                            valueIf.push(parseInt(blocks[n]));
                        }
                        else {
                            nonumber = true;
                        }

                    }

                    if (!nonumber) {
                        for (let j = 0; j < valueIf.length; j++) {
                            //console.log(valueIf[j] + " " + comparer)
                            if (parseInt(valueIf[j]) == parseInt(comparer))
                                finalvalue += 1;
                        }

                        let tochange = "countE(" + countIfResult[i] + ")";
                        expr = expr.replace(tochange, parseInt(finalvalue));
                    }

                    else {
                        sums_are_num = false;
                    }


                }
            }
            //console.log(expr);

            //COUNTHIGHER
            //var countHighResult = expr.match(/(?<=\bcountH\b\().*?(?=\))/g);
            let chimatch = /\bcountH\(/g;
            var countHighResultArray;
            var countHighResult = [];

            while (countHighResultArray = chimatch.exec(expr)) {
                //console.log(maxResultArray.index + ' ' + mrmatch.lastIndex);
                let suba = expr.substring(chimatch.lastIndex, expr.length);
                let subb = auxMeth.getParenthesString(suba);
                countHighResult.push(subb);
            }
            if (countHighResult != null) {
                //Substitute string for current value        
                for (let i = 0; i < countHighResult.length; i++) {
                    //                let debugname = attpresult[i];


                    let splitter = countHighResult[i].split(";");
                    //let comparer = splitter[1];
                    let comparer = countHighResult[i].replace(splitter[0] + ";", '');
                    let blocks = splitter[0].split(",");
                    let finalvalue = 0;
                    let valueIf = Array();
                    let nonumber = false;
                    for (let n = 0; n < blocks.length; n++) {
                        if (!isNaN(blocks[n])) {
                            valueIf.push(parseInt(blocks[n]));
                        }
                        else {
                            nonumber = true;
                        }
                    }
                    if (!nonumber) {
                        for (let j = 0; j < valueIf.length; j++) {
                            if (valueIf[j] > comparer)
                                finalvalue += 1;
                        }

                        let tochange = "countH(" + countHighResult[i] + ")";
                        expr = expr.replace(tochange, parseInt(finalvalue));
                    }

                    else {
                        sums_are_num = false;
                    }


                }
            }

            //COUNTLOWER
            //var countLowResult = expr.match(/(?<=\bcountL\b\().*?(?=\))/g);
            let clomatch = /\bcountL\(/g;
            var countLowResultArray;
            var countLowResult = [];

            while (countLowResultArray = clomatch.exec(expr)) {
                //console.log(maxResultArray.index + ' ' + mrmatch.lastIndex);
                let suba = expr.substring(clomatch.lastIndex, expr.length);
                let subb = auxMeth.getParenthesString(suba);
                countLowResult.push(subb);
            }

            if (countLowResult != null) {
                //Substitute string for current value        
                for (let i = 0; i < countLowResult.length; i++) {
                    //                let debugname = attpresult[i];


                    let splitter = countLowResult[i].split(";");
                    //let comparer = parseInt(splitter[1]);
                    let comparer = countLowResult[i].replace(splitter[0] + ";", '');
                    let blocks = splitter[0].split(",");
                    let finalvalue = 0;
                    let valueIf = Array();

                    let nonumber = false;
                    for (let n = 0; n < blocks.length; n++) {

                        if (!isNaN(blocks[n])) {
                            valueIf.push(parseInt(blocks[n]));
                        }
                        else {
                            nonumber = true;
                        }
                    }
                    if (!nonumber) {
                        for (let j = 0; j < valueIf.length; j++) {
                            if (valueIf[j] < comparer)
                                finalvalue += 1;
                        }

                        let tochange = "countL(" + countLowResult[i] + ")";
                        expr = expr.replace(tochange, parseInt(finalvalue));
                    }

                    else {
                        sums_are_num = false;
                    }


                }
            }

            //console.log(expr);

            //SUM
        if(!useMathParser){
            //var sumResult = expr.match(/(?<=\bsum\b\().*?(?=\))/g);
            let summatch = /\bsum\(/g;
            var sumResultResultArray;
            var sumResult = [];

            while (sumResultResultArray = summatch.exec(expr)) {
                //console.log(maxResultArray.index + ' ' + mrmatch.lastIndex);
                let suba = expr.substring(summatch.lastIndex, expr.length);
                let subb = auxMeth.getParenthesString(suba);
                sumResult.push(subb);
            }
            if (sumResult != null) {
                //Substitute string for current value        
                for (let i = 0; i < sumResult.length; i++) {
                    //                let debugname = attpresult[i];


                    let splitter = sumResult[i].split(";");
                    let comparer = splitter[1];
                    let blocks = splitter[0].split(",");
                    let finalvalue = 0;
                    let valueIf = Array();
                    let nonumber = false;
                    let nonumsum = /\bif\[|\bmax\(|\bmin\(|\bsum\(|\%\[|\bceil\(|\bfloor\(|\bcount[E|L|H]\(|\?\[/g;
                    let hassubfunctions = sumResult[i].match(nonumsum);

                    if (!hassubfunctions) {
                        for (let n = 0; n < blocks.length; n++) {

                            let checknonumsum = blocks[n].match(nonumsum);
                            //console.log(blocks[n])
                            if ((checknonumsum == null)) {
                                let sumExpr = blocks[n];
                                //console.log(sumExpr);
                                if (isNaN(blocks[n])) {
                                  try{
                                    sumExpr = eval(sumExpr);
                                  }
                                  catch{
                                    nonumber = true;
                                  }
                                }
                                if(!nonumber){
                                  finalvalue += parseInt(sumExpr);
                                }
                            }
                            else {
                                //console.log("nonumber");
                                nonumber = true;
                            }

                        }
                    }
                    else {
                        nonumber = true;
                    }

                    if (!nonumber) {
                        //console.log("replacing")
                        let tochange = "sum(" + sumResult[i] + ")";
                        expr = expr.replace(tochange, parseInt(finalvalue));
                    }

                    else {
                        sums_are_num = false;
                    }


                }
            }
        } 

            //PARSE SCALED AUTO VALUES
            //var scaleresult = expr.match(/(?<=\%\[).*?(?=\])/g);
            let scmatch = /\%\[/g;
            var scaleresultArray;
            var scaleresult = [];

            while (scaleresultArray = scmatch.exec(expr)) {
                //console.log(maxResultArray.index + ' ' + mrmatch.lastIndex);
                let suba = expr.substring(scmatch.lastIndex, expr.length);
                let subb = auxMeth.getBracketsString(suba);
                scaleresult.push(subb);
            }
            //console.log(scaleresult);
            if (scaleresult != null && scaleresult.length > 0) {
                //console.log(expr);
                //Substitute string for current value
                for (let i = scaleresult.length - 1; i >= 0; i--) {
                    let nonvalidscale = /\bif\[|\bmax\(|\bmin\(|\bsum\(|\%\[|\bceil\(|\bfloor\(|\bcount[E|L|H]\(|\?\[/g;
                    let nonvalidscalecheck = scaleresult[i].match(nonvalidscale);
                    //console.log(scaleresult[i]);
                    if (!nonvalidscalecheck) {
                        // ----------------------------------------------------------------
                        // This fix to get Improved handling of ;:, in && broke the parsing, needs more research to get it right
                        //Only split on the last comma (,) before the next scale (:), looking ahead for a parenthesis, number, or math symbol
                        //let limitsregexp = /,(?=\s*[0-9()+\-*.\/]*:)/g;
                        //let limits = scaleresult[i].split(limitsregexp).filter(e => e !== ",");
                        // ----------------------------------------------------------------
                        let limits = scaleresult[i].split(",");

                        
                        //console.log(limits);
                        let value = limits[0];
                        if (isNaN(value) && !value.includes("$") && !value.includes("min") && !value.includes("max")) {
                            let roll = new Roll(limits[0]);
                            try{
                              await roll.evaluate({ async: true });
                              value = roll.total;
                            } catch(err){
                              console.error('autoparser scale | ' + err.message);
                              console.error('autoparser scale | initial expression\n',initialexp);
                              console.error('autoparser scale | failed expression\n',expr);
                            }
                            
                        }

                        let valuemod = 0;

                        let limitArray = [];

                        for (let j = 1; j < limits.length; j++) {
                            // ----------------------------------------------------------------
                            // This fix to get Improved handling of ;:, in && broke the parsing, needs more research to get it right
                            //Only split the first :
                            //let splitterregexp = /(?::)(.*?$)/;
                            //let splitter = limits[j].split(":", 1);
                            //splitter.push(limits[j].match(splitterregexp)[1]);
                            // ----------------------------------------------------------------
                            
                            let splitter = limits[j].split(":");
                            let scale = splitter[0];
                            //console.log(scale);

                            let noncondition = /\bif\[|\bmax\(|\bmin\(|\bsum\(|\%\[|\bfloor\(|\bceil\(|\bcount[E|L|H]\(|\?\[|[\+\-\*\/]/g;
                            let nonconditioncheck = scale.match(noncondition);

                            if (nonconditioncheck) {
                                //console.log("no number");
                                //
                                //                            }
                                //
                                //                            if(isNaN(scale)  && !scale.includes("$") && !scale.includes("min") && !scale.includes("max") ){
                                //if(isNaN(scale) || scale.includes('+')|| scale.includes('-')|| scale.includes('/')|| scale.includes('*')){
                                let newroll = new Roll(scale);
                                await newroll.evaluate({ async: true });
                                //expr = expr.replace(scale,newroll.total);
                                scale = newroll.total;

                            }

                            let limitEl = {};
                            limitEl.scale = scale;
                            limitEl.value = splitter[1];
                            await limitArray.push(limitEl);
                        }

                        await limitArray.sort(function (x, y) {
                            return x.scale - y.scale;
                        });
                        //console.log(limitArray);
                        //console.log(value);
                        valuemod = limitArray[0].value;

                        for (let k = 0; k < limitArray.length; k++) {
                            let checker = limitArray[k];
                            let checkscale = Number(checker.scale);
                            //console.log(checkscale);
                            if (value >= checkscale) {
                                valuemod = checker.value;
                            }
                        }
                        //console.log(valuemod);
                        if (isNaN(valuemod)) {
                            //console.log(valuemod);
                            let nonum = /[#@]{|\%\[|\if\[/g;
                            let checknonum = valuemod.match(nonum);

                            if (checknonum != null) {
                                sums_are_num = false;
                            }
                        }


                        let attname = "%[" + scaleresult[i] + "]";
                        //console.log(attname);
                        expr = expr.replace(attname, valuemod);

                        //console.log(expr);
                    }
                    else {
                        sums_are_num = false;
                    }


                }
                //console.log(expr);

            }

            //console.log(expr);

            //PARSE CONDITIONAL
            //var ifresult = expr.match(/(?<=\if\[).*?(?=\])/g);
            var ifmatch = /\if\[/g;
            var ifresultArray;
            var ifresult = [];

            while (ifresultArray = ifmatch.exec(expr)) {
                //console.log(maxResultArray.index + ' ' + mrmatch.lastIndex);
                let suba = expr.substring(ifmatch.lastIndex, expr.length);
                let subb = auxMeth.getBracketsString(suba);
                ifresult.push(subb);
            }
            if (ifresult != null) {

                //Substitute string for current value
                for (let i = ifresult.length - 1; i >= 0; i--) {

                    let nonvalidif = /\if\[|\bmax\(|\bmin\(|\bsum\(|\%\[|\bceil\(|\bfloor\(|\bcount[E|L|H]\(|\?\[/g;
                    let nonvalidifcheck = ifresult[i].match(nonvalidif);

                    if (!nonvalidifcheck) {
                        var nonumber = false;
                        let limits = ifresult[i].split(",");
                        let general_cond = limits[0];
                        let truevalue = limits[1];
                        let falsevalue = limits[2];
                        let dontparse = false;
                        falsevalue = falsevalue.replace("ELSE ", "");
                        let checknonumcond;
                        let nonumcond;

                        let finalvalue = falsevalue;

                        var findOR = general_cond.search(" OR ");
                        var findAND = general_cond.search(" AND ");

                        let orconditions;
                        let andconditions;

                        if (findOR != -1) {
                            //console.log("OR");
                            orconditions = general_cond.split(" OR ");
                            for (let j = 0; j < orconditions.length; j++) {
                                let conditions = orconditions[j].split(":");
                                let thiscondition = conditions[0];
                                let checker = conditions[1];

                                if (thiscondition === "true" || thiscondition === "false") {
                                    thiscondition = (thiscondition === "true");
                                }

                                if (checker === "true" || checker === "false") {
                                    checker = (checker === "true");
                                }

                                if (isNaN(checker)) {
                                    try {
                                        let newroll = new Roll(checker);
                                        await newroll.evaluate({ async: true });
                                        checker = newroll.total;
                                    }
                                    catch (err) {

                                    }
                                }

                                if (isNaN(thiscondition)) {
                                    nonumcond = /\+|\-|\\|\*/g;
                                    checknonumcond = thiscondition.match(nonumcond);
                                }


                                if (isNaN(thiscondition) || checknonumcond != null) {
                                    try {
                                        let newroll = new Roll(thiscondition);
                                        await newroll.evaluate({ async: true });
                                        thiscondition = newroll.total;
                                    }
                                    catch (err) {

                                    }
                                }

                                if (thiscondition == checker)
                                    finalvalue = truevalue;
                            }
                        }

                        else if (findAND != -1) {
                            //console.log("AND");
                            andconditions = general_cond.split(" AND ");
                            finalvalue = truevalue;
                            for (let j = 0; j < andconditions.length; j++) {
                                let conditions = andconditions[j].split(":");
                                let thiscondition = conditions[0];
                                let checker = conditions[1];

                                if (thiscondition === "true" || thiscondition === "false") {
                                    thiscondition = (thiscondition === "true");
                                }

                                if (checker === "true" || checker === "false") {
                                    checker = (checker === "true");
                                }

                                if (isNaN(checker)) {
                                    try {
                                        let newroll = new Roll(checker);
                                        await newroll.evaluate({ async: true });
                                        checker = newroll.total;
                                    }
                                    catch (err) {
                                        dontparse = true;

                                    }
                                }

                                if (isNaN(thiscondition)) {
                                    nonumcond = /\+|\-|\\|\*/g;
                                    checknonumcond = thiscondition.match(nonumcond);
                                }

                                if (isNaN(thiscondition) || checknonumcond != null) {
                                    try {
                                        let newroll = new Roll(thiscondition);
                                        await newroll.evaluate({ async: true });
                                        thiscondition = newroll.total;
                                    }
                                    catch (err) {
                                        dontparse = true;
                                    }
                                }

                                //console.log(thiscondition + " " + checker);

                                if (thiscondition != checker)
                                    finalvalue = falsevalue;
                            }
                        }

                        else {
                            //console.log("NONE");

                            let conditions = general_cond.split(":");
                            let thiscondition = conditions[0];
                            let checker = conditions[1];
                            //console.log(conditions);
                            //console.log(checker);

                            if (thiscondition === "true" || thiscondition === "false") {
                                thiscondition = (thiscondition === "true");
                            }

                            if (checker === "true" || checker === "false") {
                                checker = (checker === "true");
                            }

                            //console.log(thiscondition + " " + checker);

                            if (isNaN(checker)) {
                                try {
                                    //                                    let newroll = new Roll(checker);
                                    //                                    await newroll.evaluate({async: true});
                                    //                                    checker = newroll.total;

                                    checker = eval(checker);
                                }
                                catch (err) {
                                    dontparse = true;
                                }
                            }

                            if (isNaN(thiscondition)) {
                                nonumcond = /\+|\-|\\|\*/g;
                                checknonumcond = thiscondition.match(nonumcond);
                            }
                            //console.log(thiscondition + " " + checker);

                            if (isNaN(thiscondition) || checknonumcond != null) {
                                try {
                                    //                                    let newroll = new Roll(thiscondition);
                                    //                                    await newroll.evaluate({async: true});
                                    //                                    thiscondition = newroll.total;
                                    thiscondition = eval(thiscondition);
                                    checker = eval(checker);
                                }
                                catch (err) {
                                    dontparse = true;
                                }
                            }

                            //console.log(thiscondition + " " + checker);
                            try{
                              if (thiscondition.toString() === checker.toString()) {
                                finalvalue = truevalue;
                              }
                            }
                            catch(err){
                              console.error('autoparser IF | \n' + err.message);
                              console.error('autoparser IF | initial expression\n',initialexp);
                              console.error('autoparser IF | failed expression\n',expr);
                            }
                        }

                        //console.log(finalvalue);

                        let attname = "if[" + ifresult[i] + "]";

                        let nonum = /[#@]{|\%\[|\if\[|\?\[/g;
                        let checknonumtrue = falsevalue.match(nonum);
                        let checknonumfalse = truevalue.match(nonum);

                        if (checknonumtrue != null || checknonumfalse != null) {
                            sums_are_num = false;
                        }

                        else {
                            expr = expr.replace(attname, finalvalue);
                        }
                    }

                    else {
                        sums_are_num = false;
                    }


                }

            }

            //console.log(expr);
            //MATH and ARITHMETIC CORRECTIONS
            let plusmin = /\+\-/g;
            expr = expr.replace(plusmin, "-");
            let minmin = /\-\-/g;
            expr = expr.replace(minmin, "+");
            let commazero = /\,\s\-\b0|\,\-\b0/g;
            expr = expr.replace(commazero, ",0");
            // let pluszero = /\+\s\b0|\+\b0/g;
            // expr = expr.replace(pluszero, "");
            // let minuszero = /\-\s\b0|\-\b0/g;
            // expr = expr.replace(minuszero, "");
            //console.log(expr);

            let zeroexplode = /0x0/g;
            expr = expr.replace(zeroexplode, "0");

            safety_break += 1;

        }

        //console.log(expr);
        //console.log(exprmode);

        //console.log("finished parsed")
        //console.log(expr);

        if (expr.charAt(0) == "|") {
            exprmode = true;
            expr = expr.replace("|", "");
        }

        toreturn = expr;

        if (isNaN(expr)) {
            //console.log("nonumber");
            if (!exprmode) {
                //console.log("exprmode=false")
                try {
                    let final = new Roll(expr);
                    await final.evaluate({ async: true });

                    //final.roll();
                    //console.log(final);

                    if (isNaN(final.total) || final.total == null || final.total === false) {
                        toreturn = expr;
                    }
                    else {
                        toreturn = final.total;
                    }

                    //console.log(toreturn);
                }
                catch (err) {
                    //console.log("Following Roll expression can not parse to number. String returned");
                    //console.log(expr);
                    //ui.notifications.warn("Roll expression can not parse to number");
                    toreturn = expr;
                }

            }

            else {

                //PARSE BOOL
                if (expr == "false") {
                    expr = false;
                }

                if (expr == "true") {
                    expr = true;
                }

                toreturn = expr;
            }
        }
        else {
            if (exprmode)
                toreturn = expr;
        }
        //console.log('Sandbox | autoParser | initialexp:[' + initialexp +'] toreturn:[' + toreturn + ']');
        // look for number and decimals

        if (typeof toreturn == 'number') {
            const initialvalue = toreturn;
            // check for to many decimals
            const numberAsString = toreturn.toString();
            let numberofdecimals = 0;
            // String Contains Decimal
            if (numberAsString.includes('.')) {
                numberofdecimals = numberAsString.split('.')[1].length;
            }

            if (numberofdecimals > 2) {
                //parseFloat(n.toFixed(4));
                toreturn = parseFloat(toreturn.toFixed(3));
                //console.log('Sandbox | autoParser | fixdecimals ' + initialvalue + ' -> '+ toreturn + ' | ' + typeof toreturn);
            }

        }

        
        
        return toreturn;
    }
  static async getListPropertyFirstOption(property,actorattributes=null, citemattributes=null){
    let result='';
    let list=await auxMeth.getListPropertyOptions(property,actorattributes, citemattributes);
    if(list.length>0){      
      let options=list.split('|');
      result = options[0];
    }
    return result;  
  }
  // returns pipe-separated string
  static async getListPropertyOptions(property,actorattributes=null, citemattributes=null){
    let addList='';
    let rawlist = property.system.listoptions;

    if(rawlist.length>0){ 
      rawlist=rawlist.replaceAll(',','|');
      addList +=rawlist;
    }
    // check for listauto
    if(property.system.listoptionsAutoUse){
      let autoList=property.system.listoptionsAuto;
      autoList = await auxMeth.autoParser(autoList, actorattributes, citemattributes, false); 
      autoList=autoList.replaceAll(',','|');
      autoList = await game.system.api._extractAPIFunctions(autoList,actorattributes, citemattributes, false); 
      if(autoList.length>0){                                                                      
        if(addList.length>0){
          addList +='|' + autoList; 
        } else{
          addList +=autoList; 
        }                                                    
      } 
    }
    // check if to use lookup
    if(property.system.listoptionsLookupUse){
      let lookupKey=property.system.listoptionsLookupKey;
      let returnColumn=property.system.listoptionsLookupColumn;
      let lookups=await game.system.api.lookupList(lookupKey,returnColumn,'|');
      if(lookups.length>0){
        if(addList.length>0){
          addList +='|' + lookups; 
        } else{
          addList +=lookups; 
        }
      }                  
    }
    // get rid of duplicates by using Set
    addList = Array.from(new Set(addList.split('|'))).join('|');
    
    return addList;
  }  
    
  static async  useAPIFunction(functionName,expr){
    let replaceValue;
    let blocks = expr.split(";");
    let args = [];
    for (let a = 0; a < blocks.length; a++) {
      let argument = await auxMeth.autoParser(blocks[a], null, null, false);
      //let argument=blocks[a];
      args.push(argument);
    }
    // get the number of required arguments for function
    let requiredArgumentsCount=game.system.api._APIFunctionRequiredArguments(functionName);
    
    if(args.length<requiredArgumentsCount){
      ui.notifications.warn("Function ["+ functionName +"] requires minimum " + requiredArgumentsCount +" arguments");
      return null;
    }
    
    switch (args.length) {
      case 0:
        replaceValue = game.system.api[functionName]();
        break;
      case 1:
        replaceValue = game.system.api[functionName](args[0]);
        break;
      case 2:
        replaceValue = game.system.api[functionName](args[0], args[1]);
        break;
      case 3:
        replaceValue =await  game.system.api[functionName](args[0], args[1], args[2]);
        break;
      case 4:
        replaceValue = game.system.api[functionName](args[0], args[1], args[2], args[3]);
        break;
      case 5:
        replaceValue = game.system.api[functionName](args[0], args[1], args[2], args[3], args[4]);
        break;
      case 6:
        replaceValue = game.system.api[functionName](args[0], args[1], args[2], args[3], args[4],args[5]);
        break;
      case 7:
        replaceValue = game.system.api[functionName](args[0], args[1], args[2], args[3], args[4],args[5],args[6]);
        break; 
      case 8:
        replaceValue = game.system.api[functionName](args[0], args[1], args[2], args[3], args[4],args[5],args[6],args[7]);
        break;
      case 9:
        replaceValue = game.system.api[functionName](args[0], args[1], args[2], args[3], args[4],args[5],args[6],args[7],args[8]);
        break;
      case 10:
        replaceValue = game.system.api[functionName](args[0], args[1], args[2], args[3], args[4],args[5],args[6],args[7],args[8],args[9]);
        break;
      default:
        ui.notifications.error("Out of depth in  function useAPIFunction for function ["+ functionName +"] requires minimum " + requiredArgumentsCount +" arguments");
        break;
    }
    return replaceValue
    }

    static getParenthesString(expr) {
        let openpar = 0;
        let closedpar = -1;
        let parsed = false;
        let finalexpr = "";

        for (let i = 0; i < expr.length; i++) {
            if (!parsed) {
                if (expr.charAt(i) === '(')
                    openpar += 1;
                if (expr.charAt(i) === ')')
                    closedpar += 1;

                if (openpar == closedpar) {
                    parsed = true;
                }
                else {
                    finalexpr += expr.charAt(i);
                }

            }

        }

        return finalexpr;
    }

    static getBracketsString(expr) {
        let openpar = 0;
        let closedpar = -1;
        let parsed = false;
        let finalexpr = "";

        for (let i = 0; i < expr.length; i++) {
            if (!parsed) {
                if (expr.charAt(i) === '[')
                    openpar += 1;
                if (expr.charAt(i) === ']')
                    closedpar += 1;

                if (openpar == closedpar) {
                    parsed = true;
                }
                else {
                    finalexpr += expr.charAt(i);
                }

            }

        }

        return finalexpr;
    }

    static dynamicSort(property) {
        var sortOrder = 1;
        if (property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a, b) {
            /* next line works with strings and numbers, 
            * and you may want to customize it to your needs
            */
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        }
    }

    static aTdynamicSort(property, datatype) {
        var sortOrder = 1;
        if (property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a, b) {
            /* next line works with strings and numbers, 
            * and you may want to customize it to your needs
            */
            if (hasProperty(a.attributes[property], "value")) {

                let valA = a.attributes[property].value;
                let valB = b.attributes[property].value;

                if (datatype == "simplenumeric") {
                    valA = Number(valA);
                    valB = Number(valB);
                }

                var result = (valA < valB) ? -1 : (valA > valB) ? 1 : 0;
                return result * sortOrder;
            }

        }
    }

    static async rollToMenu(html = null) {

        if (!game.settings.get("sandbox", "showLastRoll"))
            return;

        //console.log("rolling to menu");
        let hotbar = await document.getElementsByClassName("dcroll-bar");

        if (hotbar[0] == null)
            return;

        //hotbar[0].className = "flexblock-left-nopad";

        let prevmenu = $(hotbar).find(".roll-menu");

        if (prevmenu != null)
            prevmenu.remove();

        let tester = document.createElement("DIV");

        if (html == null) {
            let lastmessage;
            let found = false;

            for (let i = game.messages.size - 1; i >= 0; i--) {

                let amessage = game.messages.contents[i];
                if (!found) {
                    // [3].value.flags.core.initiativeRoll
                    //let isInitiativeRoll=amessage?.flags?.core?.initiativeRoll ?? false;
                    if (amessage.content.includes("roll-template")  && !amessage.content.includes("sb-do-not-show-in-lastroll")) {
                        found = true;
                        lastmessage = amessage;
                        break;
                    }

                }

            }


            if (lastmessage == null)
                return;
            let msgContent = lastmessage.content;

            tester.innerHTML = msgContent;
        }

        else {
            tester.innerHTML = html;
        }

        let trashcan = await tester.getElementsByClassName("roll-delete-button");
        if (trashcan != null)
            if (trashcan.style != null)
                trashcan[0].style.display = "none";

        let rollextra = tester.querySelector(".roll-extra");
        if(rollextra)
          rollextra.style.display = "none";


        let rollMenu = document.createElement("DIV");
        rollMenu.className = "roll-menu";
        rollMenu.innerHTML = tester.innerHTML;
        //console.log("appending");

        hotbar[0].appendChild(rollMenu);
    }

    static sb_two_col_card(left, right, type = 'table') {
        let htmltable = `
        <div class="sb-two-col-card-wrapper" >
      <div class="sb-two-col-card-image-in-` + type + `">` + left + `</div>  
      <div class="sb-two-col-card-name">`+ right + `</div>
    </div>
        `;
        return htmltable;
    }


    static showCIitemInfo(cItem = null) {
        if (cItem != null) {
            let item_description = cItem.system.description;
            let item_name = cItem.name;
            let item_img = cItem.img;
            let options = {
                show: {
                    name: true,
                    image: true,
                    description: true
                },
                id: cItem.id,
                type: 'Item',
                class: 'sbe-info-form-show-all',
                reshowable: true,
                name: item_name,
                image: item_img,
                description: item_description
            };
            let f = new SandboxInfoForm(options).render(true, { focus: true });
        }

    };


    static async setcItemsKey() {
        console.log("Sandbox | setcItemsKey | Started");
        let gamecItems = game.items.filter(y => y.type == "cItem");
        for (let i = 0; i < gamecItems.length; i++) {
            const mycitem = gamecItems[i];
            if (mycitem.system.ciKey == "") {
                console.log("Sandbox | setcItemsKey | Updating ciKey for cItem " + mycitem.name);
                await mycitem.update({ "system.ciKey": mycitem.id });
            }
        }
        console.log("Sandbox | setcItemsKey | Completed");
    }

    static async setcItemsNameAttribute() {
        console.log("Sandbox | setcItemsNameAttribute | Started");
        let gamecItems = game.items.filter(y => y.type == "cItem");
        for (let i = 0; i < gamecItems.length; i++) {
            const mycitem = gamecItems[i];
            if (mycitem.name != mycitem.system.attributes.name) {
                console.log("Sandbox | setcItemsKey | Updating attribute name for cItem " + mycitem.name);
                await mycitem.update({ "system.attributes.name": mycitem.name });
            }
        }
        console.log("Sandbox | setcItemsNameAttribute | Completed");
    }


    static async setOriginalid() {
        // for any actor or item that has not the flag originalId set
        console.log("Sandbox | setOriginalid | Started");
        let gameActors = game.actors.filter(y => !y.flags.hasOwnProperty('sandbox') || y.flags.sandbox.originalId == null);
        for (let i = 0; i < gameActors.length; i++) {
            const myactor = gameActors[i];
            console.log("Sandbox | setOriginalid | Updating originalId for actor " + myactor.name);
            await myactor.setFlag('sandbox', 'originalId', myactor.id)
        }
        let gameItems = game.items.filter(y => !y.flags.hasOwnProperty('sandbox') || y.flags.sandbox.originalId == null);
        for (let i = 0; i < gameItems.length; i++) {
            const myitem = gameItems[i];
            console.log("Sandbox | setOriginalid | Updating originalId for item " + myitem.name);
            await myitem.setFlag('sandbox', 'originalId', myitem.id)
        }

        console.log("Sandbox | setOriginalid | Completed");
    }


    static async checkConsistency() {
        console.log("Sandbox | checkConsistency | Started");
        await this.setOriginalid();
        await this.setcItemsKey();
        await this.setcItemsNameAttribute();
        console.log("Sandbox | checkConsistency | Checking cItems with ITEMS mod");
        let gamecItems = game.items.filter(y => y.type == "cItem");
        let toupdate = false;
        for (let i = 0; i < gamecItems.length; i++) {
            const mycitem = gamecItems[i];
            const mycitemmods = mycitem.system.mods;
            for (let j = 0; j < mycitemmods.length; j++) {
                let mymod = mycitemmods[j];
                //setProperty(mymod, "citem", mycitem.data.id);
                // if (!hasProperty(mymod, "index")) {
                //     setProperty(mymod, "index", j);
                //     toupdate = true;
                // }

                if (mymod.items.length > 0) {
                    for (let h = 0; h < mymod.items.length; h++) {
                        if (mymod.items[h].ciKey == null) {
                            let toaddotem = await auxMeth.getcItem(mymod.items[h].id, mymod.items[h].ciKey);
                            if (toaddotem) {
                                toupdate = true;
                                console.log("Sandbox | checkConsistency | Adding ITEM mod ciKey for " + mycitem.name);
                                mymod.items[h].ciKey = toaddotem.system.ciKey;
                            }

                        }

                    }
                }

            }
            if (toupdate) {
                //console.log("updating consistency");
                await mycitem.update({ "system": mycitem.system });
            }

        }

        // let gameactors = game.actors;
        // for (let i = 0; i < gameactors.entities.length; i++) {

        //     const myactor = gameactors.entities[i];
        //     const myactorcitems = myactor.data.data.citems;
        //     //console.log("checking actor " + myactor.name);
        //     //console.log(myactorcitems);
        //     if (!myactor.data.data.istemplate) {
        //         if (myactorcitems != null) {
        //             for (let j = myactorcitems.length - 1; j >= 0; j--) {
        //                 let mycitem = myactorcitems[j];
        //                 //console.log(mycitem);
        //                 if (mycitem != null) {
        //                     //let templatecItem = game.items.get(mycitem.id);
        //                     let templatecItem = await auxMeth.getcItem(mycitem.id, mycitem.iKey);
        //                     //console.log(templatecItem);

        //                     if (templatecItem != null) {
        //                         let isconsistent = true;
        //                         let mymods = mycitem.mods;
        //                         if (mymods != null) {
        //                             for (let r = 0; r < mymods.length; r++) {
        //                                 if (mycitem.id != mymods[r].citem)
        //                                     mymods[r].citem = mycitem.id;
        //                                 if (!hasProperty(mymods[r], "index"))
        //                                     setProperty(mymods[r], "index", 0);

        //                                 if (templatecItem.data.data.mods[mymods[r].index] == null) {
        //                                     //console.log(templatecItem.name);
        //                                     //isconsistent = false;
        //                                 }

        //                                 else {
        //                                     if (mymods[r].expr != templatecItem.data.data.mods[mymods[r].index].value)
        //                                         isconsistent = false;
        //                                 }


        //                             }
        //                         }

        //                         //MOD change consistency checker
        //                         if (!isconsistent) {
        //                             console.log(templatecItem.name + " is fucked in " + myactor.name);
        //                             let newData = await myactor.deletecItem(templatecItem.id, true);
        //                             await this.actor.update({ "data": newData.data });
        //                             let subitems = await myactor.addcItem(templatecItem);
        //                             if (subitems)
        //                                 this.updateSubItems(false, subitems);
        //                             //await myactor.update(myactor.data);
        //                         }

        //                     }

        //                     else {
        //                         delete myactorcitems[j];
        //                     }

        //                 }

        //                 else {
        //                     //myactorcitems.split(myactorcitems[j],1);
        //                     delete myactorcitems[j];
        //                 }


        //             }
        //         }

        //         try {
        //             await myactor.update({ "data": myactor.data.data }, { stopit: true });
        //         }
        //         catch (err) {
        //             ui.notifications.warn("Character " + myactor.name + " has consistency problems");
        //         }
        //     }


        // }
        console.log("Sandbox | checkConsistency | Completed");
    }

    static invertColor(hex, bw) {
        if (hex.indexOf('#') === 0) {
            hex = hex.slice(1);
        }
        // convert 3-digit hex to 6-digits.
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        if (hex.length !== 6) {
            throw new Error('Invalid HEX color.');
        }
        var r = parseInt(hex.slice(0, 2), 16),
            g = parseInt(hex.slice(2, 4), 16),
            b = parseInt(hex.slice(4, 6), 16);
        if (bw) {
            // https://stackoverflow.com/a/3943023/112731
            return (r * 0.299 + g * 0.587 + b * 0.114) > 186
                ? '#000000'
                : '#FFFFFF';
        }
        // invert color components
        r = (255 - r).toString(16);
        g = (255 - g).toString(16);
        b = (255 - b).toString(16);
        // pad each with zeros and return
        return "#" + this.padZero(r) + this.padZero(g) + this.padZero(b);
    }
    static padZero(str, len) {
        len = len || 2;
        var zeros = new Array(len).join('0');
        return (zeros + str).slice(-len);
    }


    //You can use the above as el = replaceHtml(el, newHtml) instead of el.innerHTML = newHtml.
    static replaceHtml(el, html,appendExisting=false) {
	let oldEl = typeof el === "string" ? document.getElementById(el) : el;
        if(appendExisting){
          html=oldEl.innerHTML + html;
        }
	/*@cc_on // Pure innerHTML is slightly faster in IE
		oldEl.innerHTML = html;
		return oldEl;
	@*/
	let newEl = oldEl.cloneNode(false);
	newEl.innerHTML = html;
        if (oldEl.parentNode!=null){
          oldEl.parentNode.replaceChild(newEl, oldEl);
          
        }
	/* Since we just removed the old element from the DOM, return a reference
	to the new element, which can be used to restore variable references. */
	return newEl;
    };
    
    static addOptionsToSelectFromList(el,strOptions,value=null,strSeparator=",",appendExisting=false){
      const inputArray=strOptions.split(strSeparator);
      let newHtml=``;
      let selectedValue=null;
      // remove duplicates
      const optionsArray=[...new Set(inputArray)];
//      // sort it
//      optionsArray.sort(function (a, b) {
//        return a.toLowerCase().localeCompare(b.toLowerCase());
//      });

      if(value!=null){        
        // make sure that the list contains the selected value
        for (let i = 0; i < optionsArray.length; i++) {
          if(value==optionsArray[i]){
            // found it
            selectedValue=value;
            break;
          }
        }
        // if not found use the first entry
        if(selectedValue==null){
          selectedValue==optionsArray[0];
        }
      }
      for (let i = 0; i < optionsArray.length; i++) {        
        if(selectedValue!=null && selectedValue==optionsArray[i]){         
          newHtml += `<option value="${optionsArray[i]}" selected >${optionsArray[i]}</option>`;
        } else {
          newHtml += `<option value="${optionsArray[i]}" >${optionsArray[i]}</option>`;
        }
      }
      el = auxMeth.replaceHtml(el, newHtml,appendExisting);
      return el;
    }
    


    static async clientRefresh(options) {
        if (options.askForReload) {
            let answer = await sb_custom_dialog_confirm(game.i18n.localize("SETTINGS.ReloadPromptTitle"), game.i18n.localize("SETTINGS.ReloadPromptBody"), game.i18n.localize("Yes"), game.i18n.localize("No"))
            if (answer) {
                // reload for settings to take effect
                location.reload();
            }
        }
        if (options.requiresHardRender || options.requiresRender) {
            // check all open windows
            let win;
            let settingWin = null;
            for (let app in ui.windows) {
                // if actor or item sheet
                if (ui.windows[app].options.baseApplication == 'ActorSheet' || ui.windows[app].options.baseApplication == 'ItemSheet') {
                    win = ui.windows[app];
                    if (options.requiresHardRender) {
                        await win.close();
                        await win._render(true);
                    } else if (options.requiresRender) {
                        win.render(true);
                    }
                } else if (ui.windows[app].options.id == 'system-settings-form') {
                    settingWin = ui.windows[app];
                }
            }
            if (settingWin != null) {
                settingWin.bringToTop();
            }
        }
    }
}

