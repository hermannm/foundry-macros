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
      attack: true,
      tags: ["Archetype"],
      requirements: "You are wielding an improvised weapon.",
      description:
        "You make a Strike with your wielded improvised weapon. You gain a +1 item bonus to the attack roll, and the Strike deals two weapon damage dice if it would have dealt fewer. If the attack is a critical hit, in addition to the effect of the critical hit, the improvised weapon breaks. If the item has a Hardness greater than your level, or if it's an artifact, cursed item, or other item that's difficult to break or destroy, the item doesn't break and the attack is a hit instead of a critical hit.",
    },
  ],
};
(async () => {
  const actionHeader = ({ actions, name, tags }) => `
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
  const actionBody = ({ content }) => {
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
  const actionFormat = ({ actions, name, tags, content }) =>
    `<div style="font-size: 14px; line-height: 16.8px; color: #191813;">
      ${actionHeader({ actions, name, tags })}${actionBody({ content })}
    </div>`;
  const contentFormat = (action) => {
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
    return {
      ...action,
      content,
    };
  };
  const slugify = (string) =>
    // borrowed from https://gist.github.com/codeguy/6684588
    string
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  const modToString = (modifier) =>
    modifier >= 0 ? `+${modifier}` : `${modifier}`;
  const buttonFormat = (action, modifiers) => {
    const buttons = ["", "", ""];
    if (action.attack) {
      if (action.actions === "Reaction") {
        buttons[0] = modifiers
          ? `${action.name} (${modToString(modifiers[0])})`
          : action.name;
      } else {
        if (!(action.tags ?? []).includes("Press")) {
          buttons[0] = modifiers ? `1st (${modToString(modifiers[0])})` : "1st";
        }
        if (
          !(
            action.actions === "ThreeActions" ||
            (action.tags ?? []).includes("Open")
          )
        ) {
          buttons[1] = modifiers ? `2nd (${modToString(modifiers[1])})` : "2nd";
          if (action.actions !== "TwoActions") {
            buttons[2] = modifiers
              ? `3rd (${modToString(modifiers[2])})`
              : "3rd";
          }
        }
      }
    } else {
      buttons[0] = action.name;
    }
    let buttonHTML = "";
    for (let i = 0; i < buttons.length; i++) {
      if (buttons[i]) {
        buttonHTML += `
            <button
              class="dialog-button ${slugify(action.name)}${i}"
              data-button="${slugify(action.name)}${i}"
              style="margin-bottom:5px;"
            >${buttons[i]}</button>
          `;
      }
    }
    return `<div class="dialog-buttons" style="margin-top: 5px;">${buttonHTML}</div>`;
  };
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
      const abilityModifier =
        actor.data.data.abilities[ability.slice(0, 3)].mod;
      const proficiencyModifier = calculateProficiencyModifier(
        actor.data.data.details.level.value,
        weapon.proficiency.toLowerCase()
      );
      return {
        total:
          multiAttackModifier +
          abilityModifier +
          proficiencyModifier +
          (weapon.itemBonus ?? 0),
        parts: [
          { label: ability, value: abilityModifier },
          {
            label: weapon.proficiency,
            value: proficiencyModifier,
          },
          ...(weapon.itemBonus
            ? [{ label: "Item Bonus", value: weapon.itemBonus }]
            : []),
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
  const strike = ({ MAP, melee }) => {
    const modifiers = melee ? meleeModifiers : rangedModifiers;
    DicePF2e.d20Roll({
      event,
      parts: [modifiers[MAP].total],
      data: actor.data,
      title: `
        <span class="flavor-text">
          <strong>Strike: ${weapon.name}</strong>
          (${melee ? "melee" : "ranged"})
          <div class="tags">
            ${modifiers[MAP].parts
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
    if (
      actor.items.find((item) =>
        item.data.name.includes("Weapon Specialization")
      )
    ) {
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
        if (damageParts.formula.includes(" + ")) {
          const splitFormula = damageParts.formula.split(" + ");
          damageParts.formula =
            splitFormula[0] +
            ` + ${parseInt(splitFormula[1]) + weaponSpecializationDamage}`;
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
    DicePF2e.damageRoll({
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
                  <span class="damage-tag damage-tag-${
                    tag.label === "Base" ? "base" : "modifier"
                  }">
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
  const dialog = new Dialog(
    {
      title: " ",
      content: `
        ${weapon.actions
          .map(
            (action) => `
              ${actionHeader(action)}
              <div style="
                display: flex;
                justify-content: center;
                margin-bottom: 5px;
              "><strong>Melee</strong></div>
              ${buttonFormat(
                { ...action, name: action.name + " melee" },
                meleeModifiers.map((modifier) => modifier.total)
              )}
              <div style="
                display: flex;
                justify-content: center;
                margin-bottom: 5px;
              "><strong>Ranged</strong></div>
              ${buttonFormat(
                { ...action, name: action.name + " ranged" },
                rangedModifiers.map((modifier) => modifier.total)
              )}
            `
          )
          .join("")}
        ${actionHeader({ actions: "Passive", name: "Damage" })}
        <div class="dialog-buttons" style="margin-top: 5px;">
          ${weapon.dieSizes
            .map(
              (dieSize) => `
              <button
                class="dialog-button damage-${dieSize}"
                data-button="damage-${dieSize}"
                style="margin-bottom:5px;"
              >${dieSize}</button>
            `
            )
            .join("")}
        </div>
      `,
      buttons: {},
    },
    { width: 300 }
  );
  for (const dieSize of weapon.dieSizes) {
    dialog.data.buttons[`critical-${dieSize}`] = {
      label: "💥",
      callback: () => {
        damage({ crit: true, dieSize, strength: true });
      },
    };
  }
  dialog.render(true);
  for (const dieSize of weapon.dieSizes) {
    dialog.data.buttons[`damage-${dieSize}`] = {
      callback: () => {
        damage({ crit: false, dieSize, strength: true });
      },
    };
  }
  if (weapon.actions) {
    for (const action of weapon.actions) {
      for (let MAP = 0; MAP < 3; MAP++) {
        dialog.data.buttons[`${slugify(action.name + " melee")}${MAP}`] = {
          callback: () => {
            ChatMessage.create({
              user: game.user._id,
              speaker: ChatMessage.getSpeaker(),
              content: `
                ${actionFormat(contentFormat(action))}
              `,
            });
            if (action.attack) {
              strike({ MAP, melee: true });
            }
          },
        };
        dialog.data.buttons[`${slugify(action.name + " ranged")}${MAP}`] = {
          callback: () => {
            ChatMessage.create({
              user: game.user._id,
              speaker: ChatMessage.getSpeaker(),
              content: `
                ${actionFormat(contentFormat(action))}
              `,
            });
            if (action.attack) {
              strike({ MAP, melee: false });
            }
          },
        };
      }
    }
  }
})();
