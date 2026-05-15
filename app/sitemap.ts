import { MetadataRoute } from 'next'
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Logic to fetch all your SEO pages from your database/API
  // const allPages = await getMySeoPages(); 

  return [
    {
      url: 'https://klassical3pl.com',
      lastModified: new Date(),
    },
    // The sitemap will automatically include new pages 
    // if this code pulls from your dynamic data source.
  ]
}
