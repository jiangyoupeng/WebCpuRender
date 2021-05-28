import template from "lodash/template"
import { cpuRenderingContext } from "./webglImpl/CpuRenderingContext"

const outputElement = document.getElementById("output")
if (outputElement) {
    var compiled = template(
        `
    <h1><%- heading %></h1>
    Current date and time: <%- dateTimeString %>
  `.trim()
    )
    outputElement.innerHTML = compiled({
        heading: "ts-demo-webpack",
        dateTimeString: new Date().toISOString(),
    })
}
cpuRenderingContext.customContextInit(<HTMLCanvasElement>document.getElementById("GameCanvas"))
