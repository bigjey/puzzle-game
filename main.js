var img = ['1.png', '3.png', '4.jpg', '5.jpg'];

img.sort(() => Math.random() - 0.5);

var WIDTH;
var HEIGHT;
var pieceWidth;
var pieceHeight;
var borderSize = 8;

var currentDraggingPiece = null;
var pieceOriginPosition = null;
var clickOriginPositon = null;
var paused = true;

var bgWidth;
var bgHeight;

var pieces = [];
var grid = [];

var levels = {
  0: {
    width: 3,
    height: 2
  },
  1: {
    width: 3,
    height: 3
  },
  2: {
    width: 4,
    height: 3
  },
  3: {
    width: 4,
    height: 4
  },
  4: {
    width: 5,
    height: 4
  }
};

var level = 0;
var lastZIndex;

var frame = document.createElement('div');
frame.classList.add('frame');
document.body.appendChild(frame);

var highlight = document.createElement('div');
highlight.classList.add('highlight');
document.body.appendChild(highlight);

document.addEventListener('mouseup', mouseUp);
document.addEventListener('mousemove', mouseMove);

startLevel();

function startLevel(image = img[level]) {
  var i = new Image();
  i.src = image;
  i.onload = function() {
    WIDTH = levels[level].width;
    HEIGHT = levels[level].height;

    lastZIndex = 30;

    var aspect = i.width / i.height;

    bgUrl = `url(${image})`;

    bgWidth = window.innerWidth / 2.5;
    bgHeight = bgWidth / aspect;

    pieceWidth = bgWidth / WIDTH;
    pieceHeight = bgHeight / HEIGHT;

    highlight.style.width = `${pieceWidth}px`;
    highlight.style.height = `${pieceHeight}px`;

    frame.style.width = `${bgWidth + borderSize * 2}px`;
    frame.style.height = `${bgHeight + borderSize * 2}px`;
    frame.style.backgroundImage = bgUrl;
    frame.style.backgroundSize = `${bgWidth + borderSize * 2}px ${bgHeight +
      borderSize * 2}px`;

    Array.from(document.querySelectorAll('.piece')).forEach((piece) => {
      document.body.removeChild(piece);
    });

    pieces = [];
    grid = [];
    for (var y = 0; y < HEIGHT; y++) {
      grid[y] = [];
      for (var x = 0; x < WIDTH; x++) {
        var piece = document.createElement('div');

        piece.classList.add('piece');
        piece.style.width = `${pieceWidth}px`;
        piece.style.height = `${pieceHeight}px`;

        piece.style.left = `${frame.offsetLeft +
          x * pieceWidth +
          borderSize}px`;
        piece.style.top = `${frame.offsetTop + y * pieceHeight + borderSize}px`;

        piece.style.backgroundImage = bgUrl;
        piece.style.backgroundSize = `${bgWidth + borderSize * 2}px ${bgHeight +
          borderSize * 2}px`;
        piece.style.backgroundPosition = `${-x * pieceWidth -
          borderSize}px ${-y * pieceHeight - borderSize}px`;

        var index = x + y * WIDTH;

        piece.dataset.index = index;

        piece.addEventListener('mousedown', pieceMouseDown);

        document.body.appendChild(piece);
        pieces.push(piece);

        grid[y][x] = {
          index: index,
          piece: null
        };
      }
    }

    pieces.forEach((piece) => {
      piece.classList.add('dropped');
      setTimeout(() => {
        const randomLeft =
          20 + Math.random() * (window.innerWidth / 2 - 40 - pieceWidth);
        piece.style.left = `${randomLeft}px`;

        const randomTop =
          20 + Math.random() * (window.innerHeight - pieceHeight - 40);
        piece.style.top = `${randomTop}px`;

        paused = false;
      }, 1200);
    });
  };
}

function releasePiece(piece) {
  grid.forEach((row) => {
    row.forEach((cell) => {
      if (cell.piece === piece) {
        cell.piece = null;
      }
    });
  });
}

function pieceMouseDown(e) {
  if (paused) return;

  currentDraggingPiece = e.target;
  currentDraggingPiece.classList.remove('dropped');

  releasePiece(currentDraggingPiece);

  pieceOriginPosition = {
    x: e.target.offsetLeft,
    y: e.target.offsetTop
  };

  clickOriginPositon = {
    x: e.clientX,
    y: e.clientY
  };

  currentDraggingPiece.style.zIndex = ++lastZIndex;
}

function mouseUp(e) {
  if (!currentDraggingPiece) return;

  const movedX = e.clientX - clickOriginPositon.x;
  const movedY = e.clientY - clickOriginPositon.y;

  const x = pieceOriginPosition.x + movedX;
  const y = pieceOriginPosition.y + movedY;

  if (
    x < 0 ||
    y < 0 ||
    x > window.innerWidth - pieceWidth ||
    y > window.innerHeight - pieceHeight
  ) {
    currentDraggingPiece.classList.add('dropped');

    currentDraggingPiece.style.left = `${pieceOriginPosition.x}px`;
    currentDraggingPiece.style.top = `${pieceOriginPosition.y}px`;
  }

  if (
    e.clientX >= frame.offsetLeft + borderSize &&
    e.clientX <= frame.offsetLeft - borderSize + frame.clientWidth &&
    e.clientY >= frame.offsetTop + borderSize &&
    e.clientY <= frame.offsetTop - borderSize + frame.clientHeight
  ) {
    currentDraggingPiece.classList.add('dropped');

    var sectorX = Math.floor(
      (e.clientX - frame.offsetLeft - borderSize) / pieceWidth
    );
    var sectorY = Math.floor(
      (e.clientY - frame.offsetTop - borderSize) / pieceHeight
    );

    if (!grid[sectorY][sectorX].piece) {
      grid[sectorY][sectorX].piece = currentDraggingPiece;

      currentDraggingPiece.style.left = `${frame.offsetLeft +
        sectorX * pieceWidth +
        borderSize}px`;
      currentDraggingPiece.style.top = `${frame.offsetTop +
        sectorY * pieceHeight +
        borderSize}px`;
    } else {
      currentDraggingPiece.style.left = `${pieceOriginPosition.x}px`;
      currentDraggingPiece.style.top = `${pieceOriginPosition.y}px`;
    }
  }

  if (
    grid.every((row) =>
      row.every((cell) => cell.piece && cell.index == cell.piece.dataset.index)
    )
  ) {
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

  var sectorX = Math.floor(
    (e.clientX - frame.offsetLeft - borderSize) / pieceWidth
  );
  var sectorY = Math.floor(
    (e.clientY - frame.offsetTop - borderSize) / pieceHeight
  );

  if (
    sectorX >= 0 &&
    sectorX < WIDTH &&
    sectorY >= 0 &&
    sectorY < HEIGHT &&
    !grid[sectorY][sectorX].piece
  ) {
    highlight.classList.add('visible');

    highlight.style.left = `${frame.offsetLeft +
      sectorX * pieceWidth +
      borderSize}px`;
    highlight.style.top = `${frame.offsetTop +
      sectorY * pieceHeight +
      borderSize}px`;
  } else {
    highlight.classList.remove('visible');
  }
}
