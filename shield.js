(async () => {
    if((actor.data.data.customModifiers['ac'] || []).some(modifier => modifier.name === 'Shield')){
        if (token.data.effects.includes("systems/pf2e/icons/spells/shield.jpg")) {
            await token.toggleEffect("systems/pf2e/icons/spells/shield.jpg");
        }
        await actor.removeCustomModifier('ac', 'Shield');
    }else{
        if (!token.data.effects.includes("systems/pf2e/icons/spells/shield.jpg")) {
            await token.toggleEffect("systems/pf2e/icons/spells/shield.jpg");
        }
        await game.pf2e.rollItemMacro("PE0eHDUuvu1qe5kq");
        await actor.addCustomModifier('ac', 'Shield', 1, 'circumstance');
    }
})();