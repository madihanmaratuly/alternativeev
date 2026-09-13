/**
 * Хроносфера — Хранилище данных и настроек (LocalStorage)
 */

class ChronoStorage {
  constructor() {
    this.FAVORITES_KEY = "chronosphere_favorites_v1";
    this.HISTORY_KEY = "chronosphere_history_v1";
    this.ENGINE_KEY = "chronosphere_engine_mode";
  }

  getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(this.FAVORITES_KEY)) || [];
    } catch {
      return [];
    }
  }

  isFavorite(id) {
    const list = this.getFavorites();
    return list.some(item => item.id === id);
  }

  toggleFavorite(scenario) {
    let list = this.getFavorites();
    const index = list.findIndex(item => item.id === scenario.id || item.title === scenario.title);
    
    if (index >= 0) {
      list.splice(index, 1);
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(list));
      return false; // удалено
    } else {
      list.unshift(scenario);
      if (list.length > 30) list.pop();
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(list));
      return true; // добавлено
    }
  }

  getHistory() {
    try {
      return JSON.parse(localStorage.getItem(this.HISTORY_KEY)) || [];
    } catch {
      return [];
    }
  }

  addToHistory(query) {
    if (!query || !query.trim()) return;
    let list = this.getHistory();
    list = list.filter(q => q.toLowerCase() !== query.toLowerCase());
    list.unshift(query.trim());
    if (list.length > 15) list.pop();
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(list));
  }

  getEngineMode() {
    return localStorage.getItem(this.ENGINE_KEY) || "builtin"; // 'builtin' или 'gemini'
  }

  setEngineMode(mode) {
    localStorage.setItem(this.ENGINE_KEY, mode);
  }
}

window.chronoStorage = new ChronoStorage();
