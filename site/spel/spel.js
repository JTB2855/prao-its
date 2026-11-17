const canvas = document.getElementById("spelplan");
const ctx = canvas.getContext("2d");

// Ladda bakgrund
const bgImage = new Image();
bgImage.src = "images/bg_1.png";

const farmorBackground = new Image();
farmorBackground.onerror = () => console.error("Kunde inte ladda bakgrunden i Farmors hus.");
farmorBackground.src = "images/farmors-rum.png";

const kitchenBackground = new Image();
kitchenBackground.onerror = () => console.error("Kunde inte ladda köksbilden.");
kitchenBackground.src = "images/farmors-kok.png";
const kitchen = { x: 98, y: 100, width: 604, height: 500 };
const pieImage = new Image();
pieImage.onerror = () => console.error("Kunde inte ladda pajbilden.");
pieImage.src = "images/pumpkin-pie.png";
const pie = { x: 410, y: 328, collected: false };
let hasPie = false;
let pickupMessageTime = 0;
const boss = {
    hp: 100, maxHP: 100, turn: 0, timer: 0, spawnTimer: 0,
    invincibleTime: 0, projectiles: [], message: "", entryHP: 100, entryPie: false
};
const bossArena = { left: 102, right: 698, top: 352, bottom: 548 };

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

// Fight-spel bilder
const heartImage = new Image();
heartImage.onerror = () => console.error("Kunde inte ladda bilden av hjärtat.");
heartImage.src = "images/hjarta.png";

const floweyImage = new Image();
floweyImage.onerror = () => console.error("Kunde inte ladda bilden av Flowie.");
floweyImage.src = "images/flowie.png";

const farmorImage = new Image();
farmorImage.onerror = () => console.error("Kunde inte ladda bilden av Farmor.");
farmorImage.src = "images/farmor.png";

const farmorRescueImage = new Image();
farmorRescueImage.onerror = () => console.error("Kunde inte ladda bilden av Farmor vid räddningen.");
farmorRescueImage.src = "images/farmor-raddning.png";
const farmorRoomSize = 110;

const flowieFaces = [floweyImage];
for (const file of ["Flowey_battle_fatal_Genocide.webp", "flower-flowers.gif", "Flowey_battle_laugh.png"]) {
    const image = new Image();
    image.onerror = () => console.error("Kunde inte ladda Flowies bild: " + file);
    image.src = "images/" + file;
    flowieFaces.push(image);
}

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
const flowieLines = [
    "Howdy! I'm FLOWIE. FLOWIE the FLOWER!",
    "This is love",
    "take it",
    "I said take it",
    "Here in the underground, it's kill or be killed",
    "DIE!"
];
let dialogueIndex = 0;
let avoidedShots = 0;
let stormBalls = [];
const ball = { x: 400, y: 370, radius: 7, speed: 180, vx: 0, vy: 0 };
let attackBarProgress = 0; // 0-100
let zPressed = false; // Förhindra dubbelklick
let heartX = 400;
let heartY = 500;
const heartSize = 20;

