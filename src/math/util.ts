
export const MathUtil = {

  DEG2RAD: Math.PI / 180,
  RAD2DEG: 180 / Math.PI,

  clamp: function (value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
  },

  // compute euclidian modulo of m % n
  // https://en.wikipedia.org/wiki/Modulo_operation
  euclideanModulo: function (n: number, m: number) {
    return ((n % m) + m) % m;
  },

  // Linear mapping from range <a1, a2> to range <b1, b2>
  mapLinear: function (x: number, a1: number, a2: number, b1: number, b2: number) {
    return b1 + (x - a1) * (b2 - b1) / (a2 - a1);
  },

  // https://en.wikipedia.org/wiki/Linear_interpolation
  lerp: function (x: number, y: number, t: number) {
    return (1 - t) * x + t * y;
  },

  // http://en.wikipedia.org/wiki/Smoothstep
  smoothstep: function (x: number, min: number, max: number) {
    if (x <= min) return 0;
    if (x >= max) return 1;
    x = (x - min) / (max - min);
    return x * x * (3 - 2 * x);
  },

  smootherstep: function (x: number, min: number, max: number) {
    if (x <= min) return 0;
    if (x >= max) return 1;
    x = (x - min) / (max - min);
    return x * x * x * (x * (x * 6 - 15) + 10);
  },

  // Random integer from <low, high> interval
  randInt: function (low: number, high: number) {
    return low + Math.floor(Math.random() * (high - low + 1));
  },

  // Random float from <low, high> interval
  randFloat: function (low: number, high: number) {
    return low + Math.random() * (high - low);
  },

  // Random float from <-range/2, range/2> interval
  randFloatSpread: function (range: number) {
    return range * (0.5 - Math.random());
  },

  degToRad: function (degrees: number) {
    return degrees * MathUtil.DEG2RAD;
  },

  radToDeg: function (radians: number) {
    return radians * MathUtil.RAD2DEG;
  },

  isPowerOfTwo: function (value: number) {
    return (value & (value - 1)) === 0 && value !== 0;
  },

  nearestPowerOfTwo: function (value: number) {
    return Math.pow(2, Math.round(Math.log(value) / Math.LN2));
  },

  nextPowerOfTwo: function (value: number) {
    value--;
    value |= value >> 1;
    value |= value >> 2;
    value |= value >> 4;
    value |= value >> 8;
    value |= value >> 16;
    value++;
    return value;
  }

};

