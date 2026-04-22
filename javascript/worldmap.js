class LOCATION {
    constructor(name, desc, exits, interactions, canEntersMethod, onEnterMethod) {
        this.name = name
        this.desc = desc
        this.exits = exits
        this.interactions = interactions
        // If no function is provided, default to a function that returns true (can enter)
        this.canEntersMethod = canEntersMethod || (() => true)
        // If no function is provided, default to an empty function
        this.onEnterMethod = onEnterMethod || (() => {})
    }
}

class INTERACTION {
    constructor(name, done, done_today, interaction, condition) {
        this.name = name
        this.done = done
        this.done_today = done_today
        this.interaction = interaction || (() => {})
        this.condition = condition || (() => true)
    }

    execute() {
        this.interaction()
        this.done++
        this.done_today++
        player.processEvent("INTERACT", this.name, 1)
        return true
        
    }
}

class FIGHT_INTERACTION extends INTERACTION {
    constructor(name, done, done_today, condition, enemy) {
        // We pass 'null' for the interaction because we define it below
        super(name, done, done_today, ()=>{
            const fight_manager = new CombatManager(player, this.enemy, false)
            hide_game_tabs()
            fight_manager.start_fight()
    },condition)
        this.enemy = enemy
    }
}

class GET_ITEM_INTERACTION extends INTERACTION {
    constructor(name, done, done_today, condition, item) {
        super(name, done, done_today, () => {
            player.addItem(this.item)
        }, condition)
        this.item = item
    }
}

class SHOP_INTERACTION extends INTERACTION {
    constructor(name, done, done_today, condition, shop_inventory) {
        super(name, done, done_today, () => {
            this.openShop()
        }, condition)
        this.shop_inventory = shop_inventory
    }

    openShop(){
        const popupContent = document.createElement("div")
        popupContent.classList.add("popup-content")
        popupContent.innerHTML = ""
        popupContent.innerHTML = `
            <h2>${this.name}</h2>
            <div class="shop-items">
            </div>
            <div id="item-description">
                
            </div>
            <button id="close-shop-btn" onclick="closePopup()">Back</button>
        `
        closePopup() 
        openPopup(popupContent)
        const itemDescription = popupContent.querySelector("#item-description")
        this.shop_inventory.forEach((item,index) => {
            if(item instanceof ITEM) {
                const itemElement = document.createElement("div")
                itemElement.classList.add("item-div", `${item.tier.name.toLowerCase()}`)
                itemElement.innerHTML = `
                    <p>${item.name}</p>
                `
                popupContent.querySelector(".shop-items").appendChild(itemElement)
                itemElement.addEventListener("click", () => {
                    //open description popup for the item with the option to buy it
                    itemDescription.innerHTML = `
                        <h3>${item.name}</h3>
                        <p>${item.desc}</p>
                        <p>Value: ${item.value} coins</p>
                        <button id="buy-item-btn">Buy</button>
                    `
                    const buyButton = itemDescription.querySelector("#buy-item-btn")
                    buyButton.addEventListener("click", () => {
                        //buy something
                        if(player.currency >= item.value) {
                            player.currency -= item.value
                            player.addItem(item)
                            this.removeItem(index)
                            sendConsoleMessage(`You bought ${item.name} for ${item.value} coins.`)
                            itemDescription.innerHTML = ""
                            
                            this.openShop()
                        } else {
                            sendConsoleMessage("You don't have enough coins to buy this item.")
                        }
                    })
                })
            }
        });
    }

    removeItem(index){
        if(!this.shop_inventory[index] instanceof ITEM){
            return
        }
        if(this.shop_inventory[index].quantity>1){
            this.shop_inventory[index].quantity--
        }else{
            this.shop_inventory.splice(index, 1)
        }
    }

}

