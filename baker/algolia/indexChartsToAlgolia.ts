import * as db from "../../db/db.js"
import { getRelatedArticles } from "../../db/wpdb.js"
import { ALGOLIA_INDEXING } from "../../settings/serverSettings.js"
import { getAlgoliaClient } from "./configureAlgolia.js"
import { isPathRedirectedToExplorer } from "../../explorerAdminServer/ExplorerRedirects.js"
import { ChartRecord } from "../../site/search/searchTypes.js"
import { MarkdownTextWrap } from "@ourworldindata/utils"
import { Pageview } from "../../db/model/Pageview.js"

const getChartsRecords = async (): Promise<ChartRecord[]> => {
    const chartsToIndex = await db.queryMysql(`
    SELECT c.id,
        config ->> "$.slug"                   AS slug,
        config ->> "$.title"                  AS title,
        config ->> "$.variantName"            AS variantName,
        config ->> "$.subtitle"               AS subtitle,
        config ->> "$.data.availableEntities" AS availableEntities,
        JSON_LENGTH(config ->> "$.dimensions") AS numDimensions,
        c.publishedAt,
        c.updatedAt,
        JSON_ARRAYAGG(t.name) AS tags,
        JSON_ARRAYAGG(IF(ct.isKeyChart, t.name, NULL)) AS keyChartForTags -- this results in an array that contains null entries, will have to filter them out
    FROM charts c
        LEFT JOIN chart_tags ct ON c.id = ct.chartId
        LEFT JOIN tags t on ct.tagId = t.id
    WHERE config ->> "$.isPublished" = 'true'
        AND is_indexable IS TRUE
    GROUP BY c.id
    HAVING COUNT(t.id) >= 1
    `)

    for (const c of chartsToIndex) {
        c.availableEntities = JSON.parse(c.availableEntities)
        c.tags = JSON.parse(c.tags)
        c.keyChartForTags = JSON.parse(c.keyChartForTags).filter(
            (t: string | null) => t
        )
    }

    const pageviews = await Pageview.viewsByUrlObj()

    const records: ChartRecord[] = []
    for (const c of chartsToIndex) {
        // Our search currently cannot render explorers, so don't index them because
        // otherwise they will fail when rendered in the search results
        if (isPathRedirectedToExplorer(`/grapher/${c.slug}`)) continue

        const relatedArticles = (await getRelatedArticles(c.id)) ?? []

        const plaintextSubtitle = new MarkdownTextWrap({
            text: c.subtitle,
            fontSize: 10, // doesn't matter, but is a mandatory field
        }).plaintext

        records.push({
            objectID: c.id,
            chartId: c.id,
            slug: c.slug,
            title: c.title,
            variantName: c.variantName,
            subtitle: plaintextSubtitle,
            availableEntities: c.availableEntities,
            numDimensions: parseInt(c.numDimensions),
            publishedAt: c.publishedAt,
            updatedAt: c.updatedAt,
            tags: c.tags,
            keyChartForTags: c.keyChartForTags,
            titleLength: c.title.length,
            // Number of references to this chart in all our posts and pages
            numRelatedArticles: relatedArticles.length,
            views_7d: pageviews[`/grapher/${c.slug}`]?.views_7d ?? 0,
        })
    }

    return records
}

const indexChartsToAlgolia = async () => {
    if (!ALGOLIA_INDEXING) return

    const client = getAlgoliaClient()
    if (!client) {
        console.error(`Failed indexing charts (Algolia client not initialized)`)
        return
    }

    const index = client.initIndex("charts")

    await db.getConnection()
    const records = await getChartsRecords()
    await index.replaceAllObjects(records)

    await db.closeTypeOrmAndKnexConnections()
}

indexChartsToAlgolia()
