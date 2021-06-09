import { cpuRenderingContext } from "./CpuRenderingContext"
import { ShaderManager } from "./shader/tsScript/ShaderManager"
import { BaseShaderHandle, FragShaderHandle, VertShaderHandle } from "./ShaderDefine"
let SparkMD5 = require("Spark-md5")

/**着色器相关 */
export class CPUWebGLShader implements WebGLShader {
    get cachIndex() {
        return this._cachIndex
    }
    private _cachIndex: GLint = 0
    constructor(index: GLint) {
        this._cachIndex = index
    }
}
export class CPUWebGLProgram implements WebGLProgram {
    get cachIndex() {
        return this._cachIndex
    }
    private _cachIndex: GLint = 0
    constructor(index: GLint) {
        this._cachIndex = index
    }
}
export class CPUWebGLUniformLocation implements WebGLUniformLocation {
    get cachIndex() {
        return this._cachIndex
    }
    private _cachIndex: GLint = 0
    constructor(index: GLint) {
        this._cachIndex = index
    }
}

export class CPUShader {
    construct: any
    shaderIndex: CPUWebGLShader
    constructor(shaderIndex: CPUWebGLShader) {
        this.shaderIndex = shaderIndex
    }

    /**
     * 绑定的源码
     * 暂时还是没想清楚咋搞比较好
     * glsl转ts?(动态转换/静态转换(根据source找到对应的ts脚本)?)
     * glsl转webassembly?还能调试么?
     * */
    source: string = null!

    /**
     * 但是每个 shader object 都有一个布尔值 Compile_status,这个值会根据编译的结果进行修改,
     * 比如 shader 编译成功没有问题且可以使用,那么这个状态将会被设为 TRUE,否则则为 FALSE。
     * 这个 status 值可以通过 GetShaderiv 这个 API 查询。根据学过的 GLSL 语法,编译失败的原因有很多,在这里就不详细进行一一说明了。
     * 如果编译失败,则之前编译的所有信息都将丢失。也就是说编译失败之后,该 shader 的状态不会回滚到编译之前的旧的状态。
     * 通过 glshadersource 改变 shader object 的内容,并不会改变其编译状态或编译出来的 shader code。
     * 只有当再执行一次 glCompileShader,且编译成功, 才会改变该 shader 的编译状态。
     * 编译脚本
     */
    complile() {
        this._compileStatus = false

        /**
         * do some complice thing
         */

        let hash = SparkMD5.hash(this.source)
        // 需要提前准备好ts脚本

        let construct = ShaderManager.getConstruct("Impl_" + hash)
        if (construct) {
            this.construct = construct
            this._compileStatus = true
        } else {
            this.info = "无法查找到对应的glsl转换的ts脚本 请再次确认使用调用脚本自动生成"
        }
    }

    get compileStatus() {
        return this._compileStatus
    }

    private _compileStatus: boolean = false

    /**
     * 当被标记删除且不没有附加到任何program的时候就是一个失效的program,应该被删除
     * 反之就还是一个有效的program
     */
    isValid() {
        let hasAttach = this._attachProgramIndex.size > 0
        return hasAttach || !this._delete
    }

    destory() {
        this._attachProgramIndex.clear()
    }

    set delete(value: boolean) {
        this._delete = value
    }
    /**将被删除 */
    private _delete: boolean = false

    /**
     * 警告或错误信息
     */
    info: string = null!

    /**
     * 是否被附加到program 一个shader 可以被附加到多个program上
     */
    private _attachProgramIndex: Set<CPUWebGLProgram> = new Set()
    setAttachProgram(value: CPUWebGLProgram) {
        this._attachProgramIndex.add(value)
    }

    deleteAttachProgram(value: CPUWebGLProgram) {
        this._attachProgramIndex.delete(value)
    }
}

export class CPUVertexShader extends CPUShader {
    shaderHandle: VertShaderHandle = null!
}

export class CPUFragmentShader extends CPUShader {
    shaderHandle: FragShaderHandle = null!
}

export class CPUShaderProgram {
    attachFragmentShader: CPUFragmentShader | null = null
    attachVertexShader: CPUVertexShader | null = null

    private _linkFragmentShader: FragShaderHandle | null = null
    private _linkVertexShader: VertShaderHandle | null = null

