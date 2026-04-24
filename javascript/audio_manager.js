class AudioManager {
    constructor() {
       
        this.calm_bgm = new Audio("assets/sounds/music/Lotus Pond - Loop.wav")
        
        this.calm_bgm.loop = true 
        this.calm_bgm.volume = 0.1 //between 0.0 and 1.0

        this.fight_bgm = new Audio("assets/sounds/music/Dragon Dance - Loop.wav")
        this.fight_bgm.loop = true 
        this.fight_bgm.volume = 0.1
        
        this.sfx = {
            //Ex: click: new Audio("assets/sounds/ui_click.wav"),
        };

        
    }

    playCalmBGM(){
        this.stopFightBGM()
        this.calm_bgm.play().catch(error => {
            console.log("Browser blocked autoplay. Waiting for user interaction.");
        });
    }
    playFightBGM(){
        this.stopCalmBGM()
        this.fight_bgm.play().catch(error => {
            console.log("Browser blocked autoplay. Waiting for user interaction.");
        });
    }

    stopCalmBGM() {
        this.calm_bgm.pause();
    }

    stopFightBGM() {
        this.calm_bgm.pause();
        
    }

    // --- Play Sound Effect ---
    playSFX(soundName) {
        if (this.sfx[soundName]) {
            this.sfx[soundName].currentTime = 0; 
            this.sfx[soundName].play();
        } else {
            console.warn(`Sound effect '${soundName}' not found!`);
        }
    }
}


const gameAudio = new AudioManager();