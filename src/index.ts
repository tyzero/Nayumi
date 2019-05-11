import Telegraf from 'telegraf'
import * as escape from 'markdown-escape'
import * as session from 'telegraf/session'
import * as HttpsProxy from 'https-proxy-agent'
import { readFile, writeFileSync } from 'fs'
import { launch } from 'puppeteer'
import { join } from 'path'
import use from './use'
import reply from './reply'
import npmSearch from './npmSearch'

const HELP = `喵✧٩(ˊωˋ)و✧~
快来试试使用 /code 和 /lint 生成代码截图吧, 也可以输入 /fix 来修复语法错误, 还可以使用 /run 来执行脚本哦!✨✨

作者: [Shirasawa](https://github.com/ShirasawaSama)
项目地址: [Github](https://github.com/ShirasawaSama/Nayumi)`

const FILE = join(__dirname, '../config.json')

readFile(FILE, (err, file) => {
  const config = { token: process.env.TOKEN || '', agent: process.env.AGENT || '' }
  if (!err && file) {
    try { Object.assign(config, JSON.parse(file.toString())) } catch (e) { }
  }
  if (!config.token) {
    writeFileSync(FILE, JSON.stringify(config, null, 2))
    console.error('Token must be set. Please edit config.json')
    process.exit(1)
  }
  launch().then(async browser => {
    const agent = config.agent && new HttpsProxy(config.agent)
    const bot = new Telegraf(config.token,
      {
        username: 'NayumiBot', ...(agent ? { telegram: { agent } } : {})
      }
    )
    bot.start((ctx) => ctx.reply('Welcome'))
    // bot.help((ctx) => ctx.reply('Send me a sticker'))
    bot.help((ctx) => ctx.replyWithMarkdown(HELP))
    bot.telegram.getMe().then((botInfo) => {
      bot.options.username = botInfo.username
    }).catch(e => console.error(e))

    bot.on('sticker', (ctx) => ctx.reply('👍'))
    bot.hears('hi', (ctx) => ctx.reply('Hey there'))
    bot.command('talk', (ctx) => ctx.reply('???'))
    bot.use(session())
      .use((ctx, next) => {
        (ctx as any).replyRaw = ctx.reply
        ctx.reply = (...args) => (((ctx as any).session.hasSent = true), (ctx as any).replyRaw(...args))
        return next().catch(e => {
          console.error(e)
          return (ctx as any).replyRaw('发生错误了惹(๑ŏ ﹏ ŏ๑)~')
        })
      })
      .on('message', (ctx, next) => (((ctx as any).session.hasSent = false), next()))
      .command('use', async ctx => {
        let query: string = ctx.message.text
        const i = query.indexOf(' ')
        if (~i) {
          const result = await use(query = query.slice(i + 1))
          query = escape(query)
          if (result) {
            const { usage, homepage, repository } = result
            if (usage.length) {
              const text = usage.map((c, j) =>
                '*代码片段' + (j + 1) + ':*\n```\n' + c + '\n```').join('\n\n')
              await ctx.replyWithMarkdown(
                `@${ctx.message.from.username}\n模块 [${query}](https://www.q` +
                `npmjs.com/package/${query}) 总共找到以下使用方法(=゜ω゜)ノ\n\n${text}\n` +
                (homepage ? ` [模块主页](${homepage})` : '') +
                (repository ? ` [仓库](${repository})` : '')
              )
            } else {
              await ctx.replyWithMarkdown(
                `@${ctx.message.from.username}\n模块 [${query}](https://www.q` +
                `npmjs.com/package/${query}) 没有找到使用方法(๑ŏ ﹏ ŏ๑)~\n\n` +
                (homepage ? ` [模块主页](${homepage})` : '') +
                (repository ? ` [仓库](${repository})` : '')
              )
            }
          } else {
            await ctx.replyWithMarkdown(`@${ctx.message.from.username}\n模块 ${query} 不存在(๑ŏ ﹏ ŏ๑)~`)
          }
        }
      })
      .command('npm', async ctx => {
        let query: string = ctx.message.text
        const i = query.indexOf(' ')
        if (~i) {
          const queryString = query.slice(i + 1)
          query = encodeURIComponent(queryString.replace(/ /g, '+'))
          const { source, total, results } = await npmSearch(query, agent)
          if (source) await ctx.replyWithPhoto({ source })
          const text = results.map(({ package: { name, version, description: d,
            links: { npm, repository: r } } }, j) => ((d = escape(d)),
              `${j}. [${name}](${npm})@[${escape(version)}](https://www.npmjs.com/package/${name}?activeTab=` +
              `versions): ${d.length > 40 ? d.slice(40) + '...' : d} ${r ? `[仓库](${r})` : ''}`))
            .join('\n')
          await ctx.replyWithMarkdown(
            `@${ctx.message.from.username}\n根据 [${escape(queryString)}](https://www.q` +
            `npmjs.com/search?q=${escape(query)}) 总共找到 _${total}_ 个模块(=゜ω゜)ノ\n\n${text}`
          )
        }
      })
      .command(['start', 'help'], ctx => (((ctx as any).session.type = 0), ctx.replyWithMarkdown(HELP)))
    bot.startPolling().catch(console.error)
    reply(bot, browser)
    console.log('Started!')
  }).catch(console.error)
})
