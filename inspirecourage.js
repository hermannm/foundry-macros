const itemName = "Spell Effect: Inspire Courage";
const imgPath = "systems/pf2e/icons/spells/inspire-courage.jpg";
(async () => {
    if (actor.items.find(item => item.data.name === itemName)){
        if (token.data.effects.includes(imgPath)){
            await token.toggleEffect(imgPath);
        };
        await actor.items.find(item => item.data.name === itemName).delete();
    }else{
        if (!token.data.effects.includes(imgPath)){
            await token.toggleEffect(imgPath);
        };
        await actor.createOwnedItem(game.items.getName(itemName));
    }
})();