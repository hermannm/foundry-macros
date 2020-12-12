const weapon = "Retribution Axe";
const optionalEffect = {
    name: "Sweep",
    description:
        "When you attack with this weapon, you gain a +1 circumstance bonus to your attack roll if you already attempted to attack a different target this turn using this weapon.",
    modifier: {
        stat: "attack",
        value: 1,
        type: "circumstance",
    },
};
(async () => {
    const strike = (MAP) => {
        const strikeItem = (actor.data.data.actions ?? [])
            .filter((action) => action.type === "strike")
            .find((strike) => strike.name === weapon);
        switch (MAP) {
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
    const strikeWithEffect = async (MAP) => {
        await actor.addCustomModifier(
            optionalEffect.modifier.stat,
            optionalEffect.name,
            optionalEffect.modifier.value,
            optionalEffect.modifier.type
        );
        strike(MAP);
        await actor.removeCustomModifier(
            optionalEffect.modifier.stat,
            optionalEffect.name
        );
    };
    const dialog = new Dialog({
        title: `${weapon} Strike`,
        content: `
            <b>${optionalEffect.name}:</b> ${optionalEffect.description}<hr>
            <div class="dialog-buttons">
                <button
                    class="dialog-button first"
                    data-button="first"
                    style="margin-bottom:5px;"
                >
                    1st
                </button>
                <button
                    class="dialog-button second"
                    data-button="second"
                    style="margin-bottom:5px;"
                >
                    2nd
                </button>
                <button
                    class="dialog-button third"
                    data-button="third"
                    style="margin-bottom:5px;"
                >
                    3rd
                </button>
            </div>
        `,
        buttons: {
            firstSweep: {
                label: "1st (Sweep)",
                callback: () => {
                    strikeWithEffect(1);
                },
            },
            secondSweep: {
                label: "2nd (Sweep)",
                callback: () => {
                    strikeWithEffect(2);
                },
            },
            thirdSweep: {
                label: "3rd (Sweep)",
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
