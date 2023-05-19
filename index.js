const Discord = require("discord.js");
const Enmap = require("enmap");
const config = require("./config/config.json");

const client = new Discord.Client({
  allowedMentions: {
    parse: ["users", "roles"],
    repliedUser: true,
  },
  partials: ["MESSAGE", "CHANNEL"],
  /* intents: 515, */
  intents: 39555,
});

client.db = new Enmap({
  name: "db",
  dataDir: "./db",
});

client.tickets = new Enmap({
  name: "tickets",
  dataDir: "./tickets",
});

client.on("ready", () => {
  console.log(`Ok ${client.user.tag}`);

  let estados = ["1NFINYT1"];
  let posicion = 0;
  setInterval(() => {
    if (posicion > estados.length - 1) posicion = 0;
    let estado = estados[posicion];
    client.user.setActivity(estado, { type: "WATCHING" });
    posicion++;
  }, 10000);
});

//! ////////////////////////////////// COMANDOS \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

client.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;

  if (!message.content.startsWith(config.prefix)) return;

  if (message.author.bot) return;

  const args = message.content.slice(config.prefix.length).trim().split(" ");
  const command = args.shift().toLowerCase();

  client.db.ensure(message.guild.id, {
    channel: "",
    message: "",
    category: "",
  });

  if (command === "ping") {
    message.reply(`El ping del bot es \`${client.ws.ping}ms\``);
  }

  if (command === "setup") {
    let channel =
      message.mentions.channels.first() ||
      message.guild.channels.cache.get(args[0]);
    if (!channel)
      return message.reply("No he encontrado el canal que has mencionado");

    const msg = await channel.send({
      embeds: [
        new Discord.MessageEmbed()
          .setTitle("Crea un ticket")
          .setDescription(
            `Si necesitas ayuda, tan solo haz click en el boton que dice \`🎫 Soporte\` \n
            Para unirte a 1NFINYT1, haz click en el boton que dice \`👺 Postulacion a 1NFINYT1\` \n
            Para hacer Parceira, haz click en el boton que dice \`👥 Parceira\` \n
            Para solicitar Match, haz click en el boton que dice \`✨Solicitar Match\` \n`
          )
          .setColor("Blue")
          .setTimestamp(),
      ],
      components: [
        new Discord.MessageActionRow().addComponents([
          new Discord.MessageButton()
            .setStyle("SUCCESS")
            .setLabel("Soporte")
            .setEmoji("🎫")
            .setCustomId("crearticket")[
            new Discord.MessageButton()
              .setStyle("DANGER")
              .setLabel("Postulación")
              .setEmoji("👺")
              .setCustomId("postular")
          ],
          [
            new Discord.MessageButton()
              .setStyle("PRIMARY")
              .setLabel("Parceira")
              .setEmoji("👥")
              .setCustomId("parceira"),
          ],
          [
            new Discord.MessageButton()
              .setStyle("SECONDARY")
              .setLabel("Solicitar Match")
              .setEmoji("✨")
              .setCustomId("solicitarmatch"),
          ],
        ]),
      ],
    });

    client.db.set(message.guild.id, channel.id, "channel");
    client.db.set(message.guild.id, msg.id, "message");
    client.db.set(message.guild.id, channel.parentId, "category");

    return message.reply(
      `Sistema de tickets configurado exitosamente ${channel}`
    );
  }

  if (command === "hg") {
    let member = message.mentions.channels.first() || message.author;
    let rng = Math.floor(Math.random() * 100);

    const howgayembed = await message.channel.send({
      embeds: [
        new Discord.MessageEmbed()
          .setTitle(`Buenas, vamos a calcular tu porcentaje de homosexualidad`)
          .setDescription(
            `${member.username} es ` + rng + "% GAY  :rainbow_flag:"
          )
          .setColor("GREEN"),
      ],
    });
  }

  if (command === "avatar") {
    let usuario = message.mentions.members.first() || message.member;
    message.delete(usuario);

    const avatar = await message.channel.send({
      embeds: [
        new Discord.MessageEmbed()
          .setTitle(`Avatar del sexy ${usuario.user.username}`)
          .setImage(
            usuario.user.displayAvatarURL({ size: 1024, dynamic: true })
          )
          .setFooter(`Pedido por ${usuario.user.username}`),
      ],
    });
  }

  if (command === "bot") {
    const mensaje = args.join(" ");
    if (!mensaje) return message.channel.send("Debes escribir algo");

    setTimeout(function () {
      message.delete();
      message.channel.send(`${mensaje}`);
    }, 10);
  }

  if (command === "plantilla") {
    let usuario = message.mentions.members.first() || message.member;
    message.delete(usuario);

    return message.reply(
      "**1NFINYT1 POSTULACION** \n Requisitos: \n **Edad:** \n **Horas jugadas en FiveM** \n **Horario:** \n **¿Has estado en banda anteriormente? Si la respuesta es Sí ¿en cual?:** \n **Clips o HG:**"
    );
  }
});

