const weapon = "Retribution Axe";
const strike = (actor.data.data.actions ?? []).filter(action => action.type === "strike").find(strike => strike.name === weapon);
if(strike){
    if(event.altKey){
        strike.variants[1]?.roll(event);
    }else if(event.ctrlKey){
        strike.variants[2]?.roll(event);
    }else{
        strike.attack(event);
    }
}