import * as db from "../db/db.js"
import { Chart } from "../db/model/Chart.js"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"

interface BatchTagWithGptArgs {
    debug?: boolean
    limit?: number
}

export const batchTagWithGpt = async ({
    debug,
    limit,
}: BatchTagWithGptArgs = {}) => {
    await batchTagChartsWithGpt({ debug, limit })
}

const batchTagChartsWithGpt = async ({
    debug,
    limit,
}: BatchTagWithGptArgs = {}) => {
    // Get all charts that need tagging. These charts either have no tags, or
    // are tagged with neither a topic nor "Unlisted"
    const chartsToTag = await db.queryMysql(`
    SELECT 
        charts.id
    FROM charts
    LEFT JOIN chart_tags ON charts.id = chart_tags.chartId
    LEFT JOIN tags ON chart_tags.tagId = tags.id
    WHERE charts.id 
    NOT IN (
        SELECT chartId 
        FROM chart_tags 
        JOIN tags ON chart_tags.tagId = tags.id 
        WHERE tags.isTopic = 1 OR tags.name = 'Unlisted'
    )
    GROUP BY charts.id
    ${limit ? `LIMIT ${limit}` : ""}
    `)

    // Iterate through the charts and tag them with GPT-suggested topics
    for (const chart of chartsToTag) {
        const gptTopicSuggestions = await Chart.getGptTopicSuggestions(chart.id)

        for (const tag of gptTopicSuggestions) {
            if (debug) console.log("Tagging chart", chart.id, "with", tag.id)
            // Insert the suggested chart-tag association if it doesn't already
            // exist, giving priority to the existing tags. This is to make sure
            // already curated tags and their associated key chart levels and
            // validation statuses are preserved.
            await db.queryMysql(`
            INSERT IGNORE into chart_tags (chartId, tagId) VALUES (${chart.id},${tag.id})
        `)
        }
    }
}

if (require.main === module) {
    yargs(hideBin(process.argv))
        .command<BatchTagWithGptArgs>(
            "$0",
            "Batch tag charts with GPT topics",
            (yargs) => {
                yargs
                    .option("debug", {
                        alias: "d",
                        type: "boolean",
                        description: "Enable debug mode",
                        default: false,
                    })
                    .option("limit", {
                        alias: "l",
                        type: "number",
                        description: "Limit the number of items processed",
                    })
            },
            async (argv) => {
                try {
                    await batchTagChartsWithGpt(argv)
                } finally {
                    await db.closeTypeOrmAndKnexConnections()
                }
            }
        )
        .help()
        .alias("help", "h")
        .strict().argv
}
