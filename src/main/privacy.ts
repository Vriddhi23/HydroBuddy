import type { Session } from 'electron'
import { allowedResource } from './networkPolicy'

export function configurePrivacy(session: Session, developmentUrl?: string) {
  // One listener owns the session: later webRequest listeners would replace it.
  session.webRequest.onBeforeRequest((details, callback) => {
    callback({ cancel: !allowedResource(details.url, developmentUrl) })
  })
  session.setPermissionRequestHandler((_contents, _permission, callback) => callback(false))
  session.setPermissionCheckHandler(() => false)
  session.setDevicePermissionHandler(() => false)
  session.on('will-download', event => event.preventDefault())
}
