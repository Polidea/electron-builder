declare module "electron-publish/out/multiProgress" {
  
  export class MultiProgress {
    private readonly stream
    private cursor
    private totalLines
    private isLogListenerAdded
    private barCount
    createBar(format: string, options: any): any
    private allocateLines(count)
    private moveCursor(index)
    terminate(): void
  }
}

declare module "electron-publish" {
  /// <reference types="node" />
  import { CancellationToken } from "electron-builder-http/out/CancellationToken"
  import { Stats } from "fs-extra-p"
  import { ClientRequest } from "http"
  import ProgressBar from "progress-ex"
  import { MultiProgress } from "electron-publish/out/multiProgress"
  export type PublishPolicy = "onTag" | "onTagOrDraft" | "always" | "never"

  export interface PublishOptions {
    publish?: PublishPolicy | null
    draft?: boolean
    prerelease?: boolean
  }

  export interface PublishContext {
    readonly cancellationToken: CancellationToken
    readonly progress: MultiProgress | null
  }

  export abstract class Publisher {
    protected readonly context: PublishContext
    constructor(context: PublishContext)
    readonly abstract providerName: string
    abstract upload(file: string, safeArtifactName?: string): Promise<any>
    protected createProgressBar(fileName: string, fileStat: Stats): ProgressBar | null
    protected createReadStreamAndProgressBar(file: string, fileStat: Stats, progressBar: ProgressBar | null, reject: (error: Error) => void): NodeJS.ReadableStream
    abstract toString(): string
  }

  export abstract class HttpPublisher extends Publisher {
    protected readonly context: PublishContext
    private readonly useSafeArtifactName
    constructor(context: PublishContext, useSafeArtifactName?: boolean)
    upload(file: string, safeArtifactName?: string): Promise<any>
    uploadData(data: Buffer, fileName: string): Promise<any>
    protected abstract doUpload(fileName: string, dataLength: number, requestProcessor: (request: ClientRequest, reject: (error: Error) => void) => void, file?: string): Promise<any>
  }
}

declare module "electron-publish/out/BintrayPublisher" {
  /// <reference types="node" />
  import { BintrayOptions } from "electron-builder-http/out/publishOptions"
  import { ClientRequest } from "http"
  import { HttpPublisher, PublishContext, PublishOptions } from "electron-publish"

  export class BintrayPublisher extends HttpPublisher {
    private readonly version
    private readonly options
    private _versionPromise
    private readonly client
    readonly providerName: string
    constructor(context: PublishContext, info: BintrayOptions, version: string, options?: PublishOptions)
    private init()
    protected doUpload(fileName: string, dataLength: number, requestProcessor: (request: ClientRequest, reject: (error: Error) => void) => void): Promise<any>
    deleteRelease(): Promise<any>
    toString(): string
  }
}

declare module "electron-publish/out/gitHubPublisher" {
  /// <reference types="node" />
  import { GithubOptions } from "electron-builder-http/out/publishOptions"
  import { ClientRequest } from "http"
  import { HttpPublisher, PublishContext, PublishOptions } from "electron-publish"

  export interface Release {
    id: number
    tag_name: string
    draft: boolean
    prerelease: boolean
    published_at: string
    upload_url: string
  }

  export class GitHubPublisher extends HttpPublisher {
    private readonly info
    private readonly version
    private readonly options
    private tag
    private _releasePromise
    private readonly token
    readonly providerName: string
    readonly releasePromise: Promise<Release | null>
    constructor(context: PublishContext, info: GithubOptions, version: string, options?: PublishOptions)
    private getOrCreateRelease()
    protected doUpload(fileName: string, dataLength: number, requestProcessor: (request: ClientRequest, reject: (error: Error) => void) => void): Promise<void>
    private createRelease()
    getRelease(): Promise<any>
    deleteRelease(): Promise<any>
    private githubRequest<T>(path, token, data?, method?)
    toString(): string
  }
}

