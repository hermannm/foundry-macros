const effect = {
  name: "Lay on Hands",
  modifier: {
    stat: "ac",
    value: 2,
    type: "status",
  },
  iconPath: "systems/pf2e/icons/spells/lay-on-hands.webp",
};

(async () => {
  if (
    (actor.data.data.customModifiers[effect.modifier.stat] || []).some(
      (customModifier) => customModifier.name === effect.name
    )
  ) {
    if (token.data.effects.includes(effect.iconPath)) {
      await token.toggleEffect(effect.iconPath);
    }

    await actor.removeCustomModifier(effect.modifier.stat, effect.name);
  } else {
    if (!token.data.effects.includes(effect.iconPath)) {
      await token.toggleEffect(effect.iconPath);
    }

    await actor.addCustomModifier(
      effect.modifier.stat,
      effect.name,
      effect.modifier.value,
      effect.modifier.type
    );
  }
})();
