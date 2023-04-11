const jsonify = (almostJson) => {
  try {
    return JSON.parse(almostJson);
  } catch (e) {
    almostJson = almostJson.replace(/([a-zA-Z0-9_$]+\s*):/g, '"$1":').replace(/'([^']+?)'([\s,\]\}])/g, '"$1"$2');
    return JSON.parse(almostJson);
  }
};

const chars = {
  '[': ']',
  '{': '}'
};

const any = (iteree, iterator) => {
  let result;
  for (let i = 0; i < iteree.length; i++) {
    result = iterator(iteree[i], i, iteree);
    if (result) {
      break;
    }
  }
  return result;
};

const extract = (str) => {
  let startIndex = str.search(/[\{\[]/);
  if (startIndex === -1) {
    return null;
  }

  let openingChar = str[ startIndex ];
  let closingChar = chars[ openingChar ];
  let endIndex = -1;
  let count = 0;

  str = str.substring(startIndex);
  any(str, (letter, i) => {
    if (letter === openingChar) {
      count++;
    } else if (letter === closingChar) {
      count--;
    }

    if (!count) {
      endIndex = i;
      return true;
    }
  });

  if (endIndex === -1) {
    return null;
  }

  let obj = str.substring(0, endIndex + 1);
  return obj;
};

module.exports = (str) => {
  let result;
  const objects = [];
  while ((result = extract(str)) !== null) {
    try {
      let obj = jsonify(result);
      objects.push(obj);
    } catch (e) {
      // Do nothing
    }
    str = str.replace(result, '');
  }

  return objects;
};
