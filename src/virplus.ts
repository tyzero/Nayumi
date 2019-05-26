import axios from 'axios'

function loadApi (action: string) {
  const config = (global as any).myConfig
  return axios
    .get(config.virpus_base_url + config.query, {
      params: {
        action,
        key: config.key,
        hash: config.hash
      }
    })
    .catch(e => {
      if (e.response.status === 404) {
        return Promise.reject({ data: { e } })
      } else {
        return Promise.reject(e)
      }
    })
    .then(({ data }) => {
      console.log(data)
      const reg = /<(.*?)>([^<]*)(<\/\1>)/gi
      let temp = null
      const msg = {}
      while ((temp = reg.exec(data))) {
        console.log(`${temp[1]} : ${temp[2]} `)
        msg[temp[1]] = temp[2]
      }
      return msg
    })
}

export async function actionStart (ctx) {
  if (ctx.message.from.id !== 723764692) {
    await ctx.reply('*permission denied*')
    return
  }
  const query = ctx.message.text
  const i = query.indexOf(' ')
  if (~i) {
    const queryStr = ctx.message.text.slice(i + 1)
    console.log(`//${queryStr}//`)
    if (['reboot', 'status', 'info', ''].includes(queryStr)) {
      await parerResult(queryStr, ctx)
    } else {
      await await ctx.reply('action not include')
    }
  } else {
    await parerResult('status', ctx)
  }
}
async function parerResult (queryStr: any, ctx: any) {
  const data = await loadApi(queryStr)
  const markdown = `查询结果:
*statusmsg: ${data['statusmsg']}*
*vmstat: ${data['vmstat']}*\n
*hdd*:
${paserByte(data['hdd'])}\n
*bw*: 
${paserByte(data['bw'])}\n
*mem*: 
${paserByte(data['mem'])}
`
  await ctx.replyWithMarkdown(markdown)
}
const strMap = {
  0: '总额度',
  1: '已使用',
  2: '剩余量'
}
const g = 1024 * 1024 * 1024
function paserByte (str: string) {
  return str
    .split(',')
    .slice(0, 3)
    .map((v, i) => {
      return strMap['' + i] + ':' + (parseInt(v) / g).toFixed(2) + 'G '
    })
    .join('\n')
}
