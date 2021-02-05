(async () => {
  const medicineRoll = () => {
    const options = actor.getRollOptions(["all", "skill-check", "medicine"]);
    actor.data.data.skills.med.roll(event, options);
  };
  const actionFormat = ({ actions, name, tags, content }) => ({
    header: `
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
    `,
    body: `
      <div style="font-weight: 500; font-size: 14px;">
        ${content.join("<hr />")}
      </div>
    `,
  });
  const chatMessage = (content) => {
    ChatMessage.create({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      content: `
        <hr style="margin-top: 0; margin-bottom: 3px;" />
        ${content}
      `,
    });
  };
  const damageRoll = (content, parts) => {
    DicePF2e.damageRoll({
      event,
      parts,
      actor,
      data: actor.data.data,
      title: `
        <hr style="margin-top: 0; margin-bottom: 3px;" />
        <div style="
          color: #191813;
          font-style: normal;
          line-height: 16.8px;
        ">
          ${content}
        </div>
        <hr />
      `,
      speaker: ChatMessage.getSpeaker(),
    });
  };
  const treatWounds = (godless) =>
    actionFormat({
      actions: "Passive",
      name: "Treat Wounds",
      tags: ["Exploration", "Healing", "Manipulate"],
      content: [
        ...[
          "<strong>Requirements</strong> You are holding healer's tools, or you are wearing them and have a hand free.",
          "You spend 10 minutes treating one injured living creature (targeting yourself, if you so choose).",
        ],
        ...(godless
          ? [
              "<strong>Godless Healing</strong> You recover an additional 5 Hit Points from a successful attempt to Treat your Wounds.",
            ]
          : []),
      ],
    });
  const battleMedicine = (godless) =>
    actionFormat({
      actions: "OneAction",
      name: "Battle Medicine",
      tags: ["Healing", "Manipulate"],
      content: [
        ...[
          "<strong>Requirements</strong> You are holding or wearing healer's tools.",
          "You can patch up yourself or an adjacent ally, even in combat. Attempt a Medicine check with the same DC as for Treat Wounds, and restore a corresponding amount of Hit Points; this does not remove the wounded condition. The target is then temporarily immune to your Battle Medicine for 1 day.",
          "<strong>Medic</strong> Once per day, you can use Battle Medicine on a creature that’s temporarily immune.",
          "<strong>Doctor's Visitation</strong> (flourish) Stride, then use Battle Medicine.",
        ],
        ...(godless
          ? [
              "<strong>Godless Healing</strong> You recover an additional 5 Hit Points from a successful attempt to use Battle Medicine on you. After you or an ally use Battle Medicine on you, you become temporarily immune to that Battle Medicine for only 1 hour, instead of 1 day.",
            ]
          : []),
      ],
    });
  const treatPoison = actionFormat({
    actions: "OneAction",
    name: "Treat Poison",
    tags: ["Manipulate"],
    content: [
      "<strong>Requirements</strong> You are holding healer's tools, or you are wearing them and have a hand free.",
      [
        "You treat a patient to prevent the spread of poison. Attempt a Medicine check against the poison’s DC. After you attempt to Treat a Poison for a creature, you can’t try again until after the next time that creature attempts a save against the poison.",
        "<strong>Critical Success</strong> You grant the creature a +4 circumstance bonus to its next saving throw against the poison.",
        "<strong>Success</strong> You grant the creature a +2 circumstance bonus to its next saving throw against the poison.",
        "<strong>Critical Failure</strong> Your efforts cause the creature to take a –2 circumstance penalty to its next save against the poison.",
      ].join(`<div style="margin-bottom: 5px"></div>`),
      "<strong>Doctor's Visitation</strong> (flourish) Stride, then use Treat Poison.",
    ],
  });
  const firstAid = actionFormat({
    actions: "TwoActions",
    name: "Administer First Aid",
    tags: ["Manipulate"],
    content: [
      "<strong>Requirements</strong> You are holding healer's tools, or you are wearing them and have a hand free.",
      `You perform first aid on an adjacent creature that is dying or bleeding. If a creature is both dying and bleeding, choose which ailment you’re trying to treat before you roll. You can Administer First Aid again to attempt to remedy the other effect.<ul><li><strong>Stabilize</strong> Attempt a Medicine check on a creature that has 0 Hit Points and the dying condition. The DC is equal to 5 + that creature’s recovery roll DC (typically 15 + its dying value).</li><li><strong>Stop Bleeding</strong> Attempt a Medicine check on a creature that is taking persistent bleed damage (page 452), giving them a chance to make another flat check to remove the persistent damage. The DC is usually the DC of the effect that caused the bleed.</li></ul>${[
        "<strong>Success</strong> If you’re trying to stabilize, the creature loses the dying condition (but remains unconscious). If you’re trying to stop bleeding, the creature attempts a flat check to end the bleeding.<br />",
        "<strong>Critical Failure</strong> If you were trying to stabilize, the creature’s dying value increases by 1. If you were trying to stop bleeding, it immediately takes an amount of damage equal to its persistent bleed damage.",
      ].join(`<div style="margin-bottom: 5px"></div>`)}`,
      "<strong>Doctor's Visitation</strong> (flourish) Stride, then use Administer First Aid.",
    ],
  });
  const dialog = new Dialog(
    {
      title: "Medicine",
      content: `
        ${treatWounds().header}
        <div class="dialog-buttons">
          <button
            class="dialog-button treatWounds"
            data-button="treatWounds"
            style="margin-bottom:5px;"
          >
            Standard
          </button>
          <button
            class="dialog-button treatWoundsSelf"
            data-button="treatWoundsSelf"
            style="margin-bottom:5px;"
          >
            Self
          </button>
        </div>
        <hr style="margin-top: 0; margin-bottom: 3px;"/>
        ${battleMedicine().header}
        <div class="dialog-buttons">
          <button
            class="dialog-button battleMedicine"
            data-button="battleMedicine"
            style="margin-bottom: 5px;"
          >
            Standard
          </button>
          <button
            class="dialog-button battleMedicineSelf"
            data-button="battleMedicineSelf"
            style="margin-bottom:5px;"
          >
            Self
          </button>
        </div>
        <hr style="margin-top: 0; margin-bottom: 3px;"/>
        ${treatPoison.header}
        <div class="dialog-buttons">
          <button
            class="dialog-button treatPoison"
            data-button="treatPoison"
            style="margin-bottom:5px;"
          >
            Treat Poison
          </button>
        </div>
        <hr style="margin-top: 0; margin-bottom: 3px;"/>
        ${firstAid.header}
      `,
      buttons: {
        firstAid: {
          label: "Administer First Aid",
          callback: () => {
            chatMessage(`${firstAid.header}${firstAid.body}`);
            medicineRoll();
          },
        },
      },
    },
    { width: 200 }
  );
  dialog.render(true);
  dialog.data.buttons.treatWounds = {
    callback: () => {
      damageRoll(`${treatWounds().header}${treatWounds().body}`, ["2d8+15"]);
    },
  };
  dialog.data.buttons.treatWoundsSelf = {
    callback: () => {
      damageRoll(`${treatWounds(true).header}${treatWounds(true).body}`, [
        "2d8+20",
      ]);
    },
  };
  dialog.data.buttons.battleMedicine = {
    callback: () => {
      damageRoll(`${battleMedicine().header}${battleMedicine().body}`, [
        "2d8+15",
      ]);
    },
  };
  dialog.data.buttons.battleMedicineSelf = {
    callback: () => {
      damageRoll(`${battleMedicine(true).header}${battleMedicine(true).body}`, [
        "2d8+20",
      ]);
    },
  };
  dialog.data.buttons.treatPoison = {
    callback: () => {
      chatMessage(`${treatPoison.header}${treatPoison.body}`);
      medicineRoll();
    },
  };
})();
