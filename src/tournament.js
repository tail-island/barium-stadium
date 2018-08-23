import {List, Map, Range, Set} from 'immutable';
import {identity, map, reduce} from 'lajure';

// TODO: プレイヤーが奇数の場合に対応する。

const ROUND = 13;

List.prototype.shuffle = function() {
  const f = (acc, list) => {
    if (list.isEmpty()) {
      return acc;
    }

    return f(...((i) => [acc.push(list.get(i)), list.delete(i)])(Math.floor(Math.random() * list.size)));
  };

  return f(new List(), this);
};

function getPoint(player, gameResults) {
  return reduce((acc, gameResult) => acc + (gameResult.has(player) ? gameResult.get(player) : 0), 0, gameResults.values());
}

function getPoints(players, gameResults) {
  return reduce((acc, player) => acc.set(player, getPoint(player, gameResults)), new Map(), players);
}

function logGameResults(players, gameResults) {
  const points = getPoints(players, gameResults);

  console.log('   ' + players.sort().join('  ') + '  Point');
  console.log(new List(map(player => {
    return player + ' ' + new List(map(enemy => {
      const game = Set.of(player, enemy);

      if (!gameResults.has(game)) {
        return '   ';
      }

      return gameResults.get(game).get(player).toFixed(1);

    }, players.sort())).join(' ') + '  ' + (' ' + points.get(player).toFixed(1)).slice(-4);
  }, players.sort())).join('\n'));
  console.log();
}

export async function playTournament(players, getGameResult) {
  const getGameResults = async (games) => {
    let result = new Map();

    for (const game of games) {
      result = result.set(game, await getGameResult(...game));
    }

    return result;
  };

  const getPointGroups = (gameResults) => {
    return reduce((acc, [point, players]) => acc.set(point, new Set(players.keys())), new Map(), getPoints(players, gameResults).groupBy(identity));
  };

  const getNextGames = (gameResults, pointGroups) => {
    // カケラも工夫していないバックトラックでごめんなさい……。
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

        const nextAcc = f(acc.add(nextGame), reduce((acc, index) => acc.delete(index), players, List.of(players.indexOf(player), players.indexOf(enemy)).sort().reverse()));

        if (!nextAcc) {
          continue;
        }

        return nextAcc;
      }

      return null;
    };

    const result = f(new Set(), reduce((acc, point) => acc.concat(new List(pointGroups.get(point)).shuffle()), new List(), new List(pointGroups.keys()).sort().reverse()));

    if (!result) {
      throw 'Can\'t make games.';
    }

    return result;
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

  // asyncにしないとならなかったので、reduceではなくループで書きます……。

  const result = await (async () => {
    let result = await getGameResults(firstGames);

    for (const i of Range(1, ROUND)) {
      const gameComparator = (game1, game2) => {
        if (game1 == game2) {
          return 0;
        }

        return game1.sort() < game2.sort() ? -1 : 1;
      };

      console.log('*** ROUND ' + i + ' ***');
      console.log();

      logGameResults(players, result);

      const pointGroups = getPointGroups(result);

      console.log(new List(map(point => (' ' + point.toFixed(1)).slice(-4) + ': ' + new List(pointGroups.get(point)).sort().join(' '), new List(pointGroups.keys()).sort().reverse())).join('\n'));
      console.log();

      const nextGames = getNextGames(result, pointGroups);

      console.log(new List(map(nextGame => nextGame.sort().join('-'), nextGames.sort(gameComparator))).join(' '));
      console.log();

      result = result.merge(await getGameResults(nextGames));
    }

    return result;
  })();

  console.log('*** FINAL ***');
  console.log();

  logGameResults(players, result);

  return result;
}
