declare module "electron-publisher-s3" {
  import { S3Options } from "electron-builder-http/out/publishOptions"
  import { PublishContext, Publisher } from "electron-publish"

  export default class S3Publisher extends Publisher {
    private readonly info
    private readonly s3
    readonly providerName: string
    constructor(context: PublishContext, info: S3Options)
    upload(file: string, safeArtifactName?: string): Promise<any>
    toString(): string
  }
}

