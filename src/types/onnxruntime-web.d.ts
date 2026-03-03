declare module 'onnxruntime-web' {
  export const env: {
    wasm: {
      wasmPaths: string;
      numThreads: number;
      proxy: boolean;
    };
  };

  export class Tensor {
    constructor(type: string, data: Float32Array | Uint8Array, dims: number[]);
    readonly type: string;
    readonly data: Float32Array | Uint8Array;
    readonly dims: readonly number[];
  }

  export interface RunOptions {
    [key: string]: unknown;
  }

  export interface InferenceSessionCreateOptions {
    executionProviders?: string[];
  }

  export interface OnnxValueMapType {
    [name: string]: Tensor;
  }

  export interface InferenceSession {
    run(feeds: Record<string, Tensor>, options?: RunOptions): Promise<OnnxValueMapType>;
    release(): void;
    readonly inputNames: readonly string[];
    readonly outputNames: readonly string[];
  }

  export const InferenceSession: {
    create(
      model: ArrayBuffer | string | Uint8Array,
      options?: InferenceSessionCreateOptions,
    ): Promise<InferenceSession>;
  };
}
