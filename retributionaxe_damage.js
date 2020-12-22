const weapon = {
    name: "Retribution Axe",
    damageType: "Slashing",
    criticalSpecialization: {
        group: "Axe",
        description:
            "Choose one creature adjacent to the initial target and within reach. If its AC is lower than your attack roll result for the critical hit, you deal damage to that creature equal to the result of the weapon damage die you rolled (including extra dice for its potency rune, if any). This amount isn’t doubled, and no bonuses or other additional dice apply to this damage.",
    },
};
const effect = {
    name: "Retribution",
    description:
        "Whenever a creature damages you with an attack, the skull changes its appearance to look like the face of that creature. You gain a +2 circumstance bonus to your next damage roll against that creature before the end of your next turn. Because the face reshapes each time you’re damaged, you get the additional damage only if you attack the creature that damaged you most recently.",
    icon: "skull", //icon for the effect dialog, fetch string from here: https://fontawesome.com/icons?d=gallery&m=free
    modifier: {
        stat: "damage",
        value: 2,
        type: "circumstance",
    },
};
const criticalSpecialization = (rollData) => {
    DicePF2e.damageRoll({
        event,
        parts: rollData.diceResults[weapon.damageType.toLowerCase()].physical,
        actor,
        data: actor.data.data,
        title: `
            <div style="line-height:133%">
                <b>Critical Specialization</b> (${weapon.criticalSpecialization.group})
                <br>
                ${weapon.criticalSpecialization.description}
            </div>
        `,
        speaker: ChatMessage.getSpeaker(),
    });
};
(async () => {
    const damage = (crit) => {
        const strikeItem = (actor.data.data.actions ?? [])
            .filter((action) => action.type === "strike")
            .find((strike) => strike.name === weapon.name);
        if (crit) {
            strikeItem.critical(event, [], criticalSpecialization);
        } else {
            strikeItem.damage(event);
        }
    };
    const damageWithEffect = async (crit) => {
        await actor.addCustomModifier(
            effect.modifier.stat,
            effect.name,
            effect.modifier.value,
            effect.modifier.type
        );
        damage(crit);
        await actor.removeCustomModifier(effect.modifier.stat, effect.name);
    };
    const dialog = new Dialog({
        title: `${weapon.name} Damage`,
        content: `
            <b><i class="fas fa-${effect.icon}"></i> ${effect.name}:</b> ${effect.description}<hr>
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
                label: `<i class="fas fa-${effect.icon}"></i> Damage`,
                callback: () => {
                    damageWithEffect(false);
                },
            },
            criticalRetribution: {
                label: `<i class="fas fa-${effect.icon}"></i> Critical`,
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
