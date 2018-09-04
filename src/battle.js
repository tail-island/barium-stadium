import 'babel-polyfill';

import {playGame} from './battleField';

(async () => {
  await playGame(process.argv[2], process.argv[3]);
})();
