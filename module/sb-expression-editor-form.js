const _title="Sandbox Expression Editor";
import { SystemSettingsForm } from "./system-settings-form.js";
export class SandboxExpressionEditorForm extends FormApplication {
  static expression='';
  static item=''; 
  static isSplittedByTwoSpaces=false;
  static isSplittedByComma=false;
  static isSplittedBySemiColon=false;
  static isSplittedByRowBreak=false;
  
  constructor(options) {
    super();
    this.expression = options.expression || null;
    this.itemid = options.itemid || null     ;
    this.itemname = options.itemname || null; 
    this.itemtype= options.itemtype || null;
    this.itemlabel= options.itemlabel || null;
    this.itemtargetelement=options.itemtargetelement||null;
    this.itemlinebreaker=options.itemlinebreaker||null;
    if (this.itemlinebreaker==null){   
      this.itemlinebreaker="  "; // default is two spaces
    }
    
    if (this.itemlinebreaker==","){
      this.isSplittedByComma=true;
    }
    else if(this.itemlinebreaker==";"){
      this.isSplittedBySemiColon=true;
    }   
    else if(this.itemlinebreaker==" "){
      this.isSplittedBySingleSpace=true;
    }
    else if(this.itemlinebreaker=="\n"){
      this.isSplittedByRowBreak=true;
    }
    else{
      this.isSplittedByTwoSpaces=true;
    }
    
    if (this.expression!=null){
      if(this.expression.length>0){                      
        const parts=this.expression.split(this.itemlinebreaker)
        let expression='';
        for (let i = 0; i < parts.length; i++) {
          if(i==0 && parts[i].length==0){
            // add an extra line break if the first term is empty, seems codemirror swallows the first linebreak
            expression += "\r\n\r\n";
          } else {
            if(i==parts.length-1){
              // if this is the last term, dont add a linebreak
              expression += parts[i] ;
            } else {
              expression += parts[i] + "\r\n";
            }
          }
        }
        this.expression=expression;                
      }
    }
  }

  static initialize() {
    
    console.log('Initialized SandboxExpressionEditorForm' );
  }   
    
  static get defaultOptions() {
    const defaults = super.defaultOptions;  
    const overrides = {
      height: '600',
      width:'750',
      id: 'sandbox-expression-editor-form',
      template: `systems/sandbox/templates/sb-expression-editor-form.hbs`,
      title: _title,
      userId: game.userId,
      closeOnSubmit: true, // do not close when submitted
      submitOnChange: false, // submit when any input changes 
      resizable:true
    };  
    const mergedOptions = foundry.utils.mergeObject(defaults, overrides);    
    return mergedOptions;
  }  
  
  activateListeners(html) {
    super.activateListeners(html);
    html.find('button[name="update-expression"]').click(this._onUpdateExpression.bind(this));  
    html.find('button[name="update-expression-and-close"]').click(this._onUpdateExpressionAndClose.bind(this));
    html.find('button[name="close-editor"]').click(this._onCloseEditor.bind(this));
    html.find('#sb-btn-show-settings').click(this._onDisplaySandboxSettings.bind(this));
    html.find('.paste-text-from-clipboard').click(this._onPaste.bind(this));  
    html.find('.copy-selection').click(this._onCopySelection.bind(this));
    html.find('.copy-expression').click(this._onCopyExpression.bind(this));
    html.find('.copy-expression-pre-formatted').click(this._onCopyExpressionPreFormatted.bind(this));  
    html.find('.font-size-increase').click(this._onFontSizeIncrease.bind(this));
    html.find('.font-size-decrease').click(this._onFontSizeDecrease.bind(this));
    html.find('.font-size-reset').click(this._onFontSizeReset.bind(this));
    
    this.codeEditor = CodeMirror.fromTextArea(html.find(".sandbox-expression-editor-textarea")[0], { 
      mode: "sandbox-expression",             // A mode like "javascript" or "css"
      ...CodeMirror.userSettings,     // A special helper described later
      lineNumbers: false,              // CM has a number of settings you can configure
      inputStyle: "contenteditable",
      autofocus: true,
      matchBrackets: true
    });


    html.find('.sandbox-expression-editor-form-content').resize(this._onEditorResize.bind(this));
    
  }
  
  getData(options) {      
    let data; 
    
    data={
      expression:this.expression,
      itemname:this.itemname,
      itemtype:this.itemtype,
      itemlabel:this.itemlabel,               
      isSplittedBySingleSpace:this.isSplittedBySingleSpace,
      isSplittedByTwoSpaces:this.isSplittedByTwoSpaces,
      isSplittedBySemiColon:this.isSplittedBySemiColon,
      isSplittedByComma:this.isSplittedByComma,
      isSplittedByRowBreak:this.isSplittedByRowBreak
    }
    return data;
  }    
     
