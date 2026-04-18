function sendConsoleMessage(text){
    const console=document.querySelector("#game-console")
    const message=document.createElement("p")
    message.classList.add("console-message")
    message.innerHTML=text
    console.prepend(message)
}

function clearConsole(){
    const console=document.querySelector("#game-console")
    console.innerHTML=""
}