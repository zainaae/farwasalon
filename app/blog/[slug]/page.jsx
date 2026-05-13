import { BLOG_POSTS } from '../../../src/blog-data.js'
import BlogArticleClient from './blog-article-client'

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
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: 'article', images: ['/logo.jpg'] },
  }
}

export default async function BlogArticlePage({ params }) {
  const { slug } = await params
  return <BlogArticleClient slug={slug} />
}
