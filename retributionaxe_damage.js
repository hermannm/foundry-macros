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
    if (event.altKey) {
        (actor.data.data.actions ?? [])
            .filter((action) => action.type === "strike")
            .find((strike) => strike.name === weapon)
            ?.critical(event);
    } else {
        (actor.data.data.actions ?? [])
            .filter((action) => action.type === "strike")
            .find((strike) => strike.name === weapon)
            ?.damage(event);
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
