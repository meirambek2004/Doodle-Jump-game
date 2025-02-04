const doddle = document.querySelector("#doddle");
const backgr = document.querySelector("#background");
const playButton = document.querySelector("#play-button");
const gameOver = document.querySelector("#gameover");
const repeatGame = document.querySelector(".repeat-icon");
let positionX = 85;
let positionY = 620;
let up = -5;
let gameActive = false;
let activeMonsters = 0;
let score = 0;

playButton.addEventListener("click", () => {
  gameActive = true;
  playButton.style.display = "none";
  jump();
});

document.addEventListener("keydown", (event) => {
  const doddleWidth = doddle.offsetWidth;
  const backWidth = backgr.offsetWidth;
  if (event.key === "ArrowLeft") {
    positionX -= 10;
    if (positionX + doddleWidth <= 0) {
      positionX = backWidth;
    }
    doddle.style.transform = "scaleX(-1)";
  } else if (event.key === "ArrowRight") {
    positionX += 10;
    if (positionX >= backWidth) {
      positionX = -doddleWidth;
    }
    doddle.style.transform = "scaleX(1)";
  }
  doddle.style.left = positionX + "px";
});

const platformWidth = 100;
const platformHeight = 20;
const platforms = [];
const distancePlatform = 160;

function randomPlatform() {
  let yOffset = 0;
  for (let i = 0; i < 5; i++) {
    const platform = document.createElement("div");
    platform.style.width = `${platformWidth}px`;
    platform.style.height = `${platformHeight}px`;
    platform.style.background = "green";
    platform.style.position = "absolute";
    platform.style.borderRadius = "20px";
    backgr.appendChild(platform);

    let x = Math.random() * (backgr.offsetWidth - platformWidth);
    let y = yOffset;
    platform.style.left = `${x}px`;
    platform.style.top = `${y}px`;
    platforms.push({ platform, x, y });
    yOffset += distancePlatform;
  }
}
randomPlatform();

function jump() {
  const maxJumpHeight = 120;
  const scrollThreshold = 500;
  let jumpStartY = positionY;

  const jumpup = setInterval(() => {
    if (!gameActive) {
      clearInterval(jumpup);
      return;
    }
    if (positionY >= backgr.offsetHeight) {
      gameActive = false;
      gameOver.style.display = "block";
      activeMonsters = 0;
      platforms.forEach(({ platform }) => platform.remove());
      return;
    }

    positionY += up;

    if (positionY <= jumpStartY - maxJumpHeight) {
      up = 5;
    }

    doddle.style.top = positionY + "px";

    if (positionY < scrollThreshold && up < 0) {
      scroll();
      const backgroundY = parseFloat(
        getComputedStyle(backgr).backgroundPositionY
      );
      backgr.style.backgroundPositionY = `${backgroundY - up}px`;
    }

    platforms.forEach(({ platform }) => {
      const doodleCoordinate = doddle.getBoundingClientRect();
      const platformCoordinate = platform.getBoundingClientRect();

      if (
        doodleCoordinate.bottom - 10 >= platformCoordinate.top &&
        doodleCoordinate.top <= platformCoordinate.bottom &&
        doodleCoordinate.right >= platformCoordinate.left &&
        doodleCoordinate.left <= platformCoordinate.right &&
        up > 0
      ) {
        up = -5;
        jumpStartY = positionY;
      }
    });
  }, 20);
}

function repeat() {
  repeatGame.addEventListener("click", () => {
    gameOver.style.display = "none";
    positionX = 85;
    positionY = 620;
    up = -5;
    score = 0;
    yourScore();
    doddle.style.left = positionX + "px";
    doddle.style.top = positionY + "px";
    platforms.forEach(({ platform }) => platform.remove());
    platforms.length = 0;
    randomPlatform();
    document.querySelectorAll(".monster").forEach((monster) => {
      monster.remove();
    });
    activeMonsters = 0;
    gameActive = true;
    jump();
  });
}
repeat();

function scroll() {
  const scrollSpeed = 5;
  platforms.forEach((platformObj, index) => {
    platformObj.y += scrollSpeed;
    platformObj.platform.style.top = `${platformObj.y}px`;

    if (platformObj.y > backgr.offsetHeight) {
      platforms.splice(index, 1);
      platformObj.platform.remove();

      const newPlatform = document.createElement("div");
      newPlatform.style.width = `${platformWidth}px`;
      newPlatform.style.height = `${platformHeight}px`;
      newPlatform.style.background = "green";
      newPlatform.style.position = "absolute";
      newPlatform.style.borderRadius = "20px";

      const newX = Math.random() * (backgr.offsetWidth - platformWidth);
      const newY = Math.min(...platforms.map((p) => p.y)) - distancePlatform;

      newPlatform.style.left = `${newX}px`;
      newPlatform.style.top = `${newY}px`;

      backgr.appendChild(newPlatform);
      platforms.push({ platform: newPlatform, x: newX, y: newY });
      score += 10;
      yourScore();

      if (Math.random() < 0.2) {
        createFlyMonster(newX, newY - 50);
      }
    }
  });
}
function yourScore() {
  const scoreElement = document.querySelector("#gameover p:first-child");
  scoreElement.textContent = `Your score: ${score}`;
}

function createFlyMonster(x, y) {
  if (activeMonsters > 0) return;
  activeMonsters++;
  let flyMonster = document.createElement("img");
  flyMonster.src = "./Fly2.webp";
  flyMonster.style.width = "50px";
  flyMonster.style.position = "absolute";
  flyMonster.style.top = `${y}px`;
  flyMonster.style.left = `${x}px`;
  flyMonster.classList.add("monster");

  backgr.appendChild(flyMonster);

  let speedY = Math.random() * 3 + 2;
  let speedX = Math.random() * 2 + 1;
  let directionX;

  if (Math.random() < 0.5) {
    directionX = -1;
  } else {
    directionX = 1;
  }

  function moveMonster() {
    if (!gameActive) return;

    let monsterY = parseFloat(flyMonster.style.top);
    let monsterX = parseFloat(flyMonster.style.left);

    monsterY += speedY;
    monsterX += speedX * directionX;

    if (monsterX <= 0 || monsterX >= backgr.offsetWidth - 50) {
      directionX *= -1;
    }

    flyMonster.style.top = monsterY + "px";
    flyMonster.style.left = monsterX + "px";

    const doddleCoordinate = doddle.getBoundingClientRect();
    const monsterCoordinate = flyMonster.getBoundingClientRect();

    if (
      doddleCoordinate.bottom >= monsterCoordinate.top &&
      doddleCoordinate.top <= monsterCoordinate.bottom &&
      doddleCoordinate.right >= monsterCoordinate.left &&
      doddleCoordinate.left <= monsterCoordinate.right
    ) {
      gameActive = false;
      gameOver.style.display = "block";
      flyMonster.remove();
      activeMonsters--;
    }
    if (monsterY > backgr.offsetHeight) {
      flyMonster.remove();
      activeMonsters--;
    } else {
      requestAnimationFrame(moveMonster);
    }
  }
  moveMonster();
}
