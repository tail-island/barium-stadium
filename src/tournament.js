import {List, Map, OrderedMap, Range, Set} from 'immutable';
import {count, every, filter, first, reduce, some} from 'lajure';

// TODO: プレイヤーが奇数の場合に対応する。

List.prototype.shuffle = function() {
  // TODO: アルゴリズムを変えて高速化する。

  const f = (acc, list) => {
    if (list.isEmpty()) {
      return acc;
    }

    return f(...((i) => [acc.push(list.get(i)), list.delete(i)])(Math.floor(Math.random() * list.size)));
  };

  return f(new List(), this);
};

export function playTournament(players, playGame) {
  const playGames = (games) => {
    return reduce((acc, game) => acc.set(game, playGame(...game)), new Map(), games);
  };

  const getPoints = (gameResults) => {
    return reduce((acc, player) => acc.set(player,
                                           count(filter(([game, winner]) => game.has(player) &&  winner && winner.equals(player), gameResults)) * 1.0 +
                                           count(filter(([game, winner]) => game.has(player) && !winner,                          gameResults)) * 0.5),
                  new Map(), players);
  };

  const getGames = (gameResults, points) => {
    const f = (acc, players, enemiesCollection) => {
      const getNextEnemiesCollection = (...gamePlayers) => reduce((acc, gamePlayer) => acc.delete(gamePlayer),
                                                                  reduce((acc, player) => acc.update(player,
                                                                                                     enemies => reduce((acc, gamePlayer) => acc.delete(gamePlayer),
                                                                                                                       enemies,
                                                                                                                       gamePlayers)),
                                                                         enemiesCollection,
                                                                         players),
                                                                  gamePlayers);

      const canGame = (...gamePlayers) => every(([_, enemies]) => !enemies.isEmpty(), getNextEnemiesCollection(...gamePlayers));

      const nextParameter = (...gamePlayers) => {
        return [acc.add(new Set(gamePlayers)),
                reduce((acc, gamePlayer) => acc.delete(acc.indexOf(gamePlayer)), players, gamePlayers),
                reduce((acc, gamePlayer) => acc.delete(gamePlayer),
                       reduce((acc, player) => acc.update(player,
                                                          enemies => reduce((acc, gamePlayer) => acc.delete(gamePlayer),
                                                                            enemies,
                                                                            gamePlayers)),
                              enemiesCollection,
                              players),
                       gamePlayers)];
      };

      if (players.isEmpty()) {
        return acc;
      }

      const player = players.get(0);
      const enemy  = first(filter(enemy => enemiesCollection.get(player).has(enemy) && canGame(player, enemy), players.rest()));

      if (!enemy) {
        console.log('******** ERROR ********: ' + player + ' don\'t have enemies.');
        throw 'Can\'t make game.';
      }

      return f(...nextParameter(player, enemy));
      // for (const enemy of filter(enemy => enemiesCollection.get(player).has(enemy), players.rest())) {
      //   if (!canGame(player, enemy)) {
      //     continue;
      //   }

      //   return f(...nextParameter(player, enemy));
      // }

      // console.log('******** ERROR ********: ' + player + ' don\'t have enemies.');
    };

    return f(new Set(),
             reduce((acc, point) => acc.concat(new List(points.get(point).keys()).shuffle()), new List(), new List(points.keys()).sort().reverse()),
             reduce((acc, player) => {
               return acc.set(player, reduce((acc, game) => game.size === 2 && game.has(player) ? acc.delete(game.delete(player).first()) : acc, new Set(players.delete(players.indexOf(player))), gameResults.keys()));
             }, new Map(), players));
  };

  const firstGames = (() => {
    const f = (acc, players) => {
      if (players.isEmpty()) {
        return acc;
      }

      return f(acc.add(Set.of(players.get(0), players.get(1))), players.skip(2));
    };

    return f(new Set(), players.shuffle());
  })();

  return reduce((acc, round) => {
    console.log('*** ROUND ' + round + ' ***');

    const playerComparator = (player1, player2) => {
      return player1.name.localeCompare(player2.name);
    };

    const gameComparator = (game1, game2) => {
      const [player11, player12] = game1.sort(playerComparator);
      const [player21, player22] = game2.sort(playerComparator);

      return playerComparator(player11, player21) || playerComparator(player12, player22);
    };

    const gameResultComparator = ([game1, winner1], [game2, winner2]) => {
      return gameComparator(game1, game2);
    };

    for (const [game, winner] of new List(acc).sort(gameResultComparator)) {
      console.log(game.map(p => p.name).sort().join('-') + "\t" + (winner && winner.name));
    }
    console.log();

    const points = getPoints(acc).groupBy(value => value);

    for (const point of new List(points.keys()).sort().reverse()) {
      console.log(point + '\t' + new List(points.get(point).keys()).sort().map(p => p.name).join(', '));
    }
    console.log();

    const games = getGames(acc, points);

    for (const game of games.sort(gameComparator)) {
      console.log(new List(game).sort().map(p => p.name).join('-'));
    }
    console.log();

    return acc.merge(playGames(games));
  }, playGames(firstGames), Range(1, 13 + 1));
}
