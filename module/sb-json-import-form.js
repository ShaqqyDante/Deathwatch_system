import { sb_custom_dialog_prompt,
         sb_custom_dialog_confirm,
       sb_custom_dialog_duplicate_handling} from "./sb-custom-dialogs.js"; 
import { GameFolderPicker } from "./game-folder-picker-form.js";
const _title="Sandbox JSON Import";
export class SandboxJSONImportForm extends FormApplication {
  
  
  constructor(options) {
    super();
  }
  
  static initialize() {
    
    console.log('Initialized SandboxJSONImportForm' );
  }   
    
  static get defaultOptions() {
    const defaults = super.defaultOptions;  
    const overrides = {
      height: 0,
      width:0,
      id: 'sandbox-json-import-form',
      template: `systems/sandbox/templates/sb-json-import-form.hbs`,
      title: _title,
      userId: game.userId,
      closeOnSubmit: false, // do not close when submitted
      submitOnChange: false, // submit when any input changes 
      resizable:true
    };  
    const mergedOptions = foundry.utils.mergeObject(defaults, overrides);    
    return mergedOptions;
  }  
  
  activateListeners(html) {
    super.activateListeners(html);
    html.find('#sb-import-btn-browse-importfile').click(this._onBrowseForImportFile.bind(this)); 
    html.find('#sb-import-btn-browse-items-target-folder').click(this._onBrowseForItemsTarget.bind(this));
    html.find('#sb-import-btn-browse-actors-target-folder').click(this._onBrowseForActorsTarget.bind(this));
    html.find('#sb-import-btn-run').click(this._onRunImport.bind(this)); 
    html.find('#sb-import-btn-close').click(this._onCloseImportDialog.bind(this)); 
        
  }
  async _updateObject(event, formData) {
    const expandedData = foundry.utils.expandObject(formData);
    //console.log(expandedData);

  }
  _onCloseImportDialog(event) {
    this.close();
  }
  
  async _onRunImport(event) {
    let importOptions={file:null,itemsTarget:null,actorsTarget:null,duplicateHandling:null}
    // get and check inputs
    let importFile=document.getElementById('sb-import-importfile');
    
    if (importFile==null || importFile.value==''){
      // warn user and abort
      await sb_custom_dialog_prompt(game.i18n.localize("Warning"),game.i18n.localize("SANDBOX.ImportJSONInvalidFile"),game.i18n.localize("Ok"),'Warning');
      return 0;
    }
    importOptions.file=importFile.value;
    
    let itemsTarget=document.getElementById('sb-import-items-target-folder');
    if(itemsTarget!=null && itemsTarget.value!=''){
      importOptions.itemsTarget=itemsTarget.getAttribute("data-folderid");
      if(importOptions.itemsTarget=='') importOptions.itemsTarget=null;
    }
    let actorsTarget=document.getElementById('sb-import-actors-target-folder');
    if(actorsTarget!=null && actorsTarget.value!=''){      
      importOptions.actorsTarget=actorsTarget.getAttribute("data-folderid");
      if(importOptions.actorsTarget=='') importOptions.actorsTarget=null;
    }
    
    let duplicateHandling= document.querySelector("input[type='radio'][name='sb-import-duplicate-handling']:checked");
    if(duplicateHandling!=null){
      importOptions.duplicateHandling=duplicateHandling.value;
    }
    console.log(importOptions)
    
    // ask user to proceed
    let prompttitle =game.i18n.format("SANDBOX.confirmStartImportPromptTitle",{});
    let promptbody='<h4>' + game.i18n.localize("AreYouSure") +'</h4>';        
    promptbody   +='<p>' + game.i18n.format("SANDBOX.confirmStartImportPromptBody",{}) +'</p>';        
    let answer=await sb_custom_dialog_confirm(prompttitle,promptbody,game.i18n.localize("Yes"),game.i18n.localize("No"));
    if(!answer){
      return 0;
    }
    
    // disable the close buttomn
    
    // run the import with inputs
    let importResult=await this._RunImport(importOptions);
    // inform user of result
    if (importResult){
      await sb_custom_dialog_prompt(game.i18n.localize("Information"),game.i18n.localize("SANDBOX.ImportSuccesfullBody"),game.i18n.localize("Ok"),'Information');
      // close import dialog
      this.close();
      
    } else {  
      await sb_custom_dialog_prompt(game.i18n.localize("Warning"),game.i18n.localize("SANDBOX.ImportFailedBody"),game.i18n.localize("Ok"),'Warning');
    }    
    
  } 
  
