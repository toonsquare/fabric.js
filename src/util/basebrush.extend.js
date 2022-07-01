/**
 * Convert a brush drawing on the upperCanvas to an image on the fabric canvas.
 * @return {void}
 * @see: https://github.com/av01d/fabric-brushes
 */
fabric.BaseBrush.prototype.convertToImg = function() {
  var pixelRatio = this.canvas.getRetinaScaling();
  var zoom = this.canvas.getZoom();
  var scale = pixelRatio * zoom;
  var copy = fabric.util.copyCanvasElement(this.canvas.upperCanvasEl);
  var trimSize = fabric.util.trimCanvas(copy);
  var img = new fabric.Image(copy);
  this.canvas.add(img);
  img.set({
    originX: 'center',
    originY: 'center',
    left: (trimSize.left+trimSize.trimWidth/2-this.canvas.viewportTransform[4]*pixelRatio)/scale,
    top: (trimSize.top+trimSize.trimHeight/2-this.canvas.viewportTransform[5]*pixelRatio)/scale,
    scaleX: 1/scale,
    scaleY: 1/scale}).setCoords(); // zoom과 pixelRatio를 이용해 현재 줌 상태와 기기 너비 등에 맞춰 위치와 스케일을 지정
  this.canvas.clearContext(this.canvas.contextTop);
}
