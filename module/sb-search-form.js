import { sb_property_has_valid_table_filter } from "./sb-table-filters.js";
export class SandboxSearchForm extends FormApplication {
  
  constructor(options={}) {
    super(options);
    this.search_result=options.search_result  || null;
    this.search_for=options.search_for  || "";
    this.search_type=options.search_type || "key_references";
    this.search_options=options.search_options || null;
    let defaultSearchOptions={itemName:true,subItems:true,tableFilters:true,showFolders:true};
    
    this.search_options=foundry.utils.mergeObject(defaultSearchOptions, options.search_options); 
  }
  
  static initialize() {
    
    
  }   
    
  static get defaultOptions() {
    const defaults = super.defaultOptions;  
    const overrides = {
      height:800,
      width:1200,
      id: 'sb-search-form',
      template: `systems/sandbox/templates/sb-search-form.hbs`,
      classes: ["sb-search"],
      title: 'Sandbox Search',
      userId: game.userId,
      closeOnSubmit: false, // do not close when submitted
      submitOnChange: false, // do not submit when any input changes 
      resizable:true
    };  
    const mergedOptions = foundry.utils.mergeObject(defaults, overrides);    
    return mergedOptions;
  }  
  
  activateListeners(html) {
    super.activateListeners(html);  
    html.find('.sb-search-result-link').click(this._onItemClick.bind(this));
    html.find('#sb-search-form-btn-search').click(this._onSearchClick.bind(this));
    html.find('#sb-search-form-search-for').keyup(this._onSearchKeyUp.bind(this));
    html.find('#sb-search-form-btn-clear-filter').click(this._onClearFilterClick.bind(this));
    // set cursor for search
    let searchfor= document.getElementById('sb-search-form-search-for');
    searchfor.focus();
    searchfor.setSelectionRange(searchfor.value.length, searchfor.value.length);
    
  }
  
  render(force, options) {
    
    //this.position.height = null;
    //this.element.css({height: ""});
    return super.render(force, options);
  }
  
  async getData(options) {      
    let data; 
    let noResults=false;
    
    if(this.search_for.trim()!=''){  
      // run the search
      this.search_result = await searchItems(this.search_for,this.search_options);
      if(this.search_result==null){
        noResults=true;
      } else {
        if(this.search_result.length==0){
          noResults=true;
        }
      }          
    }            
    data={
      search_for:this.search_for,
      search_type:this.search_type,
      search_options:this.search_options,
      search_result:this.search_result,
      noResults:noResults
    };
    //console.log(data)
    return data;
  } 
     
  async _onSearchClick(event){
    event.preventDefault();
    // set instance data      
    this.search_for= document.getElementById('sb-search-form-search-for').value;
    this.search_type= document.querySelector('input[name="sb-search-form-search-type"]:checked').value;   
    const options = document.getElementsByClassName("sb-search-form-search-option");
    for (let i = 0; i < options.length; i++) { 
      const checked=options[i].checked;
      const optionKey=options[i].getAttribute('data-option-key');
      this.search_options[optionKey]=checked;
    }
    if(this.search_for.trim()!=''){                                
      // reload to perform the search
      this.render(true);
    }
  }
    
    
  _onItemClick(event){
    event.preventDefault();
    const itemId=event.currentTarget.getAttribute('data-item-id');
    const item=game.items.get(itemId);
    if(item!=null){
      item.sheet.render(true,{focus:true});
    }
  }
  
  _onSubmit(ev) {
    ev.preventDefault();
  }
  
  _onClearFilterClick(event){
    document.getElementById('sb-search-form-search-for').value='';
  }
   async _updateObject(event, formData) {
    //const expandedData = foundry.utils.expandObject(formData);
    //console.log('_updateObject',expandedData);

  }
  

  async _onSearchKeyUp(event){
    event.preventDefault();
    switch (event.key){
      case 'Enter':
        this._onSearchClick(event);
        break;
      case 'Escape':
        this.close();
        break;
      default:
        break;
    
    }
  }
}

