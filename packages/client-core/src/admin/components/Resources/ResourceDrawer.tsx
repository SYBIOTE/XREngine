import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import InputFile from '@etherealengine/client-core/src/common/components/InputFile'
import InputRadio from '@etherealengine/client-core/src/common/components/InputRadio'
import InputSelect, { InputMenuItem } from '@etherealengine/client-core/src/common/components/InputSelect'
import InputText from '@etherealengine/client-core/src/common/components/InputText'
import { MAX_AVATAR_FILE_SIZE, MIN_AVATAR_FILE_SIZE } from '@etherealengine/common/src/constants/AvatarConstants'
import { StaticResourceInterface } from '@etherealengine/common/src/interfaces/StaticResourceInterface'
import {
  AssetSelectionChangePropsType,
  AssetsPreviewPanel
} from '@etherealengine/editor/src/components/assets/AssetsPreviewPanel'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Button from '@etherealengine/ui/src/primitives/mui/Button'
import Container from '@etherealengine/ui/src/primitives/mui/Container'
import DialogActions from '@etherealengine/ui/src/primitives/mui/DialogActions'
import DialogTitle from '@etherealengine/ui/src/primitives/mui/DialogTitle'
import FormControl from '@etherealengine/ui/src/primitives/mui/FormControl'
import FormHelperText from '@etherealengine/ui/src/primitives/mui/FormHelperText'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import { NotificationService } from '../../../common/services/NotificationService'
import { AuthState } from '../../../user/services/AuthService'
import DrawerView from '../../common/DrawerView'
import { AdminResourceState, ResourceService } from '../../services/ResourceService'
import styles from '../../styles/admin.module.scss'

export enum ResourceDrawerMode {
  Create,
  ViewEdit
}

interface Props {
  open: boolean
  mode: ResourceDrawerMode
  selectedResource?: StaticResourceInterface
  onClose: () => void
}

const defaultState = {
  key: '',
  name: '',
  mimeType: '',
  staticResourceType: '',
  source: 'file',
  resourceUrl: '',
  resourceFile: undefined as File | undefined,
  formErrors: {
    name: '',
    staticResourceType: '',
    resourceUrl: '',
    resourceFile: ''
  }
}

