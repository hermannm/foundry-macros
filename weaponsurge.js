(async () => {
    if((actor.data.data.customModifiers['attack'] || []).some(modifier => modifier.name === 'Weapon Surge')){
        if (token.data.effects.includes("systems/pf2e/icons/spells/weapon-surge.jpg")) {
            await token.toggleEffect("systems/pf2e/icons/spells/weapon-surge.jpg");
        }
        await actor.removeCustomModifier('attack', 'Weapon Surge');
        await actor.removeDamageDice('damage', 'Weapon Surge');
    }else{
        if (!token.data.effects.includes("systems/pf2e/icons/spells/weapon-surge.jpg")) {
            await token.toggleEffect("systems/pf2e/icons/spells/weapon-surge.jpg");
        }
        await game.pf2e.rollItemMacro("JKEevE0vBjNtNREO");
        await actor.addCustomModifier('attack', 'Weapon Surge', 1, 'status');
        await actor.addDamageDice({selector: 'damage', name: 'Weapon Surge', diceNumber: 1});
    }
})();