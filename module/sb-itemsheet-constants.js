  // constants used for handling items
  // 
  
  export const ITEM_SHEET_DEFAULT_HEIGHT=500+55; // default + detail menu height

  export const ITEM_SHEET_HEIGHT={
    DEFAULT:ITEM_SHEET_DEFAULT_HEIGHT,
    PROPERTY:ITEM_SHEET_DEFAULT_HEIGHT,
    PANEL:ITEM_SHEET_DEFAULT_HEIGHT + 95,
    MULTIPANEL:ITEM_SHEET_DEFAULT_HEIGHT,
    GROUP:ITEM_SHEET_DEFAULT_HEIGHT,
    LOOKUP:ITEM_SHEET_DEFAULT_HEIGHT,
    SHEETTAB:ITEM_SHEET_DEFAULT_HEIGHT,
    CITEM:ITEM_SHEET_DEFAULT_HEIGHT
  }; 

  export const ITEM_SHEET_PROPERTY_HEIGHT={

      SIMPLETEXT     : 680,
      SIMPLENUMERIC  : 720,
      CHECKBOX       : 790,
      RADIO          : 750,
      TEXTAREA       : 650,
      LIST           : 850,
      LABEL          : 560,
      BADGE          : 680,
      TABLE          : 805,
      BUTTON         : 480

  }; 
  export const ITEM_SHEET_DEFAULT_WIDTH=600;

  export const ITEM_SHEET_TABS={
    PROPERTY:{
      DESCRIPTION:'description',
      DETAILS:'details'
    },
    PANEL:{
      DESCRIPTION:'description',
      DETAILS:'details',
      PROPERTIES:'properties'
    },
    MULTIPANEL:{
      DESCRIPTION:'description',
      DETAILS:'details',
      PANELS:'properties'
    },
    GROUP:{
      DESCRIPTION:'description',
      DETAILS:'details',
      PROPERTIES:'properties'
    },
    LOOKUP:{
      DESCRIPTION:'description',
      DETAILS:'details'
    },
    SHEETTAB:{
      DESCRIPTION:'description',
      DETAILS:'details',
      PANELS:'properties'
    },
    CITEM:{
      DESCRIPTION:'description',
      ATTRIBUTES:'attributes',
      DETAILS:'attributes',
      GROUPS:'groups',
      MODS:'mods'
    }
  };
  
  
  export  const TYPECLASS={
    ITEM:'ITEM',
    PROPERTY:'PROPERTY',
    MULTIPANEL:'MULTIPANEL',
    PANEL:'PANEL',
    TAB:'TAB',
    GROUP:'GROUP',
    LOOKUP:'LOOKUP',
    CITEM:'CITEM'
  };
  
  // The order attributes appear in this object are used for exports
  export const ITEMATTRIBUTE={
    ITEM:{
      NAME:                  {ATTRIBUTE:'name',              IDENTIFIER:'input[name="name"]',                CAPTION:'Name'               ,LINEBREAKER:''    ,DEFAULT:''}, 
      TYPECLASS:             {ATTRIBUTE:'typeclass',         IDENTIFIER:'.typelabel',                        CAPTION:'Item Type'          ,LINEBREAKER:''    ,DEFAULT:''}
    },  
    
    PROPERTY:{
      DATATYPE:              {ATTRIBUTE:'datatype',          IDENTIFIER:'select[name="system.datatype"]',      CAPTION:'Data Type'          ,LINEBREAKER:''    ,DEFAULT:''},
      KEY:                   {ATTRIBUTE:'key',               IDENTIFIER:'input[name="system.attKey"]',         CAPTION:'Key'                ,LINEBREAKER:''    ,DEFAULT:''},
      DEFAULT:               {ATTRIBUTE:'default',           IDENTIFIER:'input[name="system.defvalue"]',       CAPTION:'Default Value'      ,LINEBREAKER:''    ,DEFAULT:''},
      TAG:                   {ATTRIBUTE:'tag',               IDENTIFIER:'input[name="system.tag"]',            CAPTION:'Tag'                ,LINEBREAKER:''    ,DEFAULT:''}, 
      TOOLTIP:               {ATTRIBUTE:'tooltip',           IDENTIFIER:'textarea[name="system.tooltip"]',     CAPTION:'Tooltip'            ,LINEBREAKER:'\n'    ,DEFAULT:''},
      TABLEFILTER:           {ATTRIBUTE:'tablefilter',       IDENTIFIER:'textarea[name="system.tableoptions.filter"]',     CAPTION:'Table Filter'       ,LINEBREAKER:'\n'    ,DEFAULT:''},
      
      ISHIDDEN:              {ATTRIBUTE:'ishidden',          IDENTIFIER:'input[name="system.ishidden"]',       CAPTION:'Hidden'             ,LINEBREAKER:''    ,DEFAULT:'false'},
      EDITABLE:              {ATTRIBUTE:'editable',          IDENTIFIER:'input[name="system.editable"]',       CAPTION:'Editable'           ,LINEBREAKER:''    ,DEFAULT:'true'}, 
      HASLABEL:              {ATTRIBUTE:'haslabel',          IDENTIFIER:'input[name="system.haslabel"]',       CAPTION:'Has Label'          ,LINEBREAKER:''    ,DEFAULT:'true'},     
      LABELSIZE:             {ATTRIBUTE:'labelsize',         IDENTIFIER:'select[name="system.labelsize"]',     CAPTION:'Label Size'         ,LINEBREAKER:''    ,DEFAULT:'Fit'},
      LABELFORMAT:           {ATTRIBUTE:'labelformat',       IDENTIFIER:'select[name="system.labelformat"]',   CAPTION:'Label Format'       ,LINEBREAKER:''    ,DEFAULT:'Normal'},
      INPUTSIZE:             {ATTRIBUTE:'inputsize',         IDENTIFIER:'select[name="system.inputsize"]',     CAPTION:'Input Size'         ,LINEBREAKER:''    ,DEFAULT:'Fit'}, 
       
      FONTGROUP:             {ATTRIBUTE:'fontgroup',         IDENTIFIER:'input[name="system.fontgroup"]',      CAPTION:'Font Group'         ,LINEBREAKER:' '    ,DEFAULT:''},      
      INPUTGROUP:            {ATTRIBUTE:'inputgroup',        IDENTIFIER:'input[name="system.inputgroup"]',     CAPTION:'Input Group'        ,LINEBREAKER:' '    ,DEFAULT:''},      
      
      MACRO:                 {ATTRIBUTE:'macro',             IDENTIFIER:'select[name="system.macroid"]',     CAPTION:'Macro'         ,LINEBREAKER:''    ,DEFAULT:'No Macro'},
       
      ROLLABLE:              {ATTRIBUTE:'rollable',          IDENTIFIER:'input[name="system.hasroll"]',        CAPTION:'Rollable'           ,LINEBREAKER:''    ,DEFAULT:'false'},   
      ROLLNAME:              {ATTRIBUTE:'rollname',          IDENTIFIER:'input[name="system.rollname"]',       CAPTION:'Roll Name'          ,LINEBREAKER:'  '    ,DEFAULT:''}, 
      ROLLID:                {ATTRIBUTE:'rollid',            IDENTIFIER:'input[name="system.rollid"]',         CAPTION:'Roll ID'            ,LINEBREAKER:''    ,DEFAULT:''},  
      ROLLEXP:               {ATTRIBUTE:'rollexp',           IDENTIFIER:'input[name="system.rollexp"]',        CAPTION:'Roll Formula'       ,LINEBREAKER:'  '    ,DEFAULT:''}, 
      
      HASDIALOG:             {ATTRIBUTE:'hasdialog',         IDENTIFIER:'input[name="system.hasdialog"]',      CAPTION:'Has Dialog'         ,LINEBREAKER:''    ,DEFAULT:'false'}, 
      DIALOGPANEL:           {ATTRIBUTE:'dialogpanel',       IDENTIFIER:'input[name="system.dialogName"]',     CAPTION:'Dialog Panel'       ,LINEBREAKER:''    ,DEFAULT:''}, 
      
      AUTO:                  {ATTRIBUTE:'auto',              IDENTIFIER:'input[name="system.auto"]',           CAPTION:'Auto'               ,LINEBREAKER:'  '    ,DEFAULT:''},
      AUTOMAX:               {ATTRIBUTE:'automax',           IDENTIFIER:'input[name="system.automax"]',        CAPTION:'Max Value'          ,LINEBREAKER:'  '    ,DEFAULT:''}, 
      MAXVISIBLE:            {ATTRIBUTE:'maxvisible',        IDENTIFIER:'input[name="system.maxvisible"]',     CAPTION:'Max Visible'        ,LINEBREAKER:''    ,DEFAULT:'true'},
      MAXTOP:                {ATTRIBUTE:'maxtop',            IDENTIFIER:'input[name="system.maxtop"]',         CAPTION:'Max Top'            ,LINEBREAKER:''    ,DEFAULT:'true'},
      
      CHECKGROUP:            {ATTRIBUTE:'checkgroup',        IDENTIFIER:'input[name="system.checkgroup"]',     CAPTION:'Check Group'        ,LINEBREAKER:';'    ,DEFAULT:''},
      CUSTOMIMAGE:           {ATTRIBUTE:'customimage',       IDENTIFIER:'input[name="system.customcheck"]',    CAPTION:'Custom Image'       ,LINEBREAKER:''    ,DEFAULT:'false'},
      CHECKEDPATH:           {ATTRIBUTE:'checkedpath',       IDENTIFIER:'input[name="system.onPath"]',         CAPTION:'Checked Path'       ,LINEBREAKER:''    ,DEFAULT:''},
      UNCHECKEDPATH:         {ATTRIBUTE:'uncheckedpath',     IDENTIFIER:'input[name="system.offPath"]',        CAPTION:'Unchecked Path'     ,LINEBREAKER:''    ,DEFAULT:''},
            
      RADIOTYPE:             {ATTRIBUTE:'radiotype',         IDENTIFIER:'select[name="system.radiotype"]',     CAPTION:'Radio Type'         ,LINEBREAKER:''    ,DEFAULT:'Circle'},
      LIST:                  {ATTRIBUTE:'list',              IDENTIFIER:'input[name="system.listoptions"]',    CAPTION:'Options (a,b,c)'    ,LINEBREAKER:','    ,DEFAULT:''},
      LISTAUTO:              {ATTRIBUTE:'listauto',          IDENTIFIER:'input[name="system.listoptionsAuto"]',CAPTION:'Options Auto'       ,LINEBREAKER:'  '    ,DEFAULT:''},
      
      GROUP:                 {ATTRIBUTE:'group',             IDENTIFIER:'input[name="system.group.name"]',     CAPTION:'Group'              ,LINEBREAKER:''    ,DEFAULT:''},
      HASHEADER:             {ATTRIBUTE:'hasheader',         IDENTIFIER:'input[name="system.hasheader"]',      CAPTION:'Has Header'         ,LINEBREAKER:''    ,DEFAULT:'true'},
      COLUMNNAME:            {ATTRIBUTE:'columnname',        IDENTIFIER:'input[name="system.namecolumn"]',     CAPTION:'ColumnName'         ,LINEBREAKER:''    ,DEFAULT:''},
      ISFREE:                {ATTRIBUTE:'isfree',            IDENTIFIER:'input[name="system.isfreetable"]',    CAPTION:'Is Free'            ,LINEBREAKER:''    ,DEFAULT:'false'},
      TRANSFERABLE:          {ATTRIBUTE:'transferable',      IDENTIFIER:'input[name="system.transferrable"]',  CAPTION:'Transferable'       ,LINEBREAKER:''    ,DEFAULT:'false'},
      HEIGHT:                {ATTRIBUTE:'height',            IDENTIFIER:'select[name="system.tableheight"]',   CAPTION:'Height'             ,LINEBREAKER:''    ,DEFAULT:'FREE'},
      ITEMNAMES:             {ATTRIBUTE:'itemnames',         IDENTIFIER:'select[name="system.onlynames"]',     CAPTION:'Item Names'         ,LINEBREAKER:''    ,DEFAULT:'YES'},
      SHOWUNITS:             {ATTRIBUTE:'showunits',         IDENTIFIER:'input[name="system.hasunits"]',       CAPTION:'Show Units'         ,LINEBREAKER:''    ,DEFAULT:'true'},
      SHOWUSES:              {ATTRIBUTE:'showuses',          IDENTIFIER:'input[name="system.hasuses"]',        CAPTION:'Show Uses'          ,LINEBREAKER:''    ,DEFAULT:'true'},
      SHOWACTIVATION:        {ATTRIBUTE:'showactivation',    IDENTIFIER:'input[name="system.hasactivation"]',  CAPTION:'Show Activation'    ,LINEBREAKER:''    ,DEFAULT:'false'},
      SHOWTOTALS:            {ATTRIBUTE:'showtotals',        IDENTIFIER:'input[name="system.hastotals"]',      CAPTION:'Show Totals'        ,LINEBREAKER:''    ,DEFAULT:'false'},
      SHOWICONS:             {ATTRIBUTE:'tableoptions.showicons',        IDENTIFIER:'input[name="system.tableoptions.showicons"]',      CAPTION:'Show Totals'        ,LINEBREAKER:''    ,DEFAULT:'false'}
      
    },    
    
    MULTIPANEL:{
      KEY:                   {ATTRIBUTE:'key',               IDENTIFIER:'input[name="system.panelKey"]',       CAPTION:'Panel Key'          ,LINEBREAKER:''    ,DEFAULT:''},
      TAG:                   {ATTRIBUTE:'tag',               IDENTIFIER:'input[name="system.title"]',          CAPTION:'Title'              ,LINEBREAKER:''    ,DEFAULT:''},
      WIDTH:                 {ATTRIBUTE:'width',             IDENTIFIER:'select[name="system.width"]',         CAPTION:'Width'              ,LINEBREAKER:''    ,DEFAULT:'1'},
      HEADERGROUP:           {ATTRIBUTE:'headergroup',       IDENTIFIER:'input[name="system.headergroup"]',    CAPTION:'Header Group'       ,LINEBREAKER:' '   ,DEFAULT:''},
      VISIBLEIF:             {ATTRIBUTE:'visibleif',         IDENTIFIER:'input[name="system.condat"]',         CAPTION:'Visible If'         ,LINEBREAKER:''    ,DEFAULT:''},                    
      VISIBLEOPERATOR:       {ATTRIBUTE:'visibleoperator',   IDENTIFIER:'select[name="system.condop"]',        CAPTION:'Visible Operator'   ,LINEBREAKER:''    ,DEFAULT:'NONE'},
      VISIBLEVALUE:          {ATTRIBUTE:'visiblevalue',      IDENTIFIER:'input[name="system.condvalue"]',      CAPTION:'Visible Value'      ,LINEBREAKER:''    ,DEFAULT:''}
    },
    
    PANEL:{ 
      KEY:                   {ATTRIBUTE:'key',               IDENTIFIER:'input[name="system.panelKey"]',       CAPTION:'Panel Key'          ,LINEBREAKER:''    ,DEFAULT:''},
      TAG:                   {ATTRIBUTE:'tag',               IDENTIFIER:'input[name="system.title"]',          CAPTION:'Title'              ,LINEBREAKER:''    ,DEFAULT:''},
      WIDTH:                 {ATTRIBUTE:'width',             IDENTIFIER:'select[name="system.width"]',         CAPTION:'Width'              ,LINEBREAKER:''    ,DEFAULT:'1'},
       
      COLUMNS:               {ATTRIBUTE:'columns',           IDENTIFIER:'select[name="system.columns"]',       CAPTION:'Columns'            ,LINEBREAKER:''    ,DEFAULT:'1'},
      CONTENTALIGNMENT:      {ATTRIBUTE:'contentalignment',  IDENTIFIER:'select[name="system.contentalign"]',  CAPTION:'Content Alignment'  ,LINEBREAKER:''    ,DEFAULT:'left'},
      LABELALIGNMENT:        {ATTRIBUTE:'labelalignment',    IDENTIFIER:'select[name="system.alignment"]',     CAPTION:'Label Alignment'    ,LINEBREAKER:''    ,DEFAULT:'left'},
      TITLEBACKGROUND:       {ATTRIBUTE:'titlebackground',   IDENTIFIER:'select[name="system.backg"]',         CAPTION:'Title Background'   ,LINEBREAKER:''    ,DEFAULT:'DEFAULT'},
      ISIMAGE:               {ATTRIBUTE:'isimage',           IDENTIFIER:'input[name="system.isimg"]',          CAPTION:'Is Image'           ,LINEBREAKER:''    ,DEFAULT:'false'},
      IMAGEPATH:             {ATTRIBUTE:'imgsrc',            IDENTIFIER:'input[name="system.imgsrc"]',         CAPTION:'Image Path'         ,LINEBREAKER:''    ,DEFAULT:''},       
       
      FONTGROUP:             {ATTRIBUTE:'fontgroup',         IDENTIFIER:'input[name="system.fontgroup"]',      CAPTION:'Font Group'         ,LINEBREAKER:' '   ,DEFAULT:''},      
      INPUTGROUP:            {ATTRIBUTE:'inputgroup',        IDENTIFIER:'input[name="system.inputgroup"]',     CAPTION:'Input Group'        ,LINEBREAKER:' '   ,DEFAULT:''},
      HEADERGROUP:           {ATTRIBUTE:'headergroup',       IDENTIFIER:'input[name="system.headergroup"]',    CAPTION:'Header Group'       ,LINEBREAKER:' '   ,DEFAULT:''},
      
      VISIBLEIF:             {ATTRIBUTE:'visibleif',         IDENTIFIER:'input[name="system.condat"]',         CAPTION:'Visible If'         ,LINEBREAKER:''    ,DEFAULT:''},
      VISIBLEOPERATOR:       {ATTRIBUTE:'visibleoperator',   IDENTIFIER:'select[name="system.condop"]',        CAPTION:'Visible Operator'   ,LINEBREAKER:''    ,DEFAULT:'NONE'},
      VISIBLEVALUE:          {ATTRIBUTE:'visiblevalue',      IDENTIFIER:'input[name="system.condvalue"]',      CAPTION:'Visible Value'      ,LINEBREAKER:''    ,DEFAULT:''}                      
    },
    
    SHEETTAB:{
      KEY:                   {ATTRIBUTE:'key',               IDENTIFIER:'input[name="system.tabKey"]',         CAPTION:'Tab Key'            ,LINEBREAKER:''    ,DEFAULT:''},
      TAG:                   {ATTRIBUTE:'tag',               IDENTIFIER:'input[name="system.title"]',          CAPTION:'Title'              ,LINEBREAKER:''    ,DEFAULT:''},
      CONTROL:               {ATTRIBUTE:'control',           IDENTIFIER:'select[name="system.controlby"]',     CAPTION:'Control'            ,LINEBREAKER:''    ,DEFAULT:'public'},
      VISIBLEIF:             {ATTRIBUTE:'visibleif',         IDENTIFIER:'input[name="system.condat"]',         CAPTION:'Visible If'         ,LINEBREAKER:''    ,DEFAULT:''},
      VISIBLEOPERATOR:       {ATTRIBUTE:'visibleoperator',   IDENTIFIER:'select[name="system.condop"]',        CAPTION:'Visible Operator'   ,LINEBREAKER:''    ,DEFAULT:'NONE'},
      VISIBLEVALUE:          {ATTRIBUTE:'visiblevalue',      IDENTIFIER:'input[name="system.condvalue"]',      CAPTION:'Visible Value'      ,LINEBREAKER:''    ,DEFAULT:''} 
    },
          
    GROUP:{
      KEY:                   {ATTRIBUTE:'key',               IDENTIFIER:'input[name="system.groupKey"]',       CAPTION:'Group Key'          ,LINEBREAKER:''    ,DEFAULT:''},
      ISUNIQUE:              {ATTRIBUTE:'isunique',          IDENTIFIER:'input[name="system.isUnique"]',       CAPTION:'Is Unique'          ,LINEBREAKER:''    ,DEFAULT:'false'}     
    },
    LOOKUP:{
      KEY:                   {ATTRIBUTE:'key',               IDENTIFIER:'input[name="system.lookupKey"]',       CAPTION:'Lookup Key'        ,LINEBREAKER:''    ,DEFAULT:''},
      LOOKUPTABLE:           {ATTRIBUTE:'lookuptable',       IDENTIFIER:'textarea[name="lookupTable"]',         CAPTION:'Lookup Table'      ,LINEBREAKER:'\n'    ,DEFAULT:''}
      
    },
    
    CITEM:{
      ROLLEXP:               {ATTRIBUTE:'rollexp',           IDENTIFIER:'input[name="system.roll"]',           CAPTION:'Roll Formula'       ,LINEBREAKER:'  '  ,DEFAULT:''}, 
      ROLLNAME:              {ATTRIBUTE:'rollname',          IDENTIFIER:'input[name="system.rollname"]',       CAPTION:'Roll Name'          ,LINEBREAKER:'  '  ,DEFAULT:''}, 
      MAXUSES:               {ATTRIBUTE:'maxuses',           IDENTIFIER:'input[name="system.maxuses"]',        CAPTION:'Max Uses'           ,LINEBREAKER:'  '  ,DEFAULT:''},
      ROLLID:                {ATTRIBUTE:'rollid',            IDENTIFIER:'input[name="system.rollid"]',         CAPTION:'Roll ID'            ,LINEBREAKER:''    ,DEFAULT:''},
      ICON:                  {ATTRIBUTE:'icon',              IDENTIFIER:'input[name="system.icon"]',           CAPTION:'Icon'               ,LINEBREAKER:' '    ,DEFAULT:''},
      ICONPATH:              {ATTRIBUTE:'tokeniconpath',     IDENTIFIER:'input[name="system.tokeniconpath"]',  CAPTION:'Icon Path'          ,LINEBREAKER:''    ,DEFAULT:''},
      CONDAT:                {ATTRIBUTE:'condat',            IDENTIFIER:'input[name="{index}.condat"]',        CAPTION:'IF Condition Expression'           ,LINEBREAKER:'  '  ,DEFAULT:''},
      CONDVALUE:             {ATTRIBUTE:'condvalue',         IDENTIFIER:'input[name="{index}.condvalue"]',     CAPTION:'Value'              ,LINEBREAKER:'  '  ,DEFAULT:''},
      VALUE:                 {ATTRIBUTE:'value',             IDENTIFIER:'input[name="{index}.value"]',         CAPTION:'Value'              ,LINEBREAKER:'  '  ,DEFAULT:''}
    }
  };
 //'#citem-consume-icon-preview'
