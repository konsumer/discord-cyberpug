// this will register your commands for you.
// run npm run register

import { readFile } from 'fs/promises'
import Comments from 'parse-comments'
const comments = new Comments()

const { DISCORD_TOKEN, DISCORD_APPLICATION_ID } = process.env

if (!DISCORD_TOKEN) {
  console.error('DISCORD_TOKEN is required.')
  process.exit(1)
}

if (!DISCORD_APPLICATION_ID) {
  console.error('DISCORD_APPLICATION_ID is required.')
  process.exit(1)
}

// get the description from the code
const commands = []
for (const { description, code, tags } of comments.parse(await readFile('src/commands.js', 'utf8'))) {
  const name = (code?.value || '').match(/function(.*?)\(/)[1].trim()
  const options = tags.map(tag => {
    return {
      name: tag.name,
      type: 3, // string - see https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
      description: tag.description,
      required: tag.type.type === 'NameExpression' // vs OptionalType
    }
  })
  commands.push({ name, description, options })
}

const r = await fetch(`https://discord.com/api/v10/applications/${DISCORD_APPLICATION_ID}/commands`, {
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bot ${DISCORD_TOKEN}`
  },
  method: 'PUT',
  body: JSON.stringify(commands)
})

if (r.ok) {
  console.log('Registered all commands')
  const data = await r.json()
  console.log(JSON.stringify(data, null, 2))
} else {
  console.error('Error registering commands')
  let errorText = `Error registering commands \n ${r.url}: ${r.status} ${r.statusText}`
  try {
    const error = await r.text()
    if (error) {
      errorText = `${errorText} \n\n ${error}`
    }
  } catch (err) {
    console.error('Error reading body from request:', err)
  }
  console.error(errorText)
}
