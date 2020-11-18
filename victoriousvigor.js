const effect = {
    name: "Victorious Vigor",
    tempHP: actor.data.data.abilities.con.mod,
    iconPath: "systems/pf2e/icons/spells/restoration.jpg",
};
(async () => {
    if (token.data.effects.includes(effect.iconPath)) {
        await token.toggleEffect(effect.iconPath);
        await actor.update({"data.attributes.hp.temp": 0});
    }else{
        if (actor.data.data.attributes.hp.temp < effect.tempHP) {
            const itemID =
                actor.items
                    .filter(item => item.data.type === "action")
                    .find(item => item.data.name === effect.name)?._id ??
                actor.items.find(item => item.data.name === effect.name)?._id;
            if(itemID){
                game.pf2e.rollItemMacro(itemID);
            }
            await actor.update({"data.attributes.hp.temp": effect.tempHP});
            await token.toggleEffect(effect.iconPath);
        }else{
            ui.notifications.warn(`Previous temporary hit points exceed what you would gain from ${effect.name}.`);
        }
    }
})();
