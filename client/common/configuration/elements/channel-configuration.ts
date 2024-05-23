// SPDX-FileCopyrightText: 2024 Mehdi Benadel <https://mehdibenadel.com>
//
// SPDX-License-Identifier: AGPL-3.0-only

import type { RegisterClientOptions } from '@peertube/peertube-types/client'
import type { ChannelConfiguration } from 'shared/lib/types'
import { html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { ptTr } from '../../lib/directives/translation'
import { Task } from '@lit/task'
import { ChannelDetailsService } from '../services/channel-details'
import { provide } from '@lit/context'
import { channelConfigurationContext, channelDetailsServiceContext } from '../contexts/channel'
import { registerClientOptionsContext } from '../../lib/contexts/peertube'
import { LivechatElement } from '../../lib/elements/livechat'

@customElement('livechat-channel-configuration')
export class ChannelConfigurationElement extends LivechatElement {

  @provide({ context: registerClientOptionsContext })
  @property({ attribute: false })
  public registerClientOptions: RegisterClientOptions | undefined

  @property({ attribute: false })
  public channelId: number | undefined

  @provide({ context: channelConfigurationContext })
  @state()
  public _channelConfiguration: ChannelConfiguration | undefined

  @provide({ context: channelDetailsServiceContext })
  private _channelDetailsService: ChannelDetailsService | undefined

  @state()
  public _formStatus: boolean | any = undefined

  private _asyncTaskRender = new Task(this, {

    task: async ([registerClientOptions], { signal }) => {
      if (this.registerClientOptions) {
        this._channelDetailsService = new ChannelDetailsService(this.registerClientOptions)
        this._channelConfiguration = await this._channelDetailsService.fetchConfiguration(this.channelId ?? 0)
      }
    },

    args: () => [this.registerClientOptions]

  });

  private _saveConfig = () => {
    if (this._channelDetailsService && this._channelConfiguration) {
      this._channelDetailsService.saveOptions(this._channelConfiguration.channel.id, this._channelConfiguration.configuration)
        .then((value) => {
          this._formStatus = { success: true }
          console.log(`Configuration has been updated`)
          this.requestUpdate('_formStatus')
        })
        .catch((error) => {
          this._formStatus = error
          console.log(`An error occurred : ${JSON.stringify(this._formStatus)}`)
          this.requestUpdate('_formStatus')
        });
    }
  }

  render = () => {
    let tableHeaderList = {
      forbiddenWords: {
        entries: {
          colName: ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_FORBIDDEN_WORDS_LABEL),
          description: ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_FORBIDDEN_WORDS_DESC2)
        },
        regex: {
          colName: ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_FORBIDDEN_WORDS_REGEXP_LABEL),
          description: ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_FORBIDDEN_WORDS_REGEXP_DESC)
        },
        applyToModerators: {
          colName: ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_FORBIDDEN_WORDS_APPLYTOMODERATORS_LABEL),
          description: ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_FORBIDDEN_WORDS_APPLYTOMODERATORS_DESC)
        },
        label: {
          colName: ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_FORBIDDEN_WORDS_LABEL_LABEL),
          description: ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_FORBIDDEN_WORDS_LABEL_DESC)
        },
        reason: {
          colName: ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_FORBIDDEN_WORDS_REASON_LABEL),
          description: ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_FORBIDDEN_WORDS_REASON_DESC)
        },
        comments: {
          colName: ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_FORBIDDEN_WORDS_COMMENTS_LABEL),
          description: ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_FORBIDDEN_WORDS_COMMENTS_DESC)
        }
      },
      quotes: {
        messages: {
          colName: ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_QUOTE_LABEL2),
          description: ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_QUOTE_DESC2)
        },
        delay: {
          colName: ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_QUOTE_DELAY_LABEL),
          description: ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_QUOTE_DELAY_DESC)
        }
      },
      commands: {
        command: {
          colName: ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_COMMAND_CMD_LABEL),
          description: ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_COMMAND_CMD_DESC)
        },
        message: {
          colName: ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_COMMAND_MESSAGE_LABEL),
          description: ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_COMMAND_MESSAGE_DESC)
        }
      }
    }
    let tableSchema = {
      forbiddenWords: {
        entries: {
          inputType: 'textarea',
          default: ['helloqwesad'],
          separator: '\n',
        },
        regex: {
          inputType: 'text',
          default: 'helloaxzca',
        },
        applyToModerators: {
          inputType: 'checkbox',
          default: true
        },
        label: {
          inputType: 'text',
          default: 'helloasx'
        },
        reason: {
          inputType: 'text',
          default: 'transphobia',
          datalist: ['Racism', 'Sexism', 'Transphobia', 'Bigotry']
        },
        comments: {
          inputType: 'textarea',
          default: `Lorem ipsum dolor sit amet, consectetur adipiscing elit,
          sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
          nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.`
        },
      },
      quotes: {
        messages: {
          inputType: 'textarea',
          default: ['default message'],
          separator: '\n',
        },
        delay: {
          inputType: 'number',
          default: 100,
        }
      },
      commands: {
        command: {
          inputType: 'text',
          default: 'default command',
        },
        message: {
          inputType: 'text',
          default: 'default message',
        }
      }
    }

    return this._asyncTaskRender.render({
      complete: () => html`
        <div class="margin-content peertube-plugin-livechat-configuration peertube-plugin-livechat-configuration-channel">
          <h1>
            ${ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_TITLE)}:
            <span class="peertube-plugin-livechat-configuration-channel-info">
              <span>${this._channelConfiguration?.channel.displayName}</span>
              <span>${this._channelConfiguration?.channel.name}</span>
            </span>
            <livechat-help-button .page="documentation/user/streamers/channel">
            </livechat-help-button>
          </h1>
          <p>${ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_DESC)}</p>
          <form livechat-configuration-channel-options role="form">
          <div class="row mt-3">
            <div class="row mt-5">
                <div class="col-12 col-lg-4 col-xl-3">
                <livechat-configuration-row
                  .title=${ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_SLOW_MODE_LABEL)}
                  .description=${ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_SLOW_MODE_DESC, true)}
                  .helpPage=${"documentation/user/streamers/slow_mode"}>
                </livechat-configuration-row>
              </div>
              <div class="col-12 col-lg-8 col-xl-9">
                <div class="form-group">
                  <label>
                    <input
                      type="number"
                      name="slow_mode_duration"
                      class="form-control"
                      min="0"
                      max="1000"
                      id="peertube-livechat-slow-mode-duration"
                      @input=${(event: InputEvent) => {
                          if (event?.target && this._channelConfiguration)
                            this._channelConfiguration.configuration.slowMode.duration = Number((event.target as HTMLInputElement).value)
                          this.requestUpdate('_channelConfiguration')
                        }
                      }
                      value="${this._channelConfiguration?.configuration.slowMode.duration}"
                    />
                  </label>
                </div>
              </div>
            </div>
            <div class="row mt-5">
              <div class="col-12 col-lg-4 col-xl-3">
              <livechat-configuration-row
                .title=${ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_BOT_OPTIONS_TITLE)}
                .description=${''}
                .helpPage=${"documentation/user/streamers/channel"}>
              </livechat-configuration-row>
              </div>
              <div class="col-12 col-lg-8 col-xl-9">
                <div class="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="bot"
                      id="peertube-livechat-bot"
                      @input=${(event: InputEvent) => {
                          if (event?.target && this._channelConfiguration)
                            this._channelConfiguration.configuration.bot.enabled = (event.target as HTMLInputElement).checked
                          this.requestUpdate('_channelConfiguration')
                        }
                      }
                      .value=${this._channelConfiguration?.configuration.bot.enabled}
                      ?checked=${this._channelConfiguration?.configuration.bot.enabled}
                    />
                    ${ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_ENABLE_BOT_LABEL)}
                  </label>
                </div>
                ${this._channelConfiguration?.configuration.bot.enabled ?
                html`<div class="form-group">
                  <label for="peertube-livechat-bot-nickname">${ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_BOT_NICKNAME)}</label>
                  <input
                    type="text"
                    name="bot_nickname"
                    class="form-control"
                    id="peertube-livechat-bot-nickname"
                    @input=${(event: InputEvent) => {
                        if (event?.target && this._channelConfiguration)
                          this._channelConfiguration.configuration.bot.nickname = (event.target as HTMLInputElement).value
                        this.requestUpdate('_channelConfiguration')
                      }
                    }
                    value="${this._channelConfiguration?.configuration.bot.nickname}"
                  />
                </div>`
                : ''
              }
              </div>
            </div>
            ${this._channelConfiguration?.configuration.bot.enabled ?
            html`<div class="row mt-5">
              <div class="col-12 col-lg-4 col-xl-3">
                <livechat-configuration-row
                  .title=${ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_FORBIDDEN_WORDS_LABEL)}
                  .description=${ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_FORBIDDEN_WORDS_DESC)}
                  .helpPage=${"documentation/user/streamers/bot/forbidden_words"}>
                </livechat-configuration-row>
              </div>
              <div class="col-12 col-lg-8 col-xl-9">
                <livechat-dynamic-table-form
                    .header=${tableHeaderList.forbiddenWords}
                    .schema=${tableSchema.forbiddenWords}
                    .rows=${this._channelConfiguration?.configuration.bot.forbiddenWords}
                    @update=${(e: CustomEvent) => {
                        if (this._channelConfiguration) {
                          this._channelConfiguration.configuration.bot.forbiddenWords = e.detail
                          this.requestUpdate('_channelConfiguration')
                        }
                      }
                    }
                    .formName=${'forbidden-words'}>
                  </livechat-dynamic-table-form>
              </div>
            </div>
            <div class="row mt-5">
              <div class="col-12 col-lg-4 col-xl-3">
                <livechat-configuration-row
                  .title=${ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_QUOTE_LABEL)}
                  .description=${ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_QUOTE_DESC)}
                  .helpPage=${"documentation/user/streamers/bot/quotes"}>
                </livechat-configuration-row>
              </div>
              <div class="col-12 col-lg-8 col-xl-9">
                <livechat-dynamic-table-form
                  .header=${tableHeaderList.quotes}
                  .schema=${tableSchema.quotes}
                  .rows=${this._channelConfiguration?.configuration.bot.quotes}
                  @update=${(e: CustomEvent) => {
                      if (this._channelConfiguration) {
                        this._channelConfiguration.configuration.bot.quotes = e.detail
                        this.requestUpdate('_channelConfiguration')
                      }
                    }
                  }
                  .formName=${'quote'}>
                </livechat-dynamic-table-form>
              </div>
            </div>
            <div class="row mt-5">
              <div class="col-12 col-lg-4 col-xl-3">
                <livechat-configuration-row
                  .title=${ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_COMMAND_LABEL)}
                  .description=${ptTr(LOC_LIVECHAT_CONFIGURATION_CHANNEL_COMMAND_DESC)}
                  .helpPage=${"documentation/user/streamers/bot/commands"}>
                </livechat-configuration-row>
              </div>
              <div class="col-12 col-lg-8 col-xl-9">
                <livechat-dynamic-table-form
                  .header=${tableHeaderList.commands}
                  .schema=${tableSchema.commands}
                  .rows=${this._channelConfiguration?.configuration.bot.commands}
                  @update=${(e: CustomEvent) => {
                      if (this._channelConfiguration) {
                        this._channelConfiguration.configuration.bot.commands = e.detail
                        this.requestUpdate('_channelConfiguration')
                      }
                    }
                  }
                  .formName=${'command'}>
                </livechat-dynamic-table-form>
              </div>
            </div>`
              : ''
            }
            <div class="form-group mt-5">
              <button type="button" class="peertube-button-link orange-button" @click=${this._saveConfig}>${ptTr(LOC_SAVE)}</button>
            </div>
            ${(this._formStatus && this._formStatus.success === undefined) ?
            html`<div class="alert alert-warning" role="alert">
              An error occurred : ${JSON.stringify(this._formStatus)}
            </div>`
              : ''
            }
            ${(this._formStatus && this._formStatus.success === true) ?
            html`<div class="alert alert-success" role="alert">
              Configuration has been updated
            </div>`
              : ''
            }
          </form>
        </div>`
    })
  }
}