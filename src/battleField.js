import {spawn} from 'child_process';
import * as fs from 'fs';
import * as http from 'http';
import {count, filter, first} from 'lajure';
import * as path from 'path';
import {server as WebSocketServer} from 'websocket';
import {Player, State, getNextPlayer} from './game';

export async function playGame(player1, player2) {
  const spawnPlayer = (player) => {
    const result = spawn('C:\\Windows\\System32\\cmd.exe', ['/c', 'run.bat'], {cwd: path.join('players', player)});

    result.stdout.on('data', (data) => {
      fs.appendFileSync(path.join('./results', `${ player1 }-${ player2 }`, `${ player }-stdout.txt`), data);
    });

    result.stderr.on('data', (data) => {
      fs.appendFileSync(path.join('./results', `${ player1 }-${ player2 }`, `${ player }-stderr.txt`), data);
    });

    return result;
  };

  const log = (data) => {
    if (data === undefined) {
      data = '';
    }

    fs.appendFileSync(path.join('./results', `${ player1 }-${ player2 }`, 'result.txt'), data + '\n');
  };

  fs.mkdirSync(path.join('./results', `${ player1 }-${ player2 }`));

  log(`先手: ${ player1 }, 後手: ${ player2 }`);

  const httpServer = http.createServer().listen(8080);
  const server = new WebSocketServer({
    autoAcceptConnections: true,
    httpServer:            httpServer,
    keepalive:             false
  });

  const connections = new Map();

  const process1 = spawnPlayer(player1); connections.set(Player.black, await new Promise(resolve => server.once('connect', resolve)));
  const process2 = spawnPlayer(player2); connections.set(Player.white, await new Promise(resolve => server.once('connect', resolve)));

  const pastStates = [];

  const winner = await (async function _(state, lastMove) {
    log();
    log(state.toString());

    if (state.winner) {
      log('勝敗が決まりました。');

      return state.winner;
    }

    pastStates.push(state);

    if (count(filter(pastState => pastState.equals(state), pastStates)) >= 3) {
      return null;
    }

    const legalMoves = Array.from(state.getLegalMoves());

    connections.get(state.player).sendUTF(JSON.stringify({state: state, legalMoves: legalMoves, lastMove: lastMove}));

    const startingTime = Date.now();
    const message = await Promise.race([new Promise(resolve => connections.get(state.player).once('message', resolve)),
                                        new Promise(resolve => setTimeout(resolve, 20000))]);
    const elapsedTime = (Date.now() - startingTime) / 1000;

    log();
    log(`経過時間: ${ elapsedTime }`);

    if (elapsedTime > 15) {
      log('制限時間を超過しています。');

      return getNextPlayer(state.player);
    }

    const moveCandidate = JSON.parse(message.utf8Data);

    log(`手: ${ JSON.stringify(moveCandidate) }`);

    const move = first(filter(legalMove => legalMove.equals(moveCandidate), legalMoves));
    if (!move) {
      log('合法手ではありません。');

      return getNextPlayer(state.player);
    }

    return await _(state.doMove(move), move);
  })(new State(), null);

  log();
  log((() => {
    if (!winner) {
      return '引き分け';
    }

    return `${ winner == Player.black ? player1 : player2 }の勝ち！`;
  })());

  // サーバーを終了させます。
  server.shutDown();
  httpServer.close();

  // プレイヤーを終了させます。
  spawn('taskkill', ['/pid', player1.pid, '/f', '/t']);
  spawn('taskkill', ['/pid', player2.pid, '/f', '/t']);

  if (!winner) {
    return null;
  }

  return winner == Player.black ? player1 : player2;
}
