class QUEST {
    constructor(title, description, target, requiredAmount, eventType, rewardFunction) {
        this.title = title;
        this.description = description;
        this.target = target;
        this.requiredAmount = requiredAmount || 1;
        this.eventType = eventType;
        
        this.currentAmount = 0;
        this.isCompleted = false;
        this.rewardFunction = rewardFunction; 
    }

    // This single method now works for ALL subclasses!
    updateProgress(amount = 1) {
        if (this.isCompleted) return;

        this.currentAmount += amount;
        
        // Don't show progress for quests that only need 1 thing (like moving to a room)
        if (this.requiredAmount > 1) {
            sendConsoleMessage(`[Quest Update] ${this.title}: ${this.currentAmount}/${this.requiredAmount}`);
        }

        if (this.currentAmount >= this.requiredAmount) {
            this.complete();
        }
    }

    complete() {
        this.isCompleted = true;
        sendConsoleMessage(`[Quest Completed] ${this.title}!`);
        if (this.rewardFunction) this.rewardFunction();
    }
}

// Now your subclasses just set up the specific eventType using super()!
class KILL_QUEST extends QUEST {
    constructor(title, description, target, requiredAmount, rewardFunction) {
        super(title, description, target, requiredAmount, "KILL", rewardFunction);
    }
}

class COLLECT_QUEST extends QUEST {
    constructor(title, description, target, requiredAmount, rewardFunction) {
        super(title, description, target, requiredAmount, "COLLECT", rewardFunction);
    }
}

class PLACE_QUEST extends QUEST {
    constructor(title, description, target, rewardFunction) {
        // Places usually only require visiting 1 time
        super(title, description, target, 1, "MOVE", rewardFunction);
    }
}

class INTERACTION_QUEST extends QUEST {
    constructor(title, description, target, requiredAmount, rewardFunction) {
        super(title, description, target, requiredAmount, "INTERACT", rewardFunction);
    }
}

class READING_QUEST extends QUEST{
    constructor(title, description, target, requiredAmount, rewardFunction) {
        super(title, description, target, 1, "READ", rewardFunction);
    }
}

class USE_ITEM extends QUEST{
    constructor(title, description, target, requiredAmount, rewardFunction) {//target is an item
        super(title, description, target, 1, "USE_ITEM", rewardFunction);
    }
}

const quests_db = {
    MAIN_2 : new INTERACTION_QUEST("Main Quest 2","After 30 day of training, head Out to the academy and attend the opening ceremony",world_interactions["academy_first_test"],()=>{})
    ,MAIN_1:new PLACE_QUEST("Main Quest 1","You have a month of preparation before the opening of the Demonic Academy, to succeed in becoming the Sect Leader you must succeed. Train to the maximum.",worldMap["academy"],()=>{player.addQuest(quests_db.MAIN_2)})
    ,TUTORIAL_2 : new INTERACTION_QUEST("Tutorial 2","One of the way to increase your strenght of mind is to read in the study.",world_interactions["starter_home_bookshelf"],1,()=>{})
    ,TUTORIAL_1 : new INTERACTION_QUEST("Tutorial 1","Take a training weapon from the weapon rack in the training ground.",world_interactions["training_weapon_rack"],1,()=>{player.addQuest(quests_db.TUTORIAL_2)})
    
}

