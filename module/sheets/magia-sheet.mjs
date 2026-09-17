const {
  ItemSheetV2
} = foundry.applications.sheets;

const {
  HandlebarsApplicationMixin
} = foundry.applications.api;

export class BreuMagiaSheet
  extends HandlebarsApplicationMixin(ItemSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: [
      "breu",
      "item-sheet",
      "magia-sheet"
    ],

    position: {
      width: 580,
      height: 650
    },

    form: {
      closeOnSubmit: false,
      submitOnChange: true
    },

    window: {
      icon: "fa-solid fa-wand-magic-sparkles",
      resizable: true
    }
  };

  static PARTS = {
    principal: {
      template:
        "systems/breu/templates/items/magia-sheet.hbs"
    }
  };

  async _prepareContext(options) {
    const context =
      await super._prepareContext(options);

    context.item =
      this.item;

    context.system =
      this.item.system;

    context.isFeitico =
      this.item.system.tipo === "feitico";

    context.isMilagre =
      this.item.system.tipo === "milagre";

    context.circulos =
      [1, 2, 3, 4, 5].map(
        circulo => ({
          value: circulo,
          label: `${circulo}º Círculo`,
          selected:
            Number(this.item.system.circulo)
            === circulo
        })
      );

    context.resumoMagia = {
      tipo:
        context.isFeitico
          ? "Feitiço"
          : context.isMilagre
            ? "Milagre"
            : "Magia",

      circulo:
        `${Number(this.item.system.circulo) || 1}º Círculo`
    };

    return context;
  }

}
