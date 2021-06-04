import template from "lodash/template"
import { cpuRenderingContext } from "./webglImpl/CpuRenderingContext"
let win: any = window
if (win.cpuRenderCanvas) {
    cpuRenderingContext.customContextInit(<HTMLCanvasElement>document.getElementById(win.cpuRenderCanvas))
} else {
    console.error("没有cpuRender 的canvas")
}
