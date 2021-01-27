const action = {
  name: "Disarm",
  skill: "Athletics",
  targetDC: "Reflex",
  actions: "OneAction", // OneAction/TwoAction/ThreeAction/FreeAction/Reaction/Passive
  requirements:
    "You have at least one hand free. The target can’t be more than one size larger than you.",
  description:
    "You try to knock something out of an opponent’s grasp. Attempt an Athletics check against the opponent’s Reflex DC.",
  degreesOfSuccess: {
    criticalSuccess:
      "You knock the item out of the opponent’s grasp. It falls to the ground in the opponent’s space.",
    success:
      "You weaken your opponent’s grasp on the item. Until the start of that creature’s turn, attempts to Disarm the opponent of that item gain a +2 circumstance bonus, and the target takes a –2 circumstance penalty to attacks with the item or other checks requiring a firm grasp on the item.",
    criticalFailure:
      "You lose your balance and become flat-footed until the start of your next turn.",
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
  const skillFormat = `
    <header style="display: flex;">
      <img
        style="flex: 0 0 36px; margin-right: 5px;"
        src="systems/pf2e/icons/actions/${action.actions}.png"
        title="${action.name}"
        width="36"
        height="36"
      >
      <h3
        style="flex: 1; line-height: 36px; margin: 0;"
      >${action.name}</h3>
    </header>
  `;
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
      let resultMessage = `<hr style="margin-top: 0;" />${skillFormat}`;
      let validTarget = false;
      const sizeArray = Object.keys(CONFIG.PF2E.actorSizes);
      const characterSizeIndex = sizeArray.indexOf(
        actor.data?.data?.traits?.size?.value
      );
      for (const target of game.user.targets) {
        const dc =
          target.actor?.data?.data?.saves?.[action.targetDC.toLowerCase()]
            ?.value + 10;
        if (dc) {
          validTarget = true;
          resultMessage += `<hr /><b>${target.name}:</b>`;
          const legalSize =
            action.maxSize >=
            sizeArray.indexOf(target.actor?.data?.data?.traits?.size?.value) -
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
              resultMessage += "<br />💥 <b>Critical Success</b>";
              if (action.degreesOfSuccess?.criticalSuccess) {
                resultMessage += `<br />${action.degreesOfSuccess.criticalSuccess}`;
              }
            } else if (successStep === 2) {
              resultMessage += "<br />✔️ <b>Success</b>";
              if (action.degreesOfSuccess?.success) {
                resultMessage += `<br />${action.degreesOfSuccess.success}`;
              }
            } else if (successStep === 1) {
              resultMessage += "<br />❌ <b>Failure</b>";
              if (action.degreesOfSuccess?.failure) {
                resultMessage += `<br />${action.degreesOfSuccess.failure}`;
              }
            } else if (successStep <= 0) {
              resultMessage += "<br />💔 <b>Critical Failure</b>";
              if (action.degreesOfSuccess?.criticalFailure) {
                resultMessage += `<br />${action.degreesOfSuccess.criticalFailure}`;
              }
            }
          } else {
            resultMessage += "<br />⚠️ <b>The target is too big!</b>";
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
  const modToString = (modifier) =>
    modifier >= 0 ? `+${modifier}` : `${modifier}`;
  const dialogContent = `
    ${skillFormat}
    <hr />
    ${
      action.requirements
        ? `<b>Requirements</b> ${action.requirements}<hr>`
        : ""
    }
    ${action.description ? `${action.description}<hr>` : ""}
  `;
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
      (weapon?.data.traits.value?.some((trait) => trait === "agile") ?? false);
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
    new Dialog({
      title: " ",
      content: dialogContent,
      buttons: {
        first: {
          label: `1st attack (${modToString(skill().totalModifier + potency)})`,
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
    new Dialog({
      title: " ",
      content: dialogContent,
      buttons: {
        roll: {
          label: `${action.skill} (${modToString(skill().totalModifier)})`,
          callback: skillRoll,
        },
      },
      default: "roll",
    }).render(true);
  }
})();
