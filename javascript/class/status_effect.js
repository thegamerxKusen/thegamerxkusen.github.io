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