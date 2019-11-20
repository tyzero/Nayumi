import * as data from './jt.json'

export async function sendSoup(ctx) {
  const config = (global as any).myConfig
  const lucky = data[randomIntFromInterval(0, 1221)]
  if (ctx.message.from.id !== config.adminId) {
    await ctx.replyWithMarkdown(`*${lucky.text}*`)
    return
  } else {
    await ctx.reply(lucky.text)
  }

}

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}
