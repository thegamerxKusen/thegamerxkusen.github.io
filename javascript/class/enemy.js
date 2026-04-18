class ENEMY{
    constructor(name, realm,health, max_health, stamina, max_stamina, internal_energy, max_internal_energy, atk_stat, def_stat, speed_stat, spe_atk,spe_def, mind_stat,breathing_tech,skills,armor, weapon) {
        // Use underscores here so we don't trigger the setters yet!
        this.name = name
        this.realm = realm || realm_db[0]

        this.health = health
        this.max_health = max_health
        this.stamina = stamina
        this.max_stamina = max_stamina
        this.internal_energy = internal_energy
        this.max_internal_energy = max_internal_energy

        this.atk_stat = atk_stat
        this.spe_atk = spe_atk

        this.def_stat = def_stat
        this.spe_def = spe_def

        this.speed_stat = speed_stat
        
        this.mind_stat = mind_stat

        this.skills=skills || []

        this.breathing_tech = breathing_tech
        this.weapon = weapon
        this.armor = armor
        console.log(`
            --- ⚔️ ENEMY PROFILE: ${this.name.toUpperCase()} ⚔️ ---
            Realm:   ${this.realm.name}
            HP:      ${this.health} / ${this.max_health}
            Stamina: ${this.stamina} / ${this.max_stamina}
            Qi:      ${this.internal_energy} / ${this.max_internal_energy}
            ---------------------------------------------
            [STATS]
            ATK: ${this.atk_stat} | SPE ATK: ${this.spe_atk}
            DEF: ${this.def_stat} | SPE DEF: ${this.spe_def}
            SPD: ${this.speed_stat} | MIND:    ${this.mind_stat}
            ---------------------------------------------
            EQUIPMENT:
            Weapon: ${this.weapon ? this.weapon.name : "None"}
            Armor:  ${this.armor ? this.armor.name : "None"}
            Tech:   ${this.breathing_tech ? this.breathing_tech.name : "None"}
                `);

                if (this.skills.length > 0) {
                    console.log("--- SKILLS ---");
                    console.table(this.skills, ["name", "power", "speed"]);
                }
    }
    getRandomEnemySkill() {
        //todo add only usable attack with fall back on basic attack, breath or item
        if(this.skills.length===0){ 
            console.log("got no skill")
            return
        }
        
        const roll = Math.floor(Math.random() * this.skills.length)
        return this.skills[roll]
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

    return new ENEMY(name,realm,50,50,50,50,qi,qi,Math.floor(Math.random() * realm.stat_cap),Math.floor(Math.random() * realm.stat_cap),Math.floor(Math.random() * realm.stat_cap),Math.floor(Math.random() * realm.stat_cap),Math.floor(Math.random() * realm.stat_cap),Math.floor(Math.random() * realm.stat_cap),null,skills,null,null)
}