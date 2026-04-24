class ITEM{
    constructor(name, desc, value, tier = item_tier_db.common,quantity,use) {
        
        this.name = name
        this.desc = desc
        this.value = value
        this.tier = tier
        this.quantity = Number(quantity) || 1
        if(!(this instanceof MANUAL)|| !(this instanceof WEAPON_ITEM)){this.use = use || (() => {})}
    }
    addAnother() {
        // Ensure quantity is a number before adding
        if (isNaN(this.quantity)) {
            this.quantity = 1
        }
        this.quantity++
    }
}

class WEAPON_ITEM extends ITEM{
    constructor(name, desc, value, atk_bonus,spe_atk_bonus, speed_bonus, tier,type) {
        super(name, desc, value, tier,1,()=>{console.log("Use")
            //equip weapon
            player.equipWeapon(this)
        })
        this.type = type 
        this.atk_bonus = atk_bonus
        this.speed_bonus = speed_bonus
        this.spe_atk_bonus = spe_atk_bonus
    }
}

class ARMOR_ITEM extends ITEM{
    constructor(name, desc, value,def_modifier,spe_def_modifier, speed_modifier, tier) {
        super(name, desc, value, tier,1,()=>{
            //equip armor
            player.equipArmor(this)
        })
        this.def_modifier=def_modifier
        this.spe_def_modifier=spe_def_modifier
        this.speed_modifier=speed_modifier
    }
}

class MANUAL extends ITEM {
    constructor(name, desc, value, tier) {
        super(name, desc, value, item_tier_db.common, 1) // Manuals are always common and quantity is 1
        this.value = value
        this.tier = tier
    }
    
}

class BOOK extends MANUAL{
    constructor(name,desc,value,tier,page,learn,reqWisdom, learnEffect){
        super(name,desc,value,tier)
        this.learn = learn
        this.page = page
        this.currentPage = 0
        this.reqWisdom = reqWisdom

        this.learnEffect = learnEffect || ((user) => {
            sendConsoleMessage(`You finished reading [${this.name}]. (+1 Wisdom)`)
            user.processEvent("READ",this,1)
            user.wisdom++
        });
    }
    readMinute(user,minutesSpent){
        if(!(user instanceof PLAYER)){console.log("Not A Player");return}
        if (user.wisdom < this.reqWisdom) {
            sendConsoleMessage(`The concepts in [${this.name}] are too profound for you to grasp right now. (Requires ${this.reqWisdom} Wisdom)`)
            return false
        }

        if (this.currentPage >= this.page) {
            sendConsoleMessage(`You have already finished reading [${this.name}].`)
            return false
        }

        const speedMultiplier = user.wisdom / this.reqWisdom
        const pagesRead = Math.floor(minutesSpent * 0.5 * speedMultiplier)
        user.passMinute()

        this.currentPage += pagesRead
        gameAudio.playSFX("read")
    
        if (this.currentPage >= this.page) {
            this.currentPage = this.page
            sendConsoleMessage(`You spent ${minutesSpent} minutes and read the final pages of [${this.name}].`);
            
            // Trigger the book's reward!
            this.learnEffect(user);
        } else {
            sendConsoleMessage(`You spent ${minutesSpent} minutes reading [${this.name}]. You are on page ${this.currentPage}/${this.page}.`);
        }

        return true
    }
}

class SKILL_BOOK extends MANUAL {
    constructor(name, desc, value, content, tier) {
        super(name, desc, value, tier)
        this.content = content
    }
    use(user){
        user.learn_skill(this)
    }
}

class BREATHING_TECHNIQUE_BOOK extends MANUAL {
    constructor(name, desc, value, content, tier) {
        super(name, desc, value, tier,()=>player.learn_breathing_tech(this))
        this.content = content
    }
    
}

class FIGHT_ITEM extends ITEM{
    constructor(name, desc, value, tier,quantity,effect) {
        super(name, desc, value, tier,quantity)
        this.effect = effect // A function that defines what the item does in combat
    }
    useInCombat(user,target){
        this.effect(user,target)
        this.quantity--
    }
}


