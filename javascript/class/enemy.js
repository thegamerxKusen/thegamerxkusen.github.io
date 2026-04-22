class ENEMY{
    constructor(name, realm, internal_energy, max_internal_energy, atk_stat, def_stat, speed_stat, vitality_stat, endurance_stat, spe_atk,spe_def, mind_stat,breathing_tech,skills,armor, weapon) {
        // Use underscores here so we don't trigger the setters yet!
        this.name = name
        this.realm = realm || realm_db[0]

        this.health = health
        this.stamina = stamina
        this.internal_energy = internal_energy
        this.max_internal_energy = max_internal_energy

        this.atk_stat = atk_stat
        this.spe_atk = spe_atk

        this.vitality_stat = vitality_stat
        this.endurance_stat = endurance_stat
        this.max_health = (this.vitality_stat * 5) + (this.realm.id * 50)
        this.max_stamina =  (this.endurance_stat * 5) + (this.realm.id * 50)
        this.health = this.max_health
        this.stamina = this.max_stamina

        this.def_stat = def_stat
        this.spe_def = spe_def

        this.speed_stat = speed_stat
        
        this.mind_stat = mind_stat

        this.skills=skills || []

        this.breathing_tech = breathing_tech
        this.weapon = weapon
        this.armor = armor

        this.status_effects = []
    }

    
    //status effects
    addEffect(effect){
        if(effect instanceof STATUS_EFFECT){
            this.status_effects.push(effect)
        }else{console.log("Tried to add non status effect to enemy")}
        const existingEffect = this.status_effects.find(e => e.adj === effect.adj) 
        if(existingEffect){
            existingEffect.duration = Math.max(existingEffect.duration, effect.duration)
        }
    }

    effectTurn(){
        for (const effect of this.status_effects) {
            console.log(effect)

            effect.turn(this)
            if(effect.duration<=0){
                this.status_effects.splice(this.status_effects.indexOf(effect),1)
                sendConsoleMessage(`You are no longer ${effect.adj}.`)
            }
        }
    }
    effectsFullCleanse(){
        this.status_effects = []
    }
    effectCleanseNegative(){
        this.status_effects = this.status_effects.filter(effect => !(effect instanceof NEGATIVE_EFFECT))
    }
    effectCleanse(adj){
        this.status_effects = this.status_effects.filter(e => e.adj !== adj)
        sendConsoleMessage(`You are no longer ${adj}.`)
    }

    isStunned(){
        return this.status_effects.some(effect => effect instanceof STUNNED_EFFECT)
    }
    
    getRandomEnemySkill() {
        //todo add only usable attack with fall back on basic attack, breath or item
        if(this.skills.length===0){ 
            console.log("got no skill")
            return
        }
        
        const roll = Math.floor(Math.random() * this.skills.length)
        if(!this.skills[roll].basic_cost > this.internal_energy){
            return this.get_weapon_type().basic_skill
        }
        return this.skills[roll]
    }
    get_weapon_type(){
        return this.weapon ? this.weapon.type : weapon_db[0] // Return "Fist" if no weapon equipped
    }
    heal(hp_to_heal){
        if(hp_to_heal+this.health>=this.max_health){this.fullHeal()}else{this.health+=hp_to_heal}
        
    }
    damage(hp_to_lose){
        this.health-=hp_to_lose
        const finalDamage = Math.max(1, Math.floor(hp_to_lose));
        this.health -= finalDamage;
    }

    regenStamina(stamina_gain){
        const temp_stam = this._stamina
        if(stamina_gain+this._stamina>=this.max_stamina){this.fullStaminaRegen()}else{this.stamina+=stamina_gain}
        sendConsoleMessage("Stamina +"+(this._stamina-temp_stam))
    }
    reduceStamina(stamina_loss){
        if(this.stamina-=stamina_loss >=0){
            this.stamina-=stamina_loss
            sendConsoleMessage("Stamina -"+stamina_loss)
        }
        else{
            sendConsoleMessage("No Stamina Remaining")
            this.stamina=0
        }
    }
    regenEnergy(energy_gain){
        if(energy_gain+this.internal_energy>=this.max_internal_energy){this.fullEnergyRegen()}else{this.internal_energy+=energy_gain}
    }
    reduceEnergy(energy_loss){
        if(this.internal_energy-=energy_loss >=0){
            this.internal_energy-=energy_loss
        }
        else{
            this.internal_energy=0
        }
    }

    fullHeal(){
        this.health=this.max_health
    }
    fullStaminaRegen(){
        this.stamina=this.max_stamina
    }
    fullEnergyRegen(){
        this.internal_energy=this.max_internal_energy
    }

    fullRestoration(){
        this.fullHeal()
        this.fullEnergyRegen()
        this.fullStaminaRegen()
    }

}

function createRandomEnemy(realm,name){
    const qi = Math.floor(Math.random() * realm.energy_cap)
    const skill_db_copy =[... skill_db]
    const skills = []
    while(skills.length < 4 && skill_db_copy.length > 0){
        const index = Math.floor(Math.random() * skill_db_copy.length)
        const skill = skill_db_copy[index]
        skill_db_copy.splice(index, 1)
        skills.push(skill)
    }

    return new ENEMY(name,realm,qi,qi,Math.floor(Math.random() * realm.stat_cap),Math.floor(Math.random() * realm.stat_cap),Math.floor(Math.random() * realm.stat_cap),Math.max(Math.floor(Math.random() * realm.stat_cap),1),Math.floor(Math.random() * realm.stat_cap),Math.floor(Math.random() * realm.stat_cap),Math.floor(Math.random() * realm.stat_cap),Math.floor(Math.random() * realm.stat_cap),null,skills,null,null)
}