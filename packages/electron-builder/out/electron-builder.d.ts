declare module "electron-builder/out/options/linuxOptions" {
  import { TargetConfigType } from "electron-builder-core"
  import { PlatformSpecificBuildOptions } from "electron-builder/out/metadata"

  /**
   ### `linux` Linux Specific Options
   */
  export interface LinuxBuildOptions extends PlatformSpecificBuildOptions {
    /**
     The [application category](https://specifications.freedesktop.org/menu-spec/latest/apa.html#main-category-registry).
     */
    readonly category?: string | null
    /**
    The [package category](https://www.debian.org/doc/debian-policy/ch-controlfields.html#s-f-Section). Not applicable for AppImage.
     */
    readonly packageCategory?: string | null
    /**
     As [description](#AppMetadata-description) from application package.json, but allows you to specify different for Linux.
     */
    readonly description?: string | null
    /**
     Target package type: list of `AppImage`, `snap`, `deb`, `rpm`, `freebsd`, `pacman`, `p5p`, `apk`, `7z`, `zip`, `tar.xz`, `tar.lz`, `tar.gz`, `tar.bz2`, `dir`. Defaults to `AppImage`.
  
     The most effective [xz](https://en.wikipedia.org/wiki/Xz) compression format used by default.
  
     electron-builder [docker image](https://github.com/electron-userland/electron-builder/wiki/Docker) can be used to build Linux targets on any platform. See [Multi platform build](https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build).
     */
    readonly target?: TargetConfigType
    /**
     The maintainer. Defaults to [author](#AppMetadata-author).
     */
    readonly maintainer?: string | null
    /**
     The vendor. Defaults to [author](#AppMetadata-author).
     */
    readonly vendor?: string | null
    readonly fpm?: Array<string> | null
    /**
     The [Desktop file](https://developer.gnome.org/integration-guide/stable/desktop-files.html.en) entries (name to value).
     */
    readonly desktop?: {
      [key: string]: string
    } | null
    readonly afterInstall?: string | null
    readonly afterRemove?: string | null
    /**
     Package dependencies. Defaults to `["gconf2", "gconf-service", "libnotify4", "libappindicator1", "libxtst6", "libnss3"]` for `deb`.
     */
    readonly depends?: string[] | null
    /**
     The executable name. Defaults to `productName`.
  
     Cannot be specified per target, allowed only in the `linux`.
     */
    readonly executableName?: string | null
    /**
     The path to icon set directory, relative to the the [build resources](https://github.com/electron-userland/electron-builder/wiki/Options#MetadataDirectories-buildResources) or to the project directory. The icon filename must contain the size (e.g. 32x32.png) of the icon.
     By default will be generated automatically based on the macOS icns file.
     */
    readonly icon?: string
  }

  /**
   ### `deb` Debian Package Specific Options
   */
  export interface DebOptions extends LinuxBuildOptions {
    /**
    The [short description](https://www.debian.org/doc/debian-policy/ch-controlfields.html#s-f-Description).
     */
    readonly synopsis?: string | null
    /**
    The compression type, one of `gz`, `bzip2`, `xz`. Defaults to `xz`.
     */
    readonly compression?: string | null
    /**
    The [Priority](https://www.debian.org/doc/debian-policy/ch-controlfields.html#s-f-Priority) attribute.
     */
    readonly priority?: string | null
  }

  /**
   ### `snap` [Snap](http://snapcraft.io) Specific Options
   */
  export interface SnapOptions extends LinuxBuildOptions {
    /**
    The type of [confinement](https://snapcraft.io/docs/reference/confinement) supported by the snap. Defaults to `strict`.
     */
    readonly confinement?: "devmode" | "strict" | "classic" | null
    /**
    The 78 character long summary. Defaults to [productName](#AppMetadata-productName).
     */
    readonly summary?: string | null
    /**
    The quality grade of the snap. It can be either `devel` (i.e. a development version of the snap, so not to be published to the “stable” or “candidate” channels) or “stable” (i.e. a stable release or release candidate, which can be released to all channels).
    Defaults to `stable`.
     */
    readonly grade?: "devel" | "stable" | null
    /**
    The list of features that must be supported by the core in order for this snap to install.
     */
    readonly assumes?: Array<string> | null
    /**
    The list of Ubuntu packages to use that are needed to support the `app` part creation. Like `depends` for `deb`.
    Defaults to `["libnotify4", "libappindicator1", "libxtst6", "libnss3", "libxss1", "fontconfig-config", "gconf2", "libasound2", "pulseaudio"]`.
  
    If list contains `default`, it will be replaced to default list, so, `["default", "foo"]` can be used to add custom package `foo` in addition to defaults.
     */
    readonly stagePackages?: Array<string> | null
    /**
    The list of [plugs](https://snapcraft.io/docs/reference/interfaces).
    Defaults to `["home", "x11", "unity7", "browser-support", "network", "gsettings", "pulseaudio", "opengl"]`.
  
    If list contains `default`, it will be replaced to default list, so, `["default", "foo"]` can be used to add custom plug `foo` in addition to defaults.
     */
    readonly plugs?: Array<string> | null
    /**
    Specify `ubuntu-app-platform1` to use [ubuntu-app-platform](https://insights.ubuntu.com/2016/11/17/how-to-create-snap-packages-on-qt-applications/).
    Snap size will be greatly reduced, but it is not recommended for now because "the snaps must be connected before running uitk-gallery for the first time".
     */
    readonly ubuntuAppPlatformContent?: string | null
  }

  /**
   ### `appImage` [AppImage](http://appimage.org) Specific Options
   */
  export interface AppImageOptions extends LinuxBuildOptions {
  }
}

declare module "electron-builder/out/options/macOptions" {
  import { TargetConfig, TargetSpecificOptions } from "electron-builder-core"
  import { PlatformSpecificBuildOptions } from "electron-builder/out/metadata"
  export type MacOsTargetName = "default" | "dmg" | "mas" | "pkg" | "7z" | "zip" | "tar.xz" | "tar.lz" | "tar.gz" | "tar.bz2" | "dir"

  /**
   ### `mac` macOS Specific Options
   */
  export interface MacOptions extends PlatformSpecificBuildOptions {
    /**
     The application category type, as shown in the Finder via *View -> Arrange by Application Category* when viewing the Applications directory.
  
     For example, `"category": "public.app-category.developer-tools"` will set the application category to *Developer Tools*.
  
     Valid values are listed in [Apple's documentation](https://developer.apple.com/library/ios/documentation/General/Reference/InfoPlistKeyReference/Articles/LaunchServicesKeys.html#//apple_ref/doc/uid/TP40009250-SW8).
     */
    readonly category?: string | null
    /**
     The target package type: list of `default`, `dmg`, `mas`, `pkg`, `7z`, `zip`, `tar.xz`, `tar.lz`, `tar.gz`, `tar.bz2`, `dir`. Defaults to `default` (dmg and zip for Squirrel.Mac).
    */
    readonly target?: Array<MacOsTargetName | TargetConfig> | MacOsTargetName | TargetConfig | null
    /**
     The name of certificate to use when signing. Consider using environment variables [CSC_LINK or CSC_NAME](https://github.com/electron-userland/electron-builder/wiki/Code-Signing) instead of specifying this option.
     MAS installer identity is specified in the [mas](#MasBuildOptions-identity).
     */
    readonly identity?: string | null
    /**
     The path to application icon. Defaults to `build/icon.icns` (consider using this convention instead of complicating your configuration).
     */
    readonly icon?: string | null
    /**
     The path to entitlements file for signing the app. `build/entitlements.mac.plist` will be used if exists (it is a recommended way to set).
     MAS entitlements is specified in the [mas](#MasBuildOptions-entitlements).
     */
    readonly entitlements?: string | null
    /**
     The path to child entitlements which inherit the security settings for signing frameworks and bundles of a distribution. `build/entitlements.mac.inherit.plist` will be used if exists (it is a recommended way to set).
     Otherwise [default](https://github.com/electron-userland/electron-osx-sign/blob/master/default.entitlements.darwin.inherit.plist).
  
     This option only applies when signing with `entitlements` provided.
     */
    readonly entitlementsInherit?: string | null
    /**
    The `CFBundleVersion`. Do not use it unless [you need to](see (https://github.com/electron-userland/electron-builder/issues/565#issuecomment-230678643)).
     */
    readonly bundleVersion?: string | null
    /**
    The bundle identifier to use in the application helper's plist. Defaults to `${appBundleIdentifier}.helper`.
     */
    readonly helperBundleId?: string | null
    /**
     Whether to sign app for development or for distribution. One of `development`, `distribution`. Defaults to `distribution`.
     */
    readonly type?: "distribution" | "development" | null
    /**
     The extra entries for `Info.plist`.
     */
    readonly extendInfo?: any
  }