const item_db ={
    fists: new WEAPON_ITEM("Fists","Your own fists, not very strong but always with you.",0,0,0,0,item_tier_db.trash,weapon_db[0]),
    training_dagger: new WEAPON_ITEM("Training Dagger","A basic dagger used for training, better than nothing.",0,0,0,0,item_tier_db.trash,weapon_db[1]),
    training_sword: new WEAPON_ITEM("Training Sword","A basic sword used for training, better than nothing.",0,0,0,0,item_tier_db.trash,weapon_db[2]),
    training_spear: new WEAPON_ITEM("Training Spear","A basic spear used for training, better than nothing.",0,0,0,0,item_tier_db.trash,weapon_db[3]),
    training_axe: new WEAPON_ITEM("Training Axe","A basic axe used for training, better than nothing.",0,0,0,0,item_tier_db.trash,weapon_db[4]),
    training_staff: new WEAPON_ITEM("Training Staff","A basic staff used for training, better than nothing.",0,0,0,0,item_tier_db.trash,weapon_db[5]),
    black_dragon_ball: new ITEM("Black Dragon Ball","A medicine ball of the cult that was created by the founding clan leader of the Poison Clan named Baek Yu. Allow the person who consume it to gain at least 20 years' worth of internal energy.",5000,item_tier_db.epic, (user) => {
        if(!user._breathing_tech){
            //qi deviation
            user.damage(user._max_health/2)
            sendConsoleMessage("You suffered Qi Deviation and wasted the medicine.")
            user.passHour(2)
            return
        }
        user._max_internal_energy+=100
        user.internal_energy+=100
    }),
    bandage: new FIGHT_ITEM("Bandage","A simple bandage that can be used to stop bleeding and close wounds, it can be used in combat to heal some health.",50,item_tier_db.common,3,(user,target)=>{
        const heal_amount = 5
        user.heal(heal_amount)
        user.effectCleanse("bleeding")
    }),
    three_powers_breathing: new BREATHING_TECHNIQUE_BOOK(breathing_tech_db.three_powers_breathing.name,breathing_tech_db.three_powers_breathing.description,1000,breathing_tech_db.three_powers_breathing,item_tier_db.common),
    basic_breathing_manual: new BREATHING_TECHNIQUE_BOOK(breathing_tech_db.basic_qi_tech.name,breathing_tech_db.basic_qi_tech.description,1000,breathing_tech_db.basic_qi_tech,item_tier_db.common),
    linen_martial_attire: new ARMOR_ITEM("Linen Martial Attire","A classic martial robe of medium quality, only offer resistance against cold wind.",100,1,0,0,item_tier_db.trash)
}

