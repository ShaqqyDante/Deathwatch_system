import { EntitySheetHelper } from "./helper.js";
import {ATTRIBUTE_TYPES} from "./constants.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class SimpleActorSheet extends ActorSheet {

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["worldbuilding", "sheet", "actor"],
      template: "systems/worldbuilding/templates/actor-sheet.html",
      width: 600,
      height: 600,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
      scrollY: [".biography", ".items", ".attributes"],
      dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  async getData(options) {
    const context = await super.getData(options);
    EntitySheetHelper.getAttributeData(context.data);
    context.shorthand = !!game.settings.get("worldbuilding", "macroShorthand");
    context.systemData = context.data.system;
    context.dtypes = ATTRIBUTE_TYPES;
    context.biographyHTML = await TextEditor.enrichHTML(context.systemData.biography, {
      secrets: this.document.isOwner,
      async: true
    });
    return context;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if ( !this.isEditable ) return;

    // Attribute Management
    html.find(".attributes").on("click", ".attribute-control", EntitySheetHelper.onClickAttributeControl.bind(this));
    html.find(".groups").on("click", ".group-control", EntitySheetHelper.onClickAttributeGroupControl.bind(this));
    html.find(".attributes").on("click", "a.attribute-roll", EntitySheetHelper.onAttributeRoll.bind(this));

    // Item Controls
    html.find(".item-control").click(this._onItemControl.bind(this));
    // html.find(".items .rollable").on("click", this._onItemRoll.bind(this));
    html.find(".items .rollable").on("click", this._onRoll.bind(this));
    html.find("a.item-button").on("click",this._onImgClick.bind(this))
    html.find('.input').on("change", this._onInputChange.bind(this));
    html.find('.input2').on("change", this._onInput2Change.bind(this));
    // Add draggable for Macro creation
    html.find(".attributes a.attribute-roll").each((i, a) => {
      a.setAttribute("draggable", true);
      a.addEventListener("dragstart", ev => {
        let dragData = ev.currentTarget.dataset;
        ev.dataTransfer.setData('text/plain', JSON.stringify(dragData));
      }, false);
    });
  }

  /* -------------------------------------------- */

  /**
   * Handle click events for Item control buttons within the Actor Sheet
   * @param event
   * @private
   */
  _onItemControl(event) {
    event.preventDefault();

    // Obtain event data
    const button = event.currentTarget;
    const li = button.closest(".item");
    const item = this.actor.items.get(li?.dataset.itemId);
    
    // Handle different actions
    switch ( button.dataset.action ) {
      case "post":
        item.sheet.document.toChat();
      case "show":
        return item.sheet.render(true);
      case "create":
        const cls = getDocumentClass("Item");
        return cls.create({name: game.i18n.localize("SIMPLE.ItemNew"), type: "item"}, {parent: this.actor});
      case "edit":
        return item.sheet.render(true);
      case "delete":
        return item.delete();
    }
  }

  /* -------------------------------------------- */

  /**
   * Listen for roll buttons on items.
   * @param {MouseEvent} event    The originating left click event
   */
  _onRoll(event){
    let button = $(event.currentTarget);
    const li = button.parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    let c = `<input id="dialog_input" type="text" value="${this.actor.system.attributes.CS.WS.value}" title="Modifier"/>`;
    if(item.system.attributes.type.value == "melee"){
      c = `<input id="dialog_input" type="text" value="${this.actor.system.attributes.CS.WS.value}" title="Modifier"/>`
    }else if(item.system.attributes.type.value == "ranged"){
      c = `<input id="dialog_input" type="text" value="${this.actor.system.attributes.CS.BS.value}" title="Modifier"/>`
    }
    if(button.text() == "Attack Roll"){
      let d = new Dialog({
        title: button.text(),
        content: c,
        buttons: {
          confirm: {
            icon: '<i class="fas fa-check"></i>',
            label: "Confirm",
            callback: () => {
              let mod = document.getElementById("dialog_input").value
              this.callbackFunc(button, item, mod, 0)
            }
          }
        }
      })
      d.render(true)
    }
    else if(button.text() == "Damage Roll"){
      let d = new Dialog({
        title: button.text(),
        content: `<input id="dialog_input" type="text" value="" title="Modifier"/>`,
        buttons: {
          confirm: {
            icon: '<i class="fas fa-check"></i>',
            label: "Confirm",
            callback: () => {
              let mod = document.getElementById("dialog_input").value
              this.callbackFunc(button, item, mod, 1)
            }
          }
        }
      })
      d.render(true)
    }
    else{
      r.toMessage({
          user: game.user.id,
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          flavor: `<h2>${item.name}</h2><h3>${button.text()}</h3><hr><p>${button.data('roll')}</p>`
        });
    }
  }
  _onItemRoll(event) {
    // let button = $(event.currentTarget);
    // const li = button.parents(".item");
    // const item = this.actor.items.get(li.data("itemId"));
    // let r = new Roll(button.data('roll'), this.actor.getRollData());
    // console.log(r)
    // let d = new Dialog({
    //   title: button.text(),
    //   content: `<input type="number" value=0 title="Modifier"/>`,
    //   buttons: {
    //     confirm: {
    //       icon: '<i class="fas fa-check"></i>',
    //       label: "Confirm",
    //       callback: 
    //     }
    //   }
    // })
    // return r.toMessage({
    //   user: game.user.id,
    //   speaker: ChatMessage.getSpeaker({ actor: this.actor }),
    //   flavor: `<h2>${item.name}</h2><h3>${button.text()}</h3><hr><p>${button.data('roll')}</p>`
    // });
  }
  callbackFunc(button, item, mod, m){
    if(m == 0){
      let r = new Roll((button.data('roll')+" "+mod+"]"), this.actor.getRollData());
      return r.toMessage({
          user: game.user.id,
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          flavor: `<h2>${item.name}</h2><h3>${button.text()}</h3>`
        });
    }
    if(m==1){
      let r = new Roll(mod+"+"+button.data('roll'), this.actor.getRollData());
      return r.toMessage({
          user: game.user.id,
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          flavor: `<h2>${item.name}</h2><h3>${button.text()}</h3>`
        });
    }
  }

  /* -------------------------------------------- */
  async _onImgClick(event) {
    let button =$(event.currentTarget);
    const li = button.parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    // return new ChatMessage({
    //   user: game.user.id,
    //   speaker: ChatMessage.getSpeaker({ actor: this.actor }),
    //   flavor: `<h2>${item.name}</h2><p>${item.system.description}</p>`
    // });
    const img = item.img
    const imgElem = img ? `<img src=${img} alt="${item.name || img}" style="max-height: 80px"/>` : ''
    // one message, public, has: name, image, and description
    await ChatMessage.create({
      content:
        `<div class="${game.system.id} chat-card item-card">
            <header class="card-header flexrow">
            <h3 class="item-name">${item.name}</h3>
            </header>
          ${imgElem}
      </div>
      ${item.system.description}
      `,
    })
  }
  /* --------------------------------------------- */
  async _onInputChange(event) {
    let button =$(event.currentTarget);
    const li = button.parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    // return new ChatMessage({
    //   user: game.user.id,
    //   speaker: ChatMessage.getSpeaker({ actor: this.actor }),
    //   flavor: `<h2>${item.name}</h2><p>${item.system.description}</p>`
    // });
    item.system.quantity = Number(event.currentTarget.value);
    console.log(item.system.quantity)
  }
  async _onInput2Change(event) {
    let button =$(event.currentTarget);
    const li = button.parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    // return new ChatMessage({
    //   user: game.user.id,
    //   speaker: ChatMessage.getSpeaker({ actor: this.actor }),
    //   flavor: `<h2>${item.name}</h2><p>${item.system.description}</p>`
    // });
    // console.log(event)
    console.log(event.currentTarget.value)
    // console.log(item)
    item.system.attributes.mag.value = Number(event.currentTarget.value);
    console.log(item.system.attributes.mag.value)
  }
  /* -------------------------------------------- */

  /** @inheritdoc */
  _getSubmitData(updateData) {
    let formData = super._getSubmitData(updateData);
    formData = EntitySheetHelper.updateAttributes(formData, this.object);
    formData = EntitySheetHelper.updateGroups(formData, this.object);
    return formData;
  }
}