    get linkFragmentShader(): FragShaderHandle {
        return this._linkFragmentShader!
    }
    get linkVertexShader(): VertShaderHandle {
        return this._linkVertexShader!
    }
    /**
     * 但是每个 program object 都有一个布尔值 Link_status,这个值会根据 link 的结果进行修改,
     * 比如 program 链接成功,且一个有效的可执行文件被创建,那么这个状态将会被设为 TRUE,否则则为 FALSE。
     * 这个 status 值可以通过 glGetProgramiv 这个 API 查询。根据我们学过的 GLSL 语法, 链接失败的原因有很多,
     * 比如 program 中的 shader object 没有被成功编译,比如 program 中没有 vertex shader 或者 fragment shader,
     * 比如 shader 中使用了超出限制的 uniform 或 sample 变量,比如 shader object 是通过预编译的 shader binary 读取生成的等等,
     * 在这里就不详细进行一一说明了。如果 link 失败,则之前 link 的所有信息都将丢失。也就是说链接失败之后,
     * 该 program 的状态不会回滚到链接之前的旧的状态。而有一些信息还是能被找回来的,
     * 这些信息是 attribute 和 uniform 相关的信息,这个下个课时我们再详细说明。
     *
     * link 成功之后,所有 shader 中开发者自定义的 active 的 uniform 都会被初始化为 0,
     * 然后会被分配一个地址,该地址可以通过 glGetUniformLocation 这个 API 来获取。
     * 同样的,shader 中所有开发者自定义的 active 的 attribute,如果没有被于一个指定的 index 绑定,在这个时候就会给它分配一个 index。
     * 这个 index 可以 通过 glGetAttribLocation 这个 API 来获取,该两个 API 我们会在下个课时进行详细说明。
     *
     * PS:(所以link后其实是生成一个新的shader?)
     * 当 program 被 link 之后,该 program 对应的 shader 可以被修改、重新编译、 detach、attach 其他 shader 等操作,
     * 而这些操作不会影响 link 的 log 以及 program 的可执行文件。
     */
    link() {
        this._linkStatus = false
        if (
            this.attachFragmentShader &&
            this.attachFragmentShader.compileStatus &&
            this.attachVertexShader &&
            this.attachVertexShader.compileStatus
        ) {
            let linkSuccess = true

            if (this.attachFragmentShader && this.attachVertexShader) {
                this._linkFragmentShader = new this.attachFragmentShader!.construct()
                this._linkVertexShader = new this.attachVertexShader!.construct()
                this._attributeLocationInfo.clear()
                let attributeData = this._linkVertexShader!.attributeData
                let i = 0
                for (const key in attributeData) {
                    if (key === "dataKeys" || key === "dataSize") {
                        continue
                    }
                    if (Object.prototype.hasOwnProperty.call(attributeData, key)) {
                        this._attributeLocationInfo.set(key, i++)
                    }
                }
                i = 0

                let vertUniform = this._linkVertexShader?.uniformData
                let fragUniform = this._linkFragmentShader?.uniformData

                for (const key in vertUniform) {
                    if (key === "dataKeys" || key === "dataSize") {
                        continue
                    }
                    if (Object.prototype.hasOwnProperty.call(vertUniform, key)) {
                        if (!this._uniformLocationInfo.get(key)) {
                            let testVertUniform: any = vertUniform
                            this._uniformLocationInfo.set(key, new CPUWebGLUniformLocation(i++))
                            if (testVertUniform![key] instanceof Array) {
                                this._uniformIsArray.set(key, true)
                            } else {
                                this._uniformIsArray.set(key, false)
                            }
                        }
                    }
                }

                // 当uniform属性在vert和frag类型不一样的时候 应该会导致链接失败
                for (const key in fragUniform) {
                    if (key === "dataKeys" || key === "dataSize") {
                        continue
                    }
                    if (Object.prototype.hasOwnProperty.call(fragUniform, key)) {
                        let uniformLoc = this._uniformLocationInfo.get(key)
                        let testFragUniform: any = fragUniform
                        if (uniformLoc === undefined) {
                            this._uniformLocationInfo.set(key, new CPUWebGLUniformLocation(i++))
                            if (testFragUniform![key] instanceof Array) {
                                this._uniformIsArray.set(key, true)
                            } else {
                                this._uniformIsArray.set(key, false)
                            }
                        } else {
                            let testVertUniform: any = vertUniform
                            if (typeof testVertUniform![key] !== typeof testFragUniform![key]) {
                                linkSuccess = false
                                break
                            }
                        }
                    }
                }

                this._linkStatus = linkSuccess
            } else {
                this.info = "没有顶点着色器或者片元着色器"
            }
        }
    }

