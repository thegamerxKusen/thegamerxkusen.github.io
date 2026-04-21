class BREATHING_TECHNIQUE {
    constructor(name, desc, mind_req, energy_boost, tier) {
        this.name = name
        this.desc = desc
        this.mind_req = mind_req
        this.energy_boost = energy_boost
        this.tier = tier
    }

    fightUse(user, target) {

    }

}

const breathing_tech_db = {
    basic_qi_tech : new BREATHING_TECHNIQUE("Basic Qi Technique","A rough way to gather energy, can barely be called a technique, you just take all energy letting it wild in your meridian until some, gather in your dantian by chance for refining.",1000,4,"Common"),
    }

class FOOTWORK_TECHNIQUE {
    constructor(name, description, activeCost, passiveSpeed, activeLogic) {
        this.name = name
        this.description = description
        this.activeCost = activeCost // How much Qi it costs to use the Evade
        this.passiveSpeed = passiveSpeed
        this.fightUse = activeLogic     // A function
    }

    fightUse(user, target) {

    }
}

const footwork_tech_db = {
    basic_evade : new FOOTWORK_TECHNIQUE("Basic Evade","A simple footwork technique that allows you to evade attacks, but it is not very effective.", 20, 1, (user, target) => {
        sendConsoleMessage(`${user.name} uses ${footwork_tech_db.basic_evade.name} to evade the attack!`)})
        //no speed boost just trying to evade, so no change to user.speed
    }