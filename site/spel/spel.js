const canvas = document.getElementById("spelplan");
const ctx = canvas.getContext("2d");

// Ladda bakgrund
const bgImage = new Image();
bgImage.src = "images/bg_1.png";

// Ladda character stillframes
const charaImages = {
    0: new Image(), // upp
    1: new Image(), // höger
    2: new Image(), // ner
    3: new Image()  // vänster
};
charaImages[0].src = "images/chara upp.png";
charaImages[1].src = "images/chara_höger_1.png";
charaImages[2].src = "images/chara ner.png";
charaImages[3].src = "images/chara vänster.png";

// Spelarens stats
let playerX = canvas.width / 2;
let playerY = canvas.height / 2;
const playerSize = 64;
let playerHP = 100;
let maxHP = 100;

// Riktning (0=upp, 1=höger, 2=ner, 3=vänster)
let currentDirection = 2;

// Nuvarande rum
let currentRoom = 1;

// Game state
let gameState = "exploration"; // "exploration", "fight" eller "attack"
let selectedButton = 0; // 0=Fight, 1=Act, 2=Item, 3=Mercy
let flowerAttacked = false;
let attackBarProgress = 0; // 0-100
let zPressed = false; // Förhindra dubbelklick
let heartX = 400;
let heartY = 500;
const heartSize = 20;

// Rum-data 
const rooms = [
    { name: "Intro - Fallning", description: "Du trillar ner i brunnen...", spawnX: 400, spawnY: 300 },
    { name: "Skogsdunge", description: "Du är här. Flowie syns längre bort", npc: "Flowie", npcX: 600, npcY: 300, spawnX: 300, spawnY: 100 },
    { name: "Farmors hus", description: "Du är här. 3 vägar vidare", npc: "Farmor", npcX: 600, npcY: 300, spawnX: 100, spawnY: 300 },
    { name: "By söderut", description: "Orange drake här", npc: "Drake", npcX: 600, npcY: 300, spawnX: 100, spawnY: 300 },
    { name: "Grotta höger", description: "Skelett längre in", npc: "Papyrus", npcX: 600, npcY: 300, spawnX: 100, spawnY: 300 },
    { name: "Snöbiom vänster", description: "Hundar här", npc: "Hundar", npcX: 600, npcY: 300, spawnX: 100, spawnY: 300 },
    { name: "Rum 7", description: "Tomt rum", npc: null, spawnX: 400, spawnY: 300 },
    { name: "Rum 8", description: "Tomt rum", npc: null, spawnX: 400, spawnY: 300 },
    { name: "Rum 9", description: "Tomt rum", npc: null, spawnX: 400, spawnY: 300 },
    { name: "Boss - Sikael", description: "Sista mötet!", npc: "Sikael", npcX: 600, npcY: 300, spawnX: 100, spawnY: 300 }
];

// Tangenttillstånd
const keys = {};

window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    console.log("Tangent:", e.key, "GameState:", gameState);
    
    // Fight-meny navigation
    if (gameState === "fight") {
        if (e.key === "ArrowLeft" && selectedButton > 0) selectedButton--;
        if (e.key === "ArrowRight" && selectedButton < 3) selectedButton++;
        if (e.key.toLowerCase() === "z" && !zPressed) {
            zPressed = true;
            handleFightChoice();
        }
    }
    
    // Attack-bar
    if (gameState === "attack") {
        if (e.key.toLowerCase() === "z" && !zPressed) {
            zPressed = true;
            handleAttackBar();
        }
    }
});

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
    if (e.key.toLowerCase() === "z") {
        zPressed = false;
    }
});

function handleFightChoice() {
    console.log("handleFightChoice körd, selectedButton:", selectedButton);
    if (selectedButton === 0) {
        // Fight - starta attack bar
        console.log("Fight vald, går till attack-state");
        gameState = "attack";
        attackBarProgress = 0;
    } else {
        // Act, Item, Mercy - gör ingenting
        console.log("Du valde " + ["Fight", "Act", "Item", "Mercy"][selectedButton]);
    }
}

