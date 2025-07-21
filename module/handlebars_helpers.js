export function registerHandlebarsHelpers() {
  console.log('Sandbox | Register Handlebar Helpers');
  Handlebars.registerHelper('eachProperty', function (context, options) {
    var ret = "";
    for (var prop in context)
    {
      if (context.hasOwnProperty(prop)) {
        ret = ret + options.fn({property: prop.toString(), value: context[prop]});
      }
    }
    return ret;
  });

  Handlebars.registerHelper('sb_concat', function () {
    var outStr = '';
    for (var arg in arguments) {
      if (typeof arguments[arg] != 'object') {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper('sb_item_icon', function (itemid) {

    let outStr = '';
    let item = game.items.get(itemid);
    if (item != null) {
      outStr = item.img;
    }
    return outStr;
  });

  Handlebars.registerHelper('nullToEmptyString', function (v1) {
    if (v1 == null) {
      return "";
    } else {
      return v1;
    }
  });
  
  Handlebars.registerHelper('infoToolTip', function (v1) {    
    return `&nbsp;<i class="fas fa-circle-info" title="${game.i18n.localize(v1)}"></i>`;
  });
  
  
  Handlebars.registerHelper('itemAttribute', function (v1) {
    let result='';
    if(v1){     
      if(game.i18n.has(`${v1}.Caption`)){
        result=game.i18n.localize(`${v1}.Caption`);
      }
      if(game.i18n.has(`${v1}.Tooltip`)){        
        result +=`&nbsp;<i class="fas fa-circle-info" title="${game.i18n.localize(v1 +'.Tooltip')}"></i>`;
      }
    } 
    return result;
  });

  Handlebars.registerHelper('ifNotEmpty', function (v1, options) {
    if (v1 == null || v1 == '') {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  });

  Handlebars.registerHelper('cItemAddedBy', function (addedBy) {
    if (addedBy == null || addedBy == '') {
      return "";
    } else {
      // check with id
      let citem = game.items.get(addedBy);
      if (citem == null) {
        // check with cikey
        citem = game.system.customitemmaps.citemsbycikey.get(addedBy);
      }
      if (citem != null) {
        return 'cItem ' + citem.name;
      } else {
        return addedBy;
      }
    }
  });

  Handlebars.registerHelper('ifCond', function (v1, v2, options) {

    if (v1 == null || v2 == null)
      return options.inverse(this);

    let regE = /^\d+$/g;
    v1 = v1.toString();
    v2 = v2.toString();
    let isnumv1 = v1.match(regE);
    let isnumv2 = v2.match(regE);

    if (isnumv1)
      v1 = Number(v1);

    if (isnumv2)
      v2 = Number(v2);

    if (v1 === v2) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Handlebars.registerHelper('ifGreater', function (v1, v2, options) {
    // console.log(v1);
    // console.log(v2);
    if (parseInt(v1) > parseInt(v2)) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Handlebars.registerHelper('ifLess', function (v1, v2, options) {
    if (v1 < v2) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Handlebars.registerHelper('ifNot', function (v1, v2, options) {
    //console.log(v1 + " " + v2);

    if (v1 == null || v2 == null)
      return options.inverse(this);

    v1 = v1.toString();
    v2 = v2.toString();

    if (v1 !== v2) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Handlebars.registerHelper('isGM', function (options) {
    if (game.user.isGM) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Handlebars.registerHelper('advShow', function (options) {
    if (game.settings.get("sandbox", "showADV")) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Handlebars.registerHelper('showRoller', function (options) {
    if (game.settings.get("sandbox", "showSimpleRoller")) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Handlebars.registerHelper('rollMod', function (options) {
    if (game.settings.get("sandbox", "rollmod")) {
      return options.fn(this);
    }
    return options.inverse(this);
  });
}
