import { read } from "fs"
import { clamp } from "lodash"
import { GeometricOperations } from "./geometricOperations/GeometricOperations"
import { replaceWebglFunc } from "./GlHack"
import {
    CPUWebGLProgram,
    CPUWebGLShader,
    CPUShader,
    CPUShaderProgram,
    CPUWebGLBuffer,
    VBOBufferData,
    EBOBufferData,
    CPUWebGLUniformLocation,
    CPUVertexShader,
    CPUFragmentShader,
    CPUWebGLTexture,
    WebGLTextureData,
    CPUWebGLFramebuffer,
    WebGLFramebufferObject,
    TexelsData,
    CPUWebGLRenderbuffer,
    WebGLRenderbufferObject,
    TexBufferData,
} from "./PipelineData"
import { AttributeReadInfo, CachWriteData } from "./RenderModel"
import {
    Vec3Data,
    Vec4Data,
    Vec2Data,
    BuiltinDataCach,
    Mat3Data,
    Mat4Data,
    builtinCachData,
    IntData,
    FloatData,
    NumData,
    IVec4Data,
    IVec3Data,
    IVec2Data,
    clearShaderCachData,
    Sampler2D,
} from "./shader/builtin/BuiltinData"
import { custom_isDiscard, gl_FragColor, gl_FragData, gl_Position } from "./shader/builtin/BuiltinVar"
import { Rect } from "./shader/builtin/Rect"
import { FragShaderHandle, UniformData, VaryingData } from "./ShaderDefine"

let abs = Math.abs
let max = Math.max
let cpuCachData = new BuiltinDataCach()
let renderVertxPipeCachData = new BuiltinDataCach()
let renderFragPipeCachData = new BuiltinDataCach()
function renderError(message?: any, ...optionalParams: any[]) {
    debugger
    console.error(message, ...optionalParams)
}
// 一个三角形一个三角形渲染
const oneTriRender = false

let calculateUseShaderHash: Map<string, string> = new Map()
let globalShaderIndex = 1
let globalProgramIndex = 1
let globalBufferIndex = 1
let globalTextureIndex = 1
let globalFramebufferIndex = 1
let globalRenderbufferIndex = 1

let vec4Data = builtinCachData.vec4Data
// 预缓存的图片使用数据
class PreCachTexUseData {
    texBufferData: TexBufferData = null!
    bufferData: Uint8Array = null!

    wrapS: number = 0
    wrapT: number = 0
    magFilter: number = 0
    minFilter: number = 0
}

class PreCachShaderUseData {
    // 预存2维使用的图 对应纹理单元使用的图
    texel2dMipmapData: Map<number, PreCachTexUseData> = new Map()
}

// 用cpu实现的webgl 1接口
export class CpuRenderingContext {
    constructor() {
        let win: any = window

        if (!win.gameCanvas) {
            console.error("没有指明gameCanvars")
            return
        }

        let canvas = <HTMLCanvasElement>document.getElementById(win.gameCanvas)
        let gl: WebGLRenderingContext = canvas.getContext("webgl")!
        this._gameCanvas = canvas
        this._gameGl = gl
        /**默认裁剪背面 */
        this._nowCullFaceType = this._gameGl.BACK
        this._nowFrontType = this._gameGl.CCW

        let maxUnit = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS)
        for (let i = 0; i < maxUnit; i++) {
            this._textureUnit.set(i, new Map())
        }

        this._cubeTexIndex.set(this._gameGl.TEXTURE_CUBE_MAP_POSITIVE_X, 0)
        this._cubeTexIndex.set(this._gameGl.TEXTURE_CUBE_MAP_NEGATIVE_X, 1)
        this._cubeTexIndex.set(this._gameGl.TEXTURE_CUBE_MAP_POSITIVE_Y, 2)
        this._cubeTexIndex.set(this._gameGl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 3)
        this._cubeTexIndex.set(this._gameGl.TEXTURE_CUBE_MAP_POSITIVE_Z, 4)
        this._cubeTexIndex.set(this._gameGl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 5)

        this._rgbSrcBlendFunc = this._gameGl.ONE
        this._alphaSrcBlendFunc = this._gameGl.ONE
        this._rgbDestBlendFunc = this._gameGl.ZERO
        this._alphaDestBlendFunc = this._gameGl.ZERO

        this._rgbComputerBlendFunc = this._gameGl.FUNC_ADD
        this._alphaComputerBlendFunc = this._gameGl.FUNC_ADD
        this._depthJudgeFunc = this._gameGl.LESS

