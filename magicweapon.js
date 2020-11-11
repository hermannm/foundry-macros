const modifier = {
    name: "Magic Weapon",
    category: "attack",
    value: 1,
    type: "item",
};
const damageDice = {
    selector: "damage",
    name: "Magic Weapon",
    diceNumber: 1,
};
const imgPath = "systems/pf2e/icons/spells/magic-weapon.jpg";
(async () => {
    if((actor.data.data.customModifiers[modifier.category] || []).some(customModifier => customModifier.name === modifier.name)){
        if (token.data.effects.includes(imgPath)) {
            await token.toggleEffect(imgPath);
        }
        await actor.removeCustomModifier(modifier.category, modifier.name);
        await actor.removeDamageDice(damageDice.selector, damageDice.name);
    }else{
        if (!token.data.effects.includes(imgPath)) {
            await token.toggleEffect(imgPath);
        }
        await actor.addCustomModifier(modifier.category, modifier.name, modifier.value, modifier.type);
        await actor.addDamageDice(damageDice);
    }
})();