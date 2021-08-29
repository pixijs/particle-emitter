declare namespace async {
    function eachSeries(array: any[], iterator: (...params: any[]) => any, callback: (...params: any[]) => any, deferNext?: boolean): void;
    function queue(worker: (...params: any[]) => any, concurrency: number): any;
}

declare function encodeBinary(input: string): string;

declare class Loader {
    constructor(baseUrl?: string, concurrency?: number);
    static Resource: typeof Resource;
    static async: typeof async;
    static encodeBinary: typeof encodeBinary;
    static base64: typeof encodeBinary;
    baseUrl: string;
    progress: number;
    loading: boolean;
    defaultQueryString: string;
    resources: {
        [key: string]: Resource;
    };
    onProgress: Signal;
    onError: Signal;
    onLoad: Signal;
    onStart: Signal;
    onComplete: Signal;
    add(name?: string | IAddOptions, url?: string, options?: IAddOptions, cb?: Loader.OnCompleteSignal): this;
    pre(fn: (...params: any[]) => any): this;
    use(fn: (...params: any[]) => any): this;
    reset(): this;
    load(cb?: (...params: any[]) => any): this;
    concurrency: number;
    static pre(fn: (...params: any[]) => any): Loader;
    static use(fn: (...params: any[]) => any): Loader;
}

declare module Loader {
    type OnProgressSignal = (loader: Loader, resource: Resource) => void;
    type OnErrorSignal = (loader: Loader, resource: Resource) => void;
    type OnLoadSignal = (loader: Loader, resource: Resource) => void;
    type OnStartSignal = (loader: Loader) => void;
    type OnCompleteSignal = (loader: Loader) => void;
}

declare type IAddOptions = {
    name?: string;
    key?: string;
    url?: string;
    crossOrigin?: string | boolean;
    timeout?: number;
    loadType?: Resource.LOAD_TYPE;
    xhrType?: Resource.XHR_RESPONSE_TYPE;
    onComplete?: Loader.OnCompleteSignal;
    callback?: Loader.OnCompleteSignal;
    metadata?: Resource.IMetadata;
};

declare class Resource {
    constructor(name: string, url: string | string[], options?: {
        crossOrigin?: string | boolean;
        timeout?: number;
        loadType?: Resource.LOAD_TYPE;
        xhrType?: Resource.XHR_RESPONSE_TYPE;
        metadata?: Resource.IMetadata;
    });
    static setExtensionLoadType(extname: string, loadType: Resource.LOAD_TYPE): void;
    static setExtensionXhrType(extname: string, xhrType: Resource.XHR_RESPONSE_TYPE): void;
    readonly name: string;
    readonly url: string;
    readonly extension: string;
    data: any;
    crossOrigin: string;
    timeout: number;
    loadType: Resource.LOAD_TYPE;
    xhrType: string;
    metadata: Resource.IMetadata;
    readonly error: Error;
    readonly xhr: XMLHttpRequest;
    readonly children: Resource[];
    readonly type: Resource.TYPE;
    readonly progressChunk: number;
    onStart: Signal;
    onProgress: Signal;
    onComplete: Signal;
    onAfterMiddleware: Signal;
    readonly isDataUrl: boolean;
    readonly isComplete: boolean;
    readonly isLoading: boolean;
    complete(): void;
    abort(message: string): void;
    load(cb?: Resource.OnCompleteSignal): void;
}

declare module Resource {
    type OnStartSignal = (resource: Resource) => void;
    type OnProgressSignal = (resource: Resource, percentage: number) => void;
    type OnCompleteSignal = (resource: Resource) => void;
    type IMetadata = {
        loadElement?: HTMLImageElement | HTMLAudioElement | HTMLVideoElement;
        skipSource?: boolean;
        mimeType?: string | string[];
    };
    enum STATUS_FLAGS {
        NONE,
        DATA_URL,
        COMPLETE,
        LOADING
    }
    enum TYPE {
        UNKNOWN,
        JSON,
        XML,
        IMAGE,
        AUDIO,
        VIDEO,
        TEXT
    }
    enum LOAD_TYPE {
        XHR,
        IMAGE,
        AUDIO,
        VIDEO
    }
    enum XHR_RESPONSE_TYPE {
        DEFAULT,
        BUFFER,
        BLOB,
        DOCUMENT,
        JSON,
        TEXT
    }
}

