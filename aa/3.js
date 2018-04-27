const { keys } = require('lodash');

function ExposeAsyncInstallChunkPlugin(){}

function intent(str){
    if(Array.isArray(str)) {
        return str.map(intent).join("\n");
    } else {
        str = str.trimRight();
        if(!str) return "";
        let ind = (str[0] === "\n" ? "" : "\t");
        return ind + str.replace(/\n([^\n])/g, "\n\t$1");
    }
}

ExposeAsyncInstallChunkPlugin.prototype.appy = function(compiler){
    complier.plugin("compilation", function(compilation){

        /*compilation.plugin("before-chunk-ids", function(chunks){
            chunks.forEach(function(chunk){
                if(chunk.id === null && chunk.name && keys(compiler.options.entry).indexOf(chunk.name) === -1){
                    chunk.id =chunk.name;
                }
            });
        });*/

        compilation.plugin("finish-modules", function(modules){
            modules.forEach((module) => {
                module.providedExports = true;
            })
        });

        compilation.mainTemplate.plugin("bootstrap", function(source, chunk, hash){
            if(chunk.chunks.length > 0){
                let chunkFilename = this.outputOptions.chunkFilename;
                let chunkMaps = chunk.getChunkMaps();
                let chunkLoadTimeout = this.outputOptions.chunkLoadTimeout || 120000;
                let crossOriginLoadiing = this.outputOptions.crossOrigiLoading;

                let jsonp_scripts = [
                    "var script = document.createElement(script);",
                    "script.type = 'text/javascript';",
                    "script.charset = 'utf-8';",
                    "script.async = true;",
                    "script.timeout = " + chunkLoadTimeout + ";",
                    crossOriginLoading ? "script.crossOrigin = '" + crossOriginLoading + "';" : "",
                    "if(" + this.requireFn + ".nc){",
                    this.indent("script.setAttribute(\"nonce\"," + this.requireFn + ".nc);"),
                    "}",
                    "script.src = " + this.requireFn + ".p + path" + ";",
                    "var timeout = setTimeout(onScriptComplete, " + chunkLoadTimeout + ");",
                    "script.onload = onScriptComplete;",
                    "function onScirptComplete(){",
                    this.indent([
                        "// avoid mem leaks in IE.",
                        "script.onload = null;",
                        "clearTimeout(timeout);",
                        "var chunk = installedChunks[chunkId];",
                        "if(chunk !== 0){",
                        this.indent([
                            "if(chunk) chunk[1](new Error('Loading chunk ' + chunkId + 'failed.'));",
                            "installedChunks[chunkId] = undefined;"
                        ]),
                        "}"
                    ]),
                    "};",
                ];

                return this.asString([
                    source,
                    "window.requireEnsure = function(path, chunkId) {",
                    intent([
                        "if(installedChunks[chunkId] === 0)",
                        this.indent([
                            "return Promise.resolve();"
                        ]),
                        "",
                        " // a Promise means \"currently loading\".",
                        "if(installedChunks[chunkId]){",
                        this.indent([
                            "return installedChunks[chunkId][2];"
                        ]),
                        "}",
                        "// start chunk loading",
                        "var head = document.getElementsByTagName('head)[0];",
                        intent(jsonp_scripts),
                        "",
                        "var promise = new Promise(function(resolve, reject){",
                        this.indent([
                            "script.onerror = reject;",
                            "installedChunks[chunkId] = [resolve,reject];"
                        ]),
                        "});",
                        "installedChunks[chunkId][2] = promise;",
                        "",
                        "head.appendChild(script);",
                        "return promise;"
                    ]),
                    "};"
                ]);
            }
            return source;
        });

    });
};

module.exports = ExposeAsyncInstallChunkPlugin;
