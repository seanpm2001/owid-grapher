import { CoreColumn, OwidVariableRow } from "@ourworldindata/core-table"
import { ChartSeries } from "../chart/ChartInterface"
import { SeriesName } from "../core/GrapherConstants"

export type StackedPointPositionType = string | number

// PositionType can be categorical (e.g. country names), or ordinal (e.g. years).
export interface StackedPoint<PositionType extends StackedPointPositionType> {
    position: PositionType
    value: number
    valueOffset: number
    time: number
    fake?: boolean
}

export interface StackedSeries<PositionType extends StackedPointPositionType>
    extends ChartSeries {
    yColumn: CoreColumn
    points: StackedPoint<PositionType>[]
    columnSlug?: string
    isProjection?: boolean
}

export interface StackedRawSeries<
    PositionType extends StackedPointPositionType
> {
    yColumn: CoreColumn
    seriesName: SeriesName
    isProjection?: boolean
    rows: OwidVariableRow<PositionType>[]
}
