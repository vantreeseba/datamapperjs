const {assert} = require('chai');
const Mapper = require('../src/index');

const test = {
  mapper: {
    mapper: {
      'Should return the mapped object': async () => {
        const original = {a:1};
        const mapper = new Mapper({a: 'a'});

        const mapped = await mapper.map(original);
        assert.deepEqual(original, mapped);
      },
      'Should return mapped object from config': async () => {
        const original = {a:1};
        const mapper = new Mapper({b:'a'});

        const mapped = await mapper.map(original);
        assert.deepEqual({b:1}, mapped);
      },
      'Should return mapped object from config with path': async () => {
        const original = {a:1};
        const mapper = new Mapper({b:'a'});

        const mapped = await mapper.map(original);
        assert.deepEqual({b:1}, mapped);
      },
      'Should return mapped object from config with function': async () => {
        const original = {a:1};
        const mapper = new Mapper({a:(val) => val + 1});

        const mapped = await mapper.map(original);
        assert.deepEqual({a:2}, mapped);
      },
      'Should return mapped object from config with function and name': async () => {
        const original = {a:1};
        const config = {
          b: {
            from: 'a',
            map: (val) => val + 1
          }
        };
        const mapper = new Mapper(config);

        const mapped = await mapper.map(original);
        assert.deepEqual({b:2}, mapped);
      },
      'Should return mapped object with array': async () => {
        const original = {a : [1, 2, 3]};
        const config = {
          b: 'a'
        };
        const mapper = new Mapper(config);

        const mapped = await mapper.map(original);

        assert.deepEqual({b:[1, 2, 3]}, mapped);
      },
      // 'Should return mapped object with array with no name': async () => {
      //   const original = {a : [{b:1}]};
      //   const config = {
      //     a: [{c:'b'}] 
      //   };
      //   const mapper = new Mapper(config);

      //   const mapped = await mapper.map(original);

      //   assert.deepEqual(mapped, {a:[{c:1}]});
      // },
      'should return array mapped': async () => {
        const original = {a:[{val:1, key: 'foo'}, {val:2, key: 'bar'}]};
        const config = {
          b: {
            from: 'a',
            reduce: (arr) => arr.reduce((sum, v) => {sum[v.key] = v.val; return sum; }, {})
          }
        };

        const mapper = new Mapper(config);
        const mapped = await mapper.map(original);
        const expected = {b:{bar:2, foo:1}};

        assert.deepEqual(expected, mapped);
      },
      'should return array mapped per value in array': async () => {
        const original = {a:[1,2,3]};
        const config = {
          b: {
            from: 'a',
            map: v => v+1
          }
        };

        const mapper = new Mapper(config);
        const mapped = await mapper.map(original);
        const expected = {b:[2,3,4]};

        assert.deepEqual(expected, mapped);
      },
      'should return array mapped per object in array': async () => {
        const original = {a:[{c:1},{c:2},{c:3}]};
        const config = {
          b: {
            from: 'a',
            map: v => {v.c += 1; return v;}
          }
        };

        const mapper = new Mapper(config);
        const mapped = await mapper.map(original);
        const expected = {b:[{c:2},{c:3},{c:4}]};

        assert.deepEqual(expected, mapped);
      },
      'should return array mapped per object in array and filter out nulls': async () => {
        const original = {a:[{c:1},{c:2},{c:3}]};
        const config = {
          b: {
            from: 'a',
            map: v => {v.c += 1; return v.c < 3 ? v : undefined;}
          }
        };

        const mapper = new Mapper(config);
        const mapped = await mapper.map(original);
        const expected = {b:[{c:2}]};

        assert.deepEqual(mapped, expected);
      },
      'Should return mapped object with array of objects ': async () => {
        const original = {a : [{name: 'a'}, {name: 'b'}]};
        const config = {
          b: {a: [{name: 'name'}]}
        };
        const mapper = new Mapper(config);

        const mapped = await mapper.map(original);
        assert.deepEqual({b:[{name:'a'},{name:'b'}]}, mapped);
      },
      'Should return mapped object with array in nested objects ': async () => {
        const original = {a : [
          {name: 'a', bar: [1,2,3]}, 
          {name: 'b', bar: [1,2,3]}
        ]};
        const config = {
          b: {a: [{name: 'name', baz: 'bar'}]}
        };
        const mapper = new Mapper(config);

        const mapped = await mapper.map(original);
        assert.deepEqual({b:[
          {name: 'a', baz: [1,2,3]}, 
          {name: 'b', baz: [1,2,3]}
        ]}, mapped);
      },
      'Should return mapped object with nested array of objects ': async () => {
        const original = {a : [
          {name: 'a', bar: [{add:"foo", other: 1, c: {d:1}}]}, 
          {name: 'b', bar: [{add:"bar", d:{e:1}}]}
        ]};
        const config = {
          b: {
            a: [{
              name: 'name', 
              baz: {
                bar: [{
                  sub: 'add',
                  other:'other',
                  c: 'c',
                  d: {
                    e: 'e'
                  } 
                }]
              }
            }]
          }
        };
        const mapper = new Mapper(config);

        const mapped = await mapper.map(original);

        assert.deepEqual({b:[
          {name: 'a', baz: [{sub:"foo", other: 1, c: {d:1}, d:{}}]}, 
          {name: 'b', baz: [{sub:"bar", d:{e:1}}]}
        ]}, mapped);
      },
      'Should map simple array with nested object' : async () => {
        const original = {
          a: [{
            b:{
              c:1
            }
            }]
        };
        const config = {
          a: 'a'
        };

        const mapper = new Mapper(config);
        const mapped = await mapper.map(original);
        
        assert.deepEqual(original, mapped);
      },
      'Should map simple array with nested object with nested config' : async () => {
        const original = {
          a: [{
            b:{
              c:1
            }
            }]
        };
        const config = {
          a: {
            a: [{
              b: 'b'
            }]
          } 
        };

        const mapper = new Mapper(config);
        const mapped = await mapper.map(original);
        
        assert.deepEqual(original, mapped);
      },
      'Should map simple array with nested object with double nested config' : async () => {
        const original = {
          a: [{
            b:{
              c:1
            }
            }]
        };
        const config = {
          a: {
            a: [{
              b: {
                c: 'c'
              } 
            }]
          } 
        };

        const mapper = new Mapper(config);
        const mapped = await mapper.map(original);
        
        assert.deepEqual(original, mapped);
      },
      'Should return mapped object with object': async () => {
        const original = {a : {b: 1}};
        const config = {
          b: 'a'
        };
        const mapper = new Mapper(config);

        const mapped = await mapper.map(original);
        assert.deepEqual({b:{b:1}}, mapped);
      },
      'Should return mapped object with object with nested path': async () => {
        const original = {a : {b: 1}};
        const config = {
          b: 'a.b'
        };
        const mapper = new Mapper(config);

        const mapped = await mapper.map(original);
        assert.deepEqual({b:1}, mapped);
      },
      'Should return mapped object with object with nested path and function': async () => {
        const original = {a : {b: 1}};
        const config = {
          b: {
            from: 'a.b',
            map: (val) => val + 1
          }
        };
        const mapper = new Mapper(config);

        const mapped = await mapper.map(original);
        assert.deepEqual({b:2}, mapped);
      },
      'Should return mapped object with object with nested result and function': async () => {
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

        const mapped = await mapper.map(original);
        assert.deepEqual({b: {b: 2}}, mapped);
      },
      'Should return mapped object with object with very nested result and function': async () => {
        const original = {x : {y: 1}};
        const config = {
          a: {b: {c: {d : {
            e: {
              from: 'x.y',
              map: (val) => val + 1
            }
          }
          }}}
        };
        const mapper = new Mapper(config);

        const mapped = await mapper.map(original);
        assert.deepEqual({a: {b:{c:{d:{e:2}}}}}, mapped);
      },
    },
  },
};

module.exports = test;
