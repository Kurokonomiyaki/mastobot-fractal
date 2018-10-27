import md5 from 'md5';
import Complex from 'complex.js';
import Path from 'path';

import { mapDomainToPixel, saveImage, readImage, mkdirs, createImage, mapPixelToDomain } from './utils';


export const computeJulia = async (account, avatarUri, params, width = 1024, height = 1024) => {
  const { cx, cy, d, trapSize, trapType } = params;
  
  const avatar = await readImage(avatarUri);
  let trap = null;
  if (trapType === 'circle') {
    trap = makeCircularBitmapTrap(avatar.bitmap.data, avatar.bitmap.width, avatar.bitmap.height, trapSize / 2, 0, 0);
  } else {
    trap = makeBitmapTrap(avatar.bitmap.data, avatar.bitmap.width, avatar.bitmap.height, trapSize, trapSize, 0, 0);
  }

  const c = new Complex(cx, cy);

  const image = await createImage(width, height);
  const buffer = image.bitmap.data;

  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      const [x, y] = mapPixelToDomain(i, j, width, height, JULIA_DOMAIN);

      const color = orbitTrapJulia(new Complex(x, y), c, trap, d, 100);

      const idx = (i + j * width) * 4;
      buffer[idx + 0] = color[0];
      buffer[idx + 1] = color[1];
      buffer[idx + 2] = color[2];
      buffer[idx + 3] = 255;
    }
  }

  const outputFile = md5(`${account}${new Date().getTime()}`);
  const outputPath = `${__dirname}/../tmp/${outputFile}.png`;
  mkdirs(Path.dirname(outputPath));

  await saveImage(image, outputPath);

  return outputPath;
};

export const orbitTrapJulia = (z0, c, trap, d = 2, maxIterations = 100) => {
  let zn = z0;
  let iterations = 0;
  let squaredMagnitude = zn.re*zn.re + zn.im*zn.im;
  while (squaredMagnitude <= 4 && iterations < maxIterations) {
    zn = zn.pow(d).add(c);
  
    if (trap.isTrapped(zn)) {
      return trap.interpolateTrap(zn);
    }

    squaredMagnitude = zn.re*zn.re + zn.im*zn.im;
    iterations++;
  }
  
  return trap.untrappedValue;
};

export const JULIA_DOMAIN = {
  xmin: -2,
  xmax: 2,
  ymin: -2,
  ymax: 2,
};

export const makeBitmapTrap = (bitmap, bitmapWidth, bitmapHeight, trapWidth, trapHeight, x, y ) => {
  const xmin = x - trapWidth / 2;
  const xmax = x + trapWidth / 2;
  const ymin = y - trapHeight / 2;
  const ymax = y + trapHeight / 2;
  const isTrapped = (z) => (z.re >= xmin && z.re <= xmax && z.im >= ymin && z.im <= ymax);

  const domain = { xmin, xmax, ymin, ymax };
  const interpolateTrap = (z) => {
    const [bx, by] = mapDomainToPixel(z.re, z.im, domain, bitmapWidth, bitmapHeight);
    const idx = (bx + by * bitmapWidth) * 4;
    return bitmap.slice(idx, idx + 3);
  }

  return {
    isTrapped,
    interpolateTrap,
    untrappedValue: [0, 0, 0],
  };
};

export const makeCircularBitmapTrap = (bitmap, bitmapWidth, bitmapHeight, trapRadius, x, y) => {
  const center = new Complex(x, y);
  const isTrapped = (z) => (z.sub(center).abs() <= trapRadius);

  const xmin = x - trapRadius;
  const xmax = x + trapRadius;
  const ymin = y - trapRadius;
  const ymax = y + trapRadius;
  const domain = { xmin, xmax, ymin, ymax };
  const interpolateTrap = (z) => {
    const [bx, by] = mapDomainToPixel(z.re, z.im, domain, bitmapWidth, bitmapHeight);
    const idx = (bx + by * bitmapWidth) * 4;
    return bitmap.slice(idx, idx + 3);
  }

  return {
    isTrapped,
    interpolateTrap,
    untrappedValue: [0, 0, 0],
  };
};