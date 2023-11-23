import { Router } from 'itty-router'
import {
  InteractionResponseType,
  InteractionType,
  verifyKey
} from 'discord-interactions'
import * as commands from './commands'

class JsonResponse extends Response {
  constructor (body, init) {
    const jsonBody = JSON.stringify(body)
    init = init || {
      headers: {
        'content-type': 'application/json;charset=UTF-8'
      }
    }
    super(jsonBody, init)
  }
}

async function verifyDiscordRequest (request, env) {
  const signature = request.headers.get('x-signature-ed25519')
  const timestamp = request.headers.get('x-signature-timestamp')
  const body = await request.text()
  const isValidRequest =
    signature &&
    timestamp &&
    verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY)
  if (!isValidRequest) {
    return { isValid: false }
  }

  return { interaction: JSON.parse(body), isValid: true }
}

const router = Router()

router.get('/', async (req, env, ctx) => {
  return new Response('OK')
})

router.post('/', async (req, env, ctx) => {
  const { isValid, interaction } = await verifyDiscordRequest(req, env)
  if (!isValid || !interaction) {
    return new Response('Bad request signature.', { status: 401 })
  }

  if (interaction.type === InteractionType.PING) {
    return new JsonResponse({
      type: InteractionResponseType.PONG
    })
  }

  if (interaction.type === InteractionType.APPLICATION_COMMAND && commands[interaction?.data?.name?.toLowerCase()]) {
    return new JsonResponse(await commands[interaction?.data?.name?.toLowerCase()](interaction))
  }

  console.error('Unknown Type')
  return new JsonResponse({ error: 'Unknown Type' }, { status: 400 })
})

router.all('*', () => new Response('Not Found.', { status: 404 }))

export default router
