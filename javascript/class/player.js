class PLAYER {
    constructor(name,  currency, health, stamina, internal_energy, max_internal_energy, location, atk_stat, def_stat,vitality_stat, speed_stat,endurance_stat, spe_atk,spe_def,hour,day, mind_stat,inventory,breathing_tech,armor, weapon,equipped_footwork,equipped_skills,realm,skill_inventory,active_quest) {
        // Use underscores here so we don't trigger the setters yet!
        this._name = name
        
        this._currency = currency
        this._health = health
        this._vitality_stat=vitality_stat
        this.realm=realm || realm_db[0]
        this._max_health = (this._vitality_stat * 5) + (this.realm.id * 50)
        this._stamina = stamina
        this._endurance_stat = endurance_stat
        this._max_stamina =  (this._endurance_stat * 5) + (this.realm.id * 50)
        this._internal_energy = internal_energy
        this._max_internal_energy = max_internal_energy
        this._location = location

        this._atk_stat = atk_stat
        this._spe_atk = spe_atk
        this._def_stat = def_stat
        this._spe_def = spe_def
        this._speed_stat = speed_stat
        this._mind_stat = mind_stat
        
        this.active_quest = active_quest || []

        this._was_qi_hidden = true
        this._inventory=inventory || []//lists of items

        this._breathing_tech = breathing_tech
        this._breathing_tech_inventory = [] // multiplier is 1 if no technique is equipped

        this.status_effects = [new BLEEDING_EFFECT(3)] 

        this._equipped_footwork = equipped_footwork
        this._footwork_inventory = [] 

        this.equipped_skills=equipped_skills 
        this.skill_inventory = skill_inventory || []

        this._weapon = weapon
        this._armor = armor

        this._hour=hour

        this._day=day
        this._age = 4320 + this.day
        // NOW that everything has a value, we refresh the UI
        this.refreshStats()
    }

    //1day worth of internal energy = 1 internal energy
    //time is counted in minutes: 1 day = 1440 min  1 month = 30 day ,1 year = 360 day
    // --- Basic Info ---
    get breathing_tech() { return this._breathing_tech }
    set breathing_tech(v) { this._breathing_tech = v }

    get weapon() { return this._weapon }
    set weapon(v) { this._weapon = v }

    get name() { return this._name }
    set name(v) { this._name = v 
        this.refreshStats() }

    get age() { return this._age }

    get currency() { return this._currency }
    set currency(v) { this._currency = v 
        this.refreshStats() }

    get hour(){return this._hour}
    set hour(v){this._hour=v}

    get day(){return this._day}
    set day(v){this._day=v;this.refreshIneractionsDailies()
        this._age = 4320 + this.day}

    get location() { return this._location }
    set location(v) { this._location = v 
        this.refreshStats() }

    // --- Vital Stats (with Clamping) ---
    get health() { return this._health }
    set health(v) { 
        this._health = Math.max(0, Math.min(v, this._max_health)) 
        this.refreshStats() 
    }

    get max_health() { return this._max_health }
    set max_health(v) { this._max_health = v 
        this.refreshStats() }

    get stamina() { return this._stamina }
    set stamina(v) { 
        this._stamina = Math.max(0, Math.min(v, this._max_stamina)) 
        this.refreshStats() 
    }

    get max_stamina() { return this._max_stamina }
    set max_stamina(v) { 
        this._max_stamina = v 
        this.refreshStats() }

    get internal_energy() { return this._internal_energy }
    set internal_energy(v) { 
        this._internal_energy = Math.max(0, Math.min(v, this._max_internal_energy)) 
        this.refreshStats() 
    }

    get max_internal_energy() { return this._max_internal_energy }
    set max_internal_energy(v) { 
        this._max_internal_energy = v 
        this.refreshStats() }

    // --- Combat & Mental Stats ---
    get atk_stat() { return this._atk_stat }
    set atk_stat(v) { 
        if(this._atk_stat+v>this.realm.stat_cap){
            sendConsoleMessage("Stat cap reached, breakthrought and keep training.")
        }else{
            this._atk_stat = v
            this.refreshStats()
        } 
    }

    get spe_def(){return this._spe_def}

    get def_stat() { return this._def_stat }
    set def_stat(v) {
         if(this._def_stat+v>this.realm.stat_cap){
            sendConsoleMessage("Stat cap reached, breakthrought and keep training.")
        }else{
            this._def_stat = v 
            this.refreshStats()
        } 
        }
    get vitality_stat() { return this._vitality_stat }
    set vitality_stat(v) {
         if(this._vitality_stat+v>this.realm.stat_cap){
            sendConsoleMessage("Stat cap reached, breakthrought and keep training.")
        }else{
            this._vitality_stat = v 
            this._max_health=(this._vitality_stat * 5) + (this.realm.id * 50)
            this.refreshStats()
        } 
    }   
    get endurance_stat() { return this._endurance_stat }
    set endurance_stat(v) {
         if(this._endurance_stat+v>this.realm.stat_cap){
            sendConsoleMessage("Stat cap reached, breakthrought and keep training.")
            return false
        }else{
            this._endurance_stat = v 
            this._max_stamina=(this._endurance_stat * 5) + (this._endurance_stat.id * 50)
            this.refreshStats()
            return true
        } 
    }   
    get speed_stat() { return this._speed_stat }
    set speed_stat(v) {
        if(this._speed_stat+v>this.realm.stat_cap){
            sendConsoleMessage("Stat cap reached, breakthrought and keep training.")
        }else{
            this._speed_stat = v 
            this.refreshStats()
        } 
    }

    get spe_atk() { return this._spe_atk }
    set spe_atk(v) {
         if(this._spe_atk+v>this.realm.stat_cap){
            sendConsoleMessage("Stat cap reached, breakthrought and keep training.")
        }else{
            this._spe_atk = v 
            this.refreshStats()
        } 
        }

    get mind_stat() {return this._mind_stat }
    set mind_stat(v) {
        if(this._mind_stat+v>this.realm.stat_cap){
            sendConsoleMessage("Stat cap reached, breakthrought and keep training.")
        }else{
            this._mind_stat = v 
            this.refreshStats()
        } 
    }

    attemptBreakthrought(){
        const realmIndex = realm_db.findIndex(r => r.id === this.realm.id && r.stage === this.realm.stage)
        const nextRealm = realm_db[realmIndex+1]
        if (!nextRealm) {
            sendConsoleMessage("You have reached the end of the path. There is no realm beyond.")
            return
        }

        // 1. Hard Requirements (The "Floor")
        if (this._internal_energy < nextRealm.req_energy) {
            sendConsoleMessage(`Your Qi is too weak. You need at least ${nextRealm.req_energy} energy to even try.`)
            return
        }
        if (!nextRealm.requirement()) {
            sendConsoleMessage("You have not fulfilled the worldly requirements for this realm.")
            return
        }

        // 2. Calculate Success Chance
        // How prepared are you? (Current Stats / Realm Cap)
        const energyRatio = this._internal_energy / this.realm.energy_cap
        const statRatio = this.atk_stat / this.realm.stat_cap
        
        // Base 30% + up to 35% from Energy + up to 35% from Stats = Max 100%
        let successChance = 30 + (energyRatio * 35) + (statRatio * 35)
        successChance = Math.min(100, Math.floor(successChance))

        sendConsoleMessage(`Attempting breakthrough to ${nextRealm.name}... Success Chance: ${successChance}%`)

        // 3. The Roll
        const roll = Math.floor(Math.random() * 100) + 1

        if (roll <= successChance) {
            // SUCCESS
            this.realm = nextRealm
            
            // Multiplier bonus: Using the manual + the new realm's power
            const boost = Math.floor(this.breathing_tech.multiplier * nextRealm.multiplier * 2)
            this._max_health += boost * 5
            this._max_internal_energy += boost * 10
            this._internal_energy = 0 // Reset energy as it was consumed for the jump
            setTimeout(() => {
                sendConsoleMessage(`[SUCCESS] You have ascended to the ${nextRealm.name} ${nextRealm.stage || ""} realm!`)
            }, "2000")    
            
            
            // Body Reconstruction flavor
            if (nextRealm.stage === "Peak") {
                sendConsoleMessage("Your bones crack and reform. Your body has been reconstructed.")
                this._max_health += 50
            }
        } else {
            // FAIL (Qi Deviation)
            const injury = Math.floor(this._max_health * 0.3)
            this._health -= injury
            this._internal_energy = Math.floor(this._internal_energy * 0.5) // Lose half your stored energy

            sendConsoleMessage(`[FAILURE] Qi Deviation! You lost control of your energy.`)
            sendConsoleMessage(`You took ${injury} damage and lost half your stored Qi.`)
        }

        this.refreshStats()

    }
    
    refreshStats() {
        const playerSection = document.querySelector("#player-section")
        
        // 1. Check for the Qi Discovery message before updating HTML
        if (this._max_internal_energy > 0 && this._was_qi_hidden) {
            sendConsoleMessage("You can finally feel Qi, the force of the universe. You can now harness its power by refining it in the dantian.")
            this._was_qi_hidden = false // Track this in your constructor (set to true initially)
        }

        // 2. Determine visibility classes
        const titleClass = (this.title && this.title !== "") ? "" : "hide"
        const energyClass = (this._max_internal_energy > 0) ? "" : "hide"
        const realmName = this.realm ? `${this.realm.name} ${this.realm.stage || ""}` : "Mortal 2"
        
        if(this._health>this._max_health){this._health=this._max_health}
        if(this._stamina>this._max_stamina){this._stamina=this._max_stamina}
        
        // 3. Rebuild the section
        playerSection.innerHTML = `
            <h2 id="player-name">${this.name}</h2>
            <ul id="player-info">
                <li class="${titleClass}"><p id="player-title">${this.title || ""}</p></li>
                <li><p id="player-age">Age: ${(this.age/360).toFixed(0)}</p></li>
                <li><p id="player-realm">Realm: ${realmName}</p></li>
                <li><p id="player-curency">Money: $${this.currency}</p></li>
                
                <li>
                    Health: 
                    <progress id="health" max="${this._max_health}" value="${this._health}"></progress>
                    <span>${this._health}/${this._max_health}</span>
                </li>
                
                <li>
                    Stamina: 
                    <progress id="stamina" max="${this._max_stamina}" value="${this._stamina}"></progress>
                    <span>${this._stamina}/${this._max_stamina}</span>
                </li>
                
                <li class="${energyClass}">
                    Internal Energy: 
                    <progress id="internal-energy" max="${this._max_internal_energy}" value="${this._internal_energy}"></progress>
                    <span>${this._internal_energy}/${this._max_internal_energy}</span>
                </li>
                
                <li class="hide">Alignment: //to do</li>
            </ul>
        `
        const statsToCap = [
            "_atk_stat", 
            "_spe_atk", 
            "_def_stat", 
            "_spe_def", 
            "_speed_stat", 
            "_mind_stat",
            "_vitality_stat",
            "_endurance_stat"
        ]
        
        const cap = this.realm.stat_cap
        // 2. Loop through and enforce the limit
        statsToCap.forEach(stat => {
            if (this[stat] > cap) {
                this[stat] = cap
                console.log(`${stat} reached the cap of the ${this.realm.name} realm.`)
            }
    })
    }
    sleep(){
        if(this._hour<300){
            console.log("didn't sleep much")
        }else{
            this._day++
        }

        this._hour=360
        this.refreshTime()
    }

    passHour(hour){
        this.passMinute(60*hour)
        
    }
    passMinute(min){
        this._hour+=min
        if(this._hour>=1440){
            this._day++
            this._hour-=1440
        }
        this.refreshTime()
    }
    passDay(day){
        this.passHour(24*day)
    }

    cultivate(half_day){
        if(this._stamina<(half_day*50)){
            sendConsoleMessage("You are too exhausted to cultivate")
        }else{
            this.internal_energy+=(this._breathing_tech.energy_boost)*half_day
            this._max_internal_energy+=(this._breathing_tech.energy_boost)*half_day
            this.passHour(half_day*12)
            this.reduceStamina((half_day*50))
            sendConsoleMessage("You cultivated for "+ half_day*12+" hour and gained "+(this._breathing_tech.energy_boost)*half_day+" day worth of Internal Energy.")
        }
    }

    refreshTime(){
        const temp_hour = Math.floor(this._hour / 60) // => 4 => the times 3 fits into 13  
        let temp_minute = this._hour % 60          // => 1

        if(temp_minute==0){temp_minute="00"}
        else if(temp_minute<10){temp_minute="0"+temp_minute}

        const time_element = document.querySelector('#time')
        time_element.innerHTML=`Day:${this._day} Time: <span class="bold">${temp_hour}:${temp_minute}</span>`
        console.log("hour: " + this._hour + "days: "+this._day)
    }
    
    handleDeath() {
    }

    heal(hp_to_heal){
        if(hp_to_heal+this.health>=this.max_health){this.fullHeal()}else{this.health+=hp_to_heal}
        
    }
    damage(hp_to_lose){
        if(this.health-=hp_to_lose-this.def_stat >=0){
            this.health-=hp_to_lose
        }
        else{
            //to do death    
        }
    }

    regenStamina(stamina_gain){
        const temp_stam = this._stamina
        if(stamina_gain+this._stamina>=this.max_stamina){this.fullStaminaRegen()}else{this.stamina+=stamina_gain}
        sendConsoleMessage("Stamina +"+(this._stamina-temp_stam))
    }
    reduceStamina(stamina_loss){
        if(this.stamina-=stamina_loss >=0){
            this.stamina-=stamina_loss
            sendConsoleMessage("Stamina -"+stamina_loss)
        }
        else{
            sendConsoleMessage("No Stamina Remaining")
            this.stamina=0
        }
    }
    regenEnergy(energy_gain){
        if(energy_gain+this.internal_energy>=this.max_internal_energy){this.fullEnergyRegen()}else{this.internal_energy+=energy_gain}
    }
    reduceEnergy(energy_loss){
        if(this.internal_energy-=energy_loss >=0){
            this.internal_energy-=energy_loss
        }
        else{
            this.internal_energy=0
        }
    }

    fullHeal(){
        this.health=this.max_health
    }
    fullStaminaRegen(){
        this.stamina=this.max_stamina
    }
    fullEnergyRegen(){
        this.internal_energy=this.max_internal_energy
    }

    fullRestoration(){
        this.fullHeal()
        this.fullEnergyRegen()
        this.fullStaminaRegen()
    }

    //locations
    getExits(){
        return this.location.exits
    }
    move(place_name){
        this.location=worldMap[place_name]
        this.location.onEnterMethod()
        refreshWorldSection()
        this.passMinute(10)
        this.processEvent("MOVE", place_name, 1)
    }
    getInteractions(){
        return this.location.interactions
    }

    //inventory
    addItem(item){
        if(!(item instanceof ITEM)){
            console.log("Not an item: addItem(item)")
            return
        }
        // 2. Find if an item with the same ID already exists in the inventory
        const existingItem = this._inventory.find(i => i.id === item.id)

        if (existingItem) {
            existingItem.addAnother()
            console.log(`Increased quantity of ${existingItem.name} to ${existingItem.quantity}`)
            sendConsoleMessage("Added another " + existingItem.name)
        }else{
            this._inventory.push(item)
        }
        this.processEvent("COLLECT",item,1)
        this.refreshInventory()

    }
    removeItem(index){
        const quant_element = document.querySelector("#item-quanta")
        if(!this._inventory[index] instanceof ITEM){
            console.log("Not an item: removeItem(index)")
            return
        }
        if(this._inventory[index].quantity>1){
            sendConsoleMessage("Remove 1")
            this._inventory[index].quantity--
            quant_element.innerHTML= `Quantity: ${this._inventory[index].quantity}`
        }else{
            this._inventory.splice(index, 1)
            this.refreshInventory()
        }
    }

    refreshInventory(){
        
        const inv_selection = document.querySelector("#inv-section")
        if(inv_selection.classList.contains("hide")){return}
        const detail_element = document.querySelector("#item-details")
        const inventory = document.querySelector('#inventory')
        inventory.innerHTML=""
        detail_element.innerHTML=""
        if(this._inventory.length===0){
            detail_element.innerHTML="<h2>Your inventory is empty</h2>"
            return
        }
        this._inventory.forEach((item, index) => {
            if (!(item instanceof ITEM)) { 
                console.log("Inventory Problem, a non item in the inventory list.") 
            }
            
            const item_div = document.createElement("div");
            item_div.innerHTML = `<p>${item.name}</p>`;
            item_div.classList.add("item-div");
            
            item_div.addEventListener("click", () => {
                detail_element.innerHTML = `
                    <h2>${item.name}</h2>
                    <h3>${item.rarity}</h3>
                    <h3>Value: ${item.value}</h3>
                    <h3 id="item-quanta">Quantity: ${item.quantity}</h3>
                    <p>${item.desc}</p>
                `;
                
                const useBtn = document.createElement("button");
                useBtn.innerHTML = "Use";
                useBtn.addEventListener("click", () => {
                    item.use(this); 
                    this.removeItem(index); 
                    this.refreshInventory(); 
                });
                
                detail_element.appendChild(useBtn);
            });
            
            inventory.appendChild(item_div);
        });
    }
    
    learn_skill(skill_manual){
        if(!(skill_manual instanceof SKILL_BOOK)){console.log("Not a manual");return;}
        this.skill_inventory.push(skill_manual.content)
        sendConsoleMessage(`Your learned ${skill_manual.content.name}`)
    }
    learn_breathing_tech(breathing_manual){
        if(!(breathing_manual instanceof BREATHING_TECHNIQUE_BOOK) || this._breathing_tech_inventory.findIndex(t => t.name === breathing_manual.content.name) !== -1){
            console.log("Not a manual or technique already learned");
            return;
        }
        console.log("Learning")
        this._breathing_tech_inventory.push(breathing_manual.content)
        sendConsoleMessage(`Your learned ${breathing_manual.content.name}`)
    }

    get_weapon_type(){
        return this.weapon ? this.weapon.type : weapon_db[0] // Return "Fist" if no weapon equipped
    }

    hasQi(){
        return this.max_internal_energy>0
    }

    //status effects
    addEffect(effect){
        if(effect instanceof STATUS_EFFECT){
            this.status_effects.push(effect)
        }else{console.log("Tried to add non status effect to enemy")}
    }

    effectTurn(){
        for (const effect of this.status_effects) {
            console.log(effect)

            effect.turn(this)
            if(effect.duration<=0){
                this.status_effects.splice(this.status_effects.indexOf(effect),1)
                sendConsoleMessage(`You are no longer ${effect.adj}.`)
            }
        }
    }

    //Quests manager
    addQuest(quest){
        this.active_quest.push(quest)
        sendConsoleMessage(`[New Quest] ${quest.title} : ${quest.description}`)
    }
    processEvent(eventType,target,amount=1){
        console.log(`Processing event: ${eventType} for target: ${target} with amount: ${amount}`)
        for (let quest of this.active_quest) {
            // Check if the quest cares about this specific event and target
            if (!quest.isCompleted && quest.eventType === eventType && quest.target === target) {
                quest.updateProgress(amount);
            }
        }
    }
    

}
