class ITEM{
    constructor(id, name, desc, value, rarity = "Common",quantity,use) {
        this.id = id
        this.name = name
        this.desc = desc
        this.value = value
        this.rarity = rarity
        this.quantity = Number(quantity) || 1
        this.use = use || (() => {})
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
    constructor( name,type, desc, value,def_bonus, atk_bonus, speed_bonus, rarity,type,element) {
        super(name, desc, value, rarity,quantity) // Calls the Base Item constructor
        this.type = type 
        this.def_bonus = def_bonus
        this.atk_bonus = atk_bonus
        this.speed_bonus = speed_bonus
    }
}
class SKILL_BOOK extends ITEM {
    constructor(name, desc, value, mind_req, skill_id, rarity) {
        super(id, name, desc, value, rarity,quantity)
        this.mind_req = mind_req
        this.skill_id = skill_id // The ID of the skill it unlocks
    }
}
class BREATHING_TECHNIQUE extends ITEM {
    constructor(name, desc, value, mind_req, energy_boost, rarity,quantity) {
        super(name, desc, value, rarity)
        this.mind_req = mind_req
        this.energy_boost = energy_boost
    }
}
const item_db ={
    fists: new WEAPON_ITEM("Fists","Unarmed","Your own fists, not very strong but always with you.",0,0,0,0,"Common",weapon_db[0]),
    training_dagger: new WEAPON_ITEM("Training Dagger","Dagger","A basic dagger used for training, better than nothing.",100,0,0,0,"Common",weapon_db[1]),
    training_sword: new WEAPON_ITEM("Training Sword","Sword","A basic sword used for training, better than nothing.",100,0,0,0,"Common",weapon_db[2]),
    training_spear: new WEAPON_ITEM("Training Spear","Spear","A basic spear used for training, better than nothing.",100,0,0,0,"Common",weapon_db[3]),
    training_axe: new WEAPON_ITEM("Training Axe","Axe","A basic axe used for training, better than nothing.",100,0,0,0,"Common",weapon_db[4]),
    training_staff: new WEAPON_ITEM("Training Staff","Staff","A basic staff used for training, better than nothing.",100,0,0,0,"Common",weapon_db[5]),
}
const basic_qi_tech = new BREATHING_TECHNIQUE("Basic Qi Technique","A rough way to gather energy, can barely be called a technique, you just take all energy letting it wild in your meridian until some, gather in your dantian by chance for refining.",1000,4,1,"Common")
const black_dragon_ball = new ITEM("Black Dragon Ball","A medicine ball of the cult that was created by the founding clan leader of the Poison Clan named Baek Yu. Allow the person who consume it to gain at least 20 years' worth of internal energy.",5000,"Epic",()=>{
    if(!player._breathing_tech){
        //qi deviation
        player.damage(player._max_health/2)
        sendConsoleMessage("You suffered Qi Deviation and wasted the medicine.")
        player.passHour(2)
        return
    }

    player._max_internal_energy+=1000
    player.internal_energy+=1000

})