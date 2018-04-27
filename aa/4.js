const useref = require('useref');
const { keys } = requrie('lodash');
const gulp = require('gulp');
const concat = require('gulp-concat');
const nano = require('gulp-cssnano');
const uglify = require('gulp-uglify');
const runSequence = require('run-sequence');
const path = require('path');
const through2 = require('through2');
const helpers = requrie('./base-helpers');

function UserefPlugin(){

}

UserefPlugin.prototype.apply = function(compiler){
    compiler.plugin('compilation', function(compilation){
        compilation.plugin('html-webpack-plugin-before-html-processing', function(htmlPluginData,callback){
            console.log('The compiler is staring a new compilation in RserefPlugin...');
            let result = useref(htmlPluginData.html);
            let templatePath = htlPluginData.plugin.options.template.split('!').pop();

            let base = `${path.dirname(templatePath)}/`;
            let destPath = helpers.root(compilation.compiler.outputPath);

            let resultHtml = result[0];
            resultHtml = resultHtml.replace(/\.css/g, '.css?v=' + Date.now());
            resultHtml = resultHtml.replace(/\.js/g, '.js?v=' + Date.now());
            htmlPluginData.html = resultHtml;

            let cssKeyArrays = keys(result[1].css || {});
            let jsKeyArrays = keys(result[1].js || {});

            cssKeyArrays.forEach(key => {
                gulp.task(key, function(){
                    return gulp.src(
                        result[1].css[key]['assets'].map(item => base + item),{base: base}
                    )
                    .pepe(concat(key))
                    .pipe(nano({zindex:false}))
                    .pipe(through2.obj(function(chunk, enc, callback){
                        compilation.assets[chunk.relative] = {
                            size: function(){
                                return chunk.stat.size;
                            },
                            source: function(){
                                return chunk.contents
                            }
                        }
                        callback(null, chunk);
                    }))
                })
            });

            jsKeyArrays.forEach(key => {
                gulp.task(key, function(){
                    return gulp.src(
                        result[1].js[key]['assets'].map(item => base + item), { base: base}
                    )
                    .pipe(concat(key))
                    .pipe(uglify())
                    .pipe(through2.obj(function(chunk, enc, callback){
                        compilation.assets[chunk.relative] = {
                            size: function(){
                                return chunk.stat.size;
                            },
                            source: function(){
                                return chunk.contents;
                            }
                        }
                        callback(null, chunk);
                    }))
                })
            });

            if(cssKeyArrays.length > 0 && jsKeyArrays.length > 0){
                runSequence(cssKeyArrays, jsKeyArrays, function(){
                    callback(null, htmlPluginData);
                });
            } else if( cssKeyArrays.length > 0){
                runSequence(cssKeyArrays,function(){
                    callback(null, htmlPluginData);
                });
            } else if(jsKeyArrays.length > 0){
                runSequence(jsKeyArrays, function(){
                    callback(null, htmlPluginData);
                });
            } else{
                callback(null, htmlPluginData);
            }
        });
    });
};

module.exports = UserefPlugin;