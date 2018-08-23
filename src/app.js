import 'babel-polyfill';

import * as fs from 'fs';
import {List} from 'immutable';
import {count, filter} from 'lajure';
import * as path from 'path';
import {playTournament} from './tournament';
import {playGame} from './battleField';

// async function playGame(player1, player2) {
//   if (Math.random() < 0.2) {
//     return null;
//   }

//   return -Number(player1) + Math.random() * 2 > -Number(player2) + Math.random() * 2 ? player1 : player2;
// };

(async () => {
  const players = new List(filter(player => fs.statSync(path.join('./players', player)).isDirectory(), fs.readdirSync('./players')));

  const getGameResult = async (player1, player2) => {
    const winners = List.of(await playGame(player1, player2), await playGame(player2, player1));

    return new Map().
      set(player1, count(filter(winner => winner === player1, winners)) * 1 + count(filter(winner => !winner, winners)) * 0.5).
      set(player2, count(filter(winner => winner === player2, winners)) * 1 + count(filter(winner => !winner, winners)) * 0.5);
  };

  await playTournament(players, getGameResult);
})();
