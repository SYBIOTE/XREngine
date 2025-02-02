import React from 'react'

import { VideoFileTypes } from '@etherealengine/engine/src/assets/constants/fileTypes'

import { ItemTypes } from '../../constants/AssetTypes'
import FileBrowserInput from './FileBrowserInput'
import { StringInputProps } from './StringInput'

/**
 * VideoInput used to render component view for video inputs.
 *
 * @param       {function} onChange
 * @param       {any} rest
 * @constructor
 */
export function VideoInput({ onChange, ...rest }: StringInputProps) {
  return (
    <FileBrowserInput
      acceptFileTypes={VideoFileTypes}
      acceptDropItems={ItemTypes.Videos}
      onChange={onChange}
      {...rest}
    />
  )
}

export default VideoInput