  /**
   ### `pkg` macOS Product Archive Options
   */
  export interface PkgOptions extends TargetSpecificOptions {
    /**
    The scripts directory, relative to `build` (build resources directory). Defaults to `build/pkg-scripts`.
    See [Scripting in installer packages](http://macinstallers.blogspot.de/2012/07/scripting-in-installer-packages.html).
    The scripts can be in any language so long as the files are marked executable and have the appropriate shebang indicating the path to the interpreter.
  
    Scripts are required to be executable (`chmod +x file`).
     */
    readonly scripts?: string | null
    readonly productbuild?: Array<string> | null
    /**
    The install location. Defaults to `/Applications`.
     */
    readonly installLocation?: string | null
    readonly identity?: string | null
  }

  /**
   ### `dmg` macOS DMG Options
   */
  export interface DmgOptions extends TargetSpecificOptions {
    /**
     The path to background image (default: `build/background.tiff` or `build/background.png` if exists). The resolution of this file determines the resolution of the installer window.
     If background is not specified, use `window.size`. Default locations expected background size to be 540x380.
  
     See [DMG with Retina background support](http://stackoverflow.com/a/11204769/1910191).
     */
    readonly background?: string | null
    /**
    The background color (accepts css colors). Defaults to `#ffffff` (white) if no background image.
     */
    readonly backgroundColor?: string | null
    /**
     The path to DMG icon (volume icon), which will be shown when mounted, relative to the the [build resources](https://github.com/electron-userland/electron-builder/wiki/Options#MetadataDirectories-buildResources) or to the project directory.
     Defaults to the application icon (`build/icon.icns`).
     */
    readonly icon?: string | null
    /**
    The size of all the icons inside the DMG. Defaults to 80.
     */
    readonly iconSize?: number | null
    /**
    The size of all the icon texts inside the DMG. Defaults to 12.
     */
    readonly iconTextSize?: number | null
    /**
    The title of the produced DMG, which will be shown when mounted (volume name). Defaults to `${productName} ${version}`
  
    Macro `${productName}`, `${version}` and `${name}` are supported.
     */
    readonly title?: string | null
    /**
    The content — to customize icon locations.
     */
    readonly contents?: Array<DmgContent>
    /**
     The disk image format, one of `UDRW`, `UDRO`, `UDCO`, `UDZO`, `UDBZ`, `ULFO` (lzfse-compressed image (OS X 10.11+ only)). Defaults to `UDBZ` (bzip2-compressed image).
     */
    readonly format?: string
    /**
    The DMG windows position and size. See [dmg.window](#DmgWindow).
     */
    window?: DmgWindow
  }

  /**
   ### `dmg.window` DMG Windows Position and Size
   */
  export interface DmgWindow {
    /**
    The X position relative to left of the screen. Defaults to 400.
     */
    x?: number
    /**
     The Y position relative to top of the screen. Defaults to 100.
     */
    y?: number
    /**
     * The width. Defaults to background image width or 540.
     */
    width?: number
    /**
     * The height. Defaults to background image height or 380.
     */
    height?: number
  }

  export interface DmgContent {
    x: number
    y: number
    type?: "link" | "file"
    /**
    The name of the file within the DMG. Defaults to basename of `path`.
     */
    name?: string
    path?: string
  }

  /**
   ### `mas` MAS (Mac Application Store) Specific Options
   */
  export interface MasBuildOptions extends MacOptions {
    /**
     The path to entitlements file for signing the app. `build/entitlements.mas.plist` will be used if exists (it is a recommended way to set).
     Otherwise [default](https://github.com/electron-userland/electron-osx-sign/blob/master/default.entitlements.mas.plist).
     */
    readonly entitlements?: string | null
    /**
     The path to child entitlements which inherit the security settings for signing frameworks and bundles of a distribution. `build/entitlements.mas.inherit.plist` will be used if exists (it is a recommended way to set).
     Otherwise [default](https://github.com/electron-userland/electron-osx-sign/blob/master/default.entitlements.mas.inherit.plist).
     */
    readonly entitlementsInherit?: string | null
  }
}

declare module "electron-builder/out/options/winOptions" {
  import { TargetConfigType } from "electron-builder-core"
  import { PlatformSpecificBuildOptions } from "electron-builder/out/metadata"

  /**
   ### `win` Windows Specific Options
   */
  export interface WinBuildOptions extends PlatformSpecificBuildOptions {
    /**
     Target package type: list of `nsis`, `nsis-web` (Web installer), `portable` (portable app without installation), `appx`, `squirrel`, `7z`, `zip`, `tar.xz`, `tar.lz`, `tar.gz`, `tar.bz2`, `dir`. Defaults to `nsis`.
  
     AppX package can be built only on Windows 10.
  
     To use Squirrel.Windows please install `electron-builder-squirrel-windows` dependency.
    */
    readonly target?: TargetConfigType
    /**
     Array of signing algorithms used. Defaults to `['sha1', 'sha256']`
  
     For AppX `sha256` is always used.
     */
    readonly signingHashAlgorithms?: Array<string> | null
    /**
     The path to application icon. Defaults to `build/icon.ico` (consider using this convention instead of complicating your configuration).
     */
    readonly icon?: string | null
    /**
    The trademarks and registered trademarks.
     */
    readonly legalTrademarks?: string | null
    /**
    The path to the *.pfx certificate you want to sign with. Please use it only if you cannot use env variable `CSC_LINK` (`WIN_CSC_LINK`) for some reason.
    Please see [Code Signing](https://github.com/electron-userland/electron-builder/wiki/Code-Signing).
     */
    readonly certificateFile?: string
    /**
    The password to the certificate provided in `certificateFile`. Please use it only if you cannot use env variable `CSC_KEY_PASSWORD` (`WIN_CSC_KEY_PASSWORD`) for some reason.
    Please see [Code Signing](https://github.com/electron-userland/electron-builder/wiki/Code-Signing).
     */
    readonly certificatePassword?: string
    /**
    The name of the subject of the signing certificate. Required only for EV Code Signing and works only on Windows.
     */
    readonly certificateSubjectName?: string
    /**
     * The SHA1 hash of the signing certificate. The SHA1 hash is commonly specified when multiple certificates satisfy the criteria specified by the remaining switches. Works only on Windows.
     */
    readonly certificateSha1?: string
    /**
    The URL of the RFC 3161 time stamp server. Defaults to `http://timestamp.comodoca.com/rfc3161`.
     */
    readonly rfc3161TimeStampServer?: string
    /**
    The URL of the time stamp server. Defaults to `http://timestamp.verisign.com/scripts/timstamp.dll`.
     */
    readonly timeStampServer?: string
    /**
    [The publisher name](https://github.com/electron-userland/electron-builder/issues/1187#issuecomment-278972073), exactly as in your code signed certificate. Several names can be provided.
    Defaults to common name from your code signing certificate.
     */
    readonly publisherName?: string | Array<string> | null
  }

