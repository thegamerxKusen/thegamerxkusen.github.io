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