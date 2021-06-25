const weapon = {
  name: "Halberd",
  tags: ["Reach", "Versatile S"],
  strikeAction: true,
  damage: ["Piercing", "Slashing"],
  criticalEffects: [
    {
      name: "Shock",
      content: [
        "On a critical hit, electricity arcs out to deal an equal amount of electricity damage to up to two other creatures of your choice within 10 feet of the target.",
      ],
      rollData: {
        selectors: ["electricity", "energy"],
        multiplier: 2,
      },
    },
  ],
};

(async () => {
  const getStrikeItem = () =>
    (actor.data.data.actions ?? [])
      .filter((action) => action.type === "strike")
      .find((strike) => strike.name === weapon.name);

  const modifiers = getStrikeItem().variants.map((variant) => {
    let modifier = getStrikeItem().totalModifier;
    const splitLabel = variant.label.split(" ");
    if (splitLabel[0] === "MAP") {
      modifier += parseInt(splitLabel[1]);
    }
    return modifier;
  });

  const dialogButtons = [];

  const slugify = (string) =>
    // borrowed from https://gist.github.com/codeguy/6684588
    string
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const modToString = (modifier) =>
    modifier >= 0 ? `+${modifier}` : `${modifier}`;

  const strike = async (strikeIndex) => {
    const options = actor.getRollOptions([
      "all",
      "str-based",
      "attack",
      "attack-roll",
    ]);
    if (weapon.tags) {
      options.push(...weapon.tags.map((tag) => slugify(tag)));
    }
    await getStrikeItem().variants[strikeIndex].roll({ event, options });
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

  const postChatMessage = ({ content }) => {
    ChatMessage.create({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      content,
    });
  };

  const postDamageMessage = async ({ content, damageParts }) => {
    let message = `${content}<hr />`;

    const tags = [];
    for (const damagePart of damageParts) {
      if (damagePart.tag) {
        tags.push(`${damagePart.tag} ${modToString(damagePart.value)}`);
      }
    }
    if (tags.length !== 0) {
      message += `
        <div style="display: flex; flex-wrap: wrap;">
          ${tags.map(
            (tag) => `
              <span class="damage-tag damage-tag-base">
                ${tag}
              </span>
            `
          )}
        </div>
      `;
    }

    await game.pf2e.Dice.damageRoll({
      event,
      parts: damageParts.map((damagePart) => damagePart.value.toString()),
      actor,
      data: actor.data.data,
      title: message,
      speaker: ChatMessage.getSpeaker(),
    });
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
                  <span class="tag tag_alt"">${tag}</span>
                `
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
    if (action.frequency) {
      content.push({
        title: "Frequency",
        text: action.frequency,
      });
    }
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
    if (action.damage) {
      if (action.damage.title) {
        content.push({
          title: action.damage.title,
          text: action.damage.text ?? "",
        });
      }
    }
    return content;
  };

  const rollDamage = ({ crit, damageType }) => {
    const options = actor.getRollOptions([
      "all",
      "str-based",
      "damage",
      "damage-roll",
    ]);

    if (damageType) {
      const versatileTag = `versatile-${damageType}`;
      if ((weapon.tags ?? []).find((tag) => slugify(tag) === versatileTag)) {
        options.push(versatileTag);
      }
    }

    if (crit) {
      getStrikeItem().critical({
        event,
        options,
        callback: (rollData) => {
          console.log(rollData);
          if (weapon.criticalEffects) {
            for (const criticalEffect of weapon.criticalEffects) {
              const actionFormat = formatAction({
                ...criticalEffect,
                actions: "Passive",
              });
              if (criticalEffect.rollData) {
                postDamageMessage({
                  content: actionFormat,
                  damageParts: [
                    {
                      value: `${
                        criticalEffect.rollData.multiplier
                          ? `${criticalEffect.rollData.multiplier}*`
                          : ""
                      }${
                        rollData.diceResults[
                          criticalEffect.rollData.selectors[0]
                        ][criticalEffect.rollData.selectors[1]]
                      }`,
                    },
                  ],
                });
              } else {
                postChatMessage({ content: actionFormat });
              }
            }
          }
        },
      });
    } else {
      getStrikeItem().damage({ event, options });
    }
  };

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

  const createActionButton = async ({
    action,
    modifier,
    strikeIndex,
    effect,
  }) => {
    let id = slugify(action.name);
    if (effect) {
      id += `-${slugify(effect.name)}`;
    }
    if (strikeIndex !== undefined) {
      id += `-${strikeIndex}`;
    }

    let label =
      strikeIndex !== undefined &&
      action.strike &&
      action.actions !== "Reaction"
        ? strikeIndexToLabel(strikeIndex)
        : action.name;
    if (strikeIndex !== undefined || modifier) {
      let appliedModifier = modifier ?? modifiers[strikeIndex];
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
        if (
          action.actions === "ThreeActions" ||
          (action.tags ?? []).includes("Open")
        ) {
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
      callback: async () => {
        if (action.name !== `${weapon.name} Strike`) {
          const actionFormat = formatAction({
            ...action,
            content: structureActionContent(action),
          });
          if (action.damage) {
            await postDamageMessage({
              content: actionFormat,
              damageParts: action.damage.parts,
            });
          } else {
            postChatMessage({ content: actionFormat });
          }
        }
        if (strikeIndex !== undefined) {
          if (effect) {
            executeWithEffect({ effect, callback: () => strike(strikeIndex) });
          } else {
            await strike(strikeIndex);
          }
        }
        if (action.callback) {
          action.callback();
        }
      },
    };

    if (!actionButton.disabled) {
      dialogButtons.push(actionButton);
    }

    return actionButton;
  };

  const createActionButtons = async ({ action, effect }) => {
    const actionButtons = [];

    if (action.strike) {
      if (action.actions === "Reaction") {
        actionButtons.push(
          await createActionButton({ action, strikeIndex: 0, effect })
        );
      } else {
        for (let strikeIndex = 0; strikeIndex < 3; strikeIndex++) {
          actionButtons.push(
            await createActionButton({ action, strikeIndex, effect })
          );
        }
      }
    } else {
      actionButtons.push(await createActionButton({ action, effect }));
    }

    return actionButtons;
  };

  const createDamageButton = ({ crit, damageType, effect }) => {
    let id = crit ? "critical" : "damage";
    if (effect) {
      id += `-${slugify(effect.name)}`;
    }
    if (damageType) {
      id += `-${damageType}`;
    }

    const damageButton = {
      id,
      label: crit ? `💥` : `✔️`,
      callback: () => {
        if (effect) {
          executeWithEffect({
            effect,
            callback: () => rollDamage({ crit, damageType }),
          });
        } else {
          rollDamage({ crit, damageType });
        }
      },
      effect,
    };

    dialogButtons.push(damageButton);

    return damageButton;
  };

  const createDamageButtons = ({ damageType, effect }) => {
    const damageButtons = [
      createDamageButton({ crit: false, damageType, effect }),
      createDamageButton({ crit: true, damageType, effect }),
    ];
    return damageButtons;
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

  const formatDialogAction = async (action) => {
    let actionFormat = "";

    actionFormat += formatActionHeader(action);
    actionFormat += formatButtons(await createActionButtons({ action }));

    if (weapon.effects) {
      for (const effect of weapon.effects) {
        if (effect.modifier.stat === "attack") {
          actionFormat += formatTitle(effect.name);
          actionFormat += formatButtons(
            await createActionButtons({ action, effect })
          );
        }
      }
    }

    return actionFormat;
  };

  const formatDialog = async () => {
    let dialogFormat = "";

    if (weapon.strikeAction) {
      dialogFormat += await formatDialogAction({
        actions: "OneAction",
        name: `${weapon.name} Strike`,
        strike: true,
        tags: weapon.tags,
      });
    }

    if (weapon.actions) {
      for (const action of weapon.actions) {
        dialogFormat += await formatDialogAction(action);
      }
    }

    if (weapon.damage) {
      dialogFormat += formatActionHeader({
        actions: "Passive",
        name: "Damage",
      });
      if (Array.isArray(weapon.damage)) {
        for (const damageType of weapon.damage) {
          dialogFormat += formatTitle(damageType);
          dialogFormat += formatButtons(
            createDamageButtons({
              damageType: damageType.charAt(0).toLowerCase(),
            })
          );
        }
        if (weapon.effects) {
          for (const effect of weapon.effects) {
            if (effect.modifier.stat === "damage") {
              dialogFormat += formatTitle(effect.name.toUpperCase());
              for (const damageType of weapon.damage) {
                dialogFormat += formatTitle(damageType);
                dialogFormat += formatButtons(
                  createDamageButtons({
                    damageType: damageType.charAt(0).toLowerCase(),
                    effect,
                  })
                );
              }
            }
          }
        }
      } else {
        dialogFormat += formatButtons(createDamageButtons({}));
        if (weapon.effects) {
          for (const effect of weapon.effects) {
            if (effect.modifier.stat === "damage") {
              dialogFormat += formatTitle(effect.name);
              dialogFormat += formatButtons(createDamageButtons({ effect }));
            }
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
      content: await formatDialog(),
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
