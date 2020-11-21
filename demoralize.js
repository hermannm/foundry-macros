const action = {
    name: "Demoralize",
    skill: "Intimidation",
    targetDC: "Will",
    degreesOfSuccess: {
        criticalSuccess: "The target becomes frightened 2.",
        success: "The target becomes frightened 1.",
    },
};
(async () => {
    const skillKey = Object.keys(actor.data.data.skills).find(
        (key) => actor.data.data.skills[key].name === action.skill.toLowerCase()
    );
    const options = actor.getRollOptions([
        "all",
        "skill-check",
        action.skill.toLowerCase(),
    ]);
    actor.data.data.skills[skillKey].roll(event, options, (roll) => {
        let resultMessage = "<hr /><h3>Demoralize</h3>";
        let validTarget = false;
        game.user.targets.forEach((target) => {
            const dc =
                target.actor?.data?.data?.saves?.[action.targetDC.toLowerCase()]
                    ?.value + 10;
            if (dc) {
                validTarget = true;
                const successStep =
                    (roll.total >= dc
                        ? roll.total >= dc + 10
                            ? 3
                            : 2
                        : roll.total > dc - 10
                        ? 1
                        : 0) +
                    (roll.terms[0].results[0].result === 20
                        ? 1
                        : roll.terms[0].results[0].result === 1
                        ? -1
                        : 0);
                resultMessage += `
                    <hr /><b>${target.name}:</b>
                    ${
                        successStep >= 3
                            ? `<br />💥 <b>Critical Success</b>
                            ${
                                action.degreesOfSuccess?.criticalSuccess
                                    ? `<br />${action.degreesOfSuccess.criticalSuccess}`
                                    : ""
                            }`
                            : successStep === 2
                            ? `<br />✔️ <b>Success</b>
                            ${
                                action.degreesOfSuccess?.success
                                    ? `<br />${action.degreesOfSuccess.success}`
                                    : ""
                            }`
                            : successStep === 1
                            ? `<br />❌ <b>Failure</b>
                            ${
                                action.degreesOfSuccess?.failure
                                    ? `<br />${action.degreesOfSuccess.failure}`
                                    : ""
                            }`
                            : `<br />💔 <b>Critical Failure</b>
                                ${
                                    action.degreesOfSuccess?.criticalFailure
                                        ? `<br />${action.degreesOfSuccess.criticalFailure}`
                                        : ""
                                }`
                    }
                `;
            }
        });
        if (validTarget) {
            ChatMessage.create({
                user: game.user._id,
                speaker: ChatMessage.getSpeaker(),
                content: resultMessage,
            });
        }
    });
})();
