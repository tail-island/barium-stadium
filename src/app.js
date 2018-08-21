import {List, Map, Range, Record, Set} from 'immutable';
import {playTournament} from './tournament';

class Player extends Record({name: '', strength: 0}) {
}


const players = new List(Range(1, 60 + 1).map(i => new Player({name: ('0' + i).slice(-2), strength: i})));

for (const player of players) {
  console.log(player);
}


function playGame(player1, player2) {
  if (Math.random() < 0.1) {
    return null;
  }

  return player1.strength + Math.random() * 10 > player2.strength + Math.random() * 10 ? player1 : player2;
}

playTournament(players, playGame);
