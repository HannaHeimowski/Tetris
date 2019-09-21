const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');



// -- creating the playground-- 
function draw() {
    // style the board
    context.fillStyle = '#8a8787';
    // should start with a clear board
    context.fillRect(0, 0, canvas.width, canvas.height);
    // draw the pieces in the arena in realtime
    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(piece.matrix, piece.pos);
}

//  --how big the playground should be--
const arena = createMatrix(12, 20);
    // console.log(arena);
    // console.table(arena);



// --create the 7 different pieces--
function createPiece(type)
{
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'O') {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === 'Z') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}

//  colors
const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

// get a random piece
function pieceReset() {
    // all the awaileable pieces in a string 
    const pieces = 'TJLOSZI';
    // create it randomly
    piece.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    // put it to the top
    piece.pos.y = 0;
    // center it
    piece.pos.x = (arena[0].length / 2 | 0) -
                   (piece.matrix[0].length / 2 | 0);
    // checks if the arena is filled and the game is over
    if (collide(arena, piece)) {
        arena.forEach(row => row.fill(0));
        // clear the arena
        piece.score = 0;
        // update the score
        updateScore();
    }
}


// draw the pieces
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            // skip a transparent row
            if (value !== 0) {
                // fill the forms with collercode they got by the value
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                                 y + offset.y,
                                 1, 1);
            }
        });
    });
}

// --for sizing the pieces--
context.scale(20, 20);


// ---the functionality of the game---------------------------------

// --position where the piece starts--
const piece = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
};

// --for displaying the position of the piece on the playground--
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}


// --copy the values of the piece into the arena at current position--
function merge(arena, piece) {
    piece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            // ignore the 0
            if (value !== 0) {
                arena[y + piece.pos.y][x + piece.pos.x] = value;
            }
        });
    });
}


// keyevents
// 37 > to the left
// 39 > to the right
// 40 > drop down
// 81 > q turn left
// 87 > w turn right
document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        // prevent touching the wall left
        pieceMove(-1);
    } else if (event.keyCode === 39) {
        // prevent touching the wall right
        pieceMove(1);
    } else if (event.keyCode === 40) {
        pieceDrop();
    } else if (event.keyCode === 81) {
        pieceRotate(-1);
    } else if (event.keyCode === 87) {
        pieceRotate(1);
    }
});


// drop the pieces
function pieceDrop() {
    // is preventing a unwanted drop repeat throu a delay of a second
    piece.pos.y++;
    if (collide(arena, piece)) {
        //  if it hits the ground
        piece.pos.y--;
        // check for the position of the piece
        merge(arena, piece);
        // then a new  piece should be droped
        pieceReset();
        // check if something caan be removed
        arenaSweep();
        // update the scorecounter
        updateScore();
    }
    // reseting the counter
    dropCounter = 0;
}


// --Rotate the matrix--
function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }
    // if the direction is positive
    if (dir > 0) {
        // stay
        matrix.forEach(row => row.reverse());
    } else {
        // else reverse the matrix
        matrix.reverse();
    }
}

// --Rotate the player on the playground--
function pieceRotate(dir) {
    const pos = piece.pos.x;
    let offset = 1;
    // after rotation check the collition again 
    rotate(piece.matrix, dir);
    // as long there is a rotation check for collition
    while (collide(arena, piece)) {
        // move the player to the offset (left side)
        piece.pos.x += offset;
        // check for the right
        offset = -(offset + (offset > 0 ? 1 : -1));
        // loop break if the player is in the matrix its ok to rotate
        if (offset > piece.matrix[0].length) {
            rotate(piece.matrix, -dir);
            // for reseting the offset
            piece.pos.x = pos;
            return;
        }
    }
}

// for delating a full row
function arenaSweep() {
    let rowCount = 1;
    // for itterating from the buttom up 
    outer: for (let y = arena.length -1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            // checking if row is full
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
    // it splices the full row and replace it with 0
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        // the index of the row was removed above so it needs to be reseted
        ++y;
        piece.score += rowCount * 10;
        rowCount *= 2;
    }
}

//  collition detection
function collide(arena, piece) {
    const m = piece.matrix;
    const o = piece.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                // ensure that the row exist
               (arena[y + o.y] &&
                // if it exist check for the child
                arena[y + o.y][x + o.x]) !== 0) {
                // collition if granted 
                return true;
            }
        }
    }
    return false;
}

// prevent the exit
function pieceMove(offset) {
    piece.pos.x += offset;
    // if move and collode inside the arena
    if (collide(arena, piece)) {
        // the move back
        piece.pos.x -= offset;
    }
}

// updating the canvas
// time > is the time in milliseconds that increments
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
    // droping effect of the pieces
    // you need to calculate the time by getting the difference
    const deltaTime = time - lastTime;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        pieceDrop();
    }

    lastTime = time;

    //  cause a continous drawing on a canvas
    draw();
    requestAnimationFrame(update);
}


function updateScore() {
    document.getElementById('score').innerText = piece.score;
}


pieceReset();
updateScore();
update();


// restarting the game
function restart(){
    document.location.href = "";
}