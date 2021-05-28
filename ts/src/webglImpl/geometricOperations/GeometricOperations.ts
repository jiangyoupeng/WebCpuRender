import { Vec3Data } from "../shader/builtin/BuiltinData"

export class BarycentricPreData {
    c1XFactor: number = null!
    c1YFactor: number = null!
    c1AddFactor: number = null!
    c1DivFactor: number = null!
    c2XFactor: number = null!
    c2YFactor: number = null!
    c2AddFactor: number = null!
    c2DivFactor: number = null!
    c3XFactor: number = null!
    c3YFactor: number = null!
    c3AddFactor: number = null!
    c3DivFactor: number = null!
}

export class GeometricOperations {
    static preComputeBarycentric2DFactor(v0X: number, v1X: number, v2X: number, v0Y: number, v1Y: number, v2Y: number) {
        let preData = new BarycentricPreData()
        preData.c1XFactor = v1Y - v2Y
        preData.c1YFactor = v2X - v1X
        preData.c1AddFactor = v1X * v2Y - v2X * v1Y
        preData.c1DivFactor = v0X * (v1Y - v2Y) + (v2X - v1X) * v0Y + v1X * v2Y - v2X * v1Y

        preData.c2XFactor = v2Y - v0Y
        preData.c2YFactor = v0X - v2X
        preData.c2AddFactor = v2X * v0Y - v0X * v2Y
        preData.c2DivFactor = v1X * (v2Y - v0Y) + (v0X - v2X) * v1Y + v2X * v0Y - v0X * v2Y

        preData.c3XFactor = v0Y - v1Y
        preData.c3YFactor = v1X - v0X
        preData.c3AddFactor = v0X * v1Y - v1X * v0Y
        preData.c3DivFactor = v2X * (v0Y - v1Y) + (v1X - v0X) * v2Y + v0X * v1Y - v1X * v0Y

        return preData
    }

    static computeBarycentric2DByPre(x: number, y: number, preData: BarycentricPreData) {
        let c1 = (x * preData.c1XFactor + preData.c1YFactor * y + preData.c1AddFactor) / preData.c1DivFactor
        let c2 = (x * preData.c2XFactor + preData.c2YFactor * y + preData.c2AddFactor) / preData.c2DivFactor
        let c3 = (x * preData.c3XFactor + preData.c3YFactor * y + preData.c3AddFactor) / preData.c3DivFactor
        return [c1, c2, c3]
    }

    /**
     * 重心坐标
     */
    static computeBarycentric2D(
        x: number,
        y: number,
        v0X: number,
        v1X: number,
        v2X: number,
        v0Y: number,
        v1Y: number,
        v2Y: number
    ): number[] {
        let c1 =
            (x * (v1Y - v2Y) + (v2X - v1X) * y + v1X * v2Y - v2X * v1Y) / (v0X * (v1Y - v2Y) + (v2X - v1X) * v0Y + v1X * v2Y - v2X * v1Y)
        let c2 =
            (x * (v2Y - v0Y) + (v0X - v2X) * y + v2X * v0Y - v0X * v2Y) / (v1X * (v2Y - v0Y) + (v0X - v2X) * v1Y + v2X * v0Y - v0X * v2Y)
        let c3 =
            (x * (v0Y - v1Y) + (v1X - v0X) * y + v0X * v1Y - v1X * v0Y) / (v2X * (v0Y - v1Y) + (v1X - v0X) * v2Y + v0X * v1Y - v1X * v0Y)
        return [c1, c2, c3]
    }

    /**
     * 判断是否在三角形内部
     */
    static insideTriangle(
        x: number,
        y: number,
        x0: number,
        x1: number,
        x2: number,
        y0: number,
        y1: number,
        y2: number,
        v3f0: Vec3Data,
        v3f1: Vec3Data,
        v3f2: Vec3Data
    ): boolean {
        let judgeZ: number
        // 通过叉乘判断是否同方向

        let vecTest = new Vec3Data(x - x0, y - y0, 0)
        let crossValue = vecTest.cross(v3f0)
        judgeZ = crossValue.z

        vecTest = new Vec3Data(x - x1, y - y1, 0)
        crossValue = vecTest.cross(v3f1)
        if (crossValue.z * judgeZ < 0) {
            return false
        }
        vecTest = new Vec3Data(x - x2, y - y2, 0)
        crossValue = vecTest.cross(v3f2)
        if (crossValue.z * judgeZ < 0) {
            return false
        }
        return true
    }
}
