const effect = {
    name: "Demoralize",
    skill: {
        name: "intimidation",
        short: "itm",
    },
};
(async () => {
    const itemID =
        actor.items
            .filter((item) => item.data.type === "action")
            .find((item) => item.data.name === effect.name)?._id ??
        actor.items.find((item) => item.data.name === effect.name)?._id;
    if (itemID) {
        await game.pf2e.rollItemMacro(itemID);
    }
    const opts = actor.getRollOptions(["all", "skill-check", effect.skill.name]);
    await actor.data.data.skills[effect.skill.short]?.roll(event, opts);
})();
