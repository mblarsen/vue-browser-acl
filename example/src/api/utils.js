import debug from 'debug'

const log = debug('demo:api')

export function faultyFetch(label, payload, delayish = 1500) {
  log(`fetching ${label}`)
  return new Promise((resolve, reject) => {
    if (Math.random() < 0.1) {
      setTimeout(() => {
        reject(new Error('Uh ooh, API error'))
      }, Math.random() * delayish)
    } else {
      setTimeout(() => {
        log(`fetched ${label}`)
        resolve(payload)
      }, Math.random() * delayish)
    }
  })
}
