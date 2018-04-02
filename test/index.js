const {assert} = require('chai');
const Mapper = require('../src/index');

const test = {
  mapper: {
    mapper: {
      'Should return the mapped object': () => {
        const original = {a:1};
        const mapper = new Mapper({a: 'a'});

        const mapped = mapper.map(original);
        assert.deepEqual(original, mapped);
      },
      'Should return mapped object from config': () => {
        const original = {a:1};
        const mapper = new Mapper({b:'a'});

        const mapped = mapper.map(original);
        assert.deepEqual({b:1}, mapped);
      },
      'Should return mapped object from config with path': () => {
        const original = {a:1};
        const mapper = new Mapper({b:'a'});

        const mapped = mapper.map(original);
        assert.deepEqual({b:1}, mapped);
      },
      'Should return mapped object from config with function': () => {
        const original = {a:1};
        const mapper = new Mapper({a:(val) => val + 1});

        const mapped = mapper.map(original);
        assert.deepEqual({a:2}, mapped);
      },
      'Should return mapped object from config with function and name': () => {
        const original = {a:1};
        const config = {
          b: {
            from: 'a',
            map: (val) => val + 1
          }
        };
        const mapper = new Mapper(config);

        const mapped = mapper.map(original);
        assert.deepEqual({b:2}, mapped);
      },
      'Should return mapped object with array': () => {
        const original = {a : [1, 2, 3]};
        const config = {
          b: 'a'
        };
        const mapper = new Mapper(config);

        const mapped = mapper.map(original);
        assert.deepEqual({b:[1, 2, 3]}, mapped);
      },
      'Should return mapped object with object': () => {
        const original = {a : {b: 1}};
        const config = {
          b: 'a'
        };
        const mapper = new Mapper(config);

        const mapped = mapper.map(original);
        assert.deepEqual({b:{b:1}}, mapped);
      },
      'Should return mapped object with object with nested path': () => {
        const original = {a : {b: 1}};
        const config = {
          b: 'a.b'
        };
        const mapper = new Mapper(config);

        const mapped = mapper.map(original);
        assert.deepEqual({b:1}, mapped);
      },
      'Should return mapped object with object with nested path and function': () => {
        const original = {a : {b: 1}};
        const config = {
          b: {
            from: 'a.b',
            map: (val) => val + 1
          }
        };
        const mapper = new Mapper(config);

        const mapped = mapper.map(original);
        assert.deepEqual({b:2}, mapped);
      },
      'Should return mapped object with object with nested result and function': () => {
        const original = {a : {b: 1}};
        const config = {
          b: {
            b: {
              from: 'a.b',
              map: (val) => val + 1
            }
          }
        };
        const mapper = new Mapper(config);

        const mapped = mapper.map(original);
        assert.deepEqual({b: {b: 2}}, mapped);
      },
      'Should return mapped object with object with very nested result and function': () => {
        const original = {a : {b: 1}};
        const config = {
          a: {b: {c: {d : {
            e: {
              from: 'a.b',
              map: (val) => val + 1
            }
          }
          }}}
        };
        const mapper = new Mapper(config);

        const mapped = mapper.map(original);
        assert.deepEqual({a: {b:{c:{d:{e:2}}}}}, mapped);
      },

    },
  },
};

module.exports = test;
