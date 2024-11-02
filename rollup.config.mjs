import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';
import { visualizer } from 'rollup-plugin-visualizer';
import alias from '@rollup/plugin-alias';

const baseConfig = {
    input: 'src/main.ts',
    external: ['obsidian', 'electron'],
    plugins: [
        json(),
        replace({
            preventAssignment: true,
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        alias({
            entries: [
                {
                    find: 'react',
                    replacement: 'preact/compat',
                },
                {
                    find: 'react-dom/test-utils',
                    replacement: 'preact/test-utils',
                },
                {
                    find: 'react-dom',
                    replacement: 'preact/compat',
                },
                {
                    find: 'react/jsx-runtime',
                    replacement: 'preact/jsx-runtime',
                },
            ],
        }),
        nodeResolve({
            preferBuiltins: true,
            extensions: ['.js', '.ts'],
            browser: true,
        }),
        commonjs({
            include: 'node_modules/**',
        }),
        typescript(),
    ],
};

const developmentConfig = {
    ...baseConfig,
    output: {
        dir: 'test-vault/.obsidian/plugins/Diagram Zoom Drag',
        sourcemap: false,
        format: 'cjs',
        exports: 'auto',
    },
    plugins: [
        ...baseConfig.plugins,
        copy({
            targets: [
                {
                    src: './styles.css',
                    dest: 'test-vault/.obsidian/plugins/Diagram Zoom Drag/',
                },
                {
                    src: './manifest.json',
                    dest: 'test-vault/.obsidian/plugins/Diagram Zoom Drag/',
                },
                {
                    src: './.hotreload',
                    dest: 'test-vault/.obsidian/plugins/Diagram Zoom Drag/',
                },
            ],
        }),
    ],
};

const productionConfig = {
    ...baseConfig,
    output: {
        dir: 'dist',
        sourcemap: false,
        sourcemapExcludeSources: true,
        format: 'cjs',
        exports: 'auto',
    },
    plugins: [
        ...baseConfig.plugins,
        copy({
            targets: [
                { src: './styles.css', dest: 'dist/' },
                { src: './manifest.json', dest: 'dist/' },
            ],
        }),
        terser({
            compress: true,
            mangle: true,
        }),
        visualizer({
            open: false,
            filename: 'bundle-analysis.html',
        }),
    ],
};

const config =
    process.env.PRODUCTION === '1' ? productionConfig : developmentConfig;
export default config;
