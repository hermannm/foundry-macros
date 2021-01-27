const ITEM_UUID = 'Compendium.pf2e.spell-effects.z3uyCMBddrPK5umr'; // Effect: Rage

(async () => {
  const item = await fromUuid(ITEM_UUID);
  for (const token of canvas.tokens.controlled) {
    let existing = token.actor.items.filter(i => i.type === item.type).find(e => e.name === item.name);
    if (existing) {
      await token.actor.deleteOwnedItem(existing._id);
    } else {
      let owneditemdata = await token.actor.createOwnedItem(item);
      if (item.type === "effect") {
        owneditemdata.data.start.value = game.time.worldTime;
        if (game.combat?.data?.active && game.combat?.turns?.length > game.combat?.turn) {
            let initiative = game.combat.turns[game.combat.turn].initiative;
            item.data.start.initiative = initiative;
        }
      }
    }
  }
})();
