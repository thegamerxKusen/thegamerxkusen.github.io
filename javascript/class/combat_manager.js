class CombatManager{
    constructor(player,enemy,death_match){
        this.player=player
        this.enemy=enemy
        this.log = []
        this.death_match = death_match || false
    }
    start_fight(){
        gameAudio.playFightBGM()
        this.createFightScreen()
        open_fight_tab()
    }
    endFight(){
        setTimeout(() => {
            const fight_screen = document.querySelector("#fighting-screen")
            hide(fight_screen)
            gameAudio.playCalmBGM()
            open_world_tab() 
        }, "4000")
        
    }

    createFightScreen(){
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
                <p>Weapon: ${this.player.weapon_type.name}</p>
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
                <p>Weapon: ${this.player.weapon_type.name}</p>
                <div id="status-effect-enemy"></div>
                <p>Realm: ${this.enemy.realm.name}</p>
            </div>
        </div>
        <div id="fight-lower-half">
            <div id="fight-main-buttons">
                <button id="atk-btn" onclick="">Attack</button>
                <button id="evade-btn" onclick="">Evade</button>
                <button id="breath-btn" onclick="">Breath</button>
                <button id="items-btn" onclick="">Items</button>
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
        document.querySelector("#items-btn").addEventListener("click",()=>{
            this.item_btn()
        })
        document.querySelector("#flee-btn").addEventListener("click",()=>{
            this.executeAttemptFleeTurn()
        })
        document.querySelector("#breath-btn").addEventListener("click",()=>{
              if(!this.player.equipped_breathing_technique){return sendConsoleMessage("You have no breathing technique!")}else{executeTurnWithBreath()}
        })
        document.querySelector("#evade-btn").addEventListener("click",()=>{
            if(!this.player.equipped_footwork){return sendConsoleMessage("You have no footwork technique!")}
            if(this.player.internal_energy>=this.player.equipped_footwork.activeCost){
                this.executeTurnWithEvade()
            }else{
                sendConsoleMessage("Not enough internal energy to use this footwork!")
            }
        })
        
        document.querySelector("#atk-btn").addEventListener('click',()=>{
            hide_fight_btn()
            show(document.querySelector("#fight-attack-menue"))
        })
        //create the skill buttons
        const attack_menue = document.querySelector("#fight-attack-menue")
        this.player.equipped_skills.forEach((element,index) => {
        const skill_button = document.createElement("button")
        skill_button.id="player-skill-"+(index+1)
        skill_button.innerHTML=element.name
        skill_button.addEventListener("click",()=>{
            if(overdrive.classList.contains("toggled") ){
                sendConsoleMessage("TOGGLED")
                //here overdrive
                if((element.spe_atk && this.player.internal_energy<element.basic_cost*2)||(!element.spe_atk && this.player.stamina<element.basic_cost*2)){
                    sendConsoleMessage("Not enough energy to overdrive this skill!")
                }else{
                    sendConsoleMessage("OVERDRIVE!")
                    this.exexuteTurnOverdrive(element)
                }
            }

            if(element.spe_atk && this.player.internal_energy<element.basic_cost){
                return sendConsoleMessage("Not enough internal energy to use this skill!")
            }else if(!element.spe_atk && this.player.stamina<element.basic_cost){
                return sendConsoleMessage("Not enough stamina to use this skill!")
            }
            this.executeTurn(element)
        })
        
        attack_menue.appendChild(skill_button)})
        
        const overdrive = document.createElement("button")
        overdrive.innerHTML="Overdrive"
        overdrive.id="fight-overdrive"
        overdrive.addEventListener("click",()=>{
            overdrive.classList.toggle("toggled") 
            overdrive.classList.toggle("dark-mode")
        })

        
        const back = document.createElement("button")
        back.innerHTML="Back"
        back.id="fight-back"
        back.addEventListener("click",()=>{
            fight_main()
        })

        
        

        const weapon_type = this.player.weapon_type
        const basic_atk = document.createElement("button")
        basic_atk.id="basic-atk"
        basic_atk.innerHTML=weapon_type.basic_skill.name
        basic_atk.addEventListener("click",()=>{
                this.executeTurn(weapon_type.basic_skill)
            })

        console.log(weapon_type)
        attack_menue.appendChild(overdrive)
        attack_menue.appendChild(basic_atk)
        attack_menue.appendChild(back)
        if(this.player.max_internal_energy>0){document.querySelector("#energy-info-player").classList.remove("hide")}
        this.refreshFightScreen()
    }

    refreshFightScreen(){
        const player_info = document.querySelector('#fight-player-info')
        player_info.innerHTML=
        `
        <h2>${this.player.name}</h2>
        <div id="health-info-player">
            <p class="info-text">${this.player.health}/${this.player.max_health}</p><progress id="health-player" max="${this.player.max_health}" value="${this.player.health}"></progress>
        </div>
        <div id="energy-info-player" class="hide">
            <p class="info-text">${this.player.internal_energy}/${this.player.max_internal_energy}</p><progress id="internal-energy-player" max="${this.player.max_internal_energy}" value="${this.player.internal_energy}"></progress>
        </div>
        <p>Weapon: ${this.player.weapon_type.name}</p>
        <div id="status-effect-player"></div>
        `
        const enemy_info = document.querySelector('#enemy-info')
        enemy_info.innerHTML=
        `
        <h2>${this.enemy.name}</h2>
        <div id="health-info-enemy">
            <p class="info-text">${this.enemy.health}/${this.enemy.max_health}</p><progress id="health-enemy" max="${this.enemy.max_health}" value="${this.enemy.health}"></progress>
        </div>
        <div id="energy-info-enemy" class="hide">
            <p class="info-text">${this.enemy.internal_energy}/${this.enemy.max_internal_energy}</p><progress id="internal-energy-enemy" max="${this.enemy.max_internal_energy}" value="${this.enemy.internal_energy}"></progress>
        </div>
        <p>Weapon: ${this.player.weapon_type.name}</p>
        <div id="status-effect-enemy"></div>
        <p>Realm: ${this.enemy.realm.name}</p>
        `
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

        
    }
    start_turn(){
        this.player.effectTurn()
        if(this.checkDeath()){return}
        this.enemy.effectTurn()
        if(this.checkDeath()){return}
        hide(document.querySelector("#fight-lower-half"))
    }
    end_turn(){
        this.refreshFightScreen()
        show("#fight-lower-half")
        fight_main()
    }
    //set reward and punishment system
    playerDeath(){
        if(this.death_match){sendConsoleMessage(`You died, ${this.enemy.name} won.`)}
        else{this.player.health=1;sendConsoleMessage(`You lost and are at death's door.`)}
        this.endFight()
        if(this.death_match){open_main_menue()}
        
    }
    enemyDeath(){
        if(this.death_match){sendConsoleMessage(`You killed ${this.enemy.name}!`)}
        else{sendConsoleMessage(`You defeated ${this.enemy.name}!`)}

        this.player.processEvent("KILL",this.enemy)
        this.endFight()            
    }

    get_player_speed(skill){return this.player.speed_stat +(skill ? skill.basic_speed:0)+ (this.player.weapon_type.reach || 1) + (this.player.equipped_footwork ? this.player.equipped_footwork.passiveSpeed : 0)}

    get_enemy_speed(skill){return this.enemy.speed_stat +(skill ? skill.basic_speed:0)+ (this.enemy.weapon_type.reach || 1) + (this.enemy.equipped_footwork ? this.enemy.equipped_footwork.passiveSpeed : 0) + (this.enemy.weapon? this.enemy.weapon.speed_bonus:0) + ((this.enemy.armor? this.enemy.armor.speed_modifier : 0))}
    // Main Turn Function
    executeTurn(player_skill) {
        this.start_turn()
        const pSkill = player_skill
        const eSkill = this.enemy.getRandomEnemySkill()
        if(this.player.isStunned()){
            this.executeTurnEnemy()
            return
        }
        if(this.enemy.isStunned()){
            this.executeTurnPlayer()
            return
        }
        
        //Speed
        let pTotalSpeed = this.get_player_speed(pSkill)
        let eTotalSpeed = this.get_enemy_speed(eSkill)

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
        this.end_turn()
    }
    exexuteTurnOverdrive(skill){
        this.start_turn()
        const pSkill = skill
        const eSkill = this.enemy.getRandomEnemySkill()
        let pTotalSpeed = this.player.speed_stat + (pSkill.basic_speed)*2 + (this.player.weapon_type.reach || 1) + (this.player.equipped_footwork ? this.player.equipped_footwork.passiveSpeed : 0)
        let eTotalSpeed = this.enemy.speed_stat + eSkill.basic_speed + (this.enemy.weapon_type.reach || 1) + (this.enemy.equipped_footwork ? this.enemy.equipped_footwork.passiveSpeed : 0)+ (this.enemy.weapon? this.enemy.weapon.speed_bonus:0) + (this.enemy.armor? this.enemy.armor.speed_modifier : 0)

        if(pTotalSpeed>=eTotalSpeed){
            pSkill.overdriveUse(this.player,this.enemy)
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
                pSkill.overdriveUse(this.player,this.enemy)
            }, "2000") 
            
            if(this.checkDeath()){return}
        }
        this.end_turn()
    }
    executeTurnEnemy(){
        this.start_turn()
        const eSkill = this.enemy.getRandomEnemySkill()
        eSkill.use(this.enemy,this.player)
        if(this.checkDeath()){return}
        this.end_turn()
    }

    executeTurnPlayer(skill){
        this.start_turn()
        const pSkill = skill
        pSkill.use(this.player,this.enemy)
        if(this.checkDeath()){return}
        this.end_turn()
    }
    executeTurnWithEvade(){
        this.start_turn()
        const footwork = this.player.equipped_footwork
        const eSkill = this.enemy.getRandomEnemySkill()
        footwork.fightUse(this.player, this.enemy)
        let pTotalSpeed = this.player.speed_stat  + (this.player.equipped_footwork ? this.player.equipped_footwork.passiveSpeed : 2)
        let eTotalSpeed = this.enemy.speed_stat + eSkill.basic_speed + (this.enemy.get_weapon_type().reach || 1) + (this.enemy.equipped_footwork ? this.enemy.equipped_footwork.passiveSpeed : 0)

        const dodgeChance = this.calculateEvasionChance(eTotalSpeed,pTotalSpeed);
        fight_main()
        
        if (Math.random() * 100 < dodgeChance) {
            gameAudio.playSFX("evade_success")
            sendConsoleMessage(`${this.enemy.name} used ${eSkill.name} but ${this.player.name} successfully evades the attack using ${footwork.name}!`)
             return
        }else{
            sendConsoleMessage(`${this.player.name} failed to evade!`)
            if(this.checkDeath()){return}
            eSkill.use(this.enemy,this.player)
            if(this.checkDeath()){return}
        }
        
        this.end_turn()        
    }
    executeTurnWithBreath(){
        this.start_turn()

        const breath = this.player.equipped_breathing_technique
        breath.fightUse(this.player, this.enemy)
        const eSkill = this.enemy.getRandomEnemySkill()
        if(this.checkDeath()){return}
        eSkill.use(this.enemy,this.player)
        if(this.checkDeath()){return}
        this.end_turn() 
    }
    executeAttemptFleeTurn(){
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
        this.start_turn()
        eSkill.use(this.enemy,this.player)
        if(this.checkDeath()){return}
        this.end_turn()
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
        return false
    }

    calculateEvasionChance(attackerSpeed, evaderSpeed) {
        const baseEvasion = 5;
        const maxEvasion = 80
        const scalingFactor = 40;
        evaderSpeed += this.player.equipped_footwork ? this.player.equipped_footwork.passiveSpeed : 0
        if (evaderSpeed <= attackerSpeed) {
            return baseEvasion
        }
        const speedAdvantageRatio = (evaderSpeed - attackerSpeed) / attackerSpeed
        const evasionBonus = speedAdvantageRatio * scalingFactor
        const totalEvasion = Math.floor(baseEvasion + evasionBonus)
        return Math.min(totalEvasion, maxEvasion)
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
                    this.executeTurnEnemy()
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

    item_btn(){
        hide_fight_btn()
        show(document.querySelector("#fight-items-menue"))
        this.open_fight_inventory()
    }
}

function hide_fight_btn(){
    hide(document.querySelector("#fight-main-buttons"))
    hide(document.querySelector("#fight-attack-menue"))
    hide(document.querySelector("#fight-items-menue"))
}
function fight_main(){
    hide_fight_btn()
    show(document.querySelector("#fight-main-buttons"))
}
// in a fight a player or enemy got 6 choices: 4 chosen skill, breathing tech to get qi, so waiting a turn mostly and evading