// Rum-data 
const rooms = [
    { name: "Intro - Fallning", description: "Du trillar ner i brunnen...", spawnX: 400, spawnY: 300 },
    { name: "Skogsdunge", description: "Du är här. Flowie syns längre bort", npc: "Flowie", npcX: 600, npcY: 300, spawnX: 300, spawnY: 100 },
    { name: "Farmors hus", description: "Köket ligger uppåt. Högra dörren leder till Sikael.", npc: "Farmor", npcX: 410, npcY: 230, spawnX: 560, spawnY: 330 },
    { name: "Farmors kök", description: "Gå tillbaka genom öppningen nedåt", npc: null, spawnX: 300, spawnY: 550 },
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
    if (e.key.startsWith("Arrow") || e.key.toLowerCase() === "z") {
        e.preventDefault();
    }
    if (gameState.startsWith("boss-")) {
        if (gameState === "boss-menu" && !e.repeat) {
            if (e.key === "ArrowLeft") selectedButton = Math.max(0, selectedButton - 1);
            if (e.key === "ArrowRight") selectedButton = Math.min(3, selectedButton + 1);
        }
        if (e.key.toLowerCase() === "z" && !zPressed && !e.repeat) {
            zPressed = true;
            handleBossChoice();
        }
        return;
    }
    
    // Fight-meny navigation
    if (gameState === "fight") {
        if (e.key === "ArrowLeft" && selectedButton > 0) selectedButton--;
        if (e.key === "ArrowRight" && selectedButton < 3) selectedButton++;
        if (e.key.toLowerCase() === "z" && !zPressed) {
            zPressed = true;
            handleFightChoice();
        }
    }
    
    if (e.key.toLowerCase() === "z" && !zPressed && !e.repeat) {
        zPressed = true;
        if (gameState === "dialogue") {
            if (dialogueIndex === 2 || dialogueIndex === 3) {
                startBallAttack();
            } else if (dialogueIndex === 5) {
                startBallStorm();
            } else {
                dialogueIndex++;
            }
        } else if (gameState === "rescue") {
            currentRoom = 2;
            playerX = rooms[currentRoom].spawnX;
            playerY = rooms[currentRoom].spawnY;
            gameState = "exploration";
        }
    }
});

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
    if (e.key.toLowerCase() === "z") {
        zPressed = false;
    }
});

window.addEventListener("blur", () => {
    for (const key of Object.keys(keys)) keys[key] = false;
    zPressed = false;
});

function startBoss(retry = false) {
    if (retry) {
        playerHP = boss.entryHP;
        hasPie = boss.entryPie;
    } else {
        boss.entryHP = playerHP;
        boss.entryPie = hasPie;
    }
    currentRoom = 9;
    boss.hp = boss.maxHP;
    boss.turn = 0;
    boss.projectiles = [];
    boss.message = "Sikael: Du har kommit långt. Är du redo?";
    selectedButton = 0;
    gameState = "boss-menu";
}

function handleBossChoice() {
    if (gameState === "boss-lost" || gameState === "boss-won") {
        startBoss(true);
    } else if (gameState === "boss-menu") {
        if (selectedButton === 0) {
            attackBarProgress = 0;
            gameState = "boss-slider";
        } else if (selectedButton === 2) {
            if (hasPie) {
                playerHP = maxHP;
                hasPie = false;
                boss.message = "Pumpkin Pie: HP återställt till 100!";
            } else {
                boss.message = "Du har ingen paj kvar. Välj ett annat alternativ.";
            }
        } else {
            boss.message = selectedButton === 1
                ? "Sikael: Visa hur du undviker mina datorer!"
                : "Sikael är inte redo att ge upp. Välj Fight.";
        }
    } else if (gameState === "boss-slider") {
        const damage = Math.round(5 + 20 * (1 - Math.abs(attackBarProgress - 50) / 50));
        boss.hp = Math.max(0, boss.hp - damage);
        boss.message = "Du gjorde " + damage + " skada!";
        if (boss.hp === 0) {
            gameState = "boss-won";
        } else {
            startBossDefense();
        }
    }
}

function startBossDefense() {
    boss.turn++;
    boss.timer = 0;
    boss.spawnTimer = 0;
    boss.invincibleTime = 0;
    boss.projectiles = [];
    heartX = 400;
    heartY = 480;
    gameState = "boss-defend";
}