async function searchItems(searchForKey,search_options){
  let search_result=[];
  let items;
  items= await game.items.filter(y => (y.type == "property"));
  for (let i = 0; i < items.length; i++) {     
    if(search_options.itemName){
      await checkThisItemName(search_result,searchForKey,items[i],'attKey','name','Name');
    }
    await checkThisItem(search_result,searchForKey,items[i],'attKey','attKey','Key');
    await checkThisItem(search_result,searchForKey,items[i],'attKey','defvalue','Default Value',null,'  ');
    await checkThisItem(search_result,searchForKey,items[i],'attKey','auto','Auto',null,'  ');
    await checkThisItem(search_result,searchForKey,items[i],'attKey','automax','Auto Max',null,'  ');
    await checkThisItem(search_result,searchForKey,items[i],'attKey','rollname','Roll Name','hasroll','  ');
    await checkThisItem(search_result,searchForKey,items[i],'attKey','rollexp','Roll Formula','hasroll','  ');
    await checkThisItem(search_result,searchForKey,items[i],'attKey','listoptionsAuto','Options Auto','listoptionsAutoUse','  ');
    await checkThisItem(search_result,searchForKey,items[i],'attKey','listoptionsLookupKey','Options lookup','listoptionsLookupUse');
    // ----------------------------    
    if(search_options.tableFilters && items[i].system.datatype=='table'){
      // check for filter
      if(items[i].system.tableoptions.filter.length>0){
        // get filter
        let filter = sb_property_has_valid_table_filter(items[i]);
        if (filter!=null){
          // loop filter
          filter.conditions.forEach(function (condition) {
            if(condition.type=='property'){
              if(condition.key.length>0 && condition.key.includes(searchForKey)){ 
                const conditionExpression=`${condition.logic} ${condition.key} ${condition.operator} ${condition.value}`;
                let result={
                  itemId:items[i].id,
                  itemImg:items[i].img,
                  itemName:items[i].name,
                  itemType:items[i].type,
                  itemKey:items[i].system.attKey,
                  folder:items[i].folder?.name || '',
                  fieldName:'Filter Condition',
                  fieldValue:markFound(conditionExpression, searchForKey )
                };
                search_result.push(result);
              }
            }
          });
        }
      }
    }
    
    // ---------------------------- 
  }
  // now panels
  items= await game.items.filter(y => (y.type == "panel"));
  for (let i = 0; i < items.length; i++) {   
    if(search_options.itemName){
      await checkThisItemName(search_result,searchForKey,items[i],'panelKey','name','Name');
    }
    await checkThisItem(search_result,searchForKey,items[i],'panelKey','panelKey','Key');
    await checkThisItem(search_result,searchForKey,items[i],'panelKey','condat','Visible If');
    if(search_options.subItems){
      for (let a = 0; a < items[i].system.properties.length; a++) {
        await checkSubItem(search_result,searchForKey,items[i],'panelKey','properties','Properties',items[i].system.properties[a],'ikey');
      }
    }
  }
  // multipanels
  items= await game.items.filter(y => (y.type == "multipanel"));
  for (let i = 0; i < items.length; i++) {        
    if(search_options.itemName){
      await checkThisItemName(search_result,searchForKey,items[i],'panelKey','name','Name');
    }
    await checkThisItem(search_result,searchForKey,items[i],'panelKey','panelKey','Key');
    await checkThisItem(search_result,searchForKey,items[i],'panelKey','condat','Visible If');
    if(search_options.subItems){
      for (let a = 0; a < items[i].system.panels.length; a++) {
        await checkSubItem(search_result,searchForKey,items[i],'panelKey','panels','Panels',items[i].system.panels[a],'ikey');
      }
    }
  }
  // sheettabs
  items= await game.items.filter(y => (y.type == "sheettab"));
  for (let i = 0; i < items.length; i++) {        
    if(search_options.itemName){
      await checkThisItemName(search_result,searchForKey,items[i],'tabKey','name','Name');
    }
    await checkThisItem(search_result,searchForKey,items[i],'tabKey','tabKey','Key');
    await checkThisItem(search_result,searchForKey,items[i],'tabKey','condat','Visible If');
    if(search_options.subItems){
      for (let a = 0; a < items[i].system.panels.length; a++) {
        await checkSubItem(search_result,searchForKey,items[i],'tabKey','panels','Panels',items[i].system.panels[a],'ikey');
      }
    }
  }
  // groups
  items= await game.items.filter(y => (y.type == "group"));
  for (let i = 0; i < items.length; i++) {
    if(search_options.itemName){
      await checkThisItemName(search_result,searchForKey,items[i],'groupKey','name','Name');
    }
    await checkThisItem(search_result,searchForKey,items[i],'groupKey','groupKey','Key');
    if(search_options.subItems){
      for (let a = 0; a < items[i].system.properties.length; a++) {
        await checkSubItem(search_result,searchForKey,items[i],'panelKey','properties','Properties',items[i].system.properties[a],'ikey');
      }
    }
  }
  // lookups
  items= await game.items.filter(y => (y.type == "lookup"));
  for (let i = 0; i < items.length; i++) {
    if(search_options.itemName){
      await checkThisItemName(search_result,searchForKey,items[i],'lookupKey','name','Name');
    }
    await checkThisItem(search_result,searchForKey,items[i],'lookupKey','lookupKey','Key');
  }
  
  return search_result;
}
async function checkSubItem(search_result,searchForKey,item,keyType,field,fieldName,subItem,subField){
  if(subItem[subField].length>0 && subItem[subField].includes(searchForKey)){    
      let result={
        itemId:item.id,
        itemImg:item.img,
        itemName:item.name,
        itemType:item.type,
        itemKey:item.system[keyType],
        folder:item.folder?.name || '',
        fieldName:fieldName,
        fieldValue:markFound(subItem[subField], searchForKey )
      };
      search_result.push(result);
    }
}