function update() {
    // Kolla om vi är nära Flowie i rummet
    if (currentRoom === 1 && gameState === "exploration") {
        const distance = Math.hypot(playerX - 600, playerY - 300);
        if (distance < 150) {
            gameState = "fight";
            selectedButton = 0;
        }
    }

    if (gameState === "exploration") {
        // Rörelse
        const speed = 5;
        let newX = playerX;
        let newY = playerY;
        
        if (keys["ArrowUp"]) {
            newY -= speed;
            currentDirection = 0;
        }
        if (keys["ArrowDown"]) {
            newY += speed;
            currentDirection = 2;
        }
        if (keys["ArrowLeft"]) {
            newX -= speed;
            currentDirection = 3;
        }
        if (keys["ArrowRight"]) {
            newX += speed;
            currentDirection = 1;
        }

        // Väggkollisioner
        if (newY < 0 && currentRoom > 0) {
            currentRoom--;
            playerX = rooms[currentRoom].spawnX;
            playerY = rooms[currentRoom].spawnY;
        } else if (newY > canvas.height && currentRoom < rooms.length - 1) {
            currentRoom++;
            playerX = rooms[currentRoom].spawnX;
            playerY = rooms[currentRoom].spawnY;
        } else if (newX < 0 && currentRoom > 0) {
            currentRoom--;
            playerX = rooms[currentRoom].spawnX;
            playerY = rooms[currentRoom].spawnY;
        } else if (newX > canvas.width && currentRoom < rooms.length - 1) {
            currentRoom++;
            playerX = rooms[currentRoom].spawnX;
            playerY = rooms[currentRoom].spawnY;
        } else {
            playerX = newX;
            playerY = newY;
        }
    }

    if (gameState === "attack") {
        // Hjärtat styr
        const heartSpeed = 7;
        const arenaX = 100;
        const arenaY = 350;
        const arenaWidth = 600;
        const arenaHeight = 200;
        
        if (keys["ArrowUp"] && heartY - heartSize > arenaY) heartY -= heartSpeed;
        if (keys["ArrowDown"] && heartY + heartSize < arenaY + arenaHeight) heartY += heartSpeed;
        if (keys["ArrowLeft"] && heartX - heartSize > arenaX) heartX -= heartSpeed;
        if (keys["ArrowRight"] && heartX + heartSize < arenaX + arenaWidth) heartX += heartSpeed;
    }
}

function draw() {
    // Rensa canvas med bakgrund
    if (bgImage.complete) {
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

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
    const charaImg = charaImages[currentDirection];
    if (charaImg.complete) {
        ctx.drawImage(
            charaImg,
            playerX - playerSize / 2, playerY - playerSize / 2, playerSize, playerSize
        );
    }

    // HP-display
    ctx.fillStyle = "#fff";
    ctx.font = "18px Arial";
    ctx.textAlign = "left";
    ctx.fillText("HP: " + playerHP + "/" + maxHP, 20, canvas.height - 20);

    // Fight-meny
    if (gameState === "fight") {
        drawFightMenu();
    }

    // Attack-bar
    if (gameState === "attack") {
        drawAttackScene();
    }
}

function drawFightMenu() {
    // Meny bakgrund
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 450, canvas.width, 150);
    
    // Knapp-texter
    const buttons = ["Fight", "Act", "Item", "Mercy"];
    const buttonWidth = 140;
    const buttonHeight = 50;
    const startX = 80;
    const startY = 470;
    const spacing = 170;
    
    for (let i = 0; i < 4; i++) {
        const x = startX + i * spacing;
        const y = startY;
        
        // Knapp-bakgrund
        if (i === selectedButton) {
            ctx.fillStyle = "#ffff00";
        } else {
            ctx.fillStyle = "#666";
        }
        ctx.fillRect(x, y, buttonWidth, buttonHeight);
        
        // Knapp-text
        ctx.fillStyle = "#000";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(buttons[i], x + buttonWidth / 2, y + buttonHeight / 2);
    }
    
    // Instruktion
    ctx.fillStyle = "#fff";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Piltangenter: välja | Z: välja", canvas.width / 2, 440);
}

function drawAttackBar() {
    // Meny bakgrund
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 450, canvas.width, 150);
    
    // Instruktion
    ctx.fillStyle = "#fff";
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Tryck Z när staven är grön!", canvas.width / 2, 480);
    
    // Attack-bar bakgrund
    const barX = 100;
    const barY = 520;
    const barWidth = 600;
    const barHeight = 40;
    
    ctx.fillStyle = "#333";
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Rörlig grön del
    attackBarProgress = (attackBarProgress + 3) % 100;
    const greenWidth = 100; // Grön sektions bredd
    const greenX = (attackBarProgress / 100) * barWidth;
    
    ctx.fillStyle = "#00ff00";
    ctx.fillRect(barX + greenX, barY, greenWidth, barHeight);
    
    // Kant
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
}

function drawAttackScene() {
    // Battle arena bakgrund
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Arena låda
    const arenaX = 100;
    const arenaY = 350;
    const arenaWidth = 600;
    const arenaHeight = 200;
    
    ctx.strokeStyle = "#ffff00";
    ctx.lineWidth = 3;
    ctx.strokeRect(arenaX, arenaY, arenaWidth, arenaHeight);
    
    // Flowie (statisk längst upp)
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(400 - 20, 50, 40, 40);
    ctx.fillStyle = "#ffff00";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Flowie", 400, 100);
    
    // Hjärtat (spelaren styr)
    ctx.fillStyle = "#ff69b4"; // Rosa
    ctx.beginPath();
    ctx.arc(heartX, heartY, heartSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Info
    ctx.fillStyle = "#fff";
    ctx.font = "16px Arial";
    ctx.textAlign = "left";
    ctx.fillText("HP: " + playerHP + "/" + maxHP, 20, 30);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
