import { readFileSync, writeFileSync } from 'fs';
// node --experimental-modules sql2json.mjs
async function convert2Json () {
  const REGEX = /\((\d+).*?'(.*?)', '(.*?)(')\)/g;

  const fileContent = readFileSync('./soul.sql.txt', 'utf8');
  let tempR
  let index = 0
  const data = []
  while ((tempR = REGEX.exec(fileContent))) {
    const item = {
      id: index,
      text: tempR[2],
      length: tempR[3]
    }
    data.push(item)
    index++
  }
  writeFileSync('../src/jt.json', JSON.stringify(data, null, 4))
}

convert2Json()
