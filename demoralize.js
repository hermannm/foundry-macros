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
    const skill =
        actor.data.data.skills[
            Object.entries(actor.data.data.skills).find(
                (entry) => entry[1].name === action.skill.toLowerCase()
            )[0]
        ];
    const options = actor.getRollOptions([
        "all",
        "skill-check",
        action.skill.toLowerCase(),
    ]);
    skill.roll(event, options, (roll) => {
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
})();
