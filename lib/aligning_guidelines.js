/**
 * Should objects be aligned by a bounding box?
 * [Bug] Scaled objects sometimes can not be aligned by edges
 */
function initAligningGuidelines(canvas, status, handler) {

  var ctx = canvas.getSelectionContext(),
    aligningLineOffset = 1,
    aligningLineMargin = 5,
    aligningLineWidth = 1,
    aligningLineColor = 'rgb(254,146,0)',
    viewportTransform,
    verticalLines = [],
    horizontalLines = [],
    centerLines = [];

  function drawVerticalLine(coords) {
    drawLine(
      coords.x + 0.5,
      coords.y1 > coords.y2 ? coords.y2 : coords.y1,
      coords.x + 0.5,
      coords.y2 > coords.y1 ? coords.y2 : coords.y1);
  }

  function drawHorizontalLine(coords) {
    drawLine(
      coords.x1 > coords.x2 ? coords.x2 : coords.x1,
      coords.y + 0.5,
      coords.x2 > coords.x1 ? coords.x2 : coords.x1,
      coords.y + 0.5);
  }

  function drawLine(x1, y1, x2, y2, center=false) {
    var v = canvas.viewportTransform;
    ctx.save();
    ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
    ctx.lineWidth = aligningLineWidth;
    ctx.strokeStyle = aligningLineColor;
    ctx.beginPath();
    if (!center) {
      ctx.setLineDash([8,4])
    }
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  function isInRange(value1, value2) {
    value1 = Math.round(value1);
    value2 = Math.round(value2);
    for (var i = value1 - aligningLineMargin, len = value1 + aligningLineMargin; i <= len; i++) {
      if (i === value2) {
        return true;
      }
    }
    return false;
  }

  handler.objectSanp = (event) => {
    var activeObject = event.target,
      canvasObjects = canvas.getObjects(),
      activeObjectCenter = activeObject.getCenterPoint(),
      activeObjectLeft = activeObjectCenter.x,
      activeObjectTop = activeObjectCenter.y,
      activeObjectBoundingRect = activeObject.getBoundingRect(),
      activeObjectHeight = activeObjectBoundingRect.height / viewportTransform[3],
      activeObjectWidth = activeObjectBoundingRect.width / viewportTransform[0],
      horizontalInTheRange = false,
      verticalInTheRange = false,
      centerInTheRange = false,
      transform = canvas._currentTransform;
    if (!transform) return;

    // It should be trivial to DRY this up by encapsulating (repeating) creation of x1, x2, y1, and y2 into functions,
    // but we're not doing it here for perf. reasons -- as this a function that's invoked on every mouse move

    for (var i = canvasObjects.length; i--; ) {

      var objectCenter = canvasObjects[i].getCenterPoint(),
        objectLeft = objectCenter.x,
        objectTop = objectCenter.y,
        objectBoundingRect = canvasObjects[i].getBoundingRect(),
        objectHeight = objectBoundingRect.height / viewportTransform[3],
        objectWidth = objectBoundingRect.width / viewportTransform[0];

      // 선택된 오브젝트면 아무것도 안하고 패스
      if (canvasObjects[i] === activeObject) {
        continue;
      }

      // 가이드마스크라면 중앙 라인만 표시
      else if (canvasObjects[i].resource_type === 'guide_mask') {
        // horizontal center line
        if (isInRange(objectLeft, activeObjectLeft)) {
          centerInTheRange = true;
          centerLines.push({
            x1: objectLeft,
            y1: objectTop - objectHeight / 2 - aligningLineOffset,
            x2: objectLeft,
            y2: objectTop + objectHeight / 2 + aligningLineOffset
          });
          activeObject.setPositionByOrigin(new fabric.Point(objectLeft, activeObjectTop), 'center', 'center');
        }
        // vertical center line
        if (isInRange(objectTop, activeObjectTop)) {
          centerInTheRange = true;
          centerLines.push({
            x1: objectLeft - objectWidth / 2 - aligningLineOffset,
            y1: objectTop,
            x2: objectLeft + objectWidth / 2 + aligningLineOffset,
            y2: objectTop
          });
          activeObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop), 'center', 'center');
        }
      }

      // 그 외 오브젝트면 상하좌우 라인 모두 표시
      else {
        // snap by the horizontal center line
        if (isInRange(objectLeft, activeObjectLeft)) {
          verticalInTheRange = true;
          verticalLines.push({
            x: objectLeft,
            y1: (objectTop < activeObjectTop)
              ? (objectTop - objectHeight / 2 - aligningLineOffset)
              : (objectTop + objectHeight / 2 + aligningLineOffset),
            y2: (activeObjectTop > objectTop)
              ? (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset)
              : (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
          });
          activeObject.setPositionByOrigin(new fabric.Point(objectLeft, activeObjectTop), 'center', 'center');
        }

        // snap by the vertical center line
        if (isInRange(objectTop, activeObjectTop)) {
          horizontalInTheRange = true;
          horizontalLines.push({
            y: objectTop,
            x1: (objectLeft < activeObjectLeft)
              ? (objectLeft - objectWidth / 2 - aligningLineOffset)
              : (objectLeft + objectWidth / 2 + aligningLineOffset),
            x2: (activeObjectLeft > objectLeft)
              ? (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset)
              : (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
          });
          activeObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop), 'center', 'center');
        }

        // object left + activeobject left(왼,왼)
        if (isInRange(objectLeft - objectWidth / 2, activeObjectLeft - activeObjectWidth / 2)) {
          verticalInTheRange = true;
          verticalLines.push({
            x: objectLeft - objectWidth / 2,
            y1: (objectTop < activeObjectTop)
              ? (objectTop - objectHeight / 2 - aligningLineOffset)
              : (objectTop + objectHeight / 2 + aligningLineOffset),
            y2: (activeObjectTop > objectTop)
              ? (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset)
              : (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
          });
          activeObject.setPositionByOrigin(new fabric.Point(objectLeft - objectWidth / 2 + activeObjectWidth / 2, activeObjectTop), 'center', 'center');
        }

        // object left + activeobject right(왼,오)
        if (isInRange(objectLeft - objectWidth / 2, activeObjectLeft + activeObjectWidth / 2)) {
          verticalInTheRange = true;
          verticalLines.push({
            x: objectLeft - objectWidth / 2,
            y1: (objectTop < activeObjectTop)
              ? (objectTop - objectHeight / 2 - aligningLineOffset)
              : (objectTop + objectHeight / 2 + aligningLineOffset),
            y2: (activeObjectTop > objectTop)
              ? (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset)
              : (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
          });
          activeObject.setPositionByOrigin(new fabric.Point(objectLeft - objectWidth / 2 - activeObjectWidth / 2, activeObjectTop), 'center', 'center');
        }

        // object right + activeobject right(오,오)
        if (isInRange(objectLeft + objectWidth / 2, activeObjectLeft + activeObjectWidth / 2)) {
          verticalInTheRange = true;
          verticalLines.push({
            x: objectLeft + objectWidth / 2,
            y1: (objectTop < activeObjectTop)
              ? (objectTop - objectHeight / 2 - aligningLineOffset)
              : (objectTop + objectHeight / 2 + aligningLineOffset),
            y2: (activeObjectTop > objectTop)
              ? (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset)
              : (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
          });
          activeObject.setPositionByOrigin(new fabric.Point(objectLeft + objectWidth / 2 - activeObjectWidth / 2, activeObjectTop), 'center', 'center');
        }

        // object right + activeobject left(오,왼)
        if (isInRange(objectLeft + objectWidth / 2, activeObjectLeft - activeObjectWidth / 2)) {
          verticalInTheRange = true;
          verticalLines.push({
            x: objectLeft + objectWidth / 2,
            y1: (objectTop < activeObjectTop)
              ? (objectTop - objectHeight / 2 - aligningLineOffset)
              : (objectTop + objectHeight / 2 + aligningLineOffset),
            y2: (activeObjectTop > objectTop)
              ? (activeObjectTop + activeObjectHeight / 2 + aligningLineOffset)
              : (activeObjectTop - activeObjectHeight / 2 - aligningLineOffset)
          });
          activeObject.setPositionByOrigin(new fabric.Point(objectLeft + objectWidth / 2 + activeObjectWidth / 2, activeObjectTop), 'center', 'center');
        }

        // object top + activeobject top(위,위)
        if (isInRange(objectTop - objectHeight / 2, activeObjectTop - activeObjectHeight / 2)) {
          horizontalInTheRange = true;
          horizontalLines.push({
            y: objectTop - objectHeight / 2,
            x1: (objectLeft < activeObjectLeft)
              ? (objectLeft - objectWidth / 2 - aligningLineOffset)
              : (objectLeft + objectWidth / 2 + aligningLineOffset),
            x2: (activeObjectLeft > objectLeft)
              ? (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset)
              : (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
          });
          activeObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop - objectHeight / 2 + activeObjectHeight / 2), 'center', 'center');
        }

        // object top + activeobject bottom(위,아래)
        if (isInRange(objectTop - objectHeight / 2, activeObjectTop + activeObjectHeight / 2)) {
          horizontalInTheRange = true;
          horizontalLines.push({
            y: objectTop - objectHeight / 2,
            x1: (objectLeft < activeObjectLeft)
              ? (objectLeft - objectWidth / 2 - aligningLineOffset)
              : (objectLeft + objectWidth / 2 + aligningLineOffset),
            x2: (activeObjectLeft > objectLeft)
              ? (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset)
              : (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
          });
          activeObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop - objectHeight / 2 - activeObjectHeight / 2), 'center', 'center');
        }

        // object bottom + activeobject bottom(아래,아래)
        if (isInRange(objectTop + objectHeight / 2, activeObjectTop + activeObjectHeight / 2)) {
          horizontalInTheRange = true;
          horizontalLines.push({
            y: objectTop + objectHeight / 2,
            x1: (objectLeft < activeObjectLeft)
              ? (objectLeft - objectWidth / 2 - aligningLineOffset)
              : (objectLeft + objectWidth / 2 + aligningLineOffset),
            x2: (activeObjectLeft > objectLeft)
              ? (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset)
              : (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
          });
          activeObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop + objectHeight / 2 - activeObjectHeight / 2), 'center', 'center');
        }

        // object bottom + activeobject top(아래,위)
        if (isInRange(objectTop + objectHeight / 2, activeObjectTop - activeObjectHeight / 2)) {
          horizontalInTheRange = true;
          horizontalLines.push({
            y: objectTop + objectHeight / 2,
            x1: (objectLeft < activeObjectLeft)
              ? (objectLeft - objectWidth / 2 - aligningLineOffset)
              : (objectLeft + objectWidth / 2 + aligningLineOffset),
            x2: (activeObjectLeft > objectLeft)
              ? (activeObjectLeft + activeObjectWidth / 2 + aligningLineOffset)
              : (activeObjectLeft - activeObjectWidth / 2 - aligningLineOffset)
          });
          activeObject.setPositionByOrigin(new fabric.Point(activeObjectLeft, objectTop + objectHeight / 2 + activeObjectHeight / 2), 'center', 'center');
        }
      }
    }
  }

  handler.beforeSnap = (event) => {
    viewportTransform = canvas.viewportTransform;
  }

  handler.clearSnap = (event) => {
    canvas.clearContext(ctx);
  }

  handler.drawSnap = (event) => {
    for (var i=verticalLines.length; i--; ) {
      drawVerticalLine(verticalLines[i]);
    }
    for (var i=horizontalLines.length; i--; ) {
      drawHorizontalLine(horizontalLines[i]);
    }
    for (var i=centerLines.length; i--; ) {
      drawLine(centerLines[i].x1,centerLines[i].y1,centerLines[i].x2,centerLines[i].y2,true)
    }
    verticalLines.length = horizontalLines.length = centerLines.length = 0;
  }

  handler.afterSnap = (event) => {
    verticalLines.length = horizontalLines.length = centerLines.length =  0;
    canvas.renderAll();
  }

  canvas.on('mouse:down', handler.beforeSnap);
  canvas.on('before:render', handler.clearSnap);
  canvas.on('object:moving', handler.objectSanp);
  canvas.on('after:render', handler.drawSnap);
  canvas.on('mouse:up', handler.afterSnap);
}
