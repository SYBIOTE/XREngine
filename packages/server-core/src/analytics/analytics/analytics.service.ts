// Initializes the `instance-provision` service on path `/instance-provision`
import { Application } from '../../../declarations'
import { Analytics } from './analytics.class'
import instanceProvisionDocs from './analytics.docs'
import hooks from './analytics.hooks'
import createModel from './analytics.model'

// Add this service to the service type index
declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    analytics: Analytics
  }
}

export default (app: Application) => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  /**
   * Initialize our service with any options it requires and docs
   */
  const event = new Analytics(options, app)
  event.docs = instanceProvisionDocs
  app.use('analytics', event)

  /**
   * Get our initialized service so that we can register hooks
   */
  const service = app.service('analytics')

  service.hooks(hooks)
}
