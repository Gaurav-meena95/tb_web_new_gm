type PinturaStoreField = [string, string] | [string, Blob | File, string];

type ProgressCallback = (e: ProgressEvent) => void;

interface LocaleCollection {
    [shapeProperty: string]: string;
}

interface PinturaUtilPlugin {
    util: [string, any];
}

export interface PinturaDefaultVideoWriterOptions {
    encoder: (videoWriterOptions?: PinturaDefaultVideoWriterOptions) => unknown[];
    store?:
        | string
        | {
              url: string;
              dataset?: (imageState: any) => PinturaStoreField[];
              credentials?: string;
              headers?: { [key: string]: string };
          }
        | ((imageState: any, options: any, onprogress: ProgressCallback) => Promise<any>);
    filter?: (src: File, imageState: any) => boolean;
    outputProps?: string[];
    targetSize?: {
        width?: number;
        height?: number;
        fit?: 'contain' | 'cover' | 'force';
        upscale?: boolean;
    };
}

export interface PinturaMuxerEncoderOptions {
    muxer: any;
    mimeType: 'video/webm' | 'video/mp4';
    imageStateToCanvas: any;
    framesPerSecond?: number;
    videoBitrate?: number;
    audioBitrate?: number;
    audioSampleRate?: number;
    log?: boolean;
}

export interface PinturaMediaStreamEncoderOptions {
    imageStateToCanvas: any;
    framesPerSecond?: number;
    audioBitrate?: number;
    videoBitrate?: number;
    mimeType?: string;
    mimeTypes?: string[];
    log?: boolean;
}

export interface PinturaFFMpegEncoderOptions {
    imageStateToCanvas: any;
    scriptPath: string;
    corePath: string;
    framesPerSecond?: number;
    audioBitrate?: string | number;
    videoBitrate?: string | number;
    log?: boolean;
}

export const plugin_trim: PinturaUtilPlugin;
export const plugin_trim_locale_en_gb: LocaleCollection;

export const createDefaultVideoWriter: (
    options?: PinturaDefaultVideoWriterOptions
) => (src: File, imageState: any, genericOptions?: any) => unknown[] | undefined;

export const createFFmpegEncoder: (
    options?: PinturaFFMpegEncoderOptions
) => (videoWriterOptions?: PinturaDefaultVideoWriterOptions) => any;

export const createMediaStreamEncoder: (
    options?: PinturaMediaStreamEncoderOptions
) => (options?: PinturaDefaultVideoWriterOptions) => any;

export const createMuxerEncoder: (
    options?: PinturaMuxerEncoderOptions
) => (options?: PinturaDefaultVideoWriterOptions) => any;
