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

  parseObject(obj) {
    const newObj = {};

    Object.keys(this.config).forEach(key => {
      const field = this.config[key];
      const mapType = typeof field;

      const map = mapType === 'string' ? (val) => val
        : mapType === 'function' ? field
          : mapType === 'object' ? field.map
            : () => undefined;

      const path = mapType === 'string' ? field
        : mapType === 'function' ? key
          : mapType === 'object' ? field.from
            : undefined;

      newObj[key] = map(this.getValueFromPath(path, obj));
    });
    return newObj;
  }

  // Return built mapper.
  map(objectToMap) {
    return this.parseObject(objectToMap);
  }
}

module.exports = Mapper;
