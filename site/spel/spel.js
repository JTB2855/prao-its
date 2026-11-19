const canvas = document.getElementById("spelplan");
const ctx = canvas.getContext("2d");

// Ladda bakgrund
const bgImage = new Image();
bgImage.src = "images/bg_1.png";

const kitchen = { x: 98, y: 100, width: 604, height: 500 };
const pieImage = new Image();
pieImage.onerror = () => console.error("Kunde inte ladda pajbilden.");
pieImage.src = "images/pumpkin-pie.png";
const pie = { x: 410, y: 328, collected: false };
const kaffe = { x: 500, y: 318, collected: false };
let pieCount = 0;
let pickupMessageTime = 0;
let pickupMessage = "";
let kontorTid = 0;
const kontorVantetid = 1;
// Korridoren är större än skärmen: en del åt höger och en del uppåt. Kameran följer Char.
const korridorHoger = { x: -100, y: 365, bredd: 1500, hojd: 140 };
const korridorUpp = { x: 1260, y: -900, bredd: 140, hojd: 1405 };
const boss = {
    hp: 100, maxHP: 100, turn: 0, timer: 0,
    invincibleTime: 0, projectiles: [], message: "", entryHP: 100, entryPieCount: 0,
    patternIndex: 0, nextEvent: 0, heartMode: "red", gravitySpeed: 0,
    jumpRequested: false, lunchEaten: false, lunchLine: 0, farewellLine: 0, kneelTimer: 0,
    determination: false, phaseTurn: 0, lowHealthAttackUsed: false,
    gravityDirection: "down", platforms: []
};
const bossArena = { left: 102, right: 698, top: 332, bottom: 460 };
const bossHeartSize = 10;
const bossPhysics = { speed: 210, gravity: 1500, jump: 450, jumpCut: 150, hitRadius: 5 };
const bossLaser = { warning: 0.75, firing: 0.35, fade: 0.2, width: 26 };
const bossDamage = { amount: 1, cooldown: 0.025 };
const bossSweep = { warning: 0.65, duration: 0.18, blue: "#42dfff", orange: "#ff9d38" };
const bossDeath = {
    timer: 0, duration: 3.2, particles: [],
    portrait: document.createElement("canvas"),
    dust: document.createElement("canvas")
};
const battleButtons = ["SLÅSS", "AGERA", "FÖREMÅL", "SKONA"];
const bossGravity = {
    down: { x: 0, y: 1, jumpKey: "ArrowUp" },
    up: { x: 0, y: -1, jumpKey: "ArrowDown" },
    left: { x: -1, y: 0, jumpKey: "ArrowRight" },
    right: { x: 1, y: 0, jumpKey: "ArrowLeft" }
};
const bossLunchLines = [
    "Du var starkare än jag trodde",
    "Men jag tänker inte dö",
    "Sikael äter coop-lunch med trocadero! +250 hälsa",
    "DETERMINATION"
];
// Sekunder det tar för Sikael att sjunka ner på knä.
const sikaelKnaTid = 1.2;
const bossFarewellLines = [
    "Jag underskattade dig",
    "Du kommer fortfarande inte få mitt kaffe men du kan få varm choklad om du vill"
];
const bossPatterns = [
    { name: "Sikaels öppningsattack", mode: "blue", width: 300, top: 300, duration: 9.2, events: [
        { time: 0.15, type: "floor", height: 42 },
        { time: 1.15, type: "mode", mode: "red" },
        { time: 1.25, type: "wall", gapY: 365, speed: 320 },
        { time: 1.33, type: "wall", gapY: 368, speed: 320 },
        { time: 1.41, type: "wall", gapY: 372, speed: 320 },
        { time: 1.49, type: "wall", gapY: 375, speed: 320 },
        { time: 1.57, type: "wall", gapY: 378, speed: 320 },
        { time: 1.65, type: "wall", gapY: 382, speed: 320 },
        { time: 1.73, type: "wall", gapY: 385, speed: 320 },
        { time: 1.81, type: "wall", gapY: 388, speed: 320 },
        { time: 1.89, type: "wall", gapY: 392, speed: 320 },
        { time: 1.97, type: "wall", gapY: 395, speed: 320 },
        { time: 2.05, type: "wall", gapY: 392, speed: 320 },
        { time: 2.13, type: "wall", gapY: 388, speed: 320 },
        { time: 2.21, type: "wall", gapY: 385, speed: 320 },
        { time: 2.29, type: "wall", gapY: 382, speed: 320 },
        { time: 2.37, type: "wall", gapY: 378, speed: 320 },
        { time: 2.45, type: "wall", gapY: 375, speed: 320 },
        { time: 2.53, type: "wall", gapY: 372, speed: 320 },
        { time: 2.57, type: "wall", gapY: 370, speed: 320 },
        { time: 4.0, type: "volley", layout: "edges" },
        { time: 5.2, type: "volley", layout: "diagonal" },
        { time: 6.4, type: "volley", layout: "edges" },
        { time: 7.6, type: "volley", layout: "final" }
    ] },
    { name: "Stavstorm", mode: "blue", width: 596, duration: 8, events: [
        { time: 0.6, type: "hurdle", height: 28, speed: -280 },
        { time: 1.4, type: "hurdle", height: 38, speed: -280 },
        { time: 2.2, type: "hurdle", height: 28, speed: -280 },
        { time: 3.0, type: "hurdle", height: 38, speed: -280 },
        { time: 4.5, type: "cannon", side: "left" },
        { time: 5.3, type: "cannon", side: "right" },
        { time: 6.1, type: "cannon", side: "top" }
    ] },
    { name: "Stavtunneln", mode: "red", width: 360, duration: 8, events: [
        { time: 0.4, type: "wall", gapY: 375, speed: -240 },
        { time: 1.2, type: "wall", gapY: 415, speed: -240 },
        { time: 2.0, type: "wall", gapY: 375, speed: -240 },
        { time: 2.8, type: "wall", gapY: 415, speed: -240 },
        { time: 3.6, type: "wall", gapY: 375, speed: -240 },
        { time: 4.4, type: "wall", gapY: 415, speed: -240 },
        { time: 5.2, type: "wall", gapY: 395, speed: -240 }
    ] },
    { name: "Stavar från båda håll", mode: "blue", width: 280, duration: 8, events: [
        { time: 0.6, type: "hurdle", height: 28, speed: -220 },
        { time: 1.5, type: "hurdle", height: 38, speed: 220 },
        { time: 2.4, type: "hurdle", height: 28, speed: -220 },
        { time: 3.3, type: "hurdle", height: 38, speed: 220 },
        { time: 4.2, type: "hurdle", height: 28, speed: -220 },
        { time: 5.1, type: "hurdle", height: 38, speed: 220 },
        { time: 6.0, type: "hurdle", height: 28, speed: -220 }
    ] },
    { name: "Blå stavar: stå still!", mode: "red", width: 280, duration: 8, events: [
        { time: 0.5, type: "blue-wall", speed: -230 },
        { time: 1.8, type: "wall", gapY: 375, speed: -230 },
        { time: 3.1, type: "blue-wall", speed: 230 },
        { time: 4.4, type: "wall", gapY: 415, speed: -230 },
        { time: 5.7, type: "blue-wall", speed: -230 }
    ] },
    { name: "Laserdatorer", mode: "red", width: 280, duration: 8, events: [
        { time: 0.4, type: "cannon", side: "left" },
        { time: 1.2, type: "cannon", side: "top" },
        { time: 2.0, type: "cannon", side: "right" },
        { time: 2.8, type: "cannon", side: "left" },
        { time: 3.6, type: "cannon", side: "top" },
        { time: 3.6, type: "cannon", side: "right" },
        { time: 4.8, type: "cannon", side: "left" },
        { time: 4.8, type: "cannon", side: "top" },
        { time: 6.0, type: "cannon", side: "right" },
        { time: 6.0, type: "cannon", side: "left" }
    ] }
];

const bossLowHealthPattern = {
    name: "Gnistregn", mode: "red", width: 320, duration: 6, events: [
        { time: 0.55, type: "spark-rain", gapX: 350 },
        { time: 1.80, type: "spark-rain", gapX: 450 },
        { time: 3.05, type: "spark-rain", gapX: 350 },
        { time: 4.30, type: "spark-rain", gapX: 450 }
    ]
};

