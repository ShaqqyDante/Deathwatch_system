
export class PartySheet extends ActorSheet {
      static get defaultOptions() {
      
        return mergeObject(super.defaultOptions, {
            classes: ["sandbox", "sheet", "party"],
            scrollY: [".sheet-body", ".scrollable", ".tab"],
            width: 650,
            height: 600,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
        });
    }
    
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
    
    
}