function updateBoss(seconds) {
    if (gameState === "boss-slider") {
        attackBarProgress += seconds * 65;
        if (attackBarProgress >= 100) {
            attackBarProgress = 100;
            boss.message = "Miss! Nu attackerar Sikael.";
            startBossDefense();
        }
        return;
    }
    if (gameState !== "boss-defend") return;
    const speed = 260 * seconds;
    if (keys.ArrowLeft) heartX -= speed;
    if (keys.ArrowRight) heartX += speed;
    if (keys.ArrowUp) heartY -= speed;
    if (keys.ArrowDown) heartY += speed;
    heartX = Math.max(bossArena.left + heartSize, Math.min(bossArena.right - heartSize, heartX));
    heartY = Math.max(bossArena.top + heartSize, Math.min(bossArena.bottom - heartSize, heartY));
    boss.timer += seconds;
    boss.invincibleTime = Math.max(0, boss.invincibleTime - seconds);
    boss.spawnTimer -= seconds;
    if (boss.spawnTimer <= 0) {
        boss.spawnTimer += 0.45;
        const x = 130 + Math.random() * 540;
        const y = bossArena.top - 20;
        const distance = Math.hypot(heartX - x, heartY - y);
        const projectileSpeed = 140 + Math.min(boss.turn, 6) * 12;
        boss.projectiles.push({
            x, y, vx: (heartX - x) / distance * projectileSpeed,
            vy: (heartY - y) / distance * projectileSpeed
        });
    }
    for (const projectile of boss.projectiles) {
        projectile.x += projectile.vx * seconds;
        projectile.y += projectile.vy * seconds;
        if (boss.invincibleTime === 0 &&
            Math.abs(projectile.x - heartX) < heartSize + 12 &&
            Math.abs(projectile.y - heartY) < heartSize + 10) {
            playerHP = Math.max(0, playerHP - 10);
            boss.invincibleTime = 1;
            if (playerHP === 0) {
                gameState = "boss-lost";
                return;
            }
        }
    }
    boss.projectiles = boss.projectiles.filter(p => p.x > 70 && p.x < 730 && p.y < 580);
    if (boss.timer >= 6) {
        boss.projectiles = [];
        boss.message = "Din tur! Fight attackerar. Item använder pajen.";
        gameState = "boss-menu";
    }
}

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

function startBallAttack() {
    stormBalls = [];
    ball.x = 400;
    ball.y = 370;
    const distance = Math.hypot(heartX - ball.x, heartY - ball.y);
    ball.vx = distance === 0 ? 0 : (heartX - ball.x) / distance * ball.speed;
    ball.vy = distance === 0 ? ball.speed : (heartY - ball.y) / distance * ball.speed;
    gameState = "attack";
}

function startBallStorm() {
    stormBalls = [];
    for (let row = 0; row < 20; row++) {
        for (let column = 0; column < 50; column++) {
            stormBalls.push({ x: 106 + column * 12, y: 330 - row * 10 });
        }
    }
    gameState = "attack";
}

function rescuePlayer() {
    playerHP = Math.max(1, playerHP - 99);
    flowerAttacked = true;
    gameState = "rescue";
}

function canWalkInFarmorRoom(x, y) {
    const halfSize = playerSize / 2;
    // Golvet och gången bildar tillsammans rummets gångbara yta.
    for (const cornerX of [x - halfSize, x + halfSize]) {
        for (const cornerY of [y - halfSize, y + halfSize]) {
            const onFloor = cornerX >= 46 && cornerX <= 750 && cornerY >= 150 && cornerY <= 545;
            const inHallway = cornerX >= 115 && cornerX <= 214 && cornerY >= -100 && cornerY <= 182;
            const inBossDoor = cornerX >= 720 && cornerX <= 900 && cornerY >= 365 && cornerY <= 505;
            if (!onFloor && !inHallway && !inBossDoor) return false;
        }
    }
    return true;
}

function canWalkInKitchen(x, y) {
    const halfSize = playerSize / 2;
    for (const cornerX of [x - halfSize, x + halfSize]) {
        for (const cornerY of [y - halfSize, y + halfSize]) {
            const onFloor = cornerX >= 162 && cornerX <= 638 && cornerY >= 356 && cornerY <= 524;
            const inDoorway = cornerX >= 242 && cornerX <= 358 && cornerY >= 500 && cornerY <= 700;
            if (!onFloor && !inDoorway) return false;
        }
    }
    return true;
}