const bossHardPatterns = [
    { name: "DETERMINATION: Stavtunnel", mode: "red", width: 300, duration: 8, events: [
        { time: 0.3, type: "wall", gapY: 370, speed: -360 },
        { time: 0.58, type: "wall", gapY: 400, speed: -360 },
        { time: 0.86, type: "wall", gapY: 430, speed: -360 },
        { time: 1.14, type: "wall", gapY: 400, speed: -360 },
        { time: 1.41, type: "wall", gapY: 370, speed: -360 },
        { time: 1.69, type: "wall", gapY: 400, speed: -360 },
        { time: 1.97, type: "wall", gapY: 430, speed: -360 },
        { time: 2.25, type: "wall", gapY: 400, speed: -360 },
        { time: 2.53, type: "wall", gapY: 370, speed: -360 },
        { time: 2.81, type: "wall", gapY: 400, speed: -360 },
        { time: 3.09, type: "wall", gapY: 430, speed: -360 },
        { time: 3.36, type: "wall", gapY: 400, speed: -360 },
        { time: 3.64, type: "wall", gapY: 370, speed: -360 },
        { time: 3.92, type: "wall", gapY: 400, speed: -360 },
        { time: 4.20, type: "wall", gapY: 430, speed: -360 },
        { time: 4.48, type: "wall", gapY: 400, speed: -360 },
        { time: 4.76, type: "wall", gapY: 370, speed: -360 },
        { time: 5.04, type: "wall", gapY: 400, speed: -360 },
        { time: 5.31, type: "wall", gapY: 430, speed: -360 },
        { time: 5.59, type: "wall", gapY: 400, speed: -360 },
        { time: 5.87, type: "wall", gapY: 370, speed: -360 },
        { time: 6.15, type: "wall", gapY: 400, speed: -360 }
    ] },
    { name: "DETERMINATION: Gniststorm", mode: "red", width: 320, duration: 8, events: [
        { time: 0.45, type: "spark-rain", gapX: 337, dense: true },
        { time: 1.27, type: "spark-rain", gapX: 463, dense: true },
        { time: 2.09, type: "spark-rain", gapX: 400, dense: true },
        { time: 2.91, type: "spark-rain", gapX: 463, dense: true },
        { time: 3.73, type: "spark-rain", gapX: 337, dense: true },
        { time: 4.55, type: "spark-rain", gapX: 463, dense: true },
        { time: 5.37, type: "spark-rain", gapX: 337, dense: true },
        { time: 6.19, type: "spark-rain", gapX: 400, dense: true },
        { time: 7.01, type: "spark-rain", gapX: 463, dense: true }
    ] },
    { name: "DETERMINATION: Gnistringar", mode: "red", width: 320, duration: 8, events: [
        { time: 0.55, type: "spark-ring", x: 365, gap: 2 },
        { time: 2.05, type: "spark-ring", x: 435, gap: 10 },
        { time: 3.55, type: "spark-ring", x: 365, gap: 14 },
        { time: 5.05, type: "spark-ring", x: 435, gap: 6 },
        { time: 6.55, type: "spark-ring", x: 365, gap: 0 }
    ] },
    { name: "DETERMINATION: Färgsvep", mode: "red", width: 320, duration: 8, events: [
        { time: 0.55, type: "color-sweep", color: "blue" },
        { time: 1.70, type: "color-sweep", color: "orange" },
        { time: 2.85, type: "color-sweep", color: "blue" },
        { time: 4.00, type: "color-sweep", color: "orange" },
        { time: 5.15, type: "color-sweep", color: "orange" },
        { time: 6.30, type: "color-sweep", color: "blue" }
    ] },
    { name: "DETERMINATION: Stavrusning", mode: "blue", width: 300, duration: 8, events: [
        { time: 0.4, type: "hurdle", height: 34, speed: -340 },
        { time: 1.1, type: "hurdle", height: 42, speed: 340 },
        { time: 1.8, type: "hurdle", height: 34, speed: -340 },
        { time: 2.5, type: "hurdle", height: 42, speed: 340 },
        { time: 3.2, type: "hurdle", height: 34, speed: -340 },
        { time: 3.9, type: "hurdle", height: 42, speed: 340 },
        { time: 4.6, type: "hurdle", height: 34, speed: -340 },
        { time: 5.3, type: "hurdle", height: 42, speed: 340 },
        { time: 6.0, type: "hurdle", height: 34, speed: -340 },
        { time: 6.7, type: "hurdle", height: 42, speed: 340 }
    ] },
    { name: "DETERMINATION: Laserstorm", mode: "red", width: 300, duration: 8, events: [
        { time: 0.3, type: "cannon", side: "left", warning: 0.45 },
        { time: 0.3, type: "cannon", side: "top", warning: 0.45 },
        { time: 1.15, type: "cannon", side: "right", warning: 0.45 },
        { time: 1.15, type: "cannon", side: "top", warning: 0.45 },
        { time: 2.0, type: "cannon", side: "left", warning: 0.45 },
        { time: 2.0, type: "cannon", side: "right", warning: 0.45 },
        { time: 2.85, type: "cannon", side: "right", warning: 0.45 },
        { time: 2.85, type: "cannon", side: "top", warning: 0.45 },
        { time: 3.7, type: "cannon", side: "left", warning: 0.45 },
        { time: 3.7, type: "cannon", side: "top", warning: 0.45 },
        { time: 4.55, type: "cannon", side: "left", warning: 0.45 },
        { time: 4.55, type: "cannon", side: "right", warning: 0.45 },
        { time: 5.4, type: "cannon", side: "right", warning: 0.45 },
        { time: 5.4, type: "cannon", side: "top", warning: 0.45 },
        { time: 6.25, type: "cannon", side: "left", warning: 0.45 },
        { time: 6.25, type: "cannon", side: "top", warning: 0.45 }
    ] },
    { name: "Plattformar över stavar", mode: "blue", width: 360, duration: 9,
        startX: 285, platforms: [
            { x: 250, y: 425, width: 80, vx: 0 },
            { x: 365, y: 395, width: 70, vx: 0 },
            { x: 470, y: 420, width: 80, vx: 0 }
        ], events: [
        { time: 0, type: "bone-bed", height: 18 },
        { time: 0.8, type: "cannon", side: "left", warning: 0.55 },
        { time: 2.0, type: "cannon", side: "right", warning: 0.55 },
        { time: 3.2, type: "cannon", side: "top", warning: 0.55 },
        { time: 4.4, type: "cannon", side: "left", warning: 0.55 },
        { time: 5.6, type: "cannon", side: "right", warning: 0.55 },
        { time: 6.8, type: "cannon", side: "top", warning: 0.55 }
    ] },
    { name: "Rörliga plattformar", mode: "blue", width: 360, duration: 9,
        startX: 290, platforms: [
            { x: 250, y: 420, width: 84, vx: 65 },
            { x: 400, y: 385, width: 90, vx: -55 },
            { x: 480, y: 420, width: 84, vx: -65 }
        ], events: [
        { time: 0, type: "bone-bed", height: 18 },
        { time: 0.8, type: "column", x: 350, speed: 180, height: 40 },
        { time: 2.0, type: "column", x: 470, speed: -180, height: 40 },
        { time: 3.2, type: "column", x: 300, speed: 180, height: 40 },
        { time: 4.4, type: "column", x: 420, speed: -180, height: 40 },
        { time: 5.6, type: "column", x: 520, speed: 180, height: 40 },
        { time: 6.8, type: "column", x: 350, speed: -180, height: 40 }
    ] },
    { name: "Plattformar och laser", mode: "blue", width: 360, duration: 9,
        startX: 280, platforms: [
            { x: 240, y: 420, width: 90, vx: 45 },
            { x: 355, y: 395, width: 90, vx: -40 },
            { x: 470, y: 420, width: 90, vx: -45 }
        ], events: [
        { time: 0, type: "bone-bed", height: 18 },
        { time: 0.6, type: "cannon", side: "left", warning: 0.5 },
        { time: 1.6, type: "cannon", side: "right", warning: 0.5 },
        { time: 2.6, type: "cannon", side: "top", warning: 0.5 },
        { time: 3.6, type: "cannon", side: "left", warning: 0.5 },
        { time: 4.6, type: "cannon", side: "right", warning: 0.5 },
        { time: 5.6, type: "cannon", side: "top", warning: 0.5 },
        { time: 6.6, type: "cannon", side: "left", warning: 0.5 },
        { time: 6.6, type: "cannon", side: "right", warning: 0.5 }
    ] },
    { name: "Väggkast", mode: "blue", width: 300, top: 300, duration: 9, events: [
        { time: 0.3, type: "slam", direction: "down" },
        { time: 1.7, type: "slam", direction: "left" },
        { time: 3.1, type: "slam", direction: "up" },
        { time: 4.5, type: "slam", direction: "right" },
        { time: 5.9, type: "slam", direction: "down" },
        { time: 7.3, type: "slam", direction: "left" }
    ] },
    { name: "Stavar uppifrån och nerifrån", mode: "red", width: 360, duration: 9, events: [
        { time: 0.4, type: "vertical-wall", gapX: 320, speed: 240 },
        { time: 1.05, type: "vertical-wall", gapX: 400, speed: -240 },
        { time: 1.7, type: "vertical-wall", gapX: 480, speed: 240 },
        { time: 2.35, type: "vertical-wall", gapX: 400, speed: -240 },
        { time: 3.0, type: "vertical-wall", gapX: 320, speed: 240 },
        { time: 3.65, type: "vertical-wall", gapX: 400, speed: -240 },
        { time: 4.3, type: "vertical-wall", gapX: 480, speed: 240 },
        { time: 4.95, type: "vertical-wall", gapX: 400, speed: -240 },
        { time: 5.6, type: "vertical-wall", gapX: 320, speed: 240 },
        { time: 6.25, type: "vertical-wall", gapX: 400, speed: -240 },
        { time: 6.9, type: "vertical-wall", gapX: 480, speed: 240 },
        { time: 7.55, type: "vertical-wall", gapX: 400, speed: -240 }
    ] },
    { name: "Laserkarusellen", mode: "red", width: 300, top: 300, duration: 9, events: [
        { time: 0.3, type: "ring-cannon", angle: 0 },
        { time: 0.9, type: "ring-cannon", angle: 0.4 },
        { time: 1.5, type: "ring-cannon", angle: 0.8 },
        { time: 2.1, type: "ring-cannon", angle: 1.2 },
        { time: 2.7, type: "ring-cannon", angle: 1.6 },
        { time: 3.3, type: "ring-cannon", angle: 2.0 },
        { time: 3.9, type: "ring-cannon", angle: 2.4 },
        { time: 4.5, type: "ring-cannon", angle: 2.8 },
        { time: 5.1, type: "ring-cannon", angle: 3.2 },
        { time: 5.7, type: "ring-cannon", angle: 3.6 },
        { time: 6.3, type: "ring-cannon", angle: 4.0 },
        { time: 6.9, type: "ring-cannon", angle: 4.4 },
        { time: 7.5, type: "ring-cannon", angle: 4.8 }
    ] }
];

// Barnet (huvudpersonen) ritas med pixlar. Varje bokstav är en färg, punkt betyder genomskinligt.
const barnFarger = {
    H: "#1a1a1a", // hår
    S: "#f1c9a0", // hud
    O: "#000000", // ögon
    P: "#8fd9b6", // tröja
    V: "#ffffff", // ränder på tröjan
    B: "#f2d16b", // byxor
    F: "#c9a7e8"  // snuttefilt
};
const barnPixel = 4;
const barnStegPerSekund = 8;

const barnKroppNer = [
    "................",
    ".....HHHHHH.....",
    "....HHHHHHHH....",
    "...HHHHHHHHHH...",
    "...HHSSSSSSHH...",
    "...HSOSSSSOSH...",
    "...HSSSSSSSSH...",
    "...HHSSSSSSHH...",
    "...HPPPPPPPPH...",
    "..VVVVVVVVVVVV..",
    "..PPPPPPPPPPPP..",
    "..VVVVVVVVVVVV..",
    ".FSPPPPPPPPPPS..",
    "FFF.VVVVVVVV...."
];
const barnKroppUpp = [
    "................",
    ".....HHHHHH.....",
    "....HHHHHHHH....",
    "...HHHHHHHHHH...",
    "...HHHHHHHHHH...",
    "...HHHHHHHHHH...",
    "...HHHHHHHHHH...",
    "...HHHHHHHHHH...",
    "...HHHHHHHHHH...",
    "..PPHHHHHHHHPP..",
    "..VVVVVVVVVVVV..",
    "..PPPPPPPPPPPP..",
    "..SVVVVVVVVVVSF.",
    "....PPPPPPPP.FFF"
];
// Sidan ritas åt höger. Åt vänster spegelvänds den.
const barnKroppSida = [
    "................",
    "......HHHHHH....",
    ".....HHHHHHHH...",
    "....HHHHHHHHH...",
    "....HHHHSSSSS...",
    "....HHHSSSOSS...",
    "....HHHSSSSSSS..",
    "....HHHHSSSS....",
    "....HHHPPPP.....",
    "....HHVVVVV.....",
    "......PPPPP.....",
    "......VVVVV.....",
    "......PPPPSF....",
    "......VVVVVFF..."
];

