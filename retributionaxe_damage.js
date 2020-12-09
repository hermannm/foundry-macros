const weapon = {
    name: "Retribution Axe",
    criticalSpecialization:
        "Choose one creature adjacent to the initial target and within reach. If its AC is lower than your attack roll result for the critical hit, you deal damage to that creature equal to the result of the weapon damage die you rolled (including extra dice for its potency rune, if any). This amount isn’t doubled, and no bonuses or other additional dice apply to this damage.",
};
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
        await (actor.data.data.actions ?? [])
            .filter((action) => action.type === "strike")
            .find((strike) => strike.name === weapon.name)
            ?.critical(event);
        if (weapon.criticalSpecialization) {
            ChatMessage.create({
                user: game.user._id,
                speaker: ChatMessage.getSpeaker(),
                content: `<hr><h3>Critical Specialization</h3><hr>
                    ${weapon.criticalSpecialization}`,
            });
        }
    } else {
        (actor.data.data.actions ?? [])
            .filter((action) => action.type === "strike")
            .find((strike) => strike.name === weapon.name)
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
