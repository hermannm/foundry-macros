const effect = {
  name: "Magic Weapon",
  modifier: {
    stat: "attack",
    value: 1,
    type: "item",
  },
  damageDice: {
    selector: "damage",
    diceNumber: 1,
  },
  iconPath: "systems/pf2e/icons/spells/magic-weapon.webp",
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
    await actor.removeDamageDice(damageDice.selector, damageDice.name);
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
    await actor.addDamageDice({ ...effect.damageDice, name: effect.name });
  }
})();