const worldMap = {
    // --- CENTRAL HUB ---
    "sky_demon_order": new LOCATION(
        "Sky Demon Order (Main Base)",
        "A central valley hub shaped like a lotus flower, connecting all major sectors of the Ten Thousand Mountains.",
        ["academy", "player_home"],
        [],
        () => false, // Currently locked by your logic
        null
    ),

    // --- PLAYER HOME ---
    "player_home": new LOCATION(
        "Heir's Residence: Entrance Hall",
        "The central hall of your estate. To the north lies your garden, and other rooms branch off from here.",
        ["player_garden", "player_training_ground", "player_bedroom", "player_kitchen", "player_library", "academy"],
        ["test_shop"],
        () => true,
        () => { sendConsoleMessage("You enter your grand residence.") }
    ),

    "player_garden": new LOCATION(
        "Residence Garden",
        "A peaceful obsidian-rock garden with a small pond. The air is still and calming.",
        ["player_home"],
        ["leisure","mind_training"],
        () => true,
        null
    ),

    "player_training_ground": new LOCATION(
        "Private Training Ground",
        "A reinforced stone courtyard for practicing basic forms and tempering the body.",
        ["player_home"],
        ["def_spe_training","atk_spe_training","speed_training","atk_training","def_training","stamina_training","training_ground_sparring"],
        () => true,
        null
    ),

    "player_bedroom": new LOCATION(
        "Heir's Bedroom",
        "Your private sleeping quarters. A heavy incense burner helps steady your breathing.",
        ["player_home"],
        ["sleep"],
        () => true,
        null
    ),

    "player_kitchen": new LOCATION(
        "Private Kitchen",
        "A well-stocked kitchen where servants prepare spirit-rich meals for your recovery.",
        ["player_home"],
        ["eat","test_give_item"],
        () => true,
        null
    ),

    "player_library": new LOCATION(
        "Residence Library",
        "Shelves filled with basic scrolls and personal records of your progress.",
        ["player_home"],
        ["read"],
        () => true,
        null
    ),

    // --- THE DEMONIC ACADEMY ---
    "academy": new LOCATION(
        "Demonic Academy Gates",
        "The entrance to the academy, which opens only once every ten years.",
        ["sky_demon_order", "academy_plaza"],
        [],
        () => {
            if (player.day >= 30) return true
            if (player.day == 30) {
                sendConsoleMessage("It has been a month, you can set out to the Academy Gates for the entrance Ceremony.")
                return true
            }
            return false
        },
        () => { sendConsoleMessage("The heavy gates of the Academy loom over you.") }
    ),

    "academy_plaza": new LOCATION(
        "Central Academy Plaza",
        "The site of the opening ceremony where cadets receive their color-coded tags.",
        ["academy", "headmaster_office", "dormitories", "testing_arenas"],
        [],
        () => true,
        null
    ),

    "headmaster_office": new LOCATION(
        "Chief Headmaster's Office",
        "Lee Hwamyung's office, where he manages academy testing and stops clan foul play.",
        ["academy_plaza"],
        [],
        () => false,
        null
    ),

    "infirmary": new LOCATION(
        "Academy Infirmary",
        "Baek Jongmeng's medical station where injured cadets are treated.",
        ["academy"],
        [],
        () => false,
        null
    ),

    "dormitories": new LOCATION(
        "Cadet Dormitory Wing",
        "Divided between the high-status Six Clan quarters and the dilapidated outskirts.",
        ["academy_plaza"],
        [],
        () => false,
        null
    ),

    "testing_arenas": new LOCATION(
        "Testing Arenas",
        "Reinforced stone pits used for the 4th and 6th stage duels against Instructors and Elders.",
        ["academy_plaza", "academy_library", "sealed_demon_cave"],
        [],
        () => false,
        null
    ),

    "sealed_demon_cave": new LOCATION(
        "Sealed Demon Cave",
        "A trap-filled cavern system used for the 5th stage test requires Master-level Qi.",
        ["testing_arenas"],
        [],
        () => false,
        null
    ),

    // --- THE PRECIOUS LIBRARY TOWER ---
    "academy_library": new LOCATION(
        "Precious Library Floor 1",
        "Basics of Qi. Center: 1st Sapphire Monolith with markings by Cheon Ma and the Sword Demon.",
        ["testing_arenas", "library_floor_2"],
        [],
        () => false,
        null
    ),

    "library_floor_2": new LOCATION(
        "Precious Library Floor 2",
        "Intermediate manuals. Center: 2nd Sapphire Monolith (2nd formation).",
        ["academy_library", "library_floor_3"],
        [],
        () => false,
        null
    ),

    "library_floor_3": new LOCATION(
        "Precious Library Floor 3",
        "Advance Prowess manuals. Center: 3rd Sapphire Monolith.",
        ["library_floor_2", "library_floor_4"],
        [],
        () => false,
        null
    ),

    "library_floor_4": new LOCATION(
        "Precious Library Floor 4",
        "Expert Prowess (400 books). Center: A cut-down Sapphire Monolith (4th formation).",
        ["library_floor_3", "library_floor_5"],
        [],
        () => false,
        null
    ),

    "library_floor_5": new LOCATION(
        "Precious Library Floor 5",
        "Top-tier Clan manuals (20 books). Center: Final Sapphire Monolith.",
        ["library_floor_4", "library_basement"],
        [],
        () => false,
        null
    ),

    "library_basement": new LOCATION(
        "Secret Library Basement",
        "The hidden floor containing the Sword Demon's Right Arm and his absolute inheritance.",
        ["library_floor_5"],
        [],
        () => false,
        null
    )
}

