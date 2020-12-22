const weapon = "Retribution Axe";
const effect = {
    name: "Sweep",
    description:
        "When you attack with this weapon, you gain a +1 circumstance bonus to your attack roll if you already attempted to attack a different target this turn using this weapon.",
    icon: "users-slash", // icon for the effect dialog, fetch string from here: https://fontawesome.com/icons?d=gallery&m=free
    modifier: {
        stat: "attack",
        value: 1,
        type: "circumstance",
    },
};
(async () => {
    const strikeItem = () =>
        (actor.data.data.actions ?? [])
            .filter((action) => action.type === "strike")
            .find((strike) => strike.name === weapon);
    const strike = (MAP) => {
        switch (MAP) {
            case 1:
                strikeItem().attack(event);
                break;
            case 2:
                strikeItem().variants[1]?.roll(event);
                break;
            case 3:
                strikeItem().variants[2]?.roll(event);
                break;
        }
    };
    const strikeWithEffect = async (MAP) => {
        await actor.addCustomModifier(
            effect.modifier.stat,
            effect.name,
            effect.modifier.value,
            effect.modifier.type
        );
        strike(MAP);
        await actor.removeCustomModifier(effect.modifier.stat, effect.name);
    };
    const modifiers = strikeItem().variants.map((variant) => {
        let modifier = strikeItem().totalModifier;
        const splitLabel = variant.label.split(" ");
        if (splitLabel[0] === "MAP") {
            modifier += parseInt(splitLabel[1]);
        }
        return modifier;
    });
    const modToString = (modifier) =>
        modifier >= 0 ? `+${modifier}` : `${modifier}`;
    const dialog = new Dialog({
        title: `${weapon} Strike`,
        content: `
            <b><i class="fas fa-${effect.icon}"></i> ${effect.name}:</b> ${
            effect.description
        }<hr>
            <div class="dialog-buttons">
                <button
                    class="dialog-button first"
                    data-button="first"
                    style="margin-bottom:5px;"
                >
                    1st (${modToString(modifiers[0])})
                </button>
                <button
                    class="dialog-button second"
                    data-button="second"
                    style="margin-bottom:5px;"
                >
                    2nd (${modToString(modifiers[1])})
                </button>
                <button
                    class="dialog-button third"
                    data-button="third"
                    style="margin-bottom:5px;"
                >
                    3rd (${modToString(modifiers[2])})
                </button>
            </div>
        `,
        buttons: {
            firstWithEffect: {
                label: `<i class="fas fa-${
                    effect.icon
                }"></i> 1st (${modToString(
                    modifiers[0] + effect.modifier.value
                )})`,
                callback: () => {
                    strikeWithEffect(1);
                },
            },
            secondWithEffect: {
                label: `<i class="fas fa-${
                    effect.icon
                }"></i> 2nd (${modToString(
                    modifiers[1] + effect.modifier.value
                )})`,
                callback: () => {
                    strikeWithEffect(2);
                },
            },
            thirdWithEffect: {
                label: `<i class="fas fa-${
                    effect.icon
                }"></i> 3rd (${modToString(
                    modifiers[2] + effect.modifier.value
                )})`,
                callback: () => {
                    strikeWithEffect(3);
                },
            },
        },
    });
    dialog.render(true);
    dialog.data.buttons.first = {
        callback: () => {
            strike(1);
        },
    };
    dialog.data.buttons.second = {
        callback: () => {
            strike(2);
        },
    };
    dialog.data.buttons.third = {
        callback: () => {
            strike(3);
        },
    };
})();