  /**
   ### `nsis`

   See [NSIS target notes](https://github.com/electron-userland/electron-builder/wiki/NSIS).
   */
  export interface NsisOptions {
    /**
    One-click installation. Defaults to `true`.
     */
    readonly oneClick?: boolean
    /**
    Defaults to `false`.
  
    If `oneClick` is `true` (default): Install per all users (per-machine).
  
    If `oneClick` is `false`: no install mode installer page (choice per-machine or per-user), always install per-machine.
     */
    readonly perMachine?: boolean
    /**
     *boring installer only.* Allow requesting for elevation. If false, user will have to restart installer with elevated permissions. Defaults to `true`.
     */
    readonly allowElevation?: boolean
    /**
     *boring installer only.* Whether to allow user to change installation directory. Defaults to `false`.
     */
    readonly allowToChangeInstallationDirectory?: boolean
    /**
     *one-click installer only.* Run application after finish. Defaults to `true`.
     */
    readonly runAfterFinish?: boolean
    /**
    See [GUID vs Application Name](https://github.com/electron-userland/electron-builder/wiki/NSIS#guid-vs-application-name).
     */
    readonly guid?: string | null
    /**
     The path to installer icon, relative to the the [build resources](https://github.com/electron-userland/electron-builder/wiki/Options#MetadataDirectories-buildResources) or to the project directory.
     Defaults to `build/installerIcon.ico` or application icon.
     */
    readonly installerIcon?: string | null
    /**
     *boring installer only.* `MUI_HEADERIMAGE`, relative to the the [build resources](https://github.com/electron-userland/electron-builder/wiki/Options#MetadataDirectories-buildResources) or to the project directory.
     Defaults to `build/installerHeader.bmp`
     */
    readonly installerHeader?: string | null
    /**
     *boring installer only.* `MUI_WELCOMEFINISHPAGE_BITMAP`, relative to the the [build resources](https://github.com/electron-userland/electron-builder/wiki/Options#MetadataDirectories-buildResources) or to the project directory.
     Defaults to `build/installerSidebar.bmp` or `${NSISDIR}\\Contrib\\Graphics\\Wizard\\nsis3-metro.bmp`
     */
    readonly installerSidebar?: string | null
    /**
     *boring installer only.* `MUI_UNWELCOMEFINISHPAGE_BITMAP`, relative to the the [build resources](https://github.com/electron-userland/electron-builder/wiki/Options#MetadataDirectories-buildResources) or to the project directory.
     Defaults to `installerSidebar` option or `build/uninstallerSidebar.bmp` or `build/installerSidebar.bmp` or `${NSISDIR}\\Contrib\\Graphics\\Wizard\\nsis3-metro.bmp`
     */
    readonly uninstallerSidebar?: string | null
    /**
     *one-click installer only.* The path to header icon (above the progress bar), relative to the the [build resources](https://github.com/electron-userland/electron-builder/wiki/Options#MetadataDirectories-buildResources) or to the project directory.
     Defaults to `build/installerHeaderIcon.ico` or application icon.
     */
    readonly installerHeaderIcon?: string | null
    /**
    The path to NSIS include script to customize installer. Defaults to `build/installer.nsh`. See [Custom NSIS script](https://github.com/electron-userland/electron-builder/wiki/NSIS#custom-nsis-script).
     */
    readonly include?: string | null
    /**
    The path to NSIS script to customize installer. Defaults to `build/installer.nsi`. See [Custom NSIS script](https://github.com/electron-userland/electron-builder/wiki/NSIS#custom-nsis-script).
     */
    readonly script?: string | null
    /**
    The path to EULA license file. Defaults to `build/license.rtf` or `build/license.txt`.
     */
    readonly license?: string | null
    /**
     * [LCID Dec](https://msdn.microsoft.com/en-au/goglobal/bb964664.aspx), defaults to `1033`(`English - United States`).
     */
    readonly language?: string | null
    /**
     *boring installer only.* Whether to create multi-language installer. Defaults to `unicode` option value.
    [Not all strings are translated](https://github.com/electron-userland/electron-builder/issues/646#issuecomment-238155800).
     */
    readonly multiLanguageInstaller?: boolean
    /**
     Defaults to `true`. If `warningsAsErrors` is `true` (default): NSIS will treat warnings as errors. If `warningsAsErrors` is `false`: NSIS will allow warnings.
     */
    readonly warningsAsErrors?: boolean
    /**
    Whether to create submenu for start menu shortcut and program files directory. Defaults to `false`. If `true`, company name will be used. Or string value.
     */
    readonly menuCategory?: boolean | string
    readonly useZip?: boolean
    /**
    The [artifact file name pattern](https://github.com/electron-userland/electron-builder/wiki/Options#artifact-file-name-pattern). Defaults to `${productName} Setup ${version}.${ext}`.
     */
    readonly artifactName?: string | null
    /**
    Whether to create [Unicode installer](http://nsis.sourceforge.net/Docs/Chapter1.html#intro-unicode). Defaults to `true`.
     */
    readonly unicode?: boolean
    /**
    *one-click installer only.* Whether to delete app data on uninstall. Defaults to `false`.
     */
    readonly deleteAppDataOnUninstall?: boolean
  }

  /**
   ### `nsis` Web Installer Specific Options
   */
  export interface NsisWebOptions extends NsisOptions {
    /**
    The application package download URL. Optional — by default computed using publish configuration.
  
    URL like `https://example.com/download/latest` allows web installer to be version independent (installer will download latest application package).
  
    Custom `X-Arch` http header is set to `32` or `64`.
     */
    readonly appPackageUrl?: string | null
    /**
    The [artifact file name pattern](https://github.com/electron-userland/electron-builder/wiki/Options#artifact-file-name-pattern). Defaults to `${productName} Web Setup ${version}.${ext}`.
     */
    readonly artifactName?: string | null
  }

  /**
   ### `squirrelWindows`

   To use Squirrel.Windows please install `electron-builder-squirrel-windows` dependency. Squirrel.Windows target is maintained, but deprecated. Please use `nsis` instead.
   */
  export interface SquirrelWindowsOptions extends WinBuildOptions {
    /**
    A URL to an ICO file to use as the application icon (displayed in Control Panel > Programs and Features). Defaults to the Electron icon.
  
     Please note — [local icon file url is not accepted](https://github.com/atom/grunt-electron-installer/issues/73), must be https/http.
  
     * If you don't plan to build windows installer, you can omit it.
     * If your project repository is public on GitHub, it will be `https://github.com/${u}/${p}/blob/master/build/icon.ico?raw=true` by default.
     */
    readonly iconUrl?: string | null
    /**
     The path to a .gif file to display during install. `build/install-spinner.gif` will be used if exists (it is a recommended way to set)
     (otherwise [default](https://github.com/electron/windows-installer/blob/master/resources/install-spinner.gif)).
     */
    readonly loadingGif?: string | null
    /**
     Whether to create an MSI installer. Defaults to `false` (MSI is not created).
     */
    readonly msi?: boolean
    /**
     A URL to your existing updates. Or `true` to automatically set to your GitHub repository. If given, these will be downloaded to create delta updates.
     */
    readonly remoteReleases?: string | boolean | null
    /**
     Authentication token for remote updates
     */
    readonly remoteToken?: string | null
    /**
     Use `appId` to identify package instead of `name`.
     */
    readonly useAppIdAsId?: boolean
  }

  /**
   ### `appx`

   Please see [Windows AppX docs](https://msdn.microsoft.com/en-us/library/windows/apps/br211453.aspx).
   */
  export interface AppXOptions {
    /**
     The background color of the app tile. Please see [Visual Elements](https://msdn.microsoft.com/en-us/library/windows/apps/br211471.aspx).
     */
    readonly backgroundColor?: string | null
    readonly makeappxArgs?: Array<string> | null
    /**
     Describes the publisher information in a form `CN=your name exactly as in your cert`. The Publisher attribute must match the publisher subject information of the certificate used to sign a package.
     By default will be extracted from code sign certificate.
     */
    readonly publisher?: string | null
    /**
     A friendly name that can be displayed to users. Corresponds to [Properties.DisplayName](https://msdn.microsoft.com/en-us/library/windows/apps/br211432.aspx).
     */
    readonly displayName?: string | null
    /**
     A friendly name for the publisher that can be displayed to users. Corresponds to [Properties.PublisherDisplayName](https://msdn.microsoft.com/en-us/library/windows/apps/br211460.aspx).
     */
    readonly publisherDisplayName?: string | null
    /**
     Describes the contents of the package. The Name attribute is case-sensitive. Corresponds to [Identity.Name](https://msdn.microsoft.com/en-us/library/windows/apps/br211441.aspx).
     */
    readonly identityName?: string | null
  }
}

declare module "electron-builder/out/asar" {
  /// <reference types="node" />
  import { Stats } from "fs-extra-p"

  export class Node {
    files?: {
      [key: string]: Node
    }
    unpacked?: boolean
    size: number
    offset: number
    executable?: boolean
    link?: string
  }

  export class AsarFilesystem {
    readonly src: string
    readonly header: Node
    readonly headerSize: number
    private offset
    constructor(src: string, header?: Node, headerSize?: number)
    searchNodeFromDirectory(p: string): Node
    getOrCreateNode(p: string): Node
    insertDirectory(p: string, unpacked?: boolean): {
      [key: string]: Node
    }
    insertFileNode(node: Node, stat: Stats, file: string): void
    getNode(p: string): Node
    getFile(p: string, followLinks?: boolean): Node
    readJson(file: string): Promise<Buffer>
    readFile(file: string): Promise<Buffer>
  }

  export function readAsar(archive: string): Promise<AsarFilesystem>

  export function readAsarJson(archive: string, file: string): Promise<Buffer>
}

