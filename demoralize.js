const action = {
    name: "Demoralize",
    skill: "Intimidation",
    targetDC: "Will",
    degreesOfSuccess: {
        criticalSuccess: "The target becomes frightened 2.",
        success: "The target becomes frightened 1.",
    }
};
(async () => {
    const skill = Object.values(actor.data.data.skills).find(
        (skill) => skill.name === action.skill.toLowerCase()
    );
    const parts = ["@mod"];
    const roll = await DicePF2e.d20Roll({
        event,
        parts,
        data: {
            mod: skill.value - skill.item,
        },
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
    let resultMessage = "<hr><h3>Demoralize</h3>";
    game.user.targets.forEach((target) => {
        let successStep = -1;
        const dc =
            target.actor.data.data.saves[action.targetDC.toLowerCase()].value + 10;
        if (roll.total >= dc) {
            successStep = 2;
        } else {
            successStep = 1;
        }
        if (roll.parts[0].rolls[0].result == 20) {
            successStep++;
        } else if (roll.parts[0].rolls[0].result == 1) {
            successStep--;
        } else if (roll.total >= dc + 10) {
            successStep++;
        } else if (roll.total <= dc - 10) {
            successStep--;
        }
        resultMessage += `<hr><div><b>${target.name}:</b></div>`;
        switch (successStep) {
            case 0:
                resultMessage += `
                    💔 <b>Critical Failure</b>
                    ${action.degreesOfSuccess?.criticalFailure ? `<br>${action.degreesOfSuccess.criticalFailure}` : ""}
                `;
                break;
            case 1:
                resultMessage += `
                    ❌ <b>Failure</b>
                    ${action.degreesOfSuccess?.failure ? `<br>${action.degreesOfSuccess.failure}` : ""}
                `;
                break;
            case 2:
                resultMessage += `
                    ✔️ <b>Success</b>
                    ${action.degreesOfSuccess?.success ? `<br>${action.degreesOfSuccess.success}` : ""}
                `;
                break;
            case 3:
                resultMessage += `
                    💥 <b>Critical Success</b>
                    ${action.degreesOfSuccess?.criticalSuccess ? `<br>${action.degreesOfSuccess.criticalSuccess}` : ""}
                `;
                break;
            default:
                resultMessage += "Error in calculating success.";
        }
    });
    if (game.user.targets.size > 0){
        ChatMessage.create({
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: resultMessage,
        });
    }
})();
