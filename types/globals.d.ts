declare global {
var BUNDLE_START_TIME: number | undefined;
var HermesInternal: {
getInstrumentedStats?: () => Record<string, number>;
getRuntimeProperties?: () => Record<string, string>;
} | undefined;
}
export {};