declare module "electron-builder/out/asarUtil" {
  import { AsarOptions } from "electron-builder-core"
  import { Filter } from "electron-builder-util/out/fs"

  export function createAsarArchive(src: string, resourcesPath: string, options: AsarOptions, filter: Filter, unpackPattern: Filter | null): Promise<any>

  export function checkFileInArchive(asarFile: string, relativeFile: string, messagePrefix: string): Promise<void>
}

declare module "electron-builder/out/util/filter" {
  import { Minimatch } from "minimatch"
  import { Filter } from "electron-builder-util/out/fs"

  export function hasMagic(pattern: Minimatch): boolean

  export function createFilter(src: string, patterns: Array<Minimatch>, ignoreFiles?: Set<string>, rawFilter?: (file: string) => boolean, excludePatterns?: Array<Minimatch> | null): Filter
}

declare module "electron-builder/out/fileMatcher" {
  import { Filter } from "electron-builder-util/out/fs"
  import { Minimatch } from "minimatch"

  export class FileMatcher {
    private readonly macroExpander
    readonly from: string
    readonly to: string
    readonly patterns: Array<string>
    constructor(from: string, to: string, macroExpander: (pattern: string) => string, patterns?: Array<string> | string | n)
    addPattern(pattern: string): void
    addAllPattern(): void
    isEmpty(): boolean
    containsOnlyIgnore(): boolean
    computeParsedPatterns(result: Array<Minimatch>, fromDir?: string): void
    createFilter(ignoreFiles?: Set<string>, rawFilter?: (file: string) => boolean, excludePatterns?: Array<Minimatch> | n): Filter
  }

  export function copyFiles(patterns: Array<FileMatcher> | null): Promise<any>
}

declare module "electron-builder/out/packager/dirPackager" {
  import { PlatformPackager } from "electron-builder/out/platformPackager"

  export function unpackElectron(packager: PlatformPackager<any>, out: string, platform: string, arch: string, electronVersion: string): Promise<void>
}

declare module "electron-builder/out/packagerApi" {
  /// <reference types="node" />
  import { Arch, Platform, Target } from "electron-builder-core"
  import { CancellationToken } from "electron-builder-http/out/CancellationToken"
  import { PublishConfiguration } from "electron-builder-http/out/publishOptions"
  import { TmpDir } from "electron-builder-util/out/tmp"
  import { AppInfo } from "electron-builder/out/appInfo"
  import { AfterPackContext, Config, Metadata } from "electron-builder/out/metadata"
  import { PlatformPackager } from "electron-builder/out/platformPackager"

  export interface PackagerOptions {
    targets?: Map<Platform, Map<Arch, Array<string>>>
    projectDir?: string | null
    cscLink?: string | null
    cscKeyPassword?: string | null
    cscInstallerLink?: string | null
    cscInstallerKeyPassword?: string | null
    platformPackagerFactory?: ((info: BuildInfo, platform: Platform, cleanupTasks: Array<() => Promise<any>>) => PlatformPackager<any>) | null
    /**
     * @deprecated Use {@link PackagerOptions#config} instead.
     */
    readonly devMetadata?: Metadata
    readonly config?: Config | string | null
    /**
     * The same as [application package.json](https://github.com/electron-userland/electron-builder/wiki/Options#AppMetadata).
     *
     * Application `package.json` will be still read, but options specified in this object will override.
     */
    readonly appMetadata?: Metadata
    readonly effectiveOptionComputed?: (options: any) => Promise<boolean>
    readonly extraMetadata?: any
    readonly prepackaged?: string
  }

  export interface BuildInfo {
    readonly options: PackagerOptions
    readonly metadata: Metadata
    readonly config: Config
    readonly projectDir: string
    readonly appDir: string
    readonly electronVersion: string
    readonly isTwoPackageJsonProjectLayoutUsed: boolean
    readonly appInfo: AppInfo
    readonly tempDirManager: TmpDir
    readonly repositoryInfo: Promise<SourceRepositoryInfo | null>
    readonly isPrepackedAppAsar: boolean
    readonly prepackaged?: string | null
    readonly cancellationToken: CancellationToken
    dispatchArtifactCreated(event: ArtifactCreated): void
    afterPack(context: AfterPackContext): Promise<void>
  }

  export interface ArtifactCreated {
    readonly packager: PlatformPackager<any>
    readonly target: Target | null
    readonly file?: string
    readonly data?: Buffer
    readonly safeArtifactName?: string
    readonly publishConfig?: PublishConfiguration
  }

  export interface SourceRepositoryInfo {
    type: string
    domain: string
    user: string
    project: string
  }
}

declare module "electron-builder/out/readInstalled" {
  
  export interface Dependency {
    name: string
    path: string
    extraneous: boolean
    optional: boolean
    dependencies: {
      [name: string]: Dependency
    }
  }

  export function readInstalled(folder: string): Promise<Map<string, Dependency>>
}

declare module "electron-builder/out/platformPackager" {
  import { Arch, Platform, Target, TargetSpecificOptions } from "electron-builder-core"
  import { AppInfo } from "electron-builder/out/appInfo"
  import { Config, FileAssociation, PlatformSpecificBuildOptions } from "electron-builder/out/metadata"
  import { BuildInfo, PackagerOptions } from "electron-builder/out/packagerApi"

  export abstract class PlatformPackager<DC extends PlatformSpecificBuildOptions> {
    readonly info: BuildInfo
    readonly packagerOptions: PackagerOptions
    readonly projectDir: string
    readonly buildResourcesDir: string
    readonly config: Config
    readonly platformSpecificBuildOptions: DC
    readonly resourceList: Promise<Array<string>>
    private readonly _resourceList
    readonly abstract platform: Platform
    readonly appInfo: AppInfo
    constructor(info: BuildInfo)
    readonly abstract defaultTarget: Array<string>
    protected prepareAppInfo(appInfo: AppInfo): AppInfo
    private static normalizePlatformSpecificBuildOptions(options)
    abstract createTargets(targets: Array<string>, mapper: (name: string, factory: (outDir: string) => Target) => void, cleanupTasks: Array<() => Promise<any>>): void
    protected getCscPassword(): string
    protected doGetCscPassword(): any
    readonly relativeBuildResourcesDirname: string
    protected computeAppOutDir(outDir: string, arch: Arch): string
    dispatchArtifactCreated(file: string, target: Target | null, safeArtifactName?: string): void
    pack(outDir: string, arch: Arch, targets: Array<Target>, postAsyncTasks: Array<Promise<any>>): Promise<any>
    protected packageInDistributableFormat(appOutDir: string, arch: Arch, targets: Array<Target>, postAsyncTasks: Array<Promise<any>>): void
    private getExtraFileMatchers(isResources, appOutDir, macroExpander, customBuildOptions)
    private createFileMatcher(appDir, resourcesPath, macroExpander, platformSpecificBuildOptions)
    protected doPack(outDir: string, appOutDir: string, platformName: string, arch: Arch, platformSpecificBuildOptions: DC, targets: Array<Target>): Promise<void>
    protected postInitApp(executableFile: string): Promise<any>
    getIconPath(): Promise<string | null>
    private computeAsarOptions(customBuildOptions)
    private getFileMatchers(name, defaultSrc, defaultDest, allowAdvancedMatching, macroExpander, customBuildOptions)
    getResourcesDir(appOutDir: string): string
    getMacOsResourcesDir(appOutDir: string): string
    private checkFileInPackage(resourcesDir, file, messagePrefix, isAsar)
    private sanityCheckPackage(appOutDir, isAsar)
    expandArtifactNamePattern(targetSpecificOptions: TargetSpecificOptions | n, ext: string, arch?: Arch | null, defaultPattern?: string): string
    expandMacro(pattern: string, arch: Arch | n, extra?: any): string
    generateName(ext: string | null, arch: Arch, deployment: boolean, classifier?: string | null): string
    generateName2(ext: string | null, classifier: string | n, deployment: boolean): string
    getDefaultIcon(ext: string): Promise<string | null>
    getTempFile(suffix: string): Promise<string>
    readonly fileAssociations: Array<FileAssociation>
    getResource(custom: string | n, ...names: Array<string>): Promise<string | null>
    readonly forceCodeSigning: boolean
  }

  export function normalizeExt(ext: string): string
}

