class STATUS_EFFECT{
    constructor(duration){
        this.duration = duration
    }
}

class BLEEDING_EFFECT extends STATUS_EFFECT{
    constructor(duration){
        super(duration)
        this.adj = "bleeding"
    }
    turn(target){
        let damage = Math.max(1, Math.floor(target.health * 0.05))
        target.damage(damage)
        sendConsoleMessage(`${target.name} takes ${damage} ${this.adj} damage!`)
        this.duration--
    }
}

class STUNNED_EFFECT extends STATUS_EFFECT{
    constructor(duration){
        super(duration)
        this.adj = "stunned"
    }
    turn(target){
        sendConsoleMessage(`${target.name} is ${this.adj} and cannot move!`)
        this.duration--
    }
}

class SLOWED_EFFECT extends STATUS_EFFECT{
    constructor(duration,value){
        super(duration)
        this.adj = "slowed"
        this.value = value
        target.speed-=value
    }
    turn(target){
        sendConsoleMessage(`${target.name} is ${this.adj} and moves slower!`)
        this.duration--
        if(this.duration<=0){
            target.speed+=this.value
        }
    }
}
class HASTED_EFFECT extends STATUS_EFFECT{
    constructor(duration,value){
        super(duration)
        this.adj = "hasted"
        this.value = value
        target.speed+=value
    }
    turn(target){
        sendConsoleMessage(`${target.name} is ${this.adj} and moves faster!`)
        this.duration--
        if(this.duration<=0){
            target.speed-=this.value
        }
    }
}

class BURNING_EFFECT extends STATUS_EFFECT{
    constructor(duration){
        super(duration)
        this.adj = "burning"
    }
    turn(target){
        let damage = Math.max(1, Math.floor(target.health * 0.05))
        target.damage(damage)
        sendConsoleMessage(`${target.name} takes ${damage} ${this.adj} damage!`)
        this.duration--
    }
}

class FROZEN_EFFECT extends STUNNED_EFFECT{
    constructor(duration){
        super(duration)
        this.adj = "frozen"
    }
    turn(target){
        sendConsoleMessage(`${target.name} is ${this.adj} and cannot move!`)
        this.duration--
    }
}
