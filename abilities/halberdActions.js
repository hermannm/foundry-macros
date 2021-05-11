const weapon = {
  name: "Halberd",
  tags: ["Reach", "Versatile S"],
  actions: [
    {
      name: "Sudden Charge",
      actions: "TwoActions", // OneAction/TwoActions/ThreeActions/FreeAction/Reaction/Passive
      attack: true,
      tags: ["Fighter", "Flourish", "Open"],
      description:
        "With a quick sprint, you dash up to your foe and swing. Stride twice. If you end your movement within melee reach of at least one enemy, you can make a melee Strike against that enemy. You can use Sudden Charge while Burrowing, Climbing, Flying, or Swimming instead of Striding if you have the corresponding movement type.",
    },
    {
      name: "Intimidating Strike",
      actions: "TwoActions", // OneAction/TwoActions/ThreeActions/FreeAction/Reaction/Passive
      attack: true,
      tags: ["Emotion", "Fear", "Fighter", "Mental"],
      description:
        "Your blow not only wounds creatures but also shatters their confidence. Make a melee Strike. If you hit and deal damage, the target is frightened 1, or frightened 2 on a critical hit.",
    },
    {
      name: "Positioning Assault",
      actions: "TwoActions", // OneAction/TwoActions/ThreeActions/FreeAction/Reaction/Passive
      attack: true,
      tags: ["Fighter", "Flourish"],
      requirements:
        "You are wielding a two-handed melee weapon and your target is within your reach.",
      description:
        "With punishing blows, you force your opponent into position. Make a Strike with the required weapon. If you hit, you move the target 5 feet into a space in your reach. This follows the forced movement rules.",
    },
    {
      name: "Brutish Shove",
      actions: "OneAction", // OneAction/TwoActions/ThreeActions/FreeAction/Reaction/Passive
      attack: true,
      tags: ["Fighter", "Press"],
      requirements: "You are wielding a two-handed melee weapon.",
      description: [
        "Throwing your weight behind your attack, you hit your opponent hard enough to make it stumble back. Make a Strike with a two-handed melee weapon. If you hit a target that is up to two sizes larger than you, that creature is flat-footed until the end of your current turn, and you can automatically Shove it, with the same benefits as the Shove action (including the critical success effect, if your Strike was a critical hit). If you move to follow the target, your movement doesn’t trigger reactions.",
        {
          title: "Powerful Shove",
          text: "When a creature you Shove has to stop moving because it would hit an object, it takes damage equal to your Strength modifier (minimum 1). This happens regardless of how you Shoved the creature.",
        },
      ],
      failure:
        "The target becomes flat-footed until the end of your current turn.",
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
      actions: action.actions,
      name: action.name,
      tags: action.tags,
      content: content,
    };
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
  const buttonLabels = (action, modifiers) => {
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
    return buttons;
  };
  const buttonFormat = (action, modifiers) => {
    const labels = buttonLabels(action, modifiers);
    let buttonHTML = "";
    for (let i = 0; i < labels.length; i++) {
      if (labels[i]) {
        buttonHTML += `
            <button
              class="dialog-button ${slugify(action.name)}${i}"
              data-button="${slugify(action.name)}${i}"
              style="margin-bottom:5px;"
            >${labels[i]}</button>
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
    strikeItem.variants[MAP].roll({ event, options });
  };
  const lastAction = weapon.actions[weapon.actions.length - 1];
  const dialog = new Dialog(
    {
      title: " ",
      content: `
        ${weapon.actions
          .slice(0, -1)
          .map(
            (action) =>
              `${actionHeader(action)}${buttonFormat(action, modifiers)}`
          )
          .join("")}
        ${actionHeader(lastAction)}
      `,
      buttons: {},
    },
    { width: 300 }
  );
  const lastButtonLabels = buttonLabels(lastAction, modifiers);
  for (let MAP = 0; MAP < 3; MAP++) {
    if (lastButtonLabels[MAP]) {
      dialog.data.buttons[`${slugify(lastAction.name)}${MAP}`] = {
        label: lastButtonLabels[MAP],
        callback: () => {
          ChatMessage.create({
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: `
              ${actionFormat(contentFormat(lastAction))}
            `,
          });
          if (lastAction.attack) {
            strike(MAP);
          }
        },
      };
    }
  }
  dialog.render(true);
  for (const action of weapon.actions.slice(0, -1)) {
    for (let MAP = 0; MAP < 3; MAP++) {
      dialog.data.buttons[`${slugify(action.name)}${MAP}`] = {
        callback: () => {
          ChatMessage.create({
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: `
              ${actionFormat(contentFormat(action))}
            `,
          });
          if (action.attack) {
            strike(MAP);
          }
        },
      };
    }
  }
})();
