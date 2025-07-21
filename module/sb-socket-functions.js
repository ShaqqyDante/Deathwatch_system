import { SandboxInfoForm } from "./sb-info-form.js";
import { SOCKETCONSTANTS } from "./sb-socket-constants.js";
import { auxMeth } from "./auxmeth.js";

export function socketHandler(msg) {
  console.log('Sandbox | Recieved socket message');
  //console.log('Sandbox | Recieved socket type:' + msg.op);

  switch (msg.op) {
    case (SOCKETCONSTANTS.MSG.OPERATIONS.TARGET_EDIT):
      targetEdit(msg);
      break;
    case (SOCKETCONSTANTS.MSG.OPERATIONS.TRANSFER_EDIT):
      transferEdit(msg)
      break;
    case(SOCKETCONSTANTS.MSG.OPERATIONS.CLIENT_REFRESH):
      clientRefresh(msg)
      break;
    case(SOCKETCONSTANTS.MSG.OPERATIONS.SHOW_PLAYERS):
      showPlayer(msg)
      break;   
    default:
      console.warn('Sandbox | Socket Arrival | Unhandled operation');
      console.warn(msg);
      break;
  }
}

function transferEdit(msg){
  let actorOwner=null;
  actorOwner = game.actors.get(msg.ownerID);
  if(actorOwner!=null){
    actorOwner.handleTransferEdit(msg);
  } else {
    console.warn('Sandbox | Socket arrival | Actor not found for data');
    console.warn(msg);
  }
  
}

function targetEdit(msg){
  let actorOwner=null;
  actorOwner = game.actors.get(msg.actorId);
  if(actorOwner!=null){
    actorOwner.handleTargetRequest(msg);            
  } else {
    console.warn('Sandbox | Socket arrival | Actor not found for data');
    console.warn(msg);
  }
}


function clientRefresh(msg){  
  if(msg.user != game.user.id){   
    console.log('Sandbox | clientRefresh | Refresh request');    
    auxMeth.clientRefresh(msg.data)    
  }
}

export async function showPlayer(msg){
  let showme = false;
  // check if to show this player
  switch (msg.data.show.who) {
    case 'ALL':
      showme=true;
      break;
    case 'MYSELF':
      showme=true;
      break;
    case 'GM':
      if(game.user.isGM){
        showme=true;
      }
      break;
    default:
      // check for length
      if (msg.data.show.who.length>0){
        // split to array by semicolon
        const arrRecipients = msg.data.show.who.split(";");
        if(arrRecipients.includes(game.user.id)){
          showme=true;              
        }
      }
  }
  if (showme) {
    let options;
    let token;
    let sceneid;
    let tokenScene;
    console.log('Sandbox | ShowMe:' + msg.data.type);
    switch (msg.data.type) {
      case('Item'):
        
        let item=null;
        if(msg.data.compendiumtype.length>0 && msg.data.compendiumname.length>0){
          const pack=await game.packs.get(msg.data.compendiumtype + '.' + msg.data.compendiumname);
          item = await pack.getDocument(msg.data.id);
        } else {
          item = game.items.get(msg.data.id);
        }
        if(item != null) {
          options = {
            show: msg.data.show,
            id: msg.data.id,
            type: msg.data.type,
            reshowable: false,
            name: item.name,
            image: item.img,
            description: item.system.description,
            compendiumtype:msg.data.compendiumtype,
            compendiumname:msg.data.compendiumname
          };
        } 
        break;
      case('Actor'):
        let actor=null;        
        if(msg.data.compendiumtype.length>0 && msg.data.compendiumname.length>0){
          const pack=await game.packs.get(msg.data.compendiumtype + '.' + msg.data.compendiumname);
          actor = await pack.getDocument(msg.data.id);
        } else {
          actor = game.actors.get(msg.data.id)
        }
        if (actor != null) {
          options = {
            show: msg.data.show,
            id: msg.data.id,
            type: msg.data.type,
            reshowable: false,
            name: actor.name,
            image: actor.img,
            description: actor.system.biography,
            compendiumtype:msg.data.compendiumtype,
            compendiumname:msg.data.compendiumname
          };
        }
        break;
      case('Token'):        
        sceneid=msg.data.scene;        
        tokenScene=await game.scenes.get(sceneid);
        if(tokenScene!=null){
          token = await tokenScene.tokens.get(msg.data.id);
        }
        if (token != null) {
          options = {
            show: msg.data.show,
            id: msg.data.id,
            type: msg.data.type,
            reshowable: false,
            name: token.name,
            image: token.texture.src,
            description: token.actor.system.biography,
            compendiumtype:'',
            compendiumname:''
          };
        }
        break;
      case('TokenActor'):
        sceneid=msg.data.scene;        
        tokenScene=await game.scenes.get(sceneid);
        if(tokenScene!=null){
          token = await tokenScene.tokens.get(msg.data.id);
        }
        token = await tokenScene.tokens.get(msg.data.id);         
        if (token != null) {
          options = {
            show: msg.data.show,
            id: msg.data.id,
            type: msg.data.type,
            reshowable: false,
            name: token.actor.name,
            image: token.actor.img,
            description: token.actor.system.biography,
            compendiumtype:'',
            compendiumname:''
          };
        }
        break;
    }
    if (options != null) {
      let f = new SandboxInfoForm(options).render(true, {focus: true});
    } else {
      if(msg.data.compendiumtype.length>0 && msg.data.compendiumname.length>0){
        console.log('Sandbox | ShowMe: Unable to find ' + msg.data.type +' with ID:' + msg.data.id + ' Compendium:'+ msg.data.compendiumtype + '.' + msg.data.compendiumname);
      } else {
        console.log('Sandbox | ShowMe: Unable to find ' + msg.data.type +' with ID:' + msg.data.id );
      }
    }
  }
}
