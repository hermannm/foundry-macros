const weapon = {
  name: "Halberd",
  tags: ["Reach", "Versatile S"],
};
(async () => {
  const strikeItem = () =>
    (actor.data.data.actions ?? [])
      .filter((action) => action.type === "strike")
      .find((strike) => strike.name === weapon.name);
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
  new Dialog({
    title: " ",
    content: `
      <header style="display: flex;">
        <img
          style="flex: 0 0 36px; margin-right: 5px;"
          src="systems/pf2e/icons/actions/OneAction.png"
          title="${weapon.name} Strike"
          width="36"
          height="36"
        >
        <h3 style="flex: 1; line-height: 36px; margin: 0;">
          ${weapon.name} Strike
        </h3>
      </header>
      <div style="font-weight: 500; font-size: 14px;">
        <hr style="margin-top: 3px; margin-bottom: 1px;" />
        <div class="tags" style="margin-bottom: 5px;">
          <span class="tag tag_alt"">Attack</span>
          ${
            weapon.tags
              ? weapon.tags
                  .map(
                    (tag) => `
                <span class="tag tag_alt"">${tag}</span>`
                  )
                  .join(" ")
              : ""
          }
        </div>
        ${weapon.description ? `${weapon.description}<hr />` : ""}
      </div>
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
    default: "first",
  }).render(true);
})();
