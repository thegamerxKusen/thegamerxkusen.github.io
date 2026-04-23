// Main Menue
let player

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
    gameAudio.playBGM()
    //say , you have one year until the start of the demonic academy, train as you will
    hide_main_menue()
    hide(document.querySelector("#settings-menue"))
    show(document.querySelector("#main-game"))
    //open player creation tab
    //create player 
    player = new PLAYER("Kusen",100,50,50,100,100,worldMap["player_home"],1,1,1,1,1,1,1,360,0,0,[item_db.black_dragon_ball,item_db.bandage,item_db.basic_breathing_manual,item_db.linen_martial_attire],null,null,null,footwork_tech_db.basic_evade,[skill_db[0],skill_db[1],skill_db[2]]
    ,realm_db[0],[skill_db[0],skill_db[1],skill_db[2],skill_db[3],skill_db[4]])
    refreshWorldSection()
    player.refreshTime()
    sendConsoleMessage(`${player.name}, your entry to the demonic academy is imminent, as an heir to the Heavenly Demon's Cult, you shall uphold the honnor of the demon's blood. You have a month until school start, prepare yourself as best as you can.`)
    player.addQuest(new PLACE_QUEST("The Beginning","To start your training and become stronger, go to the training ground to train your body.","player_training_ground",()=>{sendConsoleMessage('Its working baby')}))
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
    console.log(player._breathing_tech)
    if(player._breathing_tech instanceof BREATHING_TECHNIQUE){
        cult_section.innerHTML=`
        <h2> Breathing Technique: </h2>
        <h3>${player._breathing_tech.name}</h3>
        <p>${player._breathing_tech.desc}</p>
        <h3>Cultivation Effect: ${player._breathing_tech.energy_boost}</h3>
        <h3>${player._breathing_tech.tier}</h3>
        <button id="cultivate-day" onclick="player.cultivate(1)">Cultivate For 12 Hours</button>
        `
    }else{
        cult_section.innerHTML=`<h2>You have no Breathing Techniques equiped.</h2>`
    }
    if(player._breathing_tech_inventory.length>0){
        cult_section.innerHTML+=`
        <button id="switch-cult">Switch Technique</button>
        <div id="cultivation-inventory"></div>`
        const switch_btn = document.querySelector("#switch-cult")
        switch_btn.addEventListener("click",()=>{
            const cult_inv = document.querySelector("#cultivation-inventory")
            cult_inv.innerHTML=""
            for (const cult_tech of player._breathing_tech_inventory) {
                cult_inv.innerHTML+=`
                <div class="cultivation-tech-box">
                    <h4>${cult_tech.name}</h4>
                    <p>${cult_tech.desc}</p>
                    <p>Energy Boost: ${cult_tech.energy_boost}</p>
                    <p>Tier: ${cult_tech.tier}</p>
                    
                </div>
                `
                const tech_box = cult_inv.lastElementChild
                const equip_btn = document.createElement("button")
                equip_btn.textContent="Equip"
                equip_btn.addEventListener("click",()=>{
                    player.equipBreathingTech(breathing_manual)
                    open_cultivation_tab()
                })
                tech_box.appendChild(equip_btn)
                
            }
            }
        )
    }
    

}


