class DataGenerator {
  static storage = {};

  static generate(type, dataType, length) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString();
    
    if (dataType === 'number') {
      const num = timestamp + random;
      return length ? num.slice(0, length) : num;
    }
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Array.from({length: length || 5}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  static processValue(action) {
    if (!Array.isArray(action.type)) {
      return action.value;
    }

    const [actionType, generatorType, dataType, length] = action.type;
    
    if (actionType !== 'type' || !generatorType) {
      return action.value;
    }

    const generated = this.generate(generatorType, dataType, length);
    let finalValue;
    
    if (dataType === 'number') {
      finalValue = generated;
    } else {
      finalValue = generatorType === 'prefix' 
        ? generated + (action.value || '') 
        : (action.value || '') + generated;
    }

    const storageKey = action.selector || `generated_${Object.keys(this.storage).length}`;
    this.storage[storageKey] = finalValue;

    if (action.storeAs) {
      this.storage[action.storeAs] = finalValue;
    }

    return finalValue;
  }

  static getStored(key) {
    return this.storage[key] || '';
  }
}

module.exports = DataGenerator;
