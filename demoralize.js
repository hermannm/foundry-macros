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
    const skill = Object.values(actor.data.data.skills).find(
        (skill) => skill.name === action.skill.toLowerCase()
    );
    const roll = await DicePF2e.d20Roll({
        event,
        parts: ["@mod"],
        data: { mod: skill.value },
        title: `
            <b>${action.name}: ${action.skill} vs. ${action.targetDC} DC</b>
            <div class="tags">
                ${skill.breakdown
                    .split(", ")
                    .map(
                        (mod) => `<span class="tag tag_secondary">${mod}</span>`
                    )
                    .join("")}
            </div>
        `,
        speaker: ChatMessage.getSpeaker(),
    });
    let resultMessage = "<hr /><h3>Demoralize</h3>";
    game.user.targets.forEach((target) => {
        const dc =
            target.actor?.data?.data?.saves?.[action.targetDC.toLowerCase()]
                ?.value + 10;
        if (dc) {
            let successStep;
            if (roll.total >= dc) {
                successStep = 2;
            } else {
                successStep = 1;
            }
            if (roll.total >= dc + 10) {
                successStep++;
            } else if (roll.total <= dc - 10) {
                successStep--;
            }
            const dieResult = roll.terms[0].results[0].result;
            if (dieResult === 20) {
                successStep++;
            } else if (dieResult === 1) {
                successStep--;
            }
            resultMessage += `<hr /><b>${target.name}:</b>`;
            if (successStep <= 0) {
                resultMessage += `
                    <br />💔 <b>Critical Failure</b>
                    ${
                        action.degreesOfSuccess?.criticalFailure
                            ? `<br />${action.degreesOfSuccess.criticalFailure}`
                            : ""
                    }
                `;
            } else if (successStep === 1) {
                resultMessage += `
                    <br />❌ <b>Failure</b>
                    ${
                        action.degreesOfSuccess?.failure
                            ? `<br />${action.degreesOfSuccess.failure}`
                            : ""
                    }
                `;
            } else if (successStep === 2) {
                resultMessage += `
                    <br />✔️ <b>Success</b>
                    ${
                        action.degreesOfSuccess?.success
                            ? `<br />${action.degreesOfSuccess.success}`
                            : ""
                    }
                `;
            } else if (successStep >= 3) {
                resultMessage += `
                    <br />💥 <b>Critical Success</b>
                    ${
                        action.degreesOfSuccess?.criticalSuccess
                            ? `<br />${action.degreesOfSuccess.criticalSuccess}`
                            : ""
                    }
                `;
            }
        }
    });
    if (game.user.targets.size > 0) {
        ChatMessage.create({
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: resultMessage,
        });
    }
})();
