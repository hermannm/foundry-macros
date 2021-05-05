const ITEM_UUID = "Compendium.pf2e.feature-effects.z3uyCMBddrPK5umr"; // Effect: Rage
(async () => {
  const effect = duplicate(await fromUuid(ITEM_UUID));
  effect.flags.core = effect.flags.core ?? {};
  effect.flags.core.sourceId = effect.flags.core.sourceId ?? ITEM_UUID;
  for await (const token of canvas.tokens.controlled) {
    let existing = token.actor.items.find(
      (i) => i.type === "effect" && i.data.flags.core?.sourceId === ITEM_UUID
    );
    if (existing) {
      token.actor.deleteOwnedItem(existing._id);
    } else {
      token.actor.createOwnedItem(effect);
    }
  }
})();
