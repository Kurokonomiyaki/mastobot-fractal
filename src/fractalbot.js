import Mastodon from 'mastodon-api';
import Fs from 'fs';

import { getSettings } from './settings';
import { computeJulia } from './julia';
import { getRandomParameters } from './utils';

const replyToToot = async ({ id }, { acct, avatar_static }, instance, settings) => {
  // generate the image
  const params = getRandomParameters(acct);
  const outputPath = await computeJulia(acct, avatar_static, params);

  // upload the generated image
  const response = await instance.post('media', {
    file: Fs.createReadStream(outputPath),
  });
  const mediaId = response.data.id;

  // send the reply
  let to = acct;
  if (to.startsWith('@') === false) {
    to = `@${to}`;
  }
  const text = `${to} Your personal julia set is: c=${params.cx.toFixed(4)}+${params.cy.toFixed(4)}i, order ${params.d}, with a ${params.trapType} trap`;
  instance.post('statuses', Object.assign({
    in_reply_to_id: id,
    status: text,
    media_ids: [ mediaId ],
  }, settings.tootOptions));

  // delete the generated image
  Fs.unlinkSync(outputPath);
};

const onMessageReceived = (settings, instance, message) => {
  const { event, data } = message;
  if (event === 'notification' && data.type === 'mention') {
    const toot = data.status;
    const author = data.account;

    if (toot.in_reply_to_id != null || toot.in_reply_to_account_id != null) {
      return;
    }

    console.log('Request received', author.acct);
    replyToToot(toot, author, instance, settings).then(() => {
      console.log('Reply sent', author.acct);
    }).catch((err) => {
      console.log('Error while replying to toot', toot.content, author.acct, err);
    });
  }
};



export const startBot = () => {
  const settings = getSettings(`${__dirname}/../settings.json`);

  const instance = new Mastodon({
    access_token: settings.accessToken,
    api_url: settings.instanceUrl,
  });

  const listener = instance.stream('streaming/user');
  listener.on('message', (msg) => onMessageReceived(settings, instance, msg));
  listener.on('error', (err) => console.log(err));
  
  // listener.on('heartbeat', msg => console.log('Dadoum.'));

  console.log('Listening...');
};
