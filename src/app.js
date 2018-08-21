import {List, Range} from 'immutable';
import {map} from 'lajure';

import {playTournament} from './tournament';

const players = new List(map(i => ('0' + i).slice(-2), Range(1, 60 + 1)));

function playGame(player1, player2) {
  if (Math.random() < 0.05) {
    return null;
  }

  return -Number(player1) + Math.random() * 5 > -Number(player2) + Math.random() * 5 ? player1 : player2;
}

playTournament(players, playGame);
