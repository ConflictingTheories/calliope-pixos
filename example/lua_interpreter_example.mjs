import * as luainjs from 'lua-in-js';

/**
 * Each lua environment is isolated from each other and can have it owns set of libraries, scopes, etc
 */
const luaEnv = luainjs.createEnv();

/**
 * 
 * @param {Function} _this 
 * @param {Function} sprite 
 * @returns 
 */
const luaCommand = async (_this, sprite) => {
  // example of passing functions as arguments (in this case we call the functions to get the actual objects)
  _this = luainjs.utils.coerceArgToFunction(_this, 'luaCommand', 1)();
  sprite = luainjs.utils.coerceArgToFunction(sprite, 'luaCommand', 2)();
  
  console.log({ msg: 'entering portal', _this, sprite });
  
  let world = _this.zone.world;
  world.removeAllZones();
  
  if (_this.zones) _this.zones.forEach((z) => world.loadZoneFromZip(z, _this.zip));
  
  console.log({ msg: 'exiting portal', _this, sprite });
  return null;
};

let externalJavascriptVariable = {
    id: 'externalJavascriptVariable',
    last_touched: new Date().toISOString(),
}

let externalJavascriptVariable2 = {
    id: 'externalJavascriptVariable2',
    last_touched: new Date().toISOString(),
}

/** 
 * converts a JSON object into a Lua Table for accessing key-values
 * 
 * @param {Object} obj - JSON object
 */
const asTable = (obj) => {
    const table = new luainjs.Table();
    for (const [key, value] of Object.entries(obj)) {
        table.set(key, value);
    }
    return table;
}

/** 
 * converts a Lua Table into an Object
 * 
 * @param {Table} tbl - Lua Table
 */
const asObj = (tbl) => {
  return tbl.toObject();
}

  /** 
   * example method - in this case, *deprecated*
   * preferred way would be to use asTable() in conjunction with reference to actual JS object 
   * However: need to determine if object is needed in scope - or better to create exclusive functions
   * that can be statically called from within the Lua script to prevent security issues or side-effects?
   **/
const _this = () => {
    return {
      zip: 'zip',
      zones: ['zones'],
      zone: {
        world: {
          removeAllZones: () => {
              console.log('removeAllZones');
          },
          loadZoneFromZip: (z, zip) => {
              console.log('loadZoneFromZip', z, zip);
          },
        },
      },
    };
  };

  /** 
   * example method - in this case, *deprecated*
   * preferred way would be to use asTable() in conjunction with reference to actual JS object 
   * However: need to determine if object is needed in scope - or better to create exclusive functions
   * that can be statically called from within the Lua script to prevent security issues or side-effects?
   **/
const sprite = () => {
  return { id: 'sprite' };
};

// == LUA LIBRARY ===

const myLuaLib = new luainjs.Table({
    luaCommand,
    _this,
    sprite,
    asTable,
    asObj,
    externalJavascriptVariable,
    externalJavascriptVariable2: new luainjs.Table(externalJavascriptVariable2)
});

luaEnv.loadLib('myLuaLib', myLuaLib);

// == TESTING BEGINS ===

// apply changes to externalJavascriptVariable2
externalJavascriptVariable2.oggie = true;

// does not reflect the updated externalJavascriptVariable2 - only the snapshot that was converted into table
const luaCode = `return myLuaLib.externalJavascriptVariable2`;
const luaScript = luaEnv.parse(luaCode);
const returnValue = luaScript.exec();

// sleep for 1 second
await new Promise((resolve) => setTimeout(resolve, 1000));

// update externalJavascriptVariable
externalJavascriptVariable.last_touched = new Date().toISOString();
externalJavascriptVariable.oggie = true;

// run lua to read the updated externalJavascriptVariable
const luaCode2 = `
-- run example luaCommand (calls the lua wrapper, but executs in JS)
-- myLuaLib.luaCommand(myLuaLib._this, myLuaLib.sprite);

-- return the last touched date from the externalJavascriptVariable
-- to do this - we can convert the object into a table and access the key-value pairs

mt = myLuaLib.asTable(myLuaLib.externalJavascriptVariable);
mt.oggie = 'true';

myLuaLib.externalJavascriptVariable = myLuaLib.asObj(mt);

return myLuaLib.externalJavascriptVariable;
`;
const luaScript2 = luaEnv.parse(luaCode2);
const return2Value = luaScript2.exec();
console.log({ returnValue, return2Value, externalJavascriptVariable, externalJavascriptVariable2 });

// run luaCode2 again -- reflects the updated externalJavascriptVariable
externalJavascriptVariable.oggie = false;
console.log({ externalJavascriptVariable,externalJavascriptVariable2 });

const return3Value = luaScript2.exec();
console.log( {return3Value,externalJavascriptVariable, externalJavascriptVariable2});
