# Sandbox Change Log
## Version 0.14.4.4(2024-01-31)
-FIX: Radios in Free tables fails
- Minor layout work on item helpers dropdown

## Version 0.14.4.3(2024-01-26)
- Improved error messaging for invalid argument of lookup functions
- Overhaul of Item Helpers dropdowns to align with Foundry visuals/behaviours
- Added missing 'Copy as CSS' to Item Helpers for Font/Input/Header Groups for Panels/Multipanels/Properties
- FIX: Previous update fix for Tab headers for properties did not work for Foundry 10 were not properly packaged into release

## Version 0.14.4.2(2024-01-22)
- FIX: LastRoll for initiative roll from Combat Tracker incorrect
- FIX: Tab headers for properties and cItems did not work for Foundry 10
- FIX: If setting 'Token Options' is enabled, players gets an error when a token is created
- FIX: Using a constant number value(1,2,3 etc) or strings as arguments for lookup functions value in cItems tables dont parse
- Added attribute 'data-result' to roll-result, makes it possible to use a CSS attribute selector based on the value of a roll, example `.roll-result[data-result="12"]{color:pink;}` 

## Version 0.14.4.1(2024-01-15)
- FIX: Roll Dialogs parsing of Roll Name
- FIX: Consumable cItems attribute Uses did not accept non-numbers
- CHANGE: For cItems tab Info renamed to Description 
- CHANGE: For cItems tab Attributes renamed to Properties
- CHANGE: For cItems MOD tab Layout changes
- FIX: For items, an update will trigger resize of form
- FIX: For item sheets, CSS tweak for scrollablility
- FIX: Sometimes, when having more than one actor sheet open, LIST properties were saved incorrectly
- FIX: Unable to delete citem from actor if citem is deleted from world database

## Version 0.14.4(2024-01-11)
- Improvement: Load actor/citem properties to roll dialogs(see documentation)
- FIX: ImportAll for compendiums fail
- FIX: ImportAll for compendiums supports compendium folders
- FIX: parsing for lookup function to use in rollp()

## Version 0.14.3.1(2024-01-09)
- Added tool 'Search' - search for key references in all relevant items(property/panel/multipanel/group/tabs/lookup) fields
- FIX: @name} returned 'undefined'
- FIX: For Dialogs,Support for LISTs with Options Auto/Lookup
- FIX: citem properties for tokens were not updated correctly
- FIX: empty tables displayed bottom row incorrectly

## Version 0.14.3(2024-01-06)
- Feature: Using RADIO properties in cItem/tables(standard/free)
- Added selectable reset icon for RADIO properties
- Added option 'Show Properties?' for tables. Default is true, if false, the citem group properties will not be shown in the table. Uses/Activate/Number can still be seen if enabled
- Added option 'Property Hide List' for tables. Accepts a comma separated string with group property keys to not show in the table
- CHANGE: Default for setting 'Activate item deletion protection' is now unchecked
- CSS Info: If you have used CSS to style radio elements, changes have been made to the document structure that might require some adjustments to your CSS
- FIX: When adding a group to a cItem, LIST properties where not initialized correctly
- FIX: For free tables, correct default values when adding new row
- FIX: Formatting of tooltips
- FIX: Added support for LIST properties with Auto/Lookup Options to Table Filter Editor
- FIX: For tables, unable to set text/list property to empty if underlying property had default value or citem had non-empty value
- REGRESSION: Handling of ;:, in && now back to needing HTML codes(see documentation)

## Version 0.14.2.1(2023-12-30)
- Added flag for cItems 'Remove after last use'
- Added panel width 1/5
- FIX: Table in invivisble panel
- FIX: For cItems, a LIST property with only Options was not rendered correctly 

## Version 0.14.2(2023-12-28)
- Added Actor Properties Manager(CTRL + Click the Info on a actor sheet title bar)
  - Enables to remove unused properties from an actor. Useful for cleaning up actor from abandoned properties
- Added new item type LOOKUP
  - added roll/auto expressions for lookups
    - lookupv(lookupValue;lookupKey;returnColumn;exactMatch=false;optionalDefault='') 
    - lookupx(lookupValue;lookupKey;lookupColumn;returnColumn;optionalDefault='')
    - lookupColumnCount(lookupKey)
    - lookupRowCount(lookupKey)
    - lookupList(lookupKey,returnColumn,strSeparator=',')
  - feature: Add options from LOOKUP to LIST property Options
- Improved handling of ;:, in &&
- Performance optimisation for actor sheet with many citems in tables
- FIX: Dropping cItems on Token Actor sheets
- FIX: Using a list property in auto for simplenumeric 
- FIX: im in rollp(Aloondaar)
- FIX: coloring of criticals(all dice rolled maximum) and fumbles(all dice rolled 1) in chatmessage. 
  For defined rolls(using roll() and rollp(), only the first defined roll in the roll expression is checked for critical/fumble)
  For rolls in registration helpers(like `$<1;1d6> $1 `), no coloring(or DiceSoNice animation) will be done.
- FIX: Actor sheet resize improvements
- FIX: Able too use #{targetname} in Roll Name
- CHANGE: #{targetname} now returns only the first selected targets name
- Added: #{targetlist} returns a comma separated list with all targets names
- CHANGE: #{actor},#{actorname},@{actor},@{actorname} is replaced by @{name}
- Added increase/decrease buttons for Difficulty Class
- Added setting "System defined Difficulty Classes"
- Added dropdown for DC with System defined Difficulty Classes
- FIX: Doubleclick on radio option reverted to circle
- FIX: Enabling delete icon in tables for citems not added by Active/Passive/Template 
- FIX: Bug in IF parsing

