export const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };
  
  export const calculateAverage = (array) => {
    if (array.length === 0) return 0;
    return array.reduce((a, b) => a + b, 0) / array.length;
  };
  
  export const extractJSON = (text) => {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  };
  
  export const extractJSONArray = (text) => {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  };