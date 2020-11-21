const action = {
    name: "Trip",
    skill: "Athletics",
    targetDC: "Reflex",
    degreesOfSuccess: {
        criticalSuccess:
            "The target falls and lands prone and takes 1d6 bludgeoning damage.",
        success: "The target falls and lands prone.",
        criticalFailure: "You lose your balance and fall and land prone.",
    },
    multipleAttackPenalty: true,
};
(async () => {
    let penalty;
    if (action.multipleAttackPenalty) {
        if (event.altKey) {
            penalty = action.multipleAttackPenalty === "agile" ? -4 : -5;
        } else if (event.ctrlKey) {
            penalty = action.multipleAttackPenalty === "agile" ? -8 : -10;
        }
        if (penalty) {
            await actor.addCustomModifier(
                action.skill.toLowerCase(),
                "Multiple Attack Penalty",
                penalty,
                "untyped"
            );
        }
    }
    const skillKey = Object.keys(actor.data.data.skills).find(
        (key) => actor.data.data.skills[key].name === action.skill.toLowerCase()
    );
    const options = actor.getRollOptions([
        "all",
        "skill-check",
        action.skill.toLowerCase(),
    ]);
    actor.data.data.skills[skillKey].roll(event, options, (roll) => {
        let resultMessage = `<hr /><h3>${action.name}</h3>`;
        let validTarget = false;
        for (const target of game.user.targets) {
            const dc =
                target.actor?.data?.data?.saves?.[action.targetDC.toLowerCase()]
                    ?.value + 10;
            if (dc) {
                validTarget = true;
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
                resultMessage += `<hr /><b>${target.name}:</b>`;
                if (successStep >= 3) {
                    resultMessage += `<br />💥 <b>Critical Success</b>
                        ${
                            action.degreesOfSuccess?.criticalSuccess
                                ? `<br />${action.degreesOfSuccess.criticalSuccess}`
                                : ""
                        }`
                } else if (successStep === 2) {
                    resultMessage += `<br />✔️ <b>Success</b>
                    ${
                        action.degreesOfSuccess?.success
                            ? `<br />${action.degreesOfSuccess.success}`
                            : ""
                    }`
                } else if (successStep === 1) {
                    resultMessage += `<br />❌ <b>Failure</b>
                        ${
                            action.degreesOfSuccess?.failure
                                ? `<br />${action.degreesOfSuccess.failure}`
                                : ""
                        }`
                } else if (successStep <= 0) {
                    resultMessage += `<br />💔 <b>Critical Failure</b>
                    ${
                        action.degreesOfSuccess?.criticalFailure
                            ? `<br />${action.degreesOfSuccess.criticalFailure}`
                            : ""
                    }`
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
    if (penalty) {
        actor.removeCustomModifier(
            action.skill.toLowerCase(),
            "Multiple Attack Penalty"
        );
    }
})();
