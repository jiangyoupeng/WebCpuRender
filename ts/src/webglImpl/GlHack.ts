import { has } from "lodash"
import { fileSaveAs } from "../FileSaver"
import { GLSLInterpreter } from "../glslCompiler/GLSLInterpreter"
import { cpuRenderingContext } from "./CpuRenderingContext"
import { glslShaderHackScript } from "./GlslShaderHackScript"
let SparkMD5 = require("Spark-md5")
enum GlDebugMode {
    none,
    debugCpuRender,
    createTsImplGlslFile,
    replaceShaderSource,
}

let win: any = window
let showGlDebugLog = win.showGlDebugLog || false
let debugCpuRender = win.glDebugMode == GlDebugMode.debugCpuRender
let createTsImplGlslFile = win.glDebugMode == GlDebugMode.createTsImplGlslFile
let replaceShaderSource = win.glDebugMode == GlDebugMode.replaceShaderSource

let compilerTsFiles: Map<string, string> = new Map()
let compilerFactGlslFiles: Map<string, string> = new Map()
let testShaderSourceNum = 0
// let testShaderBegin: number = 62
let testShaderBegin: number = 0
let testShaderEnd: number = 1000

function GlDebugLog(funcKey: string, info: any) {
    if (showGlDebugLog) {
        // 测试走自己的内部实现gl接口
        // if (funcKey == "bindBuffer") {
        //     console.log(count + " bindBuffer => ")
        //     console.log(info)
        //     count++
        // }
        // if (funcKey == "bufferData") {
        //     console.log(count + " bufferData =>")
        //     console.log(info)
        //     count++
        // }
        // if (funcKey == "bufferSubData") {
        //     console.log(count + " bufferSubData =>")
        //     console.log(info)
        //     count++
        // }
        // if (funcKey == "drawElements") {
        //     console.log(count + " drawElements =>")
        //     console.log(info)
        //     count++
        // }
        // if (funcKey == "clearColor") {
        //     console.log(count + " clearColor =>")
        //     console.log(info)
        //     count++
        // }
        // if (funcKey == "clear") {
        //     console.log(count + " clear =>")
        //     console.log(info)
        //     count++
        // }
        // if (count === 0 && funcKey == "drawElements") {
        //     count++
        // }
        // if (count > 0) {
        //     console.log(count + " " + funcKey + " =>")
        //     console.log(info)
        //     count++
        // }
    }
}

let glCallCount = 0
let count = 0
export function replaceWebglFunc(gl: any) {
    if (win.glDebugMode == GlDebugMode.none && !win.showGlDebugLog) {
        return
    }
    let noFuncs: Set<string> = new Set()
    for (let key in gl) {
        let funcKey: any = key
        if (typeof gl[funcKey] == "function") {
            let func: Function = gl[funcKey]
            gl[funcKey] = (...info: any) => {
                let applyReturn: any

                if (glCallCount === 0) {
                    cpuRenderingContext.customGlInitBeforeCall()
                }
                glCallCount++
                GlDebugLog(funcKey, info)

                // 对于getextension的方法没有实现 所以同一返回空
                if (funcKey == "getExtension") {
                    return null
                } else if (funcKey == "getSupportedExtensions") {
                    return []
                }

                // if (funcKey == "clear") {
                //     console.log(gl.getParameter(gl.COLOR_CLEAR_VALUE))
                // }

                if (debugCpuRender) {
                    if (funcKey == "getParameter") {
                        return func.apply(gl, info)
                    }

                    let cpuFunc: Function = (<any>cpuRenderingContext)[funcKey]
                    if (!cpuFunc && !noFuncs.has(funcKey)) {
                        noFuncs.add(funcKey)
                        console.error("no funcKey " + funcKey)
                        debugger
                    }
                    applyReturn = cpuFunc.apply(cpuRenderingContext, info)
                } else {
                    if (createTsImplGlslFile) {
                        if (funcKey == "shaderSource") {
                            testShaderSourceNum++
                            if (testShaderSourceNum >= testShaderBegin && testShaderSourceNum <= testShaderEnd) {
                                // console.log("shaderSource:" + info)
                                let shaderSource: string = info[1]

                                console.log(testShaderSourceNum)
                                let interpreterData = GLSLInterpreter.interpreter(shaderSource)
                                compilerTsFiles.set(interpreterData[0], interpreterData[1])
                            }
                        } else if (funcKey === "drawElements" || funcKey === "drawArrays") {
                            if (compilerTsFiles.size > 0) {
                                // 直接判断输出drawElements之前的转译脚本
                                var zip = new win.JSZip()
                                let readonlyStr = ""
                                let importStr = ""
                                compilerTsFiles.forEach((value: string, key: string) => {
                                    zip.file(`Impl_${key}.ts`, value)
                                    readonlyStr += `    static readonly Impl_${key} = Impl_${key}\n`
                                    readonlyStr += `    static readonly glsl_${key} = glsl_${key}\n`
                                    importStr += `import { glsl_${key}, Impl_${key} } from "./Impl_${key}"\n`
                                })

                                let ShaderManagerStr = importStr + `export class ShaderManager {\n` + readonlyStr
                                ShaderManagerStr += `    static getConstruct(source: string) {\n`
                                ShaderManagerStr += `        return (<any>this)[source]\n`
                                ShaderManagerStr += `    }\n`
                                ShaderManagerStr += "}\n"
                                zip.file(`ShaderManager.ts`, ShaderManagerStr)

                                zip.generateAsync({ type: "blob" }).then((content: any) => {
                                    fileSaveAs(content, `tsScript.zip`)
                                })
                                compilerTsFiles.clear()
                            }
                        }
                    } else if (replaceShaderSource) {
                        if (funcKey == "shaderSource") {
                            let shaderSource: string = info[1]
                            let hash = SparkMD5.hash(shaderSource)

                            let replaceScript = glslShaderHackScript.get(hash)
                            if (replaceScript && replaceScript !== "") {
                                console.log("replace hash: " + hash)
                                console.log("old shaderSource:")
                                console.log(shaderSource)
                                // 使用替换的glsl代码
                                info[1] = replaceScript
                            }
                        }
                        //  else if (
                        //     funcKey == "bindFramebuffer" ||
                        //     funcKey == "bindRenderbuffer" ||
                        //     funcKey == "renderbufferStorage" ||
                        //     funcKey == "framebufferRenderbuffer" ||
                        //     funcKey == "framebufferTexture2D"
                        // ) {
                        //     return
                        // }
                    }
                    applyReturn = func.apply(gl, info)
                }
                return applyReturn
            }
        }
    }
}