const benFramSta = [
    "....BBB..BBB....",
    "....BBB..BBB....",
    "....BBB..BBB....",
    "...SSSS..SSSS..."
];
const benFramSteg1 = [
    "....BBB..BBB....",
    "....BBB..BBB....",
    "...SSSS..BBB....",
    ".........SSSS..."
];
const benFramSteg2 = [
    "....BBB..BBB....",
    "....BBB..BBB....",
    "....BBB..SSSS...",
    "...SSSS........."
];
const benSidaSta = [
    "......BBBB......",
    "......BBBB......",
    "......BBBB......",
    "......SSSSS....."
];
const benSidaSteg = [
    "......BBBB......",
    ".....BB..BB.....",
    "....BB....BB....",
    "...SSS....SSS..."
];
// Gångens bilder i ordning. Bild nummer 1 är när barnet står still.
const benFram = [benFramSteg1, benFramSta, benFramSteg2, benFramSta];
const benSida = [benSidaSteg, benSidaSta];
let spelarenGar = false;
let gangTid = 0;

// Fight-spel bilder
const heartImage = new Image();
heartImage.onerror = () => console.error("Kunde inte ladda bilden av hjärtat.");
heartImage.src = "images/hjarta.png";

// Flowie är en blåklocka som ritas med pixlar. Ansiktet byts under samtalet.
const flowieFarger = {
    G: "#2f6b2f", // stjälk
    A: "#4caf50", // blad
    T: "#1d3d1d", // taggar
    B: "#4a6fd8", // blomman
    L: "#7fa0f0", // blommans kant
    W: "#ffffff", // ögonvitor och tänder
    O: "#000000", // pupiller
    M: "#3a0a0a", // mun
    E: "#ff2020"  // röda ögon
};
const flowieTopp = [
    "...GGGGGG.......",
    "..G.....G.......",
    "..G....BBB......",
    "..G...BBBBB.....",
    "..G..BBBBBBB...."
];
const flowieBotten = [
    "..GLLBLLBLLBLL..",
    "..G.............",
    ".TG.............",
    "..GT............",
    "AAGAA...........",
    ".AGA............",
    "..G.............",
    ".TG.............",
    "..G.............",
    ".GGG............"
];
// 0 = snäll, 1 = lurig, 2 = arg, 3 = elakt skratt
const flowieAnsikten = [
    [
        "..G..BWWBWWB....",
        "..G..BWOBWOB....",
        "..G.BBBBBBBBB...",
        "..G.BBMBBBMBB...",
        "..G.BBBMMMBBB..."
    ],
    [
        "..G..BBBBBBB....",
        "..G..BOOBOOB....",
        "..G.BBBBBBBBB...",
        "..G.BBBBBBMBB...",
        "..G.BMMMMMBBB..."
    ],
    [
        "..G..BOBBBOB....",
        "..G..BWOBOWB....",
        "..G.BBBBBBBBB...",
        "..G.BBBMMMBBB...",
        "..G.BBMBBBMBB..."
    ],
    [
        "..G..BEEBEEB....",
        "..G..BEEBEEB....",
        "..G.BMMMMMMMB...",
        "..G.BMWMWMWMB...",
        "..G.BBMMMMMBB..."
    ]
];
const flowiePixelRum = 3;
const flowiePixelStrid = 6;

// Farmor ritas med pixlar, precis som barnet.
const farmorFarger = {
    W: "#f4f4f4", // vitt hår
    R: "#e63946", // blomma i håret
    S: "#f1c9a0", // hud
    G: "#5a3e2b", // glasögon
    O: "#000000", // ögon
    K: "#f28b82", // rosiga kinder
    C: "#d4a017", // kofta
    D: "#8a6a00", // knappar
    J: "#7b1e2b", // kjol
    T: "#8fb3e8", // tofflor
    P: "#c98a3c", // pajens kant
    U: "#e07b24"  // pumpafyllning
};
const farmorPixlar = [
    "......WWWR......",
    ".....WWWWWR.....",
    "......WWWW......",
    "....WWWWWWWW....",
    "...WWSSSSSSWW...",
    "...WGGGSSGGGW...",
    "...WGOGSSGOGW...",
    "...WGGGSSGGGW...",
    "....KSSSSSSK....",
    ".....SSSSSS.....",
    "....CCCCCCCC....",
    "...CCCCDCCCCC...",
    "..CCCCCCCCCCCC..",
    "..CCCCCDCCCCCC..",
    "..CSPPPPPPPPSC..",
    "..CCUUUUUUUUCC..",
    "...JPPPPPPPPJ...",
    "...JJJJJJJJJJ...",
    "...JJJJJJJJJJ...",
    "..JJJJJJJJJJJJ..",
    "..JJJJJJJJJJJJ..",
    "..JJJJJJJJJJJJ..",
    "...TTTT..TTTT..."
];
const farmorPixelRum = 5;
const farmorPixelRaddning = 7;
// När Farmor sitter är överkroppen densamma, men kjolen ligger över knäna.
const farmorSitterPixlar = farmorPixlar.slice(0, 17).concat([
    "..JJJJJJJJJJJJ..",
    "..JJJJJJJJJJJJ..",
    "....JJ....JJ....",
    "....JJ....JJ....",
    "...TTT....TTT..."
]);

const kaffeFarger = {
    A: "#dddddd", // ånga
    W: "#ffffff", // mugg
    C: "#5a3a1e"  // kaffe
};
const kaffePixlar = [
    "..A..A..",
    ".A..A...",
    "..A..A..",
    "WWWWWW..",
    "WCCCCWWW",
    "WWWWWW.W",
    "WWWWWWWW",
    "WWWWWW..",
    ".WWWW..."
];

const sikaelImage = new Image();
sikaelImage.onerror = () => console.error("Kunde inte ladda bilden av Sikael.");
sikaelImage.src = "images/sikael.png";
const sikaelKneelingImage = new Image();
sikaelKneelingImage.onerror = () => console.error("Kunde inte ladda bilden av Sikael på knä.");
sikaelKneelingImage.src = "images/sikael-kna.png";

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
    "Hejsan! Jag är FLOWIE. Blomman FLOWIE!",
    "Det här är kärlek",
    "ta den",
    "Jag sa ta den",
    "Här i underjorden dödar man eller blir dödad",
    "DÖ!"
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
    { name: "Inledning – Fallet", description: "Du trillar ner i brunnen...", spawnX: 400, spawnY: 300 },
    { name: "Skogsdunge", description: "Du är här. Flowie syns längre bort", npc: "Flowie", npcX: 600, npcY: 300, spawnX: 300, spawnY: 100 },
    { name: "Farmors hus", description: "Köket ligger uppåt. Högra dörren leder till Sikael.", npc: "Farmor", npcX: 410, npcY: 230, spawnX: 560, spawnY: 330 },
    { name: "Farmors kök", description: "Gå tillbaka genom öppningen nedåt", npc: null, spawnX: 300, spawnY: 550 },
    { name: "Grotta höger", description: "Skelett längre in", npc: "Papyrus", npcX: 600, npcY: 300, spawnX: 100, spawnY: 300 },
    { name: "Snöbiom vänster", description: "Hundar här", npc: "Hundar", npcX: 600, npcY: 300, spawnX: 100, spawnY: 300 },
    { name: "Korridor", description: "Till Sikaels kontor", npc: null, spawnX: 40, spawnY: 435 },
    { name: "Sikaels kontor", description: "Sikael sitter vid skrivbordet", npc: null, spawnX: 400, spawnY: 520 },
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
        if (gameState === "boss-defend" && boss.heartMode === "blue" &&
            e.key === bossGravity[boss.gravityDirection].jumpKey && !e.repeat) {
            boss.jumpRequested = true;
        }
        if (gameState === "boss-menu" && !e.repeat) {
            if (e.key === "ArrowLeft") selectedButton = Math.max(0, selectedButton - 1);
            if (e.key === "ArrowRight") selectedButton = Math.min(3, selectedButton + 1);
            if (e.key.toLowerCase() === "k") {
                boss.hp = 5;
                boss.message = "Fuskkod: Sikael har nu 5 hälsa.";
            }
        }
        if (gameState === "boss-items" && e.key.toLowerCase() === "x" && !e.repeat) {
            e.preventDefault();
            gameState = "boss-menu";
            boss.message = "Din tur! Välj vad du vill göra.";
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
            playerHP = maxHP;
            currentRoom = 2;
            playerX = rooms[currentRoom].spawnX;
            playerY = rooms[currentRoom].spawnY;
            gameState = "exploration";
        }
    }
});

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
    if (gameState === "boss-defend" && boss.heartMode === "blue" &&
        e.key === bossGravity[boss.gravityDirection].jumpKey && boss.gravitySpeed < -bossPhysics.jumpCut) {
        boss.gravitySpeed = -bossPhysics.jumpCut;
    }
    if (e.key.toLowerCase() === "z") {
        zPressed = false;
    }
});

window.addEventListener("blur", () => {
    for (const key of Object.keys(keys)) keys[key] = false;
    zPressed = false;
    boss.jumpRequested = false;
});

function startBoss(retry = false) {
    if (retry) {
        playerHP = boss.entryHP;
        pieCount = boss.entryPieCount;
    } else {
        boss.entryHP = playerHP;
        boss.entryPieCount = pieCount;
    }
    currentRoom = 9;
    boss.maxHP = 100;
    boss.hp = boss.maxHP;
    boss.lunchEaten = false;
    boss.lunchLine = 0;
    boss.farewellLine = 0;
    boss.determination = false;
    boss.phaseTurn = 0;
    boss.lowHealthAttackUsed = false;
    boss.patternIndex = 0;
    boss.turn = 0;
    boss.projectiles = [];
    boss.heartMode = "red";
    boss.gravitySpeed = 0;
    boss.gravityDirection = "down";
    boss.platforms = [];
    boss.jumpRequested = false;
    bossDeath.timer = 0;
    bossDeath.particles = [];
    boss.message = "Sikael: Du får inte ta mitt kaffe";
    selectedButton = 0;
    gameState = "boss-intro";
}