  async _onEditorResize(event){
    event.preventDefault();  
    console.log('resix');
    this.codeEditor.refresh();
  }
  
  async _onUpdateExpressionAndClose(event) {
    document.querySelector('button[name="update-expression"]').click();
    document.querySelector('button[name="close-editor"]').click(); 
  }  
  
  async _onUpdateExpression(event) { 
    event.preventDefault(); 
    this.codeEditor.save();
    let sTargetSelector='';
    
    // v10 changed id of app forms
    // sItemSheet-Item
    sTargetSelector="#sItemSheet-Item-"+ this.itemid +" " + this.itemtargetelement;
    let target = document.querySelector(sTargetSelector)  
    // check if target item sheet is still open, if not re -open it
    if (target==null){
      let item=game.items.get(this.itemid);
      if (item!=null){
        // open item sheet
        item.sheet.render(true);         
      }                 
      ui.notifications.warn('Expression Editor: <br>Unable to update item expression when target item sheet is closed. <br>Attempts to open the item sheet again.  <br>Try again when its open'); 
      this.bringToTop();
    }    
    else{        
      let expression=document.getElementById('sandbox-expression-editor-expression');
      if (expression!=null){
        let sExpression=expression.value
        sExpression=sExpression.replace(/\r\n|\r|\n/g,this.itemlinebreaker);
        // check for tabs when not using (two)spaces
        if(this.isSplittedBySemiColon || this.isSplittedByComma ){
          // get rid of tabs and white spaces next to commas/semicolon and trim it
          sExpression=sExpression.replace(/\s*,\s*/g,',').trim(); 
          
        }
        target.value=sExpression;
        // trigger onchange event
        const event = new Event('change', { bubbles: true });  
        target.dispatchEvent(event); 
      } 
    }          
  } 
  
  _onCloseEditor(event) {
    this.close();
  }
        
  _onDisplaySandboxSettings(event) { 
    event.preventDefault();
    //console.log('display conf'); 
    let f = new SystemSettingsForm(); 
    f.render(true,{focus:true});
  }   
  
  async _updateObject(event, formData) {
    const expandedData = foundry.utils.expandObject(formData);
    console.log(expandedData);

  }
  
  async _onPaste(event){  
    event.preventDefault();   
    navigator.clipboard.readText()
      .then(text => {
        // `text` contains the text read from the clipboard          
        let doc = this.codeEditor.getDoc();        
        doc.replaceSelection(text); 
      })
      .catch(err => {
        // maybe user didn't grant access to read from clipboard
        ui.notifications.warn('Error when attempting to paste to ' + oAttribute.CAPTION,err);
      });                                                       
  }  
  
  async _onCopySelection(event){  
    this.codeEditor.save();  
    let doc = this.codeEditor.getDoc();        
    let sExpression=doc.getSelection();
    if (sExpression.length>0){            
      navigator.clipboard.writeText(sExpression);
    }                                                       
  }
  
  
  async _onCopyExpression(event){  
    this.codeEditor.save();   
    let expression=document.getElementById('sandbox-expression-editor-expression');
    if (expression!=null){
      let sExpression=expression.value      
      navigator.clipboard.writeText(sExpression);
      ui.notifications.info('Expression copied to Clipboard');
    }                                                       
  }
  
  async _onCopyExpressionPreFormatted(event){ 
    this.codeEditor.save();    
    let expression=document.getElementById('sandbox-expression-editor-expression');
    if (expression!=null){
      let sExpression=`\`\`\`tp\n` + expression.value + `\n` + `\`\`\``  ;      
      navigator.clipboard.writeText(sExpression);
      ui.notifications.info('Expression copied to Clipboard with formatting');
    }                                                       
  }
  

  async _onFontSizeIncrease(event){ 
       
    let root = document.querySelector(':root');  
    let rootStyles = getComputedStyle(root);  
    let fontsize = rootStyles.getPropertyValue('--sb-expression-editor-font-size');
    // get rid of px
    let newfontsize=parseInt(fontsize.replace("px", ""));
    if (newfontsize>0) {
      newfontsize = newfontsize + 2;
      root.style.setProperty('--sb-expression-editor-font-size', newfontsize + 'px');
    }
  }
  
  async _onFontSizeDecrease(event){        
    let root = document.querySelector(':root');  
    let rootStyles = getComputedStyle(root);  
    let fontsize = rootStyles.getPropertyValue('--sb-expression-editor-font-size');
    // get rid of px
    let newfontsize=parseInt(fontsize.replace("px", ""));
    if (newfontsize>0) {
      newfontsize = newfontsize - 2;
      if (newfontsize>0){
        root.style.setProperty('--sb-expression-editor-font-size', newfontsize + 'px');
      }
    }
  }
  
  async _onFontSizeReset(event){ 
       
    let root = document.querySelector(':root');  
    
    root.style.setProperty('--sb-expression-editor-font-size', '14px');
    
  }
  
}