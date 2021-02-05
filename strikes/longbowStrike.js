const weapon = {
  name: "Composite Longbow",
  tags: ["Deadly d10", "Propulsive", "Volley 30 ft."],
  description: [
    "This projectile weapon is made from horn, wood, and sinew laminated together to increase the power of its pull and the force of its projectile. Like all longbows, its great size also increases the bow’s range and power. You must use two hands to fire it, and it cannot be used while mounted.",
    {
      title: "Range",
      text: "100 ft.",
    },
    {
      title: "Volley",
      text:
        "This ranged weapon is less effective at close distances. Your attacks against targets that are at a distance within the range listed take a –2 penalty.",
    },
  ],
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
  const slugify = (string) =>
    // borrowed from https://gist.github.com/codeguy/6684588
    string
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  const strikeItem = (actor.data.data.actions ?? [])
    .filter((action) => action.type === "strike")
    .find((strike) => strike.name === weapon.name);
  const strike = (MAP) => {
    const options = [
      ...actor.getRollOptions(["all", "str-based", "attack", "attack-roll"]),
      ...(weapon.tags ? weapon.tags.map((tag) => slugify(tag)) : []),
    ];
    switch (MAP) {
      case 1:
        strikeItem.attack({ event, options });
        break;
      case 2:
        strikeItem.variants[1]?.roll({ event, options });
        break;
      case 3:
        strikeItem.variants[2]?.roll({ event, options });
        break;
    }
  };
  const damage = ({ crit }) => {
    const options = [
      ...actor.getRollOptions(["all", "str-based", "damage", "damage-roll"]),
      ...(weapon.tags ? weapon.tags.map((tag) => slugify(tag)) : []),
    ];
    if (crit) {
      strikeItem.critical({ event, options });
    } else {
      strikeItem.damage({ event, options });
    }
  };
  const modifiers = strikeItem.variants.map((variant) => {
    let modifier = strikeItem.totalModifier;
    const splitLabel = variant.label.split(" ");
    if (splitLabel[0] === "MAP") {
      modifier += parseInt(splitLabel[1]);
    }
    return modifier;
  });
  const modToString = (modifier) =>
    modifier >= 0 ? `+${modifier}` : `${modifier}`;
  const dialog = new Dialog({
    title: " ",
    content: `
      ${actionFormat({
        actions: "OneAction",
        name: `${weapon.name} Strike`,
        tags: weapon.tags,
        content: [weapon.description],
      })}
      <div class="dialog-buttons" style="margin-top: 5px;">
        <button
          class="dialog-button firstStrike"
          data-button="firstStrike"
          style="margin-bottom:5px;"
        >
          1st (${modToString(modifiers[0])})
        </button>
        <button
          class="dialog-button secondStrike"
          data-button="secondStrike"
          style="margin-bottom:5px;"
        >
          2nd (${modToString(modifiers[1])})
        </button>
        <button
          class="dialog-button thirdStrike"
          data-button="thirdStrike"
          style="margin-bottom:5px;"
        >
          3rd (${modToString(modifiers[2])})
        </button>
      </div>
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
  dialog.data.buttons.firstStrike = {
    callback: () => {
      strike(1);
    },
  };
  dialog.data.buttons.secondStrike = {
    callback: () => {
      strike(2);
    },
  };
  dialog.data.buttons.thirdStrike = {
    callback: () => {
      strike(3);
    },
  };
})();