function handleBossChoice() {
    if (gameState === "boss-lost" || gameState === "boss-won") {
        startBoss(true);
    } else if (gameState === "boss-intro") {
        startBossDefense();
    } else if (gameState === "boss-farewell") {
        if (boss.kneelTimer < sikaelKnaTid) return;
        boss.farewellLine++;
        if (boss.farewellLine < bossFarewellLines.length) {
            boss.message = bossFarewellLines[boss.farewellLine];
        } else {
            startBossDeath();
        }
    } else if (gameState === "boss-lunch") {
        boss.lunchLine++;
        if (boss.lunchLine === 2) {
            boss.hp += 250;
            boss.maxHP = Math.max(boss.maxHP, boss.hp);
        }
        if (boss.lunchLine === 3) boss.determination = true;
        if (boss.lunchLine < bossLunchLines.length) {
            boss.message = bossLunchLines[boss.lunchLine];
        } else {
            startBossDefense();
        }
    } else if (gameState === "boss-items") {
        if (pieCount > 0) {
            playerHP = maxHP;
            pieCount--;
            boss.message = "Du åt en pumpapaj! Hälsan återställd till " + maxHP + ".";
            gameState = "boss-menu";
        }
    } else if (gameState === "boss-menu") {
        if (selectedButton === 0) {
            attackBarProgress = 0;
            gameState = "boss-slider";
        } else if (selectedButton === 2) {
            gameState = "boss-items";
            boss.message = "Dina föremål";
        } else {
            boss.message = selectedButton === 1
                ? "Sikael: Visa hur du undviker mina stavar och lasrar!"
                : "Sikael är inte redo att ge upp. Välj SLÅSS.";
        }
    } else if (gameState === "boss-slider") {
        const damage = Math.round(5 + 20 * (1 - Math.abs(attackBarProgress - 50) / 50));
        boss.hp = Math.max(0, boss.hp - damage);
        boss.message = "Du gjorde " + damage + " skada!";
        if (boss.hp < 10 && !boss.lunchEaten) {
            boss.lunchEaten = true;
            boss.lunchLine = 0;
            boss.message = bossLunchLines[0];
            gameState = "boss-lunch";
        } else if (boss.hp === 0) {
            boss.projectiles = [];
            boss.platforms = [];
            boss.farewellLine = 0;
            boss.kneelTimer = 0;
            boss.message = bossFarewellLines[0];
            gameState = "boss-farewell";
        } else {
            startBossDefense();
        }
    }
}

function startBossDeath() {
    gameState = "boss-dying";
    boss.projectiles = [];
    boss.platforms = [];
    boss.message = "";
    bossDeath.timer = 0;
    bossDeath.particles = [];
    for (const layer of [bossDeath.portrait, bossDeath.dust]) {
        layer.width = 190;
        layer.height = 190;
        const layerContext = layer.getContext("2d");
        layerContext.translate(-305, -50);
        drawSikael(true, layerContext);
        layerContext.resetTransform();
        if (layer === bossDeath.dust) {
            // Behåll bildens genomskinliga delar när stoftet färgas vitt.
            layerContext.globalCompositeOperation = "source-in";
            layerContext.fillStyle = "#fff";
            layerContext.fillRect(0, 0, 190, 190);
        }
    }
    for (let y = 0; y < 190; y += 5) {
        for (let x = 0; x < 190; x += 5) {
            bossDeath.particles.push({
                x, y, start: 0.15 + y / 190 + Math.random() * 0.2,
                vx: (Math.random() - 0.5) * 70,
                vy: -25 - Math.random() * 50,
                lifetime: 0.8 + Math.random() * 0.4
            });
        }
    }
}

function getBossPattern() {
    if (boss.patternIndex === -1) return bossLowHealthPattern;
    return (boss.determination ? bossHardPatterns : bossPatterns)[boss.patternIndex];
}

function startBossDefense() {
    boss.timer = 0;
    // Öppningen spelas en gång; övriga mönster upprepas efter spelarens turer.
    if (boss.determination) {
        boss.turn++;
        boss.patternIndex = boss.phaseTurn % bossHardPatterns.length;
        boss.phaseTurn++;
    } else if (boss.turn > 0 && !boss.lunchEaten && !boss.lowHealthAttackUsed &&
        boss.hp >= 10 && boss.hp < 30) {
        boss.patternIndex = -1;
        boss.lowHealthAttackUsed = true;
    } else {
        boss.turn++;
        boss.patternIndex = boss.turn === 1 ? 0 : 1 + (boss.turn - 2) % (bossPatterns.length - 1);
    }
    boss.nextEvent = 0;
    const pattern = getBossPattern();
    bossArena.left = 400 - pattern.width / 2;
    bossArena.right = 400 + pattern.width / 2;
    bossArena.top = pattern.top ?? 332;
    boss.heartMode = pattern.mode;
    boss.gravityDirection = "down";
    boss.gravitySpeed = pattern.mode === "blue" ? 600 : 0;
    boss.jumpRequested = false;
    boss.invincibleTime = 0;
    boss.projectiles = [];
    boss.platforms = (pattern.platforms ?? []).map(platform => ({ ...platform }));
    heartX = pattern.startX ?? 400;
    heartY = pattern.platforms ? pattern.platforms[0].y - bossHeartSize
        : (bossArena.top + bossArena.bottom) / 2;
    if (pattern.platforms) boss.gravitySpeed = 0;
    gameState = "boss-defend";
}

function spawnBossSpark(x, y, vx, vy, radius, warning = 0) {
    boss.projectiles.push({
        type: "spark", x: x - radius, y: y - radius,
        width: radius * 2, height: radius * 2, vx, vy, age: 0, warning
    });
}

function spawnBossHazard(event) {
    const speed = event.speed;
    const boneX = speed > 0 ? bossArena.left - 14 : bossArena.right;
    if (event.type === "mode") {
        boss.heartMode = event.mode;
        boss.gravitySpeed = 0;
        boss.jumpRequested = false;
    } else if (event.type === "spark-rain") {
        const spacing = event.dense ? 21 : 36;
        const radius = event.dense ? 10 : 9;
        for (let x = bossArena.left + 15; x < bossArena.right; x += spacing) {
            if (Math.abs(x - event.gapX) < (event.dense ? 28 : 54)) continue;
            spawnBossSpark(x, bossArena.top - radius, 0, event.dense ? 265 : 170, radius);
        }
    } else if (event.type === "spark-ring") {
        const y = (bossArena.top + bossArena.bottom) / 2;
        for (let i = 0; i < 16; i++) {
            const distance = Math.abs(i - event.gap);
            if (distance <= 1 || distance >= 15) continue;
            const angle = i * Math.PI / 8;
            const dx = Math.cos(angle);
            const dy = Math.sin(angle);
            spawnBossSpark(event.x + dx * 22, y + dy * 22, dx * 155, dy * 155, 8, 0.45);
        }
    } else if (event.type === "color-sweep") {
        boss.projectiles.push({ type: "color-sweep", color: event.color, age: 0,
            warning: bossSweep.warning, lifetime: bossSweep.warning + bossSweep.duration });
    } else if (event.type === "bone-bed") {
        boss.projectiles.push({ type: "bone-bed", x: bossArena.left,
            y: bossArena.bottom - event.height, width: bossArena.right - bossArena.left,
            height: event.height, vx: 0, age: 0 });
    } else if (event.type === "slam") {
        boss.gravityDirection = event.direction;
        boss.gravitySpeed = 650;
        boss.jumpRequested = false;
        boss.projectiles.push({ type: "stab", direction: event.direction,
            x: bossArena.left, y: bossArena.bottom, width: 0, height: 0,
            vx: 0, age: 0, warning: 0.6, lifetime: 1.15, maxHeight: 34 });
    } else if (event.type === "vertical-wall") {
        const y = speed > 0 ? bossArena.top - 14 : bossArena.bottom;
        for (const [left, right] of [[bossArena.left, event.gapX - 40],
            [event.gapX + 40, bossArena.right]]) {
            boss.projectiles.push({ type: "bone", x: left, y, width: right - left,
                height: 14, horizontal: true, vx: 0, vy: speed, age: 0 });
        }
    } else if (event.type === "column") {
        boss.projectiles.push({ type: "bone", x: event.x, y: speed > 0
            ? bossArena.top - event.height : bossArena.bottom,
            width: 14, height: event.height, vx: 0, vy: speed, age: 0 });
    } else if (event.type === "ring-cannon") {
        for (const angle of [event.angle, event.angle + Math.PI]) {
            spawnBossHazard({ type: "cannon", x: 400 + Math.cos(angle) * 195,
                y: 380 + Math.sin(angle) * 60, targetX: 400, targetY: 380,
                warning: 0.45, beamWidth: 22 });
        }
    } else if (event.type === "floor") {
        boss.projectiles.push({ type: "floor", x: bossArena.left, y: bossArena.bottom,
            width: bossArena.right - bossArena.left, height: 0, maxHeight: event.height,
            vx: 0, age: 0, lifetime: 0.9, warning: 0.45 });
    } else if (event.type === "volley") {
        const left = bossArena.left - 44;
        const right = bossArena.right + 44;
        const top = bossArena.top - 24;
        const bottom = bossArena.bottom - 24;
        if (event.layout === "edges") {
            for (const y of [bossArena.top + 22, bossArena.bottom - 22]) {
                spawnBossHazard({ type: "cannon", x: left, y, targetX: 400, targetY: y, warning: 0.55 });
            }
            for (const x of [bossArena.left + 24, bossArena.right - 24]) {
                spawnBossHazard({ type: "cannon", x, y: top, targetX: x, targetY: 380, warning: 0.55 });
            }
        } else if (event.layout === "diagonal") {
            for (const x of [left, right]) {
                for (const y of [top, bottom]) {
                    spawnBossHazard({ type: "cannon", x, y, targetX: 400, targetY: 380, warning: 0.55 });
                }
            }
        } else if (event.layout === "final") {
            for (const x of [left, right]) {
                spawnBossHazard({ type: "cannon", x, y: 380, targetX: 400, targetY: 380,
                    warning: 0.55, beamWidth: 90, powered: true });
            }
        }
    } else if (event.type === "wall") {
        const gapTop = Math.max(bossArena.top, event.gapY - 28);
        const gapBottom = Math.min(bossArena.bottom, event.gapY + 28);
        if (gapTop > bossArena.top) {
            boss.projectiles.push({ type: "bone", x: boneX, y: bossArena.top,
                width: 14, height: gapTop - bossArena.top, vx: speed, age: 0 });
        }
        if (gapBottom < bossArena.bottom) {
            boss.projectiles.push({ type: "bone", x: boneX, y: gapBottom,
                width: 14, height: bossArena.bottom - gapBottom, vx: speed, age: 0 });
        }
    } else if (event.type === "hurdle") {
        boss.projectiles.push({ type: "bone", x: boneX, y: bossArena.bottom - event.height,
            width: 14, height: event.height, vx: speed, age: 0 });
    } else if (event.type === "blue-wall") {
        boss.projectiles.push({ type: "blue-bone", x: boneX, y: bossArena.top,
            width: 14, height: bossArena.bottom - bossArena.top, vx: speed, age: 0 });
    } else if (event.type === "cannon") {
        const x = event.x ?? (event.side === "left" ? bossArena.left - 44
            : event.side === "right" ? bossArena.right + 44 : 400);
        const y = event.y ?? (event.side === "top" ? bossArena.top - 24 : (bossArena.top + bossArena.bottom) / 2);
        // Siktet låses när kanonen dyker upp, så spelaren hinner undan.
        boss.projectiles.push({ type: "cannon", x, y,
            angle: Math.atan2((event.targetY ?? heartY) - y, (event.targetX ?? heartX) - x),
            warning: event.warning ?? bossLaser.warning, beamWidth: event.beamWidth ?? bossLaser.width,
            powered: event.powered === true, vx: 0, age: 0 });
    }
}

