class Mapper {
  // Validate config.
  constructor(config) {
    this.config = config;
  }

  getValueFromPath(path, obj) {
    let value = obj;
    let current;

    const parts = path.split('.');
    while(current = parts.shift()) {
      value = value[current];
    }

    return value;
  }

  async parseField(field, key, obj) {
    const mapType = typeof field;

    const map = mapType === 'string' ? (val) => val
      : mapType === 'function' ? field
      : mapType === 'object' && field.reduce ? field.reduce
      : mapType === 'object' && field.map ? field.map
      : (val) => val;

    const path = mapType === 'string' ? field
      : mapType === 'function' ? key
      : mapType === 'object' ? field.from
      : key;

    const value = this.getValueFromPath(path, obj);

    if(value instanceof Array && mapType === 'object') {
      if(field.reduce) {
        return map(value);
      }

      return (await Promise.all(value.map(async v => {
        if(typeof v === 'object' && !field.from) {
          return this.parseObject(field, v)
        }
        return await map(v);
      }))).filter(x => x !== undefined);

    }
    return await map(value);
  }

  async parseArray(field, key, obj) {
    let fieldName = Object.keys(field)[0];
    field = field[0];

    return Promise.all(obj[key].map(v => {
      return this.parseObject(field, v);
    }));
  }

  parseValue(field, key, obj) {
    let mapType = typeof field;
    let isNestedConfig = mapType === 'object' && !field.key && !field.map && !field.reduce;

    return isNestedConfig 
        ? this.parseObject(field, !field[key] && obj[key] || obj)
        : this.parseField(field, key, obj);
  }

  async parseObject(config, obj) {
    let newObj = {};

    const keys = Object.keys(config).map(async key => {
      let field = config[key];

      if(field instanceof Array) {
        return newObj = await this.parseArray(field, key, obj);
      } 

      let value = await this.parseValue(field, key, obj);
      if(value !== undefined) {
        newObj[key] = value; 
      }
    });

    await Promise.all(keys); 
    return newObj;
  }

  // Return built mapper.
  async map(objectToMap) {
    if(!objectToMap) {
      return {};
    }
    if(objectToMap instanceof Array) {
      return Promise.all(objectToMap.map(obj => this.parseObject(this.config, obj)));
    }
    return await this.parseObject(this.config, objectToMap);
  }
}

module.exports = Mapper;
