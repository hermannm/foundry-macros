(async () => {
if (actor) {
  if ((actor.data.data.customModifiers['damage'] || []).some(modifier => modifier.name === 'Point-Blank Shot')) {
    await actor.removeCustomModifier('damage', 'Point-Blank Shot')
    if (token.data.effects.includes("systems/pf2e/icons/features/classes/precision.jpg")) {
      token.toggleEffect("systems/pf2e/icons/features/classes/precision.jpg")
    }
  } else {
    await actor.addCustomModifier('damage', 'Point-Blank Shot', 2, 'circumstance');
    if (!token.data.effects.includes("systems/pf2e/icons/features/classes/precision.jpg")) {
      token.toggleEffect("systems/pf2e/icons/features/classes/precision.jpg")
    }
  }
} else {
  ui.notifications.warn("You must have an actor selected.");
}
})(); 
