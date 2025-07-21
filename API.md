# SANDBOX API

The Sandbox API are intended to make it easier for macros/module use and simple updates, therefore it has simple update mechanism that needs to be considered if one intend on leverage complex update strategies.

Using the API in an incorrect way may corrupt your data. You have been warned.

## GENERAL USAGE

The API is registered at `game.system.api`

*Example*

```javascript
let api=game.system.api;
api.BuildActorTemplates(); 
```

## AVAILABLE FUNCTIONS

### GENERAL FUNCTIONS

#### BuildActorTemplates

Builds actor templates. Useful if the template does not show normally
**Parameters** :  actortemplatename - optional string , if set only this template will rebuild else all templates will be rebuilt 

*Example*

```javascript
let api=game.system.api;
api.BuildActorTemplates();
```

```javascript
let api=game.system.api;
api.BuildActorTemplates('_actorTemplate'); // build only the template named _actorTemplate
```

#### CheckcItemConsistency
Check integrity and repair cItems

*Example*

```javascript
let api=game.system.api;
api.CheckcItemConsistency();
```
### ACTOR FUNCTIONS

#### Actor_GetFromName

Get actor with name from database
**Parameters**:     name as string                
**Returns**:        	actor, returns null if not found 

*Example* 

```javascript
let api=game.system.api;
let selectedactor = api.Actor_GetFromName('Alban');
if (selectedactor!=null){
    // outputs actor name to the console
    console.log(selectedactor.name)
}
```

#### Actor_GetFromSheet

Get actor from the sheet that triggered the event

**Parameters**:	event            
**Return**:         	Returns the actor that called this macro from its Sandbox sheet
						  If no actor found, it returns null. 
						This means generally that the macro have  been run from the hot bar

*Example* 

```javascript
let api=game.system.api;
let selectedactor = api.Actor_GetFromSheet(event);
if (selectedactor!=null){
    // outputs actor name to the console
    console.log(selectedactor.name)
}
```

#### Actor_GetFromSelectedToken

Get selected tokens actor

**Returns**:        actor, returns null if not found 

*Example* 

```javascript
let api=game.system.api;
let selectedactor = api.Actor_GetFromSelectedToken();
if (selectedactor!=null){
    // outputs actor name to the console
    console.log(selectedactor.name)
}
```

### ACTOR PROPERTY FUNCTIONS

#### ActorProperty_HasProperty

Checks if actor has property

**Parameters**:     actor, propertykey as string 
**Returns**:        	returns true if actor has property, else false 

*Example* 

```javascript
let api=game.system.api;
let propertykey='NUM_BODY'
let selectedactor = api.Actor_GetFromSelectedToken();
if (selectedactor!=null){
    let hasProperty = api.ActorProperty_HasProperty(selectedactor, propertykey)
    if(hasProperty){
    	console.log(selectedactor.name + ' has the property ' + propertykey);
    } else {
        console.log(selectedactor.name + ' has not property ' + propertykey);    
    }        
}
```

#### ActorProperty_GetProperty

Returns the actor property 

**Parameters**:     actor, propertykey as string 
**Returns**:        	value. If no property is found, it returns null.

*Example* 

```javascript
let api=game.system.api;
let propertykey='NUM_HITS'
let selectedactor = api.Actor_GetFromSelectedToken();
if (selectedactor!=null){
    let property = api.ActorProperty_GetProperty(selectedactor, propertykey)
    if(property!=null){
    	console.log(selectedactor.name + ' has the property ' + propertykey + ' with max value :' + property.max);
    } else {
        console.log(selectedactor.name + ' has not property ' + propertykey);    
    }        
}
```

#### ActorProperty_GetValue

Returns the value of an actor property 

**Parameters**:     actor, propertykey as string 
**Returns**:        	value. If no value is found, it returns null.

*Example* 

```javascript
let api=game.system.api;
let propertykey='NUM_BODY'
let selectedactor = api.Actor_GetFromSelectedToken();
if (selectedactor!=null){
    let propertyvalue = api.ActorProperty_GetValue(selectedactor, propertykey)
    if(propertyvalue!=null){
    	console.log(selectedactor.name + ' has the property ' + propertykey + ' with value :' + propertyvalue);
    } else {
        console.log(selectedactor.name + ' has not property ' + propertykey);    
    }        
}
```

#### ActorProperty_SetValue

Sets the value/max of an actor property

**Parameters**:     actor,propertykey,newvalue, optional newmax

*Example* 

