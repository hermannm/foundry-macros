const effect = {
    name: "Rage",
    modifiers: [
        {
            stat: "ac",
            value: -1,
            type: "untyped",
        },
        {
            stat: "damage",
            value: 4,
            type: "untyped",
            damageType: "cold",
        },
    ],
    iconPath: "systems/pf2e/icons/features/ancestry/darkvision.jpg",
};
(async () => {
    if((actor.data.data.customModifiers[effect.modifiers[0].stat] || []).some(customModifier => customModifier.name === effect.name)){
        if (token.data.effects.includes(effect.iconPath)) {
            await token.toggleEffect(effect.iconPath);
        }
        for(let modifier of effect.modifiers){
            await actor.removeCustomModifier(modifier.stat, effect.name);
        }
        await actor.update({'data.attributes.hp.temp': 0});
    }else{
        const itemID =
            actor.items
                .filter(item => item.data.type === "action")
                .find(item => item.data.name === effect.name)?._id ??
            actor.items.find(item => item.data.name === effect.name)?._id;
        if(itemID){
            game.pf2e.rollItemMacro(itemID);
        }
        if (!token.data.effects.includes(effect.iconPath)) {
            await token.toggleEffect(effect.iconPath);
        }
        for(let modifier of effect.modifiers){
            await actor.addCustomModifier(
                ...[modifier.stat, effect.name, modifier.value, modifier.type],
                ...(modifier.damageType ? [undefined, modifier.damageType] : [])
            );
        }
        const tempHP = (actor.data.data.details.level.value + actor.data.data.abilities.con.mod);
        if (actor.data.data.attributes.hp.temp < tempHP) {
            await actor.update({'data.attributes.hp.temp': tempHP});
        }
    }
})();