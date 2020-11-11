const weapon = "Bastard Sword";
const effectToConsume = {
    name: "Weapon Surge",
    modifier: {
        category: "attack",
    },
    damageDice: {
        selector: "damage",
    },
    imgPath: "systems/pf2e/icons/spells/weapon-surge.jpg",
};
(async () => {
    if(!event.shiftKey){
        if(!event.altKey){
            await (actor.data.data.actions ?? []).filter(action => action.type === "strike").find(strike => strike.name === weapon)?.damage(event, ["", "two-handed"]);
        }else{
            await (actor.data.data.actions ?? []).filter(action => action.type === "strike").find(strike => strike.name === weapon)?.critical(event, ["", "two-handed"]);
        }
    }else{
        if(!event.altKey){
            await (actor.data.data.actions ?? []).filter(action => action.type === "strike").find(strike => strike.name === weapon)?.damage(event);
        }else{
            await (actor.data.data.actions ?? []).filter(action => action.type === "strike").find(strike => strike.name === weapon)?.critical(event);
        }
    }
    if((actor.data.data.customModifiers[effectToConsume.modifier.category] || []).some(customModifier => customModifier.name === effectToConsume.name)){
        if (token.data.effects.includes(effectToConsume.imgPath)) {
            await token.toggleEffect(effectToConsume.imgPath);
        }
        await actor.removeCustomModifier(effectToConsume.modifier.category, effectToConsume.name);
        await actor.removeDamageDice(effectToConsume.damageDice.selector, effectToConsume.name);
    }
})();