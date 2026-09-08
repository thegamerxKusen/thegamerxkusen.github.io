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
        player.processEvent("INTERACT", this, 1)
        refreshWorldSection()
        return true
    }
}

class NO_EVENT_INTERACTION extends INTERACTION{
    constructor(name, done, done_today, interaction, condition) {
        super(name,done,done_today,interaction,condition)

    }

    execute() {
        this.interaction()
        this.done++
        this.done_today++
        refreshWorldSection()
        return true
    }
}


class UNIQUE_INTERACTION extends INTERACTION{
    constructor(name,done,interaction,condition){
        super(name,done,0,interaction,condition)
    }
    execute() {
        this.interaction()
        if(this.done>0){console.error("Shouldn't be executed")}
        this.condition=()=>false
        this.done++
        this.done_today++
        player.processEvent("INTERACT", this, 1)
        refreshWorldSection()
        return true   
    }
}
class UNIQUE_DIALOGUE_INTERACTION extends UNIQUE_INTERACTION{
    constructor(name,done,interaction,condition,dialogues){
        super(name,done,interaction,condition)
        this.dialogues=dialogues
    }
    execute() {
        if(this.done>0){console.error("Shouldn't be executed")}
        this.condition=()=>false
        this.done++
        this.done_today++
        player.processEvent("INTERACT", this, 1)
        refreshWorldSection()
        this.openDialogue()
        return true   
    }
    sendDialogueMessage(text){
        if(this.dialogues.length===0){
            this.interaction()
            return closePopup()}
        
        const popup=document.querySelector(".popup-dialogues")
        const message=document.createElement("p")
        message.classList.add("console-message")
        message.innerHTML=text
        popup.append(message)
    }
    dialogue(){
            const dialogue = this.dialogues[0]
            this.dialogues.shift()
            this.sendDialogueMessage(dialogue)
        }
    openDialogue(){
        const popupContent = document.createElement("div")
        popupContent.classList.add("popup-content")
        popupContent.innerHTML = ""
        popupContent.innerHTML = `
            <h2>${this.name}</h2>
            <div class="popup-dialogues">
                
            </div>
        `
        closePopup() 
        openPopup(popupContent)
        this.dialogue()
        document.querySelector(".popup-dialogues").addEventListener("click",()=>this.dialogue())
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
    constructor(name, done, done_today, condition, item,sfx) {
        super(name, done, done_today, () => {
            player.addItem(this.item)
            if(sfx) {
                gameAudio.playSFX(sfx)
            }
        }, condition)
        this.item = item
        this.sfx = sfx
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
                    if(item.value ===0){
                        itemDescription.innerHTML = `
                        <h3>${item.name}</h3>
                        <p>${item.desc}</p>
                        <button id="buy-item-btn">Take</button>
                    `
                    }
                    const buyButton = itemDescription.querySelector("#buy-item-btn")
                    
                    buyButton.addEventListener("click", () => {
                        //buy something
                        if(item.value === 0) {
                            player.addItem(item)
                            this.removeItem(index)
                            sendConsoleMessage(`You took ${item.name}.`)
                            itemDescription.innerHTML = ""
                            gameAudio.playSFX("buy")
                            this.openShop()
                        }
                        else if(player.currency >= item.value) {
                            player.currency -= item.value
                            player.addItem(item)
                            this.removeItem(index)
                            sendConsoleMessage(`You bought ${item.name} for ${item.value} coins.`)
                            itemDescription.innerHTML = ""
                            gameAudio.playSFX("buy")
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
            console.log("Not an item: removeItem(index)")
            return
        }
        if(this.shop_inventory[index].quantity>1){
            this.shop_inventory[index].quantity--
        }else{
            this.shop_inventory.splice(index, 1)
        }
    }
}

class BOOKSHELF_INTERACTION extends INTERACTION {
    constructor(name, done, done_today, condition, books) {
        super(name, done, done_today, () => {
            this.openBookshelf()
        }, condition)
        this.books = books
    }

    openBookshelf(){
        const popupContent = document.createElement("div")
        popupContent.classList.add("popup-content")
        popupContent.innerHTML = ""
        popupContent.innerHTML = `
            <h2>${this.name}</h2>
            <div class="book-list">
            </div>
            <div id="item-description">
                
            </div>
            <button id="close-shop-btn" onclick="closePopup()">Back</button>
        `
        closePopup() 
        openPopup(popupContent)
        const bookDescription = popupContent.querySelector("#item-description")
        this.books.forEach((book,index) => {
            if(book instanceof BOOK) {
                const bookElement = document.createElement("div")
                bookElement.innerHTML = `
                    <p>${book.name}</p>
                `
                bookElement.classList.add("book-div", book.tier.name.toLowerCase())
                
                popupContent.querySelector(".book-list").appendChild(bookElement)
                bookElement.addEventListener("click", () => {
                    //open description popup for the item with the option to buy it
                    bookDescription.innerHTML = `
                        <h3>${book.name}</h3>
                        <p>${book.desc}</p>
                        <p>Required Wisdom: ${book.reqWisdom} </p>
                        <p id="book-progress">${book.currentPage}/${book.page}Pages</p>
                        <form id="minutes-reading" min="1">
                            <label for="time-read">Time Spent:<input required type="number" id="time-read" name="time-read"> </input></label>
                            <input type="submit" id="read-btn"></button>
                        </form>
                    `
                    const readBtn = bookDescription.querySelector("read-btn")
                    
                    const minutesForm = document.querySelector("#minutes-reading")
                    minutesForm.addEventListener("submit",function(event){
                        event.preventDefault()//stop the submit refresh
                        console.log(book)
                        book.readMinute(player,parseInt(document.querySelector("#time-read").value))  
                        
                    })

                })
            }
        });
    }

}

class CRAFTING_MENUE_INTERACTION extends INTERACTION {
    constructor(name, done, done_today, condition,instrument) {
        super(name, done, done_today,()=>{this.openCraftingStation()} ,condition)
        this.instrument = instrument
    }
    openCraftingStation(){
        const popupContent = document.createElement("div")
        popupContent.classList.add("popup-content")
        popupContent.innerHTML = ""
        popupContent.innerHTML = `
            <h2>${this.name}</h2>
            <div class="recipe-list">
            </div>
            <div id="recipe-description">
                
            </div>
            <button id="close-shop-btn" onclick="closePopup()">Back</button>
        `
        closePopup() 
        openPopup(popupContent)
        for(const recipe of player.known_recipes){
            if(recipe instanceof RECIPE && recipe.instrument === this.instrument){
                const recipeElement = document.createElement("div")
                recipeElement.classList.add("recipe-div")
                recipeElement.innerHTML = `
                    <p >${recipe.name}</p>`
                if(recipe.canCraft()){recipeElement.classList.add("recipe-craftable")}
                else{recipeElement.classList.add("recipe-uncraftable")}//You can still select them to look up the ingredients but its slighty dimmer or craftable is lighter, ill see
                // Create recipe element and append to recipe-list
                recipeElement.addEventListener("click",()=>{
                    const recipeDescription = popupContent.querySelector("#recipe-description")
                    recipeDescription.innerHTML = ``
                    recipeDescription.innerHTML = `
                    <h3>${recipe.name} : ${recipe.result.amount}</h3>
                    <p>${recipe.description}</p>
                    <h4>Ingredients:</h4>
                    <div id="ingredients-list"></div>
                    <button id="craft-btn">Craft</button>
                    `
                    if(!recipe.canCraft()){hide(document.querySelector("#craft-btn"))}else{
                        document.querySelector("#craft-btn").addEventListener("click",()=>{
                            recipe.craft()
                        })
                    }
                    const ingredientElement = document.querySelector("#ingredients-list")
                    for(const ingredient of recipe.ingredients){
                       const ingredientDiv = document.createElement("div")
                       ingredientDiv.innerHTML = `<p>${ingredient.name}: ${ingredient.quantity}</p>`
                       ingredientElement.appendChild(ingredientDiv)
                    }
                    
                })
            }
        }
    }
}

const worldMap = {
    //--- Accessible anywhere---//
    "nearby_forest": new LOCATION(
        "Nearby Forest",
        "A dense forest with towering trees and a variety of wildlife. The air is filled with the scent of pine and earth.",
        ["player_home"],
        ["gather_herbs","gather_wood"],
        () => player.hasRead(book_db.guide_to_weeds), // Unlocks after reading the "Guide to Common Weeds"
        null
    ),
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
        ["player_garden","nearby_forest","player_training_ground", "player_bedroom", "player_kitchen", "player_study", "academy"],
        [],
        () => true,
        null
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
        ["training_weapon_rack","vitality_training","def_spe_training","atk_spe_training","speed_training","atk_training","def_training","stamina_training","training_ground_sparring"],
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
        ["eat"],
        () => true,
        null
    ),

    "player_study": new LOCATION(
        "Residence study",
        "Shelves filled with basic scrolls and personal records of your progress.",
        ["player_home"],
        ["starter_home_bookshelf","write_diary_save","read_diary_load"],
        () => true,
        null
    ),

    // --- THE DEMONIC ACADEMY ---
    "academy": new LOCATION(
        "Demonic Academy Gates",
        "The entrance to the academy, which opens only once every ten years.",
        ["sky_demon_order", "academy_plaza", "headmaster_office", "dormitories","infirmary", "sealed_demon_cave", "testing_arenas","academy_training_area","academy_cafeteria"],
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
        "Central Plaza",
        "The site of the opening ceremony where cadets receive their color-coded tags.",
        ["academy"],
        ["academy_first_test"],
        () => player.passed_first_test || world_interactions.academy_first_test.condition,
        null
    ),

    "headmaster_office": new LOCATION(
        "Chief Headmaster's Office",
        "Lee Hwamyung's office, where he manages academy testing and stops clan foul play.",
        ["academy_plaza"],
        [],
        () => player.passed_first_test,
        null
    ),

    "infirmary": new LOCATION(
        "Academy Infirmary",
        "Baek Jongmeng's medical station where injured cadets are treated.",
        ["academy"],
        [],
        () => player.passed_first_test,
        null
    ),

    "dormitories": new LOCATION(
        "Cadet Dormitory Wing",
        "Divided between the high-status Six Clan quarters and the dilapidated outskirts.",
        ["academy_plaza"],
        [],
        () => player.passed_first_test,
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
    "academy_training_area":new LOCATION(
        "Training Area",
        "The place where the young demons learn martial arts every day with vigorous training.",
        ["academy_plaza","academy"]
        ,[]
        ,()=>player.passed_first_test
        ,null),
    "academy_cafeteria":new LOCATION(
        "Cafeteria",
        "The place where the young demons eat healthy food to get strong fast.",
        ["academy"]
        ,[]
        ,()=>player.passed_first_test
        ,null),

    // --- THE PRECIOUS LIBRARY TOWER ---
    "academy_library": new LOCATION(
        "Precious Library",
        "The greatest treasure of the Heavenly Demon Sect containing thousands of martial arts manual.",
        ["academy"],//add library floors
        [],
        () => player.passed_first_test,
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
    }),()=>player.stamina===player.max_stamina),
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
    }),()=>player.stamina===player.max_stamina),
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
    }),()=>player.stamina===player.max_stamina),
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
    }),()=>player.stamina===player.max_stamina),
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
    }),()=>player.stamina===player.max_stamina),
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
    }),()=>player.hasQi()&&player.stamina===player.max_stamina),
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
    }),()=>player.hasQi()&&player.stamina===player.max_stamina),
    "vitality_training":new INTERACTION("Vitality Training",0,0,(()=>{
        player.reduceStamina(player.stamina)
        sendConsoleMessage("You injure yourself repeatedly to train your vitality. (+1 Vitality)")    
        player.vitality_stat++
        player.passHour(4)}),
        ()=>player.stamina>=player.max_stamina

    ),


    // --- SPECIAL ACTIONS ---
    "training_ground_sparring": new FIGHT_INTERACTION(
        "Sparring", 0, 0,
        () => player.health === player.max_health,
        createRandomEnemy(realm_db[0],"Sparring Partner")//todo to take the player realm as first parameter but it doesnt work 
    ),

    "test_give_item": new GET_ITEM_INTERACTION(
        "Test Item", 0, 0,
        () => true,
        item_db.black_dragon_ball
    ),
    "training_weapon_rack": new SHOP_INTERACTION(
        "Weapon Rack", 0, 0,
        () => true,
        [item_db.training_axe, item_db.training_spear, item_db.training_staff, item_db.training_dagger, item_db.training_sword]
    ),
    "starter_home_bookshelf": new BOOKSHELF_INTERACTION("Bookshelf",0,0,()=>true,
    [
        book_db.chronicles_heavenly_demon,
        book_db.poetry_blood_plum,
        book_db.art_of_deception,
        book_db.hundred_poisons,
        book_db.anatomy_severed_meridians,
        book_db.jianghu_geography,
        
        book_db.guide_to_weeds,
        book_db.muddy_boot_ode,
        book_db.merchant_arithmetic,
        book_db.woodcutter_tale,
        book_db.courtesan_smile,
        book_db.falling_leaf_meditations,
    ]),
    "write_diary_save": new NO_EVENT_INTERACTION("Write Diary [SAVE]",0,0,()=>{
        //saving function
        save()
    },()=>true),
    "read_diary_load": new NO_EVENT_INTERACTION("Read Diary [LOAD]",0,0,()=>{
        //loading function
        load()
    },()=>true),
    "academy_first_test": new UNIQUE_DIALOGUE_INTERACTION("Welcoming Ceremony",0,()=>{
        if(player.realm.id>=1){
            sendConsoleMessage("Having Enough Internal Energy you barrely managed to resist the Elder's attack and passed the test.")
            sendConsoleMessage("You now have access to the library to learn martial arts.")
        }else if(player.mind_strenght >= 60){
            sendConsoleMessage("While not having enough internal strenght you stayed still while your insides where ravaged with the strenghts of your mind.")
            sendConsoleMessage("Silent observer noticed you.")// add a reputation when there is  a system for it
            player.passed_first_test=true
        }else{
            sendConsoleMessage("After resisting for half a minute you started vomiting blood and collapsed on the ground.")
            sendConsoleMessage("You were sent out of the academy and your martial path has been cut short. You can still train at home but killing yourself is recomended.")
            worldMap.academy.canEntersMethod=()=>false
            player.move("player_home")
           
        }
    },()=>true,
    ["While still feeling nervous, you are overcome by exitment at the prospect of the Demonic Academy. As an heir to the academy people naturally turn their head towards you,but due to your common upbrininging, born to a mere maid of the lord, they quickly turn around.",
    "Right Guardian: -Silence. From now on you are no longer, sons and daughter of your clans or prince or princess but mere trainee. From now on you will answer everything by screaming 'MADO!' Understood?",
    "Trainees: -MADO!",
    "Right Guardian: -Now welcome the Music Clan's Leader for the First Test!",
    "Right Guardian: -For the first test you will have to stay up under a sound attack of Elder Hang Soyu.",
    "The Elder slowly sat down with her zither and gracefully played a single sweet note, but then you feel a shock waves shaking your insides."]),
    //nearby forest interactions
    "gather_herbs":new GET_ITEM_INTERACTION("Gather Herbs", 0, 0, () => true, item_db.herb),//todo fix, when i click it doesnt show a message the firstime, must be an event problem
    "gather_wood":new GET_ITEM_INTERACTION("Gather Wood", 0, 0, () => true, item_db.wood,"gather_wood")
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
        if(!world_interactions[interaction].condition()){}else{
            const button = document.createElement("button")
            button.classList.add("world-place")
            button.innerHTML=world_interactions[interaction].name
            button.addEventListener("click",()=>{
                world_interactions[interaction].execute()
                
            })
            interaction_container.appendChild(button)
        }
    }
    
}
function refreshInteractionsDailies(){
        for (const interaction of Object.values(world_interactions)) {
            interaction.done_today=0
            if(interaction instanceof SHOP_INTERACTION){
                //todo refill shop
            }
        }
    }

