import { process as p } from 'https://deno.land/std@0.114.0/node/process.ts';

type IProcess = typeof p;

// some weird process extended by a browser attribute
// injected by Used by @rollup/plugin-replace
interface IRollupReplaceProcess extends IProcess {
  browser?: boolean;
}

export const process: IRollupReplaceProcess = p;
