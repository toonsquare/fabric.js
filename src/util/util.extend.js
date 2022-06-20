/** get random number for InkBrush
 * @see https://github.com/tennisonchan/fabric-brush
 */
fabric.util.getRandom = function(max, min){
  min = min ? min : 0;
  return Math.random() * ((max ? max : 1) - min) + min;
};

/**
 * Trim a canvas. Returns the left-top coordinate where trimming began & width and height.
 * @param {canvas} canvas A canvas element to trim. This element will be trimmed (reference).
 * @returns {Object} Left-top coordinate, width & height of trimmed area. (width & height is actually added 5 pixel)
 * @see: https://stackoverflow.com/a/22267731/3360038
 * @see: https://github.com/av01d/fabric-brushes
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

  w = pix.x[n] - pix.x[0] + 5; // 실제 픽셀에 딱 맞게 지정하면 끝이 조금 잘리기 때문에 5 픽셀정도 여유 지정
  h = pix.y[n] - pix.y[0] + 5;
  var cut = ctx.getImageData(pix.x[0], pix.y[0], w, h);

  canvas.width = w;
  canvas.height = h;
  ctx.putImageData(cut, 0, 0);
  return {left:pix.x[0], top:pix.y[0], trimWidth:w, trimHeight:h} ;
};
