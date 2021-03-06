declare module "electron-builder-core" {
  export enum Arch {
    ia32 = 0,
    x64 = 1,
    armv7l = 2,
  }
  export type ArchType = "x64" | "ia32" | "armv7l"

  export function getArchSuffix(arch: Arch): string
  export type TargetConfigType = Array<string | TargetConfig> | string | TargetConfig | null

  export interface TargetConfig {
    /**
     * The target name. e.g. `snap`.
     */
    readonly target: string
    /**
     * The arch or list of archs.
     */
    readonly arch?: Array<"x64" | "ia32" | "armv7l"> | string
  }

  export function toLinuxArchString(arch: Arch): "armv7l" | "i386" | "amd64"

  export function archFromString(name: string): Arch

  export class Platform {
    name: string
    buildConfigurationKey: string
    nodeName: string
    static MAC: Platform
    static LINUX: Platform
    static WINDOWS: Platform
    static OSX: Platform
    constructor(name: string, buildConfigurationKey: string, nodeName: string)
    toString(): string
    createTarget(type?: string | Array<string> | null, ...archs: Array<Arch>): Map<Platform, Map<Arch, Array<string>>>
    static current(): Platform
    static fromString(name: string): Platform
  }

  export abstract class Target {
    readonly name: string
    readonly isAsyncSupported: boolean
    readonly abstract outDir: string
    constructor(name: string, isAsyncSupported?: boolean)
    abstract build(appOutDir: string, arch: Arch): Promise<any>
    finishBuild(): Promise<any>
  }

  export interface TargetSpecificOptions {
    /**
     The [artifact file name pattern](https://github.com/electron-userland/electron-builder/wiki/Options#artifact-file-name-pattern).
     */
    readonly artifactName?: string | null
    readonly forceCodeSigning?: boolean
  }
  export const DEFAULT_TARGET = "default"
  export const DIR_TARGET = "dir"

  export interface AuthorMetadata {
    readonly name: string
    readonly email?: string
  }
  export type CompressionLevel = "store" | "normal" | "maximum"

  export interface RepositoryInfo {
    readonly url: string
  }

  export interface FilePattern {
    from?: string
    to?: string
    filter?: Array<string> | string
  }

  export interface AsarOptions {
    smartUnpack?: boolean
    ordering?: string | null
    extraMetadata?: any | null
  }

  export interface BeforeBuildContext {
    readonly appDir: string
    readonly electronVersion: string
    readonly platform: Platform
    readonly arch: string
  }
}

