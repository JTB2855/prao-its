const canvas = document.getElementById("spelplan");
const ctx = canvas.getContext("2d");

// Ladda sprite sheet
const spriteSheet = new Image();
spriteSheet.src = "images/chara.png";

// Spelarens position
let playerX = canvas.width / 2;
let playerY = canvas.height / 2;
const playerSize = 32;

// Animering
let animationFrame = 0;
let animationCounter = 0;
const animationSpeed = 10; // Fler = långsammare

// Riktning (0=upp, 1=höger, 2=ner, 3=vänster)
let currentDirection = 2; // Standard: ner

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

    // Uppdatera animering endast när spelaren rör sig
    if (moved) {
        animationCounter++;
        if (animationCounter >= animationSpeed) {
            animationFrame = (animationFrame + 1) % 8;
            animationCounter = 0;
        }
    } else {
        // Stå still - visa första framen för aktuell riktning
        animationFrame = 0;
        animationCounter = 0;
    }

    // Väggkollisioner - gå till nästa/föregående rum ENDAST om det finns ett rum
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
        // Om vi inte går till nästa rum, uppdatera normalt
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

    // Rita NPC om det finns en
    if (rooms[currentRoom].npc) {
        const npcX = rooms[currentRoom].npcX;
        const npcY = rooms[currentRoom].npcY;
        
        // Enkelt: NPC som en röd kvadrat för nu
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(npcX - 15, npcY - 15, 30, 30);
        
        // NPC-namn
        ctx.fillStyle = "#ffff00";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.fillText(rooms[currentRoom].npc, npcX, npcY + 25);
    }

    // Rita spelaren med sprite sheet
    if (spriteSheet.complete) {
        // Sprite sheet layout: 8 frames bred, 4 rader höga (ner, höger, upp, vänster)
        // Rad 5 ignoreras helt
        const frameWidth = spriteSheet.width / 8;
        const frameHeight = spriteSheet.height / 4; // Bara 4 rader
        
        // Mappa våra riktningar till rätt rad
        const directionMap = [2, 1, 0, 3]; // upp->rad3, höger->rad2, ner->rad1, vänster->rad4
        
        const sourceX = animationFrame * frameWidth;
        const sourceY = directionMap[currentDirection] * frameHeight;
        
        ctx.drawImage(
            spriteSheet,
            sourceX, sourceY, frameWidth, frameHeight,
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
