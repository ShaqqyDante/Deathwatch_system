// constants and handling of casing

export const CASING={
      CASE:{                
        NONE:"None",
        LOWERCASE:"lowercase",
        UPPERCASE:"UPPERCASE",
        TITLECASE:"Title Case"
      },
      CASENR:["None","lowercase","UPPERCASE","Title Case"],
      SEPARATOR:{
        KEY:"_",
        CSS:"-"
      }
    }


// Case functions

export function stringToTitleCase(str) {
  // Handles space, hyphen and underscore as valid starts for title case
  // Uses a for loop instead of a reg ex because of hyphens and underscores
  // Teststring: A new     test 123 of-integers_with    _no_purpose  
  let sReturn = '';
  let sChar = ' '; // use space to trigger first character
  for (let i = 0; i < str.length; i++) {
    if (sChar == ' ' || sChar == '_' || sChar == '-' || sChar == '.') {
      sReturn += str[i].toUpperCase();
    } else {
      sReturn += str[i].toLowerCase();
    }

    sChar = str[i];
  }
  return sReturn;

}