        let maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS)
        this._parameter.set(gl.MAX_VERTEX_ATTRIBS, maxVertexAttribs)
        /**默认是不生效的 */
        this._attributeLocalEnable.length = maxVertexAttribs
        this._attributeLocalEnable.fill(false)

        this._systemFrameBuffer = new WebGLFramebufferObject(new CPUWebGLFramebuffer(0))
        this._systemFrameBuffer.colorAttachPoint = new WebGLRenderbufferObject(new CPUWebGLRenderbuffer(0))
        this._systemFrameBuffer.depthAttachPoint = new WebGLRenderbufferObject(new CPUWebGLRenderbuffer(0))
        this._systemFrameBuffer.stencilAttachPoint = new WebGLRenderbufferObject(new CPUWebGLRenderbuffer(0))

        replaceWebglFunc(gl)
    }

    private _canvars2D: CanvasRenderingContext2D = null!

    /**视窗 */
    private _viewSp: HTMLCanvasElement = null!
    /**缓存的实际RenderingContext */
    private _gameGl: WebGLRenderingContext = null!

    // 实际游戏使用的canvas
    private _gameCanvas: HTMLCanvasElement = null!

    get cachGameGl() {
        return this._gameGl
    }

    // 实际显示canvas的大小
    private _canvasSize: Vec2Data = null!
    /**当前设定视窗的大小 */
    private _viewPort: Rect = null!
    /**帧数据 */
    /**大小是实际显示的大小 */
    // private _frameBuffer: Uint8ClampedArray = null!
    /**深度数据 */
    // private _depthBuffer: number[] = null!

    // 系统内置使用的framebuffer
    private _systemFrameBuffer: WebGLFramebufferObject = null!

    /*红色通道是否可以写 */
    private _colorRWriteEnable: boolean = true
    /*绿色通道是否可以写 */
    private _colorGWriteEnable: boolean = true
    /*蓝色通道是否可以写 */
    private _colorBWriteEnable: boolean = true
    /*透明通道是否可以写 */
    private _colorAWriteEnable: boolean = true

    /**背景色 清空时会用改颜色清理屏幕 */
    private _backgroundColor: Vec4Data = new Vec4Data(0, 0, 0, 0)

    /**默认的深度 */
    private _defaultDepth: number = Number.MAX_SAFE_INTEGER

    /**深度是否可以写入 */
    private _depthWriteEnable: boolean = true

    /**深度测试方法 */
    private _depthJudgeFunc: number = 0

    /**对应的shader脚本缓存 */
    private _webglShaderMap: Map<GLint, CPUShader> = new Map()

    /**对应的shaderProgram脚本缓存 */
    private _webGLProgramMap: Map<GLint, CPUShaderProgram> = new Map()

    /**当前使用的着色程序 */
    private _useProgram: CPUShaderProgram = null!

    /**绑定在顶点target上的buffer数据 */
    private _vboBufferDataMap: Map<GLint, VBOBufferData> = new Map()
    /**绑定在索引target上的buffer数据 */
    private _eboBufferDataMap: Map<GLint, EBOBufferData> = new Map()

    /**当前使用的vbo 数据 */
    private _useVboBufferData: VBOBufferData | null = null
    /**当前使用的ebo 数据 */
    private _useEboBufferData: EBOBufferData | null = null

    /**
     * 按照自己的理解 attribute属性是全局的
     * 属性是否生效
     * */
    private _attributeLocalEnable: boolean[] = []
    private _attributeReadInfo: Map<GLuint, AttributeReadInfo> = new Map()

    /**当前正面的类型(顺时针还是逆时针) */
    private _nowFrontType: number = 0

    /**裁剪面的类型 */
    private _nowCullFaceType: number = 0

    /**开启裁剪正面或背面功能 */
    private _openCullFace: boolean = false

    /**开启深度测试 */
    private _openDepthTest: boolean = false

    /**开启Scissor测试 */
    private _openScissorTest: boolean = false

    /**纹理从cpu到gpu的对齐准则 */
    private _pixelPackNum: number = 4
    /**纹理从gpu到cpu的对齐准则 */
    private _pixelUnPackNum: number = 4

    // 图片是否y翻转
    private _unpackFilpY: boolean = false

    /**gpu上的纹理数据map */
    private _textureDataMap: Map<number, WebGLTextureData> = new Map()
    /**纹理单元 至少保证8个纹理单元  0号纹理默认激活 */
    private _textureUnit: Map<number, Map<number, WebGLTextureData>> = new Map()
    /**当前激活的纹理 */
    private _nowActiveTextureUnit: number = 0

    /**cube对应面的下标索引 */
    private _cubeTexIndex: Map<number, number> = new Map()

    private _framebufferObjectMap: Map<number, WebGLFramebufferObject> = new Map()
    private _nowUseFramebufferObject: WebGLFramebufferObject | null = null!

    private _renderbufferObjectMap: Map<number, WebGLRenderbufferObject> = new Map()
    private _nowUseRenderbufferObject: WebGLRenderbufferObject | null = null!

    /**视窗大小 */
    private _scissorRect: Rect = null!

    private _zNear: GLclampf = 0
    private _zFar: GLclampf = 1

    private _blendFactorColor: Vec4Data = new Vec4Data()

    /*rgb 片元的混合方式 */
    private _rgbSrcBlendFunc: number = 0
    /*alpha 片元的混合方式 */
    private _alphaSrcBlendFunc: number = 0
    /*rgb 屏幕颜色的混合方式 */
    private _rgbDestBlendFunc: number = 0
    /*alpha 屏幕颜色的混合方式 */
    private _alphaDestBlendFunc: number = 0

    /*rgb运算的方式 */
    private _rgbComputerBlendFunc: number = 0
    /*alpha运算的方式 */
    private _alphaComputerBlendFunc: number = 0

    /**打开混合 */
    private _openBlend: boolean = false

    private _parameter: Map<number, number> = new Map()

    /**渲染时间 毫秒 */
    private _customRenderTime: number = -1
    set customRenderTime(value: number) {
        this._customRenderTime = value
    }

    // 预计算的shader需要使用到的数据
    private _preCachShaderUseData: PreCachShaderUseData = new PreCachShaderUseData()

    /**当前缓存的待渲染的数据 */
    private _cachWriteData: CachWriteData | null = null
    private _clearColorBuffer() {
        let r = this._backgroundColor.x
        let g = this._backgroundColor.y
        let b = this._backgroundColor.z
        let a = this._backgroundColor.w
        let val = 0x00000000
        if (this._colorRWriteEnable) {
            val = ((val & 0xffffff00) | r) >>> 0
        }
        if (this._colorGWriteEnable) {
            val = ((val & 0xffff00ff) | (g << 8)) >>> 0
        }
        if (this._colorBWriteEnable) {
            val = ((val & 0xff00ffff) | (b << 16)) >>> 0
        }
        if (this._colorAWriteEnable) {
            val = ((val & 0x00ffffff) | (a << 24)) >>> 0
        }
        // let writeFramebuffer = new Uint32Array(this._frameBuffer.buffer, this._frameBuffer.byteOffset, this._frameBuffer.byteLength)
        // writeFramebuffer.fill(val, 0)

        // 貌似不仅仅是清理当前framebuffer
        // 现在没有清理framebuffer的tex 不知道对不对
        this._framebufferObjectMap.forEach((framebuffer) => {
            if (framebuffer.colorAttachPoint instanceof WebGLRenderbufferObject) {
                let colorAttachPoint: WebGLRenderbufferObject = <WebGLRenderbufferObject>framebuffer.colorAttachPoint
                let bufferData = <Uint32Array>colorAttachPoint.bufferData
                bufferData.fill(val, 0)
            }
        })
        let systemWriteFramebuffer = (<WebGLRenderbufferObject>this._systemFrameBuffer.colorAttachPoint).bufferData
        systemWriteFramebuffer.fill(val, 0)
    }

    private _clearDeputhBuffer() {
        let depathFramebuffer: Float32Array | null = this.customGetNowDepthBuffer()
        if (depathFramebuffer) {
            depathFramebuffer.fill(this._defaultDepth, 0)
        }
    }

    customSaveGlData() {
        // writeTsImplGlslFile()
    }

    /**非gl的接口 初始化自定义的context */
    customContextInit(sp: HTMLCanvasElement): void {
        //考虑下要不要换成动态的方式创建 会不会影响性能
        this._viewSp = sp
        this._canvars2D = this._viewSp.getContext("2d")!
    }

    customGlInitBeforeCall() {
        this._canvasSize = new Vec2Data(this._gameCanvas.width, this._gameCanvas.height)
        this._viewSp.width = this._canvasSize.x
        this._viewSp.height = this._canvasSize.y

        let colorAttachPoint: WebGLRenderbufferObject = <WebGLRenderbufferObject>this._systemFrameBuffer.colorAttachPoint!
        colorAttachPoint.initBufferData(this._gameCanvas.width, this._gameCanvas.height, this._gameGl.RGBA4)
        let depthAttachPoint: WebGLRenderbufferObject = <WebGLRenderbufferObject>this._systemFrameBuffer.depthAttachPoint!
        depthAttachPoint.initBufferData(this._gameCanvas.width, this._gameCanvas.height, this._gameGl.DEPTH_COMPONENT16)
        let stencilAttachPoint: WebGLRenderbufferObject = <WebGLRenderbufferObject>this._systemFrameBuffer.stencilAttachPoint!
        stencilAttachPoint.initBufferData(this._gameCanvas.width, this._gameCanvas.height, this._gameGl.STENCIL_INDEX8)
    }

    private _customJudgeDeleteShader(shaderIndex: CPUWebGLShader, shader: CPUShader): void {
        if (!shader.isValid()) {
            shader.destory()
            this._webglShaderMap.delete(shaderIndex.cachIndex)
        }
    }

    private _customJudgeDeleteProgram(programIndex: CPUWebGLProgram, program: CPUShaderProgram): void {
        if (!program.isValid()) {
            program.destory(programIndex)
            this._webGLProgramMap.delete(programIndex.cachIndex)
            let attachVertexShader = program.attachVertexShader
            if (attachVertexShader) {
                this._customJudgeDeleteShader(attachVertexShader.shaderIndex, attachVertexShader)
            }
            let attachFragmentShader = program.attachFragmentShader
            if (attachFragmentShader) {
                this._customJudgeDeleteShader(attachFragmentShader.shaderIndex, attachFragmentShader)
            }
        }
    }

    /**
     * @param type
     * @returns 实际上在opengl中的返回是GLuint
     */
    createShader(type: GLenum): WebGLShader | null {
        let shaderIndex: CPUWebGLShader | null = new CPUWebGLShader(globalShaderIndex++)
        if (type === this._gameGl.VERTEX_SHADER) {
            this._webglShaderMap.set(shaderIndex.cachIndex, new CPUVertexShader(shaderIndex))
        } else if (type == this._gameGl.FRAGMENT_SHADER) {
            this._webglShaderMap.set(shaderIndex.cachIndex, new CPUFragmentShader(shaderIndex))
        } else {
            shaderIndex = null
            renderError("this._gameGl.INVALID_ENUM " + this._gameGl.INVALID_ENUM + " createShader no support type: " + type)
        }
        return shaderIndex
    }

    shaderSource(shaderIndex: WebGLShader, source: string): void {
        let shader = this.customGetShader(shaderIndex)
        if (shader) {
            shader.source = source
        } else {
            renderError("this._gameGl.INVALID_VALUE  " + this._gameGl.INVALID_VALUE + " in shaderSource ")
        }
    }

    compileShader(shaderIndex: WebGLShader): void {
        let shader = this.customGetShader(shaderIndex)
        if (shader) {
            shader.complile()
        } else {
            renderError("this._gameGl.INVALID_VALUE  " + this._gameGl.INVALID_VALUE + " in compileShader ")
        }
    }

    getShaderParameter(shaderIndex: WebGLShader, pname: GLenum): any {
        let shader = this.customGetShader(shaderIndex)
        if (shader) {
            switch (pname) {
                case this._gameGl.DELETE_STATUS:
                    return shader.delete
                case this._gameGl.COMPILE_STATUS:
                    return shader.compileStatus
                case this._gameGl.SHADER_TYPE:
                    if (shader instanceof CPUVertexShader) {
                        return this._gameGl.VERTEX_SHADER
                    } else if (shader instanceof CPUFragmentShader) {
                        return this._gameGl.FRAGMENT_SHADER
                    }
                    renderError("getShaderParameter renderError shader type")
                    return null
            }
        } else {
            renderError("this._gameGl.INVALID_VALUE  " + this._gameGl.INVALID_VALUE + " in getShaderParameter ")
        }
    }

    getShaderInfoLog(shaderIndex: WebGLShader): string | null {
        let shader = this.customGetShader(shaderIndex)
        if (!shader) {
            renderError("this._gameGl.INVALID_OPERATION " + this._gameGl.INVALID_OPERATION + " in getShaderInfoLog ")
        }
        return shader ? shader.info : null
    }

    getProgramInfoLog(programIndex: WebGLProgram): string | null {
        let program = this.customGetProram(programIndex)
        if (!program) {
            renderError("this._gameGl.INVALID_OPERATION " + this._gameGl.INVALID_OPERATION + " in getProgramInfoLog ")
        }
        return program ? program.info : null
    }

    createProgram(): WebGLProgram | null {
        let program: CPUWebGLProgram = new CPUWebGLProgram(globalProgramIndex++)
        this._webGLProgramMap.set(program.cachIndex, new CPUShaderProgram())
        return program
    }

    customGetShader(shaderIndex: WebGLShader) {
        let shader: CPUShader | undefined
        if (shaderIndex) {
            shader = this._webglShaderMap.get((<CPUWebGLShader>shaderIndex).cachIndex)
        }
        return shader
    }

    attachShader(programIndex: WebGLProgram, shaderIndex: WebGLShader): void {
        let program = this.customGetProram(programIndex)
        let shader = this.customGetShader(shaderIndex)

        if (program === undefined || shader === undefined) {
            renderError("this._gameGl.INVALID_VALUE  " + this._gameGl.INVALID_VALUE + " in attachShader ")
            return
        }

        if (shader instanceof CPUVertexShader) {
            if (program.attachVertexShader) {
                renderError("this._gameGl.INVALID_OPERATION   " + this._gameGl.INVALID_OPERATION + " in attachShader ")
            } else {
                program.attachVertexShader = shader
                shader.setAttachProgram(<CPUWebGLProgram>programIndex)
            }
        } else if (shader instanceof CPUFragmentShader) {
            if (program.attachFragmentShader) {
                renderError("this._gameGl.INVALID_OPERATION   " + this._gameGl.INVALID_OPERATION + " in attachShader ")
            } else {
                program.attachFragmentShader = shader
                shader.setAttachProgram(<CPUWebGLProgram>programIndex)
            }
        }
    }

    detachShader(programIndex: WebGLProgram, shaderIndex: WebGLShader): void {
        let program = this.customGetProram(programIndex)
        let shader = this.customGetShader(shaderIndex)

        if (program === undefined || shader === undefined) {
            renderError("this._gameGl.INVALID_VALUE  " + this._gameGl.INVALID_VALUE + " in detachShader ")
            return
        }

        if (shader instanceof CPUVertexShader) {
            if (program.attachVertexShader === shader) {
                shader.deleteAttachProgram(<CPUWebGLProgram>programIndex)
                program.attachVertexShader = null
                this._customJudgeDeleteShader(<CPUWebGLShader>shaderIndex, shader)
            } else {
                renderError("this._gameGl.INVALID_OPERATION   " + this._gameGl.INVALID_OPERATION + " in detachShader ")
            }
        } else if (shader instanceof CPUFragmentShader) {
            if (program.attachFragmentShader === shader) {
                shader.deleteAttachProgram(<CPUWebGLProgram>programIndex)
                program.attachFragmentShader = null
                this._customJudgeDeleteShader(<CPUWebGLShader>shaderIndex, shader)
            } else {
                renderError("this._gameGl.INVALID_OPERATION   " + this._gameGl.INVALID_OPERATION + " in detachShader ")
            }
        }
    }

    linkProgram(programIndex: WebGLProgram): void {
        let program = this.customGetProram(programIndex)

        if (program === undefined) {
            renderError("this._gameGl.INVALID_VALUE  " + this._gameGl.INVALID_VALUE + " in linkProgram ")
        } else {
            program.link()
        }
    }

    customGetProram(programIndex: WebGLProgram) {
        let program: CPUShaderProgram | undefined
        if (programIndex) {
            program = this._webGLProgramMap.get((<CPUWebGLProgram>programIndex).cachIndex)!
        }
        return program
    }

    useProgram(programIndex: WebGLProgram): void {
        let program = this.customGetProram(programIndex)

        if (program === undefined) {
            this._useProgram = null!
        } else {
            if (program.linkStatus) {
                if (this._useProgram) {
                    this._useProgram.unUse()
                    this._customJudgeDeleteProgram(<CPUWebGLProgram>programIndex, this._useProgram)
                }
                this._useProgram = program
                program.use()
            } else {
                renderError("this._gameGl.INVALID_OPERATION   " + this._gameGl.INVALID_OPERATION + " in useProgram ")
            }
        }
    }

    deleteProgram(programIndex: WebGLProgram): void {
        let program = this.customGetProram(programIndex)

        if (program === undefined) {
            renderError("this._gameGl.INVALID_VALUE  " + this._gameGl.INVALID_VALUE + " in deleteProgram ")
        } else {
            program.delete = true
            this._customJudgeDeleteProgram(<CPUWebGLProgram>programIndex, program)
        }
    }

    getProgramParameter(programIndex: WebGLProgram, pname: GLenum): any {
        let program = this._webGLProgramMap.get((<CPUWebGLProgram>programIndex).cachIndex)!

        if (program === undefined) {
            renderError("this._gameGl.INVALID_VALUE  " + this._gameGl.INVALID_VALUE + " in getProgramParameter ")
        } else {
            switch (pname) {
                case this._gameGl.DELETE_STATUS:
                    return program.delete
                case this._gameGl.LINK_STATUS:
                    return program.linkStatus
                case this._gameGl.VALIDATE_STATUS:
                    renderError("todo")
                case this._gameGl.ATTACHED_SHADERS:
                    let attachNum: GLint = 0
                    if (program.attachFragmentShader) {
                        attachNum++
                    }
                    if (program.attachVertexShader) {
                        attachNum++
                    }
                    return attachNum
                case this._gameGl.ACTIVE_ATTRIBUTES:
                    return program.getAttributeSize()
                case this._gameGl.ACTIVE_UNIFORMS:
                    return program.getUniformSize()
            }
        }
    }

    customGetGlType(type: any) {
        let glType
        if (type === Vec4Data) {
            glType = this._gameGl.FLOAT_VEC4
        } else if (type === Vec3Data) {
            glType = this._gameGl.FLOAT_VEC3
        } else if (type === Vec2Data) {
            glType = this._gameGl.FLOAT_VEC2
        } else if (type === FloatData) {
            glType = this._gameGl.FLOAT
        } else if (type === Mat4Data) {
            glType = this._gameGl.FLOAT_MAT4
        } else if (type === Mat3Data) {
            glType = this._gameGl.FLOAT_MAT3
        } else if (type === Mat3Data) {
            glType = this._gameGl.FLOAT_MAT3
        } else if (type === IVec2Data) {
            glType = this._gameGl.INT_VEC2
        } else if (type === IVec3Data) {
            glType = this._gameGl.INT_VEC3
        } else if (type === IVec4Data) {
            glType = this._gameGl.INT_VEC4
        } else if (type === IntData) {
            glType = this._gameGl.INT
        } else {
            debugger
            console.error("暂不支持的类型转换")
        }
        return glType
    }

    getActiveAttrib(programIndex: WebGLProgram, index: GLuint): WebGLActiveInfo | null {
        let program = this.customGetProram(programIndex)

        let activeInfo: WebGLActiveInfo | null = null
        if (program === undefined) {
            renderError("this._gameGl.INVALID_VALUE  " + this._gameGl.INVALID_VALUE + " in getProgramParameter ")
        } else {
            let name = program.getNameByAttributeIndex(index)
            if (name === "dataKeys") {
                debugger
            }
            if (name) {
                let dataKeys = program.linkVertexShader.attributeData.dataKeys
                let dataSize = program.linkVertexShader.attributeData.dataSize
                activeInfo = { name: name, type: dataKeys.get(name!)!, size: dataSize.get(name!)! }
            }
        }
        return activeInfo
    }

    getActiveUniform(programIndex: WebGLProgram, index: GLuint): WebGLActiveInfo | null {
        let program = this.customGetProram(programIndex)

        let activeInfo: WebGLActiveInfo | null = null
        if (program === undefined) {
            renderError("this._gameGl.INVALID_VALUE  " + this._gameGl.INVALID_VALUE + " in getProgramParameter ")
        } else {
            let name = program.getNameByUniformIndex(index)
            if (name === "dataKeys") {
                debugger
            }
            if (name) {
                let dataKeys = program.linkVertexShader.uniformData.dataKeys
                let dataSize = program.linkVertexShader.uniformData.dataSize
                activeInfo = { name: name, type: dataKeys.get(name)!, size: dataSize.get(name)! }
            }
        }
        return activeInfo
    }

    deleteShader(shaderIndex: WebGLShader): void {
        let shader = this.customGetShader(shaderIndex)
        if (shader) {
            shader.delete = true
            this._customJudgeDeleteShader(<CPUWebGLShader>shaderIndex, shader)
        } else {
            renderError("this._gameGl.INVALID_VALUE  " + this._gameGl.INVALID_VALUE + " in deleteShader ")
        }
    }

    createBuffer(): WebGLBuffer | null {
        let buffer = new CPUWebGLBuffer(globalBufferIndex++)
        return buffer
    }

    bindBuffer(target: GLenum, buffer: WebGLBuffer | null): void {
        if (target === this._gameGl.ARRAY_BUFFER) {
            if (buffer) {
                let vboBuffer = this._vboBufferDataMap.get((<CPUWebGLBuffer>buffer).cachIndex)
                if (!vboBuffer) {
                    vboBuffer = new VBOBufferData(this._gameGl.STATIC_DRAW, <CPUWebGLBuffer>buffer)
                    this._vboBufferDataMap.set((<CPUWebGLBuffer>buffer).cachIndex, vboBuffer)
                }
                this._useVboBufferData = vboBuffer
            } else {
                this._useVboBufferData = null
            }
        } else if (target === this._gameGl.ELEMENT_ARRAY_BUFFER) {
            if (buffer) {
                let eboBuffer = this._eboBufferDataMap.get((<CPUWebGLBuffer>buffer).cachIndex)
                if (!eboBuffer) {
                    eboBuffer = new EBOBufferData(this._gameGl.STATIC_DRAW, <CPUWebGLBuffer>buffer)
                    this._eboBufferDataMap.set((<CPUWebGLBuffer>buffer).cachIndex, eboBuffer)
                }
                this._useEboBufferData = eboBuffer
            } else {
                this._useEboBufferData = null
            }
        } else {
            renderError("this._gameGl.INVALID_ENUM   " + this._gameGl.INVALID_ENUM + " in bindBuffer ")
        }
    }

    /**合并了原本webGl上的2个接口 */
    /**不支持重载 */
    bufferData(target: GLenum, sizeOrData: GLsizeiptr | BufferSource, usage: GLenum): void {
        if (usage !== this._gameGl.STATIC_DRAW && usage !== this._gameGl.DYNAMIC_DRAW && usage !== this._gameGl.STREAM_DRAW) {
            renderError("this._gameGl.INVALID_ENUM " + this._gameGl.INVALID_ENUM + " in bufferData ")
            return
        }

        let isSize = false
        if (!(sizeOrData instanceof Object)) {
            isSize = true
            if (sizeOrData < 0) {
                renderError("this._gameGl.INVALID_VALUE " + this._gameGl.INVALID_ENUM + " in bufferData ")
                return
            }
        }

        if (target === this._gameGl.ARRAY_BUFFER) {
            if (this._useVboBufferData) {
                if (isSize) {
                    this._useVboBufferData.buffer = new Uint8Array(<number>sizeOrData)
                } else {
                    /**如果直接使用arraybuffer的话不会复制 arraybuffer对象用来表示通用的、固定长度的原始二进制数据缓冲区。
                     * 只能通过类型数组对象和dataView操作 */
                    let uint8ArrayData: Uint8Array
                    if (ArrayBuffer.isView(sizeOrData)) {
                        uint8ArrayData = new Uint8Array(sizeOrData.buffer, sizeOrData.byteOffset, sizeOrData.byteLength)
                    } else {
                        uint8ArrayData = new Uint8Array(<ArrayBuffer>sizeOrData)
                    }
                    this._useVboBufferData.buffer = new Uint8Array(uint8ArrayData!)
                }
                this._useVboBufferData.status = usage
            } else {
                renderError("this._gameGl.GL_INVALID_OPERATION " + this._gameGl.INVALID_OPERATION + " in bufferData ")
                return
            }
        } else if (target === this._gameGl.ELEMENT_ARRAY_BUFFER) {
            if (this._useEboBufferData) {
                if (isSize) {
                    this._useEboBufferData.buffer = new Uint8Array(<number>sizeOrData)
                } else {
                    /**如果直接使用arraybuffer的话不会复制 arraybuffer对象用来表示通用的、固定长度的原始二进制数据缓冲区。
                     * 只能通过类型数组对象和dataView操作 */
                    let uint8ArrayData: Uint8Array
                    if (ArrayBuffer.isView(sizeOrData)) {
                        uint8ArrayData = new Uint8Array(sizeOrData.buffer, sizeOrData.byteOffset, sizeOrData.byteLength)
                    } else {
                        uint8ArrayData = new Uint8Array(<ArrayBuffer>sizeOrData)
                    }
                    this._useEboBufferData.buffer = new Uint8Array(uint8ArrayData!)
                }
                this._useEboBufferData.status = usage
            } else {
                renderError("this._gameGl.GL_INVALID_OPERATION " + this._gameGl.INVALID_OPERATION + " in bufferData ")
                return
            }
        } else {
            renderError("this._gameGl.INVALID_ENUM   " + this._gameGl.INVALID_ENUM + " in bufferData ")
        }
    }

    bufferSubData(target: GLenum, offset: GLintptr, data: BufferSource): void {
        if (target === this._gameGl.ARRAY_BUFFER) {
            if (this._useVboBufferData) {
                if (offset + data.byteLength > this._useVboBufferData?.buffer?.byteLength) {
                    renderError("this._gameGl.INVALID_VALUE " + this._gameGl.INVALID_VALUE + " in bufferSubData ")
                } else {
                    let uint8ArrayData: Uint8Array
                    // data有可能是typeArray
                    if (ArrayBuffer.isView(data)) {
                        uint8ArrayData = new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
                    } else {
                        uint8ArrayData = new Uint8Array(<ArrayBuffer>data)
                    }
                    this._useVboBufferData.buffer.set(uint8ArrayData!, offset)
                }
            } else {
                renderError("this._gameGl.GL_INVALID_OPERATION " + this._gameGl.INVALID_OPERATION + " in bufferSubData ")
            }
        } else if (target === this._gameGl.ELEMENT_ARRAY_BUFFER) {
            if (this._useEboBufferData) {
                if (offset + data.byteLength > this._useEboBufferData?.buffer?.byteLength) {
                    renderError("this._gameGl.INVALID_VALUE " + this._gameGl.INVALID_VALUE + " in bufferSubData ")
                } else {
                    let uint8ArrayData: Uint8Array
                    // data有可能是typeArray
                    if (ArrayBuffer.isView(data)) {
                        uint8ArrayData = new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
                    } else {
                        uint8ArrayData = new Uint8Array(<ArrayBuffer>data)
                    }
                    this._useEboBufferData.buffer.set(uint8ArrayData, offset)
                }
            } else {
                renderError("this._gameGl.GL_INVALID_OPERATION " + this._gameGl.INVALID_OPERATION + " in bufferSubData ")
            }
        } else {
            renderError("this._gameGl.INVALID_ENUM   " + this._gameGl.INVALID_ENUM + " in bufferSubData ")
        }
    }

    deleteBuffer(buffer: WebGLBuffer | null): void {
        if (buffer) {
            let cachIndex = (<CPUWebGLBuffer>buffer).cachIndex
            let vboBuffer = this._vboBufferDataMap.get(cachIndex)
            if (vboBuffer) {
                this._vboBufferDataMap.delete(cachIndex)
                if (this._useVboBufferData === vboBuffer) {
                    this._useVboBufferData = null
                }
            } else {
                let eboBuffer = this._eboBufferDataMap.get(cachIndex)
                if (eboBuffer) {
                    this._eboBufferDataMap.delete(cachIndex)
                    if (this._useEboBufferData === eboBuffer) {
                        this._useEboBufferData = null
                    }
                }
            }
        }
    }

    /**active 和 enable 应该不是一个概念 */
    getAttribLocation(programIndex: WebGLProgram, name: string): GLint {
        let program = this.customGetProram(programIndex)

        let localtion = -1
        if (program === undefined) {
            renderError("this._gameGl.GL_INVALID_OPERATION   " + this._gameGl.INVALID_OPERATION + " in getAttribLocation ")
        } else {
            if (program.linkStatus) {
                let local = program.getAttributeLocal(name)
                if (local !== undefined) {
                    localtion = local!
                }
            } else {
                renderError("this._gameGl.GL_INVALID_OPERATION   " + this._gameGl.INVALID_OPERATION + " in getAttribLocation ")
            }
        }
        return localtion
    }

    /**
     * 获取了 attribute 的 location 之后,在 OpenGL ES 以及 GPU 真正使用这个 attribute 之前,
     * 还需要通过 glEnableVertexAttribArray 这个 API,对这个 attribute 进行 enable。
     * 如果不 enable 的话,这个 attribute 的值无法被访问,比如无法通过 OpenGL ES 给这个 Attribute 赋值。
     * 更严重的是,如果不 enable 的话,由于 attribute 的值无法访问,
     * GPU 甚至在通过 glDrawArray 或者 glDrawElement 这 2 个 API 进行绘制的时候都无法使用这个 attribute。 */

    enableVertexAttribArray(index: GLuint): void {
        let maxVertexAttribs = this._parameter.get(this._gameGl.MAX_VERTEX_ATTRIBS)

        if (index >= 0 && index < maxVertexAttribs!) {
            this._attributeLocalEnable[index] = true
        } else {
            renderError("this._gameGl.INVALID_VALUE  " + this._gameGl.INVALID_VALUE + " in enableVertexAttribArray ")
        }
    }

    disableVertexAttribArray(index: GLuint): void {
        let maxVertexAttribs = this._parameter.get(this._gameGl.MAX_VERTEX_ATTRIBS)
        if (index >= 0 && index < maxVertexAttribs!) {
            this._attributeLocalEnable[index] = false
        } else {
            renderError("this._gameGl.INVALID_VALUE  " + this._gameGl.INVALID_VALUE + " in disableVertexAttribArray ")
        }
    }

    vertexAttribPointer(index: GLuint, size: GLint, type: GLenum, normalized: GLboolean, stride: GLsizei, offset: GLintptr): void {
        let maxVertexAttribs = this._parameter.get(this._gameGl.MAX_VERTEX_ATTRIBS)
        if (size !== 1 && size !== 2 && size !== 3 && size !== 4) {
            renderError("this._gameGl.INVALID_VALUE  " + this._gameGl.INVALID_VALUE + " in vertexAttribPointer ")
            return
        }
        if (
            type !== this._gameGl.BYTE &&
            type !== this._gameGl.SHORT &&
            type !== this._gameGl.UNSIGNED_BYTE &&
            type !== this._gameGl.UNSIGNED_SHORT &&
            type !== this._gameGl.FLOAT
        ) {
            renderError("this._gameGl.INVALID_ENUM   " + this._gameGl.INVALID_VALUE + " in vertexAttribPointer ")
            return
        }
        if (index >= 0 && index < maxVertexAttribs!) {
            if (normalized) {
                debugger
            }
            let name = this._useProgram.getNameByAttributeLocal(index)
            let readInfo = new AttributeReadInfo(
                this._gameGl,
                this._useVboBufferData?.cachIndex.cachIndex!,
                size,
                type,
                normalized,
                stride,
                offset
            )
            this._attributeReadInfo.set(index, readInfo)
            let typeName = this._useProgram.linkVertexShader.attributeData.dataKeys.get(name!)
            // 暂时不支持ivec 类型
            if (typeName === this._gameGl.FLOAT || typeName === this._gameGl.INT) {
                readInfo.factSize = 1
                if (typeName === this._gameGl.FLOAT) {
                    readInfo.isFloat = true
                } else {
                    readInfo.isFloat = false
                }
            } else if (typeName === this._gameGl.FLOAT_VEC2) {
                readInfo.factSize = 2
            } else if (typeName === this._gameGl.FLOAT_VEC3) {
                readInfo.factSize = 3
            } else if (typeName === this._gameGl.FLOAT_VEC4) {
                readInfo.factSize = 4
            } else {
                debugger
                console.error("暂未实现的attritube size")
            }
        } else {
            renderError("this._gameGl.INVALID_VALUE  " + this._gameGl.INVALID_VALUE + " in vertexAttribPointer ")
        }
    }

    getUniformLocation(programIndex: WebGLProgram, name: string): WebGLUniformLocation | null {
        let program = this.customGetProram(programIndex)

        let localtion = null
        if (program === undefined) {
            renderError("this._gameGl.INVALID_VALUE   " + this._gameGl.INVALID_VALUE + " in getUniformLocation ")
        } else {
            if (program.linkStatus) {
                let local = program.getUniformLocal(name)
                if (local !== undefined) {
                    localtion = local!
                }
            } else {
                renderError("this._gameGl.INVALID_OPERATION   " + this._gameGl.INVALID_OPERATION + " in getUniformLocation ")
            }
        }
        // console.log("***************getUniformLocation***************")
        // console.log("name: " + name)
        // console.log(localtion)
        // console.log("***************getUniformLocation***************")
        return localtion
    }

    private _cusetomUniformDataBefore(location: WebGLUniformLocation | null) {
        let program
        if (this._useProgram === null) {
            renderError("this._gameGl.INVALID_OPERATION   " + this._gameGl.INVALID_OPERATION + " in uniform1f ")
        } else {
            if (this._useProgram.linkStatus) {
                program = this._useProgram
            } else {
                renderError("this._gameGl.INVALID_OPERATION   " + this._gameGl.INVALID_OPERATION + " in uniform1f ")
            }
        }
        return program
    }

    uniform1f(location: WebGLUniformLocation | null, x: GLfloat): void {
        let program = this._cusetomUniformDataBefore(location)
        if (program) {
            let suc = program.setUniformData(<CPUWebGLUniformLocation>location, new FloatData(x))
            if (!suc) {
                renderError("this._gameGl.INVALID_OPERATION   " + this._gameGl.INVALID_OPERATION + " in uniform1f ")
            }
        }
    }

    /**可以用于给sample(图片)传引用地址 */
    uniform1i(location: WebGLUniformLocation | null, x: GLint): void {
        let program = this._cusetomUniformDataBefore(location)
        if (program) {
            let suc = program.setUniformData(<CPUWebGLUniformLocation>location, new IntData(x))
            if (!suc) {
                renderError("this._gameGl.INVALID_OPERATION   " + this._gameGl.INVALID_OPERATION + " in uniform1i ")
            }
        }
    }

    uniform2f(location: WebGLUniformLocation | null, x: GLfloat, y: GLfloat): void {
        let program = this._cusetomUniformDataBefore(location)
        if (program) {
            let suc = program.setUniformData(<CPUWebGLUniformLocation>location, new Vec2Data(x, y))
            if (!suc) {
                renderError("this._gameGl.INVALID_OPERATION   " + this._gameGl.INVALID_OPERATION + " in uniform2f ")
            }
        }
    }

    uniform2i(location: WebGLUniformLocation | null, x: GLint, y: GLint): void {
        let program = this._cusetomUniformDataBefore(location)
        if (program) {
            let suc = program.setUniformData(<CPUWebGLUniformLocation>location, new IVec2Data(x, y))
            if (!suc) {
                renderError("this._gameGl.INVALID_OPERATION   " + this._gameGl.INVALID_OPERATION + " in uniform2i ")
            }
        }
    }
    uniform3f(location: WebGLUniformLocation | null, x: GLfloat, y: GLfloat, z: GLfloat): void {
        let program = this._cusetomUniformDataBefore(location)
        if (program) {
            let suc = program.setUniformData(<CPUWebGLUniformLocation>location, new Vec3Data(x, y, z))
            if (!suc) {
                renderError("this._gameGl.INVALID_OPERATION   " + this._gameGl.INVALID_OPERATION + " in uniform3f ")
            }
        }
    }
    uniform3i(location: WebGLUniformLocation | null, x: GLint, y: GLint, z: GLint): void {
        let program = this._cusetomUniformDataBefore(location)
        if (program) {
            let suc = program.setUniformData(<CPUWebGLUniformLocation>location, new IVec3Data(x, y, z))
            if (!suc) {
                renderError("this._gameGl.INVALID_OPERATION   " + this._gameGl.INVALID_OPERATION + " in uniform3i ")
            }
        }
    }
    uniform4f(location: WebGLUniformLocation | null, x: GLfloat, y: GLfloat, z: GLfloat, w: GLfloat): void {
        let program = this._cusetomUniformDataBefore(location)
        if (program) {
            let suc = program.setUniformData(<CPUWebGLUniformLocation>location, new Vec4Data(x, y, z, w))
            if (!suc) {
                renderError("this._gameGl.INVALID_OPERATION   " + this._gameGl.INVALID_OPERATION + " in uniform4f ")
            }
        }
    }
    uniform4i(location: WebGLUniformLocation | null, x: GLint, y: GLint, z: GLint, w: GLint): void {
        let program = this._cusetomUniformDataBefore(location)
        if (program) {
            let suc = program.setUniformData(<CPUWebGLUniformLocation>location, new IVec4Data(x, y, z, w))
            if (!suc) {
                renderError("this._gameGl.INVALID_OPERATION   " + this._gameGl.INVALID_OPERATION + " in uniform4i ")
            }
        }
    }
    uniform1fv(location: WebGLUniformLocation | null, triangleVec: Float32List): void {
        let program = this._cusetomUniformDataBefore(location)
        if (program) {
            let arr = new Array<NumData>(triangleVec.length)
            let i = 0
            triangleVec.forEach((v: number) => {
                arr[i] = new FloatData(v)
            })
            let suc = program.setUniformData(<CPUWebGLUniformLocation>location, arr)
            if (!suc) {
                renderError("this._gameGl.INVALID_OPERATION   " + this._gameGl.INVALID_OPERATION + " in uniform1fv ")
            }
        }
    }
    /**可以用于给sample(图片)传引用地址数组 */
    uniform1iv(location: WebGLUniformLocation | null, triangleVec: Int32List): void {
        let program = this._cusetomUniformDataBefore(location)
        if (program) {
            let arr = new Array<IntData>(triangleVec.length)
            let i = 0
            triangleVec.forEach((v: number) => {
                arr[i] = new IntData(v)
            })
            let suc = program.setUniformData(<CPUWebGLUniformLocation>location, arr)
            if (!suc) {
                renderError("this._gameGl.INVALID_OPERATION   " + this._gameGl.INVALID_OPERATION + " in uniform1iv ")
            }
        }
    }

    uniform2fv(location: WebGLUniformLocation | null, triangleVec: Float32List): void {
        let program = this._cusetomUniformDataBefore(location)
        if (program) {
            let arrVec: Vec2Data[] = []
            for (let index = 0; index < triangleVec.length; index += 2) {
                arrVec.push(new Vec2Data(triangleVec[index], triangleVec[index + 1]))
            }
            let suc = program.setUniformData(<CPUWebGLUniformLocation>location, arrVec)
            if (!suc) {
                renderError("this._gameGl.INVALID_OPERATION   " + this._gameGl.INVALID_OPERATION + " in uniform2fv ")
            }
        }
    }
    uniform2iv(location: WebGLUniformLocation | null, triangleVec: Int32List): void {
        let program = this._cusetomUniformDataBefore(location)
        if (program) {
            let arrVec: IVec2Data[] = []
            for (let index = 0; index < triangleVec.length; index += 2) {
                arrVec.push(new IVec2Data(triangleVec[index], triangleVec[index + 1]))
            }
            let suc = program.setUniformData(<CPUWebGLUniformLocation>location, arrVec)
            if (!suc) {
                renderError("this._gameGl.INVALID_OPERATION   " + this._gameGl.INVALID_OPERATION + " in uniform2iv ")
            }
        }
    }
    uniform3fv(location: WebGLUniformLocation | null, triangleVec: Float32List): void {
        let program = this._cusetomUniformDataBefore(location)
        if (program) {
            let arrVec: Vec3Data[] = []
            for (let index = 0; index < triangleVec.length; index += 3) {
                arrVec.push(new Vec3Data(triangleVec[index], triangleVec[index + 1], triangleVec[index + 2]))
            }
            let suc = program.setUniformData(<CPUWebGLUniformLocation>location, arrVec)
            if (!suc) {
                renderError("this._gameGl.INVALID_OPERATION   " + this._gameGl.INVALID_OPERATION + " in uniform3fv ")
            }
        }
    }
    uniform3iv(location: WebGLUniformLocation | null, triangleVec: Int32List): void {
        let program = this._cusetomUniformDataBefore(location)
        if (program) {
            let arrVec: IVec3Data[] = []
            for (let index = 0; index < triangleVec.length; index += 3) {
                arrVec.push(new IVec3Data(triangleVec[index], triangleVec[index + 1], triangleVec[index + 2]))
            }
            let suc = program.setUniformData(<CPUWebGLUniformLocation>location, arrVec)
            if (!suc) {
                renderError("this._gameGl.INVALID_OPERATION   " + this._gameGl.INVALID_OPERATION + " in uniform3iv ")
            }
        }
    }
    uniform4fv(location: WebGLUniformLocation | null, triangleVec: Float32List): void {
        let program = this._cusetomUniformDataBefore(location)
        if (program) {
            let arrVec: Vec4Data[] = []
            for (let index = 0; index < triangleVec.length; index += 4) {
                arrVec.push(new Vec4Data(triangleVec[index], triangleVec[index + 1], triangleVec[index + 2], triangleVec[index + 3]))
            }
            let suc = program.setUniformData(<CPUWebGLUniformLocation>location, arrVec)
            if (!suc) {
                renderError("this._gameGl.INVALID_OPERATION   " + this._gameGl.INVALID_OPERATION + " in uniform4fv ")
            }
        }
    }
    uniform4iv(location: WebGLUniformLocation | null, triangleVec: Int32List): void {
        let program = this._cusetomUniformDataBefore(location)
        if (program) {
            let arrVec: IVec4Data[] = []
            for (let index = 0; index < triangleVec.length; index += 4) {
                arrVec.push(new IVec4Data(triangleVec[index], triangleVec[index + 1], triangleVec[index + 2], triangleVec[index + 3]))
            }
            let suc = program.setUniformData(<CPUWebGLUniformLocation>location, arrVec)
            if (!suc) {
                renderError("this._gameGl.INVALID_OPERATION   " + this._gameGl.INVALID_OPERATION + " in uniform4iv ")
            }
        }
    }
    /**creator没有2维矩阵 暂不实现 */
    // uniformMatrix2fv(location: WebGLUniformLocation | null, transpose: GLboolean, value: Float32List): void {
    //     let program = this._cusetomUniformDataBefore(location)
    //     if (program) {
    //         let arrVec: Mat3[] = []
    //         for (let index = 0; index < triangleVec.length; index += 2) {
    //             arrVec.push(new Vec4Data(triangleVec[index], triangleVec[index + 1]))
    //         }
    //         let suc = program.setUniformData(<CPUWebGLUniformLocation>location, arrVec)
    //         if (!suc) {
    //             renderError("this._gameGl.INVALID_OPERATION   " + this._gameGl.INVALID_OPERATION + " in uniform4i ")
    //         }
    //     }
    // }
    uniformMatrix3fv(location: WebGLUniformLocation | null, transpose: GLboolean, value: Float32List): void {
        let program = this._cusetomUniformDataBefore(location)
        if (program) {
            let arrVec: Mat3Data[] = []
            for (let index = 0; index < value.length; index += 9) {
                arrVec.push(
                    new Mat3Data(
                        value[index],
                        value[index + 1],
                        value[index + 2],
                        value[index + 3],
                        value[index + 4],
                        value[index + 5],
                        value[index + 6],
                        value[index + 7],
                        value[index + 8]
                    )
                )
            }
            let suc = program.setUniformData(<CPUWebGLUniformLocation>location, arrVec)
            if (!suc) {
                renderError("this._gameGl.INVALID_OPERATION   " + this._gameGl.INVALID_OPERATION + " in uniform4i ")
            }
        }
    }
    uniformMatrix4fv(location: WebGLUniformLocation | null, transpose: GLboolean, value: Float32List): void {
        let program = this._cusetomUniformDataBefore(location)
        if (program) {
            let arrVec: Mat4Data[] = []
            for (let index = 0; index < value.length; index += 16) {
                arrVec.push(
                    new Mat4Data(
                        value[index],
                        value[index + 1],
                        value[index + 2],
                        value[index + 3],
                        value[index + 4],
                        value[index + 5],
                        value[index + 6],
                        value[index + 7],
                        value[index + 8],
                        value[index + 9],
                        value[index + 10],
                        value[index + 11],
                        value[index + 12],
                        value[index + 13],
                        value[index + 14],
                        value[index + 15]
                    )
                )
            }
            let suc = program.setUniformData(<CPUWebGLUniformLocation>location, arrVec)
            if (!suc) {
                renderError("this._gameGl.INVALID_OPERATION   " + this._gameGl.INVALID_OPERATION + " in uniform4i ")
            }
        }
    }

    viewport(x: GLint, y: GLint, width: GLsizei, height: GLsizei): void {
        this._viewPort = new Rect(x, y, width, height)
        this._scissorRect = new Rect(x, y, width, height)
        let frameLength = width * height * 4
        console.log("width:" + width + " height" + height + " frameLength " + frameLength)
    }

    clearColor(red: GLclampf, green: GLclampf, blue: GLclampf, alpha: GLclampf): void {
        this._backgroundColor = new Vec4Data(red * 255, green * 255, blue * 255, alpha * 255)
    }

    clear(mask: GLbitfield): void {
        if (mask & this._gameGl.COLOR_BUFFER_BIT) {
            this._clearColorBuffer()
        }
        if (mask & this._gameGl.DEPTH_BUFFER_BIT) {
            this._clearDeputhBuffer()
        }
        if (mask & this._gameGl.STENCIL_BUFFER_BIT) {
            // todo
            console.warn("clear STENCIL_BUFFER_BIT no imm")
        }
    }

    colorMask(red: GLboolean, green: GLboolean, blue: GLboolean, alpha: GLboolean): void {
        this._colorRWriteEnable = red
        this._colorGWriteEnable = green
        this._colorBWriteEnable = blue
        this._colorAWriteEnable = alpha
    }

    drawArrays(mode: GLenum, first: GLint, count: GLsizei): void {
        if (!(this._useProgram && this._useProgram.linkStatus)) {
            renderError("没有链接使用的程序")
            return
        }
        if (!this._useVboBufferData) {
            renderError("没有顶点数据")
            return
        }
        if (this._cachWriteData) {
            console.error("has cachWriteData not can draw")
        }
        cpuCachData.clear()
        let cachVboAttributeDatas: Map<string, Vec2Data[] | Vec3Data[] | Vec4Data[] | IntData[] | FloatData[]> = new Map()
        let attributeCount = Number.MAX_SAFE_INTEGER

        this._attributeReadInfo.forEach((value: AttributeReadInfo, index: GLint) => {
            if (this._attributeLocalEnable[index]) {
                let name = this._useProgram.getNameByAttributeLocal(index)
                if (name) {
                    let bytesPerElement = value.byteType.BYTES_PER_ELEMENT
                    let size = value.size
                    let factSize = value.factSize
                    let stride = value.stride ? value.stride : bytesPerElement * value.size
                    let bufferData = this._vboBufferDataMap.get(value.readBufferIndex)
                    let numCachData = value.isFloat ? cpuCachData.floatData : cpuCachData.intData
                    if (bufferData) {
                        let buffer = bufferData.buffer
                        let dataTypeArray = new value.byteType(buffer.buffer, buffer.byteOffset, buffer.byteLength / bytesPerElement)

                        let num = buffer.byteLength / stride
                        let dataArr: Vec2Data[] | Vec3Data[] | Vec4Data[] | IntData[] | FloatData[]
                        let dataIndex = 0
                        if (factSize === 1) {
                            dataArr = new Array<NumData>(num)
                            if (size === 1 || size === 2 || size === 3 || size === 4) {
                                for (let i = value.offset; i < buffer.length; i += stride) {
                                    let byteIndex = i / bytesPerElement
                                    let data: IntData | FloatData = numCachData.getData()
                                    data.v = dataTypeArray[byteIndex]
                                    dataArr![dataIndex++] = data!
                                }
                            } else {
                                debugger
                                console.error("drawArrays 暂时无法识别的数量")
                            }
                        } else if (factSize === 2) {
                            dataArr = new Array<Vec2Data>(num)
                            if (size === 1) {
                                for (let i = value.offset; i < buffer.length; i += stride) {
                                    let byteIndex = i / bytesPerElement
                                    let data: Vec2Data = cpuCachData.vec2Data.getData()
                                    data.set_Vn(dataTypeArray[byteIndex], 0)
                                    dataArr![dataIndex++] = data!
                                }
                            } else if (size === 2 || size === 3 || size === 4) {
                                for (let i = value.offset; i < buffer.length; i += stride) {
                                    let byteIndex = i / bytesPerElement
                                    let data: Vec2Data = cpuCachData.vec2Data.getData()

                                    data.set_Vn(dataTypeArray[byteIndex], dataTypeArray[byteIndex + 1])
                                    dataArr![dataIndex++] = data!
                                }
                            } else {
                                debugger
                                console.error("drawArrays 暂时无法识别的数量")
                            }
                        } else if (factSize === 3) {
                            dataArr = new Array<Vec3Data>(num)
                            if (size === 1) {
                                for (let i = value.offset; i < buffer.length; i += stride) {
                                    let byteIndex = i / bytesPerElement
                                    let data: Vec3Data = cpuCachData.vec3Data.getData()
                                    data.set_Vn(dataTypeArray[byteIndex], 0, 0)
                                    dataArr![dataIndex++] = data!
                                }
                            } else if (size === 2) {
                                for (let i = value.offset; i < buffer.length; i += stride) {
                                    let byteIndex = i / bytesPerElement
                                    let data: Vec3Data = cpuCachData.vec3Data.getData()

                                    data.set_Vn(dataTypeArray[byteIndex], dataTypeArray[byteIndex + 1], 0)
                                    dataArr![dataIndex++] = data!
                                }
                            } else if (size === 3 || size === 4) {
                                for (let i = value.offset; i < buffer.length; i += stride) {
                                    let byteIndex = i / bytesPerElement
                                    let data: Vec3Data = cpuCachData.vec3Data.getData()

                                    data.set_Vn(dataTypeArray[byteIndex], dataTypeArray[byteIndex + 1], dataTypeArray[byteIndex + 2])
                                    dataArr![dataIndex++] = data!
                                }
                            } else {
                                debugger
                                console.error("drawArrays 暂时无法识别的数量")
                            }
                        } else if (factSize === 4) {
                            dataArr = new Array<Vec4Data>(num)
                            if (size === 1) {
                                for (let i = value.offset; i < buffer.length; i += stride) {
                                    let byteIndex = i / bytesPerElement
                                    let data: Vec4Data = cpuCachData.vec4Data.getData()
                                    data.set_Vn(dataTypeArray[byteIndex], 0, 0, 1)
                                    dataArr![dataIndex++] = data!
                                }
                            } else if (size === 2) {
                                for (let i = value.offset; i < buffer.length; i += stride) {
                                    let byteIndex = i / bytesPerElement
                                    let data: Vec4Data = cpuCachData.vec4Data.getData()

                                    data.set_Vn(dataTypeArray[byteIndex], dataTypeArray[byteIndex + 1], 0, 1)
                                    dataArr![dataIndex++] = data!
                                }
                            } else if (size === 3) {
                                for (let i = value.offset; i < buffer.length; i += stride) {
                                    let byteIndex = i / bytesPerElement
                                    let data: Vec4Data = cpuCachData.vec4Data.getData()
                                    data.set_Vn(dataTypeArray[byteIndex], dataTypeArray[byteIndex + 1], dataTypeArray[byteIndex + 2], 1)
                                    dataArr![dataIndex++] = data!
                                }
                            } else if (size === 4) {
                                for (let i = value.offset; i < buffer.length; i += stride) {
                                    let byteIndex = i / bytesPerElement
                                    let data: Vec4Data = cpuCachData.vec4Data.getData()
                                    data.set_Vn(
                                        dataTypeArray[byteIndex],
                                        dataTypeArray[byteIndex + 1],
                                        dataTypeArray[byteIndex + 2],
                                        dataTypeArray[byteIndex + 3]
                                    )
                                    dataArr![dataIndex++] = data!
                                }
                            } else {
                                debugger
                                console.error("drawArrays 暂时无法识别的数量")
                            }
                        } else {
                            debugger
                            console.error("drawArrays 暂时无法识别的数量")
                        }
                        attributeCount = Math.min(dataArr!.length, attributeCount)
                        cachVboAttributeDatas.set(name, dataArr!)
                    } else {
                        renderError("this._gameGl.INVALID_OPERATION  " + this._gameGl.INVALID_VALUE + " in drawArrays ")
                    }
                }
            }
        })

        let beginIndex = first
        let endIndex = Math.min(count, attributeCount)
        this._cachWriteData = new CachWriteData(mode, beginIndex, endIndex, cachVboAttributeDatas)
        this._customDraw(mode, beginIndex, endIndex, cachVboAttributeDatas)
    }

    customLogUseShaderHash() {
        this._useProgram.logShaderHash(calculateUseShaderHash)
    }

    customLogReplaceMap() {
        let beginStr = `export let glslShaderHackScript: Map<string, string> = new Map([\n`
        calculateUseShaderHash.forEach((value: string, key: string) => {
            beginStr += `    [\n`
            beginStr += `        \`${key}\`,\n`
            beginStr += `        \`${value}\`\n`
            beginStr += `    ],\n`
        })
        beginStr += `])\n`
        console.log(beginStr)
    }

    /**offset是字节为单位的 */
    drawElements(mode: GLenum, count: GLsizei, type: GLenum, offset: GLintptr): void {
        if (!(this._useProgram && this._useProgram.linkStatus)) {
            renderError("没有链接程序")
            return
        }
        if (!this._useVboBufferData) {
            renderError("没有顶点数据")
            return
        }
        if (!this._useEboBufferData) {
            renderError("没有索引数据")
            return
        }
        if (this._cachWriteData) {
            // 当前有正在渲染的数据 无法执行
            console.error("has cachWriteData not can draw")
        }

        // for test
        // 测试离屏渲染的效果
        // let nowFrameBuffer = this.customGetNowFramebuffer()
        // if (nowFrameBuffer === this._systemFrameBuffer) {
        //     return
        // }

        // 清空数据缓存
        cpuCachData.clear()
        let cachVboAttributeDatas: Map<string, number[] | Vec2Data[] | Vec3Data[] | Vec4Data[] | IntData[] | FloatData[]> = new Map()
        let attributeCount = Number.MAX_SAFE_INTEGER

        let eboBufferData: Uint16Array | Uint8Array
        let offsetCount = offset
        if (type === this._gameGl.UNSIGNED_BYTE) {
            eboBufferData = this._useEboBufferData.buffer
        } else if (type === this._gameGl.UNSIGNED_SHORT) {
            eboBufferData = new Uint16Array(
                this._useEboBufferData.buffer.buffer,
                this._useEboBufferData.buffer.byteOffset,
                this._useEboBufferData.buffer.byteLength / Uint16Array.BYTES_PER_ELEMENT
            )
            // offset是字节为
            offsetCount = offsetCount / 2
        }
        this._attributeReadInfo.forEach((value: AttributeReadInfo, index: GLint) => {
            // 只会对enable的属性进行处理
            if (this._attributeLocalEnable[index]) {
                let name = this._useProgram.getNameByAttributeLocal(index)
                if (name) {
                    let bytesPerElement = value.byteType.BYTES_PER_ELEMENT
                    let size = value.size
                    let factSize = value.factSize
                    let stride = value.stride ? value.stride : bytesPerElement * value.size
                    let bufferData = this._vboBufferDataMap.get(value.readBufferIndex)
                    let numCachData = value.isFloat ? cpuCachData.floatData : cpuCachData.intData
                    if (bufferData) {
                        let buffer = bufferData.buffer
                        let dataTypeArray:
                            | Uint8Array
                            | Uint16Array
                            | Uint32Array
                            | Float32Array
                            | Float64Array
                            | Int16Array
                            | Int32Array
                            | Int8Array = new value.byteType(buffer.buffer, buffer.byteOffset, buffer.byteLength / bytesPerElement)

                        let num = buffer.byteLength / stride

                        let dataArr: Vec2Data[] | Vec3Data[] | Vec4Data[] | IntData[] | FloatData[]
                        let dataIndex = 0
                        if (factSize === 1) {
                            dataArr = new Array<NumData>(num)
                            if (size === 1 || size === 2 || size === 3 || size === 4) {
                                for (let i = offsetCount; i < eboBufferData.length; i++) {
                                    let element = eboBufferData[i]
                                    let elementIndex = value.offset + element * stride
                                    let byteIndex = elementIndex / bytesPerElement
                                    let data: IntData | FloatData = numCachData.getData()
                                    data.v = dataTypeArray[byteIndex]
                                    dataArr![dataIndex++] = data!
                                }
                            } else {
                                debugger
                                console.error("drawArrays 暂时无法识别的数量")
                            }
                        } else if (factSize === 2) {
                            dataArr = new Array<Vec2Data>(num)
                            if (size === 1) {
                                for (let i = offsetCount; i < eboBufferData.length; i++) {
                                    let element = eboBufferData[i]
                                    let elementIndex = value.offset + element * stride
                                    let byteIndex = elementIndex / bytesPerElement
                                    let data: Vec2Data = cpuCachData.vec2Data.getData()
                                    data.set_Vn(dataTypeArray[byteIndex], 0)
                                    dataArr![dataIndex++] = data!
                                }
                            } else if (size === 2 || size === 3 || size === 4) {
                                for (let i = offsetCount; i < eboBufferData.length; i++) {
                                    let element = eboBufferData[i]
                                    let elementIndex = value.offset + element * stride
                                    let byteIndex = elementIndex / bytesPerElement
                                    let data: Vec2Data = cpuCachData.vec2Data.getData()
                                    data.set_Vn(dataTypeArray[byteIndex], dataTypeArray[byteIndex + 1])
                                    dataArr![dataIndex++] = data!
                                }
                            } else {
                                debugger
                                console.error("drawElements 暂时无法识别的数量")
                            }
                        } else if (factSize === 3) {
                            dataArr = new Array<Vec3Data>(num)
                            if (size === 1) {
                                for (let i = offsetCount; i < eboBufferData.length; i++) {
                                    let element = eboBufferData[i]
                                    let elementIndex = value.offset + element * stride
                                    let byteIndex = elementIndex / bytesPerElement
                                    let data: Vec3Data = cpuCachData.vec3Data.getData()
                                    data.set_Vn(dataTypeArray[byteIndex], 0, 0)
                                    dataArr![dataIndex++] = data!
                                }
                            } else if (size === 2) {
                                for (let i = offsetCount; i < eboBufferData.length; i++) {
                                    let element = eboBufferData[i]
                                    let elementIndex = value.offset + element * stride
                                    let byteIndex = elementIndex / bytesPerElement
                                    let data: Vec3Data = cpuCachData.vec3Data.getData()
                                    data.set_Vn(dataTypeArray[byteIndex], dataTypeArray[byteIndex + 1], 0)
                                    dataArr![dataIndex++] = data!
                                }
                            } else if (size === 3 || size === 4) {
                                for (let i = offsetCount; i < eboBufferData.length; i++) {
                                    let element = eboBufferData[i]
                                    let elementIndex = value.offset + element * stride
                                    let byteIndex = elementIndex / bytesPerElement
                                    let data: Vec3Data = cpuCachData.vec3Data.getData()
                                    data.set_Vn(dataTypeArray[byteIndex], dataTypeArray[byteIndex + 1], dataTypeArray[byteIndex + 2])
                                    dataArr![dataIndex++] = data!
                                }
                            } else {
                                debugger
                                console.error("drawElements 暂时无法识别的数量")
                            }
                        } else if (factSize === 4) {
                            dataArr = new Array<Vec4Data>(num)
                            if (size === 1) {
                                for (let i = offsetCount; i < eboBufferData.length; i++) {
                                    let element = eboBufferData[i]
                                    let elementIndex = value.offset + element * stride
                                    let byteIndex = elementIndex / bytesPerElement
                                    let data: Vec4Data = cpuCachData.vec4Data.getData()
                                    data.set_Vn(dataTypeArray[byteIndex], 0, 0, 1)
                                    dataArr![dataIndex++] = data!
                                }
                            } else if (size === 2) {
                                for (let i = offsetCount; i < eboBufferData.length; i++) {
                                    let element = eboBufferData[i]
                                    let elementIndex = value.offset + element * stride
                                    let byteIndex = elementIndex / bytesPerElement
                                    let data: Vec4Data = cpuCachData.vec4Data.getData()
                                    data.set_Vn(dataTypeArray[byteIndex], dataTypeArray[byteIndex + 1], 0, 1)
                                    dataArr![dataIndex++] = data!
                                }
                            } else if (size === 3) {
                                for (let i = offsetCount; i < eboBufferData.length; i++) {
                                    let element = eboBufferData[i]
                                    let elementIndex = value.offset + element * stride
                                    let byteIndex = elementIndex / bytesPerElement
                                    let data: Vec4Data = cpuCachData.vec4Data.getData()
                                    data.set_Vn(dataTypeArray[byteIndex], dataTypeArray[byteIndex + 1], dataTypeArray[byteIndex + 2], 1)
                                    dataArr![dataIndex++] = data!
                                }
                            } else if (size === 4) {
                                for (let i = offsetCount; i < eboBufferData.length; i++) {
                                    let element = eboBufferData[i]
                                    let elementIndex = value.offset + element * stride
                                    let byteIndex = elementIndex / bytesPerElement
                                    let data: Vec4Data = cpuCachData.vec4Data.getData()
                                    data.set_Vn(
                                        dataTypeArray[byteIndex],
                                        dataTypeArray[byteIndex + 1],
                                        dataTypeArray[byteIndex + 2],
                                        dataTypeArray[byteIndex + 3]
                                    )
                                    dataArr![dataIndex++] = data!
                                }
                            } else {
                                debugger
                                console.error("drawElements 暂时无法识别的数量")
                            }
                        } else {
                            debugger
                            console.error("drawElements 暂时无法识别的数量")
                        }
                        attributeCount = Math.min(dataArr!.length, attributeCount)
                        cachVboAttributeDatas.set(name, dataArr!)
                    } else {
                        renderError("this._gameGl.INVALID_OPERATION  " + this._gameGl.INVALID_VALUE + " in drawElements ")
                    }
                }
            }
        })

        // 其实这里是不是并不需要读取那么多的节点 只需要读取count的节点数就可以了
        let endIndex = Math.min(count, attributeCount)
        this._cachWriteData = new CachWriteData(mode, 0, endIndex, cachVboAttributeDatas)
        this._customDraw(mode, 0, endIndex, cachVboAttributeDatas)
    }

    /**继续之前没渲染完的 */
    customContinueDraw() {
        if (this._cachWriteData) {
            this._customDraw(
                this._cachWriteData.mode,
                this._cachWriteData.beginIndex,
                this._cachWriteData.endIndex,
                this._cachWriteData.cachVboAttributeDatas
            )
        }
    }

    customIsDrawOver() {
        return !this._cachWriteData
    }

    customPreSetTexData(uniformData: UniformData) {
        let texel2dMipmapData = this._preCachShaderUseData.texel2dMipmapData
        let dataKeys = uniformData.dataKeys

        let sampler2D = this._gameGl.SAMPLER_2D
        // 暂时只支持2维的纹理
        for (const iterator of dataKeys.entries()) {
            let dataName = iterator[0]
            let typeName = iterator[1]
            if (typeName === sampler2D) {
                let sample2dData: Sampler2D = (<any>uniformData)[dataName]

                let v = sample2dData.v
                let textureUnit = this._textureUnit.get(v)

                if (textureUnit) {
                    let textureData = textureUnit.get(this._gameGl.TEXTURE_2D)
                    if (textureData) {
                        // 怎么判断纹理大还是还是小呢
                        // 先不管图片大小 统一用LINEAR
                        let texelMipmapData = textureData.texelsDatas![0].texelMipmapData
                        let texBufferData = texelMipmapData.get(0)!
                        let buffer = texBufferData.bufferData!
                        let preCachTexUseData = new PreCachTexUseData()
                        preCachTexUseData.bufferData = buffer
                        preCachTexUseData.magFilter = textureData.parameter.get(this._gameGl.TEXTURE_MAG_FILTER)!
                        preCachTexUseData.minFilter = textureData.parameter.get(this._gameGl.TEXTURE_MIN_FILTER)!
                        preCachTexUseData.wrapT = textureData.parameter.get(this._gameGl.TEXTURE_WRAP_T)!
                        preCachTexUseData.wrapS = textureData.parameter.get(this._gameGl.TEXTURE_WRAP_S)!
                        preCachTexUseData.texBufferData = texBufferData
                        texel2dMipmapData.set(v, preCachTexUseData)
                    }
                }
            }
        }
    }

    customPreCalBeforeDraw() {
        this._preCachShaderUseData.texel2dMipmapData.clear()
        this.customPreSetTexData(this._useProgram.linkVertexShader.uniformData)
        this.customPreSetTexData(this._useProgram.linkFragmentShader.uniformData)
    }

    _testIndex = 0
    _customDraw(
        mode: GLenum,
        beginIndex: number,
        endIndex: number,
        cachVboAttributeDatas: Map<string, number[] | Vec2Data[] | Vec3Data[] | Vec4Data[] | IntData[] | FloatData[]>
    ) {
        let beginDrawTime = performance.now()
        let drawOver = false
        this.customLogUseShaderHash()
        this.customPreCalBeforeDraw()

        let linkVertexShader = this._useProgram.linkVertexShader
        switch (mode) {
            case this._gameGl.POINTS:
                console.error("POINTS 类型未实现")
                break
            case this._gameGl.LINE_STRIP:
                console.error("LINE_STRIP 类型未实现")
                break
            case this._gameGl.LINE_LOOP:
                console.error("LINE_LOOP 类型未实现")
                break
            case this._gameGl.LINES:
                console.error("LINES 类型未实现")
                break
            case this._gameGl.TRIANGLE_STRIP:
            case this._gameGl.TRIANGLE_FAN:
            case this._gameGl.TRIANGLES:
                let attributeData: any = linkVertexShader.attributeData

                let cachGlPositions: Vec4Data[] = new Array<Vec4Data>()
                let cachInterpolateDatas: VaryingData[] = new Array<VaryingData>()

                let f1 = (this._zFar - this._zNear) / 2
                let f2 = (this._zFar + this._zNear) / 2
                let triangleVec: Vec4Data[] = new Array<Vec4Data>(3)
                let interpolateData: VaryingData[] = new Array<VaryingData>(3)

                for (let t = 0; t < 3; t++) {
                    interpolateData[t] = linkVertexShader.varyingData.factoryCreate()
                }
                let index = beginIndex
                let cachLog = []
                let cachOverWLog = []
                let renderLog = []
                if (this._testIndex >= endIndex) {
                    this._testIndex = 0
                }

                if (this._testIndex === 0) {
                    console.log("********************begin index**********************")
                }
                console.log("this._testIndex " + this._testIndex)
                if (oneTriRender) {
                    if (this._testIndex === 30) {
                        debugger
                    }
                }
                do {
                    renderVertxPipeCachData.clear()
                    clearShaderCachData()
                    let cachArr: any = []
                    let cachOverWArr: any = []
                    cachLog.push(cachArr)
                    cachOverWLog.push(cachOverWArr)
                    for (let t = 0; t < 3; t++) {
                        // if (index === 12) {
                        //     debugger
                        // }
                        if (oneTriRender) {
                            index = this._testIndex
                        }
                        // if (index >= this._testIndex) {
                        //     drawOver = true
                        //     break
                        // }
                        let nowTriIndex = index + t

                        if (mode == this._gameGl.TRIANGLE_FAN && t === 0) {
                            nowTriIndex = 0
                        }

                        let glPData = cachGlPositions[nowTriIndex]
                        if (glPData) {
                            triangleVec[t] = glPData
                            interpolateData[t] = cachInterpolateDatas[nowTriIndex]
                        } else {
                            cachVboAttributeDatas.forEach(
                                (data: number[] | Vec2Data[] | Vec3Data[] | Vec4Data[] | IntData[] | FloatData[], name: string) => {
                                    attributeData[name] = data[nowTriIndex]
                                }
                            )
                            // cachArr.push((<any>linkVertexShader.attributeData)["a_position"])
                            gl_Position.set_Vn(0, 0, 0, 0)
                            linkVertexShader.main()
                            let glPos = renderVertxPipeCachData.vec4Data.getData()
                            triangleVec[t] = glPos
                            glPos.set_V4(gl_Position)

                            let interData = interpolateData[t]
                            linkVertexShader.varyingData.copy(interData)
                        }
                    }

                    // 齐次空间的裁剪
                    // 现在是直接把空间外的三角形裁剪了
                    // 没有进行三角形拆分
                    // 视口裁剪
                    let v1 = triangleVec[0]
                    let v2 = triangleVec[1]
                    let v3 = triangleVec[2]
                    let isClip = false
                    if (v1.x > v1.w && v2.x > v2.w && v3.x > v3.w) {
                        isClip = true
                    }
                    if (v1.x < -v1.w && v2.x < -v2.w && v3.x < -v3.w) {
                        isClip = true
                    }
                    if (v1.y > v1.w && v2.y > v2.w && v3.y > v3.w) {
                        isClip = true
                    }
                    if (v1.y < -v1.w && v2.y < -v2.w && v3.y < -v3.w) {
                        isClip = true
                    }
                    if (v1.z > v1.w && v2.z > v2.w && v3.z > v3.w) {
                        isClip = true
                    }
                    if (v1.z < -v1.w && v2.z < -v2.w && v3.z < -v3.w) {
                        isClip = true
                    }

                    if (!isClip) {
                        for (let t = 0; t < 3; t++) {
                            let glPos = triangleVec[t]
                            // 在透视投影和透视除法之间应该还要进行一次裁剪空间的三角形拆分
                            // 暂时不做三角形拆分 只是对不在裁剪空间的三角形做剔除
                            let tmpPos = renderVertxPipeCachData.vec4Data.getData()
                            tmpPos.set_V4(glPos)
                            cachArr.push(tmpPos)

                            // 透视除法
                            // w除法
                            let wFactor = 1 / glPos.w
                            glPos.x *= wFactor
                            glPos.y *= wFactor
                            glPos.z *= wFactor

                            let tmpPos2 = renderVertxPipeCachData.vec4Data.getData()
                            tmpPos2.set_V4(glPos)
                            cachOverWArr.push(tmpPos2)

                            //视口变化
                            glPos.x = 0.5 * this._viewPort.width * (glPos.x + 1) + this._viewPort.x
                            glPos.y = 0.5 * this._viewPort.height * (glPos.y + 1) + this._viewPort.y

                            // 计算公式为Zw = (f-n)*Zd/2+(n+f)/2。
                            glPos.z = glPos.z * f1 + f2
                        }

                        let isCull = false
                        //如果开启面裁剪的话
                        if (this._openCullFace) {
                            if (this._nowCullFaceType === this._gameGl.FRONT_AND_BACK) {
                                isCull = true
                            } else {
                                let v01 = renderVertxPipeCachData.vec3Data.getData()
                                let v12 = renderVertxPipeCachData.vec3Data.getData()
                                Vec3Data.subtract(v01, triangleVec[1], triangleVec[0])
                                Vec3Data.subtract(v12, triangleVec[2], triangleVec[1])
                                let crossData = renderVertxPipeCachData.vec3Data.getData()

                                Vec3Data.cross(crossData, v01, v12)
                                // webgl是左手 z指向屏幕内 顺时针的话z是指向外面的 为负
                                if (this._nowCullFaceType === this._gameGl.FRONT) {
                                    /**裁剪正面 */
                                    if (this._nowFrontType == this._gameGl.CW) {
                                        if (crossData.z < 0) {
                                            isCull = true
                                        }
                                    } else {
                                        if (crossData.z > 0) {
                                            isCull = true
                                        }
                                    }
                                } else {
                                    /**裁剪背面 */
                                    if (this._nowFrontType == this._gameGl.CW) {
                                        if (crossData.z > 0) {
                                            isCull = true
                                        }
                                    } else {
                                        if (crossData.z < 0) {
                                            isCull = true
                                        }
                                    }
                                }
                            }
                        }

                        if (!isCull) {
                            renderLog.push(cachOverWLog.length - 1)
                            this._customRasterizeTriangle(triangleVec, interpolateData)
                        }
                    }

                    if (oneTriRender) {
                        drawOver = true
                        break
                    }
                    if (mode === this._gameGl.TRIANGLES) {
                        index += 3
                        if (index >= endIndex) {
                            drawOver = true
                            break
                        }
                    } else {
                        if (index + 3 >= endIndex) {
                            drawOver = true
                            break
                        }
                        index++
                    }

                    if (this._customRenderTime > 0) {
                        if (performance.now() - beginDrawTime > this._customRenderTime) {
                            break
                        }
                    }
                } while (true)

                this._testIndex += 3
                if (this._testIndex === endIndex) {
                    console.log("********************end index**********************")
                }
                console.log(cachLog)
                console.log(cachOverWLog)
                console.log(renderLog)
                if (drawOver) {
                    this._cachWriteData = null
                } else {
                    this._cachWriteData!.beginIndex = index
                }
                break
        }
        this.render()
    }

    render() {
        if (this._canvars2D) {
            let nowFrameBuffer = this.customGetNowFramebuffer()
            // 非系统framebuffer是离屏渲染
            // 实验离屏渲染的结果
            // for test
            if (nowFrameBuffer === this._systemFrameBuffer) {
                let systemWriteFramebuffer = this.customGetNowColorBuffer()
                let renderSize = this.customGetNowRenderSize()

                let height = renderSize.y
                let width = renderSize.x
                let imageBuffer = new Uint32Array(systemWriteFramebuffer)
                let index = Math.floor(height / 2)
                for (let x = 0; x < width; x++) {
                    for (let i = 0; i < index; i++) {
                        let swapIndex1 = x + (height - i - 1) * width
                        let swapIndex2 = x + i * width
                        let tmp = imageBuffer[swapIndex1]
                        imageBuffer[swapIndex1] = imageBuffer[swapIndex2]
                        imageBuffer[swapIndex2] = tmp
                    }
                }
                let imageData = new ImageData(new Uint8ClampedArray(imageBuffer.buffer), renderSize.x, renderSize.y)
                this._canvars2D.putImageData(imageData, 0, 0)
            }
        }
    }

    /**采样 */
    customSampler2D(texIndex: number, uv: Vec2Data): Vec4Data {
        // texIndex应该是对应的纹理单元
        let color = vec4Data.getData()
        color.set_Vn(0, 0, 0, 0)
        let preCach = this._preCachShaderUseData.texel2dMipmapData.get(texIndex)
        if (preCach) {
            // 怎么判断纹理大还是还是小呢
            // 先不管图片大小 统一用LINEAR

            let texBufferData = preCach.texBufferData
            let buffer = preCach.bufferData
            let wrapS = preCach.wrapS
            let wrapT = preCach.wrapT
            let magFilter = preCach.magFilter
            let minFilter = preCach.minFilter
            let texWidth = texBufferData.width
            let texHeight = texBufferData.height

            let sampleX = uv.x
            if (sampleX < 0 || sampleX >= 1) {
                if (wrapS === this._gameGl.REPEAT) {
                    if (sampleX < 0) {
                        sampleX += Math.ceil(-sampleX)
                    } else {
                        sampleX -= Math.floor(sampleX)
                    }
                } else if (wrapS === this._gameGl.CLAMP_TO_EDGE) {
                    sampleX = clamp(sampleX, 0, 1)
                } else if (wrapS === this._gameGl.MIRRORED_REPEAT) {
                    console.error("MIRRORED_REPEAT 暂未实现")
                }
            }
            let sampleY = uv.y
            if (sampleY < 0 || sampleY >= 1) {
                if (wrapT === this._gameGl.REPEAT) {
                    if (sampleY < 0) {
                        sampleY += Math.ceil(-sampleY)
                    } else {
                        sampleY -= Math.floor(sampleY)
                    }
                } else if (wrapT === this._gameGl.CLAMP_TO_EDGE) {
                    sampleY = clamp(sampleY, 0, 1)
                } else if (wrapT === this._gameGl.MIRRORED_REPEAT) {
                    console.error("MIRRORED_REPEAT 暂未实现")
                }
            }

            let factSampleX = sampleX * texWidth
            let factSampleY = sampleY * texHeight
            let searchX = Math.floor(factSampleX)
            let searchY = Math.floor(factSampleY)
            // 有可能将动作数据存入纹理中 此时应该配合使用
            // 用nearst读取
            // 验证测试过 webgl的nearst算法是不会加上0.5中心点来算的,同理liner是不是还需要这么做呢
            if (magFilter === this._gameGl.NEAREST && minFilter === this._gameGl.NEAREST) {
                let uImg = Math.floor(sampleX * texWidth)
                let vImg = Math.floor(sampleY * texHeight)
                let index = (uImg + vImg * texWidth) * 4
                color.x = buffer[index] / 255
                color.y = buffer[index + 1] / 255
                color.z = buffer[index + 2] / 255
                color.w = buffer[index + 3] / 255
                return color
            } else {
                let uImg: number
                let vImg: number
                for (let x = 0; x < 2; x++) {
                    uImg = clamp(searchX - x, 0, texWidth - 1)
                    for (let y = 0; y < 2; y++) {
                        vImg = clamp(searchY - y, 0, texHeight - 1)
                        let index = (uImg + vImg * texWidth) * 4

                        color.x += buffer[index] / 1020
                        color.y += buffer[index + 1] / 1020
                        color.z += buffer[index + 2] / 1020
                        color.w += buffer[index + 3] / 1020
                    }
                }
                return color
            }
        }
        color.set_Vn(1, 1, 1, 1)
        return color
    }

    customGetNowFramebuffer() {
        let nowFrameBuffer = this._nowUseFramebufferObject
        if (!nowFrameBuffer) {
            nowFrameBuffer = this._systemFrameBuffer
        }
        return nowFrameBuffer
    }

    customGetRenderTexBuf(attachPoint: WebGLTextureData, target: number, typeArray: any): any {
        let texelData: TexelsData = null!
        if (target === this._gameGl.TEXTURE_2D) {
            texelData = attachPoint.texelsDatas![0]
        } else {
            texelData = attachPoint.texelsDatas![this._cubeTexIndex.get(target)!]
        }
        let texBufferData = texelData.texelMipmapData.get(0)
        return new typeArray(
            texBufferData!.bufferData!.buffer,
            texBufferData!.bufferData!.byteOffset,
            texBufferData!.bufferData!.byteLength / typeArray.BYTES_PER_ELEMENT
        )
    }

    customGetNowRenderSize() {
        let nowFrameBuffer = this.customGetNowFramebuffer()

        if (nowFrameBuffer.colorAttachPoint instanceof WebGLRenderbufferObject) {
            let colorAttachPoint: WebGLRenderbufferObject = <WebGLRenderbufferObject>nowFrameBuffer.colorAttachPoint
            let size = cpuCachData.vec2Data.getData()
            size.x = colorAttachPoint.width
            size.y = colorAttachPoint.height!
            return size
        } else {
            let attachPoint = <WebGLTextureData>nowFrameBuffer.colorAttachPoint
            let target = nowFrameBuffer.colorTextureTarget
            let texelData: TexelsData = null!
            if (target === this._gameGl.TEXTURE_2D) {
                texelData = attachPoint.texelsDatas![0]
            } else {
                texelData = attachPoint.texelsDatas![this._cubeTexIndex.get(target)!]
            }
            let texBufferData = texelData.texelMipmapData.get(0)
            let size = cpuCachData.vec2Data.getData()
            size.x = texBufferData?.width!
            size.y = texBufferData?.height!
            return size
        }
    }

    customGetNowColorBuffer(): Uint32Array {
        let nowFrameBuffer = this.customGetNowFramebuffer()

        if (nowFrameBuffer.colorAttachPoint instanceof WebGLRenderbufferObject) {
            let colorAttachPoint: WebGLRenderbufferObject = <WebGLRenderbufferObject>nowFrameBuffer.colorAttachPoint
            return <Uint32Array>colorAttachPoint.bufferData
        } else {
            return this.customGetRenderTexBuf(
                <WebGLTextureData>nowFrameBuffer.colorAttachPoint,
                nowFrameBuffer.colorTextureTarget,
                Uint32Array
            )
        }
    }

    customGetNowColorIsTex(): boolean {
        let nowFrameBuffer = this.customGetNowFramebuffer()
        if (nowFrameBuffer.colorAttachPoint) {
            if (nowFrameBuffer.colorAttachPoint instanceof WebGLRenderbufferObject) {
                return false
            } else {
                return true
            }
        }
        return false
    }

    // 除了颜色 其它附加render都可能是空的
    customGetNowDepthBuffer(): Float32Array | null {
        let nowFrameBuffer = this.customGetNowFramebuffer()
        if (nowFrameBuffer.depthAttachPoint) {
            if (nowFrameBuffer.depthAttachPoint instanceof WebGLRenderbufferObject) {
                let depthAttachPoint: WebGLRenderbufferObject = <WebGLRenderbufferObject>nowFrameBuffer.depthAttachPoint
                return <Float32Array>depthAttachPoint.bufferData
            } else {
                return this.customGetRenderTexBuf(
                    <WebGLTextureData>nowFrameBuffer.depthAttachPoint,
                    nowFrameBuffer.depthTextureTarget,
                    Float32Array
                )
            }
        }
        return null
    }

    customGetNowDepthIsTex(): boolean {
        let nowFrameBuffer = this.customGetNowFramebuffer()
        if (nowFrameBuffer.depthAttachPoint) {
            if (nowFrameBuffer.depthAttachPoint instanceof WebGLRenderbufferObject) {
                return false
            } else {
                return true
            }
        }
        return false
    }

    // 除了颜色 其它附加render都可能是空的
    customGetNowStencilBuffer(): Uint8Array | null {
        let nowFrameBuffer = this.customGetNowFramebuffer()
        if (nowFrameBuffer.stencilAttachPoint) {
            if (nowFrameBuffer.stencilAttachPoint instanceof WebGLRenderbufferObject) {
                let stencilAttachPoint: WebGLRenderbufferObject = <WebGLRenderbufferObject>nowFrameBuffer.stencilAttachPoint
                return <Uint8Array>stencilAttachPoint.bufferData
            } else {
                // 如果是图的话不知道对于rgba占1个字节会不会有问题
                debugger
                return this.customGetRenderTexBuf(
                    <WebGLTextureData>nowFrameBuffer.stencilAttachPoint,
                    nowFrameBuffer.stencilTextureTarget,
                    Uint8Array
                )
            }
        } else {
            return null
        }
    }

    customGetNowStencilIsTex(): boolean {
        let nowFrameBuffer = this.customGetNowFramebuffer()
        if (nowFrameBuffer.stencilAttachPoint) {
            if (nowFrameBuffer.stencilAttachPoint instanceof WebGLRenderbufferObject) {
                return false
            } else {
                return true
            }
        }
        return false
    }

    /**和gl的实现还是不一样 不清楚哪里出问题了 */
    /*立方体纹理采样*/
    customSamplerCube(texIndex: number, uv3D: Vec3Data): Vec4Data {
        // texIndex应该是对应的纹理单元
        let textureUnit = this._textureUnit.get(texIndex)
        let color = vec4Data.getData()
        color.set_Vn(0, 0, 0, 0)
        if (textureUnit) {
            let textureData = textureUnit.get(this._gameGl.TEXTURE_CUBE_MAP)
            if (textureData) {
                // 怎么判断纹理大还是还是小呢
                // 先不管图片大小 统一用LINEAR

                // this._cubeTexIndex.set(this._gameGl.TEXTURE_CUBE_MAP_POSITIVE_X, 0)
                // this._cubeTexIndex.set(this._gameGl.TEXTURE_CUBE_MAP_NEGATIVE_X, 1)
                // this._cubeTexIndex.set(this._gameGl.TEXTURE_CUBE_MAP_POSITIVE_Y, 2)
                // this._cubeTexIndex.set(this._gameGl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 3)
                // this._cubeTexIndex.set(this._gameGl.TEXTURE_CUBE_MAP_POSITIVE_Z, 4)
                // this._cubeTexIndex.set(this._gameGl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 5)
                let factx = uv3D.x
                let facty = uv3D.y
                let factz = uv3D.z
                let absX = abs(factx)
                let absY = abs(facty)
                let absZ = abs(factz)
                let mag = max(max(absX, absY), absZ)
                // 相交的时间
                let exitT = 1 / mag
                // 交点x,y,z坐标
                let enterX = factx * exitT
                let enterY = facty * exitT
                let enterZ = factz * exitT
                let texelMipmapData: Map<number, TexBufferData> = null!
                let uv = builtinCachData.vec2Data.getData()
                if (mag === absX) {
                    if (factx > 0) {
                        // TEXTURE_CUBE_MAP_POSITIVE_X
                        texelMipmapData = textureData.texelsDatas![0].texelMipmapData
                        uv.set_Vn(1 - (enterZ + 1) / 2, (enterY + 1) / 2)
                    } else {
                        // TEXTURE_CUBE_MAP_NEGATIVE_X
                        texelMipmapData = textureData.texelsDatas![1].texelMipmapData
                        uv.set_Vn((enterZ + 1) / 2, (enterY + 1) / 2)
                    }
                } else if (mag === absY) {
                    if (facty > 0) {
                        // TEXTURE_CUBE_MAP_POSITIVE_Y
                        texelMipmapData = textureData.texelsDatas![2].texelMipmapData
                        uv.set_Vn((enterX + 1) / 2, 1 - (enterZ + 1) / 2)
                    } else {
                        // TEXTURE_CUBE_MAP_NEGATIVE_Y
                        texelMipmapData = textureData.texelsDatas![3].texelMipmapData
                        uv.set_Vn((enterX + 1) / 2, (enterZ + 1) / 2)
                    }
                } else {
                    if (factz > 0) {
                        // TEXTURE_CUBE_MAP_POSITIVE_Z
                        texelMipmapData = textureData.texelsDatas![4].texelMipmapData
                        uv.set_Vn((enterX + 1) / 2, (enterY + 1) / 2)
                    } else {
                        // TEXTURE_CUBE_MAP_NEGATIVE_Z
                        texelMipmapData = textureData.texelsDatas![5].texelMipmapData
                        uv.set_Vn(1 - (enterX + 1) / 2, (enterY + 1) / 2)
                    }
                }
                // for test
                // 为啥要把y偏转?
                uv.y = 1 - uv.y

                // let texelMipmapData = textureData.texelsDatas![0].texelMipmapData
                let texBufferData = texelMipmapData.get(0)!
                let buffer = texBufferData.bufferData!

                let wrapS = textureData.parameter.get(this._gameGl.TEXTURE_WRAP_S)
                let wrapT = textureData.parameter.get(this._gameGl.TEXTURE_WRAP_T)

                let sampleX = uv.x
                if (sampleX < 0 || sampleX >= 1) {
                    if (wrapS === this._gameGl.REPEAT) {
                        if (sampleX < 0) {
                            sampleX += Math.ceil(-sampleX)
                        } else {
                            sampleX -= Math.floor(sampleX)
                        }
                    } else if (wrapS === this._gameGl.CLAMP_TO_EDGE) {
                        sampleX = clamp(sampleX, 0, 1)
                    } else if (wrapS === this._gameGl.MIRRORED_REPEAT) {
                        console.error("MIRRORED_REPEAT 暂未实现")
                    }
                }
                let sampleY = uv.y
                if (sampleY < 0 || sampleY >= 1) {
                    if (wrapT === this._gameGl.REPEAT) {
                        if (sampleY < 0) {
                            sampleY += Math.ceil(-sampleY)
                        } else {
                            sampleY -= Math.floor(sampleY)
                        }
                    } else if (wrapT === this._gameGl.CLAMP_TO_EDGE) {
                        sampleY = clamp(sampleY, 0, 1)
                    } else if (wrapT === this._gameGl.MIRRORED_REPEAT) {
                        console.error("MIRRORED_REPEAT 暂未实现")
                    }
                }

                let texWidth = texBufferData.width
                let texHeight = texBufferData.height
                let factSampleX = sampleX * texWidth
                let factSampleY = sampleY * texHeight

                let uImg: number
                let vImg: number
                let searchX = Math.floor(factSampleX)
                let searchY = Math.floor(factSampleY)
                for (let x = 0; x < 2; x++) {
                    uImg = clamp(searchX - x, 0, texWidth - 1)
                    for (let y = 0; y < 2; y++) {
                        vImg = clamp(searchY - y, 0, texHeight - 1)
                        let index = (uImg + vImg * texWidth) * 4

                        color.x += buffer[index] / 1020
                        color.y += buffer[index + 1] / 1020
                        color.z += buffer[index + 2] / 1020
                        color.w += buffer[index + 3] / 1020
                    }
                }
                return color
                // let uImg = Math.floor(sampleX * texWidth + 0.5)
                // let vImg = Math.floor(sampleY * texHeight + 0.5)
                // let index = (uImg + vImg * texWidth) * 4
                // return new Vec3Data(buffer[index] / 255, buffer[index + 1] / 255, buffer[index + 2] / 255, buffer[index + 3] / 255)
            }
        }
        color.set_Vn(1, 1, 1, 1)
        return color
    }

    _customRasterizeTriangle(triangleVec: Vec4Data[], interpolateData: VaryingData[]) {
        let fragShader: FragShaderHandle = this._useProgram.linkFragmentShader
        // 求出三角形的包围盒
        let minX = Number.MAX_VALUE
        let minY = Number.MAX_VALUE
        let maxX = Number.MIN_VALUE
        let maxY = Number.MIN_VALUE

        triangleVec.forEach((vec) => {
            maxX = Math.max(vec.x, maxX)
            maxY = Math.max(vec.y, maxY)
            minX = Math.min(vec.x, minX)
            minY = Math.min(vec.y, minY)
        })

        maxX = Math.ceil(maxX)
        maxY = Math.ceil(maxY)
        minX = Math.floor(minX)
        minY = Math.floor(minY)

        let writeColorFramebuffer = this.customGetNowColorBuffer()
        let colorSize = this.customGetNowRenderSize()
        let writeDepthBuffer = this.customGetNowDepthBuffer()

        let viewMaxWidth = Math.min(this._viewPort.x + this._viewPort.width - 1, colorSize.x - 1)
        let viewMinWidth = this._viewPort.x
        let viewMaxHeight = Math.min(this._viewPort.y + this._viewPort.height - 1, colorSize.y - 1)
        let viewMinHeight = this._viewPort.y

        minX = Math.max(viewMinWidth, minX)
        minY = Math.max(viewMinHeight, minY)

        maxX = Math.min(viewMaxWidth, maxX)
        maxY = Math.min(viewMaxHeight, maxY)

        let x0 = triangleVec[0].x
        let y0 = triangleVec[0].y
        let x1 = triangleVec[1].x
        let y1 = triangleVec[1].y
        let x2 = triangleVec[2].x
        let y2 = triangleVec[2].y

        let z0 = triangleVec[0].z
        let z1 = triangleVec[1].z
        let z2 = triangleVec[2].z

        let w0 = triangleVec[0].w
        let w1 = triangleVec[1].w
        let w2 = triangleVec[2].w
        // todo
        // 可用于优化的逻辑
        // 线段的表示 pBegin(xB,yB) pEnd(xE,yE) 线段上的任意一点 p(xB + t(xE - xB),yB + t(yE - yB)) t在0到1之间
        // 那么这时候对于任意xI,yI坐标 xI在minX到maxX之间 找到和线段的交点 那么 t应该为 (xI - xB)/(xE - xB)
        // 如果xE - xB 为0 那么当xI = xB的时候 交点为一条线为yB到yE
        // 如果xE - xB部位0 那么可以求出t的数值 进而求出yI的数值
        // 重复以上步骤对三角形的3条线段求交点 即可求出在xI上的上下限

        let preData = GeometricOperations.preComputeBarycentric2DFactor(x0, x1, x2, y0, y1, y2)
        let varyingData = fragShader.varyingData
        let debugPos: Vec2Data | null = null

        let frameBuffer = new Uint8ClampedArray(
            writeColorFramebuffer.buffer,
            writeColorFramebuffer.byteOffset,
            writeColorFramebuffer.byteLength
        )

        for (let x = minX; x <= maxX; x++) {
            let triangleBeginY = -1
            let triangleEndY = -1
            for (let y = minY; y <= maxY; y++) {
                // let [alpha, beta, gamma] = GeometricOperations.computeBarycentric2D(x + 0.5, y + 0.5, x0, x1, x2, y0, y1, y2)
                // let [alpha, beta, gamma] = GeometricOperations.computeBarycentric2DByPre(x + 0.5, y + 0.5, preData)
                let [alpha, beta, gamma] = GeometricOperations.computeBarycentric2DByPre(x, y, preData)
                if (Math.abs(alpha + beta + gamma) - 1 < 1e-6) {
                    if (alpha >= 0 && beta >= 0 && gamma >= 0) {
                        triangleBeginY = y
                        break
                    }
                }
            }
            if (triangleBeginY >= 0) {
                for (let y = maxY; y > triangleBeginY; y--) {
                    // let [alpha, beta, gamma] = GeometricOperations.computeBarycentric2D(x + 0.5, y + 0.5, x0, x1, x2, y0, y1, y2)
                    // let [alpha, beta, gamma] = GeometricOperations.computeBarycentric2DByPre(x + 0.5, y + 0.5, preData)
                    let [alpha, beta, gamma] = GeometricOperations.computeBarycentric2DByPre(x, y, preData)
                    if (Math.abs(alpha + beta + gamma) - 1 < 1e-6) {
                        if (alpha >= 0 && beta >= 0 && gamma >= 0) {
                            triangleEndY = y
                            break
                        }
                    }
                }
                if (triangleEndY < 0) {
                    triangleEndY = triangleBeginY
                }
                for (let y = triangleBeginY; y <= triangleEndY; y++) {
                    renderFragPipeCachData.clear()
                    let v2 = renderFragPipeCachData.vec2Data.getData()
                    v2.set_Vn(x, y)
                    if (this._openScissorTest && !this._scissorRect.contains(v2)) {
                        continue
                    }

                    // let [alpha, beta, gamma] = GeometricOperations.computeBarycentric2D(x + 0.5, y + 0.5, x0, x1, x2, y0, y1, y2)
                    // let [alpha, beta, gamma] = GeometricOperations.computeBarycentric2DByPre(x + 0.5, y + 0.5, preData)
                    let [alpha, beta, gamma] = GeometricOperations.computeBarycentric2DByPre(x, y, preData)

                    let w_reciprocal = 1.0 / (alpha / w0 + beta / w1 + gamma / w2)
                    let z_interpolated = (alpha * z0) / w0 + (beta * z1) / w1 + (gamma * z2) / w2
                    z_interpolated *= w_reciprocal
                    // let canWrite = z_interpolated >= -1 && z_interpolated <= 1
                    let canWrite = z_interpolated >= this._zNear && z_interpolated <= this._zFar

                    x = Math.floor(x)
                    y = Math.floor(y)
                    // if (y === 51 && x === 801) {
                    //     debugger
                    // }

                    // 不在反写
                    // 只是进行了earlyZ
                    let index = colorSize.x * y + x
                    if (canWrite && writeDepthBuffer && this._openDepthTest) {
                        let depth = writeDepthBuffer[index]

                        let depthJudgeFunc = this._depthJudgeFunc
                        if (depthJudgeFunc == this._gameGl.NEVER) {
                            canWrite = false
                        } else if (depthJudgeFunc == this._gameGl.LESS) {
                            canWrite = z_interpolated < depth
                        } else if (depthJudgeFunc == this._gameGl.EQUAL) {
                            canWrite = z_interpolated == depth
                        } else if (depthJudgeFunc == this._gameGl.LEQUAL) {
                            canWrite = z_interpolated <= depth
                        } else if (depthJudgeFunc == this._gameGl.GREATER) {
                            canWrite = z_interpolated > depth
                        } else if (depthJudgeFunc == this._gameGl.GEQUAL) {
                            canWrite = z_interpolated >= depth
                        } else if (depthJudgeFunc == this._gameGl.ALWAYS) {
                            canWrite = true
                        } else {
                            console.error("error depthJudgeFunc ")
                        }
                        if (canWrite && this._depthWriteEnable) {
                            writeDepthBuffer[index] = z_interpolated
                        }
                    }
                    if (canWrite) {
                        // if (debugPos && debugPos.x == x && debugPos.y == y) {
                        //     debugger
                        // }

                        index *= 4
                        clearShaderCachData()
                        this._customInterpolated(varyingData, interpolateData, alpha, beta, gamma, w_reciprocal, w0, w1, w2)
                        custom_isDiscard.v = false
                        gl_FragColor.set_Vn(NaN, NaN, NaN, NaN)
                        fragShader.main()
                        // if (y > 50 && y < 120 && x > 800 && x < 1000) {
                        //     // debugger
                        //     if (gl_FragColor.y >= 1) {
                        //         debugger
                        //     }
                        // }

                        // if (y === 51 && x === 801) {
                        //     debugger
                        // }
                        if (!custom_isDiscard.v) {
                            let color: Vec4Data
                            if (!isNaN(gl_FragColor.x)) {
                                color = gl_FragColor
                            } else {
                                // 关于gl_FragData 的理解还不足 不太清楚是写入那些通道里
                                color = gl_FragData[0]
                            }

                            color.x = clamp(color.x, 0, 1)
                            color.y = clamp(color.y, 0, 1)
                            color.z = clamp(color.z, 0, 1)
                            color.w = clamp(color.w, 0, 1)
                            if (this._openBlend) {
                                let destColor = renderFragPipeCachData.vec4Data.getData()
                                destColor.set_Vn(frameBuffer[index], frameBuffer[index + 1], frameBuffer[index + 2], frameBuffer[index + 3])
                                Vec4Data.multiplyScalar(destColor, destColor, 1 / 255)
                                let srcComputerColor: Vec4Data = renderFragPipeCachData.vec4Data.getData()
                                let destComputerColor: Vec4Data = renderFragPipeCachData.vec4Data.getData()
                                if (this._rgbSrcBlendFunc === this._gameGl.ZERO) {
                                    srcComputerColor.x = 0
                                    srcComputerColor.y = 0
                                    srcComputerColor.z = 0
                                } else if (this._rgbSrcBlendFunc === this._gameGl.ONE) {
                                    srcComputerColor.x = color.x
                                    srcComputerColor.y = color.y
                                    srcComputerColor.z = color.z
                                    // 不变
                                } else if (this._rgbSrcBlendFunc === this._gameGl.SRC_COLOR) {
                                    srcComputerColor.x = color.x * color.x
                                    srcComputerColor.y = color.y * color.y
                                    srcComputerColor.z = color.z * color.z
                                } else if (this._rgbSrcBlendFunc === this._gameGl.ONE_MINUS_SRC_COLOR) {
                                    srcComputerColor.x = color.x * (1 - color.x)
                                    srcComputerColor.y = color.y * (1 - color.y)
                                    srcComputerColor.z = color.z * (1 - color.z)
                                } else if (this._rgbSrcBlendFunc === this._gameGl.DST_COLOR) {
                                    srcComputerColor.x = color.x * destColor.x
                                    srcComputerColor.y = color.y * destColor.y
                                    srcComputerColor.z = color.z * destColor.z
                                } else if (this._rgbSrcBlendFunc === this._gameGl.ONE_MINUS_DST_COLOR) {
                                    srcComputerColor.x = color.x * (1 - destColor.x)
                                    srcComputerColor.y = color.y * (1 - destColor.y)
                                    srcComputerColor.z = color.z * (1 - destColor.z)
                                } else if (this._rgbSrcBlendFunc === this._gameGl.SRC_ALPHA) {
                                    let factor = color.w
                                    srcComputerColor.x = color.x * factor
                                    srcComputerColor.y = color.y * factor
                                    srcComputerColor.z = color.z * factor
                                } else if (this._rgbSrcBlendFunc === this._gameGl.ONE_MINUS_SRC_ALPHA) {
                                    let factor = 1 - color.w
                                    srcComputerColor.x = color.x * factor
                                    srcComputerColor.y = color.y * factor
                                    srcComputerColor.z = color.z * factor
                                } else if (this._rgbSrcBlendFunc === this._gameGl.DST_ALPHA) {
                                    let factor = destColor.w
                                    srcComputerColor.x = color.x * factor
                                    srcComputerColor.y = color.y * factor
                                    srcComputerColor.z = color.z * factor
                                } else if (this._rgbSrcBlendFunc === this._gameGl.ONE_MINUS_DST_ALPHA) {
                                    let factor = 1 - destColor.w
                                    srcComputerColor.x = color.x * factor
                                    srcComputerColor.y = color.y * factor
                                    srcComputerColor.z = color.z * factor
                                } else if (this._rgbSrcBlendFunc === this._gameGl.CONSTANT_COLOR) {
                                    srcComputerColor.x = color.x * this._blendFactorColor.x
                                    srcComputerColor.y = color.y * this._blendFactorColor.y
                                    srcComputerColor.z = color.z * this._blendFactorColor.z
                                } else if (this._rgbSrcBlendFunc === this._gameGl.ONE_MINUS_CONSTANT_COLOR) {
                                    srcComputerColor.x = color.x * (1 - this._blendFactorColor.x)
                                    srcComputerColor.y = color.y * (1 - this._blendFactorColor.y)
                                    srcComputerColor.z = color.z * (1 - this._blendFactorColor.z)
                                } else if (this._rgbSrcBlendFunc === this._gameGl.CONSTANT_ALPHA) {
                                    let factor = this._blendFactorColor.w
                                    srcComputerColor.x = color.x * factor
                                    srcComputerColor.y = color.y * factor
                                    srcComputerColor.z = color.z * factor
                                } else if (this._rgbSrcBlendFunc === this._gameGl.ONE_MINUS_CONSTANT_ALPHA) {
                                    let factor = 1 - this._blendFactorColor.w
                                    srcComputerColor.x = color.x * factor
                                    srcComputerColor.y = color.y * factor
                                    srcComputerColor.z = color.z * factor
                                } else if (this._rgbSrcBlendFunc === this._gameGl.SRC_ALPHA_SATURATE) {
                                    let factor = Math.min(color.w, 1 - destColor.w)
                                    srcComputerColor.x = color.x * factor
                                    srcComputerColor.y = color.y * factor
                                    srcComputerColor.z = color.z * factor
                                }

                                if (this._alphaSrcBlendFunc === this._gameGl.ZERO) {
                                    srcComputerColor.w = 0
                                } else if (this._alphaSrcBlendFunc === this._gameGl.ONE) {
                                    srcComputerColor.w = color.w
                                } else if (this._alphaSrcBlendFunc === this._gameGl.SRC_COLOR) {
                                    srcComputerColor.w = color.w * color.w
                                } else if (this._alphaSrcBlendFunc === this._gameGl.ONE_MINUS_SRC_COLOR) {
                                    srcComputerColor.w = color.w * (1 - color.w)
                                } else if (this._alphaSrcBlendFunc === this._gameGl.DST_COLOR) {
                                    srcComputerColor.w = color.w * destColor.w
                                } else if (this._alphaSrcBlendFunc === this._gameGl.ONE_MINUS_DST_COLOR) {
                                    srcComputerColor.w = color.w * (1 - destColor.w)
                                } else if (this._alphaSrcBlendFunc === this._gameGl.SRC_ALPHA) {
                                    srcComputerColor.w = color.w * color.w
                                } else if (this._alphaSrcBlendFunc === this._gameGl.ONE_MINUS_SRC_ALPHA) {
                                    srcComputerColor.w = color.w * (1 - color.w)
                                } else if (this._alphaSrcBlendFunc === this._gameGl.DST_ALPHA) {
                                    srcComputerColor.w = color.w * destColor.w
                                } else if (this._alphaSrcBlendFunc === this._gameGl.ONE_MINUS_DST_ALPHA) {
                                    srcComputerColor.w = color.w * (1 - destColor.w)
                                } else if (this._alphaSrcBlendFunc === this._gameGl.CONSTANT_COLOR) {
                                    srcComputerColor.w = color.w * this._blendFactorColor.w
                                } else if (this._alphaSrcBlendFunc === this._gameGl.ONE_MINUS_CONSTANT_COLOR) {
                                    srcComputerColor.w = color.w * (1 - this._blendFactorColor.w)
                                } else if (this._alphaSrcBlendFunc === this._gameGl.CONSTANT_ALPHA) {
                                    srcComputerColor.w = color.w * this._blendFactorColor.w
                                } else if (this._alphaSrcBlendFunc === this._gameGl.ONE_MINUS_CONSTANT_ALPHA) {
                                    srcComputerColor.w = color.w * (1 - this._blendFactorColor.w)
                                } else if (this._alphaSrcBlendFunc === this._gameGl.SRC_ALPHA_SATURATE) {
                                    srcComputerColor.z = color.w
                                }

                                if (this._rgbDestBlendFunc === this._gameGl.ZERO) {
                                    destComputerColor.x = 0
                                    destComputerColor.y = 0
                                    destComputerColor.z = 0
                                } else if (this._rgbDestBlendFunc === this._gameGl.ONE) {
                                    destComputerColor.x = destColor.x
                                    destComputerColor.y = destColor.y
                                    destComputerColor.z = destColor.z
                                    // 不变
                                } else if (this._rgbDestBlendFunc === this._gameGl.SRC_COLOR) {
                                    destComputerColor.x = color.x * destColor.x
                                    destComputerColor.y = color.y * destColor.y
                                    destComputerColor.z = color.z * destColor.z
                                } else if (this._rgbDestBlendFunc === this._gameGl.ONE_MINUS_SRC_COLOR) {
                                    destComputerColor.x = destColor.x * (1 - color.x)
                                    destComputerColor.y = destColor.y * (1 - color.y)
                                    destComputerColor.z = destColor.z * (1 - color.z)
                                } else if (this._rgbDestBlendFunc === this._gameGl.DST_COLOR) {
                                    destComputerColor.x = destColor.x * destColor.x
                                    destComputerColor.y = destColor.y * destColor.y
                                    destComputerColor.z = destColor.z * destColor.z
                                } else if (this._rgbDestBlendFunc === this._gameGl.ONE_MINUS_DST_COLOR) {
                                    destComputerColor.x = destColor.x * (1 - destColor.x)
                                    destComputerColor.y = destColor.y * (1 - destColor.y)
                                    destComputerColor.z = destColor.z * (1 - destColor.z)
                                } else if (this._rgbDestBlendFunc === this._gameGl.SRC_ALPHA) {
                                    let factor = color.w
                                    destComputerColor.x = destColor.x * factor
                                    destComputerColor.y = destColor.y * factor
                                    destComputerColor.z = destColor.z * factor
                                } else if (this._rgbDestBlendFunc === this._gameGl.ONE_MINUS_SRC_ALPHA) {
                                    let factor = 1 - color.w
                                    destComputerColor.x = destColor.x * factor
                                    destComputerColor.y = destColor.y * factor
                                    destComputerColor.z = destColor.z * factor
                                } else if (this._rgbDestBlendFunc === this._gameGl.DST_ALPHA) {
                                    let factor = destColor.w
                                    destComputerColor.x = destColor.x * factor
                                    destComputerColor.y = destColor.y * factor
                                    destComputerColor.z = destColor.z * factor
                                } else if (this._rgbDestBlendFunc === this._gameGl.ONE_MINUS_DST_ALPHA) {
                                    let factor = 1 - destColor.w
                                    destComputerColor.x = destColor.x * factor
                                    destComputerColor.y = destColor.y * factor
                                    destComputerColor.z = destColor.z * factor
                                } else if (this._rgbDestBlendFunc === this._gameGl.CONSTANT_COLOR) {
                                    destComputerColor.x = destColor.x * this._blendFactorColor.x
                                    destComputerColor.y = destColor.y * this._blendFactorColor.y
                                    destComputerColor.z = destColor.z * this._blendFactorColor.z
                                } else if (this._rgbDestBlendFunc === this._gameGl.ONE_MINUS_CONSTANT_COLOR) {
                                    destComputerColor.x = destColor.x * (1 - this._blendFactorColor.x)
                                    destComputerColor.y = destColor.y * (1 - this._blendFactorColor.y)
                                    destComputerColor.z = destColor.z * (1 - this._blendFactorColor.z)
                                } else if (this._rgbDestBlendFunc === this._gameGl.CONSTANT_ALPHA) {
                                    let factor = this._blendFactorColor.w
                                    destComputerColor.x = destColor.x * factor
                                    destComputerColor.y = destColor.y * factor
                                    destComputerColor.z = destColor.z * factor
                                } else if (this._rgbDestBlendFunc === this._gameGl.ONE_MINUS_CONSTANT_ALPHA) {
                                    let factor = 1 - this._blendFactorColor.w
                                    destComputerColor.x = destColor.x * factor
                                    destComputerColor.y = destColor.y * factor
                                    destComputerColor.z = destColor.z * factor
                                } else if (this._rgbDestBlendFunc === this._gameGl.SRC_ALPHA_SATURATE) {
                                    let factor = Math.min(color.w, 1 - destColor.w)
                                    destComputerColor.x = destColor.x * factor
                                    destComputerColor.y = destColor.y * factor
                                    destComputerColor.z = destColor.z * factor
                                }

                                if (this._alphaDestBlendFunc === this._gameGl.ZERO) {
                                    destComputerColor.w = 0
                                } else if (this._alphaDestBlendFunc === this._gameGl.ONE) {
                                    destComputerColor.w = destColor.w
                                } else if (this._alphaDestBlendFunc === this._gameGl.SRC_COLOR) {
                                    destComputerColor.w = destColor.w * color.w
                                } else if (this._alphaDestBlendFunc === this._gameGl.ONE_MINUS_SRC_COLOR) {
                                    destComputerColor.w = destColor.w * (1 - color.w)
                                } else if (this._alphaDestBlendFunc === this._gameGl.DST_COLOR) {
                                    destComputerColor.w = destColor.w * destColor.w
                                } else if (this._alphaDestBlendFunc === this._gameGl.ONE_MINUS_DST_COLOR) {
                                    destComputerColor.w = destColor.w * (1 - destColor.w)
                                } else if (this._alphaDestBlendFunc === this._gameGl.SRC_ALPHA) {
                                    destComputerColor.w = destColor.w * color.w
                                } else if (this._alphaDestBlendFunc === this._gameGl.ONE_MINUS_SRC_ALPHA) {
                                    destComputerColor.w = destColor.w * (1 - color.w)
                                } else if (this._alphaDestBlendFunc === this._gameGl.DST_ALPHA) {
                                    destComputerColor.w = destColor.w * destColor.w
                                } else if (this._alphaDestBlendFunc === this._gameGl.ONE_MINUS_DST_ALPHA) {
                                    destComputerColor.w = destColor.w * (1 - destColor.w)
                                } else if (this._alphaDestBlendFunc === this._gameGl.CONSTANT_COLOR) {
                                    destComputerColor.w = destColor.w * this._blendFactorColor.w
                                } else if (this._alphaDestBlendFunc === this._gameGl.ONE_MINUS_CONSTANT_COLOR) {
                                    destComputerColor.w = destColor.w * (1 - this._blendFactorColor.w)
                                } else if (this._alphaDestBlendFunc === this._gameGl.CONSTANT_ALPHA) {
                                    destComputerColor.w = destColor.w * this._blendFactorColor.w
                                } else if (this._alphaDestBlendFunc === this._gameGl.ONE_MINUS_CONSTANT_ALPHA) {
                                    destComputerColor.w = destColor.w * (1 - this._blendFactorColor.w)
                                } else if (this._alphaDestBlendFunc === this._gameGl.SRC_ALPHA_SATURATE) {
                                    destComputerColor.z = destColor.w
                                }

                                if (this._rgbComputerBlendFunc === this._gameGl.FUNC_ADD) {
                                    color.x = srcComputerColor.x + destComputerColor.x
                                    color.y = srcComputerColor.y + destComputerColor.y
                                    color.z = srcComputerColor.z + destComputerColor.z
                                } else if (this._rgbComputerBlendFunc === this._gameGl.FUNC_SUBTRACT) {
                                    color.x = srcComputerColor.x - destComputerColor.x
                                    color.y = srcComputerColor.y - destComputerColor.y
                                    color.z = srcComputerColor.z - destComputerColor.z
                                } else if (this._rgbComputerBlendFunc === this._gameGl.FUNC_REVERSE_SUBTRACT) {
                                    color.x = destComputerColor.x - srcComputerColor.x
                                    color.y = destComputerColor.y - srcComputerColor.y
                                    color.z = destComputerColor.z - srcComputerColor.z
                                }

                                if (this._alphaComputerBlendFunc === this._gameGl.FUNC_ADD) {
                                    color.w = srcComputerColor.w + destComputerColor.w
                                } else if (this._alphaComputerBlendFunc === this._gameGl.FUNC_SUBTRACT) {
                                    color.w = srcComputerColor.w - destComputerColor.w
                                } else if (this._alphaComputerBlendFunc === this._gameGl.FUNC_REVERSE_SUBTRACT) {
                                    color.w = destComputerColor.w - srcComputerColor.w
                                }
                            }

                            // if (
                            //     color.x > 0.5 && color.x < 0.7 &&
                            //     color.y > 0.5 && color.y < 0.7 &&
                            //     color.z > 0.5 && color.z < 0.7 &&
                            //     this._frameBuffer[index + 1] == 150 &&
                            //     this._frameBuffer[index + 2] == 170
                            // ) {
                            //     debugger
                            // }
                            if (this._colorRWriteEnable) {
                                frameBuffer[index] = color.x * 255
                            }
                            if (this._colorGWriteEnable) {
                                frameBuffer[index + 1] = color.y * 255
                            }
                            if (this._colorBWriteEnable) {
                                frameBuffer[index + 2] = color.z * 255
                            }
                            if (this._colorAWriteEnable) {
                                frameBuffer[index + 3] = color.w * 255
                            }
                        }
                    }
                }
            }
        }
    }

    _customInterpolated(
        outvaryingData: VaryingData,
        interpolateData: VaryingData[],
        alpha: number,
        beta: number,
        gamma: number,
        w_reciprocal: number,
        w0: number,
        w1: number,
        w2: number
    ) {
        let interpolateData0 = interpolateData[0]
        let interpolateData1 = interpolateData[1]
        let interpolateData2 = interpolateData[2]

        for (const iterator of interpolateData0.dataKeys.entries()) {
            let dataName = iterator[0]
            let typeName = iterator[1]
            if (typeName === this._gameGl.FLOAT || typeName === this._gameGl.INT) {
                let vec0: FloatData = (<any>interpolateData0)[dataName]
                let vec1: FloatData = (<any>interpolateData1)[dataName]
                let vec2: FloatData = (<any>interpolateData2)[dataName]
                let interpolated: FloatData = (<any>outvaryingData)[dataName]
                if (!interpolated) {
                    continue
                }
                interpolated.v = ((vec0.v * alpha) / w0 + (vec1.v * beta) / w1 + (vec2.v * gamma) / w2) * w_reciprocal
            } else if (typeName === this._gameGl.FLOAT_VEC2) {
                let vec0: Vec2Data = (<any>interpolateData0)[dataName]
                let vec1: Vec2Data = (<any>interpolateData1)[dataName]
                let vec2: Vec2Data = (<any>interpolateData2)[dataName]
                let interpolated: Vec2Data = (<any>outvaryingData)[dataName]
                if (!interpolated) {
                    continue
                }
                interpolated.x = ((vec0.x * alpha) / w0 + (vec1.x * beta) / w1 + (vec2.x * gamma) / w2) * w_reciprocal
                interpolated.y = ((vec0.y * alpha) / w0 + (vec1.y * beta) / w1 + (vec2.y * gamma) / w2) * w_reciprocal
            } else if (typeName === this._gameGl.FLOAT_VEC3) {
                let vec0: Vec3Data = (<any>interpolateData0)[dataName]
                let vec1: Vec3Data = (<any>interpolateData1)[dataName]
                let vec2: Vec3Data = (<any>interpolateData2)[dataName]
                let interpolated: Vec3Data = (<any>outvaryingData)[dataName]
                if (!interpolated) {
                    continue
                }
                interpolated.x = ((vec0.x * alpha) / w0 + (vec1.x * beta) / w1 + (vec2.x * gamma) / w2) * w_reciprocal
                interpolated.y = ((vec0.y * alpha) / w0 + (vec1.y * beta) / w1 + (vec2.y * gamma) / w2) * w_reciprocal
                interpolated.z = ((vec0.z * alpha) / w0 + (vec1.z * beta) / w1 + (vec2.z * gamma) / w2) * w_reciprocal
            } else if (typeName === this._gameGl.FLOAT_VEC4) {
                let vec0: Vec4Data = (<any>interpolateData0)[dataName]
                let vec1: Vec4Data = (<any>interpolateData1)[dataName]
                let vec2: Vec4Data = (<any>interpolateData2)[dataName]
                let interpolated: Vec4Data = (<any>outvaryingData)[dataName]
                if (!interpolated) {
                    continue
                }
                interpolated.x = ((vec0.x * alpha) / w0 + (vec1.x * beta) / w1 + (vec2.x * gamma) / w2) * w_reciprocal
                interpolated.y = ((vec0.y * alpha) / w0 + (vec1.y * beta) / w1 + (vec2.y * gamma) / w2) * w_reciprocal
                interpolated.z = ((vec0.z * alpha) / w0 + (vec1.z * beta) / w1 + (vec2.z * gamma) / w2) * w_reciprocal
                interpolated.w = ((vec0.w * alpha) / w0 + (vec1.w * beta) / w1 + (vec2.w * gamma) / w2) * w_reciprocal

                // interpolated.x = vec0.x * alpha + vec1.x * beta + vec2.x * gamma
                // interpolated.y = vec0.y * alpha + vec1.y * beta + vec2.y * gamma
                // interpolated.z = vec0.z * alpha + vec1.z * beta + vec2.z * gamma
                // interpolated.w = vec0.w * alpha + vec1.w * beta + vec2.w * gamma
            } else {
                debugger
                console.error("暂未实现的插值方法")
            }
        }
    }

    // webgl是左手坐标系 z朝向屏幕里 所以如果是顺时针的话叉乘出来的结果应该是负数
    // 指定顺时针是正面还是逆时针是背面
    frontFace(mode: GLenum): void {
        // 顺时针是正面
        if (mode === this._gameGl.CW) {
            this._nowFrontType = mode
        } else if (mode === this._gameGl.CCW) {
            this._nowFrontType = mode
        } else {
            renderError("this._gameGl.INVALID_VALUE  " + this._gameGl.INVALID_VALUE + " in frontFace ")
        }
    }
    // 指定裁剪正面还是背面
    cullFace(mode: GLenum): void {
        // 顺时针是正面
        if (mode === this._gameGl.FRONT) {
            this._nowCullFaceType = mode
        } else if (mode === this._gameGl.BACK) {
            this._nowCullFaceType = mode
        } else if (mode === this._gameGl.FRONT_AND_BACK) {
            this._nowCullFaceType = mode
        } else {
            renderError("this._gameGl.INVALID_VALUE  " + this._gameGl.INVALID_VALUE + " in cullFace ")
        }
    }

    enable(cap: GLenum): void {
        if (cap === this._gameGl.BLEND) {
            this._openBlend = true
        } else if (cap === this._gameGl.CULL_FACE) {
            this._openCullFace = true
        } else if (cap === this._gameGl.DEPTH_TEST) {
            this._openDepthTest = true
        } else if (cap === this._gameGl.DITHER) {
            console.error("DITHER 还未实现")
        } else if (cap === this._gameGl.POLYGON_OFFSET_FILL) {
            console.error("POLYGON_OFFSET_FILL 还未实现")
        } else if (cap === this._gameGl.SAMPLE_ALPHA_TO_COVERAGE) {
            console.error("SAMPLE_ALPHA_TO_COVERAGE 还未实现")
        } else if (cap === this._gameGl.SAMPLE_COVERAGE) {
            console.error("SAMPLE_COVERAGE 还未实现")
        } else if (cap === this._gameGl.SCISSOR_TEST) {
            this._openScissorTest = true
        } else if (cap === this._gameGl.STENCIL_TEST) {
            console.error("STENCIL_TEST 还未实现")
        } else {
            renderError("this._gameGl.INVALID_VALUE  " + this._gameGl.INVALID_VALUE + " in enable ")
        }
    }

    disable(cap: GLenum): void {
        if (cap === this._gameGl.BLEND) {
            this._openBlend = false
        } else if (cap === this._gameGl.CULL_FACE) {
            this._openCullFace = false
        } else if (cap === this._gameGl.DEPTH_TEST) {
            this._openDepthTest = false
        } else if (cap === this._gameGl.DITHER) {
            console.error("DITHER 还未实现")
        } else if (cap === this._gameGl.POLYGON_OFFSET_FILL) {
            console.error("POLYGON_OFFSET_FILL 还未实现")
        } else if (cap === this._gameGl.SAMPLE_ALPHA_TO_COVERAGE) {
            console.error("SAMPLE_ALPHA_TO_COVERAGE 还未实现")
        } else if (cap === this._gameGl.SAMPLE_COVERAGE) {
            console.error("SAMPLE_COVERAGE 还未实现")
        } else if (cap === this._gameGl.SCISSOR_TEST) {
            this._openScissorTest = false
        } else if (cap === this._gameGl.STENCIL_TEST) {
            console.error("STENCIL_TEST 还未实现")
        } else {
            renderError("this._gameGl.INVALID_VALUE  " + this._gameGl.INVALID_VALUE + " in disable ")
        }
    }

    pixelStorei(pname: GLenum, param: GLint | GLboolean): void {
        if (pname === this._gameGl.PACK_ALIGNMENT) {
            if (param !== 1 && param !== 2 && param !== 4 && param !== 8) {
                renderError("this._gameGl.INVALID_VALUE " + this._gameGl.INVALID_VALUE + " in pixelStorei")
            }
            this._pixelPackNum = <GLint>param
        } else if (pname === this._gameGl.UNPACK_ALIGNMENT) {
            if (param !== 1 && param !== 2 && param !== 4 && param !== 8) {
                renderError("this._gameGl.INVALID_VALUE " + this._gameGl.INVALID_VALUE + " in pixelStorei")
            }
            this._pixelUnPackNum = <GLint>param
        } else if (pname === this._gameGl.UNPACK_FLIP_Y_WEBGL) {
            this._unpackFilpY = <GLboolean>param
        } else if (pname === this._gameGl.UNPACK_PREMULTIPLY_ALPHA_WEBGL) {
            console.error("UNPACK_PREMULTIPLY_ALPHA_WEBGL 还未实现")
        } else if (pname === this._gameGl.UNPACK_COLORSPACE_CONVERSION_WEBGL) {
            console.error("UNPACK_COLORSPACE_CONVERSION_WEBGL 还未实现")
        }
    }

    createTexture(): WebGLTexture | null {
        let buffer = new CPUWebGLTexture(globalTextureIndex++)
        return buffer
    }

    bindTexture(target: GLenum, texture: WebGLTexture | null): void {
        if (target === this._gameGl.TEXTURE_2D || target === this._gameGl.TEXTURE_CUBE_MAP) {
            let activeTextureData = this._textureUnit.get(this._nowActiveTextureUnit)
            if (activeTextureData) {
                let oldTextureData = activeTextureData.get(target)
                if (oldTextureData) {
                    oldTextureData.unBindTexUnit(this._nowActiveTextureUnit)
                }
            } else {
                debugger
                renderError("bindTexture 无法找对应单元的数据")
            }
            if (texture) {
                let textureData = this._textureDataMap.get((<CPUWebGLTexture>texture).cachIndex)
                if (!textureData) {
                    textureData = new WebGLTextureData(<CPUWebGLTexture>texture, target, this._gameGl, (<CPUWebGLTexture>texture).cachIndex)
                    this._textureDataMap.set((<CPUWebGLTexture>texture).cachIndex, textureData)
                }
                // 纹理创建后target 不能被修改
                if (textureData.glTarget !== target) {
                    renderError("this._gameGl.GL_INVALID_OPERATION " + this._gameGl.INVALID_OPERATION + " in bindTexture")
                }

                textureData.bindTexUnit(this._nowActiveTextureUnit)
                activeTextureData?.set(target, textureData)
            }
        } else {
            renderError("其它类型暂未实现 in bindTexture")
        }
    }

    activeTexture(texture: GLenum): void {
        let textureNum = texture - this._gameGl.TEXTURE0
        if (textureNum >= 0 && textureNum < this._textureUnit.size) {
            this._nowActiveTextureUnit = textureNum
            console.log("this._nowActiveTextureUnit:" + this._nowActiveTextureUnit)
        } else {
            renderError("this._gameGl.INVALID_ENUM " + this._gameGl.INVALID_ENUM + " in activeTexture")
        }
    }
    // (target: GLenum, level: GLint, internalformat: GLint, format: GLenum, type: GLenum, source: TexImageSource): void;
    texImage2D(
        target: GLenum,
        level: GLint,
        internalformat: GLint,
        width: GLsizei,
        height: GLsizei,
        border: GLint | TexImageSource,
        format: GLenum,
        type: GLenum,
        pixels: ArrayBufferView | null
    ): void {
        if (arguments.length === 6) {
            format = width
            type = height
            height = (<TexImageSource>border).height
            width = (<TexImageSource>border).width
            if (border) {
                if (border instanceof ImageBitmap) {
                    debugger
                    console.error("暂时不支持ImageBitmap类型数据")
                } else if (border instanceof ImageData) {
                    pixels = (<ImageData>border).data
                } else if (border instanceof HTMLImageElement) {
                    let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("texCanvas")!
                    canvas.width = border.width
                    canvas.height = border.height
                    let cxt = canvas.getContext("2d")
                    cxt?.drawImage(border, 0, 0)
                    let imageData = cxt?.getImageData(0, 0, border.width, border.height)
                    canvas.width = 0
                    canvas.height = 0
                    pixels = imageData!.data
                } else if (border instanceof HTMLCanvasElement) {
                    pixels = (<HTMLCanvasElement>border).getContext("2d")!.getImageData(0, 0, width, height).data
                } else if (border instanceof HTMLVideoElement) {
                    let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("texCanvas")!
                    canvas.width = border.width
                    canvas.height = border.height
                    let cxt = canvas.getContext("2d")
                    cxt?.drawImage(border, 0, 0)
                    let imageData = cxt?.getImageData(0, 0, border.width, border.height)
                    canvas.width = 0
                    canvas.height = 0
                    pixels = imageData!.data
                } else if (border instanceof OffscreenCanvas) {
                    pixels = (<OffscreenCanvas>border).getContext("2d")!.getImageData(0, 0, width, height).data
                }
            }
            border = 0
        }

        if (border != 0) {
            renderError("this._gameGl.INVALID_VALUE " + this._gameGl.INVALID_VALUE + " in texImage2D")
            return
        }

        if (width <= 0) {
            renderError("this._gameGl.INVALID_VALUE " + this._gameGl.INVALID_VALUE + " in texImage2D")
            return
        }

        if (height <= 0) {
            renderError("this._gameGl.INVALID_VALUE " + this._gameGl.INVALID_VALUE + " in texImage2D")
            return
        }
        if (
            target === this._gameGl.TEXTURE_2D ||
            target === this._gameGl.TEXTURE_CUBE_MAP_POSITIVE_X ||
            target === this._gameGl.TEXTURE_CUBE_MAP_NEGATIVE_X ||
            target === this._gameGl.TEXTURE_CUBE_MAP_POSITIVE_Y ||
            target === this._gameGl.TEXTURE_CUBE_MAP_NEGATIVE_Y ||
            target === this._gameGl.TEXTURE_CUBE_MAP_POSITIVE_Z ||
            target === this._gameGl.TEXTURE_CUBE_MAP_NEGATIVE_Z
        ) {
            let activeTextureData = this._textureUnit.get(this._nowActiveTextureUnit)!

            let textureData: WebGLTextureData | undefined
            if (target === this._gameGl.TEXTURE_2D) {
                textureData = activeTextureData.get(target)
            } else {
                textureData = activeTextureData.get(this._gameGl.TEXTURE_CUBE_MAP)
            }

            if (textureData) {
                // 好像不是立方体纹理的话不会报错(没有验证过)
                // 如果是npot 非2的幂次方的话还要mipmap的话会报错
                if (level > 0 && width % 2 !== 0 && height % 2 !== 0 && width !== 1 && height !== 1) {
                    renderError("this._gameGl.INVALID_VALUE " + this._gameGl.INVALID_VALUE + " in texImage2D")
                } else {
                    /** 用于指定纹理在GPU端的格式，只能是GL_ALPHA, GL_LUMINANCE, GL_LUMINANCE_ALPHA, GL_RGB, GL_RGBA*/
                    // GL_ALPHA, GL_RGB, GL_RGBA, GL_LUMINANCE, and GL_LUMINANCE_ALPHA

                    // 流明/亮度类型的暂时还不是特别理解 所以没做
                    if (
                        (internalformat == this._gameGl.ALPHA ||
                            internalformat == this._gameGl.RGB ||
                            internalformat == this._gameGl.RGBA) &&
                        (format == this._gameGl.ALPHA || format == this._gameGl.RGB || format == this._gameGl.RGBA)
                    ) {
                        if (type == this._gameGl.UNSIGNED_BYTE) {
                            let uint8ArrayData = new Uint8Array(width * height * 4)
                            if (pixels) {
                                uint8ArrayData.set(new Uint8Array(pixels.buffer, pixels.byteOffset, pixels.byteLength))
                            }
                            let texelsData: TexelsData
                            if (target === this._gameGl.TEXTURE_2D) {
                                texelsData = textureData.texelsDatas![0]
                            } else {
                                texelsData = textureData.texelsDatas![this._cubeTexIndex.get(target)!]
                            }
                            if (!texelsData) {
                                texelsData = new TexelsData()
                            }
                            texelsData.setLevelData(level, width, height, uint8ArrayData)
                            if (target === this._gameGl.TEXTURE_2D) {
                                textureData.texelsDatas![0] = texelsData
                            } else {
                                textureData.texelsDatas![this._cubeTexIndex.get(target)!] = texelsData
                            }
                            /** 复制 */
                            // this._useEboBufferData.buffer = new Uint8Array(uint8ArrayData)
                        } else {
                            debugger
                            console.error("type类似暂时只支持UNSIGNED_BYTE")
                        }
                        /**type指的每个通道的位数以及按照什么方式保存，到时候读取数据的时候是以byte还是以short来进行读取。
                         * 只能是GL_UNSIGNED_BYTE, GL_UNSIGNED_SHORT_5_6_5, GL_UNSIGNED_SHORT_4_4_4_4, and GL_UNSIGNED_SHORT_5_5_5_1。
                         * 当type为GL_UNSIGNED_BYTE的时候，每一个byte都保存的是一个颜色通道中的值，当type为GL_UNSIGNED_SHORT_5_6_5, 
                         * GL_UNSIGNED_SHORT_4_4_4_4, and GL_UNSIGNED_SHORT_5_5_5_1的时候，每个short值中将包含了一个像素点的所有颜色信息，
                         * 也就是包含了所有的颜色通道的值。从CPU往GPU传输数据生成纹理的时候，会将这些格式的信息转成float值，
                         * 方法是比如byte，那么就把值除以255，比如GL_UNSIGNED_SHORT_5_6_5，就把red和blue值除以31，green值除以63，
                         * 
                         * 然后再全部clamp到闭区间[0,1]，设计这种type使得绿色更加精确，是因为人类的视觉系统对绿色更敏感。
                         * 而type为GL_UNSIGNED_SHORT_5_5_5_1使得只有1位存储透明信息，使得每个像素要么透明要么不透明，
                         * 这种格式比较适合字体，这样可以使得颜色通道有更高的精度。如果format和type不是这些值，那么就会出现GL_INVALID_ENUM的错误。
    
                            同样的format在OpenGL ES2.0中，将对应相同的internalformat，
                            比如format GL_RGBA就对应着internalformat GL_RGBA，format GL_ALPHA就对应着internalformat GL_ALPHA，
                            这里一共有5种format，也对应着5种internalformat，分别是GL_RGBA，GL_RGB，GL_ALPHA，GL_LUMINANCE，GL_LUMINANCE_ALPHA。
                            internalformat和format需要一一对应，而且确定了internalformat和format之后，type的选择也受到了限制，
                            比如针对internalformat和format为GL_RGB的时候，type只能是GL_UNSIGNED_SHORT_5_6_5或者GL_UNSIGNED_BYTE。
                            而internalformat和format为GL_ALPHA的时候，type只能是GL_UNSIGNED_BYTE。internal format、format和type必须要对应着使用。 */
                    } else {
                        debugger
                        console.error("流明/亮度类型的 internalformat 暂未支持")
                    }
                }
            } else {
            }
        } else {
            debugger
            renderError("其它类型暂未实现 in texImage2D")
        }
    }

    // texSubImage2D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, width: GLsizei, height: GLsizei, format: GLenum, type: GLenum, pixels: ArrayBufferView | null): void;
    // texSubImage2D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, format: GLenum, type: GLenum, source: TexImageSource): void;

    texSubImage2D(
        target: GLenum,
        level: GLint,
        xoffset: GLint,
        yoffset: GLint,
        width: GLsizei,
        height: GLsizei,
        format: GLenum | TexImageSource,
        type: GLenum,
        pixels: ArrayBufferView | null
    ): void {
        if (arguments.length === 7) {
            let source = format
            format = width
            type = height
            height = (<TexImageSource>source).height
            width = (<TexImageSource>source).width
            if (source) {
                if (source instanceof ImageBitmap) {
                    debugger
                    console.error("暂时不支持ImageBitmap类型数据")
                } else if (source instanceof ImageData) {
                    pixels = (<ImageData>source).data
                } else if (source instanceof HTMLImageElement) {
                    let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("texCanvas")!
                    canvas.width = source.width
                    canvas.height = source.height
                    let cxt = canvas.getContext("2d")
                    cxt?.drawImage(source, 0, 0)
                    let imageData = cxt?.getImageData(0, 0, source.width, source.height)
                    canvas.width = 0
                    canvas.height = 0
                    pixels = imageData!.data
                } else if (source instanceof HTMLCanvasElement) {
                    pixels = (<HTMLCanvasElement>source).getContext("2d")!.getImageData(0, 0, width, height).data
                } else if (source instanceof HTMLVideoElement) {
                    let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("texCanvas")!
                    canvas.width = source.width
                    canvas.height = source.height
                    let cxt = canvas.getContext("2d")
                    cxt?.drawImage(source, 0, 0)
                    let imageData = cxt?.getImageData(0, 0, source.width, source.height)
                    canvas.width = 0
                    canvas.height = 0
                    pixels = imageData!.data
                } else if (source instanceof OffscreenCanvas) {
                    pixels = (<OffscreenCanvas>source).getContext("2d")!.getImageData(0, 0, width, height).data
                }
            }
        }

        if (width <= 0) {
            renderError("this._gameGl.INVALID_VALUE " + this._gameGl.INVALID_VALUE + " in texSubImage2D")
            return
        }

        if (height <= 0) {
            renderError("this._gameGl.INVALID_VALUE " + this._gameGl.INVALID_VALUE + " in texSubImage2D")
            return
        }
        if (
            target === this._gameGl.TEXTURE_2D ||
            target === this._gameGl.TEXTURE_CUBE_MAP_POSITIVE_X ||
            target === this._gameGl.TEXTURE_CUBE_MAP_NEGATIVE_X ||
            target === this._gameGl.TEXTURE_CUBE_MAP_POSITIVE_Y ||
            target === this._gameGl.TEXTURE_CUBE_MAP_NEGATIVE_Y ||
            target === this._gameGl.TEXTURE_CUBE_MAP_POSITIVE_Z ||
            target === this._gameGl.TEXTURE_CUBE_MAP_NEGATIVE_Z
        ) {
            let activeTextureData = this._textureUnit.get(this._nowActiveTextureUnit)!

            let textureData: WebGLTextureData | undefined
            if (target === this._gameGl.TEXTURE_2D) {
                textureData = activeTextureData.get(target)
            } else {
                textureData = activeTextureData.get(this._gameGl.TEXTURE_CUBE_MAP)
            }

            if (textureData) {
                // 如果是npot 非2的幂次方的话还要mipmap的话会报错
                if (level > 0 && width % 2 !== 0 && height % 2 !== 0 && width !== 1 && height !== 1) {
                    renderError("this._gameGl.INVALID_VALUE " + this._gameGl.INVALID_VALUE + " in texSubImage2D")
                } else {
                    /** 用于指定纹理在GPU端的格式，只能是GL_ALPHA, GL_LUMINANCE, GL_LUMINANCE_ALPHA, GL_RGB, GL_RGBA*/
                    // GL_ALPHA, GL_RGB, GL_RGBA, GL_LUMINANCE, and GL_LUMINANCE_ALPHA

                    // 流明/亮度类型的暂时还不是特别理解 所以没做
                    if (format == this._gameGl.ALPHA || format == this._gameGl.RGB || format == this._gameGl.RGBA) {
                        if (type == this._gameGl.UNSIGNED_BYTE) {
                            let texelsData: TexelsData
                            if (target === this._gameGl.TEXTURE_2D) {
                                texelsData = textureData.texelsDatas![0]
                            } else {
                                texelsData = textureData.texelsDatas![this._cubeTexIndex.get(target)!]
                            }
                            if (!texelsData || !texelsData.texelMipmapData) {
                                debugger
                            }
                            let texBufferData = texelsData.texelMipmapData.get(level)
                            if (texBufferData && pixels) {
                                /* 这个函数的第一个和第二个输入参数和glTexImage2D的一样，用于指定texture object的类型，
                                以及该给texture的第几层mipmap赋值。错误的情况也与glTexImage2D一样，target传入不支持的值，
                                则会出现GL_INVALID_ENUM的错误，level传入了错误的数字，则会出现GL_INVALID_VALUE的错误。 
                                第三个、第四个、第五个和第六个输入参数的意思是：以texture object的开始为起点，宽度进行xoffset个位置的偏移，
                                高度进行yoffset个位置的偏移，从这个位置开始，宽度为width个单位高度为height的这么一块空间，
                                使用data指向的一块CPU中的内存数据，这块内存数据的format和type为第七和第八个参数，
                                将这块内存数据根据这块texture的internalformat进行转换，转换好了之后，对这块空间进行覆盖。
                                OpenGL ES所支持的format和type刚才已经列举过了，如果使用其它值则为GL_INVALID_ENUM。
                                如果xoffset、yoffset、width、height其中有一个为负，或者xoffset+width大于texture的宽，
                                或者yoffset+height大于texture的高，那么就会出现INVALID_VALUE的错误。*/

                                if (xoffset + width <= texBufferData.width && yoffset + height <= texBufferData.height) {
                                    let copyData = new Uint8Array(pixels.buffer, pixels.byteOffset, pixels.byteLength)
                                    let bufferData = texBufferData.bufferData!
                                    let copyIndex = 0
                                    for (let y = 0; y < height; y++) {
                                        for (let x = 0; x < width; x++) {
                                            let texIndex = ((yoffset + y) * texBufferData.width + (xoffset + x)) * 4
                                            let t = texIndex
                                            bufferData[texIndex++] = copyData[copyIndex++]
                                            bufferData[texIndex++] = copyData[copyIndex++]
                                            bufferData[texIndex++] = copyData[copyIndex++]
                                            bufferData[texIndex++] = copyData[copyIndex++]
                                        }
                                    }
                                } else {
                                    renderError("this._gameGl.INVALID_VALUE " + this._gameGl.INVALID_VALUE + " in texSubImage2D")
                                }
                            } else {
                                renderError("this._gameGl.INVALID_OPERATION " + this._gameGl.INVALID_OPERATION + " in texSubImage2D")
                            }
                            /** 复制 */
                            // this._useEboBufferData.buffer = new Uint8Array(uint8ArrayData)
                        } else {
                            debugger
                            console.error("type类似暂时只支持UNSIGNED_BYTE")
                        }
                        /**type指的每个通道的位数以及按照什么方式保存，到时候读取数据的时候是以byte还是以short来进行读取。
                         * 只能是GL_UNSIGNED_BYTE, GL_UNSIGNED_SHORT_5_6_5, GL_UNSIGNED_SHORT_4_4_4_4, and GL_UNSIGNED_SHORT_5_5_5_1。
                         * 当type为GL_UNSIGNED_BYTE的时候，每一个byte都保存的是一个颜色通道中的值，当type为GL_UNSIGNED_SHORT_5_6_5, 
                         * GL_UNSIGNED_SHORT_4_4_4_4, and GL_UNSIGNED_SHORT_5_5_5_1的时候，每个short值中将包含了一个像素点的所有颜色信息，
                         * 也就是包含了所有的颜色通道的值。从CPU往GPU传输数据生成纹理的时候，会将这些格式的信息转成float值，
                         * 方法是比如byte，那么就把值除以255，比如GL_UNSIGNED_SHORT_5_6_5，就把red和blue值除以31，green值除以63，
                         * 
                         * 然后再全部clamp到闭区间[0,1]，设计这种type使得绿色更加精确，是因为人类的视觉系统对绿色更敏感。
                         * 而type为GL_UNSIGNED_SHORT_5_5_5_1使得只有1位存储透明信息，使得每个像素要么透明要么不透明，
                         * 这种格式比较适合字体，这样可以使得颜色通道有更高的精度。如果format和type不是这些值，那么就会出现GL_INVALID_ENUM的错误。
    
                            同样的format在OpenGL ES2.0中，将对应相同的internalformat，
                            比如format GL_RGBA就对应着internalformat GL_RGBA，format GL_ALPHA就对应着internalformat GL_ALPHA，
                            这里一共有5种format，也对应着5种internalformat，分别是GL_RGBA，GL_RGB，GL_ALPHA，GL_LUMINANCE，GL_LUMINANCE_ALPHA。
                            internalformat和format需要一一对应，而且确定了internalformat和format之后，type的选择也受到了限制，
                            比如针对internalformat和format为GL_RGB的时候，type只能是GL_UNSIGNED_SHORT_5_6_5或者GL_UNSIGNED_BYTE。
                            而internalformat和format为GL_ALPHA的时候，type只能是GL_UNSIGNED_BYTE。internal format、format和type必须要对应着使用。 */
                    } else {
                        debugger
                        console.error("流明/亮度类型的 internalformat 暂未支持")
                    }
                }
            } else {
            }
        } else {
            renderError("其它类型暂未实现 in texSubImage2D")
        }
    }

    /**我们上节课说过，在OpenGL ES中执行绘制命令，可以在绘制buffer的颜色buffer等buffer生成数据。
     * 那么我们想象一下，其实绘制buffer的颜色buffer，也就是一块方形的内存，里面保存了一块方形图像的颜色信息，
     * 由于绘制buffer是有格式的，这个我们在创建surface的时候就已经确定了绘制buffer中颜色buffer的格式，比如是存放RGBA中的哪些通道，
     * 每个通道各占多少位。刚才已经说了glTexImage2D是从CPU客户端把数据读取出来，需要读取的是数据、format、type、width、height，传输到GPU，
     * 遵循CPU的格式和GPU端的格式进行转换，在GPU中生成一个texture。而在绘制buffer中，我们也能获取到用于生成纹理的这些信息，
     * 所以glCopyTexImage2D这个API，就是直接从绘制buffer中读取一块数据，根据绘制buffer的格式和目标纹理的格式进行转换，在GPU中生成一个texture。
     * 它的用处也非常广泛，比如我们游戏中需要的图像，很多是不能或者不需要从CPU读取，比如我们在游戏中进行了拍照，然后在游戏中看我们拍的照片，
     * 那么其实就是从前一帧的绘制buffer中读取一些信息，保存在texture中，在后面的一帧，将这个texture绘制出来。
        这个函数的前三个输入参数和glTexImage2D的一样，用于指定texture object的类型，该给texture的第几层mipmap赋值，以及将要生成纹理的格式internal format。
        错误的情况也与glTexImage2D一样，target传入不支持的值，则会出现GL_INVALID_ENUM的错误，level传入了错误的数字，则会出现GL_INVALID_VALUE的错误。
        internal format传入了不支持的值，则会出现GL_INVALID_ENUM的错误。 第四个、第五个、第六个和第七个输入参数的意思是：以绘制buffer左下角为起点，
        宽度进行x个位置的偏移，高度进行y个位置的偏移，从这个位置开始，宽度为width个单位，高度为height的这么一块空间，从这块空间中进行取值，
        取出来的值用于生成宽为width、高为height的一张纹理。width和height不能小于0，也不能当target为GL_TEXTURE_2D的时候，超过GL_MAX_TEXTURE_SIZE，
        或者当target为其他情况的时候，超过GL_MAX_CUBE_MAP_TEXTURE_SIZE否则，就会出现GL_INVALID_VALUE的错误。但是还有一种可能性，那就是这4个参数构成的方形，
        超过了绘制buffer的区域，那么在区域外读取到的值就是undefine。而如果width和height都为0，那么其实就是创建了一个NULL texture。最后一个参数border，
        代表着纹理是否有边线，在这里必须写成0，也就是没有边线，如果写成其他值，则会出现GL_INVALID_VALUE的错误。
        这个函数没有输出参数，但是有以下几种情况会出错，除了刚才说的那些参数输入错误之外，还有如果target是CubeMap texture的一个面，
        但是width和height不相同，则会出现GL_INVALID_VALUE的错误。如果绘制buffer的format与internal format不匹配，则会出现GL_INVALID_OPERATION的错误，
        比如绘制buffer只有RGB通道，那么internalformat就不能使用含A通道的格式，因为根本没有读取到alpha信息。而当匹配的时候，
        会先将从绘制buffer中读取出来的数据扩展成RGBA四个通道，然后进行归一化，将数据clamp到闭区间[0,1]，然后再转成internalformat的格式。
        我们之前在讲绘制命令的时候说过，绘制buffer可以是egl创建的，也可以是OpenGL ES自己创建的，其实用在这个地方，更多的是使用OpenGL ES自己创建的绘制buffer。
        那么问题就是，如果使用OpenGL ES自己创建的绘制buffer去读取数据生成texture，但是假如OpenGL ES创建的绘制buffer有误，
        那么就会出现GL_INVALID_FRAMEBUFFER_OPERATION的错误。
        所以总结一下，glCopyTexImage2D和glTexImage2D总的来看，其实就是信息来源不同，其它基本一样 */
    copyTexImage2D(
        target: GLenum,
        level: GLint,
        internalformat: GLenum,
        bufferXoffset: GLint,
        bufferYoffset: GLint,
        width: GLsizei,
        height: GLsizei,
        border: GLint
    ): void {
        if (border != 0) {
            renderError("this._gameGl.INVALID_VALUE " + this._gameGl.INVALID_VALUE + " in copyTexImage2D")
            return
        }

        if (width <= 0) {
            renderError("this._gameGl.INVALID_VALUE " + this._gameGl.INVALID_VALUE + " in copyTexImage2D")
            return
        }

        if (height <= 0) {
            renderError("this._gameGl.INVALID_VALUE " + this._gameGl.INVALID_VALUE + " in copyTexImage2D")
            return
        }
        if (
            target === this._gameGl.TEXTURE_2D ||
            target === this._gameGl.TEXTURE_CUBE_MAP_POSITIVE_X ||
            target === this._gameGl.TEXTURE_CUBE_MAP_NEGATIVE_X ||
            target === this._gameGl.TEXTURE_CUBE_MAP_POSITIVE_Y ||
            target === this._gameGl.TEXTURE_CUBE_MAP_NEGATIVE_Y ||
            target === this._gameGl.TEXTURE_CUBE_MAP_POSITIVE_Z ||
            target === this._gameGl.TEXTURE_CUBE_MAP_NEGATIVE_Z
        ) {
            let activeTextureData = this._textureUnit.get(this._nowActiveTextureUnit)!

            let textureData: WebGLTextureData | undefined
            if (target === this._gameGl.TEXTURE_2D) {
                textureData = activeTextureData.get(target)
            } else {
                textureData = activeTextureData.get(this._gameGl.TEXTURE_CUBE_MAP)
            }

            if (textureData) {
                // 如果是npot 非2的幂次方的话还要mipmap的话会报错
                if (level > 0 && width % 2 !== 0 && height % 2 !== 0 && width !== 1 && height !== 1) {
                    renderError("this._gameGl.INVALID_VALUE " + this._gameGl.INVALID_VALUE + " in copyTexImage2D")
                } else {
                    /** 用于指定纹理在GPU端的格式，只能是GL_ALPHA, GL_LUMINANCE, GL_LUMINANCE_ALPHA, GL_RGB, GL_RGBA*/
                    // GL_ALPHA, GL_RGB, GL_RGBA, GL_LUMINANCE, and GL_LUMINANCE_ALPHA

                    // 流明/亮度类型的暂时还不是特别理解 所以没做
                    if (internalformat == this._gameGl.ALPHA || internalformat == this._gameGl.RGB || internalformat == this._gameGl.RGBA) {
                        let destData = new Uint8Array(width * height * 4)

                        let writeColorFramebuffer = this.customGetNowColorBuffer()
                        let renderSize = this.customGetNowRenderSize()
                        let frameBuffer = new Uint8ClampedArray(
                            writeColorFramebuffer.buffer,
                            writeColorFramebuffer.byteOffset,
                            writeColorFramebuffer.byteLength
                        )
                        let copyData = frameBuffer
                        let frameWidth = renderSize.x
                        let copyIndex = 0
                        for (let y = 0; y < height; y++) {
                            for (let x = 0; x < width; x++) {
                                let factX = this._viewPort.x + bufferXoffset + x
                                let factY = this._viewPort.y + bufferYoffset + y
                                let bufferIndex = (factY * frameWidth + factX) * 4
                                destData[copyIndex++] = copyData[bufferIndex++]
                                destData[copyIndex++] = copyData[bufferIndex++]
                                destData[copyIndex++] = copyData[bufferIndex++]
                                destData[copyIndex++] = copyData[bufferIndex++]
                            }
                        }

                        let texelsData = new TexelsData()
                        texelsData.setLevelData(level, width, height, destData)
                        if (target === this._gameGl.TEXTURE_2D) {
                            textureData.texelsDatas![0] = texelsData
                        } else {
                            textureData.texelsDatas![this._cubeTexIndex.get(target)!] = texelsData
                        }
                    } else {
                        console.error("流明/亮度类型的 internalformat 暂未支持")
                    }
                }
            } else {
            }
        } else {
            renderError("其它类型暂未实现 in copyTexImage2D")
        }
    }

    /**这个API的功能和刚才的glCopyTexImage2D类似，顾名思义，刚才那个API是给texture object这个整体传入数据，
     * 这个glCopyTexSubImage2D是给texture object的一部分传入数据。这个API的目的类似glTexSubImage2D，
     * 不会改变texture object的internalformat、width、height、参数以及指定部分之外的内容。
     这个函数的第一个和第二个输入参数和glTexSubImage2D的一样，用于指定texture object的类型，以及该给texture的第几层mipmap赋值。
     错误的情况也与glCopyTexImage2D一样，target传入不支持的值，则会出现GL_INVALID_ENUM的错误，level传入了错误的数字，则会出现GL_INVALID_VALUE的错误。 
     后面6个输入参数的意思是：以绘制buffer的左下角为起点，宽度进行x个位置的偏移，高度进行y个位置的偏移，从这个位置开始，
     宽度为width个单位高度为height的这么一块空间，使用这块空间的数据，去改变指定texture object的左下角为起点，宽度进行xoffset个位置的偏移，
     高度进行yoffset个位置的偏移，从这个位置开始，宽度为width个单位高度为height的这么一块区域的信息，它们公用了width和height这两个参数，
     原因也很简单，就是像素点是一一对应的，所以从绘制buffer中取多大区域的信息，就更改了对应texture多大区域的数据。
     如果width和height为0也没关系，只是这样的话这个命令就没有任何结果了。如果xoffset、yoffset、width、height其中有一个为负，
     或者xoffset+width大于texture的宽，或者yoffset+height大于texture的高，那么就会出现INVALID_VALUE的错误。
     这个函数没有输出参数。除了刚才那些因为参数问题导致的错误，还有，如果target指定的这个texture还没有被glTexImage2D或者glCopyTexImage2D分配好空间，
     或者如果绘制buffer的format与internal format不匹配，则会出现GL_INVALID_OPERATION的错误。如果使用OpenGL ES自己创建的绘制buffer去读取数据生成texture，
     但是假如OpenGL ES创建的绘制buffer有误，那么就会出现GL_INVALID_FRAMEBUFFER_OPERATION的错误。 */
    copyTexSubImage2D(
        target: GLenum,
        level: GLint,
        xoffset: GLint,
        yoffset: GLint,
        bufferXoffset: GLint,
        bufferYoffset: GLint,
        width: GLsizei,
        height: GLsizei
    ): void {
        if (width <= 0) {
            renderError("this._gameGl.INVALID_VALUE " + this._gameGl.INVALID_VALUE + " in copyTexSubImage2D")
            return
        }

        if (height <= 0) {
            renderError("this._gameGl.INVALID_VALUE " + this._gameGl.INVALID_VALUE + " in copyTexSubImage2D")
            return
        }
        if (
            target === this._gameGl.TEXTURE_2D ||
            target === this._gameGl.TEXTURE_CUBE_MAP_POSITIVE_X ||
            target === this._gameGl.TEXTURE_CUBE_MAP_NEGATIVE_X ||
            target === this._gameGl.TEXTURE_CUBE_MAP_POSITIVE_Y ||
            target === this._gameGl.TEXTURE_CUBE_MAP_NEGATIVE_Y ||
            target === this._gameGl.TEXTURE_CUBE_MAP_POSITIVE_Z ||
            target === this._gameGl.TEXTURE_CUBE_MAP_NEGATIVE_Z
        ) {
            let activeTextureData = this._textureUnit.get(this._nowActiveTextureUnit)!

            let textureData: WebGLTextureData | undefined
            if (target === this._gameGl.TEXTURE_2D) {
                textureData = activeTextureData.get(target)
            } else {
                textureData = activeTextureData.get(this._gameGl.TEXTURE_CUBE_MAP)
            }

            if (textureData) {
                // 如果是npot 非2的幂次方的话还要mipmap的话会报错
                if (level > 0 && width % 2 !== 0 && height % 2 !== 0 && width !== 1 && height !== 1) {
                    renderError("this._gameGl.INVALID_VALUE " + this._gameGl.INVALID_VALUE + " in copyTexSubImage2D")
                } else {
                    let texelsData: TexelsData
                    if (target === this._gameGl.TEXTURE_2D) {
                        texelsData = textureData.texelsDatas![0]
                    } else {
                        texelsData = textureData.texelsDatas![this._cubeTexIndex.get(target)!]
                    }
                    let texBufferData = texelsData.texelMipmapData.get(level)
                    if (texBufferData) {
                        let destData = texBufferData.bufferData!
                        let writeColorFramebuffer = this.customGetNowColorBuffer()
                        let renderSize = this.customGetNowRenderSize()
                        let frameBuffer = new Uint8ClampedArray(
                            writeColorFramebuffer.buffer,
                            writeColorFramebuffer.byteOffset,
                            writeColorFramebuffer.byteLength
                        )
                        let copyData = frameBuffer
                        let frameWidth = renderSize.x
                        let texWidth = texBufferData.width
                        for (let y = 0; y < height; y++) {
                            for (let x = 0; x < width; x++) {
                                let texIndex = ((yoffset + y) * texWidth + (xoffset + x)) * 4
                                let factX = this._viewPort.x + bufferXoffset + x
                                let factY = this._viewPort.y + bufferYoffset + y
                                let bufferIndex = (factY * frameWidth + factX) * 4
                                destData[texIndex++] = copyData[bufferIndex++]
                                destData[texIndex++] = copyData[bufferIndex++]
                                destData[texIndex++] = copyData[bufferIndex++]
                                destData[texIndex++] = copyData[bufferIndex++]
                            }
                        }
                    } else {
                        renderError("this._gameGl.INVALID_OPERATION " + this._gameGl.INVALID_OPERATION + " in copyTexSubImage2D")
                    }
                }
            } else {
            }
        } else {
            renderError("其它类型暂未实现 in copyTexSubImage2D")
        }
    }

    /**通过上面的API，我们已经生成了一张可以使用的纹理，并且，我们还知道了这张纹理的宽和高。
     * 下面我们要把这张纹理映射到绘制buffer上，那么映射的过程，需要用到一个新的概念，纹理坐标。
     * 顾名思义，纹理坐标，意思就是纹理的坐标，用于在纹理中限定一块区域，将这块区域，显示到绘制buffer的指定区域上。
     * 回忆一下OpenGL ES pipeline，通过之前的课程，我们创建了一套VS和PS，并传入了顶点信息，在VS中讲计算出各个顶点的位置，
     * 其实每个顶点还可以包含更多的值，比如顶点颜色、纹理坐标、法线信息、切线信息等，这里我们先说每个顶点对应着的纹理坐标，
     * 纹理坐标是用于指定该顶点对应纹理中的某个点。纹理坐标，我们又称之为UV坐标，以纹理的左下角为坐标原点，
     * 有两种度量形式：一个顶点在纹理中的纹理坐标通常用（u,v）表示，u和v的最大值分别是纹理的宽度和高度，通常由开发者来提供，
     * 通过attribute的形式将与顶点数量匹配的纹理坐标传入vertex shader，每个纹理坐标对应一个顶点，意思就是要将该顶点与纹理中的指定点对应，
     * 然后所有顶点确定好之后，在光栅化的时候，会对uv坐标进行归一化生成st坐标，取值为闭区间［0，1］。
     * 在光珊化的时候，生成像素点的顶点坐标，并使用插值smooth（或者非插值flat）的方法生成每个像素点的纹理坐标（颜色、深度等），
     * 使得屏幕上的点可以于纹理图片中对应。然后我们再将纹理以uniform sampler2D/samplerCube的形式传入PS，在PS中通过纹理坐标对纹理进行采样，
     * 得到的纹理中对应的颜色，映射到光珊化产生的像素点上，对像素点进行着色，作为一部分像素点的颜色信息，用这些颜色计算出当前像素点最终的颜色。
     * 当然也有的纹理是用于做为像素点的深度或者模板信息，但是最多情况，还是做为颜色信息。理解了纹理坐标以及其工作原理之后，
     * 我们来举个例子，比如，我们生成的这张纹理是一个头像，那么我们准备将这个头像显示在图片的左上角，作为主角的头像，点击这个头像，
     * 还可以看到放大版的头像。那么假如原本的纹理宽和高为64*64，而我们将头像放到左上角的时候，宽和高为32*32，然而点击放大的时候，
     * 头像的宽和高又变成了128*128。所以在这里这两种映射方式的纹理坐标是一样的，都是选定整张纹理去进行映射，
     * 但是对应的顶点位置以及由顶点位置确定的大小不一样。所以究竟是如何把一张64*64的纹理图片，映射成32*32和128*128的图片呢，
     * 这里就牵扯到了映射算法，而纹理映射有很多种算法，所以需要通过明确规定纹理属性的方法，确定映射算法。
     * 下面，我们将介绍纹理属性，同时，介绍纹理属性对应的映射算法。而glTexParameter*这个API，就是用于设置纹理属性的。
        这个函数的第一个输入参数用于指定texture object的类型，必须是GL_TEXTURE_2D或者GL_TEXTURE_CUBE_MAP。
        用于指定当前active的纹理单元中的一张texture，也就是用这个target来确定设置哪张纹理的属性。所以想要修改一张纹理的属性，
        先要通过glActiveTexture，enable一个纹理单元，然后通过glBindTexture，把这个texture绑定到这个纹理单元上。
        然后保持这个纹理单元处于active的状态，再调用这个API，来修改指定纹理的属性。
        第二个输入参数和第三个输入参数，用于指定修改纹理的什么属性，以及修改成什么值。其中，第二个参数有四种选择。
        可以是GL_TEXTURE_MIN_FILTER, GL_TEXTURE_MAG_FILTER, GL_TEXTURE_WRAP_S, or GL_TEXTURE_WRAP_T。
        下面分别介绍这4种属性以及它们可以支持的数值：
        第一个属性，GL_TEXTURE_MIN_FILTER是用于纹理被使用的那块区域的尺寸小于纹理尺寸，需要将纹理缩小的情况，
        针对这种情况，有六种映射算法。其中两种算法是直接将原始纹理上的一个点或者四个点拿去计算，得出映射点的值，
        另外四种算法需要借用到mipmap。mipmap刚才我们已经介绍过了，我们说过一个纹理，可以有多层mipmap，每层mipmap宽高以2倍速率递减，
        直到宽高均为1。一张纹理的mipmap可以通过glGenerateMipmap利用算法，根据纹理base level的值生成，
        也可以通过glTexImage2D、glCopyTexImage2D、以及glCompressedTexImage2D，给指定texture的指定level层赋值。
        这些API除了glCompressedTexImage2D，我们都在上面说过了，而glCompressedTexImage2D我们将在下节课讲纹理优化的时候进行解释说明。
        那么下面详细介绍一下GL_TEXTURE_MIN_FILTER对应的六种算法。
        第一种是
            GL_NEAREST，就是直接取原始纹理限定区域中最接近的一个像素的信息，作为映射点的信息，举个例子，
            比如将一个5*5的纹理，整张映射到3*3的一张图片上，那么理论上，映射图片的中间点应该就是从纹理的中间点取值。
        第二种是
            GL_LINEAR，就是根据原始纹理限定区域中最接近的四个像素的信息，计算出来一个加权平均值，作为映射点的信息，
            举个例子，还是比如将一个5*5的纹理，整张映射到3*3的一张图片上，那么理论上，映射图片左下角的点的值，
            应该就是根据纹理左下角四个点的值计算而来。
        第三种是
            GL_NEAREST_MIPMAP_NEAREST，就是先选择一张与映射图片大小最接近的mipmap层，然后从这个mipmap层中，取最接近的一个像素的信息，
            作为映射点的信息，举个例子，比如将一个64*64的纹理，整张映射到4*4的一张图片上，我们知道64*64的纹理有很多mipmap层，
            第0层的宽高就是64，第1层的宽高为32，依此类推，第5层的宽高为4，正好与映射图片大小一致。那么理论上，就取这第5层的像素点的信息，
            直接对应到映射图片的各个点上即可。
        第四种是
            GL_LINEAR_MIPMAP_NEAREST，就是先选择一张与映射图片大小最接近的mipmap层，然后从这个mipmap层中，取最接近的四个像素的信息，
            计算出来一个加权平均值，作为映射点的信息，举个例子，还是比如将一个64*64的纹理，整张映射到4*4的一张图片上，我们还是会选择第5层mipmap，
            然后理论上，映射图片左下角的点的值，应该就是根据这第5层mipmap左下角四个点的值计算出来的加权平均值。
        第五种是
            GL_NEAREST_MIPMAP_LINEAR，就是先选择两张与映射图片大小最接近的mipmap层，然后从这两个mipmap层中，分别取最接近的一个像素的信息，
            计算出来一个加权平均值，作为映射点的信息，举个例子，比如将一个64*64的纹理，整张映射到5*5的一张图片上，我们就会取第4层和第5层mipmap，
            然后理论上，映射图片左下角的点的值，应该就是根据第4层mipmap左下角点的值和第5层mipmap左下角点的值计算出来的加权平均值。
        第六种是
            GL_LINEAR_MIPMAP_LINEAR，这种算法最复杂。就是先选择两张与映射图片大小最接近的mipmap层，然后从这两个mipmap层中，
            分别取四个最接近的像素的信息，分别计算加权平均值，然后根据这两个加权平均值，再计算出来一个加权平均值，作为映射点的信息，
            举个例子，还是比如将一个64*64的纹理，整张映射到5*5的一张图片上，我们还是会选择第4层和第5层mipmap，然后理论上，映射图片左下角的点的值，
            应该就是根据这第4层mipmap左下角四个点的值计算出来的加权平均值与第5层mipmap左下角四个点的值计算出来的加权平均值，算出来的加权平均值。
        需要注意的是，如果在shader中注明要使用mipmap，比如texture2D传入了第三个参数bias，那么GL_TEXTURE_MIN_FILTER一定要使用带mipmap的这后面四种映射算法。
        在纹理的缩小函数中，基本都是将多个纹理中读出的点计算出一个映射图片上的点，所以走样的几率会偏低，但是由于也会丢失一部分纹素，
        而丢失的纹素可能包含重要的颜色过渡信息，那样就会导致贴图失真，造成锯齿，在游戏中表现为远景部分，由于物体受到近大远小的影响，
        对物体纹理进行了缩小处理，则会出现模糊。然而也可以想象到，这6种算法，肯定是效率和效果不能兼得，其中前两种不同过mipmap的GL_NEAREST和GL_LINEAR最快，
        它们只需要通过一张纹理图片上的点进行采样即可，但是GL_NEAREST更容易导致比例严重的失真，
        高分辨率的图像在低分辨率的设备上就会出现一些像素点跳跃比较大的情况，而GL_LINEAR在纹理缩小的时候，像素点过渡比较平滑，虽然会损失一些性能，
        但是效果会稍微好一点。而默认情况下GL_TEXTURE_MIN_FILTER对应的算法是GL_NEAREST_MIPMAP_LINEAR。
        针对纹理的时候，纹素的丢失可能导致的图片锯齿问题，为了消除锯齿，有一门专门的图形学技术叫做反锯齿，英文叫做AA。
        在OpenGL ES中是通过多重采样技术实现的反锯齿。先说单重采样，比如我们根据纹理映射得到了一张映射图片，那么将映射图片传入绘制buffer的时候，
        单重采样会采用一一对应的方法，但是多重采样则会利用了多重采样缓冲区，
        由该点附近多个位置的颜色、depth、stencil的采样共同决定绘制buffer上一个像素点的信息，这样也就使得图片的边缘可以比较平滑的过渡，减小视觉上的瑕疵。
        生成每个像素使用邻近采样点的数量，数量越多，抗锯齿效果越明显，但相应的也会影响性能。这个最大数量受到硬件支持的限制，可以通过glGet函数，
        传入参数GL_MAX_SAMPLES来查询当前硬件支持的最大数量。多重采样只是针对多边形的边缘进行抗锯齿处理，所以对应用程序的性能影响比较小。
        在3D游戏的开发中，这个技术已经比较普遍了，但是在2D游戏中，由于大部分元素都是规则且垂直于摄像机的，所以锯齿现象不是特别明显，
        但是如果游戏中需要绘制一些不规则的线段或者多边形，则最好开启多重采样。
        第二个纹理属性，GL_TEXTURE_MAG_FILTER，与GL_TEXTURE_MIN_FILTER相反，它是用于纹理被使用的那块区域尺寸大于纹理尺寸，
        需要将纹理放大的情况，针对这种情况，只有两种映射算法。可想而知，需要将纹理放大，那么mipmap这种比原始纹理还小的纹理就没有意义了，
        所以可使用的映射算法就是GL_NEAREST和GL_LINEAR。这两种算法和刚才一样，就不介绍具体如何映射的了。但是有一点需要注意，
        由于将纹理放大，那么之前纹理上的一个点可能就要对应映射图片上的多个点，这样很有可能就会出现大块的纯色区域。
        特别是GL_NEAREST算法，虽然比GL_LINEAR快，但是由于GL_LINEAR还是会使用相邻的四个点计算出来加权平均值，这样的话，
        映射图片上相邻的点颜色就不会完全一样，会有一个平滑的过渡，但是GL_NEAREST则直接使用一个个像素点，去生成一个个像素块。
        所以GL_LINEAR效果会明显比GL_NEAREST要好一些。GL_TEXTURE_MAG_FILTER对应的默认算法就是GL_LINEAR。
        第三个和第四个纹理属性放在一起来说，GL_TEXTURE_WRAP_S和GL_TEXTURE_WRAP_T。这个属性与纹理坐标息息相关，
        默认我们理解纹理的uv坐标最大值就是宽高，st值就是[0,1]。但是，其实也有超过了[0,1]的情况，意思也就是想通过纹理坐标去纹理上取值，
        但是取到了纹理外面了，那么我们可以想象到，可以把纹理外面包一层，这一层的内容都是根据纹理的内容设置的，这个不是简单的把纹理拉大，
        而是把纹理外面套一层，套的这一层的内容就是根据这两个属性指定的算法计算出来的。这两个属性支持的算法都是只有三个，
        分别是GL_CLAMP_TO_EDGE, GL_REPEAT, 和 GL_MIRRORED_REPEAT。
        将GL_TEXTURE_WRAP_S设置为GL_CLAMP_TO_EDGE的意思就是，假如s坐标超过范围[0,1]，那么纹理外面套的那一层，横向部分，
        以纹理的边界值的颜色进行填充，假如纹理图片的边为黑色，内部为白色，那么会横向填充黑色。
        将GL_TEXTURE_WRAP_S设置为GL_REPEAT的意思就是，假如s坐标超过范围[0,1]，那么纹理外面套的那一层，横向部分，则对纹理图片进行复制，将横向完全填满。
        将GL_TEXTURE_WRAP_S设置为GL_MIRRORED_REPEAT的话，与设置为GL_REPEAT类似，假如s坐标超过范围[0,1]，
        那么纹理外面套的那一层，横向部分，则对纹理图片进行镜像复制，将横向完全填满。
        GL_TEXTURE_WRAP_S都是进行横向填充，GL_TEXTURE_WRAP_T则是进行纵向填充。GL_TEXTURE_WRAP_S和GL_TEXTURE_WRAP_T的默认算法都是GL_REPEAT。
        这个API的三个参数的值上面已经全部列举出来了，特别是第二个和第三个参数要搭配使用，如果用错，则会出现GL_INVALID_ENUM的错误。
        这个函数没有输出参数。如果GL_TEXTURE_MIN_FILTER设置的是需要使用mipmap的四个算法之一，但是纹理为NPOT的纹理，
        又或者纹理的mipmap不是通过glGenerateMipmap，而是通过glTexImage2D、glCopyTexImage2D、以及glCompressedTexImage2D，
        生成的，但是没有给需要的level赋值或者赋值的格式不对，那么就相当于本次绘制是用了一张RGBA为（0，0，0，1）的纹理。
        而如果纹理为NPOT的话，但是GL_TEXTURE_WRAP_T、GL_TEXTURE_WRAP_S没有使用GL_CLAMP_TO_EDGE，也就相当于用了一张RGBA为（0，0，0，1）的纹理。
        总结一下，刚才我们一共说了纹理的三个属性，第一个属性，缩放，也就是假如纹理坐标对应的纹理区域与映射区域大小不同，
        需要对纹理进行放大或者缩小的时候，设定相应的映射算法。设定好的算法，可以平衡好采样的效率和效果，所以开发者在设置的时候需要根据自己的需要进行设置。
        第二个属性，wrapmode，假如纹理坐标st使用到了超过［0，1］的坐标，那么针对横向和纵向，对纹理的外层进行填充，设定相应的填充算法。
        第三个属性，mipmap，也就是给纹理对象设置一系列的小纹理，用于当映射区域小于纹理坐标限定的纹理区域大小的时候，
        可以借助小纹理中进行采样。尽管纹理的filer属性可以用于处理适当的纹理缩放，但远远不能满足图形应用程序的需求。
        由于纹理可能会经过远大于2倍的缩放，那么就会很容易造成失真，而由于移动设备的分辨率差异很大，所以不同设备使用同一个分辨率的资源，
        就会很容易出现缩放超过2倍的情况发生。
        mipmap的功能分两层，第一层就是会在进行缩小的时候，提高采样效率，因为从一张小纹理进行采样肯定会比从一张大纹理中采样要速度快，
        效果说不定还会比大纹理采样的结果好，因为生成mipmap的时候，我们可以通过glHins选择GL_NICEST的方式，这样小纹理不会特别的失真，
        （下面我们会再介绍glHints这个API）。然而如果使用大纹理再进行GL_NEAREST的话会更容易失真。当然有人可能说那生成mipmap是需要耗费资源的，
        其实大部分mipmap都是在离线生成好，然后在游戏不忙的时候将资源传入，生成纹理的，再不济也是会选择在游戏不忙的时候使用glGeneratemipmap生成，
        虽然一定程度上影响了应用程序的性能，但是减少了对GPU内存和带宽占用，且只需要generate一次，尽量不会让生成mipmap成为游戏性能的瓶颈。
        第二层功能，就是有时候显示小图片的时候其实是使用不一样的内容，这样的话就需要mipmap是通过glTexImage2D等API传入的，
        而非glGeneratemipmap生成的，这样的话开发者就可以控制texture的第i层mipmap的内容，比如可以让mipmap第0层显示人物的全身照片，
        而第1层显示人物的大头照。这样，把纹理绘制到绘制buffer上的时候，根据纹理坐标大小，导致同一张纹理绘制出来的结果不同。
        所以mipmap是非常有用的，它只有一点不好，那就是如果离线生成mipmap内容的话，会导致包体要稍微大一些，每张纹理大概会比原来多占用1/3的空间。
        */
    texParameterf(target: GLenum, pname: GLenum, param: GLfloat): void {
        if (target === this._gameGl.TEXTURE_2D || target === this._gameGl.TEXTURE_CUBE_MAP) {
            let activeTextureData = this._textureUnit.get(this._nowActiveTextureUnit)
            if (activeTextureData) {
                let textureData: WebGLTextureData | undefined = activeTextureData.get(target)
                if (textureData) {
                    if (pname == this._gameGl.TEXTURE_MIN_FILTER) {
                        console.log("TEXTURE_MIN_FILTER " + param)
                        if (param == this._gameGl.NEAREST) {
                            textureData.parameter.set(this._gameGl.TEXTURE_MIN_FILTER, param)
                        } else if (param == this._gameGl.LINEAR) {
                            textureData.parameter.set(this._gameGl.TEXTURE_MIN_FILTER, param)
                        } else {
                            console.error("mipmap类型的采样暂未实现")
                        }
                    } else if (pname == this._gameGl.TEXTURE_MAG_FILTER) {
                        console.log("TEXTURE_MAG_FILTER " + param)
                        if (param == this._gameGl.NEAREST) {
                            textureData.parameter.set(this._gameGl.TEXTURE_MAG_FILTER, param)
                        } else if (param == this._gameGl.LINEAR) {
                            textureData.parameter.set(this._gameGl.TEXTURE_MAG_FILTER, param)
                        }
                    } else if (pname == this._gameGl.TEXTURE_WRAP_S) {
                        if (param == this._gameGl.REPEAT || param == this._gameGl.CLAMP_TO_EDGE || param == this._gameGl.MIRRORED_REPEAT) {
                            textureData.parameter.set(this._gameGl.TEXTURE_WRAP_S, param)
                        }
                    } else if (pname == this._gameGl.TEXTURE_WRAP_T) {
                        if (param == this._gameGl.REPEAT || param == this._gameGl.CLAMP_TO_EDGE || param == this._gameGl.MIRRORED_REPEAT) {
                            textureData.parameter.set(this._gameGl.TEXTURE_WRAP_T, param)
                        }
                    } else {
                        console.error("无法识别的 texParameterf")
                        debugger
                    }
                } else {
                    renderError("this._gameGl.INVALID_OPERATION " + this._gameGl.INVALID_OPERATION + " in texParameterf")
                }
            }
        } else {
            renderError("其它类型暂未实现 in texParameterf")
        }
    }
    texParameteri(target: GLenum, pname: GLenum, param: GLint): void {
        this.texParameterf(target, pname, param)
    }

    /**这个API已经被提起很多遍了，我们再总结一下。首先，先介绍一下mipmap。Mipmap又称多级纹理，每个纹理都可以有mipmap，
     * 也都可以没有mipmap。这个概念我们在上面有接触过，当时我们说了有mipmap的texture就好比一层一层塔一样，每一层都需要赋值。
     * 纹理texture object就是GPU中一块内存，这块内存中保存着一定宽高的颜色信息以及其他属性信息。
     * 而一个texture object中可以包含不止一块内存，mipmap的texture object就包含着多级内存的。
     * 比如，我们创建的texture object的宽和高为32*32，那么我们知道，当纹理被准备好的时候，
     * 会拥有一块可以存放32*32个像素点颜色信息的内存。如果我们通过命令使得texture object包含多级内存，
     * 第一级内存就是刚才那块保存了32*32个像素点颜色信息的内存，而第二级内存就是保存了16*16个像素点颜色信息的内存，
     * 依次类推，每降低以及，宽和高都将缩小一倍，一直到第六级内存就是保存了1*1个像素点颜色信息的内存。
     * 也就是说，宽高为32*32的纹理，如果生成多级纹理，就会多出5块内存，大小分别是16*16,8*8,4*4,2*2,1*1。
     * 当生成多级纹理之后，我们使用texture object name指定的texture object，就是这个包含了多级纹理的纹理。
     * 多级纹理的用处一会我们再说，我们先说多级纹理是如何生成的。我们在说glTexImage2D这个API的时候，
     * 说过纹理的内存是通过这个API生成的，当使用这个API的时候，第二个输入参数就是制定给纹理的第几层赋值，
     * 当时我们都是给第0层赋值，那么现在我们就知道了，第0层为纹理的base level，那么默认都是给第0层赋值，
     * 但是我们也可以通过这个API给纹理的第1层mipmap，第2层mipmap赋值，一直到第N层mipmap。
     * 而这个在给第i层mipmap赋值的时候顺便也就把需要的内存生成出来。我们也说过每个纹理的mipmap是有限制的，
     * 比如32*32的texture只能有6层mipmap，而64*64的texture有7层mipmap，依次类推。但是通过这个方式，一次只能给一层mipmap赋值，
     * 将多级纹理的所有层都赋上值，需要调用好多次命令。所以就有了glGenerateMipmap这个函数，
     * 这个函数就是将一个base level已经准备好的纹理，生成它的各级mipmap。这两种方式唯一的区别在于，通过glTexImage2D赋值的时候，
     * 对应texture object对应的内存存放的值是由开发者指定的，开发者可以往里面随意存入数值，
     * 而通过glGenerateMipmap这个函数生成的多级纹理中存储的值，第i层的值都是直接或者间接根据第0层的值计算出来的。生成算法一会再说。
        这个函数的输入参数用于指定texture object的类型，必须是GL_TEXTURE_2D或者GL_TEXTURE_CUBE_MAP，
        来指定当前active的纹理单元中的一张texture，也就是用这个target来确定生成哪张纹理的mipmap。
        所以想要对一张纹理生成mipmap，先要通过glActiveTexture，enable一个纹理单元，然后通过glBindTexture，
        把这个texture绑定到这个纹理单元上。然后保持这个纹理单元处于active的状态，再调用这个API，来生成指定纹理的mipmap。
        如果输入了错误的target，就会出现GL_INVALID_ENUM的错误。
        这个函数没有输出参数。除了刚才那些因为参数问题导致的错误，还有，如果target是CubeMap texture，
        但是它的6个面的width、height、format、type并非完全相同，则会出现GL_INVALID_OPERATION的错误。
        而这种6个面的width、height、format、type并非完全相同的CubeMap texture，我们则称它为cube non-complete。
        还有上个课时也说过，在OpenGL ES2.0中NPOT的texture是不支持mipmap的，所以如果对NPOT的texture调用这个API生成mipmap，
        就会出现GL_INVALID_OPERATION的错误。最后还有，如果指定的texture的第0层，是压缩格式的纹理内容，
        那么，就会出现GL_INVALID_OPERATION的错误。
        经过这个API，会根据第0层的数据产生一组mipmap数据，这组mipmap数据会替换掉texture之前的除了第0层之外的所有层的数据，
        第0层保持不变。所有层数据的internalformat都与第0层保持一致，每层的宽高都是上一层宽高除以2，一直到宽高均为1的一层。
        然后除了第0层之外，每一层的数据都是通过上一层计算出来的，算法也比较简单，一般都是根据四个像素点的值算出一个像素点的值即可，
        OpenGL ES并没有规定使用什么算法，不过OpenGL ES会通过glHint这个API，建议使用什么算法，glHint这个API一会我们再说。 */
    generateMipmap(target: GLenum): void {
        if (target === this._gameGl.TEXTURE_2D || target === this._gameGl.TEXTURE_CUBE_MAP) {
            let activeTextureData = this._textureUnit.get(this._nowActiveTextureUnit)
            if (activeTextureData) {
                let textureData: WebGLTextureData | undefined = activeTextureData.get(target)
                if (textureData) {
                    console.error("generateMipmap 方法暂未实现")
                } else {
                    renderError("this._gameGl.INVALID_OPERATION " + this._gameGl.INVALID_OPERATION + " in hint")
                }
            }
        } else {
            renderError("其它类型暂未实现 in hint")
        }
    }

    /**我们知道，OpenGL ES的Spec规定了OpenGL ES API的功能，但是具体如何实现的，
     * 则是GPU driver的开发人员根据自己的想法实现的，比如刚才我们说到的glGenerateMipmap的功能就是给指定texture生成mipmap数据，
     * 但是具体的生成算法，就是根据开发人员自己来定了。但是开发人员可以设计多种生成算法，
     * 然后再通过glHints来选择一种作为生成多级纹理的算法。
        这个函数的第一个输入参数用于指定一种GPU行为，在这里只能输入GL_GENERATE_MIPMAP_HINT，
        否则的话，则会出现GL_INVALID_ENUM的错误。也就是说在OpenGL ES2.0中，只有生成多级纹理的算法，
        可以通过这个API来选择。第二个输入参数也就是针对刚才指定的GPU的行为，使用哪种方式去实现。
        这里有三种选择，默认是GL_DONT_CARE，也就是随意选择一种算法。另外两种分别是GL_FASTEST，顾名思义，
        就是选择一种最有效率的算法。还有GL_NICEST，就是选择一种生成纹理最正确，质量最高的算法。如果输入了其他值，
        则会出现GL_INVALID_ENUM的错误。虽然这里做出了看似正确的选择，但是哪个算法是最有效率的，
        而哪个算法是最正确、质量最高的，这种还是需要在GPU中写算法的时候就指定出来，指定好哪个算法是最有效率的，
        哪个算法是最正确、质量最高的。当然，也可以不指定，然后在GPU driver中选择忽略这个API。
        这个函数没有输出参数。 */
    hint(target: GLenum, mode: GLenum): void {
        if (target === this._gameGl.TEXTURE_2D || target === this._gameGl.TEXTURE_CUBE_MAP) {
            let activeTextureData = this._textureUnit.get(this._nowActiveTextureUnit)
            if (activeTextureData) {
                let textureData: WebGLTextureData | undefined = activeTextureData.get(target)
                if (textureData) {
                    if (mode === this._gameGl.DONT_CARE || mode === this._gameGl.FASTEST || mode === this._gameGl.NICEST) {
                        textureData.mipmapCreateType = mode
                    } else {
                        renderError("this._gameGl.INVALID_ENUM " + this._gameGl.INVALID_ENUM + " in hint")
                    }
                } else {
                    renderError("this._gameGl.INVALID_OPERATION " + this._gameGl.INVALID_OPERATION + " in hint")
                }
            }
        } else {
            renderError("其它类型暂未实现 in hint")
        }
    }

    /**纹理一旦被传输至GPU，就会一直留在GPU管理的内存中。因此我们应该留意那些不再被使用的纹理，及时的从GL内存中删除它们，
     * 以减少应用程序内存的占用。所以当texture不再被需要的时候，则可以通过glDeleteTextures这个API把texture object name删除。
        这个函数的输入参数的意思是该API会删除n个texture object，当n小于0的时候，出现INVALID_VALUE的错误。
        textures保存的就是这些texture object的变量名。如果传入的变量名为0，或者对应的不是一个合法的texture object，那么API就会被忽略掉。
        这个函数没有输出参数。当texture object被删除之后，其中的内容也会被删掉，名字也会被释放，
        可以被glGenTextures重新使用。如果被删除的texture正在处于bind状态，那么就相当于先将该texture关联的纹理单元active，
        然后执行了一次glBindTexture把对应的binding变成binging 0，也就相当于什么都没有bind了。 */
    deleteTexture(texture: WebGLTexture | null): void {
        let textureData = this._textureDataMap.get((<CPUWebGLTexture>texture).cachIndex)
        if (textureData && textureData.glTarget) {
            let set = textureData.bindTextureUnitSet
            set.forEach((unit) => {
                let unitMap = this._textureUnit.get(unit)
                if (unitMap) {
                    unitMap.delete(textureData!.glTarget!)
                }
            })
            set.clear()
            this._textureDataMap.delete((<CPUWebGLTexture>texture).cachIndex)
            let frameBufferObj = this._nowUseFramebufferObject
            if (frameBufferObj) {
                frameBufferObj.deAttachTexture((<CPUWebGLTexture>texture).cachIndex)
            }
        }
    }

    compressedTexImage2D(
        target: GLenum,
        level: GLint,
        internalformat: GLenum,
        width: GLsizei,
        height: GLsizei,
        border: GLint,
        data: ArrayBufferView
    ): void {
        debugger
        console.error("纹理优化这一章节暂时略过 没看 等完成webgl的实现再来看这一节")
    }
    compressedTexSubImage2D(
        target: GLenum,
        level: GLint,
        xoffset: GLint,
        yoffset: GLint,
        width: GLsizei,
        height: GLsizei,
        format: GLenum,
        data: ArrayBufferView
    ): void {
        console.error("纹理优化这一章节暂时略过 没看 等完成webgl的实现再来看这一节")
    }

    /**window-system-provided framebuffer是由EGL创建的，无法被OpenGL ES所控制，
     * 而application-created framebuffer是由OpenGL ES创建、更改、销毁的。
     * 而 glGenFramebuffers 这 个 API,就是用于先创建 application-created framebuffer 的 name,然后再通过 API glBindFramebuffer 创建一个 FBO。
     * 先说 glGenFramebuffers,glBindFramebuffer 这个 API 一会再进行说明。
        window-system-provided framebuffer被创建的时候会关联一些color buffer、depth buffer（如果有）、stencil buffer（如果有）。
        而application-created framebuffer是不会自动创建及关联这些buffer的，所以又多了一个新的概念，叫做renderbuffer，
        renderbuffer对应了framebuffer中的color\depth\stencil等buffer，由于FBO是由OpenGL ES创建的，那么理所当然renderbuffer也是由OpenGL ES创建。
        而glGenRenderbuffers、glBindRenderbuffer和glRenderbufferStorage就是用于创建FBO对应的renderbuffer的，关于renderbuffer的API我们一会再说。
        这个函数的第一个输入参数的意思是该 API 会生成 n 个 framebuffer object name, 当 n 小于 0 的时候,出现 INVALID_VALUE 的错误。
        第二个输入参数用于保存被创建的 framebuffer object name。这些 framebuffer object name 其实也就是一些数字,
        而且假如一次性生成多个 framebuffer object name,那么它们没有必要必须是连续的数字。 framebuffer object name 是 uint 类型,
        而且 0 对应的就是window-system-provided framebuffer，已经被预留了，所以肯定是一个大于 0 的整数。
        这个函数没有输出参数。当创建成功的时候,会在第二个参数 framebuffer 中生成 n 个之前没有使用过的 framebuffer objects 的 name。
        然后这些 name 会被标记为已使用,而这个标记只对 glGenFramebuffers 这个 API 有效,也就是再通过这个 API 生成更多的 framebuffer object name 的时候,
        不会使用之前创建的这些 framebuffer objects name，除非这些framebuffer objects name由被glDeleteFramebuffers Delete掉。
         所以回忆一下,这一步其实只是创建了一些 framebuffer object name,而没有真正的创建 framebuffer object。
         而只有在这些 framebuffer object name 被 glBindFramebuffer 进行 bind 之后, 才会真正的创建对应的 framebuffer object。 */
    createFramebuffer(): WebGLFramebuffer | null {
        return new CPUWebGLFramebuffer(globalFramebufferIndex++)
    }

    /**上一个 API glGenFramebuffers 只创建了一些 framebuffer object 的 name,glBindFramebuffer 这个 API 再创建一个 framebuffer object。
     *  这个函数的第一个输入参数的意思是指定 framebuffer object 的类型，framebuffer object目前只有一种类似，那就是GL_FRAMEBUFFER。
     * 那么在这里，第一个输入参数必须是 GL_FRAMEBUFFER 。如果传入其他的参数,就会报 INVALID_ENUM 的错误。
     * 第二个输入参数为刚才 glGenFramebuffers 得到的 framebuffer object name。
        这个函数没有输出参数,假如传入的 framebuffer 是刚被创建的 framebuffer object name,而且它还没有被创建和关联一个 framebuffer object,
        那么通过这个 API,就会生成一个 framebuffer object,且与这个 framebuffer object name 关联在一起,之后指定某个 framebuffer object name 的时候,
        也就相当于指定这个 framebuffer object。新创建的 framebuffer object 是一个空间为 0,且初始状态为默认值的 framebuffer object，
        一个FBO有一个color attachment挂载点、一个depth attachment挂载点、一个stencil attachment挂载点。然后创建和关联完毕之后,
        也就会把这个 framebuffer object 当作是当前 GPU 所使用的 framebuffer 了，也就是说OpenGL ES再次绘制的时候，
        将不再绘制到 window-system-provided framebuffer，而是绘制到这个FBO上了。
        而如果通过API glReadPixels、glCopyTexImage2D和glCopyTexSubImage2D进行读取的话，也将从这个FBO种进行读取。
        如果传入的 framebuffer 已经有关联的 framebuffer object 了,那么只是把该 framebuffer object 指定为当前 GPU 所使用的 framebuffer。
        然后 GPU 之前使用的 framebuffer 或者 FBO 就不再是处于被使用状态了。
        所以回忆一下,通过 glGenFramebuffers 创建一些 framebuffer object name,
        然后通过 glBindFramebuffer,给 framebuffer object name 创建和关联一个 framebuffer object,同时,通过这个 API,
        还将参数 framebuffer 对应的 framebuffer object 设置为目前 GPU 所使用的 framebuffer。虽然 GPU 中可以存放大量的 framebuffer object,
        但是同一时间一个 thread 的一 个 context 中只能有一个 framebuffer 是被使用着的。之后关于 framebuffer 的操作, 
        比如查询 framebuffer 的状态等,就会直接操作 GL_FRAMEBUFFER ,而不会在使用 framebuffer object name 了。如果当前GL_FRAMEBUFFER 为0，
        那么查询或者修改GL_FRAMEBUFFER，则会出现GL_INVALID_OPERATION 的错误。所以,如果想使用某个 framebuffer object,
        必须先通过 glBindFramebuffer 这个 API,把这个 framebuffer 推出来,设置为 GPU 当前的 framebuffer。对FBO的操作，
        也就直接影响到FBO上挂载的attachment。
        初始的时候，相当于执行了glBindFramebuffer(GL_FRAMEBUFFER,0);上面也说了FBO 0对应着window-system-provided framebuffer，
        所以所有的操作的操作都是在window-system-provided framebuffer上进行操作。
        window-system-provided framebuffer 和application-created framebuffer的最主要的区别是：1. FBO的attachment可以修改。
        在OpenGL ES2.0中FBO只能有一个color attachment挂载点GL_COLOR_ATTACHMENT0、一个depth attachment挂载点GL_DEPTH_ATTACHMENT、
        一个stencil attachment挂载点GL_STENCIL_ATTACHMENT，而这三个挂载点初始都为GL_NONE，
        需要通过API glFramebufferRenderbuffer和glFramebufferTexture2D手动挂载。挂载到上面的RBO和texture也是由OpenGL ES来创建和控制。
        2. 无论读取还是写入，像素所有权测试总是通过(Patrick：什么是像素所有权测试？)。
        3. FBO的buffer无法像framebuffer那样可以被swap到屏幕上，所以OpenGL ES针对这种绘制叫做off-screen rendering。4.没有multisample buffer，
        所以针对FBO的 GL_SAMPLES 和GL_SAMPLE_BUFFERS 均为0。
        通过glBindFramebuffer active的FBO可以通过glBindFramebuffer bind另外一个FBO或者bind0的方式，或者是glDeleteFramebuffers的方式deactivate。
        framebuffer object name 和对应的 framebuffer object 和 shader 以及 program 一样,都属于一个 namespace,也就是可以被多个 share context 进行共享。 */
    bindFramebuffer(target: GLenum, framebuffer: WebGLFramebuffer | null): void {
        if (target == this._gameGl.FRAMEBUFFER) {
            if (framebuffer) {
                let cachIndex = (<CPUWebGLFramebuffer>framebuffer).cachIndex
                let framebufferObj = this._framebufferObjectMap.get(cachIndex)
                if (!framebufferObj) {
                    framebufferObj = new WebGLFramebufferObject(<CPUWebGLFramebuffer>framebuffer)
                    this._framebufferObjectMap.set(cachIndex, framebufferObj)
                }
                this._nowUseFramebufferObject = framebufferObj
            } else {
                // 重置为系统默认的fbo
                this._nowUseFramebufferObject = null
            }
        } else {
            renderError("this._gameGl.INVALID_ENUM " + this._gameGl.INVALID_ENUM + " in bindFramebuffer")
        }
    }
    /**renderbuffer就是FBO上关联的一块buffer（texture也可以）。renderbuffer是由OpenGL ES创建和管理的，
     * 所以可以随意的将其与FBO进行attach和detach，甚至可以将其与多个FBO绑定，这样可以避免了数据copy以及减少了内存浪费。
     * 这一点window-system-provided framebuffer就做不到。
        renderbuffer被attach到FBO上后，当该FBO active后，这块renderbuffer就被作为OpenGL ES实际绘制和读取的目标。
        这个函数的第一个输入参数的意思是该 API 会生成 n 个 renderbuffer object name, 当 n 小于 0 的时候,
        出现 INVALID_VALUE 的错误。第二个输入参数用于保存被创建的 renderbuffer object name。
        这些 renderbuffer object name 其实也就是一些数字,而且假如一次性生成多个 renderbuffer object name,
        那么它们没有必要必须是连续的数字。 renderbuffer object name 是 uint 类型，而且 0 已经被预留了，
        虽然0并没有对应任何东西，所以肯定是一个大于 0 的整数。
        这个函数没有输出参数。当创建成功的时候,会在第二个参数 renderbuffer 中生成 n 个之前没有使用过的 renderbuffer objects 的 name。
        然后这些 name 会被标记为已使用,而这个标记只对 glGenRenderbuffers 这个 API 有效,
        也就是再通过这个 API 生成更多的 renderbuffer object name 的时候,不会使用之前创建的这些 renderbuffer objects name，
        除非这些renderbuffer objects name由被glDeleteRenderbuffers Delete掉。 所以回忆一下,
        这一步其实只是创建了一些 renderbuffer object name,而没有真正的创建 renderbuffer object。
        而只有在这些 renderbuffer object name 被 glBindRenderbuffer 进行 bind 之后, 才会真正的创建对应的 renderbuffer object。
        void glBindRenderbuffer(GLenum target, GLuint renderbuffer); */
    createRenderbuffer(): WebGLRenderbuffer | null {
        return new CPUWebGLRenderbuffer(globalRenderbufferIndex++)
    }

    /**上一个 API glGenRenderbuffers 只创建了一些 renderbuffer object 的 name,glBindRenderbuffer 这个 API 再创建一个 renderbuffer object。 
     * 这个函数的第一个输入参数的意思是指定 renderbuffer object 的类型，renderbuffer object目前只有一种类似，那就是GL_RENDERBUFFER。
     * 那么在这里，第一个输入参数必须是 GL_RENDERBUFFER 。如果传入其他的参数,就会报 INVALID_ENUM 的错误。
     * 第二个输入参数为刚才 glGenRenderbuffers 得到的 renderbuffer object name。
        这个函数没有输出参数,假如传入的 renderbuffer 是刚被创建的 renderbuffer object name,而且它还没有被创建和关联一个 renderbuffer object,
        那么通过这个 API,就会生成一个 renderbuffer object,且与这个 renderbuffer object name 关联在一起,之后指定某个 renderbuffer object name 的时候,
        也就相当于指定这个 renderbuffer object。新创建的 renderbuffer object 是一个空间为 0,
        格式为GL_RGBA4，red, green, blue, alpha, depth, and stencil的像素位均为0，且初始状态为默认值的 renderbuffer object。
        然后创建和关联完毕之后,也就会把这个 renderbuffer object 当作是当前 GPU 所使用的 RBO 了。
        如果传入的 renderbuffer 已经有关联的 renderbuffer object 了,那么只是把该 renderbuffer object 指定为当前 GPU 所使用的 renderbuffer。
        然后 GPU 之前使用的 RBO 就不再是处于被使用状态了。
        所以回忆一下,通过 glGenRenderbuffers 创建一些 renderbuffer object name,然后通过 glBindRenderbuffer,
        给 renderbuffer object name 创建和关联一个 renderbuffer object,同时,通过这个 API,
        还将参数 renderbuffer 对应的 renderbuffer object 设置为目前 GPU 所使用的 renderbuffer。
        虽然 GPU 中可以存放大量的 renderbuffer object,但是同一时间一个 thread 的一 个 context 中只能有一个 renderbuffer 是被使用着的。
        之后关于 renderbuffer 的操作, 比如查询 renderbuffer 的状态等,就会直接操作 GL_RENDERBUFFER ,而不会在使用 renderbuffer object name 了。
        如果当前GL_RENDERBUFFER 为0，那么查询或者修改GL_RENDERBUFFER，则会出现 GL_INVALID_OPERATION 的错误。所以,如果想使用某个 renderbuffer object,
        必须先通过 glBindRenderbuffer 这个 API,把这个 renderbuffer 推出来,设置为 GPU 当前的 RBO。
        初始的时候，相当于执行了glBindRenderbuffer(GL_RENDERBUFFER,0);执行了这个，GL_RENDERBUFFER的binging就会恢复到初始状态。
        通过glBindRenderbuffer active的RBO可以通过glBindRenderbuffer bind另外一个RBO或者bind0的方式，或者是glDeleteRenderbuffers的方式deactivate。
        renderbuffer object name 和对应的 renderbuffer object 和 framebuffer object、shader 以及 program 一样,都属于一个 namespace,
        也就是可以被多个 share context 进行共享。 */
    bindRenderbuffer(target: GLenum, renderbuffer: WebGLRenderbuffer | null): void {
        if (target == this._gameGl.RENDERBUFFER) {
            if (renderbuffer) {
                let cachIndex = (<CPUWebGLRenderbuffer>renderbuffer).cachIndex
                let renderbufferObj = this._renderbufferObjectMap.get(cachIndex)
                if (!renderbufferObj) {
                    renderbufferObj = new WebGLRenderbufferObject(<CPUWebGLRenderbuffer>renderbuffer)
                    this._renderbufferObjectMap.set(cachIndex, renderbufferObj)
                }
                this._nowUseRenderbufferObject = renderbufferObj
            } else {
                // 重置为系统默认的rbo
                this._nowUseRenderbufferObject = null
            }
        } else {
            renderError("this._gameGl.INVALID_ENUM " + this._gameGl.INVALID_ENUM + " in bindRenderbuffer")
        }
    }

    /**通过上面2个API创建了一个size为0的RBO，虽然这个RBO可以attach到FBO上，但是依然无法被使用，
     * 因为绘制buffer尺寸怎么可以只为0呢，所以就通过glRenderbufferStorage这个API给RBO创建、初始化存储空间。
        这个函数的第一个输入参数的意思是指定 renderbuffer object 的类型，renderbuffer object目前只有一种类似，
        那就是GL_RENDERBUFFER。那么在这里，第一个输入参数必须是 GL_RENDERBUFFER 。如果传入其他的参数,就会报 INVALID_ENUM 的错误。
        由于RBO是将作为FBO的color/depth/stencil attachment，所以第二个输入参数internalformat必须为color/depth/stencil相关的格式。
        其中，如果该RBO将作为color attachment，那么internalformat必须为GL_RGBA4/GL_RGB5_A1/GL_RGB565，如果该RBO将作为depth attachment，
        那么internalformat必须为GL_DEPTH_COMPONENT16，如果该RBO将作为stencil attachment，那么internalformat必须为GL_STENCIL_INDEX8。
        否则，则会出现GL_INVALID_ENUM的错误。第三个和第四个参数width、height为RBO的尺寸，如果width或者height超过GL_MAX_RENDERBUFFER_SIZE，
        或者小于0，则会出现GL_INVALID_VALUE的错误。如果在执行这个API的时候，当前没有RBO active，
        也就是说当前处于glBindRenderbuffer(GL_RENDERBUFFER,0);的状态，则会出现GL_INVALID_OPERATION的错误。
        这个函数没有输出参数，如果OpenGL ES无法创建所需要尺寸的一块空间，则出现GL_OUT_OF_MEMORY的错误。
        如果该RBO之前就关联了一块空间，那么之前关联的空间将会被销毁。执行完这个命令后，新生成的这块buffer为undefined。
        虽然通过这个API创建的空间可以是各种各样的，但是一旦创建好之后，RBO的尺寸和格式将无法更改。 */
    renderbufferStorage(target: GLenum, internalformat: GLenum, width: GLsizei, height: GLsizei): void {
        if (target == this._gameGl.RENDERBUFFER) {
            let renderbufferObj = this._nowUseRenderbufferObject
            // 不能使用系统的
            if (renderbufferObj) {
                renderbufferObj.initBufferData(width, height, internalformat)
            } else {
                renderError("this._gameGl.INVALID_OPERATION " + this._gameGl.INVALID_OPERATION + " in renderbufferStorage")
            }
        } else {
            renderError("this._gameGl.INVALID_ENUM " + this._gameGl.INVALID_ENUM + " in renderbufferStorage")
        }
    }

    /**通过上面5个api，创建了FBO和RBO，下面就要把RBO和FBO关联起来，所使用的函数，就是这个glFramebufferRenderbuffer。
     * 通过这个API可以将指定的RBO关联到GPU当前的FBO上。
        这个函数的第一个输入参数的意思是指定 framebuffer object 的类型，framebuffer object目前只有一种类似，那就是GL_FRAMEBUFFER。
        那么在这里，第一个输入参数必须是 GL_FRAMEBUFFER 。如果传入其他的参数,就会报 GL_INVALID_ENUM 的错误。
        如果当前GPU没有指定的FBO，也就是说当前GPU使用的是window-system-provided framebuffer的话，则会出现 GL_INVALID_OPERATION 的错误。
        第二个参数必须是FBO的3个挂载点之一，GL_COLOR_ATTACHMENT0, GL_DEPTH_ATTACHMENT or GL_STENCIL_ATTACHMENT，否则，则会出现GL_INVALID_ENUM 的错误。
        第三个参数renderbuffertarget和第四个参数renderbuffer相关，如果第四个参数为0，那么第三个参数就无所谓了，
        这样的话会把当前FBO的attachment point上attach的东西进行detach。但是如果第四个参数为一个非0的，
        那么第三个参数必须为GL_RENDERBUFFER ，否则则会出现 GL_INVALID_ENUM 的错误。而如果第四个参数不是0，
        也不是一个已有的RBO name，则会出现 GL_INVALID_OPERATION 的错误。
        这个函数没有输出参数，如果参数都无误，其中renderbuffer不为0，则该RBO就被attach到当前FBO的attachment point上了。
        GL的状态GL_FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE就被设为GL_RENDERBUFFER，
        而GL_FRAMEBUFFER_ATTACHMENT_OBJECT_NAME则会被设置为第四个参数renderbuffer了。
        （初始状态下，GL_FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE ：GL_NONE；GL_FRAMEBUFFER_ATTACHMENT_OBJECT_NAME ：0；
        GL_FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL ：0 ；
        GL_FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE ：GL_TEXTURE_CUBE_MAP_POSITIVE_X）其他attachment point的状态不变。
        当然，如果这个API执行出错，则所有状态都不变。
        需要注意的是，如果某个RBO被delete掉了，那么首先会把这个RBO从当前FBO的attachment point上detach掉（如果之前attach了的话）。
        但是如果该RBO还被attach到了其他FBO上，那么那些FBO上的该RBO不会自动detach，需要应用程序自己去完成这个工作。 */
    framebufferRenderbuffer(target: GLenum, attachment: GLenum, renderbuffertarget: GLenum, renderbuffer: WebGLRenderbuffer | null): void {
        if (target == this._gameGl.FRAMEBUFFER) {
            let frameBufferObj = this._nowUseFramebufferObject
            if (frameBufferObj) {
                if (!renderbuffer || (<CPUWebGLRenderbuffer>renderbuffer).cachIndex === 0) {
                    if (attachment == this._gameGl.COLOR_ATTACHMENT0) {
                        frameBufferObj.clearColorAttach()
                    } else if (attachment == this._gameGl.DEPTH_ATTACHMENT) {
                        frameBufferObj.clearDepthAttach()
                    } else if (attachment == this._gameGl.STENCIL_ATTACHMENT) {
                        frameBufferObj.clearStencilAttach()
                    } else {
                        renderError("this._gameGl.INVALID_ENUM " + this._gameGl.INVALID_ENUM + " in renderbufferStorage")
                    }
                } else {
                    if (renderbuffertarget == this._gameGl.RENDERBUFFER) {
                        let renderbufferObj = this._renderbufferObjectMap.get((<CPUWebGLRenderbuffer>renderbuffer).cachIndex)
                        if (renderbufferObj) {
                            if (attachment == this._gameGl.COLOR_ATTACHMENT0) {
                                frameBufferObj.setColorAttachByRender(renderbufferObj)
                            } else if (attachment == this._gameGl.DEPTH_ATTACHMENT) {
                                frameBufferObj.setDepthAttachByRender(renderbufferObj)
                            } else if (attachment == this._gameGl.STENCIL_ATTACHMENT) {
                                frameBufferObj.setStencilAttachByRender(renderbufferObj)
                            } else {
                                renderError("this._gameGl.INVALID_ENUM " + this._gameGl.INVALID_ENUM + " in renderbufferStorage")
                            }
                        } else {
                            renderError("this._gameGl.INVALID_OPERATION " + this._gameGl.INVALID_OPERATION + " in renderbufferStorage")
                        }
                    }
                }
            } else {
                renderError("this._gameGl.INVALID_OPERATION " + this._gameGl.INVALID_OPERATION + " in framebufferRenderbuffer")
            }
        } else {
            renderError("this._gameGl.INVALID_ENUM " + this._gameGl.INVALID_ENUM + " in framebufferRenderbuffer")
        }
    }

    /**在本节的最开始就说了，FBO的buffer可以是RBO，还可以是texture，反正左右就是一块buffer。
     * texture的创建在OPENGL ES 2.0 知识串讲 (9) ——OPENGL ES 详解III(纹理)一节已经说的很清楚了，那么在这里就说，
     * 如何通过glFramebufferTexture2D这个API将texture attach到FBO上。
        OpenGL ES支持把framebuffer/FBO的内容通过APIglCopyTexImage2D copy到texture。那么在这里，其实OpenGL ES也支持直接往texture里面绘制内容，
        只要将该texture attach到FBO上即可。这个函数的第一个输入参数的意思是指定 framebuffer object 的类型，framebuffer object目前只有一种类似，
        那就是GL_FRAMEBUFFER。那么在这里，第一个输入参数必须是 GL_FRAMEBUFFER 。如果传入其他的参数,就会报 GL_INVALID_ENUM 的错误。
        如果当前GPU没有指定的FBO，也就是说当前GPU使用的是window-system-provided framebuffer的话，则会出现 GL_INVALID_OPERATION 的错误。
        第二个参数必须是FBO的3个挂载点之一，GL_COLOR_ATTACHMENT0, GL_DEPTH_ATTACHMENT or GL_STENCIL_ATTACHMENT，
        否则，则会出现GL_INVALID_ENUM 的错误。第三个参数textarget、第四个参数texture和第五个参数level相关，如果第四个参数为0，
        那么第三个参数和第五个参数就无所谓了，这样的话会把当前FBO的attachment point上attach的东西进行detach。但是如果第四个参数为一个非0的，
        而且指向一个2D的texture，那么第三个参数必须为GL_TEXTURE_2D ，否则则会出现 GL_INVALID_OPERATION 的错误。而如果第四个参数不是0，
        而且指向一个Cubemap的texture，那么第三个参数必须为GL_TEXTURE_CUBE_MAP_POSITIVE_X, GL_TEXTURE_CUBE_MAP_NEGATIVE_X, 
        GL_TEXTURE_CUBE_MAP_POSITIVE_Y, GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, GL_TEXTURE_CUBE_MAP_POSITIVE_Z, or GL_TEXTURE_CUBE_MAP_NEGATIVE_Z，
        否则则会出现GL_INVALID_OPERATION的错误。如果第四个参数不是0，也不是一个已有的texture name，则会出现 GL_INVALID_OPERATION 的错误。
        如果第四个参数不是0，且第三个参数不是GL_TEXTURE_2D，GL_TEXTURE_CUBE_MAP_POSITIVE_X, GL_TEXTURE_CUBE_MAP_NEGATIVE_X, 
        GL_TEXTURE_CUBE_MAP_POSITIVE_Y, GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, GL_TEXTURE_CUBE_MAP_POSITIVE_Z, or GL_TEXTURE_CUBE_MAP_NEGATIVE_Z，
        则会出现 GL_INVALID_ENUM 的错误。第五个参数level指的是该texture的mipmap，在这里必须为0，否则则会出现GL_INVALID_VALUE的错误。
        这个函数没有输出参数，如果参数都无误，其中texture不为0，则该texture就被attach到当前FBO的attachment point上了。
        GL的状态GL_FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE就被设为GL_TEXTURE，而GL_FRAMEBUFFER_ATTACHMENT_OBJECT_NAME则会被设置为第四个参数texture了，
        GL_FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL也就会被设置为第五个参数level，也就还是0。如果传入的texture为cubemap的，
        则GL_FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE也就被设置为第三个参数textarget了。其他attachment point的状态不变。
        当然，如果这个API执行出错，则所有状态都不变。
        需要注意的是，如果某个texture被delete掉了，那么首先会把这个texture从当前FBO的attachment point上detach掉（如果之前attach了的话）。
        但是如果该texture还被attach到了其他FBO上，那么那些FBO上的该texture不会自动detach，需要应用程序自己去完成这个工作。
        还有一点需要注意，被attach到当前FBO上的texture，不能作为shader的输入texture，否则就会出现从texture中读取信息，然后再写入该texture的问题。
        这种情况虽然看起来FBO是正常的，但是其实写入FBO的时候会出现undefined，读取texture也会出现undefined。除非第五个参数为0，
        而GL_TEXTURE_MIN_FILTER 不为 GL_NEAREST 和 GL_LINEAR，而是GL_NEAREST_MIPMAP_NEAREST, GL_NEAREST_MIPMAP_LINEAR, GL_LINEAR_MIPMAP_NEAREST,
         or GL_LINEAR_MIPMAP_LINEAR，而且真的没有采到纹理的第0层mipmap。(Patrick：这一点需要测试一下)
        类似的还有另外一种情况可能发生，就是一个texture作为当前FBO的color attachment，
        然后从这个FBO通过APIglCopyTexImage2D把color attachment内容读取到这个texture中，
        并且glCopyTexImage2D的第2个参数level等于attach到FBO的那个level，也就是0（否则应该不会有问题，(Patrick：这一点也需要测试一下)），
        那么又出现了从一个texture又读又写的情况，那么写入texture就会出现undefined的结果。 */
    framebufferTexture2D(target: GLenum, attachment: GLenum, textarget: GLenum, texture: WebGLTexture | null, level: GLint): void {
        if (target == this._gameGl.FRAMEBUFFER) {
            let frameBufferObj = this._nowUseFramebufferObject
            if (frameBufferObj) {
                if (!texture) {
                    if (attachment == this._gameGl.COLOR_ATTACHMENT0) {
                        frameBufferObj.clearColorAttach()
                    } else if (attachment == this._gameGl.DEPTH_ATTACHMENT) {
                        frameBufferObj.clearDepthAttach()
                    } else if (attachment == this._gameGl.STENCIL_ATTACHMENT) {
                        frameBufferObj.clearStencilAttach()
                    } else {
                        renderError("this._gameGl.INVALID_ENUM " + this._gameGl.INVALID_ENUM + " in framebufferTexture2D")
                    }
                } else {
                    let textureData = this._textureDataMap.get((<CPUWebGLTexture>texture).cachIndex)

                    if (textureData) {
                        if (textureData.glTarget == this._gameGl.TEXTURE_2D && textarget !== this._gameGl.TEXTURE_2D) {
                            renderError("this._gameGl.INVALID_OPERATION " + this._gameGl.INVALID_OPERATION + " in framebufferTexture2D")
                        } else if (
                            textureData.glTarget == this._gameGl.TEXTURE_CUBE_MAP &&
                            textarget !== this._gameGl.TEXTURE_CUBE_MAP_POSITIVE_X &&
                            textarget !== this._gameGl.TEXTURE_CUBE_MAP_NEGATIVE_X &&
                            textarget !== this._gameGl.TEXTURE_CUBE_MAP_POSITIVE_Y &&
                            textarget !== this._gameGl.TEXTURE_CUBE_MAP_NEGATIVE_Y &&
                            textarget !== this._gameGl.TEXTURE_CUBE_MAP_POSITIVE_Z &&
                            textarget !== this._gameGl.TEXTURE_CUBE_MAP_NEGATIVE_Z
                        ) {
                            renderError("this._gameGl.INVALID_OPERATION " + this._gameGl.INVALID_OPERATION + " in framebufferTexture2D")
                        } else if (level !== 0) {
                            renderError("this._gameGl.INVALID_VALUE " + this._gameGl.INVALID_VALUE + " in framebufferTexture2D")
                        } else {
                            if (attachment == this._gameGl.COLOR_ATTACHMENT0) {
                                frameBufferObj.setColorAttachByTex(textureData, textarget)
                            } else if (attachment == this._gameGl.DEPTH_ATTACHMENT) {
                                frameBufferObj.setDepthAttachByTex(textureData, textarget)
                            } else if (attachment == this._gameGl.STENCIL_ATTACHMENT) {
                                frameBufferObj.setStencilAttachByTex(textureData, textarget)
                            } else {
                                renderError("this._gameGl.INVALID_ENUM " + this._gameGl.INVALID_ENUM + " in framebufferTexture2D")
                            }
                        }
                    } else {
                        renderError("this._gameGl.INVALID_ENUM " + this._gameGl.INVALID_ENUM + " in framebufferTexture2D")
                    }
                }
            } else {
                renderError("this._gameGl.INVALID_OPERATION " + this._gameGl.INVALID_OPERATION + " in framebufferTexture2D")
            }
        } else {
            renderError("this._gameGl.INVALID_ENUM " + this._gameGl.INVALID_ENUM + " in framebufferTexture2D")
        }
    }

    /**当FBO准备好了之后，就可以被使用了，可以用glCheckFramebufferStatus这个API确认FBO是否准备好，然而FBO准备好，需要满足如下两个条件之一。
        GL_FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE 为 GL_NONE，也就是没有东西attach到FBO上。(Patrick：这一点需要测试一下)
        GL_FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE 不为 GL_NONE，并且attach的buffer宽高非0，
        且RBO/texture格式匹配（GL_COLOR_ATTACHMENT0 format为GL_RGBA4/GL_RGB5_A1/GL_RGB565，
        GL_DEPTH_ATTACHMENT format为GL_DEPTH_COMPONENT16，GL_STENCIL_ATTACHMENT format为GL_STENCIL_INDEX8）。
        也就是说，至少有一个RBO/texture attach到FBO上，否则就会出现GL_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT的错误。
        这个attach还必须是没问题的，否则就会出现GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT的错误
        （比如FBO上attach的某个RBO/texture被delete掉了，或者width\height为0，或者格式不匹配）。
        所有attach的RBO/texture的尺寸必须完全一致，否则就会出现GL_FRAMEBUFFER_INCOMPLETE_DIMENSIONS的错误。
        几个attachment的组合不违背平台的设计，否则就会出现GL_FRAMEBUFFER_UNSUPPORTED(Patrick：这一点从没关注过，也无所谓吧)
        当然，如果使用windows-system-provided framebuffer，肯定是framebuffer complete。
        如下操作会改变framebuffer complete的状态：
        通过glBindFramebuffer切换FBO
        通过glFramebufferRenderbuffer和glFramebufferTexture2D改变/detach FBO的attachment
        通过glTexImage2D, glCopyTexImage2D和glCompressedTexImage2D改变FBO上attach的texture的尺寸/格式
        通过glRenderbufferStorage改变FBO上attach的RBO的尺寸/格式
        通过glDeleteTextures或者glDeleteRenderbuffers删除当前FBO上attach的RBO/texture
        由于framebuffer是否complete很重要，所以建议在绘制之前调用一下这个API。
        这个函数的第一个输入参数必须是 GL_FRAMEBUFFER 。如果传入其他的参数,就会报 GL_INVALID_ENUM 的错误
        如果这个函数的执行出现错误，则返回0。如果framebuffer complete，则返回GL_FRAMEBUFFER_COMPLETE。如果framebuffer非complete，则返回相应的enum。
        如果framebuffer不complete，那么使用当前FBO去读操作（glReadPixels, glCopyTexImage2D, glCopyTexSubImage2D）
        和写操作（glClear, glDrawArrays, glDrawElements），就会出现GL_INVALID_FRAMEBUFFER_OPERATION 的错误。 */
    checkFramebufferStatus(target: GLenum): GLenum {
        let status = this._gameGl.INVALID_ENUM
        if (target == this._gameGl.FRAMEBUFFER) {
            if (this._nowUseFramebufferObject) {
                // 判断至少应该有颜色attach
                if (this._nowUseFramebufferObject.colorAttachPoint) {
                    // 自身不做尺寸 FRAMEBUFFER_UNSUPPORTED的校验了
                    status = this._gameGl.FRAMEBUFFER_COMPLETE
                } else {
                    status = this._gameGl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT
                }
            } else {
                // 系统的应该是默认成功
                status = this._gameGl.FRAMEBUFFER_COMPLETE
            }
        } else {
            renderError("this._gameGl.INVALID_ENUM " + this._gameGl.INVALID_ENUM + " in framebufferTexture2D")
        }
        return status
    }

    /**当某个 FBO 不再被需要的时候,则可以通过 glDeleteFramebuffers 这个 API 把 framebuffer object name 删除。
        这个函数输入参数的意思是该 API 会删除 n 个 framebuffer object,当 n 小于 0 的 时候,出现 GL_INVALID_VALUE 的错误。 
        framebuffer 保存的就是这些 framebuffer object 的变量名。如果传入的变量名为 0,或者对应的不是一个合法的 framebuffer object,那么 API 就会被忽略掉。
        这个函数没有输出参数。当 framebuffer object 被删除之后,其中attach的物件会被自动detach,
        名字也会被释放,可以被 glGenFramebuffers 重新使用。如果被删除的 framebuffer 正在处于 bind 状态,
        那么就相当于先执行了一次 glBindFramebuffer 把GPU当前的 framebuffer 变回使用window-system-provided framebuffer,然后再进行删除。 */
    deleteFramebuffer(framebuffer: WebGLFramebuffer | null): void {
        if (framebuffer) {
            let cachIndex = (<CPUWebGLRenderbuffer>framebuffer).cachIndex
            let frameBufferObj = this._framebufferObjectMap.get(cachIndex)
            if (cachIndex !== 0 && frameBufferObj) {
                this._framebufferObjectMap.delete(cachIndex)
                if (this._nowUseFramebufferObject === frameBufferObj) {
                    this._nowUseFramebufferObject = null
                }
            }
        }
    }

    /**当某个 RBO 不再被需要的时候,则可以通过 glDeleteRenderbuffers 这个 API 把 renderbuffer object name 删除。
        这个函数输入参数的意思是该 API 会删除 n 个 renderbuffer object,当 n 小于 0 的 时候,出现 GL_INVALID_VALUE 的错误。
         renderbuffer 保存的就是这些 renderbuffer object 的变量名。如果传入的变量名为 0,
         或者对应的不是一个合法的 renderbuffer object,那么 API 就会被忽略掉。
        这个函数没有输出参数。当 renderbuffer object 被删除之后,其内容会被全部清空，
        所占用的空间也会被全部释放,名字也会被释放,可以被 glGenRenderbuffers 重新使用。
        如果被删除的 renderbuffer 正在处于 bind 状态,那么就相当于先执行了一次 glBindRenderbuffer 把GPU当前的 RBO 变成 binging 0,
        也就相当于什么都没有 bind 了,然后再进行删除。另外就是，当这个RBO被attach到当前FBO的时候，删除这个RBO会自动从当前FBO detach，
        导致当前FBO framebuffer incomplete，所以需要格外注意。 */
    deleteRenderbuffer(renderbuffer: WebGLRenderbuffer | null): void {
        if (renderbuffer) {
            let cachIndex = (<CPUWebGLRenderbuffer>renderbuffer).cachIndex
            let renderbufferObj = this._renderbufferObjectMap.get(cachIndex)
            if (cachIndex !== 0 && renderbufferObj) {
                this._renderbufferObjectMap.delete(cachIndex)
                if (this._nowUseRenderbufferObject === renderbufferObj) {
                    this._nowUseRenderbufferObject = null
                }
                if (this._nowUseFramebufferObject) {
                    this._nowUseFramebufferObject.deAttachRenderBufferPoint(cachIndex)
                }
            }
        }
    }

    /**
     * Scissor Test会判断当前fragment是否处于Scissor规定的矩形区域中，矩形区域是通过glScissor这个API传入的四个参数确定的。
        这个函数有4个输入参数，用于确定一个矩形区域。如果 x 小于 Xw 小于 x + width 且 y 小于 Yw 小于 y + height，
        则说明（Xw, Yw）确定的这个fragment在矩形区域内，则Scissor Test通过。
        反之，如果不通过，这个fragment则会被抛弃。Scissor Test是通过glEnable和glDisable这个API，
        传入参数GL_SCISSOR_TEST来进行开关。如果关闭的话，则Scissor Test一直pass。
        如果第三个参数width和第四个参数height小于0，则出现GL_INVALID_VALUE的错误。
        默认状态下第一个参数x和第二个参数y初始值为0，第三个参数width和第四个参数height为GL Window的尺寸。
        而Scissor Test默认为关闭状态。 */
    scissor(x: GLint, y: GLint, width: GLsizei, height: GLsizei): void {
        this._scissorRect = new Rect(x, y, width, height)
    }

    /*
    由于OpenGL ES为3D API，那么绘制的物件当然也是3D的，但是framebuffer是2D的，
    而其实我们传入的顶点是3D的，也就是说其实有一张depth buffer
    （不管是window-system-provided framebuffer还是application-created framebuffer），
    物件的Z值是写在这张buffer中。当绘制开始的时候，会通过glClear这个API，传入GL_DEPTH_BUFFER_BIT，
    将depth buffer中的值统一为glClearDepthf设定的值。通过VS和光栅化计算好顶点3D坐标后，
    将Z值与depth buffer中的值进行Test，Test方法由glDepthFunc确定，如果失败，则丢弃该像素，
    如果通过，则算是通过了Depth Test，下一步再进行Stencil Test。Stencil Test与Depth Test类似而又稍有不同，
    具体情况下面通过API串讲来进行说明。
    */

    /**
     * 不管是window-system-provided framebuffer还是application-created framebuffer，
     * 其关联的buffer，不管是color buffer还是depth buffer还是stencil buffer，
     * 在刚被创建好的时候，并不会被初始化，那么根据平台不同，里面保存的东西可能不同，
     * 就好比我们虽然准备了一张画纸，但是这个画纸上面可能原本就有东西，这些东西是不确定的，
     * 所以我们先要把这张画图涂上底色，而我们可能希望这个画纸的底色是白色，也有可能希望是黑色的，
     * 或者其他颜色，而glClearDepthf这个API，就是设定一种Z值，作为统一 depth buffer所使用的Z值。
        这个函数只有1个输入参数，用于确定Z值，供统一 depth buffer使用的。这个输入参数初始值为1。
        在输入的时候这个值可以随意填写，但是会被闭区间[0,1]进行clamp。
        这个函数没有输出参数，通过这个API确定的Z值，会被用于glClear，用于统一 depth buffer使用。
     */
    clearDepth(depth: GLclampf): void {
        this._defaultDepth = depth
    }

    /**如果Depth Test失败，该pixel将被discard，depth buffer也不会更新。
     * Depth Test是由glEnable和glDisable这个API，传入参数GL_DEPTH_TEST来进行开关。
     * 如果disable了，Depth Test和Depth buffer的写入操作将会被跳过，直接进行下一个操作。
     * 而Stencil值是否会被在Stencil buffer中进行更新，则以下文为准（Depth Test当做通过Depth Test处理）。
     * 如果enable，Depth Test则正常进行。
        这个函数只有1个输入参数，用于确定Depth Test的对比函数。
        只接受GL_NEVER, GL_LESS, GL_EQUAL, GL_LEQUAL, GL_GREATER, GL_NOTEQUAL, GL_GEQUAL, GL_ALWAYS。
        否则，则会出现GL_INVALID_ENUM的错误。默认为GL_LESS，也就是说如果这次Draw Call获得的Z值小于Depth buffer中对应位置存储的Z值，
        则Depth Test通过，Z值将写入Depth buffer。否则Depth Test失败，Z值将不被写入Depth Test，但是有一点，无论Depth Test成功失败，
        Stencil 都会根据设定判断是否需要写入Stencil Buffer。
        这个函数没有输出参数。默认情况下Depth Test是处于关闭状态。如果没有depth buffer
        （比如通过API egl CreateWindowSurface创建的surface config不包含depth bit或者使用FBO的时候压根没有attach depth attachment），
        则认定Depth Test Always Pass。 */
    depthFunc(func: GLenum): void {
        if (
            func === this._gameGl.NEVER ||
            func === this._gameGl.LESS ||
            func === this._gameGl.EQUAL ||
            func === this._gameGl.LEQUAL ||
            func === this._gameGl.GREATER ||
            func === this._gameGl.GEQUAL ||
            func === this._gameGl.ALWAYS
        )
            this._depthJudgeFunc = func
    }

    /**
     * glDepthMask 是用于控制 depth buffer 的写入权限。
        这个函数只有1个输入参数，用于确定depth buffer是否有写入权限，
        如果传入的为GL_TRUE，则说明depth buffer有写入权限。
        初始状态下，depth buffer是可写的。当传入GL_FALSE的时候，depth buffer不可写。
     */
    depthMask(flag: GLboolean): void {
        this._depthWriteEnable = flag
    }

    /**
     * 将Depth值从NDC（normalized device coordinate）转到window坐标系下，
     * 然后再写入depth buffer中。计算公式为Zw = (f-n)*Zd/2+(n+f)/2。
     这个函数有2个输入参数。第一个参数nearVal用于确定近裁剪面在window坐标系下的坐标。
     初始值为0。第二个参数farVal用于确定远裁剪面在window坐标系下的坐标。
     初始值为1。Depth在NDC空间是经过了除以W的操作，所以depth值为-1到1，考虑到远近裁剪面，
     glDepthRangef将Depth线性的从NDC转到了window坐标系下。不考虑depth buffer的实际构造，window坐标系下depth值被认为是0到1。
     所以两个输入参数都会被闭区间[0,1]进行clamp，这样得到的depth值也将会是0到1。nearVal不一定比farVal小，比如nearVal=1，farVal=0也可以。
      */
    depthRange(zNear: GLclampf, zFar: GLclampf): void {
        this._zNear = clamp(zNear, 0, 1)
        this._zFar = clamp(zFar, 0, 1)
    }

    /**
     * 经过glDepthRangef算出来的window坐标系下的Z值，经过光栅化后，可以通过glPolygonOffset做整体偏移。
     * 这个操作将在光栅化之后，以及depth test以及写入depth buffer之前。
     * 这个API主要是用于绘制hidden-line图片（比如墙后面的人，用线框表示），或者表面上的贴花，或者描边。
        这个函数有2个输入参数。第一个参数factor和第二个参数units将会用于一个公式，
        算出一个offset，然后加到depth值上。offset = factor × DZ + r × units。
        DZ 与屏幕空间中整个polygon的depth值的变化范围有关。范围为[0, 1]。
        units是个平台相关的一个常数，代表着depth偏移量的最小单位。第一个参数factor和第二个参数units的初始值都为0，两个值正负都可以。
        这个函数没有输出参数。而这个函数的执行受到 GL_POLYGON_OFFSET_FILL 的限制，如果通过API glEnable打开GL_POLYGON_OFFSET_FILL，
        那么光栅化生成的polygon上的每个depth值都要加上这个offset。但是无论如何offset，depth值无论如何都在[0, 1]。
     */
    polygonOffset(factor: GLfloat, units: GLfloat): void {
        console.error("polygonOffset 不是很懂 暂时不做")
    }

    stencilFunc(func: GLenum, ref: GLint, mask: GLuint): void {
        console.error("stencilFunc 不是很懂 暂时不做")
    }
    stencilFuncSeparate(face: GLenum, func: GLenum, ref: GLint, mask: GLuint): void {
        console.error("stencilFuncSeparate 不是很懂 暂时不做")
    }
    stencilMask(mask: GLuint): void {
        console.error("stencilMask 不是很懂 暂时不做")
    }
    stencilMaskSeparate(face: GLenum, mask: GLuint): void {
        console.error("stencilMaskSeparate 不是很懂 暂时不做")
    }
    stencilOp(fail: GLenum, zfail: GLenum, zpass: GLenum): void {
        console.error("stencilOp 不是很懂 暂时不做")
    }
    stencilOpSeparate(face: GLenum, fail: GLenum, zfail: GLenum, zpass: GLenum): void {
        console.error("stencilOpSeparate 不是很懂 暂时不做")
    }
    blendColor(red: GLclampf, green: GLclampf, blue: GLclampf, alpha: GLclampf): void {
        this._blendFactorColor = new Vec4Data(clamp(red, 0, 1), clamp(green, 0, 1), clamp(blue, 0, 1), clamp(alpha, 0, 1))
    }
    blendEquation(mode: GLenum): void {
        if (mode === this._gameGl.FUNC_ADD || mode === this._gameGl.FUNC_SUBTRACT || mode === this._gameGl.FUNC_REVERSE_SUBTRACT) {
            this._rgbComputerBlendFunc = mode
            this._alphaComputerBlendFunc = mode
        } else {
            renderError("this._gameGl.INVALID_ENUM " + this._gameGl.INVALID_ENUM + " in blendEquation")
        }
    }
    blendEquationSeparate(modeRGB: GLenum, modeAlpha: GLenum): void {
        if (modeRGB === this._gameGl.FUNC_ADD || modeRGB === this._gameGl.FUNC_SUBTRACT || modeRGB === this._gameGl.FUNC_REVERSE_SUBTRACT) {
            this._rgbComputerBlendFunc = modeRGB
        } else {
            renderError("this._gameGl.INVALID_ENUM " + this._gameGl.INVALID_ENUM + " in blendEquationSeparate")
        }
        if (
            modeAlpha === this._gameGl.FUNC_ADD ||
            modeAlpha === this._gameGl.FUNC_SUBTRACT ||
            modeAlpha === this._gameGl.FUNC_REVERSE_SUBTRACT
        ) {
            this._alphaComputerBlendFunc = modeAlpha
        } else {
            renderError("this._gameGl.INVALID_ENUM " + this._gameGl.INVALID_ENUM + " in blendEquationSeparate")
        }
    }

    // src是片元产生的 dest是屏幕上的
    blendFunc(sfactor: GLenum, dfactor: GLenum): void {
        if (
            sfactor === this._gameGl.ZERO ||
            sfactor === this._gameGl.ONE ||
            sfactor === this._gameGl.SRC_COLOR ||
            sfactor === this._gameGl.ONE_MINUS_SRC_COLOR ||
            sfactor === this._gameGl.DST_COLOR ||
            sfactor === this._gameGl.ONE_MINUS_DST_COLOR ||
            sfactor === this._gameGl.SRC_ALPHA ||
            sfactor === this._gameGl.ONE_MINUS_SRC_ALPHA ||
            sfactor === this._gameGl.DST_ALPHA ||
            sfactor === this._gameGl.ONE_MINUS_DST_ALPHA ||
            sfactor === this._gameGl.CONSTANT_COLOR ||
            sfactor === this._gameGl.ONE_MINUS_CONSTANT_COLOR ||
            sfactor === this._gameGl.CONSTANT_ALPHA ||
            sfactor === this._gameGl.ONE_MINUS_CONSTANT_ALPHA ||
            sfactor === this._gameGl.SRC_ALPHA_SATURATE
        ) {
            this._rgbSrcBlendFunc = sfactor
            this._alphaSrcBlendFunc = sfactor
        } else {
            renderError("this._gameGl.INVALID_ENUM " + this._gameGl.INVALID_ENUM + " in blendFunc")
        }
        if (
            dfactor === this._gameGl.ZERO ||
            dfactor === this._gameGl.ONE ||
            dfactor === this._gameGl.SRC_COLOR ||
            dfactor === this._gameGl.ONE_MINUS_SRC_COLOR ||
            dfactor === this._gameGl.DST_COLOR ||
            dfactor === this._gameGl.ONE_MINUS_DST_COLOR ||
            dfactor === this._gameGl.SRC_ALPHA ||
            dfactor === this._gameGl.ONE_MINUS_SRC_ALPHA ||
            dfactor === this._gameGl.DST_ALPHA ||
            dfactor === this._gameGl.ONE_MINUS_DST_ALPHA ||
            dfactor === this._gameGl.CONSTANT_COLOR ||
            dfactor === this._gameGl.ONE_MINUS_CONSTANT_COLOR ||
            dfactor === this._gameGl.CONSTANT_ALPHA ||
            dfactor === this._gameGl.ONE_MINUS_CONSTANT_ALPHA
        ) {
            this._rgbDestBlendFunc = dfactor
            this._alphaDestBlendFunc = dfactor
        } else {
            renderError("this._gameGl.INVALID_ENUM " + this._gameGl.INVALID_ENUM + " in blendFunc")
        }
    }
    blendFuncSeparate(srcRGB: GLenum, dstRGB: GLenum, srcAlpha: GLenum, dstAlpha: GLenum): void {
        if (
            srcRGB === this._gameGl.ZERO ||
            srcRGB === this._gameGl.ONE ||
            srcRGB === this._gameGl.SRC_COLOR ||
            srcRGB === this._gameGl.ONE_MINUS_SRC_COLOR ||
            srcRGB === this._gameGl.DST_COLOR ||
            srcRGB === this._gameGl.ONE_MINUS_DST_COLOR ||
            srcRGB === this._gameGl.SRC_ALPHA ||
            srcRGB === this._gameGl.ONE_MINUS_SRC_ALPHA ||
            srcRGB === this._gameGl.DST_ALPHA ||
            srcRGB === this._gameGl.ONE_MINUS_DST_ALPHA ||
            srcRGB === this._gameGl.CONSTANT_COLOR ||
            srcRGB === this._gameGl.ONE_MINUS_CONSTANT_COLOR ||
            srcRGB === this._gameGl.CONSTANT_ALPHA ||
            srcRGB === this._gameGl.ONE_MINUS_CONSTANT_ALPHA ||
            srcRGB === this._gameGl.SRC_ALPHA_SATURATE
        ) {
            this._rgbSrcBlendFunc = srcRGB
        } else {
            renderError("this._gameGl.INVALID_ENUM " + this._gameGl.INVALID_ENUM + " in blendFunc")
        }
        if (
            srcAlpha === this._gameGl.ZERO ||
            srcAlpha === this._gameGl.ONE ||
            srcAlpha === this._gameGl.SRC_COLOR ||
            srcAlpha === this._gameGl.ONE_MINUS_SRC_COLOR ||
            srcAlpha === this._gameGl.DST_COLOR ||
            srcAlpha === this._gameGl.ONE_MINUS_DST_COLOR ||
            srcAlpha === this._gameGl.SRC_ALPHA ||
            srcAlpha === this._gameGl.ONE_MINUS_SRC_ALPHA ||
            srcAlpha === this._gameGl.DST_ALPHA ||
            srcAlpha === this._gameGl.ONE_MINUS_DST_ALPHA ||
            srcAlpha === this._gameGl.CONSTANT_COLOR ||
            srcAlpha === this._gameGl.ONE_MINUS_CONSTANT_COLOR ||
            srcAlpha === this._gameGl.CONSTANT_ALPHA ||
            srcAlpha === this._gameGl.ONE_MINUS_CONSTANT_ALPHA ||
            srcAlpha === this._gameGl.SRC_ALPHA_SATURATE
        ) {
            this._alphaSrcBlendFunc = srcAlpha
        } else {
            renderError("this._gameGl.INVALID_ENUM " + this._gameGl.INVALID_ENUM + " in blendFunc")
        }
        if (
            dstRGB === this._gameGl.ZERO ||
            dstRGB === this._gameGl.ONE ||
            dstRGB === this._gameGl.SRC_COLOR ||
            dstRGB === this._gameGl.ONE_MINUS_SRC_COLOR ||
            dstRGB === this._gameGl.DST_COLOR ||
            dstRGB === this._gameGl.ONE_MINUS_DST_COLOR ||
            dstRGB === this._gameGl.SRC_ALPHA ||
            dstRGB === this._gameGl.ONE_MINUS_SRC_ALPHA ||
            dstRGB === this._gameGl.DST_ALPHA ||
            dstRGB === this._gameGl.ONE_MINUS_DST_ALPHA ||
            dstRGB === this._gameGl.CONSTANT_COLOR ||
            dstRGB === this._gameGl.ONE_MINUS_CONSTANT_COLOR ||
            dstRGB === this._gameGl.CONSTANT_ALPHA ||
            dstRGB === this._gameGl.ONE_MINUS_CONSTANT_ALPHA
        ) {
            this._rgbDestBlendFunc = dstRGB
        } else {
            renderError("this._gameGl.INVALID_ENUM " + this._gameGl.INVALID_ENUM + " in blendFunc")
        }
        if (
            dstAlpha === this._gameGl.ZERO ||
            dstAlpha === this._gameGl.ONE ||
            dstAlpha === this._gameGl.SRC_COLOR ||
            dstAlpha === this._gameGl.ONE_MINUS_SRC_COLOR ||
            dstAlpha === this._gameGl.DST_COLOR ||
            dstAlpha === this._gameGl.ONE_MINUS_DST_COLOR ||
            dstAlpha === this._gameGl.SRC_ALPHA ||
            dstAlpha === this._gameGl.ONE_MINUS_SRC_ALPHA ||
            dstAlpha === this._gameGl.DST_ALPHA ||
            dstAlpha === this._gameGl.ONE_MINUS_DST_ALPHA ||
            dstAlpha === this._gameGl.CONSTANT_COLOR ||
            dstAlpha === this._gameGl.ONE_MINUS_CONSTANT_COLOR ||
            dstAlpha === this._gameGl.CONSTANT_ALPHA ||
            dstAlpha === this._gameGl.ONE_MINUS_CONSTANT_ALPHA
        ) {
            this._alphaDestBlendFunc = dstAlpha
        } else {
            renderError("this._gameGl.INVALID_ENUM " + this._gameGl.INVALID_ENUM + " in blendFunc")
        }
    }

    clearStencil(s: GLint): void {
        // debugger
        console.warn("clearStencil 还未实现")
    }
}

