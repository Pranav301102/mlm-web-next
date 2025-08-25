export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || 5;
    
    const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY;
    const PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;

    if (!BEEHIIV_API_KEY || !PUBLICATION_ID) {
      console.error('Missing environment variables', {
        beehiivApiKey: !!BEEHIIV_API_KEY,
        publicationId: !!PUBLICATION_ID
      });
      return Response.json({ 
        message: "Configuration error",
        posts: []
      }, { status: 500 });
    }

    const url = `https://api.beehiiv.com/v2/publications/${PUBLICATION_ID}/posts?limit=${limit}&status=confirmed`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${BEEHIIV_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      const data = await response.json();
      // Transform data for frontend
      const posts = data.data?.map(post => ({
        id: post.id,
        title: post.title,
        subtitle: post.subtitle || post.content_preview,
        content: post.content_preview,
        published_at: post.publish_date,
        web_url: post.web_url
      })) || [];
      
      return Response.json({ posts });
    } else {
      console.warn("Beehiiv posts API error", { 
        status: response.status, 
        statusText: response.statusText 
      });
      return Response.json({ 
        message: "Failed to fetch posts",
        posts: []
      }, { status: response.status });
    }
  } catch (err) {
    console.error("Beehiiv posts fetch error", { error: err.message });
    return Response.json({ 
      message: "Internal server error",
      posts: []
    }, { status: 500 });
  }
}