declare module "electron-builder/out/metadata" {
  import { Arch, AsarOptions, AuthorMetadata, BeforeBuildContext, CompressionLevel, FilePattern, RepositoryInfo, Target, TargetConfig, TargetSpecificOptions } from "electron-builder-core"
  import { Publish } from "electron-builder-http/out/publishOptions"
  import { AppImageOptions, DebOptions, LinuxBuildOptions, SnapOptions } from "electron-builder/out/options/linuxOptions"
  import { DmgOptions, MacOptions, MasBuildOptions, PkgOptions } from "electron-builder/out/options/macOptions"
  import { AppXOptions, NsisOptions, SquirrelWindowsOptions, WinBuildOptions } from "electron-builder/out/options/winOptions"
  import { PlatformPackager } from "electron-builder/out/platformPackager"

  /**
  ## Fields in the package.json

  Some standard fields should be defined in the `package.json`.
   */
  export interface Metadata {
    readonly repository?: string | RepositoryInfo | null
    readonly dependencies?: {
      [key: string]: string
    }
    readonly version?: string
    /**
     The application name.
     @required
     */
    readonly name?: string
    readonly productName?: string | null
    /**
     The application description.
     */
    readonly description?: string
    readonly main?: string | null
    readonly author?: AuthorMetadata
    /**
     The url to the project [homepage](https://docs.npmjs.com/files/package.json#homepage) (NuGet Package `projectUrl` (optional) or Linux Package URL (required)).
  
     If not specified and your project repository is public on GitHub, it will be `https://github.com/${user}/${project}` by default.
     */
    readonly homepage?: string | null
    /**
     *linux-only.* The [license](https://docs.npmjs.com/files/package.json#license) name.
     */
    readonly license?: string | null
    readonly build?: Config
  }

  /**
   ## Configuration Options
   */
  export interface Config extends PlatformSpecificBuildOptions, TargetSpecificOptions {
    /**
    The application id. Used as
    [CFBundleIdentifier](https://developer.apple.com/library/ios/documentation/General/Reference/InfoPlistKeyReference/Articles/CoreFoundationKeys.html#//apple_ref/doc/uid/20001431-102070) for MacOS and as
    [Application User Model ID](https://msdn.microsoft.com/en-us/library/windows/desktop/dd378459(v=vs.85).aspx) for Windows (NSIS target only, Squirrel.Windows not supported).
  
    Defaults to `com.electron.${name}`. It is strongly recommended that an explicit ID be set.
     */
    readonly appId?: string | null
    /**
    The human-readable copyright line for the app. Defaults to `Copyright © year author`.
     */
    readonly copyright?: string | null
    /**
     * @deprecated
     */
    readonly iconUrl?: string | null
    /**
     As [name](#AppMetadata-name), but allows you to specify a product name for your executable which contains spaces and other special characters
     not allowed in the [name property](https://docs.npmjs.com/files/package.json#name}).
     */
    readonly productName?: string | null
    /**
     A [glob patterns](https://www.npmjs.com/package/glob#glob-primer) relative to the [app directory](#MetadataDirectories-app), which specifies which files to include when copying files to create the package.
  
     See [File Patterns](#multiple-glob-patterns).
     */
    readonly files?: Array<string> | string | null
    /**
     A [glob patterns](https://www.npmjs.com/package/glob#glob-primer) relative to the project directory, when specified, copy the file or directory with matching names directly into the app's resources directory (`Contents/Resources` for MacOS, `resources` for Linux/Windows).
  
     Glob rules the same as for [files](#multiple-glob-patterns).
     */
    readonly extraResources?: Array<FilePattern | string> | FilePattern | string | null
    /**
     The same as [extraResources](#Config-extraResources) but copy into the app's content directory (`Contents` for MacOS, root directory for Linux/Windows).
     */
    readonly extraFiles?: Array<FilePattern | string> | FilePattern | string | null
    /**
    Whether to package the application's source code into an archive, using [Electron's archive format](http://electron.atom.io/docs/tutorial/application-packaging/). Defaults to `true`.
    Node modules, that must be unpacked, will be detected automatically, you don't need to explicitly set [asarUnpack](#Config-asarUnpack) - please file issue if this doesn't work.
    */
    readonly asar?: AsarOptions | boolean | null
    /**
     A [glob patterns](https://www.npmjs.com/package/glob#glob-primer) relative to the [app directory](#MetadataDirectories-app), which specifies which files to unpack when creating the [asar](http://electron.atom.io/docs/tutorial/application-packaging/) archive.
     */
    readonly asarUnpack?: Array<string> | string | null
    readonly fileAssociations?: Array<FileAssociation> | FileAssociation
    readonly protocols?: Array<Protocol> | Protocol
    readonly mac?: MacOptions | null
    readonly dmg?: DmgOptions | null
    readonly mas?: MasBuildOptions | null
    readonly win?: WinBuildOptions | null
    readonly nsis?: NsisOptions | null
    readonly portable?: NsisOptions | null
    readonly pkg?: PkgOptions | null
    readonly appx?: AppXOptions | null
    readonly squirrelWindows?: SquirrelWindowsOptions | null
    readonly linux?: LinuxBuildOptions | null
    readonly deb?: DebOptions | null
    readonly snap?: SnapOptions | null
    readonly appimage?: AppImageOptions | null
    readonly pacman?: LinuxBuildOptions | null
    readonly rpm?: LinuxBuildOptions | null
    readonly freebsd?: LinuxBuildOptions | null
    readonly p5p?: LinuxBuildOptions | null
    readonly apk?: LinuxBuildOptions | null
    /**
     The compression level, one of `store`, `normal`, `maximum` (default: `normal`). If you want to rapidly test build, `store` can reduce build time significantly.
     */
    readonly compression?: CompressionLevel | null
    /**
     *programmatic API only* The function to be run after pack (but before pack into distributable format and sign). Promise must be returned.
     */
    readonly afterPack?: (context: AfterPackContext) => Promise<any> | null
    /**
     *programmatic API only* The function to be run before dependencies are installed or rebuilt. Works when `npmRebuild` is set to `true`. Promise must be returned. Resolving to `false` will skip dependencies install or rebuild.
     */
    readonly beforeBuild?: (context: BeforeBuildContext) => Promise<any> | null
    /**
     Whether to [rebuild](https://docs.npmjs.com/cli/rebuild) native dependencies (`npm rebuild`) before starting to package the app. Defaults to `true`.
     */
    readonly npmRebuild?: boolean
    /**
     Whether to omit using [--build-from-source](https://github.com/mapbox/node-pre-gyp#options) flag when installing app native deps. Defaults to `false`.
     */
    readonly npmSkipBuildFromSource?: boolean
    /**
     Additional command line arguments to use when installing app native deps. Defaults to `null`.
     */
    readonly npmArgs?: Array<string> | string | null
    /**
     Whether to execute `node-gyp rebuild` before starting to package the app. Defaults to `false`.
     */
    readonly nodeGypRebuild?: boolean
    /**
    The path to custom Electron build (e.g. `~/electron/out/R`). Only macOS supported, file issue if need for Linux or Windows.
     */
    readonly electronDist?: string
    /**
    The [electron-download](https://github.com/electron-userland/electron-download#usage) options.
     */
    readonly electronDownload?: any
    readonly icon?: string | null
    /**
     * Array of option objects. Order is important — first item will be used as a default auto-update server on Windows (NSIS).
     * @see [Publish options](https://github.com/electron-userland/electron-builder/wiki/Publishing-Artifacts#publish-options).
     */
    readonly publish?: Publish
    /**
    Whether to fail if application will be not signed (to prevent unsigned app if code signing configuration is not correct).
     */
    readonly forceCodeSigning?: boolean
    readonly directories?: MetadataDirectories | null
    /**
    The version of electron you are packaging for. Defaults to version of `electron`, `electron-prebuilt` or `electron-prebuilt-compile` dependency.
     */
    readonly electronVersion?: string | null
    /**
     The [artifact file name pattern](https://github.com/electron-userland/electron-builder/wiki/Options#artifact-file-name-pattern). Defaults to `${productName}-${version}.${ext}` (some target can have another defaults, see corresponding options).
  
     Currently supported only for `mas`, `pkg`, `dmg` and `nsis`.
     */
    readonly artifactName?: string | null
    /**
     * The build version. Maps to the `CFBundleVersion` on macOS, and `FileVersion` metadata property on Windows. Defaults to the `version`.
     * If `TRAVIS_BUILD_NUMBER` or `APPVEYOR_BUILD_NUMBER` or `CIRCLE_BUILD_NUM` or `BUILD_NUMBER` or `bamboo.buildNumber` env defined, it will be used as a build version (`version.build_number`).
     */
    readonly buildVersion?: string | null
  }

