import template from "lodash/template"
import { cpuRenderingContext } from "./webglImpl/CpuRenderingContext"
cpuRenderingContext.customContextInit(<HTMLCanvasElement>document.getElementById("viewCanvas"))
