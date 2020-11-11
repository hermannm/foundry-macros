const modifier = {
    name: "Sweep",
    category: "attack",
    value: 1,
    type: "circumstance",
};
const imgPath = "systems/pf2e/icons/features/classes/brutality.jpg";
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