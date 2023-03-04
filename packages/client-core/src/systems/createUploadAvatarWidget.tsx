import { World } from '@etherealengine/engine/src/ecs/classes/World'
import { removeComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { WidgetName, Widgets } from '@etherealengine/engine/src/xrui/Widgets'

import { createUploadAvatarMenu } from './ui/ProfileDetailView/UploadAvatarMenu'

export function createUploadAvatarWidget(world: World) {
  const ui = createUploadAvatarMenu()
  removeComponent(ui.entity, VisibleComponent)

  Widgets.registerWidget(world, ui.entity, {
    ui,
    label: WidgetName.UPLOAD_AVATAR,
    system: () => {}
  })
}
