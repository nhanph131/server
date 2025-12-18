export const getHomeData = async (req, res) => {
  try {
    // Trong thực tế, bạn sẽ query DB. Ở đây tôi mock data để giống hình ảnh
    const curatedPlaylists = [
      { _id: 1, title: "Emerging Indie: Dreams", subtitle: "Scenes: Indie", image: "https://i.pravatar.cc/300?img=1" },
      { _id: 2, title: "New Techno Now", subtitle: "Main Room: Dance", image: "https://i.pravatar.cc/300?img=2" },
      { _id: 3, title: "New Plugg Music", subtitle: "Hustle: Rap & Hip-Hop", image: "https://i.pravatar.cc/300?img=3" },
      { _id: 4, title: "The Lookout", subtitle: "Hustle: Rap & Hip-Hop", image: "https://i.pravatar.cc/300?img=4" },
    ];

    const buzzingArtists = [
      { _id: 1, name: "Buzzing Mexico", tag: "New!", image: "https://i.pravatar.cc/300?img=5" },
      { _id: 2, name: "Buzzing Electronic", tag: "New!", image: "https://i.pravatar.cc/300?img=6" },
      { _id: 3, name: "Buzzing Hip Hop", tag: "New!", image: "https://i.pravatar.cc/300?img=7" },
      { _id: 4, name: "Buzzing Pop", tag: "New!", image: "https://i.pravatar.cc/300?img=8" },
    ];

    res.json({ curatedPlaylists, buzzingArtists });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};