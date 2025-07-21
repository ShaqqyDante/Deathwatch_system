const _title="Sandbox Table Filter Editor";
import { SandboxKeyValidate } from "./sb-key-validate.js";
import { SystemSettingsForm } from "./system-settings-form.js";
import { sb_string_is_valid_table_filter } from "./sb-table-filters.js";
import { auxMeth } from "./auxmeth.js";
export class SandboxTableFilterEditorForm extends FormApplication {
  static expression='';
  static item=''; 
  static isSplittedByTwoSpaces=false;
  static isSplittedByComma=false;
  static isSplittedBySemiColon=false;
  
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
    else{
      this.isSplittedByTwoSpaces=true;
    }
    
    if (this.expression!=null){
      if(this.expression.length>0){                
        //const regex = \b\s\s\b/g;  // replace two spaces with new line
        this.expression=this.expression.split(this.itemlinebreaker).join("\n")
      }
    }
  }

  static initialize() {
    
    console.log('Initialized SandboxTableFilterEditorForm' );
  }   
    
  static get defaultOptions() {
    const defaults = super.defaultOptions;  
    const overrides = {
      classes: ["sandbox","tablefilter"],
      height: '600',
      width:'625',
      //id: 'sb-table-filter-editor-form',
      template: `systems/sandbox/templates/sb-table-filter-editor-form.hbs`,
      title: _title,
      userId: game.userId,
      closeOnSubmit: true, // do not close when submitted
      submitOnChange: false, // submit when any input changes 
      resizable:true
    };  
    const mergedOptions = foundry.utils.mergeObject(defaults, overrides);    
    return mergedOptions;
  }  
  
  get id() {
    return `sb-table-filter-editor-form-${this.itemid}`;
  }
  
  activateListeners(html) {
    super.activateListeners(html);
    
    html.find('button[name="update-table-filter"]').click(this._onUpdateTableFilter.bind(this));  
    html.find('button[name="update-table-filter-and-close"]').click(this._onUpdateTableFilterAndClose.bind(this));
    html.find('button[name="close-editor"]').click(this._onCloseEditor.bind(this));
    
    html.find('#sb-btn-show-settings').click(this._onDisplaySandboxSettings.bind(this));
    html.find('.copy-table-filter').click(this._onCopyTableFilter.bind(this));
    html.find('.copy-table-filter-pre-formatted').click(this._onCopyTableFilterPreFormatted.bind(this));  

    //
    html.find('.sb-table-filter-editor-move-row-up').click(this._moveRowUp.bind(this));
    html.find('.sb-table-filter-editor-move-row-down').click(this._moveRowDown.bind(this));
    html.find('.sb-table-filter-editor-delete-row').click(this._deleteRow.bind(this));
    html.find('.sb-table-filter-editor-add-row').click(this._addRow.bind(this));
    
    
    html.find('.sb-table-filter-editor-type').change(this._conditionTypeChange.bind(this));
    html.find('.sb-table-filter-editor-key').change(this._conditionKeyChange.bind(this));
  }
  
  
  
  async getData(options) {     
    let data; 
    // build table rows from expression
    let filtertable='';    
    let filter = sb_string_is_valid_table_filter(this.expression); 
    let itemid=this.itemid;
    if (filter!=null){      
      for(const condition of filter.conditions){
        filtertable += await _buildInputRow(condition,itemid); 
      }      
    }        
    data={
      expression:filtertable,
      itemid:this.itemid,
      itemname:this.itemname,
      itemtype:this.itemtype,
      itemlabel:this.itemlabel,               
      isSplittedBySingleSpace:this.isSplittedBySingleSpace,
      isSplittedByTwoSpaces:this.isSplittedByTwoSpaces,
      isSplittedBySemiColon:this.isSplittedBySemiColon,
      isSplittedByComma:this.isSplittedByComma
    }
    return data;
  }    
  
  async _conditionKeyChange(event){
    let thisrow=event.target.parentNode.parentNode;
    let thisrowindex=thisrow.rowIndex;
    let tbody=event.target.parentNode.parentNode.parentNode;
    let key_td_for_this_row=tbody.rows[thisrowindex-1].cells[2];
    let type_td_for_this_row=tbody.rows[thisrowindex-1].cells[1];
    let value_td_for_this_row=tbody.rows[thisrowindex-1].cells[4];
    let key=event.target.value;
    // get type
    const type=type_td_for_this_row.getElementsByClassName('sb-table-filter-editor-type')[0].value;
    switch(type){
      case 'citem':
        switch(key){
          case 'isactive':
          case 'rechargable':
            // change into a true/false select
            value_td_for_this_row.innerHTML=_build_table_value_select_boolean('');
            break;
          case 'usetype':
            // change into a usetype select
            value_td_for_this_row.innerHTML=_build_table_value_select_usetype('');
            break;
          default:
            value_td_for_this_row.innerHTML=_build_value_input('');
            break;
        }
        break;
      case 'table':
        value_td_for_this_row.innerHTML=_build_value_input('');
        break;
      case 'property':
        // get property from db by key
        let property=game.items.find(y=>y.type=="property" && y.system.attKey==key);
        if (property!=null){          
          switch(property.system.datatype){
            case 'checkbox':
              value_td_for_this_row.innerHTML=_build_table_value_select_boolean('');
              break;
            case 'list':
              // get option list
              let list =await auxMeth.getListPropertyOptions(property);
              value_td_for_this_row.innerHTML=_build_table_value_select_from_list(list,'');  
              //value_td_for_this_row.innerHTML=_build_table_value_datalist_from_list(key,list,'');
              break;
            default:
              value_td_for_this_row.innerHTML=_build_value_input('');
              break;
          }
          
        } else {
          value_td_for_this_row.innerHTML=_build_value_input('');
        }
        break;
    }
  }
 
  async  _conditionTypeChange(event){
    let thisrow=event.target.parentNode.parentNode;
    let thisrowindex=thisrow.rowIndex;
    let tbody=event.target.parentNode.parentNode.parentNode;
    let key_td_for_this_row=tbody.rows[thisrowindex-1].cells[2];
    let value_td_for_this_row=tbody.rows[thisrowindex-1].cells[4];
    switch(event.target.value){
      case 'citem':
        // changes the key input to a select
        key_td_for_this_row.innerHTML=_build_type_citem_keys_select('');
        key_td_for_this_row.getElementsByClassName('sb-table-filter-editor-key')[0].addEventListener('change',e=>{this._conditionKeyChange(e);});
        value_td_for_this_row.innerHTML=_build_value_input('');
        break;
      case 'table':
        // changes the key input to a select
        key_td_for_this_row.innerHTML=_build_type_table_keys_select('');
        key_td_for_this_row.getElementsByClassName('sb-table-filter-editor-key')[0].addEventListener('change',e=>{this._conditionKeyChange(e);});
        value_td_for_this_row.innerHTML=_build_value_input('');
        break;
      case 'property':
        // changes the key select to a input
        //console.log('prop')
        let usesimpleinput=true;        
        let property=game.items.find(y=>y.type=="property" && y.id==this.itemid && y.system.datatype=='table');
        if(property!=null){
          // use the table property group id
          let group=game.items.find(y=>y.type=="group" && y.system.groupKey==property.system.group.ikey);
          // make sure the group exists
          if(group!=null){
            usesimpleinput=false;            
            key_td_for_this_row.innerHTML=_build_type_property_keys_select('',group); // Upcoming, selectable properties            
          }
        } 
        if (usesimpleinput){
          key_td_for_this_row.innerHTML=_build_type_property_keys_input('');
          value_td_for_this_row.innerHTML=_build_value_input('');
        }        
        key_td_for_this_row.getElementsByClassName('sb-table-filter-editor-key')[0].addEventListener('change',e=>{this._conditionKeyChange(e);});
        // trigger this event to get value input        
        const event = new Event("change");;
        key_td_for_this_row.getElementsByClassName('sb-table-filter-editor-key')[0].dispatchEvent(event);
        
        break;
    }
  }
 
  async _moveRowUp(event){
    let thisrow=event.target.parentNode.parentNode;
    let thisrowindex=thisrow.rowIndex;
    if (thisrowindex>1){
      // not the first row move it     
      let tbody=event.target.parentNode.parentNode.parentNode;
      let previousrow=tbody.rows[thisrowindex -2];
      tbody.insertBefore(thisrow,previousrow);
    }    
  }
  
  async _moveRowDown(event){
    let thisrow=event.target.parentNode.parentNode;
    let thisrowindex=thisrow.rowIndex;
    let numberofrows=event.target.parentNode.parentNode.parentNode.rows.length;    
    if (thisrowindex<numberofrows-1){
      // not the last row move it      
      let tbody=event.target.parentNode.parentNode.parentNode;
      let nextrow=tbody.rows[thisrowindex +1];
      tbody.insertBefore(thisrow,nextrow);
    }    
  }
  
  async _deleteRow(event){
    let thisrow=event.target.parentNode.parentNode;
    let thisrowindex=thisrow.rowIndex;
    let tbody=event.target.parentNode.parentNode.parentNode;
    tbody.deleteRow(thisrowindex-1);
  }
  async _addRow(event){    
    let numberofrows=event.target.parentNode.parentNode.parentNode.rows.length;
    let tbody=event.target.parentNode.parentNode.parentNode;    
    let row = tbody.insertRow(numberofrows-1);
    let celllogic = row.insertCell(0);
    celllogic.innerHTML=_build_logic_select('');
    let celltype = row.insertCell(1);
    celltype.innerHTML=_build_type_select('');
    // add event listener
    celltype.getElementsByTagName("select")[0].addEventListener('change',e=> {this._conditionTypeChange(e);});            
    let cellkey = row.insertCell(2);
    cellkey.innerHTML=_build_type_citem_keys_select('');
    // add event listerner
    //html.find('.sb-table-filter-editor-key').change(this._conditionKeyChange.bind(this));
    cellkey.getElementsByClassName('sb-table-filter-editor-key')[0].addEventListener('change',e=>{this._conditionKeyChange(e);});
    
    let celloperator = row.insertCell(3);
    celloperator.innerHTML=_build_operator_select('');
    let cellvalue = row.insertCell(4);
    cellvalue.innerHTML=_build_value_input('');
    let cellmanipulators = row.insertCell(5);
    cellmanipulators.innerHTML=_build_manipulators();
    // add event listener
    cellmanipulators.getElementsByClassName('sb-table-filter-editor-move-row-up')[0].addEventListener('click',e=>{this._moveRowUp(e);});
    cellmanipulators.getElementsByClassName('sb-table-filter-editor-move-row-down')[0].addEventListener('click',e=>{this._moveRowDown(e);});
    cellmanipulators.getElementsByClassName('sb-table-filter-editor-delete-row')[0].addEventListener('click',e=>{this._deleteRow(e);});
    
  }
  
  
  async _onUpdateTableFilterAndClose(event) {
    //document.querySelector('button[name="update-table-filter"]').click();
    //document.querySelector('button[name="close-editor"]').click(); 
    this._onUpdateTableFilter(event);
    this._onCloseEditor(event);    
  }  
  
  async _onUpdateTableFilter(event) { 
    event.preventDefault(); 
    
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
      ui.notifications.warn('Table Filter Editor: <br>Unable to update item table filter when target item sheet is closed. <br>Attempts to open the item sheet again.  <br>Try again when its open'); 
      this.bringToTop();
    }    
    else{  
      let sfilter=_assembleJSONFilter(this.itemid);
      target.value=sfilter;
      // trigger onchange event
      const event = new Event('change', { bubbles: true });  
      target.dispatchEvent(event); 
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
    //console.log(expandedData);
  }
 
  async _onCopyTableFilter(event){ 
    let sfilter=_assembleJSONFilter(this.itemid);
    if (sfilter!=null){            
      navigator.clipboard.writeText(sfilter);
      ui.notifications.info('Table filter copied to Clipboard');
    }                                                      
  }
  
  async _onCopyTableFilterPreFormatted(event){       
    let sfilter=_assembleJSONFilter(this.itemid);
    if (sfilter!=null){
      sfilter=`\`\`\`tp\n` + sfilter + `\n` + `\`\`\``  ;      
      navigator.clipboard.writeText(sfilter);
      ui.notifications.info('Table filter copied to Clipboard with formatting');
    }                                                       
  }
  


  
};

