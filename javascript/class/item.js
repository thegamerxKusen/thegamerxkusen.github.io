class ITEM{
    constructor(name, desc, value, tier = item_tier_db.common,quantity,use) {
        
        this.name = name
        this.desc = desc
        this.value = value
        this.tier = tier
        this.quantity = Number(quantity) || 1
        if(!(this instanceof MANUAL)){this.use = use || (() => {})}
    }
    addAnother() {
        // Ensure quantity is a number before adding
        if (isNaN(this.quantity)) {
            this.quantity = 1
        }
        this.quantity++
    }
}

class WEAPON_ITEM extends ITEM{
    constructor(name, desc, value,def_bonus, atk_bonus, speed_bonus, tier,type,element) {
        super(name, desc, value, tier,1) // Calls the Base Item constructor
        this.type = type 
        this.def_bonus = def_bonus
        this.atk_bonus = atk_bonus
        this.speed_bonus = speed_bonus
    }
}
class MANUAL extends ITEM {
    constructor(name, desc, value, tier) {
        super(name, desc, value, "Common", 1) // Manuals are always common and quantity is 1
        this.value = value
        this.tier = tier
    }
    
}

class SKILL_BOOK extends MANUAL {
    constructor(name, desc, value, content, tier) {
        super(name, desc, value, tier)
        this.content = content
    }
    use(user){
        user.learn_skill(this)
    }
}

class BREATHING_TECHNIQUE_BOOK extends MANUAL {
    constructor(name, desc, value, content, tier) {
        super(name, desc, value, tier)
        this.content = content
    }
    use(user){
        console.log("Using manual")
        user.learn_breathing_tech(this)
    }
}

class FIGHT_ITEM extends ITEM{
    constructor(name, desc, value, tier,quantity,effect) {
        super(name, desc, value, tier,quantity)
        this.effect = effect // A function that defines what the item does in combat
    }
    useInCombat(user,target){
        this.effect(user,target)
        this.quantity--
    }
}


const item_db ={
    fists: new WEAPON_ITEM("Fists","Your own fists, not very strong but always with you.",0,0,0,0,item_tier_db.common,weapon_db[0]),
    training_dagger: new WEAPON_ITEM("Training Dagger","A basic dagger used for training, better than nothing.",100,0,0,0,item_tier_db.common,weapon_db[1]),
    training_sword: new WEAPON_ITEM("Training Sword","A basic sword used for training, better than nothing.",100,0,0,0,item_tier_db.common,weapon_db[2]),
    training_spear: new WEAPON_ITEM("Training Spear","A basic spear used for training, better than nothing.",100,0,0,0,item_tier_db.common,weapon_db[3]),
    training_axe: new WEAPON_ITEM("Training Axe","A basic axe used for training, better than nothing.",100,0,0,0,item_tier_db.common,weapon_db[4]),
    training_staff: new WEAPON_ITEM("Training Staff","A basic staff used for training, better than nothing.",100,0,0,0,item_tier_db.common,weapon_db[5]),
    black_dragon_ball: new ITEM("Black Dragon Ball","A medicine ball of the cult that was created by the founding clan leader of the Poison Clan named Baek Yu. Allow the person who consume it to gain at least 20 years' worth of internal energy.",5000,item_tier_db.epic, (user) => {
        if(!user._breathing_tech){
            //qi deviation
            user.damage(user._max_health/2)
            sendConsoleMessage("You suffered Qi Deviation and wasted the medicine.")
            user.passHour(2)
            return
        }
        user._max_internal_energy+=100
        user.internal_energy+=100
    }),
    bandage: new FIGHT_ITEM("Bandage","A simple bandage that can be used to stop bleeding and close wounds, it can be used in combat to heal some health.",50,item_tier_db.common,3,(user,target)=>{
        const heal_amount = 5
        user.heal(heal_amount)
        user.effectCleanse("bleeding")
    }),
    basic_breathing_manual: new BREATHING_TECHNIQUE_BOOK(breathing_tech_db.basic_qi_tech.name,breathing_tech_db.basic_qi_tech.description,1000,breathing_tech_db.basic_qi_tech,item_tier_db.common)
}
