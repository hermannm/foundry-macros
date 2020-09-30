(async () => {
    if (actor.items.find(token => token.data.name === "Spell Effect: Inspire Courage")){
        if (token.data.effects.includes("systems/pf2e/icons/spells/inspire-courage.jpg")){
            await token.toggleEffect("systems/pf2e/icons/spells/inspire-courage.jpg")
        }
        await actor.items.find(token => token.data.name === "Spell Effect: Inspire Courage").delete();
    }else{
        if (!token.data.effects.includes("systems/pf2e/icons/spells/inspire-courage.jpg")){
            await token.toggleEffect("systems/pf2e/icons/spells/inspire-courage.jpg")
        }
        await actor.createOwnedItem(game.items.getName("Spell Effect: Inspire Courage"));
    }
})();