
const print = (t, args) => {
  console.log(t)
}

const console = (f => {
  let times = 0
  const fn = (t, args) => {
    if (times > 15) return
    times++
    const len = args.length
    for (let i = 0; i < len; i++) {
      const type = typeof a
      if (type === 'symbol') args[i] = '#%Symbol%#'
      else if (type === 'object' && args[i] instanceof Error) args[i] = args[i].name + ': ' + args[i].message
    }
    f(t, args)
  }
  return Object.freeze({
    log: (...args) => fn(0, args),
    info: (...args) => fn(1, args),
    warn: (...args) => fn(2, args),
    error: (...args) => fn(3, args)
  })
})(print);

// delete print;
