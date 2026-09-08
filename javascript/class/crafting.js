class RECIPE{
    constructor(ingredients, result,instrument){
        this.name = result.name;
        this.description = result.description;
        this.ingredients = ingredients;
        this.instrument = instrument;//Where you can craft: ex: pot, forge, crafting table...
        //ingredients/result template: [{item:"itemName", amount: 1,keep: true}, {item:"itemName2", amount: 2,keep: false}]
        this.result = result;
        
    }

    canCraft(){
        return this.hasAllIngredients()
    }

    hasAllIngredients(){
        for(const ingredient of this.ingredients){
            const item = ingredient.item
            const quantity = ingredient.amount
            if(!player.hasItem(item,quantity)){
                return false
            }
        }
        return true
    }
    craft(){
        if(!this.canCraft()){
            console.log("You should hide the craft button if the player can't craft this recipe")
            return false;
        }
        for(const ingredient of this.ingredients){
            const item = ingredient.item
            const quantity = ingredient.amount
            player.removeItem(item,quantity)
        }
        while(this.result.amount > 0){
            player.addItem(this.result.item)
            this.result.amount -= 1
        }
        sendConsoleMessage(`You crafted ${this.result.item} using the ${this.instrument}`)
        return true
    }
    
}
const instrument_db = ["Pot","Forge","Crafting Table"]
const recipe_db = {
    "simple_poison" : new RECIPE(
        [
            {item: "water", amount: 1, keep: false},//todo make a well to draw from
            {item: "herb", amount: 1, keep: false},//
            {item: "poison_herb", amount: 1, keep: false}, //search in the forest, can be found once you have read a book to recognise simple herbs
        ],
        {item: "simple_poison", amount: 1},instrument_db[0]
    )
}//todo make the item lol