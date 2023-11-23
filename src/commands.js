import { draw as oblique } from 'oblique-strategies'
import dictLookup from './dictLookup.js'

import {
  InteractionResponseType,
  InteractionType,
  InteractionResponseFlags
} from 'discord-interactions'

/**
 *  Get an Oblique Strategy
 */
export async function strategy (interaction) {
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: oblique()
      // flags: InteractionResponseFlags.EPHEMERAL
    }
  }
}

/**
 * Lookup the definition of somrthing with Cambridge Dictionary
 *
 * @param {String} [word] The word to lookup
 */
export async function define ({ data }) {
  const word = data.options.find(o => o.name === 'word').value
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: `## ${word}\n${await dictLookup(word)}`
      // flags: InteractionResponseFlags.EPHEMERAL
    }
  }
}
