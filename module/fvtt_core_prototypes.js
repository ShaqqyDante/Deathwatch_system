// Contains needed overrides of core functions
import { auxMeth } from "./auxmeth.js";

export function fvtt_core_prototypes(){
  console.log('Sandbox | Extending Foundry Core functions'); 
  // ---------------------------------------------------------------------------
  console.log('Sandbox | Extending importAll'); 
  CompendiumCollection.prototype.importAll = async function({folderId=null, folderName="", ...options}={}) {
    let parentFolder;

    // Optionally, create a top level folder
    if ( CONST.FOLDER_DOCUMENT_TYPES.includes(this.documentName) ) {

      // Re-use an existing folder
      if ( folderId ) parentFolder = game.folders.get(folderId, {strict: true});

      // Create a new Folder
      if ( !parentFolder ) {
        parentFolder = await Folder.create({
          name: folderName || this.title,
          type: this.documentName,
          parent: null,
          color: this.folder?.color ?? null
        });
      }
    }

    // Load all content
    const folders = this.folders;
    const documents = await this.getDocuments();
    ui.notifications.info(game.i18n.format("COMPENDIUM.ImportAllStart", {
      number: documents.length,
      folderNumber: folders.size,
      type: this.documentName,
      folder: parentFolder.name
    }));

    // Create any missing Folders
    const folderCreateData = folders.map(f => {
        if ( game.folders.has(f.id) ) return null;
        const data = f.toObject();

        // If this folder has no parent folder, assign it to the new folder
        if ( !data.folder ) data.folder = parentFolder.id;
        return data;
    }).filter(f => f);
    await Folder.createDocuments(folderCreateData, {keepId: true});

    // Prepare import data
    const collection = game.collections.get(this.documentName);
    const createData = documents.map(doc => {
      const data = collection.fromCompendium(doc, options);

      // If this document has no folder, assign it to the new folder
      if ( !data.folder) data.folder = parentFolder.id;
      return data;
    });

    // Create World Documents in batches
    const chunkSize = 100;
    const nBatches = Math.ceil(createData.length / chunkSize);
    let created = [];
    for ( let n=0; n<nBatches; n++ ) {
      const chunk = createData.slice(n*chunkSize, (n+1)*chunkSize);
      const docs = await this.documentClass.createDocuments(chunk, options);
      // -----------------------------------------------------------------------
      // SB Modification Start
      // -----------------------------------------------------------------------
      let dictext = game.settings.get("sandbox", "idDict");
      let arrdisct = {};
      if (dictext != null)
        arrdisct = JSON.parse(dictext);
      else {
        arrdisct.ids = {};
      }
      let register = false;
      for (let i = 0; i < docs.length; i++) {
        let mydoc = docs[i];
        if (hasProperty(mydoc, "system"))
          if (hasProperty(mydoc.system, "ciKey")) {
            arrdisct.ids[mydoc.system.ciKey] = mydoc.id;
            register = true;
          }
      }
      const myJSON = JSON.stringify(arrdisct);
      if (register)
        await game.settings.set("sandbox", "idDict", myJSON);
      // -----------------------------------------------------------------------
      // SB Modification End
      // -----------------------------------------------------------------------
      created = created.concat(docs);
    }

    // Notify of success
    ui.notifications.info(game.i18n.format("COMPENDIUM.ImportAllFinish", {
      number: created.length,
      folderNumber: folders.size,
      type: this.documentName,
      folder: parentFolder.name
    }));
    return created;
  };
  //
  // ---------------------------------------------------------------------------
  console.log('Sandbox | Extending importFromCompendium'); 
  WorldCollection.prototype.importFromCompendium = async function (pack, id, updateData={}, options={}) {

    const cls = this.documentClass;
    if (pack.documentName !== cls.documentName) {
      throw new Error(`The ${pack.documentName} Document type provided by Compendium ${pack.collection} is incorrect for this Collection`);
    }

    // Prepare the source data from which to create the Document
    const document = await pack.getDocument(id);
    const sourceData = this.fromCompendium(document, options);
    const createData = foundry.utils.mergeObject(sourceData, updateData);

    // Create the Document
    console.log(`${vtt} | Importing ${cls.documentName} ${document.name} from ${pack.collection}`);
    this.directory.activate();
    options.fromCompendium = true;
    // -----------------------------------------------------------------------
    // SB Modification Start
    // -----------------------------------------------------------------------
    let newObj = await this.documentClass.create(createData, options);
    await auxMeth.registerDicID(id, newObj.id, newObj.system.ciKey);
    return newObj;
    // return this.documentClass.create(createData, options); // original
    // 
    // -----------------------------------------------------------------------
    // SB Modification End
    // -----------------------------------------------------------------------
  };
  // ---------------------------------------------------------------------------    
  console.log('Sandbox | Extending available text files extensions for Filepicker'); 
   /**
   * Get the valid file extensions for a given named file picker type
   * @param {string} type
   * @returns {string[]}
   * @private
   */  
  FilePicker.prototype._getExtensions=function(type) {        
    const TEXT_EXTENDED_FILE_EXTENSIONS = {
      css: "text/css",
      csv: "text/csv",
      json: "application/json",
      md: "text/markdown",
      pdf: "application/pdf",
      tsv: "text/tab-separated-values",
      txt: "text/plain",
      xml: "application/xml",
      yml: "application/yaml",
      yaml: "application/yaml"
    };
    
    // Identify allowed extensions
    let types = [
      CONST.IMAGE_FILE_EXTENSIONS,
      CONST.AUDIO_FILE_EXTENSIONS,
      CONST.VIDEO_FILE_EXTENSIONS,
      CONST.TEXT_FILE_EXTENSIONS,
      CONST.FONT_FILE_EXTENSIONS,
      CONST.GRAPHICS_FILE_EXTENSIONS
    ].flatMap(extensions => Object.keys(extensions));
    if ( type === "folder" ) types = [];
    else if ( type === "font" ) types = Object.keys(CONST.FONT_FILE_EXTENSIONS);
    else if ( type === "text" ) types = Object.keys(CONST.TEXT_FILE_EXTENSIONS);
    else if ( type === "textextended" ) types = Object.keys(TEXT_EXTENDED_FILE_EXTENSIONS);
    else if ( type === "graphics" ) types = Object.keys(CONST.GRAPHICS_FILE_EXTENSIONS);
    else if ( type === "image" ) types = Object.keys(CONST.IMAGE_FILE_EXTENSIONS);
    else if ( type === "audio" ) types = Object.keys(CONST.AUDIO_FILE_EXTENSIONS);
    else if ( type === "video" ) types = Object.keys(CONST.VIDEO_FILE_EXTENSIONS);
    else if ( type === "imagevideo") {
      types = Object.keys(CONST.IMAGE_FILE_EXTENSIONS).concat(Object.keys(CONST.VIDEO_FILE_EXTENSIONS));
    }
    return types.map(t => `.${t.toLowerCase()}`);
  };
  // ---------------------------------------------------------------------------
  Combat.prototype.rollInitiative = async function (ids, { formula = null, updateTurn = true, messageOptions = {} } = {}) {

    // Structure input data
    ids = typeof ids === "string" ? [ids] : ids;
    let currentId;
    if (this.hasOwnProperty('combatant')) {
      currentId = this.combatant.id;
    }
    const rollMode = messageOptions.rollMode || game.settings.get("core", "rollMode");

    // Iterate over Combatants, performing an initiative roll for each
    const updates = [];
    const messages = [];
    
    let initiativeFormulaFromSettings = await game.settings.get("sandbox", "initKey");
    let initiativeFormula = "1d20";
    if (initiativeFormulaFromSettings != "") {
      initiativeFormula = "@{" + initiativeFormulaFromSettings + "}";
    }
    
    for (let [i, id] of ids.entries()) {

      // Get Combatant data (non-strictly)
      const combatant = this.combatants.get(id);
      if (!combatant?.isOwner)
        return results;

      // Produce an initiative roll for the Combatant
      //const roll = await combatant.getInitiativeRoll(formula);
      
      // use actor.rollSheetDice(rollexp, rollname, rollid, actorattributes, null) 
      // rollSheetDice returns rolldata.result, use this to set updates
      const rollname = game.i18n.format("COMBAT.RollsInitiative", {name: combatant.name});
      const rollid='INITIATIVE_ROLL';
      const roll=await combatant.actor.rollSheetDice(initiativeFormula, rollname, rollid, combatant.actor.system.attributes, null); 
      updates.push({_id: id, initiative: roll.result});    
//      updates.push({_id: id, initiative: roll.total});

//      // Construct chat message data
//
//      let messageData = foundry.utils.mergeObject({
//        speaker: {
//          scene: this.scene.id,
//          actor: combatant.actor?.id,
//          token: combatant.token?.id,
//          alias: combatant.name
//        },
//
//        flavor: game.i18n.format("COMBAT.RollsInitiative", {name: combatant.name}),
//        flags: {"core.initiativeRoll": true}
//      }, messageOptions);
//      
//      const chatData = await roll.toMessage(messageData, {
//        create: false,
//        rollMode: combatant.hidden && (rollMode === "roll") ? "gmroll" : rollMode
//      });
//      
//      
//
//      // Play 1 sound for the whole rolled set
//      if (i > 0)
//        chatData.sound = null;
//      messages.push(chatData);
    }
    //console.log(updates)
    
    if (!updates.length)
      return this;

    // Update multiple combatants
    await this.updateEmbeddedDocuments("Combatant", updates);

    // Ensure the turn order remains with the same combatant
    if (updateTurn) {
      await this.update({turn: this.turns.findIndex(t => t.id === currentId)});
    }

    // Create multiple chat messages
    //await ChatMessage.implementation.create(messages);
    return this;

  };
  // ---------------------------------------------------------------------------
  Combatant.prototype.getInitiativeRoll = async function (formula) {
    formula = formula || await this._getInitiativeFormula();
    const rollData = await this.actor.getRollData() || {};
    const roll = Roll.create(formula, rollData);
    return roll.evaluate({async: false});
  };
  // ---------------------------------------------------------------------------
  Combatant.prototype._getInitiativeFormula = async function () {

    let initF = await game.settings.get("sandbox", "initKey");
    let formula = "1d20";
    if (initF != "") {
      formula = "@{" + initF + "}";
    }

    formula = await auxMeth.autoParser(formula, this.actor.system.attributes, null, true, false);
    formula = await auxMeth.autoParser(formula, this.actor.system.attributes, null, true, false);

    CONFIG.Combat.initiative.formula = formula;

    //console.log(formula);

    return CONFIG.Combat.initiative.formula || game.system.data.initiative;

  };
  // ---------------------------------------------------------------------------
  JournalEntry.prototype.show = async function (mode = "text", force = false) {
    if (!this.isOwner)
      throw new Error("You may only request to show Journal Entries which you own.");
    return new Promise((resolve) => {
      game.socket.emit("showEntry", this.uuid, mode, force, entry => {
        Journal._showEntry(this.uuid, mode, true);
        // ui.notifications.info(game.i18n.format("JOURNAL.ActionShowSuccess", {
        //     mode: mode,
        //     title: this.name,
        //     which: force ? "all" : "authorized"
        // }));
        return resolve(this);
      });
    });
  }; 
  // ---------------------------------------------------------------------------
}


