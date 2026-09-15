const instagramService = require('../services/InstagramService');

class InstagramController {
  async getFeed(req, res) {
    try {
      const mediaUrls = await instagramService.getLatestMedia();
      return res.json({
        success: true,
        data: mediaUrls
      });
    } catch (error) {
      console.error('[InstagramController] Erro:', error);
      return res.status(500).json({ error: 'Falha ao buscar o feed do Instagram.' });
    }
  }
}

module.exports = new InstagramController();
