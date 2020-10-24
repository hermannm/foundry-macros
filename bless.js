(async () => {
    if((actor.data.data.customModifiers['attack'] || []).some(modifier => modifier.name === 'Bless')){
        if (token.data.effects.includes("systems/pf2e/icons/spells/bless.jpg")) {
            await token.toggleEffect("systems/pf2e/icons/spells/bless.jpg");
        }
        await actor.removeCustomModifier('attack', 'Bless');
    }else{
        if (!token.data.effects.includes("systems/pf2e/icons/spells/bless.jpg")) {
            await token.toggleEffect("systems/pf2e/icons/spells/bless.jpg");
        }
        await actor.addCustomModifier('attack', 'Bless', 1, 'status');
    }
})();