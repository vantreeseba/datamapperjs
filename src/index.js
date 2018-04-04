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

    return await map(this.getValueFromPath(path, obj));
  }

  async parseObject(config, obj) {
    const newObj = {};

    const keys = Object.keys(config).map(async key => {
      const field = config[key];
      const mapType = typeof field;

      newObj[key] = await (mapType === 'object' && !field.key && !field.map
        ? this.parseObject(field, obj)
        : this.parseField(field, key, obj));
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
