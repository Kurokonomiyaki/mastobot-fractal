import md5 from 'md5';
import Fs from 'fs';
import Path from 'path';
import Jimp from 'jimp';

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