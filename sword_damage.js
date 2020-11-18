const weapon = "Bastard Sword";
const effectToConsume = {
    name: "Weapon Surge",
    modifier: {
        stat: "attack",
    },
    damageDice: {
        selector: "damage",
    },
    iconPath: "systems/pf2e/icons/spells/weapon-surge.jpg",
};
(async () => {
    if (!event.shiftKey) {
        if (!event.altKey) {
            (actor.data.data.actions ?? [])
                .filter((action) => action.type === "strike")
                .find((strike) => strike.name === weapon)
                ?.damage(event, ["", "two-handed"]);
        } else {
            (actor.data.data.actions ?? [])
                .filter((action) => action.type === "strike")
                .find((strike) => strike.name === weapon)
                ?.critical(event, ["", "two-handed"]);
        }
    } else {
        if (!event.altKey) {
            (actor.data.data.actions ?? [])
                .filter((action) => action.type === "strike")
                .find((strike) => strike.name === weapon)
                ?.damage(event);
        } else {
            (actor.data.data.actions ?? [])
                .filter((action) => action.type === "strike")
                .find((strike) => strike.name === weapon)
                ?.critical(event);
        }
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
        await actor.removeDamageDice(
            effectToConsume.damageDice.selector,
            effectToConsume.name
        );
    }
})();
