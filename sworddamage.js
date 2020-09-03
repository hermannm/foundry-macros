(async () => {
    let weapon = 'Bastard Sword';
    let bonusdice = '';
    if(!event.shiftKey){
        if(!event.altKey){
            await (actor.data.data.actions ?? []).filter(action => action.type === 'strike').find(strike => strike.name === weapon)?.damage(event, [bonusdice, 'two-handed']);
        }else{
            await (actor.data.data.actions ?? []).filter(action => action.type === 'strike').find(strike => strike.name === weapon)?.critical(event, [bonusdice, 'two-handed']);
        }
    }else{
        if(!event.altKey){
            await (actor.data.data.actions ?? []).filter(action => action.type === 'strike').find(strike => strike.name === weapon)?.damage(event, [bonusdice]);
        }else{
            await (actor.data.data.actions ?? []).filter(action => action.type === 'strike').find(strike => strike.name === weapon)?.critical(event, [bonusdice]);
        }
    }
    if((actor.data.data.customModifiers['attack'] || []).some(modifier => modifier.name === 'Weapon Surge')){
        await actor.removeCustomModifier('attack', 'Weapon Surge');
        if (token.data.effects.includes("systems/pf2e/icons/spells/weapon-surge.jpg")) {
            await token.toggleEffect("systems/pf2e/icons/spells/weapon-surge.jpg");
        }
        await actor.removeDamageDice('damage', 'Weapon Surge');
    }
})();