const world_interactions = {
    // --- REST & RECOVERY ---
    "sleep": new INTERACTION(
        "Sleep", 0, 0,
        () => {
            player.sleep()
            player.fullRestoration()
            const msgs = [
                "You wake up feeling completely refreshed.",
                "The silk blankets provided a deep rest. Your vitality returns.",
                "The morning sun hits your face you feel your power restored."
            ]
            sendConsoleMessage(msgs[Math.floor(Math.random() * msgs.length)])
        },
        () => true, // Condition
        1 // Limit: Once per day
    ),

    "eat": new INTERACTION(
        "Eat Spirit Meal", 0, 0,
        () => {
            const meals = [
                "You enjoy roasted pheasant glazed in wild honey.",
                "Tender braised pork belly melts on your tongue.",
                "A rich lamb stew warms your core."
            ]
            player.health += 30
            player.stamina += 30
            player.passHour(1)
            sendConsoleMessage(meals[Math.floor(Math.random() * meals.length)] + " (+30 HP / +30 Stamina)")
        },
        () => true,
        3 // Limit: 3 meals a day
    ),

    "leisure": new INTERACTION(
        "Relax in Garden", 0, 0,
        () => {
            const chance = Math.floor(Math.random() * 3) + 1
            if (chance === 1) {
                sendConsoleMessage("You watch the koi fish. Your breathing slows. (+10 Stamina)")
                player.regenStamina(10)
            } else if (chance === 2) {
                sendConsoleMessage("You study rare herbs. Your mind sharpens. (+1 Mind)")
                player.mind_stat++
            } else {
                sendConsoleMessage("A light breeze rustles the trees. You feel lighter. (+15 Stamina)")
                player.regenStamina(15)
            }
            player.passHour(2)
        },
        () => true,
        5 // Limit
    ),

    // --- TRAINING ---
    "stamina_training": new INTERACTION("Stamina Training",0,0,(()=>{
        const chance = Math.floor(Math.random() * 2) + 1
        player.reduceStamina(player.stamina)
        switch (chance) {
            case 1:
                sendConsoleMessage("You run laps around the training ground. Your legs feel stronger. (+1 Endurance)")
                break
            case 2:
                sendConsoleMessage("You do intense exercises. Your stamina capacity expands. (+1 Endurance)")
                break
            
        }
        player.endurance_stat++
        player.passHour(4)
         // Fully exhaust stamina to reflect intense training
    }),()=>true),
    "speed_training": new INTERACTION("Speed Training",0,0,(()=>{
        const chance = Math.floor(Math.random() * 2) + 1
        player.reduceStamina(player.stamina)
        switch (chance) {
            case 1:
                sendConsoleMessage("You practice swift footwork drills. Your reflexes sharpen. (+1 Speed)") 
                break
            case 2:
                sendConsoleMessage("You spar with a training dummy. Your movements become more fluid. (+1 Speed)")
                break
            
        }
        player.speed_stat++
        player.passHour(4)
    }),()=>true),
    "atk_training": new INTERACTION("Attack Training",0,0,(()=>{
        const chance = Math.floor(Math.random() * 2) + 1
        player.reduceStamina(player.stamina)
        switch (chance) {
            case 1:
                sendConsoleMessage("You strike the heavy bag repeatedly. Your punches grow stronger. (+1 Attack)")
                break
            case 2:
                sendConsoleMessage("You practice powerful strikes on a training dummy. Your attack power increases. (+1 Attack)")
                break
        }
        player.atk_stat++
        player.passHour(4)
    }),()=>true),
    "def_training": new INTERACTION("Defence Training",0,0,(()=>{
        const chance = Math.floor(Math.random() * 2) + 1
        player.reduceStamina(player.stamina)
        switch (chance) {
            case 1:
                sendConsoleMessage("You practice blocking and parrying. You become more resilient. (+1 Defence)")
                break
            case 2:
                sendConsoleMessage("You spar with a partner focusing on defense. Your learns to absorb blows and redirect force. (+1 Defence)")
                break
        }
        player.def_stat++
        player.passHour(4)
    }),()=>true),
    "mind_training": new INTERACTION("Meditation",0,0,(()=>{
        const chance = Math.floor(Math.random() * 2) + 1
        player.reduceStamina(player.stamina)
        switch (chance) {
            case 1:
                sendConsoleMessage("You sit in quiet contemplation. Your mind becomes clearer. (+1 Mind)")
                break
            case 2:
                sendConsoleMessage("You practice mindfulness exercises. Your focus improves. (+1 Mind)")
                break
        }
        player.mind_stat++
        player.passHour(2)
    }),()=>true),
    "def_spe_training": new INTERACTION("Qi Resilience Training",0,0,(()=>{
        const chance = Math.floor(Math.random() * 2) + 1
        player.reduceStamina(player.stamina)
        switch (chance) {
            case 1:
                sendConsoleMessage("You practice with a Qi-resistant training dummy. Your spirit defense strengthens. (+1 Spe. Defence)")
                break
            case 2:
                sendConsoleMessage("You meditate while enduring controlled Qi shocks. Your spirit resilience increases. (+1 Spe. Defence)")
                break
        }
        player.spe_def++
        player.passHour(4)
    }),()=>player.hasQi()),
    "atk_spe_training": new INTERACTION("Qi Attack Training",0,0,(()=>{
        const chance = Math.floor(Math.random() * 2) + 1
        player.reduceStamina(player.stamina)
        switch (chance) {
            case 1:
                sendConsoleMessage("You practice projecting Qi energy. Your spirit attack power grows. (+1 Spe. Attack)")
                break
            case 2:
                sendConsoleMessage("You meditate while focusing on Qi projection. Your spirit attack sharpens. (+1 Spe. Attack)")
                break
        }
        player.spe_atk++
        player.passHour(4)
    }),()=>player.hasQi()),


    "read": new INTERACTION(
        "Read", 0, 0,
        () => {
            sendConsoleMessage("You study the records of previous Heirs. Your mind sharpens. (+1 Mind)")
            player.mind_stat++
            player.reduceStamina(30)
            player.passHour(5)
        },
        () => {
            if (player.stamina < 30 ) {
                sendConsoleMessage("You are too tired to focus on ancient texts.")
                return false
            }
            if (this.done_today>2){
                sendConsoleMessage("Touch some grass.")
                return false
            }
            return true
        },
        2 // Limit
    ),

    // --- SPECIAL ACTIONS ---
    "training_ground_sparring": new FIGHT_INTERACTION(
        "Sparring", 0, 0,
        () => player.health > 10,
        createRandomEnemy(realm_db[0],"Sparring Partner")//want to take the player realm as first parameter but it does work todo
    ),

    "test_give_item": new GET_ITEM_INTERACTION(
        "Test Item", 0, 0,
        () => true,
        item_db.black_dragon_ball
    ),
    "test_shop": new SHOP_INTERACTION(
        "Test Shop", 0, 0,
        () => true,
        [item_db.training_axe, item_db.training_spear, item_db.training_staff, item_db.training_dagger, item_db.training_sword]
    )
}

function refreshWorldSection(){
    const world_container=document.querySelector("#world-container")
    world_container.innerHTML=""
    document.querySelector("#location-name").innerHTML=player.location.name
    document.querySelector("#location-desc").innerHTML =player.location.desc
                                
    for (const place of player.getExits()) {
        
        if(worldMap[place].canEntersMethod()){
            const button = document.createElement("button")
            button.classList.add("world-place")
            button.innerHTML=worldMap[place].name
            button.addEventListener("click",()=>{
                player.move(place)
            })

            addToolTip(button,worldMap[place].desc)
            world_container.appendChild(button)
        }
    }
    const interaction_container=document.querySelector("#interaction-container")
    interaction_container.innerHTML=""
    for (const interaction of player.getInteractions()) {
        const button = document.createElement("button")
        button.classList.add("world-place")
        button.innerHTML=world_interactions[interaction].name
        button.addEventListener("click",()=>{
            world_interactions[interaction].execute()
        })
        interaction_container.appendChild(button)
    }
    
}
function refreshIneractionsDailies(){
        for (const interaction of Object.values(world_interactions)) {
            interaction.done_today=0
            if(interaction instanceof SHOP_INTERACTION){
                //todo refill shop
            }
        }
    }