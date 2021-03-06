declare module "electron-builder-util/out/log" {
  import BluebirdPromise from "bluebird-lst"

  export function setPrinter(value: ((message: string) => void) | null): void

  export function warn(message: string): void

  export function log(message: string): void

  export function subTask(title: string, promise: BluebirdPromise<any> | Promise<any>): BluebirdPromise<any>

  export function task(title: string, promise: BluebirdPromise<any> | Promise<any>): BluebirdPromise<any>
}

declare module "electron-builder-util" {
  /// <reference types="node" />
  import { ChildProcess, SpawnOptions } from "child_process"
  export const debug: debug.Debugger
  export const debug7z: debug.Debugger

  export interface BaseExecOptions {
    cwd?: string
    env?: any
    stdio?: any
  }

  export interface ExecOptions extends BaseExecOptions {
    customFds?: any
    encoding?: string
    timeout?: number
    maxBuffer?: number
    killSignal?: string
  }

  export function removePassword(input: string): string

  export function execWine(file: string, args: Array<string>, options?: ExecOptions): Promise<string>

  export function prepareArgs(args: Array<string>, exePath: string): string[]

  export function exec(file: string, args?: Array<string> | null, options?: ExecOptions): Promise<string>

  export function doSpawn(command: string, args: Array<string>, options?: SpawnOptions, pipeInput?: Boolean): ChildProcess

  export function spawn(command: string, args?: Array<string> | null, options?: SpawnOptions): Promise<any>

  export function handleProcess(event: string, childProcess: ChildProcess, command: string, resolve: ((value?: any) => void) | null, reject: (reason?: any) => void): void

  export function computeDefaultAppDirectory(projectDir: string, userAppDir: string | null | undefined): Promise<string>

  export function use<T, R>(value: T | null, task: (it: T) => R): R | null

  export function debug7zArgs(command: "a" | "x"): Array<string>
  export let tmpDirCounter: number

  export function getTempName(prefix?: string | null | undefined): string

  export function isEmptyOrSpaces(s: string | null | undefined): boolean

  export function asArray<T>(v: null | undefined | T | Array<T>): Array<T>

  export function getCacheDirectory(): string

  export function smarten(s: string): string

  export class Lazy<T> {
    private _value
    private creator
    readonly value: Promise<T>
    constructor(creator: () => Promise<T>)
  }

  export function addValue<K, T>(map: Map<K, Array<T>>, key: K, value: T): void

  export function replaceDefault(inList: Array<string> | null | undefined, defaultList: Array<string>): Array<string>

  export function getPlatformIconFileName(value: string | null | undefined, isMac: boolean): string | null | undefined
}

declare module "electron-builder-util/out/fs" {
  /// <reference types="node" />
  import { Stats } from "fs-extra-p"
  export const MAX_FILE_REQUESTS = 8
  export const CONCURRENCY: {
    concurrency: number
  }
  export type Filter = (file: string, stat: Stats) => boolean

  export function unlinkIfExists(file: string): Promise<string | void>

  export function statOrNull(file: string): Promise<Stats | null>

  export function exists(file: string): Promise<boolean>

  export function walk(initialDirPath: string, filter?: Filter | null, consumer?: (file: string, stat: Stats, parent: string) => any): Promise<Array<string>>

  /**
   * Hard links is used if supported and allowed.
   * File permission is fixed — allow execute for all if owner can, allow read for all if owner can.
   */
  export function copyFile(src: string, dest: string, stats?: Stats | null, isUseHardLink?: boolean): Promise<any>

  export class FileCopier {
    private isUseHardLinkFunction
    private isUseHardLink
    constructor(isUseHardLinkFunction?: (file: string) => boolean, isUseHardLink?: boolean)
    copy(src: string, dest: string, stat: Stats | undefined): Promise<void>
  }

  /**
   * Empty directories is never created.
   * Hard links is used if supported and allowed.
   */
  export function copyDir(src: string, destination: string, filter?: Filter, isUseHardLink?: (file: string) => boolean): Promise<any>
}

declare module "electron-builder-util/out/nodeHttpExecutor" {
  /// <reference types="node" />
  import { DownloadOptions, HttpExecutor } from "electron-builder-http"
  import { CancellationToken } from "electron-builder-http/out/CancellationToken"
  import { ClientRequest } from "http"
  import { RequestOptions } from "https"

  export class NodeHttpExecutor extends HttpExecutor<RequestOptions, ClientRequest> {
    private httpsAgentPromise
    download(url: string, destination: string, options: DownloadOptions): Promise<string>
    doApiRequest<T>(options: RequestOptions, cancellationToken: CancellationToken, requestProcessor: (request: ClientRequest, reject: (error: Error) => void) => void, redirectCount?: number): Promise<T>
    protected doRequest(options: any, callback: (response: any) => void): any
  }
  export const httpExecutor: NodeHttpExecutor
}

declare module "electron-builder-util/out/binDownload" {
  
  export function getBinFromBintray(name: string, version: string, sha2: string): Promise<string>

  export function getBin(name: string, dirName: string, url: string, sha2: string): Promise<string>
}

declare module "electron-builder-util/out/deepAssign" {
  
  export function deepAssign(target: any, ...objects: Array<any>): any
}

declare module "electron-builder-util/out/promise" {
  import BluebirdPromise from "bluebird-lst"

  export function printErrorAndExit(error: Error): void

  export function executeFinally<T>(promise: Promise<T>, task: (errorOccurred: boolean) => Promise<any>): Promise<T>

  export class NestedError extends Error {
    constructor(errors: Array<Error>, message?: string)
  }

  export function all(promises: Array<Promise<any>>): BluebirdPromise<any>

  export function throwError(errors: Array<Error>): void
}

declare module "electron-builder-util/out/tmp" {
  
  export class TmpDir {
    private tempPrefixPromise
    private tempFiles
    getTempFile(suffix: string): Promise<string>
    cleanup(): Promise<any>
  }
}

