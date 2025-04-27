const THRESHOLD = 8; // 방향 판단 최소 이동량 (px)

function getDirection(dx: number, dy: number): 'L' | 'R' | 'U' | 'D' | null {
  if (Math.abs(dx) < THRESHOLD && Math.abs(dy) < THRESHOLD) return null;
  return Math.abs(dx) > Math.abs(dy)
    ? (dx > 0 ? 'R' : 'L')
    : (dy > 0 ? 'D' : 'U');
}

// 중앙 텍스트 표시용 함수
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

  // 1초 후에 자연스럽게 사라지게
  setTimeout(() => {
    div.style.transition = 'opacity 0.5s';
    div.style.opacity = '0';
    setTimeout(() => div.remove(), 500);
  }, 1000);
}

document.addEventListener('mousedown', (e) => {
  if (e.button !== 2) return; // 우클릭만 처리
  e.preventDefault();

  let startX = e.clientX, startY = e.clientY;
  let lastX = startX, lastY = startY;
  let directions: ('L' | 'R' | 'U' | 'D')[] = [];

  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;

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
      ctx?.moveTo(startX, startY);
      ctx && (ctx.strokeStyle = 'red');
      ctx && (ctx.lineWidth = 2);
      document.body.appendChild(canvas);
    }

    const dx = moveEvent.clientX - lastX;
    const dy = moveEvent.clientY - lastY;
    const dir = getDirection(dx, dy);

    if (dir && dir !== directions[directions.length - 1]) {
      if (directions.length < 3) {
        directions.push(dir);
      }
    }

    ctx?.lineTo(moveEvent.clientX, moveEvent.clientY);
    ctx?.stroke();

    lastX = moveEvent.clientX;
    lastY = moveEvent.clientY;
  };

  const upHandler = (upEvent: MouseEvent) => {
    if (upEvent.button !== 2) return;

    document.removeEventListener('mousemove', moveHandler);
    document.removeEventListener('mouseup', upHandler);
    canvas?.remove();

    if (directions.length > 0) {
      const pattern = directions.join('');
      console.log('인식한 제스처:', pattern);
      showGesture(pattern);  // << 여기 추가된 부분
    }

    if (directions.length > 0) {
      upEvent.preventDefault(); // 우클릭 메뉴 방지
    }
  };

  document.addEventListener('mousemove', moveHandler);
  document.addEventListener('mouseup', upHandler);
});
