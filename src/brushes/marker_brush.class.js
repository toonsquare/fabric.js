/**
 * MarkerBrush class
 * @class fabric.MarkerBrush
 * @extends fabric.BaseBrush
 * Based on code by Tennison Chan.
 * @see https://github.com/tennisonchan/fabric-brush
 */
(function() {
  fabric.MarkerBrush = fabric.util.createClass(fabric.BaseBrush, {

    color: "#000000",
    opacity: 1,
    width: 30,

    _baseWidth: 10,
    _lastPoint: null,
    _lineWidth: 3,
    _point: null,
    _size: 0,

    initialize: function(canvas, opt) {
      opt = opt || {};

      this.canvas = canvas;
      this.width = opt.width || canvas.freeDrawingBrush.width;
      this.color = opt.color || canvas.freeDrawingBrush.color;
      this.opacity = opt.opacity || canvas.contextTop.globalAlpha;
      this._point = new fabric.Point();

      this.canvas.contextTop.lineJoin = 'round';
      this.canvas.contextTop.lineCap = 'round';
    },


    _render: function(pointer) {
      var ctx, lineWidthDiff, i, len;
      ctx = this.canvas.contextTop;
      this._saveAndTransform(ctx);
      if (pointer) {
        ctx.beginPath();

        for(i = 0, len = (this._size / this._lineWidth) / 2; i < len; i++) {
          lineWidthDiff = (this._lineWidth - 1) * i;

          ctx.globalAlpha = 0.8 * this.opacity;
          ctx.moveTo(this._lastPoint.x + lineWidthDiff, this._lastPoint.y + lineWidthDiff);
          ctx.lineTo(pointer.x + lineWidthDiff, pointer.y + lineWidthDiff);
          ctx.stroke();
        }

        this._lastPoint = new fabric.Point(pointer.x, pointer.y);
      }
      ctx.restore();
    },

    onMouseDown: function(pointer) {
      this._lastPoint = pointer;
      this.canvas.contextTop.strokeStyle = this.color;
      this.canvas.contextTop.lineWidth = this._lineWidth;
      this._size = this.width + this._baseWidth;
      this._render(pointer);
    },

    onMouseMove: function(pointer) {
      if (this.canvas._isCurrentlyDrawing) {
        this._render(pointer);
      }
    },

    onMouseUp: function() {
      this.convertToImg();
      this.canvas.contextTop.globalAlpha = this.opacity;
    }
  });
})();
