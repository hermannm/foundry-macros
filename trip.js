const action = {
    name: "Trip",
    skill: "Athletics",
    targetDC: "Reflex",
    requirements:
        "You have at least one hand free. Your target can’t be more than one size larger than you.",
    description:
        "You try to knock an opponent to the ground. Attempt an Athletics check against the target’s Reflex DC.",
    degreesOfSuccess: {
        criticalSuccess:
            "The target falls and lands prone and takes 1d6 bludgeoning damage.",
        success: "The target falls and lands prone.",
        criticalFailure: "You lose your balance and fall and land prone.",
    }, // criticalSuccess, success, failure, criticalFailure - leave step absent for no effect
    maxSize: 1, // maximum steps up in size that the target can be
    attack: true, // absent (false), true, or "agile"
};
(async () => {
    const skillKey = Object.keys(actor.data.data.skills).find(
        (key) => actor.data.data.skills[key].name === action.skill.toLowerCase()
    );
    const skillRoll = () => {
        const options = actor.getRollOptions([
            "all",
            "skill-check",
            action.skill.toLowerCase(),
        ]);
        options.push(action.name.toLowerCase());
        if (action.attack) {
            options.push("attack");
        }
        actor.data.data.skills[skillKey].roll(event, options, (roll) => {
            let resultMessage = `<hr /><h3>${action.name}</h3>`;
            let validTarget = false;
            const sizeArray = Object.keys(CONFIG.PF2E.actorSizes);
            const characterSizeIndex = sizeArray.indexOf(
                actor.data?.data?.traits?.size?.value
            );
            for (const target of game.user.targets) {
                const dc =
                    target.actor?.data?.data?.saves?.[
                        action.targetDC.toLowerCase()
                    ]?.value + 10;
                if (dc) {
                    validTarget = true;
                    resultMessage += `<hr /><b>${target.name}:</b>`;
                    const legalSize =
                        action.maxSize >=
                        sizeArray.indexOf(
                            target.actor?.data?.data?.traits?.size?.value
                        ) -
                            characterSizeIndex;
                    if (legalSize) {
                        let successStep =
                            roll.total >= dc
                                ? roll.total >= dc + 10
                                    ? 3
                                    : 2
                                : roll.total > dc - 10
                                ? 1
                                : 0;
                        switch (roll.terms[0].results[0].result) {
                            case 20:
                                successStep++;
                                break;
                            case 1:
                                successStep--;
                                break;
                        }
                        if (successStep >= 3) {
                            resultMessage += `<br />💥 <b>Critical Success</b>`;
                            if (action.degreesOfSuccess?.criticalSuccess) {
                                resultMessage += `<br />${action.degreesOfSuccess.criticalSuccess}`;
                            }
                        } else if (successStep === 2) {
                            resultMessage += `<br />✔️ <b>Success</b>`;
                            if (action.degreesOfSuccess?.success) {
                                resultMessage += `<br />${action.degreesOfSuccess.success}`;
                            }
                        } else if (successStep === 1) {
                            resultMessage += `<br />❌ <b>Failure</b>`;
                            if (action.degreesOfSuccess?.failure) {
                                resultMessage += `<br />${action.degreesOfSuccess.failure}`;
                            }
                        } else if (successStep <= 0) {
                            resultMessage += `<br />💔 <b>Critical Failure</b>`;
                            if (action.degreesOfSuccess?.criticalFailure) {
                                resultMessage += `<br />${action.degreesOfSuccess.criticalFailure}`;
                            }
                        }
                    } else {
                        resultMessage += `<br />⚠️ <b>The target is too big!</b>`;
                    }
                }
            }
            if (validTarget) {
                ChatMessage.create({
                    user: game.user._id,
                    speaker: ChatMessage.getSpeaker(),
                    content: resultMessage,
                });
            }
        });
    };
    if (action.attack) {
        const weapon = actor.data.items
            .filter(
                (item) =>
                    item.type === "weapon" &&
                    item.data.equipped?.value === true &&
                    item.data.traits.value?.some(
                        (trait) => trait === action.name.toLowerCase()
                    )
            )
            .reduce(
                (item1, item2) =>
                    (item1?.data.potencyRune?.value ?? 0) >
                    (item2?.data.potencyRune?.value ?? 0)
                        ? item1
                        : item2,
                null
            );
        const potency = parseInt(weapon?.data.potencyRune?.value ?? 0);
        const agile =
            action.attack === "agile" ||
            (weapon?.data.traits.value?.some((trait) => trait === "agile") ??
                false);
        const getPenalty = (MAP) => {
            let penalty = 0;
            if (MAP === 2) {
                penalty = agile ? -4 : -5;
            } else if (MAP === 3) {
                penalty = agile ? -8 : -10;
            }
            return penalty;
        };
        const attackRoll = async (penalty) => {
            if (potency) {
                await actor.addCustomModifier(
                    action.skill.toLowerCase(),
                    "Item Bonus",
                    potency,
                    "item"
                );
            }
            if (penalty) {
                await actor.addCustomModifier(
                    action.skill.toLowerCase(),
                    "Multiple Attack Penalty",
                    penalty,
                    "untyped"
                );
            }
            skillRoll();
            if (potency) {
                await actor.removeCustomModifier(
                    action.skill.toLowerCase(),
                    "Item Bonus"
                );
            }
            if (penalty) {
                await actor.removeCustomModifier(
                    action.skill.toLowerCase(),
                    "Multiple Attack Penalty"
                );
            }
        };
        const modToString = (modifier) =>
            modifier >= 0 ? `+${modifier}` : `${modifier}`;
        new Dialog({
            title: `${action.name}`,
            content: `
                ${
                    action.requirements
                        ? `<strong>Requirements</strong> ${action.requirements}<hr>`
                        : ""
                }
                ${action.description ? `${action.description}<hr>` : ""}
            `,
            buttons: {
                first: {
                    label: `1st attack (${modToString(
                        actor.data.data.skills[skillKey].totalModifier + potency
                    )})`,
                    callback: () => {
                        attackRoll(getPenalty(1));
                    },
                },
                second: {
                    label: `2nd attack (${modToString(
                        actor.data.data.skills[skillKey].totalModifier +
                            potency +
                            getPenalty(2)
                    )})`,
                    callback: () => {
                        attackRoll(getPenalty(2));
                    },
                },
                third: {
                    label: `3rd attack (${modToString(
                        actor.data.data.skills[skillKey].totalModifier +
                            potency +
                            getPenalty(3)
                    )})`,
                    callback: () => {
                        attackRoll(getPenalty(3));
                    },
                },
            },
            default: "first",
        }).render(true);
    } else {
        skillRoll();
    }
})();
