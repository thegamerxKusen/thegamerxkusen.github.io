function save(){
    console.log("Game Saved Successfully!")
    saveSmth("player_data",player.save())
    sendConsoleMessage("Game Saved")
}

function load(){
    player = new PLAYER()
    player.load(loadSmth("player_data"))
    sendConsoleMessage("Game Loaded")
}

function saveSmth(name,value){
    
    localStorage.setItem(name,JSON.stringify(value))
}

function loadSmth(name){
    return JSON.parse(localStorage.getItem(name))
}