function bossHazardHits(hazard, moving) {
    const radius = bossPhysics.hitRadius;
    if (hazard.type === "spark") {
        if (hazard.age < hazard.warning) return false;
        const sparkRadius = hazard.width / 2;
        return Math.hypot(heartX - hazard.x - sparkRadius, heartY - hazard.y - sparkRadius) <
            radius + sparkRadius;
    }
    if (hazard.type === "color-sweep") {
        return hazard.age >= hazard.warning && hazard.age < hazard.lifetime &&
            (hazard.color === "blue" ? moving : !moving);
    }
    if (hazard.type === "cannon") {
        if (hazard.age < hazard.warning || hazard.age >= hazard.warning + bossLaser.firing) return false;
        const dx = heartX - hazard.x;
        const dy = heartY - hazard.y;
        const forward = dx * Math.cos(hazard.angle) + dy * Math.sin(hazard.angle);
        const distance = Math.abs(dx * Math.sin(hazard.angle) - dy * Math.cos(hazard.angle));
        return forward >= 0 && distance < hazard.beamWidth / 2 + radius;
    }
    if ((hazard.type === "floor" || hazard.type === "stab") &&
        (hazard.height <= 0 || hazard.width <= 0)) return false;
    if (hazard.type === "blue-bone" && !moving) return false;
    return heartX + radius > hazard.x && heartX - radius < hazard.x + hazard.width &&
        heartY + radius > hazard.y && heartY - radius < hazard.y + hazard.height;
}

function updateBossPlatforms(seconds) {
    const support = boss.gravityDirection === "down" && boss.gravitySpeed >= 0
        ? boss.platforms.find(platform => Math.abs(heartY + bossHeartSize - platform.y) < 0.1 &&
            heartX + bossHeartSize > platform.x && heartX - bossHeartSize < platform.x + platform.width)
        : null;
    for (const platform of boss.platforms) {
        const previousX = platform.x;
        platform.x += platform.vx * seconds;
        if (platform.x < bossArena.left || platform.x + platform.width > bossArena.right) {
            platform.x = Math.max(bossArena.left, Math.min(bossArena.right - platform.width, platform.x));
            platform.vx *= -1;
        }
        if (platform === support) heartX += platform.x - previousX;
    }
}

function moveBlueBossHeart(horizontal, vertical, seconds) {
    const gravity = bossGravity[boss.gravityDirection];
    let grounded = gravity.x < 0 ? heartX <= bossArena.left + bossHeartSize
        : gravity.x > 0 ? heartX >= bossArena.right - bossHeartSize
        : gravity.y < 0 ? heartY <= bossArena.top + bossHeartSize
        : heartY >= bossArena.bottom - bossHeartSize;
    if (boss.gravityDirection === "down") {
        grounded ||= boss.platforms.some(platform =>
            Math.abs(heartY + bossHeartSize - platform.y) < 0.1 &&
            heartX + bossHeartSize > platform.x && heartX - bossHeartSize < platform.x + platform.width);
    }
    if ((boss.jumpRequested || keys[gravity.jumpKey]) && grounded) boss.gravitySpeed = -bossPhysics.jump;
    boss.jumpRequested = false;
    boss.gravitySpeed += bossPhysics.gravity * seconds;
    const previousBottom = heartY + bossHeartSize;
    heartX += (gravity.x * boss.gravitySpeed + (gravity.x === 0 ? horizontal * bossPhysics.speed : 0)) * seconds;
    heartY += (gravity.y * boss.gravitySpeed + (gravity.y === 0 ? vertical * bossPhysics.speed : 0)) * seconds;
    if (boss.gravityDirection === "down" && boss.gravitySpeed >= 0) {
        // Bara landning ovanifrån: hjärtat kan hoppa upp genom plattformarna.
        const landing = boss.platforms.filter(platform =>
            previousBottom <= platform.y + 0.1 && heartY + bossHeartSize >= platform.y &&
            heartX + bossHeartSize > platform.x && heartX - bossHeartSize < platform.x + platform.width)
            .sort((a, b) => a.y - b.y)[0];
        if (landing) {
            heartY = landing.y - bossHeartSize;
            boss.gravitySpeed = 0;
        }
    }
    if ((gravity.x !== 0 && (heartX <= bossArena.left + bossHeartSize ||
        heartX >= bossArena.right - bossHeartSize)) ||
        (gravity.y !== 0 && (heartY <= bossArena.top + bossHeartSize ||
        heartY >= bossArena.bottom - bossHeartSize))) boss.gravitySpeed = 0;
}

function updateBossDefense(seconds) {
    const pattern = getBossPattern();
    const previousX = heartX;
    const previousY = heartY;
    let horizontal = Number(Boolean(keys.ArrowRight)) - Number(Boolean(keys.ArrowLeft));
    let vertical = Number(Boolean(keys.ArrowDown)) - Number(Boolean(keys.ArrowUp));
    updateBossPlatforms(seconds);
    if (boss.heartMode === "blue") {
        moveBlueBossHeart(horizontal, vertical, seconds);
    } else {
        const length = Math.hypot(horizontal, vertical);
        if (length > 0) {
            horizontal /= length;
            vertical /= length;
        }
        heartY += vertical * bossPhysics.speed * seconds;
        heartX += horizontal * bossPhysics.speed * seconds;
    }
    heartX = Math.max(bossArena.left + bossHeartSize, Math.min(bossArena.right - bossHeartSize, heartX));
    heartY = Math.max(bossArena.top + bossHeartSize, Math.min(bossArena.bottom - bossHeartSize, heartY));
    const moving = Math.abs(heartX - previousX) + Math.abs(heartY - previousY) > 0.001;
    boss.timer += seconds;
    boss.invincibleTime = Math.max(0, boss.invincibleTime - seconds);
    while (boss.nextEvent < pattern.events.length && pattern.events[boss.nextEvent].time <= boss.timer) {
        spawnBossHazard(pattern.events[boss.nextEvent]);
        boss.nextEvent++;
    }
    for (const hazard of boss.projectiles) {
        const previousAge = hazard.age;
        hazard.age += seconds;
        if (hazard.type !== "color-sweep") {
            const travel = hazard.type === "spark"
                ? Math.max(0, hazard.age - Math.max(previousAge, hazard.warning))
                : seconds;
            hazard.x += hazard.vx * travel;
            hazard.y += (hazard.vy ?? 0) * travel;
        }
        if (hazard.type === "floor") {
            const rise = (hazard.age - hazard.warning) / 0.1;
            const fall = (hazard.lifetime - hazard.age) / 0.15;
            hazard.height = hazard.maxHeight * Math.max(0, Math.min(1, rise, fall));
            hazard.y = bossArena.bottom - hazard.height;
        } else if (hazard.type === "stab") {
            const length = hazard.maxHeight * Math.max(0, Math.min(1,
                (hazard.age - hazard.warning) / 0.08, (hazard.lifetime - hazard.age) / 0.15));
            const sideways = hazard.direction === "left" || hazard.direction === "right";
            hazard.width = sideways ? length : bossArena.right - bossArena.left;
            hazard.height = sideways ? bossArena.bottom - bossArena.top : length;
            hazard.x = hazard.direction === "right" ? bossArena.right - length : bossArena.left;
            hazard.y = hazard.direction === "down" ? bossArena.bottom - length : bossArena.top;
        }
        if (boss.invincibleTime <= 1e-9 && bossHazardHits(hazard, moving)) {
            playerHP = Math.max(0, playerHP - bossDamage.amount);
            boss.invincibleTime = bossDamage.cooldown;
            if (playerHP === 0) {
                gameState = "boss-lost";
                return;
            }
        }
    }
    boss.projectiles = boss.projectiles.filter(h => h.type === "cannon"
        ? h.age < h.warning + bossLaser.firing + bossLaser.fade
        : h.lifetime !== undefined ? h.age < h.lifetime
        : h.x + h.width >= bossArena.left && h.x <= bossArena.right &&
            h.y + h.height >= bossArena.top && h.y <= bossArena.bottom);
    if (boss.timer >= pattern.duration) {
        boss.projectiles = [];
        boss.platforms = [];
        boss.message = "Din tur! SLÅSS attackerar. FÖREMÅL öppnar din väska.";
        gameState = "boss-menu";
    }
}

