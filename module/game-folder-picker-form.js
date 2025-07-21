export class GameFolderPicker extends FormApplication {
  
//  static current='';
//  static type='';
//  static callback;
//  static selectedFolderId='';
  constructor(options) {
    super(options);
    this.current_name=options.current_name  || null;
    this.current_folder=options.current_folder  || null;
    this.current_id=options.current_id  || null;
    this.type=options.type || null;
    this.callback=options.callback || null;
    this.field = options.field|| null;
  }
  
  static initialize() {
    
    
  }   
    
  static get defaultOptions() {
    const defaults = super.defaultOptions;  
    const overrides = {
      
      width:520,
      id: 'game-folder-picker-form',
      template: `systems/sandbox/templates/game-folder-picker-form.hbs`,
      classes: ["gamefolderpicker"],
      title: 'Game Folder Browser',
      userId: game.userId,
      closeOnSubmit: false, // do not close when submitted
      submitOnChange: false, // submit when any input changes 
      resizable:false
    };  
    const mergedOptions = foundry.utils.mergeObject(defaults, overrides);    
    return mergedOptions;
  }  
  
  activateListeners(html) {
    super.activateListeners(html);  
    html.find('.game-folder-picker-form-folder').click(this._onFolderClick.bind(this));
    html.find('#game-folder-picker-form-home').click(this._onHomeClick.bind(this));
    html.find('#game-folder-picker-form-back').click(this._onBackClick.bind(this));
    html.find('#game-folder-picker-form-btn-cancel').click(this._onCancelClick.bind(this));
  }
  
  render(force, options) {
    
    this.position.height = null;
    this.element.css({height: ""});
    return super.render(force, options);
  }
  
  async getData(options) {      
    let data; 
    let  foldersInCurrent=[];
    let noResults=false;
    if(this.current_id!=null){
      let currentFolder=await game.folders.find(y=>y.type==this.type && y.id==this.current_id);
      if (currentFolder!=null){
        this.current_name=currentFolder.name;
        if(currentFolder.folder!=null){
          this.current_folder=currentFolder.folder.id;
        } else{
          this.current_folder=null;
        }
      } else {
        this.current_name=null;
        this.current_folder=null;
      }
    } else {
      this.current_name=null;
      this.current_folder=null;
    }
    let gameFolders=null;
    if(this.current_id==null){
      gameFolders=await game.folders.filter(y=>y.type==this.type && y.folder==this.current_id);
    } else {
      gameFolders=await game.folders.filter(y=>y.type==this.type && y.folder!=null && y.folder._id==this.current_id);
    }
      
    if(gameFolders!=null){
      gameFolders.forEach((el) => {
        let  folder={'id':'','name':'','folder':''};
        folder.id=el.id;
        folder.name=el.name;
        if (el.folder!=null){
          folder.folder=el.folder._id;
        } else {
          folder.folder=null
        }
                                      
        foldersInCurrent.push(folder)        
      });
    }
    
    if (foldersInCurrent.length==0) 
      noResults=true;
    
    
    
    let canGoBack=false
    if(this.current_id!=null){
      canGoBack=true
    }
    
    data={
      current_id:this.current_id,
      current_name:this.current_name,
      current_folder:this.current_folder,
      type:this.type,
      foldersInCurrent,foldersInCurrent,
      noResults:noResults,      
      canGoBack:canGoBack
    }
    //console.log(data)
    return data;
  } 
  
  async _updateObject(event, formData) {
    const expandedData = foundry.utils.expandObject(formData);
    console.log('_updateObject',expandedData);

  }
  
  async _onBackClick(event){
    this.current_id=this.current_folder;
    this.render(true)
  }
  
  async _onHomeClick(event){
    this.current_id=null;
    this.render(true) 
  }
  
  async _onFolderClick(event){
     event.preventDefault();
    //console.log('_onFolderClick',event.target.innerText,event)    
    let clicked = document.getElementById(event.target.id);    
    this.current_id=clicked.getAttribute("data-folderid");
    this.render(true);
  }
  
  
  _onSubmit(ev) {
    ev.preventDefault();
    
    //let folder = ev.target.folder.value;
    //this.selectedFolderId=element.getAttribute("data-folderid");
    let selected = document.getElementById('game-folder-picker-selected');
    const folderName=selected.value;
    const folderID=selected.getAttribute("data-folderid");
    const folderFolder=selected.getAttribute("data-folderfolder");
    let folder={'id':folderID,'name':folderName,'folder':folderFolder}

    // Update the target field
    if ( this.field ) {
      this.field.value = folder;
      this.field.dispatchEvent(new Event("change", {bubbles: true}));
    }

    // Trigger a callback and close
    if ( this.callback ) this.callback(folder, this);
    return this.close();
  
  }
  
  _onCancelClick(event){
    this.close();
  }
}
