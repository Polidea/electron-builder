declare module "electron-builder-http/out/publishOptions" {
  export type PublishProvider = "github" | "bintray" | "s3" | "generic"
  export type AllPublishOptions = string | GithubOptions | S3Options | GenericServerOptions | BintrayOptions
  export type Publish = AllPublishOptions | Array<AllPublishOptions> | null

  /**
   * Can be specified in the [config](https://github.com/electron-userland/electron-builder/wiki/Options#configuration-options) or any platform- or target- specific options.
   *
   * If `GH_TOKEN` is set — defaults to `[{provider: "github"}]`.
   *
   * If `BT_TOKEN` is set and `GH_TOKEN` is not set — defaults to `[{provider: "bintray"}]`.
   */
  export interface PublishConfiguration {
    /**
     * The provider.
     */
    readonly provider: PublishProvider
    /**
     * The owner.
     */
    readonly owner?: string | null
    readonly token?: string | null
  }

  /**
   * GitHub options.
   */
  export interface GithubOptions extends PublishConfiguration {
    /**
     * The repository name. [Detected automatically](https://github.com/electron-userland/electron-builder/wiki/Publishing-Artifacts#github-repository).
     */
    readonly repo?: string | null
    /**
     * Whether to use `v`-prefixed tag name.
     * @default true
     */
    readonly vPrefixedTagName?: boolean
    /**
     * The host (including the port if need).
     * @default github.com
     */
    readonly host?: string | null
    /**
     * The protocol. GitHub Publisher supports only `https`.
     * @default https
     */
    readonly protocol?: "https" | "http" | null
  }

  export function githubUrl(options: GithubOptions): string

  /**
   * Generic (any HTTP(S) server) options.
   */
  export interface GenericServerOptions extends PublishConfiguration {
    /**
     * The base url. e.g. `https://bucket_name.s3.amazonaws.com`. You can use `${os}` (expanded to `mac`, `linux` or `win` according to target platform) and `${arch}` macros.
     */
    readonly url: string
    /**
     * The channel.
     * @default latest
     */
    readonly channel?: string | null
  }

  /**
   * Amazon S3 options. `https` must be used, so, if you use direct Amazon S3 endpoints, format `https://s3.amazonaws.com/bucket_name` [must be used](http://stackoverflow.com/a/11203685/1910191). And do not forget to make files/directories public.
   * @see [Getting your credentials](http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-your-credentials.html).
   */
  export interface S3Options extends PublishConfiguration {
    /**
     * The bucket name.
     */
    readonly bucket: string
    /**
     * The directory path.
     * @default /
     */
    readonly path?: string | null
    /**
     * The channel.
     * @default latest
     */
    readonly channel?: string | null
    /**
     * The ACL.
     * @default public-read
     */
    readonly acl?: "private" | "public-read" | null
    /**
     * The type of storage to use for the object.
     * @default STANDARD
     */
    readonly storageClass?: "STANDARD" | "REDUCED_REDUNDANCY" | "STANDARD_IA" | null
  }

  export function s3Url(options: S3Options): string

  /**
   * Bintray options.
   */
  export interface BintrayOptions extends PublishConfiguration {
    /**
     * The Bintray package name.
     */
    readonly package?: string | null
    /**
     * The Bintray repository name.
     * @default generic
     */
    readonly repo?: string | null
    /**
     * The Bintray user account. Used in cases where the owner is an organization.
     */
    readonly user?: string | null
  }

  export interface VersionInfo {
    readonly version: string
  }

  export interface UpdateInfo extends VersionInfo {
    readonly path: string
    readonly githubArtifactName?: string | null
    readonly sha2: string
    readonly releaseName?: string | null
    readonly releaseNotes?: string | null
    readonly releaseDate: string
  }
}

declare module "electron-builder-http/out/CancellationToken" {
  /// <reference types="node" />
  import { EventEmitter } from "events"

  export class CancellationToken extends EventEmitter {
    private parentCancelHandler
    private _cancelled
    readonly cancelled: boolean
    private _parent
    parent: CancellationToken
    constructor(parent?: CancellationToken)
    cancel(): void
    private onCancel(handler)
    createPromise<R>(callback: (resolve: (thenableOrResult?: R) => void, reject: (error?: Error) => void, onCancel: (callback: () => void) => void) => void): Promise<R>
    private removeParentCancelHandler()
    dispose(): void
  }

  export class CancellationError extends Error {
    constructor()
  }
}

declare module "electron-builder-http/out/ProgressCallbackTransform" {
  /// <reference types="node" />
  import { Transform } from "stream"
  import { CancellationToken } from "electron-builder-http/out/CancellationToken"

