import Fs from 'fs';
import mergeOptions from 'merge-options';

/** DEFAULT OPTIONS */
const TOOT_OPTIONS = {
  visibility: 'public',
  sensitive: false,
};
/** */

export const getSettings = (file) => {
  const data = Fs.readFileSync(file);
  if (data == null) {
    throw new Error('Unable to load settings');
  }

  const customSettings = JSON.parse(data);
  let { instanceUrl } = customSettings;
  const { accessToken } = customSettings;

  if (instanceUrl == null || accessToken == null) {
    throw new Error('accessToken and instanceUrl are mandatory');
  }
  if (instanceUrl.endsWith('/') === false) {
    instanceUrl = `${instanceUrl}/`;
  }

  const tootOptions = mergeOptions(TOOT_OPTIONS, customSettings.tootOptions || {});

  return {
    instanceUrl,
    accessToken,
    tootOptions,
  };
};

export default getSettings;