  async _RunImport(importOptions){
    console.log('Sandbox | Import started');
    console.log(importOptions)
    let importItemFolders=await importFolders(importOptions.file,importOptions.itemsTarget,"Item")
    console.log('importItemFolders',importItemFolders)
    let importActorFolders=await importFolders(importOptions.file,importOptions.actorsTarget,"Actor")
    console.log('importActorFolders',importActorFolders)
    
    let importResult=true;
    
    console.log('Sandbox | Import completed');
    return importResult
  }
  
  async _onBrowseForImportFile() {
    const inputtextid = 'sb-import-importfile'
    let inputtext = document.getElementById(inputtextid);
    let currentinput = '';
    if (inputtext.value.length == 0) {
      currentinput = `worlds/${game.world.id}`;
    } else {
      currentinput = inputtext.value;
    }
    let fp = await new FilePicker({
      current: currentinput,
      callback: (url, fp) => {
        if (inputtext != null) {
          inputtext.value = url;          
        }
      }
    });
    fp.type = "json";    
    fp.extensions = [".json"];
    fp.render(true);
  }
  
  async _onBrowseForItemsTarget(){    
    this. _onBrowseForGameFolder('sb-import-items-target-folder','Item')
  }
  
  async _onBrowseForActorsTarget(){
    this. _onBrowseForGameFolder('sb-import-actors-target-folder','Actor')
  }
  async _onBrowseForGameFolder(inputElementID,folderType){               
    let inputElement = document.getElementById(inputElementID);    
    let current_id = inputElement.getAttribute("data-folderid");;
    if (current_id.length == 0) {
      current_id = null;    
    }
    let fp = new GameFolderPicker({
      current_id: current_id,
      callback: (folder, fp) => {
        if (inputElement != null && folder!=null) {
          inputElement.value = folder.name;   
          inputElement.setAttribute("data-folderid", folder.id);
          inputElement.setAttribute("data-folderfolder", folder.folder);
        }
      }
    });
    fp.type = folderType;        
    fp.render(true);
  }
  
  

}

async function importFolders(importFilePath,targetFolderID=null,folderType='Item') { 
  console.log('importFolders | Importing ' + folderType + ' folders from ' + importFilePath)
  const response = await fetch(importFilePath);
  const importedPack = await response.json();
  //const actors = importedPack.actors;
  //const items = importedPack.items;
  const folders = importedPack.folders.filter(y=> y.type==folderType);  
  //console.clear()
  let targetFolder=null;
  if(targetFolderID==null){    
    // no target specified, assume root
    // create the fake target folder
    targetFolder={name:'TARGETFOLDER',_id:null,newid:'TARGETFOLDER',folder:null,type:folderType,isTargetFolder:true};
  } else {
    // get the target folder from game    
    let gameFolder = game.folders.find(y=>y.id==targetFolderID && y.type==folderType)
    if (gameFolder == null){
      // not found
      console.error('importFolders | Target folder with ID: '+ targetFolderID +' not found, aborting');
      return 0;
    } else {
      targetFolder={name:gameFolder.name,_id:gameFolder._id,newid:gameFolder._id,folder:gameFolder.folder,type:folderType,isTargetFolder:true};
    }    
  }    
  // in order to use this pattern to build a tree, only one node(root node) may have a null parent 
  // update all nulls to point to TARGETFOLDER  
  folders.forEach((el) => {
    if(el.folder==null){
      el.originalFolder=el.folder;
      el.folder=targetFolder.newid;      
    }
    el.isTargetFolder=false;
  });
  // add the target
  folders.push(targetFolder)
  //console.log(folders)
  // create mapping for location
  const idMapping = folders.reduce((acc, el, i) => {
    acc[el._id] = i;
    return acc;
  }, {});
  
  //console.log(idMapping)
  // create tree
  let root=null;
  folders.forEach((el) => {
    // Handle the root element
    if (el.folder == null) {      
      root = el;
      return;
    }
    // Use our mapping to locate the parent element in our data array
    const parentEl = folders[idMapping[el.folder]];
    if(parentEl!=null){
      // Add our current el to its parent's `children` array
      parentEl.children = [...(parentEl.children || []), el];
    } else {
      targetFolder.children = [...(targetFolder.children || []), el];
    }
  });
  // if no root(node with folder null) is found, use the targetfolder
  if(root==null){
    root=targetFolder;
  }
  // now root contains the folder structure
  console.log('show root')
  console.log(root);
  //console.log('now traverse tree')
  
  //await createFolders(targetFolder,root,folders)  
  console.log('importFolders | Import completed for ' + folderType + ' folders from ' + importFilePath)
  return folders;
}