function _assembleJSONFilter(itemid){
  let sfilter='';
  let filtertable=document.getElementById('sb-table-filter-editor-data-tbody-' + itemid);      
  if (filtertable!=null){
    let sLogic;
    let sType;
    let sKey;
    let sOperator;
    let sValue;
    if (filtertable.rows.length>1){
      sfilter='{"conditions":[\n';
      // loop filtertable and construnct json filter
      for (let i = 0, row; i<filtertable.rows.length-1; i++) {
         //iterate through rows, get the inputs/selects of each cell
         sLogic = filtertable.rows[i].cells[0].getElementsByTagName("select")[0].value;
         sType =  filtertable.rows[i].cells[1].getElementsByTagName("select")[0].value;         
         sKey =  filtertable.rows[i].cells[2].getElementsByTagName("*")[0].value;
         
         sOperator =  filtertable.rows[i].cells[3].getElementsByTagName("select")[0].value;
         sValue  =  filtertable.rows[i].cells[4].getElementsByClassName('sb-table-filter-editor-value')[0].value;
         // assemble json row
         sfilter += '{"logic":"'+sLogic+'","type":"'+sType+'","key":"'+sKey+'","operator":"'+sOperator+'","value":"'+sValue+'"}';
         if(i<filtertable.rows.length-2){
           sfilter += ',\n'
         } else {
           sfilter += '\n'
         }
      }
      // close filter
      sfilter += ']}'
    }    
  }
  //console.warn(sfilter);
  return sfilter;
}

