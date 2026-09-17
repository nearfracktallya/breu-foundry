const {
  ItemSheetV2
} = foundry.applications.sheets;

const {
  HandlebarsApplicationMixin
} = foundry.applications.api;

export class BreuEquipamentoSheet
  extends HandlebarsApplicationMixin(ItemSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: [
      "breu",
      "item-sheet",
      "equipamento-sheet"
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
      icon: "fa-solid fa-suitcase",
      resizable: true
    }
  };

  static PARTS = {
    principal: {
      template:
        "systems/breu/templates/items/equipamento-sheet.hbs"
    }
  };

  async _prepareContext(options) {
    const context =
      await super._prepareContext(options);

    context.item =
      this.item;

    context.system =
      this.item.system;

    context.categorias = {
      arma: "Arma",
      armadura: "Armadura",
      escudo: "Escudo",
      outro: "Outro"
    };

    context.localizacoes = {
      mochila: "Mochila",
      vestimenta: "Vestimenta",
      mao: "À mão",
      consumivel: "Consumível",
      outro: "Outro"
    };

    context.tiposArma = {
      corpo: "Corpo a Corpo",
      distancia: "À Distância",
      arremesso: "Arremesso"
    };

    context.proficiencias = {
      simples: "Simples",
      marcial: "Marcial"
    };


    context.tiposArmadura = {
      leve: "Leve",
      media: "Média",
      pesada: "Pesada"
    };


    context.isArma =
      this.item.system.categoria === "arma";

    context.isArmadura =
      this.item.system.categoria === "armadura";


    context.isEscudo =
      this.item.system.categoria === "escudo";


    context.isProtecao =
      context.isArmadura
      || context.isEscudo;


    context.resumoEquipamento = {
      categoria:
        context.categorias[
          this.item.system.categoria
        ] ?? "Equipamento",

      localizacao:
        context.localizacoes[
          this.item.system.localizacao
        ] ?? "Outro",

      tipoArma:
        context.isArma
          ? (
              context.tiposArma[
                this.item.system.arma?.tipo
              ] ?? ""
            )
          : "",

      proficiencia:
        context.isArma
          ? (
              context.proficiencias[
                this.item.system.arma?.categoriaProficiencia
              ] ?? ""
            )
          : "",

      favorita:
        context.isArma
        && Boolean(
          this.item.system.arma?.favorita
        ),

      protecao:
        context.isArmadura
          ? (
              context.tiposArmadura[
                this.item.system.protecao?.tipoArmadura
              ] ?? "Leve"
            )
          : context.isEscudo
            ? "Escudo"
            : ""
    };

    return context;
  }


  // Arma favorita — apenas uma por personagem

  async _onRender(
    context,
    options
  ) {

    await super._onRender(
      context,
      options
    );


    const checkbox =
      this.element.querySelector(
        'input[name="system.arma.favorita"]'
      );


    if (
      !checkbox
    ) {
      return;
    }


    checkbox.addEventListener(
      "change",
      async event => {

        if (
          !event.currentTarget.checked
        ) {
          return;
        }


        const actor =
          this.item.parent;


        if (
          !actor
          || actor.documentName !== "Actor"
        ) {
          return;
        }


        const outrasFavoritas =
          actor.items.filter(
            item =>
              item.id !== this.item.id
              && item.type === "equipamento"
              && item.system.categoria === "arma"
              && item.system.arma?.favorita
          );


        if (
          outrasFavoritas.length === 0
        ) {
          return;
        }


        await actor.updateEmbeddedDocuments(
          "Item",
          outrasFavoritas.map(
            item => ({
              _id:
                item.id,

              "system.arma.favorita":
                false
            })
          )
        );


        ui.notifications.info(
          `BREU | ${this.item.name} passa a ser a Arma Favorita.`
        );

      }
    );

  }

}