    setUniformData(location: CPUWebGLUniformLocation, data: any) {
        let setSuc = false
        let name: string | null = this._getUniformLocalName(location)
        // console.log("&&&&&&&&&&&&&&&&&setUniformData&&&&&&&&&&&&&&&&&&")
        // console.log(location)
        // console.log(name)
        // console.log("&&&&&&&&&&&&&&&&&setUniformData&&&&&&&&&&&&&&&&&&")
        if (name) {
            if (data instanceof Array) {
                if (!this._getUniformLocalIsArray(name)) {
                    setSuc = this._setUniformData(name, data[0])
                } else {
                    setSuc = this._setUniformData(name, data)
                }
            } else {
                setSuc = this._setUniformData(name, data)
            }
        }
        return setSuc
    }

    // 没有做类型不匹配的判断 还没想好怎么做
    private _setUniformData(name: string, data: any) {
        let setSuc = false
        let vertUniform: any = this._linkVertexShader?.uniformData
        let fragUniform: any = this._linkFragmentShader?.uniformData

        if (vertUniform[name] !== undefined) {
            vertUniform[name] = data
            setSuc = true
        }
        if (fragUniform[name] !== undefined) {
            fragUniform[name] = data
            setSuc = true
        }
        return setSuc
    }

    private _getUniformLocalName(location: CPUWebGLUniformLocation) {
        let name: string | null = null
        for (let entries of this._uniformLocationInfo.entries()) {
            let key = entries[0]
            let loc = entries[1]
            if (loc.cachIndex == location.cachIndex) {
                name = key
                break
            }
        }
        return name
    }

    private _getUniformLocalIsArray(name: string) {
        let isArray = this._uniformIsArray.get(name)
        return isArray
    }

    getUniformLocal(name: string): CPUWebGLUniformLocation | undefined {
        return this._uniformLocationInfo.get(name)
    }

    getAttributeLocal(name: string): GLint | undefined {
        return this._attributeLocationInfo.get(name)
    }

    getAttributeSize() {
        return this._attributeLocationInfo.size
    }

    getUniformSize() {
        return this._uniformLocationInfo.size
    }

    getNameByAttributeLocal(index: GLint) {
        for (const iterator of this._attributeLocationInfo.entries()) {
            if (index == iterator[1]) {
                return iterator[0]
            }
        }
    }

    getNameByAttributeIndex(index: GLint) {
        for (const iterator of this._attributeLocationInfo.entries()) {
            if (index === 0) {
                return iterator[0]
            }
            index--
        }
    }

    getNameByUniformIndex(index: GLint) {
        for (const iterator of this._uniformLocationInfo.entries()) {
            if (index === 0) {
                return iterator[0]
            }
            index--
        }
    }

    /**link后生效的顶点位置,可以被外部指定*/
    private _attributeLocationInfo: Map<string, number> = new Map()

    /**link后生效的全局变量位置*/
    private _uniformLocationInfo: Map<string, CPUWebGLUniformLocation> = new Map()
    /**是否数组 */
    private _uniformIsArray: Map<string, boolean> = new Map()

    use() {
        this._isUsing = true
    }

    unUse() {
        this._isUsing = false
    }

    /**
     * 当被标记删除且不被使用的时候就是一个失效的program,应该被删除
     * 反之就还是一个有效的program
     */
    isValid() {
        return this._isUsing || !this._delete
    }

    get linkStatus() {
        return this._linkStatus
    }

    set isUsing(value: boolean) {
        this._isUsing = value
    }

    info: string = ""
    private _linkStatus: boolean = false

    /**执行真正的销毁 */
    destory(programIndex: CPUWebGLProgram) {
        if (this.attachFragmentShader) {
            this.attachFragmentShader.deleteAttachProgram(programIndex)
        }
        if (this.attachVertexShader) {
            this.attachVertexShader.deleteAttachProgram(programIndex)
        }
    }

    set delete(value: boolean) {
        this._delete = value
    }

    /**将被删除 */
    private _delete: boolean = false
    /**正在使用 */
    private _isUsing: boolean = false
}
/**着色器相关 */

/**绘制数据相关 */
export class CPUWebGLBuffer implements WebGLBuffer {
    get cachIndex() {
        return this._cachIndex
    }
    private _cachIndex: GLint = 0
    constructor(index: GLint) {
        this._cachIndex = index
    }
}

/**buffer数据 */
export class CPUBufferData {
    /**buffer数据 */
    buffer: Uint8Array = new Uint8Array(0)
    private _cachIndex: CPUWebGLBuffer = null!

    get cachIndex(): CPUWebGLBuffer {
        return this._cachIndex
    }
    set status(value: GLint) {
        this._status = value
    }
    private _status: GLint = 0
    constructor(initStatus: GLint, cachIndex: CPUWebGLBuffer) {
        this._status = initStatus
        this._cachIndex = cachIndex
    }
}

