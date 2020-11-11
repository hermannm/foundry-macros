const modifiers = [
    {
        name: "Rage",
        category: "ac",
        value: -1,
        type: "untyped",
    },
    {
        name: "Fire",
        category: "damage",
        value: 4,
        type: "untyped",
    },
];
const imgPath = "systems/pf2e/icons/features/classes/dragon-instinct.jpg";
(async () => {
    if((actor.data.data.customModifiers[modifiers[0].category] || []).some(customModifier => customModifier.name === modifiers[0].name)){
        if (token.data.effects.includes(imgPath)) {
            await token.toggleEffect(imgPath);
        };
        for(let modifier of modifiers){
            await actor.removeCustomModifier(modifier.category, modifier.name);
        };
        await actor.update({'data.attributes.hp.temp': 0});
    }else{
        if (!token.data.effects.includes(imgPath)) {
            await token.toggleEffect(imgPath);
        };
        game.pf2e.rollItemMacro("hHtq5EnPeeQ6tXzK");
        for(let modifier of modifiers){
            await actor.addCustomModifier(modifier.category, modifier.name, modifier.value, modifier.type);
        };
        const tempHP = (actor.data.data.details.level.value + actor.data.data.abilities.con.mod);
        if (actor.data.data.attributes.hp.temp < tempHP) {
            await actor.update({'data.attributes.hp.temp': tempHP});
        }
    }
})();