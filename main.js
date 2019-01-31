var img = ['1.png', '3.png', '4.jpg', '5.jpg'];

img.sort(() => Math.random() - 0.5);

var WIDTH = 2;
var HEIGHT = 2;
var pieceWidth = 150;
var pieceHeight = 150;
var borderSize = 8;

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


var bgWidth;
var bgHeight;

var pieces = [];
var grid = [];

var levels = {
  0: {
    width: 3,
    height: 3
  },
  1: {
    width: 4,
    height: 4
  },
  2: {
    width: 5,
    height: 4
  },
  3: {
    width: 5,
    height: 5
  },
  4: {
    width: 6,
    height: 5
  }
}

var level = 0;

function startLevel() {
  var i = new Image();
  i.src = img[level];
  i.onload = function () {
    paused = false;

    WIDTH = levels[level].width;
    HEIGHT = levels[level].height;

    var aspect = i.width / i.height;

    bgUrl = `url(${img[level]})`;

    bgWidth = window.innerWidth / 2.5;
    bgHeight = bgWidth / aspect;

    pieceWidth = bgWidth / WIDTH;
    pieceHeight = bgHeight / HEIGHT;

    pieces = [];
    grid = [];

    highlight.style.width = `${pieceWidth}px`;
    highlight.style.height = `${pieceHeight}px`;

    frame.style.width = `${bgWidth + borderSize * 2}px`
    frame.style.height = `${bgHeight + borderSize * 2}px`
    frame.style.backgroundImage = bgUrl;
    frame.style.backgroundSize = `${bgWidth + borderSize * 2}px ${bgHeight + borderSize * 2}px`;

    Array.from(document.querySelectorAll('.piece')).forEach(piece => {
      document.body.removeChild(piece);
    });

    for (var y = 0; y < HEIGHT; y++) {
      grid[y] = [];
      for (var x = 0; x < WIDTH; x++) {
        var piece = document.createElement('div');

        piece.classList.add('piece');
        piece.style.width = `${pieceWidth}px`;
        piece.style.height = `${pieceHeight}px`;

        piece.style.left = `${window.innerWidth / 4}px`;
        piece.style.top = `${window.innerHeight / 2}px`;

        piece.style.backgroundImage = bgUrl;
        piece.style.backgroundSize = `${bgWidth + borderSize * 2}px ${bgHeight + borderSize * 2}px`;
        piece.style.backgroundPosition = `${-x * pieceWidth - borderSize}px ${-y * pieceHeight - borderSize}px`;

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

    pieces.forEach(piece => {
      piece.classList.add('dropped');
      setTimeout(() => {
        const randomLeft = 20 + (Math.random() * (window.innerWidth / 2 - 40 - pieceWidth));
        piece.style.left = `${randomLeft}px`;

        const randomTop = 20 + (Math.random() * (window.innerHeight - pieceHeight - 40));
        piece.style.top = `${randomTop}px`;
      }, 0);


    })


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

  if (x < 0 || y < 0 || x > window.innerWidth - pieceWidth || y > window.innerHeight - pieceHeight) {
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

    var sectorX = Math.floor((e.clientX - frame.offsetLeft) / pieceWidth);
    var sectorY = Math.floor((e.clientY - frame.offsetTop) / pieceHeight);

    if (!grid[sectorY][sectorX].piece) {
      grid[sectorY][sectorX].piece = currentDraggingPiece;

      currentDraggingPiece.style.left = `${frame.offsetLeft + sectorX * pieceWidth + borderSize}px`;
      currentDraggingPiece.style.top = `${frame.offsetTop + sectorY * pieceHeight + borderSize}px`;

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
      level = ++level % img.length;
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

  var sectorX = Math.floor((e.clientX - frame.offsetLeft) / pieceWidth);
  var sectorY = Math.floor((e.clientY - frame.offsetTop) / pieceHeight);

  if (sectorX >= 0 && sectorX < WIDTH && sectorY >= 0 && sectorY < HEIGHT && !grid[sectorY][sectorX].piece) {
    highlight.classList.add('visible');

    highlight.style.left = `${frame.offsetLeft + sectorX * pieceWidth + borderSize}px`;
    highlight.style.top = `${frame.offsetTop + sectorY * pieceHeight + borderSize}px`;
  } else {
    highlight.classList.remove('visible');
  }
}

startLevel();