//! /////////////////////////////////////////////// SOPORTE \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

client.on("interactionCreate", async (interaction) => {
  if (
    !interaction.isButton() ||
    !interaction.guildId ||
    interaction.message.author.id != client.user.id
  )
    return;

  client.db.ensure(interaction.guild.id, {
    channel: "",
    message: "",
    category: "",
  });

  const data = client.db.get(interaction.guild.id);

  if (
    interaction.channelId == data.channel &&
    interaction.message.id == data.message
  ) {
    switch (interaction.customId) {
      case "crearticket":
        {
          if (client.tickets.has(interaction.member.user.id)) {
            let ticket = interaction.guild.channels.cache.get(
              client.tickets.get(interaction.member.user.id, "channelid")
            );
            if (
              ticket &&
              client.tickets.get(interaction.member.user.id, "closed") == false
            )
              return interaction.reply({
                content: `❌Ya tienes un ticket creado en <#${ticket.id}>`,
                ephemeral: true,
              });
          }

          await interaction.reply({
            content: "Creando tu ticket... Porfavor espere",
            ephemeral: true,
          });
          const channel = await interaction.guild.channels.create(
            `ticket-${interaction.member.user.username}`,
            {
              type: "GUILD_TEXT",
              parent: data.category,
              permissionOverwrites: [
                {
                  id: interaction.guild.id,
                  deny: ["VIEW_CHANNEL"],
                },
                {
                  id: interaction.member.user.id,
                  allow: ["VIEW_CHANNEL"],
                },
              ],
            }
          );

          channel.send({
            embeds: [
              new Discord.MessageEmbed()
                .setTitle(`Ticket de ${interaction.member.user.tag}`)
                .setDescription(
                  `Bienvenido al soporte ${interaction.member}\n**Explica detalladamente tu problema**`
                )
                .setColor("BLUE")
                .setTimestamp(),
            ],
            components: [
              new Discord.MessageActionRow().addComponents([
                new Discord.MessageButton()
                  .setStyle("DANGER")
                  .setLabel("CERRAR")
                  .setEmoji("🔒")
                  .setCustomId("cerrarticket"),
                new Discord.MessageButton()
                  .setStyle("SECONDARY")
                  .setLabel("BORRAR")
                  .setEmoji("🗑")
                  .setCustomId("borrarticket"),
              ]),
            ],
          });

          client.tickets.set(interaction.member.user.id, {
            channelid: channel.id,
            closed: false,
          });

          return await interaction.editReply({
            content: `✅ Ticket creado en ${channel}!`,
          });
        }
        break;
      default:
        break;
    }
  }
  if (
    client.tickets.has(
      client.tickets.findKey((t) => t.channelid == interaction.channelId)
    )
  ) {
    switch (interaction.customId) {
      case "cerrarticket":
        {
          const key = client.tickets.findKey(
            (t) => t.channelid == interaction.channelId
          );
          if (key) {
            const ticket = client.tickets.get(key);
            if (ticket.closed == true)
              return interaction.reply({
                content: "❌ Este ticket ya estaba cerrado!",
                ephemeral: true,
              });
            const msg = await interaction.reply(
              "El ticket se auto-cerrará en 3 segundos..."
            );
            setTimeout(async () => {
              await interaction.editReply({ content: "TICKET CERRADO 🔒" });
              client.tickets.set(key, true, "closed");
              return interaction.channel.permissionOverwrites.edit(key, {
                VIEW_CHANNEL: false,
              });
            }, 3 * 1000);
          }
        }

        break;

      case "borrarticket":
        {
          await interaction.reply("El ticket se eliminará en 3 segundos...");
          setTimeout(() => {
            interaction.channel.delete();
          }, 3 * 1000);
        }
        break;
      default:
        break;
    }
  }
});

