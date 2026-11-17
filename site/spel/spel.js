const canvas = document.getElementById("spelplan");
const ctx = canvas.getContext("2d");
const roomInfoDiv = document.getElementById("room-info");

// Spelarens position
let playerX = canvas.width / 2;
let playerY = canvas.height / 2;
const playerSize = 30;

// Nuvarande rum
let currentRoom = 0;

// Rum-data 
const rooms = [
    { name: "Intro - Fallning", description: "Du trillar ner i brunnen..." },
    { name: "Skogsdunge", description: "Blomman möter dig här", npc: "Blomman" },
    { name: "Farmors hus", description: "Du är här. 3 vägar vidare", npc: "Farmor" },
    { name: "By söderut", description: "Orange drake (blir din följare)", npc: "Drake" },
    { name: "Grotta höger", description: "Skelett med corny jokes", npc: "Skelett" },
    { name: "Snöbiom vänster", description: "Hundar försöker nå dig", npc: "Hundar" },
    { name: "Rum 7", description: "Att fylla i senare", npc: "?" },
    { name: "Rum 8", description: "Att fylla i senare", npc: "?" },
    { name: "Rum 9", description: "Att fylla i senare", npc: "?" },
    { name: "Boss - Sikael", description: "Sista mötet!", npc: "Sikael" }
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
    if (keys["ArrowUp"] || keys["w"]) playerY -= speed;
    if (keys["ArrowDown"] || keys["s"]) playerY += speed;
    if (keys["ArrowLeft"] || keys["a"]) playerX -= speed;
    if (keys["ArrowRight"] || keys["d"]) playerX += speed;

    // Håll spelaren inom canvas
    playerX = Math.max(playerSize, Math.min(canvas.width - playerSize, playerX));
    playerY = Math.max(playerSize, Math.min(canvas.height - playerSize, playerY));

    // Z för nästa rum
    if (keys["z"] || keys["Z"]) {
        if (currentRoom < rooms.length - 1) {
            currentRoom++;
            playerX = canvas.width / 2;
            playerY = canvas.height / 2;
        }
        keys["z"] = false;
        keys["Z"] = false;
    }

    // X för föregående rum
    if (keys["x"] || keys["X"]) {
        if (currentRoom > 0) {
            currentRoom--;
            playerX = canvas.width / 2;
            playerY = canvas.height / 2;
        }
        keys["x"] = false;
        keys["X"] = false;
    }
}

function draw() {
    // Rensa canvas
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Rumsnamn
    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    ctx.fillText(rooms[currentRoom].name, 20, 30);

    // Rumsinfo
    ctx.font = "16px Arial";
    ctx.fillText(rooms[currentRoom].description, 20, 60);

    // NPC-info (om det finns)
    if (rooms[currentRoom].npc && rooms[currentRoom].npc !== "?") {
        ctx.font = "14px Arial";
        ctx.fillStyle = "#ffff00";
        ctx.fillText("NPC: " + rooms[currentRoom].npc, 20, 90);
    }

    // Rita spelaren (en enkel kvadrat för nu)
    ctx.fillStyle = "#00ff00";
    ctx.fillRect(playerX - playerSize / 2, playerY - playerSize / 2, playerSize, playerSize);

    // Instruktioner
    ctx.fillStyle = "#888";
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Piltangenter: röra | Z: nästa rum | X: föregående rum", 20, canvas.height - 20);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();

