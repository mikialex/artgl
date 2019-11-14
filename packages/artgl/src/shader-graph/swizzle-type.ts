// use this code gen type code!

// (function genType() {
//   const channelKeys = ['x', 'y', 'z', 'w', 'r', 'g', 'b', 'a']
//   const results = new Set();
//   for (let i = 0; i <= channelKeys.length; i++) {
//     for (let j = 0; j <= channelKeys.length; j++) {
//       for (let k = 0; k <= channelKeys.length; k++) {
//         for (let m = 0; m <= channelKeys.length; m++) {
//           results.add(
//             "\"" +
//             (i === channelKeys.length ? "" : channelKeys[i]) +
//             (j === channelKeys.length ? "" : channelKeys[j]) +
//             (k === channelKeys.length ? "" : channelKeys[k]) +
//             (m === channelKeys.length ? "" : channelKeys[m]) +
//             "\""
//           )
//         }
//       }
//     }
//   }
//   const types = [];
//   results.forEach(type => {
//     types.push(type);
//   })
//   const r = types.join(" | ")
//   let count = 1;
//   let result = ''
//   for (let i = 0; i < r.length; i++) {
//     const char = r[i];
//     if (char === "|") {
//       count++;
//       if (count % 10 === 0) {
//         result += "\n"
//       }
//     }
//     result += char;
//   }
//   return result
// })()

export type swizzleType = string
