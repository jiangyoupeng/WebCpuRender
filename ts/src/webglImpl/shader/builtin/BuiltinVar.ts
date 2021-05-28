import { BoolData, FloatData, Vec4Data } from "./BuiltinData"

/**自己定义非gl变量 */
export let custom_isDiscard: BoolData = new BoolData(false)

/*输出的颜色 */
export let gl_FragColor: Vec4Data = new Vec4Data()
/*输出的顶点位置 */
export let gl_Position: Vec4Data = new Vec4Data()

// todo
// 以下的内部变量并没有实现
export let gl_FragData: Vec4Data[] = [new Vec4Data(), new Vec4Data(), new Vec4Data(), new Vec4Data()]
export let gl_FragCoord: Vec4Data = new Vec4Data()
export let gl_FragDepth: FloatData = new FloatData()
export let gl_FrontFacing: BoolData = new BoolData()
