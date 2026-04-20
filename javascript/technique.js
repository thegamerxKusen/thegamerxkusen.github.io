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
    constructor(name, desc, speed_boost, tier) {
        this.name = name
        this.desc = desc
        this.speed_boost = speed_boost
        this.tier = tier
    }

    fightUse(user, target) {

    }
}
const FOOTWORK_TECHNIQUE_DB = {

}

//basic_qi_tech : new BREATHING_TECHNIQUE("Basic Qi Technique","A rough way to gather energy, can barely be called a technique, you just take all energy letting it wild in your meridian until some, gather in your dantian by chance for refining.",1000,4,1,"Common",0),