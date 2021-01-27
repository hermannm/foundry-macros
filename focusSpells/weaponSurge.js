const effect = {
  name: "Weapon Surge",
  modifier: {
    stat: "attack",
    value: 1,
    type: "status",
  },
  damageDice: {
    selector: "damage",
    diceNumber: 1,
  },
  iconPath: "systems/pf2e/icons/spells/weapon-surge.jpg",
};
const {
  _id: focusID,
  data: {
    focus: { points: focusPoints, pool: focusPool },
  },
} = actor.data.items.find((item) => item.name === "Focus Spells");
(async () => {
  if (event.shiftKey) {
    if (focusPoints < focusPool) {
      ChatMessage.create({
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        content: actor.name + " refocuses, restoring 1 Focus Point.",
      });
      await actor.updateEmbeddedEntity("OwnedItem", {
        _id: focusID,
        data: { focus: { points: focusPoints + 1, pool: focusPool } },
      });
    } else {
      ui.notifications.warn("Focus pool already full.");
    }
  } else if (
    (actor.data.data.customModifiers[effect.modifier.stat] || []).some(
      (customModifier) => customModifier.name === effect.name
    )
  ) {
    if (token.data.effects.includes(effect.iconPath)) {
      await token.toggleEffect(effect.iconPath);
    }
    await actor.removeCustomModifier(effect.modifier.stat, effect.name);
    await actor.removeDamageDice(damageDice.selector, damageDice.name);
  } else if (focusPoints <= 0) {
    ui.notifications.warn("You have no focus points left.");
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
    await actor.updateEmbeddedEntity("OwnedItem", {
      _id: focusID,
      data: { focus: { points: focusPoints - 1, pool: focusPool } },
    });
  }
})();
