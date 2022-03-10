const weapon = {
  name: "Improvised Weapon",
  proficiency: "Master",
  itemBonus: 1,
  diceNumber: 2,
  dieSizes: ["d4", "d6", "d8", "d10", "d12"],
  actions: [
    {
      name: "Improvised Pummel",
      actions: "OneAction", // OneAction/TwoActions/ThreeActions/FreeAction/Reaction/Passive
      strike: true,
      tags: ["Archetype"],
      requirements: "You are wielding an improvised weapon.",
      description:
        "You make a Strike with your wielded improvised weapon. You gain a +1 item bonus to the attack roll, and the Strike deals two weapon damage dice if it would have dealt fewer. If the attack is a critical hit, in addition to the effect of the critical hit, the improvised weapon breaks. If the item has a Hardness greater than your level, or if it's an artifact, cursed item, or other item that's difficult to break or destroy, the item doesn't break and the attack is a hit instead of a critical hit.",
    },
  ],
};

(async () => {
  const dialogButtons = [];

  const calculateProficiencyModifier = (level, proficiency) =>
    level +
    (proficiency === "trained"
      ? 2
      : proficiency === "expert"
      ? 4
      : proficiency === "master"
      ? 6
      : proficiency === "legendary"
      ? 8
      : 0);

  const attackModifiers = (ability) =>
    [0, -5, -10].map((multiAttackModifier) => {
      const abilityModifier = actor.data.data.abilities[ability.slice(0, 3)].mod;

      const proficiencyModifier = calculateProficiencyModifier(
        actor.data.data.details.level.value,
        weapon.proficiency.toLowerCase()
      );

      return {
        total:
          multiAttackModifier + abilityModifier + proficiencyModifier + (weapon.itemBonus ?? 0),
        parts: [
          { label: ability, value: abilityModifier },
          {
            label: weapon.proficiency,
            value: proficiencyModifier,
          },
          ...(weapon.itemBonus ? [{ label: "Item Bonus", value: weapon.itemBonus }] : []),
          ...(multiAttackModifier === 0
            ? []
            : [
                {
                  label: "Multiple Attack Penalty",
                  value: multiAttackModifier,
                },
              ]),
        ],
      };
    });

  const meleeModifiers = attackModifiers("strength");

  const rangedModifiers = attackModifiers("dexterity");

  const modToString = (modifier) => (modifier >= 0 ? `+${modifier}` : `${modifier}`);

  const strike = ({ strikeIndex, melee }) => {
    const modifiers = melee ? meleeModifiers : rangedModifiers;

    game.pf2e.Dice.d20Roll({
      event,
      parts: [modifiers[strikeIndex].total],
      data: actor.data,
      title: `
        <span class="flavor-text">
          <strong>Strike: ${weapon.name}</strong>
          (${melee ? "melee" : "ranged"})
          <div class="tags">
            ${modifiers[strikeIndex].parts
              .map(
                (part) => `
                  <span class="tag tag_alt">
                    ${part.label} ${modToString(part.value)}
                  </span>
                `
              )
              .join("")}
          </div>
        </span>
      `,
      speaker: ChatMessage.getSpeaker(),
    });
  };

  const damage = ({ crit, dieSize, strength }) => {
    const diceDamage = `${weapon.diceNumber}${dieSize}`;

    const damageParts = {
      formula: diceDamage,
      tags: [{ label: "Base", value: diceDamage }],
    };

    if (strength) {
      const strengthDamage = actor.data.data.abilities.str.mod;

      damageParts.formula += ` + ${strengthDamage}`;
      damageParts.tags.push({
        label: "Strength",
        value: modToString(strengthDamage),
      });
    }

    if (actor.items.find((item) => (item.data.data.slug ?? "").includes("weapon-specialization"))) {
      let weaponSpecializationDamage;

      switch (weapon.proficiency.toLowerCase()) {
        case "expert":
          weaponSpecializationDamage = 2;
          break;
        case "master":
          weaponSpecializationDamage = 3;
          break;
        case "legendary":
          weaponSpecializationDamage = 4;
          break;
      }

      if (weaponSpecializationDamage) {
        if (
          actor.items.find((item) =>
            (item.data.data.slug ?? "").includes("greater-weapon-specialization")
          )
        ) {
          weaponSpecializationDamage *= 2;
        }

        if (damageParts.formula.includes(" + ")) {
          const splitFormula = damageParts.formula.split(" + ");

          damageParts.formula =
            splitFormula[0] + ` + ${parseInt(splitFormula[1]) + weaponSpecializationDamage}`;
        } else {
          damageParts.formula += ` + ${weaponSpecializationDamage}`;
        }

        damageParts.tags.push({
          label: "Weapon Specialization",
          value: modToString(weaponSpecializationDamage),
        });
      }
    }

    if (crit) {
      damageParts.formula = `2 * (${damageParts.formula})`;
    }

    game.pf2e.Dice.damageRoll({
      event,
      parts: [damageParts.formula],
      actor,
      data: actor.data.data,
      title: `
        <span class="flavor-text">
          <b>Damage Roll: ${weapon.name}</b>
          (${crit ? "Critical Success" : "Success"})
          <hr />
          <div style="display: flex; flex-wrap: wrap">
            ${damageParts.tags
              .map(
                (tag) => `
                  <span class="damage-tag damage-tag-${tag.label === "Base" ? "base" : "modifier"}">
                    ${tag.label} ${tag.value}
                  </span>
                `
              )
              .join("")}
          </div>
        </span>
      `,
      speaker: ChatMessage.getSpeaker(),
    });
  };

  const executeWithEffect = async ({ effect, callback }) => {
    await actor.addCustomModifier(
      effect.modifier.stat,
      effect.name,
      effect.modifier.value,
      effect.modifier.type ?? "untyped"
    );

    callback();

    await actor.removeCustomModifier(effect.modifier.stat, effect.name);
  };

  const formatActionHeader = ({ actions, name, tags }) => `
    <hr style="margin-top: 0; margin-bottom: 3px;" />
    <header style="display: flex; font-size: 14px">
      <img
        style="flex: 0 0 36px; margin-right: 5px;"
        src="systems/pf2e/icons/actions/${actions}.webp"
        title="${name}"
        width="36"
        height="36"
      >
      <h3 style="flex: 1; line-height: 36px; margin: 0;">
        ${name}
      </h3>
    </header>
    ${
      tags
        ? `
          <hr style="margin-top: 3px; margin-bottom: 1px;" />
          <div class="tags" style="
            margin-bottom: 5px;
          ">
            ${tags
              .map(
                (tag) => `
                  <span class="tag tag_alt"">${tag}</span>`
              )
              .join(" ")}
          </div>
        `
        : `<hr style="margin-top: 3px;" />`
    }
  `;

  const formatActionBody = ({ content }) => {
    const checkTitle = (paragraph) =>
      typeof paragraph === "object"
        ? `<strong>${paragraph.title}</strong> ${paragraph.text}`
        : paragraph;

    return `
      <div style="font-weight: 500;">
        ${content
          .map((paragraph) =>
            Array.isArray(paragraph)
              ? paragraph
                  .map((subParagraph) => checkTitle(subParagraph))
                  .join(`<div style="margin-bottom: 5px;"></div>`)
              : checkTitle(paragraph)
          )
          .join("<hr />")}
      </div>
    `;
  };

  const formatAction = ({ actions, name, tags, content }) => `
    <div style="font-size: 14px; line-height: 16.8px; color: #191813;">
      ${formatActionHeader({ actions, name, tags })}
      ${formatActionBody({ content })}
    </div>
  `;

  const structureActionContent = (action) => {
    const content = [];

    if (action.trigger) {
      content.push({
        title: "Trigger",
        text: action.trigger,
      });
    }
    if (action.requirements) {
      content.push({
        title: "Requirements",
        text: action.requirements,
      });
    }
    if (action.description) {
      content.push(action.description);
    }
    if (action.failure) {
      content.push({
        title: "Failure",
        text: action.failure,
      });
    }

    return content;
  };

  const slugify = (string) =>
    // Borrowed from https://gist.github.com/codeguy/6684588
    string
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const strikeIndexToLabel = (strikeIndex) => {
    switch (strikeIndex) {
      case 0:
        return "1st";
      case 1:
        return "2nd";
      case 2:
        return "3rd";
    }
  };

  const createActionButton = ({ action, modifier, strikeIndex, melee, effect }) => {
    const modifiers = melee ? meleeModifiers : rangedModifiers;

    let id = slugify(action.name);
    id += melee ? "-melee" : "-ranged";
    if (effect) {
      id += `-${slugify(effect.name)}`;
    }
    if (strikeIndex !== undefined) {
      id += `-${strikeIndex}`;
    }

    let label =
      strikeIndex !== undefined && action.strike && action.actions !== "Reactions"
        ? strikeIndexToLabel(strikeIndex)
        : action.name;

    if (strikeIndex !== undefined || modifier) {
      let appliedModifier = modifier ?? modifiers[strikeIndex].total;
      if (effect) {
        appliedModifier += effect.modifier.value;
      }
      label += ` (${modToString(appliedModifier)})`;
    }

    let disabled = false;
    if (strikeIndex !== undefined) {
      if (strikeIndex === 0) {
        if ((action.tags ?? []).includes("Press")) {
          disabled = true;
        }
      } else {
        if (action.actions === "ThreeActions" || (action.tags ?? []).includes("Open")) {
          disabled = true;
        } else if (strikeIndex === 2 && action.actions === "TwoActions") {
          disabled = true;
        }
      }
    }

    const actionButton = {
      id,
      label,
      disabled,
      callback: () => {
        if (action.name !== `${weapon.name} Strike`) {
          ChatMessage.create({
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: `
              ${formatAction({
                ...action,
                content: structureActionContent(action),
              })}
            `,
          });
        }

        if (strikeIndex !== undefined) {
          if (effect) {
            executeWithEffect({
              effect,
              callback: () => strike({ strikeIndex, melee }),
            });
          } else {
            strike({ strikeIndex, melee });
          }
        }
      },
    };

    if (!actionButton.disabled) {
      dialogButtons.push(actionButton);
    }

    return actionButton;
  };

  const createActionButtons = ({ action, melee, effect }) => {
    const actionButtons = [];

    const modifiers = melee ? meleeModifiers : rangedModifiers;

    if (action.actions === "Reaction") {
      actionButtons.push(createActionButton({ action, strikeIndex: 0, melee, effect }));
    } else {
      for (let strikeIndex = 0; strikeIndex < modifiers.length; strikeIndex++) {
        actionButtons.push(createActionButton({ action, strikeIndex, melee, effect }));
      }
    }

    return actionButtons;
  };

  const createDamageButton = ({ crit, dieSize, strength, effect }) => {
    let id = crit ? "critical" : "damage";
    id += `-${dieSize}`;
    if (strength) {
      id += "-strength";
    }
    if (effect) {
      id += `-${slugify(effect.name)}`;
    }

    const damageButton = {
      id,
      label: crit ? `💥` : dieSize,
      callback: () => {
        if (effect) {
          executeWithEffect({
            effect,
            callback: () => damage({ crit, dieSize, strength }),
          });
        } else {
          damage({ crit, dieSize, strength });
        }
      },
    };

    dialogButtons.push(damageButton);

    return damageButton;
  };

  const formatButtons = (buttons) => {
    let buttonFormat = "";

    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      buttonFormat += button.disabled
        ? `
          <div style="
            margin-bottom: 5px;
            ${i === buttons.length - 1 ? "" : "margin-right: 5px;"}
            padding: 1px 6px;
            border: 2px groove #f0f0e0;
            border-radius: 3px;
            text-align: center;
            font-family: Signika, sans-serif;
            font-size: 14px;
            color: #4b4a44;
            line-height: 28px;
          ">
            ${button.label}
          </div>
        `
        : `
          <button
            class="dialog-button ${button.id}"
            data-button="${button.id}"
            style="
              margin-bottom: 5px;
              ${button.disabled ? "visibility: hidden;" : ""}
            "
          >${button.label}</button>
        `;
    }

    return `<div class="dialog-buttons" style="margin-top: 5px;">${buttonFormat}</div>`;
  };

  const formatTitle = (title) => `
    <div style="
      display: flex;
      justify-content: center;
      margin-bottom: 5px;
    "><strong>${title}</strong></div>
  `;

  const formatDialogAction = (action) => {
    let actionFormat = "";

    actionFormat += formatActionHeader(action);
    actionFormat += formatTitle("Melee");
    actionFormat += formatButtons(createActionButtons({ action, melee: true }));
    actionFormat += formatTitle("Ranged");
    actionFormat += formatButtons(createActionButtons({ action, melee: false }));

    if (weapon.effects) {
      for (const effect of weapon.effects) {
        if (effect.modifier.stat === "attack") {
          actionFormat += formatTitle(effect.name.toUpperCase());
          actionFormat += formatTitle("Melee");
          actionFormat += formatButtons(createActionButtons({ action, melee: true }));
          actionFormat += formatTitle("Ranged");
          actionFormat += formatButtons(createActionButtons({ action, melee: false }));
        }
      }
    }

    return actionFormat;
  };

  const formatDialogDamageButtons = (effect) =>
    [false, true]
      .map((crit) =>
        formatButtons(
          weapon.dieSizes.map((dieSize) =>
            createDamageButton({ crit, dieSize, strength: true, effect })
          )
        )
      )
      .join(`<div style="margin-top: -5px"></div>`);

  const formatDialog = () => {
    let dialogFormat = "";

    if (weapon.strikeAction) {
      dialogFormat += formatDialogAction({
        actions: "OneAction",
        name: `${weapon.name} Strike`,
        strike: true,
        tags: weapon.tags,
      });
    }

    if (weapon.actions) {
      for (const action of weapon.actions) {
        dialogFormat += formatDialogAction(action);
      }
    }

    if (weapon.dieSizes) {
      dialogFormat += formatActionHeader({
        actions: "Passive",
        name: "Damage",
      });
      dialogFormat += formatDialogDamageButtons();
      if (weapon.effects) {
        for (const effect of weapon.effects) {
          if (effect.modifier.stat === "damage") {
            dialogFormat += formatTitle(effect.name);
            dialogFormat += formatDialogDamageButtons(effect);
          }
        }
      }
    }

    dialogFormat += `<div style="margin-top: -5px"></div>`;

    return dialogFormat;
  };

  const dialog = new Dialog(
    {
      title: " ",
      content: formatDialog(),
      buttons: {},
    },
    { width: 300 }
  );
  dialog.render(true);

  for (const button of dialogButtons) {
    dialog.data.buttons[button.id] = {
      callback: button.callback,
    };
  }
})();
