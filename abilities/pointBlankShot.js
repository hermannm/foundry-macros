const effect = {
  name: "Point-Blank Shot",
  modifier: {
    stat: "damage",
    value: 2,
    type: "circumstance",
  },
  iconPath: "systems/pf2e/icons/features/classes/precision.webp",
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
    const itemID =
      actor.items
        .filter((item) => item.data.type === "action")
        .find((item) => item.data.name === effect.name)?._id ??
      actor.items.find((item) => item.data.name === effect.name)?._id;
    if (itemID) {
      game.pf2e.rollItemMacro(itemID);
    }
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
