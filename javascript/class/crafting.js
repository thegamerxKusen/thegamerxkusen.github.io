class RECIPE{
    constructor(ingredients, result,instrument){
        this.name = item_db[result.item].name;
        
        this.ingredients = ingredients;
        this.instrument = instrument;//Where you can craft: ex: pot, forge, crafting table...
        //ingredients/result template: [{item:"itemName", amount: 1,keep: true}, {item:"itemName2", amount: 2,keep: false}]
        this.result = result;
        this.description =  item_db[result.item].desc;
    }

    canCraft(){
        return this.hasAllIngredients()
    }

    hasAllIngredients(){
        for(const ingredient of this.ingredients){
            const item = item_db[ingredient.item]
            const quantity = item_db[ingredient.item].quantity
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
            const item = item_db[ingredient.item]
            const quantity = item_db[ingredient.item].quantity
            player.removeItem(item,quantity)
        }
        while(this.result.amount > 0){
            player.addItem(item_db[this.result.item])
            this.result.amount -= 1
        }
        sendConsoleMessage(`You crafted ${item_db[this.result.item].name} using the ${this.instrument}`)
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