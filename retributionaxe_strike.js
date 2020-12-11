const weapon = "Retribution Axe";
const optionalEffect = {
    name: "Sweep",
    modifier: {
        stat: "attack",
        value: 1,
        type: "circumstance",
    },
};
(async () => {
    const attack = (attackMAP) => {
        const strikeItem = (actor.data.data.actions ?? [])
            .filter((action) => action.type === "strike")
            .find((strike) => strike.name === weapon);
        switch (attackMAP) {
            case 1:
                strikeItem.attack(event);
                break;
            case 2:
                strikeItem.variants[1]?.roll(event);
                break;
            case 3:
                strikeItem.variants[2]?.roll(event);
                break;
        }
    };
    if (event.altKey) {
        let attackMAP;
        new Dialog({
            title: `${weapon} Strike`,
            content: `
                <div style="text-align: center;">
                    <strong>Sweep</strong>
                </div>
                <div style="text-align: center;">
                    <input
                        type="checkbox"
                        id="${optionalEffect.name.toLowerCase()}"
                    >
                </div>
            `,
            buttons: {
                first: {
                    label: "1st attack",
                    callback: () => {
                        attackMAP = 1;
                    },
                },
                second: {
                    label: "2nd attack",
                    callback: () => {
                        attackMAP = 2;
                    },
                },
                third: {
                    label: "3rd attack",
                    callback: () => {
                        attackMAP = 3;
                    },
                },
            },
            close: async (html) => {
                let effect = html.find(
                    `[id="${optionalEffect.name.toLowerCase()}"]`
                )[0].checked;
                if (effect) {
                    await actor.addCustomModifier(
                        optionalEffect.modifier.stat,
                        optionalEffect.name,
                        optionalEffect.modifier.value,
                        optionalEffect.modifier.type
                    );
                    await attack(attackMAP);
                    await actor.removeCustomModifier(
                        optionalEffect.modifier.stat,
                        optionalEffect.name
                    );
                } else {
                    attack(attackMAP);
                }
            },
        }).render(true);
    } else {
        attack(1);
    }
})();
