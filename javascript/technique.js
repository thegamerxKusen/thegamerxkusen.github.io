class BREATHING_TECHNIQUE {
    constructor(name, desc, mind_req, energy_boost, tier) {
        this.name = name
        this.desc = desc
        this.mind_req = mind_req
        this.energy_boost = energy_boost
        this.tier = tier
    }

    fightUse(user, target) {
        sendConsoleMessage(`${user.name} used ${this.name}, boosting their energy and stamina!`)
        user.regenEnergy(this.energy_boost)
        user.regenStamina(this.energy_boost)
    }

}

const breathing_tech_db = {
    three_powers_breathing: new BREATHING_TECHNIQUE("Three Powers Breathing","This method is not used to gather internal energy but to train the mind and body through Qi Ventitaltion.",100,1,item_tier_db.trash),
    basic_qi_tech : new BREATHING_TECHNIQUE("Basic Qi Technique","A rough way to gather energy, can barely be called a technique, you just take all energy letting it wild in your meridian until some, gather in your dantian by chance for refining.",1000,4,item_tier_db.common),
    }

class FOOTWORK_TECHNIQUE {
    constructor(name, description, activeCost, passiveSpeed) {
        this.name = name
        this.description = description
        this.activeCost = activeCost // How much Qi it costs to use the Evade
        this.passiveSpeed = passiveSpeed   // A function
    }

    fightUse(user, target) {
        if (user.internal_energy >= this.activeCost) {
            user.reduceEnergy(this.activeCost)
        }
    }
}

const footwork_tech_db = {
    basic_evade : new FOOTWORK_TECHNIQUE("Basic Evade","A simple footwork technique that allows you to evade attacks, but it is not very effective.", 20, 10)
}