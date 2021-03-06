declare module "electron-updater/out/api" {
  /// <reference types="node" />
  import { RequestHeaders } from "electron-builder-http"
  import { CancellationToken } from "electron-builder-http/out/CancellationToken"
  import { ProgressInfo } from "electron-builder-http/out/ProgressCallbackTransform"
  import { VersionInfo } from "electron-builder-http/out/publishOptions"
  import { EventEmitter } from "events"

  export interface FileInfo {
    readonly name: string
    readonly url: string
    readonly sha2?: string
  }

  export abstract class Provider<T extends VersionInfo> {
    protected requestHeaders: RequestHeaders | null
    setRequestHeaders(value: RequestHeaders | null): void
    abstract getLatestVersion(): Promise<T>
    abstract getUpdateFile(versionInfo: T): Promise<FileInfo>
  }

  export function getDefaultChannelName(): string

  export function getCustomChannelName(channel: string): string

  export function getCurrentPlatform(): any

  export function getChannelFilename(channel: string): string

  export interface UpdateCheckResult {
    readonly versionInfo: VersionInfo
    readonly fileInfo?: FileInfo
    readonly downloadPromise?: Promise<any> | null
    readonly cancellationToken?: CancellationToken
  }
  export const DOWNLOAD_PROGRESS = "download-progress"

  export class UpdaterSignal {
    private emitter
    constructor(emitter: EventEmitter)
    progress(handler: (info: ProgressInfo) => void): void
    updateDownloaded(handler: (info: VersionInfo) => void): void
    updateCancelled(handler: (info: VersionInfo) => void): void
  }
}

declare module "electron-updater/out/BintrayProvider" {
  import { BintrayOptions, VersionInfo } from "electron-builder-http/out/publishOptions"
  import { FileInfo, Provider } from "electron-updater/out/api"

  export class BintrayProvider extends Provider<VersionInfo> {
    private client
    constructor(configuration: BintrayOptions)
    getLatestVersion(): Promise<VersionInfo>
    getUpdateFile(versionInfo: VersionInfo): Promise<FileInfo>
  }
}

declare module "electron-updater/out/electronHttpExecutor" {
  /// <reference types="electron" />
  import { DownloadOptions, HttpExecutor } from "electron-builder-http"
  import { CancellationToken } from "electron-builder-http/out/CancellationToken"

  export class ElectronHttpExecutor extends HttpExecutor<Electron.RequestOptions, Electron.ClientRequest> {
    download(url: string, destination: string, options: DownloadOptions): Promise<string>
    doApiRequest<T>(options: Electron.RequestOptions, cancellationToken: CancellationToken, requestProcessor: (request: Electron.ClientRequest, reject: (error: Error) => void) => void, redirectCount?: number): Promise<T>
    protected doRequest(options: any, callback: (response: any) => void): any
  }
}

declare module "electron-updater/out/GenericProvider" {
  import { Provider, FileInfo } from "electron-updater/out/api"
  import { GenericServerOptions, UpdateInfo } from "electron-builder-http/out/publishOptions"

  export class GenericProvider extends Provider<UpdateInfo> {
    private readonly configuration
    private readonly baseUrl
    private readonly channel
    constructor(configuration: GenericServerOptions)
    getLatestVersion(): Promise<UpdateInfo>
    getUpdateFile(versionInfo: UpdateInfo): Promise<FileInfo>
  }

  export function validateUpdateInfo(info: UpdateInfo): void
}

declare module "electron-updater/out/GitHubProvider" {
  import { Provider, FileInfo } from "electron-updater/out/api"
  import { VersionInfo, GithubOptions, UpdateInfo } from "electron-builder-http/out/publishOptions"

  export class GitHubProvider extends Provider<VersionInfo> {
    private readonly options
    private readonly baseUrl
    constructor(options: GithubOptions)
    getLatestVersion(): Promise<UpdateInfo>
    private getLatestVersionString(basePath, cancellationToken)
    private getBasePath()
    getUpdateFile(versionInfo: UpdateInfo): Promise<FileInfo>
  }
}

declare module "electron-updater/out/AppUpdater" {
  
