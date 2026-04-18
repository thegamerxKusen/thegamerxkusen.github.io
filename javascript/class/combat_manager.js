class CombatManager{
    constructor(player,enemy,death_match){
        this.player=player
        this.enemy=enemy
        this.log = []
        this.death_match = death_match || false
    }

    refreshFightScreen(){
        const fight_screen = document.querySelector("#fighting-screen")
        fight_screen.innerHTML=
        `
        <div id="fight-top-half">
            <div id="fight-player-info" class="info">
                <h2>${this.player.name}</h2>
                <div id="health-info-player">
                    <p class="info-text">${this.player.health}/${this.player.max_health}</p><progress id="health-player" max="${this.player.max_health}" value="${this.player.health}"></progress>
                </div>
                <div id="energy-info-player" class="hide">
                    <p class="info-text">${this.player.internal_energy}/${this.player.max_internal_energy}</p><progress id="internal-energy-player" max="${this.player.max_internal_energy}" value="${this.player.internal_energy}"></progress>
                </div>
            </div>
            <div id="enemy-info" class="info">
                <h2>${this.enemy.name}</h2>
                <div id="health-info-enemy">
                    <p class="info-text">${this.enemy.health}/${this.enemy.max_health}</p><progress id="health-enemy" max="${this.enemy.max_health}" value="${this.enemy.health}"></progress>
                </div>
                <div id="energy-info-enemy" class="hide">
                    <p class="info-text">${this.enemy.internal_energy}/${this.enemy.max_internal_energy}</p><progress id="internal-energy-enemy" max="${this.enemy.max_internal_energy}" value="${this.enemy.internal_energy}"></progress>
                </div>
                <p>${this.enemy.realm.name}</p>
            </div>
        </div>
        <div id="fight-lower-half">
            <div id="fight-main-buttons">
                <button id="atk-btn" onclick="fight_attack()">Attack</button>
                <button id="evade-btn" onclick="">Evade</button>
                <button id="breath-btn" onclick="">Breath</button>
                <button id="items-btn" onclick="fight_items()">Items</button>
                <button id="flee-btn" onclick="">Flee//not implanted</button>
            </div>
            <div id="fight-attack-menue" class="hide">
            </div>
            <div id="fight-items-menue" class="hide">
                <p>Not implemented</p>
                <button onclick="fight_main()">Back</button>
            </div>            
        </div>
        `
        document.querySelector("#flee-btn").addEventListener("click",()=>this.endFight())

        const attack_menue = document.querySelector("#fight-attack-menue")
        for (const skill of this.player.equipped_skills) {
            const skill_button = document.createElement("button")
            skill_button.id="player-skill"
            skill_button.innerHTML=skill.name
            skill_button.addEventListener("click",()=>{
                if(this.player.internal_energy>=skill.basic_cost){
                    this.executeTurn(skill,false)
                    this.player.reduceEnergy(skill.basic_cost)
                }else{
                    sendConsoleMessage("Not enough internal energy to use this skill!")
                    //todo grey the skill out
                }
                
            })
            attack_menue.appendChild(skill_button)
        }
        const back = document.createElement("button")
        back.innerHTML="Back"
        back.addEventListener("click",()=>{
            fight_main()
        })
        attack_menue.appendChild(back)

        const basic_atk = document.createElement("button")
        basic_atk.innerHTML="Basic Attack"
        basic_atk.addEventListener("click",()=>{
            this.executeTurn(null, false)//todo implement basic attack corresponding to weapon type
        })
        attack_menue.appendChild(basic_atk)
        if(this.player.max_internal_energy>0){document.querySelector("#energy-info-player").classList.remove("hide")}
    }

    playerDeath(){
        sendConsoleMessage(`You died, ${this.enemy.name} won.`)
        setTimeout(() => {
            this.endFight()
        }, "4000")
        
    }
    enemyDeath(){
        sendConsoleMessage(`${this.enemy.name} died, you won.`)
        this.endFight()
        setTimeout(() => {
            this.endFight()
        }, "4000")
    }

    // Main Turn Function
    executeTurn(player_skill, isEvading = false) {
        const pSkill = player_skill
        const eSkill = this.enemy.getRandomEnemySkill()

        // 1. Check if Evading
        if (isEvading) {
            return this.handleEvade()
        }

        //Speed
        let pTotalSpeed = this.player.speed_stat + pSkill.basic_speed
        let eTotalSpeed = this.enemy.speed_stat + eSkill.basic_speed

        let pDamage
        let eDamage

        if(pSkill.spe_atk){
            pDamage = (this.player.spe_atk + pSkill.basic_damage)
            pDamage = Math.max(1,Math.floor(Math.max(0, pDamage - this.enemy.spe_def)))
        }else{
            pDamage = (this.player.atk_stat + pSkill.basic_damage)
            pDamage = Math.max(1,Math.floor(Math.max(0, pDamage - this.enemy.def_stat)))
        }
        
        if(eSkill.spe_atk){
            eDamage = (this.enemy.spe_atk + eSkill.basic_damage)
            eDamage = Math.max(1,Math.floor(Math.max(0, eDamage - this.player.spe_def)))
        }else{
            eDamage = (this.enemy.atk_stat + eSkill.basic_damage)
            eDamage = Math.max(1,Math.floor(Math.max(0, eDamage - this.player.def_stat)))
        }

        

        if(pTotalSpeed>=eTotalSpeed){//player goes first
            this.enemy.health -= pDamage
            sendConsoleMessage(`You used ${pSkill.name} and dealt ${pDamage} damage.`)
            if(this.enemy.health<=0){
                this.enemyDeath()
                return
            }
            setTimeout(() => {
                this.player._health -= eDamage
                sendConsoleMessage(`${this.enemy.name} used ${eSkill.name} and dealt ${eDamage} damage.`)
            }, "2000") 
            if(this.player.health<=0){
                this.playerDeath()
                return
            }
            
        }else{//enemy goes first
            this.player._health -= eDamage
            sendConsoleMessage(`${this.enemy.name} used ${eSkill.name} and dealt ${eDamage} damage.`)
            if(this.player.health<=0){
                this.playerDeath()
                return
            }
            setTimeout(() => {
                this.enemy.health -= pDamage
                sendConsoleMessage(`You used ${pSkill.name} and dealt ${pDamage} damage.`)
            }, "2000") 
            
            if(this.enemy.health<=0){
                this.enemyDeath()
            }
        }
        

        this.refreshFightScreen()
    }

    handleEvade() {
        const footwork = this.player.equipped_footwork
        let dodgeChance = (this.player.speed_stat + footwork.dodge_bonus) / 100
        
        if (Math.random() < dodgeChance) {
            sendConsoleMessage("You moved like a ghost! Attack evaded.")
            // Player takes 0 damage, Enemy still loses stamina for missing
        } else {
            sendConsoleMessage("Footwork failed! You caught the full blow.")
            // Take extra damage or normal damage
        }
    }
    start_fight(){
        this.refreshFightScreen()
        open_fight_tab()
    }


    endFight(){
        const fight_screen = document.querySelector("#fighting-screen")
        hide(fight_screen)
            open_world_tab() 
    }

}

// in a fight a player or enemy got 6 choices: 4 chosen skill, breathing tech to get qi, so waiting a turn mostly and evading