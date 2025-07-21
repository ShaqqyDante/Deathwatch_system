const _title="Sandbox Lookup Table Editor";
import { SandboxKeyValidate } from "./sb-key-validate.js";
import { SystemSettingsForm } from "./system-settings-form.js";
import { sb_string_is_valid_lookup_table,
         sb_string_to_lookupTable,
         sb_lookupTable_to_string,
         sb_is_valid_lookupTable } from "./sb-lookup-table.js";
export class SandboxLookupTableEditorForm extends FormApplication {
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
    
    console.log('Initialized SandboxLookupTableEditorForm' );
  }   
    
  static get defaultOptions() {
    const defaults = super.defaultOptions;  
    const overrides = {
      classes: ["sandbox","lookuptable"],
      height: '600',
      width:'625',
      //id: 'sb-lookup-table-editor-form-' + randomID(),
      template: `systems/sandbox/templates/sb-lookup-table-editor-form.hbs`,
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
    return `sb-lookup-table-editor-form-${this.itemid}`;
  }
  
  activateListeners(html) {
    super.activateListeners(html);
    
    html.find('button[name="sb-lookup-table-editor-update"]').click(this._onUpdateLookUpTable.bind(this));  
    html.find('button[name="sb-lookup-table-editor-update-and-close"]').click(this._onUpdateLookUpTableAndClose.bind(this));
    html.find('button[name="sb-lookup-table-editor-close-editor"]').click(this._onCloseEditor.bind(this));
    
    html.find('#sb-btn-show-settings').click(this._onDisplaySandboxSettings.bind(this));
    
    html.find('.sb-lookup-table-editor-import').click(this._onImport.bind(this));
    html.find('.sb-lookup-table-editor-export ').click(this._onExport.bind(this));
    
    html.find('.sb-lookup-table-editor-copy').click(this._onCopyLookUpTable.bind(this));
    html.find('.sb-lookup-table-editor-copy-pre-formatted').click(this._onCopyLookUpTablePreFormatted.bind(this));  

    //
    this._dynamicListeners(html);    
  }
  
  _dynamicListeners(html){
    html.find('.sb-lookup-table-editor-move-row-up').click(this._moveRowUp.bind(this));
    html.find('.sb-lookup-table-editor-move-row-down').click(this._moveRowDown.bind(this));
    html.find('.sb-lookup-table-editor-delete-row').click(this._deleteRow.bind(this));
    html.find('.sb-lookup-table-editor-add-row').click(this._addRow.bind(this));
    html.find('.sb-lookup-table-editor-autogenerate-ranges').click(this._autogenerateAllRanges.bind(this));
    html.find('.sb-lookup-table-editor-fill-ranges').click(this._autogenerateFillRanges.bind(this));
    html.find('.sb-lookup-table-editor-validate').click(this._validateTable.bind(this));
    
    html.find('.sb-lookup-table-editor-add-column').click(this._addColumn.bind(this));
    html.find('.sb-lookup-table-editor-delete-column').click(this._deleteColumn.bind(this));
    
    
  }
  
  
  
  getData(options) {     
    let data; 
    // build table rows from expression
    let columns='';    
    let rows='';    
    let footer='';    
    let lookupTable = sb_string_to_lookupTable(this.expression); 
    
    if(!sb_is_valid_lookupTable(lookupTable)){
      // build default
      lookupTable={"columns":["Range Low","Range High"],"rows":[]};            
    }
    if (lookupTable!=null){
      for (let i = 0; i < lookupTable.columns.length; i++) {
        columns += _buildHeader(i,lookupTable.columns[i]);
        footer  += _buildFooterManipulator(i);        
      }
      columns += _buildHeaderManipulator();
      footer +=_buildFooterBottomLeft();
      for (let i = 0; i < lookupTable.rows.length; i++) {
        rows += _buildRow(lookupTable.rows[i]);
      }
    }        
    data={
      columns:columns,
      rows:rows,
      footer:footer,
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
  
  async _onImport(event){
    let currentinput = `worlds/${game.world.id}`;
      new FilePicker({
        current: currentinput,
        type: "csv",
        callback: filePath => this._importFile(filePath),
      }).browse();
  }
  async _importFile(filePath){
    const LISTSEPARATOR=';'
    console.log('import', filePath);
    const importdata = await fetch(filePath).then(resp => resp.text());
    let lines = importdata.split('\n');
    // clean data from empty lines
    lines=lines.filter(line => line.trim() !== '');
    // check that file has at least two lines
    if(lines.length>1){
      let columns='';    
      let rows='';    
      let footer=''; 
      let rowLine="";
      let headerLine=lines[0].trim().split(LISTSEPARATOR);   // use trim to get rid of end of line
      
      for (let i = 0; i < headerLine.length; i++) {
        columns += _buildHeader(i,headerLine[i]);
        footer  += _buildFooterManipulator(i);        
      }
      footer +=_buildFooterBottomLeft();
      columns += _buildHeaderManipulator();
      for(let line = 1; line < lines.length; line++){ 
        rowLine=lines[line].trim().split(LISTSEPARATOR); 
        rows += _buildRow(rowLine);
      }
      
      let columnsElement = document.getElementById('sb-lookup-table-editor-data-thead-row-'+this.itemid);
      let rowsElement = document.getElementById('sb-lookup-table-editor-data-tbody-'+this.itemid);
      let footerElement = document.getElementById('sb-lookup-table-editor-footer-'+this.itemid);
      // replace them
      columnsElement.innerHTML=columns;
      rowsElement.innerHTML=rows;
      footerElement.innerHTML=footer;
      //let formElement=document.getElementById('sb-lookup-table-editor-form-content');
      
      this._dynamicListeners(this.element);
    }
  }
  
  async _onExport(event) {
    let exportFile="";
    let lookupTableElement = document.getElementById('sb-lookup-table-editor-data-table-'+ this.itemid);
    let targetItemNameElement = document.getElementById('sb-lookup-table-editor-target-item-name-'+ this.itemid);
    let targetInputNameElement = document.getElementById('sb-lookup-table-editor-target-input-name-'+ this.itemid);
    
    let theader=lookupTableElement.tHead.firstElementChild;
    for (let row = 0; row < lookupTableElement.rows.length-1; row++) {
      
      for (let col = 0; col < theader.cells.length - 1; col++) {
        if(col>0){exportFile+=';';}
        if(lookupTableElement.rows[row].cells[col].firstElementChild != null){
          exportFile+=lookupTableElement.rows[row].cells[col].firstElementChild.value;
        } else {
          // no input box
          exportFile+=lookupTableElement.rows[row].cells[col].textContent;
        }
      }
      exportFile+='\n';
    }
    console.log(exportFile);
    let filename='';
    filename = game.world.id + "-"+ targetItemNameElement.value + "-" + targetInputNameElement.value + "-"+ nowToTimestamp()+".csv";
    filename=convertToValidFilename(filename);
    saveDataToFile(exportFile, "application/csv", filename);
    
  }
  
  async _validateTable(event){
    let rows = event.target.parentNode.parentNode.parentNode.parentNode.rows;
    // columns
    
    // rows
    if (rows.length > 2) {  // make room for header and manipulator
      let lastLow=null;
      let lastHigh=null;
      let currentLow=null;
      let currentHigh=null;
      for (let row = 1; row < rows.length - 1; row++) {                
        if(rows[row].cells[0].firstElementChild.value==''){
          ui.notifications.warn("Validation error. Missing or invalid low range on row " + row);
          rows[row].classList.add('sb-lookup-table-editor-warning');
          return false;
        }         
        if(rows[row].cells[1].firstElementChild.value==''){
          ui.notifications.warn("Validation error. Missing or invalid high range on row " + row);
          rows[row].classList.add('sb-lookup-table-editor-warning');
          return false;
        }
        currentLow = (Number(rows[row].cells[0].firstElementChild.value))
        currentHigh = (Number(rows[row].cells[1].firstElementChild.value))
        if(lastLow==null){
          lastLow=currentLow;        
        }
        
        if(lastHigh==null){
          lastHigh=currentHigh;
        } else {
          if(currentLow<=lastHigh){
            ui.notifications.warn("Validation error. Low range is smaller than or equal to previous high range on row " + row);
            rows[row].classList.add('sb-lookup-table-editor-warning');
            return false;
          }
        }
        
        if(currentLow>currentHigh){
          ui.notifications.warn("Validation error. Low range is larger than high range on row " + row);
          rows[row].classList.add('sb-lookup-table-editor-warning');
          return false;
        }
        lastLow=currentLow;
        lastHigh=currentHigh;
        rows[row].classList.remove('sb-lookup-table-editor-warning');
      }
    }
    ui.notifications.info("Lookup table validated successfully");
  }
  
  async _autogenerateAllRanges(event) {
    let rows = event.target.parentNode.parentNode.parentNode.parentNode.rows;
    if (rows.length > 2) {  // make room for header and manipulator
      for (let i = 1; i < rows.length - 1; i++) {
        rows[i].cells[0].firstElementChild.value = i;
        rows[i].cells[1].firstElementChild.value = i;
      }
    }
  }
  async _autogenerateFillRanges(event) {
    let rows = event.target.parentNode.parentNode.parentNode.parentNode.rows;
    if (rows.length > 2) {  // make room for header and manipulator
      let lastLow=0;
      let lastHigh=0;
      let currentLow=0;
      let currentHigh=0;
      for (let row = 1; row < rows.length - 1; row++) {
        if(rows[row].cells[0].firstElementChild.value==''){
          currentLow=lastHigh + 1;
          rows[row].cells[0].firstElementChild.value=currentLow;
        } else{            
          currentLow=Math.ceil(Number(rows[row].cells[0].firstElementChild.value))
        }
        
        if(rows[row].cells[1].firstElementChild.value==''){
          currentHigh=currentLow;
          rows[row].cells[1].firstElementChild.value=currentHigh;
        } else{        
          currentHigh=Math.ceil(Number(rows[row].cells[1].firstElementChild.value))
        }
                        
        lastLow=currentLow;
        lastHigh=currentHigh;                        
      }
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
    if (thisrowindex<numberofrows){
      // not the last row move it      
      let tbody=event.target.parentNode.parentNode.parentNode;
      let nextrow=tbody.rows[thisrowindex + 1];
      tbody.insertBefore(thisrow,nextrow);
    }    
  }
  
  async _deleteColumn(event) {
    let columnindex = event.target.parentNode.cellIndex + 1;
    // delete for each row
    let rows = event.target.parentNode.parentNode.parentNode.parentNode.rows;
    for (let i = 0; i < rows.length; i++) {
      if(i==(rows.length-1)){
        // last row
        rows[i].deleteCell(columnindex-1); // due to colspan
      } else {
        rows[i].deleteCell(columnindex);
      }
    }
  }
  
  async _deleteRow(event){
    let thisrow=event.target.parentNode.parentNode;
    let thisrowindex=thisrow.rowIndex;
    let tbody=event.target.parentNode.parentNode.parentNode;    
    tbody.deleteRow(thisrowindex-1); 
  }
  

  
  async _addColumn(event) {
    // header
    let theader = event.target.parentNode.parentNode;
    let rows = event.target.parentNode.parentNode.parentNode.parentNode.rows;
    let lookupTableElement = event.target.parentNode.parentNode.parentNode.parentNode;
    let numberofcolumns = event.target.parentNode.parentNode.cells.length;
    let thColumn = theader.insertCell(numberofcolumns - 1);  // insert cell uses td
    thColumn.classList.add('sb-lookup-table-editor-header-cell-input');

    let inputHeader = document.createElement("INPUT");
    inputHeader.setAttribute("type", "text");
    let headerCaption = "Enter column name... ";
    inputHeader.setAttribute("placeholder", headerCaption);
    
    inputHeader.classList.add('sb-lookup-table-editor-header-cell-input');
    thColumn.appendChild(inputHeader);
    // for each row in the table
    if (rows.length > 2) {  // make room for header and manipulator
      for (let i = 1; i < rows.length - 1; i++) {
        let tdData = rows[i].insertCell(numberofcolumns - 1);
        tdData.classList.add("sb-lookup-table-editor-data-cell");
        let inputData = document.createElement("INPUT");
        inputData.setAttribute("type", "text");        
        inputData.classList.add('sb-lookup-table-editor-data-input-cell');
        tdData.appendChild(inputData);

      }
    }
    // add for bottom manipulator
    let tdManipulator = rows[rows.length - 1].insertCell(numberofcolumns - 2);
    tdManipulator.classList.add("sb-lookup-table-editor-footer-cell");
    let iDeleteColumn = document.createElement('i');
    
    iDeleteColumn.setAttribute("data-tooltip", "Delete column");

    iDeleteColumn.classList.add("sb-btn");
    iDeleteColumn.classList.add("sb-lookup-table-editor-delete-column");
    iDeleteColumn.classList.add("fas");
    iDeleteColumn.classList.add("fa-trash");


    tdManipulator.appendChild(iDeleteColumn);
    tdManipulator.getElementsByClassName('sb-lookup-table-editor-delete-column')[0].addEventListener('click', async(event_delete) => {
      let columnindex = event_delete.target.parentNode.cellIndex +1;
      // delete for each row
      let rows = event_delete.target.parentNode.parentNode.parentNode.parentNode.rows;      
      for (let i = 0; i < rows.length; i++) {
        if(i==(rows.length-1)){
          // last row
          rows[i].deleteCell(columnindex-1); // due to colspan
        } else {
          rows[i].deleteCell(columnindex);
        }
      }      
    });
    
  }
  
  async _addRow(event){    
    let lookupTableElement=event.target.parentNode.parentNode.parentNode.parentNode;
    let numberofrows=event.target.parentNode.parentNode.parentNode.rows.length;
    let tbody=       event.target.parentNode.parentNode.parentNode.parentNode.tBodies[0]; 
    let theader=       event.target.parentNode.parentNode.parentNode.parentNode.tHead.firstElementChild;
    let row = tbody.insertRow(-1);
    // add from value
    let tdNumberLow=document.createElement('td');
    tdNumberLow.classList.add("sb-lookup-table-editor-value-cell");
    let inputNumberLow = document.createElement("INPUT");
    inputNumberLow.setAttribute("type", "number");                
    inputNumberLow.classList.add('sb-lookup-table-editor-value-cell');
    tdNumberLow.appendChild(inputNumberLow);
    row.appendChild(tdNumberLow);


    // add to value

    let tdNumberHigh=document.createElement('td');
    tdNumberHigh.classList.add("sb-lookup-table-editor-value-cell"); 
    let inputNumberHigh = document.createElement("INPUT");
    inputNumberHigh.setAttribute("type", "number");                
    inputNumberHigh.classList.add('sb-lookup-table-editor-value-cell');
    tdNumberHigh.appendChild(inputNumberHigh); 

    row.appendChild(tdNumberHigh);

    // for each of existing columns, add them
    if(theader.cells.length>3){  // make room for value and manipulator
      for (let i = 0; i < theader.cells.length-3; i++) {
        let tdData=document.createElement('td');
        tdData.classList.add("sb-lookup-table-editor-data-cell");
        let inputData = document.createElement("INPUT");
        inputData.setAttribute("type", "text");                    
        inputData.classList.add('sb-lookup-table-editor-data-input-cell');
        tdData.appendChild(inputData);
        row.appendChild(tdData);
      } 
    }
    // add cells for delete row
    let tdManipulator=document.createElement('td');
    tdManipulator.classList.add("sb-lookup-table-editor-manipulator-cell");
    //
    let iMoveRowUp=document.createElement('i');    
    iMoveRowUp.setAttribute("data-tooltip", "Move up");
    iMoveRowUp.classList.add("sb-btn");
    iMoveRowUp.classList.add("sb-lookup-table-editor-move-row-up");
    iMoveRowUp.classList.add("fas");
    iMoveRowUp.classList.add("fa-arrow-alt-circle-up");
    tdManipulator.appendChild(iMoveRowUp);
    //
    let iMoveRowDown=document.createElement('i');    
    iMoveRowDown.setAttribute("data-tooltip", "Move down");
    iMoveRowDown.classList.add("sb-btn");
    iMoveRowDown.classList.add("sb-lookup-table-editor-move-row-down");
    iMoveRowDown.classList.add("fas");
    iMoveRowDown.classList.add("fa-arrow-alt-circle-down");
    tdManipulator.appendChild(iMoveRowDown);
    //
    let iDeleteRow=document.createElement('i');    
    iDeleteRow.setAttribute("data-tooltip", "Delete row");
    iDeleteRow.classList.add("sb-btn");
    iDeleteRow.classList.add("sb-lookup-table-editor-delete-row");
    iDeleteRow.classList.add("fas");
    iDeleteRow.classList.add("fa-trash");
    tdManipulator.appendChild(iDeleteRow);

    row.appendChild(tdManipulator);
    // event listeners
    tdManipulator.getElementsByClassName('sb-lookup-table-editor-delete-row')[0].addEventListener('click',async(event_delete)=>{              
      let thisrow=event_delete.target.parentNode.parentNode;
      let thisrowindex=thisrow.rowIndex;
      let tbody=event_delete.target.parentNode.parentNode.parentNode;      
      tbody.deleteRow(thisrowindex-1);      
    });
    tdManipulator.getElementsByClassName('sb-lookup-table-editor-move-row-up')[0].addEventListener('click',async(event)=>{              
      let thisrow=event.target.parentNode.parentNode;
      let thisrowindex=thisrow.rowIndex;
      if (thisrowindex>1){
        // not the first row move it     
        let tbody=event.target.parentNode.parentNode.parentNode;
        let previousrow=tbody.rows[thisrowindex -2];
        tbody.insertBefore(thisrow,previousrow);
      }     
    });
    tdManipulator.getElementsByClassName('sb-lookup-table-editor-move-row-down')[0].addEventListener('click',async(event)=>{              
     let thisrow=event.target.parentNode.parentNode;
     let thisrowindex=thisrow.rowIndex;
     let numberofrows=event.target.parentNode.parentNode.parentNode.rows.length;    
     if (thisrowindex<numberofrows){
       // not the last row move it      
       let tbody=event.target.parentNode.parentNode.parentNode;
       let nextrow=tbody.rows[thisrowindex + 1];
       tbody.insertBefore(thisrow,nextrow);
     }  
    });
    
  }
  
  
  async _onUpdateLookUpTableAndClose(event) {
    //document.querySelector('button[name="sb-lookup-table-editor-update"]').click();
    //document.querySelector('button[name="sb-lookup-table-editor-close-editor"]').click(); 
    this._onUpdateLookUpTable(event);
    this._onCloseEditor(event);
  }  
  
  async _onUpdateLookUpTable(event) { 
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
      ui.notifications.warn('Lookup Table Editor: <br>Unable to update item lookup table when target item sheet is closed. <br>Attempts to open the item sheet again.  <br>Try again when its open'); 
      this.bringToTop();
    }    
    else{  
      let sLookupTable=_assembleLookupTable(this.itemid);
      target.value=sLookupTable;
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
    console.log(expandedData);
  }
 
  async _onCopyLookUpTable(event){ 
    let sLookupTable=_assembleLookupTable(this.itemid);
    if (sLookupTable!=null){            
      navigator.clipboard.writeText(sLookupTable);
      ui.notifications.info('Lookup Table copied to Clipboard');
    }                                                      
  }
  
  async _onCopyLookUpTablePreFormatted(event){       
    let sLookupTable=_assembleLookupTable(this.itemid);
    if (sLookupTable!=null){
      sLookupTable=`\`\`\`tp\n` + sLookupTable + `\n` + `\`\`\``  ;      
      navigator.clipboard.writeText(sLookupTable);
      ui.notifications.info('lookup Table copied to Clipboard with formatting');
    }                                                       
  }

};

function _assembleLookupTable(itemid){
  let lookupTableElement=document.getElementById('sb-lookup-table-editor-data-table-' + itemid);
  //console.log('_assembleLookupTable',lookupTableElement.tHead.firstElementChild);
  let theader=lookupTableElement.tHead.firstElementChild;
  let lookupTable="";
  // for header
  lookupTable='{\n\t"columns":[\n\t\t"Range Low",\n\t\t"Range High"';
  if(theader.cells.length>3){  // make room for value and manipulator
    for (let i = 2; i < theader.cells.length-1; i++) {
      lookupTable+=',\n\t\t"' + _ReplaceDoubleQuotes(theader.cells[i].firstElementChild.value) + '"';
    } 
  }            
  // close header
  lookupTable+='\n\t]';
  // for data rows
  lookupTable+=',\n\t"rows":[\n';
  if(lookupTableElement.rows.length>2){
    for (let row = 1; row < lookupTableElement.rows.length-1; row++) {
      if(row==1){
        lookupTable+='\t\t[';
      } else {
        lookupTable+=',\n\t\t[';
      }          
      for (let column = 0; column < theader.cells.length-1; column++) {
        switch (column){
          case 0:
            lookupTable+='"' + _ReplaceDoubleQuotes(lookupTableElement.rows[row].cells[column].firstElementChild.value) + '"';
            break;
          case 1:
            lookupTable+=',"' + _ReplaceDoubleQuotes(lookupTableElement.rows[row].cells[column].firstElementChild.value) + '"';
            break;
          default:
            lookupTable+=',"' + _ReplaceDoubleQuotes(lookupTableElement.rows[row].cells[column].firstElementChild.value) + '"';
            break;
        }
       
      } 
      lookupTable+=']';  
    }
  }
  // close data
  lookupTable+='\n\t]\n';
  // close table
  lookupTable+='}';
  return(lookupTable); 
}

function _ReplaceDoubleQuotes(str){
  return str.replace(/"/g, "''");
}

function _buildHeader(i,header){
  let returnvalue='';  
  switch(i){
    case 0:
      returnvalue+='<td class="sb-lookup-table-editor-header-value-cell">Range Low</td>'
      break;
    case 1:
      returnvalue+='<td class="sb-lookup-table-editor-header-value-cell">Range High</td>'
      break;
    default:
      returnvalue+='<td><input type="text" placeholder="Enter column name... " class="sb-lookup-table-editor-header-cell-input" value="' + header + '"></td>'
      break;
  }  
  return returnvalue;
}
function _buildFooterManipulator(i){
  let returnvalue='';
  switch (i){
    case 0:
      returnvalue=`<td id="sb-lookup-table-editor-footer-cell" colspan="2" class="sb-lookup-table-editor-footer-toolbar">
                    <i data-tooltip="Add row" class="sb-btn sb-lookup-table-editor-add-row fas fa-plus-circle fa-1x"></i>
                    <i data-tooltip="Autogenerate(overwrite) all ranges" class="sb-btn sb-lookup-table-editor-autogenerate-ranges fas fa-wand-magic-sparkles fa-1x"></i>
                    <i data-tooltip="Autogenerate empty ranges" class="sb-btn sb-lookup-table-editor-fill-ranges fas fa-fill fa-1x"></i>
                    <i data-tooltip="Validate table" class="sb-btn sb-lookup-table-editor-validate fas fa-spell-check fa-1x"></i>
                   </td>`;
      break;
    case 1:
      // nothing
      break;
    default:
      returnvalue=`<td class="sb-lookup-table-editor-footer-cell"><i data-tooltip="Delete column" class="sb-btn sb-lookup-table-editor-delete-column fas fa-trash"></i></td>`;
     break;  
  }
  return returnvalue;
}
function _buildFooterBottomLeft(){
  let returnvalue='<td class="sb-lookup-table-editor-bottom-right-cell"></td>'; 
  return returnvalue;
}

function _buildHeaderManipulator(){
  let returnvalue='<th class="sb-lookup-table-editor-manipulator-cell"><i data-tooltip="Add column" class="sb-btn sb-lookup-table-editor-add-column fas fa-plus-circle fa-1x"></i></th>'; 
  return returnvalue;
}
function _buildRow(row){
  let returnvalue=''; 
  returnvalue+='<tr>';
  
  for (let i = 0; i < row.length; i++) {
    switch (i){
      case 0:        
        returnvalue+=`<td class="sb-lookup-table-editor-value-cell"><input type="number" class="sb-lookup-table-editor-value-cell" value="` + row[i] +`"></td>`;
        break;
      case 1:
        returnvalue+=`<td class="sb-lookup-table-editor-value-cell"><input type="number" class="sb-lookup-table-editor-value-cell" value="` + row[i] +`"></td>`;
        break;
      default:
        returnvalue+=`<td class="sb-lookup-table-editor-data-cell"><input type="text" class="sb-lookup-table-editor-data-input-cell" value="`+ row[i] +`"></td>`;
        break;
    }   
  }
  returnvalue+=`<td class="sb-lookup-table-editor-manipulator-cell"><i class="sb-btn sb-lookup-table-editor-move-row-up fas fa-arrow-alt-circle-up" data-tooltip="Move up" ></i><i class="sb-btn sb-lookup-table-editor-move-row-down fas fa-arrow-alt-circle-down" data-tooltip="Move down" ></i><i class="sb-btn sb-lookup-table-editor-delete-row fas fa-trash" data-tooltip="Delete row"></i></td>`;
  returnvalue+='</tr>';
  return returnvalue;
}
function nowToTimestamp(){
      let today = new Date();
      let dd = String(today.getDate()).padStart(2, '0');
      let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      let yyyy = today.getFullYear();
      let HH = String(today.getHours()).padStart(2, '0');
      let nn = String(today.getMinutes()).padStart(2, '0');
      let ss = String(today.getSeconds()).padStart(2, '0');

      return yyyy + mm + dd + HH + nn + ss  ;
    }
 
  
  function convertToValidFilename(string) {
      return (string.replace(/[\/|\\:*?"<>]/g, "_"));
    }
    
   