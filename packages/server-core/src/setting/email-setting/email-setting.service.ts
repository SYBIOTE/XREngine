import { Application } from '../../../declarations'
import { updateAppConfig } from '../../updateAppConfig'
import { EmailSetting } from './email-setting.class'
import hooks from './email-setting.hooks'
import createModel from './email-setting.model'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    'email-setting': EmailSetting
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new EmailSetting(options, app)
  app.use('email-setting', event)

  const service = app.service('email-setting')

  service.hooks(hooks)

  service.on('patched', () => {
    updateAppConfig()
  })
}