  export interface AfterPackContext {
    readonly appOutDir: string
    readonly packager: PlatformPackager<any>
    readonly electronPlatformName: string
    readonly arch: Arch
    readonly targets: Array<Target>
  }

  /**
   ### `fileAssociations` File Associations

   macOS (corresponds to [CFBundleDocumentTypes](https://developer.apple.com/library/content/documentation/General/Reference/InfoPlistKeyReference/Articles/CoreFoundationKeys.html#//apple_ref/doc/uid/20001431-101685)) and NSIS only. Array of option objects.

   On Windows works only if [nsis.perMachine](https://github.com/electron-userland/electron-builder/wiki/Options#NsisOptions-perMachine) is set to `true`.
   */
  export interface FileAssociation {
    /**
    The extension (minus the leading period). e.g. `png`.
     */
    readonly ext: string | Array<string>
    /**
     The name. e.g. `PNG`. Defaults to `ext`.
     */
    readonly name?: string | null
    /**
     *windows-only.* The description.
     */
    readonly description?: string | null
    /**
     The path to icon (`.icns` for MacOS and `.ico` for Windows), relative to `build` (build resources directory). Defaults to `${firstExt}.icns`/`${firstExt}.ico` (if several extensions specified, first is used) or to application icon.
     */
    readonly icon?: string
    /**
    *macOS-only* The app’s role with respect to the type. The value can be `Editor`, `Viewer`, `Shell`, or `None`. Defaults to `Editor`. Corresponds to `CFBundleTypeRole`.
     */
    readonly role?: string
    /**
    *macOS-only* Whether the document is distributed as a bundle. If set to true, the bundle directory is treated as a file. Corresponds to `LSTypeIsPackage`.
     */
    readonly isPackage?: boolean
  }

  /**
   ### `protocols` URL Protocol Schemes

   Protocols to associate the app with. macOS only.

   Please note — on macOS [you need to register an `open-url` event handler](http://electron.atom.io/docs/api/app/#event-open-url-macos).
   */
  export interface Protocol {
    /**
     The name. e.g. `IRC server URL`.
     */
    readonly name: string
    /**
    *macOS-only* The app’s role with respect to the type. The value can be `Editor`, `Viewer`, `Shell`, or `None`. Defaults to `Editor`.
    */
    readonly role?: string
    /**
    The schemes. e.g. `["irc", "ircs"]`.
    */
    readonly schemes: Array<string>
  }

  /**
   ### `directories`
   */
  export interface MetadataDirectories {
    /**
     The path to build resources, defaults to `build`.
     */
    readonly buildResources?: string | null
    /**
     The output directory, defaults to `dist`.
     */
    readonly output?: string | null
    /**
     The application directory (containing the application package.json), defaults to `app`, `www` or working directory.
     */
    readonly app?: string | null
  }

  export interface PlatformSpecificBuildOptions extends TargetSpecificOptions {
    readonly files?: Array<string> | string | null
    readonly extraFiles?: Array<FilePattern | string> | FilePattern | string | null
    readonly extraResources?: Array<FilePattern | string> | FilePattern | string | null
    readonly asarUnpack?: Array<string> | string | null
    readonly asar?: AsarOptions | boolean | null
    readonly target?: Array<string | TargetConfig> | string | TargetConfig | null
    readonly icon?: string | null
    readonly fileAssociations?: Array<FileAssociation> | FileAssociation
    readonly publish?: Publish
  }
}

declare module "electron-builder/out/appInfo" {
  import { Metadata } from "electron-builder/out/metadata"
  import { BuildInfo } from "electron-builder/out/packagerApi"

  export class AppInfo {
    metadata: Metadata
    private info
    readonly description: string
    readonly version: string
    readonly buildNumber: string
    readonly buildVersion: string
    readonly productName: string
    readonly productFilename: string
    private readonly config
    constructor(metadata: Metadata, info: BuildInfo, buildVersion?: string | null)
    readonly versionInWeirdWindowsForm: string
    readonly companyName: string
    readonly id: string
    readonly name: string
    readonly copyright: string
    computePackageUrl(): Promise<string | null>
  }
}

declare module "electron-builder/out/codeSign" {
  import { TmpDir } from "electron-builder-util/out/tmp"
  export const appleCertificatePrefixes: string[]
  export type CertType = "Developer ID Application" | "Developer ID Installer" | "3rd Party Mac Developer Application" | "3rd Party Mac Developer Installer" | "Mac Developer"

  export interface CodeSigningInfo {
    keychainName?: string | null
  }

  export function downloadCertificate(urlOrBase64: string, tmpDir: TmpDir): Promise<string>

  export function createKeychain(tmpDir: TmpDir, cscLink: string, cscKeyPassword: string, cscILink?: string | null, cscIKeyPassword?: string | null): Promise<CodeSigningInfo>

  export function sign(path: string, name: string, keychain: string): Promise<any>
  export let findIdentityRawResult: Promise<Array<string>> | null

  export function findIdentity(certType: CertType, qualifier?: string | null, keychain?: string | null): Promise<string | null>
}

declare module "electron-builder/out/targets/dmg" {
  import { Arch, Target } from "electron-builder-core"
  import { DmgOptions, MacOptions } from "electron-builder/out/options/macOptions"
  import { PlatformPackager } from "electron-builder/out/platformPackager"

  export class DmgTarget extends Target {
    private readonly packager
    readonly outDir: string
    private helperDir
    constructor(packager: PlatformPackager<MacOptions>, outDir: string)
    build(appPath: string, arch: Arch): Promise<void>
    computeVolumeName(custom?: string | null): string
    computeDmgOptions(): Promise<DmgOptions>
  }

  export function attachAndExecute(dmgPath: string, readWrite: boolean, task: () => Promise<any>): Promise<any>
}

declare module "electron-builder/out/packager/mac" {
  import { PlatformPackager } from "electron-builder/out/platformPackager"

  export function filterCFBundleIdentifier(identifier: string): string

  export function createApp(packager: PlatformPackager<any>, appOutDir: string): Promise<void>
}

declare module "electron-builder/out/targets/pkg" {
  import { Arch, Target } from "electron-builder-core"
  import MacPackager from "electron-builder/out/macPackager"

  export class PkgTarget extends Target {
    private readonly packager
    readonly outDir: string
    private readonly options
    private readonly installLocation
    constructor(packager: MacPackager, outDir: string)
    build(appPath: string, arch: Arch): Promise<any>
    private buildComponentPackage(appPath, outFile)
  }

  export function prepareProductBuildArgs(identity: string | n, keychain: string | n): string[]
}

declare module "electron-builder/out/targets/archive" {
  import { CompressionLevel } from "electron-builder-core"

  export function tar(compression: CompressionLevel | n, format: string, outFile: string, dirToArchive: string, isMacApp?: boolean): Promise<string>

  export function archive(compression: CompressionLevel | n, format: string, outFile: string, dirToArchive: string, withoutDir?: boolean): Promise<string>
}

declare module "electron-builder/out/targets/ArchiveTarget" {
  import { Arch, Target } from "electron-builder-core"
  import { PlatformPackager } from "electron-builder/out/platformPackager"

  export class ArchiveTarget extends Target {
    readonly outDir: string
    private readonly packager
    constructor(name: string, outDir: string, packager: PlatformPackager<any>)
    build(appOutDir: string, arch: Arch): Promise<any>
  }
}

declare module "electron-builder/out/targets/targetFactory" {
  import { Arch, Platform, Target } from "electron-builder-core"
  import { PlatformSpecificBuildOptions } from "electron-builder/out/metadata"
  import { PlatformPackager } from "electron-builder/out/platformPackager"

  export function computeArchToTargetNamesMap(raw: Map<Arch, string[]>, options: PlatformSpecificBuildOptions, platform: Platform): Map<Arch, string[]>

  export function createTargets(nameToTarget: Map<String, Target>, rawList: Array<string>, outDir: string, packager: PlatformPackager<any>, cleanupTasks: Array<() => Promise<any>>): Array<Target>

  export function createCommonTarget(target: string, outDir: string, packager: PlatformPackager<any>): Target

  export class NoOpTarget extends Target {
    readonly outDir: string
    build(appOutDir: string, arch: Arch): Promise<any>
  }
}

