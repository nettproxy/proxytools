import { NextRequest, NextResponse } from "next/server"

const FLAGS = [
  { bitwise: 1 << 0, flag: "Discord Employee" },
  { bitwise: 1 << 1, flag: "Partnered Server Owner" },
  { bitwise: 1 << 2, flag: "HypeSquad Events" },
  { bitwise: 1 << 3, flag: "Bug Hunter Level 1" },
  { bitwise: 1 << 6, flag: "House Bravery" },
  { bitwise: 1 << 7, flag: "House Brilliance" },
  { bitwise: 1 << 8, flag: "House Balance" },
  { bitwise: 1 << 9, flag: "Early Supporter" },
  { bitwise: 1 << 14, flag: "Bug Hunter Level 2" },
  { bitwise: 1 << 16, flag: "Verified Bot" },
  { bitwise: 1 << 17, flag: "Early Verified Bot Developer" },
  { bitwise: 1 << 18, flag: "Moderator Programs Alumni" },
  { bitwise: 1 << 19, flag: "Active Developer" }
]

function idToDate(id: string) {
  return new Date(Number(BigInt(id) / BigInt(4194304)) + 1420070400000)
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;

  const token = process.env.DISCORD_BOT_TOKEN

  try {
    const response = await fetch(`https://canary.discord.com/api/v10/users/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${token}`,
      },
    })

    const json = await response.json()

    if (json.message) return NextResponse.json(json, { status: 404 })

    let bannerUrl = null
    let avatarUrl = null

    if (json.banner) {
      bannerUrl = `https://cdn.discordapp.com/banners/${json.id}/${json.banner}.png?size=1024`
    }

    if (json.avatar) {
      avatarUrl = `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}.png?size=1024`
    }

    const flagsFromUser = FLAGS.filter(flag => json.public_flags & flag.bitwise).map(flag => flag.flag)

    const output = {
      username: json.username,
      account_created: idToDate(json.id).toISOString(),
      id: json.id,
      badges: flagsFromUser,
      discriminator: json.discriminator,
      display_name: json.global_name,
      nitro: json.premium_type,
      accent_color: json.accent_color,
      public_flags: json.public_flags,
      media: {
        avatar: {
          avatar: json.avatar,
          avatar_url: avatarUrl,
        },
        banner: {
          id: json.banner,
          url: bannerUrl,
        },
      },
      clan: {
        clan_tag: json.clan?.tag || null,
        guild_id: json.clan?.identity_guild_id || null,
        badge: json.clan?.badge || null,
      }
    }

    return NextResponse.json(output)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}