export let cpuRenderingContext = new CpuRenderingContext()

/**感觉是个无用api合集 
 * 
 * 直接使用系统指定的不就可以了。。。暂时不实现
这种 bind 属于 GL 的当前状态,也就是说它并不仅仅是一个 program 的行为。 
比如我们对一个 program A 的 attribute A 绑定为 location 1,假如我们突然通过 glUseProgram 开始使用 program B 了,不再使用 program A 了,
那么假如 program B 中也有 Attribute A,那么这个 Attribute A 的 location 也为 1,这个需要特别注意的。

    bindAttribLocation(programIndex: WebGLProgram, index: GLuint, name: string): void {
        let program = this._webGLProgramMap.get((<CPUWebGLProgram>programIndex).cachIndex)!

        if (program === undefined) {
            renderError("this._gameGl.INVALID_VALUE  " + this._gameGl.INVALID_VALUE + " in bindAttribLocation ")
        } else {
        }
        renderError("bindAttribLocation not imm")
    }

    感觉这个api也没啥用
    直接指定顶点对应属性数据
    vertexAttrib1f(index: GLuint, x: GLfloat): void {}
    vertexAttrib1fv(index: GLuint, values: Float32List): void {}
    vertexAttrib2f(index: GLuint, x: GLfloat, y: GLfloat): void {}
    vertexAttrib2fv(index: GLuint, values: Float32List): void {}
    vertexAttrib3f(index: GLuint, x: GLfloat, y: GLfloat, z: GLfloat): void {}
    vertexAttrib3fv(index: GLuint, values: Float32List): void {}
    vertexAttrib4f(index: GLuint, x: GLfloat, y: GLfloat, z: GLfloat, w: GLfloat): void {}
    vertexAttrib4fv(index: GLuint, values: Float32List): void {}

    // 对画线应该没什么需求
    lineWidth(width: GLfloat): void{}
 */
