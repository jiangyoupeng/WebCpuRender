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
let testShaderSourceNum = 0
// let testShaderBegin: number = 62
let testShaderBegin: number = 0
let testShaderEnd: number = 1000

function testTmpFunc() {
    // if (testShaderSourceNum == 1) {
    //     shaderSource = `#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 37
    // #define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 53
    // #define CC_RECEIVE_SHADOW 0
    // #define CC_USE_IBL 0
    // #define USE_LIGHTMAP 0
    // #define USE_BATCHING 0
    // #define CC_FORWARD_ADD 0
    // #define CC_USE_HDR 0
    // #define CC_PIPELINE_TYPE 0
    // #define CC_USE_FOG 0
    // precision highp float;
    // struct StandardVertInput {
    // float asd;
    // highp vec4 position;
    // vec3 normal;
    // vec4 tangent;
    // vec4 testasdf[4][4];
    // vec4 mat45[4][4];
    // };
    // attribute vec3 a_position;
    // attribute vec3 a_normal;
    // attribute vec2 a_texCoord;
    // attribute vec4 a_tangent;
    // uniform highp vec4 cc_cameraPos;
    // varying vec2 v_uv;
    // void test1Func(float asvdsx, inout float asv, in float qwes, out float qwescxs){
    // }
    // void test2Func(in float asv){
    // }
    // void test3Func(out float asv){
    // }
    // void test4Func(float asv){
    // }
    // void main () {
    // vec4 forFragTest[4];
    // forFragTest[0].xyz = vec3(2);
    // forFragTest[0] = vec4(1);
    // mat4 testMat4asd;
    // testMat4asd[0][0] = 1.;
    // StandardVertInput sasd;
    // mat4 eqwsd[4];
    // eqwsd[0][0][0] = 1.;
    // vec4 color;
    // color.xyz = vec3();
    // test1Func((color.x + color.y + color.z + color).z , color.y, color.z, color.w);
    // float lumaB;
    // color.x = color.y = color.z = lumaB;
    // float lumaMin;
    // float lumaMax;
    // // if ((lumaB < lumaMin) || (lumaB > lumaMax)){
    // //     color = vec4(2);
    // // }else{
    // //     color = vec4(2);
    // // }
    // if ((lumaB < lumaMin) || (lumaB > lumaMax))
    //     color = vec4(2);
    // else if (lumaB < lumaMin)
    //     color = vec4(2);
    // else if (lumaB > lumaMax)
    //     color = vec4(2);
    // else
    //     color = vec4(2);
    // bool tqweqwe = false;
    // if (tqweqwe){}
    // float a;
    // if (a > 0.9){
    // }else if(a > 0.8){
    // }else if(a > 0.7){
    // }else{
    // }
    // tqweqwe = a > 0.;
    // for (int i = 1; (i < 3); i++) {
    //     int tes = 3;
    // }
    // mat3 matrix3 = mat3(1.,1.,1.,1.,1.,1.,0.1,0.2,0.3);
    // mat4 matrix4 = mat4(matrix3);
    // matrix4[0][0] = 0.;
    // vec4 matrix4Test = matrix4[0];
    // // matrix4Test.x = 0.;
    // // matrix4Test.y = 0.;
    // // matrix4Test.z = 0.;
    // // matrix4Test.w = 1.;
    // matrix4[0] = matrix4Test;
    // matrix4[0][1] = 0.;
    // matrix4[0][2] = 0.;
    // vec3 I = vec3(1,0,0);
    // I[2] = 3.;
    // I[2] *= 3.;
    // I.x *= 3;
    // a++;
    // a--;
    // ++a;
    // --a;
    // float gg =3., bb, tt = 1;
    // float b;
    // float c;
    // float wwww, www = a, zzz = b = c = 1. + gg + I.x;
    // float fDeltaD, fDeltaY, fDensityIntegral, fDensity;
    // fDensity = (sqrt(1.0 + ((fDeltaD / fDeltaY) * (fDeltaD / fDeltaY)))) * fDensityIntegral;
    // I = -I;
    // StandardVertInput s;
    // v_uv.x = 2. * vec2(s.tangent.xy + 1.).x;
    // I += 3.;
    // I += I.zyx;
    // I -= I.zyx;
    // I -= 3.;
    // I *= 1.;
    // I /= 1.;
    // a = a + b * c;
    // a = (a + b) * c;
    // vec3 N = vec3(0.5,0.5,0.5);
    // // vec2 yx = vec2(I.xy + (c + (a + b * c * (a + b) * c) * b + I.x + dot(I, N)));
    // // v_uv.x = 2. + vec2(I.xy + (c + (a + b * c * (a + b) * c) * b + I.x + dot(I, N))).x;
    // s.tangent.xy = vec2();
    // a = (s.tangent.x + b) * s.tangent.z;
    // if ((v_uv.x != a * b) ){
    //   vec2 v_uv;
    //   v_uv = vec2(1,1);
    // }else{
    //   vec2 v_uv;
    //   v_uv = vec2(0,0);
    // }
    // vec2 stepTest = step(v_uv, v_uv);
    // vec4 position;
    // position = vec4(a_position, 1.0);
    // position.xy = cc_cameraPos.w == 0.0 ? vec2(position.xy.x, -position.xy.y) : position.xy;
    // gl_Position = vec4(position.x, position.y, 1.0, 1.0);
    // v_uv = a_texCoord;
    // if (v_uv.x < 0.5){
    //   vec2 v_uv;
    //   v_uv = vec2(1,1);
    // }else{
    //   vec2 v_uv;
    //   v_uv = vec2(0,0);
    // }
    // v_uv.x = 1.;
    // }`
    // }
}

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

        if (count === 0 && funcKey == "drawElements") {
            count++
        }

        if (count > 0) {
            console.log(count + " " + funcKey + " =>")
            console.log(info)
            count++
        }
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

                if (funcKey == "clear") {
                    console.log(gl.getParameter(gl.COLOR_CLEAR_VALUE))
                }

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
                        } else if (funcKey === "drawElements" && compilerTsFiles.size > 0) {
                            // 直接判断输出drawElements之前的转译脚本
                            var zip = new win.JSZip()
                            let readonlyStr = ""
                            let importStr = ""
                            compilerTsFiles.forEach((value: string, key: string) => {
                                zip.file(`Impl_${key}.ts`, value)
                                readonlyStr += `    static readonly Impl_${key} = Impl_${key}\n`
                                importStr += `import { Impl_${key} } from "./Impl_${key}"\n`
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
                    } else if (replaceShaderSource) {
                        if (funcKey == "shaderSource") {
                            let shaderSource: string = info[1]
                            let hash = SparkMD5.hash(shaderSource)

                            let replaceScript = glslShaderHackScript.get(hash)
                            if (replaceScript && replaceScript !== "") {
                                console.log("old shaderSource:")
                                console.log(shaderSource)
                                // 使用替换的glsl代码
                                info[1] = shaderSource
                            }
                        }
                    }
                    applyReturn = func.apply(gl, info)
                }
                return applyReturn
            }
        }
    }
}