const book_db = {
    // ==========================================
    // --- THE DEMONIC PRINCE'S CORE LIBRARY ---
    // ==========================================
    chronicles_heavenly_demon: new BOOK(
        "Chronicles of the Heavenly Demon",
        "A historical record of the first Cult Leader who unified the Ten Thousand Mountains.",
        50, item_tier_db.common, 150, 
        null, 
        5 // reqWisdom
    ),

    poetry_blood_plum: new BOOK(
        "Poetry of the Blood Plum",
        "A collection of poems written by a demonic elder. It teaches the elegance hidden within ruthlesness.",
        150, item_tier_db.uncommon, 200, 
        null, 
        15
    ),

    art_of_deception: new BOOK(
        "The Art of Deception and Shadow",
        "A ruthless tactical manual outlining how to use poison, spies, and misdirection.",
        300, item_tier_db.rare, 350, 
        null, 
        25
    ),

    hundred_poisons: new BOOK(
        "Hundred Poisons Compendium",
        "An illustrated guide to deadly herbs, venoms, and their antidotes. Smells of dried blood.",
        500, item_tier_db.rare, 500, 
        null, 
        40
    ),

    anatomy_severed_meridians: new BOOK(
        "Anatomy of the Severed Meridians",
        "A forbidden text detailing how to forcefully reroute Qi through the body.",
        2000, item_tier_db.rare, 100, // Short but incredibly dense!
        null, 
        100
    ),

    guide_to_weeds: new BOOK(
        "Guide to Common Weeds",
        "A terribly written, half-eaten pamphlet about grass. Found in the outer sect trash.",
        1, item_tier_db.trash, 10, 
        null, 1
    ),

    muddy_boot_ode: new BOOK(
        "Ode to a Muddy Boot",
        "A poem written by a very drunk outer disciple. It doesn't even rhyme.",
        2, item_tier_db.trash, 5, 
        null, 1
    ),

    cooking_with_qi: new BOOK(
        "Cooking with Qi",
        "A recipe book for spiritual meals. Half the pages are stained with soy sauce.",
        20, item_tier_db.common, 50, 
        null, 5
    ),

    merchant_arithmetic: new BOOK(
        "Basic Arithmetic for Merchants",
        "A boring but practical ledger on how to calculate copper coins.",
        30, item_tier_db.common, 100, 
        null, 8
    ),

    jianghu_geography: new BOOK(
        "Geography of the Jianghu",
        "A massive, incredibly dense encyclopedia of every sect, river, and mountain in the Central Plains.",
        200, item_tier_db.rare, 800, // Massive time sink!
        null, 10
    ),

    woodcutter_tale: new BOOK(
        "Tale of the Iron Woodcutter",
        "A children's fable about a man who chopped trees for 100 years until his axe split a mountain.",
        15, item_tier_db.common, 30, 
        null, 3
    ),

    drunken_beggar_musings: new BOOK(
        "Musings of the Drunken Beggar",
        "A chaotic diary detailing a beggar's drunken brawls and strange staggering movements.",
        80, item_tier_db.uncommon, 60, 
        null, 20
    ),

    courtesan_smile: new BOOK(
        "The Heavenly Courtesan's Smile",
        "A scandalous romance novel very popular among the young disciples.",
        100, item_tier_db.uncommon, 300, 
        null, 12
    ),

    falling_leaf_meditations: new BOOK(
        "Meditations on a Falling Leaf",
        "A short, philosophical text written by an eccentric Taoist.",
        150, item_tier_db.uncommon, 40, 
        null, 25
    ),

    swindlers_guide: new BOOK(
        "The Swindler's Guide to Jianghu",
        "A banned book detailing how to fake realms and cheat at dice and cards game.",
        250, item_tier_db.epic, 120, 
        null, 30
    ),

    iron_skin_masochist: new BOOK(
        "Iron Skin Regimen for the Insane",
        "A bizarre training manual that involves striking yourself with rocks.",
        300, item_tier_db.rare, 200, 
        null, 25
    ),

    beast_core_study: new BOOK(
        "A Study of Beast Cores",
        "Detailed anatomical drawings of Demonic Beasts and where to harvest their cores.",
        400, item_tier_db.rare, 250, 
        null, 35
    ),

    // ==========================================
    // --- EPIC & LEGENDARY (Massive Power, High Risk) ---
    // ==========================================

    bloodstained_diary: new BOOK(
        "Bloodstained Diary",
        "The personal journal of a swordmaster who went mad. The writing is frantic and soaked in dried blood.",
        800, item_tier_db.epic, 150, 
        null, 50
    ),

    star_gazing_divination: new BOOK(
        "Star-Gazing Divination",
        "An ancient text predicting the flow of destiny based on the night sky.",
        1000, item_tier_db.epic, 600, 
        null, 65
    ),

    nine_hells_scroll: new BOOK(
        "Scroll of the Nine Hells",
        "A terrifying parchment that burns to the touch. Reading it feels like swallowing hot coals.",
        3000, item_tier_db.legendary, 50, // Short, but painful
        null, 90
    ),

    wordless_scroll: new BOOK(
        "The Wordless Scroll",
        "A completely blank scroll made of indestructible silk. Only true geniuses can see the words.",
        5000, item_tier_db.legendary, 1, // Only 1 page!
        null, 150 // Extreme stat check
    ),

    // ==========================================
    // --- QUEST ITEMS & EVIDENCE ---
    // ==========================================

    scented_pink_envelope: new BOOK(
        "Scented Pink Envelope",
        "A sealed letter meant for Elder Baek. It smells strongly of cheap perfume.",
        0, item_tier_db.quest, 5, 
        null, 10
    ),
}