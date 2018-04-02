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

  parseField(field, key, obj) {
    const mapType = typeof field;

    const map = mapType === 'string' ? (val) => val
      : mapType === 'function' ? field
        : mapType === 'object' && field.map ? field.map
          : () => undefined;

    const path = mapType === 'string' ? field
      : mapType === 'function' ? key
        : mapType === 'object' ? field.from
          : undefined;

    return map(this.getValueFromPath(path, obj));

  }

  parseObject(config, obj) {
    const newObj = {};

    Object.keys(config).forEach(key => {
      const field = config[key];
      const mapType = typeof field;

      newObj[key] = mapType === 'object' && !field.key && !field.map
        ? this.parseObject(field, obj)
        : this.parseField(field, key, obj);
    });
    return newObj;
  }

  // Return built mapper.
  map(objectToMap) {
    return this.parseObject(this.config, objectToMap);
  }
}

module.exports = Mapper;
