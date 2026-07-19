require('dotenv').config({ path: 'c:/Users/ADITYA/Desktop/BKS/ecommmerce_mern/server/.env' });
const { Blog } = require('c:/Users/ADITYA/Desktop/BKS/ecommmerce_mern/server/models/index.js');
const sequelize = require('c:/Users/ADITYA/Desktop/BKS/ecommmerce_mern/server/config/database.js');

async function seedBlogs() {
  try {
    await sequelize.authenticate();
    
    const blogs = [
      {
        title: "The Sweet Tradition of Thekua: More Than Just a Snack",
        excerpt: "Discover the deep-rooted cultural significance of Thekua in Bihar, and why it is the heart of Chhath Puja.",
        content: "Thekua is not just a sweet; it is an emotion for anyone from Bihar. Made with simple ingredients like whole wheat flour, pure ghee, and jaggery or sugar, its preparation is considered sacred, especially during Chhath Puja. \n\nHistorically, Thekua has been the ultimate travel food. Before the era of fast food and packaged snacks, people traveling long distances by train would pack kilos of Thekua. Because it contains no water and is deep-fried in pure ghee, it can last for weeks without spoiling.\n\nAt BiharKaSwaad, we preserve this tradition by making our Thekua exactly how our grandmothers did—hand-mixed, pressed in wooden molds, and fried to golden perfection by our local women artisans. When you bite into our Thekua, you are not just tasting a biscuit; you are tasting centuries of Bihari heritage.",
        author: "Team BiharKaSwaad",
        category: "Heritage",
        imagePath: "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        published: true
      },
      {
        title: "Why Sattu is the Ultimate Superfood of India",
        excerpt: "High in protein, cooling in nature, and incredibly versatile—here is why you need to add Sattu to your daily diet.",
        content: "Long before protein shakes became a fitness trend, the hardworking farmers of Bihar relied on 'Sattu' for their daily strength. Made by dry-roasting Bengal gram (chana) in sand and grinding it into a fine powder, Sattu is a powerhouse of nutrition.\n\n### The Health Benefits\n1. **Natural Coolant**: A glass of chilled Sattu sharbat instantly cools the body, making it the perfect summer drink.\n2. **High Protein & Fiber**: It provides sustained energy and keeps you full for hours.\n3. **Low Glycemic Index**: Excellent for blood sugar regulation.\n\nWhether you drink it as a savory sharbat with cumin and black salt, stuff it into Parathas, or enjoy Litti Chokha, Sattu is incredibly versatile. We source our Sattu directly from rural Bihar, ensuring it is stone-ground and free from any adulteration.",
        author: "Team BiharKaSwaad",
        category: "Health & Wellness",
        imagePath: "https://images.unsplash.com/photo-1596649282361-1200155b91ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        published: true
      },
      {
        title: "The Art of Making Authentic Bihari Pickles",
        excerpt: "What makes Bihari pickles so uniquely flavorful? It’s all about the mustard oil and the sun.",
        content: "A Bihari meal is incomplete without a dollop of pungent, spicy, and tangy pickle on the side. But what sets Bihari pickles apart from the rest of India?\n\nThe secret lies in two things: **Pure Kacchi Ghani Mustard Oil** and **Sunlight**.\n\nUnlike commercially mass-produced pickles that use vinegar and chemical preservatives, traditional Bihari pickles rely entirely on mustard oil as a natural preservative. The mangoes, garlic, or chilies are marinated in a blend of hand-pounded spices like fennel, nigella seeds (mangrail), and mustard powder, then submerged in pure mustard oil and left to mature under the hot sun in ceramic jars (martabans) for weeks.\n\nThis slow, sun-kissed maturation process develops a complex, deep flavor profile that cannot be rushed. Our pickles at BiharKaSwaad are made using this exact ancestral method, bringing that nostalgic taste of 'Nani ke haath ka achar' straight to your dining table.",
        author: "Team BiharKaSwaad",
        category: "Traditional Recipes",
        imagePath: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        published: true
      }
    ];

    await Blog.bulkCreate(blogs);
    console.log("3 Blogs inserted successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding blogs:", error);
    process.exit(1);
  }
}

seedBlogs();