// finish(): void;
// flush(): void;
// sampleCoverage(value: GLclampf, invert: GLboolean): void;
// readPixels(x: GLint, y: GLint, width: GLsizei, height: GLsizei, format: GLenum, type: GLenum, pixels: ArrayBufferView | null): void;

// isTexture(texture: WebGLTexture | null): GLboolean;
// isBuffer(buffer: WebGLBuffer | null): GLboolean;
// isContextLost(): boolean;
// isEnabled(cap: GLenum): GLboolean;
// isFramebuffer(framebuffer: WebGLFramebuffer | null): GLboolean;
// isProgram(program: WebGLProgram | null): GLboolean;
// isRenderbuffer(renderbuffer: WebGLRenderbuffer | null): GLboolean;
// isShader(shader: WebGLShader | null): GLboolean;

// getAttachedShaders(program: WebGLProgram): WebGLShader[] | null;
// getBufferParameter(target: GLenum, pname: GLenum): any;
// getContextAttributes(): WebGLContextAttributes | null;
// getError(): GLenum;
// getExtension(extensionName: string): any;
// getFramebufferAttachmentParameter(target: GLenum, attachment: GLenum, pname: GLenum): any;
// getRenderbufferParameter(target: GLenum, pname: GLenum): any;
// getShaderPrecisionFormat(shadertype: GLenum, precisiontype: GLenum): WebGLShaderPrecisionFormat | null;
// getShaderSource(shader: WebGLShader): string | null;
// getSupportedExtensions(): string[] | null;
// getTexParameter(target: GLenum, pname: GLenum): any;
// getUniform(program: WebGLProgram, location: WebGLUniformLocation): any;
// getVertexAttrib(index: GLuint, pname: GLenum): any;
// getVertexAttribOffset(index: GLuint, pname: GLenum): GLintptr;

