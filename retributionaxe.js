const weapon = "Retribution Axe";
const effectToConsume = {
    name: "Retribution",
    modifier: {
        category: "damage",
    },
    imgPath: "systems/pf2e/icons/equipment/weapons/specific-magic-weapons/retribution-axe.jpg",
};
(async () => {
    if(!event.shiftKey){
        await (actor.data.data.actions ?? []).filter(action => action.type === "strike").find(strike => strike.name === weapon)?.damage(event);
    }else{
        await (actor.data.data.actions ?? []).filter(action => action.type === "strike").find(strike => strike.name === weapon)?.critical(event);
    }
    if((actor.data.data.customModifiers[effectToConsume.modifier.category] || []).some(customModifier => customModifier.name === effectToConsume.name)){
        if (token.data.effects.includes(effectToConsume.imgPath)) {
            await token.toggleEffect(effectToConsume.imgPath);
        }
        await actor.removeCustomModifier(effectToConsume.modifier.category, effectToConsume.name);
    }
})();