```javascript
let api=game.system.api;
let propertykey='NUM_BODY'
let selectedactor = api.Actor_GetFromSelectedToken();
if (selectedactor!=null){
    let propertyvalue = api.ActorProperty_GetValue(selectedactor, propertykey)
    if(propertyvalue!=null){
        let newvalue=propertyvalue + 1 // increase by 1
		api.ActorProperty_SetValue(actor,propertykey,newvalue);
    }        
}
```

```javascript
let api=game.system.api;
let propertykey='NUM_HITS'
let selectedactor = api.Actor_GetFromSelectedToken();
if (selectedactor!=null){
    let propertyvalue = api.ActorProperty_GetValue(selectedactor, propertykey)
    if(propertyvalue!=null){
        let newvalue=propertyvalue + 1 // increase by 1
        let newmax = newvalue;
		api.ActorProperty_SetValue(actor,propertykey,newvalue,newmax);
    }        
}
```

#### ActorProperty_ToggleValue

Toggles a actor checkbox property

**Parameters**:     actor,propertykey 

*Example* 

```javascript
let api=game.system.api;
let propertykey='CHK_HAS_MAGIC'
let selectedactor = api.Actor_GetFromSelectedToken();
if (selectedactor!=null){
    api.ActorProperty_ToggleValue(selectedactor, propertykey)           
}
```

### ACTOR CITEM FUNCTIONS

#### ActorcItem_GetFromName

Checks if actor has cItem 

**Parameters**:     actor,citemname as string                                              
**Returns**:        returns actorcitem if actor has cItem, else null 

*Example* 

```javascript
let api=game.system.api;
let citemname='Chain Mail'
let selectedactor = api.Actor_GetFromSelectedToken();
if (selectedactor!=null){
    let actorcitem = api.ActorcItem_GetFromName(selectedactor,citemname);
    if(actorcitem!=null){
        console.log(selectedactor.name + ' has the cItem ' + actorcitem.name);
    } else {
        console.log(selectedactor.name + ' has not the cItem ' + citemname);
    }    
}
```

#### ActorcItem_IsActive

Returns the current Active state for actor citem

**Parameters**:     actor,citemname as string
**Returns**:        true or false 

*Example* 

```javascript
let api=game.system.api;
let citemname='Chain Mail'
let selectedactor = api.Actor_GetFromSelectedToken();
if (selectedactor!=null){
    let actorcitem = api.ActorcItem_GetFromName(selectedactor,citemname);
    if(actorcitem!=null){
        let isActive = api.ActorcItem_IsActive(selectedactor,actorcitem)
        console.log(selectedactor.name + ' has the cItem ' + actorcitem.name + ' Active State:' + isActive);
    } else {
        console.log(selectedactor.name + ' has not the cItem ' + citemname);
    }    
}
```

#### ActorcItem_Activate

Sets the current Active state for actor citem to ACTIVE

**Parameters**:     actor,actorcitem

*Example* 

```javascript
let api=game.system.api;
let citemname='Chain Mail'
let selectedactor = api.Actor_GetFromSelectedToken();
if (selectedactor!=null){
    let actorcitem = api.ActorcItem_GetFromName(selectedactor,citemname);
    if(actorcitem!=null){
        let isActive = api.ActorcItem_IsActive(selectedactor,actorcitem)
        if(!isActive){
           api.ActorcItem_Activate(selectedactor,actorcitem); 
        }
    } else {
        console.log(selectedactor.name + ' has not the cItem ' + citemname);
    }    
}
```

#### ActorcItem_Deactivate

Sets the current Active state for actor citem to INACTIVE

**Parameters**:     actor,actorcitem

*Example* 

```javascript
let api=game.system.api;
let citemname='Chain Mail'
let selectedactor = api.Actor_GetFromSelectedToken();
if (selectedactor!=null){
    let actorcitem = api.ActorcItem_GetFromName(selectedactor,citemname);
    if(actorcitem!=null){
        let isActive = api.ActorcItem_IsActive(selectedactor,actorcitem)
        if(isActive){
           api.ActorcItem_Deactivate(selectedactor,actorcitem); 
        }
    } else {
        console.log(selectedactor.name + ' has not the cItem ' + citemname);
    }    
}
```

#### ActorcItem_ToggleActivation

Toggles the current Active state for actor citem between ACTIVE/INACTIVE

**Parameters**:     actor, actorcitem

*Example* 

