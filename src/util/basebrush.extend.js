/**
 * Convert a brush drawing on the upperCanvas to an image on the fabric canvas.
 */
fabric.BaseBrush.prototype.convertToImg = function() {
  var pixelRatio = this.canvas.getRetinaScaling();
  var zoom = this.canvas.getZoom();
  var copy = fabric.util.copyCanvasElement(this.canvas.upperCanvasEl);
  var trimSize = fabric.util.trimCanvas(copy);
  var img = new fabric.Image(copy);
  this.canvas.add(img);
  img.set({
    originX:'center',
    originY:'center',
    left:(trimSize.left/zoom+trimSize.trimWidth/(2*zoom))/pixelRatio,
    top:(trimSize.top/zoom+trimSize.trimHeight/(2*zoom))/pixelRatio,
    'scaleX':1/zoom/pixelRatio,
    'scaleY':1/zoom/pixelRatio}).setCoords();
  this.canvas.clearContext(this.canvas.contextTop);
}
