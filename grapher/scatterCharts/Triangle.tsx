import React from "react"
import { observer } from "mobx-react"

type TriangleProps = Readonly<{
    cx: number
    cy: number
    r: number
    fill?: string
    stroke?: string
    strokeWidth?: number
    transform?: string
}> &
    React.SVGProps<SVGPolygonElement>

export const Triangle = observer(
    class Triangle extends React.Component<TriangleProps> {
        render(): JSX.Element {
            const { cx, cy, r } = this.props
            const x = cx - r,
                y = cy - r
            const points = [
                [x, y + r * 2],
                [x + (r * 2) / 2, y],
                [x + r * 2, y + r * 2],
            ]

            return (
                <polygon
                    points={points
                        .map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`)
                        .join(" ")}
                    {...this.props}
                />
            )
        }
    }
)
