/*
origin glsl source: 
#define CC_DEVICE_SUPPORT_FLOAT_TEXTURE 0
#define CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS 4096
#define CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS 1024
#define CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS 0
#define CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS 0

precision highp float;
attribute vec3 a_position;
vec4 vert () {
vec4 pos = vec4(a_position, 1);
return pos;
}
void main() { gl_Position = vert(); }
*/
import { vec4_V3_N, float, float_N, bool, bool_N, int_N, int, vec4, vec3, vec2, mat3, mat4 } from "../builtin/BuiltinFunc"
import { glSet_V4_V4, getValueKeyByIndex } from "../builtin/BuiltinOperator"
import { gl_FragData, gl_FragColor, gl_Position, gl_FragCoord, gl_FragDepth, gl_FrontFacing, custom_isDiscard } from "../builtin/BuiltinVar"
import { cpuRenderingContext } from "../../CpuRenderingContext"
import { AttributeData, FragShaderHandle, UniformData, VaryingData, VertShaderHandle, StructData } from "../../ShaderDefine"
import {
    IntData,
    FloatData,
    Vec2Data,
    Vec3Data,
    Vec4Data,
    Mat3Data,
    Mat4Data,
    BoolData,
    Sampler2D,
    SamplerCube,
} from "../builtin/BuiltinData"
let CC_DEVICE_SUPPORT_FLOAT_TEXTURE = new FloatData(0)
let CC_DEVICE_MAX_VERTEX_UNIFORM_VECTORS = new FloatData(4096)
let CC_DEVICE_MAX_FRAGMENT_UNIFORM_VECTORS = new FloatData(1024)
let CC_EFFECT_USED_VERTEX_UNIFORM_VECTORS = new FloatData(0)
let CC_EFFECT_USED_FRAGMENT_UNIFORM_VECTORS = new FloatData(0)
class AttributeDataImpl implements AttributeData {
    a_position: Vec3Data = null!
    dataKeys: Map<string, any> = new Map([["a_position", cpuRenderingContext.cachGameGl.FLOAT_VEC3]])
    dataSize: Map<string, number> = new Map([["a_position", 1]])
}
class VaryingDataImpl extends VaryingData {
    factoryCreate() {
        return new VaryingDataImpl()
    }
    dataKeys: Map<string, any> = new Map([])
    copy(varying: VaryingDataImpl) {}
}
class UniformDataImpl implements UniformData {
    dataKeys: Map<string, any> = new Map([])
    dataSize: Map<string, number> = new Map([])
}
export class Impl_3e6b0b09d164c16e771913780540e3ef extends VertShaderHandle {
    varyingData: VaryingDataImpl = new VaryingDataImpl()
    uniformData: UniformDataImpl = new UniformDataImpl()
    attributeData: AttributeDataImpl = new AttributeDataImpl()

    vert(): Vec4Data {
        let pos: Vec4Data = vec4()
        glSet_V4_V4(pos, vec4_V3_N(this.attributeData.a_position, int_N(1)))
        return pos
    }
    main(): void {
        glSet_V4_V4(gl_Position, this.vert())
    }
}