declare module "electron-builder/out/macPackager" {
  import { Arch, Platform, Target } from "electron-builder-core"
  import { SignOptions } from "electron-macos-sign"
  import { AppInfo } from "electron-builder/out/appInfo"
  import { CodeSigningInfo } from "electron-builder/out/codeSign"
  import { MacOptions } from "electron-builder/out/options/macOptions"
  import { BuildInfo } from "electron-builder/out/packagerApi"
  import { PlatformPackager } from "electron-builder/out/platformPackager"

  export default class MacPackager extends PlatformPackager<MacOptions> {
    readonly codeSigningInfo: Promise<CodeSigningInfo>
    constructor(info: BuildInfo)
    readonly defaultTarget: Array<string>
    protected prepareAppInfo(appInfo: AppInfo): AppInfo
    getIconPath(): Promise<string | null>
    createTargets(targets: Array<string>, mapper: (name: string, factory: (outDir: string) => Target) => void, cleanupTasks: Array<() => Promise<any>>): void
    readonly platform: Platform
    pack(outDir: string, arch: Arch, targets: Array<Target>, postAsyncTasks: Array<Promise<any>>): Promise<any>
    private sign(appPath, outDir, masOptions)
    protected doSign(opts: SignOptions): Promise<any>
    protected doFlat(appPath: string, outFile: string, identity: string, keychain: string | n): Promise<any>
  }
}

declare module "electron-builder/out/repositoryInfo" {
  import { Info } from "hosted-git-info"
  import { Metadata } from "electron-builder/out/metadata"

  export interface RepositorySlug {
    user: string
    project: string
  }

  export function getRepositoryInfo(projectDir: string, metadata?: Metadata, devMetadata?: Metadata): Promise<Info | null>
}

declare module "electron-builder/out/util/readPackageJson" {
  import { Config } from "electron-builder/out/metadata"

  export function readPackageJson(file: string): Promise<any>

  export function doLoadConfig(configFile: string, projectDir: string): Promise<any>

  export function loadConfig(projectDir: string): Promise<Config | null>

  export function getElectronVersion(config: Config | null | undefined, projectDir: string, projectMetadata?: any | null): Promise<string>

  export function validateConfig(config: Config): Promise<void>
}

declare module "electron-builder/out/windowsCodeSign" {
  import { WinBuildOptions } from "electron-builder/out/options/winOptions"

  export function getSignVendorPath(): Promise<string>

  export interface FileCodeSigningInfo {
    readonly file?: string | null
    readonly password?: string | null
    readonly subjectName?: string | null
    readonly certificateSha1?: string | null
  }

  export interface SignOptions {
    readonly path: string
    readonly cert?: string | null
    readonly name?: string | null
    readonly password?: string | null
    readonly site?: string | null
    readonly options: WinBuildOptions
  }

  export function sign(options: SignOptions): Promise<void>

  export function getToolPath(): Promise<string>
}

declare module "electron-builder/out/targets/appx" {
  import { Arch, Target } from "electron-builder-core"
  import { WinPackager } from "electron-builder/out/winPackager"

  export default class AppXTarget extends Target {
    private readonly packager
    readonly outDir: string
    private readonly options
    constructor(packager: WinPackager, outDir: string)
    build(appOutDir: string, arch: Arch): Promise<any>
    private writeManifest(templatePath, preAppx, safeName, arch, publisher)
  }
}

declare module "electron-builder/out/targets/nsis" {
  import { Arch, Target } from "electron-builder-core"
  import { NsisOptions } from "electron-builder/out/options/winOptions"
  import { WinPackager } from "electron-builder/out/winPackager"

  export default class NsisTarget extends Target {
    protected readonly packager: WinPackager
    readonly outDir: string
    protected readonly options: NsisOptions
    private archs
    private readonly nsisTemplatesDir
    constructor(packager: WinPackager, outDir: string, targetName: string)
    build(appOutDir: string, arch: Arch): Promise<void>
    private buildAppPackage(appOutDir, arch)
    finishBuild(): Promise<any>
    protected readonly installerFilenamePattern: string
    private readonly isPortable
    private buildInstaller(filesToDelete)
    protected generateGitHubInstallerName(): string
    private readonly isUnicodeEnabled
    protected readonly isWebInstaller: boolean
    private computeScriptAndSignUninstaller(defines, commands, installerPath)
    private computeVersionKey()
    protected configureDefines(oneClick: boolean, defines: any): Promise<void>
    private configureDefinesForAllTypeOfInstaller(defines)
    private executeMakensis(defines, commands, script)
    private computeFinalScript(originalScript, isInstaller)
  }
}

declare module "electron-builder/out/winPackager" {
  import { Platform, Target } from "electron-builder-core"
  import { Lazy } from "electron-builder-util"
  import { WinBuildOptions } from "electron-builder/out/options/winOptions"
  import { BuildInfo } from "electron-builder/out/packagerApi"
  import { PlatformPackager } from "electron-builder/out/platformPackager"
  import { FileCodeSigningInfo, SignOptions } from "electron-builder/out/windowsCodeSign"

  export class WinPackager extends PlatformPackager<WinBuildOptions> {
    readonly cscInfo: Lazy<FileCodeSigningInfo | null>
    private iconPath
    readonly computedPublisherName: Lazy<string[] | null>
    constructor(info: BuildInfo)
    readonly defaultTarget: Array<string>
    protected doGetCscPassword(): string
    createTargets(targets: Array<string>, mapper: (name: string, factory: (outDir: string) => Target) => void, cleanupTasks: Array<() => Promise<any>>): void
    readonly platform: Platform
    getIconPath(): Promise<string>
    private getValidIconPath()
    sign(file: string, logMessagePrefix?: string): Promise<void>
    protected doSign(options: SignOptions): Promise<any>
    signAndEditResources(file: string): Promise<void>
    protected postInitApp(appOutDir: string): Promise<void>
  }
}

declare module "electron-builder/out/yarn" {
  import { Config } from "electron-builder/out/metadata"

  export function installOrRebuild(config: Config, appDir: string, electronVersion: string, platform: string, arch: string, forceInstall?: boolean): Promise<void>

  export function getGypEnv(electronVersion: string, platform: string, arch: string, buildFromSource: boolean): any

  export function rebuild(appDir: string, electronVersion: string, platform: string | undefined, arch: string | undefined, additionalArgs: Array<string>, buildFromSource: boolean): Promise<void>
}

declare module "electron-builder/out/packager" {
  /// <reference types="node" />
  import { Platform, Target } from "electron-builder-core"
  import { CancellationToken } from "electron-builder-http/out/CancellationToken"
  import { TmpDir } from "electron-builder-util/out/tmp"
  import { EventEmitter } from "events"
  import { AppInfo } from "electron-builder/out/appInfo"
  import { AfterPackContext, Config, Metadata } from "electron-builder/out/metadata"
  import { ArtifactCreated, BuildInfo, PackagerOptions, SourceRepositoryInfo } from "electron-builder/out/packagerApi"

  export class Packager implements BuildInfo {
    readonly options: PackagerOptions
    readonly cancellationToken: CancellationToken
    readonly projectDir: string
    appDir: string
    metadata: Metadata
    private _isPrepackedAppAsar
    readonly isPrepackedAppAsar: boolean
    private devMetadata
    private _config
    readonly config: Config
    isTwoPackageJsonProjectLayoutUsed: boolean
    electronVersion: string
    readonly eventEmitter: EventEmitter
    appInfo: AppInfo
    readonly tempDirManager: TmpDir
    private _repositoryInfo
    private readonly afterPackHandlers
    readonly repositoryInfo: Promise<SourceRepositoryInfo>
    readonly prepackaged?: string | null
    constructor(options: PackagerOptions, cancellationToken: CancellationToken)
    addAfterPackHandler(handler: (context: AfterPackContext) => Promise<any> | null): void
    artifactCreated(handler: (event: ArtifactCreated) => void): Packager
    dispatchArtifactCreated(event: ArtifactCreated): void
    build(): Promise<BuildResult>
    private readProjectMetadata(appPackageFile, extraMetadata)
    private doBuild(outDir, cleanupTasks)
    private createHelper(platform, cleanupTasks)
    private checkMetadata(appPackageFile, devAppPackageFile)
    private installAppDependencies(platform, arch)
    afterPack(context: AfterPackContext): Promise<void>
  }

  export function normalizePlatforms(rawPlatforms: Array<string | Platform> | string | Platform | n): Array<Platform>

  /**
   * @private
   */
  export function checkWineVersion(checkPromise: Promise<string>): Promise<void>

  export interface BuildResult {
    readonly outDir: string
    readonly platformToTargets: Map<Platform, Map<String, Target>>
  }
}

