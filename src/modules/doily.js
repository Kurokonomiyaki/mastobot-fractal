import Complex from 'complex.js';
import { estimateAttractorDomain, applyContrastBasedScalefactor, makeMixedColorSteal, plotAttractorWithColorStealing, enforceRGBA, getAnalogousPalette } from '../plot';
import { randomComplex, scaleDomain, randomInteger, randomScalar, randomArray } from '../utils';

const makeHopalong = (a, b, c) => {
  return (z) => new Complex(z.im - Math.sign(z.re) * Math.sqrt(Math.abs(b * z.re - c)), a - z.re);
};

export const run = async (width, height) => {
  const nbIterations = 100000000;
  
  let domain = { xmin: 0, xmax: 0, ymin: 0, ymax : 0 };
  while (true) {
    const a = randomScalar(-5, 5);
    const b = randomScalar(-5, 5);
    const c = randomScalar(-5, 5);
    const f = makeHopalong(a, b, c);
  
    const finalTransform = (z) => z;
    const initalPoint = randomComplex();
    const initialPointPicker = () => initalPoint;
  
    domain = estimateAttractorDomain(f, initialPointPicker, finalTransform, nbIterations);

    if (Math.abs(domain.xmax - domain.xmin) > 50 && Math.abs(domain.ymax - domain.ymin) > 50) {
      domain = scaleDomain(domain, randomScalar(0.5, 0.85))

      const palette = getAnalogousPalette(randomArray(3, 50, 200), randomInteger(2, 6));
      const colorFunc = makeMixedColorSteal(palette, domain.xmax, nbIterations);

      console.log('Doily generator', a, b, c, initalPoint, domain,);
      let buffer = new Float64Array(width * height * 4);
      plotAttractorWithColorStealing(buffer, width, height, f, colorFunc, false, initialPointPicker, finalTransform, nbIterations, domain);
    
      const averageHits = Math.max(1, nbIterations / (width * height));
      applyContrastBasedScalefactor(buffer, width, height, averageHits);
    
      return enforceRGBA(buffer);
    }
  }
};
