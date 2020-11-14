import Matter, { Mouse } from 'matter-js';

/*
World: Object that contains all things in matter app
Engine: Tracks the current state of the world and calculates changes in positions
Runner: Gets the engine and world to work together . run 60 times / sec
Render: When ever engine process update. Render will go through them and display on screen 
Body : A shape that we are displaying. can be a circle, rectangle etc
*/
const { Engine, Render, Runner, World, Bodies, MouseConstraint } = Matter;
const canvas = document.querySelector('.canvas');
// create new engine
const engine = Engine.create();
// snapshot of all shapes
const { world } = engine;
// create render object
const width = 800;
const height = 600;
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

World.add(world, MouseConstraint.create(engine, { mouse: Mouse.create(render.canvas) }));
//walls
const walls = [
  Bodies.rectangle(400, 0, 800, 40, { isStatic: true }),
  Bodies.rectangle(400, 600, 800, 40, { isStatic: true }),
  Bodies.rectangle(0, 300, 40, 600, { isStatic: true }),
  Bodies.rectangle(800, 300, 40, 600, { isStatic: true }),
];
World.add(world, walls);

// random shapes
for (let i = 0; i < 20; i++) {
  const randomWidth = Math.random() * width;
  const randomHeight = Math.random() * height;
  if (Math.random() > 0.5) {
    const shape = Bodies.rectangle(randomWidth, randomHeight, 50, 50, {});
    World.add(world, shape);
  } else {
    const shape = Bodies.circle(randomWidth, randomHeight, 25, {
      // render: { fillStyle: '#5293e7' },
    });
    World.add(world, shape);
  }
}
