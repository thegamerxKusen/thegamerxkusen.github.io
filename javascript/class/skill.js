class SKILL{
    constructor(id,name,description,basic_cost,basic_damage,basic_speed,spe_atk){
        this.id=id
        this.name=name
        this.description = description

        this.basic_cost=basic_cost
        this.basic_damage=basic_damage
        this.basic_speed = basic_speed

        this.spe_atk=spe_atk|| false //if true its a spe atk if not its physical.
    }
    //Basic value is the minimum, player can go overdrive and add qi to increase the strenght of the skill
}

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
        false
    ),

    new SKILL(
        "heavy_swing",
        "Mountain Crushing Blow",
        "A slow, wide arc swing using full body weight. Hard to time, but devastating.",
        15,  // basic_cost
        40,  // basic_damage
        3,   // basic_speed (Very Slow)
        false
    ),

    new SKILL(
        "iron_shoulder",
        "Iron Bull Charge",
        "A balanced tackle. Sturdy and reliable for beginners.",
        10,
        20,
        8,   // basic_speed (Average)
        false
    ),

    new SKILL(
        "flowing_palm",
        "Soft Water Palm",
        "A counter-focused strike that uses the opponent's momentum. Good speed.",
        8,
        15,
        12,  // basic_speed (Fast)
        false
    ),

    // --- SPECIAL ATTACKS (spe_atk: true) ---

    new SKILL(
        "qi_burst",
        "Internal Shockwave",
        "Erupts internal energy through the palms. Bypasses some physical defense.",
        20,  // basic_cost (Internal Energy)
        30,
        10,
        true
    ),

    new SKILL(
        "dragon_breath",
        "Dragon's Sigh",
        "A slow, channeled beam of energy. Massive damage if it lands.",
        40,
        60,
        4,   // basic_speed (Slow)
        true
    ),

    new SKILL(
        "flicker_bolt",
        "Lightning Finger",
        "A concentrated spark of energy released from the fingertip. Extremely fast.",
        15,
        20,
        18,  // basic_speed (Extremely Fast)
        true
    ),

    new SKILL(
        "demonic_roar",
        "Soul-Shaking Cry",
        "An area-of-effect sound attack that ignores physical armor.",
        25,
        25,
        7,
        true
    )
]