function updateBoss(seconds) {
    if (gameState === "boss-farewell") {
        boss.kneelTimer = Math.min(sikaelKnaTid, boss.kneelTimer + seconds);
        return;
    }
    if (gameState === "boss-dying") {
        bossDeath.timer = Math.min(bossDeath.duration, bossDeath.timer + seconds);
        if (bossDeath.timer >= bossDeath.duration) gameState = "boss-won";
        return;
    }
    if (gameState === "boss-slider") {
        attackBarProgress += seconds * 65;
        if (attackBarProgress >= 100) {
            attackBarProgress = 100;
            boss.message = "Du missade! Nu attackerar Sikael.";
            startBossDefense();
        }
        return;
    }
    if (gameState !== "boss-defend") return;
    // Små fysiksteg hindrar snabba hinder från att hoppa över hjärtat vid låg bildfrekvens.
    while (seconds > 1e-9 && gameState === "boss-defend") {
        const step = Math.min(seconds, 1 / 120);
        updateBossDefense(step);
        seconds -= step;
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
        console.log("Du valde " + battleButtons[selectedButton]);
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

function canWalkInCorridor(x, y) {
    const halfSize = playerSize / 2;
    for (const cornerX of [x - halfSize, x + halfSize]) {
        for (const cornerY of [y - halfSize, y + halfSize]) {
            if (!arInne(korridorHoger, cornerX, cornerY) && !arInne(korridorUpp, cornerX, cornerY)) return false;
        }
    }
    return true;
}

function canWalkInOffice(x, y) {
    const halfSize = playerSize / 2;
    return x - halfSize >= 60 && x + halfSize <= 740 && y - halfSize >= 290 && y + halfSize <= 580;
}

function arInne(ruta, x, y) {
    return x >= ruta.x && x <= ruta.x + ruta.bredd && y >= ruta.y && y <= ruta.y + ruta.hojd;
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
        spelarenGar = keys["ArrowUp"] || keys["ArrowDown"] || keys["ArrowLeft"] || keys["ArrowRight"];
        gangTid = spelarenGar ? gangTid + seconds : 0;

        if (currentRoom === 2) {
            if (canWalkInFarmorRoom(newX, playerY)) playerX = newX;
            if (canWalkInFarmorRoom(playerX, newY)) playerY = newY;
            const inKitchenHallway = playerX - playerSize / 2 >= 115 &&
                playerX + playerSize / 2 <= 214;
            const inBossHallway = playerY - playerSize / 2 >= 365 &&
                playerY + playerSize / 2 <= 505;
            if (keys.ArrowUp && inKitchenHallway && playerY + playerSize / 2 < 0) {
                currentRoom = 3;
                playerX = rooms[currentRoom].spawnX;
                playerY = rooms[currentRoom].spawnY;
            } else if (keys.ArrowRight && inBossHallway && playerX - playerSize / 2 > canvas.width) {
                currentRoom = 6;
                playerX = rooms[currentRoom].spawnX;
                playerY = rooms[currentRoom].spawnY;
            }
            return;
        }

        if (currentRoom === 6) {
            if (canWalkInCorridor(newX, playerY)) playerX = newX;
            if (canWalkInCorridor(playerX, newY)) playerY = newY;
            if (playerX + playerSize / 2 < 0) {
                currentRoom = 2;
                playerX = canvas.width - 40;
                playerY = 435;
            }
            const vidDorren = playerY - playerSize / 2 <= korridorUpp.y + 5;
            if (keys.ArrowUp && vidDorren) {
                if (kaffe.collected) {
                    currentRoom = 7;
                    playerX = rooms[currentRoom].spawnX;
                    playerY = rooms[currentRoom].spawnY;
                    currentDirection = 0;
                    kontorTid = 0;
                } else if (pickupMessageTime === 0) {
                    pickupMessage = "Dörren är låst.";
                    pickupMessageTime = 2;
                }
            }
            return;
        }

        if (currentRoom === 7) {
            if (canWalkInOffice(newX, playerY)) playerX = newX;
            if (canWalkInOffice(playerX, newY)) playerY = newY;
            kontorTid += seconds;
            if (kontorTid >= kontorVantetid) startBoss();
            return;
        }

        if (currentRoom === 3) {
            if (canWalkInKitchen(newX, playerY)) playerX = newX;
            if (canWalkInKitchen(playerX, newY)) playerY = newY;
            if (!pie.collected && Math.abs(playerX - pie.x) < 45 && playerY - playerSize / 2 <= 370) {
                pie.collected = true;
                pieCount += 3;
                pickupMessage = "Du fick 3 pumpapajer!";
                pickupMessageTime = 4;
            }
            if (!kaffe.collected && Math.abs(playerX - kaffe.x) < 35 && playerY - playerSize / 2 <= 370) {
                kaffe.collected = true;
                pickupMessage = "Du tog Sikaels kaffe!";
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
    if (currentRoom === 6) {
        ritaKorridor();
        return;
    }
    if (currentRoom === 7) {
        ritaKontor();
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
            ritaFlowie(npcX, npcY, 0, flowiePixelRum);
        } else if (rooms[currentRoom].npc === "Farmor") {
            ritaPixlar(farmorPixlar, farmorFarger, npcX, npcY, farmorPixelRum, false);
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

    ritaBarn(playerX, playerY, currentDirection);

    // HP-display
    ctx.fillStyle = "#fff";
    ctx.font = "18px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Hälsa: " + playerHP + "/" + maxHP, 20, canvas.height - 20);

}

function drawFightMenu() {
    // Meny bakgrund
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 450, canvas.width, 150);
    
    // Knapp-texter
    const buttons = battleButtons;
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
    ctx.fillRect(0, 350, canvas.width, 110);
    
    // Instruktion
    ctx.fillStyle = "#fff";
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Tryck Z när markören är i mitten!", canvas.width / 2, 380);
    
    // Attack-bar bakgrund
    const barX = 100;
    const barY = 410;
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

function drawCharacter(x, y, size, image, context = ctx) {
    if (!image.complete || image.naturalWidth === 0) return;
    context.save();
    context.imageSmoothingEnabled = false;
    const scale = size / Math.max(image.naturalWidth, image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    context.drawImage(image, x - width / 2, y - height / 2, width, height);
    context.restore();
}

// Riktning: 0 = upp, 1 = höger, 2 = ner, 3 = vänster
function ritaBarn(x, y, riktning) {
    const franSidan = riktning === 1 || riktning === 3;
    let kropp = barnKroppSida;
    if (riktning === 0) kropp = barnKroppUpp;
    if (riktning === 2) kropp = barnKroppNer;
    const benLista = franSidan ? benSida : benFram;
    const ben = spelarenGar
        ? benLista[Math.floor(gangTid * barnStegPerSekund) % benLista.length]
        : benLista[1];
    const rader = kropp.concat(ben);
    ritaPixlar(rader, barnFarger, x, y, barnPixel, riktning === 3);
}

// Ritar en pixelfigur med mitten i (x, y). Spegla = vränd åt andra hållet.
function ritaPixlar(rader, farger, x, y, pixel, spegla) {
    const bredd = rader[0].length;
    ctx.save();
    ctx.translate(x, y);
    if (spegla) ctx.scale(-1, 1);
    for (let rad = 0; rad < rader.length; rad++) {
        for (let kolumn = 0; kolumn < rader[rad].length; kolumn++) {
            const farg = farger[rader[rad][kolumn]];
            if (!farg) continue;
            ctx.fillStyle = farg;
            ctx.fillRect(
                (kolumn - bredd / 2) * pixel,
                (rad - rader.length / 2) * pixel,
                pixel, pixel
            );
        }
    }
    ctx.restore();
}

function ritaFlowie(x, y, ansikte, pixel) {
    const rader = flowieTopp.concat(flowieAnsikten[ansikte], flowieBotten);
    ritaPixlar(rader, flowieFarger, x, y, pixel, false);
}

function drawSikael(kneeling, context = ctx) {
    if (kneeling && sikaelKneelingImage.complete && sikaelKneelingImage.naturalWidth > 0) {
        drawCharacter(400, 165, 150, sikaelKneelingImage, context);
    } else {
        drawCharacter(400, 145, 190, sikaelImage, context);
    }
}

// andel går från 0 (står) till 1 (på knä). Stående bilden sjunker och tonar bort.
function ritaSikaelSomFaller(andel) {
    ctx.save();
    ctx.globalAlpha = 1 - andel;
    drawCharacter(400, 145 + 20 * andel, 190, sikaelImage);
    ctx.globalAlpha = andel;
    drawCharacter(400, 165, 150, sikaelKneelingImage);
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

// Golv med brädor. Används i vardagsrummet och i gångarna.
function ritaTragolv(x, y, bredd, hojd) {
    ctx.fillStyle = "#b07a45";
    ctx.fillRect(x, y, bredd, hojd);
    ctx.fillStyle = "#946232";
    for (let linjeY = y + 28; linjeY < y + hojd; linjeY += 28) {
        ctx.fillRect(x, linjeY, bredd, 3);
    }
}

// Vardagsrummet: gången uppåt leder till köket, öppningen till höger leder till Sikael.
function ritaVardagsrum() {
    // Blommig tapet
    ctx.fillStyle = "#e9d8b4";
    ctx.fillRect(46, 30, 704, 120);
    for (let x = 70; x < 750; x += 40) {
        for (let y = 50; y < 145; y += 35) {
            ctx.fillStyle = "#d77a8a";
            ctx.fillRect(x, y, 6, 6);
            ctx.fillStyle = "#7aa86a";
            ctx.fillRect(x + 2, y + 6, 2, 6);
        }
    }

    ritaTragolv(46, 150, 704, 395);
    ritaTragolv(115, 0, 99, 150);
    ritaTragolv(750, 365, 50, 140);

    // Golvlist och dörrkarmar
    ctx.fillStyle = "#6b4423";
    ctx.fillRect(46, 146, 69, 6);
    ctx.fillRect(214, 146, 536, 6);
    ctx.fillRect(109, 0, 6, 152);
    ctx.fillRect(214, 0, 6, 152);
    ctx.fillRect(746, 359, 10, 6);
    ctx.fillRect(746, 505, 10, 6);

    // Fönster med gardiner och krukväxter
    ctx.fillStyle = "#fff";
    ctx.fillRect(300, 50, 130, 85);
    ctx.fillStyle = "#9fd3f0";
    ctx.fillRect(306, 56, 56, 73);
    ctx.fillRect(368, 56, 56, 73);
    ctx.fillStyle = "#f2a7c3";
    ctx.fillRect(288, 44, 18, 96);
    ctx.fillRect(424, 44, 18, 96);
    for (const vaxtX of [325, 365, 405]) {
        ctx.fillStyle = "#c0623a";
        ctx.fillRect(vaxtX - 7, 118, 14, 12);
        ctx.fillStyle = "#3f8f3f";
        ctx.fillRect(vaxtX - 9, 104, 18, 14);
    }

    // Golvklocka
    ctx.fillStyle = "#5a3a1e";
    ctx.fillRect(670, 40, 46, 120);
    ctx.fillStyle = "#f4ecd8";
    ctx.fillRect(679, 50, 28, 28);
    ctx.fillStyle = "#000";
    ctx.fillRect(692, 54, 2, 12);
    ctx.fillRect(692, 64, 10, 2);
    ctx.fillStyle = "#d4a017";
    ctx.fillRect(689, 100, 8, 40);

    // Rund trasmatta
    const mattFarger = ["#c94f4f", "#f0d68a", "#5b8fc9", "#f0d68a", "#c94f4f"];
    for (let i = 0; i < mattFarger.length; i++) {
        ctx.fillStyle = mattFarger[i];
        ctx.beginPath();
        ctx.ellipse(420, 400, 190 - i * 34, 95 - i * 17, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // Grön fåtölj där Farmor sitter, och en stickkorg
    ctx.fillStyle = "#3f7a4a";
    ctx.fillRect(360, 160, 100, 90);
    ctx.fillRect(350, 235, 120, 50);
    ctx.fillStyle = "#2f5e38";
    ctx.fillRect(342, 210, 28, 75);
    ctx.fillRect(450, 210, 28, 75);
    ctx.fillStyle = "#8a5a2b";
    ctx.fillRect(495, 255, 40, 28);
    ctx.fillStyle = "#d77a8a";
    ctx.fillRect(503, 246, 12, 12);
    ctx.fillStyle = "#5b8fc9";
    ctx.fillRect(517, 248, 12, 10);
}

// Köket: öppningen nedåt leder tillbaka till vardagsrummet.
function ritaKok() {
    // Ljusgula väggar
    ctx.fillStyle = "#f6e7a1";
    ctx.fillRect(kitchen.x, kitchen.y, kitchen.width, 200);
    ctx.fillStyle = "#e3cf7f";
    ctx.fillRect(kitchen.x, kitchen.y, 52, 440);
    ctx.fillRect(650, kitchen.y, 52, 440);

    // Golv med ljusgröna plattor
    for (let x = 150; x < 650; x += 25) {
        for (let y = 300; y < 540; y += 25) {
            ctx.fillStyle = (x + y) % 50 === 0 ? "#cfe8c4" : "#b9dbab";
            ctx.fillRect(x, y, 25, 25);
        }
    }
    ritaTragolv(242, 540, 116, 60);

    // Fönster med rutiga gardiner
    ctx.fillStyle = "#fff";
    ctx.fillRect(210, 140, 120, 90);
    ctx.fillStyle = "#9fd3f0";
    ctx.fillRect(216, 146, 108, 78);
    for (const gardinX of [200, 310]) {
        for (let x = 0; x < 30; x += 10) {
            for (let y = 0; y < 100; y += 10) {
                ctx.fillStyle = (x + y) % 20 === 0 ? "#d63c3c" : "#fff";
                ctx.fillRect(gardinX + x, 135 + y, 10, 10);
            }
        }
    }

    // Hylla med kaffekoppar
    ctx.fillStyle = "#8a5a2b";
    ctx.fillRect(400, 190, 170, 8);
    const koppFarger = ["#5b8fc9", "#d63c3c", "#fff", "#3f8f3f", "#d4a017"];
    for (let i = 0; i < koppFarger.length; i++) {
        ctx.fillStyle = koppFarger[i];
        ctx.fillRect(412 + i * 32, 172, 16, 18);
    }

    // Bänk där pajen står
    ctx.fillStyle = "#8fb8a0";
    ctx.fillRect(150, 300, 500, 56);
    ctx.fillStyle = "#d9d2c5";
    ctx.fillRect(150, 296, 500, 12);
    ctx.fillStyle = "#5e8a72";
    for (let x = 150; x < 650; x += 70) {
        ctx.fillRect(x, 308, 2, 48);
        ctx.fillRect(x + 30, 326, 10, 4);
    }

    // Spis
    ctx.fillStyle = "#e8e8e8";
    ctx.fillRect(540, 296, 90, 60);
    ctx.fillStyle = "#333";
    ctx.fillRect(550, 300, 28, 8);
    ctx.fillRect(592, 300, 28, 8);
    ctx.fillRect(555, 318, 70, 30);
}

function ritaKaffe() {
    ritaPixlar(kaffePixlar, kaffeFarger, kaffe.x, kaffe.y, 3, false);
    ctx.fillStyle = "#3a2a10";
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("Sikaels kaffe", kaffe.x, kaffe.y - 20);
}

function drawFarmorRoom() {
    ctx.save();
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    ritaVardagsrum();
    ritaPixlar(farmorSitterPixlar, farmorFarger, rooms[2].npcX, rooms[2].npcY, farmorPixelRum, false);
    ritaBarn(playerX, playerY, currentDirection);
    ctx.fillStyle = "#000";
    ctx.fillRect(12, 10, 200, 30);
    ctx.fillStyle = "#fff";
    ctx.font = "18px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("Hälsa: " + playerHP + "/" + maxHP, 20, 32);
    ctx.restore();
}

function drawKitchen() {
    ctx.save();
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    ritaKok();
    if (!pie.collected) drawCharacter(pie.x, pie.y, 48, pieImage);
    if (!kaffe.collected) ritaKaffe();
    ritaBarn(playerX, playerY, currentDirection);
    ritaMeddelande();
    ctx.restore();
}

function ritaMeddelande() {
    if (pickupMessageTime <= 0) return;
    ctx.save();
    ctx.fillStyle = "#000";
    ctx.fillRect(100, 30, 600, 55);
    ctx.fillStyle = "#fff";
    ctx.font = "22px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(pickupMessage, 400, 58);
    ctx.restore();
}

function ritaKorridor() {
    ctx.save();
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    ctx.translate(canvas.width / 2 - playerX, canvas.height / 2 - playerY);

    // Väggar runt golvet
    ctx.fillStyle = "#6b4423";
    ctx.fillRect(korridorHoger.x, korridorHoger.y - 12, korridorHoger.bredd + 12, korridorHoger.hojd + 24);
    ctx.fillRect(korridorUpp.x - 12, korridorUpp.y - 90, korridorUpp.bredd + 24, korridorUpp.hojd + 102);
    // Tapet ovanför golvet, med tavlor
    ctx.fillStyle = "#c9b48a";
    ctx.fillRect(korridorHoger.x, korridorHoger.y - 80, korridorUpp.x - korridorHoger.x - 12, 68);
    ctx.fillRect(korridorUpp.x, korridorUpp.y - 90, korridorUpp.bredd, 90);
    const tavelFarger = ["#5b8fc9", "#3f8f3f", "#d77a8a"];
    for (let i = 0; i < tavelFarger.length; i++) {
        ctx.fillStyle = "#d4a017";
        ctx.fillRect(200 + i * 380, 300, 60, 46);
        ctx.fillStyle = tavelFarger[i];
        ctx.fillRect(206 + i * 380, 306, 48, 34);
    }

    ritaTragolv(korridorHoger.x, korridorHoger.y, korridorHoger.bredd, korridorHoger.hojd);
    ritaTragolv(korridorUpp.x, korridorUpp.y, korridorUpp.bredd, korridorUpp.hojd);

    // Dörren till Sikaels kontor
    ctx.fillStyle = "#5a3a1e";
    ctx.fillRect(korridorUpp.x + 30, korridorUpp.y - 80, 80, 80);
    ctx.fillStyle = "#d4a017";
    ctx.fillRect(korridorUpp.x + 94, korridorUpp.y - 42, 8, 8);
    ctx.fillStyle = "#fff";
    ctx.fillRect(korridorUpp.x + 40, korridorUpp.y - 70, 60, 18);
    ctx.fillStyle = "#000";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SIKAEL", korridorUpp.x + 70, korridorUpp.y - 61);

    ritaBarn(playerX, playerY, currentDirection);
    ctx.restore();
    ritaMeddelande();
}

// Kontoret uppifrån. Sikael sitter halvt bakom skrivbordet tills striden börjar.
function ritaKontor() {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Vägg med whiteboard
    ctx.fillStyle = "#d8e2ea";
    ctx.fillRect(50, 40, 700, 110);
    ctx.fillStyle = "#fff";
    ctx.fillRect(520, 55, 160, 80);
    ctx.fillStyle = "#5b8fc9";
    ctx.fillRect(535, 75, 80, 4);
    ctx.fillRect(535, 95, 120, 4);
    ctx.fillRect(535, 115, 60, 4);

    // Grå heltäckningsmatta och dörröppning nedåt
    ctx.fillStyle = "#8a8f98";
    ctx.fillRect(50, 150, 700, 440);
    ctx.fillRect(360, 580, 80, 20);
    ctx.fillStyle = "#6b4423";
    ctx.fillRect(50, 146, 700, 6);

    // Krukväxt i hörnet
    ctx.fillStyle = "#c0623a";
    ctx.fillRect(90, 190, 40, 40);
    ctx.fillStyle = "#3f8f3f";
    ctx.fillRect(78, 160, 64, 40);

    drawCharacter(400, 195, 130, sikaelImage);

    // Skrivbord med datorn vriden mot Sikael
    ctx.fillStyle = "#7a5230";
    ctx.fillRect(280, 215, 240, 22);
    ctx.fillStyle = "#8a6038";
    ctx.fillRect(285, 237, 230, 48);
    ctx.fillStyle = "#333";
    ctx.fillRect(440, 196, 60, 24);
    ctx.fillStyle = "#fff";
    ctx.fillRect(360, 250, 80, 20);
    ctx.fillStyle = "#000";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SIKAEL", 400, 260);

    ritaBarn(playerX, playerY, currentDirection);
    ctx.restore();
}

function drawBossStatus(y) {
    ctx.save();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 24px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("CHAR", 40, y);
    ctx.fillText("HÄLSA", 205, y);
    ctx.fillStyle = "#b82020";
    ctx.fillRect(295, y - 12, 180, 24);
    ctx.fillStyle = "#ffff00";
    ctx.fillRect(295, y - 12, 180 * Math.max(0, Math.min(1, playerHP / maxHP)), 24);
    ctx.fillStyle = "#fff";
    ctx.fillText(playerHP + " / " + maxHP, 500, y);
    ctx.restore();
}

function drawBossMenu() {
    ctx.save();
    const buttons = battleButtons;
    ctx.lineWidth = 3;
    ctx.font = "bold 20px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    for (let i = 0; i < buttons.length; i++) {
        const x = 30 + i * 195;
        const color = i === selectedButton ? "#ffff00" : "#ff8c20";
        ctx.strokeStyle = color;
        ctx.strokeRect(x, 530, 155, 48);
        ctx.fillStyle = color;
        ctx.fillText(buttons[i], x + 36, 554);
        if (i === selectedButton) {
            drawCharacter(x + 19, 554, 20, heartImage);
        }
    }
    ctx.restore();
}

function drawBossItems() {
    ctx.save();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.strokeRect(100, 330, 600, 130);
    ctx.textAlign = "left";
    ctx.font = "22px monospace";
    if (pieCount > 0) {
        drawCharacter(130, 365, 20, heartImage);
        ctx.fillStyle = "#ffff00";
        ctx.fillText("Pumpapaj × " + pieCount, 155, 373);
        ctx.fillStyle = "#fff";
        ctx.font = "18px Arial";
        ctx.fillText("Återställer till " + maxHP + " hälsa", 155, 405);
    } else {
        ctx.fillStyle = "#fff";
        ctx.fillText("Du har inga pajer", 130, 385);
    }
    ctx.fillStyle = "#fff";
    ctx.font = "16px Arial";
    ctx.fillText(pieCount > 0 ? "Z: ät en paj   X: tillbaka" : "X: tillbaka", 130, 440);
    ctx.restore();
}

function drawBossHazard(hazard) {
    ctx.save();
    if (hazard.type === "spark") {
        const radius = hazard.width / 2;
        const x = hazard.x + radius;
        const y = hazard.y + radius;
        if (hazard.age < hazard.warning) ctx.globalAlpha = 0.45;
        ctx.fillStyle = "#ff9d38";
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff1bd";
        ctx.beginPath();
        ctx.moveTo(x, y - radius + 2);
        ctx.lineTo(x + 3, y - 1);
        ctx.lineTo(x + 1, y + 1);
        ctx.lineTo(x, y + radius - 2);
        ctx.lineTo(x - 3, y + 1);
        ctx.lineTo(x - 1, y - 1);
        ctx.closePath();
        ctx.fill();
    } else if (hazard.type === "color-sweep") {
        const active = hazard.age >= hazard.warning;
        const width = bossArena.right - bossArena.left;
        const height = bossArena.bottom - bossArena.top;
        ctx.fillStyle = bossSweep[hazard.color];
        ctx.globalAlpha = active ? 0.48 : 0.16;
        ctx.fillRect(bossArena.left, bossArena.top, width, height);
        ctx.globalAlpha = 1;
        ctx.fillRect(bossArena.left, bossArena.top, width, 3);
    } else if (hazard.type === "stab") {
        const sideways = hazard.direction === "left" || hazard.direction === "right";
        const width = sideways ? hazard.maxHeight : bossArena.right - bossArena.left;
        const height = sideways ? bossArena.bottom - bossArena.top : hazard.maxHeight;
        if (hazard.age < hazard.warning) {
            ctx.fillStyle = Math.floor(hazard.age * 20) % 2 === 0 ? "#f22" : "#7f1616";
            ctx.fillRect(hazard.direction === "right" ? bossArena.right - width : bossArena.left,
                hazard.direction === "down" ? bossArena.bottom - height : bossArena.top, width, height);
        } else if (sideways && hazard.width > 0) {
            for (let y = hazard.y; y < hazard.y + hazard.height; y += 16) {
                drawBossHazard({ type: "bone", x: hazard.x, y, width: hazard.width,
                    height: 14, horizontal: true });
            }
        } else if (hazard.height > 0) {
            for (let x = hazard.x; x < hazard.x + hazard.width; x += 16) {
                drawBossHazard({ type: "bone", x, y: hazard.y, width: 14, height: hazard.height });
            }
        }
    } else if (hazard.type === "floor" || hazard.type === "bone-bed") {
        if (hazard.age < hazard.warning) {
            ctx.fillStyle = Math.floor(hazard.age * 20) % 2 === 0 ? "#f22" : "#7f1616";
            ctx.fillRect(hazard.x, bossArena.bottom - hazard.maxHeight, hazard.width, hazard.maxHeight);
        } else if (hazard.height > 0) {
            for (let x = hazard.x; x < hazard.x + hazard.width; x += 16) {
                drawBossHazard({ type: "bone", x, y: hazard.y, width: 14, height: hazard.height });
            }
        }
    } else if (hazard.type === "cannon") {
        const firingEnd = hazard.warning + bossLaser.firing;
        if (hazard.age < hazard.warning || hazard.age >= firingEnd) {
            ctx.restore();
            return;
        }
        ctx.translate(hazard.x, hazard.y);
        ctx.rotate(hazard.angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(1200, 0);
        if (hazard.powered) {
            ctx.strokeStyle = "rgba(80, 207, 255, 0.24)";
            ctx.lineWidth = hazard.beamWidth + 34;
            ctx.stroke();
        }
        ctx.strokeStyle = hazard.powered ? "#a5f5ff" : "#80eaff";
        ctx.lineWidth = hazard.beamWidth + (hazard.powered ? 12 : 6);
        ctx.stroke();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = hazard.beamWidth;
        ctx.stroke();
    } else if (hazard.horizontal) {
        ctx.translate(hazard.x + hazard.width, hazard.y);
        ctx.rotate(Math.PI / 2);
        drawBossHazard({ type: hazard.type, x: 0, y: 0, width: hazard.height, height: hazard.width });
    } else {
        ctx.fillStyle = hazard.type === "blue-bone" ? "#42dfff" : "#fff";
        ctx.fillRect(hazard.x, hazard.y, hazard.width, hazard.height);
    }
    ctx.restore();
}

function drawBossCannon(hazard) {
    ctx.save();
    ctx.translate(hazard.x, hazard.y);
    ctx.rotate(hazard.angle);
    const scale = Math.min(1, hazard.age / 0.18) * (hazard.powered ? 1.65 : 1);
    ctx.scale(scale, scale);
    const firingEnd = hazard.warning + bossLaser.firing;
    if (hazard.age > firingEnd) {
        ctx.globalAlpha = Math.max(0, 1 - (hazard.age - firingEnd) / bossLaser.fade);
    }
    ctx.fillStyle = "#858e9a";
    ctx.fillRect(-31, 12, 9, 14);
    ctx.fillRect(-41, 26, 31, 5);

    ctx.fillStyle = "#606a78";
    ctx.beginPath();
    ctx.moveTo(-44, -15);
    ctx.lineTo(-8, -23);
    ctx.lineTo(-8, 23);
    ctx.lineTo(-44, 15);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#343b45";
    for (let x = -37; x <= -22; x += 5) ctx.fillRect(x, -6, 2, 12);

    // Den smala skärmytan ligger på framsidan, vid strålens startpunkt.
    ctx.fillStyle = "#bfc5cd";
    ctx.beginPath();
    ctx.moveTo(-8, -23);
    ctx.lineTo(8, -17);
    ctx.lineTo(8, 17);
    ctx.lineTo(-8, 23);
    ctx.closePath();
    ctx.fill();
    const firing = hazard.age >= hazard.warning && hazard.age < firingEnd;
    ctx.fillStyle = hazard.age < hazard.warning ? "#42dfff" : "#ffea00";
    ctx.beginPath();
    ctx.moveTo(-5, -17);
    ctx.lineTo(5, -13);
    ctx.lineTo(5, 13);
    ctx.lineTo(-5, 17);
    ctx.closePath();
    ctx.fill();
    if (firing) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, -Math.min(7, hazard.beamWidth / 2), 8, Math.min(14, hazard.beamWidth));
    }
    ctx.restore();
}

function drawBoss() {
    ctx.save();
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textBaseline = "alphabetic";
    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    ctx.fillStyle = "#fff";
    drawBossStatus(492);
    ctx.font = "16px monospace";
    ctx.fillText("Pajer: " + pieCount, 30, 70);
    ctx.textAlign = "center";
    if (gameState === "boss-dying" || gameState === "boss-won") {
        drawBossDeath();
        if (gameState === "boss-won") {
            ctx.font = "20px Arial";
            ctx.fillText("Z: försök igen med samma hälsa och pajer som vid starten", 400, 450);
        }
        ctx.restore();
        return;
    }
    if (gameState === "boss-farewell") {
        ritaSikaelSomFaller(boss.kneelTimer / sikaelKnaTid);
    } else {
        drawSikael(false);
    }
    ctx.fillStyle = "#fff";
    ctx.fillText("SIKAEL  HÄLSA " + boss.hp + "/" + boss.maxHP, 400, 265);
    if (boss.determination) {
        ctx.fillStyle = "#ff3838";
        ctx.fillText("DETERMINATION", 400, 35);
        ctx.fillStyle = "#fff";
    }
    ctx.font = "18px Arial";
    if (gameState !== "boss-defend") ctx.fillText(boss.message, 400, 305);

    if (gameState === "boss-intro") {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.strokeRect(100, 350, 600, 100);
        ctx.fillText("Z: starta striden – Sikael attackerar först!", 400, 410);
    } else if (gameState === "boss-farewell") {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.strokeRect(100, 350, 600, 100);
        if (boss.kneelTimer >= sikaelKnaTid) {
            ctx.fillText(boss.farewellLine < bossFarewellLines.length - 1 ? "Z: nästa" : "Z: fortsätt", 400, 410);
        }
    } else if (gameState === "boss-lunch") {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.strokeRect(100, 350, 600, 100);
        ctx.fillText(boss.lunchLine < bossLunchLines.length - 1 ? "Z: nästa" : "Z: fortsätt striden", 400, 410);
    } else if (gameState === "boss-menu") {
        drawBossMenu();
    } else if (gameState === "boss-items") {
        drawBossItems();
    } else if (gameState === "boss-slider") {
        drawAttackBar();
    } else if (gameState === "boss-defend") {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 3;
        ctx.strokeRect(bossArena.left - 2, bossArena.top - 2,
            bossArena.right - bossArena.left + 4, bossArena.bottom - bossArena.top + 4);
        ctx.save();
        ctx.beginPath();
        ctx.rect(bossArena.left, bossArena.top, bossArena.right - bossArena.left, bossArena.bottom - bossArena.top);
        ctx.clip();
        for (const hazard of boss.projectiles) drawBossHazard(hazard);
        ctx.fillStyle = "#35ec72";
        for (const platform of boss.platforms) ctx.fillRect(platform.x, platform.y, platform.width, 6);
        ctx.save();
        if (boss.invincibleTime > 0) ctx.globalAlpha = 0.55;
        if (boss.heartMode === "blue") ctx.filter = "hue-rotate(240deg)";
        drawCharacter(heartX, heartY, bossHeartSize * 2, heartImage);
        ctx.restore();
        ctx.restore();
        for (const hazard of boss.projectiles) {
            if (hazard.type === "cannon") drawBossCannon(hazard);
        }
        ctx.fillStyle = "#fff";
        const pattern = getBossPattern();
        const sweep = boss.projectiles.find(hazard => hazard.type === "color-sweep");
        const jumpArrows = { down: "↑", up: "↓", left: "→", right: "←" };
        const controls = pattern.platforms ? "← →: gå  ↑: hoppa mellan plattformarna"
            : boss.heartMode === "blue"
                ? "Pilar: gå  " + jumpArrows[boss.gravityDirection] + ": hoppa bort från väggen"
                : "Pilar: flytta hjärtat";
        ctx.fillText(pattern.name + " – " + Math.max(0, Math.ceil(pattern.duration - boss.timer)), 400, 552);
        ctx.font = "16px Arial";
        if (sweep) {
            ctx.fillStyle = bossSweep[sweep.color];
            ctx.fillText(sweep.color === "blue" ? "BLÅTT SVEP: stå still!" : "ORANGE SVEP: rör dig!", 400, 585);
        } else {
            ctx.fillText(controls, 400, 585);
        }
    } else {
        ctx.fillStyle = "#fff";
        ctx.font = "32px Arial";
        ctx.fillText("Du förlorade!", 400, 400);
        ctx.font = "20px Arial";
        ctx.fillText("Z: försök igen med samma hälsa och pajer som vid starten", 400, 450);
    }
    ctx.restore();
}

function drawBossDeath() {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    for (const particle of bossDeath.particles) {
        const age = bossDeath.timer - particle.start;
        if (age >= particle.lifetime) continue;
        ctx.globalAlpha = age < 0 ? 1 : 1 - age / particle.lifetime;
        const x = 305 + particle.x + (age < 0 ? 0 : particle.vx * age);
        const y = 50 + particle.y + (age < 0 ? 0 : particle.vy * age);
        ctx.drawImage(age < 0 ? bossDeath.portrait : bossDeath.dust,
            particle.x, particle.y, 5, 5, x, y, 5, 5);
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
        ritaPixlar(farmorPixlar, farmorFarger, 400, 110, farmorPixelRaddning, false);
    } else {
        ritaFlowie(400, 110, faceIndex, flowiePixelStrid);
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
    ctx.fillText("Hälsa: " + playerHP + "/" + maxHP, 20, 30);
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