## Version 0.14.1(2023-11-26)
- Added Table Filters
- FIX: Using `~self~` in a conditional
- FIX: CSS for MAX of simplenumber to enable GM to edit 
- FIX: Conditional `~blind~` 

## Version 0.14.0(2023-11-17)
- Foundry changes
  - Foundry 11 supported(RC8) 
  - Data Model from Foundry v10(RC1)
    - Important Note: When migrating a v9 Sandbox world, all actors/actor templates will be in an faulty state. 
      Use "Build Actor Templates" from the Sandbox System Builder Section in the Settings Sidebar to update actor templates to v10 data model
      and Reload all actors
  - Drag n drop(RC1)
  - CSS adaptations(RC1)  
- Refactored System Settings(RC1)
- Improved chat messages(RC1)
- Refactored JSON Export(RC1)
- Added API to Sandbox
  - BuildActorsTemplate(RC1)
  - CheckcItemConsistency(RC7)
  - Actor_GetFromName(RC5),
  - Actor_GetFromSheet(RC5),
  - Actor_GetFromSelectedToken(RC7),
  - ActorProperty_HasProperty(RC7),
  - ActorProperty_GetProperty(RC7),
  - ActorProperty_GetValue(RC7),
  - ActorProperty_SetValue(RC7),
  - ActorProperty_ToggleValue(RC7),
  - ActorcItem_GetFromName(RC7),
  - ActorcItem_IsActive(RC7),
  - ActorcItem_Activate(RC7),
  - ActorcItem_Deactivate(RC7),
  - ActorcItem_ToggleActivation(RC7),
  - ActorcItem_ChangeActivation(RC7),
  - ActorcItem_Consume(RC7),
  - ActorcItem_Recharge(RC7),
  - ActorcItem_ChangeUses(RC7),
  - ActorcItem_IncreaseUses(RC7),
  - ActorcItem_DecreaseUses(RC7),
  - ActorcItem_Add(RC7),
  - ActorcItem_Delete(RC7),
  - ActorcItem_IncreaseNumber(RC7),
  - ActorcItem_DecreaseNumber(RC7),
  - cItem_GetFromName(RC7),
  - ActorSheet_GetFromActor(RC5),
  - ActorSheet_Render(RC5),
  - SystemSetting_GetValue(RC7),
  - SystemSetting_SetValue(RC7),
  - SheetInfo_GetFromSheetId(RC5),
  - fontAwesomeIconPicker(RC6)
  - Documentation
- Added Sandbox System Builder Section to Settings Sidebar(RC1)
  - Moved JSON Export and Import to Sandbox System Builder Section(RC1)
  - Added BuildActorTemplates to Sandbox System Builder Section(RC1)
  - Added Bug Report Form to Sandbox System Builder Section(RC1)
  - Added Check cItem Consistensy(RC7)
- Added Confirm Delete for subitem lists(tables etc)(RC1)
- Added Item Helpers for items(RC1)
  - Autogeneration(RC1)
  - Expression Editor(RC1)
  - Validation(RC1)
  - Copy/Cut/Paste(RC1)
- Added feature Show Icons? for tables(RC1)
- Added icons for property datatypes(RC1)
- Reworked item icons to SVGs(RC1,RC7)
- Added Show icons on all subitems list on sheet,tab,panel,multipanel,group(RC1)
- Added automatic truncation on calculated values with many decimals(RC4)
- Added showing tooltips for inputs(RC6)
- Added icon picker(RC6) 
  - Consumable citems activation icon(RC6)
  - Property labels(RC6)
  - Radio property used icon(RC6)  
- Added roll expression flag roll mode Self Roll (~self~)(RC6)
- Added support for module DF Chat Enchancements roll mode buttons(RC6)
- Reworked calculation of Autos for better nesting(RC7)
- Added Options Show Players/GMs cItem description only(RC8)
- Updated roll expression rollP. Imploding(negative) dice will now explode if the expression has both implode and explode(ex rollp(first;1d100im4x>95) ?[first.total]).(RC8)
- Added Option Enable resizable panels(when checked, panels are not fixed in width but instead relative to available size)(RC8)
- Added Option Display Show To Others for items/actors(including from compendiums)(RC8)
- Added Option Item Delete Protection, hides Delete icons for lists, cItems etc. Also no hides Add icon for Free tables(RC8)
- Refactoring for CSS and reworking of CSS, using CSS variables for easy modifications(RC8)
- Added pre v10 data migration functionality(RC8)
- Added roll expression flag for hiding conditional text for non-Gms (~secretconditional~)(RC8)
  Example: `0 &&total;0:Everything are secret&& ~secretconditional~`
- Added roll expression feature for hiding parts of conditional texts(RC8)
  Example: `0 &&total;0:Some things are <div class="secret"> secret</div> some are <div class="secret"> not</div> && `
- Updated tooltips to use Foundry custom tooltips(CSS-modifiable)(RC8)
- Reworked item helpers dropdown menus in item sheets to use Foundry(RC8)
- Adjusted JSON import/export(RC8)
- Added property getters for roll expressions(RC8)
  - #{maxuses}
  - #{actorname} 
  - @{actorname}
  - #{targetname}
- FIX: Rolls now respect the UI selected Roll Mode(unless roll is configured to overide)(RC6)
- FIX: DiceSoNice now displays for players/GMs according to used Roll Mode(RC6)
- FIX: Actor sheet resize(RC6)
- FIX: Removal of cItems added by Activation ITEM mod(RC6,RC7)
- FIX: Performace optimizations(RC7)
- FIX: Calculation of uses when changing uses manually for consumable cItems(RC8)
- FIX: Calculation of uses transfering consumable cItems(RC8)
- PATCHES: Mod created properties with compendiums (RC7) by Alondaar  
- Various fixes and tweaks
