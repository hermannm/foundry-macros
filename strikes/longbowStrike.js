const weapon = {
  name: "Composite Longbow",
  tags: ["Deadly d10", "Propulsive", "Volley 30 ft."],
  description: [
    "This projectile weapon is made from horn, wood, and sinew laminated together to increase the power of its pull and the force of its projectile. Like all longbows, its great size also increases the bow’s range and power. You must use two hands to fire it, and it cannot be used while mounted.",
    {
      title: "Range",
      text: "100 ft.",
    },
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
  const actionFormat = ({ actions, name, tags, content }) => {
    const checkTitle = (paragraph) =>
      typeof paragraph === "object"
        ? `<strong>${paragraph.title}</strong> ${paragraph.text}`
        : paragraph;
    return `
      <header style="display: flex; font-size: 14px">
        <img
          style="flex: 0 0 36px; margin-right: 5px;"
          src="systems/pf2e/icons/actions/${actions}.png"
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
      <div style="font-weight: 500; font-size: 14px;">
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
  const strikeButtonFormat = ({ id, modifiers }) => {
    const buttonText = ["1st", "2nd", "3rd"];
    return `
      <div class="dialog-buttons" style="margin-top: 5px;">
        ${modifiers
          .map(
            (modifier, index) => `
            <button
              class="dialog-button ${id}${index}"
              data-button="${id}${index}"
              style="margin-bottom:5px;"
            >
              ${buttonText[index]}
               (${modifier >= 0 ? `+${modifier}` : `${modifier}`})
            </button>
          `
          )
          .join("")}
      </div>
    `;
  };
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
  const modifiers = strikeItem().variants.map((variant) => {
    let modifier = strikeItem().totalModifier;
    const splitLabel = variant.label.split(" ");
    if (splitLabel[0] === "MAP") {
      modifier += parseInt(splitLabel[1]);
    }
    return modifier;
  });
  const dialog = new Dialog({
    title: " ",
    content: `
      ${actionFormat({
        actions: "OneAction",
        name: `${weapon.name} Strike`,
        tags: weapon.tags,
        content: [weapon.description],
      })}
      ${strikeButtonFormat({ id: "strike", modifiers: modifiers })}
      <hr />
      <strong>${weapon.effect.name}</strong> ${weapon.effect.description}
      ${strikeButtonFormat({
        id: slugify(weapon.effect.name),
        modifiers: modifiers.map(
          (modifier) => modifier + weapon.effect.modifier.value
        ),
      })}
      <hr />
      <div style="
        display: flex;
        justify-content: center;
        margin-bottom: 5px;
      "><strong>Damage</strong></div>
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
  for (let i = 0; i < 3; i++) {
    dialog.data.buttons[`strike${i}`] = {
      callback: () => {
        strike(i);
      },
    };
    dialog.data.buttons[`${slugify(weapon.effect.name)}${i}`] = {
      callback: () => {
        strikeWithEffect(i);
      },
    };
  }
})();
