import { SceneActions } from '@etherealengine/client-core/src/world/services/SceneService'
import config from '@etherealengine/common/src/config'
import { SceneJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import { dispatchAction } from '@etherealengine/hyperflux'

const sceneRelativePathIdentifier = '__$project$__'
const sceneCorsPathIdentifier = '__$cors-proxy$__'
const fileServer = config.client.fileServer ?? `https://localhost:8642`
const corsPath = config.client.cors.serverPort ? config.client.cors.proxyUrl : `https://localhost:3029`

const parseSceneDataCacheURLsLocal = (projectName: string, sceneData: any) => {
  for (const [key, val] of Object.entries(sceneData)) {
    if (val && typeof val === 'object') {
      sceneData[key] = parseSceneDataCacheURLsLocal(projectName, val)
    }
    if (typeof val === 'string') {
      if (val.includes(sceneRelativePathIdentifier)) {
        sceneData[key] = `${fileServer}/projects` + sceneData[key].replace(sceneRelativePathIdentifier, '')
      }
      if (val.startsWith(sceneCorsPathIdentifier)) {
        sceneData[key] = sceneData[key].replace(sceneCorsPathIdentifier, corsPath)
      }
    }
  }
  return sceneData
}

export const loadSceneJsonOffline = async (projectName, sceneName) => {
  const locationName = `${projectName}/${sceneName}`
  const sceneData = (await (await fetch(`${fileServer}/projects/${locationName}.scene.json`)).json()) as SceneJson
  dispatchAction(
    SceneActions.currentSceneChanged({
      sceneData: {
        scene: parseSceneDataCacheURLsLocal(projectName, sceneData),
        name: sceneName,
        thumbnailUrl: `${fileServer}/projects/${locationName}.thumbnail.jpeg`,
        project: projectName
      }
    })
  )
}
