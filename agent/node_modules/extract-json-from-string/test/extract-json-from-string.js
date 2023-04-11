require('should');

describe('extract-json-from-string', function() {
  const extract = require('../lib/extract-json-from-string');

  describe('extract()', () => {
    context('with a single JSON object', () => {
      it('should return the object', () => {
        let objs = extract(`Here's an object ${JSON.stringify({ foo: 'bar' })} that should be extracted`);
        objs.length.should.equal(1);
        objs[0].should.eql({ foo: 'bar' });
      })
    })

    context('with a single object', () => {
      it('should return the object', () => {
        let objs = extract("Here's an object { foo: 'bar' } that should be extracted");
        objs.length.should.equal(1);
        objs[0].should.eql({ foo: 'bar' });
      })
    })

    context('with multiple JSON objects', () => {
      it('should return both objects', () => {
        let objs = extract(`Here's an object ${JSON.stringify({ foo: 'bar' })} that should be extracted as well as ${JSON.stringify({ baz: 'quux' })} this`);
        objs.length.should.equal(2);
        objs[0].should.eql({ foo: 'bar' });
        objs[1].should.eql({ baz: 'quux' });
      })
    })

    context('with multiple objects', () => {
      it('should return both objects', () => {
        let objs = extract("Here's an object { foo: 'bar' } that should be extracted as well as { baz: 'quux' } this");
        objs.length.should.equal(2);
        objs[0].should.eql({ foo: 'bar' });
        objs[1].should.eql({ baz: 'quux' });
      })
    })

    context('with nested objects', () => {
      it('should return the object', () => {
        let objs = extract("Here's an object { foo: { bar: { baz: 'quux' }, hello: { world: true } } } that should be extracted");
        objs.length.should.equal(1);
        objs[0].should.eql({
          foo: {
            bar: {
              baz: 'quux'
            },
            hello: {
              world: true
            }
          }
        });
      })
    })

    context('with a single JSON array', () => {
      it('should return the array', () => {
        let objs = extract(`Here's an array ${JSON.stringify(['foo', 'bar'])} that should be extracted`);
        objs.length.should.equal(1);
        objs[0].should.eql(['foo', 'bar']);
      })
    })

    context('with a single array', () => {
      it('should return the array', () => {
        let objs = extract("Here's an array ['foo', 'bar'] that should be extracted");
        objs.length.should.equal(1);
        objs[0].should.eql(['foo', 'bar']);
      })
    })

    context('with multiple JSON arrays', () => {
      it('should return both arrays', () => {
        let objs = extract(`Here's an array ${JSON.stringify(['foo', 'bar'])} that should be extracted as well as ${JSON.stringify(['baz', 'quux'])} this`);
        objs.length.should.equal(2);
        objs[0].should.eql(['foo', 'bar']);
        objs[1].should.eql(['baz', 'quux']);
      })
    })

    context('with multiple arrays', () => {
      it('should return both arrays', () => {
        let objs = extract("Here's an array ['foo', 'bar'] that should be extracted as well as ['baz', 'quux'] this");
        objs.length.should.equal(2);
        objs[0].should.eql(['foo', 'bar']);
        objs[1].should.eql(['baz', 'quux']);
      })
    })

    context('with nested arrays', () => {
      it('should return the array', () => {
        let objs = extract("Here's an array [ 'foo', [ 'bar', [ 'baz', 'quux' ], 'hello', [ 'world', true ] ] ] that should be extracted");
        objs.length.should.equal(1);
        objs[0].should.eql(['foo', ['bar', ['baz', 'quux'], 'hello', ['world', true ] ] ]);
      })
    })

    context('with a mix of arrays and objects', () => {
      it('should return the outer items', () => {
        let objs = extract(`Here's some ['foo', { bar: true }] things to ${JSON.stringify({ baz: 'quux', items: [1, 2, 3], nested: [{ property: { inArray: 1 } }]})} extract`);
        objs.length.should.equal(2);
        objs[0].should.eql(['foo', { bar: true }]);
        objs[1].should.eql({
          baz: 'quux',
          items: [1, 2, 3],
          nested:  [
            {
              property: {
                inArray: 1
              }
            }
          ]
        });
      })
    })

    context('with an invalid object', () => {
      it('should handle a start brace only', () => {
        let objs = extract('laskfjd laksdj fals { lkasjdf');
        objs.length.should.equal(0);
      })

      it('should handle a start brace and close brace that are not an object', () => {
        let objs = extract('laskfjd laksdj fals { lkasjdf }');
        objs.length.should.equal(0);
      })

      it('should handle a string with no braces at all', () => {
        let objs = extract('laskfjd laksdj fals lkasjdf');
        objs.length.should.equal(0);
      })

      it('should still return objects after invalid objects', () => {
        let objs = extract('laskfjd laksdj fals { lkasjdf } sakjd { foo: "bar" }');
        objs.length.should.equal(1);
        objs[0].should.eql({ foo: 'bar' });
      })
    })
  })
})
