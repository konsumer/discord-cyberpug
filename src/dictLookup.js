// this does cambridge dictionary lookup in cloudflare workers

import cheerio from 'cheerio'

export default async function (term) {
  const s = await fetch(`https://dictionary.cambridge.org/us/dictionary/english/${encodeURIComponent(term)}`, {
    headers: {
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'accept-language': 'en-US,en;q=0.9',
      'cache-control': 'max-age=0',
      'sec-ch-ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1'
    }
  }).then(r => r.text())

  const $ = cheerio.load(s)
  const def = $('.def').text() + $('.def-body').text()
  console.log(def)
  return def
}
