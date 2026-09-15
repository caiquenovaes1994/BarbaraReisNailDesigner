// Mocks de imagens de unhas em alta qualidade para simular o feed
const MOCK_IMAGES = [
  'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1516975080661-4601831ab3d3?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1595868846358-1fc195155f4f?auto=format&fit=crop&q=80&w=1000'
];

class InstagramService {
  /**
   * Obtém as mídias (Mocks) para o plano de fundo do login
   * @returns {Promise<string[]>} Array de URLs de imagens
   */
  async getLatestMedia() {
    return MOCK_IMAGES;
  }
}

module.exports = new InstagramService();
