
export class SandboxInfoForm extends FormApplication {
  
  info={
    show:{
      name:false,
      image:false,
      description:false
    },
    id:'',
    type:'',
    class:'',
    name:'',
    image:'',
    description:'',
    compendiumtype:'',
    compendiumname:'',
    reshowable:false
  };
  
  constructor(options) {    
    if(options.show.name){
      super(options, { title: options.name });
    } else{
      super(options, { title: '?' });
    }
    this.info.id = options.id || null;  
    this.info.type = options.type || null;
    this.info.class = options.class || null;
    this.info.reshowable = options.reshowable || null;
    this.info.name = options.name || null;
    this.info.image = options.image || null;
    this.info.description = options.description || null;
    this.info.compendiumtype = options.compendiumtype || '';
    this.info.compendiumname = options.compendiumname || '';
    
    this.info.show.name=options.show.name || false;
    this.info.show.image=options.show.image || false;
    this.info.show.description=options.show.description || false;
    
  }

  static initialize() {

  }   

  static get defaultOptions() { 
    
    const defaults = super.defaultOptions; 
    const overrides = {
      
      classes: ["sb-info-form","sandbox","sheet","item"],
      height:500,
      id: 'sb-info-form',
      template: `systems/sandbox/templates/sb-info-form.hbs`,
      title: `Item Information`,
      userId: game.userId,
      closeOnSubmit: false, // do not close when submitted
      submitOnChange: false, // submit when any input changes 
      resizable: true,
      width: 500,
      editable:false
    };
    const mergedOptions = foundry.utils.mergeObject(defaults, overrides);
    return mergedOptions;
  } 
  
  activateListeners(html) {
    super.activateListeners(html);
    html.find('.profile-img').click(this._showImage.bind(this));

  }
  
  _showImage(){
    let options = {
        show:{
          name:true,
          image:true,
          description:false
        },
        id:this.info.id,    
        type:this.info.type,
        class:'sb-info-form-show-name-and-image',
        name: this.info.name,
        image: this.info.image,        
        description:'',
        reshowable:this.info.reshowable,
        compendiumtype:this.info.compendiumtype,
        compendiumname:this.info.compendiumname
      };                                                                   
    let f=new SandboxInfoForm(options).render(true,{focus:true});
  }

  async getData(options) {    
    let data;  
    const showAll                 = this.info.show.name && this.info.show.image && this.info.show.description;
    const showNameAndImage        = this.info.show.name && this.info.show.image && !this.info.show.description;
    const showNameOnly            = this.info.show.name && !this.info.show.image && !this.info.show.description;
    const showImageOnly           = !this.info.show.name && this.info.show.image && !this.info.show.description;
    const showDescriptionOnly     = !this.info.show.name && !this.info.show.image && this.info.show.description;
    const showNameAndDescription  = this.info.show.name && !this.info.show.image && this.info.show.description;
    const showImageAndDescription = !this.info.show.name && this.info.show.image && this.info.show.description;
    // set some more optons
    // set the id of the app form(this is used to identify entity later)
    if(this.info.compendiumtype.length>0 && this.info.compendiumname.length>0){
      this.options.id='SandboxInfoForm-Compendium-' + this.info.compendiumtype + '-' + this.info.compendiumname + '-' +this.info.type +'-' + this.info.id ;
    } else {
      this.options.id='SandboxInfoForm-' + this.info.type + '-' + this.info.id ;
    }
    
    if(this.info.reshowable){
      this.options.classes.push("sb-info-form-reshowable");
    }
    
    if (showImageOnly){      
      this.options.classes.push("sb-info-form-dark-background");            
      this.options.classes.push("sb-info-form-show-image-only"); 
    }
    
    if (showNameAndImage){      
      this.options.classes.push("sb-info-form-dark-background");
      this.options.classes.push("sb-info-form-show-name-and-image");            
    }
    if (showAll){      
      this.options.classes.push("sb-info-form-show-all");            
    }
    
    let info = {
      show:{
        showAll:showAll,
        showNameAndImage:showNameAndImage,
        showNameOnly:showNameOnly,
        showImageOnly:showImageOnly,
        showDescriptionOnly:showDescriptionOnly,
        showNameAndDescription:showNameAndDescription,
        showImageAndDescription:showImageAndDescription
      },
      id:'iteminfo-'+ this.info.id,
      type:this.info.type,
      image:this.info.image,
      name:this.info.name,
      description:this.info.description
    };
    data = {      
      button:false,
      editable:false,
      owner:false,
      info: info,
      data:{
        flags:{scrollable:{}},
        data:{
          description:this.info.description
        }
      }
    };
    let secrets = false;
    if (game.user.isGM) secrets = true;
    data.enrichedBiography = await TextEditor.enrichHTML(data.data.data.description, {secrets:secrets,documents:true,links:true, entities:true,async: true});
    return data;
  }


async _updateObject(event, formData) {
    const expandedData = foundry.utils.expandObject(formData);
    console.log(expandedData);

  }
  
async scrollBarTest(basehtml) {
      const wcontent = await this._element[0].getElementsByClassName("window-content");
      let newheight = parseInt(wcontent[0].offsetHeight) - 111;

      const html = await basehtml.find(".scrollable");
      for (let i = 0; i < html.length; i++) {
          let scrollNode = html[i];
          scrollNode.style.height = newheight + "px";

      }

  }
}