```javascript
let api=game.system.api;
let citemname='Chain Mail'
let selectedactor = api.Actor_GetFromSelectedToken();
if (selectedactor!=null){
    let actorcitem = api.ActorcItem_GetFromName(selectedactor,citemname);
    if(actorcitem!=null){        
    	api.ActorcItem_ToggleActivation(selectedactor,actorcitem);         
    } else {
        console.log(selectedactor.name + ' has not the cItem ' + citemname);
    }    
}
```

#### ActorcItem_ChangeActivation

Changes the current Active state for actor citem to parameter new value 

**Parameters**:     actor, actorcitem, newvalue(default true)

*Example* 

```javascript
let api=game.system.api;
let citemname='Chain Mail'
let selectedactor = api.Actor_GetFromSelectedToken();
if (selectedactor!=null){
    let actorcitem = api.ActorcItem_GetFromName(selectedactor,citemname);
    if(actorcitem!=null){
        let isActive = api.ActorcItem_IsActive(selectedactor,actorcitem)
        if(isActive){
	        api.ActorcItem_ChangeActivation(selectedactor,actorcitem,false); 
        } else {
    	    api.ActorcItem_ChangeActivation(selectedactor,actorcitem,true);   
        }
    } else {
        console.log(selectedactor.name + ' has not the cItem ' + citemname);
    }    
}
```

#### ActorcItem_Consume

Consumes one use of a CONSUMABLE actor citem

**Parameters**:     actor, actorcitem

*Example* 

```javascript
let api=game.system.api;
let citemname='Healing Potion'
let selectedactor = api.Actor_GetFromSelectedToken();
if (selectedactor!=null){
    let actorcitem = api.ActorcItem_GetFromName(selectedactor,citemname);
    if(actorcitem!=null){
      api.ActorcItem_Consume(selectedactor,actorcitem)  
    } else {
        console.log(selectedactor.name + ' has not the cItem ' + citemname);
    }    
}
```

#### ActorcItem_Recharge

Recharges a rechargeable CONSUMABLE actor citem 

**Parameters**:     actor, actorcitem

*Example* 

```javascript
let api=game.system.api;
let citemname='Healing Potion'
let selectedactor = api.Actor_GetFromSelectedToken();
if (selectedactor!=null){
    let actorcitem = api.ActorcItem_GetFromName(selectedactor,citemname);
    if(actorcitem!=null){
      api.ActorcItem_Recharge(selectedactor,actorcitem)  
    } else {
        console.log(selectedactor.name + ' has not the cItem ' + citemname);
    }    
}
```

#### ActorcItem_ChangeUses

Change current USES of a CONSUMABLE actor citem 

**Parameters**:     actor, actorcitem, newvalue

*Example* 

```javascript
let api=game.system.api;
let citemname='Healing Potion'
let selectedactor = api.Actor_GetFromSelectedToken();
if (selectedactor!=null){
    let actorcitem = api.ActorcItem_GetFromName(selectedactor,citemname);
    if(actorcitem!=null){
      api.ActorcItem_ChangeUses(selectedactor,actorcitem,1)  
    } else {
        console.log(selectedactor.name + ' has not the cItem ' + citemname);
    }    
}
```

#### ActorcItem_IncreaseUses

Increases current USES by 1 of a CONSUMABLE actor citem 

**Parameters**:     actor,actorcitem

*Example* 

```javascript
let api=game.system.api;
let citemname='Healing Potion'
let selectedactor = api.Actor_GetFromSelectedToken();
if (selectedactor!=null){
    let actorcitem = api.ActorcItem_GetFromName(selectedactor,citemname);
    if(actorcitem!=null){
      api.ActorcItem_IncreaseUses(selectedactor,actorcitem)  
    } else {
        console.log(selectedactor.name + ' has not the cItem ' + citemname);
    }    
}
```

#### ActorcItem_DecreaseUses

Decreases current USES by 1 of a CONSUMABLE actor citem 

**Parameters**:     actor,actorcitem

*Example* 

```javascript
let api=game.system.api;
let citemname='Healing Potion'
let selectedactor = api.Actor_GetFromSelectedToken();
if (selectedactor!=null){
    let actorcitem = api.ActorcItem_GetFromName(selectedactor,citemname);
    if(actorcitem!=null){
      api.ActorcItem_DecreaseUses(selectedactor,actorcitem)  
    } else {
        console.log(selectedactor.name + ' has not the cItem ' + citemname);
    }    
}
```

#### ActorcItem_Add

Adds a cItem to the actor

