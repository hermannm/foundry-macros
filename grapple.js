const action = {
    name: "Grapple",
    skill: "Athletics",
    targetDC: "Fortitude",
    requirements:
        "You have at least one free hand or have your target grappled or restrained. Your target isn’t more than one size larger than you.",
    description:
        "You attempt to grab an opponent with your free hand. Attempt an Athletics check against their Fortitude DC. You can also Grapple to keep your hold on a creature you already grabbed.",
    degreesOfSuccess: {
        criticalSuccess:
            "Your opponent is restrained until the end of your next turn unless you move or your opponent Escapes.",
        success:
            "Your opponent is grabbed until the end of your next turn unless you move or your opponent Escapes.",
        failure:
            "You fail to grab your opponent. If you already had the opponent grabbed or restrained using a Grapple, those conditions on that creature end.",
        criticalFailure:
            "If you already had the opponent grabbed or restrained, it breaks free. Your target can either grab you, as if it succeeded at using the Grapple action against you, or force you to fall and land prone.",
    }, // criticalSuccess, success, failure, criticalFailure - leave step absent for no effect
    maxSize: 1, // maximum steps up in size that the target can be
    attack: true, // absent (false), true, or "agile"
};
(async () => {
    const skill = () =>
        actor.data.data.skills[
            Object.entries(actor.data.data.skills).find(
                (entry) => entry[1].name === action.skill.toLowerCase()
            )[0]
        ];
    const skillRoll = () => {
        const options = [
            ...actor.getRollOptions([
                "all",
                "skill-check",
                action.skill.toLowerCase(),
            ]),
            action.name.toLowerCase(),
        ];
        if (action.attack) {
            options.push("attack");
        }
        skill().roll(event, options, (roll) => {
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
                        skill().totalModifier + potency
                    )})`,
                    callback: () => {
                        attackRoll(getPenalty(1));
                    },
                },
                second: {
                    label: `2nd attack (${modToString(
                        skill().totalModifier + potency + getPenalty(2)
                    )})`,
                    callback: () => {
                        attackRoll(getPenalty(2));
                    },
                },
                third: {
                    label: `3rd attack (${modToString(
                        skill().totalModifier + potency + getPenalty(3)
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
