class SKILL{
    constructor(id,name,description,basic_cost,basic_damage,basic_speed,spe_atk,weapon_req){
        this.id=id
        this.name=name
        this.description = description
        this.weapon_req = weapon_req || null //if the skill requires a specific weapon type, if not its null
        this.basic_cost=basic_cost
        this.basic_damage=basic_damage
        this.basic_speed = basic_speed

        this.spe_atk=spe_atk|| false //if true its a spe atk if not its physical.
    }
    use(user,target){
        let damage

        if(this.spe_atk){
            damage = (user.spe_atk + this.basic_damage)
            damage = Math.max(1,Math.floor(Math.max(0, damage - target.spe_def)))
        }else{
            damage = (user.atk_stat + this.basic_damage)
            damage = Math.max(1,Math.floor(Math.max(0, damage - target.def_stat)))
        }
        target.health -= damage
        user.reduceEnergy(this.basic_cost)
        sendConsoleMessage(`${user.name} used ${this.name} and dealt ${damage} damage.`)
        
    }
    //Basic value is the minimum, player can go overdrive and add qi to increase the strenght of the skill
}
class SKILL_STATUS_EFFECT extends SKILL{
    constructor(id,name,description,basic_cost,basic_damage,basic_speed,spe_atk,weapon_req,status_effects,chance){
        super(id,name,description,basic_cost,basic_damage,basic_speed,spe_atk,weapon_req)
        this.status_effects = status_effects
        this.chance = chance//in %
    }
    use(user,target){
        let damage

        if(this.spe_atk){
            damage = (user.spe_atk + this.basic_damage)
            damage = Math.max(1,Math.floor(Math.max(0, damage - target.spe_def)))
        }else{
            damage = (user.atk_stat + this.basic_damage)
            damage = Math.max(1,Math.floor(Math.max(0, damage - target.def_stat)))
        }
        target.health -= damage
        user.reduceEnergy(this.basic_cost)
        sendConsoleMessage(`${user.name} used ${this.name} and dealt ${damage} damage.`)
        if(Math.random()<this.chance/100){
            target.addEffect(this.status_effects)
            sendConsoleMessage(`${target.name} is ${this.status_effects.adj}!`)
        }
    }
}

class WEAPON {
    constructor(name,reach,skill){
        this.name = name
        this.reach = reach //number
        this.basic_skill = skill
    }
}
const basic_weapon_skills=[
    new SKILL("Punch","Basic Punch","A simple punch, nothing fancy but it can still hurt if you hit the right spot.",
        0,
        5,
        5,
        false,
        null),
    new SKILL_STATUS_EFFECT("backstab","Backstab","A precise strike aimed at the opponent's back, has a 60% chance to cause bleeding.",
        0,
        10,
        10,false,
        null,new BLEEDING_EFFECT(3),60
    ),new SKILL("slash","Slash","A quick horizontal strike."),
    new SKILL("spear_thrust","Spear Thrust","A long-range piercing attack that can strike from a distance, ignore some defenses.",
        0,
        10,
        10,
        false,
        null),
    new SKILL("heavy-swing","Heavy Swing","A powerful overhead strike that can break through defenses but is slow to execute. Takes a turn to buildup.",
        0,
        20,
        5,
        false,
        null
    ),
    new SKILL_STATUS_EFFECT("staff_strike","Staff Strike","A versatile strike that can be used for both offense and defense, has a 20% chance to stun the opponent.",
        0,9,10,false,null,new STUNNED_EFFECT(1),20
    )
]

const weapon_db =[new WEAPON("Fist",1,basic_weapon_skills[0]),new WEAPON("Dagger", 2,basic_weapon_skills[1]),new WEAPON("Sword", 6,basic_weapon_skills[2]),new WEAPON("Spear", 15,basic_weapon_skills[3]),new WEAPON("Axe", 5,basic_weapon_skills[4]),new WEAPON("Staff", 13,basic_weapon_skills[5])]

basic_weapon_skills[0].weapon_req = weapon_db[0]
basic_weapon_skills[1].weapon_req = weapon_db[1]
basic_weapon_skills[2].weapon_req = weapon_db[2]
basic_weapon_skills[3].weapon_req = weapon_db[3]
basic_weapon_skills[4].weapon_req = weapon_db[4]
basic_weapon_skills[5].weapon_req = weapon_db[5]
//basic test skills


const skill_db = [
    // --- PHYSICAL ATTACKS (spe_atk: false) ---
    
    new SKILL(
        "quick_jab",
        "Swift Sparrow Strike",
        "A lightning-fast strike aimed at pressure points. High speed, but low base power.",
        5,   // basic_cost (Stamina)
        10,  // basic_damage
        15,  // basic_speed (Very Fast)
        false,
        null
    ),

    new SKILL(
        "heavy_swing",
        "Mountain Crushing Blow",
        "A slow, wide arc swing using full body weight. Hard to time, but devastating.",
        15,  // basic_cost
        40,  // basic_damage
        3,   // basic_speed (Very Slow)
        false,
        weapon_db[3]
    ),

    new SKILL(
        "iron_shoulder",
        "Iron Bull Charge",
        "A balanced tackle. Sturdy and reliable for beginners.",
        10,
        20,
        8,   // basic_speed (Average)
        false,
        null
    ),

    new SKILL(
        "flowing_palm",
        "Soft Water Palm",
        "A counter-focused strike that uses the opponent's momentum. Good speed.",
        8,
        15,
        12,  // basic_speed (Fast)
        false,
        null
    ),

    // --- SPECIAL ATTACKS (spe_atk: true) ---

    new SKILL(
        "qi_burst",
        "Internal Shockwave",
        "Erupts internal energy through the palms. Bypasses some physical defense.",
        20,  // basic_cost (Internal Energy)
        30,
        10,
        true,
        null
    ),

    new SKILL(
        "dragon_breath",
        "Dragon's Sigh",
        "A slow, channeled beam of energy. Massive damage if it lands.",
        40,
        60,
        4,   // basic_speed (Slow)
        true,
        null
    ),

    new SKILL(
        "flicker_bolt",
        "Lightning Finger",
        "A concentrated spark of energy released from the fingertip. Extremely fast.",
        15,
        20,
        18,  // basic_speed (Extremely Fast)
        true,
        null
    ),

    new SKILL(
        "demonic_roar",
        "Soul-Shaking Cry",
        "An area-of-effect sound attack that ignores physical armor.",
        25,
        25,
        7,
        true,
        null
    )
]