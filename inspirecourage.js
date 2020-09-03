(async () => {
    if ((actor.data.data.customModifiers['attack'] || []).some(modifier => modifier.name === 'Inspire Courage')){
        if (token.data.effects.includes("systems/pf2e/icons/spells/inspire-courage.jpg")){
            await token.toggleEffect("systems/pf2e/icons/spells/inspire-courage.jpg")
        }
        await actor.removeCustomModifier('attack', 'Inspire Courage');
        await actor.removeCustomModifier('damage', 'Inspire Courage');
    }else{
        if (!token.data.effects.includes("systems/pf2e/icons/spells/inspire-courage.jpg")){
            await token.toggleEffect("systems/pf2e/icons/spells/inspire-courage.jpg")
        }
        await actor.addCustomModifier('attack', 'Inspire Courage', 1, 'status');
        await actor.addCustomModifier('damage', 'Inspire Courage', 1, 'status');
    }
})();