  import { RequestHeaders } from "electron-builder-http"
  import { CancellationToken } from "electron-builder-http/out/CancellationToken"
  import { BintrayOptions, GenericServerOptions, GithubOptions, PublishConfiguration, S3Options, VersionInfo } from "electron-builder-http/out/publishOptions"
  import { EventEmitter } from "events"
  import { FileInfo, UpdateCheckResult, UpdaterSignal } from "electron-updater/out/api"

  export interface Logger {
    info(message?: any): void
    warn(message?: any): void
    error(message?: any): void
  }

  export abstract class AppUpdater extends EventEmitter {
    /**
     * Automatically download an update when it is found.
     */
    autoDownload: boolean
    requestHeaders: RequestHeaders | null
    /**
     * The logger. You can pass [electron-log](https://github.com/megahertz/electron-log), [winston](https://github.com/winstonjs/winston) or another logger with the following interface: `{ info(), warn(), error() }`.
     * Set it to `null` if you would like to disable a logging feature.
     */
    logger: Logger | null
    readonly signals: UpdaterSignal
    private _appUpdateConfigPath
    updateConfigPath: string | null
    protected updateAvailable: boolean
    private clientPromise
    private readonly untilAppReady
    private checkForUpdatesPromise
    protected readonly app: any
    protected versionInfo: VersionInfo | null
    private fileInfo
    constructor(options: PublishConfiguration | null | undefined)
    getFeedURL(): string | null | undefined
    /**
     * Configure update provider. If value is `string`, {@link module:electron-builder-http/out/publishOptions.GenericServerOptions} will be set with value as `url`.
     * @param options If you want to override configuration in the `app-update.yml`.
     */
    setFeedURL(options: PublishConfiguration | GenericServerOptions | S3Options | BintrayOptions | GithubOptions | string): void
    checkForUpdates(): Promise<UpdateCheckResult>
    private _checkForUpdates()
    private doCheckForUpdates()
    protected onUpdateAvailable(versionInfo: VersionInfo, fileInfo: FileInfo): void
    /**
     * Start downloading update manually. You can use this method if `autoDownload` option is set to `false`.
     * @returns {Promise<string>} Path to downloaded file.
     */
    downloadUpdate(cancellationToken?: CancellationToken): Promise<any>
    protected dispatchError(e: Error): void
    protected abstract doDownloadUpdate(versionInfo: VersionInfo, fileInfo: FileInfo, cancellationToken: CancellationToken): Promise<any>
    abstract quitAndInstall(): void
    loadUpdateConfig(): Promise<any>
  }
}

declare module "electron-updater/out/MacUpdater" {
  import BluebirdPromise from "bluebird-lst"
  import { CancellationToken } from "electron-builder-http/out/CancellationToken"
  import { PublishConfiguration, VersionInfo } from "electron-builder-http/out/publishOptions"
  import { FileInfo } from "electron-updater/out/api"
  import { AppUpdater } from "electron-updater/out/AppUpdater"

  export class MacUpdater extends AppUpdater {
    private readonly nativeUpdater
    constructor(options?: PublishConfiguration)
    protected onUpdateAvailable(versionInfo: VersionInfo, fileInfo: FileInfo): void
    protected doDownloadUpdate(versionInfo: VersionInfo, fileInfo: FileInfo, cancellationToken: CancellationToken): BluebirdPromise<void>
    quitAndInstall(): void
  }
}

declare module "electron-updater" {
  import { AppUpdater } from "electron-updater/out/AppUpdater"
  export const autoUpdater: AppUpdater
}

declare module "electron-updater/out/NsisUpdater" {
  
  import { CancellationToken } from "electron-builder-http/out/CancellationToken"
  import { PublishConfiguration, VersionInfo } from "electron-builder-http/out/publishOptions"
  import { FileInfo } from "electron-updater/out/api"
  import { AppUpdater } from "electron-updater/out/AppUpdater"

  export class NsisUpdater extends AppUpdater {
    private setupPath
    private quitAndInstallCalled
    private quitHandlerAdded
    constructor(options?: PublishConfiguration)
    /**
     * Start downloading update manually. You can use this method if `autoDownload` option is set to `false`.
     * @returns {Promise<string>} Path to downloaded file.
     */
    protected doDownloadUpdate(versionInfo: VersionInfo, fileInfo: FileInfo, cancellationToken: CancellationToken): Promise<string>
    private addQuitHandler()
    quitAndInstall(): void
    private install(isSilent)
  }
}

