const weapon = "Halberd";
const actions = [
  {
    name: "Sudden Charge",
    actions: "TwoActions",
    tags: ["Fighter", "Flourish", "Open"],
    description:
      "With a quick sprint, you dash up to your foe and swing. Stride twice. If you end your movement within melee reach of at least one enemy, you can make a melee Strike against that enemy. You can use Sudden Charge while Burrowing, Climbing, Flying, or Swimming instead of Striding if you have the corresponding movement type.",
  },
  {
    name: "Intimidating Strike",
    actions: "TwoActions",
    tags: ["Emotion", "Fear", "Fighter", "Mental"],
    description:
      "Your blow not only wounds creatures but also shatters their confidence. Make a melee Strike. If you hit and deal damage, the target is frightened 1, or frightened 2 on a critical hit",
  },
  {
    name: "Brutish Shove",
    actions: "OneAction",
    tags: ["Fighter", "Press"],
    description:
      "Throwing your weight behind your attack, you hit your opponent hard enough to make it stumble back. Make a Strike with a two-handed melee weapon. If you hit a target that is your size or smaller, that creature is flat-footed until the end of your current turn, and you can automatically Shove it, with the same benefits as the Shove action (including the critical success effect, if your Strike was a critical hit). If you move to follow the target, your movement doesn’t trigger reactions.",
    failure:
      "The target becomes flat-footed until the end of your current turn.",
  },
];
(async () => {
  const strikeItem = () =>
    (actor.data.data.actions ?? [])
      .filter((action) => action.type === "strike")
      .find((strike) => strike.name === weapon);
  const strike = (MAP) => {
    switch (MAP) {
      case 1:
        strikeItem().attack(event);
        break;
      case 2:
        strikeItem().variants[1]?.roll(event);
        break;
      case 3:
        strikeItem().variants[2]?.roll(event);
        break;
    }
  };
  const specialStrike = (MAP, action) => {
    ChatMessage.create({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      content: `
        <hr style="margin-top: 0;" />
        <div>
          <header style="display: flex">
            <img
              style="flex: 0 0 36px; margin-right: 5px;"
              src="systems/pf2e/icons/actions/${action.actions}.png"
              title="${action.name}"
              width="36"
              height="36"
            >
            <h3 style="flex: 1; line-height: 36px; margin: 0;">
              ${action.name}
            </h3>
          </header>
          <hr />
          ${
            action.tags
              ? `
                <div class="tags" style="margin-bottom: 5px">
                  ${action.tags
                    .map(
                      (tag) => `
                        <span class="tag tag_alt"">${tag}</span>`
                    )
                    .join(" ")}
                </div>
              `
              : ""
          }
          ${action.trigger ? `<b>Trigger</b> ${action.trigger}` : ""}
          ${action.trigger && action.description ? "<hr/>" : ""}
          ${action.description ? `${action.description}` : ""}
          ${action.description && action.failure ? "<hr/>" : ""}
          ${action.failure ? `<b>Failure</b> ${action.failure}` : ""}
        </div>
      `,
    });
    strike(MAP);
  };
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
  const actionIdentifier = (action) => {
    return action.name.toLowerCase().split(" ").join("_");
  };
  const actionDialog = (action) => {
    const actionSymbol = {
      OneAction: 1,
      TwoActions: 2,
      ThreeActions: 3,
      Reaction: "r",
    }[action.actions];
    return `
      <div>
        ${
          action.actions
            ? `
              <span style="font-family: 'Pathfinder2eActions'; text-align: center;">
                ${actionSymbol}
              </span>
              `
            : ""
        }
        <b>${action.name}</b>
        ${
          action.tags
            ? `(${action.tags.map((tag) => tag.toLowerCase()).join(", ")})`
            : ""
        }
        ${
          action.description
            ? `<br />${action.description}${
                action.failure ? ` <b>Failure</b> ${action.failure}` : ""
              }
              <div
                class="dialog-buttons"
                style="margin-top: 5px"
              >
                <button
                  class="dialog-button first"
                  data-button="${actionIdentifier(action)}_1"
                  style="margin-bottom:5px;"
                  ${action.tags.includes("Press") ? "disabled" : ""}
                >
                  1st (${modToString(modifiers[0])})
                </button>
                <button
                  class="dialog-button second"
                  data-button="${actionIdentifier(action)}_2"
                  style="margin-bottom:5px;"
                  ${actionSymbol == 3 ? "disabled" : ""}
                >
                  2nd (${modToString(modifiers[1])})
                </button>
                <button
                  class="dialog-button third"
                  data-button="${actionIdentifier(action)}_3"
                  style="margin-bottom:5px;"
                  ${actionSymbol == 2 || actionSymbol == 3 ? "disabled" : ""}
                >
                  3rd (${modToString(modifiers[2])})
                </button>
              </div>`
            : ""
        }
      </div>
    `;
  };
  const dialog = new Dialog({
    title: `${weapon} Strike`,
    content: `
      ${actions.map((action) => `${actionDialog(action)}<hr />`).join("")}
      ${actionDialog({ name: "Strike", actions: "OneAction" })}
    `,
    buttons: {
      first: {
        label: `1st (${modToString(modifiers[0])})`,
        callback: () => {
          strike(1);
        },
      },
      second: {
        label: `2nd (${modToString(modifiers[1])})`,
        callback: () => {
          strike(2);
        },
      },
      third: {
        label: `3rd (${modToString(modifiers[2])})`,
        callback: () => {
          strike(3);
        },
      },
    },
  });
  dialog.render(true);
  for (const action of actions) {
    for (let i = 1; i <= 3; i++) {
      dialog.data.buttons[`${actionIdentifier(action)}_${i}`] = {
        callback: () => {
          specialStrike(i, action);
        },
      };
    }
  }
})();
