/*
Algorithm

1-Create a grid of cells - 2d array
2-Pick a random starting cell
3-For that cell, build a randomly ordered list of neighbors
4-if neighbor has been visited, remove it from the list
5-for each remaining neibor, move to the next neighbor and remove the wall betwwen them cells
6- Repeat for new neigbor .step 4

working: 2d array grid
vertical wall: vertical wall between between two cells
horizontal wall: horizontal wall between between two cells
if true => no wall , false = wall
 */

import Matter from 'matter-js';

/*
World: Object that contains all things in matter app
Engine: Tracks the current state of the world and calculates changes in positions
Runner: Gets the engine and world to work together . run 60 times / sec
Render: When ever engine process update. Render will go through them and display on screen 
Body : A shape that we are displaying. can be a circle, rectangle etc
*/
const { Engine, Render, Runner, World, Bodies, Events, Body } = Matter;
const canvas = document.querySelector('.maze');
// create new engine
const engine = Engine.create();
engine.world.gravity.y = 0;
// snapshot of all shapes
const { world } = engine;
// create render object
const width = 600;
const height = 600;
const cellsHorizontal = 14;
const cellsVertical = 10;
const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;
const render = Render.create({
  element: canvas,
  engine: engine,
  options: { width: width, height: height, wireframes: false },
});
//render
Render.run(render);
// runner
Runner.run(Runner.create(), engine);
// shapes

//walls
// manipulate the walls wrt to width and height
const walls = [
  Bodies.rectangle(width / 2, 0, width, 5, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, 5, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 5, height, { isStatic: true }),
  Bodies.rectangle(width, height / 2, 5, height, { isStatic: true }),
];
World.add(world, walls);

// Maze generation
// const grid = [];

// for (let i = 0; i < 3; i++) {
//   grid.push([]);
//   for (let j = 0; j < 3; j++) {
//     grid[i].push(false);
//   }
// }
// const cells = 5;
// //Create Grid :  3 rows 4 columns
// const grid = new Array(cells).fill(null).map(() => {
//   return new Array(cells).fill(false);
// });
// // vertical sides 2 insides arrays
// const verticals = new Array(cells).fill(null).map(() => {
//   return new Array(cells - 1).fill(false);
// });
// // Horizontal sides 2 insides in arrays
// const horizontals = new Array(cells - 1).fill(null).map(() => {
//   return new Array(cells).fill(false);
// });

// const startRow = Math.floor(Math.random() * cells);
// const startColumn = Math.floor(Math.random() * cells);
const grid = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical - 1)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);
const shuffle = (arr) => {
  let counter = arr.length;

  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);

    counter--;

    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }

  return arr;
};
const stepCell = (row, column) => {
  // if cell has been visited at row, column then return
  if (grid[row][column]) {
    return;
  }
  // Mark this cell as being visited
  grid[row][column] = true;

  // Assemble randomly-ordered list of neighbors
  const neighbors = shuffle([
    [row - 1, column, 'up'],
    [row, column + 1, 'right'],
    [row + 1, column, 'down'],
    [row, column - 1, 'left'],
  ]);
  // For each neighbor....
  for (let neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor;

    // See if that neighbor is out of bounds
    if (
      nextRow < 0 ||
      nextRow >= cellsVertical ||
      nextColumn < 0 ||
      nextColumn >= cellsHorizontal
    ) {
      continue;
    }

    // If we have visited that neighbor, continue to next neighbor
    if (grid[nextRow][nextColumn]) {
      continue;
    }

    // Remove a wall from either horizontals or verticals
    if (direction === 'left') {
      verticals[row][column - 1] = true;
    } else if (direction === 'right') {
      verticals[row][column] = true;
    } else if (direction === 'up') {
      horizontals[row - 1][column] = true;
    } else if (direction === 'down') {
      horizontals[row][column] = true;
    }

    stepCell(nextRow, nextColumn);
  }
};

stepCell(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }

    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX / 2,
      rowIndex * unitLengthY + unitLengthY,
      unitLengthX,
      5,
      {
        label: 'wall',
        isStatic: true,
        render: {
          fillStyle: 'red',
        },
      }
    );
    World.add(world, wall);
  });
});

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }

    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX,
      rowIndex * unitLengthY + unitLengthY / 2,
      5,
      unitLengthY,
      {
        label: 'wall',
        isStatic: true,
        render: {
          fillStyle: 'red',
        },
      }
    );
    World.add(world, wall);
  });
});

// Goal

const goal = Bodies.rectangle(
  width - unitLengthX / 2,
  height - unitLengthY / 2,
  unitLengthX * 0.7,
  unitLengthY * 0.7,
  {
    label: 'goal',
    isStatic: true,
    render: {
      fillStyle: '#4aff68',
    },
  }
);
World.add(world, goal);

// Ball

const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius, {
  label: 'ball',
  render: {
    fillStyle: '#0093e9',
  },
});
World.add(world, ball);

document.addEventListener('keydown', (event) => {
  const { x, y } = ball.velocity;

  if (event.keyCode === 87) {
    Body.setVelocity(ball, { x, y: y - 5 });
  }

  if (event.keyCode === 68) {
    Body.setVelocity(ball, { x: x + 5, y });
  }

  if (event.keyCode === 83) {
    Body.setVelocity(ball, { x, y: y + 5 });
  }

  if (event.keyCode === 65) {
    Body.setVelocity(ball, { x: x - 5, y });
  }
});

// Win Condition

Events.on(engine, 'collisionStart', (event) => {
  event.pairs.forEach((collision) => {
    const labels = ['ball', 'goal'];

    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      world.gravity.y = 1;
      world.bodies.forEach((body) => {
        if (body.label === 'wall') {
          Body.setStatic(body, false);
        }
      });
    }
  });
});
