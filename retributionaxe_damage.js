const weapon = "Retribution Axe";
const effectToConsume = {
    name: "Retribution",
    modifier: {
        stat: "damage",
    },
    iconPath:
        "systems/pf2e/icons/equipment/weapons/specific-magic-weapons/retribution-axe.jpg",
};
(async () => {
    if (!event.altKey) {
        await (actor.data.data.actions ?? [])
            .filter((action) => action.type === "strike")
            .find((strike) => strike.name === weapon)
            ?.damage(event);
    } else {
        await (actor.data.data.actions ?? [])
            .filter((action) => action.type === "strike")
            .find((strike) => strike.name === weapon)
            ?.critical(event);
    }
    if (
        (
            actor.data.data.customModifiers[effectToConsume.modifier.stat] || []
        ).some((customModifier) => customModifier.name === effectToConsume.name)
    ) {
        if (token.data.effects.includes(effectToConsume.iconPath)) {
            await token.toggleEffect(effectToConsume.iconPath);
        }
        await actor.removeCustomModifier(
            effectToConsume.modifier.stat,
            effectToConsume.name
        );
    }
})();
