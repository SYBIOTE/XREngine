import React from 'react'
import { useTranslation } from 'react-i18next'

import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { GroundPlaneComponent } from '@xrengine/engine/src/scene/components/GroundPlaneComponent'

import SquareIcon from '@mui/icons-material/Square'

import ColorInput from '../inputs/ColorInput'
import InputGroup from '../inputs/InputGroup'
import LlmProperties from './MetadataProperties'
import NodeEditor from './NodeEditor'
import ShadowProperties from './ShadowProperties'
import { EditorComponentType, updateProperty } from './Util'

export const GroundPlaneNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const groundPlaneComponent = getComponent(props.node.entity, GroundPlaneComponent)

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.groundPlane.name')}
      description={t('editor:properties.groundPlane.description')}
    >
      <InputGroup name="Color" label={t('editor:properties.groundPlane.lbl-color')}>
        <ColorInput value={groundPlaneComponent.color} onChange={updateProperty(GroundPlaneComponent, 'color')} />
      </InputGroup>
      <LlmProperties node={props.node} />
      <ShadowProperties node={props.node} />
    </NodeEditor>
  )
}

GroundPlaneNodeEditor.iconComponent = SquareIcon

export default GroundPlaneNodeEditor