export class VBOBufferData extends CPUBufferData {}

export class EBOBufferData extends CPUBufferData {}
/**绘制数据相关 */

/**纹理相关 */
export class CPUWebGLTexture implements WebGLTexture {
    get cachIndex() {
        return this._cachIndex
    }
    private _cachIndex: GLint = 0
    constructor(index: GLint) {
        this._cachIndex = index
    }
}

export class TexBufferData {
    width: number = 0
    height: number = 0
    constructor(width: number, height: number) {
        this.width = width
        this.height = height
    }
    bufferData: Uint8Array | null = null
}

export class TexelsData {
    texelMipmapData: Map<number, TexBufferData> = new Map()

    setLevelData(level: number, width: number, height: number, texelData: Uint8Array) {
        let texBufferData = new TexBufferData(width, height)
        texBufferData.bufferData = texelData
        this.texelMipmapData.set(level, texBufferData)
    }
}

export class WebGLTextureData {
    constructor(glTexture: CPUWebGLTexture, glTarget: GLenum, gl: WebGLRenderingContext, cachIndex: number) {
        this.glTexture = glTexture
        this.glTarget = glTarget
        let texelsNum = glTarget === gl.TEXTURE_2D ? 1 : 6
        this.texelsDatas = new Array<TexelsData>(texelsNum)
        this.mipmapCreateType = gl.DONT_CARE
        this.parameter.set(gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR)
        this.parameter.set(gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        this.parameter.set(gl.TEXTURE_WRAP_S, gl.REPEAT)
        this.parameter.set(gl.TEXTURE_WRAP_T, gl.REPEAT)
        this._cachIndex = cachIndex
    }

    get cachIndex() {
        return this._cachIndex
    }
    _cachIndex: number = null!
    /**纹理数据 对应cube类型的话 纹理数据是6张 */
    texelsDatas: TexelsData[] | null = null
    glTarget: GLenum | null = null
    glTexture: CPUWebGLTexture | null = null

    /**生成mipmap的算法 */
    mipmapCreateType: number = null!

    /**纹理读取的参数 */
    parameter: Map<number, number> = new Map()

    // 绑定的纹理单元 可能同时绑定到多个纹理单元中
    private _bindTextureUnitSet: Set<number> = new Set()
    bindTexUnit(unit: number) {
        this._bindTextureUnitSet.add(unit)
    }
    unBindTexUnit(unit: number) {
        this._bindTextureUnitSet.delete(unit)
    }
    get bindTextureUnitSet() {
        return this._bindTextureUnitSet
    }
}

/**纹理相关 */

/**frameBuffer相关 */

export class CPUWebGLFramebuffer implements WebGLFramebuffer {
    get cachIndex() {
        return this._cachIndex
    }
    private _cachIndex: GLint = 0
    constructor(index: GLint) {
        this._cachIndex = index
    }
}

export class WebGLFramebufferObject {
    bufferIndex: CPUWebGLFramebuffer = null!
    constructor(bufferIndex: CPUWebGLFramebuffer) {
        this.bufferIndex = bufferIndex
    }

    // 如果attach的是图片的话对应的target
    colorTextureTarget: number = 0
    depthTextureTarget: number = 0
    stencilTextureTarget: number = 0

    colorAttachPoint: WebGLRenderbufferObject | WebGLTextureData | null = null
    depthAttachPoint: WebGLRenderbufferObject | WebGLTextureData | null = null
    stencilAttachPoint: WebGLRenderbufferObject | WebGLTextureData | null = null

    clearColorAttach() {
        this.colorTextureTarget = 0
        this.colorAttachPoint = null
    }

    setColorAttachByTex(tex: WebGLTextureData, target: number) {
        this.colorTextureTarget = target
        this.colorAttachPoint = tex
    }
    setColorAttachByRender(render: WebGLRenderbufferObject) {
        this.colorAttachPoint = render
    }

    clearDepthAttach() {
        this.depthTextureTarget = 0
        this.depthAttachPoint = null
    }

    setDepthAttachByTex(tex: WebGLTextureData, target: number) {
        this.depthTextureTarget = target
        this.depthAttachPoint = tex
    }
    setDepthAttachByRender(render: WebGLRenderbufferObject) {
        this.depthAttachPoint = render
    }

    clearStencilAttach() {
        this.stencilTextureTarget = 0
        this.stencilAttachPoint = null
    }

    setStencilAttachByTex(tex: WebGLTextureData, target: number) {
        this.stencilTextureTarget = target
        this.stencilAttachPoint = tex
    }
    setStencilAttachByRender(render: WebGLRenderbufferObject) {
        this.stencilAttachPoint = render
    }