async function createFolders(targetFolder,folder,updatedFolders,count=0) {
  console.log('createFolders | Processing folder ' + folder.name + '['+ folder._id +'] in folder ['+folder.folder+']')
  if(count>30){
    console.warn('createFolders | Stoping cause Count:' + count)
    return false
  }
  // check if folder exists
  let parentfolderid=null;
  let target;
  
  if(folder.type!=targetFolder.type)
    return
  // dont create targetfolder
  if (folder._id != targetFolder._id && folder.isTargetFolder==false) {    
    if (folder.parentFolderID == 'TARGETFOLDER'){
      folder.parentFolderID=targetFolder._id;         
    }
    if (folder.parentFolderID==null || folder.folder==null){        
      parentfolderid = null;
      target = await game.folders.find(y =>y.name==folder.name && y.folder== parentfolderid && y.type == folder.type)
    } else {
      parentfolderid = folder.parentFolderID
      target = await game.folders.find(y =>y.name==folder.name && y.folder!= null && y.folder._id == parentfolderid && y.type == folder.type)
    }
    if (target != null) {
      //console.log(target)
      console.log('createFolders | '+ folder.type +' folder ' + folder.name + ' exists')
      folder.newid=target.id //update the folder with the found id
    } else {
      console.log('createFolders | '+ folder.type +' folder ' + folder.name + ' does not exists')
      let createFolder=false;
      if(parentfolderid==null){
        createFolder=true;
      } else {      
        // check for max depth
        const parentFolder=await game.folders.find(y =>y._id==parentfolderid && y.type == folder.type)
        if(parentFolder!=null){
          let maxdepth=3; // foundry v10
          if (isNewerVersion(game.version,11)) maxdepth=4
          if(parentFolder.depth>=maxdepth){
            console.error('createFolders | Maximum folder depth('+ maxdepth+') exceeded, aborting')
            return false
          } else{
            // create it
            createFolder=true;
          }
        } else {
          console.error('createFolders | Parent folder not found, aborting')
          return false;
        }
      }
      if(createFolder){
        console.log('createFolders | Creating '+ folder.type +' folder ' + folder.name)
        const newfolder=await Folder.create({name: folder.name, type: folder.type,folder:parentfolderid});
        folder.newid=newfolder.id //update the folder with the created id
      }
      
      
    }    
  }
  let result=true;
  if (folder.hasOwnProperty('children')) {
    for (let i = 0; i < folder.children.length; i++) {
      let child = folder.children[i];      
      child.parentFolderID=folder.newid;
      child.parentFolderName=folder.name;
      result=await createFolders(targetFolder,child,updatedFolders,count + 1);
      if(!result) break;
    }
  }
  return result;
}