async function checkThisItemName(search_result,searchForKey,item,keyType,field,fieldName,rowbreak=null){
  if(item.name.length>0 && item.name.includes(searchForKey)){    
      let result={
        itemId:item.id,
        itemImg:item.img,
        itemName:item.name,
        itemType:item.type,
        itemKey:item.system[keyType],
        folder:item.folder?.name || '',
        fieldName:fieldName,
        fieldValue:markFound(item.name,searchForKey,rowbreak)
      };
      search_result.push(result);
    }
}

async function checkThisItem(search_result,searchForKey,item,keyType,field,fieldName,conditionField=null,rowbreak=null){
  if(conditionField==null){
    if(item.system[field].length>0 && item.system[field].includes(searchForKey)){    
      let result={
        itemId:item.id,
        itemImg:item.img,
        itemName:item.name,
        itemType:item.type,
        itemKey:item.system[keyType],
        folder:item.folder?.name || '',
        fieldName:fieldName,
        fieldValue:markFound(item.system[field], searchForKey,rowbreak )
      };
      search_result.push(result);
    }
  } else{
    if(item.system[conditionField] && item.system[field].length>0 && item.system[field].includes(searchForKey)){    
      let result={
        itemId:item.id,
        itemImg:item.img,
        itemName:item.name,
        itemType:item.type,
        itemKey:item.system[keyType],
        folder:item.folder?.name || '',
        fieldName:fieldName,
        fieldValue:markFound(item.system[field], searchForKey,rowbreak)
      };
      search_result.push(result);
    }
  }
  
}

function markFound(strExpr,searchForKey,rowbreak=null){
  let marked=strExpr;
  // change <>
  marked=marked.replaceAll('<','&#60;');
  marked=marked.replaceAll('>','&#62;');
  if(rowbreak!=null){
    marked=marked.replaceAll(rowbreak,'<br>');
  }
  marked=marked.replaceAll(searchForKey,'<span class="sb-search-found-marker">' + searchForKey + '</span>');
  return marked;
}
