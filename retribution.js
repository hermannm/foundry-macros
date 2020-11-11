const modifier = {
    name: "Retribution",
    category: "damage",
    value: 2,
    type: "circumstance",
};
const imgPath = "systems/pf2e/icons/equipment/weapons/specific-magic-weapons/retribution-axe.jpg";
(async () => {
    if((actor.data.data.customModifiers[modifier.category] || []).some(customModifier => customModifier.name === modifier.name)){
        if (token.data.effects.includes(imgPath)) {
            await token.toggleEffect(imgPath);
        }
        await actor.removeCustomModifier(modifier.category, modifier.name);
    }else{
        if (!token.data.effects.includes(imgPath)) {
            await token.toggleEffect(imgPath);
        }
        await actor.addCustomModifier(modifier.category, modifier.name, modifier.value, modifier.type);
    }
})();