//////POSTULACIONES\\\\\\\

client.on("interactionCreate", async (interaction) => {
  if (
    !interaction.isButton() ||
    !interaction.guildId ||
    interaction.message.author.id != client.user.id
  )
    return;

  client.db.ensure(interaction.guild.id, {
    channel: "",
    message: "",
    category: "",
  });
  //client.db.ensure(int)

  const data2 = client.db.get(interaction.guild.id);

  if (
    interaction.channelId == data2.channel &&
    interaction.message.id == data2.message
  ) {
    switch (interaction.customId) {
      case "postular": {
        if (client.tickets.has(interaction.member.user.id)) {
          let ticket = interaction.guild.channels.cache.get(
            client.tickets.get(interaction.member.user.id, "channelid")
          );
          if (
            ticket &&
            client.tickets.get(interaction.member.user.id, "closed") == false
          )
            return interaction.reply({
              content: `❌Ya tienes un ticket creado en <#${ticket.id}>`,
              ephemeral: true,
            });
        }

        await interaction.reply({
          content: "Creando tu ticket... Porfavor espere",
          ephemeral: true,
        });
        const channel2 = await interaction.guild.channels.create(
          `ticket-${interaction.member.user.username}`,
          {
            type: "GUILD_TEXT",
            parent: data2.category,
            permissionOverwrites: [
              {
                id: interaction.guild.id,
                deny: ["VIEW_CHANNEL"],
              },
              {
                id: interaction.member.user.id,
                allow: ["VIEW_CHANNEL"],
              },
            ],
          }
        );

        channel2.send({
          embeds: [
            new Discord.MessageEmbed()
              .setTitle(`Ticket de ${interaction.member.user.tag}`)
              .setDescription(
                `Bienvenido a postulaciones ${interaction.member}\n**A que quieres postular?**`
              )
              .setColor("BLUE")
              .setTimestamp(),
          ],
          components: [
            new Discord.MessageActionRow().addComponents([
              new Discord.MessageButton()
                .setStyle("DANGER")
                .setLabel("CERRAR")
                .setEmoji("🔒")
                .setCustomId("cerrarticketpostulaciones"),
              new Discord.MessageButton()
                .setStyle("SECONDARY")
                .setLabel("BORRAR")
                .setEmoji("🗑")
                .setCustomId("borrarticketpostulaciones"),
            ]),
          ],
        });

        client.tickets.set(interaction.member.user.id, {
          channelid: channel2.id,
          closed: false,
        });

        return await interaction.editReply({
          content: `✅ Ticket creado en ${channel2}!`,
        });
      }
      default:
        break;
    }
  }
  if (
    client.tickets.has(
      client.tickets.findKey((t) => t.channelid == interaction.channelId)
    )
  ) {
    switch (interaction.customId) {
      case "cerrarticketpostulaciones":
        {
          const key = client.tickets.findKey(
            (t) => t.channelid == interaction.channelId
          );
          if (key) {
            const ticket = client.tickets.get(key);
            if (ticket.closed == true)
              return interaction.reply({
                content: "❌ Este ticket ya estaba cerrado!",
                ephemeral: true,
              });
            const msg = await interaction.reply(
              "El ticket se auto-cerrará en 3 segundos..."
            );
            setTimeout(async () => {
              await interaction.editReply({ content: "TICKET CERRADO 🔒" });
              client.tickets.set(key, true, "closed");
              return interaction.channel.permissionOverwrites.edit(key, {
                VIEW_CHANNEL: false,
              });
            }, 3 * 1000);
          }
        }

        break;

      case "borrarticketpostulaciones":
        {
          await interaction.reply("El ticket se eliminará en 3 segundos...");
          setTimeout(() => {
            interaction.channel.delete();
          }, 3 * 1000);
        }
        break;
      default:
        break;
    }
  }
});

client.login(config.token);
