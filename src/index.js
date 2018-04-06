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
        : mapType === 'object' && field.map ? field.map
          : () => undefined;

    const path = mapType === 'string' ? field
      : mapType === 'function' ? key
        : mapType === 'object' ? field.from
          : undefined;

    const value = this.getValueFromPath(path, obj);
    if(value instanceof Array) {
      return await Promise.all(value.map(v => {
        if(typeof v === 'object') {
          return this.parseObject(field, v)
        }
        return v;
      }));
    }
    return await map(value);
  }

  async parseObject(config, obj) {
    let newObj = {};

    const keys = Object.keys(config).map(async key => {
      let field = config[key];
      let mapType = typeof field;

      if(field instanceof Array) {
        let fieldName = Object.keys(field)[0];
        field = field[0];
        mapType = typeof field;

        newObj = await Promise.all(obj[key].map(v => this.parseObject(field, v)));
        return;
      }

      let value = await (mapType === 'object' && !field.key && !field.map 
        ? this.parseObject(field, obj)
        : this.parseField(field, key, obj));
      if(value !== undefined) {
        newObj[key] = value; 
      }
    });

    await Promise.all(keys); 
    return newObj;
  }

  // Return built mapper.
  async map(objectToMap) {
    if(objectToMap instanceof Array) {
      return Promise.all(objectToMap.map(obj => this.parseObject(this.config, obj)));
    }
    return await this.parseObject(this.config, objectToMap);
  }
}

module.exports = Mapper;
