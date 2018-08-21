import {List, Map, Range, Set} from 'immutable';
import {count, filter, first, identity, reduce} from 'lajure';

// TODO: プレイヤーが奇数の場合に対応する。

List.prototype.shuffle = function() {
  const f = (acc, list) => {
    if (list.isEmpty()) {
      return acc;
    }

    return f(...((i) => [acc.push(list.get(i)), list.delete(i)])(Math.floor(Math.random() * list.size)));
  };

  return f(new List(), this);
};

export function playTournament(players, playGame) {
  const getGameResults = (games) => {
    return reduce((acc, game) => acc.set(game, playGame(...game)), new Map(), games);
  };

  const getPointGroups = (gameResults) => {
    const points = reduce((acc, player) => acc.set(player,
                                                   count(filter(([game, winner]) => game.has(player) &&  winner && winner === player, gameResults)) * 1.0 +
                                                   count(filter(([game, winner]) => game.has(player) && !winner,                      gameResults)) * 0.5),
                          new Map(), players);

    return reduce((acc, [point, players]) => acc.set(point, new Set(players.keys())), new Map(), points.groupBy(identity));
  };

  const getNextGames = (gameResults, pointGroups) => {
    // なんの工夫もしてないバックトラックでごめんなさい……。
    // 人力でもこなせる程度の回戦数なのだから、こんなんでもパフォーマンス上の問題は出ないはずだよね？

    const f = (acc, players) => {
      if (players.isEmpty()) {
        return acc;
      }

      const player = players.first();

      for (const enemy of players.rest()) {
        const nextGame = Set.of(player, enemy);

        if (gameResults.has(nextGame)) {
          continue;
        }

        const nextAcc = f(acc.add(nextGame), players.delete(players.indexOf(enemy)).delete(players.indexOf(player)));  // enemyから順に削除しているのは、playerの方が前にあるので、先に削除するとインデックスがずれるためです。

        if (!nextAcc) {
          continue;
        }

        return nextAcc;
      }

      return null;
    };

    return f(new Set(), reduce((acc, point) => acc.concat(new List(pointGroups.get(point)).shuffle()), new List(), new List(pointGroups.keys()).sort().reverse()));
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
    console.log();

    const gameComparator = (game1, game2) => {
      if (game1 == game2) {
        return 0;
      }

      return game1.sort() < game2.sort() ? -1 : 1;
    };

    for (const game of new List(acc.keys()).sort(gameComparator)) {
      console.log(game.sort().join('-') + "\t" + acc.get(game));
    }
    console.log();

    const pointGroups = getPointGroups(acc);

    for (const point of new List(pointGroups.keys()).sort().reverse()) {
      console.log(point + '\t' + new List(pointGroups.get(point)).sort().join(', '));
    }
    console.log();

    const nextGames = getNextGames(acc, pointGroups);

    for (const nextGame of nextGames.sort(gameComparator)) {
      console.log(new List(nextGame).sort().join('-'));
    }
    console.log();

    return acc.merge(getGameResults(nextGames));
  }, getGameResults(firstGames), Range(1, 13 + 1));
}