// getExtension(extensionName: "EXT_blend_minmax"): EXT_blend_minmax | null;
// getExtension(extensionName: "EXT_texture_filter_anisotropic"): EXT_texture_filter_anisotropic | null;
// getExtension(extensionName: "EXT_frag_depth"): EXT_frag_depth | null;
// getExtension(extensionName: "EXT_shader_texture_lod"): EXT_shader_texture_lod | null;
// getExtension(extensionName: "EXT_sRGB"): EXT_sRGB | null;
// getExtension(extensionName: "OES_vertex_array_object"): OES_vertex_array_object | null;
// getExtension(extensionName: "WEBGL_color_buffer_float"): WEBGL_color_buffer_float | null;
// getExtension(extensionName: "WEBGL_compressed_texture_astc"): WEBGL_compressed_texture_astc | null;
// getExtension(extensionName: "WEBGL_compressed_texture_s3tc_srgb"): WEBGL_compressed_texture_s3tc_srgb | null;
// getExtension(extensionName: "WEBGL_debug_shaders"): WEBGL_debug_shaders | null;
// getExtension(extensionName: "WEBGL_draw_buffers"): WEBGL_draw_buffers | null;
// getExtension(extensionName: "WEBGL_lose_context"): WEBGL_lose_context | null;
// getExtension(extensionName: "WEBGL_depth_texture"): WEBGL_depth_texture | null;
// getExtension(extensionName: "WEBGL_debug_renderer_info"): WEBGL_debug_renderer_info | null;
// getExtension(extensionName: "WEBGL_compressed_texture_s3tc"): WEBGL_compressed_texture_s3tc | null;
// getExtension(extensionName: "OES_texture_half_float_linear"): OES_texture_half_float_linear | null;
// getExtension(extensionName: "OES_texture_half_float"): OES_texture_half_float | null;
// getExtension(extensionName: "OES_texture_float_linear"): OES_texture_float_linear | null;
// getExtension(extensionName: "OES_texture_float"): OES_texture_float | null;
// getExtension(extensionName: "OES_standard_derivatives"): OES_standard_derivatives | null;
// getExtension(extensionName: "OES_element_index_uint"): OES_element_index_uint | null;
// getExtension(extensionName: "ANGLE_instanced_arrays"): ANGLE_instanced_arrays | null;
