import Mastodon from 'mastodon-api';
import Fs from 'fs';
import Path from 'path';

import * as ImageMakers from './modules';
import { getSettings } from './settings';
import { computeJulia } from './julia';
import { getRandomParameters, makeQueue, saveImageBuffer, pickRandom, mkdirs } from './utils';


const enqueue = makeQueue();

const replyToToot = async ({ id }, { acct, avatar_static }, instance, settings) => {
  // generate the image
  const params = getRandomParameters(acct);
  const outputPath = await computeJulia(acct, avatar_static, params);

  // upload the generated image
  const response = await instance.post('media', {
    file: Fs.createReadStream(outputPath),
  });
  if (response.data == null || response.data.id == null) {
    console.warn('Error while uploading image', response.data || response, outputPath);
    return;
  }
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

  Fs.unlinkSync(outputPath); // delete the generated image
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
    enqueue(() => {
      replyToToot(toot, author, instance, settings).then(() => {
        console.log('Reply sent', author.acct);
      }).catch((err) => {
        console.warn('Error while replying to toot', toot.content, author.acct, err);
      });
    });
  }
};

let publishing = false;
export const publishImage = async (instance, settings) => {
  if (publishing === true) {
    return;
  }
  publishing = true;

  const maker = ImageMakers[pickRandom(Object.keys(ImageMakers))];
  const buffer = await maker(2048, 2048);
  const outputPath = `${__dirname}/../img/image-${new Date().getTime()}.png`;
  mkdirs(Path.dirname(outputPath));

  await saveImageBuffer(buffer, 2048, 2048, outputPath);
  console.log('Generated', outputPath);

  // upload the generated image
  const response = await instance.post('media', {
    file: Fs.createReadStream(outputPath),
  });
  if (response.data == null || response.data.id == null) {
    console.warn('Error while uploading generated image', response.data || response, outputPath);
    return;
  }
  const mediaId = response.data.id;

  // send the toot
  instance.post('statuses', Object.assign({
    status: '(∩ ⚆ ᗜ ⚆ )⊃━✧.༸༓⁺ﾟ',
    media_ids: [ mediaId ],
  }, settings.tootOptions));

  publishing = false;
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

  setInterval(() => publishImage(instance, settings), 4 * 60 * 60 * 1000);

  console.log('Listening...');
};


