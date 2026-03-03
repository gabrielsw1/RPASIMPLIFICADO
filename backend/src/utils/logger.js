const C = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  red:     '\x1b[31m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  blue:    '\x1b[34m',
  magenta: '\x1b[35m',
  cyan:    '\x1b[36m',
  white:   '\x1b[37m',
  bgRed:   '\x1b[41m',
  bgGreen: '\x1b[42m',
}

function timestamp() {
  return `${C.dim}${new Date().toLocaleTimeString('pt-BR')}${C.reset}`
}

function tag(label, color) {
  return `${color}${C.bold}[${label}]${C.reset}`
}

export const log = {
  info: (scope, msg, data) => {
    console.log(`${timestamp()} ${tag(scope, C.blue)} ${msg}`, data !== undefined ? data : '')
  },

  success: (scope, msg, data) => {
    console.log(`${timestamp()} ${tag(scope, C.green)} ${msg}`, data !== undefined ? data : '')
  },

  warn: (scope, msg, data) => {
    console.warn(`${timestamp()} ${tag(scope, C.yellow)} ${C.yellow}${msg}${C.reset}`, data !== undefined ? data : '')
  },

  error: (scope, msg, data) => {
    console.error(`${timestamp()} ${tag(scope, C.red)} ${C.red}${msg}${C.reset}`, data !== undefined ? data : '')
  },

  request: (method, path, status) => {
    const methodColor = { GET: C.cyan, POST: C.green, PUT: C.yellow, DELETE: C.red, PATCH: C.magenta }[method] || C.white
    const statusColor = status >= 500 ? C.red : status >= 400 ? C.yellow : C.green
    console.log(
      `${timestamp()} ${tag('HTTP', C.dim)} ${methodColor}${method}${C.reset} ${path} → ${statusColor}${status}${C.reset}`
    )
  },
}

export default log
