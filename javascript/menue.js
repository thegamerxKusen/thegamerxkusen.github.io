// Main Menue
let player = new PLAYER("Kusen",100,50,50,100,100,worldMap["player_home"],1,1,10,1,1,1,360,0,0,[item_db.black_dragon_ball],item_db.basic_qi_tech,null,null,null,[skill_db.demonic_roar,skill_db.iron_shoulder,skill_db.quick_jab,skill_db.dragon_breath]
    )

function hide_main_menue(){
    const main_menue_element = document.querySelector("#main-menue")
    hide(main_menue_element)
    return
}
function open_main_menue(){
    const main_menue_element = document.querySelector("#main-menue")
    hide(document.querySelector("#main-game"))
    hide(document.querySelector("#settings-menue"))
    show(main_menue_element)
    return
}
//usefull class
function hide(element){
    if(!element){
        console.log("Input problem: hide()")
    }
   if(element.classList.contains("hide")){
        console.log("Element already hidden, useless. hide()")
    }else{
        element.classList.add("hide")
    }
    return
}
function show(element){
    if(!element){
        console.log("Input problem: show()")
    }
    if(!element.classList.contains("hide")){
            console.log("Element already show, useless. show()")
    }else{
            element.classList.toggle("hide")
    }
    return
}

function toggle_dark_mode(){
    const body = document.querySelector("body")
    body.classList.toggle("dark-mode")
    
}

// Main Menue Options Class
function new_game(){
    //say , you have one year until the start of the demonic academy, train as you will
    hide_main_menue()
    hide(document.querySelector("#settings-menue"))
    show(document.querySelector("#main-game"))
    //open player creation tab
    //create player 
    player = new PLAYER("Kusen",100,50,50,100,100,worldMap["player_home"],1,1,1,1,1,1,1,360,0,0,[item_db.black_dragon_ball],item_db.basic_qi_tech,null,item_db.fists,null,[skill_db[0],skill_db[1],skill_db[2]]
    ,realm_db[0],[skill_db[0],skill_db[1],skill_db[2],skill_db[3],skill_db[4]])
    refreshWorldSection()
    player.refreshTime()
    sendConsoleMessage(`${player.name}, your entry to the demonic academy is imminent, as an heir to the Heavenly Demon's Cult, you shall uphold the honnor of the demon's blood. You have a month until school start, prepare yourself as best as you can.`)
}

function load_game(){

}
function open_settings(){
    hide(document.querySelector("#main-game"))
    hide_main_menue()
    show(document.querySelector("#settings-menue"))
}

//main-game tab selection
function hide_game_tabs(){
    hide(document.querySelector('#world-section'))
    hide(document.querySelector('#cultivation-section'))
    hide(document.querySelector('#fight-preparation'))
    hide(document.querySelector("#inv-section"))
    hide(document.querySelector("#quests-section"))
    hide(document.querySelector("#settings-section"))
    hide(document.querySelector("#fighting-screen"))
}
function open_world_tab(){
    hide_game_tabs()
    show(document.querySelector("#world-section"))
}
function open_cultivation_tab(){
    const cult_section = document.querySelector("#cultivation-section")
    hide_game_tabs()
    show(cult_section)
    console.log(player.breathing_tech)
    if(player.breathing_tech instanceof BREATHING_TECHNIQUE){
        cult_section.innerHTML=`
        <h2> Breathing Technique: </h2>
        <h3>${player.breathing_tech.name}</h3>
        <p>${player.breathing_tech.desc}</p>
        <h3>Cultivation Effect: ${player.breathing_tech.energy_boost}</h3>
        <h3>${player.breathing_tech.rarity}</h3>
        <button id="cultivate-day" onclick="player.cultivate(1)">Cultivate For 12 Hours</button>`
        
    }else{
        cult_section.innerHTML=`<h2>You have no Breathing Techniques equiped.</h2>`
    }
}


