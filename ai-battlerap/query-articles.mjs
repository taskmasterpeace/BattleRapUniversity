import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

// Get count
const { count } = await supabase
  .from('news_articles')
  .select('*', { count: 'exact', head: true });

console.log(`Total articles: ${count}`);

// Get latest 5 articles
const { data: articles, error } = await supabase
  .from('news_articles')
  .select('id, title, type, slug, published_at, body_markdown, meta_json')
  .order('published_at', { ascending: false })
  .limit(5);

if (error) {
  console.error('Error:', error);
} else {
  console.log('\n=== LATEST ARTICLES ===\n');
  articles.forEach((article, i) => {
    console.log(`\n--- Article ${i + 1} ---`);
    console.log(`Title: ${article.title}`);
    console.log(`Type: ${article.type}`);
    console.log(`Slug: ${article.slug}`);
    console.log(`Published: ${article.published_at}`);
    console.log(`Blogger: ${article.meta_json?.blogger || 'Unknown'}`);
    console.log(`\nBody Preview (first 500 chars):`);
    console.log(article.body_markdown.substring(0, 500) + '...');
  });
}
