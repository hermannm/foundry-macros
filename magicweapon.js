(async () => {
    if((actor.data.data.customModifiers['attack'] || []).some(modifier => modifier.name === 'Magic Weapon')){
        if (token.data.effects.includes("systems/pf2e/icons/spells/magic-weapon.jpg")) {
            await token.toggleEffect("systems/pf2e/icons/spells/magic-weapon.jpg");
        }
        await actor.removeCustomModifier('attack', 'Magic Weapon');
        await actor.removeDamageDice('damage', 'Magic Weapon');
    }else{
        if (!token.data.effects.includes("systems/pf2e/icons/spells/magic-weapon.jpg")) {
            await token.toggleEffect("systems/pf2e/icons/spells/magic-weapon.jpg");
        }
        await game.pf2e.rollItemMacro("koyU5tGy3PsitArc");
        await actor.addCustomModifier('attack', 'Magic Weapon', 1, 'item');
        await actor.addDamageDice({selector: 'damage', name: 'Magic Weapon', diceNumber: 1});
    }
})();