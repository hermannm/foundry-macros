(async () => {
  const {
    _id: focusID,
    data: {
      focus: { points: focusPoints, pool: focusPool },
    },
  } = actor.data.items.find((item) => item.name === "Focus Spells");
  if (event.altKey) {
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
  } else if (focusPoints <= 0) {
    ui.notifications.warn("You have no focus points left.");
  } else {
    await DicePF2e.damageRoll({
      event: event,
      parts: new Array(Math.ceil(actor.data.data.details.level.value / 2)).fill(
        "6"
      ),
      actor: actor,
      data: actor.data.data,
      title: "Lay on Hands - Healing",
      speaker: ChatMessage.getSpeaker(),
    });
    await actor.updateEmbeddedEntity("OwnedItem", {
      _id: focusID,
      data: { focus: { points: focusPoints - 1, pool: focusPool } },
    });
  }
})();
