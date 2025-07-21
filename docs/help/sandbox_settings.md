# Sandbox System Settings
## Show Options
Show options for Sandbox
### Show Roll with Advantage option
If checked, 1d20,ADV,DIS options will be displayed under the Actor's name
### Show d20 Roll icon option
If checked a d20 icon will be displayed under the Actor's name
### Show Difficulty Class window
If checked a DC box will appear at the bottom of the screen
### System Difficulty Classes
List of Difficulty Classes defined for this system.
This will add a dropdown to the DC window for quick selection.<br>Format: <i>Class1:Value1;Class2:Value2...</i><br>Leave blank for none.<br>Example <i>Easy:1;Normal:2;Hard:3</i>
### Show Last Roll window
If checked a box displaying the results of the last Roll will appear at the bottom of the screen
### Show Roll Modifier
If checked, a input is displayed on actor sheets. This number will be added to the total of all rolls
## General Options
General options for Sandbox
### Token Options
If checked, you can specify bar1 under token on the template Token tab
### CSS Style file
Custom styling file(CSS) to load.
Leave blank for none.
### Initiative Property Key
The key of the property that contains the roll expression to use for initiative in the Combat Tracker
## cItem & tables Options
Options for cItems & tables
### Show players cItem description only
If checked, clicking a cItem link in a table or chat, only the data on the cItem Info-tab will be showed. No permissions on the cItems is needed.
<i>Applies for players only.</i>
### Show GMs cItem description only
If checked, clicking a cItem link in a table or chat, only the data on the cItem Info-tab will be showed. No permissions on the cItems is needed.
<i>Applies for GMs only.</i>
## Sheet Options
Options for displaying sheets
### Activate item deletion protection
If checked, delete/add icons will be hidden as default, a checkbox for toggling the visibility of the delete icon is added to sheets window title.
### Enable resizable panels
If checked, panel/multipanels/columns wil be resized relatively instead of a fixed width
Enabling this in a world with existing actors might require a re-disposition of panels.
### Display ID in sheet caption
If checked, the item/actors ID will be displayed as a tooltip icon in the sheets window title.
 Clicking this icon will output the item/actor data in the console. Useful for debugging problems.<br>For actors, CTRL+CLICK for showing Actor Properties Manager<br><i>Applies for GMs only.</i>
### Display Show To Others in sheet caption
If checked, the a clickable icon will be shown in the sheets window title.
## Item Sheets Options
Options for displaying item sheets
### Show item helpers
If checked, show item helper menus on item sheets.
<i>Applies for GMs only.</i>
### Adapt item sheet size/position
If checked, the starting size and position are adapted to item content.
<i>Applies for GMs only.</i>
### Override item default tab
When checked, the default(starting) tab when an item is displayed is Details or Attributes(for cItems).
<i>Applies for GMs only.</i>
## Key Validation Options
Options for determine valid keys
### Enforced key validation mode
<b>Unchecked:</b> Sandbox standard - Keys are valid unless containing space, special characters or empty.
Keys for can be duplicate between datatypes except panels/multipanels<br><b>Checked:</b> Enforced - Keys are valid if containing only A-Z, a-z,0-9,_(underscore) and not empty.<br>Keys can not be duplicate between datatypes
## Item Autogeneration Options
Options for how autogenerating is applied
### Change property icon automatically
If checked, changes to a property's datatype will automatically change the propertys icon
### Confirm batch overwrite
If checked, ask user for confirmation before applying batch overwrite(Autogenerate All,Clear All)
### Confirm attribute overwrite
If checked, ask user for confirmation before applying attribute overwrite(Autogenerate)
### Convert key to case
Used for autogenerating key
### Convert CSS to case
Used for autogenerating CSS class
### Transliterate non-latin characters
If checked, when autogenerating key, any non-latin characters are transliterated into latin equivalents.
When <b>Enforced key validation mode</b> is checked, transliteration will be executed regardless of this setting.<br><b>Please note that using non-latin characters as key might not work in roll expressions</b>
### Use prefix/suffix for autogenerating
If checked, when autogenerating a field, add prefix and suffix
### Use property data type for prefix
If checked, when autogenerating a property key, use the propertys data type for prefix
## Item Autogeneration Prefixes And Suffixes
Prefixes/suffixes used for autogenerating data
### Prefix for property key
Used for autogenerating property key when <b>Use property data type for prefix</b> is unchecked
### Prefix for simpletext property key
Used for autogenerating property key when <b>Use property data type for prefix</b> is checked
### Prefix for simplenumeric property key
Used for autogenerating property key when <b>Use property data type for prefix</b> is checked
### Prefix for checkbox property key
Used for autogenerating property key when <b>Use property data type for prefix</b> is checked
### Prefix for radio property key
Used for autogenerating property key when <b>Use property data type for prefix</b> is checked
### Prefix for textarea property key
Used for autogenerating property key when <b>Use property data type for prefix</b> is checked
### Prefix for list property key
Used for autogenerating property key when <b>Use property data type for prefix</b> is checked
### Prefix for label property key
Used for autogenerating property key when <b>Use property data type for prefix</b> is checked
### Prefix for badge property key
Used for autogenerating property key when <b>Use property data type for prefix</b> is checked
### Prefix for property key
Used for autogenerating property key when <b>Use property data type for prefix</b> is checked
### Prefix for button property key
Used for autogenerating property key when <b>Use property data type for prefix</b> is checked
### Prefix for panel key
Used for autogenerating key
### Prefix for multipanel key
Used for autogenerating key
### Prefix for group key
Used for autogenerating key
### Prefix for lookup key
Used for autogenerating key
### Prefix for tab key
Used for autogenerating key
### Suffix for item fontgroup
Used for autogenerating CSS class
### Suffix for item inputgroup
Used for autogenerating CSS class
### Suffix for item headergroup
Used for autogenerating CSS class
### Suffix for item roll id
Used for autogenerating roll id
### Suffix for item roll name
Used for autogenerating roll name