    deAttachRenderBufferPoint(cachIndex: number) {
        if (
            this.colorAttachPoint &&
            this.colorAttachPoint instanceof WebGLRenderbufferObject &&
            (<WebGLRenderbufferObject>this.colorAttachPoint).bufferIndex.cachIndex === cachIndex
        ) {
            this.clearColorAttach()
        }
        if (
            this.depthAttachPoint &&
            this.depthAttachPoint instanceof WebGLRenderbufferObject &&
            (<WebGLRenderbufferObject>this.depthAttachPoint).bufferIndex.cachIndex === cachIndex
        ) {
            this.clearDepthAttach()
        }
        if (
            this.stencilAttachPoint &&
            this.stencilAttachPoint instanceof WebGLRenderbufferObject &&
            (<WebGLRenderbufferObject>this.stencilAttachPoint).bufferIndex.cachIndex === cachIndex
        ) {
            this.clearStencilAttach()
        }
    }

    deAttachTexture(cachIndex: number) {
        if (
            this.colorAttachPoint &&
            this.colorAttachPoint instanceof WebGLTextureData &&
            (<WebGLTextureData>this.colorAttachPoint).cachIndex === cachIndex
        ) {
            this.clearColorAttach()
        }
        if (
            this.depthAttachPoint &&
            this.depthAttachPoint instanceof WebGLTextureData &&
            (<WebGLTextureData>this.depthAttachPoint).cachIndex === cachIndex
        ) {
            this.clearDepthAttach()
        }
        if (
            this.stencilAttachPoint &&
            this.stencilAttachPoint instanceof WebGLTextureData &&
            (<WebGLTextureData>this.stencilAttachPoint).cachIndex === cachIndex
        ) {
            this.clearStencilAttach()
        }
    }
}

export class CPUWebGLRenderbuffer implements WebGLRenderbuffer {
    get cachIndex() {
        return this._cachIndex
    }
    private _cachIndex: GLint = 0
    constructor(index: GLint) {
        this._cachIndex = index
    }
}

export class WebGLRenderbufferObject {
    bufferIndex: CPUWebGLRenderbuffer = null!
    constructor(bufferIndex: CPUWebGLRenderbuffer) {
        this.bufferIndex = bufferIndex
    }

    // 由于RBO是将作为FBO的color/depth/stencil attachment，所以第二个输入参数internalformat必须为color/depth/stencil相关的格式。
    // 其中，如果该RBO将作为color attachment，那么internalformat必须为GL_RGBA4/GL_RGB5_A1/GL_RGB565，如果该RBO将作为depth attachment，
    // 那么internalformat必须为GL_DEPTH_COMPONENT16，如果该RBO将作为stencil attachment，那么internalformat必须为GL_STENCIL_INDEX8。
    // 否则，则会出现GL_INVALID_ENUM的错误。第三个和第四个参数width、height为RBO的尺寸，如果width或者height超过GL_MAX_RENDERBUFFER_S
    initBufferData(width: number, height: number, internalformat: number) {
        this.width = width
        this.height = height
        this.internalformat = internalformat
        // 不管是啥 都是用rgba 每个通道占一字节表示
        // 内存不是考虑的瓶颈
        if (internalformat === cpuRenderingContext.cachGameGl.RGBA4) {
            this.bufferData = new Uint32Array(width * height)
        } else if (internalformat === cpuRenderingContext.cachGameGl.RGB565) {
            this.bufferData = new Uint32Array(width * height)
        } else if (internalformat === cpuRenderingContext.cachGameGl.RGB5_A1) {
            this.bufferData = new Uint32Array(width * height)
        } else if (internalformat === cpuRenderingContext.cachGameGl.DEPTH_COMPONENT16) {
            // 没有16位的浮点数 就用32位的表示吧
            this.bufferData = new Float32Array(width * height)
        } else if (internalformat === cpuRenderingContext.cachGameGl.STENCIL_INDEX8) {
            this.bufferData = new Uint8Array(width * height)
        } else if (internalformat === cpuRenderingContext.cachGameGl.DEPTH_STENCIL) {
            console.error("不识别DEPTH_STENCIL")
            debugger
        } else {
            console.error("无法识别的 internalformat")
            debugger
        }
    }

    bufferData: Uint8Array | Uint8ClampedArray | Float32Array | Uint32Array = null!
    internalformat: GLenum = null!
    width: GLsizei = null!
    height: GLsizei = null!
}
/**frameBuffer相关 */
