declare module "electron-builder-squirrel-windows/out/squirrelPack" {
  import { WinPackager } from "electron-builder/out/winPackager"

  export function convertVersion(version: string): string

  export interface SquirrelOptions {
    vendorPath: string
    remoteReleases?: string
    remoteToken?: string
    loadingGif?: string
    productName?: string
    appId?: string
    name: string
    packageCompressionLevel?: number
    version: string
    msi?: any
    owners?: string
    description?: string
    iconUrl?: string
    authors?: string
    extraMetadataSpecs?: string
    copyright?: string
  }

  export function buildInstaller(options: SquirrelOptions, outputDirectory: string, setupExe: string, packager: WinPackager, appOutDir: string): Promise<void>
}

declare module "electron-builder-squirrel-windows" {
  import { Arch, Target } from "electron-builder-core"
  import { WinPackager } from "electron-builder/out/winPackager"
  import { SquirrelOptions } from "electron-builder-squirrel-windows/out/squirrelPack"

  export default class SquirrelWindowsTarget extends Target {
    private readonly packager
    readonly outDir: string
    private readonly options
    constructor(packager: WinPackager, outDir: string)
    build(appOutDir: string, arch: Arch): Promise<void>
    computeEffectiveDistOptions(): Promise<SquirrelOptions>
  }
}

