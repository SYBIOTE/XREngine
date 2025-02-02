import { DataTypes, Model, Sequelize } from 'sequelize'

import { InstanceAuthorizedUserInterface } from '@etherealengine/common/src/dbmodels/InstanceAuthorizedUser'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const instanceAuthorizedUser = sequelizeClient.define<Model<InstanceAuthorizedUserInterface>>(
    'instance_authorized_user',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      }
    },
    {
      hooks: {
        beforeCount(options: any): void {
          options.raw = true
        }
      }
    }
  )

  ;(instanceAuthorizedUser as any).associate = (models: any): void => {
    ;(instanceAuthorizedUser as any).belongsTo(models.instance, { required: true, foreignKey: { allowNull: true } })
    ;(instanceAuthorizedUser as any).belongsTo(models.user, { required: true, foreignKey: { allowNull: true } })
  }
  return instanceAuthorizedUser
}
