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
        if (this.condition()) {
            this.interaction()
            this.done++
            this.done_today++
            return true
        }
        return false
    }
}

class FIGHT_INTERACTION extends INTERACTION {
    constructor(name, done, done_today, condition, enemy) {
        // We pass 'null' for the interaction because we define it below
        super(name, done, done_today, ()=>{},condition)
        this.enemy = enemy
    }
    execute(){
        this.done++
        this.done_today++
        const fight_manager = new CombatManager(player, this.enemy, false)
        hide_game_tabs()
        fight_manager.start_fight()
    }
}

class GET_ITEM_INTERACTION extends INTERACTION {
    constructor(name, done, done_today, condition, item) {
        super(name, done, done_today, null, condition)
        this.item = item
    }
    execute(){
        this.done++
        this.done_today++
        this.interaction()
    }
    interaction() {
        player.addItem(this.item)
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
        [],
        () => true,
        () => { sendConsoleMessage("You enter your grand residence.") }
    ),

    "player_garden": new LOCATION(
        "Residence Garden",
        "A peaceful obsidian-rock garden with a small pond. The air is still and calming.",
        ["player_home"],
        ["leisure"],
        () => true,
        null
    ),

    "player_training_ground": new LOCATION(
        "Private Training Ground",
        "A reinforced stone courtyard for practicing basic forms and tempering the body.",
        ["player_home"],
        ["foundational_training","training_ground_sparring"],
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
    "foundational_training": new INTERACTION(
        "Foundational Training", 0, 0,
        () => {
            const chance = Math.floor(Math.random() * 4) + 1
            let msg = ""
            switch (chance) {
                case 1: msg = "Horse stances make your legs pillars of iron. (+1 Max Stam)"; player.max_stamina++; break
                case 2: msg = "Striking the post callouses your knuckles. (+1 Atk)"; player.atk_stat++; break
                case 3: msg = "Shadowboxing perfects your defense. (+1 Def)"; player.def_stat++; break
                default: msg = "Weight training builds a solid foundation. (+1 Max HP)"; player.max_health++; break
            }
            player.reduceStamina(20)
            player.passHour(4)
            sendConsoleMessage(msg)
        },
        () => {
            if (player.stamina < 20) {
                sendConsoleMessage("You are too exhausted to train.")
                return false
            }
            if(this.done_today>3){
                sendConsoleMessage("You can't push yourself anymore before getting injured.")
            }
            return true
        },
        4 // Limit
    ),

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
        black_dragon_ball
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
        }
    }