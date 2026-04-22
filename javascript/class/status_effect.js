class STATUS_EFFECT{
    constructor(duration){
        this.duration = duration
    }
}
class POSITIVE_EFFECT extends STATUS_EFFECT{
    constructor(duration){
        super(duration)
    }
}
class NEGATIVE_EFFECT extends STATUS_EFFECT{
    constructor(duration){
        super(duration)
    }
}
class BLEEDING_EFFECT extends NEGATIVE_EFFECT{
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

class STUNNED_EFFECT extends NEGATIVE_EFFECT{
    constructor(duration){
        super(duration)
        this.adj = "stunned"
    }
    turn(target){
        sendConsoleMessage(`${target.name} is ${this.adj} and cannot move!`)
        this.duration--
    }
}

class SLOWED_EFFECT extends NEGATIVE_EFFECT{
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
class HASTED_EFFECT extends POSITIVE_EFFECT{
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

class BURNING_EFFECT extends NEGATIVE_EFFECT{
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

class FROZEN_EFFECT extends NEGATIVE_EFFECT{
    constructor(duration){
        super(duration)
        this.adj = "frozen"
    }
    turn(target){
        sendConsoleMessage(`${target.name} is ${this.adj} and cannot move!`)
        this.duration--
    }
}
