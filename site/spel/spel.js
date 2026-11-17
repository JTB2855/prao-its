const canvas = document.getElementById("spelplan");
const ctx = canvas.getContext("2d");

// Ladda character frames (8 per riktning)
const charaFrames = {
    0: [], // upp
    1: [], // höger
    2: [], // ner
    3: []  // vänster
};

// Ladda upp-frames
for (let i = 1; i <= 8; i++) {
    const img = new Image();
    img.src = `images/chara_upp_${i}.png`;
    charaFrames[0].push(img);
}

// Ladda höger-frames
for (let i = 1; i <= 8; i++) {
    const img = new Image();
    img.src = `images/chara_höger_${i}.png`;
    charaFrames[1].push(img);
}

// Ladda ner-frames
for (let i = 1; i <= 8; i++) {
    const img = new Image();
    img.src = `images/chara_ner_${i}.png`;
    charaFrames[2].push(img);
}

// Ladda vänster-frames
for (let i = 1; i <= 8; i++) {
    const img = new Image();
    img.src = `images/chara_vänster_${i}.png`;
    charaFrames[3].push(img);
}

// Spelarens position
let playerX = canvas.width / 2;
let playerY = canvas.height / 2;
const playerSize = 64;

// Animering
let animationFrame = 0;
let animationCounter = 0;
const animationSpeed = 8;

// Riktning (0=upp, 1=höger, 2=ner, 3=vänster)
let currentDirection = 2;

// Nuvarande rum
let currentRoom = 0;

// Rum-data 
const rooms = [
    { name: "Intro - Fallning", description: "Du trillar ner i brunnen..." },
    { name: "Skogsdunge", description: "Du är här. Flowie syns längre bort", npc: "Flowie", npcX: 600, npcY: 300 },
    { name: "Farmors hus", description: "Du är här. 3 vägar vidare", npc: "Farmor", npcX: 600, npcY: 300 },
    { name: "By söderut", description: "Orange drake här", npc: "Drake", npcX: 600, npcY: 300 },
    { name: "Grotta höger", description: "Skelett längre in", npc: "Papyrus", npcX: 600, npcY: 300 },
    { name: "Snöbiom vänster", description: "Hundar här", npc: "Hundar", npcX: 600, npcY: 300 },
    { name: "Rum 7", description: "Tomt rum", npc: null },
    { name: "Rum 8", description: "Tomt rum", npc: null },
    { name: "Rum 9", description: "Tomt rum", npc: null },
    { name: "Boss - Sikael", description: "Sista mötet!", npc: "Sikael", npcX: 600, npcY: 300 }
];

// Tangenttillstånd
const keys = {};

window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

function update() {
    // Rörelse
    const speed = 5;
    let moved = false;
    let newX = playerX;
    let newY = playerY;
    
    if (keys["ArrowUp"]) {
        newY -= speed;
        currentDirection = 0;
        moved = true;
    }
    if (keys["ArrowDown"]) {
        newY += speed;
        currentDirection = 2;
        moved = true;
    }
    if (keys["ArrowLeft"]) {
        newX -= speed;
        currentDirection = 3;
        moved = true;
    }
    if (keys["ArrowRight"]) {
        newX += speed;
        currentDirection = 1;
        moved = true;
    }

    // Uppdatera animering
    if (moved) {
        animationCounter++;
        if (animationCounter >= animationSpeed) {
            animationFrame = (animationFrame + 1) % 8;
            animationCounter = 0;
        }
    } else {
        animationFrame = 0;
        animationCounter = 0;
    }

    // Väggkollisioner
    if (newY < 0 && currentRoom > 0) {
        currentRoom--;
        playerX = canvas.width / 2;
        playerY = canvas.height - 20;
    } else if (newY > canvas.height && currentRoom < rooms.length - 1) {
        currentRoom++;
        playerX = canvas.width / 2;
        playerY = 20;
    } else if (newX < 0 && currentRoom > 0) {
        currentRoom--;
        playerX = canvas.width - 20;
        playerY = canvas.height / 2;
    } else if (newX > canvas.width && currentRoom < rooms.length - 1) {
        currentRoom++;
        playerX = 20;
        playerY = canvas.height / 2;
    } else {
        playerX = newX;
        playerY = newY;
    }
}

function draw() {
    // Rensa canvas
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Rumsnamn och info
    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    ctx.fillText(rooms[currentRoom].name, 20, 30);

    ctx.font = "16px Arial";
    ctx.fillText(rooms[currentRoom].description, 20, 60);

    // Rita NPC
    if (rooms[currentRoom].npc) {
        const npcX = rooms[currentRoom].npcX;
        const npcY = rooms[currentRoom].npcY;
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(npcX - 15, npcY - 15, 30, 30);
        ctx.fillStyle = "#ffff00";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText(rooms[currentRoom].npc, npcX, npcY + 25);
    }

    // Rita Chara
    const frames = charaFrames[currentDirection];
    if (frames.length > 0 && frames[animationFrame].complete) {
        ctx.drawImage(
            frames[animationFrame],
            playerX - playerSize / 2, playerY - playerSize / 2, playerSize, playerSize
        );
    }

    // Instruktioner
    ctx.fillStyle = "#888";
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Piltangenter: röra", 20, canvas.height - 20);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
