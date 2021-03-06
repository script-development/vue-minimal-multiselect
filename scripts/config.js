import {nodeResolve} from '@rollup/plugin-node-resolve';

export default [
    {
        input: 'src/index.js',
        output: {
            file: 'dist/index.esm.js',
            format: 'esm',
        },
        plugins: [nodeResolve()],
    },
    {
        input: 'src/index.js',
        output: {
            file: 'dist/index.js',
            format: 'cjs',
            // name: "SerVue",
        },
        plugins: [nodeResolve()],
    },
];
