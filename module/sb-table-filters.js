export function sb_table_filter_passed(filter, actorcitem, filter_passed_count) {
  let filter_pass;
  let condition_propertyvalue;
  let condition_value;
  let condition_evaluation;
  filter_pass = true; // start with assuming that filter is passed for this row
  filter.conditions.forEach(function (condition) {
    condition_propertyvalue = null;
    // get property value
    switch (condition.type.trim()) {
      case 'citem':
        switch (condition.key.trim()) {
          case 'name':
            condition_propertyvalue = actorcitem.name;
            break;
          case 'isactive':
            condition_propertyvalue = actorcitem.isactive;
            break;
          case 'maxuses':
            condition_propertyvalue = actorcitem.maxuses;
            break;
          case 'number':
            condition_propertyvalue = actorcitem.number;
            break;
          case 'uses':
            condition_propertyvalue = actorcitem.uses;
            break;
          case 'usetype':
            condition_propertyvalue = actorcitem.usetype;
            break;
          case 'rechargable':
            condition_propertyvalue = actorcitem.rechargable;
            break;
        }
        break;
      case 'property':
        // make sure that the citem has this property
        if (actorcitem.attributes.hasOwnProperty(condition.key.trim())) {
          condition_propertyvalue = actorcitem.attributes[condition.key.trim()].value;
        }
        break;
      case 'table':
        switch (condition.key.trim()) {
          case 'count':
            condition_propertyvalue = filter_passed_count;
            break;
        }
        break;
    }
    
    
    
    if (condition_propertyvalue != null) {
      //console.warn('key:[' + condition.key + '] datatype:'+ typeof condition_propertyvalue);
      // adapt datatypes
      switch(typeof condition_propertyvalue){
        case('boolean'):
          if(condition.value.trim().toLowerCase()=='true'){
            condition_value=true;
          } else {
            condition_value=false;
          }
          break;
        case('string'):
          condition_value=condition.value.toString();
          break;
        case('number'):
          condition_value=Number(condition.value);
          break;
      }
      
      // evaluate condition 
      condition_evaluation = false;
      switch (condition.operator.trim()) {
        case "==":
          if (condition_propertyvalue == condition_value) {
            condition_evaluation = true;
          }
          break;
        case "!=":
          if (condition_propertyvalue != condition_value) {
            condition_evaluation = true;           
          }
          break;
        case "<":
          if (condition_propertyvalue < condition_value) {
            condition_evaluation = true;
          }
          break;
        case ">":
          if (condition_propertyvalue  > condition_value) {
            condition_evaluation = true;
          }
          break;
        case "<=":
          if (condition_propertyvalue  <= condition_value) {
            condition_evaluation = true;
          }
          break;
        case ">=":
          if (condition_propertyvalue  >= condition_value) {
            condition_evaluation = true;
          }
          break;
        case "startswith":
          if(typeof condition_propertyvalue=='string'){
            if (condition_propertyvalue.startsWith(condition_value)) {
              condition_evaluation = true;
            }
          }
          break;
        case "endswith":
          if(typeof condition_propertyvalue=='string'){
            if (condition_propertyvalue.endsWith(condition_value)) {
              condition_evaluation = true;
            }
          }
          break;
        case "includes":
          if(typeof condition_propertyvalue=='string'){
            if (condition_propertyvalue.includes(condition_value)) {
              condition_evaluation = true;
            }
          }
          break;
      }
      // check mode                          
      switch (condition.logic.trim()) {
        case 'AND':
          if (!condition_evaluation) {
            filter_pass = false;
          }
          break;
        case 'AND NOT':
          if (condition_evaluation) {
            filter_pass = false;
          }
          break;
        case 'OR':
          if (condition_evaluation) {
            filter_pass = true;
          }
          break;
        case 'OR NOT':
          if (!condition_evaluation) {
            filter_pass = true;
          }
          break;
       
        case 'IGNORE':
          // this mode will simply make the condition as unevalueted
          break;
      }
      //
      
    }
  });
  return filter_pass;
}

// returns the filter if valid, else null
export function sb_property_has_valid_table_filter(property) {
  let returnvalue = null;
  if (property != null) {
    // get tooltip from table property
    //console.warn(property);
    if (property.system.tableoptions.hasOwnProperty('filter')) {
      let filter = property.system.tableoptions.filter;
      if (filter.length>0){
        returnvalue = sb_string_is_valid_table_filter(filter);
        if(returnvalue==null){
          ui.notifications.warn('Sandbox | Invalid filter for table property ' + property.name + ' with key [' + property.system.attKey + ']');
        }
      }
    }
  }
  return returnvalue;
}

// returns the filter(as string) if valid, else null
export function sb_string_is_valid_table_filter(sfilter) {
  let returnvalue = null;
  // check filter if it is a valid json
  // filter should be like 
  //  {"conditions":[
  //    {"logic":"AND","type":"citem",     "key":"isactive",       "operator":"==", "value":true},
  //    {"logic":"OR","type":"property", "key":"NUM_ITEMRATING", "operator":">",  "value":5}
  //  ]}
  let filter = sb_isJSON(sfilter);
  if (filter != null) {
    let validfilter = true;
    // validate filter
    filter.conditions.forEach(function (condition) {
      if (condition.hasOwnProperty('logic') && condition.hasOwnProperty('type') && condition.hasOwnProperty('key') && condition.hasOwnProperty('operator') && condition.hasOwnProperty('value')) {
        // condition ok
      } else {
        // condition missing properties
        validfilter = false;
      }
    });
    if (validfilter) {
      returnvalue = filter;
    }
  }
  return returnvalue;
}


function sb_isJSON(str) {
    try {
        return (JSON.parse(str));
    } catch (e) {
        return null;
    }
}
