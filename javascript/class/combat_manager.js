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
                <div id="status-effect-player"></div>
            </div>
            <div id="enemy-info" class="info">
                <h2>${this.enemy.name}</h2>
                <div id="health-info-enemy">
                    <p class="info-text">${this.enemy.health}/${this.enemy.max_health}</p><progress id="health-enemy" max="${this.enemy.max_health}" value="${this.enemy.health}"></progress>
                </div>
                <div id="energy-info-enemy" class="hide">
                    <p class="info-text">${this.enemy.internal_energy}/${this.enemy.max_internal_energy}</p><progress id="internal-energy-enemy" max="${this.enemy.max_internal_energy}" value="${this.enemy.internal_energy}"></progress>
                </div>
                <div id="status-effect-enemy"></div>
                <p>${this.enemy.realm.name}</p>
            </div>
        </div>
        <div id="fight-lower-half">
            <div id="fight-main-buttons">
                <button id="atk-btn" onclick="fight_attack()">Attack</button>
                <button id="evade-btn" onclick="">Evade</button>
                <button id="breath-btn" onclick="">Breath</button>
                <button id="items-btn" onclick="fight_items()">Items</button>
                <button id="flee-btn" onclick="">Flee</button>
            </div>
            <div id="fight-attack-menue" class="hide">
            </div>
            <div id="fight-items-menue" class="hide">
                <div id="fight-inventory"></div>
                <div id="fight-item-details"></div>
                <button onclick="fight_main()">Back</button>
            </div>            
        </div>
        `
        this.open_fight_inventory()
        document.querySelector("#flee-btn").addEventListener("click",()=>this.flee())
        document.querySelector("#breath-btn").addEventListener("click",()=>{
            if(!this.player.equipped_breathing_technique){return sendConsoleMessage("You have no breathing technique!")}else{executeTurnWithBreath()}
        })
        const evade_btn = document.querySelector("#evade-btn")
        evade_btn.addEventListener("click",()=>{
            if(!this.player.equipped_footwork){return sendConsoleMessage("You have no footwork technique!")}
            if(this.player.internal_energy>=footwork_tech_db.basic_evade.activeCost){
                this.executeTurnWithEvade()
            }else{
                sendConsoleMessage("Not enough internal energy to use this technique!")
            }
        })

        const player_effects = document.querySelector("#status-effect-player")
        const enemy_effects = document.querySelector("#status-effect-enemy")
        for (const effect of this.player.status_effects) {
            const effect_div = document.createElement("div")
            effect_div.innerHTML = effect.adj.charAt(0).toUpperCase() + effect.adj.slice(1) + " : " + effect.duration
            player_effects.appendChild(effect_div)
        }
        for (const effect of this.enemy.status_effects) {
            const effect_div = document.createElement("div")
            effect_div.innerHTML = effect.adj.charAt(0).toUpperCase() + effect.adj.slice(1) + " : " + effect.duration
            enemy_effects.appendChild(effect_div)
        }
        
        const attack_menue = document.querySelector("#fight-attack-menue")
        for (const skill of this.player.equipped_skills) {
            const skill_button = document.createElement("button")
            skill_button.id="player-skill"
            skill_button.innerHTML=skill.name
            skill_button.addEventListener("click",()=>{
                if(skill.spe_atk && this.player.internal_energy<skill.basic_cost){
                    return sendConsoleMessage("Not enough internal energy to use this skill!")
                }else if(!skill.spe_atk && this.player.stamina<skill.basic_cost){
                    return sendConsoleMessage("Not enough stamina to use this skill!")
                }
                this.executeTurn(skill,false)
            })
            addToolTip(attack_menue, skill.description)
            attack_menue.appendChild(skill_button)
        }
        const back = document.createElement("button")
        back.innerHTML="Back"
        back.addEventListener("click",()=>{
            fight_main()
        })
        
        const weapon_type = this.player.get_weapon_type()
        const basic_atk = document.createElement("button")
        basic_atk.innerHTML=weapon_type.basic_skill.name
        basic_atk.addEventListener("click",()=>{
            this.executeTurn(weapon_type.basic_skill, false)//todo implement basic attack corresponding to weapon type
            
        })
        console.log(weapon_type)
        addToolTip(attack_menue, weapon_type.basic_skill.description)
        attack_menue.appendChild(basic_atk)
        attack_menue.appendChild(back)
        if(this.player.max_internal_energy>0){document.querySelector("#energy-info-player").classList.remove("hide")}
    }

    //set reward and punishment system
    playerDeath(){
        if(this.death_match){sendConsoleMessage(`You died, ${this.enemy.name} won.`)}
        else{this.player.health=1;sendConsoleMessage(`You lost and are at death's door.`)}
        this.endFight()
        if(this.death_match){open_main_menue()}
        
    }
    enemyDeath(){
        if(this.death_match){sendConsoleMessage(`You killed ${this.enemy.name}! You won.`)}
        else{sendConsoleMessage(`You defeated ${this.enemy.name}!`)}

        this.player.processEvent("KILL",this.enemy)
        this.endFight()            
    }

    // Main Turn Function
    executeTurn(player_skill, isEvading = false) {
        const pSkill = player_skill
        const eSkill = this.enemy.getRandomEnemySkill()
        if(this.player.isStunned()){
            this.executeTurnEnemyOnly()
            return
        }
        if(this.enemy.isStunned()){
            this.executeTurnPlayerOnly()
            return
        }
        //status effects
        this.player.effectTurn()
        if(this.checkDeath()){return}
        this.enemy.effectTurn()
        if(this.checkDeath()){return}

        //Speed
        let pTotalSpeed = this.player.speed_stat + pSkill.basic_speed + (this.player.get_weapon_type().reach || 1) + (this.player.equipped_footwork ? this.player.equipped_footwork.passiveSpeed : 0)
        let eTotalSpeed = this.enemy.speed_stat + eSkill.basic_speed + (this.enemy.get_weapon_type().reach || 1) + (this.enemy.equipped_footwork ? this.enemy.equipped_footwork.passiveSpeed : 0)

        //player goes first
        if(pTotalSpeed>=eTotalSpeed){
            pSkill.use(this.player,this.enemy)

            if(this.checkDeath()){return}
            setTimeout(() => {
                eSkill.use(this.enemy,this.player)
            }, "2000") 
            if(this.checkDeath()){return}
        }
        //enemy goes first
        else{
            eSkill.use(this.enemy,this.player)
            if(this.checkDeath()){return}
            setTimeout(() => {
                pSkill.use(this.player,this.enemy)
            }, "2000") 
            
            if(this.checkDeath()){return}
        }
        if(this.checkDeath()){return}
        this.refreshFightScreen()
    }
    executeTurnEnemy(){
        const eSkill = this.enemy.getRandomEnemySkill()
        //status effects
        this.player.effectTurn()
        if(this.checkDeath()){return}
        this.enemy.effectTurn()
        if(this.checkDeath()){return}

        eSkill.use(this.enemy,this.player)
        if(this.checkDeath()){return}
    }
    executeTurnPlayer(){
        const pSkill = this.player.getRandomPlayerSkill()
        //status effects
        this.player.effectTurn()
        if(this.checkDeath()){return}
        this.enemy.effectTurn()
        if(this.checkDeath()){return}

        pSkill.use(this.player,this.enemy)
        if(this.checkDeath()){return}
    }
    executeTurnWithBreathingTech(){}
    executeTurnWithEvade(){
        const footwork = this.player.equipped_footwork
        const eSkill = this.enemy.getRandomEnemySkill()
        footwork.fightUse(this.player, this.enemy)
        let pTotalSpeed = this.player.speed_stat  + (this.player.equipped_footwork ? this.player.equipped_footwork.passiveSpeed : 2)
        let eTotalSpeed = this.enemy.speed_stat + eSkill.basic_speed + (this.enemy.get_weapon_type().reach || 1) + (this.enemy.equipped_footwork ? this.enemy.equipped_footwork.passiveSpeed : 0)

        const dodgeChance = this.calculateEvasionChance(eTotalSpeed,pTotalSpeed);
        fight_main()
        
        //status effects
        this.player.effectTurn()
        if(this.checkDeath()){return}
        this.enemy.effectTurn()
        // Random roll between 0 and 99
        if (Math.random() * 100 < dodgeChance) {
            gameAudio.playSFX("evade_success")
            sendConsoleMessage(`${this.enemy.name} used ${eSkill.name} but ${this.player.name} successfully evades the attack using ${footwork.name}!`)
             return; // Skip damage calculation!
        }else{
            sendConsoleMessage(`${this.player.name} failed to evade!`)
            if(this.checkDeath()){return}
            eSkill.use(this.enemy,this.player)
            if(this.checkDeath()){return}
        }
        
        
    }
    executeTurnWithBreath(){
        const breath = this.player.equipped_breathing_technique
        breath.fightUse(this.player, this.enemy)
        fight_main()
    
        const eSkill = this.enemy.getRandomEnemySkill()
        //status effects
        this.player.effectTurn()
        if(this.checkDeath()){return}
        this.enemy.effectTurn()
        // Random roll between 0 and 99
        if (Math.random() * 100 < dodgeChance) {
            sendConsoleMessage(`${this.enemy.name} used ${eSkill.name} but ${this.player.name} successfully evades the attack using ${footwork.name}!`)
             return; // Skip damage calculation!
        }
        sendConsoleMessage(`${this.player.name} failed to evade!`)
        if(this.checkDeath()){return}
        eSkill.use(this.enemy,this.player)
        if(this.checkDeath()){return}
        
    }


    checkDeath(){
        if(this.player.health<=0){
            this.playerDeath()
            return true
        }
        if(this.enemy.health<=0){
            this.enemyDeath()
            return true
        }
    }
    calculateEvasionChance(attackerSpeed, evaderSpeed) {
        const baseEvasion = 5; // 5% minimum chance to dodge
        const maxEvasion = 80; // Hard cap at 80% so combat doesn't stall forever
        const scalingFactor = 40; // How rewarding speed is. (Higher = easier to dodge)
        evaderSpeed += this.player.equipped_footwork ? this.player.equipped_footwork.passiveSpeed : 0
        // If the defender is slower or equal, they only get the base luck evasion
        if (evaderSpeed <= attackerSpeed) {
            return baseEvasion;
        }

        // Calculate how much faster the defender is as a decimal percentage
        // Example: Def=150, Att=100 -> (150 - 100) / 100 = 0.5 (50% faster)
        const speedAdvantageRatio = (evaderSpeed - attackerSpeed) / attackerSpeed;

        // Convert the ratio into an actual evasion bonus
        // Example: 0.5 * 40 = 20% bonus evasion
        const evasionBonus = speedAdvantageRatio * scalingFactor;

        // Add base and round down for a clean integer
        const totalEvasion = Math.floor(baseEvasion + evasionBonus);

        // Ensure it never goes above the max cap
        return Math.min(totalEvasion, maxEvasion);
    }
    start_fight(){
        gameAudio.playFightBGM()
        this.refreshFightScreen()
        open_fight_tab()
    }

    flee(){
        const eSkill = this.enemy.getRandomEnemySkill()
        const fleeChance = this.calculateEvasionChance(this.enemy.speed_stat +eSkill.basic_speed + (this.enemy.equipped_footwork ? this.enemy.equipped_footwork.passiveSpeed : 2), this.player.speed_stat  + (this.player.equipped_footwork ? this.player.equipped_footwork.passiveSpeed : 2));
        fight_main()
        // Random roll between 0 and 99
        if (Math.random() * 100 < fleeChance) {
            sendConsoleMessage(`${this.player.name} successfully flees from the fight!`)
            const fight_screen = document.querySelector("#fighting-screen")
            hide(fight_screen)
            open_world_tab()
            gameAudio.playCalmBGM()
            return
        }
        sendConsoleMessage(`${this.player.name} failed to flee from the fight!`)
        
        //status effects
        this.player.effectTurn()
        if(this.checkDeath()){return}
        this.enemy.effectTurn()
        if(this.checkDeath()){return}

        eSkill.use(this.enemy,this.player)
        if(this.checkDeath()){return}
    }

    endFight(){
        setTimeout(() => {
            const fight_screen = document.querySelector("#fighting-screen")
            hide(fight_screen)
            gameAudio.playCalmBGM()
            open_world_tab() 
        }, "4000")
        
    }

    open_fight_inventory(){
        const inv_selection = document.querySelector("#fight-items-menue")
        const detail_element = document.querySelector("#fight-item-details")
        const inventory = document.querySelector('#fight-inventory')
        inventory.innerHTML=""
        detail_element.innerHTML=""
        if(this.player._inventory.length===0){
            detail_element.innerHTML="<h2>Your inventory is empty</h2>"
            return
        }
        let i=0
        for (const item of this.player._inventory) {
            if(item instanceof FIGHT_ITEM){
            const item_div=document.createElement("div")
            
            item_div.innerHTML=
            `
            <p>${item.name}</p>
            `
            item_div.classList.add("item-div")
            item_div.addEventListener("click",()=>{
                //when you click on item
                detail_element.innerHTML=
                `
                <h2>${item.name}</h2>
                <h3 id="item-quanta">Quantity: ${item.quantity}</h3>
                <p>${item.desc}</p>
                
                `
                const use = document.createElement("button")
                use.innerHTML="Use"
                use.addEventListener("click",()=>{
                    item.useInCombat(this.player,this.enemy)
                    this.executeTurnEnemyOnly()
                    this.player.removeItem(item)
                    fight_main()
                    this.refreshFightScreen()

                })
                detail_element.appendChild(use)

            })
            inventory.appendChild(item_div)
        }
            i++
        
        }
    }
}

// in a fight a player or enemy got 6 choices: 4 chosen skill, breathing tech to get qi, so waiting a turn mostly and evading