function open_preparation_tab(){
    hide_game_tabs()
    const stat_div = document.querySelector("#fighting-stats")
    stat_div.innerHTML=
    `
    <h3>Stat</h3>
    <p>Attack: ${player._atk_stat}</p>
    <p>Attack Spe.: ${player._spe_atk}</p>
    <p>Defence: ${player._def_stat}</p>
    <p>Defence Spe.: ${player._spe_def}</p>
    <p>Speed: ${player._speed_stat}</p>
    <p>Mind: ${player._mind_stat}</p>
    <p>Vitality: ${player._vitality_stat}</p>
    <p>Endurance: ${player._endurance_stat}</p>
    `
    const skill_selection = document.querySelector("#choose-skill")
    skill_selection.innerHTML=
    `
        <h3>Choose Skill</h3>
    `
    let i =0
    
    for (const skill of player.equipped_skills) {
        i++
        const current_i = i
        const button = document.createElement("button")
        button.textContent=skill.name
        button.id=`choose-skill-${current_i}`
        button.addEventListener("click",()=>{
            open_skill_inventory(current_i-1)
        })
        skill_selection.appendChild(button)
    }
    while (i<4){
        i++
        const current_i = i
        const button = document.createElement("button")
        button.textContent="empty"
        button.id=`choose-skill-${current_i}`
        button.addEventListener("click",()=>{
            open_skill_inventory(current_i-1)
        })
        skill_selection.appendChild(button)
    }
    show(document.querySelector("#fighting-stats"))
    show(skill_selection)
    show(document.querySelector("#fight-preparation"))
    hide(document.querySelector("#skill-inventory"))
}

function open_skill_inventory(slot_index){
    const skill_inventory = document.querySelector("#skill-inventory")
    show(skill_inventory)
    hide(document.querySelector("#fighting-stats"))
    skill_inventory.innerHTML=
    `
    <h2>Skill Inventory -- Skill Slot: ${slot_index+1} - ${document.querySelector("#choose-skill-"+(slot_index+1)).textContent}</h2>
    <div id="skill-container"></div>`
    const skill_container = document.querySelector("#skill-container")
    for (const skill of player.skill_inventory) {
        
        const skill_div = document.createElement("div")
        skill_div.classList.add("skill-inv-skill-box")
        skill_div.innerHTML=
        `
        <h3>${skill.name}</h3>
        <p>${skill.description}</p>
        <div class="skill-stats">
            <p>Base cost :${skill.basic_cost}</p>
            <p>Base speed :${skill.basic_speed}</p>
            <p>Base damage :${skill.basic_damage}</p>
        </div>
        `
        skill_div.addEventListener("click",()=>{
            player.equipped_skills[slot_index]=skill
            open_preparation_tab()
        })
        if(!player.equipped_skills.includes(skill)){
            skill_container.appendChild(skill_div)
        }
        
    }
}

function open_inventory_tab(){
    //refresh inventory
    hide_game_tabs()
    show(document.querySelector("#inv-section"))
    player.refreshInventory()
}
function open_quests_tab(){
    hide_game_tabs()
    show(document.querySelector("#quests-section"))
}

function open_settings_tab(){
    hide_game_tabs()
    show(document.querySelector("#settings-section"))
}

//fight screen manager
function open_fight_tab(){
    hide_game_tabs()
    show(document.querySelector("#fighting-screen"))
}

function hide_fight_btn(){
    hide(document.querySelector("#fight-main-buttons"))
    hide(document.querySelector("#fight-attack-menue"))
    hide(document.querySelector("#fight-items-menue"))
}

function fight_attack(){
    hide_fight_btn()
    show(document.querySelector("#fight-attack-menue"))
}
function fight_items(){
    hide_fight_btn()
    show(document.querySelector("#fight-items-menue"))
}

function fight_main(){
    hide_fight_btn()
    show(document.querySelector("#fight-main-buttons"))
}

//tooltip
function addToolTip(element,text){
    //if(!(element instanceof Element) || !(text instanceof String)){ console.log("Wrong tooltip");return}

    const tooltip = document.createElement("span")
    tooltip.classList.add("tooltip")
    tooltip.innerHTML=text
    element.classList.add("tooltip-recipient")
    element.appendChild(tooltip)
}