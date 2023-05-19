const Discord = require("discord.js");
const Enmap = require("enmap");
const config = require("./config/config.json");
/* const fs = require("fs"); */
/* const { log } = require("console");
const { measureMemory } = require("vm"); */

const client = new Discord.Client({
  restTimeOffset: 0,
  partials: ["MESSAGE", "CHANNEL", "REACTION", "GUILD_MEMBER", "USER"],
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MEMBERS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_VOICE_STATES,
    Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
  ],
});

function requerirhandlers() {
  ["distube"].forEach((handler) => {
    try {
      require(`./handlers/${handler}`)(client, Discord);
    } catch (e) {
      console.warn(e);
    }
  });
}
requerirhandlers();

client.db = new Enmap({
  name: "db",
  dataDir: "./db",
});

client.tickets = new Enmap({
  name: "tickets",
  dataDir: "./tickets",
});

client.dbpostulaciones = new Enmap({
  name: "dbpostulaciones",
  dataDir: "./dbpostulaciones",
});

client.postulaciones = new Enmap({
  name: "postulaciones",
  dataDir: "./postulaciones",
});

client.on("ready", () => {
  console.log(`Ok ${client.user.tag}`);

  let estados = ["Formula 1"];
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

  client.dbpostulaciones.ensure(message.guild.id, {
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

    client.dbpostulaciones.set(message.guild.id, channel.id, "channel");
    client.dbpostulaciones.set(message.guild.id, msg.id, "message");
    client.dbpostulaciones.set(message.guild.id, channel.parentId, "category");

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

    if(command){
      if (command.owner){
        if(!config.ownerIDS.includes(message.author.avatar.id))
        return message.reply (`**Solo los administradores pueden usar este comando**`);
      }
    }

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

  if (command === "comandos") {
    let usuario = message.mentions.members.first() || message.member;
    message.delete(usuario);

    const comandos = await message.channel.send({
      embeds: [
        new Discord.MessageEmbed()
          .setTitle(`Comandos Bot **1NFINYT1**`)
          .setDescription(
            "**+hg:** Te calcula tu porcentaje de homosexualidad. \n **+avatar**: Te muestra lo sexy que eres. \n **+bot:** El bot repite tu mensaje. \n **+plantilla:** Plantilla para poder acceder al servidor."
          )
          .setColor("BLACK"),
      ],
    });
  }

  if (command === "play") {
    if (!args.length)
      return message.reply(
        `❌ **Tienes que especificar el nombre de una canción!**`
      );
    if (!message.member.voice?.channel)
      return message.reply(
        `❌ **Tienes que estar en un canal de voz para ejecutar este comando!**`
      );
    if (
      message.guild.me.voice?.channel &&
      message.member.voice?.channel.id != message.guild.me.voice?.channel.id
    )
      return message.reply(
        `❌ **Tienes que estar en el mismo canal de voz __QUE YO__ para ejecutar este comando!**`
      );
    client.distube.play(message.member.voice?.channel, args.join(" "), {
      member: message.member,
      textChannel: message.channel,
      message,
    });
    message.reply(`🔎 **Buscando \`${args.join(" ")}\`...**`);
  }

  if (command === "skip") {
    const queue = client.distube.getQueue(message);
    if (!queue)
      return message.reply(`❌ **No hay ninguna canción reproduciéndose!**`);
    if (!message.member.voice?.channel)
      return message.reply(
        `❌ **Tienes que estar en un canal de voz para ejecutar este comando!**`
      );
    if (
      message.guild.me.voice?.channel &&
      message.member.voice?.channel.id != message.guild.me.voice?.channel.id
    )
      return message.reply(
        `❌ **Tienes que estar en el mismo canal de voz __QUE YO__ para ejecutar este comando!**`
      );
    client.distube.skip(message);
    message.reply(`⏭ **Saltando a la siguiente canción!**`);
  }

  if (command === "stop") {
    const queue = client.distube.getQueue(message);
    if (!queue)
      return message.reply(`❌ **No hay ninguna canción reproduciéndose!**`);
    if (!message.member.voice?.channel)
      return message.reply(
        `❌ **Tienes que estar en un canal de voz para ejecutar este comando!**`
      );
    if (
      message.guild.me.voice?.channel &&
      message.member.voice?.channel.id != message.guild.me.voice?.channel.id
    )
      return message.reply(
        `❌ **Tienes que estar en el mismo canal de voz __QUE YO__ para ejecutar este comando!**`
      );
    client.distube.stop(message);
    message.reply(`🏃‍♂️ **Desconectado!**`);
  }

  if (command === "todos") {
    message.channel.send("@everyone Hello");
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
      //! ////////////////////////////////////////////////////////////  SOPORTE  \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
      case "crearticket": {
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
      //! ////////////////////////////////////////////////////////////  POSTULAR  \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
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
        const channel = await interaction.guild.channels.create(
          `ticket postulaciones-${interaction.member.user.username}`,
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
              .setTitle(`Ticket postulaciones ${interaction.member.user.tag}`)
              .setDescription(
                `Bienvenido a postulaciones ${interaction.member}\n**Explica detalladamente tu problema**`
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
      //! ////////////////////////////////////////////////////////////  PARCEIRA  \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
      case "parceira": {
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
          `ticket parceira-${interaction.member.user.username}`,
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
              .setTitle(`Ticket de **PARCEIRA** ${interaction.member.user.tag}`)
              .setDescription(
                `Bienvenido a **PARCEIRA** ${interaction.member}\n**Explica detalladamente tu problema**`
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
      //! ////////////////////////////////////////////////////////////  MATCH  \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

      case "solicitarmatch": {
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
          `ticket Solicitar Match-${interaction.member.user.username}`,
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
              .setTitle(
                `Ticket para **Solicitar Match** ${interaction.member.user.tag}`
              )
              .setDescription(
                `Bienvenido a **Solicitar Match** ${interaction.member}\n**Explica detalladamente tu problema**`
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

//! /////////////////////////////////////////// POSTULACIONES \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
client.login(config.token);
