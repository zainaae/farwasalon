import { BLOG_POSTS } from '../../../src/blog-data.js'
import { buildBlogFaqSchema } from '../../../lib/blog-faq.js'
import { pageSocialMeta } from '../../../lib/page-metadata.js'
import BlogArticle from './blog-article'

export const dynamicParams = false

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const post = BLOG_POSTS.find((p) => p.slug === slug)
  if (!post) {
    return { title: 'Article Not Found' }
  }
  const title = `${post.title} | Farwa`
  return {
    title: { absolute: title },
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    ...pageSocialMeta({
      title,
      description: post.description,
      path: `/blog/${post.slug}`,
      image: post.featuredImage || '/logo.jpg',
      imageAlt: post.title,
      type: 'article',
    }),
  }
}

export default async function BlogArticlePage({ params }) {
  const { slug } = await params
  const post = BLOG_POSTS.find((p) => p.slug === slug)
  const faqSchema = post ? buildBlogFaqSchema(post) : null
  return (
    <>
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
      <BlogArticle slug={slug} />
    </>
  )
}