  export interface ProgressInfo {
    total: number
    delta: number
    transferred: number
    percent: number
    bytesPerSecond: number
  }

  export class ProgressCallbackTransform extends Transform {
    private readonly total
    private readonly cancellationToken
    private readonly onProgress
    private start
    private transferred
    private delta
    private nextUpdate
    constructor(total: number, cancellationToken: CancellationToken, onProgress: (info: ProgressInfo) => any)
    _transform(chunk: any, encoding: string, callback: Function): void
    _flush(callback: Function): void
  }
}

declare module "electron-builder-http" {
  /// <reference types="node" />
  import { EventEmitter } from "events"
  import { RequestOptions } from "http"
  import { CancellationToken } from "electron-builder-http/out/CancellationToken"
  import { ProgressInfo } from "electron-builder-http/out/ProgressCallbackTransform"

  export interface RequestHeaders {
    [key: string]: any
  }

  export interface Response extends EventEmitter {
    statusCode?: number
    statusMessage?: string
    headers: any
    setEncoding(encoding: string): void
  }

  export interface DownloadOptions {
    readonly headers?: RequestHeaders | null
    readonly skipDirCreation?: boolean
    readonly sha2?: string | null
    readonly cancellationToken: CancellationToken
    onProgress?(progress: ProgressInfo): void
  }

  export class HttpExecutorHolder {
    private _httpExecutor
    httpExecutor: HttpExecutor<any, any>
  }
  export const executorHolder: HttpExecutorHolder

  export function download(url: string, destination: string, options?: DownloadOptions | null): Promise<string>

  export class HttpError extends Error {
    readonly response: {
      statusMessage?: string | undefined
      statusCode?: number | undefined
      headers?: {
        [key: string]: string[]
      } | undefined
    }
    description: any | null
    constructor(response: {
      statusMessage?: string | undefined
      statusCode?: number | undefined
      headers?: {
        [key: string]: string[]
      } | undefined
    }, description?: any | null)
  }

  export abstract class HttpExecutor<REQUEST_OPTS, REQUEST> {
    protected readonly maxRedirects: number
    protected readonly debug: debug.Debugger
    request<T>(options: RequestOptions, cancellationToken: CancellationToken, data?: {
      [name: string]: any
    } | null): Promise<T>
    protected abstract doApiRequest<T>(options: REQUEST_OPTS, cancellationToken: CancellationToken, requestProcessor: (request: REQUEST, reject: (error: Error) => void) => void, redirectCount: number): Promise<T>
    abstract download(url: string, destination: string, options: DownloadOptions): Promise<string>
    protected handleResponse(response: Response, options: RequestOptions, cancellationToken: CancellationToken, resolve: (data?: any) => void, reject: (error: Error) => void, redirectCount: number, requestProcessor: (request: REQUEST, reject: (error: Error) => void) => void): void
    protected abstract doRequest(options: any, callback: (response: any) => void): any
    protected doDownload(requestOptions: any, destination: string, redirectCount: number, options: DownloadOptions, callback: (error: Error | null) => void, onCancel: (callback: () => void) => void): void
    protected addTimeOutHandler(request: any, callback: (error: Error) => void): void
  }

  export function request<T>(options: RequestOptions, cancellationToken: CancellationToken, data?: {
    [name: string]: any
  } | null): Promise<T>

  export function configureRequestOptions(options: RequestOptions, token?: string | null, method?: "GET" | "DELETE" | "PUT"): RequestOptions

  export function dumpRequestOptions(options: RequestOptions): string
}

declare module "electron-builder-http/out/bintray" {
  import { BintrayOptions } from "electron-builder-http/out/publishOptions"
  import { CancellationToken } from "electron-builder-http/out/CancellationToken"

  export function bintrayRequest<T>(path: string, auth: string | null, data: {
    [name: string]: any
  } | null | undefined, cancellationToken: CancellationToken, method?: "GET" | "DELETE" | "PUT"): Promise<T>

  export interface Version {
    readonly name: string
    readonly package: string
  }

  export interface File {
    name: string
    path: string
    sha1: string
    sha256: string
  }

  export class BintrayClient {
    private readonly cancellationToken
    private readonly basePath
    readonly auth: string | null
    readonly repo: string
    readonly owner: string
    readonly user: string
    readonly packageName: string
    constructor(options: BintrayOptions, cancellationToken: CancellationToken, apiKey?: string | null)
    getVersion(version: string): Promise<Version>
    getVersionFiles(version: string): Promise<Array<File>>
    createVersion(version: string): Promise<any>
    deleteVersion(version: string): Promise<any>
  }
}

