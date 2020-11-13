const effect = {
    name: "Lay on Hands",
    modifier: {
        stat: "ac",
        value: 2,
        type: "status",
    },
    iconPath: "systems/pf2e/icons/spells/lay-on-hands.jpg",
};
const { _id: itemID, data: { focus: { points: focusPoints, pool: focusPool } } } = await actor.data.items.find(item => item.name === "Focus Spells");
(async () => {
    if(event.shiftKey){
        if(focusPoints < focusPool){
            actor.updateEmbeddedEntity("OwnedItem",  { _id: itemID, data: { focus: { points: focusPoints + 1, pool: focusPool } } });
            await ChatMessage.create({
                user: game.user._id,
                speaker: ChatMessage.getSpeaker(),
                content: actor.name + " Refocuses, restoring 1 Focus Point.",
            });
        }else{
            ui.notifications.warn("Focus pool already full.");
        }
    }else if((actor.data.data.customModifiers[effect.modifier.stat] || []).some(customModifier => customModifier.name === effect.name)){
        if (token.data.effects.includes(effect.iconPath)) {
            await token.toggleEffect(effect.iconPath);
        }
        await actor.removeCustomModifier(effect.modifier.stat, effect.name);
    }else if(focusPoints <= 0){
        ui.notifications.warn("You have no focus points left.");
    }else{
        if (!token.data.effects.includes(effect.iconPath)) {
            await token.toggleEffect(effect.iconPath);
        }
        await actor.addCustomModifier(effect.modifier.stat, effect.name, effect.modifier.value, effect.modifier.type);
        DicePF2e.damageRoll({
            event: event,
            parts: ["" + (6 * Math.ceil(actor.data.data.details.level.value/2))],
            actor: actor,
            data: actor.data.data,
            title: "Lay on Hands - Healing",
            speaker: ChatMessage.getSpeaker(),
        });
        actor.updateEmbeddedEntity("OwnedItem",  { _id: itemID, data: { focus: { points: focusPoints - 1, pool: focusPool } } });
    }
})();