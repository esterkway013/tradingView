// core/renderPipe.js
export function render({ axis, line }, ctxs) {
  ctxs.axis.clearRect(0, 0, ctxs.axis.canvas.width, ctxs.axis.canvas.height);
  ctxs.line.clearRect(0, 0, ctxs.line.canvas.width, ctxs.line.canvas.height);

  axis.draw(ctxs.axis);
  line.draw(ctxs.line);
}