function open_preparation_tab(){
    hide_game_tabs()
    const stat_div = document.querySelector("#fighting-stats")
    stat_div.innerHTML=
    `
    <h3>Stat</h3>
        <p class="tooltip-recipient">Attack: ${player._atk_stat}<span class="tooltip">Influence damage dealth with physical attacks.</span></p>
        <p class="tooltip-recipient">Attack Spe.: ${player._spe_atk}<span class="tooltip">Influence damage dealth with Qi based attacks.</span></p>
        <p class="tooltip-recipient">Defence: ${player._def_stat}<span class="tooltip">Influence the amount of damage taken by physical attacks.</span></p>
        <p class="tooltip-recipient">Defence Spe.: ${player._spe_def}<span class="tooltip">Influence the amount of damage taken by Qi based attacks.</span></p>
        <p class="tooltip-recipient">Speed: ${player._speed_stat}<span class="tooltip">Influence who attacks first.</span></p>
        <p class="tooltip-recipient">Mind: ${player._mind_stat}<span class="tooltip">Influence the effectiveness of cultivation and if you can learn a skill.</span></p>
        <p class="tooltip-recipient">Vitality: ${player._vitality_stat}<span class="tooltip">Influence Max Health.</span></p>
        <p class="tooltip-recipient">Endurance: ${player._endurance_stat}<span class="tooltip">Influence the ability to withstand fatigue.</span></p>
    `
    const skill_selection = document.querySelector("#choose-skill")
    skill_selection.innerHTML="<h3>Choose Skill</h3>"
    let i = 0  
    
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
    const weaponDiv = document.querySelector("#equiped-weapon")
    weaponDiv.classList.add("item-div")
    const armorDiv = document.querySelector("#equiped-armor")
    armorDiv.classList.add("item-div")
    const equipmentDetails = document.querySelector("#equipment-details")
    hide(equipmentDetails)
    if(player.weapon){
        const weapon = player.weapon
        weaponDiv.classList.add(weapon.tier.name.toLowerCase())
        weaponDiv.innerHTML=
        `
        <p>${weapon.name}</p>
        `
        weaponDiv.addEventListener("click",()=>{
            show(equipmentDetails)
            equipmentDetails.innerHTML=
            `
            <h2>${weapon.name}</h2>
            <h2>Bonus Stats:</p>
            <div class="">
                <p>Attack: ${weapon.atk_bonus} </p>
                <p>Spe Attack: ${weapon.spe_atk_bonus} </p>
                <p>Speed: ${weapon.speed_bonus} </p>
            </div>
            
            <p>${weapon.desc}</p>
            `
        })//name,type desc,def_bonus, atk_bonus, speed_bonus,
    }else{weaponDiv.innerHTML='<p>No Weapon Equiped</p>'}
    
    if(player.armor){
        const armor = player.armor
        armorDiv.classList.add(armor.tier.name.toLowerCase())
        armorDiv.innerHTML=
        `
        <p>${armor.name}</p>
        
        `
        armorDiv.addEventListener("click",()=>{
            show(equipmentDetails)
            equipmentDetails.innerHTML=
            `
            <h2>${armor.name}</h2>
            <h2>Bonus Stats:</p>
            <div class="">
            <p>Defense: ${armor.def_modifier} </p>
            <p>Spe Defense: ${armor.spe_def_modifier} </p>
            <p>Speed: ${armor.speed_modifier} </p></div>
            
            <p>${armor.desc}</p>
            `
        })
    }else{armorDiv.innerHTML='<p>No Armor Equiped</p>'}
    
    
    
    show(document.querySelector("#fighting-stats"))
    show(skill_selection)
    show(document.querySelector("#fight-preparation"))
}

function open_skill_inventory(slot_index){
    const skill_inventory = document.querySelector("#skill-inventory")
    skill_inventory.innerHTML=
    `
    <h2>Skill Inventory -- Skill Slot: ${slot_index+1} - ${document.querySelector("#choose-skill-"+(slot_index+1)).textContent}</h2>
    <div id="skill-container"></div>`
    
    const skill_container = document.querySelector("#skill-container")
    show(skill_inventory)
    if(player.equipped_skills[slot_index]){
        const selected_skill_div = document.createElement("div")
        selected_skill_div.classList.add("skill-inv-skill-box")
        selected_skill_div.innerHTML=
        `
        <h3>Current Skill: ${player.equipped_skills[slot_index].name}</h3>
        <p>${player.equipped_skills[slot_index].description}</p>
        <div class="skill-stats">
            <p>Base cost :${player.equipped_skills[slot_index].basic_cost}</p>
            <p>Base speed :${player.equipped_skills[slot_index].basic_speed}</p>
            <p>Base damage :${player.equipped_skills[slot_index].basic_damage}</p>
        </div>
        `
        skill_container.appendChild(selected_skill_div)
    }
    
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
    const active_quests_div = document.querySelector("#active-quests")
    active_quests_div.innerHTML=""
    for (const quests of player.active_quest) {
        const quest_div = document.createElement("div")
        quest_div.classList.add("quest-box")
        quest_div.innerHTML=
        `
        <h3>${quests.title}</h3>
        <p>${quests.description}</p>
        <p>${quests.target}: ${quests.currentAmount}/${quests.requiredAmount}</p>
        `
        active_quests_div.appendChild(quest_div)
    }
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