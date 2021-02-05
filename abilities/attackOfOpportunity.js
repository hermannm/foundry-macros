const weapon = "Halberd";
const action = {
  name: "Attack of Opportunity",
  actions: "Reaction", // OneAction/TwoActions/ThreeActions/FreeAction/Reaction/Passive
  trigger:
    "A creature within your reach uses a manipulate action or a move action, makes a ranged attack, or leaves a square during a move action it’s using.",
  description:
    "You lash out at a foe that leaves an opening. Make a melee Strike against the triggering creature. If your attack is a critical hit and the trigger was a manipulate action, you disrupt that action. This Strike doesn’t count toward your multiple attack penalty, and your multiple attack penalty doesn’t apply to this Strike.",
};
(async () => {
  const actionContent = [];
  if (action.trigger) {
    actionContent.push(`<strong>Trigger</strong> ${action.trigger}`);
  }
  if (action.requirements) {
    actionContent.push(`<strong>Requirements</strong> ${action.requirements}`);
  }
  if (action.description) {
    if (Array.isArray(action.description)) {
      actionContent.push(
        action.description.join(`<div style="height: 5px"></div>`)
      );
    } else {
      actionContent.push(action.description);
    }
  }
  if (action.failure) {
    actionContent.push(`<strong>Failure</strong> ${action.failure}`);
  }
  const actionFormat = `
    <header style="display: flex;">
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
    <div style="font-weight: 500; font-size: 14px;">
      ${
        action.tags
          ? `
            <hr style="margin-top: 3px; margin-bottom: 1px;" />
            <div class="tags" style="margin-bottom: 5px;">
              ${action.tags
                .map(
                  (tag) => `
                    <span class="tag tag_alt"">${tag}</span>`
                )
                .join(" ")}
            </div>
          `
          : actionContent.length === 0
          ? ""
          : `<hr style="margin-top: 3px;" />`
      }
      ${actionContent.join("<hr />")}
    </div>
  `;
  const strikeItem = () =>
    (actor.data.data.actions ?? [])
      .filter((action) => action.type === "strike")
      .find((strike) => strike.name === weapon);
  const strike = (MAP) => {
    ChatMessage.create({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      content: `<hr style="margin-top: 0; margin-bottom: 3px;" />${actionFormat}`,
    });
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
  const dialog = new Dialog({
    title: " ",
    content: `${actionFormat}${actionContent.length === 0 ? "" : "<hr />"}`,
    buttons: {},
  });
  const includeFirst =
    !(action.tags ?? []).includes("Press") || action.actions === "Reaction";
  if (includeFirst) {
    dialog.data.buttons.first = {};
    dialog.data.buttons.first = {
      label: `1st (${modToString(modifiers[0])})`,
      callback: () => {
        strike(1);
      },
    };
    dialog.data.default = "first";
  }
  if (action.actions !== "ThreeActions" && action.actions !== "Reaction") {
    dialog.data.buttons.second = {};
    dialog.data.buttons.second = {
      label: `2nd (${modToString(modifiers[1])})`,
      callback: () => {
        strike(2);
      },
    };
    if (!includeFirst) {
      dialog.data.default = "second";
    }
  }
  if (
    action.actions !== "TwoActions" &&
    action.actions !== "ThreeActions" &&
    action.actions !== "Reaction"
  ) {
    dialog.data.buttons.third = {};
    dialog.data.buttons.third = {
      label: `3rd (${modToString(modifiers[2])})`,
      callback: () => {
        strike(3);
      },
    };
  }
  dialog.render(true);
})();
