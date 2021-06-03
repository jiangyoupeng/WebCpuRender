export enum InOutType {
    in,
    out,
    inout,
}

export class DeparseGlslGlobalVal {
    // 等待推入的声明对象
    waitPushDecVal: Map<string, string> = new Map()
    nowTypeCach: string = ""
    nowFuncTypeCach: string = ""
    nowBlockLevel: number = 0
    isFuncArgs = false
    inForDefine = false

    useBuiltinFuncs: Set<string> = new Set()
    useBuiltinOperators: Set<string> = new Set()

    // 当前声明的数组数量
    declArrNum: number[] = []
    // 是否处于左赋值语句中
    isLeftSet = false
    inFunc: boolean = false
    isFuncBlock: boolean = false
    uniformData: Map<string, string> = new Map()
    varyingData: Map<string, string> = new Map()
    attributeData: Map<string, string> = new Map()
    structDataMap: Map<string, Map<string, string>> = new Map()
    defines: Map<string, number | string> = null!

    customFuns: Map<string, string> = new Map()
    customFunsInOutType: Map<string, InOutType[]> = new Map()
    // 对应每一层块的变量 会往当前块往父节点块的变量查找 如果都找不到 那么会往类数据查找
    // funcObj会记录对象名和类型
    nowFucObj: Map<number, Map<string, string>> = new Map()

    // 用于函数参数in 的替代声明
    funcArgsInReplace: { name: string; type: string }[] = []

    forceInit(
        ud?: Map<string, string>,
        vd?: Map<string, string>,
        ad?: Map<string, string>,
        sdm?: Map<string, Map<string, string>>,
        d?: Map<string, number | string>
    ) {
        this.nowFuncTypeCach = ""
        this.waitPushDecVal = new Map()
        this.nowTypeCach = ""
        this.declArrNum = []
        this.isLeftSet = false
        this.inFunc = false
        this.isFuncArgs = false
        this.inForDefine = false
        this.uniformData = ud!
        this.varyingData = vd!
        this.attributeData = ad!
        this.structDataMap = sdm!
        this.defines = d!
        this.nowFucObj = new Map()
        this.useBuiltinFuncs = new Set()
        this.useBuiltinOperators = new Set()
        this.customFuns = new Map()
        this.customFunsInOutType = new Map()
    }
}