**Parameters**:     actor, citem, optional number(default 1)

**Returns**          : The actor cItem created(Promise)
**Special Logic**    : Use this with "await" to be able to use the returned citem

*Example* 

```javascript
let api=game.system.api;
let citemname='Healing Potion'
let selectedactor = api.Actor_GetFromSelectedToken();
if (selectedactor!=null){
    let actorcitem = api.ActorcItem_GetFromName(selectedactor,citemname);
    if(actorcitem==null){
      let citem=api.cItem_GetFromName(citemname);
      if(citem!=null){
	      api.ActorcItem_Add(selectedactor,citem, 1);  
      } else {
          console.log('The cItem '+  citemname + ' can not be found in the database');
      }
    } else {
        console.log(selectedactor.name + ' already has the cItem ' + citemname);
    }    
}
```

```javascript
actorcitem = await ActorcItem_Add(actor,citem) ;
await ActorcItem_IncreaseNumber(actor,actorcitem);        
await ActorcItem_Activate(actor,actorcitem); 
```

#### ActorcItem_Delete

Deletes cItem from the actor.  Note that this will remove all instances(numbers) 

**Parameters**:     actor, actorcitem

*Example* 

```javascript
let api=game.system.api;
let citemname='Healing Potion'
let selectedactor = api.Actor_GetFromSelectedToken();
if (selectedactor!=null){
    let actorcitem = api.ActorcItem_GetFromName(selectedactor,citemname);
    if(actorcitem!=null){
      api.ActorcItem_Delete(selectedactor,actorcitem)  
    } else {
        console.log(selectedactor.name + ' has not the cItem ' + citemname);
    }    
}
```

#### ActorcItem_IncreaseNumber

Increases current NUMBER by parameter number 

**Parameters**:     actor, actorcitem, optional number default 1

*Example* 

```javascript
let api=game.system.api;
let citemname='Healing Potion'
let selectedactor = api.Actor_GetFromSelectedToken();
if (selectedactor!=null){
    let actorcitem = api.ActorcItem_GetFromName(selectedactor,citemname);
    if(actorcitem!=null){
      api.ActorcItem_IncreaseNumber(selectedactor,actorcitem, 1)  
    } else {
        console.log(selectedactor.name + ' has not the cItem ' + citemname);
    }    
}
```

#### ActorcItem_DecreaseNumber

Decreases current NUMBER by 1

**Parameters**:     actor, actorcitem

*Example* 

```javascript
let api=game.system.api;
let citemname='Healing Potion'
let selectedactor = api.Actor_GetFromSelectedToken();
if (selectedactor!=null){
    let actorcitem = api.ActorcItem_GetFromName(selectedactor,citemname);
    if(actorcitem!=null){
      api.ActorcItem_DecreaseNumber(selectedactor,actorcitem)  
    } else {
        console.log(selectedactor.name + ' has not the cItem ' + citemname);
    }    
}
```

### CITEM FUNCTIONS

#### cItem_GetFromName

Get the first cItem with matching name from items database

**Returns**: cItem or null if it cannot be found

**Parameters**:     citemname as string

*Example* 

```javascript
// see example for ActorcItem_Add
```

### ACTOR SHEET FUNCTIONS

#### ActorSheet_GetFromActor

Get actorsheet for actor

**Parameters**: 	actor

**Returns**: 			actorsheet 

*Example*

```
// see example for ActorSheet_Render
```

#### ActorSheet_Render

Renders(shows/brings to front) actorsheet

**Parameters**:	actorsheet

*Example*

```javascript
let api=game.system.api;
let selectedactor = api.Actor_GetFromName('Alban');
if (selectedactor!=null){
    let actorsheet=api.ActorSheet_GetFromActor(selectedactor);
    api.ActorSheet_Render(actorsheet);
}
```

### SYSTEM SETTING FUNCTION

#### SystemSetting_GetValue

Returns the value of a Sandbox setting,  Note only settings that are available by user interface will be returned.

**Parameters**: settingname as string
**Returns**:		setting value or null if not found

*Example*

```javascript
let api=game.system.api;
let setting = api.SystemSetting_GetValue('initKey');
if (setting!=null){
    console.log(setting);
}
```

#### SystemSetting_SetValue

Sets the value of a Sandbox setting,  Note only settings that are available by user interface will be usable.

**Parameters**: settingname as string,newvalue 

*Example*

```javascript
let api=game.system.api;
api.SystemSetting_SetValue('initKey','INITIATIVEFORMULA');

```

### 