var img = ['1.png', '2.jpg', '3.png'];

var WIDTH = 2;
var HEIGHT = 2;
var pieceSize = 150;
var borderSize = 5;

var currentDraggingPiece = null;
var pieceOriginPosition = null;
var clickOriginPositon = null;
var paused = false;

var frame = document.createElement('div');
frame.classList.add('frame');
document.body.appendChild(frame);

var highlight = document.createElement('div');
highlight.classList.add('highlight');
document.body.appendChild(highlight);


var bgWidth = pieceSize * WIDTH;
var bgHeight = pieceSize * HEIGHT;

var pieces = [];
var grid = [];

var imageIndex = 0;

function startLevel() {
  paused = false;

  bgWidth = pieceSize * WIDTH + borderSize * 2;
  bgHeight = pieceSize * HEIGHT + borderSize * 2;

  pieces = [];
  grid = [];

  highlight.style.width = `${pieceSize}px`;
  highlight.style.height = `${pieceSize}px`;

  frame.style.width = `${bgWidth}px`
  frame.style.height = `${bgHeight}px`
  frame.style.backgroundImage = `url(${img[imageIndex]})`;
  frame.style.backgroundSize = `${bgWidth}px ${bgHeight}px`;

  Array.from(document.querySelectorAll('.piece')).forEach(piece => {
    document.body.removeChild(piece);
  });

  for (var y = 0; y < HEIGHT; y++) {
    grid[y] = [];
    for (var x = 0; x < WIDTH; x++) {
      var piece = document.createElement('div');

      piece.classList.add('piece');
      piece.style.width = `${pieceSize}px`;
      piece.style.height = `${pieceSize}px`;

      const randomLeft = 20 + (Math.random() * (window.innerWidth / 2 - 40 - pieceSize));
      piece.style.left = `${randomLeft}px`;

      const randomTop = 20 + (Math.random() * (window.innerHeight - pieceSize - 40));
      piece.style.top = `${randomTop}px`;

      piece.style.backgroundImage = `url(${img[imageIndex]})`;
      piece.style.backgroundSize = `${bgWidth}px ${bgHeight}px`;
      piece.style.backgroundPosition = `${-x * pieceSize - borderSize}px ${-y * pieceSize - borderSize}px`;

      piece.dataset.index = x + y * WIDTH;

      piece.addEventListener('mousedown', pieceMouseDown);

      document.body.appendChild(piece);
      pieces.push(piece);

      grid[y][x] = {
        index: x + y * WIDTH,
        piece: null
      }
    }
  }
}

document.addEventListener('mouseup', mouseUp);
document.addEventListener('mousemove', mouseMove);

function releasePiece(piece) {
  grid.forEach(row => {
    row.forEach(cell => {
      if (cell.piece === piece) {
        cell.piece = null;
      }
    })
  })
}

function pieceMouseDown(e) {
  if (paused) return;

  currentDraggingPiece = e.target;
  currentDraggingPiece.classList.remove('dropped');
  releasePiece(currentDraggingPiece);

  pieceOriginPosition = {
    x: e.target.offsetLeft,
    y: e.target.offsetTop
  }

  clickOriginPositon = {
    x: e.clientX,
    y: e.clientY
  }

  pieces.forEach(piece => piece.style.zIndex = 20);
  currentDraggingPiece.style.zIndex = 30;
}

function mouseUp(e) {
  if (!currentDraggingPiece) return;

  const movedX = e.clientX - clickOriginPositon.x;
  const movedY = e.clientY - clickOriginPositon.y;

  const x = pieceOriginPosition.x + movedX;
  const y = pieceOriginPosition.y + movedY;

  if (x < 0 || y < 0 || x > window.innerWidth - pieceSize || y > window.innerHeight - pieceSize) {
    currentDraggingPiece.classList.add('dropped');

    currentDraggingPiece.style.left = `${pieceOriginPosition.x}px`;
    currentDraggingPiece.style.top = `${pieceOriginPosition.y}px`;
  }

  if (
    e.clientX >= frame.offsetLeft &&
    e.clientX <= frame.offsetLeft + frame.clientWidth &&
    e.clientY >= frame.offsetTop &&
    e.clientY <= frame.offsetTop + frame.clientHeight
  ) {
    currentDraggingPiece.classList.add('dropped');

    var sectorX = (e.clientX - frame.offsetLeft) / pieceSize | 0;
    var sectorY = (e.clientY - frame.offsetTop) / pieceSize | 0;

    if (!grid[sectorY][sectorX].piece) {
      grid[sectorY][sectorX].piece = currentDraggingPiece;

      currentDraggingPiece.style.left = `${frame.offsetLeft + sectorX * pieceSize + borderSize}px`;
      currentDraggingPiece.style.top = `${frame.offsetTop + sectorY * pieceSize + borderSize}px`;

    } else {
      currentDraggingPiece.style.left = `${pieceOriginPosition.x}px`;
      currentDraggingPiece.style.top = `${pieceOriginPosition.y}px`;
    }
  }

  if (grid.every(row => row.every(cell => cell.piece && cell.index == cell.piece.dataset.index))) {
    paused = true;
    setTimeout(() => {
      WIDTH++;
      HEIGHT++;
      imageIndex = ++imageIndex % img.length;
      startLevel();
    }, 2000);
  }

  highlight.classList.remove('visible');
  currentDraggingPiece = null;
}

function mouseMove(e) {
  if (!currentDraggingPiece) return;

  const movedX = e.clientX - clickOriginPositon.x;
  const movedY = e.clientY - clickOriginPositon.y;

  const x = pieceOriginPosition.x + movedX;
  const y = pieceOriginPosition.y + movedY;

  currentDraggingPiece.style.left = `${x}px`;
  currentDraggingPiece.style.top = `${y}px`;

  var sectorX = Math.floor((e.clientX - frame.offsetLeft) / pieceSize);
  var sectorY = Math.floor((e.clientY - frame.offsetTop) / pieceSize);

  if (sectorX >= 0 && sectorX < WIDTH && sectorY >= 0 && sectorY < HEIGHT && !grid[sectorY][sectorX].piece) {
    highlight.classList.add('visible');

    highlight.style.left = `${frame.offsetLeft + sectorX * pieceSize + borderSize}px`;
    highlight.style.top = `${frame.offsetTop + sectorY * pieceSize + borderSize}px`;
  } else {
    highlight.classList.remove('visible');
  }
}

startLevel();