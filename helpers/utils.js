function flattenObject(obj, parentKey = "", result = {}) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = parentKey ? `${parentKey}_${key}` : key;
      const value = obj[key];

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        flattenObject(value, newKey, result);
      } else {
        result[newKey] = value;
      }
    }
  }
  return result;
}

async function flattenArrayOfObject(arr) {
  const result = [];
  for (const obj of arr) {
    result.push(flattenObject(obj));
  }
  return result;
}

module.exports = { flattenObject, flattenArrayOfObject };