async function _buildInputRow(condition,itemid){
    let returnvalue='';
    let htmlinput='';
    // add for logic
    htmlinput+=`<td>`;
    htmlinput+=_build_logic_select(condition.logic);    
    htmlinput+='</td>';
    // type
    htmlinput+=`<td>`;
    htmlinput+=_build_type_select(condition.type);  
    htmlinput+='</td>';
    // key
    
    if(condition.type=='citem'){      
      htmlinput+=`<td>`;
      htmlinput+=_build_type_citem_keys_select(condition.key);
      
      htmlinput+='</td>';
    } else if (condition.type=='table'){
      htmlinput+=`<td>`;
      htmlinput+=_build_type_table_keys_select(condition.key);
      htmlinput+='</td>';
    } else {
      // meaning property
      htmlinput+=`<td>`;            
      let usesimpleinput=true;        
        let property=game.items.find(y=>y.type=="property" && y.id==itemid && y.system.datatype=='table');
        if(property!=null){
          // use the table property group id
          let group=game.items.find(y=>y.type=="group" && y.system.groupKey==property.system.group.ikey);
          // make sure the group exists
          if(group!=null){
            usesimpleinput=false;            
            htmlinput+=_build_type_property_keys_select(condition.key,group); 
          }
        } 
        if (usesimpleinput){
          htmlinput+=_build_type_property_keys_input(condition.key);
        }
      //
      htmlinput+='</td>';
    }
     
    
    // operator
    htmlinput+=`<td>`;
    htmlinput+=_build_operator_select(condition.operator);  
    htmlinput+='</td>';
    // value
    htmlinput+=`<td>`;
    if(condition.type=='citem'){
      switch(condition.key){
          case 'isactive':
          case 'rechargable':
            // change into a true/false select
            htmlinput+=_build_table_value_select_boolean(condition.value);
            break;
          case 'usetype':
            // change into a usetype select
            htmlinput+= _build_table_value_select_usetype(condition.value);
            break;
          default:
            htmlinput+= _build_value_input(condition.value);
            break;
        }
    } else if (condition.type=='table'){
      htmlinput+= _build_value_input(condition.value);
    } else {
      // property
      let property=game.items.find(y=>y.type=="property" && y.system.attKey==condition.key);
      if (property!=null){
        switch(property.system.datatype){
          case 'checkbox':
            htmlinput+=_build_table_value_select_boolean(condition.value);
            break;
          case 'list':
            // get option list
            let list =await auxMeth.getListPropertyOptions(property);
            htmlinput+=_build_table_value_select_from_list(list,condition.value); 
            //htmlinput+=_build_table_value_datalist_from_list(condition.key,list,condition.value)
            break;
          default:
            htmlinput+=_build_value_input(condition.value);
            break;
        }                                                     
      } else {
        htmlinput+= _build_value_input(condition.value);
      }
    }        
    htmlinput+='</td>';
    
  
  // add manipulators
    htmlinput+='<td class="sb-table-filter-editor-table-tbody-td-manipulator">';
    htmlinput+=_build_manipulators();
    htmlinput+='</td>'
    // add row tags
    if (htmlinput.length>0){
      returnvalue='<tr>' + htmlinput + '</tr>';      
    }
    return returnvalue;
  }

  
  function _build_manipulators() {
    let returnvalue = '';
    returnvalue += `<i class="sb-btn sb-table-filter-editor-move-row-up fas fa-arrow-alt-circle-up" data-tooltip="Move up" ></i>
    <i class="sb-btn sb-table-filter-editor-move-row-down fas fa-arrow-alt-circle-down" data-tooltip="Move down" ></i>
    <i class="sb-btn sb-table-filter-editor-delete-row fas fa-trash" data-tooltip="Delete condition" ></i>`;       
    return returnvalue;
  }
  
  function _build_value_input(currentvalue) {
    let returnvalue = '';
    returnvalue += `<input type="text" value="`+ currentvalue +`" class="sb-table-filter-editor-value"/>`;       
    return returnvalue;
  }
  
  
  function _build_operator_select(currentvalue){
    let returnvalue = '';
    returnvalue+=`<select class="sb-table-filter-editor-operator">`;
    returnvalue+=_buildOption('==',currentvalue);
    returnvalue+=_buildOption('!=',currentvalue);
    returnvalue+=_buildOption('<',currentvalue);
    returnvalue+=_buildOption('>',currentvalue);
    returnvalue+=_buildOption('<=',currentvalue);
    returnvalue+=_buildOption('>=',currentvalue);
    returnvalue+=_buildOption('startswith',currentvalue);
    returnvalue+=_buildOption('endswith',currentvalue);
    returnvalue+=_buildOption('includes',currentvalue);
    returnvalue+='</select>';
    return returnvalue;
  }
  
  function _build_type_select(currentvalue){
    let returnvalue = '';
    returnvalue+=`<select class="sb-table-filter-editor-type">`;
    returnvalue+=_buildOption('citem',currentvalue);
    returnvalue+=_buildOption('property',currentvalue);
    returnvalue+=_buildOption('table',currentvalue);    
    returnvalue+='</select>';
    return returnvalue;
  }
  
  function _build_logic_select(currentvalue){
    let returnvalue = '';
    returnvalue+=`<select class="sb-table-filter-editor-logic">`;
    returnvalue+=_buildOption('AND',currentvalue);
    returnvalue+=_buildOption('AND NOT',currentvalue);
    returnvalue+=_buildOption('OR',currentvalue);
    returnvalue+=_buildOption('OR NOT',currentvalue);
    returnvalue+=_buildOption('IGNORE',currentvalue);
    returnvalue+='</select>';
    return returnvalue;
  }
  
  function _build_type_citem_keys_select(currentvalue) {
    let returnvalue = '';
    returnvalue += `<select class="sb-table-filter-editor-key">`;
    returnvalue += _buildOption('name', currentvalue);
    returnvalue += _buildOption('isactive', currentvalue);
    returnvalue += _buildOption('maxuses', currentvalue);
    returnvalue += _buildOption('number', currentvalue);
    returnvalue += _buildOption('uses', currentvalue);
    returnvalue += _buildOption('usetype', currentvalue);
    returnvalue += _buildOption('rechargable', currentvalue);
    returnvalue += '</select>';
    return returnvalue;
  }
  
  function _build_type_table_keys_select(currentvalue) {
    let returnvalue = '';
    returnvalue += `<select class="sb-table-filter-editor-key">`;
    returnvalue += _buildOption('count', currentvalue);

    returnvalue += '</select>';
    return returnvalue;
  }
  
  function _build_type_property_keys_input(currentvalue) {
    let returnvalue = '';
    returnvalue += `<input type="text" value="`+ currentvalue +`" class="sb-table-filter-editor-key"/>`;       
    return returnvalue;
  }
  
  
  function _build_type_property_keys_select(currentvalue,group) {    
    let returnvalue = '';
    returnvalue += `<select class="sb-table-filter-editor-key">`;    
    for (let i = 0; i < group.system.properties.length; i++) {      
      returnvalue += _buildOption(group.system.properties[i].ikey, currentvalue);
    }     
    returnvalue += '</select>';
    return returnvalue;
  }
  
  
  function _build_table_value_select_boolean(currentvalue) {
    let returnvalue = '';
    returnvalue += `<select class="sb-table-filter-editor-value">`;
    returnvalue += _buildOption('true', currentvalue);
    returnvalue += _buildOption('false', currentvalue);
    returnvalue += '</select>';
    return returnvalue;
  }
    
  
  function _build_table_value_select_from_list(list,currentvalue) {
    let returnvalue = '';
    returnvalue += `<select class="sb-table-filter-editor-value">`;
    // convert to array
    let listArr = list.split('|');
    for (let i = 0; i < listArr.length; i++) {      
      returnvalue += _buildOption(listArr[i], currentvalue);
    }    
    returnvalue += '</select>';
    return returnvalue;
  }
  
  function _build_table_value_datalist_from_list(id,list,currentvalue) {
    let returnvalue = '';
    returnvalue += `<input list="sb-table-filter-editor-value-datalist-`+id+`" id="sb-table-filter-editor-value-`+id+`" class="sb-table-filter-editor-value" value="`+currentvalue+`"/>`;
    returnvalue += `<datalist id="sb-table-filter-editor-value-datalist-`+id+`">`;
    // convert to array
    let listArr = list.split(',');
    for (let i = 0; i < listArr.length; i++) {      
      returnvalue += _buildOption(listArr[i], currentvalue);
    }    
    returnvalue += '</datalist>';
    return returnvalue;
  }
  
  
  function _build_table_value_select_usetype(currentvalue) {
    let returnvalue = '';
    returnvalue += `<select class="sb-table-filter-editor-value">`;
    returnvalue += _buildOption('PAS', currentvalue);
    returnvalue += _buildOption('ACT', currentvalue);
    returnvalue += _buildOption('CON', currentvalue);    
    returnvalue += '</select>';
    return returnvalue;
  }
  
  
  function _buildOption(value,currentvalue){
   let returnvalue='';
    if (value==currentvalue){
      returnvalue=`<option value="`+value+`" selected>`+value+`</option>  `;
    } else {
      returnvalue=`<option value="`+value+`">`+value+`</option>  `;
    }
    
    return returnvalue;
  }