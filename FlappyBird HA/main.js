
//canvas
let canvas;
let canvasWidth = 360;
let canvasHeight = 640;
let context;

//fish
let fishWidth = 44; 
let fishHeight = 34;
let fishX = canvasWidth/8;
let fishY = canvasHeight/2;
let fishImg;

let fish = {
    x : fishX,
    y : fishY,
    width : fishWidth,
    height : fishHeight
}

//grasss
let grassArray = [];
let grassWidth = 60; 
let grassHeight = 512;
let grassX = canvasWidth;
let grassY = 0;

let topgrassImg;
let bottomgrassImg;
let coverImg;
let startgameImg;
let buttonplayImg;
let gamestarted=false;

//physics
let velocityX = -2; //grasss moving left speed
let velocityY = 0; //fish jump speed
let gravity = 0.4;

let gameOver = false;
let score = 0;

window.onload = function() {

  canvas = document.getElementById("canvas");
  canvas.height = canvasHeight;
  canvas.width = canvasWidth;
  context = canvas.getContext("2d"); 

  showStartScreen();
  document.getElementById("playButton").addEventListener("click", startGame);
  canvas.addEventListener("click", function(e) {
    movefish(e);
  });
}

function startGame() {
  if (!gamestarted) {
    canvas.style.display = "block"; // Show the canvas
    document.getElementById("start-screen").style.display = "none"; // Hide the start screen
    gamestarted = true;

    //load images
    fishImg = new Image();
    fishImg.src = "./flappyfish.png";
    fishImg.onload = function() {
      context.drawImage(fishImg, fish.x, fish.y, fish.width, fish.height);
    }

    topgrassImg = new Image();
    topgrassImg.src = "./topgrass.png";

    bottomgrassImg = new Image();
    bottomgrassImg.src = "./bottomgrass.png";

    setInterval(placegrasss, 1500); // every 1.5 seconds
    document.addEventListener("keydown", movefish);
    requestAnimationFrame(update);
  }
}

// Function to apply linear transformation
let transformationMatrix = [1, 0, 0, 1, 0, 0];
function applyLinearTransformation(x, y) {
  // implemtasion linier transformation 
  let newX = transformationMatrix[0] * x + transformationMatrix[2] * y + transformationMatrix[4];
  let newY = transformationMatrix[1] * x + transformationMatrix[3] * y + transformationMatrix[5];
  return { x: newX, y: newY };
}
let darkScreen = false; 
let darkScreenPeriod = false;

// function animation game
function update() {
  requestAnimationFrame(update);
  // if gameOver, back to start
  if (gameOver) {
    return;
  }

  if ((score >= 0 && score < 10) || (score >= 20 && score < 40) || (score >= 60 && score < 80)) {

    darkScreen = false;
    darkScreenPeriod = false;

  } else if ((score >= 10 && score < 20) || (score >= 40 && score < 60)|| (score >= 80 && score < 90)) {

    darkScreen = true;
    if(!darkScreenPeriod){
    darkScreenPeriod = true;
    }

  } else if (score === 100) {

    gameOver = true;
    darkScreen = false;
    return;

  } else {
      darkScreen = false;
      darkScreenPeriod = false;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Update fish's vertical velocity with gravity
    velocityY += gravity;

    // Update fish's position based on velocity
    fish.y = Math.max(fish.y + velocityY, 0);

    // Draw fish
    context.drawImage(fishImg, fish.x, fish.y, fish.width, fish.height);
    // funcion if the fish hits the canvas
  if (fish.y > canvas.height) {

    gameOver = true;

  }

  // grasss logic
  for (let i = 0; i < grassArray.length; i++) {
    let grass = grassArray[i];
    grass.x += velocityX;
    context.drawImage(grass.img, grass.x, grass.y, grass.width, grass.height);

    if (!grass.passed && fish.x > grass.x + grass.width) {
      score += 0.5;
      grass.passed = true;
    }
  // Collision detection function call
    if (detectCollision(fish, grass)) {
      gameOver = true;
    }
  }

  // Clear grasss
  while (grassArray.length > 0 && grassArray[0].x < -grassWidth) {
    grassArray.shift();
  }

  // Draw score
  if(!darkScreen){
    context.fillStyle = "black";
    context.fillStyle = "rgba(0, 0, 0, 0.8)"; // Warna putih dengan transparansi 0.8
    context.font = "30px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
      context.fillText("GAME OVER", 5, 90);
      context.globalAlpha = 1;
    }

  } else {
        
    context.fillStyle = "rgba(0, 0, 0, 0.7)"; 
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.globalAlpha = 1;

    context.fillStyle = "white";
    context.fillStyle = "rgba(255, 255, 255, 0.8)"; // Warna putih dengan transparansi 0.8
    context.font = "30px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
      context.fillText("GAME OVER", 5, 90);
      context.globalAlpha = 1;
    }
  } 

  // Light effect on the fish
  if (!gameOver && darkScreen) {
    transformationMatrix[4] = fish.x; // Translasi x
    transformationMatrix[5] = fish.y; // Translasi y

    let transformedfish = applyLinearTransformation(fish.width / 2, fish.height / 2);
        
    let gradient = context.createRadialGradient(
      transformedfish.x, transformedfish.y, 0,
      transformedfish.x, transformedfish.y, fish.width
    );

    gradient.addColorStop(0, "transparent");
    gradient.addColorStop(0.8, "transparent");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0.5)");

    context.fillStyle = gradient;
    context.beginPath();
    context.arc(transformedfish.x, transformedfish.y, fish.width * 1.5, 0, Math.PI * 2);
    context.fill();

    context.drawImage(fishImg, fish.x, fish.y, fish.width, fish.height);
  }
}
// funcion place of grass
function placegrasss() {
  // if the grass hits
  if (gameOver) {
    return;
  }
  // output random grass
  let randomgrassY = grassY - grassHeight/4 - Math.random()*(grassHeight/2);
  let openingSpace = canvas.height/4;

  let topgrass = {
    img : topgrassImg,
    x : grassX,
    y : randomgrassY,
    width : grassWidth,
    height : grassHeight,
    passed : false
  }
  
  grassArray.push(topgrass);
 
  let bottomgrass = {
    img : bottomgrassImg,
    x : grassX,
    y : randomgrassY + grassHeight + openingSpace,
    width : grassWidth,
    height : grassHeight,
    passed : false
  }

  grassArray.push(bottomgrass);

}

function movefish(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX"|| e.type == "click") {
        //jump
        velocityY = -6;
        //reset game
        if (gameOver) {
            fish.y = fishY;
            grassArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

function detectCollision(canvas_a, canvas_b) {
  return canvas_a.x < canvas_b.x + canvas_b.width &&   //a's top left corner doesn't reach b's top right corner
        canvas_a.x + canvas_a.width > canvas_b.x &&   //a's top right corner passes b's top left corner
        canvas_a.y < canvas_b.y + canvas_b.height &&  //a's top left corner doesn't reach b's bottom left corner
        canvas_a.y + canvas_a.height > canvas_b.y;    //a's bottom left corner passes b's top left corner
}

function showStartScreen() {
  canvas.style.display = "none"; 
  document.getElementById("start-screen").style.display = "flex";
}

function showEndScreen() {
  canvas.style.display = "none"; 
  document.getElementById("Game-Over").style.display = "flex";
}