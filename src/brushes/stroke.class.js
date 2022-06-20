/**
 * Stroke class
 * @class fabric.Stroke
 * @extends fabric.Object
 * @see: https://github.com/tennisonchan/fabric-brush
 */
fabric.Stroke = fabric.util.createClass(fabric.Object,{
  color: null,
  inkAmount: null,
  lineWidth: null,
  _point: null,
  _lastPoint: null,
  _currentLineWidth: null,

  initialize: function(ctx, pointer, range, color, lineWidth, inkAmount){

    // 랜덤하게 선을 긋기 위한 초기 변수 지정
    var rx = fabric.util.getRandom(range),
        c = fabric.util.getRandom(Math.PI * 2),
        c0 = fabric.util.getRandom(Math.PI * 2),
        x0 = rx * Math.sin(c0),
        y0 = rx / 2 * Math.cos(c0),
        cos = Math.cos(c),
        sin = Math.sin(c);

    this.ctx = ctx;
    this.color = color;
    this._point = new fabric.Point(pointer.x + x0 * cos - y0 * sin, pointer.y + x0 * sin + y0 * cos);
    this.lineWidth = lineWidth;
    this.inkAmount = inkAmount;
    this._currentLineWidth = lineWidth;

    ctx.lineCap = "round";
  },

  // 매번 새로 선을 그을때마다 랜덤하게 지정되도록 업데이트
  update: function(pointer, subtractPoint, distance) {
    this._lastPoint = fabric.util.object.clone(this._point);
    this._point = this._point.addEquals({ x: subtractPoint.x, y: subtractPoint.y });

    var n = this.inkAmount / (distance + 1);
    var per = (n > 0.3 ? 0.2 : n < 0 ? 0 : n);
    this._currentLineWidth = this.lineWidth * per;
  },

  // 실제 선을 그리는 부분
  draw: function(){
    var ctx = this.ctx;
    ctx.save();
    this.line(ctx, this._lastPoint, this._point, this.color, this._currentLineWidth);
    ctx.restore();
  },

  line: function(ctx, point1, point2, color, lineWidth) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(point1.x, point1.y);
    ctx.lineTo(point2.x, point2.y);
    ctx.stroke();
  }
});
