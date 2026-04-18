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
    constructor(id, name, desc, value, atk_bonus, speed_bonus, rarity) {
        super(id, name, desc, value, rarity,quantity) // Calls the Base Item constructor
        this.atk_bonus = atk_bonus
        this.speed_bonus = speed_bonus
        this.isEquipped = false
    }
}

class SKILL_BOOK extends ITEM {
    constructor(id, name, desc, value, mind_req, skill_id, rarity) {
        super(id, name, desc, value, rarity,quantity)
        this.mind_req = mind_req
        this.skill_id = skill_id // The ID of the skill it unlocks
    }
}
class BREATHING_TECHNIQUE extends ITEM {
    constructor(id, name, desc, value, mind_req, energy_boost, rarity,quantity) {
        super(id, name, desc, value, rarity)
        this.mind_req = mind_req
        this.energy_boost = energy_boost
    }
}
const basic_qi_tech = new BREATHING_TECHNIQUE(1,"Basic Qi Technique","A rough way to gather energy, can barely be called a technique, you just take all energy letting it wild in your meridian until some, gather in your dantian by chance for refining.",1000,4,1,"Common")
const black_dragon_ball = new ITEM(0,"Black Dragon Ball","A medicine ball of the cult that was created by the founding clan leader of the Poison Clan named Baek Yu. Allow the person who consume it to gain at least 20 years' worth of internal energy.",5000,"Epic",()=>{
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