import md5 from 'md5';
import Fs from 'fs';
import Path from 'path';
import Jimp from 'jimp';
import Complex from 'complex.js';


export const IdentityFunc = (z) => z;

export const BI_UNIT_DOMAIN = { xmin: -1, xmax: 1, ymin: -1, ymax: 1 };
export const UNIT_DOMAIN = { xmin: 0, xmax: 1, ymin: 0, ymax: 1 };

export const mapPixelToDomain = (x, y, width, height, domain) => {
  const domainWidth = domain.xmax - domain.xmin;
  const domainHeight = domain.ymax - domain.ymin;

  const xRatio = domainWidth / width;
  const yRatio = domainHeight / height;
  return [
    domain.xmin + (x * xRatio),
    domain.ymin + (y * yRatio),
  ];
};

export const mapDomainToPixel = (x, y, domain, width, height) => {
  // optimization if domain is 0-1
  if (domain.xmin === 0 && domain.xmax === 1 && domain.ymin === 0 && domain.ymax === 1) {
    return [
      Math.trunc(x * width),
      Math.trunc(y * height),
    ];
  }

  const domainWidth = domain.xmax - domain.xmin;
  const domainHeight = domain.ymax - domain.ymin;

  const xRatio = (width - 1) / domainWidth;
  const yRatio = (height - 1) / domainHeight;
  return [
    Math.trunc((x - domain.xmin) * xRatio, width),
    Math.trunc((y - domain.ymin) * yRatio, height),
  ];
};

export const getRandomParameters = (str) => {
  const hash = md5(str);
  const cx = 1 - parseInt(hash.substring(0, 2), 16) / 127.5;
  const cy = 1 - parseInt(hash.substring(2, 4), 16) / 127.5;
  const d = 2 + Math.round(3 * parseInt(hash.substring(4, 6), 16) / 255);
  const trapSize = 0.75 + (parseInt(hash.substring(6, 8), 16) / 510);

  let trapType = 'square';
  if (parseInt(hash.substring(6, 7), 16) % 2 === 1) {
    trapType = 'circle';
  }
  return { cx, cy, d, trapSize, trapType };
};


export const createImage = async (width, height) => {
  return new Promise((resolve, reject) => {
    new Jimp(width, height, (err, image) => {
      if (err) {
        reject(err);
      } else {
        resolve(image);
      }
    });
  });
};

export const readImage = async (path) => {
  return Jimp.read(path);
};

export const saveImage = async (image, path) => {
  return image.writeAsync(path);
};

export const saveImageBuffer = async (buffer, width, height, path) => {
  return new Promise((resolve, reject) => {
    new Jimp({ data: buffer, width, height }, (err, image) => {
      if (err) {
        reject(err);
      } else {
        saveImage(image, path)
          .then(() => resolve(image))
          .catch(reject);
      }
    });
  });
};

export const mkdirs = (dir) => {
 const initDir = Path.isAbsolute(dir) ? Path.sep : '';
 dir.split(Path.sep).reduce((parentDir, childDir) => {
   const curDir = Path.resolve(parentDir, childDir);
   if (Fs.existsSync(curDir) === false) {
     Fs.mkdirSync(curDir);
   }
   return curDir;
 }, initDir);
};

export const makeQueuedFunction = (f, delay = 10000) => {
  let lastTaken = 0;
  return (...args) => {
    const delta = Date.now() - lastTaken;
    if (delta > 0 && delta < delay) {
      lastTaken = Date.now() + delta;
      setTimeout(() => f(...args), delta);
    } else if (delta < 0) {
      lastTaken += delay;
      setTimeout(() => f(...args), Math.abs(delta));
    } else {
      lastTaken = Date.now();
      f(...args);
    }
  };
};

export const makeQueue = (delay = 10000) => {
  return makeQueuedFunction((f, ...args) => f(...args), delay);
};

export const clamp = (x, min, max) => {
  return Math.max(min, Math.min(x, max));
};

export const clampInt = (x, min, max) => {
  return Math.trunc(clamp(x, min, max));
};

export const randomScalar = (min = -1, max = 1) => {
  return Math.random() * (max - min) + min;
};
export const randomInteger = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
};
export const randomComplex = (reMin = -1, reMax = 1, imMin = -1, imMax = 1) => {
  return new Complex(randomScalar(reMin, reMax), randomScalar(imMin, imMax));
};
export const randomArray = (size, min = -1, max = 1) => {
  const arr = new Array(size);
  for (let i = 0; i < size; i++) {
    arr[i] = randomScalar(min, max);
  }
  return arr;
};
export const randomRgbColor = () => {
  return randomArray(3, 0, 255);
};
export const pickRandom = (arr) => {
  return arr[Math.trunc(Math.random() * arr.length)];
};

export const scaleDomain = (domain, scale = 1) => {
  return {
    xmin: domain.xmin * scale,
    ymin: domain.ymin * scale,
    xmax: domain.xmax * scale,
    ymax: domain.ymax * scale,
  };
};
