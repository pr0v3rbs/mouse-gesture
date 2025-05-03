const THRESHOLD = 8; // Threshold for gesture recognition
type Dir = 'L' | 'R' | 'U' | 'D';

function getDirection(dx: number, dy: number): Dir | null {
  if (Math.abs(dx) < THRESHOLD && Math.abs(dy) < THRESHOLD) return null;
  return Math.abs(dx) > Math.abs(dy)
    ? (dx > 0 ? 'R' : 'L')
    : (dy > 0 ? 'D' : 'U');
}

// Show the gesture pattern on the screen
function showGesture(pattern: string) {
  const div = document.createElement('div');
  div.textContent = pattern;
  Object.assign(div.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '48px',
    color: 'red',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: '10px 20px',
    borderRadius: '10px',
    zIndex: '10000',
    pointerEvents: 'none',
    fontWeight: 'bold',
  });
  document.body.appendChild(div);

  // Deappear the gesture pattern after 1 second
  setTimeout(() => {
    div.style.transition = 'opacity 0.5s';
    div.style.opacity = '0';
    setTimeout(() => div.remove(), 500);
  }, 1000);
}

document.addEventListener('mousedown', (e) => {
  if (e.button !== 2) return; // Protect right-click
  e.preventDefault();

  let moved = false;
  const dirs: Dir[] = [];
  let [sx, sy] = [e.clientX, e.clientY];
  let [lx, ly] = [sx, sy];
  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;

  const ctxMenuBlock = (cmEvt: MouseEvent) => {
    if (moved) cmEvt.preventDefault();
  };

  document.addEventListener('contextmenu', ctxMenuBlock, { capture: true, once: true });

  const moveHandler = (moveEvent: MouseEvent) => {
    if (!canvas) {
      canvas = document.createElement('canvas');
      Object.assign(canvas.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        zIndex: '9999',
        pointerEvents: 'none'
      });
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx = canvas.getContext('2d');
      ctx?.beginPath();
      ctx?.moveTo(sx, sy);
      ctx && (ctx.strokeStyle = 'red');
      ctx && (ctx.lineWidth = 2);
      document.body.appendChild(canvas);
      moved = true;
    }

    const dir = getDirection(moveEvent.clientX - lx, moveEvent.clientY - ly);
    if (dir && dir !== dirs[dirs.length - 1] && dirs.length < 3) dirs.push(dir);

    ctx?.lineTo(moveEvent.clientX, moveEvent.clientY);
    ctx?.stroke();
    [lx, ly] = [moveEvent.clientX, moveEvent.clientY];
  };

  const upHandler = (upEvent: MouseEvent) => {
    if (upEvent.button !== 2) return;

    document.removeEventListener('mousemove', moveHandler);
    document.removeEventListener('mouseup', upHandler);
    canvas?.remove();

    if (dirs.length) {
      const pattern = dirs.join('');
      showGesture(pattern);
      chrome.runtime.sendMessage({ type: 'gesture', pattern });
      upEvent.preventDefault();
    }
  };

  document.addEventListener('mousemove', moveHandler);
  document.addEventListener('mouseup', upHandler);
});