declare module "electron-builder/out/publish/publisher" {
  import { PublishConfiguration } from "electron-builder-http/out/publishOptions"
  import { BuildInfo } from "electron-builder/out/packagerApi"

  export function getResolvedPublishConfig(packager: BuildInfo, publishConfig: PublishConfiguration, errorIfCannot?: boolean): Promise<PublishConfiguration | null>

  export function getCiTag(): any
}

declare module "electron-builder/out/publish/PublishManager" {
  import { Arch } from "electron-builder-core"
  import { CancellationToken } from "electron-builder-http/out/CancellationToken"
  import { PublishConfiguration } from "electron-builder-http/out/publishOptions"
  import { PublishContext, Publisher, PublishOptions } from "electron-publish"
  import { MultiProgress } from "electron-publish/out/multiProgress"
  import { PlatformSpecificBuildOptions } from "electron-builder/out/metadata"
  import { Packager } from "electron-builder/out/packager"
  import { BuildInfo } from "electron-builder/out/packagerApi"
  import { PlatformPackager } from "electron-builder/out/platformPackager"

  export class PublishManager implements PublishContext {
    private readonly publishOptions
    readonly cancellationToken: CancellationToken
    private readonly nameToPublisher
    readonly publishTasks: Array<Promise<any>>
    private readonly errors
    private isPublish
    readonly progress: MultiProgress | null
    constructor(packager: Packager, publishOptions: PublishOptions, cancellationToken: CancellationToken)
    private artifactCreated(event)
    private addTask(promise)
    getOrCreatePublisher(publishConfig: PublishConfiguration, buildInfo: BuildInfo): Publisher | null
    cancelTasks(): void
    awaitTasks(): Promise<void>
  }

  export function getPublishConfigsForUpdateInfo(packager: PlatformPackager<any>, publishConfigs: Array<PublishConfiguration> | null): Promise<Array<PublishConfiguration> | null>

  export function createPublisher(context: PublishContext, version: string, publishConfig: PublishConfiguration, options: PublishOptions): Publisher | null

  export function computeDownloadUrl(publishConfig: PublishConfiguration, fileName: string | null, packager: PlatformPackager<any>, arch: Arch | null): string

  export function getPublishConfigs(packager: PlatformPackager<any>, targetSpecificOptions: PlatformSpecificBuildOptions | null | undefined): Promise<Array<PublishConfiguration> | null>
}

declare module "electron-builder/out/builder" {
  import { Arch, Platform } from "electron-builder-core"
  import { PublishOptions } from "electron-publish"
  import { PackagerOptions } from "electron-builder/out/packagerApi"

  export interface BuildOptions extends PackagerOptions, PublishOptions {
  }

  export interface CliOptions extends PackagerOptions, PublishOptions {
    mac?: Array<string>
    linux?: Array<string>
    win?: Array<string>
    arch?: string
    x64?: boolean
    ia32?: boolean
    armv7l?: boolean
    dir?: boolean
    platform?: string
    project?: string
  }

  export function normalizeOptions(args: CliOptions): BuildOptions

  export function createTargets(platforms: Array<Platform>, type?: string | null, arch?: string | null): Map<Platform, Map<Arch, Array<string>>>

  export function build(rawOptions?: CliOptions): Promise<Array<string>>
}

declare module "electron-builder/out/errorMessages" {
  export const authorEmailIsMissed: string
}

declare module "electron-builder" {
  export { Packager, BuildResult } from "electron-builder/out/packager"
  export { PackagerOptions, ArtifactCreated, BuildInfo, SourceRepositoryInfo } from "electron-builder/out/packagerApi"
  export { getArchSuffix, Platform, Arch, archFromString, Target, DIR_TARGET } from "electron-builder-core"
  export { BuildOptions, build, CliOptions, createTargets } from "electron-builder/out/builder"
  export { Metadata, Config, AfterPackContext, Protocol, MetadataDirectories, FileAssociation, PlatformSpecificBuildOptions } from "electron-builder/out/metadata"
  export { MacOptions, DmgOptions, MasBuildOptions, MacOsTargetName, PkgOptions, DmgContent, DmgWindow } from "electron-builder/out/options/macOptions"
  export { WinBuildOptions, NsisOptions, SquirrelWindowsOptions, AppXOptions, NsisWebOptions } from "electron-builder/out/options/winOptions"
  export { LinuxBuildOptions, DebOptions, SnapOptions, AppImageOptions } from "electron-builder/out/options/linuxOptions"
}

declare module "electron-builder/out/targets/LinuxTargetHelper" {
  import { LinuxPackager } from "electron-builder/out/linuxPackager"
  import { LinuxBuildOptions } from "electron-builder/out/options/linuxOptions"
  export const installPrefix = "/opt"

  export class LinuxTargetHelper {
    private packager
    readonly icons: Promise<Array<Array<string>>>
    maxIconPath: string | null
    constructor(packager: LinuxPackager)
    private computeDesktopIcons()
    private iconsFromDir(iconDir)
    private getIcns()
    getDescription(options: LinuxBuildOptions): string
    computeDesktopEntry(platformSpecificBuildOptions: LinuxBuildOptions, exec?: string, destination?: string | null, extra?: {
      [key: string]: string
    }): Promise<string>
    private createFromIcns(tempDir)
    private createMappings(tempDir)
  }
}

declare module "electron-builder/out/targets/appImage" {
  import { Arch, Target } from "electron-builder-core"
  import { LinuxPackager } from "electron-builder/out/linuxPackager"
  import { LinuxTargetHelper } from "electron-builder/out/targets/LinuxTargetHelper"

  export default class AppImageTarget extends Target {
    private readonly packager
    private readonly helper
    readonly outDir: string
    private readonly options
    private readonly desktopEntry
    constructor(ignored: string, packager: LinuxPackager, helper: LinuxTargetHelper, outDir: string)
    build(appOutDir: string, arch: Arch): Promise<any>
  }
}

declare module "electron-builder/out/targets/fpm" {
  import { Arch, Target } from "electron-builder-core"
  import { LinuxPackager } from "electron-builder/out/linuxPackager"
  import { LinuxTargetHelper } from "electron-builder/out/targets/LinuxTargetHelper"

  export default class FpmTarget extends Target {
    private readonly packager
    private readonly helper
    readonly outDir: string
    private readonly options
    private readonly scriptFiles
    constructor(name: string, packager: LinuxPackager, helper: LinuxTargetHelper, outDir: string)
    private createScripts()
    build(appOutDir: string, arch: Arch): Promise<any>
  }
}

declare module "electron-builder/out/targets/snap" {
  import { Arch, Target } from "electron-builder-core"
  import { LinuxPackager } from "electron-builder/out/linuxPackager"
  import { LinuxTargetHelper } from "electron-builder/out/targets/LinuxTargetHelper"

  export default class SnapTarget extends Target {
    private readonly packager
    private readonly helper
    readonly outDir: string
    private readonly options
    constructor(name: string, packager: LinuxPackager, helper: LinuxTargetHelper, outDir: string)
    build(appOutDir: string, arch: Arch): Promise<any>
  }
}

declare module "electron-builder/out/linuxPackager" {
  import { Platform, Target } from "electron-builder-core"
  import { LinuxBuildOptions } from "electron-builder/out/options/linuxOptions"
  import { BuildInfo } from "electron-builder/out/packagerApi"
  import { PlatformPackager } from "electron-builder/out/platformPackager"

  export class LinuxPackager extends PlatformPackager<LinuxBuildOptions> {
    readonly executableName: string
    constructor(info: BuildInfo)
    readonly defaultTarget: Array<string>
    createTargets(targets: Array<string>, mapper: (name: string, factory: (outDir: string) => Target) => void, cleanupTasks: Array<() => Promise<any>>): void
    readonly platform: Platform
    protected postInitApp(appOutDir: string): Promise<any>
  }
}

declare module "electron-builder/out/cli/cliOptions" {
  
  export function createYargs(): any
}

declare module "electron-builder/out/targets/WebInstaller" {
  import { WinPackager } from "electron-builder/out/winPackager"
  import NsisTarget from "electron-builder/out/targets/nsis"

  export default class WebInstallerTarget extends NsisTarget {
    constructor(packager: WinPackager, outDir: string, targetName: string)
    protected readonly isWebInstaller: boolean
    protected configureDefines(oneClick: boolean, defines: any): Promise<void>
    protected readonly installerFilenamePattern: string
    protected generateGitHubInstallerName(): string
  }
}

