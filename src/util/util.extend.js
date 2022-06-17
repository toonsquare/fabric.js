/** get random number
 */
fabric.util.getRandom = function(max, min){
  min = min ? min : 0;
  return Math.random() * ((max ? max : 1) - min) + min;
};

/**
 * Trim a canvas. Returns the left-top coordinate where trimming began.
 * @param {canvas} canvas A canvas element to trim. This element will be trimmed (reference).
 * @returns {Object} Left-top coordinate of trimmed area. Example: {x:65, y:104}
 * @see: https://stackoverflow.com/a/22267731/3360038
 */
fabric.util.trimCanvas = function(canvas) {
  var ctx = canvas.getContext('2d'),
      w = canvas.width,
      h = canvas.height,
      pix = {x:[], y:[]}, n,
      imageData = ctx.getImageData(0,0,w,h),
      fn = function(a,b) { return a-b };

  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      if (imageData.data[((y * w + x) * 4)+3] > 0) {
        pix.x.push(x);
        pix.y.push(y);
      }
    }
  }
  pix.x.sort(fn);
  pix.y.sort(fn);
  n = pix.x.length-1;

  w = pix.x[n] - pix.x[0] + 5;
  h = pix.y[n] - pix.y[0] + 5;
  var cut = ctx.getImageData(pix.x[0], pix.y[0], w, h);

  canvas.width = w;
  canvas.height = h;
  ctx.putImageData(cut, 0, 0);
  return {left:pix.x[0], top:pix.y[0], trimWidth:w, trimHeight:h} ;
};
