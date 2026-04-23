class AudioManager {
    constructor() {
        // --- 1. Background Music Setup ---
        // Replace with the actual paths to your audio files!
        this.calm_bgm = new Audio("assets/sounds/music/Lotus Pond - Loop.wav")
        this.fight_bgm = new Audio("assets/sounds/music/Dragon Dance - Loop.wav")
        this.bgm.loop = true // Makes it loop forever
        this.bgm.volume = 0.1 // Keep BGM volume low so it doesn't drown out SFX (0.0 to 1.0)

        // --- 2. Preload Sound Effects ---
        // Preloading them ensures there is no delay when you try to play them in combat
        this.sfx = {
            //Ex: click: new Audio("assets/sounds/ui_click.wav"),
        };

        // Set specific volumes for SFX if needed
    }

    // --- Play Background Music ---
    playCalmBGM(){
        this.stopFightBGM()
        // The .catch() prevents the game from crashing if the browser blocks autoplay
        this.calm_bgm.play().catch(error => {
            console.log("Browser blocked autoplay. Waiting for user interaction.");
        });
    }
    playFightBGM(){
        this.stopCalmBGM()
        // The .catch() prevents the game from crashing if the browser blocks autoplay
        this.calm_bgm.play().catch(error => {
            console.log("Browser blocked autoplay. Waiting for user interaction.");
        });
    }

    stopCalmBGM() {
        this.calm_bgm.pause();
        this.calm_bgm.currentTime = 0; // Rewind to the start
    }

    stopFightBGM() {
        this.calm_bgm.pause();
        this.calm_bgm.currentTime = 0; // Rewind to the start
    }

    // --- Play Sound Effect ---
    playSFX(soundName) {
        if (this.sfx[soundName]) {
            // THE SECRET TRICK: 
            // If you click a button 3 times fast, standard play() ignores clicks 2 and 3 because it's already playing.
            // Resetting currentTime to 0 forces it to restart instantly so it feels responsive!
            this.sfx[soundName].currentTime = 0; 
            this.sfx[soundName].play();
        } else {
            console.warn(`Sound effect '${soundName}' not found!`);
        }
    }
}

// Instantiate it globally so all your files can use it!
const gameAudio = new AudioManager();