function update(seconds = 1 / 60) {
    pickupMessageTime = Math.max(0, pickupMessageTime - seconds);
    if (gameState.startsWith("boss-")) {
        updateBoss(seconds);
        return;
    }
    // Kolla om vi är nära Flowie i rummet
    if (currentRoom === 1 && gameState === "exploration" && !flowerAttacked) {
        const distance = Math.hypot(playerX - rooms[1].npcX, playerY - rooms[1].npcY);
        if (distance < 150) {
            gameState = "dialogue";
            dialogueIndex = 0;
            avoidedShots = 0;
            stormBalls = [];
            heartX = 400;
            heartY = 500;
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

        if (currentRoom === 2) {
            if (canWalkInFarmorRoom(newX, playerY)) playerX = newX;
            if (canWalkInFarmorRoom(playerX, newY)) playerY = newY;
            if (playerY + playerSize / 2 < 0) {
                currentRoom = 3;
                playerX = rooms[currentRoom].spawnX;
                playerY = rooms[currentRoom].spawnY;
            } else if (playerX - playerSize / 2 > canvas.width) {
                startBoss();
            }
            return;
        }

        if (currentRoom === 3) {
            if (canWalkInKitchen(newX, playerY)) playerX = newX;
            if (canWalkInKitchen(playerX, newY)) playerY = newY;
            if (!pie.collected && Math.abs(playerX - pie.x) < 45 && playerY - playerSize / 2 <= 370) {
                pie.collected = true;
                hasPie = true;
                pickupMessageTime = 4;
            }
            if (playerY - playerSize / 2 > canvas.height) {
                currentRoom = 2;
                playerX = 165;
                playerY = 40;
            }
            return;
        }

        // Väggkollisioner i övriga rum
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
        
        if (keys["ArrowUp"]) heartY -= heartSpeed;
        if (keys["ArrowDown"]) heartY += heartSpeed;
        if (keys["ArrowLeft"]) heartX -= heartSpeed;
        if (keys["ArrowRight"]) heartX += heartSpeed;
        heartX = Math.max(arenaX + heartSize + 2, Math.min(arenaX + arenaWidth - heartSize - 2, heartX));
        heartY = Math.max(arenaY + heartSize + 2, Math.min(arenaY + arenaHeight - heartSize - 2, heartY));

        if (stormBalls.length > 0) {
            for (const stormBall of stormBalls) {
                stormBall.y += ball.speed * seconds;
                if (Math.hypot(heartX - stormBall.x, heartY - stormBall.y) <= heartSize + ball.radius) {
                    rescuePlayer();
                    break;
                }
            }
            return;
        }

        ball.x += ball.vx * seconds;
        ball.y += ball.vy * seconds;
        if (Math.hypot(heartX - ball.x, heartY - ball.y) <= heartSize + ball.radius) {
            rescuePlayer();
        } else if (ball.x < arenaX || ball.x > arenaX + arenaWidth ||
                   ball.y < arenaY || ball.y > arenaY + arenaHeight) {
            avoidedShots++;
            gameState = "dialogue";
            dialogueIndex = avoidedShots === 1 ? 3 : 4;
        }
    }
}

function draw() {
    if (gameState.startsWith("boss-")) {
        drawBoss();
        return;
    }
    if (gameState !== "exploration") {
        drawAttackScene();
        if (gameState === "fight") {
            drawFightMenu();
        } else if (gameState === "dialogue" || gameState === "rescue") {
            drawDialogue();
        }
        return;
    }

    if (currentRoom === 2) {
        drawFarmorRoom();
        return;
    }
    if (currentRoom === 3) {
        drawKitchen();
        return;
    }

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
        if (rooms[currentRoom].npc === "Flowie") {
            drawCharacter(npcX, npcY, 64, floweyImage);
        } else if (rooms[currentRoom].npc === "Farmor") {
            drawCharacter(npcX, npcY, farmorRoomSize, farmorImage);
        } else {
            ctx.fillStyle = "#ff0000";
            ctx.fillRect(npcX - 15, npcY - 15, 30, 30);
        }
        ctx.fillStyle = "#ffff00";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        const labelOffset = rooms[currentRoom].npc === "Farmor" ? 55 : rooms[currentRoom].npc === "Flowie" ? 45 : 25;
        ctx.fillText(rooms[currentRoom].npc, npcX, npcY + labelOffset);
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
    ctx.fillText("Tryck Z när markören är i mitten!", canvas.width / 2, 480);
    
    // Attack-bar bakgrund
    const barX = 100;
    const barY = 520;
    const barWidth = 600;
    const barHeight = 40;
    
    ctx.fillStyle = "#333";
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    ctx.fillStyle = "#00ff00";
    ctx.fillRect(barX + barWidth / 2 - 30, barY, 60, barHeight);
    ctx.fillStyle = "#fff";
    ctx.fillRect(barX + (attackBarProgress / 100) * (barWidth - 4), barY, 4, barHeight);
    
    // Kant
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
}

function drawCharacter(x, y, size, image) {
    if (!image.complete || image.naturalWidth === 0) return;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    const scale = size / Math.max(image.naturalWidth, image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    ctx.drawImage(image, x - width / 2, y - height / 2, width, height);
    ctx.restore();
}

function drawDialogue() {
    ctx.save();
    const boxY = 210;
    ctx.fillStyle = "#000";
    ctx.fillRect(40, boxY, 720, 110);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(40, boxY, 720, 110);
    ctx.fillStyle = "#fff";
    ctx.font = "22px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    const text = gameState === "rescue"
        ? "Farmor: Stopp! Jag hjälper dig. Kom med mig."
        : flowieLines[dialogueIndex];
    ctx.fillText(text, 60, boxY + 40);
    ctx.font = "16px Arial";
    ctx.fillText("Z: fortsätt", 60, boxY + 85);
    ctx.restore();
}

function drawFarmorRoom() {
    ctx.save();
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    if (farmorBackground.complete && farmorBackground.naturalWidth > 0) {
        ctx.drawImage(farmorBackground, 0, 0, canvas.width, canvas.height);
    }
    drawCharacter(rooms[2].npcX, rooms[2].npcY, farmorRoomSize, farmorImage);
    drawCharacter(playerX, playerY, playerSize, charaImages[currentDirection]);
    ctx.fillStyle = "#000";
    ctx.fillRect(12, 10, 160, 30);
    ctx.fillStyle = "#fff";
    ctx.font = "18px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("HP: " + playerHP + "/" + maxHP, 20, 32);
    ctx.restore();
}

function drawKitchen() {
    ctx.save();
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    if (kitchenBackground.complete && kitchenBackground.naturalWidth > 0) {
        ctx.drawImage(kitchenBackground, kitchen.x, kitchen.y, kitchen.width, kitchen.height);
    }
    if (!pie.collected) drawCharacter(pie.x, pie.y, 48, pieImage);
    drawCharacter(playerX, playerY, playerSize, charaImages[currentDirection]);
    if (pickupMessageTime > 0) {
        ctx.fillStyle = "#000";
        ctx.fillRect(100, 30, 600, 55);
        ctx.fillStyle = "#fff";
        ctx.font = "22px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Pumpkin Pie Added To Inventory", 400, 58);
    }
    ctx.restore();
}

function drawComputer(x, y, size) {
    ctx.fillStyle = "#ddd";
    ctx.fillRect(x - size / 2, y - size / 2, size, size * 0.7);
    ctx.fillStyle = "#175575";
    ctx.fillRect(x - size * 0.4, y - size * 0.4, size * 0.8, size * 0.45);
    ctx.fillStyle = "#fff";
    ctx.fillRect(x - size * 0.2, y - size * 0.25, size * 0.08, size * 0.08);
    ctx.fillRect(x + size * 0.12, y - size * 0.25, size * 0.08, size * 0.08);
    ctx.fillStyle = "#aaa";
    ctx.fillRect(x - size * 0.08, y + size * 0.2, size * 0.16, size * 0.15);
    ctx.fillRect(x - size * 0.3, y + size * 0.35, size * 0.6, size * 0.1);
}

function drawBoss() {
    ctx.save();
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textBaseline = "alphabetic";
    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    ctx.fillStyle = "#fff";
    ctx.fillText("CHARA  HP " + playerHP + "/" + maxHP, 30, 35);
    ctx.fillText("Paj: " + (hasPie ? "1" : "0"), 30, 65);
    ctx.textAlign = "center";
    drawComputer(400, 155, 140);
    ctx.fillStyle = "#fff";
    ctx.fillText("SIKAEL  HP " + boss.hp + "/" + boss.maxHP, 400, 265);
    ctx.font = "18px Arial";
    ctx.fillText(boss.message, 400, 305);

    if (gameState === "boss-menu") {
        drawFightMenu();
    } else if (gameState === "boss-slider") {
        drawAttackBar();
    } else if (gameState === "boss-defend") {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 3;
        ctx.strokeRect(100, 350, 600, 200);
        ctx.save();
        ctx.beginPath();
        ctx.rect(bossArena.left, bossArena.top, bossArena.right - bossArena.left, bossArena.bottom - bossArena.top);
        ctx.clip();
        for (const projectile of boss.projectiles) drawComputer(projectile.x, projectile.y, 24);
        if (boss.invincibleTime === 0 || Math.floor(boss.invincibleTime * 10) % 2 === 0) {
            drawCharacter(heartX, heartY, heartSize * 2, heartImage);
        }
        ctx.restore();
        ctx.fillStyle = "#fff";
        ctx.fillText("Pilar: undvik datorerna! " + Math.max(0, Math.ceil(6 - boss.timer)), 400, 585);
    } else {
        ctx.fillStyle = "#fff";
        ctx.font = "32px Arial";
        ctx.fillText(gameState === "boss-won" ? "Du besegrade Sikael!" : "Du förlorade!", 400, 400);
        ctx.font = "20px Arial";
        ctx.fillText("Z: försök igen med samma HP och paj som vid starten", 400, 450);
    }
    ctx.restore();
}

function drawAttackScene() {
    // Battle arena bakgrund
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Arenan och hjärtat visas under försvar, inte vid menyval.
    if (gameState === "attack" || gameState === "dialogue" || gameState === "rescue") {
        const arenaX = 100;
        const arenaY = 350;
        const arenaWidth = 600;
        const arenaHeight = 200;

        ctx.strokeStyle = "#ffff00";
        ctx.lineWidth = 3;
        ctx.strokeRect(arenaX, arenaY, arenaWidth, arenaHeight);

        if (heartImage.complete && heartImage.naturalWidth > 0) {
            ctx.save();
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(heartImage, heartX - heartSize, heartY - heartSize, heartSize * 2, heartSize * 2);
            ctx.restore();
        } else {
            ctx.fillStyle = "#ff69b4";
            ctx.beginPath();
            ctx.arc(heartX, heartY, heartSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const faceIndex = dialogueIndex >= 5 ? 3 : dialogueIndex === 4 ? 2 : dialogueIndex === 3 ? 1 : 0;
    if (gameState === "rescue") {
        drawCharacter(400, 110, 170, farmorRescueImage);
    } else {
        drawCharacter(400, 110, 120, flowieFaces[faceIndex]);
    }

    if ((gameState === "attack" || gameState === "rescue") && stormBalls.length > 0) {
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        for (const stormBall of stormBalls) {
            ctx.moveTo(stormBall.x + ball.radius, stormBall.y);
            ctx.arc(stormBall.x, stormBall.y, ball.radius, 0, Math.PI * 2);
        }
        ctx.fill();
    } else if (gameState === "attack" || gameState === "rescue" || (gameState === "dialogue" && dialogueIndex >= 1 && dialogueIndex <= 3)) {
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(gameState === "dialogue" ? 400 : ball.x,
            gameState === "dialogue" ? 370 : ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Info
    ctx.fillStyle = "#fff";
    ctx.font = "16px Arial";
    ctx.textAlign = "left";
    ctx.fillText("HP: " + playerHP + "/" + maxHP, 20, 30);
}

let previousTime;
function gameLoop(time) {
    const seconds = previousTime === undefined ? 0 : Math.min((time - previousTime) / 1000, 0.05);
    previousTime = time;
    update(seconds);
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
