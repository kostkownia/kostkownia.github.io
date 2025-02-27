window.console = window.console || function (t) {};
if (document.location.search.match(/type=embed/gi)) {
  window.parent.postMessage("resize", "*");
}
var colors = ["blue", "green", "white", "yellow", "orange", "red"],
  pieces = document.getElementsByClassName("piece");

function mx(i, j) {
  return ([2, 4, 3, 5][j % 4 | 0] + (i % 2) * (((j | 0) % 4) * 2 + 3) + 2 * ((i / 2) | 0)) % 6;
}

function getAxis(face) {
  return String.fromCharCode("X".charCodeAt(0) + face / 2);
}

function assembleCube() {
  function moveto(face) {
    id = id + (1 << face);
    pieces[i].children[face].appendChild(document.createElement("div")).setAttribute("class", "sticker " + colors[face]);
    return "translate" + getAxis(face) + "(" + ((face % 2) * 4 - 2) + "em)";
  }
  for (var id, x, i = 0; (id = 0), i < 26; i++) {
    x = mx(i, i % 18);
    pieces[i].style.transform = "rotateX(0deg)" + moveto(i % 6) + (i > 5 ? moveto(x) + (i > 17 ? moveto(mx(x, x + 2)) : "") : "");
    pieces[i].setAttribute("id", "piece" + id);
  }
}

function getPieceBy(face, index, corner) {
  return document.getElementById("piece" + ((1 << face) + (1 << mx(face, index)) + (1 << mx(face, index + 1)) * corner));
}

function swapPieces(face, times) {
  for (var i = 0; i < 6 * times; i++) {
    var piece1 = getPieceBy(face, i / 2, i % 2),
      piece2 = getPieceBy(face, i / 2 + 1, i % 2);
    for (var j = 0; j < 5; j++) {
      var sticker1 = piece1.children[j < 4 ? mx(face, j) : face].firstChild,
        sticker2 = piece2.children[j < 4 ? mx(face, j + 1) : face].firstChild,
        className = sticker1 ? sticker1.className : "";
      if (className) (sticker1.className = sticker2.className), (sticker2.className = className);
    }
  }
}

let moveHistory = [];

function animateRotation(face, cw, currentTime) {
  moveHistory.push({ face, cw });

  var k = 0.3 * ((face % 2) * 2 - 1) * (2 * cw - 1),
    qubes = Array(9)
      .fill(pieces[face])
      .map(function (value, index) {
        return index ? getPieceBy(face, index / 2, index % 2) : value;
      });
  (function rotatePieces() {
    var passed = Date.now() - currentTime,
      style = "rotate" + getAxis(face) + "(" + k * passed * (passed < 300) + "deg)";
    qubes.forEach(function (piece) {
      piece.style.transform = piece.style.transform.replace(/rotate.\(\S+\)/, style);
    });
    if (passed >= 300) return swapPieces(face, 3 - 2 * cw);
    requestAnimationFrame(rotatePieces);
  })();
}

function shuffleCube() {
  const moves = 20;
  const faces = [0, 1, 2, 3, 4, 5];

  function randomMove() {
    const face = faces[Math.floor(Math.random() * faces.length)];
    const cw = Math.random() > 0.5;
    animateRotation(face, cw, Date.now());
  }

  function performMove(index) {
    if (index >= moves) return;
    randomMove();
    setTimeout(() => performMove(index + 1), 300);
  }

  performMove(0);
}

function solveCube() {
  const reversedMoves = [...moveHistory].reverse().map((move) => ({
    face: move.face,
    cw: !move.cw,
  }));

  let currentMove = 0;

  function performMove() {
    if (currentMove >= reversedMoves.length) {
      console.log("Kostka ułożona!");
      moveHistory = [];
      return;
    }

    const { face, cw } = reversedMoves[currentMove];
    animateRotation(face, cw, Date.now());

    setTimeout(() => {
      currentMove++;
      performMove();
    }, 300);
  }

  performMove();
}

document.getElementById("shuffleButton").addEventListener("click", shuffleCube);
document.getElementById("solveButton").addEventListener("click", solveCube);

function mousedown(md_e) {
  var startXY = pivot.style.transform.match(/-?\d+\.?\d*/g).map(Number),
    element = md_e.target.closest(".element"),
    face = [].indexOf.call((element || cube).parentNode.children, element);
  function mousemove(mm_e) {
    if (element) {
      var gid = /\d/.exec(document.elementFromPoint(mm_e.pageX, mm_e.pageY).id);
      if (gid && gid.input.includes("anchor")) {
        mouseup();
        var e = element.parentNode.children[mx(face, Number(gid) + 3)].hasChildNodes();
        animateRotation(mx(face, Number(gid) + 1 + 2 * e), e, Date.now());
      }
    } else pivot.style.transform = "rotateX(" + (startXY[0] - (mm_e.pageY - md_e.pageY) / 2) + "deg)" + "rotateY(" + (startXY[1] + (mm_e.pageX - md_e.pageX) / 2) + "deg)";
  }

  function mouseup() {
    document.body.appendChild(guide);
    scene.removeEventListener("mousemove", mousemove);
    document.removeEventListener("mouseup", mouseup);
    scene.addEventListener("mousedown", mousedown);
  }

  (element || document.body).appendChild(guide);
  scene.addEventListener("mousemove", mousemove);
  document.addEventListener("mouseup", mouseup);
  scene.removeEventListener("mousedown", mousedown);
}

document.ondragstart = function () {
  return false;
};
window.addEventListener("load", assembleCube);

scene.addEventListener("mousedown", mousedown);