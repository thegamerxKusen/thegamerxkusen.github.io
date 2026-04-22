class ITEM_TIER{
    constructor(name){
        this.name = name
    }
}

const item_tier_db = {
    trash: new ITEM_TIER("Trash"),
    common: new ITEM_TIER("Common"),
    uncommon: new ITEM_TIER("Uncommon"),
    rare: new ITEM_TIER("Rare"),
    epic: new ITEM_TIER("Epic"),
    legendary: new ITEM_TIER("Legendary"),
    quest: new ITEM_TIER("Quest")
}