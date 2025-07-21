

export async function sb_custom_dialog_confirm(sTitle,sQuestion,answerOneCaption='Ok',answerTwoCaption='Cancel'){
  let dialogid='sb-custom-dialog-confirm-' + randomID();
  let dialog=new Promise((resolve,reject)=>{
    new Dialog({
      title: sTitle,
      content: `<span id="${dialogid}"></span>` + sQuestion ,
      buttons: {
        ok: {
          icon:'<i class ="fas fa-check"></i>',
          label: answerOneCaption,            
          callback: () => {resolve(true)}
        },
        cancel: { 
          icon:'<i class ="fas fa-times"></i>',
          label: answerTwoCaption,            
          callback: () => {resolve(false)}
        }
      },
      default: "ok",
      render:()=>{
        // set icon in dialog title
        sb_add_icon_to_dialog(dialogid,'far fa-circle-question');
      },      
      close:  () => {resolve(false) }   
    }).render(true);             
  }); 
  let answer=await dialog;
  return answer;    
 }

function sb_add_icon_to_dialog(dialogid,icon){
  let dialogidelement=document.getElementById(dialogid);
  if(dialogidelement!=null){
    let dialogapp=dialogidelement.closest('.dialog');
    if(dialogapp!=null){
      let dialogtitle=dialogapp.getElementsByClassName("window-title");
      if(dialogtitle!=null){
        if(dialogtitle.length>0){
          dialogtitle[0].innerHTML='<i class="'+ icon +'"></i> ' + dialogtitle[0].innerHTML;
        }
      }            
    }
  }
}

export async function sb_custom_dialog_prompt(sTitle,sInformation,answerOneCaption='Ok',prompttype='Information'){
  let dialogid='sb-custom-dialog-information' + randomID();
  let dialog=new Promise((resolve,reject)=>{
    new Dialog({
      title: sTitle,
      content:  `<span id="${dialogid}"></span>` + sInformation ,
      buttons: {
        ok: {
          icon:'<i class ="fas fa-check"></i>',
          label: answerOneCaption,            
          callback: () => {resolve(true);}
        }
      },
      default: "ok",
      render:()=>{
        // set icon in dialog title
        let icon;
        switch(prompttype){
          case 'Warning':
            icon="far fa-triangle-exclamation";
            break;
          case 'Error':
            icon="far fa-ban";
            break;
          default:
            icon='far fa-circle-info';
            break;
        }
        sb_add_icon_to_dialog(dialogid,icon);
      },
      close:  () => {resolve(false); }   
    }).render(true);             
  }); 
  let answer=await dialog;
  return answer;    
 }   
 
 export async function confirmRemoveSubItem(parentName,parentType,itemName,itemType=''){
   let prompttitle =game.i18n.format("SANDBOX.confirmRemoveSubItemPromptTitle",{itemname:itemName,itemtype:itemType});
   let promptbody='<h4>' + game.i18n.localize("AreYouSure") +'</h4>';        
   promptbody   +='<p>' + game.i18n.format("SANDBOX.confirmRemoveSubItemPromptBody",{parentname:parentName,parenttype:parentType,itemname:itemName,itemtype:itemType}) +'</p>';        
   let answer=await sb_custom_dialog_confirm(prompttitle,promptbody,game.i18n.localize("Yes"),game.i18n.localize("No"));
   return answer;
 }
 
export async function sb_custom_dialog_duplicate_handling(documenttype,documentkey,existingimg,existingname,existingmodified,newimg,newname,newmodified){
  const DUPLICATEHANDLING_OVERWRITE=1;
  const DUPLICATEHANDLING_DUPLICATE=2;
  const DUPLICATEHANDLING_SKIP=3;
  const DUPLICATEHANDLING_ASK=4;
  const DUPLICATEHANDLING_ABORT=0;
  let dialogid='sb-custom-dialog-duplicate-handling-' + randomID();
  let dialog=new Promise((resolve,reject)=>{
    new Dialog({
      title: game.i18n.format("SANDBOX.DuplicateHandling_Title",{documenttype:documenttype}),
      content: `<span id="${dialogid}"></span>` + game.i18n.format("SANDBOX.DuplicateHandling_Body",{documenttype:documenttype, documentkey:documentkey}) +
              `<table style="text-align: left;">
    <tr><th></th><th>${game.i18n.localize("SANDBOX.DuplicateHandling_TableHeaderImage")}</th><th>${game.i18n.localize("SANDBOX.DuplicateHandling_TableHeaderName")}</th><th>${game.i18n.localize("SANDBOX.DuplicateHandling_TableHeaderModified")}</th></tr>
    <tr><td>${game.i18n.localize("SANDBOX.DuplicateHandling_TableRowExisting")} ${documenttype}</td><td><img src="${existingimg}" alt="${existingimg}" class="sb-info-form-portrait-img"></td><td>${existingname}</td><td>${existingmodified}</td></tr>
    <tr><td>${game.i18n.localize("SANDBOX.DuplicateHandling_TableRowNew")} ${documenttype}</td><td><img src="${newimg}" alt="${newimg}" class="sb-info-form-portrait-img"></td><td>${newname}</td><td>${newmodified}</td></tr>
</table>`,
      buttons: {
        overwrite: {
          icon:'<i class ="fas fa-undo"></i>',
          label: game.i18n.localize("SANDBOX.DuplicateHandling_Button_Overwrite"),            
          callback: () => {resolve(DUPLICATEHANDLING_OVERWRITE)}
        },
        duplicate: { 
          icon:'<i class ="fas fa-copy"></i>',
          label: game.i18n.localize("SANDBOX.DuplicateHandling_Button_Duplicate"),            
          callback: () => {resolve(DUPLICATEHANDLING_DUPLICATE)}
        }        ,
        skip: { 
          icon:'<i class ="fas fa-forward-step"></i>',
          label: game.i18n.localize("SANDBOX.DuplicateHandling_Button_Skip"),            
          callback: () => {resolve(DUPLICATEHANDLING_SKIP)}
        },
        abort: { 
          icon:'<i class ="fas fa-ban"></i>',
          label: game.i18n.localize("SANDBOX.DuplicateHandling_Button_Abort"),            
          callback: () => {resolve(DUPLICATEHANDLING_ABORT)}
        }
      },
      default: "overwrite",      
      render:()=>{
        // set icon in dialog title
        sb_add_icon_to_dialog(dialogid,'far fa-circle-question');
      },      
      close:  () => {resolve(0) }   
    },{"height":0,"width":450,"resizable":false}).render(true);             
  }); 
  let answer=await dialog;
  return answer;    
 }