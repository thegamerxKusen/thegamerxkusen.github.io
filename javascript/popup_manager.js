function closePopup(){
    const popupScreen = document.getElementById('popup-screen');
    popupScreen.innerHTML = '';
    hide(popupScreen);
}

function openPopup(content){
    const popupScreen = document.getElementById('popup-screen');
    popupScreen.appendChild(content);
    show(popupScreen);
}