const ResourceDrawerContent = ({ mode, selectedResource, onClose }: Props) => {
  const { t } = useTranslation()
  const assetsPreviewPanelRef = React.useRef()
  const editMode = useHookstate(false)
  const state = useHookstate({ ...defaultState })

  const adminResourceState = useHookstate(getMutableState(AdminResourceState))
  const user = useHookstate(getMutableState(AuthState).user).value

  const hasWriteAccess = user.scopes && user.scopes.find((item) => item.type === 'static_resource:write')
  const viewMode = mode === ResourceDrawerMode.ViewEdit && !editMode.value

  const resourceTypesMenu: InputMenuItem[] =
    adminResourceState.value.filters?.allStaticResourceTypes.map((el) => {
      return {
        value: el,
        label: el
      }
    }) || []

  useEffect(() => {
    loadSelectedResource()
  }, [selectedResource])

  useEffect(() => {
    updateResource()
  }, [state.source.value, state.resourceFile.value, state.resourceUrl.value])

  const loadSelectedResource = () => {
    if (selectedResource) {
      state.merge({
        key: selectedResource.key || '',
        mimeType: selectedResource.mimeType || '',
        staticResourceType: selectedResource.staticResourceType || '',
        source: 'url',
        resourceUrl: selectedResource.LOD0_url || '',
        resourceFile: undefined
      })
    }
  }

  const updateResource = async () => {
    let url = ''
    if (state.source.value === 'url' && state.resourceUrl.value) {
      url = isValidHttpUrl(state.resourceUrl.value) ? state.resourceUrl.value : ''
    } else if (state.source.value === 'file' && state.resourceFile.value) {
      await state.resourceFile.value.arrayBuffer()
      url = URL.createObjectURL(state.resourceFile.value) + '#' + state.resourceFile.value.name
    }

    if (url) {
      ;(assetsPreviewPanelRef as any).current?.onSelectionChanged?.({
        name: state.key.value,
        resourceUrl: url,
        contentType: state.mimeType.value
      } as AssetSelectionChangePropsType)
    } else {
      ;(assetsPreviewPanelRef as any).current?.onSelectionChanged?.({ resourceUrl: '', name: '', contentType: '' })
    }
  }

  const isValidHttpUrl = (urlString) => {
    let url

    try {
      url = new URL(urlString)
    } catch (_) {
      return false
    }

    return url.protocol === 'http:' || url.protocol === 'https:'
  }

  const handleCancel = () => {
    if (editMode.value) {
      loadSelectedResource()
      editMode.set(false)
    } else handleClose()
  }

  const handleClose = () => {
    onClose()
    state.set(defaultState)
  }

  const handleChangeFile = (e) => {
    const { name, files } = e.target

    if (files.length === 0) {
      return
    }

    switch (name) {
      case 'resourceFile': {
        const inValidSize = files[0].size < MIN_AVATAR_FILE_SIZE || files[0].size > MAX_AVATAR_FILE_SIZE
        state.formErrors.merge({
          resourceFile: inValidSize
            ? t('admin:components.resources.resourceFileOversized', {
                minSize: MIN_AVATAR_FILE_SIZE / 1048576,
                maxSize: MAX_AVATAR_FILE_SIZE / 1048576
              })
            : ''
        })
        break
      }
      default:
        break
    }

    state.merge({ [name]: files[0] })
    if (!state.formErrors.resourceFile.value) {
      state.merge({ mimeType: files[0].type })

      if (!state.key.value) {
        state.merge({ key: files[0].name })
      }
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    switch (name) {
      case 'name':
        state.formErrors.merge({ name: value.length < 2 ? t('admin:components.resources.nameRequired') : '' })
        break
      case 'staticResourceType':
        state.formErrors.merge({
          staticResourceType: value.length < 2 ? t('admin:components.resources.resourceTypeRequired') : ''
        })
        break
      case 'resourceUrl': {
        state.formErrors.merge({
          resourceUrl: !isValidHttpUrl(value) ? t('admin:components.resources.resourceUrlInvalid') : ''
        })
        break
      }
      default:
        break
    }

    state.merge({ [name]: value })
  }

  const handleSubmit = async () => {
    let resourceBlob: Blob | undefined = undefined

    state.formErrors.merge({
      name:
        mode === ResourceDrawerMode.Create
          ? state.name.value
            ? ''
            : t('admin:components.resources.nameCantEmpty')
          : '',
      staticResourceType: state.staticResourceType.value ? '' : t('admin:components.resources.resourceTypeCantEmpty'),
      resourceUrl:
        state.source.value === 'url' && state.resourceUrl.value
          ? ''
          : t('admin:components.resources.resourceUrlCantEmpty'),
      resourceFile:
        state.source.value === 'file' && state.resourceFile.value
          ? ''
          : t('admin:components.resources.resourceFileCantEmpty')
    })

    if (
      (state.source.value === 'file' && state.formErrors.resourceFile.value) ||
      (state.source.value === 'url' && state.formErrors.resourceUrl.value)
    ) {
      NotificationService.dispatchNotify(t('admin:components.common.fixErrorFields'), { variant: 'error' })
      return
    } else if (state.formErrors.name.value || state.formErrors.staticResourceType.value) {
      NotificationService.dispatchNotify(t('admin:components.common.fillRequiredFields'), { variant: 'error' })
      return
    } else if (state.source.value === 'file' && state.resourceFile.value) {
      resourceBlob = state.resourceFile.value
    } else if (state.source.value === 'url' && state.resourceUrl.value) {
      const resourceData = await fetch(state.resourceUrl.value)
      resourceBlob = await resourceData.blob()

      if (selectedResource && selectedResource.LOD0_url === state.resourceUrl.value) {
        resourceBlob = new Blob([resourceBlob], { type: selectedResource.mimeType })
      }
    }

    const data = {
      id: selectedResource ? selectedResource.id : '',
      key: mode === ResourceDrawerMode.Create ? state.value : state.key.value,
      staticResourceType: state.staticResourceType.value
    }

    if (resourceBlob) {
      ResourceService.createOrUpdateResource(data, resourceBlob)

      if (mode === ResourceDrawerMode.ViewEdit) {
        editMode.set(false)
      }

      handleClose()
    }
  }

  return (
    <Container maxWidth="sm" className={styles.mt10}>
      <DialogTitle className={styles.textAlign}>
        {mode === ResourceDrawerMode.Create && t('user:resource.createResource')}
        {mode === ResourceDrawerMode.ViewEdit &&
          editMode.value &&
          `${t('admin:components.common.update')} ${selectedResource?.key}`}
        {mode === ResourceDrawerMode.ViewEdit && !editMode.value && selectedResource?.key}
      </DialogTitle>

      {mode === ResourceDrawerMode.Create && (
        <InputText
          name="name"
          label={t('admin:components.resources.name')}
          value={state.name.value}
          error={state.formErrors.name.value}
          onChange={handleChange}
        />
      )}

      {mode !== ResourceDrawerMode.Create && (
        <InputText name="key" label={t('admin:components.resources.key')} value={state.key.value} disabled />
      )}

      <InputText
        name="mimeType"
        label={t('admin:components.resources.mimeType')}
        value={state.mimeType.value}
        disabled
      />

      <InputSelect
        name="staticResourceType"
        label={t('admin:components.resources.resourceType')}
        value={state.staticResourceType.value}
        error={state.formErrors.staticResourceType.value}
        menu={resourceTypesMenu}
        disabled={viewMode}
        onChange={handleChange}
      />

      {!viewMode && (
        <InputRadio
          name="source"
          label={t('admin:components.avatar.source')}
          value={state.source.value}
          options={[
            { value: 'file', label: t('admin:components.avatar.file') },
            { value: 'url', label: t('admin:components.avatar.url') }
          ]}
          onChange={handleChange}
        />
      )}

      {state.source.value === 'file' && (
        <>
          <label htmlFor="select-file">
            <InputFile id="select-file" name="resourceFile" onChange={handleChangeFile} />
            <Button className={styles.gradientButton} component="span" startIcon={<Icon type="FileUpload" />}>
              {t('admin:components.resources.selectFile')}
            </Button>
          </label>

          {state.formErrors.resourceFile.value && (
            <Box>
              <FormControl error>
                <FormHelperText className="Mui-error">{state.formErrors.resourceFile.value}</FormHelperText>
              </FormControl>
            </Box>
          )}
        </>
      )}

      {state.source.value === 'url' && (
        <InputText
          name="resourceUrl"
          sx={{ mt: 3, mb: 1 }}
          label={t('admin:components.resources.resourceUrl')}
          value={state.resourceUrl.value}
          error={state.formErrors.resourceUrl.value}
          disabled={viewMode}
          onChange={handleChange}
        />
      )}

      <Typography>{t('admin:components.resources.preview')}</Typography>

      <Box className={styles.preview} sx={{ height: 300 }}>
        <AssetsPreviewPanel hideHeading ref={assetsPreviewPanelRef} />
      </Box>

      <DialogActions>
        <Button className={styles.outlinedButton} onClick={handleCancel}>
          {t('admin:components.common.cancel')}
        </Button>
        {(mode === ResourceDrawerMode.Create || editMode.value) && (
          <Button className={styles.gradientButton} onClick={handleSubmit}>
            {t('admin:components.common.submit')}
          </Button>
        )}
        {mode === ResourceDrawerMode.ViewEdit && !editMode.value && (
          <Button className={styles.gradientButton} disabled={!hasWriteAccess} onClick={() => editMode.set(true)}>
            {t('admin:components.common.edit')}
          </Button>
        )}
      </DialogActions>
    </Container>
  )
}

const ResourceDrawer = (props: Props) => {
  const { open, onClose } = props
  return (
    <DrawerView open={open} onClose={onClose}>
      <ResourceDrawerContent {...props} />
    </DrawerView>
  )
}

export default ResourceDrawer
