class NPC {
    constructor(name, realm, title,affinity,enemyProfile) {
        this.name = name
        this.realm = realm
        this.title = title
        this.affinity = affinity || 0;
        
        // If they can be fought/sparred, pass an ENEMY instance here!
        this.enemyProfile = enemyProfile || null;

    }
}