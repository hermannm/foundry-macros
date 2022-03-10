const action = {
  name: "Tumble Through",
  skill: "Acrobatics",
  targetDC: "Reflex",
  actions: "OneAction",
  description:
    "You Stride up to your Speed. During this movement, you can try to move through the space of one enemy. Attempt an Acrobatics check against the enemy's Reflex DC as soon as you try to enter its space. You can Tumble Through using Climb, Fly, Swim, or another action instead of Stride in the appropriate environment.",
  degreesOfSuccess: {
    success:
      "You move through the enemy's space, treating the squares in its space as difficult terrain (every 5 feet costs 10 feet of movement). If you don't have enough Speed to move all the way through its space, you get the same effect as a failure.",
    failure:
      "Your movement ends, and you trigger reactions as if you had moved out of the square you started in.",
  },
  maxSize: 1,
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
        src="systems/pf2e/icons/actions/${action.actions}.webp"
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
      ...actor.getRollOptions(["all", "skill-check", action.skill.toLowerCase()]),
      action.name.toLowerCase(),
    ];

    if (action.attack) {
      options.push("attack");
    }

    skill().roll(event, options, (roll) => {
      let resultMessage = `<hr style="margin-top: 0;" />${skillFormat}`;
      let validTarget = false;

      const sizeArray = Object.keys(CONFIG.PF2E.actorSizes);
      const characterSizeIndex = sizeArray.indexOf(actor.data?.data?.traits?.size?.value);

      for (const target of game.user.targets) {
        const dc = target.actor?.data?.data?.saves?.[action.targetDC.toLowerCase()]?.value + 10;

        if (dc) {
          validTarget = true;
          resultMessage += `<hr /><b>${target.name}:</b>`;

          const legalSize =
            action.maxSize >=
            sizeArray.indexOf(target.actor?.data?.data?.traits?.size?.value) - characterSizeIndex;

          if (legalSize) {
            let successStep =
              roll.total >= dc ? (roll.total >= dc + 10 ? 3 : 2) : roll.total > dc - 10 ? 1 : 0;

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

  const modToString = (modifier) => (modifier >= 0 ? `+${modifier}` : `${modifier}`);

  const dialogContent = `
    ${skillFormat}
    <hr />
    ${action.requirements ? `<b>Requirements</b> ${action.requirements}<hr>` : ""}
    ${action.description ? `${action.description}<hr>` : ""}
  `;

  if (action.attack) {
    const weapon = actor.data.items
      .filter(
        (item) =>
          item.type === "weapon" &&
          item.data.equipped?.value === true &&
          item.data.traits.value?.some((trait) => trait === action.name.toLowerCase())
      )
      .reduce(
        (item1, item2) =>
          (item1?.data.potencyRune?.value ?? 0) > (item2?.data.potencyRune?.value ?? 0)
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
        await actor.addCustomModifier(action.skill.toLowerCase(), "Item Bonus", potency, "item");
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
        await actor.removeCustomModifier(action.skill.toLowerCase(), "Item Bonus");
      }
      if (penalty) {
        await actor.removeCustomModifier(action.skill.toLowerCase(), "Multiple Attack Penalty");
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
          label: `2nd attack (${modToString(skill().totalModifier + potency + getPenalty(2))})`,
          callback: () => {
            attackRoll(getPenalty(2));
          },
        },
        third: {
          label: `3rd attack (${modToString(skill().totalModifier + potency + getPenalty(3))})`,
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
