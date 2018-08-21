import assert  from 'assert';
import {List, Map, Set} from 'immutable';
import {/*getGroups, getNextGames,*/ getPoints} from '../src/scoring';

describe('points.', () => {
  const gameResults = new Map();

  it('1st game', () => {
    // console.log(new Set(List.of('a', 'b')));
    // console.log(new Set(List.of('a', 'b')).equals(new Set(List.of('b', 'a'))));

    // console.log(new Set(...'a', 'b', 'c'));
    const x = gameResults.
          set(Set.of('a', 'b'), null).
          set(Set.of('c'     ), 'c' );

    console.log(x);

    for (const y of x.keys()) {
      console.log(y);
    }

    const z = Set.of(Set.of('a', 'b'), Set.of('c'));
    // const z = new Set(List.of(new Set.of('a', 'b'), new Set.of('c')));

    console.log(z);

    // console.log(gameResults.set(1, 2));

    // console.log(gameResults);
    // console.log(gameResults.size);

    // gameResults.set(new Set(List.of(...'a', 'b')), null);
    // gameResults.set(new Set(List.of(...'c'     )), 'c' );

    // const result = getPoints(gameResults);

    // assert.strictEqual(result.get('a'), 0.5);
    // assert.strictEqual(result.get('b'), 0.5);
    // assert.strictEqual(result.get('c'), 1.0);
  });

  // it('2nd game', () => {
  //   gameResults.set(new Set(['c', 'a']), 'a' );
  //   gameResults.set(new Set(['b'     ]), 'b' );

  //   const result = getPoints(gameResults);

  //   assert.strictEqual(result.get('a'), 1.5);
  //   assert.strictEqual(result.get('b'), 1.5);
  //   assert.strictEqual(result.get('c'), 1.0);
  // });

  // it('3rd game', () => {
  //   gameResults.set(new Set(['b', 'c']), 'c');
  //   gameResults.set(new Set(['a'     ]), 'a');

  //   const result = getPoints(gameResults);

  //   assert.strictEqual(result.get('a'), 2.5);
  //   assert.strictEqual(result.get('b'), 1.5);
  //   assert.strictEqual(result.get('c'), 2.0);
  // });
});

// describe('next games.', () => {
//   const gameResults = new Map();

//   it('1st game', () => {
//     gameResults.set(new Set(['a', 'b']), null);
//     gameResults.set(new Set(['c'     ]), 'c' );

//     const result = getNextGames(gameResults, getGroups(getPoints(gameResults)));
//   });
// });