// beginning of the updated import
async function importTree(exportfilePath) {
        //let exportfilePath = "worlds/" + gameName + "/export.json";
        ui.notifications.info(`Data import from file ${exportfilePath} started`); 
        const response = await fetch(exportfilePath);
        const importedPack = await response.json();
        const actors = importedPack.actors;
        const items = importedPack.items;
        const folders = importedPack.folders;

        let idCollection = {};
        let importThis=false;
        // ACTORS
        for (let i = 0; i < actors.length; i++) {
            let anactor = actors[i];            
            importThis=true; // set default to true
            if(!anactor.system.hasOwnProperty('actorKey')){                          
              // no actor key, import from older versions of sandbox
              anactor.system.actorKey=anactor._id;
            }
            // check if actor already exists by actorKey
            let actorExisting=game.actors.find(y=>y.system.actorKey==anactor.system.actorKey);
            if(actorExisting!=null){
              console.log('Actor ID:' + actorExisting.id + '[' + actorExisting.name + '] already exists'); 
              // ask user
              let documenttype ='Actor'
              let documentkey = anactor.system.actorKey;
              let existingimg = actorExisting.img;
              let existingname=actorExisting.name;
              let existingdate = new Date(actorExisting._stats.modifiedTime)
              let existingmodified=existingdate.toLocaleDateString(game.i18n.lang) + ' ' +existingdate.toLocaleTimeString(game.i18n.lang)
              
              let newimg = anactor.img;
              let newname=anactor.name;
              let newmodified='';
              if(anactor.hasOwnProperty('_stats')){                
                let newdate = new Date(anactor._stats.modifiedTime)
                newmodified=newdate.toLocaleDateString(game.i18n.lang) + ' ' +newdate.toLocaleTimeString(game.i18n.lang)
              }
              
              let answer=await sb_custom_dialog_duplicate_handling(documenttype,documentkey,existingimg,existingname,existingmodified,newimg,newname,newmodified);
              const DUPLICATEHANDLING_OVERWRITE=1;
              const DUPLICATEHANDLING_DUPLICATE=2;
              const DUPLICATEHANDLING_SKIP=3;
              const DUPLICATEHANDLING_ASK=4;
              const DUPLICATEHANDLING_ABORT=0;
              switch(answer){                
                case DUPLICATEHANDLING_OVERWRITE:
                  // overwrite(update)
                  importThis=false;                               
                  actorExisting.update(anactor);
                  console.log('Actor ID:' + actorExisting.id + '[' + actorExisting.name + '] already exists. Actor '+ anactor.name + ' updated');
                  break;
                case DUPLICATEHANDLING_DUPLICATE:
                  // duplicate(import)
                  importThis=true;                  
                  console.log('Actor ID:' + actorExisting.id + '[' + actorExisting.name + '] already exists. Actor '+ anactor.name + ' duplicated');
                  anactor.name=anactor.name + ' (Duplicated)';
                  break
                case DUPLICATEHANDLING_SKIP:
                  // skip
                  importThis=false;
                  console.log('Actor ID:' + actorExisting.id + '[' + actorExisting.name + '] already exists. Actor '+ anactor.name + ' skipped');
                  break;
                default:
                  // 0 abort
                  return;
              }                            
            }

            if(importThis){
              // prepare import flag
              anactor.flags.sandbox.import={'importedTime':0};  // add/reset marker for import before the create
              anactor.flags.sandbox.import.importID=anactor.system.actorKey;
              // check if import has _stats(v10 and forward)
              if(anactor.hasOwnProperty('_stats')){
                anactor.flags.sandbox.import.systemVersion=anactor._stats.systemVersion;
                anactor.flags.sandbox.import.coreVersion=anactor._stats.coreVersion;
                anactor.flags.sandbox.import.createdTime=anactor._stats.createdTime;
                anactor.flags.sandbox.import.modifiedTime=anactor._stats.modifiedTime;
                anactor.flags.sandbox.import.lastModifiedBy=anactor._stats.lastModifiedBy;
              }
              let istemplate = duplicate(anactor.system.istemplate);
              let result = await Actor.create(anactor);
              if (anactor.folder)
                  result.setFlag('sandbox', 'folder', anactor.folder);
              result.setFlag('sandbox', 'istemplate', istemplate);
              idCollection[anactor._id] = result._id;
            }
        }

        // ITEMS
        for (let i = 0; i < items.length; i++) {
            let anitem = items[i];
            let result = await Item.create(anitem);
            if (anitem.folder)
                result.setFlag('sandbox', 'folder', anitem.folder);
            idCollection[anitem._id] = result._id;
        }
        
        // FOLDERS
        ui.notifications.info(`Importing folders from file...`); 
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

        console.log("folders imported");
        ui.notifications.info(`Folders imported from file`); 
        
        ui.notifications.info(`Importing items from file...`);
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
        ui.notifications.info(`Items imported from file`);
        console.log("items imported");
        ui.notifications.info(`Importing actors from file...`);
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
                console.log('importTree | Final update(with folder)')
                await actor.update({ "system": finalactor.system, "folder": folderlink });                
            }
            else {
                console.log('importTree | Final update')
                await actor.update({ "system": finalactor.system });
            }


        }
        ui.notifications.info(`Actors imported from file`);
        ui.notifications.info(`Import from file completed`);
        console.log("Actors & Import Finished");
    }



