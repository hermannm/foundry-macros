const weapon = {
  name: "Composite Longbow",
  tags: ["Deadly d10", "Propulsive", "Volley 30 ft.", "Range 100 ft."],
  description: [
    "This projectile weapon is made from horn, wood, and sinew laminated together to increase the power of its pull and the force of its projectile. Like all longbows, its great size also increases the bow’s range and power. You must use two hands to fire it, and it cannot be used while mounted.",
  ],
  effect: {
    name: "Volley 30 ft.",
    description:
      "This ranged weapon is less effective at close distances. Your attacks against targets that are at a distance within the range listed take a –2 penalty.",
    modifier: {
      stat: "attack",
      value: -2,
    },
  },
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
  const slugify = (string) =>
    // borrowed from https://gist.github.com/codeguy/6684588
    string
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  const strikeItem = () =>
    (actor.data.data.actions ?? [])
      .filter((action) => action.type === "strike")
      .find((strike) => strike.name === weapon.name);
  const modifiers = strikeItem().variants.map((variant) => {
    let modifier = strikeItem().totalModifier;
    const splitLabel = variant.label.split(" ");
    if (splitLabel[0] === "MAP") {
      modifier += parseInt(splitLabel[1]);
    }
    return modifier;
  });
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
  const strike = (MAP) => {
    const options = [
      ...actor.getRollOptions(["all", "str-based", "attack", "attack-roll"]),
      ...(weapon.tags ? weapon.tags.map((tag) => slugify(tag)) : []),
    ];
    strikeItem().variants[MAP].roll({ event, options });
  };
  const strikeWithEffect = async (MAP) => {
    await actor.addCustomModifier(
      weapon.effect.modifier.stat,
      weapon.effect.name,
      weapon.effect.modifier.value,
      weapon.effect.modifier.type ?? "untyped"
    );
    strike(MAP);
    await actor.removeCustomModifier(
      weapon.effect.modifier.stat,
      weapon.effect.name
    );
  };
  const damage = ({ crit }) => {
    const options = [
      ...actor.getRollOptions(["all", "str-based", "damage", "damage-roll"]),
      ...(weapon.tags ? weapon.tags.map((tag) => slugify(tag)) : []),
    ];
    if (crit) {
      strikeItem().critical({ event, options });
    } else {
      strikeItem().damage({ event, options });
    }
  };
  const strikeAction = {
    actions: "OneAction",
    name: `${weapon.name} Strike`,
    attack: true,
    tags: weapon.tags,
  };
  const dialog = new Dialog({
    title: " ",
    content: `
      ${actionHeader(strikeAction)}
      ${buttonFormat(strikeAction, modifiers)}
      <div style="
        display: flex;
        justify-content: center;
        margin-bottom: 5px;
      "><strong>${weapon.effect.name}</strong></div>
      ${buttonFormat(
        { ...strikeAction, name: weapon.effect.name },
        modifiers.map((modifier) => modifier + weapon.effect.modifier.value)
      )}
      ${actionHeader({ actions: "Passive", name: "Damage" })}
    `,
    buttons: {
      damage: {
        label: "✔️",
        callback: () => {
          damage({ crit: false });
        },
      },
      critical: {
        label: "💥",
        callback: () => {
          damage({ crit: true });
        },
      },
    },
  });
  dialog.render(true);
  for (let MAP = 0; MAP < 3; MAP++) {
    dialog.data.buttons[`${slugify(strikeAction.name)}${MAP}`] = {
      callback: () => {
        strike(MAP);
      },
    };
    dialog.data.buttons[`${slugify(weapon.effect.name)}${MAP}`] = {
      callback: () => {
        strikeWithEffect(MAP);
      },
    };
  }
})();
