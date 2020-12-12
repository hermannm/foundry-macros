const weapon = "Retribution Axe";
const optionalEffect = {
    name: "Retribution",
    description:
        "Whenever a creature damages you with an attack, the skull changes its appearance to look like the face of that creature. You gain a +2 circumstance bonus to your next damage roll against that creature before the end of your next turn. Because the face reshapes each time you’re damaged, you get the additional damage only if you attack the creature that damaged you most recently.",
    modifier: {
        stat: "damage",
        value: 2,
        type: "circumstance",
    },
};
const criticalSpecialization = (roll) => {
    const parts = [];
    for (const term of roll.terms) {
        if (term?.results) {
            for (const result of term.results) {
                parts.push(result.result);
            }
        }
    }
    DicePF2e.damageRoll({
        event,
        parts,
        actor,
        data: actor.data.data,
        title: `
            <div style="line-height:133%">
                <b>Critical Specialization</b> (Axe)
                <br>
                Choose one creature adjacent to the initial target and within reach. If its AC is lower than your attack roll result for the critical hit, you deal damage to that creature equal to the result of the weapon damage die you rolled (including extra dice for its potency rune, if any). This amount isn’t doubled, and no bonuses or other additional dice apply to this damage.
            </div>
        `,
        speaker: ChatMessage.getSpeaker(),
    });
};
(async () => {
    const damage = (crit) => {
        if (crit) {
            (actor.data.data.actions ?? [])
                .filter((action) => action.type === "strike")
                .find((strike) => strike.name === weapon)
                ?.critical(event, [], criticalSpecialization);
        } else {
            (actor.data.data.actions ?? [])
                .filter((action) => action.type === "strike")
                .find((strike) => strike.name === weapon)
                ?.damage(event);
        }
    };
    const damageWithEffect = async (crit) => {
        await actor.addCustomModifier(
            optionalEffect.modifier.stat,
            optionalEffect.name,
            optionalEffect.modifier.value,
            optionalEffect.modifier.type
        );
        damage(crit);
        await actor.removeCustomModifier(
            optionalEffect.modifier.stat,
            optionalEffect.name
        );
    };
    const dialog = new Dialog({
        title: `${weapon} Damage`,
        content: `
            <b>${optionalEffect.name}:</b> ${optionalEffect.description}<hr>
            <div class="dialog-buttons">
                <button
                    class="dialog-button damage"
                    data-button="damage"
                    style="margin-bottom:5px;"
                >
                    Damage
                </button>
                <button
                    class="dialog-button critical"
                    data-button="critical"
                    style="margin-bottom:5px;"
                >
                    Critical
                </button>
            </div>
        `,
        buttons: {
            damageRetribution: {
                label: "Damage (Retribution)",
                callback: () => {
                    damageWithEffect(false);
                },
            },
            criticalRetribution: {
                label: "Critical (Retribution)",
                callback: () => {
                    damageWithEffect(true);
                },
            },
        },
    });
    dialog.render(true);
    dialog.data.buttons.damage = {
        callback: () => {
            damage(false);
        },
    };
    dialog.data.buttons.critical = {
        callback: () => {
            damage(true);
        },
    };
})();
